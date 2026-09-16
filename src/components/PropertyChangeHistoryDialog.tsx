import { useCallback, useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { formatDate } from "../lib/formatters";
import { publisherPropertyService } from "../services/publisherPropertyService";
import type { PropertyHistoryEntry } from "../types/publisher-property";
import { actionLabels, displayHistoryValue, historyChanges } from "../lib/property-history";

const fieldLabels: Record<string, string> = { title: "Título", description: "Descripción", operationType: "Categoría", propertyType: "Tipo de inmueble", price: "Precio", currency: "Moneda", cityId: "Localidad", street: "Calle", streetNumber: "Número", totalArea: "Superficie total", rooms: "Ambientes", bedrooms: "Dormitorios", bathrooms: "Baños", age: "Antigüedad", acceptsPets: "Mascotas", garage: "Cocheras", expenses: "Expensas", taxes: "Impuestos", commissions: "Comisiones", publicationStatus: "Estado" };

export default function PropertyChangeHistoryDialog({ propertyId, open, onOpenChange }: { propertyId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [history, setHistory] = useState<PropertyHistoryEntry[]>([]); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const load = useCallback(async () => { setLoading(true); setError(""); try { setHistory((await publisherPropertyService.history(propertyId)).history); } catch { setError("No se pudo cargar el historial de cambios."); } finally { setLoading(false); } }, [propertyId]);
  useEffect(() => { if (open) void load(); }, [open, load]);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>Historial de cambios</DialogTitle><DialogDescription>Actividad registrada para esta publicación.</DialogDescription></DialogHeader>{loading ? <p role="status">Consultando historial...</p> : error ? <div className="space-y-3"><p role="alert">{error}</p><Button variant="outline" onClick={() => void load()}>Reintentar</Button></div> : history.length === 0 ? <p className="text-sm text-muted-foreground">No hay cambios registrados para esta publicación.</p> : <ol className="space-y-4">{history.map((entry) => <li key={entry.id} className="border-l-2 border-accent/30 pl-4"><div className="flex items-center justify-between gap-3"><Badge variant="outline">{actionLabels[entry.action]}</Badge><time className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</time></div>{entry.action === "updated" && <ul className="mt-2 space-y-1 text-sm">{historyChanges(entry).map((change) => <li key={change.key}>{["images", "services", "amenities"].includes(change.key) ? `Se actualizaron ${change.key === "images" ? "las imágenes" : change.key === "services" ? "los servicios" : "las comodidades"}.` : <><span className="font-medium">{fieldLabels[change.key] ?? change.key}:</span> {displayHistoryValue(change.key, change.before, entry.previousData ?? {})} → {displayHistoryValue(change.key, change.after, entry.newData ?? {})}</>}</li>)}</ul>}</li>)}</ol>}</DialogContent></Dialog>;
}
