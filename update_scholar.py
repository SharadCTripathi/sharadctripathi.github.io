import requests
from bs4 import BeautifulSoup
import json

SCHOLAR_ID = "DVMNjugAAAAJ"
URL = f"https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en"

headers = {
    "User-Agent": "Mozilla/5.0"
}

try:
    response = requests.get(URL, headers=headers, timeout=20)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    stats = soup.select("#gsc_rsb_st td.gsc_rsb_std")
    papers = soup.select(".gsc_a_tr")

    if len(stats) >= 3:
        citations = int(stats[0].text.replace(",", ""))
        hindex = int(stats[2].text.replace(",", ""))
    else:
        print("Scholar stats not found (possibly blocked)")
        citations = 0
        hindex = 0

    data = {
        "citations": citations,
        "hindex": hindex,
        "papers": len(papers)
    }

    print("Fetched:", data)

except Exception as e:
    print("Scholar fetch failed:", e)
    data = {
        "citations": 0,
        "hindex": 0,
        "papers": 0
    }

with open("scholar.json", "w") as f:
    json.dump(data, f)

print("Scholar data updated")
