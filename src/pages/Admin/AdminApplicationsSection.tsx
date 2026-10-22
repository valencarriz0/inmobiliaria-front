import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Building2, Check, IdCard, Mail, Phone, UserRound, X } from "lucide-react";
import { CardListSkeleton } from "../../components/LoadingSkeletons";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { formatDate } from "../../lib/formatters";
import { publisherApplicationStatusLabels } from "../../lib/publisher-application";
import { ApiError } from "../../services/api";
import { approvePublisherApplication, getAdminPublisherApplications, rejectPublisherApplication } from "../../services/publisherApplicationService";
import type { PublisherApplicationStatus, PublisherApplicationWithApplicant } from "../../types/publisher-application";

const statuses: PublisherApplicationStatus[] = ["pending", "approved", "rejected"];
const emptyStatusLabels: Record<PublisherApplicationStatus, string> = { pending: "pendientes", approved: "aprobadas", rejected: "rechazadas" };
const message = (error: unknown) => error instanceof ApiError ? error.message : "No se pudo completar la operación. Intentá nuevamente.";

function initials(item: PublisherApplicationWithApplicant) {
  return `${item.applicant.firstName.charAt(0)}${item.applicant.lastName.charAt(0)}`.toUpperCase();
}

export function AdminApplicationsSection() {
  const [status, setStatus] = useState<PublisherApplicationStatus>("pending");
  const [applications, setApplications] = useState<PublisherApplicationWithApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resolving, setResolving] = useState<string | null>(null);
  const [approving, setApproving] = useState<PublisherApplicationWithApplicant | null>(null);
  const [rejecting, setRejecting] = useState<PublisherApplicationWithApplicant | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setApplications((await getAdminPublisherApplications(status)).applications);
    } catch (err) {
      setError(message(err));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  const approve = async () => {
    if (!approving || resolving) return;
    setResolving(approving.id);
    setNotice("");
    try {
      await approvePublisherApplication(approving.id);
      setApproving(null);
      setNotice("Solicitud aprobada correctamente.");
      await load();
    } catch (err) {
      setError(message(err));
    } finally {
      setResolving(null);
    }
  };

  const reject = async (event: FormEvent) => {
    event.preventDefault();
    if (!rejecting || resolving) return;
    setResolving(rejecting.id);
    setNotice("");
    try {
      await rejectPublisherApplication(rejecting.id, reason);
      setRejecting(null);
      setReason("");
      setNotice("Solicitud rechazada correctamente.");
      await load();
    } catch (err) {
      setError(message(err));
    } finally {
      setResolving(null);
    }
  };

  return <section className="admin-management-panel admin-applications-panel" aria-labelledby="admin-applications-title">
    <div className="publisher-panel-heading admin-section-heading">
      <div><h2 id="admin-applications-title">Revisión de solicitudes</h2><p>Altas para propietarios e inmobiliarias</p></div>
      <div className="publisher-listing-sort-control admin-application-filter">
        <label htmlFor="admin-application-status">Estado</label>
        <Select value={status} onValueChange={(value) => { setStatus(value as PublisherApplicationStatus); setNotice(""); }}>
          <SelectTrigger id="admin-application-status" aria-label="Filtrar solicitudes por estado"><SelectValue /></SelectTrigger>
          <SelectContent>{statuses.map((value) => <SelectItem key={value} value={value}>{publisherApplicationStatusLabels[value]}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>

    {notice && <p className="admin-success-notice" role="status">{notice}</p>}
    {error && <div className="publisher-empty-state publisher-consultation-error" role="alert"><span>{error}</span><Button variant="outline" onClick={() => void load()}>Reintentar</Button></div>}
    {loading ? <CardListSkeleton label="Cargando solicitudes..." variant="consultations" count={3} /> : !error && applications.length === 0 ? (
      <div className="publisher-empty-state" role="status"><UserRound size={22} /><span>No hay solicitudes {emptyStatusLabels[status]}.</span></div>
    ) : !error && <div className="publisher-consultation-list admin-application-list">
      {applications.map((item) => <article className={`publisher-consultation-card admin-application-card ${item.status === "pending" ? "is-new" : ""}`} key={item.id}>
        <div className="publisher-consultation-topline">
          <span className="publisher-avatar" aria-hidden="true">{initials(item)}</span>
          <div className="publisher-consultation-heading">
            <strong>{item.applicant.firstName} {item.applicant.lastName}</strong>
            <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
          </div>
          <span className={`publisher-status admin-application-status is-${item.status}`}>{publisherApplicationStatusLabels[item.status]}</span>
        </div>

        <div className="admin-application-details">
          <span><Mail size={15} aria-hidden="true" /><span><small>Email</small>{item.applicant.email}</span></span>
          <span><Phone size={15} aria-hidden="true" /><span><small>Teléfono</small>{item.phone}</span></span>
          <span>{item.publisherType === "agency" ? <Building2 size={15} aria-hidden="true" /> : <UserRound size={15} aria-hidden="true" />}<span><small>Tipo</small>{item.publisherType === "agency" ? item.agencyName ?? "Inmobiliaria" : "Propietario particular"}</span></span>
          <span><IdCard size={15} aria-hidden="true" /><span><small>CUIT/CUIL</small>{item.taxId}</span></span>
        </div>

        {item.rejectionReason && <p className="admin-application-reason"><X size={14} aria-hidden="true" /><span><strong>Motivo del rechazo</strong>{item.rejectionReason}</span></p>}
        {item.status === "pending" && <div className="publisher-consultation-actions admin-application-actions">
          <button className="publisher-consultation-action admin-application-approve" type="button" disabled={resolving === item.id} onClick={() => setApproving(item)}><Check size={14} aria-hidden="true" />Aprobar</button>
          <button className="publisher-consultation-action is-subtle" type="button" disabled={resolving === item.id} onClick={() => { setRejecting(item); setReason(""); }}><X size={14} aria-hidden="true" />Rechazar</button>
        </div>}
      </article>)}
    </div>}

    <AlertDialog open={Boolean(approving)} onOpenChange={(open) => { if (!open && !resolving) setApproving(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>¿Aprobar solicitud?</AlertDialogTitle><AlertDialogDescription>{approving ? `${approving.applicant.firstName} ${approving.applicant.lastName} pasará a tener una cuenta de publicador.` : "La cuenta será habilitada como publicador."}</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel disabled={Boolean(resolving)}>Cancelar</AlertDialogCancel><AlertDialogAction disabled={Boolean(resolving)} onClick={(event) => { event.preventDefault(); void approve(); }}>{resolving ? "Procesando..." : "Aprobar"}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog open={Boolean(rejecting)} onOpenChange={(open) => { if (!open && !resolving) setRejecting(null); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Rechazar solicitud</DialogTitle><DialogDescription>El motivo es opcional y será visible para la persona solicitante.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={reject}>
          <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Motivo del rechazo (opcional)" disabled={Boolean(resolving)} />
          <DialogFooter><Button type="button" variant="outline" onClick={() => setRejecting(null)} disabled={Boolean(resolving)}>Cancelar</Button><Button type="submit" disabled={Boolean(resolving)}>{resolving ? "Procesando..." : "Confirmar rechazo"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </section>;
}
