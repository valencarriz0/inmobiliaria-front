import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { AUTH_TOKEN_KEY, type AuthStorage } from "../src/services/authStorage.ts";
import { notificationService } from "../src/services/notificationService.ts";
import { notificationDestination } from "../src/lib/notification.ts";
import { actionLabels, displayHistoryValue, historyChanges } from "../src/lib/property-history.ts";
import type { PropertyHistoryEntry } from "../src/types/publisher-property.ts";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
async function withToken(run: () => Promise<void>) { const previous = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage"); const storage: AuthStorage = { getItem: (key) => key === AUTH_TOKEN_KEY ? "jwt" : null, setItem: () => undefined, removeItem: () => undefined }; Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: storage }); try { await run(); } finally { if (previous) Object.defineProperty(globalThis, "sessionStorage", previous); else Reflect.deleteProperty(globalThis, "sessionStorage"); } }
function json(value: unknown) { return new Response(JSON.stringify(value), { headers: { "content-type": "application/json" } }); }

test("notificaciones consulta, marca una y marca todas usando el servicio real", async () => {
  await withToken(async () => { const requests: Request[] = []; globalThis.fetch = async (input, init) => { requests.push(new Request(input, init)); return json({ notifications: [], unreadCount: 2 }); }; await notificationService.list(); await notificationService.read("id-1"); await notificationService.readAll(); assert.deepEqual(requests.map((request) => [request.method, new URL(request.url).pathname]), [["GET", "/api/notifications"], ["PATCH", "/api/notifications/id-1/read"], ["PATCH", "/api/notifications/read-all"]]); assert.ok(requests.every((request) => request.headers.get("authorization") === "Bearer jwt")); });
});

test("destinos de notificaciones usan rutas existentes sin mocks", () => {
  assert.equal(notificationDestination({ id: "1", type: "new_consultation", title: "", message: null, consultationId: null, publisherApplicationId: null, searchAlertId: null, propertyId: null, readAt: null, createdAt: "2026-01-01T00:00:00Z" }), "/publisher/consultations");
  assert.equal(notificationDestination({ id: "2", type: "new_property_match", title: "", message: null, consultationId: null, publisherApplicationId: null, searchAlertId: null, propertyId: "property-1", readAt: null, createdAt: "2026-01-01T00:00:00Z" }), "/detailLogin/property-1");
});

test("historial traduce acciones, diferencia campos y formatea valores legibles", () => {
  const entry: PropertyHistoryEntry = { id: "1", action: "updated", createdAt: "2026-01-02T10:00:00Z", previousData: { price: 100000, currency: "USD", rooms: 3, images: ["a"] }, newData: { price: 95000, currency: "USD", rooms: 4, images: ["b"] } };
  assert.equal(actionLabels.created, "Creada"); assert.equal(actionLabels.paused, "Pausada"); assert.deepEqual(historyChanges(entry).map((change) => change.key), ["price", "rooms", "images"]);
  assert.equal(displayHistoryValue("price", 95000, entry.newData ?? {}), "USD 95.000"); assert.equal(displayHistoryValue("images", ["b"], entry.newData ?? {}), "Actualizado"); assert.equal(displayHistoryValue("rooms", 4, entry.newData ?? {}), "4");
});
