import { useCallback, useEffect, useState } from "react";
import { publisherPropertyService } from "../services/publisherPropertyService.ts";
import type { PublisherProperty } from "../types/publisher-property.ts";

interface PublisherPropertiesResult {
  properties: PublisherProperty[];
  error: string | null;
}

export function usePublisherProperties() {
  const [result, setResult] = useState<PublisherPropertiesResult>();
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => setReloadKey((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;
    setResult(undefined);
    publisherPropertyService.list().then(
      (properties) => {
        if (!cancelled) setResult({ properties: properties.properties.filter((property) => property.publicationStatus !== "deleted"), error: null });
      },
      () => {
        if (!cancelled) setResult({ properties: [], error: "No se pudieron cargar tus propiedades." });
      },
    );
    return () => { cancelled = true; };
  }, [reloadKey]);

  const current = result;
  return { properties: current?.properties ?? [], loading: !current, error: current?.error ?? null, refresh };
}
