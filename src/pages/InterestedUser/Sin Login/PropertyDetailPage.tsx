import { useParams, Link } from "react-router-dom";
import { useProperty } from "../../../hooks/use-property";
import { Button } from "../../../components/ui/button.tsx";
import Header from "../../../components/Header.tsx";
import PropertyDetail from "../../../components/PropertyDetail.tsx";
import { PropertyDetailSkeleton } from "../../../components/LoadingSkeletons";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { property, loading, error } = useProperty(id);

  if (loading) return <div className="min-h-screen bg-background"><Header page="/post" /><PropertyDetailSkeleton /></div>;
  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Header page="/post" />
        <main className="page-content space-y-4">
          <h1 className="text-2xl font-semibold">Propiedad no disponible</h1>
          {error && <p role="alert">{error}</p>}
          <Button asChild><Link to="/">Volver al catálogo</Link></Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header page="/post" />

      <PropertyDetail key={property.id} property={property} />
    </div>
  );
}
