# Video Berita 3D Toon (Remotion, vertikal 1080x1920)

Durasi video otomatis = durasi audio (public/voice.mp3 = 56,6 detik = 1699 frame @30fps).

## Cara render lewat GitHub (tanpa laptop)
1. Upload semua isi folder ini ke repo GitHub (pastikan folder `.github` ikut).
2. Buka tab **Actions** > **Render video** > **Run workflow**.
3. Tunggu selesai (sekitar 20-40 menit, render 3D di server tanpa GPU).
4. Buka run yang sudah hijau > bagian **Artifacts** > unduh `video-tiktok` (isi: berita.mp4 + preview.png).

## Yang bisa diubah (src/config.ts)
- `headline`, `subheadline`, `badge`, `channel`, `ticker`
- `script`: tempel teks narasi lengkap -> subtitle muncul otomatis, disinkronkan dengan jeda bicara di audio.

## Ganti audio
Timpa `public/voice.mp3` dengan file baru (nama tetap voice.mp3). Durasi menyesuaikan sendiri.
