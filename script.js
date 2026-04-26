async function handleUpload() {
  const file = document.getElementById("videoInput").files[0];
  const video = document.getElementById("preview");

  if (!file) return;

  video.src = URL.createObjectURL(file);
  video.classList.remove("hidden");

  const formData = new FormData();
  formData.append("file", file);

  await fetch("http://localhost:8000/analyze", {
    method: "POST",
    body: formData
  });

  setTimeout(() => {
    window.location.href = "results.html";
  }, 1500);
}

function setTheme(theme) {
  const root = document.documentElement;
  // keep your theme code here
}
