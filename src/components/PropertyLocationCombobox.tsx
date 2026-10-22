import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, X } from "lucide-react";
import { getCities, getProvinces, searchLocations } from "../services/locationService";
import type { LocationSearchResult } from "../types/location";
import type { PropertySearchValues } from "../types/property-search";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FieldError } from "./ui/field-error";

type LocationValue = Pick<PropertySearchValues, "province" | "city" | "provinceId" | "cityId">;

function locationLabel({ province, city }: LocationValue) { return [city, province].filter(Boolean).join(", "); }
function searchResultValue(result: LocationSearchResult): LocationValue {
  return result.type === "city"
    ? { province: result.provinceName, city: result.name, provinceId: "", cityId: result.id }
    : { province: result.name, city: "", provinceId: result.id, cityId: "" };
}

interface PropertyLocationComboboxProps { value: LocationValue; onChange: (value: LocationValue) => void; onBlur: () => void; error?: string; showLabel?: boolean; portal?: boolean; }

export default function PropertyLocationCombobox({ value, onChange, onBlur, error, showLabel = false, portal = false }: PropertyLocationComboboxProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [matches, setMatches] = useState<LocationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{ left: number; top?: number; bottom?: number; width: number; maxHeight: number } | null>(null);
  const active = matches[activeIndex];

  useEffect(() => {
    const controller = new AbortController();
    if (value.provinceId && !value.province) {
      getProvinces(controller.signal).then(({ provinces }) => {
        const province = provinces.find((item) => item.id === value.provinceId);
        if (province && !controller.signal.aborted) onChange({ ...value, province: province.name });
      }).catch(() => undefined);
    }
    if (value.cityId && !value.city) {
      getCities(undefined, controller.signal).then(({ cities }) => {
        const city = cities.find((item) => item.id === value.cityId);
        if (city && !controller.signal.aborted) onChange({ ...value, city: city.name, province: city.provinceName });
      }).catch(() => undefined);
    }
    return () => controller.abort();
  }, [onChange, value]);

  useEffect(() => {
    const text = query?.trim() ?? "";
    if (text.length < 2) { setMatches([]); setLoading(false); return; }
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await searchLocations(text, controller.signal);
        if (!controller.signal.aborted) setMatches(response.locations);
      }
      catch { if (!controller.signal.aborted) setMatches([]); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 300);
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, [query]);

  useEffect(() => {
    if (open) document.getElementById(`${id}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, matches, id]);

  useLayoutEffect(() => {
    if (!open || !portal) return;
    const updatePosition = () => {
      const rect = inputRef.current?.getBoundingClientRect();
      if (!rect) return;
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const placeAbove = below < 220 && above > below;
      const width = Math.min(rect.width, window.innerWidth - 16);
      setPopoverPosition({
        left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
        width,
        top: placeAbove ? undefined : rect.bottom + 8,
        bottom: placeAbove ? window.innerHeight - rect.top + 8 : undefined,
        maxHeight: Math.max(80, Math.min(256, placeAbove ? above : below)),
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, portal]);

  const choose = (result: LocationSearchResult | LocationValue) => {
    onChange("type" in result ? searchResultValue(result) : result);
    setQuery(null); setOpen(false); inputRef.current?.focus();
  };

  const options = open && (!portal || popoverPosition) && <div
    className={`${portal ? "pointer-events-auto fixed z-[60]" : "absolute inset-x-0 top-full z-50 mt-2"} rounded-xl border border-border bg-background p-1.5 shadow-lg`}
    onPointerDown={portal ? (event) => event.stopPropagation() : undefined}
    style={portal && popoverPosition ? popoverPosition : undefined}>
    <ul id={`${id}-options`} role="listbox" aria-label="Provincias y localidades" className="max-h-64 overflow-y-auto overscroll-contain" style={portal && popoverPosition ? { maxHeight: popoverPosition.maxHeight - 12 } : undefined}>
      {matches.map((result, index) => <li key={`${result.type}-${result.id}`} id={`${id}-option-${index}`} role="option" aria-selected={index === activeIndex} className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm ${index === activeIndex ? "bg-accent text-foreground" : "hover:bg-muted"}`} onPointerDown={(event) => event.preventDefault()} onClick={() => choose(result)}>
        <span className="block font-medium">{result.name}</span><span className="block text-xs text-muted-foreground">{result.type === "city" ? `Localidad · ${result.provinceName}` : "Provincia"}</span>
      </li>)}
    </ul>
    {loading && <p role="status" className="px-3 py-4 text-sm text-muted-foreground">Buscando ubicaciones...</p>}
    {!loading && (query?.trim().length ?? 0) < 2 && <p role="status" className="px-3 py-4 text-sm text-muted-foreground">Ingresá al menos 2 caracteres para buscar.</p>}
    {!loading && (query?.trim().length ?? 0) >= 2 && matches.length === 0 && <p role="status" className="px-3 py-4 text-sm text-muted-foreground">No encontramos provincias o localidades.</p>}
  </div>;

  return <div className="relative min-w-0" onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setQuery(null); onBlur(); }
  }}>
    <Label htmlFor={id} className={showLabel ? "mb-2" : "sr-only"}>Ubicación</Label>
    <div className="relative">
      <MapPin className="pointer-events-none absolute left-3.5 top-4 size-4 text-muted-foreground" aria-hidden="true" />
      <Input ref={inputRef} id={id} role="combobox" autoComplete="off" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-options`}
        aria-activedescendant={open && active ? `${id}-option-${activeIndex}` : undefined} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
        placeholder="Ingresá provincia o localidad" value={query ?? locationLabel(value)} className="h-12 rounded-xl border-border bg-background pl-10 pr-9 text-sm shadow-none"
        onClick={() => { setOpen(true); setActiveIndex(0); }} onChange={(event) => {
          const text = event.target.value; setQuery(text); setOpen(true); setActiveIndex(0); if (!text) onChange({ province: "", city: "", provinceId: "", cityId: "" });
        }} onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); setOpen(true); setActiveIndex((index) => !open ? 0 : Math.max(0, Math.min(matches.length - 1, index + (event.key === "ArrowDown" ? 1 : -1))));
          } else if (event.key === "Enter" && open) { event.preventDefault(); if (active) choose(active); }
          else if (event.key === "Escape") { event.preventDefault(); setOpen(false); setQuery(null); }
        }} />
      {(value.province || value.city || query) && <button type="button" aria-label="Limpiar ubicación" className="absolute right-1 top-1 flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-accent" onClick={() => choose({ province: "", city: "", provinceId: "", cityId: "" })}><X className="size-4" aria-hidden="true" /></button>}
    </div>
    {portal ? options && createPortal(options, document.body) : options}
    <FieldError id={`${id}-error`}>{error}</FieldError>
  </div>;
}
