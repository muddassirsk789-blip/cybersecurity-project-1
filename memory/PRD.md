# PRD — AEGIS // PROTOCOL (Cybersecurity Awareness Grid)

## Original problem statement
"Build a website for cybersecurity awareness, add one response page (incident response — a form where users report a security incident: phishing, malware, data breach — and it gets saved). Generate a cybersecurity-themed hero image. Add sections: threats overview, safety tips, statistics. Just home + response page."

## User personas
- Employee who spotted something suspicious and needs to report fast
- Security-aware visitor learning threat vectors and defenses
- Team lead watching the live incident radar / statistics

## Architecture
- Frontend: Vite + React 19 + TS, Tailwind v4, motion (framer-motion), Lenis smooth scroll, recharts, TanStack Query, shadcn Tabs. Dark cyber theme (#070A0F + emerald #10B981), fonts Outfit / DM Sans / JetBrains Mono.
- Backend: FastAPI + motor/MongoDB. Routes: POST /api/reports (creates case ID), GET /api/reports (masked emails), GET /api/stats (aggregates). Collection: incident_reports. Seed: backend/seed.py (8 realistic reports, idempotent).
- Brand: AEGIS // PROTOCOL, custom shield SVG logo + favicon. AI-generated hero/threat imagery.

## Implemented (2026-09-30)
- Home `/`: kinetic masked-line hero with parallax + mouse-tilt, live threat radar card with sweep animation + telemetry ticker, editorial marquee (security standards), threats bento (phishing / ransomware / social engineering / malware), tabbed safety-tips matrix (4 tiers × 4 cards), statistics section (recharts bar chart + detection gap + live grid telemetry), CTA + footer.
- Response page `/report`: 5-step incident intake (title, category pills, severity pills, evidence, contact) → saves to MongoDB → confirmation panel with CASE-2026-XXXX ID + containment runbook; recent grid activity list (emails masked).
- Verified: API curls (201 create, 422 negative, list, stats) and full browser flow through public URL.

## Backlog
- P1: Interactive phishing-spotting quiz/drill; email notifications on report submission (Resend); case status lookup by case ID + email.
- P2: Admin triage dashboard (update report status); awareness articles/resources section; downloadable security checklist PDF.
- P3: Multi-language support; dark-terminal Easter egg; org onboarding.

## Next tasks
1. Case lookup page so reporters can track status
2. Email confirmation via Resend on report submission
3. Admin dashboard for triaging reports

## Update — Survey Responses page (July 2026)
- Added `/responses` page ("Awareness survey results") recreating the user's Google Forms charts: Age (bar), Heard about cybersecurity (horizontal bar), Internet usage frequency (donut), Main device (donut). 31 respondents.
- Backend: `GET /api/survey` serves the data from `/app/backend/survey_data.py` (edit this file to add/adjust questions).
- Frontend: `src/pages/SurveyResponses.tsx`, `src/components/SurveyChart.tsx` (recharts), navbar link `nav-link-responses`.
- Incident report form remains at `/report`.
- Added 10 more awareness questions (Q04–Q13: password reuse, 2FA, phishing exposure, victim, updates, public Wi-Fi, antivirus, phishing confidence, learning sources [multi-select], workshop interest). These use SAMPLE (placeholder) data flagged with `"sample": True` and shown with an amber "Sample data" tag; replace counts in `survey_data.py` with real results when available. Supports `multi: True` (percent of respondents).
- Live survey feature was built then REMOVED at user request (July 2026). Charts are static from `survey_data.py`; `GET /api/survey` only. No `/survey` page or `survey_responses` collection.
