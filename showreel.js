// ===========================
// Fieldtone — Showreel (v3.2)
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  const loader   = document.getElementById("showreel-loader");
  const recDot   = document.querySelector(".rec-dot");
  const reel     = document.getElementById("mainReel");
  const muteBtn  = document.getElementById("muteToggle");

  /* ---------- Nav hover: copy text into data-text for swipe overlay ---------- */
  document.querySelectorAll('.menu a').forEach(a => {
    a.setAttribute('data-text', (a.textContent || '').trim());
  });

  /* ---------- Mobile hamburger + overlay ---------- */
  const nav        = document.querySelector('.nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const overlay    = document.querySelector('.menu-overlay');

  function openMenu(){
    if (!nav) return;
    nav.classList.add('menu-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu(){
    if (!nav) return;
    nav.classList.remove('menu-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  }
  if (menuToggle){
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeMenu() : openMenu();
    });
  }
  if (overlay) overlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.querySelectorAll('.menu a').forEach(a => a.addEventListener('click', closeMenu));

  /* ---------- Determine Coming Soon vs Has Reel ---------- */
  const hasSource =
    !!(reel && (reel.currentSrc ||
       Array.from(reel?.querySelectorAll('source') || []).some(s => s.getAttribute('src'))));
  if (hasSource) document.body.classList.add('has-reel');

  /* ---------- Loader (projector warm-up) ---------- */
  const LOADER_MS = 2200;
  setTimeout(() => {
    if (loader) loader.classList.add("hidden");
    if (reel && hasSource && reel.paused) reel.play().catch(() => {});
    // hero entrance
    document.querySelectorAll('.reel-enter').forEach(el => {
      requestAnimationFrame(() => el.classList.add('entered'));
    });
  }, LOADER_MS);

  // Blink REC dot
  if (recDot) setInterval(() => recDot.classList.toggle("off"), 600);

  /* ---------- Mute toggle (autoplay-safe) ---------- */
  if (reel && muteBtn) {
    reel.muted = true;
    muteBtn.setAttribute("aria-pressed", "true");
    muteBtn.textContent = "Unmute";
    if (!hasSource) muteBtn.setAttribute("disabled", "disabled");

    muteBtn.addEventListener("click", () => {
      if (!hasSource) return;
      const willUnmute = reel.muted;
      reel.muted = !reel.muted;
      if (willUnmute) reel.play().catch(() => {});
      muteBtn.setAttribute("aria-pressed", reel.muted ? "true" : "false");
      muteBtn.textContent = reel.muted ? "Unmute" : "Mute";
    });
  }

  /* ---------- Pause when off-screen (perf) ---------- */
  if ("IntersectionObserver" in window && reel) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => (e.isIntersecting ? reel.play().catch(()=>{}) : reel.pause()));
    }, { threshold: 0.25 });
    io.observe(reel);
  }

  /* ---------- Clips reveal (staggered via IO) ---------- */
  const revealClips = document.querySelectorAll('.clip.reveal');
  if (revealClips.length && 'IntersectionObserver' in window){
    const staggerIO = new IntersectionObserver((entries) => {
      let delay = 0;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add('in'), delay);
        delay += 100; // 0.1s stagger
        staggerIO.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    revealClips.forEach(el => staggerIO.observe(el));
  }
});

/* ---------------------------------
   Custom Cursor (desktop) + trail + subtle magnet
--------------------------------- */
(function customCursor(){
  if (!window.matchMedia('(pointer:fine)').matches) return;

  const css = getComputedStyle(document.documentElement);
  const ACCENT = (css.getPropertyValue('--brand-red') || '#E74C3C').trim();

  // main ring
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  Object.assign(cursor.style, {
    position:'fixed', left:'0', top:'0', width:'18px', height:'18px',
    border:`2px solid ${ACCENT}`, borderRadius:'50%', pointerEvents:'none',
    zIndex:'99999', transform:'translate(-50%,-50%)', opacity:'0',
    transition:'opacity .25s ease, transform .12s ease'
  });
  document.body.appendChild(cursor);

  // trail dots
  const DOTS = 8, dots = [];
  for (let i = 0; i < DOTS; i++){
    const d = document.createElement('div');
    d.className = 'cursor-dot';
    Object.assign(d.style, {
      position:'fixed', left:'0', top:'0', width:'6px', height:'6px',
      borderRadius:'50%', pointerEvents:'none', zIndex:'99998',
      background:ACCENT, opacity:String(0.22 - i*0.02), transform:'translate(-50%,-50%)'
    });
    document.body.appendChild(d); dots.push(d);
  }

  let targetX = 0, targetY = 0, x = 0, y = 0, visible = false;
  const MAIN_EASE = 0.25, TRAIL_EASE = 0.18;

  function raf(){
    x += (targetX - x) * MAIN_EASE;
    y += (targetY - y) * MAIN_EASE;
    cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;
    let px = x, py = y;
    dots.forEach((d, i) => {
      px += (targetX - px) * (TRAIL_EASE - i * 0.012);
      py += (targetY - py) * (TRAIL_EASE - i * 0.012);
      d.style.transform = `translate(${px}px, ${py}px) translate(-50%,-50%)`;
    });
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  const onMove = (e) => {
    targetX = e.clientX; targetY = e.clientY;
    if (!visible){ cursor.style.opacity = '1'; visible = true; }
  };
  document.addEventListener('mousemove', onMove, { passive:true });
  document.addEventListener('mouseenter', () => (cursor.style.opacity = '1'));
  document.addEventListener('mouseleave', () => (cursor.style.opacity = '0'));

  // subtle magnet
  const magnets = document.querySelectorAll('.btn, .btn-secondary, .menu a, .card, .brand a');
  magnets.forEach(el => {
    let hoverRAF = 0;
    const strength = 16;
    const enter = () => { cursor.style.transform += ' scale(1.25)'; };
    const leave = () => { cursor.style.transform = cursor.style.transform.replace(' scale(1.25)', ''); };
    const onMouseMove = (e) => {
      cancelAnimationFrame(hoverRAF);
      hoverRAF = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const relX = e.clientX - (r.left + r.width/2);
        const relY = e.clientY - (r.top + r.height/2);
        const pullX = Math.max(-strength, Math.min(strength, relX * 0.15));
        const pullY = Math.max(-strength, Math.min(strength, relY * 0.15));
        el.style.transform = `translate(${pullX}px, ${pullY}px)`;
      });
    };
    const onLeave = () => { el.style.transform = 'translate(0,0)'; leave(); };
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onLeave);
  });
})();
