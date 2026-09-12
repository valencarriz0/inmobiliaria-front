import type { Property } from "../../types/property.ts";
import type { PropertyImageInput } from "../../types/property-input.ts";

// Session-only storage. Every read/write crosses a clone boundary like a JSON API.
export function createMockPropertyStore(seed: readonly Property[]) {
  const records = new Map(seed.map((property) => [property.id, structuredClone(property)]));
  const ownedUrls = new Set<string>();

  return {
    getAll(): Property[] {
      return structuredClone([...records.values()]);
    },
    getById(id: Property["id"]): Property | undefined {
      const property = records.get(id);
      return property ? structuredClone(property) : undefined;
    },
    save(property: Property, images?: readonly PropertyImageInput[]): Property {
      const record = structuredClone(property);
      const createdUrls: string[] = [];
      try {
        if (images) {
          record.images = images.map((image) => {
            if (image.kind === "existing") return image.url;
            const url = URL.createObjectURL(image.file);
            createdUrls.push(url);
            return url;
          });
        }
      } catch (error) {
        createdUrls.forEach((url) => URL.revokeObjectURL(url));
        throw error;
      }

      records.set(record.id, record);
      createdUrls.forEach((url) => ownedUrls.add(url));
      // Deleted records keep their images. Only unused/replaced local URLs are released.
      const referencedUrls = new Set([...records.values()].flatMap((item) => item.images));
      for (const url of ownedUrls) {
        if (!referencedUrls.has(url)) {
          URL.revokeObjectURL(url);
          ownedUrls.delete(url);
        }
      }
      return structuredClone(record);
    },
    // Used to dispose isolated stores in tests, never exposed by the application UI.
    dispose() {
      ownedUrls.forEach((url) => URL.revokeObjectURL(url));
      ownedUrls.clear();
      records.clear();
    },
  };
}

export type MockPropertyStore = ReturnType<typeof createMockPropertyStore>;
