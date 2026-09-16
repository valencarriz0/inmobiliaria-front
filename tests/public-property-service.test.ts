import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../src/services/api.ts";
import { getPublicProperties, getPublicPropertyById } from "../src/services/publicPropertyService.ts";
import { mapPublicPropertyDetail, mapPublicPropertySummary } from "../src/lib/public-property.ts";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const base = {
  id: "f553c8f8-3f73-4b0d-9bbc-3bb5ae6f0d3c", title: "Casa", description: "Casa luminosa", operationType: "sale", propertyType: "house", price: "120000.50", currency: "USD",
  city: { id: "e663c8f8-3f73-4b0d-9bbc-3bb5ae6f0d3c", name: "Córdoba" }, province: { id: "a773c8f8-3f73-4b0d-9bbc-3bb5ae6f0d3c", name: "Córdoba" }, street: "Colón", streetNumber: "123",
  totalArea: "120.5", rooms: "3", bedrooms: null, bathrooms: "2", age: null, propertyCondition: null, acceptsPets: null, garage: null, expenses: "1500", taxes: null, commissions: null,
  latitude: "-31.4201", longitude: "-64.1888", images: ["https://example.test/one.jpg", "https://example.test/two.jpg"], createdAt: "2026-01-01T00:00:00.000Z",
};
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }); }

test("listado público usa filtros reales, paginación y no envía token", async () => {
  let request: Request | undefined;
  globalThis.fetch = async (input, init) => { request = new Request(input, init); return json({ properties: [base], pagination: { page: 2, limit: 12, total: 25, totalPages: 3 } }); };
  const result = await getPublicProperties({ operationType: "sale", propertyType: "house", cityId: base.city.id, currency: "USD", minPrice: 0, maxPrice: 200000, sort: "price_asc", page: 2 });
  const params = new URL(request?.url).searchParams;
  assert.equal(params.get("cityId"), base.city.id); assert.equal(params.get("provinceId"), null); assert.equal(params.get("limit"), "12"); assert.equal(params.get("sort"), "price_asc");
  assert.equal(request?.headers.get("authorization"), null); assert.equal(result.pagination.total, 25); assert.equal(result.properties[0]?.price, 120000.5);
});

test("mapper normaliza decimales, conserva imágenes y no inventa campos privados", () => {
  const property = mapPublicPropertySummary({ ...base, latitude: null, longitude: null });
  assert.equal(property.totalArea, 120.5); assert.equal(property.expenses, 1500); assert.equal(property.latitude, null); assert.deepEqual(property.images, base.images);
  assert.equal("publisherId" in property, false); assert.equal("publicationStatus" in property, false); assert.equal("updatedAt" in property, false);
});

test("detalle conserva servicios y amenities desde el DTO", () => {
  const property = mapPublicPropertyDetail({ ...base, services: [{ id: "1", code: "water", name: "Agua" }], amenities: [{ id: "2", code: "balcony", name: "Balcón" }] });
  assert.deepEqual(property.services, ["water"]); assert.deepEqual(property.amenities, ["balcony"]);
});

test("el detalle público propaga 404 y transforma errores de red", async () => {
  globalThis.fetch = async () => json({ error: "Propiedad no encontrada." }, 404);
  await assert.rejects(getPublicPropertyById(base.id), (error: unknown) => error instanceof ApiError && error.status === 404);
  globalThis.fetch = async () => { throw new Error("sin red"); };
  await assert.rejects(getPublicPropertyById(base.id), (error: unknown) => error instanceof ApiError && error.status === 0);
});
