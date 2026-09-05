#!/usr/bin/env bash
# Re-roll V19 (dot grid, no product), V21 (particle swirl, no device), V66 (speaker, no label).
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"; ROOT="$DIR/.."; RAW="$ROOT/assets/raw-tech"; LOG="$DIR/gen-tech.log"
STYLE="Near-black studio environment, background #030303, single soft directional key light from upper left, deep controlled shadows, matte black glass and satin metal materials, one restrained accent of cold ice-blue light, no glare, high dynamic range, subtle fine film grain, editorial technology-photography composition, generous negative space, cinematic 50mm lens, shallow depth of field, colour palette restrained to charcoal, graphite, bone-white and ice-blue, ultra-detailed, photoreal, 8k, no text, no letters, no logos, no watermark, no people, no products."
VIDSUF="Slow continuous camera drift, 2 percent push-in, motion so subtle it reads as breathing, seamless loop, first and last frame identical, no cuts, no flicker, 24fps."
gen() { # id model args prompt ext
  local ID=$1 MODEL=$2 ARGS=$3 PROMPT=$4 EXT=$5
  local J=$(higgsfield generate create "$MODEL" --prompt "$PROMPT" $ARGS --json 2>&1 | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)
  [ -z "$J" ] && { echo "REDO-$ID CREATE-FAIL" >> "$LOG"; return; }
  echo "REDO-$ID CREATED $J" >> "$LOG"
  local URL=$(higgsfield generate wait "$J" --timeout 40m --quiet --json 2>&1 | grep -o '"result_url": *"[^"]*"' | head -1 | cut -d'"' -f4)
  [ -z "$URL" ] && { echo "REDO-$ID NO-URL ($J)" >> "$LOG"; return; }
  rm -f "$RAW/$ID".*
  curl -sL "$URL" -o "$RAW/$ID.$EXT" || { echo "REDO-$ID DL-FAIL" >> "$LOG"; return; }
  if [ "$EXT" = mp4 ]; then
    ffmpeg -y -loglevel error -i "$RAW/$ID.mp4" -an -c:v libx264 -crf 23 -preset medium -vf "scale='min(1280,iw)':-2" -pix_fmt yuv420p -movflags +faststart "$ROOT/assets/video/$ID.mp4"
  else
    ffmpeg -y -loglevel error -i "$RAW/$ID.$EXT" -vf "scale='min(1920,iw)':-2" -c:v libwebp -quality 82 "$ROOT/assets/img/$ID.webp"
  fi && echo "REDO-$ID DONE" >> "$LOG" || echo "REDO-$ID CONVERT-FAIL" >> "$LOG"
}
gen V66 kling2_6 "--aspect_ratio 1:1 --duration 5 --sound false" "$STYLE A plain matte black cylindrical smart speaker with a completely blank surface spinning slowly, a thin ring of white light pulsing gently at its top rim, black backdrop, absolutely no label, no lettering, no logo. $VIDSUF" mp4 &
gen V19 seedream_v4_5 "--aspect_ratio 1:1 --quality high" "$STYLE Abstract only: a dense field of tiny white dots on a black plane forming a perspective grid that recedes into darkness, a handful of dots glowing ice-blue, nothing else in frame, no objects." png &
gen V21 seedream_v4_5 "--aspect_ratio 1:1 --quality high" "$STYLE Abstract only: a swirl of thousands of tiny luminous white particles frozen mid-motion against pure black, like a stream of data, single white edge highlight, nothing else in frame, no objects, no devices." png &
wait
echo "REDO-THREE COMPLETE" >> "$LOG"
