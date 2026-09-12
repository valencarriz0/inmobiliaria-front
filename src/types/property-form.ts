import type { Property } from "./property.ts";

export type PropertyFormImage =
  | { kind: "existing"; id: string; url: Property["images"][number] }
  | { kind: "new"; id: string; file: File };

type NumericField =
  | "price" | "totalArea" | "rooms" | "bedrooms" | "bathrooms"
  | "age" | "garage" | "expenses" | "taxes" | "commissions";

// Only editable domain data. Identity, publication state and server metadata stay out.
export type PropertyFormData = Pick<Property,
  | NumericField | "title" | "description" | "operationType" | "propertyType"
  | "currency" | "location" | "propertyCondition" | "services" | "amenities" | "acceptsPets"
> & { totalArea: number; rooms: number };

export type PropertyFormValues = {
  [K in NumericField]: string;
} & Pick<Property, "title" | "description" | "services" | "amenities"> & {
  operationType: Property["operationType"] | "";
  propertyType: Property["propertyType"] | "";
  currency: Property["currency"] | "";
  propertyCondition: NonNullable<Property["propertyCondition"]> | "";
  acceptsPets: "" | "yes" | "no";
  country: Property["location"]["country"];
  province: Property["location"]["province"];
  city: Property["location"]["city"];
  street: string;
  number: string;
  images: PropertyFormImage[];
};

export type PropertyFormErrors = Partial<Record<keyof PropertyFormValues, string | undefined>>;

// Files are pending upload; preview URLs must never become persisted domain images.
export interface PropertyFormSubmission {
  data: PropertyFormData;
  images: PropertyFormImage[];
}
