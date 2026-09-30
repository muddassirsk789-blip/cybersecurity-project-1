"""Idempotent seed: 8 realistic incident reports for the AEGIS intelligence radar."""
import asyncio
import uuid
from datetime import datetime, timedelta, timezone

from lib.db import db, ensure_indexes

NOW = datetime.now(timezone.utc)


def doc(hours_ago, case_suffix, title, itype, severity, status, desc, email, systems):
    return {
        "id": str(uuid.uuid4()),
        "case_id": f"CASE-2026-{case_suffix}",
        "title": title,
        "incident_type": itype,
        "severity": severity,
        "description": desc,
        "reporter_email": email,
        "affected_systems": systems,
        "status": status,
        "created_at": NOW - timedelta(hours=hours_ago),
    }


SEED = [
    doc(2, "K7QX", "Spear phishing email impersonating CFO requesting wire transfer", "phishing", "critical", "investigating",
        "Executive mailbox received a lookalike-domain email requesting an urgent vendor payment of $48,000. Headers show SPF failure and a reply-to pivot to an external address. No funds transferred yet.", "j.moreno@northpeak.io", "Finance mailbox, CEO Office 365 tenant"),
    doc(6, "M3TR", "LockBit 4.0 ransomware note detected on file server", "ransomware", "critical", "investigating",
        "Night-shift monitoring flagged mass file renames with .lockbit extension on the primary SMB share. Ransom note README_RESTORE.txt present. Server isolated from VLAN 20 within 9 minutes.", "s.okafor@gridline.co", "FS-02 file server, VLAN 20"),
    doc(14, "P9WD", "API credentials leaked in public GitHub repository", "data_breach", "high", "triaged",
        "A contractor pushed a .env file containing production database URI and a SendGrid API key to a public fork. Keys rotated and commit history scrubbed; reviewing access logs for 72h window.", "l.hart@stackfield.dev", "Production Postgres, SendGrid account"),
    doc(26, "Q2VN", "Credential stuffing wave against customer login portal", "unauthorized_access", "high", "triaged",
        "WAF logged 41,000 failed logins from 1,900 rotating residential proxies in 40 minutes. 312 accounts accessed before rate limiting engaged. Forced password reset issued for affected accounts.", "d.pratt@helio.app", "Customer auth portal, Okta tenant"),
    doc(39, "X8LB", "Employee workstation beaconing to known C2 domain", "malware", "high", "investigating",
        "EDR flagged outbound TLS callbacks every 60 seconds to a domain on the abuse.ch blocklist. User reports installing a cracked PDF tool last week. Host quarantined, memory capture in progress.", "a.novak@brightmail.cz", "WS-447 Windows 11 workstation"),
    doc(55, "R4HC", "Vishing call convinced support agent to reset MFA", "social_engineering", "medium", "triaged",
        "Caller spoofed the internal helpdesk number and persuaded a tier-1 agent to reset MFA on a finance team account. Call recording retained; extra verification step added to reset procedure.", "m.ellis@corvid.io", "IdP MFA enrollment, finance group"),
    doc(80, "T6ZS", "Volumetric DDoS against marketing site during launch", "ddos", "medium", "resolved",
        "UDP amplification peaked at 38 Gbps for 22 minutes during product launch. CDN scrubbing absorbed 97% of traffic; origin ACL hardened and launch completed with 4 minutes of degraded latency.", "r.quint@lumen.press", "Marketing CDN edge, origin web tier"),
    doc(120, "N5YD", "Outdated WordPress plugin served SEO spam injection", "malware", "low", "resolved",
        "A legacy plugin on the corporate blog injected hidden pharma links visible only to crawlers. Plugin removed, core updated, and Search Console re-review requested. No customer data involved.", "p.singh@westfield.agency", "Corporate blog (blog subdomain)"),
]


async def main():
    await db.incident_reports.drop()
    await db.incident_reports.insert_many(SEED)
    await ensure_indexes()
    print(f"seeded {len(SEED)} incident reports")


if __name__ == "__main__":
    asyncio.run(main())
