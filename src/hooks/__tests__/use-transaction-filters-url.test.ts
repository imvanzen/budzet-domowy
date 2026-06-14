import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTransactionFiltersUrl } from "../use-transaction-filters-url";

const mockReplace = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => "/transactions",
  useSearchParams: () => currentSearchParams,
}));

describe("useTransactionFiltersUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentSearchParams = new URLSearchParams();
  });

  it("should read state from url", () => {
    currentSearchParams = new URLSearchParams({
      type: "INCOME",
      category: "cat-1",
      q: "kino",
      page: "2",
    });

    const { result } = renderHook(() =>
      useTransactionFiltersUrl({ categoryIds: ["cat-1", "cat-2"] }),
    );

    expect(result.current.selectedType).toBe("INCOME");
    expect(result.current.selectedCategoryId).toBe("cat-1");
    expect(result.current.searchPhrase).toBe("kino");
    expect(result.current.page).toBe(2);
  });

  it("should reset page when type filter changes", () => {
    const now = new Date();
    const from = `${now.getFullYear()}-01-01`;
    const to = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    currentSearchParams = new URLSearchParams({
      page: "3",
      period: "current-year",
      from,
      to,
    });

    const { result } = renderHook(() => useTransactionFiltersUrl({ categoryIds: ["cat-1"] }));

    act(() => {
      result.current.setType("EXPENSE");
    });

    expect(mockReplace).toHaveBeenCalledWith(
      `/transactions?period=current-year&from=${from}&to=${to}&type=EXPENSE`,
      {
        scroll: false,
      },
    );
  });

  it("should reset page when category filter changes", () => {
    currentSearchParams = new URLSearchParams({ page: "2" });

    const { result } = renderHook(() => useTransactionFiltersUrl({ categoryIds: ["cat-1"] }));

    act(() => {
      result.current.setCategoryId("cat-1");
    });

    expect(mockReplace).toHaveBeenCalledWith("/transactions?category=cat-1", {
      scroll: false,
    });
  });

  it("should debounce search updates and reset page", () => {
    vi.useFakeTimers();
    const now = new Date();
    const from = `${now.getFullYear()}-01-01`;
    const to = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    currentSearchParams = new URLSearchParams({
      period: "current-year",
      from,
      to,
    });

    const { result } = renderHook(() => useTransactionFiltersUrl({ categoryIds: ["cat-1"] }));

    mockReplace.mockClear();

    act(() => {
      result.current.setSearchInput("kino");
    });

    expect(mockReplace).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(mockReplace).toHaveBeenCalledWith(
      `/transactions?period=current-year&from=${from}&to=${to}&q=kino`,
      {
        scroll: false,
      },
    );

    vi.useRealTimers();
  });

  it("should update page in url", () => {
    const { result } = renderHook(() => useTransactionFiltersUrl({ categoryIds: ["cat-1"] }));

    act(() => {
      result.current.setPage(3);
    });

    expect(mockReplace).toHaveBeenCalledWith("/transactions?page=3", {
      scroll: false,
    });
  });

  it("should remove page param when set to 1", () => {
    currentSearchParams = new URLSearchParams({ page: "2", q: "kino" });

    const { result } = renderHook(() => useTransactionFiltersUrl({ categoryIds: ["cat-1"] }));

    act(() => {
      result.current.setPage(1);
    });

    expect(mockReplace).toHaveBeenCalledWith("/transactions?q=kino", {
      scroll: false,
    });
  });
});
