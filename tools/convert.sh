#!/usr/bin/env bash
# Convert raw generations to web-ready assets: webp images, optimized mp4 loops.
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
RAW="$DIR/../assets/raw"
IMG="$DIR/../assets/img"
VID="$DIR/../assets/video"
mkdir -p "$IMG" "$VID"
LOG="$DIR/convert.log"
: > "$LOG"

for f in "$RAW"/*.png "$RAW"/*.jpg "$RAW"/*.webp; do
  [ -e "$f" ] || continue
  base=$(basename "$f"); id="${base%.*}"
  out="$IMG/$id.webp"
  [ -e "$out" ] && continue
  ffmpeg -y -loglevel error -i "$f" -vf "scale='min(1920,iw)':-2" -c:v libwebp -quality 82 "$out" \
    && echo "IMG $id" >> "$LOG" || echo "IMG-FAIL $id" >> "$LOG"
done

for f in "$RAW"/*.mp4; do
  [ -e "$f" ] || continue
  base=$(basename "$f"); id="${base%.*}"
  out="$VID/$id.mp4"
  [ -e "$out" ] && continue
  ffmpeg -y -loglevel error -i "$f" -an -c:v libx264 -crf 23 -preset medium \
    -vf "scale='min(1280,iw)':-2" -pix_fmt yuv420p -movflags +faststart "$out" \
    && echo "VID $id" >> "$LOG" || echo "VID-FAIL $id" >> "$LOG"
done

echo "COMPLETE $(date)" >> "$LOG"
