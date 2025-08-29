/* =========================================================
   FIELDTONE — ETHOS PAGE SCRIPT (typewriter + cursor + wipe)
   ========================================================= */
(() => {
  /* ---------- BASE SETUP ---------- */
  const prelude = document.getElementById('prelude');
  const main    = document.getElementById('ethos');
  const lines   = Array.from(document.querySelectorAll('.type-line'));

  // keep native cursor during preload (we hide it via CSS on prelude)
  document.body.classList.remove('custom-cursor-on');
  document.body.classList.add('ethos-typing');

  const msPerChar     = 38;   // typing speed
  const pauseBetween  = 420;  // gap between lines
  const holdLastMs    = 3500; // linger on "This is Archvizography"
  const fadeMs        = 500;  // prelude fade duration (keep in sync w/ CSS)

  // Fail-safe: if anything goes wrong, reveal the page
  const failsafe = setTimeout(() => {
    try { prelude?.remove(); if (main) main.hidden = false; } catch (_) {}
  }, 8000);

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  /* ---------- TYPEWRITER ---------- */
  function typeOne(el, text) {
    return new Promise(resolve => {
      let i = 0;
      el.textContent = "";

      const caret = document.createElement("span");
      caret.className = "type-caret";
      caret.textContent = "▌";
      el.after(caret);

      const tick = () => {
        el.textContent = text.slice(0, i++);
        if (i <= text.length) setTimeout(tick, msPerChar);
        else { caret.remove(); setTimeout(resolve, pauseBetween); }
      };
      tick();
    });
  }

  async function runPrelude() {
    // Respect reduced motion: skip typing, just show page
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      prelude?.remove();
      if (main) main.hidden = false;
      document.body.classList.add("ethos-ready");
      if (window._fieldtoneCursor?.enable) window._fieldtoneCursor.enable();
      return;
    }

    // Type each line (use data-text override when present)
    for (const el of lines) {
      await typeOne(el, el.dataset.text || el.textContent || "");
    }

    // Linger on the last line, then fade out the prelude
    await sleep(holdLastMs);
    if (prelude) {
      prelude.style.transition = `opacity ${fadeMs}ms ease`;
      prelude.style.opacity = "0";
      await sleep(fadeMs + 100);
      prelude.remove();
    }

    // Reveal main content
    if (main) main.hidden = false;
    clearTimeout(failsafe);
    document.body.classList.add("ethos-ready");

    // Enable custom cursor now (not during preload)
    if (window._fieldtoneCursor?.enable) window._fieldtoneCursor.enable();
  }

  /* ---------- CUSTOM CINEMATIC CURSOR (ring + inner dot) ---------- */
  (function initCursor(){
    // only on precision pointers (desktop/laptop)
    if (!window.matchMedia || !window.matchMedia("(pointer:fine)").matches) return;

    // Read accent from CSS var
    const css    = getComputedStyle(document.documentElement);
    const ACCENT = (css.getPropertyValue("--red") || css.getPropertyValue("--brand-red") || "#E74C3C").trim();

    // Use existing DOM nodes if present; otherwise build them
    let ring = document.getElementById("ft-cursor-ring");
    let dot  = document.getElementById("ft-cursor-dot");

    if (!ring) {
      ring = document.createElement("div");
      ring.id = "ft-cursor-ring";
      ring.className = "custom-cursor";
      document.body.appendChild(ring);
    }
    if (!dot) {
      dot = document.createElement("div");
      dot.id = "ft-cursor-dot";
      dot.className = "cursor-dot";
      document.body.appendChild(dot);
    }

    // Ensure inner dot is styled from JS in case CSS didn’t set it
    dot.style.width  = "6px";
    dot.style.height = "6px";
    dot.style.borderRadius = "50%";
    dot.style.background   = ACCENT;
    dot.style.position     = "fixed";
    dot.style.top = "0"; dot.style.left = "0";
    dot.style.transform = "translate(-50%,-50%)";
    dot.style.pointerEvents = "none";
    dot.style.zIndex = "20001";
    dot.style.opacity = "0";

    // Main ring extra glow (the ring border comes from CSS)
    ring.style.boxShadow = "0 0 16px rgba(231,76,60,.35)";
    ring.style.borderColor = ACCENT;

    let x = 0, y = 0, rx = 0, ry = 0;
    const MAIN_EASE  = 0.25;  // ring smoothing
    const DOT_EASE   = 1.00;  // dot sticks to pointer

    function onMove(e){
      x = e.clientX; y = e.clientY;
      // dot follows pointer directly
      const dx = x + (0); const dy = y + (0);
      dot.style.transform  = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
    }

    function loop(){
      // ring eases toward pointer
      rx += (x - rx) * MAIN_EASE;
      ry += (y - ry) * MAIN_EASE;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    window.addEventListener("mousemove", onMove, { passive:true });

    // Public toggle — we call enable() after prelude ends
    window._fieldtoneCursor = {
      enable(){
        document.body.classList.add("custom-cursor-on");  // hide OS cursor via CSS
        ring.style.opacity = "1";
        dot.style.opacity  = "1";
      },
      disable(){
        document.body.classList.remove("custom-cursor-on");
        ring.style.opacity = "0";
        dot.style.opacity  = "0";
      }
    };
  })();

  /* ---------- CLAPPER SNAP WIPE (to Crew) ---------- */
  (function initClapperWipe(){
    const wipe = document.getElementById("scene-wipe");
    const crew = document.querySelector(".crew");
    if (!wipe || !crew) return;

    // Respect reduced motion
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        wipe.classList.add("active");
        setTimeout(() => wipe.classList.remove("active"), 420);
        io.disconnect();
      }
    }, { threshold: 0.2 });

    io.observe(crew);
  })();

  /* ---------- GO ---------- */
  runPrelude();
})();
