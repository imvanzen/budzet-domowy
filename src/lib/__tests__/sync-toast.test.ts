import { describe, it, expect, vi, beforeEach } from "vitest";
import { showSyncToast, showSuccessToast } from "../sync-toast";

const mockAddToast = vi.fn();
const mockCloseToast = vi.fn();

vi.mock("@heroui/toast", () => ({
  addToast: (...args: unknown[]) => mockAddToast(...args),
  closeToast: (...args: unknown[]) => mockCloseToast(...args),
}));

describe("sync-toast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddToast.mockReturnValue("toast-1");
  });

  it("should show loading then success toast", async () => {
    await showSyncToast(async () => "ok", {
      loading: "Loading...",
      success: "Done",
      error: "Failed",
    });

    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Loading...",
        color: "default",
        hideCloseButton: true,
      }),
    );
    expect(mockCloseToast).toHaveBeenCalledWith("toast-1");
    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Done",
        color: "success",
      }),
    );
  });

  it("should show loading then error toast on failure", async () => {
    await expect(
      showSyncToast(
        async () => {
          throw new Error("DB error");
        },
        {
          loading: "Loading...",
          success: "Done",
          error: "Failed",
        },
      ),
    ).rejects.toThrow("DB error");

    expect(mockCloseToast).toHaveBeenCalledWith("toast-1");
    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Failed",
        color: "danger",
        description: "DB error",
      }),
    );
  });

  it("should show success toast", () => {
    showSuccessToast("Saved");

    expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Saved",
        color: "success",
      }),
    );
  });
});
