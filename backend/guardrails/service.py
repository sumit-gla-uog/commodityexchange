def _determine_status(result: dict) -> tuple[str, str]:
    if not result["overall_passed"]:
        if result["blocked_at"] == "input":
            g = result["toxicity_guard"] if not result["toxicity_guard"]["passed"] else result["topic_guard"]
            return "BLOCKED", g["reason"]
        hall = result.get("hallucination_guard")
        if hall and not hall["passed"]:
            return "BLOCKED", hall["reason"]
        length = result.get("length_guard")
        if length and not length["passed"]:
            return "BLOCKED", length["reason"]
        return "BLOCKED", "Failed guardrail checks."

    hall = result.get("hallucination_guard")
    if hall and hall.get("confidence") == "low":
        return "FLAGGED", hall["reason"]
    length = result.get("length_guard")
    if length and "verbose" in length["reason"].lower():
        return "FLAGGED", length["reason"]

    return "PASSED", (result.get("topic_guard") or {}).get("reason", "All checks passed.")


def log_guardrail_result(result: dict, supabase) -> None:
    status, reason = _determine_status(result)
    supabase.table("guardrail_logs").insert({
        "status": status,
        "query": result["query"],
        "reason": reason,
    }).execute()


def get_logs(supabase, page: int = 1, page_size: int = 5) -> dict:
    offset = (page - 1) * page_size

    res = (
        supabase.table("guardrail_logs")
        .select("*", count="exact")
        .order("created_at", desc=True)
        .range(offset, offset + page_size - 1)
        .execute()
    )

    return {
        "logs": res.data,
        "total": res.count or 0,
    }