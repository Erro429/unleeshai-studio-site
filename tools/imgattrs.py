#!/usr/bin/env python3
"""Image attributes for every page: intrinsic width/height, and alt text for content images.

  - width/height come from the file itself, so the browser can reserve the space before the image loads.
    css/base.css sets img { height: auto }, so the attributes only supply the aspect ratio.
  - alt text comes from tools/alt.json (image id -> what the picture shows). It is applied where a page
    left alt empty, except on images that are pure backdrop behind text (hero plates, "next" panels,
    the featured-card thumbnail), which stay empty on purpose so screen readers skip them.

Idempotent. Runs last in tools/build.py, or on its own: python tools/imgattrs.py
"""
import glob
import html
import io
import json
import os
import re

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BACKDROP = ('in-plate', 'ar-next-media', 'pj-next-media', 'bf-media', 'hero-layer')
IMG = re.compile(r'<img\b[^>]*>')
SRC = re.compile(r'\bsrc="(assets/[^"?]+)')
_size = {}


def size(rel):
    if rel not in _size:
        path = os.path.join(ROOT, rel)
        _size[rel] = Image.open(path).size if os.path.exists(path) else None
    return _size[rel]


def main():
    alt = json.load(io.open(os.path.join(HERE, 'alt.json'), encoding='utf-8'))
    sized = described = 0
    for path in sorted(glob.glob(os.path.join(ROOT, '*.html'))):
        s = io.open(path, encoding='utf-8', newline='').read()

        def fix(m):
            nonlocal sized, described
            tag = m.group(0)
            src = SRC.search(tag)
            if not src:
                return tag
            rel = src.group(1)
            if 'alt=""' in tag:
                wrappers = re.findall(r'class="([^"]*)"', s[max(0, m.start() - 160):m.start()])
                backdrop = bool(wrappers) and any(b in wrappers[-1] for b in BACKDROP)
                key = os.path.splitext(os.path.basename(rel))[0]
                if key in alt and not backdrop:
                    tag = tag.replace('alt=""', f'alt="{html.escape(alt[key], quote=True)}"')
                    described += 1
            if ' width=' not in tag and size(rel):
                w, h = size(rel)
                tag = tag[:-1].rstrip('/').rstrip() + f' width="{w}" height="{h}">'
                sized += 1
            return tag

        out = IMG.sub(fix, s)
        if out != s:
            io.open(path, 'w', encoding='utf-8', newline='').write(out)
    print(f'imgattrs: {sized} images sized, {described} described')


if __name__ == '__main__':
    main()
