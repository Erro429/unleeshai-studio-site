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
| `about.html` | Sticky video hero, dot marquees, manifesto, years counter, pinned service cards, marquee wall, accordion with media, pinned six-phase process stage, studio band, registry with cursor previews |
| `work.html` | Sticky mockup-loop hero with filmstrip index, sticky grid/list toggle, editorial 12-col grid with hover loops, big-type list with cursor previews |
| `work_<slug>.html` | 10 generated case pages: title-over-still hero, facts strip, brief/answer/result, sticky stacks, framed page scroller, next-case teaser |
| `lab.html` | Sticky hero, sticky filter strip with counts, 25-card grid, Flip filtering, captioned lightbox (deep-linkable by `#slot`) |
| `contact.html` | Kinetic LET'S TALK hero with live SF clock, contact card + what-happens-next, validated brief form (pill radios), FAQ accordion, sending/received modals |
| `blog.html` | Sticky hero with featured entry, 16 rows with cursor previews, subscribe strip |
| `journal_<slug>.html` | 16 generated entries: hero, sticky reading aside with progress, drop-cap lead, pull quote, figure, next-entry teaser |

Every internal page shares `css/pages/inner.css` + `js/inner.js` (sticky hero
choreography, body seams, cursor previews, accordion, clock) and links
`css/pages/nudot.css` for the global loader/menu/transition/grain additions.

## Structure
- `css/` — tokens, base/chrome, components, per-page styles
- `js/` — `main.js` bootstrap, `chrome.js` (header/menu/footer/preloader/transitions), per-page modules (`home-brief.js`, `home-scene.js`, `home-hero.js` for the home chain)
- `assets/img|video/` — web-ready WebP/MP4 (raw generations in `assets/raw/`, git-ignored)
- `tools/` — asset manifest + generation/conversion/page-generation scripts

## Regenerating assets
```bash
bash tools/gen-run.sh    # fires all Higgsfield jobs in tools/manifest.psv, downloads results
bash tools/convert.sh    # raw → assets/img (webp) and assets/video (mp4)
python tools/build.py    # regenerate work.html, the 10 case pages, blog.html and the 16 journal entries, then run tools/seo.py
```

## SEO and AI search (tools/seo.py)
`python tools/build.py` finishes by running `tools/seo.py`, which is idempotent and owns:
- the `<!-- seo:start -->` block in every page head: title, description, canonical, robots,
  Open Graph, Twitter card, icons, a no-JS visibility fallback and a JSON-LD `@graph`
  (Organization, WebSite, page type, BreadcrumbList, BlogPosting / CreativeWork / FAQPage / ItemList)
- `sitemap.xml`, `robots.txt` (AI crawlers explicitly allowed), `llms.txt`, `llms-full.txt`, `site.webmanifest`
- 1200x630 JPEG share images in `assets/og/` and PNG icons in `assets/icons/`

Studio facts (domain, email, city, services, social profiles) live in the `SITE` dict at the top of
`tools/seo.py`; static page titles and descriptions in `STATIC`. Never hand-edit the seo block in a page.
Add real profile URLs to `SITE['same_as']` once they exist. `404.html` is served by most static hosts automatically.
`tools/build.py` reads `tools/projects.json` and `tools/journal.json` and fills
`tools/work-template.html`, `tools/detail-template.html`,
`tools/journal-template.html` and `tools/article-template.html`. Edit the JSON
or a template, never the generated files.

## Known follow-ups
- Contact form and journal subscribe strip have no backend yet (both acknowledge locally; swap in a POST)
- Case studies are presented as studio concept projects; the invented stats and the placeholder phone were removed
- Social links were removed until real profiles exist (add them back in `js/chrome.js` and `SITE['same_as']`)
