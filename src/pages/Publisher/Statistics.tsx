import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowUp,
  Heart,
  House,
  MapPin,
  MessageCircle,
  Minus,
  Percent,
} from "lucide-react";
import HeaderUser from "../../components/HeaderUser";
import BotonVolver from "../../components/BotonVolver";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  compareCount,
  compareRate,
  consultationRate,
  formatMetricRate,
  sortPropertyMetrics,
  type PropertyMetricSort,
} from "../../lib/publisher-statistics";
import {
  getPublisherMetrics,
  type PublisherActivityDay,
  type PublisherMetrics,
  type PublisherMetricsPeriod,
} from "../../services/publisherMetricsService";

const pageSize = 8;

function ActivityChart({ activity }: { activity: PublisherActivityDay[] }) {
  const width = 720;
  const height = 250;
  const left = 38;
  const right = 12;
  const top = 14;
  const bottom = 38;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maxValue = Math.max(0, ...activity.flatMap(({ views, consultations }) => [views, consultations]));
  const scaleMax = Math.max(1, maxValue);
  const pointsFor = (key: "views" | "consultations") => activity.map((item, index) => {
    const x = left + (activity.length <= 1 ? chartWidth / 2 : (index / (activity.length - 1)) * chartWidth);
    const y = top + chartHeight - (item[key] / scaleMax) * chartHeight;
    return `${x},${y}`;
  }).join(" ");
  const tickCount = Math.min(5, activity.length);
  const tickIndexes = Array.from({ length: tickCount }, (_, index) => tickCount <= 1
    ? 0
    : Math.round((index * (activity.length - 1)) / (tickCount - 1)));
  const dateLabel = (date: string) => new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
  const hasActivity = activity.some(({ views, consultations }) => views > 0 || consultations > 0);

  return <div className="relative w-full">
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-64 w-full overflow-visible"
      role="img"
      aria-label="Evolución diaria de vistas y consultas en el período seleccionado"
      preserveAspectRatio="none"
    >
      <title>Evolución de actividad</title>
      {[0, 0.5, 1].map((fraction) => {
        const y = top + chartHeight * fraction;
        const value = Math.round(maxValue * (1 - fraction));
        return <g key={fraction}>
          <line x1={left} x2={width - right} y1={y} y2={y} stroke="var(--border)" strokeWidth="1" />
          <text x={left - 9} y={y + 4} textAnchor="end" fill="var(--muted-foreground)" fontSize="11">{value}</text>
        </g>;
      })}
      {activity.length > 0 && <>
        <polyline
          points={pointsFor("views")}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={pointsFor("consultations")}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth="2.5"
          strokeDasharray="6 5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {tickIndexes.map((index) => {
          const x = left + (activity.length <= 1 ? chartWidth / 2 : (index / (activity.length - 1)) * chartWidth);
          return <text
            key={activity[index].date}
            x={x}
            y={height - 8}
            textAnchor={index === 0 ? "start" : index === activity.length - 1 ? "end" : "middle"}
            fill="var(--muted-foreground)"
            fontSize="11"
          >{dateLabel(activity[index].date)}</text>;
        })}
      </>}
    </svg>
    {!hasActivity && <p className="pointer-events-none absolute inset-0 grid place-items-center pb-8 text-sm text-muted-foreground">
      Todavía no hay actividad en este período.
    </p>}
  </div>;
}

function Trend({ direction, label }: { direction: "up" | "down" | "stable" | "unavailable"; label: string }) {
  const Icon = direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : Minus;
  const color = direction === "up" ? "text-primary" : direction === "down" ? "text-secondary" : "text-muted-foreground";
  return <p className={`mt-2 flex min-h-5 items-center gap-1.5 text-xs ${color}`}>
    <Icon className="size-3.5 shrink-0" aria-hidden="true" />
    <span>{label}</span>
  </p>;
}

function Metric({
  title,
  value,
  icon: Icon,
  comparison,
}: {
  title: string;
  value: string;
  icon: typeof Heart;
  comparison: ReturnType<typeof compareCount> | ReturnType<typeof compareRate>;
}) {
  return <div className="min-w-0 px-5 py-5 first:pl-0 last:pr-0 sm:border-l sm:border-border sm:first:border-l-0 sm:first:pl-0">
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <Icon className="size-4 shrink-0 text-accent" aria-hidden="true" />
    </div>
    <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
    <Trend direction={comparison.direction} label={comparison.label} />
  </div>;
}

export default function Statistics() {
  const [period, setPeriod] = useState<PublisherMetricsPeriod>(30);
  const [sort, setSort] = useState<PropertyMetricSort>("views");
  const [page, setPage] = useState(1);
  const [metricsData, setMetricsData] = useState<PublisherMetrics>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const metrics = await getPublisherMetrics(period);
        if (active) setMetricsData(metrics);
      } catch {
        if (active) setError("No se pudieron cargar las estadísticas.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [period, retry]);

  const sortedProperties = useMemo(
    () => sortPropertyMetrics(metricsData?.properties ?? [], sort),
    [metricsData?.properties, sort],
  );
  const pageCount = Math.max(1, Math.ceil(sortedProperties.length / pageSize));
  const visibleProperties = sortedProperties.slice((page - 1) * pageSize, page * pageSize);
  const summary = metricsData?.summary;
  const previous = summary?.previousPeriod ?? { views: 0, consultations: 0, favorites: 0 };
  const currentRate = consultationRate(summary?.totalConsultations ?? 0, summary?.totalViews ?? 0);
  const previousRate = consultationRate(previous.consultations, previous.views);
  const viewComparison = compareCount(summary?.totalViews ?? 0, previous.views);
  const periodLabel = period === 7 ? "Últimos 7 días" : period === 30 ? "Últimos 30 días" : "Últimos 90 días";

  const setPeriodValue = (value: string) => {
    setPeriod(Number(value) as PublisherMetricsPeriod);
    setPage(1);
  };

  const setSortValue = (value: string) => {
    setSort(value as PropertyMetricSort);
    setPage(1);
  };

  return <div className="min-h-screen bg-background">
    <HeaderUser />
    <BotonVolver fallbackTo="/dashboard" />
    <main className="container mx-auto space-y-10 px-4 py-8 md:space-y-12 md:py-12">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Estadísticas de tus propiedades</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Conocé el rendimiento de tus publicaciones y el interés que generan.</p>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <label htmlFor="statistics-period" className="text-xs font-medium text-muted-foreground">Período</label>
          <Select value={String(period)} onValueChange={setPeriodValue}>
            <SelectTrigger id="statistics-period" className="w-full sm:w-48" aria-label="Seleccionar período">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {loading ? <p role="status" className="py-8 text-center text-muted-foreground">Cargando estadísticas...</p> : error ? <div className="space-y-3 py-8 text-center">
        <p role="alert">{error}</p>
        <Button variant="outline" onClick={() => setRetry((value) => value + 1)}>Reintentar</Button>
      </div> : <>
        <section aria-labelledby="views-heading" className="grid gap-6 border-b border-border pb-8 md:grid-cols-[minmax(0,0.8fr)_1fr] md:items-end md:gap-12 md:pb-10">
          <div>
            <p id="views-heading" className="text-sm font-medium text-muted-foreground">Vistas totales</p>
            <p className="mt-2 font-grotesk text-6xl font-semibold tracking-[-0.06em] tabular-nums md:text-7xl">
              {new Intl.NumberFormat("es-AR").format(summary?.totalViews ?? 0)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">En tus propiedades durante {periodLabel.toLowerCase()}.</p>
            <Trend direction={viewComparison.direction} label={viewComparison.label} />
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-5 text-sm md:justify-end md:border-t-0 md:pt-0">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
              {new Intl.NumberFormat("es-AR").format(summary?.totalViews ?? 0)} vistas
            </span>
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="size-2 rounded-full bg-secondary" aria-hidden="true" />
              {new Intl.NumberFormat("es-AR").format(summary?.totalConsultations ?? 0)} consultas
            </span>
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
              {new Intl.NumberFormat("es-AR").format(summary?.totalFavorites ?? 0)} favoritos activos
            </span>
          </div>
        </section>

        <div>
          <section aria-label="Indicadores del período" className="grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-y-0">
            <Metric
              title="Consultas recibidas"
              value={new Intl.NumberFormat("es-AR").format(summary?.totalConsultations ?? 0)}
              icon={MessageCircle}
              comparison={compareCount(summary?.totalConsultations ?? 0, previous.consultations)}
            />
            <Metric
              title="Favoritos activos"
              value={new Intl.NumberFormat("es-AR").format(summary?.totalFavorites ?? 0)}
              icon={Heart}
              comparison={compareCount(summary?.totalFavorites ?? 0, previous.favorites)}
            />
            <Metric
              title="Tasa de consulta"
              value={`${formatMetricRate(currentRate)}%`}
              icon={Percent}
              comparison={compareRate(currentRate, previousRate, previous.views > 0)}
            />
          </section>
          <p className="mt-3 text-xs text-muted-foreground">La tasa relaciona consultas con eventos de vista; no representa visitantes únicos.</p>
        </div>

        <section aria-labelledby="activity-heading" className="space-y-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="activity-heading" className="text-xl font-semibold tracking-tight">Evolución de actividad</h2>
              <p className="mt-1 text-sm text-muted-foreground">Vistas y consultas por día en {periodLabel.toLowerCase()}.</p>
            </div>
            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><span className="h-0.5 w-4 rounded bg-primary" aria-hidden="true" />Vistas</span>
              <span className="inline-flex items-center gap-2"><span className="w-4 border-t-2 border-dashed border-secondary" aria-hidden="true" />Consultas</span>
            </div>
          </div>
          <ActivityChart activity={metricsData?.activity ?? []} />
        </section>

        <section aria-labelledby="properties-heading" className="space-y-5 border-t border-border pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="properties-heading" className="text-xl font-semibold tracking-tight">Rendimiento por propiedad</h2>
              <p className="mt-1 text-sm text-muted-foreground">Compará la actividad de tus publicaciones en {periodLabel.toLowerCase()}.</p>
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="property-sort" className="shrink-0 text-sm text-muted-foreground">Ordenar por</label>
              <Select value={sort} onValueChange={setSortValue}>
                <SelectTrigger id="property-sort" className="w-full sm:w-48" aria-label="Ordenar propiedades">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="views">Más vistas</SelectItem>
                  <SelectItem value="consultations">Más consultas</SelectItem>
                  <SelectItem value="favorites">Más favoritos</SelectItem>
                  <SelectItem value="rate">Mayor tasa de consulta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {sortedProperties.length === 0 ? <p className="border-y border-border py-8 text-center text-sm text-muted-foreground">
            Todavía no tenés publicaciones para mostrar estadísticas.
          </p> : <>
            <div className="divide-y divide-border border-y border-border">
              {visibleProperties.map((property) => {
                const location = [property.city, property.province].filter(Boolean).join(", ") || "Ubicación no disponible";
                const rate = consultationRate(property.consultations, property.views);
                return <article key={property.propertyId} className="grid gap-4 py-5 md:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(5rem,0.55fr))] md:items-center">
                  <Link
                    to={`/detailPublisher/${property.propertyId}`}
                    className="group flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {property.image ? <img src={property.image} alt="" className="size-16 shrink-0 rounded-lg object-cover" /> : <span className="grid size-16 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"><House className="size-6" aria-hidden="true" /></span>}
                    <span className="min-w-0">
                      <span className="block truncate font-semibold group-hover:text-primary">{property.title}</span>
                      <span className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{location}</span></span>
                    </span>
                  </Link>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 pl-[4.75rem] md:contents">
                    <PropertyValue label="Vistas" value={property.views} />
                    <PropertyValue label="Consultas" value={property.consultations} />
                    <PropertyValue label="Favoritos" value={property.favorites} />
                    <PropertyValue label="Tasa de consulta" value={`${formatMetricRate(rate)}%`} />
                  </div>
                </article>;
              })}
            </div>
            {pageCount > 1 && <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sortedProperties.length)} de {sortedProperties.length} propiedades</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Anterior</Button>
                <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Siguiente</Button>
              </div>
            </div>}
          </>}
          <p className="text-xs leading-relaxed text-muted-foreground">
            Los favoritos cuentan los registros que siguen activos y fueron creados durante el período seleccionado; los que se quitaron no tienen historial disponible.
          </p>
        </section>
      </>}
    </main>
  </div>;
}

function PropertyValue({ label, value }: { label: string; value: number | string }) {
  return <div className="min-w-0">
    <p className="text-xs text-muted-foreground md:hidden">{label}</p>
    <p className="truncate text-sm font-semibold tabular-nums md:text-right">{typeof value === "number" ? new Intl.NumberFormat("es-AR").format(value) : value}</p>
    <p className="hidden text-xs text-muted-foreground md:block md:text-right">{label}</p>
  </div>;
}
