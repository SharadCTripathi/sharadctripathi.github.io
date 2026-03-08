import json
from datetime import datetime
from scholarly import scholarly, ProxyGenerator

# Your Google Scholar ID
SCHOLAR_ID = "DVMNjugAAAAJ"

# Use a ProxyGenerator to reduce chance of blocking
pg = ProxyGenerator()
pg.FreeProxies()  # use free proxies
scholarly.use_pg(pg)

def fetch_scholar_data(scholar_id):
    try:
        # Fetch author by ID
        author = scholarly.search_author_id(scholar_id)
        author = scholarly.fill(author)

        data = {
            "citations": author.citedby,
            "hindex": author.hindex,
            "papers": len(author.publications),
            "timestamp": datetime.now().isoformat()
        }
        return data
    except Exception as e:
        print("Failed to fetch Scholar data:", e)
        return {"citations": 0, "hindex": 0, "papers": 0, "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    data = fetch_scholar_data(SCHOLAR_ID)
    with open("scholar.json", "w") as f:
        json.dump(data, f, indent=2)
    print("Scholar data updated:", data)
