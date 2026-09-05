#!/usr/bin/env bash
# V01 hero/preloader loop: the first kling job sat in "queued" for 30+ min while
# every later one completed, so recreate it and wait for the replacement.
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"; ROOT="$DIR/.."; RAW="$ROOT/assets/raw-tech"; LOG="$DIR/gen-tech.log"
STYLE="Near-black studio environment, background #030303, single soft directional key light from upper left, deep controlled shadows, matte black glass and satin metal materials, one restrained accent of cold ice-blue light, no glare, high dynamic range, subtle fine film grain, editorial technology-photography composition, generous negative space, cinematic 50mm lens, shallow depth of field, colour palette restrained to charcoal, graphite, bone-white and ice-blue, ultra-detailed, photoreal, 8k, no text, no letters, no logos, no watermark, no people unless stated."
VIDSUF="Slow continuous camera drift, 2 percent push-in, motion so subtle it reads as breathing, seamless loop, first and last frame identical, no cuts, no flicker, 24fps."
P="Macro of a black liquid-glass surface slowly folding over itself, thin threads of electric ice-blue light flowing under the glass like data through fibre, one white highlight, seamless loop."
J=$(higgsfield generate create kling2_6 --prompt "$STYLE $P $VIDSUF" --aspect_ratio 1:1 --duration 5 --sound false --json 2>&1 | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)
[ -z "$J" ] && { echo "REDO-V01 CREATE-FAIL" >> "$LOG"; exit 1; }
echo "REDO-V01 CREATED $J" >> "$LOG"
URL=$(higgsfield generate wait "$J" --timeout 40m --quiet --json 2>&1 | grep -o '"result_url": *"[^"]*"' | head -1 | cut -d'"' -f4)
[ -z "$URL" ] && { echo "REDO-V01 NO-URL ($J)" >> "$LOG"; exit 1; }
curl -sL "$URL" -o "$RAW/V01.mp4" \
  && ffmpeg -y -loglevel error -i "$RAW/V01.mp4" -an -c:v libx264 -crf 23 -preset medium -vf "scale='min(1280,iw)':-2" -pix_fmt yuv420p -movflags +faststart "$ROOT/assets/video/V01.mp4" \
  && echo "REDO-V01 DONE" >> "$LOG" || echo "REDO-V01 FAIL" >> "$LOG"
