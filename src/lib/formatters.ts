import { PROPERTY_AMENITIES } from "../constants/property.ts";
import type { Currency, Property, PropertyLocation } from "../types/property.ts";
import type { PublicPropertyLocation, PublicPropertySummary } from "../types/public-property.ts";

const numberFormatter = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" });

export function formatDate(date: string): string {
  return dateFormatter.format(new Date(date));
}

export function formatPrice(price: number, currency: Currency): string {
  return `${currency} ${numberFormatter.format(price)}`;
}

export function formatArea(area: number): string {
  return `${numberFormatter.format(area)} m²`;
}

export function formatLocation(location: PropertyLocation): string {
  return [...new Set([location.city, location.province, location.country])].join(", ");
}

export function formatPublicLocation(location: PublicPropertyLocation): string {
  return [...new Set([location.city, location.province].filter(Boolean))].join(", ");
}

export function formatPublicCharacteristics(property: Pick<PublicPropertySummary, "bedrooms" | "rooms" | "bathrooms" | "totalArea">): string[] {
  const characteristics: string[] = [];
  if (property.bedrooms !== undefined) characteristics.push(`${property.bedrooms} ${property.bedrooms === 1 ? "habitación" : "habitaciones"}`);
  else characteristics.push(`${property.rooms} ${property.rooms === 1 ? "ambiente" : "ambientes"}`);
  if (property.bathrooms !== undefined) characteristics.push(`${property.bathrooms} ${property.bathrooms === 1 ? "baño" : "baños"}`);
  characteristics.push(formatArea(property.totalArea));
  return characteristics;
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
