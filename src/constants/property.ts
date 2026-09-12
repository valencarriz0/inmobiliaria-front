export const OPERATION_TYPES = {
  sale: "Venta",
  rent: "Alquiler",
  temporary_rent: "Alquiler temporario",
} as const;

export const PROPERTY_TYPES = {
  house: "Casa",
  apartment: "Departamento",
  land: "Terreno",
  commercial: "Local Comercial",
} as const;

export const CURRENCIES = ["ARS", "USD"] as const;

export const PUBLICATION_STATUSES = {
  active: "Activa",
  paused: "Pausada",
  deleted: "Eliminada",
} as const;

export const PROPERTY_CONDITIONS = {
  new: "Nuevo",
  excellent: "Excelente",
  good: "Bueno",
  "to-renovate": "A refaccionar",
} as const;

export const PROPERTY_IMAGE_RULES = {
  min: 2,
  max: 5,
  maxSizeMB: 5,
  mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  formatsLabel: "JPEG/JPG, PNG o WebP",
} as const;

export const PROPERTY_SERVICES = {
  electricity: "Luz",
  gas: "Gas",
  water: "Agua",
} as const;

export const PROPERTY_AMENITIES = {
  large_patio: "patio grande",
  balcony: "balcón",
} as const;
