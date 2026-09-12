import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEmail, validateName, validateNumber, validatePassword, validatePasswordConfirmation, validatePhone, validateImage, validateProperty } from "../src/lib/validation.ts";

test("rechaza campos obligatorios vacíos o con espacios", () => {
  for (const value of ["", "   "]) {
    assert.ok(validateEmail(value));
    assert.ok(validateName(value, "nombre"));
    assert.ok(validatePassword(value));
    assert.ok(validatePhone(value));
    assert.ok(validateNumber(value, "El precio"));
  }
  assert.ok(validatePasswordConfirmation("", ""));
});

test("valida correos completos, nombres internacionales y teléfonos", () => {
  for (const value of ["ana", "ana@", "ana@@correo.com", "ana @correo.com"]) assert.ok(validateEmail(value));
  assert.equal(validateEmail(" ana@correo.com "), undefined);
  assert.equal(validateName("María José", "nombre"), undefined);
  assert.equal(validateName("O’Connor", "apellido"), undefined);
  assert.equal(validateName("Jean-Luc", "nombre"), undefined);
  assert.ok(validateName("Ana123", "nombre"));
  assert.ok(validateName("A ", "nombre"));
  assert.equal(validatePhone("+54 (351) 123-4567"), undefined);
  for (const phone of ["123", "abc1234567", "1234567890123456"]) assert.ok(validatePhone(phone));
});

test("las contraseñas deben cumplir el mínimo y coincidir exactamente", () => {
  assert.ok(validatePassword("12345"));
  assert.equal(validatePassword("123456"), undefined);
  assert.ok(validatePasswordConfirmation("123456 ", "123456"));
  assert.equal(validatePasswordConfirmation("123456", "123456"), undefined);
});

test("precios y superficies aceptan decimales; cantidades exigen enteros", () => {
  for (const value of ["12.5", "12,5", "150000"]) assert.equal(validateNumber(value, "El precio", { exclusive: true }), undefined);
  for (const value of ["0", "-1", "Infinity", "1e309", "abc", "0x10", "1.2.3"]) assert.ok(validateNumber(value, "El precio", { exclusive: true }));
  assert.ok(validateNumber("1.5", "Los ambientes", { integer: true }));
  assert.equal(validateNumber("0", "Los baños", { integer: true }), undefined);
  assert.equal(validateNumber("", "Las cocheras", { optional: true, integer: true }), undefined);
  assert.ok(validateNumber("-2", "Las cocheras", { optional: true, integer: true }));
  assert.ok(validateNumber("e", "La altura", { optional: true, integer: true }));
});

const image = new File(["image"], "casa.png", { type: "image/png" });

test("las imágenes deben tener formato admitido, contenido y hasta 5 MB", () => {
  assert.equal(validateImage(image), undefined);
  assert.ok(validateImage(new File(["text"], "casa.txt", { type: "text/plain" })));
  assert.ok(validateImage(new File([], "casa.png", { type: "image/png" })));
  assert.ok(validateImage(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "casa.png", { type: "image/png" })));
});

test("publicación y edición exigen sus imágenes y datos, dejando opcionales altura y cocheras", () => {
  const property = {
    title: "Casa", province: "Córdoba", city: "Ciudad 1", street: "San Martín", number: "",
    propertyType: "Casa", category: "Venta", price: "120000", currency: "USD", area: "120,5",
    rooms: "3", bathrooms: "0", garages: "", description: "Casa con patio", images: [image, image, null],
  };
  assert.equal(Object.values(validateProperty(property, 2)).some(Boolean), false);
  assert.ok(validateProperty({ ...property, title: "  " }, 2).title);
  assert.ok(validateProperty({ ...property, images: [null, image, image] }, 2).images);
  assert.ok(validateProperty({ ...property, images: [image, null, null] }, 2).images);
  assert.equal(validateProperty({ ...property, images: [image, null, null] }, 1).images, undefined);
  assert.ok(validateProperty({ ...property, rooms: "2.5", bathrooms: "-1" }, 2).rooms);
  assert.ok(validateProperty({ ...property, rooms: "2.5", bathrooms: "-1" }, 2).bathrooms);
});
