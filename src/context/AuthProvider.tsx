import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthResponse, AuthUser, LoginInput, RegisterInput, UpdateProfileInput } from "../types/user";
import { ApiError } from "../services/api";
import * as authService from "../services/authService";
import { clearAuthToken, getAuthToken, setAuthToken } from "../services/authStorage";
import * as userService from "../services/userService";
import * as publisherApplicationService from "../services/publisherApplicationService";
import { favoriteService } from "../services/favoriteService";
import { publisherPropertyService } from "../services/publisherPropertyService";
import type { PublicPublisherApplicationInput } from "../types/publisher-application";
import { canUseInterestedFeatures } from "../lib/user-properties";
import { favoriteIdsFromResponse } from "../lib/favorites";
import { AuthContext, type AuthDialog } from "./auth-context";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteOwnerId, setFavoriteOwnerId] = useState<string | null>(null);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [pendingFavoriteIds, setPendingFavoriteIds] = useState<ReadonlySet<string>>(new Set());
  const [ownedPropertyIds, setOwnedPropertyIds] = useState<ReadonlySet<string>>(new Set());
  const [authDialog, setAuthDialog] = useState<AuthDialog>(null);

  const refreshUser = useCallback(async () => {
    if (!getAuthToken()) {
      setUser(null);
      return null;
    }
    try {
      const response = await authService.getMe();
      setUser(response.user);
      return response.user;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        clearAuthToken();
      }
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      await refreshUser();
      if (active) setIsLoading(false);
    };
    void restoreSession();
    return () => { active = false; };
  }, [refreshUser]);

  const establishSession = useCallback((response: Pick<AuthResponse, "user" | "token">) => {
    setAuthToken(response.token);
    setFavoriteIds([]);
    setFavoriteOwnerId(null);
    setOwnedPropertyIds(new Set());
    setUser(response.user);
    return response.user;
  }, []);

  const login = useCallback(async (data: LoginInput) => {
    const response = await authService.login(data);
    return establishSession(response);
  }, [establishSession]);

  const register = useCallback(async (data: RegisterInput) => {
    const response = await authService.register(data);
    return establishSession(response);
  }, [establishSession]);

  const registerPublicPublisherApplication = useCallback(async (data: PublicPublisherApplicationInput) => {
    const response = await publisherApplicationService.createPublicPublisherApplication(data);
    establishSession(response);
    return response.application;
  }, [establishSession]);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setFavoriteIds([]);
    setFavoriteOwnerId(null);
    setFavoritesError(null);
    setOwnedPropertyIds(new Set());
    setAuthDialog(null);
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileInput) => {
    const response = await userService.updateMe(data);
    setUser(response.user);
    return response.user;
  }, []);

  const refreshFavorites = useCallback(async () => {
    if (!user || !canUseInterestedFeatures(user)) {
      setFavoriteIds([]);
      setFavoriteOwnerId(null);
      setFavoritesError(null);
      return;
    }
    setFavoritesLoading(true);
    setFavoritesError(null);
    try {
      const { favorites } = await favoriteService.list();
      const ids = favoriteIdsFromResponse(favorites);
      setFavoriteIds(ids);
      setFavoriteOwnerId(user.id);
    } catch {
      setFavoriteIds([]);
      setFavoriteOwnerId(user.id);
      setFavoritesError("No se pudieron cargar tus favoritos.");
    } finally {
      setFavoritesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user || !canUseInterestedFeatures(user)) {
        setFavoriteIds([]);
        setFavoriteOwnerId(null);
        setFavoritesError(null);
        setOwnedPropertyIds(new Set());
        return;
      }
      await refreshFavorites();
      if (user.role !== "publisher") return;
      try {
        const { properties } = await publisherPropertyService.list();
        if (active) setOwnedPropertyIds(new Set(properties.map((property) => property.id)));
      } catch {
        if (active) setOwnedPropertyIds(new Set());
      }
    };
    void load();
    return () => { active = false; };
  }, [refreshFavorites, user]);

  const visibleFavoriteIds = useMemo(() => user && favoriteOwnerId === user.id ? favoriteIds : [], [favoriteIds, favoriteOwnerId, user]);
  const toggleFavorite = useCallback(async (propertyId: string) => {
    if (!user || !canUseInterestedFeatures(user) || pendingFavoriteIds.has(propertyId)) return;
    const wasFavorite = visibleFavoriteIds.includes(propertyId);
    setPendingFavoriteIds((previous) => new Set(previous).add(propertyId));
    setFavoriteIds((previous) => wasFavorite ? previous.filter((id) => id !== propertyId) : [...previous, propertyId]);
    try {
      if (wasFavorite) await favoriteService.remove(propertyId);
      else await favoriteService.add(propertyId);
    } catch (error) {
      setFavoriteIds((previous) => wasFavorite ? [...previous, propertyId] : previous.filter((id) => id !== propertyId));
      throw error;
    } finally {
      setPendingFavoriteIds((previous) => {
        const next = new Set(previous);
        next.delete(propertyId);
        return next;
      });
    }
  }, [pendingFavoriteIds, user, visibleFavoriteIds]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    registerPublicPublisherApplication,
    logout,
    refreshUser,
    updateProfile,
    favoriteIds: visibleFavoriteIds,
    favoritesLoading,
    favoritesError,
    pendingFavoriteIds,
    ownedPropertyIds,
    toggleFavorite,
    refreshFavorites,
    authDialog,
    setAuthDialog,
    openAuthDialog: (dialog: Exclude<AuthDialog, null>) => setAuthDialog(dialog),
  }), [authDialog, favoritesError, favoritesLoading, isLoading, login, logout, ownedPropertyIds, pendingFavoriteIds, refreshFavorites, refreshUser, register, registerPublicPublisherApplication, toggleFavorite, updateProfile, user, visibleFavoriteIds]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
