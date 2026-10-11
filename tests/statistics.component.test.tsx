import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Children, isValidElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Statistics from "../src/pages/Publisher/Statistics";

const metricsMock = vi.hoisted(() => vi.fn());
vi.mock("../src/services/publisherMetricsService", () => ({ getPublisherMetrics: metricsMock }));
vi.mock("../src/components/HeaderUser", () => ({ default: () => <header>Encabezado</header> }));
vi.mock("../src/components/BotonVolver", () => ({ default: () => <button>Volver</button> }));
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
    activity: [],
    ...overrides,
  });

  it("muestra métricas y un estado vacío para propiedades", async () => {
    metricsMock.mockResolvedValue(metrics());
    render(<MemoryRouter><Statistics /></MemoryRouter>);

    expect(await screen.findByText("18")).toBeTruthy();
    expect(screen.getByText("Todavía no tenés publicaciones para mostrar estadísticas.")).toBeTruthy();
    expect(metricsMock).toHaveBeenCalledWith(30);
    expect(screen.getByText("Tasa de consulta")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Evolución diaria de vistas y consultas en el período seleccionado" })).toBeTruthy();
  });

  it("muestra un error y vuelve a solicitar métricas al reintentar", async () => {
    metricsMock.mockRejectedValueOnce(new Error("sin red")).mockResolvedValueOnce(metrics({
      summary: { activeProperties: 0, pausedProperties: 0, totalViews: 0, totalConsultations: 0, totalFavorites: 0, previousPeriod: { views: 0, consultations: 0, favorites: 0 } },
    }));
    render(<MemoryRouter><Statistics /></MemoryRouter>);

    expect((await screen.findByRole("alert")).textContent).toContain("No se pudieron cargar las estadísticas");
    await userEvent.setup().click(screen.getByRole("button", { name: "Reintentar" }));
    await waitFor(() => expect(metricsMock).toHaveBeenCalledTimes(2));
  });

  it("vuelve a consultar todas las métricas al cambiar el período", async () => {
    metricsMock.mockResolvedValue(metrics());
    const user = userEvent.setup();
    render(<MemoryRouter><Statistics /></MemoryRouter>);

    await screen.findByText("18");
    await user.selectOptions(screen.getByRole("combobox", { name: "Seleccionar período" }), "7");

    await waitFor(() => expect(metricsMock).toHaveBeenLastCalledWith(7));
  });

  it("muestra ubicación y métricas de la propiedad con navegación al detalle", async () => {
    metricsMock.mockResolvedValue(metrics({
      properties: [{
        propertyId: "property-a",
        title: "Casa de tres ambientes",
        publicationStatus: "active",
        city: "Trenque Lauquen",
        province: "Buenos Aires",
        image: "https://example.test/casa.jpg",
        views: 120,
        previousViews: 100,
        consultations: 6,
        previousConsultations: 4,
        favorites: 9,
        previousFavorites: 8,
      }],
    }));
    render(<MemoryRouter><Statistics /></MemoryRouter>);

    const propertyLink = await screen.findByRole("link", { name: /Casa de tres ambientes/ });
    expect(propertyLink.getAttribute("href")).toBe("/detailPublisher/property-a");
    expect(screen.getByText("Trenque Lauquen, Buenos Aires")).toBeTruthy();
    expect(screen.getAllByText("Favoritos", { selector: "p" }).length).toBeGreaterThan(0);
    expect(screen.getByText("6", { selector: "p" })).toBeTruthy();
  });
});
