#!/usr/bin/env bash
# Versión vertical 9:16 del hero: tomas 1 a 3 completas sobre fondo desenfocado + toma 4 renderizada nativa en 1080x1920.
set -e
W="$(dirname "$0")"; FM="$(cat "$W/ffmpeg-path.txt")"; OUT=/c/dev-portafolio/prototype/media
# 1) Fondo de continuidad para la toma 4 vertical: último frame de t3 en 9:16 (misma composición que abajo)
"$FM" -v error -y -ss 7.9 -i /c/dev-portafolio/reference/video/raw/toma3-entrada.mp4 -frames:v 1 -filter_complex "[0:v]split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=24:6,eq=brightness=-0.12[bg];[b]scale=1080:-2:flags=lanczos[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2-200" "$W/t3-last-9x16.png"
# 2) Toma 4 vertical desde fotogramas
"$FM" -v error -y -framerate 30 -i "$W/frames4v/f%04d.png" -c:v libx264 -preset fast -crf 14 -pix_fmt yuv420p "$W/t4v.mp4"
# 3) Tomas 1 a 3 (ya con ramps, 1920x1080) a 1080x1920: clip completo centrado un poco arriba sobre su propio desenfoque
for t in 1 2 3; do
  "$FM" -v error -y -i "$W/t$t.mp4" -filter_complex "[0:v]split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=24:6,eq=brightness=-0.12[bg];[b]scale=1080:-2:flags=lanczos[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2-200,format=yuv420p" -c:v libx264 -preset fast -crf 14 "$W/t${t}v.mp4"
done
D1=$("$FM" -i "$W/t1v.mp4" 2>&1 | grep -oE "Duration: [0-9:.]+" | awk '{print $2}' | awk -F: '{print $1*3600+$2*60+$3}')
D2=$("$FM" -i "$W/t2v.mp4" 2>&1 | grep -oE "Duration: [0-9:.]+" | awk '{print $2}' | awk -F: '{print $1*3600+$2*60+$3}')
D3=$("$FM" -i "$W/t3v.mp4" 2>&1 | grep -oE "Duration: [0-9:.]+" | awk '{print $2}' | awk -F: '{print $1*3600+$2*60+$3}')
X=0.25; O1=$(awk "BEGIN{print $D1-$X}"); O2=$(awk "BEGIN{print $D1+$D2-2*$X}"); O3=$(awk "BEGIN{print $D1+$D2+$D3-3*$X}")
"$FM" -v error -y -i "$W/t1v.mp4" -i "$W/t2v.mp4" -i "$W/t3v.mp4" -i "$W/t4v.mp4" -filter_complex "\
[0:v]fade=t=in:st=0:d=0.4:color=0x07122c[a];[a][1:v]xfade=transition=fade:duration=$X:offset=$O1[ab];[ab][2:v]xfade=transition=fade:duration=$X:offset=$O2[abc];[abc][3:v]xfade=transition=fade:duration=$X:offset=$O3[v];\
[v]eq=contrast=1.06:saturation=1.08:gamma=0.98,noise=alls=7:allf=t+u,vignette=PI/4.6,format=yuv420p[out]" -map "[out]" -c:v libx264 -preset slow -crf 15 -pix_fmt yuv420p "$W/hero-master-9x16.mp4"
"$FM" -v error -y -i "$W/hero-master-9x16.mp4" -an -c:v libx264 -preset slow -crf 25 -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT/hero-setup-9x16.mp4"
"$FM" -v error -y -ss 0.6 -i "$W/hero-master-9x16.mp4" -frames:v 1 -q:v 3 "$OUT/hero-setup-9x16.jpg"
ls -la "$OUT"/hero-setup-9x16.*; "$FM" -i "$OUT/hero-setup-9x16.mp4" 2>&1 | grep -E "Duration|Video" | head -2
