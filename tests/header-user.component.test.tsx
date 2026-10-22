import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import HeaderUser from "../src/components/HeaderUser";

const useAuthMock = vi.hoisted(() => vi.fn());
const navigate = vi.hoisted(() => vi.fn());

vi.mock("../src/hooks/use-auth", () => ({ useAuth: useAuthMock }));
vi.mock("../src/components/NotificationsMenu", () => ({ default: () => <span>Notificaciones</span> }));
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

const baseUser = { id: "u1", firstName: "Ana", lastName: "Pérez", email: "ana@example.com", phone: null, accountStatus: "active", createdAt: "", updatedAt: "" };

function renderHeader(role: "interested" | "publisher" | "admin", path = "/") {
  const logout = vi.fn();
  useAuthMock.mockReturnValue({ user: { ...baseUser, role }, logout });
  return { logout, ...render(<MemoryRouter initialEntries={[path]}><HeaderUser /></MemoryRouter>) };
}

describe("HeaderUser", () => {
  it("ofrece acceso directo a la actividad y conserva la solicitud de habilitación del interesado", () => {
    renderHeader("interested");

    expect(screen.getByRole("link", { name: "Favoritos" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Catálogo" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "Publicar" }).getAttribute("href")).toBe("/become-publisher");
    expect(screen.queryByRole("link", { name: "Panel Publicador" })).toBeNull();
    expect(screen.getByRole("link", { name: "Mi actividad" }).getAttribute("href")).toBe("/activity");
    expect(screen.queryByRole("button", { name: "Mi actividad" })).toBeNull();
  });

  it("enlaza directamente al panel y coloca Publicar antes del corazón", () => {
    renderHeader("publisher");

    expect(screen.queryByRole("button", { name: "Usuarios" })).toBeNull();
    const publish = screen.getByRole("link", { name: "Publicar" });
    expect(publish.getAttribute("href")).toBe("/newProperty");
    expect(publish.nextElementSibling).toBe(screen.getByRole("link", { name: "Favoritos" }));
    expect(screen.getByRole("link", { name: "Panel Publicador" }).getAttribute("href")).toBe("/dashboard");
    expect(screen.queryByRole("button", { name: "Panel Publicador" })).toBeNull();
  });

  it("muestra Cuenta y los accesos de actividad, sin duplicar Seguridad, y permite cerrar sesión", async () => {
    const { logout } = renderHeader("publisher");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Menú de usuario" }));

    expect(screen.getAllByRole("menuitem")).toHaveLength(5);
    for (const [label, to] of [["Cuenta", "/profile"], ["Mis alertas", "/activity?tab=alerts"], ["Mis consultas", "/activity"], ["Propiedades vistas", "/view-history"]]) {
      expect(screen.getByRole("menuitem", { name: label }).getAttribute("href")).toBe(to);
    }
    expect(screen.queryByRole("menuitem", { name: "Datos personales" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "Seguridad" })).toBeNull();
    await user.click(screen.getByRole("menuitem", { name: "Cerrar sesión" }));

    expect(logout).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("destaca el grupo correspondiente a la sección actual", () => {
    renderHeader("publisher", "/activity?tab=alerts");
    expect(screen.getByRole("link", { name: "Mi actividad" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Panel Publicador" }).getAttribute("aria-current")).toBeNull();
  });

  it("muestra el acceso de usuarios solamente para el administrador", async () => {
    renderHeader("admin");
    expect(screen.getByRole("link", { name: "Panel administrador" }).getAttribute("href")).toBe("/admin");
    expect(screen.queryByRole("link", { name: "Publicar" })).toBeNull();
    await userEvent.setup().click(screen.getByRole("button", { name: "Usuarios" }));

    expect(screen.getByRole("menuitem", { name: "Administrar usuarios" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Solicitudes de publicadores" })).toBeTruthy();
  });
});
