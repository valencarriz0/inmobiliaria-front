// no hooks needed here
import { Button } from "../../components/ui/button";
import HeaderUser from "../../components/HeaderUser";
import { Link } from "react-router";
import SearchBarPublisher from "../../components/SearchBarPublisher";
import { propiedades } from "../../data/propertiesExamples";
import { Badge } from "../../components/ui/badge";

export default function PublisherDashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <HeaderUser
        menuItem1="Perfil"
        menuItem2="Estadísticas"
        menuItem3="Configuración"
      />

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <SearchBarPublisher />

        {/* Encabezado sección */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold">Propiedades Destacadas</h2>
          <Link to="/newProperty">
            <Button className="bg-primary text-white hover:bg-primary/90">
              Publicar Nueva Propiedad
            </Button>
          </Link>
        </div>

        {/* Listado de propiedades (tabla simple) */}
        <div className="border rounded-lg overflow-hidden">
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
              {propiedades.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <img
                      src={p.imgUrl1}
                      alt={p.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="p-3">{p.title}</td>
                  <td className="p-3">{p.location}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
                        p.category === "Alquiler"
                          ? "bg-[#477ce0]"
                          : p.category === "Venta"
                          ? "bg-[#58b5e0]"
                          : "bg-accent"
                      }`}
                    >
                      {p.category}
                    </span>
                  </td>
                  <td className="p-3">120</td>
                  <td className="p-3">2</td>
                  <td className="p-3">
                    {(() => {
                      const estado = (p as any).estado ?? "Pausada";
                      const lower = String(estado).toLowerCase();
                      if (lower === "activa" || lower === "activo") {
                        return (
                          <Badge className="border-green-500 text-green-600 bg-white rounded-full">
                            {estado}
                          </Badge>
                        );
                      }
                      // default: pausada
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
