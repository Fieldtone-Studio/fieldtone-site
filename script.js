// Fieldtone interactions
document.getElementById('year').textContent = new Date().getFullYear();

/* === Autoplay helper (OUTSIDE the load block) === */
function enableHeroAutoplay(){
  const vid = document.querySelector('.hero-video');
  if (!vid) return;

  // Mobile tap-to-play marker
  const hero = document.querySelector('.hero');
  if (hero) {
    const markPlaying = () => hero.classList.add('is-playing');
    vid.addEventListener('playing', markPlaying, { once:true });
    vid.addEventListener('canplay', () => {
      if (!vid.paused) markPlaying();
    }, { once:true });

    ['pointerdown','touchstart','click','scroll'].forEach(ev=>{
      window.addEventListener(ev, () => {
        vid.play().catch(()=>{});
        markPlaying();
      }, { once:true, passive:true });
    });
  }

  vid.muted = true;
  vid.autoplay = true;
  vid.playsInline = true;
  vid.setAttribute('playsinline','');
  vid.setAttribute('webkit-playsinline','');

  const tryPlay = () => {
    const p = vid.play();
    if (p && p.catch) p.catch(() => {});
    markPlaying();
  };
  document.addEventListener('DOMContentLoaded', tryPlay, { once: true });
  ['loadedmetadata','loadeddata','canplay','canplaythrough'].forEach(ev => {
    vid.addEventListener(ev, tryPlay, { once: true });
  });
  ['pointerdown','touchstart','click','visibilitychange','pageshow'].forEach(ev => {
    window.addEventListener(ev, tryPlay, { once: true, passive: true });
  });
}
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

    // === About section – subtle staggered fade-up ===
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

    // === Contact – closing shot fade-ups ===
    // Title + wrapper
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

    // Icons (individual anchors)
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

  // ... (keep your IntersectionObserver + menu code as-is)
});
