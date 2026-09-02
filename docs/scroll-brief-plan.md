# Scroll Design Brief: Implementation Plan

Source brief: `C:\Users\hustl\Downloads\Nudot.com.tw Scroll Design Brief.md` (2026-09-03).
Rule for this pass: **keep everything that is already built, add what the brief describes on top.**
Nothing approved earlier (hero melt, the brief, the ribbon, the pinned scene, WHO WE ARE deck,
sector rings and rows, works archive, preloader wordmark) is removed or re-timed unless a line
below says so explicitly.

---

## 1. Gap map: brief section vs. what exists

| Brief § | Already built (keep) | Missing (add) |
|---|---|---|
| 0 Tech stack | GSAP 3.12.5 + ScrollTrigger + Flip, Lenis 1.1.14 wired to the ticker, Three r152 | ScrambleTextPlugin (bump GSAP to 3.13.0 on cdnjs where every plugin is free); expose `window._lenis` |
| 1 Tokens | Archivo / Doto / Inter / JetBrains Mono, dark palette, ease tokens | Type-scale tokens (`--text-2xs` … `--text-watermark`), tracking + `--leading-display: 0.88`, `.bracket-label` utility, menu cream `#efe6d8`, gold hover `#c9a24a`, pill charcoal `#141414`, marquee separator `rgba(255,255,255,.35)` |
| 2 Loader | UNLEESH wordmark with video letter, `[ 00 ]` counter, corner meta, curtain exit | 80x64 thumbnail swatch that crossfades 3 to 4 times while loading; two-panel curtain (top + bottom meet at centre) as the first-load cover; blur-and-desaturate dissolve into the hero (hero sharpens over ~0.5s) |
| 3 Hero | WebGL melt slideshow, `01 // 05` counter, arrows, waveform, filmstrip, STUDIO / DIGITAL, quick links, chips, DOWN indicator | Master hero timeline with **masked slide-up reveals for every group** (words, tag, both lists, nav, chips, cluster, bottom row) at the brief's offsets; STUDIO dimmer at idle and brightening on scroll; pill: `#141414`, 6px radius, 64px, top 30px, hidden until ~1vh then `ns-enter`; hairline under quick links; DOWN indicator persists into the brief section |
| 4 Marquee | Velocity ticker, reverses on scroll-up, settles to idle, glosses | `mix-blend-mode: difference` on the ribbon, `rgba(255,255,255,.35)` separators between items |
| 5 Tunnel | Pinned 500vh scene: 60 chips, cube assembly, Y-spin, X tumble, zoom exit, letters U N L E E S H, three status lines | **Sine-wave keyword columns** (12 left, 12 right, `waveX()` + `gsap.quickTo`, focused word brightens and swaps a shared thumbnail); **dot-matrix logo build** (Doto "U" bottom-left, mirrored bottom-right, dots appear progressively); **centre focal card** (texture, specular sweep, status caption cards) before the cube assembles; **clip-path curtain reveal** of the whole scene (`inset(h% 0 0 0)`, easeInOutCubic) |
| 6a Sectors | Orbiting rings, THE SECTORS char reveal, count-up stats ticker | Arced headline (SVG textPath, one tspan per char so the reveal still works); **pinned burst**: ring tiles explode to full viewport with RGB channel-split glitch, then fade to black |
| 6b Archive | Sticky ARCHIVE OF / THE SELECTED WORKS / BY UNLEESH, cards float over it with parallax | Cards **enter diagonally from alternating corners** (`xPercent ±120, yPercent ∓120, opacity 0 → 0`), scrubbed per card |
| 7 Gallery | `data-reveal-lines` masked lines, footer meta columns | `data-reveal-words` variant (per-word masks, once on enter); **Flip + scramble morph** on WHO WE ARE (desktop only): eyebrow + headline scramble in on enter / enterBack, paragraph Flip-morphs between two layout states as the deck pins |
| 8 Footer | Video wash, email CTA, phone, address, socials, © mark, giant wordmark plate | `.footer-parallax-bg` still image with `background-attachment: fixed; background-size: contain; mix-blend-mode: luminosity` behind the plate; embossed wordmark treatment; tilted business-card thumbnail beside the contact block |
| 9 Menu | Overlay with nav words, side column, cursor-following preview pair, ESC close | **3-phase pill morph** (compact → line → full screen via scheduled classes / inline styles, 220 / 470 / 860 ms open, 220 / 470 / 780 ms close); **cream panel `#efe6d8`** with black text; item stagger 0.44s / 0.05 in, 0.18s blur out; hover previews via CSS `.is-previewed` class toggle on two flanking thumbnails; gold hover text; HOME previewed at rest |
| 10 Transition | Clip-path wipe layer with caption | **9 x 17 pixel grid** (153 cells) blooming from centre on leave, shrinking from centre on enter; 1000 ms force-nav fallback, 2400 / 1600 ms cover-clear fail-safe |
| 11 Grain | CSS SVG-turbulence grain, opacity .05 | **Canvas grain**: 10 baked noise frames, 25 fps, drops to 12 fps for 180 ms on scroll, `mix-blend-mode: screen`, opacity .06, off on ≤768px and reduced motion |

Decisions I am **not** changing (locked earlier or clearly better as-is):
- Fonts stay Archivo / Doto / Inter / JetBrains Mono. Doto is our dot-matrix font; it plays the Bitcount role.
- Lenis stays `lerp: 0.08` (already tuned); the brief's `duration: 1.1` is a different feel, not a requirement.
- The cube stays a CSS 3D cube driven by the scrubbed timeline. A Three.js cube adds a second WebGL context for no visible gain.
- The 60 chips and the 12-cell decoder stay. The wave columns are layered **in front** of the chip field; chips dim to 40% while the columns are active so the two never fight.
- English-only stays. The bracket-label motif uses our EN / EN gloss pairing.

---

## 2. Build order (each step is one commit, verified before the next)

Ordering follows the brief's §12 checklist, adjusted so foundations land before the effects that depend on them.

### Step 1: Foundations
Files: `index.html` (+ all pages), `js/main.js`, `js/core.js`, `css/tokens.css`, `css/base.css`
- Bump GSAP to 3.13.0, add `ScrambleTextPlugin.min.js`, register it. Expose `window._lenis`.
- Add type-scale, tracking and leading tokens; add `.bracket-label`; add the four new colour tokens.
- Add `revealMask(el)` (overflow-hidden wrapper, `yPercent 110 → 0`) and `splitWords(el)` + `data-reveal-words` to core.
- Verify: no console errors on every page, existing reveals unchanged.

### Step 2: Hero master timeline + pill + indicator
Files: `js/page-home.js`, `js/home-hero.js`, `css/pages/home.css`, `css/base.css`
- Build `heroTl` exactly as §3: words (0.85 / stagger 0.14 / power4.out at 0.4s), tag, list items, nav + chips grid, bottom row, cluster autoAlpha. Fires on `preloader:done` (replaces only the current STUDIO / DIGITAL trigger; the per-character split stays inside the words group).
- STUDIO at idle opacity ~0.55, brightening to 1 with scroll progress over the first 60vh.
- Pill: `#141414`, 6px, 64px, `top: 30px` (16px mobile); `ns-exit` at the top, `ns-enter` after 1vh. Existing "icons born from the logo" animation stays and runs on `ns-enter`.
- DOWN indicator fades out at the **end of the brief section**, not at 100px.
- Verify: Playwright capture at t=0, 0.6s, 1.4s after preloader; pill hidden at scroll 0, visible at 1.2vh.

### Step 3: Loader additions
Files: `js/chrome.js`, `css/components.css`
- Insert an 80x64 swatch between the second E and S that crossfades four thumbnails (V40M, V42M, V45M, V46M) on a loop while the counter runs.
- First-load cover becomes the two-panel curtain (`--pt-top -102% → 0`, `--pt-bottom 102% → 0`), then the existing wordmark sequence plays inside it.
- Exit: keep the clip lift; add `filter: blur(14px) saturate(0.4)` on `<main>` resolving to none over 0.6s, then `clearProps` so pinning is unaffected (the earlier transform lesson applies to filter too).
- Verify: hero pins still work after load (scroll to the scene, confirm `pin-spacer` exists).

### Step 4: Ribbon polish
Files: `index.html`, `css/pages/home.css`
- `mix-blend-mode: difference` on `.ribbon-track`; `.mq-sep` hairlines at `rgba(255,255,255,.35)`.
- Verify: marquee still reverses on scroll-up (step-scroll capture).

### Step 5: Tunnel additions (largest step, one commit per bullet)
Files: `js/home-scene.js`, new `js/scene-wave.js`, new `js/scene-card.js`, `css/pages/home.css`, `index.html`
- **Pin length 500vh → 650vh.** Existing beats keep their *absolute* scroll distance; the extra 150vh is inserted at the front (curtain + focal card) so nothing approved gets compressed.
- **Curtain reveal**: `.scene` gets a `.sc-mask` wrapper; `clip-path: inset(h% 0 0 0)` driven 100 → 0 over the first 40vh with easeInOutCubic.
- **Focal card** (40vh → 150vh): tall rounded panel centre-frame, phases: texture render (V34 still) → diagonal specular sweep → three status caption cards. At 150vh it explodes into the six cube faces (the existing assembly beat starts from the card's rect instead of from random space).
- **Wave columns**: left list = `Core-Site … Digital Art`, right list = `Strategy … Craft` (same words as the decoder so the site stays consistent). `waveX()` with `WAVE_NUM 12, WAVE_SPD 1`, `gsap.quickTo(x, 0.6, power4.out)` per word, column `y` scrolled by `height * (0.5 - progress)`, focused index brightens and swaps a shared 120x160 thumbnail. Active from card phase through the last cube beat; fades on exit. Chips dim to 40% while active.
- **Dot-matrix U**: Doto "U" at `--text-display-lg` bottom-left, mirrored bottom-right; rendered as a dot grid (canvas sample of the glyph) whose dots appear progressively 0 → 100% across the spin beats.
- Verify: step-scroll captures at p = 0, .05, .12, .2, .3, .5, .7, .85, 1; reverse scrub returns to identical frames.

### Step 6: Sectors arc + burst
Files: `js/page-home.js`, new `js/home-burst.js`, `css/pages/home.css`, `index.html`
- Replace the flat `.sa-title` text with an SVG `<textPath>` on a shallow arc; one `<tspan>` per character so `revealChars` still staggers.
- New `.sa-burst` block after `.sectors-arc`, pinned 150vh: ring tiles clone into the burst layer, scale and translate outward along their ring angle to beyond the viewport; each tile has red / green / blue channel copies (SVG `feColorMatrix` filters) offset by scroll velocity; the block fades to black over the last 20%.
- Verify: burst reverses cleanly; stats ticker count-up still fires.

### Step 7: Archive corner slides
Files: `js/page-home.js`
- Each `.work-card` enters from an alternating corner (odd: top-left, even: bottom-right), `xPercent ±120, yPercent ∓120, opacity 0 → 0`, scrubbed from `top bottom` to `top 40%`. Existing ±40px parallax stays on top.
- Verify: capture mid-entry of card 1 and card 2.

### Step 8: WHO WE ARE Flip + scramble (desktop only)
Files: `js/page-home.js`, `css/pages/home.css`
- Eyebrow and headline `scrambleText` in on enter and enterBack (1s, `upperAndLowerCase`).
- Paragraph Flip: state A below the deck (current), state B beside the deck; `Flip.to` scrubbed from `bottom bottom-=10%` to `center center`, `expo.inOut`.
- ≤1023px: no Flip, no scramble; the current reveal runs.

### Step 9: Footer
Files: `js/chrome.js`, `css/base.css`, `index.html`
- `.footer-parallax-bg` div behind `.f-plate` with a still (V60 or V63, whichever reads best in luminosity), `background-attachment: fixed`, `contain`, `bottom`.
- Embossed `.fp-word` (dual text-shadow, low-alpha fill).
- Tilted business-card thumbnail (V07) beside the email block, `rotate(-6deg)`, magnetic hover.
- Verify: on Safari `background-attachment: fixed` degrades to scroll; acceptable.

### Step 10: Menu morph + cream panel
Files: `js/chrome.js`, `css/base.css`, `css/components.css`
- Shell morph on the pill itself via scheduled classes / inline styles at the brief's exact timings; overlay content mounts inside the expanded pill.
- Panel `#efe6d8`, text `#000`, hover word `#c9a24a`. Side column recolours to dark-on-cream.
- Items: in `autoAlpha 0 → 1, y 18 → 0, 0.44s, stagger 0.05`; out `0.18s, stagger 0.02, blur(8px)`.
- Two flanking thumbnails per row toggled by `.is-previewed` (CSS transition on opacity + clip-path), replacing the cursor-following pair. HOME previewed at rest.
- Verify: open, close, reopen (second-run test), ESC, link click closes and navigates.

### Step 11: Pixel-grid transition
Files: `js/chrome.js`, `css/components.css`
- Build 153 cells inside `.transition-layer` once; leave = bloom from centre (`scale 0 → 1.03, 0.28s, power1.in, each 0.022`); enter = shrink (`0.3s, power1`). Caption stays.
- Timers: 1000 ms force-nav, 2400 ms cover-clear re-armed at 1600 ms on `pageshow`.
- Verify: home → work → project → back, no stuck cover.

### Step 12: Canvas grain
Files: `js/core.js`, `css/base.css`
- Replace the CSS grain with the §11 canvas (10 frames, 25 fps, 12 fps for 180 ms on Lenis scroll events, `mix-blend-mode: screen`, opacity .06, off ≤768px and reduced motion). Resize rebakes frames.

---

## 3. Verification protocol (every step)
- Serve with `python -m http.server 8093` started via PowerShell `Start-Process`.
- Playwright with `executablePath` at `%LOCALAPPDATA%\ms-playwright\chromium-1228\chrome-win64\chrome.exe`.
- Pinned sections: find the trigger via `ScrollTrigger.getAll()`, `scrollTo(start + p * (end - start))`, wait 1.8s, capture. Never trust a full-page flatten.
- Reverse-scrub check on every scrubbed timeline (the user's "eases, never snaps" rule).
- Second-run check on every UI flow (menu, transition, hero arrows).
- Commit + push after each step.

## 4. Risks and calls for the user
1. **Cream menu panel** is the brief's one colour break. It is a real departure from the all-dark site. Plan adopts it as written; say so if you want the morph but keep the panel dark.
2. **Wave columns over the chip field** could read as busy on 1280px screens. Plan dims chips to 40% while columns are active; the fallback is hiding chips outside the centre band during the wave phase.
3. **Pin length grows 500vh → 650vh** to fit the curtain and focal card without compressing the approved cube beats. Total home scroll grows by 1.5 screens.
4. **Focal card → cube explosion** is my bridge between the brief's "card cycles, then cube appears" and our existing assembly beat. It reads as one continuous object; flag if you want them as separate objects.
5. GSAP 3.13 bump: same API, plugins now free; low risk, but it is a version change on every page.
