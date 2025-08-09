// Fieldtone interactions
document.getElementById('year').textContent = new Date().getFullYear();

/* === Autoplay helper (put OUTSIDE the load block) === */
function enableHeroAutoplay(){
  const vid = document.querySelector('.hero-video');
  if (!vid) return;

  // make sure flags are set before play()
  vid.muted = true;
  vid.autoplay = true;
  vid.playsInline = true;
  vid.setAttribute('playsinline','');
  vid.setAttribute('webkit-playsinline','');

  const tryPlay = () => {
    vid.load(); // helps when root (/) caches differently than /index.html
    const p = vid.play();
    if (p && p.catch) p.catch(() => {});
  };

  tryPlay();

  // try when ready
  ['loadedmetadata','loadeddata','canplay','canplaythrough'].forEach(ev => {
    vid.addEventListener(ev, tryPlay, { once: true });
  });

  // retry on first gesture / visibility changes / bfcache restore
  ['pointerdown','touchstart','click','visibilitychange','pageshow'].forEach(ev => {
    window.addEventListener(ev, () => tryPlay(), { once: true, passive: true });
  });
}

/* fire early and also on full load */
document.addEventListener('DOMContentLoaded', enableHeroAutoplay);
window.addEventListener('load', enableHeroAutoplay);

/* === Your existing code stays below === */
window.addEventListener('load', () => {

  // ===== GSAP animations =====
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero-copy h1', {y: 20, opacity: 0, duration: 1.1, ease: 'power2.out'});
    gsap.from('.hero-copy p', {y: 16, opacity: 0, delay: 0.2, duration: 1, ease: 'power2.out'});
    gsap.from('.btn', {y: 12, opacity: 0, delay: 0.35, duration: .8, ease: 'power2.out'});
    gsap.utils.toArray('.card').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });
  }

  // ===== Hamburger menu toggle + overlay/ESC close =====
  const menuToggle = document.querySelector('.menu-toggle');
  const nav        = document.querySelector('.nav');
  const menuLinks  = document.querySelectorAll('.menu a');
  const overlay    = document.querySelector('.menu-overlay');

  function openMenu(){
    menuToggle.setAttribute('aria-expanded', 'true');
    nav.classList.add('menu-open');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu(){
    menuToggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('menu-open');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    expanded ? closeMenu() : openMenu();
  });

  menuLinks.forEach(link => link.addEventListener('click', closeMenu));
  if (overlay) overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

});
