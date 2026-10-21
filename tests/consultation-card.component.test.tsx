import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ConsultationCard from "../src/components/ConsultationCard";
import type { Consultation } from "../src/types/consultation";

const consultation: Consultation = {
  id: "consultation-id",
  propertyId: "property-id",
  createdAt: "2026-10-20T12:00:00.000Z",
  firstName: "Ana",
  lastName: "Pérez",
  email: "ana@example.com",
  phone: "+54 351 555 0100",
  message: "Quisiera coordinar una visita.",
  property: {
    id: "property-id",
    title: "Casa con patio",
    operationType: "sale",
    price: 120000,
    currency: "USD",
    images: ["https://example.test/cover.jpg", "https://example.test/inside.jpg"],
    city: { id: "city-id", name: "Córdoba" },
    province: { id: "province-id", name: "Córdoba" },
  },
};

describe("ConsultationCard", () => {
  it("conserva en Mis consultas los datos enviados y sólo permite ver la propiedad", () => {
    render(<MemoryRouter><ConsultationCard consultation={consultation} /></MemoryRouter>);

    expect(screen.getByText("Ana Pérez")).toBeTruthy();
    expect(screen.getByText("Consulta por Casa con patio")).toBeTruthy();
    expect(screen.getByText("Mensaje enviado")).toBeTruthy();
    expect(screen.getByText("Correo utilizado")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ver propiedad" }).getAttribute("href")).toBe("/detail/property-id");
    expect(screen.queryByRole("link", { name: "Responder por correo" })).toBeNull();
    expect(screen.queryByRole("link", { name: "WhatsApp" })).toBeNull();
  });

  it("mantiene las acciones y el estado de nueva para el publicador", async () => {
    const onMarkSeen = vi.fn();
    render(<MemoryRouter><ConsultationCard consultation={consultation} publisher isNew onMarkSeen={onMarkSeen} /></MemoryRouter>);

    expect(screen.getByText("Nueva")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ver propiedad" }).getAttribute("href")).toBe("/detailPublisher/property-id");
    expect(screen.getByRole("link", { name: "Responder por correo" }).getAttribute("href")).toBe("mailto:ana@example.com");
    expect(screen.getByRole("link", { name: "WhatsApp" }).getAttribute("href")).toBe("https://wa.me/543515550100");

    await userEvent.setup().click(screen.getByRole("button", { name: "Marcar como vista" }));
    expect(onMarkSeen).toHaveBeenCalledOnce();
  });
});
