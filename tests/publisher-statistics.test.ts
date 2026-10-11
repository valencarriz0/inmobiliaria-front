import assert from "node:assert/strict";
import { test } from "node:test";
import {
  compareCount,
  compareRate,
  consultationRate,
  sortPropertyMetrics,
} from "../src/lib/publisher-statistics.ts";
import type { PublisherPropertyMetric } from "../src/services/publisherMetricsService.ts";

const property = (propertyId: string, title: string, views: number, consultations: number, favorites: number): PublisherPropertyMetric => ({
  propertyId,
  title,
  publicationStatus: "active",
  city: null,
  province: null,
  image: null,
  views,
  previousViews: 0,
  consultations,
  previousConsultations: 0,
  favorites,
  previousFavorites: 0,
});

test("tasa de consulta se basa en eventos y devuelve cero sin vistas", () => {
  assert.equal(consultationRate(3, 60), 5);
  assert.equal(consultationRate(3, 0), 0);
});

test("variaciones de conteos comparan períodos iguales sin porcentajes infinitos", () => {
  assert.deepEqual(compareCount(12, 10), { direction: "up", label: "+20% respecto al período anterior" });
  assert.deepEqual(compareCount(5, 10), { direction: "down", label: "−50% respecto al período anterior" });
  assert.deepEqual(compareCount(4, 4), { direction: "stable", label: "0% respecto al período anterior" });
  assert.deepEqual(compareCount(10_001, 10_000), { direction: "up", label: "+<0,1% respecto al período anterior" });
  assert.equal(compareCount(4, 0).label, "+4 respecto al período anterior");
  assert.equal(compareCount(0, 0).label, "Sin período anterior comparable");
});

test("la tasa se compara en puntos porcentuales y omite comparaciones sin vistas anteriores", () => {
  assert.deepEqual(compareRate(7, 5, true), { direction: "up", label: "+2 p.p. respecto al período anterior" });
  assert.deepEqual(compareRate(4.5, 5, true), { direction: "down", label: "−0,5 p.p. respecto al período anterior" });
  assert.equal(compareRate(0, 0, false).direction, "unavailable");
});

test("ordena publicaciones por cada métrica calculada y tasa de consulta", () => {
  const properties = [
    property("a", "Casa", 100, 2, 10),
    property("b", "Departamento", 50, 5, 4),
    property("c", "Local", 25, 0, 20),
  ];
  assert.deepEqual(sortPropertyMetrics(properties, "views").map(({ propertyId }) => propertyId), ["a", "b", "c"]);
  assert.deepEqual(sortPropertyMetrics(properties, "consultations").map(({ propertyId }) => propertyId), ["b", "a", "c"]);
  assert.deepEqual(sortPropertyMetrics(properties, "favorites").map(({ propertyId }) => propertyId), ["c", "a", "b"]);
  assert.deepEqual(sortPropertyMetrics(properties, "rate").map(({ propertyId }) => propertyId), ["b", "a", "c"]);
});
