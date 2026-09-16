import { apiRequest } from "./api.ts";
import { getAuthToken } from "./authStorage.ts";

export interface PublisherMetricsSummary {
  activeProperties: number;
  pausedProperties: number;
  totalViews: number;
  totalConsultations: number;
}

export interface PublisherPropertyMetric {
  propertyId: string;
  title: string;
  publicationStatus: "active" | "paused";
  views: number;
  consultations: number;
}

export interface PublisherMetrics {
  summary: PublisherMetricsSummary;
  mostViewed: { propertyId: string; title: string; views: number } | null;
  properties: PublisherPropertyMetric[];
}

export const getPublisherMetrics = () => apiRequest<PublisherMetrics>("/publisher/metrics", { token: getAuthToken() });
