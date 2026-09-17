import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderUser from "../../components/HeaderUser";
import BotonVolver from "../../components/BotonVolver";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { getPublisherMetrics, type PublisherMetrics } from "../../services/publisherMetricsService";

export default function Statistics() {
  const [metricsData, setMetricsData] = useState<PublisherMetrics>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const metrics = await getPublisherMetrics();
        if (active) setMetricsData(metrics);
      } catch {
        if (active) setError("No se pudieron cargar las estadísticas.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [retry]);
  const summary = metricsData?.summary;
  const metrics = [
    { label: "Publicaciones activas", value: summary?.activeProperties ?? 0 },
    { label: "Vistas totales", value: summary?.totalViews ?? 0 },
    { label: "Consultas recibidas", value: summary?.totalConsultations ?? 0 },
    { label: "Propiedad más vista", value: metricsData?.mostViewed?.views ? metricsData.mostViewed.title : "Sin visitas" },
  ];

  return <div className="min-h-screen bg-background">
    <HeaderUser />
    <BotonVolver fallbackTo="/dashboard" />
    <main className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Estadísticas</h1>
        <Button asChild variant="outline"><Link to="/dashboard">Mis propiedades</Link></Button>
      </div>
      <p className="text-sm text-muted-foreground">Se consideran tus publicaciones activas y pausadas.</p>
      {loading ? <p role="status">Cargando estadísticas...</p> : error ? <div className="space-y-3"><p role="alert">{error}</p><Button variant="outline" onClick={() => setRetry((value) => value + 1)}>Reintentar</Button></div> : <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(({ label, value }) => <Card key={label} className="min-w-0">
            <CardHeader><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent><p className={`${typeof value === "number" ? "text-3xl" : "text-lg"} font-bold break-words`}>{value}</p></CardContent>
          </Card>)}
        </div>
        <Card>
          <CardHeader><CardTitle>Propiedades con más visitas</CardTitle></CardHeader>
          <CardContent>
            {(metricsData?.properties.length ?? 0) ? <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted"><tr><th scope="col" className="p-3">Propiedad</th><th scope="col" className="p-3">Visitas</th><th scope="col" className="p-3">Consultas</th></tr></thead>
                <tbody>{metricsData?.properties.map((property) => <tr key={property.propertyId} className="border-t hover:bg-muted/30">
                  <td className="p-3"><Link className="font-medium text-primary underline-offset-4 hover:underline" to={`/detailPublisher/${property.propertyId}`}>{property.title}</Link></td>
                  <td className="p-3">{property.views}</td><td className="p-3">{property.consultations}</td>
                </tr>)}</tbody>
              </table>
            </div> : <p className="text-muted-foreground">Todavía no tenés publicaciones para mostrar estadísticas.</p>}
          </CardContent>
        </Card>
      </>}
    </main>
  </div>;
}
