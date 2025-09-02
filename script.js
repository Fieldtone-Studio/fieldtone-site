// ===========================
// Fieldtone — Interactions (FULL, fixed)
// ===========================
(function () {
  // © year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Hero autoplay (mobile-safe)
  function enableHeroAutoplay() {
    const vid = document.querySelector('.hero-video');
    if (!vid) return;
    const hero = document.querySelector('.hero');
    const markPlaying = () => hero && hero.classList.add('is-playing');

    Object.assign(vid, { muted: true, autoplay: true, playsInline: true });
    vid.setAttribute('playsinline', '');
    vid.setAttribute('webkit-playsinline', '');

    ['playing', 'canplay'].forEach(ev =>
      vid.addEventListener(ev, markPlaying, { once: true })
    );

    const tryPlay = () => { const p = vid.play(); if (p && p.catch) p.catch(() => {}); };
    document.addEventListener('DOMContentLoaded', tryPlay, { once: true });
  }
  document.addEventListener('DOMContentLoaded', enableHeroAutoplay);

  // ---------- Loader (cinematic timings)
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (!loader) return;

    const img = loader.querySelector('.logo-img');
    const prefersReduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.body.classList.add('noscroll');
    requestAnimationFrame(() => loader.classList.add('active'));

    const LOGO_DELAY = prefersReduce ? 0 : 700;
    setTimeout(() => img && img.classList.add('show'), LOGO_DELAY);

    const finish = () => {
      loader.classList.add('hidden');
      document.body.classList.remove('noscroll');
      window.dispatchEvent(new Event('fieldtone:loaderDone'));
    };
    setTimeout(finish, prefersReduce ? 500 : 2000);
    loader.addEventListener('click', finish);
  });

  // ---------- Ensure hero text is visible even if GSAP fails
  function ensureHeroTextVisible() {
    ['.hero-copy h1', '.hero-copy p', '.btn'].forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        // wipe any leftover inline props from an interrupted animation
        el.style.opacity = '';
        el.style.visibility = '';
        el.style.transform = '';
      });
    });
  }

  // ---------- GSAP entrances (single run, with clearProps)
  let ranHeroAnim = false;
  window.addEventListener('fieldtone:loaderDone', () => {
    ensureHeroTextVisible(); // safety first

    if (ranHeroAnim || !window.gsap) return;
    ranHeroAnim = true;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero-copy h1', { y: 40, autoAlpha: 0, duration: 1.6 })
      .from('.hero-copy p',  { y: 24, autoAlpha: 0, duration: 1.3 }, '-=0.9')
      .from('.btn',          { y: 18, autoAlpha: 0, duration: 1.0 }, '-=0.7')
      // after anim finishes, remove GSAP inline styles so CSS fully controls look
      .add(() => gsap.set(['.hero-copy h1', '.hero-copy p', '.btn'], { clearProps: 'all' }));
  });

  // ---------- IntersectionObserver fallback for .fade-up
  (function setupFadeUpFallback() {
    const els = document.querySelectorAll('.fade-up');
    if (!els.length) return;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'none';
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

    els.forEach(el => io.observe(el));
  })();

  // ---------- Hamburger + overlay
  const nav = document.querySelector('.nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const overlay = document.querySelector('.menu-overlay');
  const menuLinks = document.querySelectorAll('.menu a');

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
  overlay && overlay.addEventListener('click', closeMenu);
  menuLinks.forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // ---------- Custom Cursor (desktop) + trail + magnetic hover
  (function customCursor(){
    if (!matchMedia('(pointer:fine)').matches) return;

    const css = getComputedStyle(document.documentElement);
    const ACCENT = (css.getPropertyValue('--brand-red') || '#E74C3C').trim();

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    Object.assign(cursor.style, {
      position:'fixed', left:'0', top:'0',
      width:'18px', height:'18px',
      border:`2px solid ${ACCENT}`, borderRadius:'50%',
      pointerEvents:'none', zIndex:'99999',
      transform:'translate(-50%,-50%)', opacity:'0',
      transition:'opacity .25s ease, transform .12s ease'
    });
    document.body.appendChild(cursor);

    const DOTS = 8, dots = [];
    for (let i = 0; i < DOTS; i++){
      const d = document.createElement('div');
      Object.assign(d.style, {
        position:'fixed', left:'0', top:'0',
        width:'6px', height:'6px', borderRadius:'50%',
        pointerEvents:'none', zIndex:'99998',
        background:ACCENT, opacity:String(0.22 - i*0.02),
        transform:'translate(-50%,-50%)'
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

    const onMove = e => {
      targetX = e.clientX; targetY = e.clientY;
      if (!visible){ cursor.style.opacity = '1'; visible = true; }
    };
    document.addEventListener('mousemove', onMove, { passive:true });
    document.addEventListener('mouseenter', () => (cursor.style.opacity = '1'));
    document.addEventListener('mouseleave', () => (cursor.style.opacity = '0'));

    const magnets = document.querySelectorAll('.btn, .menu a, .card, .brand a');
    magnets.forEach(el => {
      let hoverRAF = 0;
      const strength = 16;
      const enter = () => cursor.style.transform += ' scale(1.25)';
      const leave = () => cursor.style.transform = cursor.style.transform.replace(' scale(1.25)', '');
      const onMouseMove = e => {
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
})();
