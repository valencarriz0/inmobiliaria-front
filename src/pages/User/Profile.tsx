import { useState } from "react";
import { Link } from "react-router-dom";
import HeaderUser from "../../components/HeaderUser";
import UserForm from "../../components/UserForm";
import { useUserPreview } from "../../hooks/use-user-preview";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

export default function Profile() {
  const { user, setUser } = useUserPreview();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  if (!user) return null;
  const publisher = user.role === "publisher";
  const agency = publisher && user.publisherType === "agency";
  const home = publisher ? "/dashboard" : user.role === "admin" ? "/admin" : "/HomePageLogin";
  const details = [
    [agency ? "Nombre del responsable" : "Nombre", user.firstName],
    [agency ? "Apellido del responsable" : "Apellido", user.lastName],
    ["Correo electrónico", user.email],
    ["WhatsApp / teléfono", user.phone || "No informado"],
    ["Tipo de usuario", publisher ? "Publicador" : user.role === "admin" ? "Administrador" : "Interesado"],
    ...(publisher ? [
      ["Tipo de publicador", agency ? "Inmobiliaria" : "Propietario particular"],
      ...(agency ? [["Nombre / Razón social de la inmobiliaria", user.agencyName]] : []),
      [agency ? "CUIT fiscal con el que opera la inmobiliaria" : "CUIT/CUIL del propietario", user.taxId],
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <HeaderUser />
      <main className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Mi perfil</h1>
          <Button asChild variant="outline"><Link to={home}>{publisher ? "Mis propiedades" : user.role === "admin" ? "Administración" : "Volver al catálogo"}</Link></Button>
        </div>
        <p className="text-sm text-muted-foreground">Vista previa. Los cambios solo se conservan durante este recorrido y se descartan al recargar la página.</p>
        <Card className="rounded-2xl bg-gray-50 dark:bg-card">
          <CardHeader><CardTitle>Datos personales</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            {editing ? <UserForm role={user.role} initialUser={user} readOnlyEmail submitLabel="Guardar en vista previa"
              onCancel={() => setEditing(false)} onSubmit={(profile) => { setUser(profile); setEditing(false); setSaved(true); }} /> : <>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {details.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="font-medium break-words">{value}</dd></div>)}
              </dl>
              <Button variant="outline" onClick={() => { setSaved(false); setEditing(true); }}>Editar perfil</Button>
            </>}
            {saved && <p role="status" className="text-sm text-muted-foreground">Cambios aplicados a la vista previa.</p>}
          </CardContent>
        </Card>
        {user.role === "interested" && <Card className="rounded-2xl">
          <CardHeader><CardTitle>Publicá tus propiedades</CardTitle><CardDescription>Completá tus datos de publicador desde esta misma cuenta.</CardDescription></CardHeader>
          <CardContent><Button asChild className="h-auto min-h-9 whitespace-normal text-center"><Link to="/become-publisher">Quiero publicar propiedades</Link></Button></CardContent>
        </Card>}
      </main>
    </div>
  );
}
