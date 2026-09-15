import { test } from "node:test";
import assert from "node:assert/strict";
import { createUserFormValues, toUserProfile, validateTaxId, validateUserForm } from "../src/lib/user-form.ts";
import type { UserFormValues, UserProfile } from "../src/types/user.ts";

function registration(overrides: Partial<UserFormValues> = {}): UserFormValues {
  return {
    ...createUserFormValues(), firstName: "Ana", lastName: "Pérez", email: "ana@example.com",
    password: "123456", passwordConfirm: "123456", ...overrides,
  };
}

const valid = (errors: Record<string, string | undefined>) => !Object.values(errors).some(Boolean);

test("el interesado puede registrarse sin teléfono y valida uno si lo completa", () => {
  assert.ok(valid(validateUserForm(registration(), "interested", true)));
  assert.ok(valid(validateUserForm(registration({ phone: "   " }), "interested", true)));
  assert.ok(validateUserForm(registration({ phone: "abc" }), "interested", true).phone);
  assert.ok(valid(validateUserForm(registration({ phone: "+54 351 555-0100" }), "interested", true)));
});

test("los registros validan campos obligatorios, correo, mínimo de seis y coincidencia exacta", () => {
  for (const field of ["firstName", "lastName", "email", "password", "passwordConfirm"] as const) {
    assert.ok(validateUserForm(registration({ [field]: "" }), "interested", true)[field], field);
  }
  assert.ok(validateUserForm(registration({ email: "ana@" }), "interested", true).email);
  assert.ok(validateUserForm(registration({ password: "12345" }), "interested", true).password);
  assert.ok(validateUserForm(registration({ passwordConfirm: "123456 " }), "interested", true).passwordConfirm);
  assert.ok(valid(validateUserForm(registration({ password: "abcdef", passwordConfirm: "abcdef" }), "interested", true)));
});

test("el publicador requiere tipo, teléfono y CUIT; el particular no requiere razón social", () => {
  const errors = validateUserForm(registration(), "publisher", true);
  for (const field of ["publisherType", "phone", "taxId"] as const) assert.ok(errors[field], field);
  const values = registration({ publisherType: "individual", phone: "+54 351 555-0100", taxId: "20-12345678-9" });
  assert.ok(valid(validateUserForm(values, "publisher", true)));
  assert.ok(validateUserForm({ ...values, publisherType: "agency" }, "publisher", true).agencyName);
  assert.ok(valid(validateUserForm({ ...values, publisherType: "agency", agencyName: "Casas del Centro S.A." }, "publisher", true)));
});

test("CUIT/CUIL permite guiones y exige once dígitos sin validación fiscal adicional", () => {
  for (const value of ["20123456789", "20-12345678-9", " 30-12345678-9 "]) assert.equal(validateTaxId(value), undefined);
  for (const value of ["", "   ", "2012345678", "201234567890", "20-abcdefgh-9", "ab20123456789"]) assert.ok(validateTaxId(value));
});

test("convertir interesado precarga sus datos y no exige otra contraseña", () => {
  const interested: UserProfile = { role: "interested", firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: "+54 351 555-0100" };
  const values = createUserFormValues(interested);
  assert.equal(values.firstName, interested.firstName);
  assert.equal(values.lastName, interested.lastName);
  assert.equal(values.email, interested.email);
  assert.equal(values.phone, interested.phone);
  assert.equal(values.password, "");
  const publisher = { ...values, publisherType: "agency" as const, agencyName: "Centro", taxId: "30-12345678-9" };
  assert.ok(valid(validateUserForm(publisher, "publisher")));
  assert.equal(toUserProfile(publisher, "publisher")?.email, interested.email);
  assert.equal(interested.role, "interested");
});

test("ambos tipos conservan el rol publisher y el perfil descarta contraseñas y datos ocultos", () => {
  const values = registration({ phone: "+54 351 555-0100", taxId: "20-12345678-9", publisherType: "agency", agencyName: " Centro S.A. " });
  const agency = toUserProfile(values, "publisher");
  assert.deepEqual(agency, {
    role: "publisher", publisherType: "agency", firstName: "Ana", lastName: "Pérez",
    email: "ana@example.com", phone: "+54 351 555-0100", taxId: "20123456789", agencyName: "Centro S.A.",
  });
  const individual = toUserProfile({ ...values, publisherType: "individual" }, "publisher");
  assert.equal(individual?.role, "publisher");
  assert.ok(individual);
  for (const key of ["agencyName", "password", "passwordConfirm"]) assert.equal(key in individual, false);
  const interested = toUserProfile(values, "interested");
  assert.ok(interested);
  for (const key of ["publisherType", "agencyName", "taxId", "password", "passwordConfirm"]) assert.equal(key in interested, false);
  assert.equal(toUserProfile({ ...values, taxId: "1" }, "publisher"), undefined);
});

test("editar un perfil de inmobiliaria conserva los datos fiscales sin pedir contraseña", () => {
  const user: UserProfile = {
    role: "publisher", publisherType: "agency", firstName: "Ana", lastName: "Pérez",
    email: "ana@example.com", phone: "+54 351 555-0100", taxId: "30123456789", agencyName: "Centro S.A.",
  };
  const values = createUserFormValues(user);
  assert.ok(valid(validateUserForm(values, user.role)));
  assert.deepEqual(toUserProfile(values, user.role), user);
});
