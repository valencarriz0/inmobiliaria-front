import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import AuthModals from "../src/components/Modals/AuthModals";

const useAuthMock = vi.hoisted(() => vi.fn());
const forgotPasswordMock = vi.hoisted(() => vi.fn());

vi.mock("../src/hooks/use-auth", () => ({ useAuth: useAuthMock }));
vi.mock("../src/services/authService", () => ({
  forgotPassword: forgotPasswordMock,
  resendVerification: vi.fn(),
}));

function renderRecovery() {
  useAuthMock.mockReturnValue({
    authDialog: "forgot-password",
    setAuthDialog: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
  });
  return render(<MemoryRouter><AuthModals /></MemoryRouter>);
}

describe("recuperación de contraseña", () => {
  afterEach(() => vi.clearAllMocks());

  it("envía un correo válido y muestra la confirmación", async () => {
    forgotPasswordMock.mockResolvedValue({ message: "Si existe una cuenta asociada a ese correo, recibirás un enlace para restablecer tu contraseña." });
    renderRecovery();
    const user = userEvent.setup();

    await user.type(screen.getByRole("textbox", { name: /Correo electrónico/ }), "  ana@example.com  ");
    await user.click(screen.getByRole("button", { name: "Enviar enlace" }));

    await waitFor(() => expect(forgotPasswordMock).toHaveBeenCalledWith({ email: "ana@example.com" }));
    expect(await screen.findByRole("status")).toHaveProperty("textContent", "Si existe una cuenta asociada a ese correo, recibirás un enlace para restablecer tu contraseña.");
  });

  it("muestra un error de validación sin enviar una solicitud inválida", async () => {
    renderRecovery();
    const user = userEvent.setup();

    await user.type(screen.getByRole("textbox", { name: /Correo electrónico/ }), "correo-invalido");
    await user.click(screen.getByRole("button", { name: "Enviar enlace" }));

    expect(screen.getByText(/Ingresá un correo válido/)).toBeTruthy();
    expect(forgotPasswordMock).not.toHaveBeenCalled();
  });
});
