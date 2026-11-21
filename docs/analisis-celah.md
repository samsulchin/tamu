# Analisis celah aplikasi pelacak haid & jawaban Tamu

## 1. Masalah utama: data kesehatan paling pribadi disimpan di server orang lain

Data siklus haid mengungkap aktivitas seksual, upaya hamil, kehamilan, dan keguguran. Kasus yang tercatat publik:

- **Flo Health (2021):** Komisi Perdagangan Federal AS (FTC) menyelesaikan kasus karena aplikasi ini membagikan data kesehatan pengguna ke pihak ketiga, termasuk layanan analitik dan pemasaran, padahal sudah berjanji merahasiakannya.
- **Premom (2023):** FTC menindak aplikasi kesuburan ini karena membagikan data sensitif pengguna ke pihak ketiga tanpa izin yang jelas.
- Setelah 2022, banyak perempuan di AS menghapus aplikasi haid karena khawatir datanya diminta pihak berwenang.

Polanya sama: **ada server, ada akun, ada SDK iklan/analitik**. Selama data berada di server, ada risiko kebocoran, penjualan, atau permintaan paksa.

## 2. Celah lain yang ditemukan

| Celah pada aplikasi sejenis | Dampak | Jawaban Tamu |
|---|---|---|
| Wajib daftar akun (email/nomor HP/Google) | Identitas terhubung langsung dengan data haid | **Tanpa akun.** Nama panggilan opsional, hanya untuk sapaan |
| Data disinkron ke cloud | Risiko bocor, dijual, atau diminta pihak lain | **Tanpa server.** Semua di `localStorage` perangkat |
| SDK iklan & analitik pihak ketiga | Perilaku pengguna dilacak | **Nol skrip pihak ketiga.** CSP hanya mengizinkan satu koneksi keluar, yaitu jadwal shalat Kemenag (hanya ID kab/kota yang dikirim, bisa dimatikan) |
| Tidak ada enkripsi lokal | Siapa pun yang memegang HP bisa membuka | **PIN + AES-256-GCM.** Tanpa PIN, data tidak terbaca |
| Fitur penting berbayar (premium) | Tidak semua orang mampu | **Gratis seluruhnya** |
| Butuh internet | Tidak bisa dipakai di daerah sinyal lemah | **Offline penuh** setelah sekali dibuka (PWA) |
| Prediksi berupa satu tanggal pasti | Menyesatkan untuk siklus tidak teratur | Prediksi berupa **rentang** + label keteraturan |
| Tidak ada fikih sama sekali | Muslimah bingung soal shalat, puasa, mandi wajib | Status fikih harian, penilaian darah, pengingat mandi |
| Aplikasi fikih haid yang ada hanya kalkulator | Tidak terhubung dengan pencatatan siklus | Fikih **terintegrasi** dengan catatan; hukum diperbarui otomatis saat darah berlanjut/berhenti |
| Mencatat per tanggal, bukan per jam | Tidak bisa menentukan < 24 jam, atau shalat mana yang wajib diqadha | Catat **tanggal + jam**, ditambah analisis waktu shalat offline |
| Tidak menghitung hutang puasa | Qadha sering lupa jumlahnya | **Otomatis** dari kalender Hijriah, plus pelacak qadha |
| Tidak menangani istihadhah, naqa', nifas | Kasus nyata tidak terjawab | Kaidah > 15 hari ('adah/tamyiz), suci < 15 hari, naqa' (as-sahb), nifas 60 hari |
| Konten berbahasa Inggris / terjemahan kaku | Sulit dipahami | Bahasa Indonesia sehari-hari, konteks Indonesia (Kemenag, 50 kota) |
| Tanya ustadz via chat online | Pertanyaan pribadi tersimpan di server | Tanya-jawab **offline** dari pustaka lokal, ditambah perbandingan 4 mazhab dan kutipan asli 14 kitab |
| Chatbot AI umum menjawab fikih tanpa sumber | Jawaban bisa mengarang, tanpa rujukan | Tanpa AI generatif: jawaban dari pustaka yang dikurasi, disertai kutipan asli kitab yang bisa dicek |
| Sulit pindah HP tanpa cloud | Data hilang | Ekspor/impor cadangan **terenkripsi kata sandi** |
| Tidak bisa menghapus data dengan tuntas | Data tertinggal di server | **Hapus semua** = benar-benar terhapus, karena tidak ada salinan lain |

## 3. Pertukaran (trade-off) yang disadari

- **Tidak ada sinkron otomatis antarperangkat.** Ini konsekuensi tanpa server. Solusinya cadangan manual terenkripsi. Ke depan bisa ditambah sinkron *end-to-end encrypted* melalui penyimpanan milik pengguna sendiri (misalnya file di Google Drive pengguna), tanpa server Tamu.
- **PIN yang lupa tidak bisa dipulihkan.** Ini harga dari enkripsi sungguhan. Aplikasi mengingatkan pengguna untuk menyimpan cadangan.
- **Notifikasi terjadwal terbatas.** Push notification butuh server. Untuk saat ini pengingat tampil saat aplikasi dibuka. Versi Capacitor/TWA nanti bisa memakai notifikasi lokal perangkat.
- **Tanya-jawab bukan AI.** Ini sengaja, supaya pertanyaan tidak dikirim ke layanan luar dan jawabannya terkurasi (tidak mengarang). Pustaka bisa terus ditambah.

## 4. Peta jalan usulan

1. Tinjauan konten oleh ustadzah/ahli fikih dan bidan/dokter
2. Pengingat lokal (haid mendekat, jadwal qadha Senin–Kamis) lewat Capacitor
3. Rincian istihadhah lebih lengkap (mumayyizah/mu'tadah) memakai catatan warna darah
4. Mode hamil & menyusui
5. Pilihan mazhab lain (Hanafi/Maliki/Hanbali) untuk batas waktu
6. Sinkron opsional terenkripsi ujung-ke-ujung ke penyimpanan milik pengguna
7. Ekspor laporan PDF untuk dibawa ke dokter
