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

  // === Fieldtone full-screen Loader Controller ===
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const body = document.body;
  const MIN_SHOW = prefersReduce ? 500 : 900;  // kinder timing when reduced motion
  const MAX_WAIT = 6000;                       // hard cap in case 'load' runs late
  let done = false;
  const startedAt = performance.now();

  // Lock page scrolling while loader is visible (extra safety on iOS)
  const lockScroll = () => { body.style.overflow = 'hidden'; };
  const unlockScroll = () => { body.style.overflow = ''; };
  lockScroll();

  // -- Turn the loader "on" with cinematic staging --
  if (prefersReduce) {
    // Accessibility: no motion – show everything immediately
    loader.classList.add('active');
    const word = loader.querySelector('.logo-word');
    if (word) word.classList.add('show');  // fade-in state without delay
  } else {
    // Timed sequence: underline → word fade → (optional) glow
    const word = loader.querySelector('.logo-word');

    // Tweakable timings (ms)
    const UNDERLINE_START = 0;     // start immediately
    const WORD_DELAY      = 600;   // after underline has grown a bit
    const GLOW_DELAY      = 1200;  // optional pulse before we fade the loader out

    // 1) kick underline growth first (center → outward)
    requestAnimationFrame(() => {
      loader.classList.add('active'); // triggers underline sweep
    });

    // 2) fade in the "FIELDTONE" word after a beat
    setTimeout(() => {
      if (word) word.classList.add('show');
    }, WORD_DELAY);

    // 3) optional: add a subtle glow pulse on the underline
    setTimeout(() => {
      loader.classList.add('glow');
      // remove the glow after a short moment so it doesn't linger
      setTimeout(() => loader.classList.remove('glow'), 400);
    }, GLOW_DELAY);
  }

  // Finish sequence: respect MIN_SHOW, fade loader, restore scroll
  const finish = () => {
    if (done) return;
    done = true;

    const elapsed = performance.now() - startedAt;
    const wait = Math.max(0, MIN_SHOW - elapsed);

    setTimeout(() => {
      loader.classList.add('hidden');       // triggers CSS fade-out
      loader.setAttribute('aria-busy', 'false');
      unlockScroll();
      // After the CSS transition, remove from flow entirely
      setTimeout(() => { loader.style.display = 'none'; }, 900);
    }, wait);
  };

  // Prefer full page load; also add a hard timeout as a failsafe
  window.addEventListener('load', finish, { once: true });
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(finish, MAX_WAIT);
  }, { once: true });

  // Optional: allow user to click the loader to skip if something stalls
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
