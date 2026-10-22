import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import NotificationsMenu from "../src/components/NotificationsMenu";

const useAuthMock = vi.hoisted(() => vi.fn());
const listMock = vi.hoisted(() => vi.fn());
const readMock = vi.hoisted(() => vi.fn());
const readAllMock = vi.hoisted(() => vi.fn());
const navigateMock = vi.hoisted(() => vi.fn());

vi.mock("../src/hooks/use-auth", () => ({ useAuth: useAuthMock }));
vi.mock("../src/services/notificationService", () => ({
  notificationService: { list: listMock, read: readMock, readAll: readAllMock },
}));
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigateMock,
}));

const notification = {
  id: "notification-1",
  type: "new_publisher_application",
  title: "Nueva solicitud de publicador",
  message: "Hay una solicitud pendiente de revisión.",
  consultationId: null,
  publisherApplicationId: "application-1",
  searchAlertId: null,
  propertyId: null,
  readAt: null,
  createdAt: "2026-10-21T10:00:00.000Z",
};

describe("NotificationsMenu del administrador", () => {
  afterEach(() => vi.clearAllMocks());

  it("recarga al abrir y marca como leída una solicitud antes de ir al panel", async () => {
    useAuthMock.mockReturnValue({ user: { id: "admin-1", role: "admin" } });
    listMock.mockResolvedValue({ notifications: [notification], unreadCount: 1 });
    readMock.mockResolvedValue({ notification: { ...notification, readAt: "2026-10-21T11:00:00.000Z" } });
    const user = userEvent.setup();

    render(<MemoryRouter><NotificationsMenu /></MemoryRouter>);
    expect(await screen.findByRole("button", { name: "Notificaciones: 1 sin leer" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Notificaciones: 1 sin leer" }));
    await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
    await user.click(await screen.findByRole("menuitem", { name: /Nueva solicitud de publicador/ }));

    await waitFor(() => expect(readMock).toHaveBeenCalledWith("notification-1"));
    expect(navigateMock).toHaveBeenCalledWith("/admin?tab=applications");
  });
});
