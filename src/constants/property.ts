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

export const PROPERTY_SERVICES = {
  electricity: "Luz",
  gas: "Gas",
  water: "Agua",
} as const;

export const PROPERTY_AMENITIES = {
  large_patio: "patio grande",
  balcony: "balcón",
} as const;
