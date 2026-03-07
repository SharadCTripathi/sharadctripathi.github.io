fetch("scholar.json")
.then(res => res.json())
.then(data => {
document.getElementById("citations").innerHTML = data.citations;
document.getElementById("hindex").innerHTML = data.hindex;
document.getElementById("papers").innerHTML = data.papers;
});
