import { useLocation, useSearchParams } from "react-router-dom";
import { useProperties } from "../hooks/use-properties";
import { parsePropertySearchParams, readPropertySearchValues, serializePropertySearchFilters } from "../lib/property-search";
import type { PropertySearchFilters } from "../types/property-search";
import PropertyList from "./PropertyList";
import SearchBar from "./SearchBar";
import { Button } from "./ui/button";

export default function PropertyCatalog({ loggedIn = false }: { loggedIn?: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const filters = parsePropertySearchParams(searchParams);
  const { properties, loading, error, refresh } = useProperties(filters, filters !== undefined);

  const search = (next: PropertySearchFilters) => {
    setSearchParams(serializePropertySearchFilters(next, searchParams));
    refresh();
  };
  const clear = () => search({});

  return (
    <>
      <SearchBar key={location.key} initialValues={readPropertySearchValues(searchParams)} onSearch={search} onClear={clear} />
      <section aria-labelledby="property-results-title" aria-busy={loading}>
        <h2 id="property-results-title" className="text-3xl font-bold mb-4 font-[family-name:var(--font-grotesk)] text-center">
          Propiedades disponibles
        </h2>
        {filters === undefined ? (
          <p role="alert" className="text-center">La búsqueda tiene filtros inválidos. Revisá los campos indicados o limpiá los filtros.</p>
        ) : loading ? <p role="status" className="text-center">Cargando propiedades...</p>
          : error ? (
            <div className="text-center space-y-4">
              <p role="alert">{error}</p>
              <Button variant="outline" onClick={refresh}>Reintentar</Button>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center space-y-4 py-8">
              <p role="status">No encontramos propiedades que coincidan con los filtros seleccionados.</p>
              <Button variant="outline" onClick={clear}>Limpiar filtros</Button>
            </div>
          ) : (
            <>
              <p role="status" className="text-center text-muted-foreground mb-6">
                {properties.length} {properties.length === 1 ? "propiedad encontrada" : "propiedades encontradas"}
              </p>
              <PropertyList properties={properties} loggedIn={loggedIn} />
            </>
          )}
      </section>
    </>
  );
}
