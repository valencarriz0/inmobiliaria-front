// Small prototype catalog, including every location used by the existing fixtures.
export const PROPERTY_LOCATIONS: Readonly<Record<string, readonly string[]>> = {
  "Buenos Aires": ["La Plata", "Mar del Plata", "Bahía Blanca"],
  "Ciudad Autónoma de Buenos Aires": ["Buenos Aires"],
  "Córdoba": ["Córdoba", "Villa Carlos Paz", "Río Cuarto"],
  "Mendoza": ["Mendoza", "Godoy Cruz", "San Rafael"],
  "Santa Fe": ["Rosario", "Santa Fe", "Rafaela"],
};

export function getPropertyCities(province: string): readonly string[] {
  return Object.hasOwn(PROPERTY_LOCATIONS, province) ? PROPERTY_LOCATIONS[province] : [];
}
