from fastapi import APIRouter
import json
import os

router = APIRouter()

RESULTS_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "ragas_results.json"
)


@router.get("")
def get_evaluation_results():
    # Load RAGAS results from JSON file
    if not os.path.exists(RESULTS_PATH):
        return {
            "message": "Evaluation results not found. Run ragas_eval.py first.",
            "faithfulness": None,
            "answer_relevancy": None,
            "total_questions": 0,
            "per_question": []
        }

    with open(RESULTS_PATH, "r") as f:
        results = json.load(f)

    return results