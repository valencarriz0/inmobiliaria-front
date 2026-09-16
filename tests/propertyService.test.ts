import { afterEach, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { createPropertyService } from "../src/services/propertyService.ts";
import { createMockPropertyStore, type MockPropertyStore } from "../src/data/mock/property-store.ts";
import { mockProperties } from "../src/data/mock/properties.ts";
import { MOCK_CURRENT_PUBLISHER_ID } from "../src/data/mock/session.ts";
import { createPropertyFormValues, toPropertyInput } from "../src/lib/property-form.ts";
import { validatePropertyForm } from "../src/lib/validation.ts";
import type { CreatePropertyInput } from "../src/types/property-input.ts";

let store: MockPropertyStore;
let service: ReturnType<typeof createPropertyService>;

beforeEach(() => {
  store = createMockPropertyStore(mockProperties);
  service = createPropertyService(store);
});
afterEach(() => store.dispose());

function input(): CreatePropertyInput {
  return {
    data: {
      title: "Casa nueva", description: "Casa con patio y mucha luz", operationType: "sale", propertyType: "house",
      price: 125000, currency: "USD", location: { country: "Argentina", province: "Córdoba", city: "Córdoba" },
      totalArea: 150, rooms: 4, bathrooms: 2, services: ["water"], amenities: ["large_patio"],
    },
    images: [
      { kind: "existing", url: "https://example.com/front.jpg" },
      { kind: "existing", url: "https://example.com/patio.png" },
    ],
  };
}

test("lectura interna devuelve copias y el seed cumple todas las reglas del formulario", async () => {
  const result = service.getAllInternal();
  assert.ok(result instanceof Promise);
  const properties = await result;
  assert.equal(properties.length, mockProperties.length);
  assert.equal(new Set(properties.map((property) => property.id)).size, properties.length);
  for (const property of properties) {
    assert.equal(Object.values(validatePropertyForm(createPropertyFormValues(property))).some(Boolean), false);
    assert.equal(typeof property.id, "string");
    assert.ok(property.totalArea > 0);
    assert.ok(property.rooms >= 1);
  }
});

test("getPublicProperties devuelve únicamente active", async () => {
  const properties = await service.getPublicProperties();
  assert.ok(properties.length > 0);
  assert.ok(properties.every((property) => property.publicationStatus === "active"));
  assert.ok(!properties.some((property) => property.id === "2"));
});

test("detalle público devuelve la propiedad active solicitada", async () => {
  const property = await service.getPublicPropertyById("1");
  assert.ok(property);
  assert.equal(property.id, "1");
});

test("paused y deleted no se obtienen como detalle público", async () => {
  assert.equal(await service.getPublicPropertyById("2"), undefined);
  await service.softDeleteProperty("1");
  assert.equal(await service.getPublicPropertyById("1"), undefined);
});

test("getPropertyById devuelve el ID correcto, incluso si está pausado", async () => {
  const property = await service.getPropertyById("2");
  assert.ok(property);
  assert.equal(property.id, "2");
  assert.equal(property.title, "Departamento moderno");
  assert.equal(property.publicationStatus, "paused");
});

test("ID inexistente o inválido devuelve undefined sin fallback", async () => {
  for (const id of ["", "999999", "-1", "NaN", "no-existe", "1.0", "01"]) {
    assert.equal(await service.getPropertyById(id), undefined);
    assert.equal(await service.getPublicPropertyById(id), undefined);
  }
});

test("create asigna UUID único, publicador explícito, active y fechas ISO", async () => {
  const first = await service.createProperty(input(), MOCK_CURRENT_PUBLISHER_ID);
  const second = await service.createProperty(input(), 2);
  assert.match(first.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.notEqual(first.id, second.id);
  assert.equal(first.publisherId, MOCK_CURRENT_PUBLISHER_ID);
  assert.equal(second.publisherId, 2);
  assert.equal(first.publicationStatus, "active");
  assert.equal(new Date(first.createdAt).toISOString(), first.createdAt);
  assert.equal(first.createdAt, first.updatedAt);
});

test("la creación se recupera desde el mismo service y aparece en ambos listados", async () => {
  const created = await service.createProperty(input(), MOCK_CURRENT_PUBLISHER_ID);
  assert.deepEqual(await service.getPropertyById(created.id), created);
  assert.deepEqual(await service.getPublicPropertyById(created.id), created);
  assert.ok((await service.getPublicProperties()).some((property) => property.id === created.id));
  assert.ok((await service.getPropertiesByPublisher(MOCK_CURRENT_PUBLISHER_ID)).some((property) => property.id === created.id));
});

test("crear y editar conserva coordenadas confirmadas válidas hasta el detalle", async () => {
  const submission = input();
  const coordinates = { latitude: -34.6037, longitude: -58.3816 };
  const created = await service.createProperty({ ...submission, data: { ...submission.data, ...coordinates } }, MOCK_CURRENT_PUBLISHER_ID);
  assert.deepEqual(await service.getPropertyById(created.id), created);
  assert.equal(created.latitude, coordinates.latitude);
  assert.equal(created.longitude, coordinates.longitude);

  const updatedCoordinates = { latitude: -34.6118, longitude: -58.3960 };
  const updated = await service.updateProperty(created.id, { ...submission, data: { ...submission.data, ...updatedCoordinates } });
  assert.equal(updated.latitude, updatedCoordinates.latitude);
  assert.equal(updated.longitude, updatedCoordinates.longitude);
  assert.equal((await service.getPropertyById(updated.id))?.latitude, updatedCoordinates.latitude);
  assert.equal((await service.getPropertyById(updated.id))?.longitude, updatedCoordinates.longitude);
});

test("create ignora metadatos inyectados fuera del tipo de entrada", async () => {
  const submission = input();
  const data = { ...submission.data, id: "injected", publisherId: 999, publicationStatus: "deleted", createdAt: "bad", updatedAt: "bad", latitude: 999 };
  const created = await service.createProperty({ ...submission, data }, 1);
  assert.notEqual(created.id, data.id);
  assert.equal(created.publisherId, 1);
  assert.equal(created.publicationStatus, "active");
  assert.notEqual(created.createdAt, data.createdAt);
  assert.notEqual(created.updatedAt, data.updatedAt);
  assert.equal(created.latitude, undefined);
});

test("create rechaza datos inválidos sin modificar el store", async () => {
  const before = await service.getAllInternal();
  const submission = input();
  await assert.rejects(service.createProperty({ ...submission, data: { ...submission.data, price: -1 } }, 1));
  await assert.rejects(service.createProperty({ ...submission, images: submission.images.slice(0, 1) }, 1));
  await assert.rejects(service.createProperty(submission, 0));
  assert.deepEqual(await service.getAllInternal(), before);
});

test("update modifica campos editables y permite limpiar opcionales", async () => {
  const submission = input();
  const updated = await service.updateProperty("1", { ...submission, data: { ...submission.data, price: 222000, description: "Descripción actualizada", bathrooms: undefined } });
  assert.equal(updated.price, 222000);
  assert.equal(updated.description, "Descripción actualizada");
  assert.equal(updated.bathrooms, undefined);
  assert.deepEqual(await service.getPropertyById("1"), updated);
  assert.deepEqual((await service.getPublicPropertyById("1"))?.description, updated.description);
});

test("update conserva identidad, publicador, createdAt y estado pausado aunque se inyecten campos", async () => {
  const original = await service.getPropertyById("2");
  assert.ok(original);
  const submission = input();
  const data = { ...submission.data, id: "otra", publisherId: 999, createdAt: "bad", publicationStatus: "active" };
  const updated = await service.updateProperty("2", { ...submission, data });
  assert.equal(updated.id, original.id);
  assert.equal(updated.publisherId, original.publisherId);
  assert.equal(updated.createdAt, original.createdAt);
  assert.equal(updated.publicationStatus, original.publicationStatus);
  assert.equal(await service.getPublicPropertyById("2"), undefined);
});

test("update avanza updatedAt incluso inmediatamente después de crear", async () => {
  const created = await service.createProperty(input(), 1);
  const updated = await service.updateProperty(created.id, input());
  assert.ok(Date.parse(updated.updatedAt) > Date.parse(created.updatedAt));
  assert.equal(new Date(updated.updatedAt).toISOString(), updated.updatedAt);
});

test("pause cambia active a paused y lo oculta públicamente, conservándolo para su publicador", async () => {
  const original = await service.getPropertyById("1");
  assert.ok(original);
  const paused = await service.pauseProperty("1");
  assert.equal(paused.publicationStatus, "paused");
  assert.ok(Date.parse(paused.updatedAt) > Date.parse(original.updatedAt));
  assert.equal(await service.getPublicPropertyById("1"), undefined);
  assert.ok(!(await service.getPublicProperties()).some((property) => property.id === "1"));
  assert.ok((await service.getPropertiesByPublisher(1)).some((property) => property.id === "1"));
});

test("reactivate cambia paused a active y lo devuelve al catálogo público", async () => {
  const original = await service.getPropertyById("2");
  assert.ok(original);
  const active = await service.reactivateProperty("2");
  assert.equal(active.publicationStatus, "active");
  assert.ok(Date.parse(active.updatedAt) > Date.parse(original.updatedAt));
  assert.deepEqual(await service.getPublicPropertyById("2"), active);
  assert.ok((await service.getPublicProperties()).some((property) => property.id === "2"));
});

test("soft delete conserva el registro y sus imágenes internamente, excluyéndolo de ambos listados", async () => {
  const original = await service.getPropertyById("1");
  assert.ok(original);
  const count = (await service.getAllInternal()).length;
  const deleted = await service.softDeleteProperty("1");
  assert.equal(deleted.publicationStatus, "deleted");
  assert.ok(Date.parse(deleted.updatedAt) > Date.parse(original.updatedAt));
  assert.equal((await service.getAllInternal()).length, count);
  assert.deepEqual(await service.getPropertyById("1"), deleted);
  assert.deepEqual(deleted.images, original.images);
  assert.equal(await service.getPublicPropertyById("1"), undefined);
  assert.ok(!(await service.getPublicProperties()).some((property) => property.id === "1"));
  assert.ok(!(await service.getPropertiesByPublisher(1)).some((property) => property.id === "1"));
});

test("getPropertiesByPublisher filtra por publicador y admite active y paused", async () => {
  const properties = await service.getPropertiesByPublisher(MOCK_CURRENT_PUBLISHER_ID);
  assert.ok(properties.length > 0);
  assert.ok(properties.every((property) => property.publisherId === MOCK_CURRENT_PUBLISHER_ID));
  assert.ok(properties.some((property) => property.publicationStatus === "active"));
  assert.ok(properties.some((property) => property.publicationStatus === "paused"));
  const others = await service.getPropertiesByPublisher(2);
  assert.ok(others.length > 0);
  assert.ok(others.every((property) => property.publisherId === 2));
  assert.deepEqual(await service.getPropertiesByPublisher(999), []);
});

test("modificar una propiedad no cambia otra ni el seed", async () => {
  const before = structuredClone(mockProperties);
  const other = await service.getPropertyById("2");
  await service.updateProperty("1", input());
  await service.pauseProperty("1");
  assert.deepEqual(await service.getPropertyById("2"), other);
  assert.deepEqual(mockProperties, before);
});

test("todas las escrituras sobre ID inexistente rechazan la operación sin modificar datos", async () => {
  const before = await service.getAllInternal();
  for (const action of [
    () => service.updateProperty("missing", input()),
    () => service.pauseProperty("missing"),
    () => service.reactivateProperty("missing"),
    () => service.softDeleteProperty("missing"),
  ]) await assert.rejects(action, /no está disponible/);
  assert.deepEqual(await service.getAllInternal(), before);
});

test("una eliminada no se puede editar, pausar, reactivar ni eliminar de nuevo", async () => {
  const deleted = await service.softDeleteProperty("1");
  for (const action of [
    () => service.updateProperty("1", input()),
    () => service.pauseProperty("1"),
    () => service.reactivateProperty("1"),
    () => service.softDeleteProperty("1"),
  ]) await assert.rejects(action, /no está disponible/);
  assert.deepEqual(await service.getPropertyById("1"), deleted);
});

test("repetir el estado actual es una operación sin cambios", async () => {
  const active = await service.getPropertyById("1");
  const paused = await service.getPropertyById("2");
  assert.deepEqual(await service.reactivateProperty("1"), active);
  assert.deepEqual(await service.pauseProperty("2"), paused);
});

test("mutar entradas y respuestas no altera los datos compartidos", async () => {
  const submission = input();
  const created = await service.createProperty(submission, 1);
  const saved = structuredClone(created);
  submission.data.location.city = "Otra ciudad";
  submission.data.services.push("gas");
  submission.images.length = 0;
  created.location.city = "Cambio en respuesta";
  created.images.length = 0;
  assert.deepEqual(await service.getPropertyById(saved.id), saved);
  const all = await service.getAllInternal();
  const first = all.find((property) => property.id === saved.id);
  assert.ok(first);
  first.services.length = 0;
  all.length = 0;
  assert.deepEqual(await service.getPropertyById(saved.id), saved);
});

test("las imágenes File se convierten en URLs temporales que sobreviven a lecturas y edición", async () => {
  const submission = input();
  const file = new File(["image"], "casa.png", { type: "image/png" });
  submission.images[1] = { kind: "new", file };
  const created = await service.createProperty(submission, 1);
  assert.equal(created.images[0], "https://example.com/front.jpg");
  assert.match(created.images[1], /^blob:/);
  assert.deepEqual((await service.getPropertyById(created.id))?.images, created.images);
  const formInput = toPropertyInput(createPropertyFormValues(created));
  assert.ok(formInput);
  const updated = await service.updateProperty(created.id, formInput);
  assert.deepEqual(updated.images, created.images);
});

test("reemplazar archivos libera URLs sin uso; eliminar lógicamente conserva las referenciadas", async (context) => {
  const revoke = context.mock.method(URL, "revokeObjectURL", () => {});
  const submission = input();
  submission.images[1] = { kind: "new", file: new File(["image"], "casa.png", { type: "image/png" }) };
  const created = await service.createProperty(submission, 1);
  await service.updateProperty(created.id, input());
  assert.ok(revoke.mock.calls.some((call) => call.arguments[0] === created.images[1]));
  const other = await service.createProperty(submission, 1);
  const count = revoke.mock.callCount();
  await service.softDeleteProperty(other.id);
  assert.equal(revoke.mock.callCount(), count);
});

test("un fallo al preparar imágenes no deja una creación parcial y permite reintentar", async (context) => {
  const before = await service.getAllInternal();
  const submission = input();
  submission.images = [
    { kind: "new", file: new File(["first"], "1.png", { type: "image/png" }) },
    { kind: "new", file: new File(["second"], "2.png", { type: "image/png" }) },
  ];
  const revoke = context.mock.method(URL, "revokeObjectURL", () => {});
  let calls = 0;
  const create = context.mock.method(URL, "createObjectURL", () => {
    calls += 1;
    if (calls === 2) throw new Error("No se pudo preparar la imagen");
    return "blob:temporary-test";
  });
  await assert.rejects(service.createProperty(submission, 1), /preparar/);
  assert.deepEqual(await service.getAllInternal(), before);
  assert.ok(revoke.mock.calls.some((call) => call.arguments[0] === "blob:temporary-test"));
  create.mock.restore();
  const created = await service.createProperty(submission, 1);
  assert.ok(created.id);
});

test("una edición inválida no reemplaza datos ni imágenes previos", async () => {
  const before = await service.getPropertyById("1");
  const submission = input();
  submission.images[1] = { kind: "new", file: new File(["gif"], "bad.gif", { type: "image/gif" }) };
  await assert.rejects(service.updateProperty("1", submission));
  assert.deepEqual(await service.getPropertyById("1"), before);
});

test("el formulario y el service completan crear, editar, pausar, reactivar y eliminar", async () => {
  const draft = createPropertyFormValues();
  Object.assign(draft, {
    title: "Casa del recorrido", description: "Con patio", operationType: "sale", propertyType: "house",
    price: "120000,50", totalArea: "120", rooms: "3", province: "Córdoba", city: "Córdoba",
  });
  draft.images = input().images.map((image, index) => ({ ...image, id: `image-${index}` }));
  const submission = toPropertyInput(draft);
  assert.ok(submission);
  const created = await service.createProperty(submission, MOCK_CURRENT_PUBLISHER_ID);
  assert.equal(created.price, 120000.5);
  const edit = createPropertyFormValues(created);
  edit.description = "Descripción editada";
  const changes = toPropertyInput(edit);
  assert.ok(changes);
  await service.updateProperty(created.id, changes);
  assert.equal((await service.getPublicPropertyById(created.id))?.description, edit.description);
  await service.pauseProperty(created.id);
  assert.equal(await service.getPublicPropertyById(created.id), undefined);
  await service.reactivateProperty(created.id);
  assert.ok(await service.getPublicPropertyById(created.id));
  await service.softDeleteProperty(created.id);
  assert.equal((await service.getPropertyById(created.id))?.publicationStatus, "deleted");
  assert.ok(!(await service.getPropertiesByPublisher(MOCK_CURRENT_PUBLISHER_ID)).some((property) => property.id === created.id));
});
