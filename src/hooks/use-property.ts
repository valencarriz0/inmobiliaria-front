import { useEffect, useState } from "react";
import { propertyService } from "../services/propertyService.ts";
import type { Property } from "../types/property.ts";

interface PropertyResult {
  id: string | undefined;
  fallbackToFirst: boolean;
  property: Property | undefined;
  error: string | null;
}

export function useProperty(id: string | undefined, fallbackToFirst = false) {
  const [result, setResult] = useState<PropertyResult>();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        let property = id === undefined ? undefined : await propertyService.getById(Number(id));
        // Preserve the existing demo routes that fall back to the first property.
        if (!property && fallbackToFirst) property = (await propertyService.getAll())[0];
        if (!cancelled) setResult({ id, fallbackToFirst, property, error: null });
      } catch {
        if (!cancelled) setResult({ id, fallbackToFirst, property: undefined, error: "No se pudo cargar la propiedad." });
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [id, fallbackToFirst]);

  // Never display the previous property's data while a different ID is loading.
  const current = result?.id === id && result?.fallbackToFirst === fallbackToFirst ? result : undefined;
  return { property: current?.property, loading: !current, error: current?.error ?? null };
}
