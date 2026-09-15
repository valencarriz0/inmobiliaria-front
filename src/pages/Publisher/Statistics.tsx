import { Link } from "react-router-dom";
import HeaderUser from "../../components/HeaderUser";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { usePublisherProperties } from "../../hooks/use-publisher-properties";
import { MOCK_CURRENT_PUBLISHER_ID } from "../../data/mock/session";
import { mockConsultations, mockPropertyViews } from "../../data/mock/activity";
import { publisherStatistics } from "../../lib/publisher-properties";

export default function Statistics() {
  const { properties, loading, error } = usePublisherProperties(MOCK_CURRENT_PUBLISHER_ID);
  const stats = publisherStatistics(properties, mockPropertyViews, mockConsultations);
  const metrics = [
    { label: "Publicaciones activas", value: stats.active },
    { label: "Vistas totales", value: stats.totalViews },
    { label: "Consultas recibidas", value: stats.totalConsultations },
    { label: "Propiedad más vista", value: stats.mostViewed?.title ?? "Sin visitas" },
  ];

  return <div className="min-h-screen bg-background">
    <HeaderUser />
    <main className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Estadísticas</h1>
        <Button asChild variant="outline"><Link to="/dashboard">Mis propiedades</Link></Button>
      </div>
      <p className="text-sm text-muted-foreground">Vista previa con visitas y consultas de ejemplo. Se consideran tus publicaciones activas y pausadas.</p>
      {loading ? <p role="status">Cargando estadísticas...</p> : error ? <p role="alert">{error}</p> : <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map(({ label, value }) => <Card key={label} className="min-w-0">
            <CardHeader><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent><p className={`${typeof value === "number" ? "text-3xl" : "text-lg"} font-bold break-words`}>{value}</p></CardContent>
          </Card>)}
        </div>
        <Card>
          <CardHeader><CardTitle>Propiedades con más visitas</CardTitle></CardHeader>
          <CardContent>
            {stats.ranking.length ? <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted"><tr><th scope="col" className="p-3">Propiedad</th><th scope="col" className="p-3">Visitas</th><th scope="col" className="p-3">Consultas</th></tr></thead>
                <tbody>{stats.ranking.map(({ property, views, consultations }) => <tr key={property.id} className="border-t hover:bg-muted/30">
                  <td className="p-3"><Link className="font-medium text-primary underline-offset-4 hover:underline" to={`/detailPublisher/${property.id}`}>{property.title}</Link></td>
                  <td className="p-3">{views}</td><td className="p-3">{consultations}</td>
                </tr>)}</tbody>
              </table>
            </div> : <p className="text-muted-foreground">Todavía no tenés publicaciones para mostrar estadísticas.</p>}
          </CardContent>
        </Card>
      </>}
    </main>
  </div>;
}
