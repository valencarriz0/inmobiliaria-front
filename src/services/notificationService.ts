import { apiRequest } from "./api.ts";
import { getAuthToken } from "./authStorage.ts";
export type NotificationType = "new_consultation" | "publisher_approved" | "publisher_rejected" | "new_property_match";
export interface AppNotification { id: string; type: NotificationType; title: string; message: string | null; consultationId: string | null; publisherApplicationId: string | null; searchAlertId: string | null; propertyId: string | null; readAt: string | null; createdAt: string; }
export interface NotificationListResponse { notifications: AppNotification[]; unreadCount: number; }
const options = () => ({ token: getAuthToken() });
export const notificationService = { list: () => apiRequest<NotificationListResponse>("/notifications", options()), read: (id: string) => apiRequest<void>(`/notifications/${id}/read`, { ...options(), method: "PATCH" }), readAll: () => apiRequest<void>("/notifications/read-all", { ...options(), method: "PATCH" }) };
