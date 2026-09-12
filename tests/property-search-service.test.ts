import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { createPropertyService } from "../src/services/propertyService.ts";
import { createMockPropertyStore, type MockPropertyStore } from "../src/data/mock/property-store.ts";
import { createPropertyFormValues, toPropertyInput } from "../src/lib/property-form.ts";
import type { Property } from "../src/types/property.ts";
import type { PropertySearchFilters } from "../src/types/property-search.ts";

function fixture(id: string, overrides: Partial<Property> = {}): Property {
  return {
    id, title: id, description: "Propiedad para verificar la búsqueda", operationType: "sale", propertyType: "house",
    price: 100000, currency: "USD", location: { country: "Argentina", province: "Córdoba", city: "Córdoba" },
    totalArea: 120, rooms: 3, services: [], amenities: [],
    images: ["https://example.com/front.jpg", "https://example.com/back.jpg"],
    publisherId: 1, publicationStatus: "active", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const laPlata = { country: "Argentina", province: "Buenos Aires", city: "La Plata" };
const rosario = { country: "Argentina", province: "Santa Fe", city: "Rosario" };
const fixtures = [
  fixture("usd-low"),
  fixture("usd-high", { price: 200000, location: { country: "Argentina", province: "Córdoba", city: "Villa Carlos Paz" } }),
  fixture("usd-middle", { price: 150000, propertyType: "apartment", location: laPlata }),
  fixture("ars-match", { currency: "ARS" }),
  fixture("ars-high", { price: 200000, currency: "ARS", operationType: "rent", propertyType: "apartment", location: laPlata }),
  fixture("temporary", { price: 150000, operationType: "temporary_rent" }),
  fixture("usd-rent", { price: 50000, operationType: "rent", propertyType: "apartment", location: rosario }),
  fixture("ars-low", { price: 50000, currency: "ARS", operationType: "rent", propertyType: "apartment", location: rosario }),
  fixture("paused", { publicationStatus: "paused" }),
  fixture("deleted", { publicationStatus: "deleted" }),
];
let store: MockPropertyStore;
let service: ReturnType<typeof createPropertyService>;
beforeEach(() => {
  store = createMockPropertyStore(fixtures);
  service = createPropertyService(store);
});
afterEach(() => store.dispose());

const cases: { name: string; filters?: PropertySearchFilters; ids: string[] }[] = [
  { name: "sin filtros devuelve todas las públicas activas", ids: ["usd-low", "usd-high", "usd-middle", "ars-match", "ars-high", "temporary", "usd-rent", "ars-low"] },
  { name: "filtros vacíos equivalen al catálogo completo", filters: {}, ids: ["usd-low", "usd-high", "usd-middle", "ars-match", "ars-high", "temporary", "usd-rent", "ars-low"] },
  { name: "Venta", filters: { operationType: "sale" }, ids: ["usd-low", "usd-high", "usd-middle", "ars-match"] },
  { name: "Alquiler", filters: { operationType: "rent" }, ids: ["ars-high", "usd-rent", "ars-low"] },
  { name: "Alquiler temporario", filters: { operationType: "temporary_rent" }, ids: ["temporary"] },
  { name: "tipo de inmueble", filters: { propertyType: "apartment" }, ids: ["usd-middle", "ars-high", "usd-rent", "ars-low"] },
  { name: "provincia sin localidad incluye distintas ciudades", filters: { province: "Córdoba" }, ids: ["usd-low", "usd-high", "ars-match", "temporary"] },
  { name: "localidad sin provincia", filters: { city: "La Plata" }, ids: ["usd-middle", "ars-high"] },
  { name: "provincia y localidad", filters: { province: "Córdoba", city: "Villa Carlos Paz" }, ids: ["usd-high"] },
  { name: "USD excluye ARS", filters: { currency: "USD" }, ids: ["usd-low", "usd-high", "usd-middle", "temporary", "usd-rent"] },
  { name: "ARS excluye USD", filters: { currency: "ARS" }, ids: ["ars-match", "ars-high", "ars-low"] },
  { name: "precio mínimo inclusivo", filters: { currency: "USD", minPrice: 150000 }, ids: ["usd-high", "usd-middle", "temporary"] },
  { name: "precio máximo inclusivo", filters: { currency: "USD", maxPrice: 100000 }, ids: ["usd-low", "usd-rent"] },
  { name: "rango USD con ambos límites incluidos sin exigir categoría", filters: { currency: "USD", minPrice: 100000, maxPrice: 200000 }, ids: ["usd-low", "usd-high", "usd-middle", "temporary"] },
  { name: "rango ARS solo compara ARS", filters: { currency: "ARS", minPrice: 100000, maxPrice: 200000 }, ids: ["ars-match", "ars-high"] },
  { name: "límites iguales y sin conversión USD a ARS", filters: { currency: "USD", minPrice: 100000, maxPrice: 100000 }, ids: ["usd-low"] },
  { name: "límites iguales y sin conversión ARS a USD", filters: { currency: "ARS", minPrice: 100000, maxPrice: 100000 }, ids: ["ars-match"] },
  { name: "categoría y tipo", filters: { operationType: "sale", propertyType: "house" }, ids: ["usd-low", "usd-high", "ars-match"] },
  { name: "ubicación y categoría", filters: { operationType: "rent", province: "Buenos Aires", city: "La Plata" }, ids: ["ars-high"] },
  { name: "todos los filtros", filters: { operationType: "sale", propertyType: "house", province: "Córdoba", city: "Córdoba", currency: "USD", minPrice: 100000, maxPrice: 200000 }, ids: ["usd-low"] },
  { name: "precio máximo cero se aplica", filters: { currency: "USD", maxPrice: 0 }, ids: [] },
  { name: "precio mínimo cero es válido", filters: { currency: "ARS", minPrice: 0 }, ids: ["ars-match", "ars-high", "ars-low"] },
  { name: "sin coincidencias", filters: { operationType: "temporary_rent", province: "Santa Fe" }, ids: [] },
  { name: "provincia válida sin propiedades", filters: { province: "Mendoza" }, ids: [] },
];
for (const { name, filters, ids } of cases) {
  test(`búsqueda pública: ${name}`, async () => {
    assert.deepEqual((await service.getPublicProperties(filters)).map((property) => property.id), ids);
  });
}

test("excluye una propiedad cuando falla cualquiera de los siete criterios", async () => {
  const filters: PropertySearchFilters = {
    operationType: "sale", propertyType: "house", province: "Córdoba", city: "Córdoba", currency: "USD", minPrice: 100000, maxPrice: 100000,
  };
  const variants: PropertySearchFilters[] = [
    { operationType: "rent" }, { propertyType: "apartment" }, { province: "Mendoza", city: "Mendoza" },
    { city: "Villa Carlos Paz" }, { currency: "ARS" }, { minPrice: 100001, maxPrice: 200000 }, { minPrice: 0, maxPrice: 99999 },
  ];
  for (const variant of variants) {
    assert.ok(!(await service.getPublicProperties({ ...filters, ...variant })).some((property) => property.id === "usd-low"));
  }
});

for (const id of ["paused", "deleted"]) {
  test(`${id} no aparece aunque cumpla todos los filtros ni puede abrirse públicamente`, async () => {
    const filters: PropertySearchFilters = {
      operationType: "sale", propertyType: "house", province: "Córdoba", city: "Córdoba", currency: "USD", minPrice: 100000, maxPrice: 100000,
    };
    assert.deepEqual((await service.getPublicProperties(filters)).map((property) => property.id), ["usd-low"]);
    assert.equal(await service.getPublicPropertyById(id), undefined);
  });
}

test("el service rechaza rangos inválidos incluso sin pasar por el buscador", async () => {
  for (const filters of [
    { minPrice: 0 }, { maxPrice: 100000 }, { minPrice: 100000, maxPrice: 200000 },
    { currency: "USD", minPrice: -1 }, { currency: "ARS", maxPrice: -1 },
    { currency: "USD", minPrice: 200000, maxPrice: 100000 },
    { currency: "USD", minPrice: NaN }, { currency: "ARS", maxPrice: Infinity },
  ] satisfies PropertySearchFilters[]) {
    await assert.rejects(service.getPublicProperties(filters));
  }
});

test("buscar no modifica filtros, store ni seed; las respuestas son copias", async () => {
  const before = structuredClone(fixtures);
  const filters: PropertySearchFilters = { operationType: "sale", currency: "USD", minPrice: 100000 };
  const originalFilters = { ...filters };
  const results = await service.getPublicProperties(filters);
  assert.ok(results[0]);
  results[0].location.city = "Cambio externo";
  results[0].images.length = 0;
  assert.deepEqual(filters, originalFilters);
  assert.deepEqual(await service.getAllInternal(), before);
  assert.deepEqual(fixtures, before);
});

test("el service acepta límites numéricos finitos aunque su toString use exponentes", async () => {
  assert.deepEqual((await service.getPublicProperties({ currency: "ARS", minPrice: 0.0000001 })).map((property) => property.id),
    ["ars-match", "ars-high", "ars-low"]);
  assert.deepEqual(await service.getPublicProperties({ currency: "ARS", minPrice: Number.MAX_VALUE }), []);
});

test("crear, editar, pausar, reactivar y eliminar actualiza las búsquedas del mismo store", async () => {
  const filters: PropertySearchFilters = { operationType: "temporary_rent", currency: "ARS", minPrice: 0, maxPrice: 200000 };
  const input = toPropertyInput(createPropertyFormValues(fixture("new", { operationType: "temporary_rent", currency: "ARS" })));
  assert.ok(input);
  assert.deepEqual(await service.getPublicProperties(filters), []);
  const created = await service.createProperty(input, 2);
  assert.deepEqual((await service.getPublicProperties(filters)).map((property) => property.id), [created.id]);
  await service.updateProperty(created.id, { ...input, data: { ...input.data, price: 250000 } });
  assert.deepEqual(await service.getPublicProperties(filters), []);
  await service.updateProperty(created.id, input);
  await service.pauseProperty(created.id);
  assert.deepEqual(await service.getPublicProperties(filters), []);
  assert.equal(await service.getPublicPropertyById(created.id), undefined);
  await service.reactivateProperty(created.id);
  assert.deepEqual((await service.getPublicProperties(filters)).map((property) => property.id), [created.id]);
  assert.equal((await service.getPublicPropertyById(created.id))?.id, created.id);
  await service.softDeleteProperty(created.id);
  assert.deepEqual(await service.getPublicProperties(filters), []);
  assert.equal(await service.getPublicPropertyById(created.id), undefined);
});
