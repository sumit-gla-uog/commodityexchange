from guardrails.service import _determine_status, log_guardrail_result, get_logs


class FakeResponse:
    def __init__(self, data, count=None):
        self.data = data
        self.count = count


class FakeTable:
    def __init__(self, fetch_data=None, fetch_count=0):
        self._fetch_data = fetch_data or []
        self._fetch_count = fetch_count
        self.inserted_rows = []
        self._last_call = "select"

    def insert(self, row):
        self._last_call = "insert"
        self.inserted_rows.append(row)
        return self

    def select(self, *args, **kwargs):
        self._last_call = "select"
        return self

    def order(self, *args, **kwargs):
        return self

    def range(self, *args, **kwargs):
        return self

    def execute(self):
        if self._last_call == "insert":
            return FakeResponse(self.inserted_rows)
        return FakeResponse(self._fetch_data, count=self._fetch_count)


class FakeSupabase:
    def __init__(self, fetch_data=None, fetch_count=0):
        self._table = FakeTable(fetch_data, fetch_count)

    def table(self, name):
        return self._table


# _determine_status (pure logic)

def test_determine_status_blocked_at_input_toxicity():
    result = {
        "overall_passed": False,
        "blocked_at": "input",
        "toxicity_guard": {"passed": False, "reason": "abusive content"},
        "topic_guard": {"passed": True, "reason": "on topic"},
    }
    status, reason = _determine_status(result)

    assert status == "BLOCKED"
    assert reason == "abusive content"


def test_determine_status_blocked_at_input_topic():
    result = {
        "overall_passed": False,
        "blocked_at": "input",
        "toxicity_guard": {"passed": True, "reason": "clean"},
        "topic_guard": {"passed": False, "reason": "not a commodity"},
    }
    status, reason = _determine_status(result)

    assert status == "BLOCKED"
    assert reason == "not a commodity"


def test_determine_status_blocked_on_hallucination():
    result = {
        "overall_passed": False,
        "blocked_at": None,
        "hallucination_guard": {"passed": False, "reason": "not grounded"},
        "length_guard": {"passed": True, "reason": "ok"},
    }
    status, reason = _determine_status(result)

    assert status == "BLOCKED"
    assert reason == "not grounded"


def test_determine_status_blocked_on_length():
    result = {
        "overall_passed": False,
        "blocked_at": None,
        "hallucination_guard": {"passed": True, "reason": "grounded"},
        "length_guard": {"passed": False, "reason": "too short"},
    }
    status, reason = _determine_status(result)

    assert status == "BLOCKED"
    assert reason == "too short"


def test_determine_status_flagged_on_low_confidence():
    result = {
        "overall_passed": True,
        "blocked_at": None,
        "topic_guard": {"passed": True, "reason": "on topic"},
        "hallucination_guard": {"passed": True, "confidence": "low", "reason": "weak match"},
        "length_guard": {"passed": True, "reason": "ok"},
    }
    status, reason = _determine_status(result)

    assert status == "FLAGGED"
    assert reason == "weak match"


def test_determine_status_flagged_on_verbose():
    result = {
        "overall_passed": True,
        "blocked_at": None,
        "topic_guard": {"passed": True, "reason": "on topic"},
        "hallucination_guard": {"passed": True, "confidence": "high", "reason": "grounded"},
        "length_guard": {"passed": True, "reason": "Response verbose (600 words)."},
    }
    status, reason = _determine_status(result)

    assert status == "FLAGGED"
    assert "verbose" in reason.lower()


def test_determine_status_passed():
    result = {
        "overall_passed": True,
        "blocked_at": None,
        "topic_guard": {"passed": True, "reason": "Valid commodity query"},
        "hallucination_guard": None,
        "length_guard": None,
    }
    status, reason = _determine_status(result)

    assert status == "PASSED"
    assert reason == "Valid commodity query"


# log_guardrail_result 

def test_log_guardrail_result_inserts_blocked_row():
    fake_supabase = FakeSupabase()
    result = {
        "query": "What is Bitcoin price?",
        "overall_passed": False,
        "blocked_at": "input",
        "toxicity_guard": {"passed": True, "reason": "clean"},
        "topic_guard": {"passed": False, "reason": "Not a commodity"},
    }

    log_guardrail_result(result, fake_supabase)

    inserted = fake_supabase._table.inserted_rows[0]
    assert inserted["status"] == "BLOCKED"
    assert inserted["query"] == "What is Bitcoin price?"
    assert inserted["reason"] == "Not a commodity"


def test_log_guardrail_result_inserts_passed_row():
    fake_supabase = FakeSupabase()
    result = {
        "query": "What is the copper price trend?",
        "overall_passed": True,
        "blocked_at": None,
        "topic_guard": {"passed": True, "reason": "Valid commodity query"},
        "hallucination_guard": None,
        "length_guard": None,
    }

    log_guardrail_result(result, fake_supabase)

    inserted = fake_supabase._table.inserted_rows[0]
    assert inserted["status"] == "PASSED"


#  get_logs

def test_get_logs_returns_paginated_data():
    fake_data = [
        {"status": "BLOCKED", "query": "q1", "reason": "r1", "created_at": "2026-01-01"},
        {"status": "PASSED", "query": "q2", "reason": "r2", "created_at": "2026-01-02"},
    ]
    fake_supabase = FakeSupabase(fetch_data=fake_data, fetch_count=7)

    result = get_logs(fake_supabase, page=2, page_size=5)

    assert result["logs"] == fake_data
    assert result["total"] == 7


def test_get_logs_defaults_to_zero_when_count_none():
    fake_supabase = FakeSupabase(fetch_data=[], fetch_count=None)

    result = get_logs(fake_supabase, page=1, page_size=5)

    assert result["total"] == 0