import asyncio
import logging
import os
import random
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Literal, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter
from pydantic import BaseModel, Field, EmailStr
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from lib.db import client, db, ensure_indexes
from survey import router as survey_router

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.index_task = asyncio.create_task(ensure_indexes())
    yield
    client.close()


app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")

IncidentType = Literal[
    'phishing', 'ransomware', 'data_breach', 'malware',
    'social_engineering', 'unauthorized_access', 'ddos', 'other',
]
Severity = Literal['low', 'medium', 'high', 'critical']

CASE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"


def new_case_id() -> str:
    return "CASE-2026-" + "".join(random.choices(CASE_ALPHABET, k=4))


def mask_email(email: str) -> str:
    name, _, domain = email.partition("@")
    return f"{name[:1]}***@{domain}" if domain else "***"


def aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


class IncidentReportCreate(BaseModel):
    title: str = Field(min_length=4, max_length=140)
    incident_type: IncidentType
    severity: Severity
    description: str = Field(min_length=20, max_length=4000)
    reporter_email: EmailStr
    affected_systems: Optional[str] = Field(default=None, max_length=300)
    occurred_at: Optional[str] = Field(default=None, max_length=60)


class IncidentReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    case_id: str
    title: str
    incident_type: str
    severity: str
    description: str
    reporter_email: str
    affected_systems: Optional[str] = None
    status: str = "received"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


@api_router.get("/")
async def root():
    return {"message": "AEGIS // PROTOCOL grid online"}


@api_router.post("/reports", response_model=IncidentReport, status_code=201)
async def create_report(payload: IncidentReportCreate):
    report = IncidentReport(case_id=new_case_id(), **payload.model_dump())
    await db.incident_reports.insert_one(report.model_dump())
    logger.info("incident reported: %s (%s/%s)", report.case_id, report.incident_type, report.severity)
    return report


@api_router.get("/reports", response_model=List[IncidentReport])
async def list_reports():
    docs = await db.incident_reports.find().sort("created_at", -1).to_list(20)
    out: List[IncidentReport] = []
    for d in docs:
        d.pop("_id", None)
        d["created_at"] = aware(d["created_at"])
        d["reporter_email"] = mask_email(d.get("reporter_email", ""))
        out.append(IncidentReport(**d))
    return out


@api_router.get("/stats")
async def stats():
    total = await db.incident_reports.count_documents({})
    by_status = {
        d["_id"]: d["n"]
        async for d in db.incident_reports.aggregate(
            [{"$group": {"_id": "$status", "n": {"$sum": 1}}}]
        )
    }
    by_type = {
        d["_id"]: d["n"]
        async for d in db.incident_reports.aggregate(
            [{"$group": {"_id": "$incident_type", "n": {"$sum": 1}}}]
        )
    }
    active = sum(by_status.get(s, 0) for s in ("received", "triaged", "investigating"))
    return {
        "total": total,
        "received": by_status.get("received", 0),
        "triaged": by_status.get("triaged", 0),
        "investigating": by_status.get("investigating", 0),
        "resolved": by_status.get("resolved", 0),
        "active": active,
        "by_type": by_type,
    }


app.include_router(api_router)
app.include_router(survey_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
