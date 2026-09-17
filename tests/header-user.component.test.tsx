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

function renderHeader(role: "interested" | "publisher" | "admin") {
  const logout = vi.fn();
  useAuthMock.mockReturnValue({ user: { ...baseUser, role }, logout });
  return { logout, ...render(<MemoryRouter><HeaderUser /></MemoryRouter>) };
}

describe("HeaderUser", () => {
  it("muestra las opciones del interesado y permite cerrar sesión", async () => {
    const { logout } = renderHeader("interested");
    const user = userEvent.setup();

    expect(screen.getByRole("link", { name: "Favoritos" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Menú de usuario" }));
    expect(screen.getByRole("menuitem", { name: "Mis alertas" })).toBeTruthy();
    await user.click(screen.getByRole("menuitem", { name: "Cerrar sesión" }));

    expect(logout).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("ofrece herramientas del publicador y reserva Usuarios para administración", async () => {
    renderHeader("publisher");
    const user = userEvent.setup();

    expect(screen.queryByRole("button", { name: "Usuarios" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Menú de usuario" }));
    expect(screen.getByRole("menuitem", { name: "Estadísticas" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Consultas recibidas" })).toBeTruthy();
  });

  it("muestra el acceso de usuarios solamente para el administrador", async () => {
    renderHeader("admin");
    await userEvent.setup().click(screen.getByRole("button", { name: "Usuarios" }));

    expect(screen.getByRole("menuitem", { name: "Administrar usuarios" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Solicitudes de publicadores" })).toBeTruthy();
  });
});
