#!/usr/bin/env bash
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"; ROOT="$DIR/.."; RAW="$ROOT/assets/raw-tech"; LOG="$DIR/gen-tech.log"
J=0cd12847-6f22-4c3c-959b-40bab4cc3df5
for i in 1 2 3 4 5 6 7 8; do
  U=$(higgsfield generate wait "$J" --timeout 15m --quiet --json 2>&1 | grep -o '"result_url": *"[^"]*"' | head -1 | cut -d'"' -f4)
  [ -z "$U" ] && U=$(higgsfield generate get "$J" --json 2>&1 | grep -o '"result_url": *"[^"]*"' | head -1 | cut -d'"' -f4)
  [ -n "$U" ] && break
  sleep 30
done
[ -z "$U" ] && { echo "V45V-WAIT NO-URL" >> "$LOG"; exit 1; }
curl -sL "$U" -o "$RAW/V45V.mp4" && ffmpeg -y -loglevel error -i "$RAW/V45V.mp4" -an -c:v libx264 -crf 21 -preset medium -vf "scale='min(1600,iw)':-2" -pix_fmt yuv420p -movflags +faststart "$ROOT/assets/video/V45V.mp4" && echo "V45V-WAIT COMPLETE" >> "$LOG" || echo "V45V-WAIT FAIL" >> "$LOG"
