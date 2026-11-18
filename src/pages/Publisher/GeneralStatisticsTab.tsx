import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, CalendarDays, Eye, Heart, Info, MessageCircle, Minus, Percent } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Skeleton, SkeletonStatus } from "../../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { compareCount, compareRate, consultationRate, formatMetricRate } from "../../lib/publisher-statistics";
import { getPublisherMetrics, type PublisherMetrics, type PublisherMetricsPeriod } from "../../services/publisherMetricsService";
import PublisherActivityChart from "./PublisherActivityChart";
import "./GeneralStatisticsTab.css";

const numberFormat = new Intl.NumberFormat("es-AR");
const dateRangeFormat = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", timeZone: "UTC" });
const activityMetrics = [
  { key: "views", title: "Vistas", label: "Vistas totales", icon: Eye },
  { key: "consultations", title: "Consultas", label: "Consultas recibidas", icon: MessageCircle },
] as const;

export default function GeneralStatisticsTab() {
  const [period, setPeriod] = useState<PublisherMetricsPeriod>(30);
  const [data, setData] = useState<PublisherMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [metric, setMetric] = useState<string>("views");

  useEffect(() => {
    let active = true;
    void getPublisherMetrics(period).then((result) => {
      if (active) setData(result);
    }).catch(() => {
      if (active) setError("No se pudieron cargar las estadísticas.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [period, retry]);

  return (
    <section className="publisher-general-stats" aria-labelledby="publisher-general-stats-title">
      <div className="publisher-panel-heading">
        <div>
          <h1 id="publisher-general-stats-title">Estadísticas generales</h1>
          <p>Actividad e interés que generan tus publicaciones.</p>
        </div>
        <div className="publisher-period-control">
          <label htmlFor="publisher-stats-period">Período</label>
          <Select value={String(period)} onValueChange={(value) => {
            setLoading(true);
            setError("");
            setPeriod(Number(value) as PublisherMetricsPeriod);
          }}>
            <SelectTrigger id="publisher-stats-period" aria-label="Seleccionar período">
              <CalendarDays aria-hidden="true" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? <DashboardSkeleton /> : error ? (
        <div className="publisher-stats-error" role="alert">
          <p>{error}</p>
          <Button variant="outline" onClick={() => {
            setLoading(true);
            setError("");
            setRetry((value) => value + 1);
          }}>Reintentar</Button>
        </div>
      ) : data && (
        <StatisticsDashboard data={data} period={period} metric={metric} onMetricChange={setMetric} />
      )}
    </section>
  );
}

function StatisticsDashboard({ data, period, metric, onMetricChange }: {
  data: PublisherMetrics;
  period: PublisherMetricsPeriod;
  metric: string;
  onMetricChange: (value: string) => void;
}) {
  const { totalViews, totalConsultations, totalFavorites, previousPeriod } = data.summary;
  const counts = { views: totalViews, consultations: totalConsultations };
  const currentRate = totalViews > 0 ? consultationRate(totalConsultations, totalViews) : null;
  const previousRate = previousPeriod.views > 0 ? consultationRate(previousPeriod.consultations, previousPeriod.views) : null;
  const first = data.activity[0];
  const last = data.activity.at(-1);
  const dateRange = first && last
    ? dateRangeFormat.formatRange(new Date(`${first.date}T00:00:00Z`), new Date(`${last.date}T00:00:00Z`))
    : `Últimos ${period} días`;

  return (
    <>
      <div className="publisher-stats-grid">
        <section className="publisher-panel publisher-stats-module" aria-labelledby="publisher-activity-title">
          <Tabs value={metric} onValueChange={onMetricChange}>
            <header className="publisher-stats-module-heading publisher-stats-activity-heading">
              <div>
                <h2 id="publisher-activity-title">Actividad de tus publicaciones</h2>
                <p>{dateRange}</p>
              </div>
              <TabsList className="publisher-stats-switch" aria-label="Métrica de actividad">
                {activityMetrics.map(({ key, title, icon: Icon }) => (
                  <TabsTrigger key={key} value={key}>
                    <Icon aria-hidden="true" /> {title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </header>
            {activityMetrics.map(({ key, label }) => (
              <TabsContent key={key} value={key}>
                <div className="publisher-stats-total">
                  <strong>{numberFormat.format(counts[key])}</strong>
                  <div>
                    <p>{label}</p>
                    <Trend comparison={compareCount(counts[key], previousPeriod[key])} />
                  </div>
                </div>
                <PublisherActivityChart
                  activity={data.activity}
                  metric={key}
                  previousTotal={previousPeriod[key]}
                />
              </TabsContent>
            ))}
          </Tabs>
        </section>

        <section className="publisher-panel publisher-stats-module" aria-labelledby="publisher-interest-title">
          <header className="publisher-stats-module-heading">
            <h2 id="publisher-interest-title">Del interés al contacto</h2>
            <p>Comparación con los {period} días anteriores.</p>
          </header>

          <div className="publisher-stats-counts">
            <CountComparison label="Consultas recibidas" icon={MessageCircle} current={totalConsultations} previous={previousPeriod.consultations} />
            <CountComparison label="Favoritos activos" icon={Heart} current={totalFavorites} previous={previousPeriod.favorites} />
          </div>

          <section className="publisher-stats-rate" aria-labelledby="publisher-rate-title">
            <h3 id="publisher-rate-title">Tasa de consulta <Percent size={16} aria-hidden="true" /></h3>
            <div className="publisher-stats-rate-value">
              <strong>{currentRate === null ? "Sin datos" : formatRate(currentRate)}</strong>
              {currentRate !== null && <Trend comparison={compareRate(currentRate, previousRate ?? 0, previousRate !== null)} />}
            </div>
            <PeriodComparison current={currentRate} previous={previousRate} format={formatRate} />
            <p className="publisher-stats-rate-base">
              <MessageCircle size={15} aria-hidden="true" />
              <span>
                {formatCount(totalConsultations, "consulta", "consultas")} sobre {formatCount(totalViews, "vista", "vistas")} en este período.
                {previousPeriod.views > 0 && (
                  <> Antes, {formatCount(previousPeriod.consultations, "consulta", "consultas")} sobre {formatCount(previousPeriod.views, "vista", "vistas")}.</>
                )}
              </span>
            </p>
          </section>
        </section>
      </div>
      <p className="publisher-rate-note"><Info size={14} aria-hidden="true" /> La tasa de consulta se calcula sobre eventos de vista y puede incluir varias vistas de una misma persona.</p>
    </>
  );
}

function formatCount(value: number, singular: string, plural: string) {
  return `${numberFormat.format(value)} ${value === 1 ? singular : plural}`;
}

function formatRate(value: number) {
  return `${formatMetricRate(value)}%`;
}

function Trend({ comparison }: { comparison: ReturnType<typeof compareCount> | ReturnType<typeof compareRate> }) {
  const Icon = comparison.direction === "up" ? ArrowUpRight : comparison.direction === "down" ? ArrowDownRight : Minus;
  const [value, context] = comparison.label.split(" respecto al período anterior");
  return (
    <span className={`publisher-stats-trend is-${comparison.direction}`} title={comparison.label}>
      <Icon size={13} aria-hidden="true" /> {value}
      {context !== undefined && <span className="sr-only"> respecto al período anterior</span>}
    </span>
  );
}

function CountComparison({ label, icon: Icon, current, previous }: {
  label: string;
  icon: typeof Eye;
  current: number;
  previous: number;
}) {
  return (
    <section className="publisher-stats-count">
      <h3>{label} <Icon size={16} aria-hidden="true" /></h3>
      <strong className="publisher-stats-count-value">{numberFormat.format(current)}</strong>
      <Trend comparison={compareCount(current, previous)} />
      <PeriodComparison current={current} previous={previous} format={(value) => numberFormat.format(value)} />
    </section>
  );
}

function PeriodComparison({ current, previous, format }: {
  current: number | null;
  previous: number | null;
  format: (value: number) => string;
}) {
  const scale = Math.max(current ?? 0, previous ?? 0) || 1;
  return (
    <dl className="publisher-stats-comparison">
      {([["Actual", current], ["Anterior", previous]] as const).map(([label, value], index) => (
        <div key={label} className={index === 1 ? "is-previous" : undefined}>
          <dt>{label}</dt>
          <dd>
            {value === null ? "Sin vistas" : format(value)}
            <span className="publisher-stats-comparison-track" aria-hidden="true">
              {value !== null && (
                <span data-zero={value === 0 ? "" : undefined} style={value > 0 ? { width: `${value / scale * 100}%` } : undefined} />
              )}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function DashboardSkeleton() {
  return (
    <SkeletonStatus label="Cargando estadísticas..." className="publisher-stats-grid">
      <div className="publisher-panel publisher-stats-module space-y-4">
        <Skeleton className="h-6 w-3/5" />
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-12 w-2/5" />
        <Skeleton className="h-60 w-full" />
      </div>
      <div className="publisher-panel publisher-stats-module space-y-4">
        <Skeleton className="h-6 w-3/5" />
        <div className="publisher-stats-counts">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-36 w-full" />
      </div>
    </SkeletonStatus>
  );
}
