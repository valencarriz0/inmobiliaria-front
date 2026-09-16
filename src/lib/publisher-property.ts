import { ApiError } from "../services/api.ts";
import { PROPERTY_AMENITIES, PROPERTY_SERVICES } from "../constants/property.ts";
import { mapPublicPropertyDetail } from "./public-property.ts";
import type { PublisherProperty, PublisherPropertyDto } from "../types/publisher-property.ts";

export function mapPublisherProperty(dto: PublisherPropertyDto): PublisherProperty {
  if (!dto || typeof dto !== "object") throw new ApiError(0, "La respuesta de una propiedad es inválida.");
  const property = mapPublicPropertyDetail(dto);
  return {
    ...property,
    services: property.services.filter((code): code is PublisherProperty["services"][number] => code in PROPERTY_SERVICES),
    amenities: property.amenities.filter((code): code is PublisherProperty["amenities"][number] => code in PROPERTY_AMENITIES),
    publisherId: dto.publisherId,
    publicationStatus: dto.publicationStatus as PublisherProperty["publicationStatus"],
    updatedAt: dto.updatedAt,
    location: {
      country: dto.country ?? "",
      city: dto.city?.name ?? "",
      province: dto.province?.name ?? "",
      cityId: dto.city?.id,
      provinceId: dto.province?.id,
      street: dto.street ?? "",
      number: dto.streetNumber ?? "",
    },
  };
}