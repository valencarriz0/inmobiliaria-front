import type { Property } from "./property.ts";

export type EditablePropertyData = Pick<Property,
  | "title" | "description" | "operationType" | "propertyType" | "price" | "currency"
  | "location" | "totalArea" | "rooms" | "bedrooms" | "bathrooms" | "age"
  | "propertyCondition" | "services" | "amenities" | "acceptsPets" | "garage"
  | "expenses" | "taxes" | "commissions" | "latitude" | "longitude"
>;

export type PropertyImageInput =
  | { kind: "existing"; url: string }
  | { kind: "new"; file: File };

// Full replacement of editable fields. Server-owned metadata cannot be submitted.
export interface CreatePropertyInput {
  data: EditablePropertyData;
  images: PropertyImageInput[];
}

export type UpdatePropertyInput = CreatePropertyInput;
