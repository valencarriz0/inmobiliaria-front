// React import not required with new JSX transform
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card.tsx";
import { Heart, MapPin } from "lucide-react";
import { Button } from "./ui/button.tsx";
import { Link } from "react-router-dom";
import type { Property } from "../types/property";
import { OPERATION_TYPES } from "../constants/property";
import { formatCharacteristics, formatLocation, formatPrice } from "../lib/formatters";

type PropertyListProps = {
  properties: Property[];
  loggedIn?: boolean;
};

const PropertyList = ({ properties, loggedIn = false }: PropertyListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card
          key={property.id}
          className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col"
        >
          <div className="relative h-64 md:h-56 lg:h-64 w-full flex-shrink-0">
            <img
              src={property.images[0]}
              alt={property.title}
              className="object-cover w-full h-full"
            />

            {/* Categoría */}
            <span
              className={`absolute top-2 left-2 px-3 py-1 text-xs font-semibold rounded-full text-white ${
                property.operationType === "rent"
                  ? "bg-[#477ce0]"
                  : property.operationType === "sale"
                  ? "bg-[#58b5e0]"
                  : "bg-accent"
              }`}
            >
              {OPERATION_TYPES[property.operationType]}
            </span>

            {/* Favorito */}
            <Button
              variant="ghost"
              size="icon"
              disabled
              aria-label="Favoritos no disponibles"
              className="absolute top-2 right-2 rounded-full bg-background/70 hover:bg-background hover:scale-110"
            >
              <Heart className="h-5 w-5 fill-none stroke-black" />
            </Button>
          </div>

          <CardContent className="p-4 flex-1">
            <CardTitle className="text-lg font-bold mb-1">
              {property.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {formatCharacteristics(property).join(", ")}
            </CardDescription>

            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 mb-4">
              <span className="text-2xl font-bold text-accent">
                {formatPrice(property.price, property.currency)}
              </span>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {formatLocation(property.location)}
              </div>
            </div>

            {/*Enlace dinámico con el ID. Si está logueado, ir a detailLogin/:id */}
            <Button asChild className="w-full bg-primary hover:bg-primary/90"><Link
              to={
                loggedIn
                  ? `/detailLogin/${property.id}`
                  : `/detail/${property.id}`
              }
            >
              Ver detalles
            </Link></Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PropertyList;
