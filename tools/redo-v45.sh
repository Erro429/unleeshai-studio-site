#!/usr/bin/env bash
# V45M rendered the style line's "#030303" as on-screen text; re-roll without any hex code, then re-animate V45V.
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"; ROOT="$DIR/.."; RAW="$ROOT/assets/raw-tech"; LOG="$DIR/gen-tech.log"; VID="$ROOT/assets/video"
STYLE="Near-black studio environment, deep charcoal background, single soft directional key light from upper left, deep controlled shadows, matte black glass and satin metal materials, one restrained accent of cold ice-blue light, no glare, high dynamic range, subtle fine film grain, editorial technology-photography composition, cinematic 50mm lens, shallow depth of field, ultra-detailed, photoreal, 8k, no logos, no watermark, no captions, no overlaid text anywhere outside the device screen. On-screen interface text must be English Latin letters only, never Chinese, Japanese or Korean characters."
VIDSUF="Slow continuous camera drift, 2 percent push-in, motion so subtle it reads as breathing, seamless loop, first and last frame identical, no cuts, no flicker, 24fps."
jid() { grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1; }
url_of() { local r; r=$(higgsfield generate wait "$1" --timeout 40m --quiet --json 2>&1); local u=$(echo "$r" | grep -o '"result_url": *"[^"]*"' | head -1 | cut -d'"' -f4); [ -z "$u" ] && u=$(higgsfield generate get "$1" --json 2>&1 | grep -o '"result_url": *"[^"]*"' | head -1 | cut -d'"' -f4); echo "$u"; }
J=$(higgsfield generate create seedream_v4_5 --prompt "$STYLE Device mockup: a laptop on dark wood beside a black ceramic ramen bowl with steam, screen showing a dark noodle bar website with English headings, overhead angle, screen content mostly abstract." --aspect_ratio 16:9 --quality high --json 2>&1 | jid)
[ -z "$J" ] && { echo "V45-REDO CREATE-FAIL" >> "$LOG"; exit 1; }
echo "V45-REDO CREATED $J" >> "$LOG"
U=$(url_of "$J"); [ -z "$U" ] && { echo "V45-REDO NO-URL" >> "$LOG"; exit 1; }
rm -f "$RAW/V45M".*; curl -sL "$U" -o "$RAW/V45M.png" && ffmpeg -y -loglevel error -i "$RAW/V45M.png" -vf "scale='min(1920,iw)':-2" -c:v libwebp -quality 82 "$ROOT/assets/img/V45M.webp" && echo "V45-REDO STILL DONE" >> "$LOG"
J=$(higgsfield generate create kling2_6 --prompt "Steam rises slowly from the ramen bowl beside the laptop. The scene comes gently alive: the device screen glows and its interface shimmers faintly, reflections slide across the glass, dust motes drift in the light. $VIDSUF No text overlays." --aspect_ratio 16:9 --duration 5 --sound false --start-image "$RAW/V45M.png" --json 2>&1 | jid)
[ -z "$J" ] && { echo "V45-REDO LOOP CREATE-FAIL" >> "$LOG"; exit 1; }
echo "V45-REDO LOOP CREATED $J" >> "$LOG"
U=$(url_of "$J"); [ -z "$U" ] && { echo "V45-REDO LOOP NO-URL" >> "$LOG"; exit 1; }
curl -sL "$U" -o "$RAW/V45V.mp4" && ffmpeg -y -loglevel error -i "$RAW/V45V.mp4" -an -c:v libx264 -crf 21 -preset medium -vf "scale='min(1600,iw)':-2" -pix_fmt yuv420p -movflags +faststart "$VID/V45V.mp4" && echo "V45-REDO COMPLETE" >> "$LOG" || echo "V45-REDO LOOP FAIL" >> "$LOG"
