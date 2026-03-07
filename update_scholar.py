from scholarly import scholarly
import json

SCHOLAR_ID = "DVMNjugAAAAJ"

try:
    author = scholarly.search_author_id(SCHOLAR_ID)
    author = scholarly.fill(author)

    data = {
        "citations": author.get("citedby", 0),
        "hindex": author.get("hindex", 0),
        "papers": len(author.get("publications", []))
    }

except Exception as e:
    print("Error fetching scholar data:", e)

    # fallback values if Scholar blocks request
    data = {
        "citations": 0,
        "hindex": 0,
        "papers": 0
    }

with open("scholar.json", "w") as f:
    json.dump(data, f)

print("Scholar data updated")
