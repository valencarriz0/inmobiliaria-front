import type { AuthUser } from "../types/user.ts";
import { canUseInterestedFeatures } from "./user-properties.ts";

export function favoriteIdsFromResponse(favorites: readonly { id: string | null }[]) {
  return Array.from(new Set(favorites.flatMap((favorite) => typeof favorite.id === "string" ? [favorite.id] : [])));
}

export function canShowFavorite(user: AuthUser | null, propertyId: string, ownedPropertyIds: ReadonlySet<string>) {
  if (user?.role === "admin") return false;
  return user?.role !== "publisher" || !ownedPropertyIds.has(propertyId);
}

export function canManageFavorites(user: AuthUser | null) {
  return canUseInterestedFeatures(user);
}
