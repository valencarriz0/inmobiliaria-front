import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Property } from "../types/property";
import type { AuthUser, LoginInput, RegisterInput, UpdateProfileInput } from "../types/user";
import { ApiError } from "../services/api";
import * as authService from "../services/authService";
import { clearAuthToken, getAuthToken, setAuthToken } from "../services/authStorage";
import * as userService from "../services/userService";
import { canFavoriteProperty } from "../lib/user-properties";
import { AuthContext, type AuthDialog } from "./auth-context";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Record<string, string[]>>({});
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

  const login = useCallback(async (data: LoginInput) => {
    const response = await authService.login(data);
    setAuthToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (data: RegisterInput) => {
    const response = await authService.register(data);
    setAuthToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setAuthDialog(null);
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileInput) => {
    const response = await userService.updateMe(data);
    setUser(response.user);
    return response.user;
  }, []);

  const favoriteIds = useMemo(() => user ? favorites[user.id] ?? [] : [], [favorites, user]);
  const toggleFavorite = useCallback((property: Pick<Property, "id" | "publisherId">) => {
    if (!user || !canFavoriteProperty(user, property)) return;
    setFavorites((previous) => {
      const ids = previous[user.id] ?? [];
      const next = ids.includes(property.id) ? ids.filter((id) => id !== property.id) : [...ids, property.id];
      return { ...previous, [user.id]: next };
    });
  }, [user]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    favoriteIds,
    toggleFavorite,
    authDialog,
    setAuthDialog,
    openAuthDialog: (dialog: Exclude<AuthDialog, null>) => setAuthDialog(dialog),
  }), [authDialog, favoriteIds, isLoading, login, logout, refreshUser, register, toggleFavorite, updateProfile, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
