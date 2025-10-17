import { useParams, Link } from "react-router-dom";
import { propiedades } from "../../../data/propertiesExamples.ts";
import { Button } from "../../../components/ui/button.tsx";
import Header from "../../../components/Header.tsx";
import PropertyDetail from "../../../components/PropertyDetail.tsx";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const property = propiedades.find((p) => p.id === Number(id));

  if (!property) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-4">Propiedad no encontrada</h2>
        <Link to="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header page="/post" />

      <PropertyDetail />
    </div>
  );
}
