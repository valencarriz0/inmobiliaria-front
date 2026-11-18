import BotonVolver from "../../components/BotonVolver";
import Header from "../../components/Header";
import { useAuth } from "../../hooks/use-auth";
import { Button } from "../../components/ui/button";
import { Home } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { publishingEntryRedirect } from "../../lib/auth-navigation";

export default function Publish() {
  const { user } = useAuth();
  const redirect = user ? publishingEntryRedirect(user.role) : null;
  if (redirect) return <Navigate to={redirect} replace />;
  const registrationPath = user?.role === "interested" ? "/become-publisher" : "/register";
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header page="/register" />
      <BotonVolver to="/" />
      <main className="page-content flex-1 space-y-5">
        <Home className="size-12 fill-primary text-foreground" aria-hidden="true" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Publicá tu propiedad</h1>
          <p className="text-lg text-muted-foreground">¿Tenés una inmobiliaria o sos propietario?</p>
        </div>
        <Button asChild className="h-auto min-h-12 whitespace-normal">
          <Link to={registrationPath}>
            {user ? "Quiero publicar propiedades" : "Regístrate ahora y comienza"}
          </Link>
        </Button>
      </main>

      <footer className="bg-muted py-6 px-4 mt-12">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          © 2026 InmuConnect. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
