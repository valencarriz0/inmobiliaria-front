import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminPropertiesSection } from "../src/pages/Admin/AdminPropertiesSection";

const propertiesMock = vi.hoisted(() => vi.fn());
const usersMock = vi.hoisted(() => vi.fn());
const pauseMock = vi.hoisted(() => vi.fn());

vi.mock("../src/services/adminService", () => ({ adminService: { properties: propertiesMock, users: usersMock, pauseProperty: pauseMock, reactivateProperty: vi.fn(), deleteProperty: vi.fn() } }));
vi.mock("../src/components/SearchBarAdmin", () => ({ default: () => <div role="search">Buscador de publicaciones</div> }));

const property = { id: "p1", title: "Departamento céntrico", publisherId: "publisher-1", images: ["cover.jpg"], price: 100000, currency: "USD", city: { name: "Córdoba" }, province: { name: "Córdoba" }, operationType: "sale", publicationStatus: "active" };

describe("AdminPropertiesSection", () => {
  afterEach(() => vi.resetAllMocks());

  it("muestra publicaciones con categoría y menú de acciones", async () => {
    propertiesMock.mockResolvedValue({ properties: [property], pagination: {} });
    usersMock.mockResolvedValue({ users: [{ id: "publisher-1", firstName: "Ana", lastName: "Publica" }], pagination: {} });
    const { container } = render(<MemoryRouter><AdminPropertiesSection /></MemoryRouter>);

    expect(await screen.findByText("Departamento céntrico")).toBeTruthy();
    expect(container.querySelectorAll(".publisher-listing-card")).toHaveLength(1);
    expect(container.querySelector("table")).toBeNull();
    expect(container.querySelector(".publisher-operation-badge")?.textContent).toBe("Venta");
    expect(screen.queryByRole("link", { name: "Ver Más" })).toBeNull();
    await userEvent.setup().click(screen.getByRole("button", { name: "Acciones para Departamento céntrico" }));
    expect(screen.getByRole("menuitem", { name: "Ver detalle" }).getAttribute("href")).toBe("/admin/properties/p1");
  });

  it("muestra el error del servicio y permite reintentar", async () => {
    propertiesMock.mockRejectedValueOnce(new Error("No se pudo cargar publicaciones")).mockResolvedValueOnce({ properties: [], pagination: {} });
    usersMock.mockResolvedValue({ users: [], pagination: {} });
    render(<MemoryRouter><AdminPropertiesSection /></MemoryRouter>);

    expect((await screen.findByRole("alert")).textContent).toContain("No se pudo cargar publicaciones");
    await userEvent.setup().click(screen.getByRole("button", { name: "Reintentar" }));
    await waitFor(() => expect(propertiesMock).toHaveBeenCalledTimes(2));
  });

  it("permite pausar desde el menú y actualiza el listado", async () => {
    propertiesMock.mockResolvedValue({ properties: [property], pagination: {} });
    usersMock.mockResolvedValue({ users: [], pagination: {} });
    pauseMock.mockResolvedValue({ property: { ...property, publicationStatus: "paused" } });
    render(<MemoryRouter><AdminPropertiesSection /></MemoryRouter>);

    await screen.findByText("Departamento céntrico");
    await userEvent.setup().click(screen.getByRole("button", { name: "Acciones para Departamento céntrico" }));
    await userEvent.setup().click(screen.getByRole("menuitem", { name: "Pausar" }));
    await userEvent.setup().click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => expect(pauseMock).toHaveBeenCalledWith("p1"));
    expect(await screen.findByText("Pausada")).toBeTruthy();
    expect(propertiesMock).toHaveBeenCalledTimes(1);
  });
});
