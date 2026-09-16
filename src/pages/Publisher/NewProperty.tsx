import { useNavigate } from "react-router-dom";
import PropertyForm from "../../components/PropertyForm";
import BotonVolver from "../../components/BotonVolver";
import HeaderUser from "../../components/HeaderUser";
import { publisherPropertyService } from "../../services/publisherPropertyService";

export default function NewProperty() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <HeaderUser />
      <BotonVolver to="/dashboard" />
      <div className="container mx-auto py-10 px-4 max-w-6xl bg-gray-50 rounded-lg shadow-md">
        <main className="space-y-8">
          <h1 className="text-3xl font-bold">Publicar nueva propiedad</h1>
          <p className="text-sm text-muted-foreground">
            Los ítems con <span className="text-destructive">*</span> son obligatorios
          </p>
          <PropertyForm
            submitLabel="Publicar"
            onCancel={() => navigate("/dashboard")}
            onSubmit={async (input) => {
              const property = await publisherPropertyService.create(input);
              navigate(`/detailPublisher/${property.id}`);
            }}
          />
        </main>
      </div>
    </div>
  );
}
