import { useCallback, useEffect, useMemo, useState } from "react";
import { getPublicProperties } from "../services/publicPropertyService.ts";
import type { PublicPropertyPagination, PublicPropertySummary } from "../types/public-property.ts";
import type { PropertySearchFilters } from "../types/property-search.ts";

interface PropertiesResult { query: PropertySearchFilters; revision: number; properties: PublicPropertySummary[]; pagination: PublicPropertyPagination; error: string | null; }
const emptyPagination: PublicPropertyPagination = { page: 1, limit: 12, total: 0, totalPages: 0 };

export function useProperties(filters: PropertySearchFilters = {}, enabled = true) {
  const { operationType, propertyType, provinceId, cityId, currency, minPrice, maxPrice, sort, page, limit } = filters;
  const query = useMemo(() => ({ operationType, propertyType, provinceId, cityId, currency, minPrice, maxPrice, page: page ?? 1, limit: limit ?? 12, sort: sort ?? "newest" }), [operationType, propertyType, provinceId, cityId, currency, minPrice, maxPrice, sort, page, limit]);
  const [result, setResult] = useState<PropertiesResult>();
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    getPublicProperties(query, controller.signal).then(
      ({ properties, pagination }) => { if (!controller.signal.aborted) setResult({ query, revision, properties, pagination, error: null }); },
      () => { if (!controller.signal.aborted) setResult({ query, revision, properties: [], pagination: emptyPagination, error: "No se pudieron cargar las propiedades." }); },
    );
    return () => controller.abort();
  }, [query, revision, enabled]);
  const current = enabled && result?.query === query && result.revision === revision ? result : undefined;
  return { properties: current?.properties ?? [], pagination: current?.pagination ?? emptyPagination, loading: enabled && !current, error: current?.error ?? null, refresh };
}
