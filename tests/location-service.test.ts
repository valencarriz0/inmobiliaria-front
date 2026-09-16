import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { geocodeAddress, getCities, getProvinces, searchLocations } from "../src/services/locationService.ts";
import { AUTH_TOKEN_KEY } from "../src/services/authStorage.ts";

const originalFetch = globalThis.fetch;
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalStorage) Object.defineProperty(globalThis, "sessionStorage", originalStorage);
  else Reflect.deleteProperty(globalThis, "sessionStorage");
});

function response(body: unknown) { return new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } }); }

test("provincias y localidades usan los endpoints propios", async () => {
  const calls: Request[] = [];
  globalThis.fetch = async (input) => { calls.push(new Request(input)); return response({ provinces: [] }); };
  await getProvinces();
  assert.equal(calls[0]?.url, "http://localhost:3000/api/locations/provinces");
  globalThis.fetch = async (input) => { calls.push(new Request(input)); return response({ cities: [] }); };
  await getCities("province-id");
  assert.equal(calls[1]?.url, "http://localhost:3000/api/locations/cities?provinceId=province-id");
});

test("la búsqueda corta no hace una solicitud y una búsqueda válida usa la API", async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; return response({ locations: [] }); };
  assert.deepEqual(await searchLocations(" a "), { locations: [] });
  assert.equal(calls, 0);
  await searchLocations("cór");
  assert.equal(calls, 1);
});

test("la geocodificación envía sólo la dirección requerida, nunca un role", async () => {
  let request: Request | undefined;
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: { getItem: (key: string) => key === AUTH_TOKEN_KEY ? "token-prueba" : null } });
  globalThis.fetch = async (input, init) => { request = new Request(input, init); return response({ matches: [] }); };
  await geocodeAddress({ cityId: "city-id", street: "  Calle 1 ", streetNumber: "  " });
  assert.equal(request?.url, "http://localhost:3000/api/locations/geocode");
  assert.equal(request?.headers.get("authorization"), "Bearer token-prueba");
  assert.deepEqual(await request?.json(), { cityId: "city-id", street: "Calle 1", streetNumber: null });
});
