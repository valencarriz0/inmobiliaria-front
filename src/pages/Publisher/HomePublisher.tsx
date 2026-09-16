import { Button } from "../../components/ui/button";
import HeaderUser from "../../components/HeaderUser";
import { Link } from "react-router";
import SearchBarPublisher from "../../components/SearchBarPublisher";
import { usePublisherProperties } from "../../hooks/use-publisher-properties";
import { OPERATION_TYPES, PUBLICATION_STATUSES } from "../../constants/property";
import { formatLocation } from "../../lib/formatters";
import { Badge } from "../../components/ui/badge";
import { useEffect, useState } from "react";
import { filterPublisherProperties, type PublisherFilters } from "../../lib/publisher-properties";
import { getPublisherMetrics, type PublisherPropertyMetric } from "../../services/publisherMetricsService";

export default function PublisherDashboard() {
  const { properties, loading, error } = usePublisherProperties();
  const [filters, setFilters] = useState<PublisherFilters>({ query: "", status: "all" });
  const [metrics, setMetrics] = useState<PublisherPropertyMetric[]>([]);
  useEffect(() => {
    let active = true;
    void getPublisherMetrics().then((result) => { if (active) setMetrics(result.properties); }).catch(() => { if (active) setMetrics([]); });
    return () => { active = false; };
  }, []);
  const filteredProperties = filterPublisherProperties(properties, filters);
  const metricFor = (propertyId: string) => metrics.find((metric) => metric.propertyId === propertyId);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderUser />

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <SearchBarPublisher filters={filters} onChange={setFilters} />

        {/* Encabezado sección */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold">Mis propiedades</h2>
          <Link to="/newProperty">
            <Button className="bg-primary text-white hover:bg-primary/90">
              Publicar Nueva Propiedad
            </Button>
          </Link>
        </div>

        {/* Listado de propiedades (tabla simple) */}
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="p-3">Imagen</th>
                <th className="p-3">Título</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Visitas</th>
                <th className="p-3">Consultas</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="p-3" role="status">Cargando propiedades...</td></tr>
                : error ? <tr><td colSpan={8} className="p-3" role="alert">{error}</td></tr>
                : filteredProperties.length === 0 ? <tr><td colSpan={8} className="p-3" role="status">{properties.length ? "No hay propiedades que coincidan con la búsqueda." : "No hay propiedades disponibles."}</td></tr>
                : null}
              {filteredProperties.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="p-3">{p.title}</td>
                  <td className="p-3">{formatLocation(p.location)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
                        p.operationType === "rent"
                          ? "bg-[#477ce0]"
                          : p.operationType === "sale"
                          ? "bg-[#58b5e0]"
                          : "bg-accent"
                      }`}
                    >
                      {OPERATION_TYPES[p.operationType]}
                    </span>
                  </td>
                  <td className="p-3">{metricFor(p.id)?.views ?? 0}</td>
                  <td className="p-3">{metricFor(p.id)?.consultations ?? 0}</td>
                  <td className="p-3">
                    {(() => {
                      const estado = PUBLICATION_STATUSES[p.publicationStatus];
                      if (p.publicationStatus === "active") {
                        return (
                          <Badge className="border-green-500 text-green-600 bg-white rounded-full">
                            {estado}
                          </Badge>
                        );
                      }
                      return (
                        <Badge className="border-amber-500 text-amber-700 bg-white rounded-full">
                          {estado}
                        </Badge>
                      );
                    })()}
                  </td>
                  <td className="p-3 text-right">
                    <Link to={`/detailPublisher/${p.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Más
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
