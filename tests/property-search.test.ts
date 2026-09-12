import { test } from "node:test";
import assert from "node:assert/strict";
import {
  changePropertySearchProvince, createPropertySearchValues, getPropertySearchCities, parsePropertySearchParams,
  readPropertySearchValues, serializePropertySearchFilters, toPropertySearchFilters, validatePropertySearch,
} from "../src/lib/property-search.ts";
import { OPERATION_TYPES } from "../src/constants/property.ts";
import type { PropertySearchFilters, PropertySearchValues } from "../src/types/property-search.ts";

const validCases: { name: string; values: Partial<PropertySearchValues>; filters: PropertySearchFilters }[] = [
  { name: "sin filtros, sin precios y sin moneda", values: {}, filters: {} },
  { name: "precios vacíos o con espacios", values: { minPrice: "", maxPrice: "  " }, filters: {} },
  { name: "mínimo vacío", values: { currency: "USD", minPrice: "", maxPrice: "200000" }, filters: { currency: "USD", maxPrice: 200000 } },
  { name: "máximo vacío", values: { currency: "ARS", minPrice: "100000", maxPrice: "" }, filters: { currency: "ARS", minPrice: 100000 } },
  { name: "rango con moneda sin categoría", values: { currency: "USD", minPrice: "100000", maxPrice: "200000" }, filters: { currency: "USD", minPrice: 100000, maxPrice: 200000 } },
  { name: "moneda sin rango USD", values: { currency: "USD" }, filters: { currency: "USD" } },
  { name: "moneda sin rango ARS", values: { currency: "ARS" }, filters: { currency: "ARS" } },
  { name: "cero y límites iguales", values: { currency: "ARS", minPrice: "0", maxPrice: "0" }, filters: { currency: "ARS", minPrice: 0, maxPrice: 0 } },
  { name: "precios decimales con coma y punto", values: { currency: "USD", minPrice: " 100,50 ", maxPrice: "200.25" }, filters: { currency: "USD", minPrice: 100.5, maxPrice: 200.25 } },
  { name: "provincia sin ciudad", values: { province: "Córdoba" }, filters: { province: "Córdoba" } },
  { name: "ciudad sin provincia", values: { city: "La Plata" }, filters: { city: "La Plata" } },
];
for (const { name, values, filters } of validCases) {
  test(`validación de búsqueda acepta ${name}`, () => {
    const draft = { ...createPropertySearchValues(), ...values };
    assert.deepEqual(validatePropertySearch(draft), {});
    assert.deepEqual(toPropertySearchFilters(draft), filters);
  });
}

for (const [name, prices] of [
  ["mínimo", { minPrice: "0" }], ["máximo", { maxPrice: "100000" }], ["rango completo", { minPrice: "100000", maxPrice: "200000" }],
] as const) {
  test(`validación requiere moneda con ${name}`, () => {
    const values = { ...createPropertySearchValues(), ...prices };
    assert.equal(validatePropertySearch(values).currency, "Seleccioná una moneda para filtrar por precio.");
    assert.equal(toPropertySearchFilters(values), undefined);
  });
}

for (const field of ["minPrice", "maxPrice"] as const) {
  test(`validación rechaza ${field} negativo`, () => {
    assert.ok(validatePropertySearch({ ...createPropertySearchValues({ currency: "USD" }), [field]: "-0.01" })[field]);
  });
  test(`validación rechaza ${field} no numérico, no finito o con formato ambiguo`, () => {
    for (const value of ["abc", "NaN", "Infinity", "1e309", "1e3", "0x10", "1.2.3", "100.000,50", "1,2,3", "9".repeat(400)]) {
      const values = { ...createPropertySearchValues({ currency: "USD" }), [field]: value };
      assert.ok(validatePropertySearch(values)[field], value);
      assert.equal(toPropertySearchFilters(values), undefined);
    }
  });
}

test("validación explica el rango invertido", () => {
  const values = createPropertySearchValues({ currency: "USD", minPrice: 200000, maxPrice: 100000 });
  assert.equal(validatePropertySearch(values).maxPrice, "El precio máximo debe ser mayor o igual al mínimo.");
  assert.equal(toPropertySearchFilters(values), undefined);
});

test("validación rechaza opciones ajenas al dominio y ubicaciones incompatibles", () => {
  for (const values of [
    { operationType: "Venta" }, { operationType: "banana" }, { operationType: "toString" },
    { propertyType: "Casa" }, { currency: "XXX" }, { province: "Provincia ficticia" },
    { city: "Ciudad ficticia" }, { province: "Córdoba", city: "Rosario" },
  ]) {
    assert.equal(toPropertySearchFilters({ ...createPropertySearchValues(), ...values }), undefined);
  }
});

test("cambiar provincia actualiza localidades y limpia solamente la incompatible", () => {
  const values = createPropertySearchValues({ province: "Córdoba", city: "Córdoba", currency: "USD", minPrice: 0 });
  assert.deepEqual(changePropertySearchProvince(values, "Córdoba"), values);
  const changed = changePropertySearchProvince(values, "Santa Fe");
  assert.equal(changed.city, "");
  assert.equal(changed.currency, "USD");
  assert.equal(changed.minPrice, "0");
  assert.deepEqual(getPropertySearchCities(changed.province), ["Rosario", "Santa Fe", "Rafaela"]);
  assert.deepEqual(validatePropertySearch({ ...changed, city: "Rosario" }), {});
  assert.equal(changePropertySearchProvince(values, "").city, "");
  assert.deepEqual(getPropertySearchCities("banana"), []);
  assert.ok(getPropertySearchCities("").includes("La Plata"));
  assert.equal(values.city, "Córdoba");
});

const completeFilters: PropertySearchFilters = {
  operationType: "sale", propertyType: "house", province: "Córdoba", city: "Villa Carlos Paz", currency: "USD", minPrice: 100000.5, maxPrice: 200000,
};

test("filtros a query params usa claves internas y codifica las ubicaciones", () => {
  assert.equal(serializePropertySearchFilters(completeFilters).toString(),
    "operation=sale&type=house&province=C%C3%B3rdoba&city=Villa+Carlos+Paz&currency=USD&minPrice=100000.5&maxPrice=200000");
});

test("query params a filtros recupera todos los criterios y precios numéricos", () => {
  const params = new URLSearchParams("operation=sale&type=house&province=Córdoba&city=Villa+Carlos+Paz&currency=USD&minPrice=100000.5&maxPrice=200000");
  assert.deepEqual(parsePropertySearchParams(params), completeFilters);
  assert.deepEqual(parsePropertySearchParams(serializePropertySearchFilters(completeFilters)), completeFilters);
});

for (const operationType of ["sale", "rent", "temporary_rent"] as const) {
  test(`URL conserva la categoría ${OPERATION_TYPES[operationType]}`, () => {
    const params = serializePropertySearchFilters({ operationType });
    assert.equal(params.get("operation"), operationType);
    assert.deepEqual(parsePropertySearchParams(params), { operationType });
  });
}

for (const currency of ["ARS", "USD"] as const) {
  test(`URL conserva ${currency} con y sin precios`, () => {
    assert.deepEqual(parsePropertySearchParams(new URLSearchParams({ currency })), { currency });
    assert.deepEqual(parsePropertySearchParams(new URLSearchParams({ currency, minPrice: "0", maxPrice: "100,50" })), { currency, minPrice: 0, maxPrice: 100.5 });
  });
}

for (const query of [
  "operation=banana", "type=banana", "currency=XXX", "currency=USD&minPrice=abc", "currency=ARS&maxPrice=Infinity",
  "currency=USD&minPrice=-1", "currency=USD&minPrice=2&maxPrice=1", "minPrice=0", "maxPrice=100000",
  "province=banana", "province=Córdoba&city=Rosario", "city=Ciudad+1", "operation=__proto__",
]) {
  test(`URL inválida queda controlada sin ejecutar una búsqueda: ${query}`, () => {
    const params = new URLSearchParams(query);
    assert.equal(parsePropertySearchParams(params), undefined);
    assert.ok(Object.values(validatePropertySearch(readPropertySearchValues(params))).some(Boolean));
  });
}

test("URL inválida conserva el valor para corregirlo en el formulario", () => {
  const params = new URLSearchParams("currency=USD&minPrice=abc");
  const values = readPropertySearchValues(params);
  assert.equal(values.minPrice, "abc");
  assert.deepEqual(toPropertySearchFilters({ ...values, minPrice: "100" }), { currency: "USD", minPrice: 100 });
});

test("limpiar produce filtros, valores y parámetros vacíos", () => {
  const current = serializePropertySearchFilters(completeFilters);
  const cleared = serializePropertySearchFilters({}, current);
  assert.equal(cleared.toString(), "");
  assert.deepEqual(parsePropertySearchParams(cleared), {});
  assert.deepEqual(readPropertySearchValues(cleared), createPropertySearchValues());
  assert.deepEqual(validatePropertySearch(readPropertySearchValues(cleared)), {});
  assert.deepEqual(parsePropertySearchParams(current), completeFilters);
});

test("serializar reemplaza filtros duplicados y conserva parámetros ajenos sin mutarlos", () => {
  const params = new URLSearchParams("operation=rent&operation=sale&currency=ARS&campaign=academic");
  const updated = serializePropertySearchFilters({ currency: "USD" }, params);
  assert.equal(updated.toString(), "campaign=academic&currency=USD");
  assert.equal(serializePropertySearchFilters({}, updated).toString(), "campaign=academic");
  assert.equal(params.toString(), "operation=rent&operation=sale&currency=ARS&campaign=academic");
  assert.deepEqual(parsePropertySearchParams(new URLSearchParams("campaign=academic")), {});
});

test("URL con criterios vacíos o espacios equivale a una búsqueda vacía", () => {
  assert.deepEqual(parsePropertySearchParams(new URLSearchParams("operation=&province=++&currency=&minPrice=++&maxPrice=")), {});
});

test("los límites numéricos pequeños y grandes conservan su valor al confirmar y recargar", () => {
  for (const minPrice of [0.0000001, Number.MIN_VALUE, 1e21, Number.MAX_VALUE]) {
    const filters: PropertySearchFilters = { currency: "USD", minPrice };
    assert.deepEqual(toPropertySearchFilters(createPropertySearchValues(filters)), filters);
    assert.deepEqual(parsePropertySearchParams(serializePropertySearchFilters(filters)), filters);
  }
});
