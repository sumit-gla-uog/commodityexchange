import json
import os
import sys
import time

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rag.engine import retrieve_context, build_prompt, generate_response
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

TEST_DATASET_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "test_dataset.json"
)

RESULTS_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "ragas_results.json"
)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def evaluate_faithfulness(question: str, answer: str, contexts: list) -> float:
    context_text = "\n".join(contexts[:3])
    prompt = f"""You are an evaluation assistant. Score the faithfulness of this answer.
Faithfulness measures if the answer is grounded in the context provided.

CONTEXT:
{context_text}

QUESTION: {question}
ANSWER: {answer}

Score from 0.0 to 1.0 where:
1.0 = answer is completely grounded in context
0.0 = answer contains claims not in context

Reply with ONLY a number between 0.0 and 1.0"""

    response = groq_client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=10
    )
    try:
        return float(response.choices[0].message.content.strip())
    except:
        return 0.5


def evaluate_answer_relevancy(question: str, answer: str) -> float:
    prompt = f"""You are an evaluation assistant. Score the relevancy of this answer.
Answer relevancy measures if the answer directly addresses the question asked.

QUESTION: {question}
ANSWER: {answer}

Score from 0.0 to 1.0 where:
1.0 = answer directly and completely addresses the question
0.0 = answer is completely irrelevant to the question

Reply with ONLY a number between 0.0 and 1.0"""

    response = groq_client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=10
    )
    try:
        return float(response.choices[0].message.content.strip())
    except:
        return 0.5


def run_evaluation():
    with open(TEST_DATASET_PATH, "r") as f:
        test_cases = json.load(f)["test_cases"]

    print(f"Running evaluation for {len(test_cases)} test cases...")

    per_question = []
    total_faithfulness = 0
    total_relevancy = 0

    for i, case in enumerate(test_cases):
        print(f"\nProcessing {i+1}/{len(test_cases)}: {case['question'][:50]}...")

        # Run RAG pipeline
        docs, metadatas = retrieve_context(case["question"])
        prompt = build_prompt(case["question"], docs, metadatas)
        answer = generate_response(prompt)
        time.sleep(2)  # Groq rate limit

        # Evaluate
        faithfulness = evaluate_faithfulness(case["question"], answer, docs)
        time.sleep(1)
        relevancy = evaluate_answer_relevancy(case["question"], answer)
        time.sleep(1)

        per_question.append({
            "question": case["question"],
            "answer": answer,
            "faithfulness": round(faithfulness, 4),
            "answer_relevancy": round(relevancy, 4)
        })

        total_faithfulness += faithfulness
        total_relevancy += relevancy

        print(f"Faithfulness: {faithfulness:.2f} | Relevancy: {relevancy:.2f}")

    # Aggregate scores
    n = len(test_cases)
    scores = {
        "faithfulness": round(total_faithfulness / n, 4),
        "answer_relevancy": round(total_relevancy / n, 4),
        "total_questions": n,
        "per_question": per_question
    }

    with open(RESULTS_PATH, "w") as f:
        json.dump(scores, f, indent=2)

    print(f"\nEvaluation Complete!")
    print(f"Faithfulness:     {scores['faithfulness']}")
    print(f"Answer Relevancy: {scores['answer_relevancy']}")
    print(f"Results saved to: {RESULTS_PATH}")

    return scores


if __name__ == "__main__":
    run_evaluation()