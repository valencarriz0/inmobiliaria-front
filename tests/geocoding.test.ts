import { test } from "node:test";
import assert from "node:assert/strict";
import { coordinatesFromMatch, hasValidCoordinates, invalidateConfirmedCoordinates } from "../src/lib/geocoding.ts";
import { createPropertyFormValues, toPropertyInput } from "../src/lib/property-form.ts";
import type { PropertyFormValues } from "../src/types/property-form.ts";

test("acepta únicamente pares de coordenadas finitos dentro de los rangos geográficos", () => {
  assert.equal(hasValidCoordinates(-34.6037, -58.3816), true);
  assert.equal(hasValidCoordinates(91, 0), false);
  assert.equal(hasValidCoordinates(0, -181), false);
  assert.equal(hasValidCoordinates(0, Number.NaN), false);
  assert.equal(hasValidCoordinates(0, null), false);
});

test("un cambio de dirección invalida solamente la confirmación y las coordenadas", () => {
  const result = invalidateConfirmedCoordinates({ latitude: -34.6, longitude: -58.4, locationConfirmed: true, street: "Avenida Siempre Viva", number: "742" });
  assert.deepEqual(result, { latitude: null, longitude: null, locationConfirmed: false, street: "Avenida Siempre Viva", number: "742" });
});

test("un resultado válido conserva latitud y longitud para su confirmación", () => {
  assert.deepEqual(coordinatesFromMatch({ latitude: -34.6037, longitude: -58.3816, displayName: "CABA", boundingBox: null }), { latitude: -34.6037, longitude: -58.3816 });
  assert.equal(coordinatesFromMatch({ latitude: 100, longitude: -58.3816, displayName: "Inválido", boundingBox: null }), undefined);
});

test("el envío conserva coordenadas sólo cuando la ubicación fue confirmada", () => {
  const values: PropertyFormValues = {
    ...createPropertyFormValues(),
    title: "Casa", description: "Casa con patio", operationType: "sale", propertyType: "house", price: "120000", currency: "USD",
    province: "Córdoba", city: "Córdoba", totalArea: "120", rooms: "3",
    images: [
      { kind: "existing", id: "one", url: "https://example.com/one.jpg" },
      { kind: "existing", id: "two", url: "https://example.com/two.jpg" },
    ],
    latitude: -34.6037, longitude: -58.3816, locationConfirmed: true,
  };
  const input = toPropertyInput(values);
  assert.equal(input?.data.latitude, -34.6037);
  assert.equal(input?.data.longitude, -58.3816);
  assert.equal(toPropertyInput({ ...values, locationConfirmed: false })?.data.latitude, undefined);
  assert.equal(toPropertyInput({ ...values, locationConfirmed: false })?.data.longitude, undefined);
});
