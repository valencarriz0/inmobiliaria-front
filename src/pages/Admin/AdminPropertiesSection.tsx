import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, MapPin, MoreVertical, Pause, Play, Trash2 } from "lucide-react";
import SearchBarAdmin, { type AdminPropertyFilters } from "../../components/SearchBarAdmin";
import { CardListSkeleton } from "../../components/LoadingSkeletons";
import { Button } from "../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { FieldError } from "../../components/ui/field-error";
import { OPERATION_TYPES, PUBLICATION_STATUSES } from "../../constants/property";
import { formatPrice } from "../../lib/formatters";
import { ADMIN_PROPERTY_STATUS_CHANGED, type AdminPropertyStatusChange } from "../../lib/admin-property-events";
import { adminService } from "../../services/adminService";
import type { AdminProperty, AdminUser } from "../../types/admin";

const initialFilters: AdminPropertyFilters = { q: "", status: "all", operationType: "all" };
type AdminPublicationAction = { property: AdminProperty; kind: "pause" | "reactivate" | "delete" };

function publicationLocation(property: AdminProperty) {
  return [property.city?.name, property.province?.name].filter(Boolean).join(", ") || "Ubicación no informada";
}

export function AdminPropertiesSection() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [publishers, setPublishers] = useState<AdminUser[]>([]);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [action, setAction] = useState<AdminPublicationAction | null>(null);
  const [actionError, setActionError] = useState("");
  const [savingAction, setSavingAction] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminService.properties({
        q: filters.q || undefined,
        status: filters.status,
        operationType: filters.operationType === "all" ? undefined : filters.operationType,
        page: "1",
        limit: "20",
      });
      setProperties(response.properties);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudieron cargar las publicaciones.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    void adminService.users({ role: "publisher", status: "active", page: "1", limit: "100" })
      .then((result) => setPublishers(result.users))
      .catch(() => setPublishers([]));
  }, []);

  const publisherName = (id: string) => {
    const publisher = publishers.find((item) => item.id === id);
    return publisher ? `${publisher.firstName} ${publisher.lastName}` : "Publicador";
  };

  const runAction = async () => {
    if (!action || savingAction) return;
    setSavingAction(true);
    setActionError("");
    try {
      if (action.kind === "pause") await adminService.pauseProperty(action.property.id);
      else if (action.kind === "reactivate") await adminService.reactivateProperty(action.property.id);
      else await adminService.deleteProperty(action.property.id);
      const nextStatus = action.kind === "pause" ? "paused" : action.kind === "reactivate" ? "active" : "deleted";
      setProperties((items) => items.flatMap((property) => {
        if (property.id !== action.property.id) return [property];
        if (filters.status !== "all" && filters.status !== nextStatus) return [];
        return [{ ...property, publicationStatus: nextStatus }];
      }));
      window.dispatchEvent(new CustomEvent<AdminPropertyStatusChange>(ADMIN_PROPERTY_STATUS_CHANGED, {
        detail: { before: action.property.publicationStatus, after: nextStatus },
      }));
      setAction(null);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "No se pudo completar la operación.");
    } finally {
      setSavingAction(false);
    }
  };

  const selectAction = (property: AdminProperty, kind: AdminPublicationAction["kind"]) => {
    setActionError("");
    setAction({ property, kind });
  };

  return <section className="publisher-panel publisher-listings-panel admin-publications-panel" aria-label="Publicaciones" aria-busy={loading}>
    <SearchBarAdmin filters={filters} onChange={setFilters} />

    {error ? <div className="publisher-empty-state publisher-consultation-error" role="alert">
      <span>{error}</span>
      <Button variant="outline" onClick={() => void load()}>Reintentar</Button>
    </div> : loading ? <CardListSkeleton label="Cargando publicaciones..." variant="listings" count={3} /> : properties.length === 0 ? (
      <p className="publisher-empty-state" role="status">No hay publicaciones que coincidan con la búsqueda.</p>
    ) : <div className="publisher-listing-list publisher-listing-grid">
      {properties.map((property) => <article className="publisher-listing-card admin-publication-card" key={property.id}>
        {property.images[0] ? <img src={property.images[0]} alt="" /> : <div className="admin-publication-image-placeholder" aria-hidden="true" />}
        <div className="publisher-listing-copy">
          <div className="publisher-listing-title-row">
            <Link className="publisher-listing-title-link" to={`/admin/properties/${property.id}`}><strong>{property.title}</strong></Link>
          </div>
          <span className="admin-publication-price">{formatPrice(Number(property.price), property.currency)}</span>
          <div className="admin-publication-details">
            <span>{publisherName(property.publisherId)}</span>
            <span><MapPin size={14} aria-hidden="true" />{publicationLocation(property)}</span>
          </div>
        </div>
        <div className="publisher-listing-meta admin-publication-meta">
          <span className={`publisher-operation-badge is-${property.operationType}`}>{OPERATION_TYPES[property.operationType]}</span>
          <span className={`publisher-status ${property.publicationStatus === "active" ? "is-active" : property.publicationStatus === "paused" ? "is-paused" : "is-deleted"}`}>{PUBLICATION_STATUSES[property.publicationStatus]}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="publisher-listing-menu-trigger" type="button" aria-label={`Acciones para ${property.title}`} disabled={savingAction}><MoreVertical size={19} aria-hidden="true" /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild><Link to={`/admin/properties/${property.id}`}><Eye /> Ver detalle</Link></DropdownMenuItem>
              {property.publicationStatus === "active" && <DropdownMenuItem onSelect={() => selectAction(property, "pause")}><Pause /> Pausar</DropdownMenuItem>}
              {property.publicationStatus === "paused" && <DropdownMenuItem onSelect={() => selectAction(property, "reactivate")}><Play /> Reactivar</DropdownMenuItem>}
              {property.publicationStatus !== "deleted" && <DropdownMenuItem variant="destructive" onSelect={() => selectAction(property, "delete")}><Trash2 /> Eliminar</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </article>)}
    </div>}
    {!loading && !error && properties.length > 0 && <p className="admin-publications-count">Se muestran hasta 20 publicaciones.</p>}
    <AlertDialog open={Boolean(action)} onOpenChange={(open) => { if (!open && !savingAction) setAction(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{action?.kind === "delete" ? "¿Eliminar publicación?" : action?.kind === "pause" ? "¿Pausar publicación?" : "¿Reactivar publicación?"}</AlertDialogTitle>
          <AlertDialogDescription>{action?.kind === "delete" ? `“${action.property.title}” se quitará del catálogo.` : action?.kind === "pause" ? `“${action.property.title}” dejará de aparecer en el catálogo hasta que se reactive.` : `“${action?.property.title ?? "La publicación"}” volverá a estar activa.`}</AlertDialogDescription>
        </AlertDialogHeader>
        <FieldError>{actionError}</FieldError>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={savingAction}>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={savingAction} className={action?.kind === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""} onClick={(event) => { event.preventDefault(); void runAction(); }}>{savingAction ? "Procesando..." : "Confirmar"}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>;
}
