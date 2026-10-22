import type { AuthUser } from "../types/user.ts";

export function favoriteIdsFromResponse(favorites: readonly { id: string | null }[]) {
  return Array.from(new Set(favorites.flatMap((favorite) => typeof favorite.id === "string" ? [favorite.id] : [])));
}

export function canShowFavorite(user: AuthUser | null, propertyId: string, ownedPropertyIds: ReadonlySet<string>) {
  return user?.role !== "publisher" || !ownedPropertyIds.has(propertyId);
}

export function canManageFavorites(user: AuthUser | null) {
  return user?.role === "interested" || user?.role === "publisher" || user?.role === "admin";
}
