import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { verifyEmail, changePassword } from "../src/services/authService.ts";
const original = globalThis.fetch;
afterEach(() => { globalThis.fetch = original; });
test("verify-email consume mensaje sin JWT", async () => { let request: Request | undefined; globalThis.fetch = async (input, init) => { request = new Request(input, init); return new Response(JSON.stringify({ message: "Correo verificado correctamente. Ya podés iniciar sesión." }), { headers: { "content-type": "application/json" } }); }; const result = await verifyEmail("token"); assert.equal(result.message.includes("iniciar sesión"), true); assert.equal(request?.url.endsWith("/auth/verify-email"), true); assert.equal(request?.headers.get("authorization"), null); });
test("change-password usa PATCH y devuelve sólo mensaje", async () => { let request: Request | undefined; globalThis.fetch = async (input, init) => { request = new Request(input, init); return new Response(JSON.stringify({ message: "Contraseña actualizada correctamente. Iniciá sesión nuevamente." }), { headers: { "content-type": "application/json" } }); }; const result = await changePassword({ currentPassword: "a", newPassword: "b", newPasswordConfirm: "b" }); assert.equal(result.message.includes("Iniciá sesión"), true); assert.equal(request?.method, "PATCH"); });
