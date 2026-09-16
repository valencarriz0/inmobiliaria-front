import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { consultationService } from "../src/services/consultationService.ts";
import { mapConsultation } from "../src/lib/consultation.ts";
import { AUTH_TOKEN_KEY, type AuthStorage } from "../src/services/authStorage.ts";
import { ApiError } from "../src/services/api.ts";
import type { ConsultationDto } from "../src/types/consultation.ts";

const originalFetch = globalThis.fetch;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function storage(token: string): AuthStorage {
  return { getItem: (key) => key === AUTH_TOKEN_KEY ? token : null, setItem: () => undefined, removeItem: () => undefined };
}

async function withSessionToken(token: string, run: () => Promise<void>) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: storage(token) });
  try {
    await run();
  } finally {
    if (original) Object.defineProperty(globalThis, "sessionStorage", original);
    else Reflect.deleteProperty(globalThis, "sessionStorage");
  }
}

function consultation(images = ["https://example.test/cover.jpg", "https://example.test/inside.jpg"]): ConsultationDto {
  return {
    id: "consultation-id", propertyId: "property-id", createdAt: "2026-01-01T00:00:00.000Z",
    firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: "+54 351 555 0100", message: null,
    property: { id: "property-id", title: "Casa", operationType: "sale", price: 120000, currency: "USD", images, city: { id: "city-id", name: "Córdoba" }, province: { id: "province-id", name: "Córdoba" } },
  };
}

afterEach(() => { globalThis.fetch = originalFetch; });

test("crea una consulta de visitante sin token con el cuerpo esperado", async () => {
  let request: Request | undefined;
  globalThis.fetch = async (input, init) => {
    request = new Request(input, init);
    return json({ consultation: { id: "consultation-id", propertyId: "property-id", createdAt: "2026-01-01T00:00:00.000Z", firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: "123", message: null } }, 201);
  };
  await consultationService.create("property-id", { firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: "123" });
  assert.equal(request?.method, "POST");
  assert.equal(request?.headers.get("authorization"), null);
  assert.ok(request?.url.endsWith("/properties/property-id/consultations"));
  assert.deepEqual(await request?.json(), { firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: "123" });
});

test("crea una consulta autenticada y envía el token", async () => {
  await withSessionToken("jwt", async () => {
    let request: Request | undefined;
    globalThis.fetch = async (input, init) => {
      request = new Request(input, init);
      return json({ consultation: { id: "consultation-id", propertyId: "property-id", createdAt: "2026-01-01T00:00:00.000Z", firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: "123", message: "Hola" } }, 201);
    };
    await consultationService.create("property-id", { firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: "123", message: "Hola" });
    assert.equal(request?.headers.get("authorization"), "Bearer jwt");
  });
});

test("obtiene las consultas realizadas y recibidas desde sus endpoints autenticados", async () => {
  await withSessionToken("jwt", async () => {
    const requests: Request[] = [];
    globalThis.fetch = async (input, init) => {
      requests.push(new Request(input, init));
      return json({ consultations: [consultation()] });
    };
    const mine = await consultationService.mine();
    const received = await consultationService.publisher("property-id");
    assert.equal(mine[0]?.property.images[0], "https://example.test/cover.jpg");
    assert.equal(received[0]?.property.title, "Casa");
    assert.ok(requests[0]?.url.endsWith("/users/me/consultations"));
    assert.ok(requests[1]?.url.endsWith("/publisher/consultations?propertyId=property-id"));
    assert.ok(requests.every((request) => request.headers.get("authorization") === "Bearer jwt"));
  });
});

test("el mapper conserva la portada y acepta entre dos y cinco imágenes", () => {
  assert.equal(mapConsultation(consultation()).property.images[0], "https://example.test/cover.jpg");
  assert.equal(mapConsultation(consultation(["1", "2", "3", "4", "5"])).property.images.length, 5);
});

test("el mapper rechaza propiedades sin imágenes o con más de cinco", () => {
  assert.throws(() => mapConsultation(consultation([])), /imágenes de propiedad inválidas/);
  assert.throws(() => mapConsultation(consultation(["1", "2", "3", "4", "5", "6"])), /imágenes de propiedad inválidas/);
});

test("los errores de la API se conservan para que la interfaz muestre un mensaje seguro", async () => {
  globalThis.fetch = async () => json({ error: "Propiedad no encontrada." }, 404);
  await assert.rejects(consultationService.create("property-id", { firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: "123" }), (error: unknown) => error instanceof ApiError && error.status === 404);
});
