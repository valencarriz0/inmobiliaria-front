import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Children, isValidElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GeneralStatisticsTab from "../src/pages/Publisher/GeneralStatisticsTab";

const metricsMock = vi.hoisted(() => vi.fn());
vi.mock("../src/services/publisherMetricsService", () => ({ getPublisherMetrics: metricsMock }));
vi.mock("../src/components/ui/select", () => {
  const SelectTrigger = () => null;
  const SelectContent = () => null;
  const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{children}</option>;
  const Select = ({ value, onValueChange, children }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode }) => {
    const elements = Children.toArray(children).filter(isValidElement);
    const trigger = elements.find((element) => element.type === SelectTrigger);
    const content = elements.find((element) => element.type === SelectContent);
    const label = trigger?.props["aria-label"] ?? "select";
    const items = content ? Children.toArray(content.props.children) : [];
    return <select aria-label={label} value={value} onChange={(event) => onValueChange(event.target.value)}>{items}</select>;
  };
  return { Select, SelectTrigger, SelectContent, SelectItem, SelectValue: () => null };
});

describe("Statistics", () => {
  afterEach(() => vi.resetAllMocks());

  const metrics = (overrides = {}) => ({
    period: 30,
    summary: {
      activeProperties: 2,
      pausedProperties: 0,
      totalViews: 18,
      totalConsultations: 3,
      totalFavorites: 4,
      previousPeriod: { views: 12, consultations: 2, favorites: 0 },
    },
    mostViewed: null,
    properties: [],
    activity: [
      { date: "2026-11-16", views: 18, consultations: 0 },
      { date: "2026-11-17", views: 0, consultations: 3 },
    ],
    ...overrides,
  });

  it("alterna las series sin recargar y permite leer el valor diario con el teclado", async () => {
    metricsMock.mockResolvedValue(metrics());
    const user = userEvent.setup();
    render(<GeneralStatisticsTab />);

    expect(await screen.findByRole("img", { name: "Distribución diaria de vistas" })).toBeTruthy();
    expect(metricsMock).toHaveBeenCalledWith(30);
    await user.click(screen.getByRole("tab", { name: "Consultas" }));
    expect(screen.getByRole("img", { name: "Distribución diaria de consultas" })).toBeTruthy();
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("group", { name: "Explorar consultas por día" }));
    await user.keyboard("{End}");
    expect(screen.getByText("17 nov · 3 consultas")).toBeTruthy();
    expect(metricsMock).toHaveBeenCalledTimes(1);
  });

  it("muestra un error y vuelve a solicitar métricas al reintentar", async () => {
    metricsMock.mockRejectedValueOnce(new Error("sin red")).mockResolvedValueOnce(metrics({
      summary: { activeProperties: 0, pausedProperties: 0, totalViews: 0, totalConsultations: 0, totalFavorites: 0, previousPeriod: { views: 0, consultations: 0, favorites: 0 } },
    }));
    render(<GeneralStatisticsTab />);

    expect((await screen.findByRole("alert")).textContent).toContain("No se pudieron cargar las estadísticas");
    await userEvent.setup().click(screen.getByRole("button", { name: "Reintentar" }));
    await waitFor(() => expect(metricsMock).toHaveBeenCalledTimes(2));
  });

  it("vuelve a consultar todas las métricas al cambiar el período", async () => {
    metricsMock.mockResolvedValue(metrics());
    const user = userEvent.setup();
    render(<GeneralStatisticsTab />);

    await screen.findByRole("img", { name: "Distribución diaria de vistas" });
    await user.selectOptions(screen.getByRole("combobox", { name: "Seleccionar período" }), "7");

    await waitFor(() => expect(metricsMock).toHaveBeenLastCalledWith(7));
  });

  it("distingue una tasa sin vistas de una tasa válida de cero", async () => {
    metricsMock.mockResolvedValue(metrics({
      summary: {
        totalViews: 0,
        totalConsultations: 1,
        totalFavorites: 0,
        previousPeriod: { views: 10, consultations: 0, favorites: 1 },
      },
      activity: [{ date: "2026-11-17", views: 0, consultations: 1 }],
    }));
    render(<GeneralStatisticsTab />);

    const rate = await screen.findByRole("region", { name: "Tasa de consulta" });
    expect(within(rate).getByText("Sin vistas")).toBeTruthy();
    expect(within(rate).getByText("0%")).toBeTruthy();
    expect(within(rate).getByText(/1 consulta sobre 0 vistas/)).toBeTruthy();
  });
});
