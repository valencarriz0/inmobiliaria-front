import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "../../components/Header";
import UserForm from "../../components/UserForm";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/use-auth";

export default function PublisherRegistration({ mode }: { mode: "visitor" | "interested" }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notice, setNotice] = useState("");
  const upgrade = mode === "interested";
  if (mode === "visitor" && user) return <Navigate to="/profile" replace />;
  if (mode === "interested" && user?.role !== "interested") return <Navigate to="/profile" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header page="/post" />
      <div className="container mx-auto px-4 mt-2">
        <Button asChild variant="ghost" size="sm"><Link to={upgrade ? "/profile" : "/post"}><ArrowLeft className="h-4 w-4" />Volver</Link></Button>
      </div>
      <main className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="text-center lg:text-left space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary">
            {upgrade ? "Quiero publicar propiedades" : "Registro de publicadores"}
          </h1>
          <p className="text-muted-foreground text-lg">
            El flujo para solicitar el rol de publicador todavía no está disponible. Podés revisar el formulario, pero no se enviarán ni guardarán sus datos.
          </p>
        </div>
        <Card className="rounded-2xl bg-gray-50 dark:bg-card min-w-0">
          <CardHeader><CardTitle className="text-2xl font-bold text-center">{upgrade ? "Datos del publicador" : "Registro de publicador"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <UserForm key={upgrade ? "upgrade" : "register"} role="publisher" publisherFields initialUser={user ?? undefined}
              withPassword={!upgrade} readOnlyEmail={upgrade} submitLabel="Consultar disponibilidad"
              onCancel={() => navigate(upgrade ? "/profile" : "/post")}
              onSubmit={() => { setNotice("La solicitud para convertirse en publicador se habilitará próximamente. No se guardaron datos ni se modificó tu rol."); return true; }} />
            {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
