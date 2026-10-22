import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardListSkeleton, PropertyDetailSkeleton, PropertyGridSkeleton, StatisticsSkeleton } from "../src/components/LoadingSkeletons";

describe("estados de carga", () => {
  it("mantiene la estructura del catálogo y anuncia la carga sin mostrar datos falsos", () => {
    const { container } = render(<PropertyGridSkeleton />);

    expect(screen.getByRole("status", { name: "Cargando propiedades..." })).toBeTruthy();
    expect(container.querySelectorAll('[class*="min-h-[31rem]"]')).toHaveLength(3);
    expect(screen.getByRole("status", { name: "Cargando propiedades..." }).querySelectorAll(":scope > div")).toHaveLength(3);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("ofrece variantes para detalle, listados y estadísticas", () => {
    const { rerender } = render(<PropertyDetailSkeleton />);
    expect(screen.getByRole("status", { name: "Cargando propiedad..." })).toBeTruthy();

    rerender(<CardListSkeleton label="Cargando alertas..." variant="alerts" count={2} />);
    expect(screen.getByRole("status", { name: "Cargando alertas..." })).toBeTruthy();

    rerender(<StatisticsSkeleton />);
    expect(screen.getByRole("status", { name: "Cargando estadísticas..." })).toBeTruthy();
  });
});
