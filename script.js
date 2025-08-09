// Fieldtone interactions
document.getElementById('year').textContent = new Date().getFullYear();

/* === Autoplay helper (outside the load block) === */
function enableHeroAutoplay(){
  const vid = document.querySelector('.hero-video');
  if (!vid) return;

  // Ensure flags before play()
  vid.muted = true;
  vid.autoplay = true;
  vid.playsInline = true;
  vid.setAttribute('playsinline','');
  vid.setAttribute('webkit-playsinline','');

  const tryPlay = () => {
    const p = vid.play();
    if (p && p.catch) {
      p.catch(() => {
        // If blocked, start on the first user gesture/scroll
        ['pointerdown','touchstart','click','scroll'].forEach(ev => {
          window.addEventListener(ev, () => vid.play().catch(()=>{}), { once: true, passive: true });
        });
      });
    }
  };

  // Try early + when ready; no vid.load() to avoid flicker
  document.addEventListener('DOMContentLoaded', tryPlay, { once: true });
  vid.addEventListener('canplay', tryPlay, { once: true });
  // Handle tab restore/bfcache on mobile
  window.addEventListener('pageshow', tryPlay, { once: true });
}

// Fire the helper
document.addEventListener('DOMContentLoaded', enableHeroAutoplay);
window.addEventListener('load', enableHeroAutoplay);


/* === Your existing code (unchanged) === */
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

  if (menuToggle){
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      expanded ? closeMenu() : openMenu();
    });
  }

  menuLinks.forEach(link => link.addEventListener('click', closeMenu));
  if (overlay) overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
});
