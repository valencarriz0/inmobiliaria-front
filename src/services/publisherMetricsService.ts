import { apiRequest } from "./api.ts";
import { getAuthToken } from "./authStorage.ts";

export interface PublisherMetricsSummary {
  activeProperties: number;
  pausedProperties: number;
  totalViews: number;
  totalConsultations: number;
  totalFavorites: number;
  previousPeriod: {
    views: number;
    consultations: number;
    favorites: number;
  };
}

export interface PublisherPropertyMetric {
  propertyId: string;
  title: string;
  publicationStatus: "active" | "paused";
  city: string | null;
  province: string | null;
  image: string | null;
  views: number;
  previousViews: number;
  consultations: number;
  previousConsultations: number;
  favorites: number;
  previousFavorites: number;
}

export interface PublisherActivityDay {
  date: string;
  views: number;
  consultations: number;
}

export interface PublisherMetrics {
  period: PublisherMetricsPeriod | null;
  summary: PublisherMetricsSummary;
  mostViewed: { propertyId: string; title: string; views: number } | null;
  properties: PublisherPropertyMetric[];
  activity: PublisherActivityDay[];
}

export type PublisherMetricsPeriod = 7 | 30 | 90;

export const getPublisherMetrics = (period?: PublisherMetricsPeriod) => {
  const query = period ? `?period=${period}` : "";
  return apiRequest<PublisherMetrics>(`/publisher/metrics${query}`, { token: getAuthToken() });
};
