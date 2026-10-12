#!/usr/bin/env bash
# Montaje del hero: t1 + t2 + t3 (Veo, con ramps) + t4 (3D por código), fundidos, grano, viñeta, encodes y póster.
set -e
W="$(dirname "$0")"; FM="$(cat "$W/ffmpeg-path.txt")"; OUT=/c/dev-portafolio/prototype/media
# 1) Toma 4 desde la secuencia de fotogramas
"$FM" -v error -y -framerate 30 -i "$W/frames4/f%04d.png" -c:v libx264 -preset fast -crf 14 -pix_fmt yuv420p "$W/t4.mp4"
# 2) Fundido de entrada en t1 (vuelve del plano nocturno de t4 al loop) y unión con xfade de 0.25 s entre tomas
D1=$("$FM" -i "$W/t1.mp4" 2>&1 | grep -oE "Duration: [0-9:.]+" | awk '{print $2}' | awk -F: '{print $1*3600+$2*60+$3}')
D2=$("$FM" -i "$W/t2.mp4" 2>&1 | grep -oE "Duration: [0-9:.]+" | awk '{print $2}' | awk -F: '{print $1*3600+$2*60+$3}')
D3=$("$FM" -i "$W/t3.mp4" 2>&1 | grep -oE "Duration: [0-9:.]+" | awk '{print $2}' | awk -F: '{print $1*3600+$2*60+$3}')
X=0.25
O1=$(awk "BEGIN{print $D1-$X}"); O2=$(awk "BEGIN{print $D1+$D2-2*$X}"); O3=$(awk "BEGIN{print $D1+$D2+$D3-3*$X}")
"$FM" -v error -y -i "$W/t1.mp4" -i "$W/t2.mp4" -i "$W/t3.mp4" -i "$W/t4.mp4" -filter_complex "\
[0:v]fade=t=in:st=0:d=0.4:color=0x07122c[a];\
[a][1:v]xfade=transition=fade:duration=$X:offset=$O1[ab];\
[ab][2:v]xfade=transition=fade:duration=$X:offset=$O2[abc];\
[abc][3:v]xfade=transition=fade:duration=$X:offset=$O3[v];\
[v]eq=contrast=1.06:saturation=1.08:gamma=0.98,unsharp=5:5:0.5:5:5:0,noise=alls=7:allf=t+u,vignette=PI/4.6,format=yuv420p[out]" \
-map "[out]" -c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p "$W/hero-master.mp4"
# 3) Encodes para la web
"$FM" -v error -y -i "$W/hero-master.mp4" -an -c:v libx264 -preset slow -crf 24 -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT/hero-setup.mp4"
"$FM" -v error -y -i "$W/hero-master.mp4" -an -c:v libvpx-vp9 -b:v 0 -crf 34 -row-mt 1 -deadline good -cpu-used 2 "$OUT/hero-setup.webm"
# 4) Póster (primer fotograma nítido de la órbita) y versión vertical 9:16 recortada al centro
"$FM" -v error -y -ss 0.6 -i "$W/hero-master.mp4" -frames:v 1 -q:v 3 "$OUT/hero-setup.jpg"
"$FM" -v error -y -i "$W/hero-master.mp4" -an -vf "crop=608:1080:656:0,scale=1080:1920:flags=lanczos" -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -movflags +faststart "$OUT/hero-setup-9x16.mp4"
ls -la "$OUT"/hero-setup.*; "$FM" -i "$OUT/hero-setup.mp4" 2>&1 | grep -E "Duration|Stream.*Video" | head -2
