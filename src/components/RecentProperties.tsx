import { useState } from "react";
import { useProperties } from "../hooks/use-properties";
import { readRecentProperties } from "../lib/recent-properties";
import PropertyList from "./PropertyList";

export default function RecentProperties({ loggedIn }: { loggedIn: boolean }) {
  const [ids] = useState(readRecentProperties);
  const { properties } = useProperties({}, ids.length > 0);
  const recent = ids.flatMap((id) => {
    const property = properties.find((item) => item.id === id);
    return property ? [property] : [];
  });
  if (recent.length === 0) return null;

  return <section aria-labelledby="recent-properties-title" className="mt-12">
    <h2 id="recent-properties-title" className="text-3xl font-bold mb-6 font-[family-name:var(--font-grotesk)] text-center">Vistas recientemente</h2>
    <PropertyList properties={recent} loggedIn={loggedIn} />
  </section>;
}
