import { createContext, useContext } from "react";
import type { UserProfile } from "../types/user";
import type { Property } from "../types/property";

export type AuthDialog = "login" | "register" | "favorite" | null;

export const UserPreviewContext = createContext<{
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  favoriteIds: string[];
  toggleFavorite: (property: Pick<Property, "id" | "publisherId">) => void;
  authDialog: AuthDialog;
  setAuthDialog: (dialog: AuthDialog) => void;
  openAuthDialog: (dialog: Exclude<AuthDialog, null>) => void;
} | null>(null);

export function useUserPreview() {
  const context = useContext(UserPreviewContext);
  if (!context) throw new Error("La vista previa debe estar dentro de la aplicación.");
  return context;
}
