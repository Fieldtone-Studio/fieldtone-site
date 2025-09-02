// ===========================
// Fieldtone — Interactions (FULL)
// ===========================
(function () {
  // ---------------------------------
  // © year
  // ---------------------------------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------------------------------
  // Hero autoplay (mobile-safe)
  // ---------------------------------
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

    ['playing', 'canplay'].forEach(ev =>
      vid.addEventListener(ev, markPlaying, { once: true })
    );

    const tryPlay = () => {
      const p = vid.play();
      if (p && p.catch) p.catch(() => {});
    };
    document.addEventListener('DOMContentLoaded', tryPlay, { once: true });
  }
  document.addEventListener('DOMContentLoaded', enableHeroAutoplay);

  // ---------------------------------
  // Loader (cinematic timings)
  // ---------------------------------
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (!loader) return;

    const img = loader.querySelector('.logo-img');
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // lock scroll while visible
    document.body.classList.add('noscroll');

    // 1) start underline sweep (center→out), handled by CSS on .active
    requestAnimationFrame(() => loader.classList.add('active'));

    // 2) wordmark fade (slow & smooth)
    const LOGO_DELAY = prefersReduce ? 0 : 700;
    setTimeout(() => { if (img) img.classList.add('show'); }, LOGO_DELAY);

    // 3) optional glow pulse bump for extra drama
    if (!prefersReduce) {
      setTimeout(() => {
        loader.classList.add('glow');
        setTimeout(() => loader.classList.remove('glow'), 500);
      }, 1200);
    }

    // 4) finish after a cinematic beat
    const MIN_SHOW = prefersReduce ? 500 : 3000;
    const finish = () => {
      loader.classList.add('hidden');              // CSS fades out
      document.body.classList.remove('noscroll');  // unlock scroll
      window.dispatchEvent(new Event('fieldtone:loaderDone')); // start GSAP
    };
    setTimeout(finish, MIN_SHOW);

    // allow click-to-skip (just in case)
    loader.addEventListener('click', finish);
  });

  // ---------------------------------
  // GSAP entrances (slower, cinematic)
  // ---------------------------------
  window.addEventListener('fieldtone:loaderDone', () => {
    if (!window.gsap) return;

    gsap.from('.hero-copy h1', { y: 40, opacity: 0, duration: 1.8, ease: 'power3.out' });
    gsap.from('.hero-copy p',  { y: 28, opacity: 0, delay: 0.35, duration: 1.5, ease: 'power3.out' });
    gsap.from('.btn',          { y: 20, opacity: 0, delay: 0.7,  duration: 1.2, ease: 'power3.out' });
    gsap.from('.hero-copy h1', { y: 40, opacity: 0, duration: 3, ease: 'power3.out' });
    gsap.from('.hero-copy p',  { y: 28, opacity: 0, delay: 0.5, duration: 2.4, ease: 'power3.out' });
    gsap.from('.btn',          { y: 20, opacity: 0, delay: 1, duration: 2, ease: 'power3.out' });

    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      // Cards
      gsap.utils.toArray('.card').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.9,
          ease: 'power2.out',
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

  // ---------------------------------
  // IntersectionObserver fallback (.fade-up)
  // ---------------------------------
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

  // ---------------------------------
  // Hamburger + overlay
  // ---------------------------------
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

  // ---------------------------------
  // Custom Cursor (desktop) + trail + magnetic hover
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

    // Magnetic hover on interactive bits
    const magnets = document.querySelectorAll('.btn, .menu a, .card, .brand a');
    magnets.forEach(el => {
      let hoverRAF = 0;
      const strength = 16; // px pull towards cursor
      const enter = () => cursor.style.transform += ' scale(1.25)';
      const leave = () => cursor.style.transform = cursor.style.transform.replace(' scale(1.25)', '');

      const onMouseMove = (e) => {
        cancelAnimationFrame(hoverRAF);
        hoverRAF = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const relX = e.clientX - (rect.left + rect.width / 2);
          const relY = e.clientY - (rect.top + rect.height / 2);
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
