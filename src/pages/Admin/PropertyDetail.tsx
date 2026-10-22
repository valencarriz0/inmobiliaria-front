import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, Navigation, Pause, Pencil, Play, Trash } from "lucide-react";
import HeaderUser from "../../components/HeaderUser";
import BotonVolver from "../../components/BotonVolver";
import PropertyGallery from "../../components/PropertyGallery";
import PropertyChangeHistoryDialog from "../../components/PropertyChangeHistoryDialog";
import { PropertyDetailSkeleton } from "../../components/LoadingSkeletons";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { FieldError } from "../../components/ui/field-error";
import { OPERATION_TYPES, PUBLICATION_STATUSES } from "../../constants/property";
import { formatArea, formatPrice } from "../../lib/formatters";
import { hasValidCoordinates } from "../../lib/geocoding";
import PropertyMap from "../../components/maps/PropertyMap";
import { adminService } from "../../services/adminService";
import type { AdminProperty } from "../../types/admin";
import "../Publisher/HomePublisher.css";
import "./AdminDashboard.css";

type AdminAction = "pause" | "reactivate" | "delete";

function propertyLocation(property: AdminProperty) {
  return [property.city?.name, property.province?.name].filter(Boolean).join(", ") || "Ubicación no informada";
}

function propertyAddress(property: AdminProperty) {
  return [property.street, property.streetNumber, property.city?.name, property.province?.name]
    .filter(Boolean).join(", ") || "Ubicación informada por el publicador";
}

function propertyCharacteristics(property: AdminProperty) {
  const items: string[] = [];
  if (property.propertyType !== "land" && Number(property.rooms) > 0) {
    items.push(`${property.rooms} ${Number(property.rooms) === 1 ? "ambiente" : "ambientes"}`);
  }
  if (property.propertyType !== "land" && property.bedrooms !== null) {
    items.push(`${property.bedrooms} ${Number(property.bedrooms) === 1 ? "habitación" : "habitaciones"}`);
  }
  items.push(formatArea(Number(property.totalArea)));
  return items;
}

export default function AdminPropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<AdminProperty>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [action, setAction] = useState<AdminAction | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    try {
      setProperty((await adminService.property(id)).property);
      setError("");
    } catch {
      setError("No se pudo cargar la publicación.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const runAction = async () => {
    if (!property || !action || saving) return;
    setSaving(true);
    setError("");
    try {
      const result = action === "pause"
        ? await adminService.pauseProperty(property.id)
        : action === "reactivate"
          ? await adminService.reactivateProperty(property.id)
          : await adminService.deleteProperty(property.id);
      if (action === "delete") navigate("/admin");
      else setProperty(result.property);
      setAction(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo completar la operación.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background"><HeaderUser /><PropertyDetailSkeleton label="Cargando publicación..." /></div>;
  if (!property) return <div className="min-h-screen bg-background"><HeaderUser /><main className="container mx-auto px-4 py-10 text-center"><p role="alert">{error || "Publicación no encontrada."}</p><Button className="mt-4" variant="outline" onClick={() => void load()}>Reintentar</Button></main></div>;

  const latitude = property.latitude === null ? null : Number(property.latitude);
  const longitude = property.longitude === null ? null : Number(property.longitude);
  const hasMap = hasValidCoordinates(latitude, longitude);
  const publisherName = property.publisher?.agencyName
    || [property.publisher?.firstName, property.publisher?.lastName].filter(Boolean).join(" ")
    || "Publicador de la propiedad";

  return <div className="min-h-screen bg-background">
    <HeaderUser />
    <BotonVolver to="/admin" />
    <main className="container mx-auto grid grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-3">
      <div className="min-w-0 space-y-6 lg:col-span-2">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold break-words">{property.title}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground ${property.operationType === "rent" ? "bg-primary" : property.operationType === "sale" ? "bg-secondary" : "bg-tertiary"}`}>{OPERATION_TYPES[property.operationType]}</span>
          </div>
          <p className="mt-2 flex items-center gap-1 text-muted-foreground"><MapPin className="size-4 shrink-0" aria-hidden="true" />{propertyLocation(property)}</p>
        </div>

        <PropertyGallery property={property} />

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex flex-wrap gap-2">{propertyCharacteristics(property).map((item) => <span key={item} className="rounded-full bg-tertiary px-3 py-1 text-sm text-tertiary-foreground">{item}</span>)}</div>
          <strong className="text-3xl font-bold text-foreground">{formatPrice(Number(property.price), property.currency)}</strong>
        </div>

        <section><h2 className="mb-2 text-xl font-semibold">Descripción</h2><p className="whitespace-pre-wrap break-words leading-relaxed text-muted-foreground">{property.description}</p></section>
      </div>

      <aside className="space-y-6">
        <Card className="gap-0 overflow-hidden rounded-2xl border-border/80 bg-background py-0 shadow-md">
          <CardHeader className="px-5 py-5"><CardTitle className="text-lg">Estado de la publicación</CardTitle><p className="text-sm text-muted-foreground">Gestión administrativa</p></CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            <span className={`publisher-status inline-flex ${property.publicationStatus === "active" ? "is-active" : property.publicationStatus === "paused" ? "is-paused" : "is-deleted"}`}>{PUBLICATION_STATUSES[property.publicationStatus]}</span>
            <div className="border-t border-border pt-4"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Publicador</p><p className="mt-1 font-semibold">{publisherName}</p></div>
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden bg-background py-0 shadow-md">
          {hasMap ? <PropertyMap latitude={latitude!} longitude={longitude!} displayName={propertyLocation(property)} className="h-[21rem] rounded-none" /> : <div className="grid h-56 place-items-center bg-muted px-6 text-center"><div><MapPin className="mx-auto mb-3 size-8 text-foreground" aria-hidden="true" /><p className="text-sm text-muted-foreground">La ubicación exacta todavía no está disponible.</p></div></div>}
          <CardContent className="flex items-center gap-3 px-5 py-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/10 text-foreground"><Navigation className="size-5" aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dirección</p><p className="break-words text-sm font-semibold">{propertyAddress(property)}</p></div></CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 bg-background shadow-md">
          <CardContent className="flex flex-col gap-3" aria-busy={saving}>
            <FieldError>{error}</FieldError>
            <Button variant="outline" onClick={() => window.alert("La edición administrativa completa permanece disponible en la gestión actual.")} disabled={saving}><Pencil className="size-4" aria-hidden="true" />Editar publicación</Button>
            <Button variant="outline" onClick={() => setHistoryOpen(true)} disabled={saving}>Historial de cambios</Button>
            {property.publicationStatus === "active" && <Button variant="outline" onClick={() => setAction("pause")} disabled={saving}><Pause className="size-4" aria-hidden="true" />Pausar publicación</Button>}
            {property.publicationStatus === "paused" && <Button variant="outline" onClick={() => setAction("reactivate")} disabled={saving}><Play className="size-4" aria-hidden="true" />Reactivar publicación</Button>}
            {property.publicationStatus !== "deleted" && <Button variant="destructive" onClick={() => setAction("delete")} disabled={saving}><Trash className="size-4" aria-hidden="true" />Eliminar publicación</Button>}
          </CardContent>
        </Card>
      </aside>
    </main>

    <PropertyChangeHistoryDialog propertyId={property.id} open={historyOpen} onOpenChange={setHistoryOpen} loadHistory={adminService.propertyHistory} />
    <AlertDialog open={Boolean(action)} onOpenChange={(open) => { if (!open && !saving) setAction(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{action === "delete" ? "Eliminar publicación" : action === "pause" ? "Pausar publicación" : "Reactivar publicación"}</AlertDialogTitle><AlertDialogDescription>Esta acción quedará registrada en el historial administrativo.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel><AlertDialogAction disabled={saving} onClick={(event) => { event.preventDefault(); void runAction(); }}>{saving ? "Procesando..." : "Confirmar"}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>;
}
