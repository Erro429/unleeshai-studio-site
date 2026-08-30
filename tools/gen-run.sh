#!/usr/bin/env bash
# Fire all Higgsfield jobs from manifest.psv, then poll + download results.
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
RAW="$DIR/../assets/raw"
mkdir -p "$RAW"
MANIFEST="$DIR/manifest.psv"
JOBS="$DIR/jobs.tsv"        # id<TAB>job_id<TAB>model
LOG="$DIR/gen.log"
: > "$LOG"

STYLE="Near-black studio environment, background #030303, single soft directional key light from upper left, deep controlled shadows, matte and satin materials, no glare, high dynamic range, subtle fine film grain, editorial product-photography composition, generous negative space, cinematic 50mm lens, shallow depth of field, colour palette restrained to charcoal, graphite, bone-white and one muted accent, ultra-detailed, photoreal, 8k, no text, no logos, no watermark, no people unless stated."
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
  # skip if already downloaded
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

echo "--- ALL COMPLETE $(date) ---" >> "$LOG"
