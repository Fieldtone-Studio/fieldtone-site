// Fieldtone — Showreel Page JS (v1.0.0)
document.addEventListener("DOMContentLoaded", () => {
  const loader   = document.getElementById("showreel-loader");
  const recDot   = document.querySelector(".rec-dot");
  const reel     = document.getElementById("mainReel");
  const muteBtn  = document.getElementById("muteToggle");

  // Projector warm-up (snappy)
  const LOADER_MS = 2200;
  setTimeout(() => {
    loader.classList.add("hidden");
    if (reel && reel.paused) reel.play().catch(() => {});
  }, LOADER_MS);

  // Blink REC dot
  if (recDot) setInterval(() => recDot.classList.toggle("off"), 600);

  // Mute toggle (must start muted for autoplay policy)
  if (reel && muteBtn) {
    reel.muted = true;
    muteBtn.setAttribute("aria-pressed", "true");
    muteBtn.textContent = "Unmute";

    muteBtn.addEventListener("click", () => {
      const willUnmute = reel.muted;
      reel.muted = !reel.muted;
      if (willUnmute) reel.play().catch(() => {});
      muteBtn.setAttribute("aria-pressed", reel.muted ? "true" : "false");
      muteBtn.textContent = reel.muted ? "Unmute" : "Mute";
    });
  }

  // Pause when off-screen for perf
  if ("IntersectionObserver" in window && reel) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => (e.isIntersecting ? reel.play().catch(()=>{}) : reel.pause()));
    }, { threshold: 0.25 });
    io.observe(reel);
  }
});
