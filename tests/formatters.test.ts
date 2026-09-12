import { test } from "node:test";
import assert from "node:assert/strict";
import { formatCharacteristics, formatLocation, formatPrice } from "../src/lib/formatters.ts";
import { propertyService } from "../src/services/propertyService.ts";

test("el precio conserva la presentación previa sin almacenarse formateado", () => {
  assert.equal(formatPrice(120000, "USD"), "USD $120,000");
  assert.equal(formatPrice(1000000, "ARS"), "ARS $1,000,000");
  assert.equal(formatPrice(850.5, "USD"), "USD $850.5");
});

test("ubicación y características conservan los textos de las tarjetas", async () => {
  const house = await propertyService.getPropertyById("1");
  const apartment = await propertyService.getPropertyById("6");
  assert.ok(house);
  assert.ok(apartment);
  assert.equal(formatLocation(house.location), "Córdoba, Argentina");
  assert.equal(formatCharacteristics(house).join(", "), "3 habitaciones, 2 baños, 150m², patio grande");
  assert.equal(formatCharacteristics(apartment).join(", "), "1 habitación, 1 baño, 50m²");
});

test("las características distinguen ambientes de dormitorios y omiten datos ausentes", async () => {
  const property = await propertyService.getPropertyById("1");
  assert.ok(property);
  delete property.bedrooms;
  delete property.bathrooms;
  property.amenities = [];
  property.totalArea = 100;
  property.rooms = 2;
  assert.deepEqual(formatCharacteristics(property), ["2 ambientes", "100m²"]);
  property.rooms = 1;
  assert.deepEqual(formatCharacteristics(property), ["1 ambiente", "100m²"]);
});
