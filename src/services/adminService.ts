import { apiRequest } from "./api.ts";
import { getAuthToken } from "./authStorage.ts";

const options = () => ({ token: getAuthToken() });
function query(values: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value) params.set(key, value); });
  return params.toString() ? `?${params}` : "";
}

export const adminService = {
  users: (filters: { query?: string; role?: string; status?: string } = {}) => apiRequest<{ users: unknown[] }>(`/admin/users${query(filters)}`, options()),
  updateUser: (id: string, body: { firstName?: string; lastName?: string; phone?: string | null }) => apiRequest<{ user: unknown }>(`/admin/users/${id}`, { ...options(), method: "PATCH", body }),
  disableUser: (id: string) => apiRequest<{ user: unknown }>(`/admin/users/${id}/disable`, { ...options(), method: "PATCH" }),
  reactivateUser: (id: string) => apiRequest<{ user: unknown }>(`/admin/users/${id}/reactivate`, { ...options(), method: "PATCH" }),
  properties: (filters: { status?: string; query?: string } = {}) => apiRequest<{ properties: unknown[] }>(`/admin/properties${query(filters)}`, options()),
  property: (id: string) => apiRequest<{ property: unknown }>(`/admin/properties/${id}`, options()),
  updateProperty: (id: string, body: unknown) => apiRequest<{ property: unknown }>(`/admin/properties/${id}`, { ...options(), method: "PATCH", body }),
  pauseProperty: (id: string) => apiRequest<{ property: unknown }>(`/admin/properties/${id}/pause`, { ...options(), method: "PATCH" }),
  reactivateProperty: (id: string) => apiRequest<{ property: unknown }>(`/admin/properties/${id}/reactivate`, { ...options(), method: "PATCH" }),
  deleteProperty: (id: string) => apiRequest<{ property: unknown }>(`/admin/properties/${id}`, { ...options(), method: "DELETE" }),
  propertyHistory: (id: string) => apiRequest<{ history: unknown[] }>(`/admin/properties/${id}/history`, options()),
  metrics: () => apiRequest<unknown>("/admin/metrics", options()),
};
