import { apiRequest } from "./api.ts";
import { getAuthToken } from "./authStorage.ts";

export interface FavoritePropertyDto {
  id: string | null;
  title: string | null;
  operationType: string | null;
  price: number | null;
  currency: string | null;
  images: string[];
  city: { id: string; name: string } | null;
  province: { id: string; name: string } | null;
}

interface FavoriteListResponse {
  favorites: FavoritePropertyDto[];
}

const options = () => ({ token: getAuthToken() });

export const favoriteService = {
  list: () => apiRequest<FavoriteListResponse>("/users/me/favorites", options()),
  add: (propertyId: string) => apiRequest<void>(`/users/me/favorites/${propertyId}`, { ...options(), method: "PUT" }),
  remove: (propertyId: string) => apiRequest<void>(`/users/me/favorites/${propertyId}`, { ...options(), method: "DELETE" }),
};
