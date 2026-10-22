import { useEffect, useState } from "react";
import { Building2, CircleCheck, Eye, MessageSquare, PauseCircle, UsersRound } from "lucide-react";
import { Skeleton, SkeletonStatus } from "../../components/ui/skeleton";
import { adminService } from "../../services/adminService";
import type { AdminMetrics } from "../../types/admin";
import { ADMIN_PROPERTY_STATUS_CHANGED, type AdminPropertyStatusChange } from "../../lib/admin-property-events";

const numberFormat = new Intl.NumberFormat("es-AR");

export function AdminMetricsSection() {
  const [metrics, setMetrics] = useState<AdminMetrics>();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let requestId = 0;
    const load = () => {
      const currentRequest = ++requestId;
      void adminService.metrics()
        .then((result) => { if (active && currentRequest === requestId) { setMetrics(result); setError(""); } })
        .catch((reason) => { if (active && currentRequest === requestId) setError(reason instanceof Error ? reason.message : "No se pudieron cargar las métricas."); });
    };
    const onStatusChange = (event: Event) => {
      const { before, after } = (event as CustomEvent<AdminPropertyStatusChange>).detail;
      setMetrics((current) => current ? {
        ...current,
        activeProperties: Math.max(0, current.activeProperties + Number(after === "active") - Number(before === "active")),
        pausedProperties: Math.max(0, current.pausedProperties + Number(after === "paused") - Number(before === "paused")),
      } : current);
      load();
    };
    load();
    window.addEventListener(ADMIN_PROPERTY_STATUS_CHANGED, onStatusChange);
    return () => { active = false; window.removeEventListener(ADMIN_PROPERTY_STATUS_CHANGED, onStatusChange); };
  }, []);

  const items = metrics ? [
    ["Usuarios registrados", metrics.registeredUsers, UsersRound],
    ["Publicadores", metrics.publishers, Building2],
    ["Publicaciones activas", metrics.activeProperties, CircleCheck],
    ["Publicaciones pausadas", metrics.pausedProperties, PauseCircle],
    ["Visualizaciones totales", metrics.totalViews, Eye],
    ["Consultas totales", metrics.totalConsultations, MessageSquare],
  ] as const : [];

  return <section className="admin-metrics-section" aria-label="Resumen general">
    {error && <p role="alert" className="publisher-stats-error">{error}</p>}
    {!metrics ? !error && (
      <SkeletonStatus label="Cargando métricas..." className="publisher-general-stat-cards admin-metrics-grid">
        {Array.from({ length: 6 }, (_, index) => <div className="publisher-general-metric-card" key={index}>
          <div className="publisher-general-metric-top"><Skeleton className="size-9 rounded-full" /><Skeleton className="h-4 w-28" /></div>
          <Skeleton className="h-9 w-24" />
        </div>)}
      </SkeletonStatus>
    ) : <div className="publisher-general-stat-cards admin-metrics-grid">
      {items.map(([label, value, Icon]) => <article className="publisher-general-metric-card" key={label}>
        <div className="publisher-general-metric-top">
          <span className="publisher-general-metric-icon"><Icon size={21} aria-hidden="true" /></span>
          <span className="publisher-general-metric-label">{label}</span>
        </div>
        <strong className="publisher-general-metric-value">{numberFormat.format(value)}</strong>
      </article>)}
    </div>}
  </section>;
}
