// Fieldtone custom cursor — paste this into collaborate.js / developers.js / services.js
document.addEventListener("DOMContentLoaded", () => {
  const cursor = document.querySelector(".custom-cursor");
  const trail  = document.querySelector(".custom-cursor-trail");
  if (!cursor || !trail) return;

  let x = 0, y = 0;          // target position
  let tx = 0, ty = 0;        // trail (lagged) position
  let shown = false;

  // Show/hide on enter/leave
  window.addEventListener("mouseenter", () => {
    shown = true;
    cursor.style.opacity = "1";
    trail.style.opacity  = "1";
  });
  window.addEventListener("mouseleave", () => {
    shown = false;
    cursor.style.opacity = "0";
    trail.style.opacity  = "0";
  });

  // Track mouse
  window.addEventListener("mousemove", (e) => {
    x = e.clientX;
    y = e.clientY;
    if (!shown) {
      shown = true;
      cursor.style.opacity = "1";
      trail.style.opacity  = "1";
    }
  });

  // Smooth follow (trail lags behind)
  const lerp = (a, b, n) => (1 - n) * a + n * b;

  function render() {
    // Cursor snaps to mouse
    cursor.style.transform = `translate(${x}px, ${y}px)`;

    // Trail eases toward mouse (increase factor for snappier motion)
    tx = lerp(tx, x, 0.15);
    ty = lerp(ty, y, 0.15);
    trail.style.transform = `translate(${tx}px, ${ty}px)`;

    requestAnimationFrame(render);
  }
  render();
});
// reserved for page interactions
