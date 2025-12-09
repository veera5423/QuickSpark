import feedparser

def fetch_indeed(query="software+engineer", location=""):
    # Indeed provides region-specific RSS feeds. User may need to craft appropriate URLs.
    url = f"https://www.indeed.com/rss?q={query}&l={location}"
    d = feedparser.parse(url)
    jobs = []
    for e in d.entries:
        jobs.append({
            "source": "indeed",
            "job_id": e.link,
            "title": e.title,
            "company": e.get("author", ""),
            "location": "",
            "remote": "remote" in e.title.lower() or "remote" in e.summary.lower(),
            "posted_at": None,
            "description": e.summary,
            "apply_url": e.link,
            "raw": str(e),
        })
    return jobs
 