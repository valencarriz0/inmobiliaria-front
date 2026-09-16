import type { AuthUser } from "../types/user.ts";

export function canUseInterestedFeatures(user: AuthUser | null) {
  return user?.role === "interested" || user?.role === "publisher";
}

export function isOwnProperty(user: AuthUser | null, property: { publisherId?: string | number }) {
  return user?.role === "publisher" && Boolean(property.publisherId) && String(property.publisherId) === user.id;
}

export function canFavoriteProperty(user: AuthUser | null, property: object) {
  return canUseInterestedFeatures(user) && !isOwnProperty(user, property);
}
