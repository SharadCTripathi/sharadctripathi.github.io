from scholarly import scholarly
import json

SCHOLAR_ID = "YOUR_ID_HERE"

author = scholarly.search_author_id(SCHOLAR_ID)
author = scholarly.fill(author)

data = {
    "citations": author["citedby"],
    "hindex": author["hindex"],
    "papers": len(author["publications"])
}

with open("scholar.json", "w") as f:
    json.dump(data, f)

print("Scholar data updated")
