window.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const logoScreen = document.getElementById("logo-screen");
  const app = document.getElementById("app");
  const internetWarning = document.getElementById("internet-warning");

  setTimeout(() => {
    splash.style.display = "none";

    if (!navigator.onLine) {
      logoScreen.style.display = "none";
      app.style.display = "none";
      internetWarning.style.display = "block";
    } else {
      logoScreen.style.display = "flex";
      setTimeout(() => {
        logoScreen.style.display = "none";
        app.style.display = "block";
      }, 3000); // Show logo screen for 3 seconds
    }
  }, 3000); // Splash duration

  const pdfUpload = document.getElementById("pdfUpload");
  const pdfViewer = document.getElementById("pdfViewer");
  const status = document.getElementById("status");
  const speedSelector = document.getElementById("speed");
  const controls = document.getElementById("controls");
  const pauseBtn = document.getElementById("pauseBtn");

  let scrollInterval;
  let isPaused = false;

  pdfUpload.addEventListener("change", () => {
    const file = pdfUpload.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = function () {
        const typedArray = new Uint8Array(this.result);
        loadPDF(typedArray);
      };
      reader.readAsArrayBuffer(file);
    }
  });

  speedSelector.addEventListener("change", restartScroll);

  pauseBtn.addEventListener("click", () => {
    isPaused = !isPaused;
    pauseBtn.innerText = isPaused ? "Resume" : "Pause";
    if (isPaused) clearInterval(scrollInterval);
    else startScroll();
  });

  function loadPDF(data) {
    pdfViewer.innerHTML = "";
    status.innerText = "Processing...";
    controls.style.display = "none";

    pdfjsLib.getDocument({ data }).promise.then(pdf => {
      let renderTasks = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        renderTasks.push(
          pdf.getPage(i).then(page => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            const viewport = page.getViewport({ scale: 1.5 });

            canvas.width = viewport.width;
            canvas.height = viewport.height;
            pdfViewer.appendChild(canvas);

            return page.render({ canvasContext: context, viewport }).promise;
          })
        );
      }

      Promise.all(renderTasks).then(() => {
        status.innerText = "Processing complete ✅";
        controls.style.display = "block";
        isPaused = false;
        startScroll();
      });
    });
  }

  function startScroll() {
    clearInterval(scrollInterval);
    const speed = parseFloat(speedSelector.value);
    const scrollStep = Math.max(1, Math.round(speed * 1.5));
    const interval = 50 / speed;

    scrollInterval = setInterval(() => {
      if (isPaused) return;

      const maxScroll = pdfViewer.scrollHeight - pdfViewer.clientHeight;
      if (pdfViewer.scrollTop >= maxScroll) {
        clearInterval(scrollInterval);
        status.innerText = "✅ Reached end of document.";
        return;
      }

      pdfViewer.scrollTop += scrollStep;
    }, interval);
  }

  function restartScroll() {
    clearInterval(scrollInterval);
    if (!isPaused) startScroll();
  }
});
