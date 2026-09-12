import { mockProperties } from "../data/mock/properties.ts";
import type { Property } from "../types/property.ts";

export const propertyService = {
  async getAll(): Promise<Property[]> {
    // Return independent data, as a future JSON response would.
    return structuredClone(mockProperties);
  },

  async getById(id: Property["id"]): Promise<Property | undefined> {
    const property = mockProperties.find((item) => item.id === id);
    return property ? structuredClone(property) : undefined;
  },
};
