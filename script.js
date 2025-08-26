// ===========================
// Fieldtone — main interactions
// ===========================
(function () {
  // © year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------------------------
  // Hero video autoplay helper
  // ---------------------------
  function enableHeroAutoplay() {
    const vid = document.querySelector('.hero-video');
    if (!vid) return;

    const hero = document.querySelector('.hero');
    const markPlaying = () => hero && hero.classList.add('is-playing');

    vid.addEventListener('playing', markPlaying, { once: true });
    vid.addEventListener('canplay', () => { if (!vid.paused) markPlaying(); }, { once: true });

    vid.muted = true;
    vid.autoplay = true;
    vid.playsInline = true;
    vid.setAttribute('playsinline', '');
    vid.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      const p = vid.play();
      if (p && p.catch) p.catch(() => {});
      markPlaying();
    };

    document.addEventListener('DOMContentLoaded', tryPlay, { once: true });
    ['loadedmetadata','loadeddata','canplay','canplaythrough'].forEach(ev =>
      vid.addEventListener(ev, tryPlay, { once: true })
    );
    ['pointerdown','touchstart','click','visibilitychange','pageshow'].forEach(ev =>
      window.addEventListener(ev, tryPlay, { once: true, passive: true })
    );
  }
  document.addEventListener('DOMContentLoaded', enableHeroAutoplay);
  window.addEventListener('load', enableHeroAutoplay);

  // ---------------------------
  // Window load: Loader + rest
  // ---------------------------
  window.addEventListener('load', () => {

    // === Fieldtone Full-screen Loader Controller (cinematic timing) ===
    (function () {
      const loader = document.getElementById('loader');
      if (!loader) return;

      const img = loader.querySelector('.logo-img');

      // Lock scroll while the loader is visible
      document.body.classList.add('noscroll');

      // Timings (ms)
      const LOGO_DELAY = 500;   // when the logo fades in
      const GLOW_DELAY = 1100;  // when the soft glow peaks
      const MIN_SHOW   = 2600;  // how long the loader stays on screen

      // 1) start underline sweep (center → out)
      requestAnimationFrame(() => loader.classList.add('active'));

      // 2) fade the logo wordmark up
      setTimeout(() => { if (img) img.classList.add('show'); }, LOGO_DELAY);

      // 3) soft glow pulse
      setTimeout(() => {
        loader.classList.add('glow');
        setTimeout(() => loader.classList.remove('glow'), 450);
      }, GLOW_DELAY);

      // 4) finish: hide loader, unlock scroll, signal GSAP to begin
      const finish = () => {
        loader.classList.add('hidden');               // fades out via CSS
        document.body.classList.remove('noscroll');   // allow scroll again
        window.dispatchEvent(new Event('fieldtone:loaderDone')); // GSAP hook
      };

      setTimeout(finish, MIN_SHOW);

      // Optional: allow click to skip if something stalls
      loader.addEventListener('click', finish);
    })();

    // ===== GSAP animations (run AFTER loader) =====
    window.addEventListener('fieldtone:loaderDone', () => {
      if (window.gsap) {
        // basic entrances (no ScrollTrigger needed)
        gsap.from('.hero-copy h1', { y: 20, opacity: 0, duration: 1.1, ease: 'power2.out' });
        gsap.from('.hero-copy p',  { y: 16, opacity: 0, delay: 0.2, duration: 1, ease: 'power2.out' });
        gsap.from('.btn',          { y: 12, opacity: 0, delay: 0.35, duration: .8, ease: 'power2.out' });

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

          // About section – subtle staggered fade-up
          ScrollTrigger.batch('#about .fade-up', {
            start: 'top 85%',
            onEnter: (batch) => {
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power2.out',
                stagger: 0.08
              });
            }
          });

          // Contact title/wrapper fade-ups
          ScrollTrigger.batch('#contact .fade-up', {
            start: 'top 85%',
            onEnter: (batch) => {
              gsap.to(batch, {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: 'power2.out',
                stagger: 0.08
              });
            }
          });

          // Contact icons pop-in
          ScrollTrigger.batch('#contact .contact-icons a', {
            start: 'top 90%',
            onEnter: (icons) => {
              gsap.fromTo(
                icons,
                { opacity: 0, y: 12, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power2.out', stagger: 0.06 }
              );
            }
          });
        }
      }

      // ===== IntersectionObserver fallback for generic .fade-up
      // (exclude About & Contact which GSAP handles)
      (function setupFadeUp() {
        const els = document.querySelectorAll('.fade-up:not(#about .fade-up):not(#contact .fade-up)');
        if (!els.length) return;

        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          els.forEach((el) => el.classList.add('visible'));
          return;
        }

        const io = new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add('visible');
              obs.unobserve(entry.target);
            });
          },
          { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
        );

        els.forEach((el) => io.observe(el));
      })();
    });

    // ===== Hamburger menu toggle + overlay/ESC close =====
    const nav = document.querySelector('.nav');
    const menuToggle = document.querySelector('.menu-toggle');
    const menuLinks = document.querySelectorAll('.menu a');
    const overlay = document.querySelector('.menu-overlay');

    function openMenu() {
      if (!nav) return;
      nav.classList.add('menu-open');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      if (!nav) return;
      nav.classList.remove('menu-open');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        expanded ? closeMenu() : openMenu();
      });
    }
    if (overlay) overlay.addEventListener('click', closeMenu);
    menuLinks.forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  });
})();
