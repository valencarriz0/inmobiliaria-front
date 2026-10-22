import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Eye, Heart, MessageCircle, Minus, Percent } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { compareCount, compareRate, consultationRate, formatMetricRate } from "../../lib/publisher-statistics";
import { getPublisherMetrics, type PublisherActivityDay, type PublisherMetrics, type PublisherMetricsPeriod } from "../../services/publisherMetricsService";
import { StatisticsSkeleton } from "../../components/LoadingSkeletons";

const numberFormat = new Intl.NumberFormat("es-AR");

export default function GeneralStatisticsTab() {
  const [period, setPeriod] = useState<PublisherMetricsPeriod>(30);
  const [data, setData] = useState<PublisherMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void getPublisherMetrics(period).then((result) => {
      if (active) setData(result);
    }).catch(() => {
      if (active) setError("No se pudieron cargar las estadísticas.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [period, retry]);

  const summary = data?.summary;
  const previous = summary?.previousPeriod ?? { views: 0, consultations: 0, favorites: 0 };
  const currentRate = consultationRate(summary?.totalConsultations ?? 0, summary?.totalViews ?? 0);
  const previousRate = consultationRate(previous.consultations, previous.views);
  const hasComparableRate = previous.views > 0;
  const periodLabel = period === 7 ? "los últimos 7 días" : period === 30 ? "los últimos 30 días" : "los últimos 90 días";

  return (
    <section className="publisher-general-stats" aria-labelledby="publisher-general-stats-title">
      <div className="publisher-general-stats-header">
        <div>
          <h1 id="publisher-general-stats-title">Estadísticas generales</h1>
          <p>Actividad e interés que generan tus publicaciones.</p>
        </div>
        <div className="publisher-period-control">
          <label htmlFor="publisher-stats-period">Período</label>
          <Select value={String(period)} onValueChange={(value) => setPeriod(Number(value) as PublisherMetricsPeriod)}>
            <SelectTrigger id="publisher-stats-period" aria-label="Seleccionar período"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? <StatisticsSkeleton /> : error ? (
        <div className="publisher-stats-error" role="alert">
          <p>{error}</p>
          <Button variant="outline" onClick={() => setRetry((value) => value + 1)}>Reintentar</Button>
        </div>
      ) : (
        <>
          <div className="publisher-general-stat-cards" aria-label="Indicadores generales">
            <GeneralMetricCard title="Vistas totales" value={numberFormat.format(summary?.totalViews ?? 0)} icon={Eye} comparison={compareCount(summary?.totalViews ?? 0, previous.views)} />
            <GeneralMetricCard title="Consultas recibidas" value={numberFormat.format(summary?.totalConsultations ?? 0)} icon={MessageCircle} comparison={compareCount(summary?.totalConsultations ?? 0, previous.consultations)} />
            <GeneralMetricCard title="Favoritos activos" value={numberFormat.format(summary?.totalFavorites ?? 0)} icon={Heart} comparison={compareCount(summary?.totalFavorites ?? 0, previous.favorites)} />
            <GeneralMetricCard title="Tasa de consulta" value={`${formatMetricRate(currentRate)}%`} icon={Percent} comparison={compareRate(currentRate, previousRate, hasComparableRate)} />
          </div>

          <section className="publisher-activity-card" aria-labelledby="publisher-activity-title">
            <div className="publisher-activity-heading">
              <div>
                <h2 id="publisher-activity-title">Evolución de actividad</h2>
                <p>Vistas y consultas por día durante {periodLabel}.</p>
              </div>
              <div className="publisher-activity-legend" aria-label="Referencias del gráfico">
                <span><i className="is-views" /> Vistas</span>
                <span><i className="is-consultations" /> Consultas</span>
              </div>
            </div>
            <ActivityChart activity={data?.activity ?? []} />
          </section>
          <p className="publisher-rate-note">La tasa de consulta relaciona consultas con eventos de vista; no representa visitantes únicos.</p>
        </>
      )}
    </section>
  );
}

function GeneralMetricCard({
  title,
  value,
  icon: Icon,
  comparison,
}: {
  title: string;
  value: string;
  icon: typeof Eye;
  comparison: ReturnType<typeof compareCount> | ReturnType<typeof compareRate>;
}) {
  const DirectionIcon = comparison.direction === "up" ? ArrowUpRight : comparison.direction === "down" ? ArrowDownRight : Minus;
  return (
    <article className="publisher-general-metric-card">
      <div className="publisher-general-metric-top">
        <span className="publisher-general-metric-icon"><Icon size={21} /></span>
        <span className="publisher-general-metric-label">{title}</span>
      </div>
      <strong className="publisher-general-metric-value">{value}</strong>
      <span className={`publisher-general-metric-trend is-${comparison.direction}`}>
        <DirectionIcon size={15} />
        {comparison.label}
      </span>
    </article>
  );
}

function ActivityChart({ activity }: { activity: PublisherActivityDay[] }) {
  const width = 900;
  const height = 300;
  const left = 46;
  const right = 18;
  const top = 18;
  const bottom = 38;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maxValue = Math.max(0, ...activity.flatMap(({ views, consultations }) => [views, consultations]));
  const scaleMax = Math.max(1, maxValue);
  const pointFor = (key: "views" | "consultations") => activity.map((item, index) => {
    const x = left + (activity.length <= 1 ? chartWidth / 2 : index / (activity.length - 1) * chartWidth);
    const y = top + chartHeight - item[key] / scaleMax * chartHeight;
    return `${x},${y}`;
  }).join(" ");
  const tickCount = Math.min(5, activity.length);
  const tickIndexes = Array.from({ length: tickCount }, (_, index) => tickCount <= 1 ? 0 : Math.round(index * (activity.length - 1) / (tickCount - 1)));
  const hasActivity = activity.some(({ views, consultations }) => views > 0 || consultations > 0);
  const dateLabel = (date: string) => new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${date}T00:00:00.000Z`));

  return (
    <div className="publisher-activity-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Evolución diaria de vistas y consultas" preserveAspectRatio="none">
        <title>Evolución diaria de vistas y consultas</title>
        {[0, 0.5, 1].map((fraction) => {
          const y = top + chartHeight * fraction;
          return <g key={fraction}>
            <line x1={left} x2={width - right} y1={y} y2={y} stroke="#e8ebe5" strokeWidth="1" />
            <text x={left - 10} y={y + 4} textAnchor="end" fill="#8a9088" fontSize="12">{Math.round(maxValue * (1 - fraction))}</text>
          </g>;
        })}
        {activity.length > 0 && <>
          <polyline points={pointFor("views")} fill="none" stroke="#b8e835" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <polyline points={pointFor("consultations")} fill="none" stroke="#73a63a" strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {tickIndexes.map((index) => {
            const x = left + (activity.length <= 1 ? chartWidth / 2 : index / (activity.length - 1) * chartWidth);
            return <text key={activity[index].date} x={x} y={height - 8} textAnchor={index === 0 ? "start" : index === activity.length - 1 ? "end" : "middle"} fill="#8a9088" fontSize="12">{dateLabel(activity[index].date)}</text>;
          })}
        </>}
      </svg>
      {!hasActivity && <p className="publisher-chart-empty">Todavía no hay actividad en este período.</p>}
    </div>
  );
}
