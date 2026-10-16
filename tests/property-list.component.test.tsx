import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PropertyList from "../src/components/PropertyList";
import type { PublicPropertySummary } from "../src/types/public-property";

vi.mock("../src/components/FavoriteHeartButton", () => ({
  default: ({ property }: { property: { title: string } }) => (
    <button aria-label={`Guardar en favoritos: ${property.title}`} />
  ),
}));

const property: PublicPropertySummary = {
  id: "propiedad-1",
  title: "Casa amplia con patio",
  description: "Casa luminosa",
  operationType: "temporary_rent",
  propertyType: "house",
  price: 200000,
  currency: "ARS",
  location: { city: "Bahía Blanca", province: "Buenos Aires" },
  totalArea: 120,
  rooms: 4,
  bedrooms: 3,
  bathrooms: 2,
  latitude: null,
  longitude: null,
  images: ["https://example.com/casa.jpg"],
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("PropertyList", () => {
  it("expone toda la card como acceso al detalle y mantiene favorito independiente", async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<PropertyList properties={[property]} />} />
          <Route path="/detail/:id" element={<p>Detalle abierto</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Ver detalles")).toBeNull();
    const favoriteButton = screen.getByRole("button", { name: `Guardar en favoritos: ${property.title}` });
    expect(favoriteButton).toBeTruthy();

    await userEvent.setup().click(favoriteButton);

    expect(screen.queryByText("Detalle abierto")).toBeNull();

    await userEvent.setup().click(screen.getByRole("link", { name: `Ver detalle de ${property.title}` }));

    expect(screen.getByText("Detalle abierto")).toBeTruthy();
  });

  it("muestra los datos principales con el tratamiento visual de la card", () => {
    render(<MemoryRouter><PropertyList properties={[property]} /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: property.title })).toBeTruthy();
    expect(screen.getByText("Alquiler temporario")).toBeTruthy();
    expect(screen.getByText("Bahía Blanca, Buenos Aires")).toBeTruthy();
    expect(screen.getByText("3 habitaciones")).toBeTruthy();
    expect(screen.getByText("2 baños")).toBeTruthy();
    expect(screen.getByText("120 m²")).toBeTruthy();
    expect(screen.getByText("ARS 200.000")).toBeTruthy();
  });
});
