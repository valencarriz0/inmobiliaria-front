import { test } from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../src/services/api.ts";
import { AUTH_TOKEN_KEY, type AuthStorage } from "../src/services/authStorage.ts";
import { canReapplyPublisherApplication, publisherApplicationStatusLabels } from "../src/lib/publisher-application.ts";
import * as publisherApplicationService from "../src/services/publisherApplicationService.ts";

const application = {
  id: "d13ebc1c-a4a0-4d2f-bbfc-8b8e3ca2a621",
  userId: "6f928915-a992-4b1d-bf1c-4f3b5bb6a909",
  publisherType: "agency" as const,
  taxId: "30123456789",
  agencyName: "Centro S.A.",
  phone: "+54 351 555-0100",
  status: "pending" as const,
  reviewedAt: null,
  reviewedBy: null,
  rejectionReason: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function memoryStorage(): AuthStorage {
  const values = new Map([[AUTH_TOKEN_KEY, "jwt-publisher"]]);
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
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mock;
  try {
    await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

async function withToken(run: () => Promise<void>) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "sessionStorage");
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: memoryStorage() });
  try {
    await run();
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "sessionStorage", descriptor);
    else Reflect.deleteProperty(globalThis, "sessionStorage");
  }
}

test("la solicitud pública usa POST y descarta campos no permitidos", async () => {
  await withFetch(async (input, init) => {
    assert.equal(String(input), "http://localhost:3000/api/publisher-applications/public");
    assert.equal(init?.method, "POST");
    assert.deepEqual(JSON.parse(String(init?.body)), {
      firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: "+54 351 555-0100",
      password: "123456", passwordConfirm: "123456", publisherType: "agency", taxId: "30123456789", agencyName: "Centro S.A.",
    });
    return jsonResponse({ user: { id: application.userId, role: "interested" }, application, token: "jwt" }, 201);
  }, async () => {
    await publisherApplicationService.createPublicPublisherApplication(Object.assign({
      firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: "+54 351 555-0100",
      password: "123456", passwordConfirm: "123456", publisherType: "agency" as const, taxId: "30123456789", agencyName: "Centro S.A.",
    }, { role: "admin", status: "approved" }));
  });
});

test("la solicitud autenticada usa POST, Bearer y no envía identidad ni contraseña", async () => {
  await withToken(async () => withFetch(async (input, init) => {
    assert.equal(String(input), "http://localhost:3000/api/publisher-applications");
    assert.equal(init?.method, "POST");
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer jwt-publisher");
    assert.deepEqual(JSON.parse(String(init?.body)), { publisherType: "individual", taxId: "20123456789", agencyName: null, phone: "+54 351 555-0100" });
    return jsonResponse({ application }, 201);
  }, async () => {
    await publisherApplicationService.createPublisherApplication(Object.assign({ publisherType: "individual" as const, taxId: "20123456789", agencyName: null, phone: "+54 351 555-0100" }, { userId: "otro", email: "ana@example.com", password: "123456" }));
  }));
});

test("getMe y listado administrativo usan GET con token y estado", async () => {
  await withToken(async () => withFetch(async (input, init) => {
    const url = String(input);
    assert.equal(init?.method, undefined);
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer jwt-publisher");
    if (url.endsWith("/publisher-applications/me")) return jsonResponse({ application });
    assert.equal(url, "http://localhost:3000/api/admin/publisher-applications?status=rejected");
    return jsonResponse({ applications: [] });
  }, async () => {
    assert.equal((await publisherApplicationService.getMyPublisherApplication()).application?.id, application.id);
    assert.deepEqual((await publisherApplicationService.getAdminPublisherApplications("rejected")).applications, []);
  }));
});

test("approve usa PATCH con body vacío y reject normaliza el motivo", async () => {
  await withToken(async () => withFetch(async (input, init) => {
    assert.equal(init?.method, "PATCH");
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer jwt-publisher");
    if (String(input).endsWith("/approve")) assert.deepEqual(JSON.parse(String(init?.body)), {});
    else assert.deepEqual(JSON.parse(String(init?.body)), { rejectionReason: "Documentación incompleta" });
    return jsonResponse({ application });
  }, async () => {
    await publisherApplicationService.approvePublisherApplication(application.id);
    await publisherApplicationService.rejectPublisherApplication(application.id, "  Documentación incompleta  ");
  }));
});

for (const status of [400, 401, 403, 404, 409]) {
  test(`${status} de publisher applications produce ApiError`, async () => {
    await withToken(async () => withFetch(async () => jsonResponse({ error: "Error controlado." }, status), async () => {
      await assert.rejects(publisherApplicationService.getMyPublisherApplication(), (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.status, status);
        return true;
      });
    }));
  });
}

test("un error de red de publisher applications se transforma en ApiError", async () => {
  await withToken(async () => withFetch(async () => { throw new TypeError("Failed to fetch"); }, async () => {
    await assert.rejects(publisherApplicationService.getMyPublisherApplication(), (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 0);
      return true;
    });
  }));
});

test("los estados tienen etiquetas y sólo una rechazada permite volver a solicitar", () => {
  assert.deepEqual(publisherApplicationStatusLabels, { pending: "Pendiente", approved: "Aprobada", rejected: "Rechazada" });
  assert.equal(canReapplyPublisherApplication("pending"), false);
  assert.equal(canReapplyPublisherApplication("approved"), false);
  assert.equal(canReapplyPublisherApplication("rejected"), true);
});
