import { apiRequest } from "./api.ts";
import { getAuthToken } from "./authStorage.ts";
import { mapConsultation, mapCreatedConsultation } from "../lib/consultation.ts";
import type { Consultation, ConsultationDto, CreatedConsultation, CreatedConsultationDto } from "../types/consultation.ts";
export type ConsultationInput = { firstName: string; lastName: string; email: string; phone: string; message?: string };
const options = () => ({ token: getAuthToken() });

interface CreateConsultationResponse { consultation: CreatedConsultationDto; }
interface ConsultationListResponse { consultations: ConsultationDto[]; }

export const consultationService = {
  async create(id: string, body: ConsultationInput): Promise<CreatedConsultation> {
    const response = await apiRequest<CreateConsultationResponse>(`/properties/${encodeURIComponent(id)}/consultations`, { method: "POST", token: getAuthToken(), body });
    return mapCreatedConsultation(response.consultation);
  },
  async mine(signal?: AbortSignal): Promise<Consultation[]> {
    const response = await apiRequest<ConsultationListResponse>("/users/me/consultations", { ...options(), signal });
    return response.consultations.map(mapConsultation);
  },
  async publisher(propertyId?: string, signal?: AbortSignal): Promise<Consultation[]> {
    const query = propertyId ? `?propertyId=${encodeURIComponent(propertyId)}` : "";
    const response = await apiRequest<ConsultationListResponse>(`/publisher/consultations${query}`, { ...options(), signal });
    return response.consultations.map(mapConsultation);
  },
};
