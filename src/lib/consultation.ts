import type { Consultation, ConsultationDto, ConsultationPropertyImages, CreatedConsultation, CreatedConsultationDto } from "../types/consultation.ts";
import type { Currency, OperationType } from "../types/property.ts";

function requiredText(value: string | null, field: string) {
  if (!value?.trim()) throw new Error(`La respuesta de consultas no incluye ${field}.`);
  return value;
}

function propertyImages(images: string[]): ConsultationPropertyImages {
  if (images.length < 2 || images.length > 5 || images.some((image) => !image.trim())) {
    throw new Error("La respuesta de una consulta incluye imágenes de propiedad inválidas.");
  }
  if (images.length === 2) return [images[0], images[1]];
  if (images.length === 3) return [images[0], images[1], images[2]];
  if (images.length === 4) return [images[0], images[1], images[2], images[3]];
  return [images[0], images[1], images[2], images[3], images[4]];
}

function operationType(value: string | null): OperationType {
  if (value === "sale" || value === "rent" || value === "temporary_rent") return value;
  throw new Error("La respuesta de consultas incluye una categoría inválida.");
}

function currency(value: string | null): Currency {
  if (value === "ARS" || value === "USD") return value;
  throw new Error("La respuesta de consultas incluye una moneda inválida.");
}

export function mapCreatedConsultation(dto: CreatedConsultationDto): CreatedConsultation {
  return { id: dto.id, propertyId: dto.propertyId, createdAt: dto.createdAt, firstName: dto.firstName, lastName: dto.lastName, email: dto.email, phone: dto.phone, message: dto.message };
}

export function mapConsultation(dto: ConsultationDto): Consultation {
  const price = dto.property.price;
  if (price === null || !Number.isFinite(price)) throw new Error("La respuesta de consultas incluye un precio inválido.");
  return {
    ...mapCreatedConsultation(dto),
    property: {
      id: requiredText(dto.property.id, "la propiedad"),
      title: requiredText(dto.property.title, "el título de la propiedad"),
      operationType: operationType(dto.property.operationType),
      price,
      currency: currency(dto.property.currency),
      images: propertyImages(dto.property.images),
      city: dto.property.city,
      province: dto.property.province,
    },
  };
}
