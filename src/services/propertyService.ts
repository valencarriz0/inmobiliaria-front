import { mockProperties } from "../data/mock/properties.ts";
import { createMockPropertyStore, type MockPropertyStore } from "../data/mock/property-store.ts";
import { createPropertyFormValues, toPropertyInput } from "../lib/property-form.ts";
import type { Property, PublicationStatus } from "../types/property.ts";
import type { CreatePropertyInput, UpdatePropertyInput } from "../types/property-input.ts";

function normalizeInput(input: CreatePropertyInput): CreatePropertyInput {
  // Reuse the form rules and its explicit editable-field whitelist, including at runtime.
  const values = createPropertyFormValues({ ...input.data, images: [] });
  values.images = input.images.map((image, index) => ({ ...image, id: `input-${index}` }));
  const normalized = toPropertyInput(values);
  if (!normalized) throw new Error("Los datos de la propiedad no son válidos. Revisá los campos y las imágenes.");
  return normalized;
}

function nextUpdatedAt(property: Property): string {
  // Two operations in one millisecond must still produce a newer update timestamp.
  return new Date(Math.max(Date.now(), Date.parse(property.updatedAt) + 1)).toISOString();
}

// The factory gives tests independent stores; the app shares the singleton below.
export function createPropertyService(store: MockPropertyStore) {
  function requireProperty(id: Property["id"]): Property {
    const property = store.getById(id);
    if (!property || property.publicationStatus === "deleted") {
      throw new Error("La propiedad no está disponible.");
    }
    return property;
  }

  function changeStatus(id: Property["id"], status: PublicationStatus): Property {
    const property = requireProperty(id);
    if (property.publicationStatus === status) return property;
    return store.save({ ...property, publicationStatus: status, updatedAt: nextUpdatedAt(property) });
  }

  return {
    async getAllInternal(): Promise<Property[]> {
      return store.getAll();
    },
    async getPublicProperties(): Promise<Property[]> {
      return store.getAll().filter((property) => property.publicationStatus === "active");
    },
    async getPublicPropertyById(id: Property["id"]): Promise<Property | undefined> {
      const property = store.getById(id);
      return property?.publicationStatus === "active" ? property : undefined;
    },
    async getPropertyById(id: Property["id"]): Promise<Property | undefined> {
      return store.getById(id);
    },
    async getPropertiesByPublisher(publisherId: Property["publisherId"]): Promise<Property[]> {
      return store.getAll().filter((property) => property.publisherId === publisherId && property.publicationStatus !== "deleted");
    },
    async createProperty(input: CreatePropertyInput, publisherId: Property["publisherId"]): Promise<Property> {
      if (!Number.isSafeInteger(publisherId) || publisherId < 1) throw new Error("El publicador no es válido.");
      const normalized = normalizeInput(input);
      const now = new Date().toISOString();
      let id = crypto.randomUUID();
      while (store.getById(id)) id = crypto.randomUUID();
      return store.save({
        ...normalized.data,
        id,
        publisherId,
        publicationStatus: "active",
        createdAt: now,
        updatedAt: now,
        images: [],
      }, normalized.images);
    },
    async updateProperty(id: Property["id"], input: UpdatePropertyInput): Promise<Property> {
      const property = requireProperty(id);
      const normalized = normalizeInput(input);
      return store.save({ ...property, ...normalized.data, updatedAt: nextUpdatedAt(property) }, normalized.images);
    },
    async pauseProperty(id: Property["id"]): Promise<Property> {
      return changeStatus(id, "paused");
    },
    async reactivateProperty(id: Property["id"]): Promise<Property> {
      return changeStatus(id, "active");
    },
    async softDeleteProperty(id: Property["id"]): Promise<Property> {
      return changeStatus(id, "deleted");
    },
  };
}

export const propertyService = createPropertyService(createMockPropertyStore(mockProperties));
