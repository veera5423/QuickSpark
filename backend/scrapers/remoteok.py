import requests
import feedparser
from bs4 import BeautifulSoup
from datetime import datetime

def fetch_remoteok():
    url = "https://remoteok.io/remote-jobs.rss"
    d = feedparser.parse(url)
    jobs = []
    for e in d.entries:
        title = e.title
        link = e.link
        company = e.get("author", "")
        published = None
        if hasattr(e, "published_parsed"):
            published = datetime(*e.published_parsed[:6])
        desc = e.get("summary", "")
        jobs.append({
            "source": "remoteok",
            "job_id": link,
            "title": title,
            "company": company,
            "location": "remote",
            "remote": True,
            "posted_at": published,
            "description": desc,
            "apply_url": link,
            "raw": str(e),
        })
    return jobs
