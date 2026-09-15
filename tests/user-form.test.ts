import { test } from "node:test";
import assert from "node:assert/strict";
import { createUserFormValues, profileInput, registrationInput, validateTaxId, validateUserForm } from "../src/lib/user-form.ts";
import type { AuthUser, UserFormValues } from "../src/types/user.ts";

function registration(overrides: Partial<UserFormValues> = {}): UserFormValues {
  return {
    ...createUserFormValues(), firstName: "Ana", lastName: "Pérez", email: "ana@example.com",
    password: "123456", passwordConfirm: "123456", ...overrides,
  };
}

const valid = (errors: Record<string, string | undefined>) => !Object.values(errors).some(Boolean);

const authenticatedUser: AuthUser = {
  id: "6f928915-a992-4b1d-bf1c-4f3b5bb6a909",
  firstName: "Ana",
  lastName: "Pérez",
  email: "ana@example.com",
  phone: null,
  role: "interested",
  accountStatus: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

test("el interesado puede registrarse sin teléfono y valida uno si lo completa", () => {
  assert.ok(valid(validateUserForm(registration(), "interested", true)));
  assert.ok(valid(validateUserForm(registration({ phone: "   " }), "interested", true)));
  assert.ok(validateUserForm(registration({ phone: "abc" }), "interested", true).phone);
  assert.ok(valid(validateUserForm(registration({ phone: "+54 351 555-0100" }), "interested", true)));
});

test("los registros validan obligatorios, correo, longitud y confirmación", () => {
  for (const field of ["firstName", "lastName", "email", "password", "passwordConfirm"] as const) {
    assert.ok(validateUserForm(registration({ [field]: "" }), "interested", true)[field], field);
  }
  assert.ok(validateUserForm(registration({ email: "ana@" }), "interested", true).email);
  assert.ok(validateUserForm(registration({ password: "12345" }), "interested", true).password);
  assert.ok(validateUserForm(registration({ password: "a".repeat(73), passwordConfirm: "a".repeat(73) }), "interested", true).password);
  assert.ok(validateUserForm(registration({ passwordConfirm: "123456 " }), "interested", true).passwordConfirm);
});

test("el formulario pendiente de publicador conserva sus validaciones propias", () => {
  const errors = validateUserForm(registration(), "publisher", true);
  for (const field of ["publisherType", "phone", "taxId"] as const) assert.ok(errors[field], field);
  const values = registration({ publisherType: "individual", phone: "+54 351 555-0100", taxId: "20-12345678-9" });
  assert.ok(valid(validateUserForm(values, "publisher", true)));
  assert.ok(validateUserForm({ ...values, publisherType: "agency" }, "publisher", true).agencyName);
});

test("CUIT/CUIL permite guiones y exige once dígitos", () => {
  for (const value of ["20123456789", "20-12345678-9", " 30-12345678-9 "]) assert.equal(validateTaxId(value), undefined);
  for (const value of ["", "   ", "2012345678", "201234567890", "20-abcdefgh-9"]) assert.ok(validateTaxId(value));
});

test("el usuario autenticado usa UUID, teléfono nulo, rol y estado tipados", () => {
  assert.equal(typeof authenticatedUser.id, "string");
  assert.equal(authenticatedUser.phone, null);
  assert.ok(["interested", "publisher", "admin"].includes(authenticatedUser.role));
  assert.ok(["active", "disabled"].includes(authenticatedUser.accountStatus));
  const values = createUserFormValues(authenticatedUser);
  assert.equal(values.phone, "");
  assert.equal(values.password, "");
});

test("registro y perfil generan únicamente los campos permitidos", () => {
  const values = registration({ phone: "  +54 351 555-0100  ", publisherType: "agency", taxId: "30-12345678-9", agencyName: "Centro" });
  assert.deepEqual(registrationInput(values), {
    firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: "+54 351 555-0100",
    password: "123456", passwordConfirm: "123456",
  });
  assert.deepEqual(profileInput(values), { firstName: "Ana", lastName: "Pérez", phone: "+54 351 555-0100" });
  assert.deepEqual(profileInput({ ...values, phone: " " }), { firstName: "Ana", lastName: "Pérez", phone: null });
});

test("editar un publicador exige teléfono pero no datos fiscales", () => {
  const values = { ...createUserFormValues({ ...authenticatedUser, role: "publisher", phone: "+54 351 555-0100" }), phone: "+54 351 555-0100" };
  assert.ok(valid(validateUserForm(values, "publisher", false, false)));
  assert.ok(validateUserForm({ ...values, phone: "" }, "publisher", false, false).phone);
});
