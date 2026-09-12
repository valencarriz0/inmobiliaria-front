import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEmail, validateName, validateNumber, validatePassword, validatePasswordConfirmation, validatePhone, validateImage, validatePropertyForm, validateImageSelection } from "../src/lib/validation.ts";
import { createPropertyFormValues, changePropertyProvince, toPropertyInput } from "../src/lib/property-form.ts";
import { OPERATION_TYPES, CURRENCIES } from "../src/constants/property.ts";
import { mockProperties } from "../src/data/mock/properties.ts";
import type { PropertyFormImage, PropertyFormValues } from "../src/types/property-form.ts";

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

function localImage(name = "casa.png", type = "image/png", size = 10): PropertyFormImage {
  return { kind: "new", id: name, file: new File([new Uint8Array(size)], name, { type }) };
}

function validProperty(overrides: Partial<PropertyFormValues> = {}): PropertyFormValues {
  return {
    ...createPropertyFormValues(),
    title: "Casa", province: "Córdoba", city: "Córdoba",
    propertyType: "house", operationType: "sale", price: "120000", currency: "USD",
    totalArea: "120,5", rooms: "3", description: "Casa con patio",
    images: [localImage("frente.png"), localImage("patio.png")],
    ...overrides,
  };
}

for (const count of [2, 5]) {
  test(`propiedad válida con ${count} imágenes y todos los opcionales vacíos`, () => {
    const values = validProperty({ images: Array.from({ length: count }, (_, i) => localImage(`${i}.png`)) });
    assert.equal(Object.values(validatePropertyForm(values)).some(Boolean), false);
    assert.ok(toPropertyInput(values));
  });
}

for (const count of [0, 1, 6]) {
  test(`propiedad inválida con ${count} imágenes`, () => {
    const values = validProperty({ images: Array.from({ length: count }, (_, i) => localImage(`${i}.png`)) });
    assert.ok(validatePropertyForm(values).images);
    assert.equal(toPropertyInput(values), undefined);
  });
}

for (const [extension, mime] of [["jpeg", "image/jpeg"], ["jpg", "image/jpeg"], ["png", "image/png"], ["webp", "image/webp"]]) {
  test(`acepta imágenes ${extension.toUpperCase()}`, () => {
    const image = localImage(`casa.${extension}`, mime);
    const values = validProperty({ images: [image, localImage()] });
    assert.equal(validatePropertyForm(values).images, undefined);
  });
}

test("acepta 5 MB exactos y rechaza una imagen superior a 5 MB", () => {
  const max = 5 * 1024 * 1024;
  assert.equal(validatePropertyForm(validProperty({ images: [localImage("large.png", "image/png", max), localImage()] })).images, undefined);
  assert.ok(validatePropertyForm(validProperty({ images: [localImage("large.png", "image/png", max + 1), localImage()] })).images);
});

test("rechaza formatos no permitidos, MIME vacío y archivos sin contenido", () => {
  for (const mime of ["image/gif", "image/svg+xml", "text/plain", ""]) {
    assert.ok(validateImage(new File(["file"], "casa.jpg", { type: mime })));
    assert.ok(validatePropertyForm(validProperty({ images: [localImage("casa.jpg", mime), localImage()] })).images);
  }
  assert.ok(validateImage(new File([], "casa.png", { type: "image/png" })));
});

test("se pueden agregar imágenes gradualmente sin superar el máximo", () => {
  assert.equal(validateImageSelection([localImage()]), undefined);
  assert.ok(validateImageSelection(Array.from({ length: 6 }, (_, i) => localImage(`${i}.png`))));
});

test("baños vacío es válido y permanece undefined; cero es un valor explícito válido", () => {
  for (const bathrooms of ["", "   "]) {
    const values = validProperty({ bathrooms });
    assert.equal(validatePropertyForm(values).bathrooms, undefined);
    assert.equal(toPropertyInput(values)?.data.bathrooms, undefined);
  }
  assert.equal(toPropertyInput(validProperty({ bathrooms: "0" }))?.data.bathrooms, 0);
});

test("opcionales vacíos no se convierten en NaN ni en cero", () => {
  const input = toPropertyInput(validProperty());
  assert.ok(input);
  for (const field of ["bedrooms", "bathrooms", "age", "garage", "expenses", "taxes", "commissions"] as const) {
    assert.equal(input.data[field], undefined);
    assert.equal(Number.isNaN(input.data[field]), false);
  }
  assert.equal(input.data.location.street, undefined);
  assert.equal(input.data.location.number, undefined);
  assert.equal(input.data.propertyCondition, undefined);
  assert.equal(input.data.acceptsPets, undefined);
});

test("rechaza precio negativo, cero y entradas numéricas inválidas", () => {
  for (const price of ["-1", "0", "abc", "NaN", "Infinity", "0x10", "1e3", "1.2.3"]) {
    const values = validProperty({ price });
    assert.ok(validatePropertyForm(values).price);
    assert.equal(toPropertyInput(values), undefined);
  }
});

test("rechaza superficies inválidas y acepta decimales con coma o punto", () => {
  for (const totalArea of ["-10", "0", "abc", "Infinity", "1,2,3"]) {
    assert.ok(validatePropertyForm(validProperty({ totalArea })).totalArea);
  }
  for (const totalArea of ["120.5", "120,5"]) {
    assert.equal(toPropertyInput(validProperty({ totalArea }))?.data.totalArea, 120.5);
  }
});

test("cada campo obligatorio ausente o con espacios genera un error asociado", () => {
  for (const field of ["title", "description", "operationType", "propertyType", "price", "currency", "province", "city", "totalArea", "rooms"] as const) {
    assert.ok(validatePropertyForm(validProperty({ [field]: "" }))[field], field);
  }
  assert.ok(validatePropertyForm(validProperty({ title: "   ", description: "  " })).title);
  assert.ok(validatePropertyForm(validProperty({ title: "   ", description: "  " })).description);
});

test("cantidades y antigüedad requieren enteros no negativos; ambientes al menos uno", () => {
  for (const field of ["rooms", "bedrooms", "bathrooms", "garage", "age", "number"] as const) {
    for (const value of ["-1", "1.5", "abc"]) {
      assert.ok(validatePropertyForm(validProperty({ [field]: value }))[field], field);
    }
  }
  assert.ok(validatePropertyForm(validProperty({ rooms: "0" })).rooms);
});

test("importes opcionales aceptan vacío, cero y decimales; rechazan negativos y texto", () => {
  for (const field of ["expenses", "taxes", "commissions"] as const) {
    for (const value of ["", "   ", "0", "123,50", "123.50"]) {
      assert.equal(validatePropertyForm(validProperty({ [field]: value }))[field], undefined);
    }
    for (const value of ["-1", "abc", "NaN"]) {
      assert.ok(validatePropertyForm(validProperty({ [field]: value }))[field]);
      assert.equal(toPropertyInput(validProperty({ [field]: value })), undefined);
    }
  }
});

test("normaliza números y conserva identificadores internos, comodidades y estado físico", () => {
  const input = toPropertyInput(validProperty({
    title: " Casa ", price: "120000,50", rooms: "3", bedrooms: "2", bathrooms: "1",
    garage: "2", age: "0", expenses: "1500,50", taxes: "0", commissions: "250.75",
    services: ["water", "electricity", "gas"], amenities: ["balcony", "large_patio"], propertyCondition: "new",
  }));
  assert.ok(input);
  assert.equal(input.data.title, "Casa");
  assert.equal(input.data.price, 120000.5);
  assert.equal(input.data.rooms, 3);
  assert.equal(input.data.bedrooms, 2);
  assert.equal(input.data.bathrooms, 1);
  assert.equal(input.data.garage, 2);
  assert.equal(input.data.age, 0);
  assert.equal(input.data.expenses, 1500.5);
  assert.equal(input.data.taxes, 0);
  assert.equal(input.data.commissions, 250.75);
  assert.equal(input.data.operationType, "sale");
  assert.equal(input.data.propertyType, "house");
  assert.equal(input.data.propertyCondition, "new");
  assert.deepEqual(input.data.services, ["water", "electricity", "gas"]);
  assert.deepEqual(input.data.amenities, ["balcony", "large_patio"]);
  assert.equal("publicationStatus" in input.data, false);
  assert.equal("id" in input.data, false);
});

test("todas las operaciones y monedas centralizadas son válidas", () => {
  for (const operationType of Object.keys(OPERATION_TYPES)) {
    for (const currency of CURRENCIES) {
      // Simulate the string received from an HTML select, without a type assertion.
      const values = Object.assign(validProperty(), { operationType, currency });
      assert.equal(Object.values(validatePropertyForm(values)).some(Boolean), false);
    }
  }
  const invalid = Object.assign(validProperty(), { operationType: "Venta", propertyType: "Casa", currency: "EUR", propertyCondition: "active" });
  const errors = validatePropertyForm(invalid);
  assert.ok(errors.operationType);
  assert.ok(errors.propertyType);
  assert.ok(errors.currency);
  assert.ok(errors.propertyCondition);
});

test("mascotas distingue sí, no y no especificado", () => {
  assert.equal(toPropertyInput(validProperty({ acceptsPets: "yes" }))?.data.acceptsPets, true);
  assert.equal(toPropertyInput(validProperty({ acceptsPets: "no" }))?.data.acceptsPets, false);
  assert.equal(toPropertyInput(validProperty({ acceptsPets: "" }))?.data.acceptsPets, undefined);
});

test("provincia y localidad deben corresponder; cambiar provincia limpia localidades incompatibles", () => {
  const values = validProperty();
  assert.ok(validatePropertyForm({ ...values, city: "Ciudad 1" }).city);
  assert.ok(validatePropertyForm({ ...values, city: "Rosario" }).city);
  assert.ok(validatePropertyForm({ ...values, province: "Provincia ficticia" }).province);
  assert.equal(changePropertyProvince(values, "Córdoba").city, "Córdoba");
  const changed = changePropertyProvince(values, "Santa Fe");
  assert.equal(changed.city, "");
  assert.equal(validatePropertyForm({ ...changed, city: "Rosario" }).city, undefined);
});

test("edición inicializa desde Property sin inventar superficie ni ambientes desconocidos", () => {
  for (const property of mockProperties) {
    const values = createPropertyFormValues(property);
    const errors = validatePropertyForm(values);
    assert.equal(values.title, property.title);
    assert.equal(values.price, property.price.toString());
    assert.equal(values.rooms, property.rooms?.toString() ?? "");
    assert.equal(values.totalArea, property.totalArea?.toString() ?? "");
    assert.equal(errors.province, undefined);
    assert.equal(errors.city, undefined);
    if (property.rooms === null) assert.ok(errors.rooms);
    if (property.totalArea === null) assert.ok(errors.totalArea);
    assert.deepEqual(values.images.map((image) => image.kind === "existing" ? image.url : undefined), property.images);
    assert.notEqual(values.services, property.services);
    assert.notEqual(values.amenities, property.amenities);
  }
});

test("edición combina imágenes existentes y archivos nuevos sin convertirlos en URLs persistentes", () => {
  const existing: PropertyFormImage = { kind: "existing", id: "existing-0", url: "https://example.com/image.jpg" };
  const fresh = localImage();
  const values = validProperty({ images: [existing, fresh] });
  assert.equal(validatePropertyForm(values).images, undefined);
  const input = toPropertyInput(values);
  assert.ok(input);
  assert.deepEqual(input.images, [existing, fresh]);
  assert.equal("images" in input.data, false);
  assert.ok(validatePropertyForm({ ...values, images: [fresh] }).images);
  assert.ok(validatePropertyForm({ ...values, images: [existing, localImage("bad.gif", "image/gif")] }).images);
  assert.ok(validatePropertyForm({ ...values, images: [{ ...existing, url: "" }, fresh] }).images);
});

test("preparar un envío no modifica Property ni sus datos originales", () => {
  const property = mockProperties.find((item) => item.id === 1);
  assert.ok(property);
  const before = structuredClone(property);
  const values = createPropertyFormValues({ ...property, totalArea: 100, rooms: 4, acceptsPets: false });
  assert.equal(values.acceptsPets, "no");
  values.services.push("water");
  values.images.pop();
  const input = toPropertyInput(values);
  assert.ok(input);
  input.data.services.push("gas");
  input.images.pop();
  assert.deepEqual(property, before);
  assert.deepEqual(values.services, ["water"]);
  assert.equal(values.images.length, 2);
});
