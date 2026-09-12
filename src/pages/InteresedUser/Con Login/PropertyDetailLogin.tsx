import PropertyDetail from "../../../components/PropertyDetail";
import HeaderUser from "../../../components/HeaderUser";
import { Link, useParams } from "react-router-dom";
import { useProperty } from "../../../hooks/use-property";
import { Button } from "../../../components/ui/button";

export default function PropertyDetailLogin() {
  const { id } = useParams();
  const { property, loading, error } = useProperty(id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderUser
        menuItem1="Perfil"
        menuItem2="Favoritos"
        menuItem3="Historial"
      />
      {loading ? <p role="status" className="text-center py-10">Cargando propiedad...</p>
        : error ? <p role="alert" className="text-center py-10">{error}</p>
        : property ? <PropertyDetail key={property.id} property={property} />
        : <div className="text-center py-10">
          <h2 className="text-2xl font-semibold mb-4">Propiedad no disponible</h2>
          <Button asChild><Link to="/HomePageLogin">Volver al catálogo</Link></Button>
        </div>}
    </div>
  );
}
