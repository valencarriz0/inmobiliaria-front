import { ApiError } from "../services/api.ts";
import type { Currency, OperationType, PropertyCondition } from "../types/property.ts";
import type { PublicPropertyDetail, PublicPropertyDetailDto, PublicPropertySummary, PublicPropertySummaryDto, PublicPropertyType } from "../types/public-property.ts";

const operations = new Set<OperationType>(["sale", "rent", "temporary_rent"]);
const propertyTypes = new Set<PublicPropertyType>(["house", "apartment", "commercial"]);
const currencies = new Set<Currency>(["ARS", "USD"]);
const conditions = new Set<PropertyCondition>(["new", "excellent", "good", "to-renovate"]);

function requiredNumber(value: unknown, field: string) {
  const number = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : Number.NaN;
  if (!Number.isFinite(number)) throw new ApiError(0, `La respuesta contiene un ${field} inválido.`);
  return number;
}

function optionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined;
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(number) ? number : undefined;
}

function coordinates(latitude: unknown, longitude: unknown) {
  const lat = optionalNumber(latitude);
  const lng = optionalNumber(longitude);
  if (lat === undefined || lng === undefined || lat < -90 || lat > 90 || lng < -180 || lng > 180) return { latitude: null, longitude: null };
  return { latitude: lat, longitude: lng };
}

function mapSummary(dto: PublicPropertySummaryDto): PublicPropertySummary {
  if (!dto || typeof dto !== "object" || !operations.has(dto.operationType as OperationType) || !propertyTypes.has(dto.propertyType as PublicPropertyType) || !currencies.has(dto.currency as Currency)) {
    throw new ApiError(0, "La respuesta de una propiedad es inválida.");
  }
  return {
    id: dto.id, title: dto.title, description: dto.description, operationType: dto.operationType as OperationType,
    propertyType: dto.propertyType as PublicPropertyType, price: requiredNumber(dto.price, "precio"), currency: dto.currency as Currency,
    location: { cityId: dto.city?.id, city: dto.city?.name, provinceId: dto.province?.id, province: dto.province?.name, street: dto.street ?? undefined, number: dto.streetNumber ?? undefined },
    totalArea: requiredNumber(dto.totalArea, "superficie"), rooms: requiredNumber(dto.rooms, "cantidad de ambientes"),
    bedrooms: optionalNumber(dto.bedrooms), bathrooms: optionalNumber(dto.bathrooms), age: optionalNumber(dto.age),
    propertyCondition: conditions.has(dto.propertyCondition as PropertyCondition) ? dto.propertyCondition as PropertyCondition : undefined,
    acceptsPets: typeof dto.acceptsPets === "boolean" ? dto.acceptsPets : undefined, garage: optionalNumber(dto.garage),
    expenses: optionalNumber(dto.expenses), taxes: optionalNumber(dto.taxes), commissions: optionalNumber(dto.commissions),
    ...coordinates(dto.latitude, dto.longitude), images: Array.isArray(dto.images) ? dto.images.filter((url): url is string => typeof url === "string") : [], createdAt: dto.createdAt,
  };
}

export function mapPublicPropertySummary(dto: PublicPropertySummaryDto): PublicPropertySummary { return mapSummary(dto); }
export function mapPublicPropertyDetail(dto: PublicPropertyDetailDto): PublicPropertyDetail {
  const summary = mapSummary(dto);
  return { ...summary, services: Array.isArray(dto.services) ? dto.services.map((service) => service.code).filter((code): code is string => typeof code === "string") : [], amenities: Array.isArray(dto.amenities) ? dto.amenities.map((amenity) => amenity.code).filter((code): code is string => typeof code === "string") : [] };
}
