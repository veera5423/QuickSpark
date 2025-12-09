import requests
from datetime import datetime
from config import SERPAPI_KEY

def fetch_google_jobs(query="software engineer remote", location=""):
    if not SERPAPI_KEY:
        return []
    url = "https://serpapi.com/search.json"
    params = {
        "engine": "google_jobs",
        "q": query,
        "location": location,
        "api_key": SERPAPI_KEY
    }
    r = requests.get(url, params=params, timeout=15)
    data = r.json()
    jobs = []
    for j in data.get("jobs_results", []):
        jobs.append({
            "source": "google_jobs_serpapi",
            "job_id": j.get("link") or j.get("id") or j.get("title"),
            "title": j.get("title"),
            "company": j.get("company_name"),
            "location": j.get("location"),
            "remote": "remote" in (j.get("location") or "").lower(),
            "posted_at": None,
            "description": j.get("description"),
            "apply_url": j.get("link"),
            "raw": str(j),
        })
    return jobs
