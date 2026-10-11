import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import PropertyDetail from "../src/components/PropertyDetail";
import type { PublicPropertyDetail as PublicProperty } from "../src/types/public-property";

const createConsultationMock = vi.hoisted(() => vi.fn());

vi.mock("../src/hooks/use-auth", () => ({
  useAuth: () => ({
    user: {
      id: "publisher-id",
      firstName: "Ana",
      lastName: "Pérez",
      email: "ana@example.com",
      phone: "+54 351 555 0100",
      role: "publisher",
    },
  }),
}));
vi.mock("../src/services/consultationService", () => ({
  consultationService: { create: createConsultationMock },
}));
vi.mock("../src/services/publicPropertyService", () => ({
  registerPublicPropertyView: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("../src/components/PropertyGallery", () => ({ default: () => <div>Galería</div> }));
vi.mock("../src/components/FavoriteHeartButton", () => ({ default: () => <button>Favorito</button> }));
vi.mock("../src/components/BotonVolver", () => ({ default: () => <button>Volver</button> }));
vi.mock("../src/components/maps/PropertyMap", () => ({ default: () => <div>Mapa</div> }));

const ownProperty: PublicProperty = {
  id: "property-id",
  title: "Casa propia",
  description: "Casa luminosa",
  operationType: "sale",
  propertyType: "house",
  price: 120000,
  currency: "USD",
  location: { city: "Córdoba", province: "Córdoba" },
  totalArea: 120,
  rooms: 3,
  latitude: null,
  longitude: null,
  images: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  services: [],
  amenities: [],
  canConsult: false,
};

describe("PropertyDetail", () => {
  it("deshabilita las consultas cuando la propiedad pertenece al publicador autenticado", () => {
    render(<MemoryRouter><PropertyDetail property={ownProperty} /></MemoryRouter>);

    expect(screen.getByText("Esta es tu propiedad")).toBeTruthy();
    expect(screen.getByText("El envío de consultas está deshabilitado para propiedades propias.")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Enviar consulta" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByLabelText("Nombre")).toBeNull();
    expect(createConsultationMock).not.toHaveBeenCalled();
  });

  it("muestra los datos reales de contacto del publicador", () => {
    render(<MemoryRouter><PropertyDetail property={{
      ...ownProperty,
      canConsult: true,
      publisher: {
        firstName: "Ana",
        lastName: "Pública",
        email: "ana@inmobiliaria.test",
        phone: "+54 221 555 0100",
        publisherType: "agency",
        agencyName: "Inmobiliaria Central",
      },
    }} /></MemoryRouter>);

    expect(screen.getByText("Inmobiliaria Central")).toBeTruthy();
    expect(screen.getByText("Inmobiliaria · Ana Pública")).toBeTruthy();
    expect(screen.getByRole("link", { name: "ana@inmobiliaria.test" }).getAttribute("href")).toBe("mailto:ana@inmobiliaria.test");
    expect(screen.getByRole("link", { name: "+54 221 555 0100" }).getAttribute("href")).toBe("tel:+54 221 555 0100");
  });
});
