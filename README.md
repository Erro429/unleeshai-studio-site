# UNLEESH — Dark Motion Studio Site

A multi-page, dark-mode, motion-heavy studio website for the UnleeshAI brand.
Built to a Nudot-reference structural spec with fully original assets, copy and branding.

## Stack
- Static HTML + vanilla CSS/JS (ES modules), no framework, no build step
- GSAP 3 + ScrollTrigger + Flip (CDN), Lenis smooth scroll, Three.js WebGL hero
- 81 AI-generated visuals (Higgsfield: Seedream 4.5 stills, Kling 2.6 video loops)

## Run locally
```bash
python -m http.server 8093
# open http://localhost:8093/
```
Pages must be served over HTTP (fetch-based page transitions and ES modules
do not work from file://).

## Pages
| File | Page |
|---|---|
| `index.html` | Home: WebGL hero carousel, the brief (photo reveal + decoder grid), ribbon marquee, pinned cube scene (chips, letters, status lines), who we are, sectors, works |
| `about.html` | Double marquee, horizontal service cards, marquee wall, accordion, stepper, registry |
| `work.html` | 10-item archive |
| `work_<slug>.html` | 10 generated detail pages (sticky stacks, framed page scroller) |
| `lab.html` | 25-card experimental grid, Flip filtering, lightbox |
| `contact.html` | Kinetic header, validated form, sending/received modals |
| `blog.html` | 16-row journal |

## Structure
- `css/` — tokens, base/chrome, components, per-page styles
- `js/` — `main.js` bootstrap, `chrome.js` (header/menu/footer/preloader/transitions), per-page modules (`home-brief.js`, `home-scene.js`, `home-hero.js` for the home chain)
- `assets/img|video/` — web-ready WebP/MP4 (raw generations in `assets/raw/`, git-ignored)
- `tools/` — asset manifest + generation/conversion/page-generation scripts

## Regenerating assets
```bash
bash tools/gen-run.sh    # fires all Higgsfield jobs in tools/manifest.psv, downloads results
bash tools/convert.sh    # raw → assets/img (webp) and assets/video (mp4)
bash tools/build-details.sh  # regenerate the 10 work detail pages
```

## Known follow-ups
- Contact form has no backend yet (`page-contact.js` fakes send → swap in a POST)
- Journal rows link to `#` until article pages exist
- Stats chips (12Y / 140+ works) and contact details (phone, address) are placeholders — replace with real numbers
- Social links point to `#`
