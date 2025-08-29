
(function(){
  const prelude = document.getElementById('prelude');
  const main = document.getElementById('ethos');
  const lines = Array.from(document.querySelectorAll('.type-line'));
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
    setTimeout(()=>{ prelude.remove(); main.hidden=false; clearTimeout(failsafe); document.body.classList.add('ethos-ready'); }, endHold);
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
