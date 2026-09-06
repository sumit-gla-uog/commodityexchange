import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useMatchTrade } from "../../hooks/useMatchTrade";

const mockSource = {
  id: "L1",
  sme_name: "OM Exchange Ltd",
  commodity_offered: "Copper",
  quantity_offered_mt: 50,
};

const mockMatched = {
  id: "L2",
  sme_name: "Scottish Metals Ltd",
  commodity_offered: "Aluminum",
  quantity_offered_mt: 48,
  user_id: "user-999",
};

const mockFairValue = {
  value_a: 677600,
  value_b: 165072,
  delta_usd: 512528,
  delta_pct: 75.6,
  is_fair: false,
  recommendation: "Adjust quantity to balance the exchange",
};

describe("useMatchTrade", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    localStorage.setItem("user", JSON.stringify({ id: "user-123" }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("starts in the idle stage", () => {
    const { result } = renderHook(() => useMatchTrade());
    expect(result.current.stage).toBe("idle");
  });

  describe("findMatch", () => {
    it("moves to the found stage with source/matched/fairValue when a match exists", async () => {
      (fetch as any).mockResolvedValue({
        json: async () => ({
          source_listing: mockSource,
          matches: [
            { matched_listing: mockMatched, fair_value: mockFairValue },
          ],
        }),
      });

      const { result } = renderHook(() => useMatchTrade());

      await act(async () => {
        await result.current.findMatch("L1");
      });

      expect(result.current.stage).toBe("found");
      expect(result.current.source).toEqual(mockSource);
      expect(result.current.matched).toEqual(mockMatched);
      expect(result.current.fairValue).toEqual(mockFairValue);
    });

    it("moves to the no-match stage when no matches are returned", async () => {
      (fetch as any).mockResolvedValue({
        json: async () => ({ matches: [] }),
      });

      const { result } = renderHook(() => useMatchTrade());

      await act(async () => {
        await result.current.findMatch("L1");
      });

      expect(result.current.stage).toBe("no-match");
    });

    it("moves to the error stage when the request fails", async () => {
      (fetch as any).mockRejectedValue(new Error("network error"));

      const { result } = renderHook(() => useMatchTrade());

      await act(async () => {
        await result.current.findMatch("L1");
      });

      expect(result.current.stage).toBe("error");
    });
  });

  describe("startConfirming", () => {
    it("moves from found to confirming without any fetch call", async () => {
      (fetch as any).mockResolvedValue({
        json: async () => ({
          source_listing: mockSource,
          matches: [
            { matched_listing: mockMatched, fair_value: mockFairValue },
          ],
        }),
      });

      const { result } = renderHook(() => useMatchTrade());

      await act(async () => {
        await result.current.findMatch("L1");
      });

      const callCountAfterFind = (fetch as any).mock.calls.length;

      act(() => {
        result.current.startConfirming();
      });

      expect(result.current.stage).toBe("confirming");
      expect((fetch as any).mock.calls.length).toBe(callCountAfterFind);
    });
  });

  describe("confirmTrade", () => {
    async function setupToConfirmingStage() {
      (fetch as any).mockResolvedValueOnce({
        json: async () => ({
          source_listing: mockSource,
          matches: [
            { matched_listing: mockMatched, fair_value: mockFairValue },
          ],
        }),
      });

      const { result } = renderHook(() => useMatchTrade());

      await act(async () => {
        await result.current.findMatch("L1");
      });

      act(() => {
        result.current.startConfirming();
      });

      return result;
    }

    it("creates an order, updates both listings, and moves to success", async () => {
      const result = await setupToConfirmingStage();

      (fetch as any)
        .mockResolvedValueOnce({
          json: async () => ({ order: { id: "order-1" } }),
        }) // POST /orders
        .mockResolvedValueOnce({ ok: true }) // PATCH source listing
        .mockResolvedValueOnce({ ok: true }); // PATCH matched listing

      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.confirmTrade(onSuccess);
      });

      expect(result.current.stage).toBe("success");
      expect(result.current.orderRef).toBe("order-1");
      expect(onSuccess).toHaveBeenCalledOnce();

      const orderCall = (fetch as any).mock.calls.find((call: any[]) =>
        call[0].includes("/api/orders/"),
      );
      const orderBody = JSON.parse(orderCall[1].body);
      expect(orderBody.party_a_name).toBe("OM Exchange Ltd");
      expect(orderBody.party_b_name).toBe("Scottish Metals Ltd");
      expect(orderBody.initiator_user_id).toBe("user-123");
      expect(orderBody.counterparty_user_id).toBe("user-999");
    });

    it("does nothing if already submitting (guards against double-submit)", async () => {
      const result = await setupToConfirmingStage();

      (fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ json: async () => ({}) }), 50),
          ),
      );

      const onSuccess = vi.fn();

      act(() => {
        result.current.confirmTrade(onSuccess);
        result.current.confirmTrade(onSuccess); // second call while first is in-flight
      });

      await waitFor(() => expect(result.current.stage).not.toBe("confirming"));

      // Only the first confirmTrade's fetch calls should have gone through
      const orderCalls = (fetch as any).mock.calls.filter((call: any[]) =>
        call[0].includes("/api/orders/"),
      );
      expect(orderCalls.length).toBe(1);
    });

    it("moves to the error stage when order creation fails", async () => {
      const result = await setupToConfirmingStage();

      (fetch as any).mockRejectedValue(new Error("server error"));

      await act(async () => {
        await result.current.confirmTrade(vi.fn());
      });

      expect(result.current.stage).toBe("error");
    });

    it("does nothing if confirmTrade is called before a match is found", async () => {
      const { result } = renderHook(() => useMatchTrade());

      const onSuccess = vi.fn();

      await act(async () => {
        await result.current.confirmTrade(onSuccess);
      });

      expect(result.current.stage).toBe("idle");
      expect(onSuccess).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe("reset", () => {
    it("clears all state back to idle", async () => {
      (fetch as any).mockResolvedValue({
        json: async () => ({
          source_listing: mockSource,
          matches: [
            { matched_listing: mockMatched, fair_value: mockFairValue },
          ],
        }),
      });

      const { result } = renderHook(() => useMatchTrade());

      await act(async () => {
        await result.current.findMatch("L1");
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.stage).toBe("idle");
      expect(result.current.source).toBeNull();
      expect(result.current.matched).toBeNull();
      expect(result.current.fairValue).toBeNull();
      expect(result.current.orderRef).toBe("");
    });
  });

  describe("platformFee", () => {
    it("computes platform fee as 0.3% of the absolute delta", async () => {
      (fetch as any).mockResolvedValue({
        json: async () => ({
          source_listing: mockSource,
          matches: [
            { matched_listing: mockMatched, fair_value: mockFairValue },
          ],
        }),
      });

      const { result } = renderHook(() => useMatchTrade());

      await act(async () => {
        await result.current.findMatch("L1");
      });

      // 512528 * 0.003 = 1537.584 -> rounded to 1537.58
      expect(result.current.platformFee).toBe(1537.58);
    });

    it("is 0 when there is no fairValue yet", () => {
      const { result } = renderHook(() => useMatchTrade());
      expect(result.current.platformFee).toBe(0);
    });
  });
});
