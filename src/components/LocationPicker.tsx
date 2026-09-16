import { useEffect, useState } from "react";
import { coordinatesFromMatch } from "../lib/geocoding.ts";
import { ApiError } from "../services/api.ts";
import { geocodeAddress } from "../services/locationService.ts";
import type { GeocodingMatch } from "../types/location.ts";
import PropertyMap from "./maps/PropertyMap";
import { Button } from "./ui/button";
import { FieldError } from "./ui/field-error";

interface LocationPickerProps { cityId: string; street: string; streetNumber: string; confirmed: boolean; onConfirm: (coordinates: { latitude: number; longitude: number }) => void; }

export default function LocationPicker({ cityId, street, streetNumber, confirmed, onConfirm }: LocationPickerProps) {
  const [matches, setMatches] = useState<GeocodingMatch[]>([]);
  const [selected, setSelected] = useState<GeocodingMatch>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const canGeocode = Boolean(cityId && street.trim().length >= 2);
  useEffect(() => { setMatches([]); setSelected(undefined); setError(undefined); }, [cityId, street, streetNumber]);

  async function searchAddress() {
    if (!canGeocode) return;
    setLoading(true); setError(undefined); setMatches([]); setSelected(undefined);
    try {
      const response = await geocodeAddress({ cityId, street, streetNumber: streetNumber || null });
      setMatches(response.matches);
      if (!response.matches.length) setError("No encontramos una ubicación para esa dirección. Revisá los datos e intentá nuevamente.");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "No se pudo buscar la ubicación. Intentá nuevamente.");
    } finally { setLoading(false); }
  }

  const selectedCoordinates = selected && coordinatesFromMatch(selected);
  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4" aria-label="Ubicación en el mapa">
      <div><h3 className="text-sm font-medium">Ubicación en el mapa</h3><p className="text-sm text-muted-foreground">Buscá la dirección y confirmá el resultado que corresponda.</p></div>
      <Button type="button" variant="outline" onClick={searchAddress} disabled={!canGeocode || loading}>{loading ? "Buscando ubicación..." : "Buscar ubicación"}</Button>
      {!canGeocode && <p className="text-sm text-muted-foreground">Seleccioná una localidad e ingresá una calle para buscar la ubicación.</p>}
      <FieldError>{error}</FieldError>
      {matches.length > 0 && <div className="space-y-2" role="radiogroup" aria-label="Resultados de ubicación">
        {matches.map((match, index) => <label key={`${match.latitude}-${match.longitude}-${index}`} className="flex cursor-pointer items-start gap-2 rounded-md border bg-white p-3">
          <input type="radio" name="geocoding-match" checked={selected === match} onChange={() => setSelected(match)} />
          <span className="text-sm">{match.displayName}</span>
        </label>)}
      </div>}
      {selected && selectedCoordinates && <div className="space-y-3">
        <PropertyMap latitude={selected.latitude} longitude={selected.longitude} displayName={selected.displayName} boundingBox={selected.boundingBox} />
        <Button type="button" onClick={() => onConfirm(selectedCoordinates)}>Confirmar ubicación</Button>
      </div>}
      {confirmed && <p role="status" className="text-sm font-medium text-emerald-700">Ubicación confirmada</p>}
    </section>
  );
}
