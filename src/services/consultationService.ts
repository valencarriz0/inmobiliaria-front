import { apiRequest } from "./api.ts";
import { getAuthToken } from "./authStorage.ts";
export type ConsultationInput = { firstName: string; lastName: string; email: string; phone: string; message?: string };
const options = () => ({ token: getAuthToken() });
export const consultationService = {
  create: (id: string, body: ConsultationInput) => apiRequest<void>(`/properties/${id}/consultations`, { method: "POST", token: getAuthToken(), body }),
  mine: () => apiRequest<{ consultations: unknown[] }>("/users/me/consultations", options()),
  publisher: () => apiRequest<{ consultations: unknown[] }>("/publisher/consultations", options()),
};
