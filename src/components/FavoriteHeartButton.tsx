import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import type { Property } from "../types/property";
import { useUserPreview } from "../hooks/use-user-preview";
import { canFavoriteProperty, isOwnProperty } from "../lib/user-properties";

type FavoriteHeartButtonProps = {
  property: Pick<Property, "id" | "publisherId" | "title">;
  className?: string;
  buttonClassName?: string;
  heartClassName?: string;
  stopAtOwnProperty?: boolean;
};

export default function FavoriteHeartButton({
  property,
  className = "absolute top-2 right-2 rounded-full bg-background/70 hover:bg-background hover:scale-110",
  buttonClassName,
  heartClassName,
  stopAtOwnProperty = true,
}: FavoriteHeartButtonProps) {
  const { user, favoriteIds, toggleFavorite, openAuthDialog } = useUserPreview();

  if (stopAtOwnProperty && isOwnProperty(user, property)) return null;

  const isFavorite = favoriteIds.includes(property.id);
  const canFavorite = canFavoriteProperty(user, property);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={isFavorite}
      aria-label={canFavorite ? `${isFavorite ? "Quitar de" : "Guardar en"} favoritos: ${property.title}` : "Favoritos disponibles para interesados y publicadores"}
      title={canFavorite ? undefined : "Accedé como interesado o publicador para guardar propiedades"}
      onClick={() => {
        if (!user) {
          openAuthDialog("favorite");
          return;
        }
        if (!canFavorite) {
          return;
        }
        toggleFavorite(property);
      }}
      className={buttonClassName ?? className}
    >
      <Heart className={`h-5 w-5 ${isFavorite ? "fill-accent stroke-accent" : "fill-none stroke-black"} ${heartClassName ?? ""}`} />
    </Button>
  );
}
