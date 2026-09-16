import { mapPublicPropertyDetail } from "../lib/public-property.ts";
import type { PropertyViewHistoryItem, PropertyViewHistoryResponseDto, PublicPropertyPagination } from "../types/public-property.ts";
import { getAuthToken } from "./authStorage.ts";
import { apiRequest } from "./api.ts";

export interface PropertyViewHistoryResult {
  history: PropertyViewHistoryItem[];
  pagination: PublicPropertyPagination;
}

export async function getPropertyViewHistory(page = 1, limit = 12, signal?: AbortSignal): Promise<PropertyViewHistoryResult> {
  const response = await apiRequest<PropertyViewHistoryResponseDto>(`/users/me/views?page=${page}&limit=${limit}`, {
    token: getAuthToken(), signal,
  });
  return {
    history: response.history.map(({ property, lastViewedAt }) => ({ property: mapPublicPropertyDetail(property), lastViewedAt })),
    pagination: response.pagination,
  };
}
