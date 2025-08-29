
(function(){
  const prelude = document.getElementById('prelude');
  const main = document.getElementById('ethos');
  const lines = Array.from(document.querySelectorAll('.type-line'));

  const msPerChar = 38;       // typing pace
  const pauseBetween = 420;   // pause between lines
  const endHold = 700;        // hold before fade

  function typeOne(el, text){
    return new Promise(res=>{
      let i=0;
      const caret = document.createElement('span');
      caret.className='type-caret';
      caret.textContent='▌';
      el.after(caret);
      const tick = ()=>{
        el.textContent = text.slice(0, i++);
        if(i<=text.length) setTimeout(tick, msPerChar);
        else { caret.remove(); setTimeout(res, pauseBetween); }
      };
      tick();
    });
  }

  async function runPrelude(){
    for(const el of lines){
      await typeOne(el, el.dataset.text || '');
    }
    prelude.style.transition = 'opacity 500ms ease';
    prelude.style.opacity = '0';
    setTimeout(()=>{
      prelude.remove();
      main.hidden = false;
      document.body.classList.add('ethos-ready');
      // Optional: play a clapper SFX here
      // const clap = new Audio('sfx/clap.mp3');
      // clap.volume = 0.3; clap.play().catch(()=>{});
    }, endHold);
  }

  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduce.matches){
    lines.forEach(el=> el.textContent = el.dataset.text || '');
    prelude.remove();
    main.hidden = false;
  } else {
    runPrelude();
  }
})();

  // Clapper wipe on Crew entry
  const wipe = document.getElementById('scene-wipe');
  const crew = document.querySelector('.crew');
  if(wipe && crew){
    const io = new IntersectionObserver(([e])=>{
      if(e.isIntersecting){
        wipe.classList.add('active');
        setTimeout(()=>wipe.classList.remove('active'), 420);
        io.disconnect();
      }
    }, { threshold:.2 });
    io.observe(crew);
  }

})();