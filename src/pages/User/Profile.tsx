import { useState } from "react";
import { Link } from "react-router-dom";
import HeaderUser from "../../components/HeaderUser";
import UserForm from "../../components/UserForm";
import { useAuth } from "../../hooks/use-auth";
import { profileInput } from "../../lib/user-form";
import { roleHome } from "../../lib/auth-navigation";
import { ApiError } from "../../services/api";
import type { UserFormValues } from "../../types/user";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

const roleLabels = { interested: "Interesado", publisher: "Publicador", admin: "Administrador" } as const;
const statusLabels = { active: "Activa", disabled: "Deshabilitada" } as const;

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [serverErrors, setServerErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({});
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
      if (error instanceof ApiError && error.details) {
        setServerErrors(error.details as Partial<Record<keyof UserFormValues, string>>);
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  }

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
        {user.role === "interested" && <Card className="rounded-2xl">
          <CardHeader><CardTitle>Publicá tus propiedades</CardTitle><CardDescription>La solicitud para convertirse en publicador se habilitará próximamente.</CardDescription></CardHeader>
          <CardContent><Button asChild className="h-auto min-h-9 whitespace-normal text-center"><Link to="/become-publisher">Quiero publicar propiedades</Link></Button></CardContent>
        </Card>}
      </main>
    </div>
  );
}
