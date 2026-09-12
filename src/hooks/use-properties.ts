import { useCallback, useEffect, useMemo, useState } from "react";
import { propertyService } from "../services/propertyService.ts";
import type { Property } from "../types/property.ts";
import type { PropertySearchFilters } from "../types/property-search.ts";

interface PropertiesResult {
  filters: PropertySearchFilters;
  revision: number;
  properties: Property[];
  error: string | null;
}

export function useProperties(filters: PropertySearchFilters = {}, enabled = true) {
  const { operationType, propertyType, province, city, currency, minPrice, maxPrice } = filters;
  const query = useMemo(() => ({ operationType, propertyType, province, city, currency, minPrice, maxPrice }),
    [operationType, propertyType, province, city, currency, minPrice, maxPrice]);
  const [result, setResult] = useState<PropertiesResult>();
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;
    if (!enabled) return;
    propertyService.getPublicProperties(query).then(
      (properties) => {
        if (!cancelled) setResult({ filters: query, revision, properties, error: null });
      },
      () => {
        if (!cancelled) setResult({ filters: query, revision, properties: [], error: "No se pudieron cargar las propiedades." });
      },
    );
    return () => { cancelled = true; };
  }, [query, revision, enabled]);

  // Do not flash the previous search while the new request is loading.
  const current = enabled && result?.filters === query && result?.revision === revision ? result : undefined;
  return { properties: current?.properties ?? [], loading: enabled && !current, error: current?.error ?? null, refresh };
}
