#!/usr/bin/env python3
"""Generate the data-driven pages from the JSON sources in tools/.

  work.html            <- tools/work-template.html    + tools/projects.json
  work_<slug>.html     <- tools/detail-template.html  + tools/projects.json
  blog.html            <- tools/journal-template.html + tools/journal.json
  journal_<slug>.html  <- tools/article-template.html + tools/journal.json

Run from anywhere: python tools/build.py
"""
import html
import io
import json
import os

import seo

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
V = '?v=2'


def read(name):
    with io.open(os.path.join(HERE, name), encoding='utf-8') as f:
        return f.read()


def write(name, text):
    with io.open(os.path.join(ROOT, name), 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)
    print('built', name)


def fill(template, mapping):
    out = template
    for key, val in mapping.items():
        out = out.replace('%%' + key + '%%', str(val))
    return out


def esc(s):
    return html.escape(s, quote=True)


# ---------------------------------------------------------------- work
def work_card(p, i, n):
    pair, side = divmod(i, 2)
    wide = (side == 0) if pair % 2 == 0 else (side == 1)
    if pair % 2 == 0:
        col = '1 / 8' if wide else '8 / 13'
    else:
        col = '6 / 13' if wide else '1 / 6'
    kind = 'is-wide' if wide else 'is-tall'
    loop = p.get('loop')
    video = (f'<video src="assets/video/{loop}.mp4{V}" muted loop playsinline preload="none"></video>' if loop else '')
    return (
        f'        <a class="wk-card {kind}" id="case-{p["slug"]}" href="work_{p["slug"]}.html" '
        f'style="--col: {col}" data-cursor-label="VIEW" data-idx="{i}">\n'
        f'          <div class="wk-media reveal-img"><img src="assets/img/{p["img"]}.webp{V}" alt="{esc(p["title"])}" loading="{"eager" if i < 2 else "lazy"}">{video}</div>\n'
        f'          <div class="wk-meta">\n'
        f'            <span class="wk-idx tabular">{i + 1:02d} <em>//</em> {n:02d}</span>\n'
        f'            <h2 class="wk-title display">{esc(p["title"])}</h2>\n'
        f'            <p class="wk-sub">{esc(p["sub"])}</p>\n'
        f'            <span class="wk-tags bracket-label">( {esc(p["type"])} · 2026 {p["quarter"]} )</span>\n'
        f'          </div>\n'
        f'        </a>'
    )


def work_row(p, i, n):
    return (
        f'        <a class="wk-row" href="work_{p["slug"]}.html" data-img="{p["img"]}" data-cursor-label="VIEW">'
        f'<span class="idx tabular">{i + 1:02d}</span>'
        f'<h2 class="display">{esc(p["title"])}</h2>'
        f'<span class="sector">{esc(p["type"])}</span>'
        f'<span class="year tabular">2026 {p["quarter"]}</span>'
        f'<svg class="in-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 12h16M13 5l7 7-7 7"/></svg>'
        f'</a>'
    )


def strip_thumb(p, i):
    return (
        f'<a class="wk-thumb" href="#case-{p["slug"]}" data-i="{i}" data-title="{esc(p["title"])}" aria-label="{esc(p["title"])}">'
        f'<img src="assets/img/{p["img"]}.webp{V}" alt=""></a>'
    )


ARROW_OUT = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" '
             'stroke-linecap="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>')


def live_card(site, i, n):
    """One shipped site: desktop capture in a browser frame, phone capture on top, link to the live URL."""
    s, title = site['slug'], esc(site['title'])
    chips = ''.join(f'<li>{esc(b)}</li>' for b in site['built'])
    return (
        f'        <article class="lv-card">\n'
        f'          <a class="lv-frame" href="{site["url"]}" target="_blank" rel="noopener" data-cursor-label="VISIT" '
        f'aria-label="Open the live site: {title} ({esc(site["host"])}), opens in a new tab">\n'
        f'            <span class="lv-bar" aria-hidden="true"><i></i><i></i><i></i><span class="lv-url mono">{esc(site["host"])}</span></span>\n'
        f'            <img class="lv-desk" src="assets/img/live/{s}-desk.webp{V}" width="1440" height="900" '
        f'alt="{title}: desktop home screen" loading="lazy">\n'
        f'            <img class="lv-mob" src="assets/img/live/{s}-mob.webp{V}" width="600" height="1298" '
        f'alt="{title}: phone view" loading="lazy">\n'
        f'          </a>\n'
        f'          <div class="lv-meta">\n'
        f'            <span class="lv-idx tabular">{i + 1:02d} <em>//</em> {n:02d}</span>\n'
        f'            <h3 class="lv-title display">{title}</h3>\n'
        f'            <span class="bracket-label">( {esc(site["sector"])} · Live )</span>\n'
        f'            <p class="lv-desc">{esc(site["desc"])}</p>\n'
        f'            <ul class="lv-chips">{chips}</ul>\n'
        f'            <a class="lv-link mono" href="{site["url"]}" target="_blank" rel="noopener" data-roll>Visit live site {ARROW_OUT}</a>\n'
        f'          </div>\n'
        f'        </article>'
    )


def build_work(projects, live):
    n = len(projects)
    sectors = len({p['type'] for p in projects})
    tpl = read('work-template.html')
    write('work.html', fill(tpl, {
        'COUNT': n,
        'SECTORS': sectors,
        'FIRST_TITLE': esc(projects[0]['title']),
        'LIVE': '\n'.join(live_card(s, i, len(live)) for i, s in enumerate(live)),
        'STRIP': ''.join(strip_thumb(p, i) for i, p in enumerate(projects)),
        'GRID': '\n'.join(work_card(p, i, n) for i, p in enumerate(projects)),
        'LIST': '\n'.join(work_row(p, i, n) for i, p in enumerate(projects)),
    }))


def build_details(projects):
    n = len(projects)
    tpl = read('detail-template.html')
    for i, p in enumerate(projects):
        prev_p = projects[(i - 1) % n]
        next_p = projects[(i + 1) % n]
        m = {
            'SLUG': p['slug'], 'TITLE': esc(p['title']), 'BANNER': p['banner'],
            'TYPE': esc(p['type']), 'QUARTER': p['quarter'], 'WEEKS': p['weeks'],
            'LINE': esc(p['line']), 'OVERVIEW1': esc(p['ov1']), 'RESULT': esc(p['result']),
            'SERVICES_LI': ''.join(f'<li>{esc(s)}</li>' for s in p['services']),
            'STACK': esc(p['stack']),
            'INDEX': f'{i + 1:02d}', 'COUNT': f'{n:02d}',
            'PREV': f'work_{prev_p["slug"]}.html', 'PREV_TITLE': esc(prev_p['title']),
            'NEXT': f'work_{next_p["slug"]}.html', 'NEXT_TITLE': esc(next_p['title']),
            'NEXT_BANNER': next_p['banner'], 'NEXT_TYPE': esc(next_p['type']),
            'NEXT_INDEX': f'{((i + 1) % n) + 1:02d}',
        }
        for k, still in enumerate(p['stills'], 1):
            m[f'S{k}'] = still
        write(f'work_{p["slug"]}.html', fill(tpl, m))


# ---------------------------------------------------------------- journal
def journal_row(a, i):
    return (
        f'      <a class="bl-row" href="journal_{a["slug"]}.html" data-img="{a["img"]}" data-cursor-label="READ">'
        f'<span class="b-date tabular">{a["date"]}</span>'
        f'<span class="b-cat">{esc(a["cat"])}</span>'
        f'<span class="b-title">{esc(a["title"])}</span>'
        f'<span class="b-read">{a["read"]}</span>'
        f'<span class="b-arr"><svg class="in-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 12h16M13 5l7 7-7 7"/></svg></span>'
        f'</a>'
    )


def build_journal(articles):
    n = len(articles)
    first = articles[0]
    cats = sorted({a['cat'] for a in articles})
    tpl = read('journal-template.html')
    write('blog.html', fill(tpl, {
        'COUNT': n,
        'CATS': len(cats),
        'CAT_LI': ''.join(f'<li>{esc(c)}</li>' for c in cats),
        'FEAT_SLUG': first['slug'], 'FEAT_IMG': first['img'], 'FEAT_DATE': first['date'],
        'FEAT_CAT': esc(first['cat']), 'FEAT_TITLE': esc(first['title']), 'FEAT_DECK': esc(first['deck']),
        'FEAT_READ': first['read'],
        'ROWS': '\n'.join(journal_row(a, i) for i, a in enumerate(articles)),
    }))


def build_articles(articles):
    n = len(articles)
    tpl = read('article-template.html')
    for i, a in enumerate(articles):
        nxt = articles[(i + 1) % n]
        prv = articles[(i - 1) % n]
        paras = a['body']
        body_html = ''
        for k, para in enumerate(paras):
            cls = ' class="ar-lead"' if k == 0 else ''
            body_html += f'      <p{cls}>{esc(para)}</p>\n'
            if k == 1:
                body_html += f'      <blockquote class="ar-pull" data-reveal-lines>{esc(a["pull"])}</blockquote>\n'
            if k == 2:
                body_html += (f'      <figure class="ar-fig reveal-img"><img src="assets/img/{a["fig"]}.webp{V}" alt="{esc(a["cat"])} illustration for {esc(a["title"])}" loading="lazy">'
                              f'<figcaption class="bracket-label">( Fig. 01 · {esc(a["cat"])} )</figcaption></figure>\n')
        write(f'journal_{a["slug"]}.html', fill(tpl, {
            'SLUG': a['slug'], 'TITLE': esc(a['title']), 'DECK': esc(a['deck']), 'DATE': a['date'],
            'CAT': esc(a['cat']), 'READ': a['read'], 'IMG': a['img'], 'BODY': body_html,
            'INDEX': f'{i + 1:02d}', 'COUNT': f'{n:02d}',
            'NEXT': f'journal_{nxt["slug"]}.html', 'NEXT_TITLE': esc(nxt['title']), 'NEXT_IMG': nxt['img'],
            'NEXT_DATE': nxt['date'], 'NEXT_CAT': esc(nxt['cat']),
            'PREV': f'journal_{prv["slug"]}.html', 'PREV_TITLE': esc(prv['title']),
        }))


def main():
    projects = json.loads(read('projects.json'))
    articles = json.loads(read('journal.json'))
    live = json.loads(read('live.json'))
    build_work(projects, live)
    build_details(projects)
    if os.path.exists(os.path.join(HERE, 'journal-template.html')):
        build_journal(articles)
    if os.path.exists(os.path.join(HERE, 'article-template.html')):
        build_articles(articles)
    seo.main()  # head tags, JSON-LD, sitemap, robots, llms.txt: always last


if __name__ == '__main__':
    main()
