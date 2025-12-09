import feedparser
from datetime import datetime

def fetch_wwr():
    url = "https://weworkremotely.com/categories/remote-programming-jobs.rss"
    d = feedparser.parse(url)
    jobs = []
    for e in d.entries:
        link = e.link
        jobs.append({
            "source": "weworkremotely",
            "job_id": link,
            "title": e.title,
            "company": e.get("author", ""),
            "location": e.get("tags", [{}])[0].get("term", ""),
            "remote": True,
            "posted_at": None,
            "description": e.get("summary", ""),
            "apply_url": link,
            "raw": str(e),
        })
    return jobs
