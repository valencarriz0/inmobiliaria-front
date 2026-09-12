import { test } from "node:test";
import assert from "node:assert/strict";
import { propertyService } from "../src/services/propertyService.ts";

test("getAll devuelve una Promise con propiedades normalizadas", async () => {
  const result = propertyService.getAll();
  assert.ok(result instanceof Promise);
  const properties = await result;
  assert.ok(properties.length > 0);
  assert.equal(new Set(properties.map((property) => property.id)).size, properties.length);
  for (const property of properties) {
    assert.equal(typeof property.price, "number");
    assert.ok(property.price > 0);
    assert.ok(property.images.length > 0);
    assert.equal(typeof property.location.city, "string");
  }
});

test("getById devuelve la propiedad correspondiente", async () => {
  const result = propertyService.getById(2);
  assert.ok(result instanceof Promise);
  const property = await result;
  assert.ok(property);
  assert.equal(property.id, 2);
  assert.equal(property.title, "Departamento moderno");
  assert.equal(property.price, 1000000);
  assert.equal(property.currency, "ARS");
  assert.equal(property.operationType, "rent");
});

test("getById devuelve undefined para un ID inexistente o inválido", async () => {
  for (const id of [999999, -1, NaN]) {
    assert.equal(await propertyService.getById(id), undefined);
  }
});

test("las modificaciones de una respuesta no alteran la fuente ni otras lecturas", async () => {
  const original = await propertyService.getById(1);
  assert.ok(original);
  const properties = await propertyService.getAll();
  const property = properties.find((item) => item.id === original.id);
  assert.ok(property);
  property.title = "Cambio local";
  property.location.city = "Otra ciudad";
  property.images.length = 0;
  properties.length = 0;
  assert.deepEqual(await propertyService.getById(original.id), original);

  const detail = await propertyService.getById(original.id);
  assert.ok(detail);
  detail.location.city = "Cambio desde detalle";
  detail.images.push("https://example.com/local.jpg");
  assert.deepEqual((await propertyService.getAll()).find((item) => item.id === original.id), original);
});
