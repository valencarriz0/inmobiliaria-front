import { test } from "node:test";
import assert from "node:assert/strict";
import { recentPropertyIds, readRecentProperties, rememberProperty, RECENT_PROPERTIES_KEY } from "../src/lib/recent-properties.ts";
import { filterPublisherProperties, propertyMetrics, publisherStatistics } from "../src/lib/publisher-properties.ts";
import { mockProperties } from "../src/data/mock/properties.ts";
import { mockConsultations, mockPropertyViews, mockPublisherNotifications } from "../src/data/mock/activity.ts";

test("vistas recientes conserva seis IDs únicos y antepone la última visita", () => {
  const before = ["1", "2", "3", "4", "5", "6"];
  assert.deepEqual(recentPropertyIds(["3", ...before]), ["3", "1", "2", "4", "5", "6"]);
  assert.deepEqual(recentPropertyIds(["7", ...before]), ["7", "1", "2", "3", "4", "5"]);
  assert.deepEqual(before, ["1", "2", "3", "4", "5", "6"]);
});

test("vistas recientes descarta datos de almacenamiento inválidos", () => {
  for (const value of [null, undefined, {}, "1", 12]) assert.deepEqual(recentPropertyIds(value), []);
  assert.deepEqual(recentPropertyIds(["1", null, "", "   ", 2, {}, "1", "3"]), ["1", "3"]);
});

test("vistas recientes sobrevive a lecturas repetidas y tolera almacenamiento corrupto o bloqueado", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  let stored: string | null = null;
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: {
    getItem: () => stored,
    setItem: (key: string, value: string) => { assert.equal(key, RECENT_PROPERTIES_KEY); stored = value; },
  } });
  try {
    assert.deepEqual(readRecentProperties(), []);
    rememberProperty("1");
    rememberProperty("2");
    rememberProperty("1");
    assert.deepEqual(readRecentProperties(), ["1", "2"]);
    assert.deepEqual(readRecentProperties(), ["1", "2"]);
    stored = "{invalido";
    assert.deepEqual(readRecentProperties(), []);
    rememberProperty("3");
    assert.deepEqual(readRecentProperties(), ["3"]);
    Object.defineProperty(globalThis, "sessionStorage", { configurable: true, get() { throw new Error("Bloqueado"); } });
    assert.deepEqual(readRecentProperties(), []);
    assert.doesNotThrow(() => rememberProperty("1"));
  } finally {
    if (original) Object.defineProperty(globalThis, "sessionStorage", original);
    else Reflect.deleteProperty(globalThis, "sessionStorage");
  }
});

const owned = mockProperties.filter((property) => property.publisherId === 1);

test("búsqueda del publicador combina texto y estado sin exigir filtros", () => {
  assert.equal(filterPublisherProperties(owned, { query: "   ", status: "all" }).length, owned.length);
  assert.deepEqual(filterPublisherProperties(owned, { query: "  CORDOBA  ", status: "active" }).map(({ id }) => id), ["1"]);
  assert.deepEqual(filterPublisherProperties(owned, { query: "la plata", status: "active" }).map(({ id }) => id), ["6"]);
  assert.deepEqual(filterPublisherProperties(owned, { query: "moderno", status: "paused" }).map(({ id }) => id), ["2"]);
  assert.deepEqual(filterPublisherProperties(owned, { query: "moderno", status: "active" }), []);
  assert.deepEqual(filterPublisherProperties(owned, { query: "inexistente", status: "all" }), []);
});

test("búsqueda admite calle y altura y excluye eliminadas", () => {
  const property = { ...owned[0], location: { ...owned[0].location, street: "Av. Colón", number: "123" } };
  assert.equal(filterPublisherProperties([property], { query: "colon 123", status: "all" }).length, 1);
  assert.deepEqual(filterPublisherProperties([{ ...property, publicationStatus: "deleted" }], { query: "", status: "all" }), []);
});

test("las métricas coinciden con las consultas de ejemplo y usan cero para una nueva publicación", () => {
  assert.deepEqual(propertyMetrics("1", mockPropertyViews, mockConsultations), { views: 120, consultations: 2 });
  assert.deepEqual(propertyMetrics("nueva", mockPropertyViews, mockConsultations), { views: 0, consultations: 0 });
});

test("estadísticas suma publicaciones propias, ordena por visitas y no modifica las entradas", () => {
  const original = structuredClone(owned);
  const statistics = publisherStatistics(owned, mockPropertyViews, mockConsultations);
  assert.equal(statistics.active, 3);
  assert.equal(statistics.totalViews, 349);
  assert.equal(statistics.totalConsultations, 3);
  assert.equal(statistics.mostViewed?.id, "1");
  assert.deepEqual(statistics.ranking.map(({ property }) => property.id), ["1", "2", "3", "6", "5"]);
  assert.deepEqual(owned, original);
  const afterDelete = publisherStatistics(owned.map((property) => property.id === "1" ? { ...property, publicationStatus: "deleted" } : property), mockPropertyViews, mockConsultations);
  assert.equal(afterDelete.active, 2);
  assert.equal(afterDelete.totalViews, 229);
  assert.equal(afterDelete.totalConsultations, 1);
});

test("estadísticas sin publicaciones ni visitas no inventa una propiedad más vista", () => {
  const empty = publisherStatistics([], {}, []);
  assert.equal(empty.active, 0);
  assert.equal(empty.totalViews, 0);
  assert.equal(empty.totalConsultations, 0);
  assert.equal(empty.mostViewed, undefined);
  assert.deepEqual(empty.ranking, []);
  assert.equal(publisherStatistics(owned, {}, []).mostViewed, undefined);
});

test("los ejemplos relacionan consultas y notificaciones con las propiedades correctas", () => {
  for (const consultation of mockConsultations) {
    const property = mockProperties.find(({ id }) => id === consultation.propertyId);
    assert.ok(property);
    assert.equal(consultation.publisherId, property.publisherId);
    assert.equal(consultation.propertyTitle, property.title);
    assert.equal(consultation.propertyImage, property.images[0]);
    assert.ok(mockPublisherNotifications.some(({ id, to }) => id === consultation.id && to === "/publisher/consultations"));
  }
  assert.ok(mockConsultations.some(({ message }) => !message));
  assert.ok(mockConsultations.some(({ userEmail }) => !userEmail));
});

test("interesado y publicador comparten Favoritos; visitante y administrador no", async () => {
  const { canUseInterestedFeatures, canFavoriteProperty } = await import("../src/lib/user-properties.ts");
  const { MOCK_USERS } = await import("../src/data/mock/session.ts");
  assert.equal(canUseInterestedFeatures(MOCK_USERS.interested), true);
  assert.equal(canUseInterestedFeatures(MOCK_USERS.publisher), true);
  assert.equal(canUseInterestedFeatures(MOCK_USERS.admin), false);
  assert.equal(canUseInterestedFeatures(null), false);
  for (const property of mockProperties) {
    assert.equal(canFavoriteProperty(MOCK_USERS.interested, property), true);
    assert.equal(canFavoriteProperty(MOCK_USERS.admin, property), false);
    assert.equal(canFavoriteProperty(null, property), false);
  }
});

test("el visitante no acumula un estado de Favoritos y el contexto de permisos del corazón se mantiene estable", async () => {
  const { canFavoriteProperty } = await import("../src/lib/user-properties.ts");
  const { MOCK_USERS } = await import("../src/data/mock/session.ts");
  assert.equal(canFavoriteProperty(null, mockProperties[0]), false);
  assert.equal(canFavoriteProperty(MOCK_USERS.interested, mockProperties[0]), true);
  assert.equal(canFavoriteProperty(MOCK_USERS.publisher, mockProperties[0]), true);
});

test("el publicador puede guardar propiedades ajenas pero nunca propias, también al cambiar de rol", async () => {
  const { canFavoriteProperty, isOwnProperty } = await import("../src/lib/user-properties.ts");
  const { MOCK_USERS } = await import("../src/data/mock/session.ts");
  for (const property of mockProperties) {
    assert.equal(isOwnProperty(MOCK_USERS.publisher, property), property.publisherId === 1);
    assert.equal(canFavoriteProperty(MOCK_USERS.publisher, property), property.publisherId !== 1);
  }
  const previouslySaved = mockProperties.filter(({ id }) => id === "1" || id === "4");
  assert.equal(previouslySaved.filter((property) => canFavoriteProperty(MOCK_USERS.interested, property)).length, 2);
  assert.deepEqual(previouslySaved.filter((property) => canFavoriteProperty(MOCK_USERS.publisher, property)).map(({ id }) => id), ["4"]);
});
