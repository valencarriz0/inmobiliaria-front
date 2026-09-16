import { getAuthToken } from "./authStorage.ts";
import { apiRequest } from "./api.ts";
import type { SearchAlert, SearchAlertInput } from "../types/search-alert.ts";
const options = () => ({ token: getAuthToken() });
export const searchAlertService = {
  list: () => apiRequest<{ alerts: SearchAlert[] }>("/users/me/search-alerts", options()),
  create: (input: SearchAlertInput) => apiRequest<{ alert: SearchAlert }>("/users/me/search-alerts", { ...options(), method: "POST", body: input }),
  update: (id: string, input: SearchAlertInput) => apiRequest<{ alert: SearchAlert }>(`/users/me/search-alerts/${id}`, { ...options(), method: "PATCH", body: input }),
  activate: (id: string) => apiRequest<{ alert: SearchAlert }>(`/users/me/search-alerts/${id}/activate`, { ...options(), method: "PATCH" }),
  deactivate: (id: string) => apiRequest<{ alert: SearchAlert }>(`/users/me/search-alerts/${id}/deactivate`, { ...options(), method: "PATCH" }),
};
