# Tanya AI (nonaktif)

Fitur ini dinonaktifkan atas permintaan pemilik aplikasi. Chat Tamu hanya memakai pustaka offline, tanpa layanan AI.

Folder ini menyimpan kode server lama (Cloudflare Pages Function) agar bisa dipakai lagi bila suatu saat dibutuhkan. Kode ini tidak ikut berjalan.

Cara mengaktifkan kembali:
1. Pindahkan `functions/` dari folder ini ke akar proyek.
2. Jalankan `npm install @anthropic-ai/sdk`.
3. Ubah `AI_ENABLED` menjadi `true` di `js/app.js`.
4. Atur rahasia `ANTHROPIC_API_KEY` di hosting.
