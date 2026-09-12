import { PROPERTY_AMENITIES } from "../constants/property.ts";
import type { Currency, Property, PropertyLocation } from "../types/property.ts";

// Preserve the existing price presentation while keeping amounts numeric.
const priceFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function formatPrice(price: number, currency: Currency): string {
  return `${currency} $${priceFormatter.format(price)}`;
}

export function formatLocation(location: PropertyLocation): string {
  return `${location.city}, ${location.country}`;
}

export function formatCharacteristics(property: Property): string[] {
  const characteristics: string[] = [];
  if (property.bedrooms !== undefined) {
    characteristics.push(`${property.bedrooms} ${property.bedrooms === 1 ? "habitación" : "habitaciones"}`);
  } else if (property.rooms !== null) {
    characteristics.push(`${property.rooms} ${property.rooms === 1 ? "ambiente" : "ambientes"}`);
  }
  if (property.bathrooms !== undefined) {
    characteristics.push(`${property.bathrooms} ${property.bathrooms === 1 ? "baño" : "baños"}`);
  }
  if (property.totalArea !== null) characteristics.push(`${property.totalArea}m²`);
  characteristics.push(...property.amenities.map((amenity) => PROPERTY_AMENITIES[amenity]));
  return characteristics;
}
