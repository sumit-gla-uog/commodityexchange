import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

import re

def parse_json_response(text: str) -> dict:
    # Removed <think>...</think> blocks
    text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()
    # Extract JSON object
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        return json.loads(match.group())
    return json.loads(text)

def get_groq_client():
    return Groq(api_key=os.getenv("GROQ_API_KEY"))


def topic_guard(query: str) -> dict:
    """
    LLM-based topic guard - checks if query is commodity/procurement related
    """

    # print('topic_guard called with:', query)
    client = get_groq_client()
    # print('get groq client---',client)
    prompt = f"""You are a topic classifier for CommodEx, a B2B commodity intelligence platform for UK industrial SMEs.

Determine if this query is related to:
- Commodity prices (metals, energy, agriculture)
- Procurement decisions and buying strategy
- Supply chain and inventory management
- Barter or raw material exchange
- Market trends for raw materials

Query: "{query}"

Reply with ONLY a JSON object, no extra text:
{{"is_relevant": true or false, "reason": "brief explanation in one sentence"}}"""

    response = client.chat.completions.create(
        model="qwen/qwen3.6-27b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        # max_tokens=100
        max_tokens=500
    )
    # print('result from model---',response)
    # result = json.loads(response.choices[0].message.content)
    result = parse_json_response(response.choices[0].message.content)
    # print('result from model---',result)

    return {
        "passed": result["is_relevant"],
        "reason": result["reason"]
    }


def hallucination_guard(query: str, answer: str, context_chunks: list) -> dict:
    """
    LLM-based hallucination guard - checks if answer is grounded in context
    """
    if not context_chunks:
        return {
            "passed": False,
            "reason": "No context chunks retrieved — answer may not be grounded.",
            "confidence": "low"
        }

    client = get_groq_client()
    context_text = "\n".join(context_chunks[:3])  # Top 3 chunks only

    prompt = f"""You are a hallucination detector for a RAG system.

Check if the answer below is grounded in the provided context. 
The answer should only make claims supported by the context.

CONTEXT:
{context_text}

QUESTION: {query}

ANSWER: {answer}

Reply with ONLY a JSON object, no extra text:
{{"is_grounded": true or false, "confidence": "high/medium/low", "reason": "brief explanation in one sentence"}}"""

    response = client.chat.completions.create(
        model="qwen/qwen3.6-27b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        # max_tokens=150
         max_tokens=500
    )

    # result = json.loads(response.choices[0].message.content)
    result = parse_json_response(response.choices[0].message.content)

    return {
        "passed": result["is_grounded"],
        "confidence": result["confidence"],
        "reason": result["reason"]
    }


def toxicity_guard(query: str) -> dict:
    """
    LLM-based toxicity guard — checks for harmful or abusive content
    """
    client = get_groq_client()

    prompt = f"""You are a content safety classifier.

Check if the following query contains any harmful, abusive, discriminatory, 
or inappropriate content that should be blocked.

Query: "{query}"

Reply with ONLY a JSON object, no extra text:
{{"is_toxic": true or false, "reason": "brief explanation in one sentence"}}"""

    response = client.chat.completions.create(
        model="qwen/qwen3.6-27b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        # max_tokens=100
        max_tokens=500
    )
    raw = response.choices[0].message.content
    # print('TOXICITY RAW RESPONSE:::::', raw)
    # result = json.loads(response.choices[0].message.content)
    result = parse_json_response(response.choices[0].message.content)

    return {
        "passed": not result["is_toxic"],
        "reason": result["reason"]
    }


def length_guard(answer: str) -> dict:
    """
    Rule-based length guard — checks response length
    """
    word_count = len(answer.split())

    if word_count < 20:
        return {
            "passed": False,
            "reason": f"Response too short ({word_count} words). May be insufficient."
        }
    if word_count > 500:
        return {
            "passed": True,
            "reason": f"Response verbose ({word_count} words). Consider summarising.",
        }

    return {
        "passed": True,
        "reason": f"Response length acceptable ({word_count} words)."
    }


def run_all_guards(query: str, answer: str = "", context_chunks: list = []) -> dict:
    """
    Run all guardrails and return combined result with log entry.
    Input guards run before LLM, output guards run after.
    """
    # Input guards
    # print('run_all_guards called')

    toxicity_result = toxicity_guard(query)
    # print('toxicity done:', toxicity_result)
    if not toxicity_result["passed"]:
        return {
            "query": query,
            "toxicity_guard": toxicity_result,
            "topic_guard": None,
            "hallucination_guard": None,
            "length_guard": None,
            "overall_passed": False,
            "blocked_at": "input"
        }

    topic_result = topic_guard(query)
    if not topic_result["passed"]:
        return {
            "query": query,
            "toxicity_guard": toxicity_result,
            "topic_guard": topic_result,
            "hallucination_guard": None,
            "length_guard": None,
            "overall_passed": False,
            "blocked_at": "input"
        }

    result = {
        "query": query,
        "toxicity_guard": toxicity_result,
        "topic_guard": topic_result,
        "hallucination_guard": None,
        "length_guard": None,
        "overall_passed": True,
        "blocked_at": None
    }

    # Output guards
    if answer:
        hall_result = hallucination_guard(query, answer, context_chunks)
        len_result = length_guard(answer)
        result["hallucination_guard"] = hall_result
        result["length_guard"] = len_result
        result["overall_passed"] = hall_result["passed"] and len_result["passed"]

    return result