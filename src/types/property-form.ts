import type { Property } from "./property.ts";
import type { EditablePropertyData, PropertyImageInput } from "./property-input.ts";

export type PropertyFormImage = PropertyImageInput & { id: string };

type NumericField =
  | "price" | "totalArea" | "rooms" | "bedrooms" | "bathrooms"
  | "age" | "garage" | "expenses" | "taxes" | "commissions";

// Only editable domain data. Identity, publication state and server metadata stay out.
export type PropertyFormData = EditablePropertyData;

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
