import assert from "node:assert/strict";
import test from "node:test";
import { adminService } from "../src/services/adminService.ts";
import { searchAlertService } from "../src/services/searchAlertService.ts";
import { setAuthToken } from "../src/services/authStorage.ts";

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

test("alertas actualiza todos los criterios permitidos con PATCH y Bearer", async () => {
  setAuthToken("alert-token");
  let request: Request | undefined;
  globalThis.fetch = async (input, init) => { request = new Request(input, init); return response({ alert: { id: "a", isActive: true } }); };
  await searchAlertService.update("a", { name: "Centro", operationType: "sale", propertyType: "apartment", provinceId: null, cityId: "city", currency: "USD", minPrice: 10, maxPrice: 20 });
  assert.equal(request?.method, "PATCH");
  assert.deepEqual(await request?.json(), { name: "Centro", operationType: "sale", propertyType: "apartment", provinceId: null, cityId: "city", currency: "USD", minPrice: 10, maxPrice: 20 });
});

test("admin actualiza sólo datos básicos permitidos", async () => {
  setAuthToken("admin-token");
  let request: Request | undefined;
  globalThis.fetch = async (input, init) => { request = new Request(input, init); return response({ user: { id: "u" } }); };
  await adminService.updateUser("u", { firstName: "Ana", lastName: "Pérez", phone: null });
  assert.equal(request?.url.endsWith("/admin/users/u"), true);
  assert.equal(request?.method, "PATCH");
  assert.deepEqual(await request?.json(), { firstName: "Ana", lastName: "Pérez", phone: null });
});

test("admin edita los criterios inmobiliarios admitidos sin enviar imágenes", async () => {
  setAuthToken("admin-token");
  let request: Request | undefined;
  globalThis.fetch = async (input, init) => { request = new Request(input, init); return response({ property: { id: "p" } }); };
  const body = {
    title: "Departamento céntrico", description: "Actualizado", operationType: "rent" as const, propertyType: "apartment" as const,
    price: 950, currency: "USD" as const, cityId: "city-id", street: "San Martín", streetNumber: "123", totalArea: 65, rooms: 3,
    bedrooms: 2, bathrooms: 1, age: null, propertyCondition: "excellent" as const, acceptsPets: true, garage: 1,
    expenses: 40, taxes: null, commissions: 100, latitude: -31.4, longitude: -64.2,
    serviceCodes: ["electricity", "water"] as const, amenityCodes: ["balcony"] as const,
  };
  await adminService.updateProperty("p", body);
  assert.equal(request?.url.endsWith("/admin/properties/p"), true);
  assert.equal(request?.method, "PATCH");
  assert.deepEqual(await request?.json(), body);
});

test("admin usa los endpoints de pausa, reactivación, eliminación e historial", async () => {
  setAuthToken("admin-token");
  const requests: Request[] = [];
  globalThis.fetch = async (input, init) => {
    const request = new Request(input, init); requests.push(request);
    return response(request.url.endsWith("/history") ? { history: [] } : { property: { id: "p" } });
  };
  await adminService.pauseProperty("p");
  await adminService.reactivateProperty("p");
  await adminService.deleteProperty("p");
  await adminService.propertyHistory("p");
  assert.deepEqual(requests.map((request) => [new URL(request.url).pathname, request.method]), [
    ["/api/admin/properties/p/pause", "PATCH"],
    ["/api/admin/properties/p/reactivate", "PATCH"],
    ["/api/admin/properties/p", "DELETE"],
    ["/api/admin/properties/p/history", "GET"],
  ]);
});
