import { apiRequest } from "./api.ts";
import { getAuthToken } from "./authStorage.ts";
const options = () => ({ token: getAuthToken() });
export const favoriteService = {
  list: () => apiRequest<{ favorites: unknown[] }>("/users/me/favorites", options()),
  add: (propertyId: string) => apiRequest<void>(`/users/me/favorites/${propertyId}`, { ...options(), method: "PUT" }),
  remove: (propertyId: string) => apiRequest<void>(`/users/me/favorites/${propertyId}`, { ...options(), method: "DELETE" }),
};
