import { useCallback, useEffect, useState } from "react";
import { propertyService } from "../services/propertyService.ts";
import type { Property } from "../types/property.ts";

type PropertyScope = "public" | "publisher";

interface PropertyResult {
  id: string | undefined;
  scope: PropertyScope;
  revision: number;
  property: Property | undefined;
  error: string | null;
}

export function useProperty(id: string | undefined, scope: PropertyScope = "public") {
  const [result, setResult] = useState<PropertyResult>();
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const property = !id ? undefined : await (scope === "public"
          ? propertyService.getPublicPropertyById(id)
          : propertyService.getPropertyById(id));
        if (!cancelled) setResult({ id, scope, revision, property, error: null });
      } catch {
        if (!cancelled) setResult({ id, scope, revision, property: undefined, error: "No se pudo cargar la propiedad." });
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [id, scope, revision]);

  // Hide stale data as soon as the route, visibility scope or refresh changes.
  const current = result?.id === id && result?.scope === scope && result?.revision === revision ? result : undefined;
  return { property: current?.property, loading: !current, error: current?.error ?? null, refresh };
}
