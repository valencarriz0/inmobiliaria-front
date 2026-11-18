import { useId, useState, type KeyboardEvent } from "react";
import type { PublisherActivityDay } from "../../services/publisherMetricsService";

const dateFormat = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", timeZone: "UTC" });
const numbers = new Intl.NumberFormat("es-AR");
const axisNumbers = new Intl.NumberFormat("es-AR", { notation: "compact" });

function formatDay(date: string) {
  return dateFormat.format(new Date(`${date}T00:00:00Z`)).replace(".", "");
}

export default function PublisherActivityChart({ activity, metric, previousTotal }: {
  activity: PublisherActivityDay[];
  metric: "views" | "consultations";
  previousTotal: number;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const hintId = useId();
  const [singular, label] = metric === "views" ? ["vista", "vistas"] : ["consulta", "consultas"];
  const maximum = Math.max(0, ...activity.map((day) => day[metric]));
  const step = Math.max(1, Math.ceil(maximum / 2));
  const scale = step * 2;
  const selectedDay = selectedIndex === null ? undefined : activity[selectedIndex];
  const peakIndex = activity.findIndex((day) => day[metric] === maximum);
  const tickCount = Math.min(5, activity.length);
  const dateTicks = Array.from({ length: tickCount }, (_, index) =>
    Math.round(index * (activity.length - 1) / Math.max(1, tickCount - 1))
  );
  const emptyMessage = activity.length === 0
    ? "Sin datos diarios para este período."
    : `Sin ${label} en este período.`;
  const figureLabel = maximum > 0 ? `Distribución diaria de ${label}` : emptyMessage;

  function moveSelection(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case "ArrowRight":
        setSelectedIndex((index) => index === null ? 0 : Math.min(activity.length - 1, index + 1));
        break;
      case "ArrowLeft":
        setSelectedIndex((index) => index === null ? activity.length - 1 : Math.max(0, index - 1));
        break;
      case "Home":
        setSelectedIndex(0);
        break;
      case "End":
        setSelectedIndex(activity.length - 1);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  return (
    <div className="publisher-daily-chart">
      {maximum > 0 && <p className="sr-only" id={hintId}>Usá las flechas izquierda y derecha para consultar los datos de cada día.</p>}
      <div
        className="publisher-daily-inspector"
        role="group"
        aria-label={`Explorar ${label} por día`}
        aria-describedby={maximum > 0 ? hintId : undefined}
        tabIndex={maximum > 0 ? 0 : undefined}
        onKeyDown={maximum > 0 ? moveSelection : undefined}
      >
        <div className="publisher-daily-figure" role="img" aria-label={figureLabel}>
          <div className="publisher-daily-y" aria-hidden="true">
            {[scale, step, 0].map((tick) => <span key={tick}>{axisNumbers.format(tick)}</span>)}
          </div>
          <div className="publisher-daily-plot">
            <div className="publisher-daily-gridlines" aria-hidden="true"><i /><i /><i /></div>
            {maximum > 0 ? (
              <div className="publisher-daily-columns" aria-hidden="true" onPointerLeave={(event) => {
                if (event.pointerType === "mouse") setSelectedIndex(null);
              }}>
                {activity.map((day, index) => {
                  const count = day[metric];
                  const active = index === selectedIndex;
                  return (
                    <div
                      key={day.date}
                      className="publisher-daily-column"
                      data-active={active || undefined}
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse") setSelectedIndex(index);
                      }}
                      onPointerUp={() => setSelectedIndex(index)}
                    >
                      {count > 0 && (
                        <span className="publisher-daily-bar" style={{ height: `${count / scale * 100}%` }}>
                          {index === peakIndex && <span className="publisher-daily-peak">{axisNumbers.format(count)}</span>}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="publisher-daily-empty">{emptyMessage}</p>
            )}
          </div>
          <div className="publisher-daily-dates" aria-hidden="true">
            {dateTicks.map((index) => (
              <span key={index} style={{ left: `clamp(21px, ${(index + 0.5) / activity.length * 100}%, 100% - 21px)` }}>
                {formatDay(activity[index].date)}
              </span>
            ))}
          </div>
        </div>
        <div className="publisher-daily-caption">
          <span aria-live="polite" className="publisher-daily-day">
            {selectedDay
              ? `${formatDay(selectedDay.date)} · ${numbers.format(selectedDay[metric])} ${selectedDay[metric] === 1 ? singular : label}`
              : "Actividad por día"}
          </span>
          <span>Anterior: {numbers.format(previousTotal)}</span>
        </div>
      </div>
    </div>
  );
}
