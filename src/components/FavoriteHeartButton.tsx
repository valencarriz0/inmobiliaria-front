import { Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/use-auth";
import { canManageFavorites, canShowFavorite } from "../lib/favorites";

type FavoriteHeartButtonProps = {
  property: { id: string; title: string };
  className?: string;
  buttonClassName?: string;
  heartClassName?: string;
};

export default function FavoriteHeartButton({
  property,
  className = "absolute top-2 right-2",
  buttonClassName = "rounded-full bg-background/70 hover:bg-background hover:scale-110",
  heartClassName,
}: FavoriteHeartButtonProps) {
  const { user, favoriteIds, pendingFavoriteIds, ownedPropertyIds, toggleFavorite, openAuthDialog } = useAuth();
  const [error, setError] = useState<string | null>(null);

  if (!canShowFavorite(user, property.id, ownedPropertyIds)) return null;

  const isFavorite = favoriteIds.includes(property.id);
  const canFavorite = canManageFavorites(user);

  return <div className={className}>
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={isFavorite}
      aria-label={canFavorite ? `${isFavorite ? "Quitar de" : "Guardar en"} favoritos: ${property.title}` : "Favoritos disponibles para interesados y publicadores"}
      title={canFavorite ? undefined : "Accedé como interesado o publicador para guardar propiedades"}
      disabled={pendingFavoriteIds.has(property.id)}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!user) {
          openAuthDialog("favorite");
          return;
        }
        if (!canFavorite) {
          return;
        }
        setError(null);
        try {
          await toggleFavorite(property.id);
        } catch (requestError) {
          setError(requestError instanceof Error ? requestError.message : "No se pudo actualizar el favorito.");
        }
      }}
      className={buttonClassName}
    >
      <Heart className={`h-5 w-5 ${isFavorite ? "fill-accent stroke-accent" : "fill-none stroke-black"} ${heartClassName ?? ""}`} />
    </Button>
    {error && <p role="alert" className="absolute right-0 top-full z-10 mt-2 w-56 rounded-md bg-destructive px-3 py-2 text-xs text-destructive-foreground shadow">{error}</p>}
  </div>;
}
