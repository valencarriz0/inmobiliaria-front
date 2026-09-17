import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import HeaderUser from "../../components/HeaderUser";
import BotonVolver from "../../components/BotonVolver";
import PropertyList from "../../components/PropertyList";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useAuth } from "../../hooks/use-auth";
import { getPublicPropertyById } from "../../services/publicPropertyService";
import type { PublicPropertySummary } from "../../types/public-property";

export default function Favorites() {
  const { favoriteIds, favoritesLoading, favoritesError, refreshFavorites } = useAuth();
  const [properties, setProperties] = useState<PublicPropertySummary[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const load = async () => {
      if (favoriteIds.length === 0) {
        setProperties([]);
        setDetailsError(null);
        setDetailsLoading(false);
        return;
      }
      setDetailsLoading(true);
      setDetailsError(null);
      const results = await Promise.allSettled(favoriteIds.map((id) => getPublicPropertyById(id, controller.signal)));
      if (!active) return;
      const loaded = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
      setProperties(loaded);
      if (loaded.length === 0) setDetailsError("No se pudieron cargar tus propiedades favoritas.");
      setDetailsLoading(false);
    };
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [favoriteIds, retry]);

  const loading = favoritesLoading || detailsLoading;
  const error = favoritesError ?? detailsError;
  const retryLoad = () => {
    void refreshFavorites();
    setRetry((value) => value + 1);
  };

  return <div className="min-h-screen bg-background">
    <HeaderUser />
    <BotonVolver fallbackTo="/" />
    <main className="container mx-auto px-4 py-12 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Mis propiedades favoritas</h1>
        <p className="text-muted-foreground">Encontrá rápidamente las propiedades que guardaste.</p>
      </div>
      {loading ? <p role="status">Cargando favoritos...</p> : error ? <div className="space-y-3">
        <p role="alert">{error}</p><Button variant="outline" onClick={retryLoad}>Reintentar</Button>
      </div> : properties.length > 0 ? <PropertyList properties={properties} /> : <Card className="rounded-2xl">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <Heart className="h-10 w-10 text-accent" aria-hidden="true" />
          <h2 className="text-xl font-semibold">{favoriteIds.length ? "Tus favoritos no están disponibles por el momento" : "Todavía no guardaste propiedades"}</h2>
          <p className="text-muted-foreground">Explorá el catálogo y guardá las que más te interesen.</p>
          <Button asChild><Link to="/">Explorar propiedades</Link></Button>
        </CardContent>
      </Card>}
    </main>
  </div>;
}
