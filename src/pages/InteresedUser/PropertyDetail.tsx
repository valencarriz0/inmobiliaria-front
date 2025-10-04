import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Home, MapPin } from "lucide-react";
import { Link } from "react-router";
import AuthModals from "../../components/Modals/AuthModals";
import BotonVolver from "../../components/BotonVolver";

export default function PropertyDetail() {
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
          <div className="flex items-center space-x-2">
            <Link to={"/post"}>
              <Button variant="outline" size="sm">
                Publicar
              </Button>
            </Link>
            <AuthModals />
          </div>
        </div>
      </header>
      <BotonVolver />
      {/* Main */}
      <main className="container mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Título y ubicación */}
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Casa Familiar con Jardín
            </h1>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              Barrio Cerrado, Ciudad
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

          {/* Formulario contacto */}
          <Card>
            <CardHeader>
              <CardTitle>Contáctanos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Nombre" />
              <Input placeholder="Apellido" />
              <Input type="email" placeholder="Correo electrónico" />
              <Input placeholder="WhatsApp" />
              <Button className="w-full bg-accent hover:bg-accent/90">
                Quiero que me contacten
              </Button>
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-6 px-4 mt-12">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          © 2025 Nombre y Logo. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
