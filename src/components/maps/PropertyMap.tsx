import { divIcon, type LatLngBoundsExpression } from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { hasValidCoordinates } from "../../lib/geocoding.ts";
import type { GeocodingBoundingBox } from "../../types/location.ts";

const markerIcon = divIcon({ className: "property-map-marker", html: '<span aria-hidden="true">⌖</span>', iconSize: [30, 30], iconAnchor: [15, 30] });

interface PropertyMapProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  displayName?: string;
  boundingBox?: GeocodingBoundingBox | null;
  className?: string;
}

function Viewport({ latitude, longitude, boundingBox }: Pick<PropertyMapProps, "latitude" | "longitude" | "boundingBox">) {
  const map = useMap();
  useEffect(() => {
    if (!hasValidCoordinates(latitude, longitude)) return;
    const position: [number, number] = [latitude as number, longitude as number];
    if (boundingBox) {
      const bounds: LatLngBoundsExpression = [[boundingBox.south, boundingBox.west], [boundingBox.north, boundingBox.east]];
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 17 });
      return;
    }
    map.setView(position, map.getZoom());
  }, [boundingBox, latitude, longitude, map]);
  return null;
}

export default function PropertyMap({ latitude, longitude, displayName, boundingBox, className = "" }: PropertyMapProps) {
  if (!hasValidCoordinates(latitude, longitude)) return null;
  const position: [number, number] = [latitude as number, longitude as number];
  return (
    <div className={`relative z-0 isolate h-64 w-full overflow-hidden rounded-lg ${className}`}>
      <MapContainer center={position} zoom={15} scrollWheelZoom={false} className="h-full w-full" aria-label={displayName ? `Mapa de ${displayName}` : "Mapa de ubicación"}>
        <Viewport latitude={latitude} longitude={longitude} boundingBox={boundingBox} />
        <TileLayer attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={markerIcon} />
      </MapContainer>
    </div>
  );
}
