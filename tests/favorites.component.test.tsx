import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import Favorites from "../src/pages/User/Favorites";

const useAuthMock = vi.hoisted(() => vi.fn());
const getPropertyMock = vi.hoisted(() => vi.fn());

vi.mock("../src/hooks/use-auth", () => ({ useAuth: useAuthMock }));
vi.mock("../src/services/publicPropertyService", () => ({ getPublicPropertyById: getPropertyMock }));
vi.mock("../src/components/HeaderUser", () => ({ default: () => <header>Encabezado</header> }));
vi.mock("../src/components/BotonVolver", () => ({ default: () => <button>Volver</button> }));
vi.mock("../src/components/PropertyList", () => ({ default: ({ properties }: { properties: { title: string }[] }) => <ul>{properties.map((property) => <li key={property.title}>{property.title}</li>)}</ul> }));

const auth = (overrides = {}) => ({ favoriteIds: ["p1"], favoritesLoading: false, favoritesError: null, refreshFavorites: vi.fn(), ...overrides });

describe("Favorites", () => {
  afterEach(() => vi.resetAllMocks());

  it("muestra las propiedades favoritas cargadas", async () => {
    useAuthMock.mockReturnValue(auth());
    getPropertyMock.mockResolvedValue({ id: "p1", title: "Casa con patio" });

    render(<MemoryRouter><Favorites /></MemoryRouter>);

    expect(screen.getByRole("status").textContent).toContain("Cargando favoritos");
    expect(await screen.findByText("Casa con patio")).toBeTruthy();
  });

  it("informa el error y permite reintentar la carga", async () => {
    const refreshFavorites = vi.fn();
    useAuthMock.mockReturnValue(auth({ favoritesError: "No se pudieron cargar favoritos.", refreshFavorites }));

    render(<MemoryRouter><Favorites /></MemoryRouter>);

    expect((await screen.findByRole("alert")).textContent).toContain("No se pudieron cargar favoritos");
    await userEvent.setup().click(screen.getByRole("button", { name: "Reintentar" }));
    await waitFor(() => expect(refreshFavorites).toHaveBeenCalledOnce());
  });
});
