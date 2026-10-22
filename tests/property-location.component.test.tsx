import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import PropertyLocationCombobox from "../src/components/PropertyLocationCombobox";

describe("Ubicación de búsqueda", () => {
  it("muestra la localidad sin una coma sobrante cuando falta la provincia", () => {
    render(<PropertyLocationCombobox showLabel
      value={{ city: "La Plata", province: "", cityId: "", provinceId: "" }}
      onChange={() => undefined} onBlur={() => undefined} />);

    const input = screen.getByRole("combobox", { name: "Ubicación" }) as HTMLInputElement;
    expect(input.value).toBe("La Plata");
  });

  it("muestra las sugerencias de ubicación fuera del contenedor desplazable del modal", async () => {
    render(<div className="overflow-y-auto"><PropertyLocationCombobox portal showLabel
      value={{ city: "", province: "", cityId: "", provinceId: "" }}
      onChange={() => undefined} onBlur={() => undefined} /></div>);

    await userEvent.setup().click(screen.getByRole("combobox", { name: "Ubicación" }));
    const options = screen.getByRole("listbox", { name: "Provincias y localidades" });
    expect(options.parentElement?.parentElement).toBe(document.body);
  });
});
