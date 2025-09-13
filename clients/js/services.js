// Fieldtone custom cursor: one ring + center dot, with a clearly lagging ghost trail
document.addEventListener("DOMContentLoaded", () => {
  const ring = document.querySelector(".custom-cursor");
  const dot  = document.querySelector(".custom-cursor-dot");
  if (!ring || !dot) return;

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

  function render() {
    // Keep CSS translate(-50%,-50%) by setting left/top only
    ring.style.left = x + "px";
    ring.style.top  = y + "px";

    // Dot trails behind
    dx = lerp(dx, x, 0.12);   // lower = more lag (try 0.10–0.18)
    dy = lerp(dy, y, 0.12);
    dot.style.left = dx + "px";
    dot.style.top  = dy + "px";

    requestAnimationFrame(render);
  }
  render();
});
