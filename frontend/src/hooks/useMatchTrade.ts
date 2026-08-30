import { useState, useRef } from "react";
import { BASE_URL } from "../api/client";
import type {
  FairValue,
  MatchedListing,
  SourceListing,
} from "../types/commodity";

type MatchStage =
  | "idle"
  | "loading"
  | "no-match"
  | "found"
  | "confirming"
  | "submitting"
  | "success"
  | "error";

const PLATFORM_FEE_RATE = 0.003;

export const useMatchTrade = () => {
  const [stage, setStage] = useState<MatchStage>("idle");
  const [source, setSource] = useState<SourceListing | null>(null);
  const [matched, setMatched] = useState<MatchedListing | null>(null);
  const [fairValue, setFairValue] = useState<FairValue | null>(null);
  const [orderRef, setOrderRef] = useState<string>("");
  const isSubmittingRef = useRef(false);

  const findMatch = async (listingId: string) => {
    setStage("loading");
    try {
      const res = await fetch(`${BASE_URL}/api/barter/match/${listingId}`, {
        method: "POST",
      });
      const data = await res.json();

      if (!data.matches || data.matches.length === 0) {
        setStage("no-match");
        return;
      }

      setSource(data.source_listing);
      setMatched(data.matches[0].matched_listing);
      setFairValue(data.matches[0].fair_value);
      setStage("found");
    } catch {
      setStage("error");
    }
  };

  const startConfirming = () => setStage("confirming");

  const confirmTrade = async (onSuccess: () => void) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (isSubmittingRef.current) return;
    if (!source || !matched || !fairValue) return;

    isSubmittingRef.current = true;
    setStage("submitting");

    try {
      const platformFee =
        Math.round(Math.abs(fairValue.delta_usd) * PLATFORM_FEE_RATE * 100) /
        100;

      const orderRes = await fetch(`${BASE_URL}/api/orders/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          party_a_name: source.sme_name,
          party_a_commodity: source.commodity_offered,
          party_a_quantity: source.quantity_offered_mt,
          party_b_name: matched.sme_name,
          party_b_commodity: matched.commodity_offered,
          party_b_quantity: matched.quantity_offered_mt,
          fair_value: fairValue.value_a,
          fair_value_delta: fairValue.delta_usd,
          platform_fee: platformFee,
          vat_treatment: "Zero-rated",
          escrow_status: "pending",
          status: "pending",
          initiator_user_id: user.id, 
          counterparty_user_id: matched.user_id,
        }),
      });
      const orderData = await orderRes.json();

      await Promise.all([
        fetch(`${BASE_URL}/api/barter/listings/${source.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "matched" }),
        }),
        fetch(`${BASE_URL}/api/barter/listings/${matched.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "matched" }),
        }),
      ]);

      setOrderRef(orderData.order?.id ?? orderData.id ?? "");
      setStage("success");
      onSuccess();
    } catch {
      setStage("error");
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const reset = () => {
    setStage("idle");
    setSource(null);
    setMatched(null);
    setFairValue(null);
    setOrderRef("");
  };

  const platformFee = fairValue
    ? Math.round(Math.abs(fairValue.delta_usd) * PLATFORM_FEE_RATE * 100) / 100
    : 0;

  return {
    stage,
    source,
    matched,
    fairValue,
    orderRef,
    platformFee,
    platformFeeRate: PLATFORM_FEE_RATE,
    findMatch,
    startConfirming,
    confirmTrade,
    reset,
  };
};
