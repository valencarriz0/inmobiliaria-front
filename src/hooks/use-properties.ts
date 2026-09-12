import { useEffect, useState } from "react";
import { propertyService } from "../services/propertyService.ts";
import type { Property } from "../types/property.ts";

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    propertyService.getPublicProperties().then(
      (data) => {
        if (cancelled) return;
        setProperties(data);
        setLoading(false);
      },
      () => {
        if (cancelled) return;
        setError("No se pudieron cargar las propiedades.");
        setLoading(false);
      },
    );
    return () => { cancelled = true; };
  }, []);

  return { properties, loading, error };
}
