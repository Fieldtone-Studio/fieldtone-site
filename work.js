// Work page interactions: year, cursor, cinematic transition
(function(){
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));

  // Footer year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Custom Cursor (desktop only) =====
  const isCoarse = matchMedia('(hover: none) and (pointer: coarse)').matches;
  const ring = $('.custom-cursor');
  const dot  = $('.custom-cursor-dot');

  if (!isCoarse && ring && dot){
    document.body.classList.add('has-custom-cursor');
    let x = 0, y = 0, dx = 0, dy = 0;
    const lerp = (a,b,n) => (1-n)*a + n*b;

    const show = () => { ring.style.opacity = '1'; dot.style.opacity = '1'; };
    const hide = () => { ring.style.opacity = '0'; dot.style.opacity = '0'; };

    window.addEventListener('mouseenter', show);
    window.addEventListener('mouseleave', hide);
    window.addEventListener('mousemove', (e) => {
      x = e.clientX; y = e.clientY; show();
    });

    function render(){
      // Ring follows pointer
      ring.style.left = x + 'px';
      ring.style.top  = y + 'px';
      // Dot trails behind
      dx = lerp(dx, x, 0.12);
      dy = lerp(dy, y, 0.12);
      dot.style.left = dx + 'px';
      dot.style.top  = dy + 'px';
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // Disable cursor visuals on first touch (hybrid)
    window.addEventListener('touchstart', () => {
      document.body.classList.remove('has-custom-cursor');
      ring.style.display = 'none';
      dot.style.display  = 'none';
    }, { once: true });
  }

  // ===== Cinematic transition on card click =====
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const overlay = $('#ftTransition');
  const titleEl = $('#ftProjectTitle');
  const subEl   = $('#ftProjectSubtitle');

  function openCaseStudy(url, title, subtitle){
    if (reduceMotion || !overlay){
      window.location.href = url;
      return;
    }
    titleEl.textContent = title || 'Opening…';
    subEl.textContent   = subtitle || '';
    overlay.classList.add('active');
    // After the animation plays, navigate
    setTimeout(() => {
      window.location.href = url;
    }, 650); // 0.45s bars + 0.35s delay ~> 0.65s feels snappy
  }

  $$('.card').forEach(card => {
    const url = card.getAttribute('data-case') || card.querySelector('a')?.getAttribute('href') || '#';
    const title = card.getAttribute('data-title') || card.querySelector('.title')?.textContent?.trim();
    const subtitle = card.getAttribute('data-subtitle') || card.querySelector('.tag')?.textContent?.trim();

    // Click
    card.addEventListener('click', (e) => {
      e.preventDefault();
      if (!url || url === '#') return;
      openCaseStudy(url, title, subtitle);
    });
    // Keyboard accessibility
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!url || url === '#') return;
        openCaseStudy(url, title, subtitle);
      }
    });
  });

  // Remove preload class after first paint
  window.addEventListener('load', () => {
    document.body.classList.remove('preload');
  });
})();
