import requests
from bs4 import BeautifulSoup
import json

SCHOLAR_ID = "DVMNjugAAAAJ"

url = f"https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en"

response = requests.get(url)

soup = BeautifulSoup(response.text, "html.parser")

stats = soup.select("#gsc_rsb_st td.gsc_rsb_std")

citations = stats[0].text
hindex = stats[2].text

papers = len(soup.select(".gsc_a_tr"))

data = {
    "citations": int(citations),
    "hindex": int(hindex),
    "papers": papers
}

with open("scholar.json", "w") as f:
    json.dump(data, f)

print("Scholar data updated")
