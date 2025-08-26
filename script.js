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
  // Loader (cinematic)
  // ---------------------------
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (!loader) return;

    const img = loader.querySelector('.logo-img');

    // lock scroll
    document.body.classList.add('noscroll');

    // timings (ms)
    const LOGO_DELAY = 650;    // slower logo rise
    const GLOW_DELAY = 1300;   // glow peak
    const MIN_SHOW   = 2800;   // total screen time for loader

    // 1) start underline (GPU smooth via CSS)
    requestAnimationFrame(() => loader.classList.add('active'));

    // 2) fade + rise the logo
    setTimeout(() => { if (img) img.classList.add('show'); }, LOGO_DELAY);

    // 3) soft glow pulse
    setTimeout(() => {
      loader.classList.add('glow');
      setTimeout(() => loader.classList.remove('glow'), 500);
    }, GLOW_DELAY);

    // 4) finish (hide + unlock + signal)
    const finish = () => {
      loader.classList.add('hidden');
      document.body.classList.remove('noscroll');
      window.dispatchEvent(new Event('fieldtone:loaderDone'));
    };

    setTimeout(finish, MIN_SHOW);
    loader.addEventListener('click', finish); // optional skip
  });

  // ---------------------------
  // GSAP animations (run AFTER loader)
  // ---------------------------
  window.addEventListener('fieldtone:loaderDone', () => {
    if (!window.gsap) return;

    // cinematic, slower entrances
    gsap.from('.hero-copy h1', { y: 28, opacity: 0, duration: 1.45, ease: 'power2.out' });
    gsap.from('.hero-copy p',  { y: 22, opacity: 0, delay: 0.2, duration: 1.3, ease: 'power2.out' });
    gsap.from('.btn',          { y: 16, opacity: 0, delay: 0.4, duration: 1.0, ease: 'power2.out' });

    if (window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray('.card').forEach((el) => {
        gsap.from(el, {
          opacity: 0, y: 24, duration: 1.0, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%' }
        });
      });

      ScrollTrigger.batch('#about .fade-up', {
        start: 'top 85%',
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1, y: 0, duration: 1.0, ease: 'power2.out', stagger: 0.08
          });
        }
      });

      ScrollTrigger.batch('#contact .fade-up', {
        start: 'top 85%',
        onEnter: (batch) => {
          gsap.to(batch, {
            opacity: 1, y: 0, duration: 1.0, ease: 'power2.out', stagger: 0.08
          });
        }
      });

      ScrollTrigger.batch('#contact .contact-icons a', {
        start: 'top 90%',
        onEnter: (icons) => {
          gsap.fromTo(
            icons,
            { opacity: 0, y: 12, scale: 0.92 },
            { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power2.out', stagger: 0.06 }
          );
        }
      });
    }

    // IntersectionObserver fallback for any other .fade-up
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

  // ---------------------------
  // Hamburger menu + overlay/ESC
  // ---------------------------
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

  // ---------------------------
  // Cinematic custom cursor (desktop only)
  // ---------------------------
  (function setupCursor(){
    const canUse = matchMedia('(hover:hover) and (pointer:fine)').matches;
    if (!canUse) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    let rafId = null;
    let targetX = window.innerWidth/2, targetY = window.innerHeight/2;
    let curX = targetX, curY = targetY;

    const move = (e) => {
      targetX = e.clientX; targetY = e.clientY;
      cursor.style.opacity = '1';
      if (rafId) return;
      rafId = requestAnimationFrame(tick);
    };

    function tick(){
      // ease follow
      curX += (targetX - curX) * 0.22;
      curY += (targetY - curY) * 0.22;
      cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
      // keep animating until very close
      if (Math.abs(targetX - curX) > 0.1 || Math.abs(targetY - curY) > 0.1){
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }

    window.addEventListener('mousemove', move, { passive:true });

    // grow on interactive targets
    const hotSelectors = 'a, button, .btn, .menu-toggle, .card';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hotSelectors)) cursor.classList.add('cursor-hot');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hotSelectors)) cursor.classList.remove('cursor-hot');
    });

    // hide when leaving window
    document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
    document.addEventListener('mouseenter', () => cursor.style.opacity = '1');
  })();
})();
