import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import HeaderUser from "../../components/HeaderUser";
import PropertyList from "../../components/PropertyList";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useProperties } from "../../hooks/use-properties";
import { useAuth } from "../../hooks/use-auth";
import { canFavoriteProperty } from "../../lib/user-properties";

export default function Favorites() {
  const { user, favoriteIds } = useAuth();
  const { properties, loading, error, refresh } = useProperties({}, favoriteIds.length > 0);
  const favorites = properties.filter((property) => favoriteIds.includes(property.id) && canFavoriteProperty(user, property));

  return <div className="min-h-screen bg-background">
    <HeaderUser />
    <main className="container mx-auto px-4 py-12 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Mis propiedades favoritas</h1>
        <p className="text-muted-foreground">Encontrá rápidamente las propiedades que guardaste.</p>
        <p className="text-sm text-muted-foreground">En esta vista previa, los favoritos se conservan hasta recargar la página.</p>
      </div>
      {loading ? <p role="status">Cargando favoritos...</p> : error ? <div className="space-y-3">
        <p role="alert">{error}</p><Button variant="outline" onClick={refresh}>Reintentar</Button>
      </div> : favorites.length > 0 ? <PropertyList properties={favorites} loggedIn /> : <Card className="rounded-2xl">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <Heart className="h-10 w-10 text-accent" aria-hidden="true" />
          <h2 className="text-xl font-semibold">{favoriteIds.length ? "Tus favoritos no están disponibles por el momento" : "Todavía no guardaste propiedades"}</h2>
          <p className="text-muted-foreground">Explorá el catálogo y guardá las que más te interesen.</p>
          <Button asChild><Link to="/HomePageLogin">Explorar propiedades</Link></Button>
        </CardContent>
      </Card>}
    </main>
  </div>;
}
