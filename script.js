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

    // mark playing when we can
    vid.addEventListener('playing', markPlaying, { once: true });
    vid.addEventListener(
      'canplay',
      () => {
        if (!vid.paused) markPlaying();
      },
      { once: true }
    );

    // make it autoplay-friendly
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

    // attempt early + when ready + on first gesture/visibility/bfcache
    document.addEventListener('DOMContentLoaded', tryPlay, { once: true });
    ['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough'].forEach((ev) =>
      vid.addEventListener(ev, tryPlay, { once: true })
    );
    ['pointerdown', 'touchstart', 'click', 'visibilitychange', 'pageshow'].forEach((ev) =>
      window.addEventListener(ev, tryPlay, { once: true, passive: true })
    );
  }
  document.addEventListener('DOMContentLoaded', enableHeroAutoplay);
  window.addEventListener('load', enableHeroAutoplay);

  // ---------------------------
  // On window load
  // ---------------------------
  window.addEventListener('load', () => {

  // === Fieldtone Full-screen Loader Controller ===
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  // --- timings ---
  const MIN_SHOW = prefersReduce ? 500 : 900;   // kinder timing if reduced motion
  const MAX_WAIT = 6000;                       // hard cap
  const startAt = performance.now();

  // --- lock scrolling immediately ---
  const lockScroll = () => { body.style.overflow = 'hidden'; };
  const unlockScroll = () => { body.style.overflow = ''; };
  lockScroll();

  // --- grab logo image ---
  const img = loader.querySelector('.logo-img');

  // --- turn the loader "on" ---
  if (prefersReduce) {
    loader.classList.add('active');
    if (img) img.classList.add('show'); // no animation, show immediately
  } else {
    const WORD_DELAY = 600;   // ms after underline starts
    const GLOW_DELAY = 1200;  // ms optional pulse

    // 1) kick underline growth
    requestAnimationFrame(() => {
      loader.classList.add('active');
    });

    // 2) fade in the real logo
    setTimeout(() => {
      if (img) img.classList.add('show');
    }, WORD_DELAY);

    // 3) optional glow pulse
    setTimeout(() => {
      loader.classList.add('glow');
      setTimeout(() => loader.classList.remove('glow'), 400);
    }, GLOW_DELAY);
  }

  // --- finish sequence ---
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;

    const elapsed = performance.now() - startAt;
    const wait = Math.max(0, MIN_SHOW - elapsed);

    setTimeout(() => {
      loader.classList.add('hidden');   // fade out
      loader.setAttribute('aria-busy', 'false');
      unlockScroll();

      // remove loader from flow after fade
      setTimeout(() => {
        loader.style.display = 'none';
      }, 800);
    }, wait);
  };

  // Normal completion
  window.addEventListener('load', finish, { once: true });

  // Failsafe (if load hangs)
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(finish, MAX_WAIT);
  }, { once: true });

  // Allow click to skip if something stalls
  loader.addEventListener('click', finish);
})();
    
    // ===== GSAP animations =====
window.addEventListener('fieldtone:loaderDone', () => {
  if (window.gsap) {
      // basic entrances (no ScrollTrigger needed)
      gsap.from('.hero-copy h1', { y: 20, opacity: 0, duration: 1.1, ease: 'power2.out' });
      gsap.from('.hero-copy p', { y: 16, opacity: 0, delay: 0.2, duration: 1, ease: 'power2.out' });
      gsap.from('.btn', { y: 12, opacity: 0, delay: 0.35, duration: 0.8, ease: 'power2.out' });

      // Scroll-driven only if the plugin is present
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

      if (
        window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
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
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  });
})();
