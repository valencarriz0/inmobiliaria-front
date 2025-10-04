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
import {
  Home,
  MapPin,
  Bell,
  User,
  Pause,
  Play,
  Pencil,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import BotonVolver from "../../components/BotonVolver";
import { Link } from "react-router";

export default function PropertyDetailPublisher() {
  // Estado interno
  const [status, setStatus] = useState<"Activa" | "Pausada">("Activa");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false); // Estado para el modal de pausa

  // Datos de la propiedad
  const views = 120;
  const inquiries = 5;

  const toggleStatus = () => {
    if (status === "Activa") {
      setPauseOpen(true); // Abrir modal de pausa
    } else {
      setStatus("Activa");
    }
  };

  const handleEdit = () => {
    alert("Función de edición aún no implementada.");
  };

  const handleDelete = () => {
    alert("Propiedad eliminada.");
    setDeleteOpen(false);
  };

  const handlePause = () => {
    setStatus("Pausada");
    setPauseOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo y nombre */}
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-primary font-[family-name:var(--font-space-grotesk)]">
              Nombre y Logo
            </span>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-4">
            {/* Notificaciones */}
            <button className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Menú usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center">
                  <User className="h-6 w-6 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Favoritos</DropdownMenuItem>
                <DropdownMenuItem>Historial</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <BotonVolver />
      {/* Main */}
      <main className="container mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Título, ubicación y Guardar */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Casa Familiar con Jardín
              </h1>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                Barrio Cerrado, Ciudad
              </div>
            </div>
          </div>

          {/* Galería */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 h-80 bg-muted flex items-center justify-center rounded-xl">
              Imagen Principal
            </div>
            <div className="flex flex-col gap-4">
              <div className="h-38 flex-1 bg-muted rounded-xl flex items-center justify-center">
                Imagen 2
              </div>
              <div className="h-38 flex-1 bg-muted rounded-xl flex items-center justify-center">
                Imagen 3
              </div>
            </div>
          </div>

          {/* Características y precio */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="space-x-3 text-sm">
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent">
                3 habitaciones
              </span>
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent">
                2 baños
              </span>
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent">
                180 m²
              </span>
            </div>
            <span className="text-3xl font-bold text-accent">$320,000</span>
          </div>

          {/* Descripción */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Descripción</h2>
            <p className="text-muted-foreground leading-relaxed">
              Esta casa familiar cuenta con amplios espacios, jardín privado y
              excelente ubicación en un barrio cerrado con seguridad 24/7. Ideal
              para familias que buscan comodidad y tranquilidad, con fácil
              acceso a escuelas, comercios y transporte.
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
                <p className="font-semibold">{status}</p>
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
                {status === "Activa" ? (
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
