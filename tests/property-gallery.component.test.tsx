import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import PropertyGallery from "../src/components/PropertyGallery";

describe("PropertyGallery", () => {
  it("abre una imagen ampliada y permite recorrer la galería", async () => {
    const user = userEvent.setup();
    render(<PropertyGallery property={{ title: "Casa", images: ["https://example.test/one.jpg", "https://example.test/two.jpg"] }} />);

    await user.click(screen.getByRole("button", { name: "Ampliar imagen principal de Casa" }));

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Casa — imagen ampliada 1" }).getAttribute("src")).toBe("https://example.test/one.jpg");
    expect(screen.getByText("1 / 2")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Ver imagen siguiente" }));
    expect(screen.getByRole("img", { name: "Casa — imagen ampliada 2" }).getAttribute("src")).toBe("https://example.test/two.jpg");

    await user.click(screen.getByRole("button", { name: "Cerrar galería" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
