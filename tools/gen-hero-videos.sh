#!/usr/bin/env bash
# Animate the four work-scene mockup stills into 5s hero background loops (Kling i2v)
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$DIR/.."
LOG="$DIR/herovids.log"
: > "$LOG"

SUFFIX="Slow continuous camera drift, 2 percent push-in, motion so subtle it reads as breathing, seamless loop, first and last frame identical, no cuts, no flicker, cinematic, no text overlays."

declare -A P=(
  [V40V]="The scene comes gently alive: water droplets glisten and shift on the wet slate, the phone screen glows softly, faint reflections move across the frosted glass jars. $SUFFIX"
  [V42V]="The scene comes gently alive: the tent canvas glows and breathes with warm lantern light, dusk grass sways faintly, the tablet screen shimmers. $SUFFIX"
  [V45V]="The scene comes gently alive: steam rises slowly from the ramen bowl, the laptop screen glows, warm light flickers subtly on dark wood. $SUFFIX"
  [V46V]="The scene comes gently alive: cool reflections slide across the polished steel parts, the phone screen glows, dust motes drift in the dark workshop light. $SUFFIX"
)
declare -A SRC=( [V40V]=V40M [V42V]=V42M [V45V]=V45M [V46V]=V46M )

for ID in V40V V42V V45V V46V; do
  [ -e "$ROOT/assets/video/$ID.mp4" ] && continue
  J=$(higgsfield generate create kling2_6 --prompt "${P[$ID]}" --aspect_ratio 16:9 --duration 5 --sound false \
      --start-image "$ROOT/assets/raw/${SRC[$ID]}.png" --json 2>&1 | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)
  if [ -z "$J" ]; then echo "CREATE-FAIL $ID" >> "$LOG"; continue; fi
  echo "CREATED $ID $J" >> "$LOG"
  URL=$(higgsfield generate wait "$J" --timeout 25m --quiet --json 2>&1 | grep -o '"result_url": *"[^"]*"' | cut -d'"' -f4)
  if [ -z "$URL" ]; then echo "NO-URL $ID ($J)" >> "$LOG"; continue; fi
  curl -sL "$URL" -o "$ROOT/assets/raw/$ID.mp4" \
    && ffmpeg -y -loglevel error -i "$ROOT/assets/raw/$ID.mp4" -an -c:v libx264 -crf 21 -preset medium \
       -vf "scale='min(1600,iw)':-2" -pix_fmt yuv420p -movflags +faststart "$ROOT/assets/video/$ID.mp4" \
    && echo "DONE $ID" >> "$LOG" || echo "FAIL $ID" >> "$LOG"
done
echo "COMPLETE $(date)" >> "$LOG"
