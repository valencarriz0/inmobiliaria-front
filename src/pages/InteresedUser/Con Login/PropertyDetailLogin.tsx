import PropertyDetail from "../../../components/PropertyDetail";
import HeaderUser from "../../../components/HeaderUser";
import { useParams } from "react-router-dom";
import { useProperty } from "../../../hooks/use-property";

export default function PropertyDetailLogin() {
  const { id } = useParams();
  const { property, loading, error } = useProperty(id, true);

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
        : <p className="text-center py-10">Propiedad no encontrada</p>}
    </div>
  );
}
