import { test } from "node:test";
import assert from "node:assert/strict";
import { recentPropertyIds, readRecentProperties, rememberProperty, RECENT_PROPERTIES_KEY } from "../src/lib/recent-properties.ts";
import { filterPublisherProperties, propertyMetrics, publisherStatistics } from "../src/lib/publisher-properties.ts";
import { mapPublisherProperty } from "../src/lib/publisher-property.ts";
import { mockProperties } from "../src/data/mock/properties.ts";
import { mockConsultations, mockPropertyViews, mockPublisherNotifications } from "../src/data/mock/activity.ts";
import type { AuthUser, UserRole } from "../src/types/user.ts";
import type { PublisherPropertyDto } from "../src/types/publisher-property.ts";

const UUIDS = [
  "550e8400-e29b-41d4-a716-446655440000",
  "550e8400-e29b-41d4-a716-446655440001",
  "550e8400-e29b-41d4-a716-446655440002",
  "550e8400-e29b-41d4-a716-446655440003",
  "550e8400-e29b-41d4-a716-446655440004",
  "550e8400-e29b-41d4-a716-446655440005",
  "550e8400-e29b-41d4-a716-446655440006",
];

function authenticatedUser(role: UserRole): AuthUser {
  return {
    id: `${role}-user`, firstName: "Ana", lastName: "Pérez", email: `${role}@example.com`, phone: null,
    role, accountStatus: "active", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

test("vistas recientes conserva seis IDs únicos y antepone la última visita", () => {
  const before = UUIDS.slice(0, 6);
  assert.deepEqual(recentPropertyIds([UUIDS[2], ...before]), [UUIDS[2], UUIDS[0], UUIDS[1], UUIDS[3], UUIDS[4], UUIDS[5]]);
  assert.deepEqual(recentPropertyIds([UUIDS[6], ...before]), [UUIDS[6], ...UUIDS.slice(0, 5)]);
  assert.deepEqual(before, UUIDS.slice(0, 6));
});

test("vistas recientes descarta datos de almacenamiento inválidos", () => {
  for (const value of [null, undefined, {}, "1", 12]) assert.deepEqual(recentPropertyIds(value), []);
  assert.deepEqual(recentPropertyIds(["1", "3", "", "abc", null, UUIDS[0], UUIDS[0]]), [UUIDS[0]]);
  assert.deepEqual(recentPropertyIds([...UUIDS, "1"]), UUIDS.slice(0, 6));
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
    rememberProperty(UUIDS[0]);
    rememberProperty(UUIDS[1]);
    rememberProperty(UUIDS[0]);
    assert.deepEqual(readRecentProperties(), [UUIDS[0], UUIDS[1]]);
    assert.deepEqual(readRecentProperties(), [UUIDS[0], UUIDS[1]]);
    stored = "{invalido";
    assert.deepEqual(readRecentProperties(), []);
    rememberProperty(UUIDS[2]);
    assert.deepEqual(readRecentProperties(), [UUIDS[2]]);
    Object.defineProperty(globalThis, "sessionStorage", { configurable: true, get() { throw new Error("Bloqueado"); } });
    assert.deepEqual(readRecentProperties(), []);
    assert.doesNotThrow(() => rememberProperty("1"));
  } finally {
    if (original) Object.defineProperty(globalThis, "sessionStorage", original);
    else Reflect.deleteProperty(globalThis, "sessionStorage");
  }
});

test("vistas recientes limpia IDs legacy del sessionStorage", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  let stored = JSON.stringify(["3", "4", UUIDS[0], "1"]);
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: {
    getItem: () => stored,
    setItem: (_key: string, value: string) => { stored = value; },
  } });
  try {
    assert.deepEqual(readRecentProperties(), [UUIDS[0]]);
    assert.equal(stored, JSON.stringify([UUIDS[0]]));
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

test("el mapper del publicador normaliza ciudad, provincia y calle", () => {
  const dto = {
    ...owned[0],
    city: { id: "city-1", name: "Villa María" },
    province: { id: "province-1", name: "Córdoba" },
    street: "Av. Colón",
    streetNumber: "123",
    country: "Argentina",
    updatedAt: owned[0].updatedAt,
  } as unknown as PublisherPropertyDto;
  const property = mapPublisherProperty(dto);
  assert.deepEqual(property.location, { city: "Villa María", province: "Córdoba", street: "Av. Colón", number: "123", country: "Argentina", cityId: "city-1", provinceId: "province-1" });
  assert.equal(filterPublisherProperties([property], { query: "villa maria", status: "all" }).length, 1);
  assert.equal(filterPublisherProperties([property], { query: "cordoba", status: "all" }).length, 1);
  assert.equal(filterPublisherProperties([property], { query: "colon", status: "all" }).length, 1);
});

test("el mapper del publicador tolera ciudad y provincia nulas", () => {
  const dto = {
    ...owned[0], city: null, province: null, street: null, streetNumber: null, updatedAt: owned[0].updatedAt,
  } as unknown as PublisherPropertyDto;
  const property = mapPublisherProperty(dto);
  assert.equal(property.location.city, "");
  assert.equal(property.location.province, "");
  assert.equal(property.location.street, "");
  assert.equal(property.location.number, "");
  assert.doesNotThrow(() => filterPublisherProperties([property], { query: "", status: "all" }));
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
  const interested = authenticatedUser("interested");
  const publisher = authenticatedUser("publisher");
  const admin = authenticatedUser("admin");
  assert.equal(canUseInterestedFeatures(interested), true);
  assert.equal(canUseInterestedFeatures(publisher), true);
  assert.equal(canUseInterestedFeatures(admin), false);
  assert.equal(canUseInterestedFeatures(null), false);
  for (const property of mockProperties) {
    assert.equal(canFavoriteProperty(interested, property), true);
    assert.equal(canFavoriteProperty(admin, property), false);
    assert.equal(canFavoriteProperty(null, property), false);
  }
});

test("el visitante no acumula un estado de Favoritos y el contexto de permisos del corazón se mantiene estable", async () => {
  const { canFavoriteProperty } = await import("../src/lib/user-properties.ts");
  const propertyFromAnotherPublisher = mockProperties.find(({ publisherId }) => publisherId !== 1);
  assert.ok(propertyFromAnotherPublisher);
  assert.equal(canFavoriteProperty(null, mockProperties[0]), false);
  assert.equal(canFavoriteProperty(authenticatedUser("interested"), mockProperties[0]), true);
  assert.equal(canFavoriteProperty(authenticatedUser("publisher"), propertyFromAnotherPublisher), true);
});

test("los datos mock sin UUID de publicador no se usan para inferir propiedad propia", async () => {
  const { canFavoriteProperty, isOwnProperty } = await import("../src/lib/user-properties.ts");
  const publisher = authenticatedUser("publisher");
  const interested = authenticatedUser("interested");
  for (const property of mockProperties) {
    assert.equal(isOwnProperty(publisher, property), false);
    assert.equal(canFavoriteProperty(publisher, property), true);
  }
  const previouslySaved = mockProperties.filter(({ id }) => id === "1" || id === "4");
  assert.equal(previouslySaved.filter((property) => canFavoriteProperty(interested, property)).length, 2);
  assert.deepEqual(previouslySaved.filter((property) => canFavoriteProperty(publisher, property)).map(({ id }) => id), ["1", "4"]);
});
