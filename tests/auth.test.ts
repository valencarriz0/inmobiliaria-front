import { test } from "node:test";
import assert from "node:assert/strict";
import { apiRequest, ApiError } from "../src/services/api.ts";
import { AUTH_TOKEN_KEY, clearAuthToken, getAuthToken, setAuthToken, type AuthStorage } from "../src/services/authStorage.ts";
import * as authService from "../src/services/authService.ts";
import * as userService from "../src/services/userService.ts";
import { COMMON_REGISTRATION_DESTINATION, publishingEntryRedirect, roleHome } from "../src/lib/auth-navigation.ts";

const user = {
  id: "6f928915-a992-4b1d-bf1c-4f3b5bb6a909",
  firstName: "Ana",
  lastName: "Pérez",
  email: "ana@example.com",
  phone: null,
  role: "interested" as const,
  accountStatus: "active" as const,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function memoryStorage(initial: Record<string, string> = {}): AuthStorage {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

async function withFetch(mock: typeof fetch, run: () => Promise<void>) {
  const original = globalThis.fetch;
  globalThis.fetch = mock;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

async function withSessionToken(token: string, run: () => Promise<void>) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: memoryStorage({ [AUTH_TOKEN_KEY]: token }) });
  try {
    await run();
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "sessionStorage", descriptor);
    else Reflect.deleteProperty(globalThis, "sessionStorage");
  }
}

test("authStorage guarda, recupera y elimina sólo el token de autenticación", () => {
  const storage = memoryStorage({ recientes: "[1,2]" });
  assert.equal(getAuthToken(storage), null);
  setAuthToken("jwt", storage);
  assert.equal(getAuthToken(storage), "jwt");
  clearAuthToken(storage);
  assert.equal(getAuthToken(storage), null);
  assert.equal(storage.getItem("recientes"), "[1,2]");
});

test("register usa POST y envía únicamente los campos permitidos", async () => {
  await withFetch(async (input, init) => {
    assert.equal(String(input), "http://localhost:3000/api/auth/register");
    assert.equal(init?.method, "POST");
    assert.deepEqual(JSON.parse(String(init?.body)), {
      firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: null,
      password: "123456", passwordConfirm: "123456",
    });
    return jsonResponse({ user, token: "jwt" }, 201);
  }, async () => {
    const response = await authService.register({
      firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: null,
      password: "123456", passwordConfirm: "123456",
    });
    assert.equal(response.token, "jwt");
    assert.equal(response.user.role, "interested");
  });
});

test("el registro común siempre termina en perfil", () => {
  assert.equal(COMMON_REGISTRATION_DESTINATION, "/profile");
  assert.notEqual(COMMON_REGISTRATION_DESTINATION, "/register");
  assert.notEqual(COMMON_REGISTRATION_DESTINATION, "/become-publisher");
});

test("ser interested no abre automáticamente el formulario de publicador", () => {
  assert.equal(publishingEntryRedirect("interested"), null);
  assert.equal(roleHome("interested"), "/HomePageLogin");
  assert.equal(publishingEntryRedirect("publisher"), "/dashboard");
  assert.equal(publishingEntryRedirect("admin"), "/profile");
});

test("login usa POST con correo y contraseña", async () => {
  await withFetch(async (input, init) => {
    assert.equal(String(input), "http://localhost:3000/api/auth/login");
    assert.equal(init?.method, "POST");
    assert.deepEqual(JSON.parse(String(init?.body)), { email: "ana@example.com", password: "123456" });
    return jsonResponse({ user, token: "jwt" });
  }, async () => {
    assert.equal((await authService.login({ email: "ana@example.com", password: "123456" })).user.id, user.id);
  });
});

test("getMe usa GET e incluye el token Bearer", async () => {
  await withSessionToken("jwt-me", async () => withFetch(async (input, init) => {
    assert.equal(String(input), "http://localhost:3000/api/auth/me");
    assert.equal(init?.method, "GET");
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer jwt-me");
    return jsonResponse({ user });
  }, async () => {
    assert.equal((await authService.getMe()).user.email, user.email);
  }));
});

test("updateMe usa PATCH, Bearer y sólo envía nombre, apellido y teléfono", async () => {
  await withSessionToken("jwt-profile", async () => withFetch(async (input, init) => {
    assert.equal(String(input), "http://localhost:3000/api/users/me");
    assert.equal(init?.method, "PATCH");
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer jwt-profile");
    assert.deepEqual(JSON.parse(String(init?.body)), { firstName: "Ana", lastName: "Pérez", phone: null });
    return jsonResponse({ user });
  }, async () => {
    await userService.updateMe({ firstName: "Ana", lastName: "Pérez", phone: null });
  }));
});

for (const status of [400, 401, 403, 409]) {
  test(`${status} produce un ApiError tipado con detalles seguros`, async () => {
    await withFetch(async () => jsonResponse({ error: "Datos inválidos.", details: { email: "Correo inválido." } }, status), async () => {
      await assert.rejects(apiRequest("/error"), (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.status, status);
        assert.equal(error.message, "Datos inválidos.");
        assert.deepEqual(error.details, { email: "Correo inválido." });
        return true;
      });
    });
  });
}

test("una respuesta no JSON se maneja sin exponer el contenido", async () => {
  await withFetch(async () => new Response("<html>Error interno</html>", { status: 500, headers: { "content-type": "text/html" } }), async () => {
    await assert.rejects(apiRequest("/error"), (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 500);
      assert.equal(error.message, "No se pudo completar la solicitud. Intentá nuevamente.");
      return true;
    });
  });
});

test("un error de red se transforma en un mensaje amigable", async () => {
  await withFetch(async () => { throw new TypeError("Failed to fetch"); }, async () => {
    await assert.rejects(apiRequest("/auth/me"), (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 0);
      assert.equal(error.message, "No se pudo conectar con el servidor. Intentá nuevamente.");
      return true;
    });
  });
});
