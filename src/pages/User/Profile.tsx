import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeaderUser from "../../components/HeaderUser";
import UserForm from "../../components/UserForm";
import { useAuth } from "../../hooks/use-auth";
import { profileInput } from "../../lib/user-form";
import { roleHome } from "../../lib/auth-navigation";
import { canReapplyPublisherApplication, publisherApplicationStatusLabels } from "../../lib/publisher-application";
import { ApiError } from "../../services/api";
import { getMyPublisherApplication } from "../../services/publisherApplicationService";
import type { PublisherApplication } from "../../types/publisher-application";
import type { UserFormValues } from "../../types/user";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

const roleLabels = { interested: "Interesado", publisher: "Publicador", admin: "Administrador" } as const;
const statusLabels = { active: "Activa", disabled: "Deshabilitada" } as const;

export default function Profile() {
  const { user, updateProfile, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [serverErrors, setServerErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({});
  const [application, setApplication] = useState<PublisherApplication | null>(null);
  const [isLoadingApplication, setIsLoadingApplication] = useState(false);
  const [applicationError, setApplicationError] = useState("");
  const loadApplication = useCallback(async () => {
    if (user?.role !== "interested") return;
    setIsLoadingApplication(true);
    setApplicationError("");
    try {
      const response = await getMyPublisherApplication();
      setApplication(response.application);
      if (response.application?.status === "approved") await refreshUser();
    } catch (error) {
      setApplicationError(error instanceof ApiError ? error.message : "No se pudo consultar el estado de tu solicitud.");
    } finally {
      setIsLoadingApplication(false);
    }
  }, [refreshUser, user?.role]);

  useEffect(() => { void loadApplication(); }, [loadApplication]);

  if (!user) return null;

  const details = [
    ["Nombre", user.firstName],
    ["Apellido", user.lastName],
    ["Correo electrónico", user.email],
    ["WhatsApp / teléfono", user.phone || "No informado"],
    ["Tipo de usuario", roleLabels[user.role]],
    ["Estado de la cuenta", statusLabels[user.accountStatus]],
  ];

  async function saveProfile(values: UserFormValues) {
    setIsSaving(true);
    setFormError("");
    setServerErrors({});
    try {
      await updateProfile(profileInput(values));
      setEditing(false);
      setSaved(true);
      return true;
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "No se pudo actualizar el perfil. Intentá nuevamente.");
      if (error instanceof ApiError && error.details) setServerErrors(error.details as Partial<Record<keyof UserFormValues, string>>);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  const publisherApplicationCard = (user.role === "interested" || application?.status === "approved") && <Card className="rounded-2xl">
    <CardHeader><CardTitle>Publicar propiedades</CardTitle><CardDescription>Solicitá la habilitación para publicar desde esta cuenta.</CardDescription></CardHeader>
    <CardContent className="space-y-3">
      {isLoadingApplication ? <p role="status">Consultando el estado de tu solicitud...</p> : applicationError ? <><p role="alert">{applicationError}</p><Button variant="outline" onClick={() => void loadApplication()}>Reintentar</Button></> : !application ? <Button asChild><Link to="/become-publisher">Quiero publicar propiedades</Link></Button> : <>
        <p className="font-medium">Estado: {publisherApplicationStatusLabels[application.status]}</p>
        {application.status === "pending" && <p className="text-muted-foreground">Tu solicitud está pendiente de revisión.</p>}
        {application.status === "rejected" && <>
          <p className="text-muted-foreground">Tu solicitud fue rechazada.</p>
          {application.rejectionReason && <p className="text-sm text-muted-foreground">Motivo: {application.rejectionReason}</p>}
          {canReapplyPublisherApplication(application.status) && <Button asChild><Link to="/become-publisher">Volver a solicitar</Link></Button>}
        </>}
        {application.status === "approved" && <><p className="text-muted-foreground">Tu solicitud fue aprobada. Actualizamos tu sesión para habilitar las herramientas de publicador.</p><Button asChild><Link to="/dashboard">Ir al panel de publicador</Link></Button></>}
      </>}
    </CardContent>
  </Card>;

  return (
    <div className="min-h-screen bg-background">
      <HeaderUser />
      <main className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Mi perfil</h1>
          <Button asChild variant="outline"><Link to={roleHome(user.role)}>{user.role === "publisher" ? "Mis propiedades" : user.role === "admin" ? "Administración" : "Volver al catálogo"}</Link></Button>
        </div>
        <Card className="rounded-2xl bg-gray-50 dark:bg-card">
          <CardHeader><CardTitle>Datos personales</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {editing ? <UserForm key={user.updatedAt} role={user.role} initialUser={user} readOnlyEmail submitLabel="Guardar cambios"
              onCancel={() => { setEditing(false); setFormError(""); setServerErrors({}); }} onSubmit={saveProfile}
              isSubmitting={isSaving} formError={formError} serverErrors={serverErrors} /> : <>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {details.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="font-medium break-words">{value}</dd></div>)}
              </dl>
              <Button variant="outline" onClick={() => { setSaved(false); setEditing(true); }}>Editar perfil</Button>
            </>}
            {saved && <p role="status" className="text-sm text-green-700">Perfil actualizado correctamente.</p>}
          </CardContent>
        </Card>
        {publisherApplicationCard}
      </main>
    </div>
  );
}
