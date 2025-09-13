// Fieldtone custom cursor: one ring + center dot, with a clearly lagging ghost trail
document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.querySelector(".custom-cursor");
  const trail  = document.querySelector(".custom-cursor-trail");
  if (!cursor || !trail) return;

  let x = 0, y = 0;      // target
  let tx = 0, ty = 0;    // trail (lag)
  let idleTimer;

  const lerp = (a, b, n) => (1 - n) * a + n * b;

  const show = () => {
    cursor.style.opacity = "1";
    trail.style.opacity  = "1";
  };
  const hide = () => {
    cursor.style.opacity = "0";
    trail.style.opacity  = "0";
  };

  window.addEventListener("mouseenter", show);
  window.addEventListener("mouseleave", hide);

  window.addEventListener("mousemove", (e) => {
    x = e.clientX;
    y = e.clientY;
    show();

    // fade the trail when idle so it doesn't sit as a second ring
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      trail.style.opacity = "0.25";  // softer when stopped
    }, 120);
    trail.style.opacity = "1";       // vivid while moving
  });

  function render() {
    // Keep CSS translate(-50%,-50%) centering:
    cursor.style.left = x + "px";
    cursor.style.top  = y + "px";

    // Make the trail clearly lag behind
    tx = lerp(tx, x, 0.10);  // lower = more lag
    ty = lerp(ty, y, 0.10);
    trail.style.left = tx + "px";
    trail.style.top  = ty + "px";

    requestAnimationFrame(render);
  }
  render();
});
