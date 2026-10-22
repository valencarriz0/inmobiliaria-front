import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Eye,
  MessageCircle,
  MoreVertical,
  Plus,
  Pause,
  Pencil,
  Play,
  Trash2,
} from "lucide-react";
import HeaderUser from "../../components/HeaderUser";
import ConsultationCard from "../../components/ConsultationCard";
import { CardListSkeleton } from "../../components/LoadingSkeletons";
import { Skeleton } from "../../components/ui/skeleton";
import { usePublisherProperties } from "../../hooks/use-publisher-properties";
import { getPublisherMetrics, type PublisherMetrics } from "../../services/publisherMetricsService";
import { publisherPropertyService } from "../../services/publisherPropertyService";
import { consultationService } from "../../services/consultationService";
import { notificationService, type AppNotification } from "../../services/notificationService";
import { formatPrice } from "../../lib/formatters";
import { OPERATION_TYPES, PUBLICATION_STATUSES } from "../../constants/property";
import type { Consultation } from "../../types/consultation";
import type { PublisherProperty } from "../../types/publisher-property";
import GeneralStatisticsTab from "./GeneralStatisticsTab";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { FieldError } from "../../components/ui/field-error";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import "./HomePublisher.css";

const numberFormat = new Intl.NumberFormat("es-AR");
type PublisherPropertySort = "recent" | "oldest" | "price-desc" | "price-asc" | "views" | "consultations";

export default function PublisherDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"listings" | "consultations" | "stats">(() => {
    const initialTab = searchParams.get("tab");
    return initialTab === "consultations" || initialTab === "stats" ? initialTab : "listings";
  });
  const [propertySort, setPropertySort] = useState<PublisherPropertySort>("recent");
  const { properties, loading, error, applyPropertyStatus } = usePublisherProperties();
  const [metrics, setMetrics] = useState<PublisherMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [consultationNotifications, setConsultationNotifications] = useState<AppNotification[]>([]);
  const [consultationsLoading, setConsultationsLoading] = useState(true);
  const [consultationError, setConsultationError] = useState("");
  const [consultationRetry, setConsultationRetry] = useState(0);
  const [metricsError, setMetricsError] = useState(false);
  const [actionProperty, setActionProperty] = useState<PublisherProperty | null>(null);
  const [action, setAction] = useState<"pause" | "delete" | null>(null);
  const [actionError, setActionError] = useState("");
  const [savingAction, setSavingAction] = useState(false);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (requestedTab === "consultations" || requestedTab === "stats") setActiveTab(requestedTab);
    else setActiveTab("listings");
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    void getPublisherMetrics().then((result) => {
      if (active) setMetrics(result);
    }).catch(() => {
      if (active) setMetricsError(true);
    }).finally(() => {
      if (active) setMetricsLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setConsultationsLoading(true);
    const loadConsultations = async () => {
      const [consultationResult, notificationResult] = await Promise.allSettled([
        consultationService.publisher(undefined, controller.signal),
        notificationService.list(),
      ]);
      if (!active) return;
      if (consultationResult.status === "fulfilled") {
        setConsultations(consultationResult.value);
        setConsultationError("");
      } else if (!controller.signal.aborted) {
        setConsultationError("No se pudieron cargar las consultas recibidas.");
      }
      if (notificationResult.status === "fulfilled") {
        setConsultationNotifications(notificationResult.value.notifications.filter((notification) => notification.type === "new_consultation"));
      }
      setConsultationsLoading(false);
    };
    void loadConsultations();
    const pollId = window.setInterval(() => {
      if (document.visibilityState === "visible" && !controller.signal.aborted) void loadConsultations();
    }, 30_000);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(pollId);
    };
  }, [consultationRetry]);

  const topProperty = metrics?.mostViewed;
  const sortedProperties = useMemo(() => [...properties].sort((first, second) => {
    const firstMetric = metrics?.properties.find((item) => item.propertyId === first.id);
    const secondMetric = metrics?.properties.find((item) => item.propertyId === second.id);
    if (propertySort === "oldest") return Date.parse(first.createdAt) - Date.parse(second.createdAt);
    if (propertySort === "price-desc") return second.price - first.price;
    if (propertySort === "price-asc") return first.price - second.price;
    if (propertySort === "views") return (secondMetric?.views ?? 0) - (firstMetric?.views ?? 0);
    if (propertySort === "consultations") return (secondMetric?.consultations ?? 0) - (firstMetric?.consultations ?? 0);
    return Date.parse(second.createdAt) - Date.parse(first.createdAt);
  }), [properties, metrics, propertySort]);
  const newConsultationIds = useMemo(() => new Set(consultationNotifications.filter((notification) => !notification.readAt && notification.consultationId).map((notification) => notification.consultationId as string)), [consultationNotifications]);
  const newConsultationCount = newConsultationIds.size;

  const selectTab = (tab: "listings" | "consultations" | "stats") => {
    setActiveTab(tab);
    const nextParams = new URLSearchParams(searchParams);
    if (tab === "listings") nextParams.delete("tab");
    else nextParams.set("tab", tab);
    setSearchParams(nextParams, { replace: true });
  };

  const markConsultationSeen = async (consultationId: string) => {
    const notification = consultationNotifications.find((item) => item.consultationId === consultationId && !item.readAt);
    if (!notification) return;
    try {
      await notificationService.read(notification.id);
      setConsultationNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item));
      window.dispatchEvent(new Event("inmuconnect:notifications-updated"));
    } catch {
      setActionError("No se pudo marcar la consulta como vista.");
    }
  };

  const runPropertyAction = async () => {
    if (!actionProperty || !action || savingAction) return;
    setSavingAction(true);
    setActionError("");
    try {
      if (action === "pause") await publisherPropertyService.pause(actionProperty.id);
      else await publisherPropertyService.remove(actionProperty.id);
      applyPropertyStatus(actionProperty.id, action === "pause" ? "paused" : "deleted");
      setAction(null);
      setActionProperty(null);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "No se pudo completar la acción. Intentá nuevamente.");
    } finally {
      setSavingAction(false);
    }
  };

  const reactivateProperty = async (property: PublisherProperty) => {
    if (savingAction) return;
    setSavingAction(true);
    setActionError("");
    try {
      await publisherPropertyService.reactivate(property.id);
      applyPropertyStatus(property.id, "active");
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : "No se pudo reactivar la publicación.");
    } finally {
      setSavingAction(false);
    }
  };

  return (
    <div className="publisher-dashboard-page">
      <HeaderUser />
      <main className="publisher-dashboard">
        {(error || metricsError || actionError) && <p className="publisher-inline-error" role="alert">{actionError || error || "No se pudieron cargar las métricas. Podés volver a intentarlo desde Estadísticas."}</p>}

        <section className="publisher-workspace" aria-label="Gestión de publicaciones">
          <div className="publisher-tabs" role="tablist" aria-label="Secciones del panel">
            {([
              ["listings", "Mis publicaciones"],
              ["consultations", "Consultas"],
              ["stats", "Estadísticas"],
            ] as const).map(([tab, label]) => (
              <button
                className={`publisher-tab ${activeTab === tab ? "is-selected" : ""}`}
                id={`publisher-tab-${tab}`}
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls="publisher-tabpanel"
                tabIndex={activeTab === tab ? 0 : -1}
                onClick={() => selectTab(tab)}
                onKeyDown={(event) => {
                  const tabs = ["listings", "consultations", "stats"] as const;
                  const currentIndex = tabs.indexOf(activeTab);
                  const nextIndex = event.key === "ArrowRight" ? (currentIndex + 1) % tabs.length : event.key === "ArrowLeft" ? (currentIndex - 1 + tabs.length) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
                  if (nextIndex !== -1) {
                    event.preventDefault();
                    selectTab(tabs[nextIndex]);
                    document.getElementById(`publisher-tab-${tabs[nextIndex]}`)?.focus();
                  }
                }}
              >
                {label}
                {tab === "consultations" && newConsultationCount > 0 && <span className="publisher-tab-count" aria-label={`${newConsultationCount} consultas nuevas`}>{newConsultationCount}</span>}
              </button>
            ))}
          </div>

          <div className="publisher-tabpanel" id="publisher-tabpanel" role="tabpanel" aria-labelledby={`publisher-tab-${activeTab}`}>
            {activeTab === "listings" && (
              <article className="publisher-panel publisher-listings-panel">
                <div className="publisher-panel-heading">
                  <div>
                    <h1>Mis publicaciones</h1>
                    <p>{properties.length} propiedades en total</p>
                  </div>
                  <div className="publisher-listing-toolbar">
                    <div className="publisher-listing-sort-control">
                      <label htmlFor="publisher-listing-sort">Ordenar por</label>
                      <Select value={propertySort} onValueChange={(value) => setPropertySort(value as PublisherPropertySort)}>
                        <SelectTrigger id="publisher-listing-sort" aria-label="Ordenar publicaciones"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Más recientes</SelectItem>
                          <SelectItem value="oldest">Más antiguas</SelectItem>
                          <SelectItem value="price-desc">Mayor precio</SelectItem>
                          <SelectItem value="price-asc">Menor precio</SelectItem>
                          <SelectItem value="views">Más vistas</SelectItem>
                          <SelectItem value="consultations">Más consultas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Link className="publisher-new-publication-button" to="/newProperty"><Plus size={19} /> Nueva publicación</Link>
                  </div>
                </div>
                <div className="publisher-listing-list publisher-listing-grid">
                  {loading ? <CardListSkeleton label="Cargando publicaciones..." variant="listings" /> : sortedProperties.length ? sortedProperties.map((property) => {
                    const status = PUBLICATION_STATUSES[property.publicationStatus] ?? "Pendiente";
                    const metric = metrics?.properties.find((item) => item.propertyId === property.id);
                    const isMostViewed = topProperty?.propertyId === property.id;
                    return (
                      <article className="publisher-listing-card" key={property.id}>
                        <img src={property.images[0]} alt={property.title} />
                        <div className="publisher-listing-copy">
                          <div className="publisher-listing-title-row">
                            <Link className="publisher-listing-title-link" to={`/detailPublisher/${property.id}`}><strong>{property.title}</strong></Link>
                          </div>
                          <span>{formatPrice(property.price, property.currency)}</span>
                          <div className="publisher-listing-metrics">
                            <span><Eye size={15} /> Vistas {metricsLoading ? <Skeleton className="inline-block h-4 w-7" /> : <strong>{numberFormat.format(metric?.views ?? 0)}</strong>}</span>
                            <span><MessageCircle size={15} /> Consultas {metricsLoading ? <Skeleton className="inline-block h-4 w-7" /> : <strong>{numberFormat.format(metric?.consultations ?? 0)}</strong>}</span>
                          </div>
                        </div>
                        <div className="publisher-listing-meta">
                          {isMostViewed && <span className="publisher-most-viewed-badge"><Eye size={13} />Más Vista</span>}
                          <span className={`publisher-operation-badge is-${property.operationType}`}>{OPERATION_TYPES[property.operationType]}</span>
                          <span className={`publisher-status ${property.publicationStatus === "active" ? "is-active" : "is-paused"}`}>{status}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="publisher-listing-menu-trigger" type="button" aria-label={`Acciones para ${property.title}`} disabled={savingAction}>
                                <MoreVertical size={19} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {property.publicationStatus === "active" ? (
                                <DropdownMenuItem onSelect={() => { setActionProperty(property); setAction("pause"); setActionError(""); }}>
                                  <Pause /> Pausar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onSelect={() => void reactivateProperty(property)}>
                                  <Play /> Reactivar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem asChild>
                                <Link to={`/editProperty/${property.id}`}><Pencil /> Editar</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem variant="destructive" onSelect={() => { setActionProperty(property); setAction("delete"); setActionError(""); }}>
                                <Trash2 /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </article>
                    );
                  }) : <p className="publisher-empty-state">Todavía no publicaste propiedades.</p>}
                </div>
              </article>
            )}

            {activeTab === "consultations" && (
              <article className="publisher-panel publisher-consultations-panel">
                <div className="publisher-panel-heading">
                  <div>
                    <h1>Consultas recibidas</h1>
                    <p>Personas interesadas en tus propiedades</p>
                  </div>
                  {newConsultationCount > 0 && <span className="publisher-new-count">{newConsultationCount} nuevas</span>}
                </div>
                <div className="publisher-consultation-list publisher-consultation-grid">
                  {consultationsLoading ? <CardListSkeleton label="Cargando consultas..." variant="consultations" /> : consultationError ? (
                    <div className="publisher-empty-state publisher-consultation-error" role="alert">
                      <span>{consultationError}</span>
                      <button type="button" onClick={() => setConsultationRetry((value) => value + 1)}>Reintentar</button>
                    </div>
                  ) : consultations.length ? consultations.map((consultation) => (
                    <ConsultationCard
                      key={consultation.id}
                      consultation={consultation}
                      publisher
                      isNew={newConsultationIds.has(consultation.id)}
                      onMarkSeen={() => void markConsultationSeen(consultation.id)}
                    />
                  )) : (
                    <div className="publisher-empty-state">
                      <MessageCircle size={22} />
                      <span>Todavía no recibiste consultas.</span>
                    </div>
                  )}
                </div>
              </article>
            )}

            {activeTab === "stats" && (
              <GeneralStatisticsTab />
            )}
          </div>
        </section>

        <AlertDialog open={Boolean(action && actionProperty)} onOpenChange={(open) => {
          if (!open && !savingAction) {
            setAction(null);
            setActionProperty(null);
            setActionError("");
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{action === "delete" ? "¿Eliminar propiedad?" : "¿Pausar propiedad?"}</AlertDialogTitle>
              <AlertDialogDescription>
                {action === "delete"
                  ? `“${actionProperty?.title ?? "Esta propiedad"}” dejará de aparecer en el catálogo y en tus publicaciones.`
                  : `“${actionProperty?.title ?? "Esta propiedad"}” dejará de aparecer en el catálogo mientras esté pausada. Podrás reactivarla desde el menú.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <FieldError>{actionError}</FieldError>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={savingAction}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className={action === "delete" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                disabled={savingAction}
                onClick={(event) => { event.preventDefault(); void runPropertyAction(); }}
              >
                {savingAction ? "Procesando..." : action === "delete" ? "Eliminar" : "Pausar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
