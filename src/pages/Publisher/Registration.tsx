import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "../../components/Header";
import UserForm from "../../components/UserForm";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/use-auth";
import { ApiError } from "../../services/api";
import { createPublisherApplication, getMyPublisherApplication } from "../../services/publisherApplicationService";
import { canReapplyPublisherApplication, publisherApplicationStatusLabels } from "../../lib/publisher-application";
import { publicPublisherApplicationInput, publisherApplicationInput } from "../../lib/user-form";
import type { PublisherApplication } from "../../types/publisher-application";
import type { UserFormValues } from "../../types/user";

function messageFrom(error: unknown) {
  return error instanceof ApiError ? error.message : "No se pudo completar la solicitud. Intentá nuevamente.";
}

export default function PublisherRegistration({ mode }: { mode: "visitor" | "interested" }) {
  const navigate = useNavigate();
  const { user, refreshUser, registerPublicPublisherApplication } = useAuth();
  const [application, setApplication] = useState<PublisherApplication | null>(null);
  const [isLoadingApplication, setIsLoadingApplication] = useState(mode === "interested");
  const [applicationError, setApplicationError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const upgrade = mode === "interested";

  const loadApplication = useCallback(async () => {
    if (!upgrade || !user) return;
    setIsLoadingApplication(true);
    setApplicationError("");
    try {
      const response = await getMyPublisherApplication();
      setApplication(response.application);
      if (response.application?.status === "approved") {
        const refreshedUser = await refreshUser();
        if (refreshedUser?.role === "publisher") navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      setApplicationError(messageFrom(error));
    } finally {
      setIsLoadingApplication(false);
    }
  }, [navigate, refreshUser, upgrade, user]);

  useEffect(() => { void loadApplication(); }, [loadApplication]);

  if (mode === "visitor" && user) return <Navigate to="/profile" replace />;
  if (mode === "interested" && user?.role !== "interested") return <Navigate to="/profile" replace />;

  async function submitPublic(values: UserFormValues) {
    setIsSubmitting(true);
    setFormError("");
    try {
      await registerPublicPublisherApplication(publicPublisherApplicationInput(values));
      navigate("/profile", { replace: true });
      return true;
    } catch (error) {
      setFormError(messageFrom(error));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitAuthenticated(values: UserFormValues) {
    setIsSubmitting(true);
    setFormError("");
    try {
      const response = await createPublisherApplication(publisherApplicationInput(values));
      setApplication(response.application);
      return true;
    } catch (error) {
      setFormError(messageFrom(error));
      if (error instanceof ApiError && error.status === 409) await loadApplication();
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  const applicationStatus = application && <Card className="rounded-2xl bg-gray-50 dark:bg-card">
    <CardHeader><CardTitle>Solicitud {publisherApplicationStatusLabels[application.status]}</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      {application.status === "pending" && <p>Tu solicitud está pendiente de revisión.</p>}
      {application.status === "approved" && <><p>Tu solicitud fue aprobada. Actualizá tu sesión para acceder a las funciones de publicador.</p><Button onClick={() => void loadApplication()}>Actualizar estado</Button></>}
      {application.status === "rejected" && <>
        <p>Tu solicitud fue rechazada.</p>
        {application.rejectionReason && <p className="text-sm text-muted-foreground">Motivo: {application.rejectionReason}</p>}
        {canReapplyPublisherApplication(application.status) && <Button onClick={() => { setApplication(null); setFormError(""); }}>Volver a solicitar</Button>}
      </>}
    </CardContent>
  </Card>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header page="/post" />
      <div className="container mx-auto px-4 mt-2">
        <Button asChild variant="ghost" size="sm"><Link to={upgrade ? "/profile" : "/post"}><ArrowLeft className="h-4 w-4" />Volver</Link></Button>
      </div>
      <main className="flex-1 container mx-auto max-w-3xl px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary">{upgrade ? "Quiero publicar propiedades" : "Registro de publicadores"}</h1>
          <p className="text-muted-foreground text-lg">Completá los datos para solicitar la habilitación como publicador.</p>
        </div>
        {upgrade && isLoadingApplication ? <p role="status" className="text-center">Consultando el estado de tu solicitud...</p> : null}
        {upgrade && applicationError ? <div className="space-y-3 text-center"><p role="alert">{applicationError}</p><Button variant="outline" onClick={() => void loadApplication()}>Reintentar</Button></div> : null}
        {applicationStatus}
        {!isLoadingApplication && !applicationError && !application && <Card className="rounded-2xl bg-gray-50 dark:bg-card min-w-0">
          <CardHeader><CardTitle className="text-2xl font-bold text-center">{upgrade ? "Datos del publicador" : "Registro de publicador"}</CardTitle></CardHeader>
          <CardContent>
            <UserForm key={upgrade ? "upgrade" : "register"} role="publisher" publisherFields initialUser={user ?? undefined}
              withPassword={!upgrade} readOnlyEmail={upgrade} submitLabel="Enviar solicitud"
              onCancel={() => navigate(upgrade ? "/profile" : "/post")}
              onSubmit={upgrade ? submitAuthenticated : submitPublic} isSubmitting={isSubmitting} formError={formError} />
          </CardContent>
        </Card>}
      </main>
    </div>
  );
}
