import { describe, expect, it } from "vitest";
import { normalizeText, requireText } from "./validation";

describe("text validation", () => {
  it("normalizes Unicode, control/format characters and whitespace", () => {
    expect(normalizeText("  Cafe\u0301\u200b   da\nmanhã  ")).toBe(
      "Café da manhã",
    );
  });

  it("enforces normalized length limits", () => {
    expect(requireText("  Meta  ", 3, 10, "invalid")).toBe("Meta");
    expect(() => requireText("a", 3, 10, "invalid")).toThrow("invalid");
    expect(() => requireText("texto longo", 1, 5, "invalid")).toThrow(
      "invalid",
    );
  });
});
