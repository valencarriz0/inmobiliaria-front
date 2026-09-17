import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Statistics from "../src/pages/Publisher/Statistics";

const metricsMock = vi.hoisted(() => vi.fn());
vi.mock("../src/services/publisherMetricsService", () => ({ getPublisherMetrics: metricsMock }));
vi.mock("../src/components/HeaderUser", () => ({ default: () => <header>Encabezado</header> }));
vi.mock("../src/components/BotonVolver", () => ({ default: () => <button>Volver</button> }));

describe("Statistics", () => {
  afterEach(() => vi.resetAllMocks());

  it("muestra métricas y un estado vacío para propiedades", async () => {
    metricsMock.mockResolvedValue({ summary: { activeProperties: 2, totalViews: 18, totalConsultations: 3 }, mostViewed: null, properties: [] });
    render(<MemoryRouter><Statistics /></MemoryRouter>);

    expect(await screen.findByText("18")).toBeTruthy();
    expect(screen.getByText("Todavía no tenés publicaciones para mostrar estadísticas.")).toBeTruthy();
  });

  it("muestra un error y vuelve a solicitar métricas al reintentar", async () => {
    metricsMock.mockRejectedValueOnce(new Error("sin red")).mockResolvedValueOnce({ summary: { activeProperties: 0, totalViews: 0, totalConsultations: 0 }, mostViewed: null, properties: [] });
    render(<MemoryRouter><Statistics /></MemoryRouter>);

    expect((await screen.findByRole("alert")).textContent).toContain("No se pudieron cargar las estadísticas");
    await userEvent.setup().click(screen.getByRole("button", { name: "Reintentar" }));
    await waitFor(() => expect(metricsMock).toHaveBeenCalledTimes(2));
  });
});
