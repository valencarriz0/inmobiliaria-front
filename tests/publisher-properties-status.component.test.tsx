import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePublisherProperties } from "../src/hooks/use-publisher-properties";

const listMock = vi.hoisted(() => vi.fn());
vi.mock("../src/services/publisherPropertyService", () => ({ publisherPropertyService: { list: listMock } }));

function PropertyStatusHarness() {
  const { properties, applyPropertyStatus } = usePublisherProperties();
  return <div>
    <p>{properties[0]?.publicationStatus ?? "Sin publicación"}</p>
    <button onClick={() => applyPropertyStatus("p1", "paused")}>Pausar</button>
    <button onClick={() => applyPropertyStatus("p1", "active")}>Reactivar</button>
    <button onClick={() => applyPropertyStatus("p1", "deleted")}>Eliminar</button>
  </div>;
}

describe("estado de publicaciones del publicador", () => {
  afterEach(() => vi.resetAllMocks());

  it("actualiza y quita cards en memoria sin recargar el listado", async () => {
    listMock.mockResolvedValue({ properties: [{ id: "p1", publicationStatus: "active" }] });
    render(<PropertyStatusHarness />);
    expect(await screen.findByText("active")).toBeTruthy();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Pausar" }));
    expect(screen.getByText("paused")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Reactivar" }));
    expect(screen.getByText("active")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(screen.getByText("Sin publicación")).toBeTruthy();
    expect(listMock).toHaveBeenCalledTimes(1);
  });
});
