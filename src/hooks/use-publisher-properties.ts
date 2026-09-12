import { useEffect, useState } from "react";
import { propertyService } from "../services/propertyService.ts";
import type { Property } from "../types/property.ts";

interface PublisherPropertiesResult {
  publisherId: Property["publisherId"];
  properties: Property[];
  error: string | null;
}

export function usePublisherProperties(publisherId: Property["publisherId"]) {
  const [result, setResult] = useState<PublisherPropertiesResult>();

  useEffect(() => {
    let cancelled = false;
    propertyService.getPropertiesByPublisher(publisherId).then(
      (properties) => {
        if (!cancelled) setResult({ publisherId, properties, error: null });
      },
      () => {
        if (!cancelled) setResult({ publisherId, properties: [], error: "No se pudieron cargar tus propiedades." });
      },
    );
    return () => { cancelled = true; };
  }, [publisherId]);

  const current = result?.publisherId === publisherId ? result : undefined;
  return { properties: current?.properties ?? [], loading: !current, error: current?.error ?? null };
}
