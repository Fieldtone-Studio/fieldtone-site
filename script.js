// Fieldtone interactions
document.getElementById('year').textContent = new Date().getFullYear();

window.addEventListener('load', () => {
  if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero-copy h1', {y: 20, opacity: 0, duration: 1.1, ease: 'power2.out'});
    gsap.from('.hero-copy p', {y: 16, opacity: 0, delay: 0.2, duration: 1, ease: 'power2.out'});
    gsap.from('.btn', {y: 12, opacity: 0, delay: 0.35, duration: .8, ease: 'power2.out'});
    gsap.utils.toArray('.card').forEach((el, i) => {
      gsap.from(el, {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        }
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
  overlay.classList.add('is-visible');             // <- add this
  document.body.style.overflow = 'hidden';
}

function closeMenu(){
  menuToggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove('menu-open');
  overlay.classList.remove('is-visible');          // <- add this
  document.body.style.overflow = '';
}

menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  expanded ? closeMenu() : openMenu();
});

// Close when clicking a menu link
menuLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close when clicking overlay
if (overlay) {
  overlay.addEventListener('click', closeMenu);
}

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();

});

});
