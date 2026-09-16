import { useCallback, useEffect, useState, type FormEvent } from "react";
import HeaderUser from "../../components/HeaderUser";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { formatDate } from "../../lib/formatters";
import { publisherApplicationStatusLabels } from "../../lib/publisher-application";
import { ApiError } from "../../services/api";
import { approvePublisherApplication, getAdminPublisherApplications, rejectPublisherApplication } from "../../services/publisherApplicationService";
import type { PublisherApplicationStatus, PublisherApplicationWithApplicant } from "../../types/publisher-application";
import { AdminMetricsSection, AdminUsersSection } from "./AdminSections";
import { AdminPropertiesSection } from "./AdminPropertiesSection";

const statuses: PublisherApplicationStatus[] = ["pending", "approved", "rejected"];

function messageFrom(error: unknown) {
  return error instanceof ApiError ? error.message : "No se pudo completar la operación. Intentá nuevamente.";
}

export default function AdminDashboard() {
  const [section, setSection] = useState<"applications" | "users" | "properties" | "metrics">("applications");
  const [status, setStatus] = useState<PublisherApplicationStatus>("pending");
  const [applications, setApplications] = useState<PublisherApplicationWithApplicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [rejectingApplication, setRejectingApplication] = useState<PublisherApplicationWithApplicant | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getAdminPublisherApplications(status);
      setApplications(response.applications);
    } catch (requestError) {
      setError(messageFrom(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => { void loadApplications(); }, [loadApplications]);

  async function approve(application: PublisherApplicationWithApplicant) {
    if (!window.confirm(`¿Aprobar la solicitud de ${application.applicant.firstName} ${application.applicant.lastName}?`)) return;
    setResolvingId(application.id);
    setNotice("");
    setError("");
    try {
      await approvePublisherApplication(application.id);
      setNotice("Solicitud aprobada correctamente.");
      await loadApplications();
    } catch (requestError) {
      setError(messageFrom(requestError));
      if (requestError instanceof ApiError && requestError.status === 409) await loadApplications();
    } finally {
      setResolvingId(null);
    }
  }

  async function reject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rejectingApplication) return;
    setResolvingId(rejectingApplication.id);
    setNotice("");
    setError("");
    try {
      await rejectPublisherApplication(rejectingApplication.id, rejectionReason);
      setRejectingApplication(null);
      setRejectionReason("");
      setNotice("Solicitud rechazada correctamente.");
      await loadApplications();
    } catch (requestError) {
      setError(messageFrom(requestError));
      if (requestError instanceof ApiError && requestError.status === 409) {
        setRejectingApplication(null);
        await loadApplications();
      }
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderUser />
      <main className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div className="space-y-2"><h1 className="text-3xl font-bold">Administración</h1><p className="text-muted-foreground">Gestioná solicitudes, usuarios, publicaciones y métricas del sistema.</p></div>
        <div className="flex flex-wrap gap-2">{[["applications", "Solicitudes"], ["users", "Usuarios"], ["properties", "Publicaciones"], ["metrics", "Métricas"]].map(([value, label]) => <Button key={value} variant={section === value ? "default" : "outline"} onClick={() => setSection(value as typeof section)}>{label}</Button>)}</div>
        {section === "users" ? <AdminUsersSection /> : section === "properties" ? <AdminPropertiesSection /> : section === "metrics" ? <AdminMetricsSection /> : <>
        <div className="flex flex-wrap gap-2" aria-label="Filtrar solicitudes por estado">
          {statuses.map((value) => <Button key={value} variant={status === value ? "default" : "outline"} onClick={() => { setStatus(value); setNotice(""); }}>{publisherApplicationStatusLabels[value]}</Button>)}
        </div>
        {notice && <p role="status" className="text-sm text-green-700">{notice}</p>}
        {error && <div className="space-y-3"><p role="alert">{error}</p><Button variant="outline" onClick={() => void loadApplications()}>Reintentar</Button></div>}
        {isLoading ? <p role="status">Cargando solicitudes...</p> : !error && applications.length === 0 ? <Card><CardContent className="py-8 text-center text-muted-foreground">No hay solicitudes {publisherApplicationStatusLabels[status].toLowerCase()}.</CardContent></Card> : <div className="grid gap-4">
          {applications.map((application) => <Card key={application.id}>
            <CardHeader className="space-y-2"><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle>{application.applicant.firstName} {application.applicant.lastName}</CardTitle><Badge>{publisherApplicationStatusLabels[application.status]}</Badge></div><p className="text-sm text-muted-foreground">Solicitada el {formatDate(application.createdAt)}</p></CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                <div><dt className="text-muted-foreground">Correo electrónico</dt><dd>{application.applicant.email}</dd></div>
                <div><dt className="text-muted-foreground">Teléfono solicitado</dt><dd>{application.phone}</dd></div>
                <div><dt className="text-muted-foreground">Tipo de publicador</dt><dd>{application.publisherType === "agency" ? "Inmobiliaria" : "Propietario particular"}</dd></div>
                <div><dt className="text-muted-foreground">CUIT/CUIL</dt><dd>{application.taxId}</dd></div>
                {application.agencyName && <div><dt className="text-muted-foreground">Razón social</dt><dd>{application.agencyName}</dd></div>}
                {application.reviewedAt && <div><dt className="text-muted-foreground">Fecha de revisión</dt><dd>{formatDate(application.reviewedAt)}</dd></div>}
              </dl>
              {application.rejectionReason && <p className="text-sm text-muted-foreground">Motivo del rechazo: {application.rejectionReason}</p>}
              {application.status === "pending" && <div className="flex flex-wrap gap-2"><Button disabled={resolvingId === application.id} onClick={() => void approve(application)}>{resolvingId === application.id ? "Procesando..." : "Aprobar"}</Button><Button variant="outline" disabled={resolvingId === application.id} onClick={() => { setRejectingApplication(application); setRejectionReason(""); }}>Rechazar</Button></div>}
            </CardContent>
          </Card>)}
        </div>}</>}
      </main>
      <Dialog open={Boolean(rejectingApplication)} onOpenChange={(open) => { if (!open && !resolvingId) setRejectingApplication(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rechazar solicitud</DialogTitle><DialogDescription>El motivo es opcional y será visible para la persona solicitante.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={reject}>
            <Textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Motivo del rechazo (opcional)" disabled={Boolean(resolvingId)} />
            <DialogFooter><Button type="button" variant="outline" onClick={() => setRejectingApplication(null)} disabled={Boolean(resolvingId)}>Cancelar</Button><Button type="submit" disabled={Boolean(resolvingId)}>{resolvingId ? "Procesando..." : "Confirmar rechazo"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
