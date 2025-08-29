// ======================
// FIELDTONE ETHOS SCRIPT
// ======================
(function(){
  const prelude = document.getElementById('prelude');
  const main = document.getElementById('ethos');
  const lines = Array.from(document.querySelectorAll('.type-line'));
  document.body.classList.add('ethos-typing');

  // ---- Auto-tuned timing based on prelude content ----
  const msPerChar    = 38;   // base typing speed (ms per character)
  const pauseBetween = 420;  // pause between each line

  // Collect the exact text (prefers data-text)
  const lineTexts = lines.map(el => (el.dataset.text || el.textContent || '').trim());

  // Estimate per-line typing time (adds tiny pauses for punctuation so it feels natural)
  function estimateTypeMs(text){
    const chars  = text.length;
    const commas = (text.match(/[,;:]/g) || []).length;
    const stops  = (text.match(/[.!?]/g) || []).length;
    return (chars * msPerChar) + (commas * 120) + (stops * 220);
  }

  // Total typing time + between-line pauses
  const typingTotalMs = lineTexts.reduce((sum, t) => sum + estimateTypeMs(t), 0)
                        + Math.max(lineTexts.length - 1, 0) * pauseBetween;

  // Last-line hold (auto: longer text ⇒ longer hold)
  const last = lineTexts[lineTexts.length - 1] || '';
  const lastWords = last.split(/\s+/).filter(Boolean).length;
  const endHold = Math.max(2200, Math.min(5000, 1000 + lastWords * 180)); // min 2.2s, max 5s

  // Failsafe = total estimate + hold + buffer (won't cut off early)
  const failsafeMs = Math.min(60000, typingTotalMs + endHold + 1500);
  const failsafe = setTimeout(()=>{
    try{ prelude?.remove(); if(main) main.hidden=false; }catch(e){}
    document.body.classList.add('ethos-ready');
  }, failsafeMs);

  function typeOne(el, text){
    return new Promise(res=>{
      let i=0; el.textContent='';
      const caret = document.createElement('span'); 
      caret.className='type-caret'; caret.textContent='▌'; 
      el.after(caret);

      const tick=()=>{
        el.textContent = text.slice(0, i++);
        if(i<=text.length){ setTimeout(tick, msPerChar); }
        else { caret.remove(); setTimeout(res, pauseBetween); }
      };
      tick();
    });
  }

  async function runPrelude(){
    for(const el of lines){ 
      await typeOne(el, el.dataset.text || el.textContent || ''); 
    }

   // ✅ Fade after hold
setTimeout(() => {
  // Apply the transition first
  prelude.style.transition = 'opacity 1200ms ease';

  // Then on the next frame, apply the opacity change
  requestAnimationFrame(() => {
    prelude.style.opacity = 0;
  });

  setTimeout(() => {
    prelude.remove();
    main.hidden = false;
    clearTimeout(failsafe);
    document.body.classList.add('ethos-ready');
    if (window.__fieldtoneCursor) window.__fieldtoneCursor.enable();
  }, 1300); // slightly longer than 1200ms
}, endHold);
  }

  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduce.matches){
    prelude.remove(); 
    if (main) main.hidden=false;
    document.body.classList.add('ethos-ready');
  } else {
    runPrelude();
  }
})();

// === Clapper Snap Wipe between Pillars -> Crew ===
(function(){
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const wipe = document.getElementById('scene-wipe');
  const crew = document.querySelector('.crew');
  if(!wipe || !crew || prefersReduce.matches) return;

  const io = new IntersectionObserver(([entry])=>{
    if(entry.isIntersecting){
      wipe.classList.add('active');
      setTimeout(()=> wipe.classList.remove('active'), 420);
      io.disconnect();
    }
  }, { threshold: .2 });

  io.observe(crew);
})();

// ===== Custom Cursor (outer ring + inner dot + buttery trail) =====
(function initCustomCursor(){
  if (!window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return;

  const ACCENT = getComputedStyle(document.documentElement).getPropertyValue('--red').trim() || '#E74C3C';

  // --- Outer Ring ---
  const ring = document.createElement('div');
  ring.className = 'custom-cursor-ring';
  Object.assign(ring.style, {
    position:'fixed',
    top:'0', left:'0',
    width:'28px', height:'28px',
    border:`2px solid ${ACCENT}`,
    borderRadius:'50%',
    transform:'translate(-50%,-50%)',
    zIndex:'20000',
    pointerEvents:'none',
    opacity:'0',
    transition:'opacity .25s ease'
  });
  document.body.appendChild(ring);

  // --- Inner Dot ---
  const dot = document.createElement('div');
  dot.className = 'custom-cursor-dot';
  Object.assign(dot.style, {
    position:'fixed',
    top:'0', left:'0',
    width:'8px', height:'8px',
    background:ACCENT,
    borderRadius:'50%',
    transform:'translate(-50%,-50%)',
    zIndex:'20001',
    pointerEvents:'none',
    opacity:'0',
    transition:'opacity .25s ease'
  });
  document.body.appendChild(dot);

  // --- Trailing dots (ghost) ---
  const DOTS = 6;
  const dots = [];
  for (let i=0; i<DOTS; i++){
    const d = document.createElement('div');
    d.className = 'cursor-trail';
    Object.assign(d.style, {
      position:'fixed',
      top:'0', left:'0',
      width:'6px', height:'6px',
      background:ACCENT,
      borderRadius:'50%',
      opacity:String(0.25 - i*0.04),
      transform:'translate(-50%,-50%)',
      zIndex:'19999',
      pointerEvents:'none'
    });
    document.body.appendChild(d);
    dots.push(d);
  }

  let targetX=0, targetY=0, x=0, y=0;
  const MAIN_EASE=0.25, TRAIL_EASE=0.18;
  let visible=false;

  function raf(){
    x += (targetX - x) * MAIN_EASE;
    y += (targetY - y) * MAIN_EASE;

    ring.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    dot.style.transform  = `translate(${x}px,${y}px) translate(-50%,-50%)`;

    let px=x, py=y;
    dots.forEach((d,i)=>{
      px += (targetX - px) * (TRAIL_EASE + i*0.01);
      py += (targetY - py) * (TRAIL_EASE + i*0.01);
      d.style.transform = `translate(${px}px,${py}px) translate(-50%,-50%)`;
    });

    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  function onMove(e){
    targetX = e.clientX; targetY = e.clientY;
    // Only show once ethos is ready
    if (!document.body.classList.contains('ethos-ready')) return;
    if (!visible){
      ring.style.opacity='1';
      dot.style.opacity='1';
      dots.forEach(d=> d.style.opacity=d.style.opacity);
      visible=true;
    }
  }

  document.addEventListener('mousemove', onMove, { passive:true });
  document.addEventListener('mouseleave', ()=>{
    ring.style.opacity='0';
    dot.style.opacity='0';
    dots.forEach(d=> d.style.opacity='0');
    visible=false;
  }, { passive:true });

  // Expose global toggles
  window.__fieldtoneCursor = {
    enable(){
      ring.style.opacity='1'; 
      dot.style.opacity='1'; 
      dots.forEach(d=> d.style.opacity=d.style.opacity);
    },
    disable(){
      ring.style.opacity='0'; 
      dot.style.opacity='0'; 
      dots.forEach(d=> d.style.opacity='0');
    }
  };
})(); // ← CLOSE the cursor IIFE

// ===== NAV TOGGLE =====
(function(){
  const burger = document.getElementById('navBurger');
  const panel  = document.getElementById('navPanel');
  if(!burger || !panel) return;

  function openMenu(){
    panel.setAttribute('aria-hidden','false');
    burger.setAttribute('aria-expanded','true');
    document.documentElement.style.overflow = 'hidden'; // lock page behind menu
  }
  function closeMenu(){
    panel.setAttribute('aria-hidden','true');
    burger.setAttribute('aria-expanded','false');
    document.documentElement.style.overflow = ''; // restore scroll
  }

  burger.addEventListener('click', ()=>{
    const open = panel.getAttribute('aria-hidden') === 'false';
    open ? closeMenu() : openMenu();
  });

  panel.addEventListener('click', (e)=>{
    // click outside menu list closes
    if(e.target === panel) closeMenu();
  });

  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeMenu();
  });

  // close on link click
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
})();
