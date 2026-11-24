# Tanya AI (Groq)

Tanya AI menyusun jawaban fikih haid **hanya** dari kutipan kitab 4 mazhab di `data/kitab.json`, lalu mencantumkan nomor kutipannya agar bisa dicek. Fitur ini mati secara bawaan; pengguna menyalakannya sendiri lewat layar persetujuan.

## Alur

1. Aplikasi mencari kutipan yang relevan di perangkat (`js/kitab.js`), lalu mengirim **teks pertanyaan + nomor kutipan** ke `POST /api/tanya`. Catatan haid tidak ikut terkirim.
2. `functions/api/tanya.js` (Cloudflare Pages Function) membatasi 15 pertanyaan per IP per 10 menit, lalu memanggil `functions/_lib/tanya-core.mjs`.
3. Inti tersebut mengambil teks kitab di server (klien tidak bisa mengirim teks sembarang) dan memanggil Groq (`api.groq.com`, API kompatibel OpenAI) dengan `fetch`. Tidak ada dependensi npm.

## Memasang di Cloudflare Pages

Di **Pages → proyek → Settings → Variables and Secrets** (Production):

| Nama | Jenis | Isi |
|---|---|---|
| `GROQ_API_KEY` | Secret | kunci dari console.groq.com → API Keys |
| `TAMU_AI_MODEL` | Teks (opsional) | model lain, misalnya `openai/gpt-oss-120b`. Bawaan: `qwen/qwen3.8-27b` |

Setelah menambah atau mengubah variabel, lakukan **deploy ulang** (Deployments → Retry deployment) supaya terbaca.

**Jangan pernah menaruh kunci API di kode atau repo.**

## Pilihan model (uji coba 24 Nov 2026)

| Model | Hasil |
|---|---|
| `qwen/qwen3.8-27b` (bawaan) | ±1,5 detik. Membaca batas haid Hanafi (10 hari) dengan benar di setiap percobaan. Masih cenderung menyederhanakan kasus darah lebih dari 15 hari. |
| `openai/gpt-oss-120b` | Pada `reasoning_effort: medium` salah menisbatkan "15 hari" kepada Hanafi; pada `high` benar tetapi ±5 detik dan lebih cepat menghabiskan kuota. |

Paket gratis Groq membatasi jumlah token per menit. Bila penuh, pengguna melihat pesan "Tanya AI sedang ramai" (HTTP 429) dan bisa mencoba lagi beberapa menit kemudian.

## Uji lokal

```sh
GROQ_API_KEY=gsk_... node tools/serve.js
```

Server lokal melayani `POST /api/tanya` dengan inti yang sama.

## Mematikan

Ubah `AI_ENABLED` menjadi `false` di `js/app.js`. Chat kembali memakai pustaka offline saja.
