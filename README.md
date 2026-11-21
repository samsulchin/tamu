# Tamu · Teman Siklus Muslimah

Aplikasi pencatat siklus haid untuk muslimah Indonesia. **Gratis, privat, dan offline.** Catatan haid tidak pernah meninggalkan perangkat.

Tamu lahir dari keresahan bahwa aplikasi haid populer menyimpan data paling pribadi perempuan di server mereka. Tamu tidak punya server sama sekali.

## Fitur

| Area | Isi |
|---|---|
| **Siklus** | Pencatatan haid dengan jam mulai/berhenti, 4 fase (menstruasi, folikular, ovulasi, luteal), prediksi haid berikutnya dalam bentuk **rentang** (jujur untuk siklus tidak teratur), masa subur & ovulasi, statistik keteraturan. Saat **haid terlambat**, hari-hari keterlambatan ditandai dan prediksi bergeser otomatis. Kalender: haid merah, nifas merah muda; tanggal yang diklik menampilkan "haid hari ke-N" beserta status fikihnya |
| **Fikih haid** (mazhab Syafi'i) | Status harian (haid / suci / istihadhah / nifas); penilaian otomatis: < 24 jam, 24 jam–15 hari, > 15 hari, masa suci < 15 hari, darah terputus (*naqa'*, qaul as-sahb); pengingat mandi wajib |
| **Shalat** | **Jadwal resmi Bimas Islam Kemenag RI** untuk semua kab/kota (diunduh sekali per bulan lalu disimpan di perangkat), dengan cadangan hitungan offline (kriteria Kemenag). **GPS** mencari kab/kota Kemenag terdekat di perangkat (513 kab/kota; koordinat tidak dikirim). Dari jam mulai/berhenti darah, Tamu memberi tahu shalat mana yang wajib dikerjakan atau diqadha (termasuk aturan jamak Dzuhur–Ashar & Maghrib–Isya) |
| **Qadha puasa** | Hutang puasa Ramadhan dihitung otomatis dari catatan haid (sesuai kalender Hijriah pilihan: **Kemenag RI / Muhammadiyah / Umm al-Qura**, plus koreksi ±2 hari), centang qadha yang sudah dibayar, koreksi manual |
| **Nifas** | Mode nifas (batas 40/60 hari) |
| **Alat bantu** | "Cek hukum darah", simulator untuk memahami kasus sendiri atau membantu teman |
| **Catatan harian** | Aliran, **warna darah** (untuk *tamyiz*), gejala, suasana hati, catatan pribadi |
| **Edukasi** | 18 artikel: kesehatan reproduksi, fikih haid, nifas & istihadhah, mandi wajib, Al-Qur'an saat haid, dll. |
| **Tanya** | 45 tanya-jawab fikih haid dengan pencarian bahasa sehari-hari ("flek coklat", "pas mens boleh ngaji?"); **perbandingan 4 mazhab** untuk 20 topik utama; **703 kutipan asli** bab haid/nifas/istihadhah dari 14 kitab Hanafi, Maliki, Syafi'i, Hanbali + Bidayatul Mujtahid, bisa dicari offline. Pertanyaan **tidak dikirim** ke mana pun |
| **Keamanan** | PIN + enkripsi AES-256-GCM (kunci PBKDF2-SHA256, 250.000 iterasi), kunci otomatis, cadangan terenkripsi, hapus semua data |
| **Tampilan** | Splash logo singkat saat aplikasi dibuka, mode terang/gelap |

### Kalender Hijriah (Kemenag / Muhammadiyah / Umm al-Qura)

`data/hijri.js` berisi tanggal awal bulan 1440–1470 H, dibangun oleh `node tools/build-hijri.js` dengan [astronomy-engine](https://github.com/cosinekitty/astronomy) (MIT, hanya dipakai saat build):

| Pilihan | Kriteria |
|---|---|
| Kemenag RI | MABIMS: tinggi hilal toposentrik ≥3° dan elongasi geosentrik ≥6,4° di wilayah Indonesia (sebelum 1443 H: 2°/3°/8 jam). **Prediksi hisab**; awal Ramadhan, Syawal, dan Dzulhijjah resmi ditetapkan sidang isbat |
| Muhammadiyah | Sejak 1 Muharram 1447 H: KHGT, yaitu tinggi ≥5° dan elongasi ≥8° di daratan mana pun sebelum 24.00 UTC, dengan pengecualian daratan Amerika bila ijtimak terjadi sebelum fajar di Selandia Baru. Sebelumnya: wujudul hilal (Yogyakarta) |
| Umm al-Qura | Kalender Arab Saudi (dari `Intl` browser) |

Skrip build memvalidasi hasilnya terhadap 16 tanggal resmi (Ramadhan/Syawal 1444–1447 H versi pemerintah dan Muhammadiyah, serta 1 Muharram 1447 H KHGT). **Semua cocok.** Contohnya 1 Ramadhan 1447: pemerintah 19 Feb 2026, Muhammadiyah 18 Feb 2026.

### Lokasi GPS

`data/kota.js` (dibangun `node tools/build-kota.js`) memetakan 513 kab/kota jadwal Kemenag ke koordinat pusatnya ([ArrayAccess/Indonesia-Postal-And-Area](https://github.com/ArrayAccess/Indonesia-Postal-And-Area), MIT; salinan sumber ada di `tools/data/arrayaccess/` karena repo asalnya berencana dihapus). Saat pengguna menekan "Gunakan lokasi saya":
- koordinat dibulatkan ±100 m dan disimpan **hanya di perangkat** (terenkripsi bila PIN aktif);
- kab/kota terdekat dicari offline, lalu yang dikirim ke server jadwal tetap hanya ID kab/kota;
- hitungan offline cadangan memakai koordinat GPS tersebut.

Lima lokasi pulau terpencil yang punya jadwal Kemenag sendiri (Tambelan, Pekajang, Serasan, Midai, Pulau Laut) tidak ada di data koordinat. Lokasi itu tetap bisa dipilih lewat pencarian.

### Kitab rujukan 4 mazhab

`data/kitab.js` / `data/kitab.json` dibangun oleh `node tools/build-kitab.js` dari korpus terbuka **OpenITI** (github.com/OpenITI, lisensi **CC BY-NC-SA 4.0**; Tamu non-komersial dan mencantumkan atribusi). Yang diambil hanya bab haid, nifas, dan istihadhah:

| Mazhab | Kitab |
|---|---|
| Hanafi | Mukhtashar al-Quduri · al-Hidayah (al-Marghinani) · Bada'i' ash-Shana'i' (al-Kasani) |
| Maliki | al-Mudawwanah al-Kubra · ar-Risalah (Ibnu Abi Zaid) · al-Kafi (Ibnu 'Abdil Barr) · asy-Syarh al-Kabir (ad-Dardir) |
| Syafi'i | Minhajut Thalibin · Raudhatut Thalibin (an-Nawawi) · Fathul Qarib (Ibnu Qasim al-Ghazzi) |
| Hanbali | al-Mughni · 'Umdatul Fiqh (Ibnu Qudamah) · ar-Raudh al-Murbi' (al-Buhuti) |
| Perbandingan | Bidayatul Mujtahid (Ibnu Rusyd) |

Nomor halaman mengikuti edisi digital sumbernya (umumnya al-Maktabah asy-Syamilah), belum tentu sama dengan kitab cetak.

### Tanya AI (dinonaktifkan)

Chat Tamu sepenuhnya memakai pustaka offline: tidak ada layanan AI dan tidak ada pertanyaan yang dikirim ke mana pun. Kode server Tanya AI (Claude) yang pernah dibuat disimpan di `_nonaktif/tanya-ai/` beserta cara mengaktifkannya kembali, dan tidak ikut berjalan.

### Satu-satunya koneksi keluar: jadwal shalat Kemenag

Situs `bimasislam.kemenag.go.id` tidak bisa dipanggil langsung dari aplikasi web: tidak ada header CORS, dilindungi Cloudflare Turnstile (captcha), dan sering lambat. Karena itu Tamu mengambil data Bimas Islam melalui **api.myquran.com** (CORS terbuka).

- Yang dikirim **hanya ID kab/kota + tahun/bulan**. Catatan haid, nama, dan PIN tidak pernah dikirim.
- Jadwal disimpan di perangkat (ikut terenkripsi bila PIN aktif), jadi tetap tersedia saat offline.
- Bila belum terunduh atau sedang offline, Tamu memakai hitungan sendiri.
- Bisa dimatikan: **Fikih → Pengaturan jadwal → Hitung di perangkat (offline penuh)**.
- CSP hanya mengizinkan `connect-src 'self' https://api.myquran.com`.

## Menjalankan

Tidak butuh instalasi atau build. Cukup file statis.

```bash
node tools/serve.js
# buka http://localhost:8787
```

Membuka `index.html` langsung (file://) juga bisa. Mode offline (service worker) dan pemasangan sebagai aplikasi hanya aktif lewat `http://localhost` atau HTTPS.

## Online, offline, HP & web

1. **Deploy gratis** ke hosting statis berbasis HTTPS: GitHub Pages, Netlify, atau Cloudflare Pages. Unggah seluruh folder; tidak ada backend.
2. **Pasang di HP:**
   - Android (Chrome): buka situsnya → menu ⋮ → **Instal aplikasi / Tambahkan ke layar utama**.
   - iPhone (Safari): **Bagikan → Tambahkan ke Layar Utama**.
3. Setelah sekali dibuka, Tamu **berjalan tanpa internet** sepenuhnya.
4. **Pindah perangkat / HP ↔ laptop:** Pengaturan → Ekspor cadangan (beri kata sandi) → Impor di perangkat lain.
5. **Play Store (opsional, nanti):** bungkus PWA ini dengan Trusted Web Activity (Bubblewrap) atau Capacitor tanpa mengubah kode.

## Struktur

```
index.html              kerangka aplikasi + Content-Security-Policy ketat
manifest.webmanifest    metadata PWA
sw.js                   cache offline
css/style.css           tampilan (terang/gelap, mobile-first)
js/util.js              tanggal, format, Hijriah
js/store.js             penyimpanan lokal + enkripsi
js/prayer.js            perhitungan waktu shalat offline + daftar kota
js/kemenag.js           jadwal resmi Kemenag (unduh, simpan, cocokkan zona waktu)
js/cycle.js             statistik, prediksi, fase
js/fiqh.js              kaidah haid/nifas/istihadhah, analisis shalat, qadha
js/content.js           artikel edukasi & basis tanya-jawab
js/qa.js                mesin pencari tanya-jawab offline
js/kitab.js             pencarian kutipan kitab 4 mazhab (Indonesia → istilah Arab)
data/kitab.js|json      pustaka kutipan kitab (dibangun tools/build-kitab.js)
tools/build-kitab.js    pembangun pustaka kitab dari OpenITI
js/app.js               antarmuka & navigasi
assets/                 logo & ikon
docs/                   analisis & rujukan
tools/serve.js          server lokal untuk pengembangan
```

Dokumen lain:
- [docs/analisis-celah.md](docs/analisis-celah.md): kelemahan aplikasi sejenis dan jawaban Tamu
- [docs/fikih-rujukan.md](docs/fikih-rujukan.md): kaidah fikih yang diterapkan di kode beserta batasannya

## Penting

Bagian fikih mengikuti mazhab Syafi'i dan **bukan fatwa**. Kasus rumit (istihadhah, nifas, keguguran) sebaiknya dikonsultasikan dengan ustadzah. Prediksi siklus **bukan alat kontrasepsi** dan **bukan diagnosis medis**. Sebelum rilis publik, minta ustadzah/ahli fikih dan tenaga kesehatan meninjau konten.

## Hak cipta & lisensi

© Tamu. Hak cipta atas kode, desain, logo, dan tulisan asli Tamu dilindungi Undang-Undang Republik Indonesia Nomor 28 Tahun 2014 tentang Hak Cipta. Footer di aplikasi menampilkan tahun berjalan secara otomatis (dari jam perangkat).

Konten pihak ketiga mengikuti lisensinya masing-masing dan **tidak** termasuk klaim hak cipta Tamu:

| Konten | Sumber | Lisensi |
|---|---|---|
| Kutipan kitab (`data/kitab.js`, `data/kitab.json`) | OpenITI | CC BY-NC-SA 4.0. Turunan berupa pustaka kutipan ini dibagikan dengan lisensi yang sama, non-komersial |
| Koordinat kab/kota (`data/kota.js`, `tools/data/arrayaccess/`) | ArrayAccess/Indonesia-Postal-And-Area | MIT |
| Perhitungan tabel Hijriah (saat build) | astronomy-engine | MIT |
