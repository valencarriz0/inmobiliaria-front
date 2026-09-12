import { useState } from "react";
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
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { MapPin, Pause, Play, Pencil, Trash } from "lucide-react";
import BotonVolver from "../../components/BotonVolver";
import { Link } from "react-router";
import HeaderUser from "../../components/HeaderUser";
import { useParams } from "react-router-dom";
import { useProperty } from "../../hooks/use-property";
import type { Property, PublicationStatus } from "../../types/property";
import { OPERATION_TYPES, PUBLICATION_STATUSES } from "../../constants/property";
import { formatCharacteristics, formatLocation, formatPrice } from "../../lib/formatters";

export default function PropertyDetailPublisher() {
  const { id } = useParams();
  const { property, loading, error } = useProperty(id, true);

  if (loading) return <p role="status" className="text-center py-10">Cargando propiedad...</p>;
  if (error) return <p role="alert" className="text-center py-10">{error}</p>;
  if (!property) return <p className="text-center py-10">Propiedad no encontrada</p>;

  return <PublisherPropertyDetail key={property.id} property={property} />;
}

function PublisherPropertyDetail({ property }: { property: Property }) {
  // Existing demo interaction remains local; this does not update publicationStatus.
  const [status, setStatus] = useState<Exclude<PublicationStatus, "deleted">>("active");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false); // Estado para el modal de pausa

  // Datos de la propiedad
  const views = 120;
  const inquiries = 5;

  const toggleStatus = () => {
    if (status === "active") {
      setPauseOpen(true); // Abrir modal de pausa
    } else {
      setStatus("active");
    }
  };

  // handleEdit se puede implementar luego si se necesita

  const handleDelete = () => {
    alert("Propiedad eliminada.");
    setDeleteOpen(false);
  };

  const handlePause = () => {
    setStatus("paused");
    setPauseOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderUser
        menuItem1="Perfil"
        menuItem2="Estadísticas"
        menuItem3="Configuración"
      />

      <BotonVolver />
      {/* Main */}
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
          <div className="flex items-stretch gap-4">
            <div className="w-2/3 h-80 overflow-hidden rounded-xl bg-muted">
              <img
                src={property.images[0]}
                alt={property.title}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="w-1/3 flex flex-col gap-4 h-80">
              <div className="flex-1 overflow-hidden rounded-xl bg-muted">
                <img
                  src={property.images[1]}
                  alt={property.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 overflow-hidden rounded-xl bg-muted">
                <img
                  src={property.images[2]}
                  alt={property.title}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>

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
                <p className="font-semibold">{PUBLICATION_STATUSES[status]}</p>
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
          <Card className="h-56">
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-full bg-muted rounded-lg">
              Mapa aquí
            </CardContent>
          </Card>

          {/* Botones de gestión */}
          <Card className="space-y-3">
            <CardContent className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center"
                onClick={toggleStatus}
              >
                {status === "active" ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" /> Pausar publicación
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" /> Activar publicación
                  </>
                )}
              </Button>
              <Link to="/editProperty">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                >
                  <Pencil className="h-4 w-4 mr-2" /> Editar publicación
                </Button>
              </Link>

              <Button
                variant="destructive"
                className="w-full flex items-center justify-center"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash className="h-4 w-4 mr-2" /> Eliminar publicación
              </Button>
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* Modal Confirmación Eliminar */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar propiedad?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Modal Confirmación Pausar */}
      <AlertDialog open={pauseOpen} onOpenChange={setPauseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Pausar propiedad?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPauseOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={handlePause}
            >
              Pausar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
