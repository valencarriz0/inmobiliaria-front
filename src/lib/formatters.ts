import { PROPERTY_AMENITIES } from "../constants/property.ts";
import type { Currency, Property, PropertyLocation } from "../types/property.ts";

const numberFormatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });

export function formatPrice(price: number, currency: Currency): string {
  return `${currency} ${numberFormatter.format(price)}`;
}

export function formatArea(area: number): string {
  return `${numberFormatter.format(area)} m²`;
}

export function formatLocation(location: PropertyLocation): string {
  return [...new Set([location.city, location.province, location.country])].join(", ");
}

export function formatCharacteristics(property: Property): string[] {
  const characteristics: string[] = [];
  if (property.bedrooms !== undefined) {
    characteristics.push(`${property.bedrooms} ${property.bedrooms === 1 ? "habitación" : "habitaciones"}`);
  } else {
    characteristics.push(`${property.rooms} ${property.rooms === 1 ? "ambiente" : "ambientes"}`);
  }
  if (property.bathrooms !== undefined) {
    characteristics.push(`${property.bathrooms} ${property.bathrooms === 1 ? "baño" : "baños"}`);
  }
  characteristics.push(formatArea(property.totalArea));
  characteristics.push(...property.amenities.map((amenity) => PROPERTY_AMENITIES[amenity]));
  return characteristics;
}
