import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import BotonVolver from "../src/components/BotonVolver";

const navigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

describe("BotonVolver", () => {
  afterEach(() => {
    navigate.mockReset();
    window.history.replaceState({ idx: 0 }, "");
  });

  it("mantiene un botón accesible y usa el destino fijo cuando se recibe to", async () => {
    render(<BotonVolver to="/dashboard" />);

    await userEvent.setup().click(screen.getByRole("button", { name: "Volver" }));

    expect(navigate).toHaveBeenCalledWith("/dashboard");
  });

  it("vuelve una entrada del historial real cuando no recibe destino", async () => {
    window.history.replaceState({ idx: 2 }, "");
    render(<BotonVolver />);

    await userEvent.setup().click(screen.getByRole("button", { name: "Volver" }));

    expect(navigate).toHaveBeenCalledWith(-1);
  });

  it("usa el fallback contextual cuando se abre sin historial", async () => {
    render(<BotonVolver fallbackTo="/admin" />);

    await userEvent.setup().click(screen.getByRole("button", { name: "Volver" }));

    expect(navigate).toHaveBeenCalledWith("/admin");
  });
});
