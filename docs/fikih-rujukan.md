# Kaidah fikih yang diterapkan di Tamu

Mazhab: **Syafi'i** (mayoritas muslim Indonesia). Rujukan umum: *Fathul Qarib*, *al-Minhaj* (an-Nawawi), *Risalah al-Mahid*, *al-Fiqh al-Manhaji*. Implementasi ada di [`js/fiqh.js`](../js/fiqh.js).

> Dokumen ini untuk pengembang dan peninjau (ustadzah/ahli fikih). Mohon koreksi bila ada yang kurang tepat.

## Batas waktu

| | Minimal | Umumnya | Maksimal |
|---|---|---|---|
| Haid | 24 jam | 6–7 hari | 15 hari |
| Suci antara dua haid | 15 hari | 23–24 hari | – |
| Nifas | sesaat | 40 hari | 60 hari |

## Penilaian satu periode darah (`evaluate`)

Urutan pemeriksaan:

1. **Nifas** (`kind = nifas`): ≤ 60 hari → nifas; > 60 hari → istihadhah setelah hari ke-60.
2. **Ada haid sebelumnya dengan jarak suci < 15 hari:**
   - Total dari awal haid sebelumnya s.d. akhir darah ini ≤ 15 hari → **lanjutan** (qaul as-sahb: darah + masa bersih = satu haid). Puasa wajib di masa bersih diqadha.
   - Melebihi 15 hari → **suci belum 15 hari**: darah dihukumi istihadhah hingga suci genap 15 hari. Darah setelahnya bisa menjadi haid baru bila ≥ 24 jam. Ditandai "perlu konfirmasi ustadzah".
3. **< 24 jam:**
   - Masih berlangsung → tinggalkan shalat/puasa dulu (darah di masa yang memungkinkan haid dianggap haid sampai terbukti sebaliknya).
   - Sudah berhenti dan disusul darah lain dalam 15 hari dengan total darah ≥ 24 jam → **haid (terputus)**.
   - Sudah berhenti tanpa susulan → **bukan haid** (istihadhah). Shalat yang ditinggalkan diqadha.
4. **24 jam – 15 hari → haid.**
5. **> 15 hari → istihadhah.** Tamyiz didahulukan (penjelasan teks). Bila tidak ada tamyiz, pakai **'adah** = lama haid sah terakhir. Bila tidak ada 'adah (mubtada'ah), haid = sehari semalam.

Potongan darah < 24 jam yang terisolasi tidak dipakai sebagai "haid sebelumnya" (`prevHaid`).

## Shalat di awal & akhir haid (`atStart`, `atEnd`)

Sumber waktu shalat, berurutan:
1. **Jadwal resmi Bimas Islam Kemenag RI** per kab/kota ([`js/kemenag.js`](../js/kemenag.js)), diambil lewat api.myquran.com dan disimpan di perangkat. Jam setempat (WIB/WITA/WIT, ditentukan dari provinsi) dikonversi ke waktu absolut.
2. **Hitungan offline** ([`js/prayer.js`](../js/prayer.js)) bila jadwal belum ada: Subuh 20°, Isya 18°, Ashar bayangan 1× (Syafi'i), ihtiyath +2 menit.

Uji perbandingan 21 Nov 2026: untuk Jakarta, Medan, Makassar, dan Jayapura, hitungan offline selisih ±2 menit dari metode Kemenag tanpa ketinggian. Tetapi untuk **Bandung** (±700 m dpl), jadwal resmi Kemenag menunjukkan Maghrib 6 menit lebih lambat dan Terbit 5 menit lebih awal, kemungkinan karena koreksi ketinggian tempat. Karena itu jadwal resmi diutamakan.

- **Awal haid:** bila haid datang setelah waktu shalat berjalan ≥ 10 menit (perkiraan cukup untuk bersuci dan shalat) dan shalat itu belum dikerjakan → wajib qadha. Bila haid mulai di waktu dhuha → tidak ada qadha.
- **Akhir haid:** shalat pada waktu itu wajib dikerjakan (syarat: tersisa minimal kadar takbiratul ihram).
  - Suci di waktu Ashar → Dzuhur + Ashar
  - Suci di waktu Isya → Maghrib + Isya
  - Suci di waktu Subuh/Dzuhur/Maghrib → shalat itu saja
  - Suci di waktu dhuha → shalat pertama yang wajib adalah Dzuhur

## Qadha puasa Ramadhan (`ramadanDays`)

Untuk setiap hari dalam rentang yang dihukumi haid/nifas (`haidRange`), hari itu dihitung sebagai hutang bila:
- tanggal Hijriahnya (Umm al-Qura via `Intl`) bulan ke-9, **dan**
- rentang darah beririsan dengan siang hari (Subuh–Maghrib) kota pengguna.

Untuk kasus *lanjutan*, rentang dimulai dari akhir darah sebelumnya, sehingga hari bersih (naqa') ikut terhitung. Kalender Umm al-Qura bisa berselisih ±1 hari dengan penetapan Kemenag, dan pengguna bisa mengoreksi secara manual.

## Perbandingan 4 mazhab (halaman Tanya)

Ringkasan pendapat Hanafi, Maliki, Syafi'i, dan Hanbali untuk 20 topik ada di `MZ` dalam [`js/content.js`](../js/content.js). Statusnya **draf**: ditulis dari pendapat masyhur tiap mazhab, lalu dicocokkan dengan kutipan kitab yang tampil di bawahnya. Contoh yang sudah dicek terhadap teks:
- Nifas maksimal: Hanafi 40 (al-Quduri), Maliki 60 (al-Kafi), Syafi'i 60 dan umumnya 40 (Minhaj), Hanbali 40 ('Umdah).
- Masa suci minimal 13 hari menurut Hanbali (al-Mughni: «وأقل الطهر بين الحيضتين ثلاثة عشر يوما»).
- Flek kuning/keruh di hari haid adalah haid menurut Hanafi (al-Quduri: «وما تراه المرأة من الحمرة والصفرة والكدرة في أيام الحيض فهو حيض»).

**Wajib ditinjau** ustadzah/ahli perbandingan mazhab sebelum rilis publik, terutama: kafarat jima' (riwayat Hanbali), Maliki tentang membaca Al-Qur'an dan mushaf bagi guru/murid, batas usia menopause, serta rincian istihadhah per mazhab.

## Batasan yang disadari

- Rincian istihadhah (mumayyizah, mu'tadah, mutahayyirah) baru dijelaskan secara teks, belum dihitung otomatis dari catatan warna darah.
- Darah setelah nifas yang berhenti lalu kembali (jarak < 15 hari dalam 60 hari = nifas; ≥ 15 hari = haid) dijelaskan di artikel, tetapi belum otomatis.
- Usia minimal haid (±9 tahun Hijriah) tidak diperiksa karena aplikasi tidak menanyakan tanggal lahir, demi privasi.
- Hanya mazhab Syafi'i.
