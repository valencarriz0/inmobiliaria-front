import { Link, useNavigate, useParams } from "react-router-dom";
import PropertyForm from "../../components/PropertyForm";
import BotonVolver from "../../components/BotonVolver";
import HeaderUser from "../../components/HeaderUser";
import { useProperty } from "../../hooks/use-property";
import { publisherPropertyService } from "../../services/publisherPropertyService";
import { Button } from "../../components/ui/button";
import { FormSkeleton } from "../../components/LoadingSkeletons";

export default function EditProperty() {
  const { id } = useParams();
  const { property, loading, error } = useProperty(id, "publisher");
  const navigate = useNavigate();

  if (loading) return <div className="min-h-screen bg-background"><HeaderUser /><FormSkeleton label="Cargando propiedad para editar..." /></div>;
  if (error || !property || property.publicationStatus === "deleted") {
    const message = error ?? "Propiedad no encontrada";
    return (
      <div className="text-center py-10 space-y-4">
        <p role="alert">{message}</p>
        <Button asChild><Link to="/dashboard">Volver a mis propiedades</Link></Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderUser />
      <BotonVolver to={`/detailPublisher/${property.id}`} />
      <div className="container mx-auto py-10 px-4 max-w-6xl bg-muted rounded-lg shadow-md">
        <main className="space-y-8">
          <h1 className="text-3xl font-bold">Editar propiedad</h1>
          <p className="text-sm text-muted-foreground">
            Los ítems con <span className="text-destructive">*</span> son obligatorios
          </p>
          <PropertyForm
            key={property.id}
            initialProperty={property}
            submitLabel="Guardar cambios"
            onCancel={() => navigate(`/detailPublisher/${property.id}`)}
            onSubmit={async (input) => {
              const updated = await publisherPropertyService.update(property.id, input);
              navigate(`/detailPublisher/${updated.id}`);
            }}
          />
        </main>
      </div>
    </div>
  );
}
