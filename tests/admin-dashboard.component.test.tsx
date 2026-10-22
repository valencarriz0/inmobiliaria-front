import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminMetricsSection } from "../src/pages/Admin/AdminMetricCards";
import AdminDashboard from "../src/pages/Admin/Dashboard";
import AdminPropertyDetail from "../src/pages/Admin/PropertyDetail";
import { ADMIN_PROPERTY_STATUS_CHANGED } from "../src/lib/admin-property-events";

const metricsMock = vi.hoisted(() => vi.fn());
const propertyMock = vi.hoisted(() => vi.fn());
const pauseMock = vi.hoisted(() => vi.fn());
const propertiesMock = vi.hoisted(() => vi.fn());
const usersMock = vi.hoisted(() => vi.fn());
const applicationsMock = vi.hoisted(() => vi.fn());

vi.mock("../src/services/adminService", () => ({ adminService: {
  metrics: metricsMock,
  properties: propertiesMock,
  users: usersMock,
  property: propertyMock,
  pauseProperty: pauseMock,
  reactivateProperty: vi.fn(),
  deleteProperty: vi.fn(),
  propertyHistory: vi.fn(),
} }));
vi.mock("../src/services/publisherApplicationService", () => ({
  getAdminPublisherApplications: applicationsMock,
  approvePublisherApplication: vi.fn(),
  rejectPublisherApplication: vi.fn(),
}));
vi.mock("../src/components/HeaderUser", () => ({ default: () => <header>Cabecera</header> }));
vi.mock("../src/components/BotonVolver", () => ({ default: () => <nav>Volver</nav> }));
vi.mock("../src/components/PropertyGallery", () => ({ default: () => <div>Galería</div> }));
vi.mock("../src/components/PropertyChangeHistoryDialog", () => ({ default: () => null }));
vi.mock("../src/components/maps/PropertyMap", () => ({ default: () => <div>Mapa</div> }));

const property = {
  id: "p1", title: "Departamento céntrico", description: "Amplio y luminoso",
  operationType: "sale", propertyType: "apartment", publicationStatus: "active",
  price: 100000, currency: "USD", totalArea: 80, rooms: 3, bedrooms: 2,
  city: { name: "Córdoba" }, province: { name: "Córdoba" },
  street: "San Martín", streetNumber: "123", images: ["cover.jpg"],
  publisher: { firstName: "Ana", lastName: "Publica" }, latitude: null, longitude: null,
};

describe("diseño del panel administrador", () => {
  afterEach(() => vi.resetAllMocks());

  it("integra publicaciones, usuarios y solicitudes como tabs con acceso directo", async () => {
    metricsMock.mockResolvedValue({ registeredUsers: 10, publishers: 2, activeProperties: 5, pausedProperties: 1, totalViews: 90, totalConsultations: 7 });
    propertiesMock.mockResolvedValue({ properties: [], pagination: { total: 0 } });
    usersMock.mockResolvedValue({ users: [{ id: "u1", firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: "2215551212", role: "interested", accountStatus: "active", createdAt: "2026-01-10T12:00:00Z" }], pagination: { total: 1 } });
    applicationsMock.mockResolvedValue({ applications: [{ id: "a1", userId: "u1", publisherType: "individual", taxId: "20123456789", agencyName: null, phone: "2215551212", status: "pending", reviewedAt: null, reviewedBy: null, rejectionReason: null, createdAt: "2026-02-10T12:00:00Z", updatedAt: "2026-02-10T12:00:00Z", applicant: { id: "u1", firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: "2215551212", role: "interested", accountStatus: "active" } }] });
    const user = userEvent.setup();
    const { container } = render(<MemoryRouter initialEntries={["/admin?tab=users"]}><AdminDashboard /></MemoryRouter>);

    expect(screen.getByRole("tab", { name: "Usuarios" }).getAttribute("aria-selected")).toBe("true");
    expect(await screen.findByRole("heading", { name: "Gestión de cuentas" })).toBeTruthy();
    expect(screen.getByText("Ana Pérez").closest(".admin-user-card")).toBeTruthy();
    expect(propertiesMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("tab", { name: "Solicitudes de publicadores" }));
    expect(screen.getByRole("tab", { name: "Solicitudes de publicadores" }).getAttribute("aria-selected")).toBe("true");
    expect((await screen.findByText("Ana Pérez")).closest(".admin-application-card")).toBeTruthy();
    expect(applicationsMock).toHaveBeenCalledWith("pending");

    await user.click(screen.getByRole("tab", { name: "Publicaciones" }));
    expect(screen.getByRole("tab", { name: "Publicaciones" }).getAttribute("aria-selected")).toBe("true");
    expect(await screen.findByText("No hay publicaciones que coincidan con la búsqueda.")).toBeTruthy();
    expect(container.querySelector(".admin-publications-panel")).toBeTruthy();
  });

  it("muestra las métricas con las tarjetas del panel publicador", async () => {
    metricsMock.mockResolvedValue({ registeredUsers: 10, publishers: 2, activeProperties: 5, pausedProperties: 1, totalViews: 90, totalConsultations: 7 });
    const { container } = render(<AdminMetricsSection />);

    expect(await screen.findByText("Usuarios registrados")).toBeTruthy();
    expect(container.querySelectorAll(".publisher-general-metric-card")).toHaveLength(6);
    expect(container.querySelector(".admin-metrics-grid")).toBeTruthy();
    expect(screen.getByText("Visualizaciones totales")).toBeTruthy();
  });

  it("actualiza los contadores de estados sin esperar otra respuesta", async () => {
    metricsMock.mockResolvedValueOnce({ registeredUsers: 10, publishers: 2, activeProperties: 5, pausedProperties: 1, totalViews: 90, totalConsultations: 7 });
    metricsMock.mockImplementationOnce(() => new Promise(() => undefined));
    render(<AdminMetricsSection />);
    await screen.findByText("Usuarios registrados");

    window.dispatchEvent(new CustomEvent(ADMIN_PROPERTY_STATUS_CHANGED, { detail: { before: "active", after: "paused" } }));

    await waitFor(() => expect(screen.getByText("Publicaciones activas").closest("article")?.textContent).toContain("4"));
    expect(screen.getByText("Publicaciones pausadas").closest("article")?.textContent).toContain("2");
  });

  it("muestra el detalle con galería, estado y acciones administrativas", async () => {
    propertyMock.mockResolvedValue({ property });
    pauseMock.mockResolvedValue({ property: { ...property, publicationStatus: "paused" } });
    render(<MemoryRouter initialEntries={["/admin/properties/p1"]}><Routes><Route path="/admin/properties/:id" element={<AdminPropertyDetail />} /></Routes></MemoryRouter>);

    expect(await screen.findByRole("heading", { name: "Departamento céntrico" })).toBeTruthy();
    expect(screen.getByText("Galería")).toBeTruthy();
    expect(screen.getByText("Ana Publica")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Historial de cambios" })).toBeTruthy();

    await userEvent.setup().click(screen.getByRole("button", { name: "Pausar publicación" }));
    await userEvent.setup().click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(pauseMock).toHaveBeenCalledWith("p1"));
    expect(await screen.findByRole("button", { name: "Reactivar publicación" })).toBeTruthy();
  });
});
