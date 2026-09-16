import { createContext } from "react";
import type { Property } from "../types/property";
import type { AuthUser, LoginInput, RegisterInput, UpdateProfileInput } from "../types/user";
import type { PublicPublisherApplicationInput, PublisherApplication } from "../types/publisher-application";

export type AuthDialog = "login" | "register" | "favorite" | null;

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<AuthUser>;
  register: (data: RegisterInput) => Promise<AuthUser>;
  registerPublicPublisherApplication: (data: PublicPublisherApplicationInput) => Promise<PublisherApplication>;
  logout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
  updateProfile: (data: UpdateProfileInput) => Promise<AuthUser>;
  favoriteIds: string[];
  toggleFavorite: (property: Pick<Property, "id" | "publisherId">) => void;
  authDialog: AuthDialog;
  setAuthDialog: (dialog: AuthDialog) => void;
  openAuthDialog: (dialog: Exclude<AuthDialog, null>) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
