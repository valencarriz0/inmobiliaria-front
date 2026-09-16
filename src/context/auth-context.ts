import { createContext } from "react";
import type { AuthUser, ChangePasswordInput, LoginInput, RegisterInput, RegisterResponse, UpdateProfileInput } from "../types/user";
import type { PublicPublisherApplicationInput, PublisherApplication } from "../types/publisher-application";

export type AuthDialog = "login" | "register" | "favorite" | "forgot-password" | "verification" | null;

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<AuthUser>;
  register: (data: RegisterInput) => Promise<RegisterResponse>;
  registerPublicPublisherApplication: (data: PublicPublisherApplicationInput) => Promise<{ application: PublisherApplication; message: string }>;
  verifyEmail: (token: string) => Promise<{ message: string }>;
  changePassword: (data: ChangePasswordInput) => Promise<{ message: string }>;
  logout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
  updateProfile: (data: UpdateProfileInput) => Promise<AuthUser>;
  favoriteIds: string[];
  favoritesLoading: boolean;
  favoritesError: string | null;
  pendingFavoriteIds: ReadonlySet<string>;
  ownedPropertyIds: ReadonlySet<string>;
  toggleFavorite: (propertyId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
  authDialog: AuthDialog;
  setAuthDialog: (dialog: AuthDialog) => void;
  openAuthDialog: (dialog: Exclude<AuthDialog, null>) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
