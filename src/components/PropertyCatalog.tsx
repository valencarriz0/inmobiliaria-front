import { useLocation, useSearchParams } from "react-router-dom";
import { useProperties } from "../hooks/use-properties";
import { parsePropertySearchParams, readPropertySearchValues, resetPropertySearchPage, serializePropertySearchFilters } from "../lib/property-search";
import type { PublicPropertySort } from "../types/public-property";
import type { PropertySearchFilters } from "../types/property-search";
import PropertyList from "./PropertyList";
import SearchBar from "./SearchBar";
import { Button } from "./ui/button";
import RecentProperties from "./RecentProperties";

const sortLabels: Record<PublicPropertySort, string> = { newest: "Más recientes", price_asc: "Precio: menor a mayor", price_desc: "Precio: mayor a menor" };

export default function PropertyCatalog({ loggedIn = false }: { loggedIn?: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const filters = parsePropertySearchParams(searchParams);
  const { properties, pagination, loading, error, refresh } = useProperties(filters ?? {}, filters !== undefined);
  const search = (next: PropertySearchFilters) => setSearchParams(serializePropertySearchFilters(resetPropertySearchPage(next), searchParams));
  const clear = () => search({});
  const changePage = (page: number) => { if (filters) setSearchParams(serializePropertySearchFilters({ ...filters, page }, searchParams)); };
  const changeSort = (sort: PublicPropertySort) => { if (filters) setSearchParams(serializePropertySearchFilters({ ...filters, sort, page: 1 }, searchParams)); };

  return <>
    <SearchBar key={location.key} initialValues={readPropertySearchValues(searchParams)} onSearch={search} onClear={clear} />
    <section aria-labelledby="property-results-title" aria-busy={loading}>
      <h2 id="property-results-title" className="text-3xl font-bold mb-4 font-[family-name:var(--font-grotesk)] text-center">Propiedades disponibles</h2>
      {filters === undefined ? <p role="alert" className="text-center">La búsqueda tiene filtros inválidos. Revisá los campos indicados o limpiá los filtros.</p>
        : loading ? <p role="status" className="text-center">Cargando propiedades...</p>
          : error ? <div className="text-center space-y-4"><p role="alert">No se pudieron cargar las propiedades.</p><Button variant="outline" onClick={refresh}>Reintentar</Button></div>
            : properties.length === 0 ? <div className="text-center space-y-4 py-8"><p role="status">No encontramos propiedades que coincidan con los filtros seleccionados.</p><Button variant="outline" onClick={clear}>Limpiar filtros</Button></div>
              : <>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <p role="status" className="text-muted-foreground">{pagination.total} {pagination.total === 1 ? "propiedad encontrada" : "propiedades encontradas"}</p>
                  <label className="text-sm text-muted-foreground">Ordenar por <select aria-label="Ordenar propiedades" className="ml-2 rounded-md border bg-white p-2 text-foreground" value={filters.sort ?? "newest"} onChange={(event) => changeSort(event.target.value as PublicPropertySort)}>{(Object.keys(sortLabels) as PublicPropertySort[]).map((sort) => <option key={sort} value={sort}>{sortLabels[sort]}</option>)}</select></label>
                </div>
                <PropertyList properties={properties} loggedIn={loggedIn} />
                {pagination.totalPages > 1 && <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Paginación"><Button variant="outline" onClick={() => changePage(pagination.page - 1)} disabled={pagination.page <= 1}>Anterior</Button><span aria-current="page" className="text-sm text-muted-foreground">Página {pagination.page} de {pagination.totalPages}</span><Button variant="outline" onClick={() => changePage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>Siguiente</Button></nav>}
              </>}
    </section>
    <RecentProperties loggedIn={loggedIn} />
  </>;
}
