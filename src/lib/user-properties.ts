import type { Property } from "../types/property.ts";
import type { UserProfile } from "../types/user.ts";
import { MOCK_CURRENT_PUBLISHER_ID } from "../data/mock/session.ts";

export function canUseInterestedFeatures(user: UserProfile | null) {
  return user?.role === "interested" || user?.role === "publisher";
}

export function isOwnProperty(user: UserProfile | null, property: Pick<Property, "publisherId">) {
  return user?.role === "publisher" && property.publisherId === MOCK_CURRENT_PUBLISHER_ID;
}

export function canFavoriteProperty(user: UserProfile | null, property: Pick<Property, "publisherId">) {
  return canUseInterestedFeatures(user) && !isOwnProperty(user, property);
}
