import BotonVolver from "../../components/BotonVolver";
import AuthModals from "../../components/Modals/AuthModals";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function Publish() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header simplificado */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo y nombre */}
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-primary font-[family-name:var(--font-space-grotesk)]">
              Nombre y Logo
            </span>
          </div>

          {/* Botón Acceder */}
          <AuthModals />
        </div>
      </header>
      <BotonVolver />
      {/* Contenido principal */}
      <main className="flex flex-1 items-center justify-center px-4">
        <Card className="max-w-xl w-full text-center shadow-lg rounded-2xl p-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Publica tu propiedad
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Texto orientador */}
            <p className="text-muted-foreground text-lg font-medium">
              ¿Tenes una inmobiliaria o sos propietario?
            </p>

            {/* Icono grande visual */}
            <div className="flex items-center justify-center">
              <Home className="h-24 w-24 text-accent" />
            </div>

            <Link to="/register">
              <Button className="w-full h-12 text-lg bg-accent hover:bg-accent/90">
                Regístrate ahora y comienza
              </Button>
            </Link>
          </CardContent>
        </Card>
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
