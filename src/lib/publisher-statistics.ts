import type { PublisherPropertyMetric } from "../services/publisherMetricsService";

export type PropertyMetricSort = "views" | "consultations" | "favorites" | "rate";

export function consultationRate(consultations: number, views: number) {
  return views > 0 ? (consultations / views) * 100 : 0;
}

export function formatMetricRate(value: number) {
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 }).format(value);
}

export function compareCount(current: number, previous: number) {
  if (previous === 0) {
    return {
      direction: current > 0 ? "up" as const : "unavailable" as const,
      label: current > 0
        ? `+${new Intl.NumberFormat("es-AR").format(current)} respecto al período anterior`
        : "Sin período anterior comparable",
    };
  }

  const exactChange = ((current - previous) / previous) * 100;
  const change = Math.round(exactChange * 10) / 10;
  const direction = current > previous ? "up" as const : current < previous ? "down" as const : "stable" as const;
  const magnitude = change === 0 && direction !== "stable" ? "<0,1" : formatMetricRate(Math.abs(change));
  return {
    direction,
    label: `${direction === "up" ? "+" : direction === "down" ? "−" : ""}${direction === "stable" ? "0" : magnitude}% respecto al período anterior`,
  };
}

export function compareRate(current: number, previous: number, hasComparablePeriod: boolean) {
  if (!hasComparablePeriod) {
    return { direction: "unavailable" as const, label: "Sin período anterior comparable" };
  }

  const change = Math.round((current - previous) * 10) / 10;
  const formatted = formatMetricRate(Math.abs(change));
  return {
    direction: change > 0 ? "up" as const : change < 0 ? "down" as const : "stable" as const,
    label: `${change > 0 ? "+" : change < 0 ? "−" : ""}${formatted} p.p. respecto al período anterior`,
  };
}

export function sortPropertyMetrics(properties: PublisherPropertyMetric[], sort: PropertyMetricSort) {
  return [...properties].sort((first, second) => {
    const firstValue = sort === "rate"
      ? consultationRate(first.consultations, first.views)
      : first[sort];
    const secondValue = sort === "rate"
      ? consultationRate(second.consultations, second.views)
      : second[sort];
    return secondValue - firstValue || first.title.localeCompare(second.title, "es");
  });
}
