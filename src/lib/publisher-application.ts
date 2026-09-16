import type { PublisherApplicationStatus } from "../types/publisher-application";

export const publisherApplicationStatusLabels: Record<PublisherApplicationStatus, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

export function canReapplyPublisherApplication(status: PublisherApplicationStatus) {
  return status === "rejected";
}
