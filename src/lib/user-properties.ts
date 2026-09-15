import type { Property } from "../types/property.ts";
import type { AuthUser } from "../types/user.ts";
import { MOCK_CURRENT_PUBLISHER_ID } from "../data/mock/session.ts";

export function canUseInterestedFeatures(user: AuthUser | null) {
  return user?.role === "interested" || user?.role === "publisher";
}

export function isOwnProperty(user: AuthUser | null, property: Pick<Property, "publisherId">) {
  return user?.role === "publisher" && property.publisherId === MOCK_CURRENT_PUBLISHER_ID;
}

export function canFavoriteProperty(user: AuthUser | null, property: Pick<Property, "publisherId">) {
  return canUseInterestedFeatures(user) && !isOwnProperty(user, property);
}
