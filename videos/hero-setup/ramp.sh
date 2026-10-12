#!/usr/bin/env bash
# Speed ramps de las tomas 1 a 3 (sin audio, 1920x1080, 30 fps). Lento frente a las pantallas, rápido por detrás.
set -e
W="$(dirname "$0")"; FM="$(cat "$W/ffmpeg-path.txt")"; R=/c/dev-portafolio/reference/video/raw
seg() { # in, start, end, rate, out  (rate>1 acelera)
  local in="$1" s="$2" e="$3" r="$4" out="$5"
  if awk "BEGIN{exit !($r < 1)}"; then
    "$FM" -v error -y -ss "$s" -to "$e" -i "$in" -an -vf "setpts=PTS/$r,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,scale=1920:1080:flags=lanczos" -c:v libx264 -preset fast -crf 14 -pix_fmt yuv420p "$out"
  else
    "$FM" -v error -y -ss "$s" -to "$e" -i "$in" -an -vf "setpts=PTS/$r,fps=30,scale=1920:1080:flags=lanczos" -c:v libx264 -preset fast -crf 14 -pix_fmt yuv420p "$out"
  fi
}
# Toma 1: frente lento, giro rápido, llegada detrás a ritmo normal
seg "$R/toma1-orbita-a.mp4" 0   1.6 0.75 "$W/t1a.mp4"
seg "$R/toma1-orbita-a.mp4" 1.6 6.4 1.9  "$W/t1b.mp4"
seg "$R/toma1-orbita-a.mp4" 6.4 8.0 1.0  "$W/t1c.mp4"
# Toma 2: salida normal, giro rápido, frente lento
seg "$R/toma2-orbita-b.mp4" 0   1.4 1.0  "$W/t2a.mp4"
seg "$R/toma2-orbita-b.mp4" 1.4 6.0 1.9  "$W/t2b.mp4"
seg "$R/toma2-orbita-b.mp4" 6.0 8.0 0.75 "$W/t2c.mp4"
# Toma 3: acercamiento normal, túnel acelera
seg "$R/toma3-entrada.mp4" 0   3.2 0.9  "$W/t3a.mp4"
seg "$R/toma3-entrada.mp4" 3.2 5.4 1.35 "$W/t3b.mp4"
seg "$R/toma3-entrada.mp4" 5.4 8.0 1.0  "$W/t3c.mp4"
for t in 1 2 3; do printf "file 't%sa.mp4'\nfile 't%sb.mp4'\nfile 't%sc.mp4'\n" $t $t $t > "$W/t$t.txt"; "$FM" -v error -y -f concat -safe 0 -i "$W/t$t.txt" -c copy "$W/t$t.mp4"; done
for t in 1 2 3; do "$FM" -v error -i "$W/t$t.mp4" 2>&1 | true; done
echo "ramps listos"
