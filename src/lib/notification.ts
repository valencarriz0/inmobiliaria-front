import type { AppNotification } from "../services/notificationService";
export function notificationDestination(notification: AppNotification) { if (notification.type === "new_consultation") return "/publisher/consultations"; if (notification.type === "new_property_match" && notification.propertyId) return `/detail/${notification.propertyId}`; return "/profile"; }
