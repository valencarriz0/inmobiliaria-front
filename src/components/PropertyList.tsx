import { Bath, BedDouble, MapPin, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import type { PublicPropertySummary } from "../types/public-property";
import { OPERATION_TYPES } from "../constants/property";
import { formatPublicCharacteristics, formatPublicLocation, formatPrice } from "../lib/formatters";
import FavoriteHeartButton from "./FavoriteHeartButton";

type PropertyListProps = {
  properties: PublicPropertySummary[];
};

const operationBadgeStyles = {
  sale: "bg-primary/90 text-primary-foreground shadow-foreground/15",
  rent: "bg-foreground/90 text-background shadow-foreground/15",
  temporary_rent: "bg-tertiary/90 text-tertiary-foreground shadow-foreground/15",
} satisfies Record<PublicPropertySummary["operationType"], string>;

const PropertyList = ({ properties }: PropertyListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => {
        const characteristics = formatPublicCharacteristics(property);
        const characteristicIcons = property.bathrooms === undefined
          ? [BedDouble, Ruler]
          : [BedDouble, Bath, Ruler];

        return (
          <article
            key={property.id}
            className="group relative isolate flex h-full min-h-[31rem] flex-col overflow-hidden rounded-[1.75rem] border border-background/75 bg-background/45 p-0 shadow-[0_18px_55px_-24px_rgba(23,23,23,0.28)] backdrop-blur-xl transition-transform duration-300 hover:scale-[1.02] focus-within:scale-[1.02] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
          >
            <Link
              to={`/detail/${property.id}`}
              aria-label={`Ver detalle de ${property.title}`}
              className="absolute inset-0 z-10 rounded-[1.75rem] focus:outline-none"
            />

            <div className="relative h-72 w-full flex-shrink-0 overflow-hidden bg-muted">
              {property.images[0] ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-tertiary text-sm text-muted-foreground">
                  Sin imagen disponible
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              <span className={`absolute left-4 top-4 rounded-full border border-background/35 px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md ${operationBadgeStyles[property.operationType]}`}>
                {OPERATION_TYPES[property.operationType]}
              </span>
            </div>

            <div className="pointer-events-none relative z-20 -mt-12 flex flex-1 flex-col rounded-t-[1.75rem] bg-gradient-to-b from-background/65 via-background/82 to-background/95 px-5 pb-5 pt-8 backdrop-blur-xl sm:px-6">
              <div className="flex items-start gap-3">
                <h3 className="min-w-0 flex-1 font-[family-name:var(--font-grotesk)] text-xl font-bold leading-tight text-foreground">
                  {property.title}
                </h3>
                <FavoriteHeartButton
                  property={property}
                  className="pointer-events-auto relative z-30 shrink-0"
                  buttonClassName="h-12 w-12 rounded-full border border-foreground bg-transparent p-0 shadow-none transition-transform hover:scale-110 hover:bg-background/50"
                  heartClassName="h-8 w-8"
                />
              </div>

              <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-foreground" aria-hidden="true" />
                <span>{formatPublicLocation(property.location) || "Ubicación no informada"}</span>
              </p>

              <ul aria-label="Características" className="mt-4 flex flex-wrap gap-2">
                {characteristics.map((characteristic, index) => {
                  const Icon = characteristicIcons[index] ?? Ruler;
                  return (
                    <li key={characteristic} className="flex items-center gap-2 rounded-full border border-background/85 bg-background/65 px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur-sm">
                      <Icon className="h-4 w-4 text-foreground" aria-hidden="true" />
                      {characteristic}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto border-t border-border pt-4">
                <p className="font-[family-name:var(--font-grotesk)] text-2xl font-bold tracking-tight text-foreground">
                  {formatPrice(property.price, property.currency)}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default PropertyList;
