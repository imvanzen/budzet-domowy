import { describe, it, expect, vi, beforeEach } from "vitest";
import { changeCurrency } from "../actions";
import * as settingsService from "@/services/settings";

// Mock the settings service
vi.mock("@/services/settings", () => ({
  updateSettings: vi.fn(),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Settings Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("changeCurrency", () => {
    it("should update currency to PLN", async () => {
      const mockSettings = {
        id: "singleton",
        currency: "PLN" as const,
      };

      vi.mocked(settingsService.updateSettings).mockResolvedValue(
        mockSettings as any
      );

      const result = await changeCurrency("PLN");

      expect(result.success).toBe(true);
      expect(settingsService.updateSettings).toHaveBeenCalledWith("PLN");
    });

    it("should update currency to EUR", async () => {
      const mockSettings = {
        id: "singleton",
        currency: "EUR" as const,
      };

      vi.mocked(settingsService.updateSettings).mockResolvedValue(
        mockSettings as any
      );

      const result = await changeCurrency("EUR");

      expect(result.success).toBe(true);
      expect(settingsService.updateSettings).toHaveBeenCalledWith("EUR");
    });

    it("should update currency to USD", async () => {
      const mockSettings = {
        id: "singleton",
        currency: "USD" as const,
      };

      vi.mocked(settingsService.updateSettings).mockResolvedValue(
        mockSettings as any
      );

      const result = await changeCurrency("USD");

      expect(result.success).toBe(true);
      expect(settingsService.updateSettings).toHaveBeenCalledWith("USD");
    });

    it("should handle database errors gracefully", async () => {
      vi.mocked(settingsService.updateSettings).mockRejectedValue(
        new Error("Database error")
      );

      const result = await changeCurrency("PLN");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Wystąpił błąd podczas zmiany waluty");
    });
  });
});

