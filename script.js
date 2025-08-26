// ===========================
// Fieldtone — Interactions (FULL)
// ===========================
(function () {
  // © year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------------------------
  // Hero autoplay
  // ---------------------------
  function enableHeroAutoplay() {
    const vid = document.querySelector('.hero-video');
    if (!vid) return;
    const hero = document.querySelector('.hero');
    const markPlaying = () => hero && hero.classList.add('is-playing');

    vid.muted = true;
    vid.autoplay = true;
    vid.playsInline = true;
    vid.setAttribute('playsinline', '');
    vid.setAttribute('webkit-playsinline', '');

    ['playing', 'canplay'].forEach(ev => vid.addEventListener(ev, markPlaying, { once:true }));

    const tryPlay = () => { const p = vid.play(); if (p && p.catch) p.catch(() => {}); };
    document.addEventListener('DOMContentLoaded', tryPlay, { once:true });
  }
  document.addEventListener('DOMContentLoaded', enableHeroAutoplay);

  // ---------------------------
  // Loader (cinematic timings)
  // ---------------------------
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (!loader) return;
    const img = loader.querySelector('.logo-img');
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // lock scroll while visible
    document.body.classList.add('noscroll');

    // start underline sweep
    requestAnimationFrame(() => loader.classList.add('active'));

    // logo fade (slower for cinematic)
    const LOGO_DELAY = prefersReduce ? 0 : 700;
    setTimeout(() => { if (img) img.classList.add('show'); }, LOGO_DELAY);

    // total show time before fade-out
    const MIN_SHOW = prefersReduce ? 500 : 3000;

    const finish = () => {
      loader.classList.add('hidden');            // CSS fades it out
      document.body.classList.remove('noscroll'); // unlock scroll
      window.dispatchEvent(new Event('fieldtone:loaderDone')); // start GSAP
    };

    setTimeout(finish, MIN_SHOW);
    // optional: click to skip if needed
    loader.addEventListener('click', finish);
  });

  // ---------------------------
  // GSAP entrances (slower, cinematic)
  // ---------------------------
  window.addEventListener('fieldtone:loaderDone', () => {
    if (!window.gsap) return;

    gsap.from('.hero-copy h1', { y: 40, opacity: 0, duration: 1.8, ease: 'power3.out' });
    gsap.from('.hero-copy p',  { y: 28, opacity: 0, delay: 0.35, duration: 1.5, ease: 'power3.out' });
    gsap.from('.btn',          { y: 20, opacity: 0, delay: 0.7,  duration: 1.2, ease: 'power3.out' });

    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      // Cards
      gsap.utils.toArray('.card').forEach((el) => {
        gsap.from(el, {
          opacity: 0, y: 24, duration: 0.9, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        });
      });

      // About fade-ups
      ScrollTrigger.batch('#about .fade-up', {
        start: 'top 85%',
        onEnter: (batch) => gsap.to(batch, {
          opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', stagger: 0.08
        })
      });

      // Contact title/wrapper
      ScrollTrigger.batch('#contact .fade-up', {
        start: 'top 85%',
        onEnter: (batch) => gsap.to(batch, {
          opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', stagger: 0.08
        })
      });

      // Contact icons
      ScrollTrigger.batch('#contact .contact-icons a', {
        start: 'top 90%',
        onEnter: (icons) => {
          gsap.fromTo(
            icons,
            { opacity: 0, y: 12, scale: 0.92 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out', stagger: 0.06 }
          );
        }
      });
    }
  });

  // ---------------------------
  // IntersectionObserver fallback for generic .fade-up
  // ---------------------------
  (function setupFadeUpFallback() {
    const els = document.querySelectorAll('.fade-up:not(#about .fade-up):not(#contact .fade-up)');
    if (!els.length) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'none';
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

    els.forEach((el) => io.observe(el));
  })();

  // ---------------------------
  // Hamburger + overlay
  // ---------------------------
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
  if (overlay) overlay.addEventListener('click', closeMenu);
  menuLinks.forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // ---------------------------
  // Custom Cursor (desktop) with buttery trailing
  // ---------------------------
  (function customCursor(){
    if (!window.matchMedia('(pointer:fine)').matches) return; // desktop only

    const c = document.createElement('div');
    c.className = 'custom-cursor';
    document.body.appendChild(c);

    let targetX = 0, targetY = 0;
    let x = 0, y = 0;
    let visible = false;

    const speed = 0.22; // higher = snappier; lower = floatier
    function raf(){
      x += (targetX - x) * speed;
      y += (targetY - y) * speed;
      c.style.transform = `translate(${x - 0}px, ${y - 0}px) translate(-50%,-50%)`;
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // show on first move
    const onMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible){ c.style.opacity = 1; visible = true; }
    };
    document.addEventListener('mousemove', onMove, { passive:true });
    document.addEventListener('mouseenter', () => (c.style.opacity = 1));
    document.addEventListener('mouseleave', () => (c.style.opacity = 0));
  })();
})();
