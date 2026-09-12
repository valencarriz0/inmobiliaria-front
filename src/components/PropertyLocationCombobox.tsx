import { useEffect, useId, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { PROPERTY_LOCATIONS } from "../constants/locations";
import type { PropertySearchValues } from "../types/property-search";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FieldError } from "./ui/field-error";

type LocationValue = Pick<PropertySearchValues, "province" | "city">;

const locations = Object.entries(PROPERTY_LOCATIONS).flatMap(([province, cities]) => [
  { province, city: "" },
  ...cities.map((city) => ({ province, city })),
]);

function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("es-AR");
}

function locationLabel({ province, city }: LocationValue) {
  return city ? [city, province].filter(Boolean).join(", ") : province;
}

interface PropertyLocationComboboxProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  onBlur: () => void;
  error?: string;
}

export default function PropertyLocationCombobox({ value, onChange, onBlur, error }: PropertyLocationComboboxProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const matches = locations.filter((location) => normalize(locationLabel(location)).includes(normalize(query ?? "")));
  const active = matches[activeIndex];

  useEffect(() => {
    if (open) document.getElementById(`${id}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, query, id]);

  const choose = (location: LocationValue) => {
    onChange(location);
    setQuery(null);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative min-w-0" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setOpen(false);
        setQuery(null);
        onBlur();
      }
    }}>
      <Label htmlFor={id} className="sr-only">Ubicación</Label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3.5 top-4 size-4 text-muted-foreground" aria-hidden="true" />
        <Input ref={inputRef} id={id} role="combobox" autoComplete="off"
          aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-options`}
          aria-activedescendant={open && active ? `${id}-option-${activeIndex}` : undefined}
          aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
          placeholder="Ingrese provincia o localidad" value={query ?? locationLabel(value)}
          className="h-12 rounded-xl border-slate-200 bg-white pl-10 pr-9 text-sm shadow-none"
          onClick={() => { setOpen(true); setActiveIndex(0); }}
          onChange={(event) => {
            const text = event.target.value;
            setQuery(text);
            setOpen(true);
            setActiveIndex(0);
            if (!text) onChange({ province: "", city: "" });
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((index) => !open ? 0 : Math.max(0, Math.min(matches.length - 1, index + (event.key === "ArrowDown" ? 1 : -1))));
            } else if (event.key === "Enter" && open) {
              event.preventDefault();
              if (active) choose(active);
            } else if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
              setQuery(null);
            }
          }} />
        {(value.province || value.city || query) && (
          <button type="button" aria-label="Limpiar ubicación" className="absolute right-1 top-1 flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent"
            onClick={() => choose({ province: "", city: "" })}>
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          <ul id={`${id}-options`} role="listbox" aria-label="Provincias y localidades" className="max-h-64 overflow-y-auto overscroll-contain">
            {matches.map((location, index) => (
              <li key={`${location.province}-${location.city}`} id={`${id}-option-${index}`} role="option"
                aria-selected={index === activeIndex}
                className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm ${index === activeIndex ? "bg-accent/10 text-accent" : "hover:bg-muted"}`}
                onPointerDown={(event) => event.preventDefault()} onClick={() => choose(location)}>
                <span className="block font-medium">{location.city || location.province}</span>
                <span className="block text-xs text-muted-foreground">{location.city ? `Localidad · ${location.province}` : "Provincia"}</span>
              </li>
            ))}
          </ul>
          {matches.length === 0 && <p role="status" className="px-3 py-4 text-sm text-muted-foreground">No encontramos provincias o localidades.</p>}
        </div>
      )}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}
