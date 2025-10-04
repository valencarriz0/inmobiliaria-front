import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { MapPin, Heart } from "lucide-react";
import BotonVolver from "../../components/BotonVolver";
import HeaderUser from "../../components/HeaderUser";

export default function PropertyDetailLogin() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [openContact, setOpenContact] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <HeaderUser
        menuItem1="Perfil"
        menuItem2="Favoritos"
        menuItem3="Historial"
      />
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
            <Button
              variant="ghost"
              className="flex items-center space-x-2"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                }`}
              />
              <span>Guardar</span>
            </Button>
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
          {/* Mapa */}
          <Card className="h-56">
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-full bg-muted rounded-lg">
              Mapa aquí
            </CardContent>
          </Card>

          {/* Reseñas */}
          <Card>
            <CardHeader>
              <CardTitle>Reseñas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                ★★★★☆ (12 reseñas)
              </p>
              <Button variant="link" className="mt-2 p-0">
                Ver todas las reseñas
              </Button>
            </CardContent>
          </Card>

          {/* Publicador + Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Publicado por</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div>
                  <p className="font-semibold">Inmobiliaria XYZ</p>
                  <p className="text-sm text-muted-foreground">
                    contacto@xyz.com
                  </p>
                </div>
              </div>
              <Button
                className="w-full bg-accent hover:bg-accent/90"
                onClick={() => setOpenContact(true)}
              >
                Quiero que me contacten
              </Button>
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* Dialog Confirmación */}
      <Dialog open={openContact} onOpenChange={setOpenContact}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consulta enviada</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Hemos registrado tu consulta y se agregó a tu historial de
            consultas. Pronto el publicador se pondrá en contacto contigo.
          </p>
          <DialogFooter>
            <Button onClick={() => setOpenContact(false)}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-muted py-6 px-4 mt-12">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          © 2025 Nombre y Logo. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
