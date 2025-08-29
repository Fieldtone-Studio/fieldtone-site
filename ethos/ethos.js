
(function(){
  /* EARLY: keep native cursor until reveal */
  document.body.classList.remove('custom-cursor-on');
  const prelude = document.getElementById('prelude');
  const main = document.getElementById('ethos');
  const lines = Array.from(document.querySelectorAll('.type-line'));
  document.body.classList.add('ethos-typing');
  const msPerChar = 38, pauseBetween = 420, endHold = 700;

  /* FAILSAFE */
  const failsafe = setTimeout(()=>{
    try{ prelude?.remove(); if(main) main.hidden=false; }catch(e){}
  }, 8000);

  function typeOne(el, text){
    return new Promise(res=>{
      let i=0; el.textContent='';
      const caret = document.createElement('span'); caret.className='type-caret'; caret.textContent='▌'; el.after(caret);
      const tick=()=>{ el.textContent = text.slice(0, i++); if(i<=text.length){ setTimeout(tick, msPerChar); } else { caret.remove(); setTimeout(res, pauseBetween); } };
      tick();
    });
  }

  async function runPrelude(){
    for(const el of lines){ await typeOne(el, el.dataset.text || el.textContent || ''); }
    prelude.style.transition='opacity 500ms ease'; prelude.style.opacity='0';
    setTimeout(()=>{ prelude.remove(); main.hidden=false; clearTimeout(failsafe); document.body.classList.add('ethos-ready');
      if(window.__fieldtoneCursor){ window.__fieldtoneCursor.enable(); }
  /* CUSTOM CURSOR */
  (function(){
  /* EARLY: keep native cursor until reveal */
  document.body.classList.remove('custom-cursor-on');
    const dot = document.getElementById('ft-cursor');
    const ring = document.getElementById('ft-cursor-ring');
    if(!dot || !ring) return;
    let x=0,y=0, rx=0, ry=0;
    const lerp=(a,b,t)=>a+(b-a)*t;
    function move(e){ x=e.clientX; y=e.clientY; dot.style.transform=`translate(${x}px,${y}px)`; }
    function loop(){ rx=lerp(rx,x,0.15); ry=lerp(ry,y,0.15); ring.style.transform=`translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); }
    window.addEventListener('mousemove', move, {passive:true});
    requestAnimationFrame(loop);
    document.body.classList.add('cursor-ready');
  })();
 }, endHold);
  }

  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduce.matches){
    prelude.remove(); main.hidden=false;
  } else {
    runPrelude();
  }
})();

// === Clapper Snap Wipe between Pillars -> Crew ===
(function(){
  /* EARLY: keep native cursor until reveal */
  document.body.classList.remove('custom-cursor-on');
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wipe = document.getElementById('scene-wipe');
  const crew = document.querySelector('.crew');
  if(!wipe || !crew || prefersReduce.matches) return;

  const io = new IntersectionObserver(([entry])=>{
    if(entry.isIntersecting){
      wipe.classList.add('active');
      // Optional SFX:
      // const clap = new Audio('/ethos/sfx/clap.mp3'); clap.volume=.3; clap.play().catch(()=>{});
      setTimeout(()=> wipe.classList.remove('active'), 420);
      io.disconnect();
    }
  }, { threshold: .2 });

  io.observe(crew);
})();



// ===== Custom Cursor (desktop) with buttery trail =====
(function initCustomCursor(){
  if (!window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return;
  const ACCENT = getComputedStyle(document.documentElement).getPropertyValue('--red').trim() || '#E74C3C';

  // build main ring
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  // build trailing dots
  const DOTS = 8;
  const dots = [];
  for (let i = 0; i < DOTS; i++) {
    const d = document.createElement('div');
    d.className = 'cursor-dot';
    d.style.width = '8px'; d.style.height = '8px';
    d.style.background = ACCENT;
    d.style.opacity = String(0.22 - i * 0.02);
    d.style.transform = 'translate(-50%,-50%)';
    d.style.zIndex = '19999';
    document.body.appendChild(d);
    dots.push(d);
  }

  let targetX = 0, targetY = 0;
  let x = 0, y = 0;
  let visible = false;

  const MAIN_EASE = 0.25;
  const TRAIL_EASE = 0.18;

  function raf(){
    x += (targetX - x) * MAIN_EASE;
    y += (targetY - y) * MAIN_EASE;
    cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;

    let px = x, py = y;
    dots.forEach((d,i)=>{
      px += (targetX - px) * (TRAIL_EASE + i * 0.012);
      py += (targetY - py) * (TRAIL_EASE + i * 0.012);
      d.style.transform = `translate(${px}px, ${py}px) translate(-50%,-50%)`;
    });

    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  function onMove(e){
    targetX = e.clientX; targetY = e.clientY;
    if (!visible){
      cursor.style.opacity = '1';
      dots.forEach(d=> d.style.opacity = d.style.opacity || '0.18');
      visible = true;
    }
  }

  document.addEventListener('mousemove', onMove, { passive:true });
    document.addEventListener('mouseleave', ()=> { cursor.style.opacity = '0'; dots.forEach(d=> d.style.opacity='0'); }, { passive:true });

  // expose toggles
  window.__fieldtoneCursor = {
    enable(){
      document.body.classList.add('custom-cursor-on');
      cursor.style.opacity = '1';
      dots.forEach(d=> d.style.opacity = d.style.opacity || '0.18');
    },
    disable(){
      document.body.classList.remove('custom-cursor-on');
      cursor.style.opacity = '0';
      dots.forEach(d=> d.style.opacity = '0');
    }
  };
})();



// -------- Custom Cursor (desktop) + buttery trail --------
(function customCursor(){
  if (!window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return;

  const css = getComputedStyle(document.documentElement);
  const ACCENT = (css.getPropertyValue('--brand-red') || '#E74C3C').trim();

  // Main cursor
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  // Trail dots
  const DOTS = 8;
  const dots = [];
  for (let i=0;i<DOTS;i++){
    const d = document.createElement('div');
    d.className = 'cursor-dot';
    d.style.background = ACCENT;
    d.style.opacity = String(0.22 - i*0.02);
    document.body.appendChild(d);
    dots.push(d);
  }

  let targetX=0, targetY=0, x=0, y=0;
  const MAIN_EASE=0.25, TRAIL_EASE=0.18;
  let visible=false;

  function raf(){
    x += (targetX - x) * MAIN_EASE;
    y += (targetY - y) * MAIN_EASE;
    cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;

    let px=x, py=y;
    dots.forEach((d,i)=>{
      px += (targetX - px) * (TRAIL_EASE + i*0.012);
      py += (targetY - py) * (TRAIL_EASE + i*0.012);
      d.style.transform = `translate(${px}px, ${py}px) translate(-50%,-50%)`;
    });
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  function onMove(e){
    targetX = e.clientX; targetY = e.clientY;
    // Only show after the prelude is gone
    if (!document.body.classList.contains('ethos-ready')) return;
    if (!visible){
      cursor.style.opacity = '1';
      dots.forEach(d => d.style.opacity = d.style.opacity); // keep their set opacity
      visible = true;
    }
  }
  document.addEventListener('mousemove', onMove, { passive:true });
  document.addEventListener('mouseleave', ()=>{ cursor.style.opacity='0'; dots.forEach(d=>d.style.opacity='0'); visible=false; }, { passive:true });
  })();
