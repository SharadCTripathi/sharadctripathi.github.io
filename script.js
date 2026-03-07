fetch("scholar.json")
  .then(response => response.json())
  .then(data => {
    document.getElementById("citations").innerText = data.citations;
    document.getElementById("hindex").innerText = data.hindex;
    document.getElementById("papers").innerText = data.papers;
  });
