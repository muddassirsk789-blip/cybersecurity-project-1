"""Live survey: accepts responses and merges them into the baseline chart data."""

import copy
import uuid
from collections import Counter
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from lib.db import db
from survey_data import SURVEY

router = APIRouter(prefix="/api/survey")

QUESTIONS = {q["id"]: q for q in SURVEY["questions"]}
AGE_ID = "age"


class SurveySubmission(BaseModel):
    answers: dict[str, str | list[str]] = Field(min_length=1)


class SurveyResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    answers: dict[str, str | list[str]]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


def validate(answers: dict[str, str | list[str]]) -> dict[str, str | list[str]]:
    clean: dict[str, str | list[str]] = {}
    for qid, q in QUESTIONS.items():
        value = answers.get(qid)
        if value is None or value == "" or value == []:
            raise HTTPException(422, f"Question '{q['question']}' is required.")
        labels = {o["label"] for o in q["options"]}
        if qid == AGE_ID:
            if not isinstance(value, str) or not value.isdigit() or not 10 <= int(value) <= 100:
                raise HTTPException(422, "Age must be a whole number between 10 and 100.")
            clean[qid] = str(int(value))
        elif q.get("multi"):
            if not isinstance(value, list) or not set(value) <= labels:
                raise HTTPException(422, f"Invalid selection for '{q['question']}'.")
            clean[qid] = value
        else:
            if not isinstance(value, str) or value not in labels:
                raise HTTPException(422, f"Invalid selection for '{q['question']}'.")
            clean[qid] = value
    return clean


def merge(baseline: dict, docs: list[dict]) -> dict:
    """Baseline + live answers. Sample questions are replaced entirely once real answers exist."""
    out = copy.deepcopy(baseline)
    out["respondents"] = baseline["respondents"] + len(docs)
    out["live_responses"] = len(docs)

    for q in out["questions"]:
        counts: Counter[str] = Counter()
        answered = 0
        for d in docs:
            v = d.get("answers", {}).get(q["id"])
            if v is None:
                continue
            answered += 1
            counts.update(v if isinstance(v, list) else [v])
        if answered == 0:
            continue

        if q.get("sample"):
            for o in q["options"]:
                o["count"] = counts.pop(o["label"], 0)
            q["responses"] = answered
            q["sample"] = False
        else:
            for o in q["options"]:
                o["count"] += counts.pop(o["label"], 0)
            q["responses"] += answered

        q["options"].extend({"label": k, "count": n} for k, n in counts.items())
        if q["id"] == AGE_ID:
            q["options"].sort(key=lambda o: int(o["label"]))
    return out


@router.get("")
async def survey():
    docs = await db.survey_responses.find({}, {"_id": 0, "answers": 1}).to_list(5000)
    return merge(SURVEY, docs)


@router.post("/responses", status_code=201)
async def submit(payload: SurveySubmission):
    response = SurveyResponse(answers=validate(payload.answers))
    await db.survey_responses.insert_one(response.model_dump())
    total = await db.survey_responses.count_documents({})
    return {"id": response.id, "live_responses": total}
