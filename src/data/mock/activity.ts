import type { Consultation } from "../../types/consultation.ts";
import { mockProperties } from "./properties.ts";

// Las consultas y visitas son ejemplos fijos; no se generan al completar el formulario.
export const mockConsultations: Consultation[] = [
  {
    id: "consultation-1", propertyId: "1", createdAt: "2026-09-12T15:30:00-03:00",
    userEmail: "ana@example.com",
    contact: { firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: "+54 351 555-0100" },
    message: "Quisiera coordinar una visita para conocer la casa.",
  },
  {
    id: "consultation-2", propertyId: "3", createdAt: "2026-09-11T10:00:00-03:00",
    userEmail: "ana@example.com",
    contact: { firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: "+54 351 555-0100" },
  },
  {
    id: "consultation-3", propertyId: "1", createdAt: "2026-09-10T17:00:00-03:00",
    contact: { firstName: "Diego", lastName: "Ruiz", email: "diego@example.com", phone: "+54 351 555-0200" },
    message: "¿La propiedad tiene espacio para guardar un auto?",
  },
].flatMap((consultation) => {
  const property = mockProperties.find(({ id }) => id === consultation.propertyId);
  return property ? [{ ...consultation, publisherId: property.publisherId, propertyTitle: property.title, propertyImage: property.images[0] }] : [];
});

export const mockPropertyViews: Readonly<Record<string, number>> = { "1": 120, "2": 85, "3": 64, "4": 95, "5": 32, "6": 48 };

export const mockPublisherNotifications = [
  ...mockConsultations.map((consultation) => ({
    id: consultation.id, publisherId: consultation.publisherId, createdAt: consultation.createdAt,
    title: `Nueva consulta sobre ${consultation.propertyTitle}`, to: "/publisher/consultations",
  })),
  { id: "profile-approved", publisherId: 1, createdAt: "2026-09-09T09:00:00-03:00", title: "Tu perfil de publicador fue aprobado.", to: "/profile" },
  { id: "profile-rejected", publisherId: 1, createdAt: "2026-09-07T09:00:00-03:00", title: "Tu solicitud anterior para publicar fue rechazada.", to: "/profile" },
].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
