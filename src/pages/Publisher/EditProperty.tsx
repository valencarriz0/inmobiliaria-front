import { useNavigate } from "react-router-dom";
import PropertyForm from "../../components/PropertyForm";
import BotonVolver from "../../components/BotonVolver";
import HeaderUser from "../../components/HeaderUser";
import type { Property } from "../../types/property";

interface EditPropertyProps {
  initialProperty?: Property;
}

export default function EditProperty({ initialProperty }: EditPropertyProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <HeaderUser menuItem1="Perfil" menuItem2="Estadísticas" menuItem3="Configuración" />
      <BotonVolver />
      <div className="container mx-auto py-10 px-4 max-w-6xl bg-gray-50 rounded-lg shadow-md">
        <main className="space-y-8">
          <h1 className="text-3xl font-bold">Editar propiedad</h1>
          <p className="text-sm text-muted-foreground">
            Los ítems con <span className="text-destructive">*</span> son obligatorios
          </p>
          <PropertyForm
            key={initialProperty?.id ?? "empty"}
            initialProperty={initialProperty}
            submitLabel="Guardar cambios"
            onCancel={() => navigate("/dashboard")}
            onSubmit={() => alert("Formulario válido. La edición es una simulación; no se guardaron cambios.")}
          />
        </main>
      </div>
    </div>
  );
}
