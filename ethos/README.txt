
# Fieldtone Ethos Page (Standalone Bundle)

Files:
- `ethos.html` — the page
- `css/base.css` — minimal base (safe to remove if your site already has a global base.css)
- `css/ethos.css` — page-specific styles (prelude, manifesto, grid)
- `js/ethos.js` — typewriter prelude logic
- `img/mohannad-archvizography.png` — your portrait (rename or replace as you like)
- `img/fieldtone-logo-white.png` — logo (if available)

How to integrate:
1) Add a nav link to `/ethos.html` in your header/hamburger.
2) If your site already loads `base.css` and a global `main.js`, you can remove `css/base.css` from this bundle and just keep `css/ethos.css` + `js/ethos.js`.
3) The prelude hides the cursor and then fades into the page automatically.
4) Replace crew placeholders by dropping images inside `<figure class="crew-portrait">...</figure>`.

Notes:
- Accent color: #e74c3c (Fieldtone red).
- Respect reduced motion: users with `prefers-reduced-motion: reduce` will skip the typewriter.
