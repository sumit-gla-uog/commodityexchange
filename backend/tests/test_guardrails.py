from unittest.mock import patch, MagicMock
import pytest
from guardrails.checks import (
    parse_json_response,
    topic_guard,
    toxicity_guard,
    hallucination_guard,
    length_guard,
    run_all_guards,
)


class FakeGroqResponse:
    """Mimics Groq's chat.completions.create() response shape."""
    def __init__(self, content: str):
        self.choices = [MagicMock(message=MagicMock(content=content))]


def make_fake_groq_client(response_content: str):
    fake_client = MagicMock()
    fake_client.chat.completions.create.return_value = FakeGroqResponse(response_content)
    return fake_client


# parse_json_response

def test_parse_json_response_plain_json():
    result = parse_json_response('{"is_relevant": true, "reason": "on topic"}')
    assert result == {"is_relevant": True, "reason": "on topic"}


def test_parse_json_response_strips_think_tags():
    text = '<think>reasoning here</think>{"is_relevant": false, "reason": "off topic"}'
    result = parse_json_response(text)
    assert result == {"is_relevant": False, "reason": "off topic"}


def test_parse_json_response_ignores_trailing_text():
    text = '{"is_relevant": true, "reason": "ok"} some trailing garbage'
    result = parse_json_response(text)
    assert result == {"is_relevant": True, "reason": "ok"}


def test_parse_json_response_repairs_malformed_json():
    # missing comma between keys
    text = '{"is_relevant": true "reason": "ok"}'
    result = parse_json_response(text)
    assert result.get("is_relevant") is True


def test_parse_json_response_unwraps_list():
    text = '[{"is_relevant": true, "reason": "ok"}]'
    result = parse_json_response(text)
    assert result == {"is_relevant": True, "reason": "ok"}


def test_parse_json_response_raises_on_no_json():
    with pytest.raises(ValueError):
        parse_json_response("no json here at all")


#  topic_guard

@patch("guardrails.checks.get_groq_client")
def test_topic_guard_passes_relevant_query(mock_get_client):
    mock_get_client.return_value = make_fake_groq_client(
        '{"is_relevant": true, "reason": "Asks about copper pricing"}'
    )
    result = topic_guard("What is the copper price trend?")

    assert result["passed"] is True
    assert result["reason"] == "Asks about copper pricing"


@patch("guardrails.checks.get_groq_client")
def test_topic_guard_blocks_irrelevant_query(mock_get_client):
    mock_get_client.return_value = make_fake_groq_client(
        '{"is_relevant": false, "reason": "Bitcoin is not a commodity"}'
    )
    result = topic_guard("What is Bitcoin price?")

    assert result["passed"] is False
    assert result["reason"] == "Bitcoin is not a commodity"


@patch("guardrails.checks.get_groq_client")
def test_topic_guard_fails_open_on_unparseable_response(mock_get_client):
    mock_get_client.return_value = make_fake_groq_client("not valid json at all")
    result = topic_guard("some query")

    assert result["passed"] is True
    assert "failed to parse" in result["reason"].lower()


# toxicity_guard 

@patch("guardrails.checks.get_groq_client")
def test_toxicity_guard_passes_clean_query(mock_get_client):
    mock_get_client.return_value = make_fake_groq_client(
        '{"is_toxic": false, "reason": "No harmful content"}'
    )
    result = toxicity_guard("What is the price of wheat?")

    assert result["passed"] is True


@patch("guardrails.checks.get_groq_client")
def test_toxicity_guard_blocks_toxic_query(mock_get_client):
    mock_get_client.return_value = make_fake_groq_client(
        '{"is_toxic": true, "reason": "Contains abusive language"}'
    )
    result = toxicity_guard("some abusive text")

    assert result["passed"] is False
    assert result["reason"] == "Contains abusive language"


#  hallucination_guard 

def test_hallucination_guard_fails_without_context():
    result = hallucination_guard("query", "answer", context_chunks=[])

    assert result["passed"] is False
    assert result["confidence"] == "low"


@patch("guardrails.checks.get_groq_client")
def test_hallucination_guard_passes_grounded_answer(mock_get_client):
    mock_get_client.return_value = make_fake_groq_client(
        '{"is_grounded": true, "confidence": "high", "reason": "Matches context"}'
    )
    result = hallucination_guard(
        "query", "answer", context_chunks=["some context chunk"]
    )

    assert result["passed"] is True
    assert result["confidence"] == "high"


@patch("guardrails.checks.get_groq_client")
def test_hallucination_guard_flags_ungrounded_answer(mock_get_client):
    mock_get_client.return_value = make_fake_groq_client(
        '{"is_grounded": false, "confidence": "low", "reason": "Not supported by context"}'
    )
    result = hallucination_guard(
        "query", "answer", context_chunks=["some context chunk"]
    )

    assert result["passed"] is False


# length_guard (pure logic) 

def test_length_guard_rejects_too_short():
    result = length_guard("Too short.")
    assert result["passed"] is False


def test_length_guard_accepts_normal_length():
    result = length_guard(" ".join(["word"] * 50))
    assert result["passed"] is True


def test_length_guard_warns_on_verbose():
    result = length_guard(" ".join(["word"] * 501))
    assert result["passed"] is True
    assert "verbose" in result["reason"].lower()


#  run_all_guards (full flow) 

@patch("guardrails.checks.log_guardrail_result")
@patch("guardrails.checks.get_db")
@patch("guardrails.checks.get_groq_client")
def test_run_all_guards_blocks_toxic_input(mock_get_client, mock_get_db, mock_log):
    mock_get_client.return_value = make_fake_groq_client(
        '{"is_toxic": true, "reason": "abusive"}'
    )

    result = run_all_guards(query="bad input")

    assert result["overall_passed"] is False
    assert result["blocked_at"] == "input"
    mock_log.assert_called_once()


@patch("guardrails.checks.log_guardrail_result")
@patch("guardrails.checks.get_db")
@patch("guardrails.checks.get_groq_client")
def test_run_all_guards_blocks_offtopic_input(mock_get_client, mock_get_db, mock_log):
    # First call = toxicity (passes), second call = topic (fails)
    responses = [
        FakeGroqResponse('{"is_toxic": false, "reason": "clean"}'),
        FakeGroqResponse('{"is_relevant": false, "reason": "not a commodity"}'),
    ]
    fake_client = MagicMock()
    fake_client.chat.completions.create.side_effect = responses
    mock_get_client.return_value = fake_client

    result = run_all_guards(query="What is Bitcoin price?")

    assert result["overall_passed"] is False
    assert result["blocked_at"] == "input"
    mock_log.assert_called_once()


@patch("guardrails.checks.log_guardrail_result")
@patch("guardrails.checks.get_db")
@patch("guardrails.checks.get_groq_client")
def test_run_all_guards_passes_input_only_check(mock_get_client, mock_get_db, mock_log):
    responses = [
        FakeGroqResponse('{"is_toxic": false, "reason": "clean"}'),
        FakeGroqResponse('{"is_relevant": true, "reason": "on topic"}'),
    ]
    fake_client = MagicMock()
    fake_client.chat.completions.create.side_effect = responses
    mock_get_client.return_value = fake_client

    result = run_all_guards(query="What is the copper price trend?")

    assert result["overall_passed"] is True
    assert result["blocked_at"] is None
    mock_log.assert_called_once()