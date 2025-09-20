// Work page interactions + Standard Fieldtone Cursor
(function(){
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));

  // Year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Filters
  const buttons = $$('.filter-btn');
  const cards = $$('.card');

  function applyFilter(type){
    cards.forEach(card => {
      const pass = type === 'all' || card.dataset.category === type;
      card.style.display = pass ? '' : 'none';
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  // Lazy load images
  const lazyImgs = $$('.lazy');
  if ('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if(src){ img.src = src; img.removeAttribute('data-src'); }
          obs.unobserve(img);
        }
      });
    }, {rootMargin: '200px 0px'});
    lazyImgs.forEach(img => io.observe(img));
  } else {
    // Fallback
    lazyImgs.forEach(img => img.src = img.getAttribute('data-src'));
  }

  // ================= Standard Fieldtone custom cursor (from repo CSS/JS) =================
  document.addEventListener("DOMContentLoaded", () => {
    const ring = document.querySelector(".custom-cursor");
    const dot  = document.querySelector(".custom-cursor-dot");
    if (!ring || !dot) return;

    document.body.classList.add('has-custom-cursor');

    let x = 0, y = 0;      // target (mouse)
    let dx = 0, dy = 0;    // lagged dot position

    const lerp = (a, b, n) => (1 - n) * a + n * b;

    const show = () => { ring.style.opacity = "1"; dot.style.opacity = "1"; };
    const hide = () => { ring.style.opacity = "0"; dot.style.opacity = "0"; };

    window.addEventListener("mouseenter", show);
    window.addEventListener("mouseleave", hide);

    window.addEventListener("mousemove", (e) => {
      x = e.clientX;
      y = e.clientY;
      show();
    });

    function render(){
      // Ring sticks to pointer
      ring.style.left = x + "px";
      ring.style.top  = y + "px";

      // Dot trails behind (tweak factor for more/less lag)
      dx = lerp(dx, x, 0.12);
      dy = lerp(dy, y, 0.12);
      dot.style.left = dx + "px";
      dot.style.top  = dy + "px";

      requestAnimationFrame(render);
    }
    render();

    // Disable cursor visuals on first touch (hybrid devices)
    window.addEventListener('touchstart', () => {
      document.body.classList.remove('has-custom-cursor');
      ring.style.display = 'none';
      dot.style.display  = 'none';
    }, { once: true });
  });

  // Remove preload class after first paint
  window.addEventListener('load', () => {
    document.body.classList.remove('preload');
  });
})();