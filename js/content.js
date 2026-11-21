/* Tamu — konten edukasi (kesehatan & fikih). Ditulis berdasarkan mazhab Syafi'i untuk bagian fikih.
 * Bukan fatwa dan bukan nasihat medis. Untuk kasus khusus, rujuk ustadzah/ulama dan tenaga kesehatan.
 */
window.Tamu = window.Tamu || {};
(function (T) {
  'use strict';

  const PHASES = {
    menstruasi: {
      name: 'Menstruasi', tag: 'Hari haid', color: 'mens',
      short: 'Lapisan dinding rahim luruh dan keluar sebagai darah.',
      hormon: 'Estrogen dan progesteron berada di titik terendah.',
      tubuh: ['Kram perut & pegal punggung', 'Mudah lelah', 'Butuh istirahat lebih'],
      tips: ['Kompres hangat di perut', 'Perbanyak makanan kaya zat besi (daging, hati, bayam, kacang)', 'Ganti pembalut tiap 4–6 jam', 'Olahraga ringan: jalan santai, peregangan'],
      ibadah: 'Tidak shalat & puasa, tetapi tetap dekat dengan Allah: dzikir pagi-petang, istighfar, shalawat, doa, dan mendengarkan murottal.',
    },
    folikular: {
      name: 'Folikular', tag: 'Setelah haid', color: 'foli',
      short: 'Folikel di indung telur berkembang, dinding rahim menebal kembali.',
      hormon: 'FSH memicu folikel. Estrogen naik perlahan.',
      tubuh: ['Energi & semangat meningkat', 'Kulit cenderung lebih cerah', 'Suasana hati lebih stabil'],
      tips: ['Waktu yang baik untuk olahraga lebih intens', 'Makan protein & sayur hijau', 'Rencanakan target ibadah & qadha puasa'],
      ibadah: 'Masa yang baik untuk membayar qadha puasa Ramadhan dan menambah amalan sunnah.',
    },
    ovulasi: {
      name: 'Ovulasi', tag: 'Masa subur', color: 'ovu',
      short: 'Sel telur dilepaskan dari indung telur. Ini puncak masa subur.',
      hormon: 'Lonjakan LH; estrogen mencapai puncak.',
      tubuh: ['Lendir serviks bening, licin & elastis (seperti putih telur)', 'Kadang nyeri ringan di satu sisi perut', 'Gairah meningkat'],
      tips: ['Program hamil: inilah jendela paling subur', 'Ingat: prediksi ini perkiraan, bukan alat kontrasepsi', 'Cukupi cairan & tidur'],
      ibadah: 'Keluarnya lendir bening (bukan darah) tidak menghalangi shalat, tetapi membatalkan wudhu.',
    },
    luteal: {
      name: 'Luteal', tag: 'Menjelang haid', color: 'lute',
      short: 'Korpus luteum menghasilkan progesteron untuk menyiapkan rahim.',
      hormon: 'Progesteron tinggi, lalu turun bila tidak terjadi kehamilan.',
      tubuh: ['Gejala PMS: kembung, jerawat, payudara nyeri', 'Mudah sensitif atau cemas', 'Nafsu makan naik'],
      tips: ['Kurangi garam, gula, dan kafein', 'Makanan kaya magnesium: pisang, cokelat hitam, kacang', 'Tidur cukup, olahraga ringan', 'Siapkan pembalut menjelang perkiraan haid'],
      ibadah: 'Bila emosi naik, perbanyak istighfar dan wudhu. Rasulullah ﷺ mengajarkan wudhu untuk meredakan marah.',
    },
  };

  const CATS = [
    { id: 'siklus', name: 'Siklus & Kesehatan' },
    { id: 'fikih', name: 'Fikih Haid' },
    { id: 'nifas', name: 'Nifas & Istihadhah' },
    { id: 'ibadah', name: 'Ibadah & Amalan' },
  ];

  const ARTICLES = [
    {
      id: 'siklus-dasar', cat: 'siklus', title: 'Mengenal siklus menstruasi', mins: 3,
      body: `<p>Siklus menstruasi dihitung dari <b>hari pertama haid</b> sampai sehari sebelum haid berikutnya. Pada perempuan dewasa, siklus normal berkisar <b>21–35 hari</b>. Pada remaja bisa 21–45 hari karena hormon belum stabil.</p>
<p>Dalam satu siklus ada empat fase:</p>
<ol><li><b>Menstruasi</b>: dinding rahim luruh.</li><li><b>Folikular</b>: folikel tumbuh dan estrogen naik.</li><li><b>Ovulasi</b>: sel telur dilepas (masa subur).</li><li><b>Luteal</b>: progesteron tinggi, lalu menurun menjelang haid.</li></ol>
<h3>Medis vs fikih</h3>
<p>Secara medis, haid umumnya 2–7 hari. Fikih (mazhab Syafi'i) punya batas sendiri untuk menentukan hukum ibadah: <b>minimal 24 jam, umumnya 6–7 hari, maksimal 15 hari</b>. Masa suci di antara dua haid minimal <b>15 hari</b>. Tamu menampilkan keduanya: prediksi siklus untuk kesehatan, dan status hukum untuk ibadah.</p>
<h3>Kenapa perlu mencatat?</h3>
<p>Catatan yang rutin membantu kamu mengetahui kebiasaan (<i>'adah</i>), dan ini penting dalam fikih bila suatu saat terjadi istihadhah. Catatan juga sangat membantu dokter bila ada keluhan.</p>`,
    },
    {
      id: 'empat-fase', cat: 'siklus', title: '4 fase siklus & apa yang terjadi', mins: 4,
      body: () => Object.values(PHASES).map((p) => `<h3>${p.name} <small>(${p.tag})</small></h3><p>${p.short} ${p.hormon}</p><p><b>Yang mungkin dirasakan:</b> ${p.tubuh.join(', ')}.</p><p><b>Tips:</b> ${p.tips.join('; ')}.</p>`).join('') +
        `<p class="note">Ovulasi biasanya terjadi sekitar <b>14 hari sebelum haid berikutnya</b> (fase luteal relatif tetap 12–14 hari). Jadi pada siklus 28 hari ovulasi sekitar hari ke-14, sedangkan pada siklus 35 hari sekitar hari ke-21.</p>`,
    },
    {
      id: 'pms', cat: 'siklus', title: 'PMS & nyeri haid', mins: 3,
      body: `<p><b>PMS</b> (sindrom pramenstruasi) muncul pada fase luteal, sekitar 1–2 minggu sebelum haid. Gejalanya antara lain kembung, payudara nyeri, jerawat, mudah marah, sedih, dan ngidam makanan.</p>
<p><b>Nyeri haid (dismenore)</b> disebabkan prostaglandin yang membuat rahim berkontraksi.</p>
<h3>Yang bisa membantu</h3><ul><li>Kompres hangat di perut bawah atau punggung</li><li>Olahraga ringan dan peregangan</li><li>Kurangi garam, gula, dan kafein menjelang haid</li><li>Tidur cukup</li><li>Obat pereda nyeri yang dijual bebas sesuai aturan pakai, bila perlu</li></ul>
<p class="warn">Periksakan diri ke dokter bila nyeri sangat hebat sampai tidak bisa beraktivitas, makin parah dari bulan ke bulan, atau disertai nyeri saat berhubungan. Ini bisa menjadi tanda endometriosis atau masalah lain.</p>`,
    },
    {
      id: 'tanda-bahaya', cat: 'siklus', title: 'Kapan harus ke dokter?', mins: 2,
      body: `<p>Segera konsultasi ke dokter atau bidan bila:</p><ul>
<li>Haid tidak datang selama <b>3 bulan</b> berturut-turut dan kamu tidak hamil</li>
<li>Siklus terus-menerus <b>lebih pendek dari 21 hari</b> atau <b>lebih panjang dari 35 hari</b></li>
<li>Haid lebih dari <b>7 hari</b>, atau sangat deras (ganti pembalut tiap 1–2 jam, ada gumpalan besar)</li>
<li>Perdarahan di luar jadwal haid atau setelah berhubungan</li>
<li>Nyeri sangat hebat, demam, atau keluar cairan berbau tidak sedap</li>
<li>Pusing, lemas, dan pucat (kemungkinan anemia)</li>
<li>Perdarahan saat hamil, atau setelah menopause</li></ul>
<p class="note">Tamu hanya alat bantu catat dan perkiraan, bukan alat diagnosis.</p>`,
    },
    {
      id: 'telat', cat: 'siklus', title: 'Haid terlambat: apa penyebabnya?', mins: 3,
      body: `<p>Haid disebut terlambat bila belum datang lebih dari sekitar <b>7 hari</b> dari perkiraan. Penyebab yang umum:</p>
<ul><li><b>Kehamilan</b>: lakukan tes kehamilan (test pack) dengan urine pagi</li><li>Stres berat, kurang tidur, atau perubahan rutinitas (perjalanan, begadang)</li><li>Perubahan berat badan yang drastis atau olahraga berlebihan</li><li>Menyusui</li><li>PCOS (sindrom ovarium polikistik) atau gangguan tiroid</li><li>Efek kontrasepsi hormonal</li></ul>
<p>Secara fikih, haid yang terlambat tidak mengubah apa pun: selama tidak ada darah, kamu suci dan wajib shalat serta puasa.</p>`,
    },
    {
      id: 'kebersihan', cat: 'siklus', title: 'Kebersihan saat haid', mins: 2,
      body: `<ul><li>Ganti pembalut setiap <b>4–6 jam</b>, atau lebih sering bila deras</li><li>Basuh area kewanitaan dari depan ke belakang dengan air bersih. Hindari sabun pewangi di dalam vagina.</li><li>Cuci tangan sebelum dan sesudah mengganti pembalut</li><li>Bungkus pembalut bekas sebelum dibuang. Membilasnya lebih dulu adalah kebiasaan baik untuk menghilangkan najis darah.</li><li>Pakaian yang terkena darah wajib dicuci karena darah haid najis. Bekas warna yang sulit hilang setelah dicuci dimaafkan.</li></ul>`,
    },
    {
      id: 'fikih-dasar', cat: 'fikih', title: 'Dasar fikih haid (mazhab Syafi\'i)', mins: 4,
      body: `<p><b>Haid</b> adalah darah alami yang keluar dari rahim perempuan dalam keadaan sehat, pada waktu tertentu, bukan karena melahirkan.</p>
<table class="tbl"><tr><th></th><th>Minimal</th><th>Umumnya</th><th>Maksimal</th></tr>
<tr><td>Haid</td><td>24 jam</td><td>6–7 hari</td><td>15 hari</td></tr>
<tr><td>Suci di antara dua haid</td><td>15 hari</td><td>23–24 hari</td><td>Tak terbatas</td></tr>
<tr><td>Nifas</td><td>Sesaat</td><td>40 hari</td><td>60 hari</td></tr></table>
<p><b>Usia</b>: haid paling cepat terjadi sekitar usia <b>9 tahun Hijriah</b>. Darah sebelum usia itu bukan haid. Haid pertama menandakan baligh, sehingga sejak saat itu wajib shalat, puasa, dan menutup aurat.</p>
<h3>Hukum darah berdasarkan lamanya</h3><ul>
<li>Kurang dari 24 jam (dan tidak disusul darah lain dalam 15 hari): <b>bukan haid</b>. Shalat yang ditinggalkan diqadha.</li>
<li>24 jam sampai 15 hari: <b>haid</b>.</li>
<li>Lebih dari 15 hari: <b>istihadhah</b>, yang dirinci dengan sifat darah (tamyiz) atau kebiasaan ('adah).</li></ul>
<p class="note">Rujukan: Fathul Qarib, al-Minhaj karya Imam an-Nawawi, dan Risalah al-Mahid. Mazhab lain memiliki batasan berbeda.</p>`,
    },
    {
      id: 'larangan', cat: 'fikih', title: 'Larangan saat haid', mins: 3,
      body: `<p>Perempuan yang sedang haid atau nifas dilarang:</p><ol>
<li><b>Shalat</b>, baik wajib maupun sunnah. Shalat yang ditinggalkan tidak perlu diqadha.</li>
<li><b>Puasa</b>, tetapi puasa wajib (Ramadhan, nadzar) harus diqadha.</li>
<li><b>Thawaf</b>.</li>
<li><b>Menyentuh dan membawa mushaf</b>.</li>
<li><b>Membaca Al-Qur'an</b> dengan niat tilawah, meski hanya sebagian ayat.</li>
<li><b>Berdiam di masjid</b>. Sekadar melintas diperbolehkan bila yakin tidak mengotori masjid.</li>
<li><b>Berhubungan suami-istri</b>, juga bersenang-senang di area antara pusar dan lutut tanpa penghalang. Larangan ini berlaku sampai ia <b>mandi wajib</b>, bukan hanya sampai darah berhenti.</li>
<li><b>Sujud tilawah dan sujud syukur</b>.</li>
<li><b>Dijatuhi talak</b>. Suami haram menceraikan istri saat haid (talak bid'i), walaupun talaknya tetap jatuh.</li></ol>
<p>Dalil puasa diqadha dan shalat tidak: perkataan Aisyah r.a., <i>"Kami diperintahkan mengqadha puasa dan tidak diperintahkan mengqadha shalat."</i> (HR. Muslim)</p>`,
    },
    {
      id: 'warna-darah', cat: 'fikih', title: 'Warna darah, flek & tanda suci', mins: 3,
      body: `<p>Warna darah dari yang paling kuat: <b>hitam → merah → merah muda/kemerahan → kuning (shufrah) → keruh/kecoklatan (kudrah)</b>. Darah yang kental dan berbau lebih kuat daripada yang encer.</p>
<p>Dalam mazhab Syafi'i, cairan <b>kuning atau keruh</b> yang keluar <b>dalam masa yang memungkinkan haid</b> (tidak melebihi 15 hari dan bukan di tengah masa suci minimal) juga dihukumi haid.</p>
<h3>Tanda sudah suci</h3><ul><li>Keluar cairan putih bening (<i>al-qashshah al-baidha'</i>), atau</li><li>Kapas/tisu yang dimasukkan ke bagian luar kemaluan keluar dalam keadaan <b>bersih</b>, tanpa noda kuning atau keruh.</li></ul>
<p>Catat warna darah setiap hari di Tamu. Bila suatu saat terjadi istihadhah, catatan warna ini membantu menentukan <i>tamyiz</i>.</p>`,
    },
    {
      id: 'naqa', cat: 'fikih', title: 'Darah berhenti lalu keluar lagi', mins: 3,
      body: `<p>Kadang darah berhenti sehari atau dua hari lalu keluar lagi. Masa bersih di sela-sela itu disebut <b>naqa'</b>.</p>
<p>Menurut pendapat kuat mazhab Syafi'i (<b>qaul as-sahb</b>), bila total dari awal darah hingga akhir darah <b>tidak lebih dari 15 hari</b> dan jumlah darahnya minimal 24 jam, <b>seluruhnya dihukumi haid</b>, termasuk hari-hari bersihnya.</p>
<h3>Apa yang dilakukan saat darah berhenti?</h3><ul><li>Saat bersih, <b>mandi wajib</b> dan kerjakan shalat serta puasa, karena belum tahu apakah darah akan keluar lagi.</li><li>Jika darah keluar lagi dalam 15 hari, hari bersih tadi ternyata haid. Shalatnya tidak perlu diulang (tidak berdosa), tetapi <b>puasa wajib</b> yang dikerjakan di hari itu harus diqadha.</li></ul>`,
    },
    {
      id: 'shalat', cat: 'fikih', title: 'Haid & kewajiban shalat di awal/akhir waktu', mins: 3,
      body: `<h3>Saat haid datang</h3><p>Jika haid datang <b>setelah masuk waktu shalat</b> dan sudah lewat waktu yang cukup untuk shalat itu, tetapi kamu belum shalat, maka shalat tersebut <b>wajib diqadha</b> setelah suci.</p>
<h3>Saat haid berhenti</h3><p>Jika darah berhenti sebelum waktu shalat habis, walau hanya cukup untuk takbiratul ihram, shalat waktu itu wajib dikerjakan. Bila waktunya terlewat saat mandi, shalat tersebut diqadha.</p>
<ul><li>Suci di waktu <b>Ashar</b>: wajib <b>Dzuhur dan Ashar</b>.</li><li>Suci di waktu <b>Isya</b>: wajib <b>Maghrib dan Isya</b>.</li><li>Suci di waktu Subuh, Dzuhur, atau Maghrib: wajib shalat waktu itu saja.</li></ul>
<p>Saat kamu mencatat jam mulai dan jam berhenti, Tamu mencocokkannya dengan jadwal shalat resmi Kemenag untuk kab/kotamu (atau hitungan offline bila jadwal belum terunduh) dan memberi tahu shalat mana yang perlu dikerjakan atau diqadha.</p>`,
    },
    {
      id: 'puasa', cat: 'fikih', title: 'Haid, puasa Ramadhan & qadha', mins: 3,
      body: `<ul><li>Haid datang di siang hari Ramadhan, walau menjelang Maghrib: <b>puasa hari itu batal</b> dan wajib diqadha.</li>
<li>Darah berhenti <b>sebelum Subuh</b>: berniat puasa pada malam itu. Puasanya sah walaupun mandi wajib baru dilakukan setelah Subuh.</li>
<li>Darah berhenti di siang hari: tidak wajib puasa hari itu, tetapi dianjurkan menahan diri dari makan dan minum untuk menghormati Ramadhan.</li></ul>
<h3>Batas qadha</h3><p>Qadha sebaiknya segera dilakukan, paling lambat <b>sebelum Ramadhan berikutnya</b>. Jika ditunda tanpa uzur hingga Ramadhan berikutnya tiba, menurut mazhab Syafi'i wajib qadha ditambah <b>fidyah 1 mud</b> (sekitar 6–7 ons makanan pokok) untuk setiap hari, dan fidyah ini berlipat sesuai jumlah tahun penundaan.</p>
<h3>Niat qadha puasa Ramadhan</h3><p class="arab" dir="rtl" lang="ar">نَوَيْتُ صَوْمَ غَدٍ عَنْ قَضَاءِ فَرْضِ شَهْرِ رَمَضَانَ لِلّٰهِ تَعَالَى</p><p><i>Nawaitu shauma ghadin 'an qadhā'i fardhi syahri Ramadhāna lillāhi ta'ālā.</i><br>"Aku berniat puasa esok hari untuk mengqadha fardhu bulan Ramadhan karena Allah Ta'ala."</p>
<p>Tamu menghitung otomatis hari Ramadhan yang terlewat dari catatan haidmu (berdasarkan kalender Hijriah Umm al-Qura), dan kamu bisa mencentang setiap qadha yang sudah dibayar.</p>`,
    },
    {
      id: 'mandi', cat: 'ibadah', title: 'Niat & tata cara mandi wajib', mins: 3,
      body: `<h3>Niat</h3><p class="arab" dir="rtl" lang="ar">نَوَيْتُ الْغُسْلَ لِرَفْعِ حَدَثِ الْحَيْضِ لِلّٰهِ تَعَالَى</p><p><i>Nawaitul ghusla liraf'i hadatsil haidhi lillāhi ta'ālā.</i><br>"Aku berniat mandi untuk menghilangkan hadats haid karena Allah Ta'ala." Untuk nifas, ganti kata <i>al-haidhi</i> dengan <i>an-nifāsi</i>.</p>
<h3>Rukun (wajib)</h3><ol><li>Niat, dalam hati, bersamaan dengan pertama kali air mengenai badan</li><li>Meratakan air ke <b>seluruh kulit dan rambut</b>, termasuk lipatan tubuh, pusar, dan bagian luar kemaluan yang tampak saat jongkok</li></ol>
<h3>Sunnah</h3><ol><li>Membaca basmalah</li><li>Mencuci tangan, lalu membersihkan kemaluan dan sisa darah</li><li>Berwudhu seperti wudhu shalat</li><li>Menyela pangkal rambut dengan jari, lalu menyiram kepala tiga kali</li><li>Menyiram tubuh bagian kanan, lalu kiri</li><li>Menggosok badan</li><li>Mengusapkan kapas berwewangian pada bekas darah, sesuai tuntunan Nabi ﷺ kepada Asma' r.a. (HR. Muslim)</li></ol>
<p class="note">Rambut yang dikepang tidak wajib diurai bila air bisa sampai ke kulit kepala dan rambutnya. Pastikan tidak ada penghalang air seperti cat kuku, lem bulu mata, atau riasan tebal yang kedap air.</p>`,
    },
    {
      id: 'amalan', cat: 'ibadah', title: 'Amalan yang tetap bisa dilakukan saat haid', mins: 2,
      body: `<p>Haid bukan berarti jauh dari Allah. Yang bisa tetap dikerjakan:</p><ul>
<li>Dzikir pagi dan petang, tasbih, tahmid, tahlil, takbir</li><li>Istighfar dan shalawat kepada Nabi ﷺ</li><li>Berdoa, termasuk doa-doa yang berasal dari ayat Al-Qur'an bila diniatkan sebagai doa atau dzikir</li>
<li>Mendengarkan murottal dan kajian</li><li>Membaca dan mempelajari buku tafsir (yang tafsirnya lebih banyak dari teks ayat), hadits, dan fikih</li><li>Menghadiri majelis ilmu di tempat selain masjid</li><li>Sedekah, menyambung silaturahmi, dan berbakti kepada orang tua</li><li>Mengajarkan kebaikan kepada anak</li></ul>`,
    },
    {
      id: 'quran', cat: 'ibadah', title: 'Membaca & menyentuh Al-Qur\'an saat haid', mins: 3,
      body: `<p>Dalam mazhab Syafi'i, perempuan haid <b>haram membaca Al-Qur'an dengan niat tilawah</b> dan <b>haram menyentuh serta membawa mushaf</b>.</p>
<p>Yang dibolehkan:</p><ul><li>Membaca dalam hati tanpa melafalkan, atau melihat tulisan mushaf tanpa menyentuhnya</li><li>Membaca ayat yang bernilai dzikir atau doa (misalnya <i>bismillah</i>, <i>alhamdulillah</i>, ayat kursi untuk perlindungan) dengan <b>niat dzikir</b>, bukan tilawah</li><li>Mendengarkan bacaan Al-Qur'an</li><li>Membawa mushaf bersama barang lain bila tujuannya membawa barang tersebut, atau dalam keadaan darurat (khawatir mushaf rusak atau hilang)</li></ul>
<p><b>Penghafal Al-Qur'an dan guru ngaji:</b> mazhab Maliki membolehkan perempuan haid membaca Al-Qur'an karena kebutuhan, seperti menjaga hafalan atau mengajar. Sebagian ulama di Indonesia mengikuti pendapat ini untuk kebutuhan tersebut.</p>
<p><b>Al-Qur'an di HP:</b> banyak ulama kontemporer berpendapat aplikasi Al-Qur'an di ponsel tidak dihukumi mushaf, sehingga ponselnya boleh dipegang. Hukum membaca dengan lisan tetap mengikuti hukum tilawah di atas.</p>`,
    },
    {
      id: 'istihadhah', cat: 'nifas', title: 'Istihadhah: darah penyakit', mins: 4,
      body: `<p><b>Istihadhah</b> adalah darah yang keluar di luar waktu haid dan nifas, misalnya lebih dari 15 hari, kurang dari 24 jam, atau keluar sebelum masa suci 15 hari terpenuhi. Hukumnya seperti orang yang terus-menerus berhadats kecil.</p>
<h3>Kewajiban mustahadhah</h3><ul><li>Tetap <b>wajib shalat dan puasa</b></li><li>Setelah masuk waktu shalat, bersihkan kemaluan, lalu sumbat atau balut (pembalut)</li><li><b>Wudhu setelah masuk waktu</b>, lalu segera shalat</li><li>Satu kali wudhu untuk <b>satu shalat fardhu</b>, ditambah shalat sunnah sesukanya</li><li>Boleh berhubungan suami-istri, menyentuh mushaf, dan membaca Al-Qur'an</li></ul>
<h3>Menentukan mana yang haid bila darah lebih dari 15 hari</h3><ol><li><b>Tamyiz</b> (bisa membedakan sifat darah): darah kuat (hitam atau merah pekat) adalah haid, bila lamanya 24 jam hingga 15 hari. Darah lemah adalah istihadhah.</li><li>Jika tidak bisa membedakan, ikuti <b>'adah</b> (kebiasaan) haid sebelumnya.</li><li>Jika baru pertama haid dan tidak bisa membedakan (<i>mubtada'ah</i>): haid dihitung <b>sehari semalam</b>, sisanya istihadhah, dengan suci 29 hari.</li></ol>
<p class="warn">Kasus istihadhah banyak rinciannya. Simpan catatan Tamu (tanggal, jam, warna darah), lalu tanyakan ke ustadzah yang menguasai fikih haid. Periksakan juga ke dokter, karena istihadhah sering terkait kondisi medis.</p>`,
    },
    {
      id: 'nifas', cat: 'nifas', title: 'Nifas & keguguran', mins: 3,
      body: `<p><b>Nifas</b> adalah darah yang keluar setelah rahim kosong karena melahirkan. Lamanya minimal sesaat, umumnya <b>40 hari</b>, dan paling lama <b>60 hari</b>. Hukumnya sama seperti haid.</p>
<ul><li>Darah yang keluar <b>sebelum</b> bayi lahir (saat kontraksi) bukan nifas.</li><li>Jika darah berhenti sebelum 40 hari, segera mandi wajib, lalu shalat, puasa, dan boleh berhubungan suami-istri.</li><li>Jika darah keluar lagi <b>masih dalam 60 hari</b> dan jarak bersihnya <b>kurang dari 15 hari</b>, darah itu tetap nifas. Bila jarak bersihnya 15 hari atau lebih, darah yang baru dihukumi haid.</li><li>Darah setelah 60 hari: istihadhah.</li></ul>
<h3>Keguguran</h3><p>Jika yang keluar sudah berupa gumpalan darah (<i>'alaqah</i>) atau gumpalan daging (<i>mudghah</i>) yang menurut bidan atau dokter merupakan awal janin, darah setelahnya adalah <b>nifas</b>. Jika belum berbentuk demikian, darah itu dinilai dengan aturan haid atau istihadhah.</p>
<p>Di Tamu, pilih <b>Mulai nifas</b> pada halaman Fikih agar perhitungannya memakai batas nifas, bukan batas haid.</p>`,
    },
    {
      id: 'privasi', cat: 'siklus', title: 'Kenapa data di Tamu aman', mins: 2,
      body: `<ul><li><b>Tidak ada server.</b> Tamu tidak punya basis data online. Semua catatan disimpan di perangkatmu sendiri.</li><li><b>Tanpa akun, tanpa email, tanpa nomor HP.</b></li><li><b>Tanpa iklan, pelacak, atau analitik.</b> Tamu tidak memuat skrip dari pihak lain.</li><li><b>Satu-satunya koneksi internet</b> adalah untuk mengunduh jadwal shalat resmi Kemenag (data Bimas Islam melalui api.myquran.com). Yang dikirim hanya ID kab/kota dan bulan, tanpa data haid atau identitas. Jadwal disimpan di perangkat, dan fitur ini bisa dimatikan di <i>Fikih → Pengaturan jadwal</i> agar Tamu berjalan offline penuh.</li><li><b>Enkripsi PIN</b>: bila PIN diaktifkan, seluruh data dienkripsi dengan AES-256 menggunakan kunci dari PIN kamu. Tanpa PIN, data tidak bisa dibaca, termasuk oleh pembuat aplikasi.</li><li><b>Kamu pemilik data.</b> Ekspor cadangan (bisa diberi kata sandi) untuk pindah HP, atau hapus semuanya kapan saja.</li></ul>
<p class="note">Karena tidak ada server, PIN yang lupa tidak bisa dipulihkan. Simpan cadangan secara berkala.</p>`,
    },
  ];

  /* ---------- Basis tanya-jawab (offline) ---------- */
  const QA = [
    { k: 'lama minimal maksimal haid berapa hari batas', q: 'Berapa lama minimal dan maksimal haid?', a: 'Menurut mazhab Syafi\'i, haid paling sedikit <b>sehari semalam (24 jam)</b>, umumnya <b>6 atau 7 hari</b>, dan paling lama <b>15 hari 15 malam</b>.', see: 'fikih-dasar' },
    { k: 'masa suci minimal jarak antara dua haid', q: 'Berapa lama minimal masa suci di antara dua haid?', a: 'Masa suci minimal <b>15 hari</b>. Umumnya 23–24 hari, dan tidak ada batas maksimal. Darah yang keluar sebelum genap 15 hari suci bukan haid baru.', see: 'fikih-dasar' },
    { k: 'kurang 24 jam sehari flek sebentar bukan haid', q: 'Darah keluar kurang dari 24 jam, apakah termasuk haid?', a: 'Tidak. Jika darah berhenti sebelum 24 jam dan tidak disusul darah lain dalam 15 hari, darah itu <b>bukan haid</b>, melainkan istihadhah (darah fasad). Shalat yang ditinggalkan selama itu <b>wajib diqadha</b>.', see: 'fikih-dasar' },
    { k: 'lebih 15 hari lama tidak berhenti terus keluar', q: 'Darah keluar lebih dari 15 hari, bagaimana hukumnya?', a: 'Itu tanda <b>istihadhah</b>. Haidnya ditentukan dengan urutan: (1) sifat darah (tamyiz): darah kuat adalah haid; (2) bila tidak bisa membedakan, ikuti kebiasaan (\'adah) haid sebelumnya; (3) bila baru pertama haid, haid dihitung sehari semalam. Di luar itu tetap wajib shalat dan puasa. Konsultasikan dengan ustadzah.', see: 'istihadhah' },
    { k: 'istihadhah apa itu kewajiban wudhu shalat', q: 'Apa itu istihadhah dan apa kewajibannya?', a: 'Istihadhah adalah darah penyakit di luar haid dan nifas. Mustahadhah <b>tetap wajib shalat dan puasa</b>. Caranya: setelah masuk waktu, bersihkan kemaluan dan pakai pembalut, berwudhu, lalu segera shalat. Satu wudhu hanya untuk satu shalat fardhu.', see: 'istihadhah' },
    { k: 'flek coklat kuning keruh sebelum sesudah haid', q: 'Flek coklat atau kuning termasuk haid?', a: 'Dalam mazhab Syafi\'i, cairan <b>kuning (shufrah)</b> dan <b>keruh/kecoklatan (kudrah)</b> yang keluar dalam masa yang memungkinkan haid (total tidak melebihi 15 hari dan masa suci minimal 15 hari sudah terpenuhi) <b>dihukumi haid</b>.', see: 'warna-darah' },
    { k: 'tanda suci tahu sudah bersih selesai cairan putih kapas', q: 'Bagaimana mengetahui haid sudah selesai?', a: 'Tanda suci: keluar <b>cairan putih bening</b>, atau kapas/tisu yang dimasukkan ke bagian luar kemaluan keluar <b>bersih tanpa noda</b> kuning atau keruh. Setelah itu segera mandi wajib.', see: 'warna-darah' },
    { k: 'berhenti keluar lagi terputus putus naqa bersih sehari', q: 'Darah berhenti sehari lalu keluar lagi, bagaimana?', a: 'Selama total dari awal hingga akhir darah <b>tidak melebihi 15 hari</b>, seluruhnya termasuk hari bersih di sela-selanya dihukumi haid (qaul as-sahb). Saat bersih, tetap mandi dan shalat. Jika darah kembali, puasa wajib yang dikerjakan di hari bersih itu harus diqadha.', see: 'naqa' },
    { k: 'haid datang masuk waktu shalat qadha belum shalat', q: 'Haid datang setelah masuk waktu shalat, apakah wajib qadha?', a: 'Ya, jika sejak masuk waktu sudah lewat waktu yang cukup untuk mengerjakan shalat itu tetapi kamu belum shalat, shalat tersebut <b>wajib diqadha</b> setelah suci. Catat jam mulai haid di Tamu untuk melihat analisisnya.', see: 'shalat' },
    { k: 'suci waktu ashar isya dzuhur maghrib wajib jamak', q: 'Suci di waktu Ashar, apakah wajib shalat Dzuhur juga?', a: 'Ya. Dalam mazhab Syafi\'i, suci di waktu <b>Ashar</b> mewajibkan <b>Dzuhur dan Ashar</b>, dan suci di waktu <b>Isya</b> mewajibkan <b>Maghrib dan Isya</b>, karena pasangan shalat ini bisa dijamak. Syaratnya, waktu yang tersisa minimal cukup untuk takbiratul ihram.', see: 'shalat' },
    { k: 'shalat qadha ditinggal selama haid diganti', q: 'Apakah shalat yang ditinggalkan saat haid harus diganti?', a: '<b>Tidak.</b> Shalat yang ditinggalkan karena haid atau nifas tidak diqadha. Yang wajib diqadha adalah <b>puasa</b>. Aisyah r.a. berkata: "Kami diperintahkan mengqadha puasa dan tidak diperintahkan mengqadha shalat." (HR. Muslim)', see: 'larangan' },
    { k: 'haid saat puasa siang hari batal menjelang maghrib', q: 'Haid datang saat sedang puasa, bagaimana?', a: 'Puasa hari itu <b>batal</b>, walaupun haid datang sesaat sebelum Maghrib, dan wajib diqadha. Kamu boleh makan dan minum, tetapi sebaiknya tidak di hadapan orang yang berpuasa.', see: 'puasa' },
    { k: 'suci malam sebelum subuh belum mandi puasa sah sahur', q: 'Suci sebelum Subuh tapi belum mandi, apakah puasanya sah?', a: '<b>Sah</b>, asalkan darah sudah berhenti sebelum fajar dan kamu berniat puasa di malam hari. Mandi wajib boleh dilakukan setelah Subuh, tetapi jangan sampai shalat Subuh terlewat.', see: 'puasa' },
    { k: 'batas qadha puasa fidyah tunda ramadhan berikutnya', q: 'Sampai kapan batas qadha puasa? Apakah ada fidyah?', a: 'Qadha paling lambat <b>sebelum Ramadhan berikutnya</b>. Jika ditunda tanpa uzur hingga Ramadhan berikutnya tiba, menurut mazhab Syafi\'i wajib <b>qadha ditambah fidyah 1 mud</b> (sekitar 6–7 ons makanan pokok) per hari, berlipat sesuai jumlah tahun penundaan.', see: 'puasa' },
    { k: 'niat qadha puasa ramadhan bacaan lafal', q: 'Bagaimana niat qadha puasa Ramadhan?', a: '<span class="arab" dir="rtl" lang="ar">نَوَيْتُ صَوْمَ غَدٍ عَنْ قَضَاءِ فَرْضِ شَهْرِ رَمَضَانَ لِلّٰهِ تَعَالَى</span><br><i>Nawaitu shauma ghadin \'an qadhā\'i fardhi syahri Ramadhāna lillāhi ta\'ālā.</i> Niat qadha wajib dilakukan pada malam hari sebelum fajar.', see: 'puasa' },
    { k: 'niat mandi wajib haid bacaan lafal mandi besar', q: 'Bagaimana niat mandi wajib setelah haid?', a: '<span class="arab" dir="rtl" lang="ar">نَوَيْتُ الْغُسْلَ لِرَفْعِ حَدَثِ الْحَيْضِ لِلّٰهِ تَعَالَى</span><br><i>Nawaitul ghusla liraf\'i hadatsil haidhi lillāhi ta\'ālā.</i> Rukunnya adalah niat dan meratakan air ke seluruh kulit dan rambut.', see: 'mandi' },
    { k: 'tata cara mandi wajib langkah urutan', q: 'Bagaimana tata cara mandi wajib?', a: 'Wajibnya hanya dua: <b>niat</b> dan <b>meratakan air ke seluruh tubuh dan rambut</b>. Sunnahnya: basmalah, membersihkan kemaluan, berwudhu, menyela pangkal rambut, menyiram kepala 3 kali, mendahulukan bagian kanan, menggosok badan, dan mengusapkan kapas wangi ke bekas darah.', see: 'mandi' },
    { k: 'potong kuku rambut rontok keramas saat haid', q: 'Bolehkah memotong kuku atau rambut saat haid?', a: 'Tidak ada dalil sahih yang melarang. Sebagian ulama (seperti Imam al-Ghazali) menganjurkan tidak memotongnya sampai mandi wajib. Ini hanya anjuran, bukan kewajiban. Rambut yang rontok tidak perlu dikumpulkan dan keramas saat haid boleh.' },
    { k: 'membaca alquran quran ngaji tilawah hafalan', q: 'Bolehkah membaca Al-Qur\'an saat haid?', a: 'Dalam mazhab Syafi\'i, <b>haram dengan niat tilawah</b>. Yang boleh: membaca dalam hati, mendengarkan, dan membaca ayat dzikir/doa dengan niat dzikir. Untuk kebutuhan menjaga hafalan atau mengajar, sebagian ulama mengikuti mazhab Maliki yang membolehkan.', see: 'quran' },
    { k: 'menyentuh pegang membawa mushaf hp aplikasi quran', q: 'Bolehkah menyentuh mushaf atau Al-Qur\'an di HP?', a: 'Menyentuh dan membawa <b>mushaf</b> haram bagi perempuan haid, kecuali darurat atau dibawa bersama barang lain. Banyak ulama kontemporer berpendapat <b>Al-Qur\'an di HP</b> tidak dihukumi mushaf, sehingga ponselnya boleh dipegang.', see: 'quran' },
    { k: 'masuk masjid pengajian majelis taklim lewat', q: 'Bolehkah masuk masjid atau ikut pengajian saat haid?', a: 'Haram <b>berdiam</b> di dalam masjid. Sekadar melintas boleh bila yakin tidak mengotori. Pengajian di aula, serambi yang bukan bagian masjid, rumah, atau majelis lain <b>boleh dihadiri</b>.', see: 'larangan' },
    { k: 'hubungan suami istri jima berhubungan intim', q: 'Bagaimana hubungan suami istri saat haid?', a: '<b>Haram berhubungan intim</b> dan bersenang-senang di area antara pusar dan lutut tanpa penghalang. Larangan ini berlaku sampai istri <b>mandi wajib</b>, bukan hanya sampai darah berhenti. Bercumbu di luar area itu boleh.', see: 'larangan' },
    { k: 'dzikir doa amalan ibadah apa saja boleh', q: 'Amalan apa yang tetap bisa dilakukan saat haid?', a: 'Dzikir, istighfar, shalawat, doa, mendengarkan murottal dan kajian, membaca buku tafsir dan hadits, sedekah, serta menghadiri majelis ilmu di luar masjid.', see: 'amalan' },
    { k: 'haji umrah thawaf manasik', q: 'Haid saat haji atau umrah, bagaimana?', a: 'Semua manasik boleh dikerjakan <b>kecuali thawaf</b>, yang harus menunggu suci dan mandi. Sa\'i dilakukan setelah thawaf. Konsultasikan dengan pembimbing ibadah dan dokter bila perlu.', see: 'larangan' },
    { k: 'pil penunda haid obat tunda menunda', q: 'Bolehkah minum pil penunda haid untuk Ramadhan atau haji?', a: 'Banyak ulama membolehkan selama <b>tidak membahayakan kesehatan</b>, dan sebaiknya berkonsultasi dengan dokter. Bila darah tetap keluar, hukumnya mengikuti hukum darah tersebut.' },
    { k: 'hamil darah keluar saat kehamilan', q: 'Darah keluar saat hamil, apakah haid?', a: 'Menurut qaul jadid mazhab Syafi\'i, darah wanita hamil <b>bisa dihukumi haid</b> bila memenuhi syarat haid (minimal 24 jam, maksimal 15 hari, dan setelah masa suci 15 hari). Tetapi <b>segera periksa ke dokter atau bidan</b>, karena perdarahan saat hamil bisa menjadi tanda bahaya.', see: 'tanda-bahaya' },
    { k: 'nifas berapa lama melahirkan 40 60 hari', q: 'Berapa lama masa nifas?', a: 'Minimal sesaat, umumnya <b>40 hari</b>, maksimal <b>60 hari</b>. Bila berhenti sebelum 40 hari, segera mandi wajib lalu shalat dan puasa. Darah setelah 60 hari dihukumi istihadhah.', see: 'nifas' },
    { k: 'nifas berhenti keluar lagi sebelum 40 hari', q: 'Nifas berhenti lalu keluar darah lagi, bagaimana?', a: 'Jika darah keluar lagi <b>masih dalam 60 hari</b> dan jarak bersihnya <b>kurang dari 15 hari</b>, darah itu tetap nifas. Bila jarak bersihnya 15 hari atau lebih, darah baru tersebut dihukumi <b>haid</b>.', see: 'nifas' },
    { k: 'keguguran gumpalan janin darah setelah', q: 'Darah setelah keguguran, nifas atau haid?', a: 'Jika yang keluar sudah berupa gumpalan darah (\'alaqah) atau daging (mudghah) yang merupakan awal janin, darah setelahnya adalah <b>nifas</b>. Jika belum, darah itu dinilai dengan aturan haid atau istihadhah.', see: 'nifas' },
    { k: 'keputihan cairan putih lendir najis wudhu', q: 'Apakah keputihan termasuk haid? Membatalkan wudhu?', a: 'Keputihan <b>bukan haid</b>, jadi tetap wajib shalat dan puasa. Keluarnya <b>membatalkan wudhu</b>. Menurut pendapat ashah dalam mazhab Syafi\'i, cairan kemaluan (ruthubah) yang normal hukumnya suci, tetapi sebaiknya dibersihkan. Periksakan ke dokter bila berbau, gatal, atau berwarna tidak biasa.' },
    { k: 'usia umur pertama kali haid baligh anak', q: 'Pada usia berapa haid pertama kali bisa terjadi?', a: 'Paling cepat sekitar <b>9 tahun Hijriah</b>. Darah yang keluar sebelum usia itu bukan haid. Haid pertama menandakan baligh, sehingga sejak saat itu wajib shalat, puasa, dan menutup aurat.', see: 'fikih-dasar' },
    { k: 'menunda mandi wajib malas lama setelah suci', q: 'Bolehkah menunda mandi wajib setelah suci?', a: 'Mandi wajib menjadi keharusan ketika akan shalat. Menundanya sampai waktu shalat habis berarti <b>meninggalkan shalat</b>, dan itu berdosa. Segeralah mandi begitu yakin suci.', see: 'mandi' },
    { k: 'sujud tilawah syukur shalat jenazah', q: 'Bolehkah sujud syukur atau shalat jenazah saat haid?', a: 'Tidak boleh. Sujud tilawah, sujud syukur, dan shalat jenazah semuanya mensyaratkan suci dari hadats.', see: 'larangan' },
    { k: 'darah pakaian najis noda bekas mencuci', q: 'Pakaian terkena darah haid, bagaimana?', a: 'Darah haid najis, jadi wajib dicuci hingga hilang zatnya. Bekas warna yang sulit hilang setelah dicuci dengan sungguh-sungguh <b>dimaafkan</b>.', see: 'kebersihan' },
    { k: 'talak cerai saat haid', q: 'Bagaimana hukum talak saat istri haid?', a: 'Suami <b>haram</b> menjatuhkan talak saat istri haid (talak bid\'i), tetapi menurut jumhur ulama talaknya tetap jatuh.', see: 'larangan' },
    { k: 'siklus tidak teratur normal berapa hari', q: 'Siklus saya tidak teratur, apakah normal?', a: 'Siklus normal dewasa <b>21–35 hari</b>, dan selisih beberapa hari antar bulan itu wajar. Siklus yang selalu di luar rentang itu, atau selisihnya lebih dari 7–9 hari, sebaiknya dikonsultasikan ke dokter. Tamu menampilkan <b>rentang</b> perkiraan, bukan satu tanggal, agar lebih jujur untuk siklus tidak teratur.', see: 'siklus-dasar' },
    { k: 'telat terlambat belum haid hamil test pack', q: 'Haid saya terlambat, apa yang harus dilakukan?', a: 'Bila terlambat lebih dari sekitar 7 hari dan ada kemungkinan hamil, lakukan <b>test pack</b>. Penyebab lain: stres, perubahan berat badan, menyusui, PCOS, atau tiroid. Bila 3 bulan tidak haid, periksakan ke dokter. Secara fikih, selama tidak ada darahmu suci.', see: 'telat' },
    { k: 'nyeri kram sakit perut dismenore', q: 'Bagaimana meredakan nyeri haid?', a: 'Kompres hangat, olahraga ringan, cukup tidur, serta kurangi garam dan kafein. Obat pereda nyeri yang dijual bebas boleh dipakai sesuai aturan. Ke dokter bila nyeri sangat hebat atau makin parah.', see: 'pms' },
    { k: 'masa subur ovulasi kapan hamil program', q: 'Kapan masa subur saya?', a: 'Ovulasi terjadi sekitar <b>14 hari sebelum haid berikutnya</b>. Masa subur sekitar 6 hari: 5 hari sebelum ovulasi hingga sehari sesudahnya. Lihat tanda hijau di Kalender. Ingat, ini perkiraan dan <b>bukan alat kontrasepsi</b>.', see: 'empat-fase' },
    { k: 'fase siklus luteal folikular menstruasi ovulasi', q: 'Apa saja fase dalam siklus haid?', a: 'Ada empat: <b>Menstruasi</b> (haid), <b>Folikular</b> (setelah haid, energi naik), <b>Ovulasi</b> (masa subur), dan <b>Luteal</b> (menjelang haid, PMS). Fase kamu hari ini terlihat di Beranda.', see: 'empat-fase' },
    { k: 'data aman privasi server disimpan dijual', q: 'Apakah data saya disimpan di server?', a: '<b>Tidak.</b> Tamu tidak punya server dan basis data online. Semua catatan disimpan di perangkat ini, dan bisa dienkripsi dengan PIN. Tidak ada akun, iklan, atau pelacak. Koneksi internet hanya dipakai untuk mengunduh jadwal shalat Kemenag (hanya ID kab/kota yang dikirim), dan itu bisa dimatikan.', see: 'privasi' },
    { k: 'pindah hp baru backup cadangan ekspor impor', q: 'Bagaimana memindahkan data ke HP baru?', a: 'Buka <b>Pengaturan → Ekspor cadangan</b> (bisa diberi kata sandi), kirim filenya ke HP baru dengan cara yang kamu percayai, lalu pilih <b>Impor cadangan</b> di HP baru.', see: 'privasi' },
    { k: 'lupa pin kunci', q: 'Saya lupa PIN, bagaimana?', a: 'Karena tidak ada server, PIN <b>tidak bisa dipulihkan</b>. Data terenkripsi tidak dapat dibuka tanpa PIN. Satu-satunya pilihan adalah menghapus data lalu mengimpor cadangan, jika ada.', see: 'privasi' },
  ];

  QA.push(
    { k: 'kafarat denda sedekah dinar berhubungan jima saat haid', q: 'Apa kafarat jika berhubungan saat haid?', a: 'Berhubungan intim saat haid adalah dosa besar dan <b>wajib bertaubat</b>. Menurut mazhab Syafi\'i, <b>disunnahkan</b> bersedekah 1 dinar bila terjadi di awal haid dan ½ dinar bila di akhir haid.', see: 'larangan' },
    { k: 'menopause usia tua berhenti haid umur maksimal monopause', q: 'Sampai usia berapa perempuan bisa haid (menopause)?', a: 'Menurut mazhab Syafi\'i <b>tidak ada batas usia</b>. Selama darah keluar dengan sifat dan syarat haid, ia dihukumi haid. Umumnya haid berhenti sekitar usia 62 tahun.' }
  );

  /* Perbandingan 4 mazhab (ringkasan pendapat masyhur/mu'tamad tiap mazhab).
   * DRAF: wajib ditinjau ustadzah/ahli fikih sebelum rilis publik. Ditampilkan bersama kutipan kitab aslinya. */
  const MZ = {
    'Berapa lama minimal dan maksimal haid?': {
      hanafi: 'Minimal 3 hari 3 malam, maksimal 10 hari 10 malam. Kurang dari 3 hari atau lebih dari 10 hari adalah istihadhah.',
      maliki: 'Untuk urusan ibadah tidak ada batas minimal: sekali keluar pun dihukumi haid. Maksimal 15 hari bagi yang baru pertama haid. Bagi yang punya kebiasaan, haidnya sesuai kebiasaan ditambah 3 hari (istizhar), selama tidak melebihi 15 hari.',
      syafii: 'Minimal sehari semalam (24 jam), umumnya 6–7 hari, maksimal 15 hari.',
      hanbali: 'Minimal sehari semalam, umumnya 6–7 hari, maksimal 15 hari.',
    },
    'Berapa lama minimal masa suci di antara dua haid?': {
      hanafi: '15 hari.', maliki: '15 hari.', syafii: '15 hari.',
      hanbali: '13 hari, berdasarkan atsar dari Ali r.a. (al-Mughni).',
    },
    'Flek coklat atau kuning termasuk haid?': {
      hanafi: 'Kemerahan, kuning, dan keruh yang keluar pada hari-hari haid (dalam batas 10 hari) adalah haid, sampai terlihat putih bersih.',
      maliki: 'Kuning (shufrah) dan keruh (kudrah) termasuk haid.',
      syafii: 'Kuning dan keruh yang keluar dalam masa yang memungkinkan haid adalah haid (pendapat ashah).',
      hanbali: 'Kuning dan keruh adalah haid bila keluar pada masa kebiasaan haid. Di luar itu tidak dianggap apa-apa, berdasarkan hadits Ummu \'Athiyyah.',
    },
    'Darah keluar saat hamil, apakah haid?': {
      hanafi: 'Bukan haid, melainkan istihadhah. Tetap wajib shalat dan puasa.',
      maliki: 'Bisa dihukumi haid, dengan batas lama yang berbeda sesuai usia kehamilan.',
      syafii: 'Menurut pendapat azhhar (qaul jadid) bisa dihukumi haid bila memenuhi syarat haid.',
      hanbali: 'Bukan haid. Kecuali darah yang keluar sehari-dua hari menjelang melahirkan, yang dihukumi nifas.',
    },
    'Berapa lama masa nifas?': {
      hanafi: 'Tidak ada batas minimal, maksimal 40 hari.', maliki: 'Tidak ada batas minimal, maksimal 60 hari.',
      syafii: 'Minimal sesaat, umumnya 40 hari, maksimal 60 hari.', hanbali: 'Tidak ada batas minimal, maksimal 40 hari.',
    },
    'Bolehkah membaca Al-Qur\'an saat haid?': {
      hanafi: 'Tidak boleh membaca Al-Qur\'an dengan niat tilawah. Boleh membaca ayat yang bernilai doa atau dzikir dengan niat dzikir.',
      maliki: 'Boleh membaca tanpa menyentuh mushaf selama darah masih keluar, karena dikhawatirkan lupa hafalan. Setelah darah berhenti dan sebelum mandi, tidak boleh.',
      syafii: 'Haram dengan niat tilawah, walau sebagian ayat. Boleh dengan niat dzikir.',
      hanbali: 'Haram membaca satu ayat atau lebih. Sebagian ayat, atau dengan niat dzikir, diperbolehkan.',
    },
    'Bolehkah menyentuh mushaf atau Al-Qur\'an di HP?': {
      hanafi: 'Haram menyentuh mushaf kecuali dengan pembatas yang terpisah dari mushaf.',
      maliki: 'Haram, kecuali bagi guru dan murid perempuan yang haid untuk keperluan belajar-mengajar.',
      syafii: 'Haram menyentuh dan membawa mushaf.',
      hanbali: 'Haram menyentuh mushaf. Boleh membawanya dengan pembatas atau di dalam wadah.',
    },
    'Bolehkah masuk masjid atau ikut pengajian saat haid?': {
      hanafi: 'Haram masuk masjid, termasuk sekadar lewat.', maliki: 'Haram masuk masjid, termasuk sekadar lewat.',
      syafii: 'Haram berdiam. Lewat boleh bila aman tidak mengotori masjid.', hanbali: 'Haram berdiam. Lewat boleh bila aman tidak mengotori masjid.',
    },
    'Bagaimana hubungan suami istri saat haid?': {
      hanafi: 'Haram jima\' dan bersenang-senang antara pusar dan lutut. Bila darah berhenti tepat di hari ke-10, boleh berhubungan sebelum mandi. Bila kurang dari 10 hari, harus mandi dulu atau setelah berlalu satu waktu shalat.',
      maliki: 'Haram jima\' dan bersenang-senang antara pusar dan lutut sampai istri mandi.',
      syafii: 'Haram jima\' dan bersenang-senang antara pusar dan lutut tanpa penghalang, sampai istri mandi.',
      hanbali: 'Haram jima\' di kemaluan sampai istri mandi. Bercumbu di bagian lain diperbolehkan.',
    },
    'Apa kafarat jika berhubungan saat haid?': {
      hanafi: 'Wajib taubat dan istighfar. Dianjurkan bersedekah 1 dinar atau ½ dinar.',
      maliki: 'Tidak ada kafarat. Wajib taubat dan istighfar.',
      syafii: 'Disunnahkan sedekah 1 dinar di awal haid atau ½ dinar di akhir haid, disertai taubat.',
      hanbali: 'Menurut riwayat yang dipegang mazhab: wajib kafarat 1 dinar atau ½ dinar (boleh memilih), berdasarkan hadits Ibnu Abbas. Ada riwayat lain bahwa cukup istighfar.',
    },
    'Haid datang setelah masuk waktu shalat, apakah wajib qadha?': {
      hanafi: 'Tidak wajib qadha, karena kewajiban shalat dikaitkan dengan akhir waktu.',
      maliki: 'Tidak wajib qadha bila haid datang sebelum waktu shalat itu habis.',
      syafii: 'Wajib qadha bila sejak masuk waktu sudah lewat waktu yang cukup untuk shalat.',
      hanbali: 'Wajib qadha bila sempat mendapati waktu sekadar takbiratul ihram sebelum haid.',
    },
    'Suci di waktu Ashar, apakah wajib shalat Dzuhur juga?': {
      hanafi: 'Hanya wajib shalat waktu itu (Ashar saja), bila waktu tersisa cukup untuk mandi dan takbiratul ihram.',
      maliki: 'Wajib Dzuhur dan Ashar bila waktu tersisa cukup untuk 5 rakaat sebelum Maghrib. Maghrib dan Isya bila tersisa waktu 4 rakaat sebelum Subuh.',
      syafii: 'Wajib Dzuhur dan Ashar (atau Maghrib dan Isya), walau waktu tersisa hanya sekadar takbiratul ihram.',
      hanbali: 'Sama dengan Syafi\'i: wajib keduanya bila mendapati waktu sekadar takbiratul ihram.',
    },
    'Apa itu istihadhah dan apa kewajibannya?': {
      hanafi: 'Berwudhu setiap masuk waktu shalat, lalu boleh shalat fardhu dan sunnah sebanyak apa pun dalam waktu itu.',
      maliki: 'Darah istihadhah tidak membatalkan wudhu. Berwudhu untuk setiap shalat hanya dianjurkan.',
      syafii: 'Wudhu setelah masuk waktu untuk setiap shalat fardhu, lalu segera shalat.',
      hanbali: 'Berwudhu setiap masuk waktu shalat, seperti Hanafi.',
    },
    'Darah berhenti sehari lalu keluar lagi, bagaimana?': {
      hanafi: 'Masa bersih yang diapit darah dalam rentang 10 hari dihitung haid.',
      maliki: 'Talfiq: hari-hari darah digabung sebagai haid, sedangkan hari bersih dihukumi suci (mandi dan shalat).',
      syafii: 'Qaul as-sahb: seluruhnya haid, termasuk masa bersih, selama tidak melebihi 15 hari.',
      hanbali: 'Hari bersih dihukumi suci: mandi, lalu shalat dan puasa sah. Darah yang keluar lagi dalam batas 15 hari dihitung haid.',
    },
    'Darah keluar lebih dari 15 hari, bagaimana hukumnya?': {
      hanafi: 'Batasnya 10 hari. Yang punya kebiasaan: haidnya sesuai kebiasaan, sisanya istihadhah. Yang baru pertama haid: 10 hari haid, sisanya istihadhah.',
      maliki: 'Yang baru pertama haid: haid sampai 15 hari. Yang punya kebiasaan: kebiasaan ditambah 3 hari istizhar (maksimal 15). Setelah itu istihadhah.',
      syafii: 'Dahulukan sifat darah (tamyiz), lalu kebiasaan (\'adah). Yang baru pertama haid dan tidak bisa membedakan: haid sehari semalam.',
      hanbali: 'Dahulukan kebiasaan (\'adah), lalu sifat darah. Yang baru pertama haid dan tidak bisa membedakan: 6 atau 7 hari, mengikuti kebiasaan umum perempuan.',
    },
    'Pada usia berapa haid pertama kali bisa terjadi?': {
      hanafi: 'Sekitar 9 tahun.', maliki: 'Sekitar 9 tahun.', syafii: 'Sekitar 9 tahun qamariyah (perkiraan).', hanbali: '9 tahun.',
    },
    'Sampai usia berapa perempuan bisa haid (menopause)?': {
      hanafi: 'Usia berhenti haid (ya\'s) 55 tahun, menurut pendapat yang difatwakan.',
      maliki: 'Darah setelah usia 70 tahun pasti bukan haid. Antara 50–70 tahun ditanyakan kepada perempuan yang berpengalaman.',
      syafii: 'Tidak ada batas usia. Umumnya sekitar 62 tahun.',
      hanbali: '50 tahun. Darah setelah itu bukan haid.',
    },
    'Bagaimana tata cara mandi wajib?': {
      hanafi: 'Fardhunya: berkumur, memasukkan air ke hidung, dan meratakan air ke seluruh badan. Niat hukumnya sunnah.',
      maliki: 'Fardhunya: niat, meratakan air, menggosok badan (dalk), dan berkesinambungan (muwalat).',
      syafii: 'Fardhunya: niat dan meratakan air ke seluruh kulit dan rambut.',
      hanbali: 'Fardhunya: niat, meratakan air, berkumur, dan memasukkan air ke hidung. Membaca basmalah wajib bila ingat.',
    },
    'Apakah shalat yang ditinggalkan saat haid harus diganti?': {
      ijma: 'Keempat mazhab sepakat (ijma\'): shalat yang ditinggalkan karena haid tidak diqadha, sedangkan puasa wajib diqadha.',
    },
    'Haid datang saat sedang puasa, bagaimana?': {
      ijma: 'Keempat mazhab sepakat: puasa hari itu batal dan wajib diqadha.',
    },
  };
  QA.forEach((x) => { if (MZ[x.q]) x.mz = MZ[x.q]; });

  T.Content = { PHASES, CATS, ARTICLES, QA };
})(window.Tamu);
