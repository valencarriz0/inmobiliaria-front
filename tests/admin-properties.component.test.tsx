import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminPropertiesSection } from "../src/pages/Admin/AdminPropertiesSection";

const propertiesMock = vi.hoisted(() => vi.fn());
const usersMock = vi.hoisted(() => vi.fn());

vi.mock("../src/services/adminService", () => ({ adminService: { properties: propertiesMock, users: usersMock } }));
vi.mock("../src/components/SearchBarAdmin", () => ({ default: () => <div role="search">Buscador de publicaciones</div> }));

const property = { id: "p1", title: "Departamento céntrico", publisherId: "publisher-1", images: ["cover.jpg"], price: 100000, currency: "USD", city: { name: "Córdoba" }, province: { name: "Córdoba" }, operationType: "sale", publicationStatus: "active" };

describe("AdminPropertiesSection", () => {
  afterEach(() => vi.resetAllMocks());

  it("muestra publicaciones y enlaza al detalle administrativo", async () => {
    propertiesMock.mockResolvedValue({ properties: [property], pagination: {} });
    usersMock.mockResolvedValue({ users: [{ id: "publisher-1", firstName: "Ana", lastName: "Publica" }], pagination: {} });
    render(<MemoryRouter><AdminPropertiesSection /></MemoryRouter>);

    expect(await screen.findByText("Departamento céntrico")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ver Más" }).getAttribute("href")).toBe("/admin/properties/p1");
  });

  it("muestra el error del servicio y permite reintentar", async () => {
    propertiesMock.mockRejectedValueOnce(new Error("No se pudo cargar publicaciones")).mockResolvedValueOnce({ properties: [], pagination: {} });
    usersMock.mockResolvedValue({ users: [], pagination: {} });
    render(<MemoryRouter><AdminPropertiesSection /></MemoryRouter>);

    expect((await screen.findByRole("alert")).textContent).toContain("No se pudo cargar publicaciones");
    await userEvent.setup().click(screen.getByRole("button", { name: "Reintentar" }));
    await waitFor(() => expect(propertiesMock).toHaveBeenCalledTimes(2));
  });
});
