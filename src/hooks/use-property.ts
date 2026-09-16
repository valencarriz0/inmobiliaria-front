import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../services/api.ts";
import { getPublicPropertyById } from "../services/publicPropertyService.ts";
import { propertyService } from "../services/propertyService.ts";
import type { Property } from "../types/property.ts";
import type { PublicPropertyDetail } from "../types/public-property.ts";

type PropertyScope = "public" | "publisher";
type LoadedProperty = PublicPropertyDetail | Property;
interface PropertyResult { id: string | undefined; scope: PropertyScope; revision: number; property: LoadedProperty | undefined; error: string | null; }
interface PropertyHookResult<T> { property: T | undefined; loading: boolean; error: string | null; refresh: () => void; }

export function useProperty(id: string | undefined, scope: "publisher"): PropertyHookResult<Property>;
export function useProperty(id: string | undefined, scope?: "public"): PropertyHookResult<PublicPropertyDetail>;
export function useProperty(id: string | undefined, scope: PropertyScope = "public") {
  const [result, setResult] = useState<PropertyResult>();
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const property = !id ? undefined : scope === "public" ? await getPublicPropertyById(id, controller.signal) : await propertyService.getPropertyById(id);
        if (!controller.signal.aborted) setResult({ id, scope, revision, property, error: null });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ id, scope, revision, property: undefined, error: error instanceof ApiError && error.status === 404 ? "Propiedad no encontrada." : "No se pudo cargar la propiedad." });
      }
    }
    void load();
    return () => controller.abort();
  }, [id, scope, revision]);
  const current = result?.id === id && result?.scope === scope && result?.revision === revision ? result : undefined;
  return { property: current?.property, loading: !current, error: current?.error ?? null, refresh };
}
