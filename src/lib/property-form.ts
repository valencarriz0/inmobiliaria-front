import { CURRENCIES } from "../constants/property.ts";
import { getPropertyCities } from "../constants/locations.ts";
import type { Property } from "../types/property.ts";
import type { EditablePropertyData } from "../types/property-input.ts";
import type { PropertyFormSubmission, PropertyFormValues } from "../types/property-form.ts";
import { validatePropertyForm } from "./validation.ts";

export function createPropertyFormValues(property?: EditablePropertyData & Pick<Property, "images">): PropertyFormValues {
  return {
    title: property?.title ?? "",
    description: property?.description ?? "",
    operationType: property?.operationType ?? "",
    propertyType: property?.propertyType ?? "",
    price: property?.price.toString() ?? "",
    currency: property?.currency ?? CURRENCIES[0],
    country: property?.location.country ?? "Argentina",
    province: property?.location.province ?? "",
    city: property?.location.city ?? "",
    street: property?.location.street ?? "",
    number: property?.location.number ?? "",
    totalArea: property?.totalArea?.toString() ?? "",
    rooms: property?.rooms?.toString() ?? "",
    bedrooms: property?.bedrooms?.toString() ?? "",
    bathrooms: property?.bathrooms?.toString() ?? "",
    garage: property?.garage?.toString() ?? "",
    age: property?.age?.toString() ?? "",
    expenses: property?.expenses?.toString() ?? "",
    taxes: property?.taxes?.toString() ?? "",
    commissions: property?.commissions?.toString() ?? "",
    propertyCondition: property?.propertyCondition ?? "",
    acceptsPets: property?.acceptsPets === undefined ? "" : property.acceptsPets ? "yes" : "no",
    services: [...(property?.services ?? [])],
    amenities: [...(property?.amenities ?? [])],
    images: property?.images.map((url, index) => ({ kind: "existing", id: `existing-${index}`, url })) ?? [],
  };
}

export function changePropertyProvince(values: PropertyFormValues, province: string): PropertyFormValues {
  return {
    ...values,
    province,
    city: getPropertyCities(province).includes(values.city) ? values.city : "",
  };
}

// Called only after shared validation succeeds, so empty/invalid numbers cannot leak.
export function toPropertyInput(values: PropertyFormValues): PropertyFormSubmission | undefined {
  if (Object.values(validatePropertyForm(values)).some(Boolean)) return;
  const { operationType, propertyType, currency } = values;
  if (!operationType || !propertyType || !currency) return;

  const number = (value: string) => Number(value.trim().replace(",", "."));
  const optionalNumber = (value: string) => value.trim() ? number(value) : undefined;

  return {
    data: {
      title: values.title.trim(),
      description: values.description.trim(),
      operationType,
      propertyType,
      price: number(values.price),
      currency,
      location: {
        country: values.country,
        province: values.province,
        city: values.city,
        street: values.street.trim() || undefined,
        number: values.number.trim() || undefined,
      },
      totalArea: number(values.totalArea),
      rooms: number(values.rooms),
      bedrooms: optionalNumber(values.bedrooms),
      bathrooms: optionalNumber(values.bathrooms),
      garage: optionalNumber(values.garage),
      age: optionalNumber(values.age),
      expenses: optionalNumber(values.expenses),
      taxes: optionalNumber(values.taxes),
      commissions: optionalNumber(values.commissions),
      propertyCondition: values.propertyCondition || undefined,
      acceptsPets: values.acceptsPets === "" ? undefined : values.acceptsPets === "yes",
      services: [...values.services],
      amenities: [...values.amenities],
    },
    images: values.images.map((image) => ({ ...image })),
  };
}
