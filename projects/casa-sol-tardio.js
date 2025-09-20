// Casa Sol Tardío — Case Study interactions
(function(){
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // Footer year
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // ===== Custom Cursor (desktop only) =====
  const isCoarse = matchMedia('(hover:none) and (pointer:coarse)').matches;
  const ring = $('.custom-cursor');
  const dot  = $('.custom-cursor-dot');

  if (!isCoarse && ring && dot){
    document.body.classList.add('has-custom-cursor');
    let x=0,y=0,dx=0,dy=0;
    const lerp = (a,b,n)=>(1-n)*a+n*b;

    const show=()=>{ ring.style.opacity='1'; dot.style.opacity='1'; };
    const hide=()=>{ ring.style.opacity='0'; dot.style.opacity='0'; };

    window.addEventListener('mouseenter', show);
    window.addEventListener('mouseleave', hide);
    window.addEventListener('mousemove', e => { x=e.clientX; y=e.clientY; show(); });

    function render(){
      ring.style.left = x+'px'; ring.style.top = y+'px';
      dx = lerp(dx,x,0.12); dy = lerp(dy,y,0.12);
      dot.style.left = dx+'px'; dot.style.top = dy+'px';
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    window.addEventListener('touchstart', ()=>{
      document.body.classList.remove('has-custom-cursor');
      ring.style.display='none'; dot.style.display='none';
    }, { once:true });
  }

  // ===== Smooth scroll + Active pill highlight =====
  const sections = $$('.chapter');
  const anchors  = $$('.reel-nav .pill, .reel-pills .pill');

  // Smooth scroll on click
  anchors.forEach(a=>{
    a.addEventListener('click', e=>{
      const id = a.dataset.target;
      const el = $('#'+id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior:'smooth', block:'start' });
      history.replaceState(null, '', '#'+id);
    });
  });

  // Update active pill while scrolling
  const byId = Object.fromEntries(sections.map(s=>[s.id, s]));
  const observer = new IntersectionObserver((entries)=>{
    // Pick the most visible entry
    const topEntry = entries
      .filter(e=>e.isIntersecting)
      .sort((a,b)=>b.intersectionRatio - a.intersectionRatio)[0];
    if (!topEntry) return;
    const id = topEntry.target.id;

    anchors.forEach(a=>{
      const active = a.dataset.target === id;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current');
    });
  }, { rootMargin:'-40% 0px -50% 0px', threshold:[0.25, 0.6, 0.9] });

  sections.forEach(s=>observer.observe(s));

  // Remove preload class after paint
  window.addEventListener('load', ()=> document.body.classList.remove('preload'));
})();