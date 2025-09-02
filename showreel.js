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

// ---------------------------------
  // Custom Cursor (desktop) + trail
  // ---------------------------------
  (function customCursor(){
    // Only on pointer-precision devices
    if (!window.matchMedia('(pointer:fine)').matches) return;

    // Read accent from CSS vars so it always matches theme
    const css = getComputedStyle(document.documentElement);
    const ACCENT = (css.getPropertyValue('--brand-red') || '#E74C3C').trim();

    // Build cursor
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.position = 'fixed';
    cursor.style.left = '0';
    cursor.style.top = '0';
    cursor.style.width = '18px';
    cursor.style.height = '18px';
    cursor.style.border = `2px solid ${ACCENT}`;
    cursor.style.borderRadius = '50%';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '99999';
    cursor.style.transform = 'translate(-50%,-50%)';
    cursor.style.opacity = '0';
    cursor.style.transition = 'opacity .25s ease, transform .12s ease';

    document.body.appendChild(cursor);

    // Trail dots (buttery ghost)
    const DOTS = 8;
    const dots = [];
    for (let i = 0; i < DOTS; i++) {
      const d = document.createElement('div');
      d.className = 'cursor-dot';
      d.style.position = 'fixed';
      d.style.left = '0';
      d.style.top = '0';
      d.style.width = '6px';
      d.style.height = '6px';
      d.style.borderRadius = '50%';
      d.style.pointerEvents = 'none';
      d.style.zIndex = '99998';
      d.style.background = ACCENT;
      d.style.opacity = String(0.22 - i * 0.02); // fade out over the trail
      d.style.transform = 'translate(-50%,-50%)';
      document.body.appendChild(d);
      dots.push(d);
    }

    let targetX = 0, targetY = 0;   // where the mouse actually is
    let x = 0, y = 0;               // where the main circle is
    let visible = false;

    // Smoothness for big circle & lag for trail
    const MAIN_EASE = 0.25;         // higher = snappier
    const TRAIL_EASE = 0.18;

    function raf(){
      // move main circle
      x += (targetX - x) * MAIN_EASE;
      y += (targetY - y) * MAIN_EASE;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;

      // move dots with cascading lag
      let px = x, py = y;
      dots.forEach((d, i) => {
        px += (targetX - px) * (TRAIL_EASE - i * 0.012);
        py += (targetY - py) * (TRAIL_EASE - i * 0.012);
        d.style.transform = `translate(${px}px, ${py}px) translate(-50%,-50%)`;
      });

      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Show/hide on presence
    const onMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible){
        cursor.style.opacity = '1';
        dots.forEach(d => d.style.opacity = d.style.opacity); // keep their set opacity
        visible = true;
      }
    };
    document.addEventListener('mousemove', onMove, { passive:true });
    document.addEventListener('mouseenter', () => (cursor.style.opacity = '1'));
    document.addEventListener('mouseleave', () => (cursor.style.opacity = '0'));
