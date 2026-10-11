import PropertyGallery from "../../components/PropertyGallery";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { ArrowRight, MapPin, Pause, Play, Pencil, Trash, Navigation } from "lucide-react";
import BotonVolver from "../../components/BotonVolver";
import { Link } from "react-router";
import HeaderUser from "../../components/HeaderUser";
import { useNavigate, useParams } from "react-router-dom";
import { useProperty } from "../../hooks/use-property";
import { publisherPropertyService } from "../../services/publisherPropertyService";
import { FieldError } from "../../components/ui/field-error";
import type { PublisherProperty } from "../../types/publisher-property";
import { OPERATION_TYPES, PUBLICATION_STATUSES } from "../../constants/property";
import { formatCharacteristics, formatLocation, formatPrice } from "../../lib/formatters";
import { getPublisherMetrics, type PublisherPropertyMetric } from "../../services/publisherMetricsService";
import { hasValidCoordinates } from "../../lib/geocoding";
import PropertyMap from "../../components/maps/PropertyMap";
import PropertyChangeHistoryDialog from "../../components/PropertyChangeHistoryDialog";

export default function PropertyDetailPublisher() {
  const { id } = useParams();
  const { property, loading, error, refresh } = useProperty(id, "publisher");

  if (loading) return <p role="status" className="text-center py-10">Cargando propiedad...</p>;
  if (error) return <p role="alert" className="text-center py-10">{error}</p>;
  if (!property || property.publicationStatus === "deleted") {
    return (
      <div className="text-center py-10 space-y-4">
        <p>Propiedad no disponible</p>
        <Button asChild><Link to="/dashboard">Volver a mis propiedades</Link></Button>
      </div>
    );
  }

  return <PublisherPropertyDetail key={property.id} property={property} refresh={refresh} />;
}

function PublisherPropertyDetail({ property, refresh }: { property: PublisherProperty; refresh: () => void }) {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string>();
  const [historyOpen, setHistoryOpen] = useState(false);
  const inFlight = useRef(false);

  const [metrics, setMetrics] = useState<PublisherPropertyMetric>();
  useEffect(() => {
    let active = true;
    void getPublisherMetrics().then((result) => {
      if (active) setMetrics(result.properties.find((item) => item.propertyId === property.id));
    }).catch(() => {
      if (active) setMetrics(undefined);
    });
    return () => { active = false; };
  }, [property.id]);
  const views = metrics?.views ?? 0;
  const inquiries = metrics?.consultations ?? 0;
  const totalInteractions = views + inquiries;
  const viewsShare = totalInteractions > 0 ? Math.round((views / totalInteractions) * 100) : 0;
  const inquiriesShare = totalInteractions > 0 ? 100 - viewsShare : 0;
  const consultationRate = views > 0 ? Math.round((inquiries / views) * 100) : 0;
  const publicationStatus = PUBLICATION_STATUSES[property.publicationStatus as keyof typeof PUBLICATION_STATUSES]
    ?? "Sin estado";

  const runAction = async (action: "pause" | "reactivate" | "delete") => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setActionError(undefined);
    try {
      if (action === "delete") {
        await publisherPropertyService.remove(property.id);
        navigate("/dashboard");
      } else {
        if (action === "pause") await publisherPropertyService.pause(property.id);
        else await publisherPropertyService.reactivate(property.id);
        setPauseOpen(false);
        refresh();
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo completar la operación. Intentá nuevamente.");
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  };

  const toggleStatus = () => {
    setActionError(undefined);
    if (property.publicationStatus === "active") setPauseOpen(true);
    else void runAction("reactivate");
  };

  const locationName = formatLocation(property.location);
  const fullAddress = [
    property.location.street,
    property.location.number,
    property.location.city,
    property.location.province,
    property.location.country,
  ].filter((part): part is string => typeof part === "string" && part.trim().length > 0).join(", ");

  return (
    <div className="min-h-screen bg-background">
      <HeaderUser />

      <BotonVolver to="/dashboard" />
      {/* Contenido principal */}
      <main className="container mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Título, ubicación y Guardar */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold mb-1">{property.title}</h1>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${
                    property.operationType === "rent"
                      ? "bg-[#477ce0]"
                      : property.operationType === "sale"
                      ? "bg-[#58b5e0]"
                      : "bg-accent"
                  }`}
                >
                  {OPERATION_TYPES[property.operationType]}
                </span>
              </div>
              <div className="flex items-center text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {formatLocation(property.location)}
              </div>
            </div>
          </div>

          {/* Galería */}
          <PropertyGallery property={property} />

          {/* Características y precio */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-x-3 text-sm">
              {formatCharacteristics(property).map((char, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-accent/10 text-accent"
                >
                  {char.trim()}
                </span>
              ))}
            </div>
            <span className="text-3xl font-bold text-accent">
              {formatPrice(property.price, property.currency)}
            </span>
          </div>

          {/* Descripción */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Descripción</h2>
            <p className="text-muted-foreground leading-relaxed">
              {property.description}
            </p>
          </div>
        </div>

        {/* Sidebar derecha */}
        <aside className="space-y-6">
          {/* Estadísticas */}
          <Card className="gap-0 overflow-hidden rounded-2xl border-border/80 bg-background py-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between gap-4 px-5 py-5">
              <div>
                <CardTitle className="text-lg">Actividad de la publicación</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Interacciones registradas</p>
              </div>
              <Link
                to="/statistics"
                className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent transition-colors hover:text-primary"
              >
                Ver estadísticas
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div
                className="flex h-3 overflow-hidden rounded-full bg-muted"
                role="img"
                aria-label={totalInteractions > 0
                  ? `${views} vistas y ${inquiries} consultas registradas`
                  : "Sin interacciones registradas"}
              >
                {totalInteractions > 0 && (
                  <>
                    <span
                      className="h-full bg-primary"
                      style={{ width: `${viewsShare}%` }}
                    />
                    <span
                      className="h-full bg-accent/45"
                      style={{ width: `${inquiriesShare}%` }}
                    />
                  </>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    Vistas
                  </span>
                  <span className="font-semibold tabular-nums">{views}</span>
                </div>
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-2.5 shrink-0 rounded-full bg-accent/45" aria-hidden="true" />
                    Consultas
                  </span>
                  <span className="font-semibold tabular-nums">{inquiries}</span>
                </div>
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-2.5 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
                    Estado
                  </span>
                  <span className="truncate font-semibold">{publicationStatus}</span>
                </div>
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="size-2.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    Tasa de consulta
                  </span>
                  <span className="font-semibold tabular-nums">{consultationRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mapa 
         <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <PropertyMap latitude={property.latitude} longitude={property.longitude} displayName={formatLocation(property.location)} />
              {!hasValidCoordinates(property.latitude, property.longitude) && <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">La ubicación exacta todavía no está disponible.</p>}
            </CardContent>
          </Card> */}

          <Card className="gap-0 overflow-hidden bg-background py-0 shadow-md">
           {/* <CardHeader className="border-b px-5 py-4">
              {/* <CardTitle className="text-lg">Ubicación</CardTitle>
            </CardHeader>*/}
            {hasValidCoordinates(property.latitude, property.longitude) ? (
              <PropertyMap
                latitude={property.latitude}
                longitude={property.longitude}
                displayName={locationName}
                className="h-[21rem] rounded-none"
              />
            ) : (
              <div className="grid h-56 place-items-center bg-muted px-6 text-center">
                <div>
                  <MapPin className="mx-auto mb-3 size-8 text-accent" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">La ubicación exacta todavía no está disponible.</p>
                </div>
              </div>
            )}
            <CardContent className="flex items-center gap-3 px-5 py-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                <Navigation className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dirección</p>
                <p className="break-words text-sm font-semibold">{fullAddress || "Ubicación informada por el publicador"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Botones de gestión */}
          <Card className="space-y-3">
            <CardContent className="flex flex-col gap-3" aria-busy={saving}>
              {!deleteOpen && !pauseOpen && <FieldError>{actionError}</FieldError>}
              {saving && <p role="status" className="text-sm">Guardando cambios...</p>}
              <Button
                variant="outline"
                className="w-full flex items-center justify-center"
                onClick={toggleStatus}
                disabled={saving}
              >
                {property.publicationStatus === "active" ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" /> Pausar publicación
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" /> Activar publicación
                  </>
                )}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setHistoryOpen(true)} disabled={saving}>Historial de cambios</Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center"
                disabled={saving}
                onClick={() => navigate(`/editProperty/${property.id}`)}
              >
                <Pencil className="h-4 w-4 mr-2" /> Editar publicación
              </Button>

              <Button
                variant="destructive"
                className="w-full flex items-center justify-center"
                onClick={() => { setActionError(undefined); setDeleteOpen(true); }}
                disabled={saving}
              >
                <Trash className="h-4 w-4 mr-2" /> Eliminar publicación
              </Button>
            </CardContent>
          </Card>
        </aside>
      </main>
      <PropertyChangeHistoryDialog propertyId={property.id} open={historyOpen} onOpenChange={setHistoryOpen} />

      {/* Modal Confirmación Eliminar */}
      <AlertDialog open={deleteOpen} onOpenChange={(open) => { if (!inFlight.current) setDeleteOpen(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar propiedad?</AlertDialogTitle>
            <AlertDialogDescription>
              La publicación dejará de aparecer en el catálogo y en tus propiedades.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <FieldError>{actionError}</FieldError>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={saving}
              onClick={(event) => { event.preventDefault(); void runAction("delete"); }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Modal Confirmación Pausar */}
      <AlertDialog open={pauseOpen} onOpenChange={(open) => { if (!inFlight.current) setPauseOpen(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Pausar propiedad?</AlertDialogTitle>
            <AlertDialogDescription>
              No aparecerá en el catálogo mientras esté pausada. Podrás reactivarla desde tu panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <FieldError>{actionError}</FieldError>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={saving}
              onClick={(event) => { event.preventDefault(); void runAction("pause"); }}
            >
              Pausar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
