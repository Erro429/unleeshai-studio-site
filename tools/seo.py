#!/usr/bin/env python3
"""Search + AI-answer-engine layer for every page. Idempotent; build.py runs it last.

Per page it writes one managed block into <head> (between the seo:start / seo:end
markers): title, description, canonical, robots, Open Graph, Twitter card, icons
and a JSON-LD @graph. It also writes the site-level files: sitemap.xml, robots.txt,
llms.txt, llms-full.txt, site.webmanifest, the 1200x630 share images in
assets/og/ and the PNG icons.

Facts about the studio live in SITE below. Edit them there, then run
    python tools/build.py      (or python tools/seo.py on its own)
"""
import datetime
import html
import io
import json
import os
import re

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

SITE = {
    'url': 'https://unleeshai.com',
    'name': 'UnleeshAI',
    'wordmark': 'UNLEESH',
    'email': 'hello@unleeshai.com',
    'city': '',        # remote studio: no city or region is published
    'region': '',
    'country': 'US',
    'area_served': 'United States',
    'founded': '2026',
    'locale': 'en_US',
    'summary': ('UnleeshAI (wordmark UNLEESH) is a remote web studio serving clients across the US. '
                'It designs and hand-codes custom websites and landing pages, then grows their visibility '
                'and conversion with SEO, AEO and AIO, content, and sales funnels.'),
    'services': ['Custom website design and development', 'Landing pages', 'SEO', 'AEO and AIO',
                 'Sales funnels', 'Blog and content writing', 'Traffic generation', 'Website optimization'],
    'knows_about': ['Custom web design', 'Web development', 'Landing pages', 'Search engine optimization',
                    'Answer engine optimization', 'AI Overview optimization', 'Sales funnels',
                    'Content marketing', 'Conversion rate optimization', 'Website performance optimization',
                    'GSAP scroll animation', 'WebGL'],
    'same_as': [],  # add real profile URLs (Instagram, LinkedIn, ...) once they exist
}

OG_W, OG_H = 1200, 630
TODAY = datetime.date.today().isoformat()

# Hand-written copy for the static pages. Titles stay under ~60 chars, descriptions 140-160.
STATIC = {
    'index.html': dict(
        path='/', kind='home', img='V76',
        img_alt='UnleeshAI: custom websites built to be found',
        title='UnleeshAI | Custom Websites, SEO and AI Search Visibility',
        desc=('UnleeshAI builds custom, hand-coded websites and landing pages, then gets them found on '
              'Google and in AI answers. SEO, AEO, content and funnels included.')),
    'about.html': dict(
        path='/about.html', kind='AboutPage', img='V36', crumb='About',
        title='About UnleeshAI: Remote Web Design and SEO Studio',
        desc=('How UnleeshAI works: a remote studio for custom websites, SEO, AI search and funnels, '
              'run on a six-phase process from first call to launch and growth.')),
    'work.html': dict(
        path='/work.html', kind='CollectionPage', img='V40M', crumb='Work',
        title='Work: Live Sites & Web Design Cases | UnleeshAI',
        desc=('Live websites UnleeshAI has built and shipped, plus ten concept flagships across ten '
              'sectors: hand-coded sites, generated imagery and scroll-driven motion.')),
    'lab.html': dict(
        path='/lab.html', kind='CollectionPage', img='V55', crumb='Labs',
        title='Labs: AI Visual & Web Motion Experiments | UnleeshAI',
        desc=('UnleeshAI Labs: 25 experiments in web motion design, AI motion imagery and high-end '
              'commercial image generation, filterable by stream with a captioned lightbox.')),
    'contact.html': dict(
        path='/contact.html', kind='ContactPage', img='V21', crumb='Contact',
        title='Contact UnleeshAI: Start a Website or SEO Project',
        desc=('Send UnleeshAI a brief for a website, landing page, SEO or AI search project. Five-page sites '
              'from $499, most live in 2 to 4 days. Replies in two working days.')),
    'blog.html': dict(
        path='/blog.html', kind='Blog', img='V28', crumb='Journal',
        title='Journal: Web Design, Motion & AI Visual Notes | UnleeshAI',
        desc=('The UnleeshAI journal: field notes on web design, scroll motion, AI product imagery and '
              'brand strategy, written by the studio while the work was still fresh.')),
}


# ------------------------------------------------------------------ helpers
def read(path):
    with io.open(path, encoding='utf-8') as f:
        return f.read()


def write(path, text):
    with io.open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)


def abs_url(path):
    return SITE['url'] + path


def attr(s):
    return html.escape(s, quote=True)


def clip(s, n=160):
    s = ' '.join(s.split())
    if len(s) <= n:
        return s
    cut = s[:n - 1].rsplit(' ', 1)[0].rstrip(',;:')
    return cut + '…'


def iso(date_dots):
    return date_dots.replace('.', '-')


def text_of(fragment):
    return html.unescape(re.sub(r'<[^>]+>', ' ', fragment)).split()


# ------------------------------------------------------------------ images
def og_image(src_id, out_name):
    """Cover-crop a site still to 1200x630 JPEG (share cards don't reliably accept WebP)."""
    src = os.path.join(ROOT, 'assets', 'img', f'{src_id}.webp')
    out_rel = f'assets/og/{out_name}.jpg'
    out = os.path.join(ROOT, out_rel)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src):
        return out_rel
    im = Image.open(src).convert('RGB')
    scale = max(OG_W / im.width, OG_H / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    left, top = (im.width - OG_W) // 2, (im.height - OG_H) // 2
    im.crop((left, top, left + OG_W, top + OG_H)).save(out, 'JPEG', quality=84, optimize=True, progressive=True)
    return out_rel


def draw_icon(size):
    """Raster of assets/favicon.svg (black tile, white U stroke, white dot) at any size."""
    k = size / 64
    ss = 4  # supersample for smooth edges
    im = Image.new('RGB', (size * ss, size * ss), '#030303')
    d = ImageDraw.Draw(im)
    w = round(8 * k * ss)
    c = lambda v: v * k * ss
    d.line([(c(14), c(12)), (c(14), c(36))], fill='white', width=w)
    d.line([(c(50), c(12)), (c(50), c(36))], fill='white', width=w)
    d.arc([c(14) - w / 2, c(18) - w / 2, c(50) + w / 2, c(54) + w / 2], 0, 180, fill='white', width=w)
    for x in (14, 50):
        d.ellipse([c(x) - w / 2, c(12) - w / 2, c(x) + w / 2, c(12) + w / 2], fill='white')
    d.ellipse([c(44), c(46), c(56), c(58)], fill='white')
    return im.resize((size, size), Image.LANCZOS)


def build_icons():
    targets = {'favicon-32.png': 32, 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512}
    for name, size in targets.items():
        path = os.path.join(ROOT, 'assets', 'icons', name)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        if not os.path.exists(path):
            draw_icon(size).save(path, 'PNG', optimize=True)


# ------------------------------------------------------------------ JSON-LD
ORG_ID = SITE['url'] + '/#org'
WEBSITE_ID = SITE['url'] + '/#website'


def org_node():
    node = {
        '@type': 'Organization', '@id': ORG_ID,
        'name': SITE['name'], 'alternateName': SITE['wordmark'],
        'url': SITE['url'] + '/', 'email': SITE['email'],
        'logo': {'@type': 'ImageObject', 'url': abs_url('/assets/icons/icon-512.png'), 'width': 512, 'height': 512},
        'image': abs_url('/assets/og/index.jpg'),
        'description': SITE['summary'], 'foundingDate': SITE['founded'],
        'address': {'@type': 'PostalAddress', 'addressCountry': SITE['country'],
                    **({'addressLocality': SITE['city'], 'addressRegion': SITE['region']} if SITE['city'] else {})},
        'areaServed': {'@type': 'Country', 'name': SITE['area_served']},
        'knowsAbout': SITE['knows_about'],
        'contactPoint': {'@type': 'ContactPoint', 'contactType': 'new business',
                         'email': SITE['email'], 'availableLanguage': 'English'},
        'hasOfferCatalog': {'@type': 'OfferCatalog', 'name': 'Studio services', 'itemListElement': [
            {'@type': 'Offer', 'itemOffered': {'@type': 'Service', 'name': s, 'provider': {'@id': ORG_ID}}}
            for s in SITE['services']]},
    }
    if SITE['same_as']:
        node['sameAs'] = SITE['same_as']
    return node


def website_node():
    return {'@type': 'WebSite', '@id': WEBSITE_ID, 'url': SITE['url'] + '/', 'name': SITE['name'],
            'alternateName': SITE['wordmark'], 'publisher': {'@id': ORG_ID}, 'inLanguage': 'en'}


def crumbs(url, trail):
    items = [{'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE['url'] + '/'}]
    for i, (name, path) in enumerate(trail, 2):
        items.append({'@type': 'ListItem', 'position': i, 'name': name, 'item': abs_url(path)})
    return {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': items}


def page_node(kind, url, title, desc, image, extra=None):
    node = {'@type': 'WebPage' if kind == 'home' else kind, '@id': url + '#webpage', 'url': url,
            'name': title, 'description': desc, 'isPartOf': {'@id': WEBSITE_ID},
            'about': {'@id': ORG_ID}, 'inLanguage': 'en',
            'primaryImageOfPage': {'@type': 'ImageObject', 'url': image}}
    if kind != 'home':
        node['breadcrumb'] = {'@id': url + '#breadcrumb'}
    node.update(extra or {})
    return node


def faq_node(page_html, url):
    start = page_html.find('faq-acc')
    pairs = re.findall(r'<h3>(.*?)</h3>.*?<div class="acc-inner">(.*?)</div>', page_html[start:], re.S) if start >= 0 else []
    if not pairs:
        return None
    return {'@type': 'FAQPage', '@id': url + '#faq', 'mainEntity': [
        {'@type': 'Question', 'name': ' '.join(text_of(q)).capitalize(),
         'acceptedAnswer': {'@type': 'Answer', 'text': ' '.join(text_of(a))}} for q, a in pairs]}


def lab_items():
    src = read(os.path.join(ROOT, 'js', 'page-lab.js'))
    rows = re.findall(r"\['([^']+)', '(\w+)', '(V\d+)', ([01]), '([A-Z]{3} \d{2}, \d{4})'\]", src)
    return [(t, cat, v, flag == '0', d) for t, cat, v, flag, d in rows]


LAB_STREAMS = {'web': 'Web motion design', 'motion': 'AI motion imagery', 'commercial': 'Commercial image generation'}


def lab_node(title, cat, slot, still, date):
    """One lab experiment; the lightbox deep-links by #slot. Stills carry their image, loops their video."""
    node = {'@type': 'ImageObject' if still else 'VideoObject', 'name': title.title(),
            'url': abs_url(f'/lab.html#{slot}'), 'genre': LAB_STREAMS.get(cat, cat),
            'uploadDate': datetime.datetime.strptime(date, '%b %d, %Y').date().isoformat(),
            'creator': {'@id': ORG_ID}}
    if still:
        node['contentUrl'] = abs_url(f'/assets/img/{slot}.webp')
    else:
        node['contentUrl'] = abs_url(f'/assets/video/{slot}.mp4')
        node['description'] = f'{title.title()}: a {LAB_STREAMS.get(cat, cat).lower()} loop from UnleeshAI Labs.'
        node['thumbnailUrl'] = abs_url('/assets/og/lab.jpg')
    return node


def ld_script(graph):
    body = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, indent=1)
    return '<script type="application/ld+json">\n' + body.replace('</', '<\\/') + '\n</script>'


# ------------------------------------------------------------------ head block
STRIP = [
    r'[ \t]*<!-- seo:start -->.*?<!-- seo:end -->\n?',
    r'[ \t]*<title>.*?</title>\n?',
    r'[ \t]*<meta name="description"[^>]*>\n?',
    r'[ \t]*<meta property="og:[^>]*>\n?',
    r'[ \t]*<link rel="icon"[^>]*>\n?',
]


def head_block(p):
    url, img = abs_url(p['path']), abs_url('/' + p['og'])
    og_type = 'article' if p.get('article') else 'website'
    lines = [
        f'<title>{attr(p["title"])}</title>',
        f'<meta name="description" content="{attr(p["desc"])}">',
        f'<link rel="canonical" href="{url}">' if 'noindex' not in p.get('robots', '') else '<!-- no canonical on a noindex page -->',
        f'<meta name="robots" content="{p.get("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1")}">',
        f'<meta name="author" content="{SITE["name"]}">',
        f'<meta property="og:type" content="{og_type}">',
        f'<meta property="og:site_name" content="{SITE["name"]}">',
        f'<meta property="og:locale" content="{SITE["locale"]}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:title" content="{attr(p["title"])}">',
        f'<meta property="og:description" content="{attr(p["desc"])}">',
        f'<meta property="og:image" content="{img}">',
        f'<meta property="og:image:width" content="{OG_W}">',
        f'<meta property="og:image:height" content="{OG_H}">',
        f'<meta property="og:image:alt" content="{attr(p["img_alt"])}">',
    ]
    if p.get('article'):
        a = p['article']
        lines += [f'<meta property="article:published_time" content="{a["date"]}">',
                  f'<meta property="article:section" content="{attr(a["section"])}">']
    lines += [
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{attr(p["title"])}">',
        f'<meta name="twitter:description" content="{attr(p["desc"])}">',
        f'<meta name="twitter:image" content="{img}">',
        '<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">',
        '<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32.png">',
        '<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">',
        '<link rel="manifest" href="/site.webmanifest">',
        '<link rel="sitemap" type="application/xml" href="/sitemap.xml">',
        '<link rel="alternate" type="text/plain" title="LLM summary" href="/llms.txt">',
        # base.css hides <main> until the JS chrome mounts; without JS the content must still show
        '<noscript><style>html body:not(.chrome-ready) main { visibility: visible; }</style></noscript>',
    ]
    if p.get('graph'):
        lines.append(ld_script(p['graph']))
    inner = '\n'.join('  ' + ln if not ln.startswith(('{', '}', ' "', '</script')) else ln for ln in lines)
    return '  <!-- seo:start -->\n' + inner + '\n  <!-- seo:end -->\n'


def apply_head(filename, p):
    path = os.path.join(ROOT, filename)
    s = read(path)
    for pat in STRIP:
        s = re.sub(pat, '', s, flags=re.S)
    anchor = re.search(r'<meta name="viewport"[^>]*>\n', s)
    s = s[:anchor.end()] + head_block(p) + s[anchor.end():]
    write(path, s)


# ------------------------------------------------------------------ pages
def static_pages(projects, articles):
    pages = []
    for filename, m in STATIC.items():
        url = abs_url(m['path'])
        og = og_image(m['img'], filename[:-5])
        graph = [org_node(), website_node()]
        extra = {}
        if filename == 'work.html':
            live = live_sites()
            shipped = [{'@type': 'ListItem', 'position': i, 'item': {
                '@type': 'WebSite', 'name': s['title'], 'url': s['url'], 'description': s['desc'],
                'genre': s['sector'], 'creator': {'@id': ORG_ID},
                'image': abs_url(f'/assets/img/live/{s["slug"]}-desk.webp')}}
                for i, s in enumerate(live, 1)]
            concepts = [{'@type': 'ListItem', 'position': len(live) + i, 'url': abs_url(f'/work_{p["slug"]}.html'),
                         'name': p['title'].title()} for i, p in enumerate(projects, 1)]
            extra['mainEntity'] = {'@type': 'ItemList', 'numberOfItems': len(shipped) + len(concepts),
                                   'itemListElement': shipped + concepts}
        if filename == 'blog.html':
            extra['blogPost'] = [{'@id': abs_url(f'/journal_{a["slug"]}.html') + '#article'} for a in articles]
            extra['publisher'] = {'@id': ORG_ID}
        if filename == 'lab.html':
            items = lab_items()
            extra['mainEntity'] = {'@type': 'ItemList', 'numberOfItems': len(items), 'itemListElement': [
                {'@type': 'ListItem', 'position': i, 'item': lab_node(t, cat, v, still, d)}
                for i, (t, cat, v, still, d) in enumerate(items, 1)]}
        graph.append(page_node(m['kind'], url, m['title'], m['desc'], abs_url('/' + og), extra))
        if m['kind'] != 'home':
            graph.append(crumbs(url, [(m['crumb'], m['path'])]))
        if filename == 'contact.html':
            faq = faq_node(read(os.path.join(ROOT, filename)), url)
            if faq:
                graph.append(faq)
        pages.append((filename, dict(m, og=og, graph=graph, img_alt=m.get('img_alt') or f'{SITE["wordmark"]}: {m["crumb"] if m["kind"] != "home" else "studio"}')))
    return pages


def case_pages(projects):
    pages = []
    for p in projects:
        filename, path = f'work_{p["slug"]}.html', f'/work_{p["slug"]}.html'
        url, name = abs_url(path), p['title'].title()
        og = og_image(p['banner'], f'work_{p["slug"]}')
        title = f'{name}: {p["type"]} Concept | UnleeshAI'
        desc = clip(f'{p["line"]} A studio concept by UnleeshAI.')
        work = {'@type': 'CreativeWork', '@id': url + '#work', 'name': name, 'headline': p['line'],
                'description': f'{p["ov1"]} {p["result"]}', 'genre': p['type'],
                'keywords': ', '.join(p['services']), 'creator': {'@id': ORG_ID},
                'image': abs_url('/' + og), 'dateCreated': '2026', 'inLanguage': 'en',
                'creativeWorkStatus': 'Concept', 'mainEntityOfPage': {'@id': url + '#webpage'}}
        graph = [org_node(), website_node(),
                 page_node('WebPage', url, title, desc, abs_url('/' + og), {'mainEntity': {'@id': url + '#work'}}),
                 work, crumbs(url, [('Work', '/work.html'), (name, path)])]
        pages.append((filename, dict(path=path, title=title, desc=desc, og=og, graph=graph,
                                     img_alt=f'{name}: {p["type"]} concept by {SITE["wordmark"]}')))
    return pages


def article_pages(articles):
    pages = []
    for a in articles:
        filename, path = f'journal_{a["slug"]}.html', f'/journal_{a["slug"]}.html'
        url = abs_url(path)
        og = og_image(a['img'], f'journal_{a["slug"]}')
        title = a['title'] if len(a['title']) > 52 else f'{a["title"]} | UnleeshAI'
        desc = clip(a['deck'])
        words = sum(len(b.split()) for b in a['body'])
        post = {'@type': 'BlogPosting', '@id': url + '#article', 'headline': a['title'], 'description': a['deck'],
                'datePublished': iso(a['date']), 'dateModified': iso(a['date']), 'articleSection': a['cat'],
                'wordCount': words, 'timeRequired': f'PT{a["read"].split()[0]}M', 'inLanguage': 'en',
                'image': abs_url('/' + og), 'author': {'@id': ORG_ID}, 'publisher': {'@id': ORG_ID},
                'isPartOf': {'@id': abs_url('/blog.html') + '#webpage'},
                'mainEntityOfPage': {'@id': url + '#webpage'}}
        graph = [org_node(), website_node(), page_node('WebPage', url, title, desc, abs_url('/' + og)), post,
                 crumbs(url, [('Journal', '/blog.html'), (a['title'], path)])]
        pages.append((filename, dict(path=path, title=title, desc=desc, og=og, graph=graph,
                                     img_alt=a['title'], article={'date': iso(a['date']), 'section': a['cat']})))
    return pages


def not_found_page():
    return ('404.html', dict(path='/404.html', title='Page not found | UnleeshAI',
                             desc='This page does not exist. Head back to the UnleeshAI home page, the work or the journal.',
                             og='assets/og/index.jpg', robots='noindex, follow', img_alt='UNLEESH studio', graph=None))


# ------------------------------------------------------------------ site files
def sitemap(pages, articles):
    dates = {f'journal_{a["slug"]}.html': iso(a['date']) for a in articles}
    prio = {'index.html': '1.0', 'work.html': '0.9', 'about.html': '0.8', 'contact.html': '0.8',
            'blog.html': '0.7', 'lab.html': '0.6'}
    rows = []
    for filename, p in pages:
        if 'noindex' in p.get('robots', ''):
            continue
        pr = prio.get(filename, '0.6' if filename.startswith('work_') else '0.5')
        rows.append(f'  <url>\n    <loc>{abs_url(p["path"])}</loc>\n    <lastmod>{dates.get(filename, TODAY)}</lastmod>\n'
                    f'    <priority>{pr}</priority>\n    <image:image><image:loc>{abs_url("/" + p["og"])}</image:loc></image:image>\n  </url>')
    write(os.path.join(ROOT, 'sitemap.xml'),
          '<?xml version="1.0" encoding="UTF-8"?>\n'
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
          'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' + '\n'.join(rows) + '\n</urlset>\n')


AI_AGENTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
             'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'CCBot']


def robots():
    ai = '\n\n'.join(f'User-agent: {a}\nAllow: /' for a in AI_AGENTS)
    write(os.path.join(ROOT, 'robots.txt'),
          '# UnleeshAI: search engines and AI answer engines are welcome to crawl and cite this site.\n'
          'User-agent: *\nAllow: /\nDisallow: /tools/\nDisallow: /docs/\nDisallow: /assets/raw/\nDisallow: /assets/raw-tech/\n\n'
          f'{ai}\n\nSitemap: {SITE["url"]}/sitemap.xml\n')


def live_sites():
    """Shipped client sites shown at the top of the Work page (tools/live.json)."""
    path = os.path.join(HERE, 'live.json')
    return json.loads(read(path)) if os.path.exists(path) else []


def llms(projects, articles):
    u = SITE['url']
    lines = [f'# {SITE["name"]} ({SITE["wordmark"]})', '', f'> {SITE["summary"]}', '',
             f'- Website: {u}/', f'- Email: {SITE["email"]}',
             (f'- Location: {SITE["city"]}, {SITE["region"]}, USA' if SITE['city']
              else f'- Location: Remote studio, serving clients across the {SITE["area_served"]}'),
             f'- Founded: {SITE["founded"]}',
             '- Services: ' + ', '.join(SITE['services']),
             '- Typical project: 2 to 4 days from agreed brief to launch (3 on average), fixed-price quote once requirements are known',
             '- Pricing: a five-page website starts at $499',
             '- Portfolio note: the live websites listed below are real shipped client sites; the ten case studies '
             'are self-initiated studio concept projects, not client commissions',
             '', '## Main pages', '']
    for filename, m in STATIC.items():
        lines.append(f'- [{m["title"]}]({u}{m["path"]}): {m["desc"]}')
    lines += ['', '## Live websites built by the studio', '']
    lines += [f'- [{s["title"]}]({s["url"]}): {s["sector"]}. {s["desc"]}' for s in live_sites()]
    lines += ['', '## Concept case studies', '']
    lines += [f'- [{p["title"].title()}]({u}/work_{p["slug"]}.html): {p["type"]}. {p["line"]}' for p in projects]
    lines += ['', '## Journal', '']
    lines += [f'- [{a["title"]}]({u}/journal_{a["slug"]}.html) ({iso(a["date"])}, {a["cat"]}): {a["deck"]}' for a in articles]
    lines += ['', '## Optional', '', f'- [Full text of the journal and case studies]({u}/llms-full.txt)', '']
    write(os.path.join(ROOT, 'llms.txt'), '\n'.join(lines))

    full = [f'# {SITE["name"]}: full text', '', SITE['summary'], '']
    for p in projects:
        full += [f'## Case study: {p["title"].title()} ({p["type"]}, studio concept)', f'URL: {u}/work_{p["slug"]}.html', '',
                 p['line'], '', f'Premise: {p["ov1"]}', '', f'Concept: {p["result"]}', '',
                 f'Scope explored: {", ".join(p["services"])}. Proposed stack: {p["stack"]}.', '']
    for a in articles:
        full += [f'## {a["title"]}', f'URL: {u}/journal_{a["slug"]}.html', f'Published: {iso(a["date"])} · {a["cat"]}', '',
                 a['deck'], ''] + [b + '\n' for b in a['body']]
    write(os.path.join(ROOT, 'llms-full.txt'), '\n'.join(full))


def manifest():
    write(os.path.join(ROOT, 'site.webmanifest'), json.dumps({
        'name': SITE['name'], 'short_name': SITE['wordmark'], 'start_url': '/', 'display': 'standalone',
        'background_color': '#030303', 'theme_color': '#030303',
        'icons': [{'src': 'assets/icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
                  {'src': 'assets/icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png'}],
    }, indent=2) + '\n')


def main():
    projects = json.loads(read(os.path.join(HERE, 'projects.json')))
    articles = json.loads(read(os.path.join(HERE, 'journal.json')))
    build_icons()
    pages = static_pages(projects, articles) + case_pages(projects) + article_pages(articles)
    if os.path.exists(os.path.join(ROOT, '404.html')):
        pages.append(not_found_page())
    for filename, p in pages:
        apply_head(filename, p)
    sitemap(pages, articles)
    robots()
    llms(projects, articles)
    manifest()
    print(f'seo: {len(pages)} pages, sitemap, robots.txt, llms.txt, llms-full.txt, manifest')


if __name__ == '__main__':
    main()
