import { apiRequest } from "./api.ts";
import { getAuthToken } from "./authStorage.ts";
import type { AdminMetrics, AdminProperty, AdminPropertyUpdate, AdminUser, Pagination, PropertyHistoryEntry } from "../types/admin.ts";

const options = () => ({ token: getAuthToken() });
function query(values: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value) params.set(key, value); });
  return params.toString() ? `?${params}` : "";
}

export const adminService = {
  users: (filters: { q?: string; role?: string; status?: string; page?: string; limit?: string } = {}) => apiRequest<{ users: AdminUser[]; pagination: Pagination }>(`/admin/users${query(filters)}`, options()),
  updateUser: (id: string, body: { firstName?: string; lastName?: string; phone?: string | null }) => apiRequest<{ user: AdminUser }>(`/admin/users/${id}`, { ...options(), method: "PATCH", body }),
  disableUser: (id: string) => apiRequest<{ user: AdminUser }>(`/admin/users/${id}/disable`, { ...options(), method: "PATCH" }),
  reactivateUser: (id: string) => apiRequest<{ user: AdminUser }>(`/admin/users/${id}/reactivate`, { ...options(), method: "PATCH" }),
  properties: (filters: { status?: string; q?: string; operationType?: string; publisherId?: string; page?: string; limit?: string } = {}) => apiRequest<{ properties: AdminProperty[]; pagination: Pagination }>(`/admin/properties${query(filters)}`, options()),
  property: (id: string) => apiRequest<{ property: AdminProperty }>(`/admin/properties/${id}`, options()),
  updateProperty: (id: string, body: AdminPropertyUpdate) => apiRequest<{ property: AdminProperty }>(`/admin/properties/${id}`, { ...options(), method: "PATCH", body }),
  propertyHistory: (id: string) => apiRequest<{ history: PropertyHistoryEntry[] }>(`/admin/properties/${id}/history`, options()),
  pauseProperty: (id: string) => apiRequest<{ property: AdminProperty }>(`/admin/properties/${id}/pause`, { ...options(), method: "PATCH" }),
  reactivateProperty: (id: string) => apiRequest<{ property: AdminProperty }>(`/admin/properties/${id}/reactivate`, { ...options(), method: "PATCH" }),
  deleteProperty: (id: string) => apiRequest<{ property: AdminProperty }>(`/admin/properties/${id}`, { ...options(), method: "DELETE" }),
  metrics: () => apiRequest<AdminMetrics>("/admin/metrics", options()),
};
