import PropertyGallery from "../../components/PropertyGallery";
import { useRef, useState } from "react";
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
import { MapPin, Pause, Play, Pencil, Trash } from "lucide-react";
import BotonVolver from "../../components/BotonVolver";
import { Link } from "react-router";
import HeaderUser from "../../components/HeaderUser";
import { useNavigate, useParams } from "react-router-dom";
import { useProperty } from "../../hooks/use-property";
import { propertyService } from "../../services/propertyService";
import { MOCK_CURRENT_PUBLISHER_ID } from "../../data/mock/session";
import { FieldError } from "../../components/ui/field-error";
import type { Property } from "../../types/property";
import { OPERATION_TYPES, PUBLICATION_STATUSES } from "../../constants/property";
import { formatCharacteristics, formatLocation, formatPrice } from "../../lib/formatters";
import { mockConsultations, mockPropertyViews } from "../../data/mock/activity";
import { propertyMetrics } from "../../lib/publisher-properties";
import { hasValidCoordinates } from "../../lib/geocoding";
import PropertyMap from "../../components/maps/PropertyMap";

export default function PropertyDetailPublisher() {
  const { id } = useParams();
  const { property, loading, error, refresh } = useProperty(id, "publisher");

  if (loading) return <p role="status" className="text-center py-10">Cargando propiedad...</p>;
  if (error) return <p role="alert" className="text-center py-10">{error}</p>;
  if (!property || property.publicationStatus === "deleted" || property.publisherId !== MOCK_CURRENT_PUBLISHER_ID) {
    return (
      <div className="text-center py-10 space-y-4">
        <p>Propiedad no disponible</p>
        <Button asChild><Link to="/dashboard">Volver a mis propiedades</Link></Button>
      </div>
    );
  }

  return <PublisherPropertyDetail key={property.id} property={property} refresh={refresh} />;
}

function PublisherPropertyDetail({ property, refresh }: { property: Property; refresh: () => void }) {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string>();
  const inFlight = useRef(false);

  const { views, consultations: inquiries } = propertyMetrics(property.id, mockPropertyViews, mockConsultations);

  const runAction = async (action: "pause" | "reactivate" | "delete") => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setActionError(undefined);
    try {
      if (action === "delete") {
        await propertyService.softDeleteProperty(property.id);
        navigate("/dashboard");
      } else {
        if (action === "pause") await propertyService.pauseProperty(property.id);
        else await propertyService.reactivateProperty(property.id);
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
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                <p className="font-semibold">{PUBLICATION_STATUSES[property.publicationStatus]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vistas</p>
                <p className="font-semibold">{views}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Consultas</p>
                <p className="font-semibold">{inquiries}</p>
              </div>
            </CardContent>
          </Card>

          {/* Mapa */}
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <PropertyMap latitude={property.latitude} longitude={property.longitude} displayName={formatLocation(property.location)} />
              {!hasValidCoordinates(property.latitude, property.longitude) && <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">La ubicación exacta todavía no está disponible.</p>}
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
