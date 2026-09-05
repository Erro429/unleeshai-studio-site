#!/usr/bin/env bash
# Tech re-shoot (2026-09-06): regenerate every visual slot from manifest-tech.psv
# with a web-development-agency look, into assets/raw-tech, then convert over the
# live assets. Same slot IDs and aspect ratios as the original manifest, so no
# markup changes are needed. Re-runnable: skips slots already created/downloaded.
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$DIR/.."
RAW="$ROOT/assets/raw-tech"
mkdir -p "$RAW"
MANIFEST="$DIR/manifest-tech.psv"
JOBS="$DIR/jobs-tech.tsv"        # id<TAB>job_id<TAB>model
LOG="$DIR/gen-tech.log"
echo "--- run start $(date) ---" >> "$LOG"

STYLE="Near-black studio environment, background #030303, single soft directional key light from upper left, deep controlled shadows, matte black glass and satin metal materials, one restrained accent of cold ice-blue light, no glare, high dynamic range, subtle fine film grain, editorial technology-photography composition, generous negative space, cinematic 50mm lens, shallow depth of field, colour palette restrained to charcoal, graphite, bone-white and ice-blue, ultra-detailed, photoreal, 8k, no text, no letters, no logos, no watermark, no people unless stated."
VIDSUF="Slow continuous camera drift, 2 percent push-in, motion so subtle it reads as breathing, seamless loop, first and last frame identical, no cuts, no flicker, 24fps."

# ---- Phase 1: create jobs (skip ones already recorded) ----
touch "$JOBS"
while IFS='|' read -r ID MODEL ARGS PROMPT; do
  [ -z "$ID" ] && continue
  if grep -q "^$ID	" "$JOBS"; then continue; fi
  FULL="$STYLE $PROMPT"
  case "$MODEL" in kling*|seedance*|veo*|wan*) FULL="$FULL $VIDSUF";; esac
  OUT=$(higgsfield generate create "$MODEL" --prompt "$FULL" $ARGS --json 2>&1)
  JOB_ID=$(echo "$OUT" | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)
  if [ -n "$JOB_ID" ]; then
    printf '%s\t%s\t%s\n' "$ID" "$JOB_ID" "$MODEL" >> "$JOBS"
    echo "CREATED $ID -> $JOB_ID" >> "$LOG"
  else
    echo "FAILED-CREATE $ID :: $OUT" >> "$LOG"
  fi
  sleep 1
done < "$MANIFEST"
echo "--- all creates done $(date) ---" >> "$LOG"

# ---- Phase 2: wait + download ----
while IFS=$'\t' read -r ID JOB_ID MODEL; do
  if ls "$RAW/$ID".* >/dev/null 2>&1; then continue; fi
  RES=$(higgsfield generate wait "$JOB_ID" --timeout 25m --quiet --json 2>&1)
  URL=$(echo "$RES" | grep -o '"result_url": *"[^"]*"' | head -1 | cut -d'"' -f4)
  if [ -z "$URL" ]; then
    URL=$(echo "$RES" | grep -oE 'https://[^"[:space:]]+' | grep -viE 'preview|thumb|_min\.' | head -1)
  fi
  if [ -n "$URL" ]; then
    EXT="jpg"
    case "$MODEL" in kling*|seedance*|veo*|wan*) EXT="mp4";; esac
    case "$URL" in *.png*) EXT="png";; *.webp*) EXT="webp";; *.jpeg*|*.jpg*) EXT="jpg";; *.mp4*) EXT="mp4";; esac
    curl -sL "$URL" -o "$RAW/$ID.$EXT" && echo "DONE $ID -> $ID.$EXT" >> "$LOG" || echo "DL-FAIL $ID $URL" >> "$LOG"
  else
    echo "NO-URL $ID :: $(echo "$RES" | tail -2)" >> "$LOG"
  fi
done < "$JOBS"
echo "--- downloads done $(date) ---" >> "$LOG"

# ---- Phase 3: convert over the live assets ----
IMG="$ROOT/assets/img"; VID="$ROOT/assets/video"
for f in "$RAW"/*.png "$RAW"/*.jpg "$RAW"/*.webp; do
  [ -e "$f" ] || continue
  base=$(basename "$f"); id="${base%.*}"
  [ "$f" -ot "$IMG/$id.webp" ] 2>/dev/null && continue
  ffmpeg -y -loglevel error -i "$f" -vf "scale='min(1920,iw)':-2" -c:v libwebp -quality 82 "$IMG/$id.webp" \
    && echo "IMG $id" >> "$LOG" || echo "IMG-FAIL $id" >> "$LOG"
done
for f in "$RAW"/*.mp4; do
  [ -e "$f" ] || continue
  base=$(basename "$f"); id="${base%.*}"
  [ "$f" -ot "$VID/$id.mp4" ] 2>/dev/null && continue
  ffmpeg -y -loglevel error -i "$f" -an -c:v libx264 -crf 23 -preset medium \
    -vf "scale='min(1280,iw)':-2" -pix_fmt yuv420p -movflags +faststart "$VID/$id.mp4" \
    && echo "VID $id" >> "$LOG" || echo "VID-FAIL $id" >> "$LOG"
done

# ---- Phase 4: hero carousel loops, animated from the new device mockups (i2v) ----
HSUF="The scene comes gently alive: the device screen glows and its interface shimmers faintly, reflections slide across the glass, dust motes drift in the light. $VIDSUF No text overlays."
declare -A HP=(
  [V40V]="Water droplets glisten and shift on the wet slate around the phone. $HSUF"
  [V42V]="The tent canvas breathes with warm lantern light behind the tablet, grass sways faintly. $HSUF"
  [V45V]="Steam rises slowly from the ramen bowl beside the laptop. $HSUF"
  [V46V]="Cool reflections slide across the polished steel parts around the phone. $HSUF"
)
declare -A HSRC=( [V40V]=V40M [V42V]=V42M [V45V]=V45M [V46V]=V46M )
for ID in V40V V42V V45V V46V; do
  [ -e "$RAW/$ID.mp4" ] && continue
  SRC=$(ls "$RAW/${HSRC[$ID]}".png "$RAW/${HSRC[$ID]}".jpg "$RAW/${HSRC[$ID]}".webp 2>/dev/null | head -1)
  [ -z "$SRC" ] && { echo "HERO-NOSRC $ID" >> "$LOG"; continue; }
  J=$(higgsfield generate create kling2_6 --prompt "${HP[$ID]}" --aspect_ratio 16:9 --duration 5 --sound false \
      --start-image "$SRC" --json 2>&1 | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)
  [ -z "$J" ] && { echo "HERO-CREATE-FAIL $ID" >> "$LOG"; continue; }
  echo "HERO-CREATED $ID $J" >> "$LOG"
  URL=$(higgsfield generate wait "$J" --timeout 25m --quiet --json 2>&1 | grep -o '"result_url": *"[^"]*"' | head -1 | cut -d'"' -f4)
  [ -z "$URL" ] && { echo "HERO-NO-URL $ID ($J)" >> "$LOG"; continue; }
  curl -sL "$URL" -o "$RAW/$ID.mp4" \
    && ffmpeg -y -loglevel error -i "$RAW/$ID.mp4" -an -c:v libx264 -crf 21 -preset medium \
       -vf "scale='min(1600,iw)':-2" -pix_fmt yuv420p -movflags +faststart "$VID/$ID.mp4" \
    && echo "HERO-DONE $ID" >> "$LOG" || echo "HERO-FAIL $ID" >> "$LOG"
done

echo "--- ALL COMPLETE $(date) ---" >> "$LOG"
