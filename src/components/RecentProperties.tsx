import { useEffect, useState } from "react";
import { readRecentProperties } from "../lib/recent-properties";
import { getPublicPropertyById } from "../services/publicPropertyService";
import type { PublicPropertySummary } from "../types/public-property";
import PropertyList from "./PropertyList";

export default function RecentProperties({ loggedIn }: { loggedIn: boolean }) {
  const [properties, setProperties] = useState<PublicPropertySummary[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    const ids = readRecentProperties();
    if (!ids.length) return;
    Promise.allSettled(ids.map((id) => getPublicPropertyById(id, controller.signal))).then((results) => {
      if (!controller.signal.aborted) setProperties(results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []));
    });
    return () => controller.abort();
  }, []);
  if (!properties.length) return null;
  return <section aria-labelledby="recent-properties-title" className="mt-12"><h2 id="recent-properties-title" className="text-3xl font-bold mb-6 font-[family-name:var(--font-grotesk)] text-center">Vistas recientemente</h2><PropertyList properties={properties} loggedIn={loggedIn} /></section>;
}
