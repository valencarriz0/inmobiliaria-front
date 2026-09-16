import type { Currency, OperationType } from "./property.ts";

export type ConsultationPropertyImages =
  | [string, string]
  | [string, string, string]
  | [string, string, string, string]
  | [string, string, string, string, string];

export interface ConsultationProperty {
  id: string;
  title: string;
  operationType: OperationType;
  price: number;
  currency: Currency;
  images: ConsultationPropertyImages;
  city: { id: string; name: string } | null;
  province: { id: string; name: string } | null;
}

export interface Consultation {
  id: string;
  propertyId: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string | null;
  property: ConsultationProperty;
}

export interface CreatedConsultation {
  id: string;
  propertyId: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string | null;
}

export interface ConsultationPropertyDto {
  id: string | null;
  title: string | null;
  operationType: string | null;
  price: number | null;
  currency: string | null;
  images: string[];
  city: { id: string; name: string } | null;
  province: { id: string; name: string } | null;
}

export interface ConsultationDto {
  id: string;
  propertyId: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string | null;
  property: ConsultationPropertyDto;
}

export type CreatedConsultationDto = Omit<ConsultationDto, "property">;
