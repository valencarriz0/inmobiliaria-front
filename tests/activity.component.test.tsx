import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Activity from "../src/pages/User/Activity";
import type { SearchAlert } from "../src/types/search-alert";

const services = vi.hoisted(() => ({ mine: vi.fn(), list: vi.fn(), update: vi.fn() }));
vi.mock("../src/services/consultationService", () => ({ consultationService: { mine: services.mine } }));
vi.mock("../src/services/searchAlertService", () => ({ searchAlertService: { list: services.list, update: services.update } }));
vi.mock("../src/components/HeaderUser", () => ({ default: () => <header>Encabezado</header> }));
vi.mock("../src/components/PropertyLocationCombobox", () => ({ default: () => null }));

const alert: SearchAlert = {
  id: "alert-1", name: "Casas en venta", operationType: "sale", propertyType: "house",
  provinceId: null, cityId: null, currency: "USD", minPrice: null, maxPrice: 150000,
  isActive: true, createdAt: "2026-10-21T12:00:00Z", province: null, city: null,
};

function LocationControls() {
  const location = useLocation();
  const navigate = useNavigate();
  return <><output aria-label="Dirección actual">{location.pathname}{location.search}</output><button onClick={() => navigate(-1)}>Atrás en historial</button></>;
}

function renderActivity(path = "/activity") {
  return render(<MemoryRouter initialEntries={[path]}><Activity /><LocationControls /></MemoryRouter>);
}

describe("Mi actividad", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    services.mine.mockResolvedValue([]);
    services.list.mockResolvedValue({ alerts: [alert] });
  });

  it("abre consultas, cambia a alertas y restaura la tab al volver en el historial", async () => {
    const user = userEvent.setup();
    renderActivity("/activity?source=nav");
    expect(await screen.findByText("Todavía no realizaste consultas")).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Mis consultas" }).getAttribute("aria-selected")).toBe("true");
    expect(services.list).not.toHaveBeenCalled();

    await user.click(screen.getByRole("tab", { name: "Mis alertas" }));
    expect(await screen.findByRole("heading", { name: "Casas en venta" })).toBeTruthy();
    expect(screen.getByLabelText("Dirección actual").textContent).toBe("/activity?source=nav&tab=alerts");

    await user.click(screen.getByRole("button", { name: "Atrás en historial" }));
    expect(await screen.findByText("Todavía no realizaste consultas")).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Mis consultas" }).getAttribute("aria-selected")).toBe("true");
  });

  it("abre alertas desde un acceso directo y conserva la edición y el guardado", async () => {
    const user = userEvent.setup();
    services.update.mockResolvedValue({ alert: { ...alert, name: "Mi búsqueda actualizada" } });
    renderActivity("/activity?tab=alerts");

    expect(await screen.findByRole("heading", { name: "Casas en venta" })).toBeTruthy();
    expect(services.mine).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Editar" }));
    await user.clear(screen.getByRole("textbox", { name: "Nombre" }));
    await user.type(screen.getByRole("textbox", { name: "Nombre" }), "Mi búsqueda actualizada");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByRole("heading", { name: "Mi búsqueda actualizada" })).toBeTruthy();
    expect(services.update).toHaveBeenCalledWith("alert-1", expect.objectContaining({ name: "Mi búsqueda actualizada", operationType: "sale", propertyType: "house", currency: "USD", maxPrice: 150000 }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("permite reintentar una carga fallida de alertas dentro de la tab", async () => {
    services.list.mockRejectedValueOnce(new Error("Sin conexión"));
    renderActivity("/activity?tab=alerts");
    expect((await screen.findByRole("alert")).textContent).toContain("No se pudieron cargar tus alertas");

    await userEvent.setup().click(screen.getByRole("button", { name: "Reintentar" }));
    expect(await screen.findByRole("heading", { name: "Casas en venta" })).toBeTruthy();
  });

  it("permite cambiar de tab con el teclado y actualiza su foco y selección", async () => {
    renderActivity();
    const consultations = screen.getByRole("tab", { name: "Mis consultas" });
    consultations.focus();
    await userEvent.setup().keyboard("{ArrowRight}");
    expect(await screen.findByRole("heading", { name: "Casas en venta" })).toBeTruthy();
    const alerts = screen.getByRole("tab", { name: "Mis alertas" });
    expect(alerts.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(alerts);
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe(alerts.id);
  });
});
