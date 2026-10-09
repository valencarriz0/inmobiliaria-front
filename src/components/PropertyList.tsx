import { ArrowUpRight, Bath, BedDouble, MapPin, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import type { PublicPropertySummary } from "../types/public-property";
import { OPERATION_TYPES } from "../constants/property";
import { formatPublicCharacteristics, formatPublicLocation, formatPrice } from "../lib/formatters";
import FavoriteHeartButton from "./FavoriteHeartButton";

type PropertyListProps = {
  properties: PublicPropertySummary[];
};

const operationBadgeStyles = {
  sale: "bg-[#58b5e0]/90 shadow-sky-950/15",
  rent: "bg-[#477ce0]/90 shadow-blue-950/15",
  temporary_rent: "bg-accent/90 shadow-violet-950/15",
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
            className="group relative isolate flex h-full min-h-[31rem] flex-col overflow-hidden rounded-[1.75rem] border border-white/75 bg-white/45 p-0 shadow-[0_18px_55px_-24px_rgba(30,41,59,0.42)] backdrop-blur-xl transition-transform duration-300 hover:scale-[1.02] focus-within:scale-[1.02] focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2"
          >
            <Link
              to={`/detail/${property.id}`}
              aria-label={`Ver detalle de ${property.title}`}
              className="absolute inset-0 z-10 rounded-[1.75rem] focus:outline-none"
            />

            <div className="relative h-72 w-full flex-shrink-0 overflow-hidden bg-slate-100">
              {property.images[0] ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-violet-100 text-sm text-muted-foreground">
                  Sin imagen disponible
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-white/80 via-white/20 to-transparent" />
              <span className={`absolute left-4 top-4 rounded-full border border-white/35 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-md ${operationBadgeStyles[property.operationType]}`}>
                {OPERATION_TYPES[property.operationType]}
              </span>
              <FavoriteHeartButton
                property={property}
                className="absolute right-4 top-4 z-20"
                buttonClassName="h-11 w-11 rounded-full border border-white/70 bg-white/80 shadow-lg backdrop-blur-md transition hover:scale-110 hover:bg-white"
                heartClassName="h-[1.15rem] w-[1.15rem]"
              />
            </div>

            <div className="relative -mt-12 flex flex-1 flex-col rounded-t-[1.75rem] bg-gradient-to-b from-white/65 via-white/82 to-white/95 px-5 pb-5 pt-8 backdrop-blur-xl sm:px-6">
              <div className="flex items-start gap-3">
                <h3 className="min-w-0 flex-1 font-[family-name:var(--font-grotesk)] text-xl font-bold leading-tight text-slate-900">
                  {property.title}
                </h3>
                <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/75 text-slate-900 shadow-sm backdrop-blur">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>

              <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-800" aria-hidden="true" />
                <span>{formatPublicLocation(property.location) || "Ubicación no informada"}</span>
              </p>

              <ul aria-label="Características" className="mt-4 flex flex-wrap gap-2">
                {characteristics.map((characteristic, index) => {
                  const Icon = characteristicIcons[index] ?? Ruler;
                  return (
                    <li key={characteristic} className="flex items-center gap-2 rounded-full border border-white/85 bg-white/65 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-sm">
                      <Icon className="h-4 w-4 text-slate-700" aria-hidden="true" />
                      {characteristic}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-auto border-t border-slate-300/70 pt-4">
                <p className="font-[family-name:var(--font-grotesk)] text-2xl font-bold tracking-tight text-accent">
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
