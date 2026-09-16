import { useEffect, useState } from "react";
import { publisherPropertyService } from "../services/publisherPropertyService.ts";
import type { PublisherProperty } from "../types/publisher-property.ts";

interface PublisherPropertiesResult {
  properties: PublisherProperty[];
  error: string | null;
}

export function usePublisherProperties() {
  const [result, setResult] = useState<PublisherPropertiesResult>();

  useEffect(() => {
    let cancelled = false;
    publisherPropertyService.list().then(
      (properties) => {
        if (!cancelled) setResult({ properties: properties.properties.filter((property) => property.publicationStatus !== "deleted"), error: null });
      },
      () => {
        if (!cancelled) setResult({ properties: [], error: "No se pudieron cargar tus propiedades." });
      },
    );
    return () => { cancelled = true; };
  }, []);

  const current = result;
  return { properties: current?.properties ?? [], loading: !current, error: current?.error ?? null };
}
