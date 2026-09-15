import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "../../components/Header";
import UserForm from "../../components/UserForm";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useUserPreview } from "../../hooks/use-user-preview";

export default function PublisherRegistration() {
  const navigate = useNavigate();
  const { user, setUser } = useUserPreview();
  const upgrade = user?.role === "interested";
  if (user && !upgrade) return <Navigate to="/profile" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header page="/post" />
      <div className="container mx-auto px-4 mt-2">
        <Button asChild variant="ghost" size="sm"><Link to={upgrade ? "/profile" : "/post"}><ArrowLeft className="h-4 w-4" />Volver</Link></Button>
      </div>
      <main className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="text-center lg:text-left space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary">
            {upgrade ? "Quiero publicar propiedades" : "Regístrate para comenzar a publicar tus propiedades"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {upgrade ? "Completá los datos para publicar con tu misma cuenta." : "Completá el formulario con tus datos para publicar como particular o inmobiliaria."}
          </p>
          <p className="text-sm text-muted-foreground">
            Vista previa: {upgrade ? "los cambios solo se muestran durante este recorrido" : "tu cuenta todavía no se crea"}. Los datos se descartan al recargar la página.
          </p>
        </div>
        <Card className="rounded-2xl bg-gray-50 dark:bg-card min-w-0">
          <CardHeader><CardTitle className="text-2xl font-bold text-center">{upgrade ? "Datos del publicador" : "Registro de publicador"}</CardTitle></CardHeader>
          <CardContent>
            <UserForm key={upgrade ? "upgrade" : "register"} role="publisher" initialUser={user ?? undefined}
              withPassword={!upgrade} readOnlyEmail={upgrade} submitLabel="Continuar a vista previa"
              onCancel={() => navigate(upgrade ? "/profile" : "/post")}
              onSubmit={(profile) => { setUser(profile); navigate("/profile"); }} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
