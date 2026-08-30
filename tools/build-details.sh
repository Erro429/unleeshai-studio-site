#!/usr/bin/env bash
# Generate the 10 work_<slug>.html detail pages from detail-template.html
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$DIR/.."
TPL="$DIR/detail-template.html"

# slug|title|banner|type|quarter|line|overview1|s1|s2|s3|s4|s5|s6|s7
DATA='lumen|LUMEN SKINCARE|V50|Beauty Flagship|Q2|Redefining clean beauty: a bespoke digital experience blending editorial layouts with an organic palette.|A skincare house asked for a flagship that feels like porcelain under gallery light. We built an editorial system around negative space, water texture and one cinematic key light.|V40|V28|V50C|V50D|V29|V24|V27
nocturne|NOCTURNE DINING|V41|Hospitality|Q1|A tasting menu told in candlelight: reservation flow, menu narrative and cellar archive in one continuous scroll.|A fine-dining room with one candle per table needed a site as dark and patient as its service. Typography carries the menu; light carries the mood.|V29|V41|V25|V45|V26|V24|V27
wilder|WILDER CAMP|V42|Outdoor Brand|Q2|Expedition-grade gear presented at blue hour, with lantern light doing the selling.|An outdoor label wanted dusk, not daylight. We built the catalogue around glowing canvas, cold air and warm interiors.|V32|V42|V23|V26|V27|V25|V24
ironflow|IRONFLOW LUBRICANTS|V43|B2B Industrial|Q1|Heavy industry through a macro lens: viscosity, sheen and torque as brand assets.|An industrial group asked us to make oil beautiful. Macro photography and slow ripples turned a commodity into a visual signature.|V31|V43|V46|V18|V22|V20|V19
caneform|CANE & FORM|V44|Furniture & Living|Q3|Rattan weave under raking light: a craft catalogue with long shadows and longer patience.|A furniture workshop wanted its weave seen, not described. Side light and shadow do the talking across the collection.|V44|V59|V60|V56|V58|V57|V65
pullnoodle|PULL NOODLE BAR|V45|F&B Retail|Q2|Hand-pulled craft caught mid-air: flour dust in a single shaft of light.|A noodle house with a queue around the block needed a site that moves like the kitchen: fast, precise, theatrical.|V30|V45|V29|V25|V26|V24|V27
axiom|AXIOM PRECISION|V46|Advanced Manufacturing|Q1|CNC tolerances as brand language: titanium, coolant spray and sparks of white light.|A machining firm asked for proof of precision. We answered with macro frames of the work itself, measured to the micron.|V33|V46|V18|V20|V22|V19|V21
forgeline|FORGELINE STEEL|V47|Industrial Group|Q3|Foundry glow as the only colour in a monochrome world.|A steel group wanted scale and heat. Molten orange against near-black structure became the entire art direction.|V47|V43|V21|V22|V18|V20|V19
clara|CLARA AESTHETICS|V48|Medical Aesthetics|Q2|Clinical calm behind frosted glass: a corridor of soft light and quiet confidence.|A clinic asked for trust at first scroll. Charcoal tones and one glowing door set the temperature for every treatment page.|V48|V24|V25|V26|V23|V27|V17
helios|HELIOS ENERGY|V49|Renewable Energy|Q4|Night arrays reflecting the moon: solar told through geometry and silence.|An energy company wanted the poetry of the panel field, not the datasheet. We shot the array at night and let geometry speak.|V49|V19|V23|V26|V22|V18|V21'

SLUGS=$(echo "$DATA" | cut -d'|' -f1)
ARR=($SLUGS)
N=${#ARR[@]}

i=0
echo "$DATA" | while IFS='|' read -r SLUG TITLE BANNER TYPE QUARTER LINE OV1 S1 S2 S3 S4 S5 S6 S7; do
  PREV_IDX=$(( (i - 1 + N) % N ))
  NEXT_IDX=$(( (i + 1) % N ))
  PREV="work_${ARR[$PREV_IDX]}.html"
  NEXT="work_${ARR[$NEXT_IDX]}.html"
  sed -e "s/%%TITLE%%/$TITLE/g" \
      -e "s/%%BANNER%%/$BANNER/g" \
      -e "s/%%TYPE%%/$TYPE/g" \
      -e "s/%%QUARTER%%/$QUARTER/g" \
      -e "s/%%LINE%%/$(echo "$LINE" | sed 's/[&/\]/\\&/g')/g" \
      -e "s/%%OVERVIEW1%%/$(echo "$OV1" | sed 's/[&/\]/\\&/g')/g" \
      -e "s/%%S1%%/$S1/g" -e "s/%%S2%%/$S2/g" -e "s/%%S3%%/$S3/g" -e "s/%%S4%%/$S4/g" \
      -e "s/%%S5%%/$S5/g" -e "s/%%S6%%/$S6/g" -e "s/%%S7%%/$S7/g" \
      -e "s/%%PREV%%/$PREV/g" -e "s/%%NEXT%%/$NEXT/g" \
      "$TPL" > "$ROOT/work_$SLUG.html"
  echo "built work_$SLUG.html"
  i=$((i + 1))
done
