import BotonVolver from "../../components/BotonVolver";
import Header from "../../components/Header";
import { useUserPreview } from "../../hooks/use-user-preview";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Home } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

export default function Publish() {
  const { user } = useUserPreview();
  if (user) return <Navigate to={user.role === "interested" ? "/become-publisher" : user.role === "publisher" ? "/dashboard" : "/profile"} replace />;
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header page="/register" />
      <BotonVolver to="/" />
      {/* Contenido principal */}
      <main className="flex flex-1 items-center justify-center px-4">
        <Card className="max-w-xl w-full text-center shadow-lg rounded-2xl p-2 sm:p-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Publica tu propiedad
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Texto orientador */}
            <p className="text-muted-foreground text-lg font-medium">
              ¿Tenés una inmobiliaria o sos propietario?
            </p>

            {/* Icono grande visual */}
            <div className="flex items-center justify-center">
              <Home className="h-24 w-24 text-accent" />
            </div>

            <Button asChild className="w-full min-h-12 h-auto whitespace-normal text-lg bg-accent hover:bg-accent/90">
              <Link to="/register">
                Regístrate ahora y comienza
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-muted py-6 px-4 mt-12">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          © 2025 Nombre y Logo. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
