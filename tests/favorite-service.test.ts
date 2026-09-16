import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { favoriteService } from "../src/services/favoriteService.ts";
import { canManageFavorites, canShowFavorite, favoriteIdsFromResponse } from "../src/lib/favorites.ts";
import type { AuthUser } from "../src/types/user.ts";

const originalFetch = globalThis.fetch;

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function user(role: AuthUser["role"]): AuthUser {
  return { id: `${role}-id`, firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: null, role, accountStatus: "active", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" };
}

afterEach(() => { globalThis.fetch = originalFetch; });

test("favoritos consulta el listado y conserva los IDs devueltos por el backend", async () => {
  let request: Request | undefined;
  globalThis.fetch = async (input, init) => {
    request = new Request(input, init);
    return response({ favorites: [{ id: "property-a", title: "Casa", operationType: "sale", price: 10, currency: "USD", images: [], city: null, province: null }, { id: "property-b", title: "Depto", operationType: "rent", price: 20, currency: "ARS", images: [], city: null, province: null }] });
  };
  const result = await favoriteService.list();
  assert.equal(request?.method, "GET");
  assert.match(request?.url ?? "", /\/api\/users\/me\/favorites$/);
  assert.deepEqual(favoriteIdsFromResponse(result.favorites), ["property-a", "property-b"]);
});

test("favoritos agrega y quita con los endpoints protegidos", async () => {
  const requests: Request[] = [];
  globalThis.fetch = async (input, init) => {
    requests.push(new Request(input, init));
    return response({});
  };
  await favoriteService.add("property-a");
  await favoriteService.remove("property-a");
  assert.deepEqual(requests.map((request) => request.method), ["PUT", "DELETE"]);
  assert.ok(requests.every((request) => request.url.endsWith("/users/me/favorites/property-a")));
});

test("el corazón es visible para visitante, se oculta para admin y para una propiedad propia", () => {
  const ownIds = new Set(["own-property"]);
  assert.equal(canShowFavorite(null, "property-a", ownIds), true);
  assert.equal(canShowFavorite(user("interested"), "property-a", ownIds), true);
  assert.equal(canShowFavorite(user("publisher"), "property-a", ownIds), true);
  assert.equal(canShowFavorite(user("publisher"), "own-property", ownIds), false);
  assert.equal(canShowFavorite(user("admin"), "property-a", ownIds), false);
  assert.equal(canManageFavorites(null), false);
  assert.equal(canManageFavorites(user("interested")), true);
  assert.equal(canManageFavorites(user("publisher")), true);
  assert.equal(canManageFavorites(user("admin")), false);
});

test("una falla del backend al actualizar favoritos se propaga para restaurar el estado visual", async () => {
  globalThis.fetch = async () => response({ error: "No podés guardar tu propia propiedad como favorita." }, 400);
  await assert.rejects(favoriteService.add("own-property"), /No podés guardar tu propia propiedad/);
});
