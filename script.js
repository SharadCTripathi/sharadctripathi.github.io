fetch("scholar.json")
  .then(response => response.json())
  .then(data => {
    // Update stats
    document.getElementById("citations").innerText = data.citations || "N/A";
    document.getElementById("hindex").innerText = data.hindex || "N/A";
    document.getElementById("papers").innerText = data.papers || "N/A";

    // Update last updated timestamp
    const tsElem = document.getElementById("last-updated");
    if (tsElem && data.timestamp) {
      const date = new Date(data.timestamp);
      tsElem.innerText = date.toLocaleString();
    }
  })
  .catch(() => {
    // Fallback in case of fetch failure
    document.getElementById("citations").innerText = "N/A";
    document.getElementById("hindex").innerText = "N/A";
    document.getElementById("papers").innerText = "N/A";
    const tsElem = document.getElementById("last-updated");
    if (tsElem) tsElem.innerText = "N/A";
  });
