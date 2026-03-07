fetch("scholar.json")
.then(response => response.json())
.then(data => {

document.getElementById("citations").innerText = data.citations || 0;

document.getElementById("hindex").innerText = data.hindex || 0;

document.getElementById("papers").innerText = data.papers || 0;

});
