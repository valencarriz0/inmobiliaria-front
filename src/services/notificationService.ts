import { apiRequest } from "./api.ts";
import { getAuthToken } from "./authStorage.ts";
const options = () => ({ token: getAuthToken() });
export const notificationService = { list: () => apiRequest<{ notifications: unknown[]; unreadCount: number }>("/notifications", options()), read: (id: string) => apiRequest<void>(`/notifications/${id}/read`, { ...options(), method: "PATCH" }), readAll: () => apiRequest<void>("/notifications/read-all", { ...options(), method: "PATCH" }) };
