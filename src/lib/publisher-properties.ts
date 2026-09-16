import type { PublisherProperty } from "../types/publisher-property.ts";
import type { Consultation } from "../types/consultation.ts";

export interface PublisherFilters {
  query: string;
  status: "all" | "active" | "paused";
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-AR").trim();
}

export function filterPublisherProperties(properties: readonly PublisherProperty[], { query, status }: PublisherFilters) {
  const search = normalize(query);
  return properties.filter((property) => property.publicationStatus !== "deleted"
    && (status === "all" || property.publicationStatus === status)
    && normalize([property.title, property.location.city, property.location.province, property.location.street, property.location.number].filter(Boolean).join(" ")).includes(search),
  );
}

export function propertyMetrics(id: string, views: Readonly<Record<string, number>>, consultations: readonly Pick<Consultation, "propertyId">[]) {
  return { views: views[id] ?? 0, consultations: consultations.filter((consultation) => consultation.propertyId === id).length };
}

export function publisherStatistics(properties: readonly PublisherProperty[], views: Readonly<Record<string, number>>, consultations: readonly Pick<Consultation, "propertyId">[]) {
  const ranking = properties.filter((property) => property.publicationStatus !== "deleted")
    .map((property) => ({ property, ...propertyMetrics(property.id, views, consultations) }))
    .sort((a, b) => b.views - a.views);
  return {
    active: ranking.filter(({ property }) => property.publicationStatus === "active").length,
    totalViews: ranking.reduce((total, row) => total + row.views, 0),
    totalConsultations: ranking.reduce((total, row) => total + row.consultations, 0),
    mostViewed: ranking[0]?.views > 0 ? ranking[0].property : undefined,
    ranking,
  };
}
