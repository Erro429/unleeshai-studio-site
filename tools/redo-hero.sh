#!/usr/bin/env bash
# Re-roll the two mockups that rendered CJK screen text (V42M, V45M), then build
# the four hero carousel loops (V40V from its already-running job, the rest i2v).
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"; ROOT="$DIR/.."; RAW="$ROOT/assets/raw-tech"; LOG="$DIR/gen-tech.log"; VID="$ROOT/assets/video"
STYLE="Near-black studio environment, background #030303, single soft directional key light from upper left, deep controlled shadows, matte black glass and satin metal materials, one restrained accent of cold ice-blue light, no glare, high dynamic range, subtle fine film grain, editorial technology-photography composition, generous negative space, cinematic 50mm lens, shallow depth of field, colour palette restrained to charcoal, graphite, bone-white and ice-blue, ultra-detailed, photoreal, 8k, no logos, no watermark, no people unless stated. Any on-screen interface text must be English Latin letters only, never Chinese, Japanese or Korean characters."
VIDSUF="Slow continuous camera drift, 2 percent push-in, motion so subtle it reads as breathing, seamless loop, first and last frame identical, no cuts, no flicker, 24fps."
HSUF="The scene comes gently alive: the device screen glows and its interface shimmers faintly, reflections slide across the glass, dust motes drift in the light. $VIDSUF No text overlays."
jid() { grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1; }
url_of() { higgsfield generate wait "$1" --timeout 40m --quiet --json 2>&1 | grep -o '"result_url": *"[^"]*"' | head -1 | cut -d'"' -f4; }
still() { # id prompt
  local J=$(higgsfield generate create seedream_v4_5 --prompt "$STYLE $2" --aspect_ratio 16:9 --quality high --json 2>&1 | jid)
  [ -z "$J" ] && { echo "HERO2-$1 CREATE-FAIL" >> "$LOG"; return 1; }
  echo "HERO2-$1 CREATED $J" >> "$LOG"
  local U=$(url_of "$J"); [ -z "$U" ] && { echo "HERO2-$1 NO-URL" >> "$LOG"; return 1; }
  rm -f "$RAW/$1".*; curl -sL "$U" -o "$RAW/$1.png" \
    && ffmpeg -y -loglevel error -i "$RAW/$1.png" -vf "scale='min(1920,iw)':-2" -c:v libwebp -quality 82 "$ROOT/assets/img/$1.webp" \
    && echo "HERO2-$1 DONE" >> "$LOG"
}
loop() { # id jobid
  local U=$(url_of "$2"); [ -z "$U" ] && { echo "HERO2-$1 NO-URL" >> "$LOG"; return 1; }
  curl -sL "$U" -o "$RAW/$1.mp4" \
    && ffmpeg -y -loglevel error -i "$RAW/$1.mp4" -an -c:v libx264 -crf 21 -preset medium -vf "scale='min(1600,iw)':-2" -pix_fmt yuv420p -movflags +faststart "$VID/$1.mp4" \
    && echo "HERO2-$1 DONE" >> "$LOG" || echo "HERO2-$1 FAIL" >> "$LOG"
}
i2v() { # id src prompt
  local J=$(higgsfield generate create kling2_6 --prompt "$3" --aspect_ratio 16:9 --duration 5 --sound false --start-image "$RAW/$2.png" --json 2>&1 | jid)
  [ -z "$J" ] && { echo "HERO2-$1 CREATE-FAIL" >> "$LOG"; return 1; }
  echo "HERO2-$1 CREATED $J" >> "$LOG"; loop "$1" "$J"
}
# V40V is already rendering from the original batch; V46M is clean, so start it now
loop V40V c2972b66-07f9-4c33-84fb-0f0d226a24a2 &
i2v V46V V46M "Cool reflections slide across the polished steel parts around the phone. $HSUF" &
# re-roll the two CJK mockups, then animate them
( still V42M "Device mockup: a tablet propped on a mossy stone at blue hour near a glowing canvas tent, screen showing a dark outdoor gear website with English headings, screen content abstract and mostly unreadable." \
  && i2v V42V V42M "The tent canvas breathes with warm lantern light behind the tablet, grass sways faintly. $HSUF" ) &
( still V45M "Device mockup: a laptop on dark wood beside a black ceramic ramen bowl with steam, screen showing a dark noodle bar website with English headings, overhead angle, screen content abstract and mostly unreadable." \
  && i2v V45V V45M "Steam rises slowly from the ramen bowl beside the laptop. $HSUF" ) &
wait
echo "HERO2 COMPLETE" >> "$LOG"
