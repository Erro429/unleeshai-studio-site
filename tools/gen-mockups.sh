#!/usr/bin/env bash
# Device-in-scene mockup cards for the work grid (V40M..V49M)
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$DIR/.."
LOG="$DIR/mockups.log"
: > "$LOG"

BASE="Editorial product photography, moody cinematic light, muted color grade, photoreal, 8k, no text, no logos, no watermark. The device screen shows a dark minimalist website design with abstract typography blocks and one large image, screen content intentionally unreadable and generic."

declare -A P=(
  [V40M]="A smartphone lying on wet black slate among frosted-glass skincare jars and water droplets, screen glowing with a dark beauty website, top-down."
  [V41M]="A laptop on a black linen restaurant table beside a single candle, warm bokeh brass details behind, screen showing a dark dining website."
  [V42M]="A tablet propped on a mossy stone at blue hour near a glowing canvas tent, screen showing an outdoor gear website."
  [V43M]="A laptop resting on a steel drum in a dark industrial workshop, oil sheen reflections, screen showing an industrial website."
  [V44M]="A tablet lying on a woven rattan chair seat, raking side light casting weave shadows, screen showing a furniture catalogue website."
  [V45M]="A laptop on dark wood beside a black ceramic ramen bowl with steam, screen showing a noodle bar website, overhead angle."
  [V46M]="A smartphone standing on black granite among polished milled steel parts, screen showing a precision engineering website."
  [V47M]="A laptop on a concrete ledge in a dark foundry, distant molten orange glow, screen showing a heavy industry website."
  [V48M]="A tablet on a frosted-glass counter in a dim minimalist clinic corridor, soft glowing door behind, screen showing a medical aesthetics website."
  [V49M]="A laptop on dark grass at night in front of a moonlit solar panel array, screen showing a green energy website."
)

for ID in V40M V41M V42M V43M V44M V45M V46M V47M V48M V49M; do
  [ -e "$ROOT/assets/img/$ID.webp" ] && continue
  J=$(higgsfield generate create seedream_v4_5 --prompt "$BASE ${P[$ID]}" --aspect_ratio 16:9 --quality high --json 2>&1 | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)
  if [ -z "$J" ]; then echo "CREATE-FAIL $ID" >> "$LOG"; continue; fi
  URL=$(higgsfield generate wait "$J" --timeout 6m --quiet --json 2>&1 | grep -o '"result_url": *"[^"]*"' | cut -d'"' -f4)
  if [ -z "$URL" ]; then echo "NO-URL $ID ($J)" >> "$LOG"; continue; fi
  curl -sL "$URL" -o "$ROOT/assets/raw/$ID.png" \
    && ffmpeg -y -loglevel error -i "$ROOT/assets/raw/$ID.png" -vf "scale='min(1920,iw)':-2" -c:v libwebp -quality 82 "$ROOT/assets/img/$ID.webp" \
    && echo "DONE $ID" >> "$LOG" || echo "CONVERT-FAIL $ID" >> "$LOG"
done
echo "COMPLETE $(date)" >> "$LOG"
