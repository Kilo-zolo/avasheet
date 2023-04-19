const linksContainer = document.getElementById("linksContainer");

const savedData = JSON.parse(localStorage.getItem("savedData")) || [];

savedData.forEach((data) => {
  const link = document.createElement("a");
  link.href = "index.html?data=" + encodeURIComponent(JSON.stringify(data));
  link.textContent = data.identifier;
  linksContainer.appendChild(link);
  linksContainer.appendChild(document.createElement("br"));
});
