/* Tamu — kaidah fikih haid, nifas, istihadhah (mazhab Syafi'i, yang umum diamalkan di Indonesia).
 * Rujukan umum: Fathul Qarib, al-Minhaj (an-Nawawi), Risalah al-Mahid, al-Fiqh al-Manhaji.
 * Hasil di sini adalah panduan; untuk kasus rumit, konsultasikan dengan ustadzah/ulama.
 */
window.Tamu = window.Tamu || {};
(function (T) {
  'use strict';
  const U = T.U;
  const DAY = U.DAY, HOUR = U.HOUR;
  const R = { MIN_HAID_H: 24, MAX_HAID_D: 15, MIN_SUCI_D: 15, MAX_NIFAS_D: 60, GHALIB_NIFAS_D: 40 };

  const RULES = {
    haid: {
      dilarang: ['Shalat (wajib & sunnah), tidak diqadha', 'Puasa (puasa wajib diqadha)', 'Thawaf', 'Menyentuh & membawa mushaf',
        "Membaca Al-Qur'an dengan niat tilawah", 'Berdiam (i\'tikaf) di masjid', 'Berhubungan suami-istri', 'Sujud tilawah & sujud syukur'],
      boleh: ['Dzikir, istighfar, shalawat', 'Berdoa & membaca doa harian', 'Mendengarkan murottal & kajian', 'Membaca buku tafsir/hadits',
        'Sedekah & membantu sesama', 'Menghadiri majelis ilmu di luar masjid'],
    },
    istihadhah: {
      wajib: ['Tetap wajib shalat & puasa', 'Bersihkan darah, lalu pakai pembalut/penyumbat', 'Wudhu setelah masuk waktu shalat, lalu segera shalat',
        'Satu wudhu untuk satu shalat fardhu (boleh ditambah sunnah)'],
      boleh: ['Menyentuh mushaf & membaca Al-Qur\'an', 'Berdiam di masjid (jaga kebersihan)', 'Berhubungan suami-istri'],
    },
  };

  /** Haid sebelumnya yang relevan. Potongan darah < 24 jam hanya dihitung bila masih bisa tergabung (dalam 15 hari). */
  function prevHaid(data, p, e) {
    const s = new Date(p.start);
    const list = T.Cycle.sorted(data.periods, 'haid').filter((x) => x.id !== p.id && new Date(x.start) < s && x.end);
    for (let i = list.length - 1; i >= 0; i--) {
      const x = list[i];
      const xs = new Date(x.start);
      if (new Date(x.end) - xs >= R.MIN_HAID_H * HOUR) return x;
      if (e - xs <= R.MAX_HAID_D * DAY) return x; // potongan pendek yang tergabung dengan darah ini
    }
    return null;
  }
  /** Darah haid berikutnya yang mungkin tergabung dengan potongan pendek ini (naqa'). */
  function nextJoin(data, p, now) {
    const s = new Date(p.start), e = new Date(p.end);
    const nx = T.Cycle.sorted(data.periods, 'haid').find((x) => x.id !== p.id && new Date(x.start) > s);
    if (!nx) return null;
    const ns = new Date(nx.start), ne = nx.end ? new Date(nx.end) : now;
    if (ns - e < R.MIN_SUCI_D * DAY && ne - s <= R.MAX_HAID_D * DAY && (e - s) + (ne - ns) >= R.MIN_HAID_H * HOUR) return nx;
    return null;
  }

  /** 'Adah (kebiasaan): lama haid sah terakhir sebelum periode ini, dalam ms. */
  function adah(data, p) {
    const s = new Date(p.start);
    const prior = T.Cycle.sorted(data.periods, 'haid').filter((x) => x.id !== p.id && x.end && new Date(x.start) < s);
    for (let i = prior.length - 1; i >= 0; i--) {
      const d = new Date(prior[i].end) - new Date(prior[i].start);
      if (d >= R.MIN_HAID_H * HOUR && d <= R.MAX_HAID_D * DAY) return d;
    }
    return null;
  }

  /**
   * Menilai satu periode darah.
   * Mengembalikan { code, tone, label, lines[], haidRange:[Date,Date]|null, dur, ongoing }.
   * haidRange = bagian yang dihukumi haid/nifas (dipakai untuk hitung qadha puasa Ramadhan).
   */
  function evaluate(data, p, now) {
    now = now || new Date();
    const s = new Date(p.start);
    const ongoing = !p.end;
    const e = ongoing ? now : new Date(p.end);
    const dur = Math.max(0, e - s);
    const base = { dur, ongoing, s, e };

    if (p.kind === 'nifas') {
      if (dur <= R.MAX_NIFAS_D * DAY) {
        return Object.assign(base, {
          code: 'nifas', tone: 'pink', label: ongoing ? 'Masa nifas hari ke-' + (U.diffDays(now, s) + 1) : 'Nifas (' + U.fmtDuration(dur) + ')',
          haidRange: [s, e],
          lines: ['Darah setelah melahirkan dihukumi nifas, umumnya 40 hari dan paling lama 60 hari.',
            'Hukumnya sama dengan haid: tidak shalat, tidak puasa (puasa wajib diqadha).',
            'Jika darah berhenti sebelum 40 hari, segera mandi wajib lalu shalat dan puasa seperti biasa.'],
        });
      }
      const lim = new Date(+s + R.MAX_NIFAS_D * DAY);
      return Object.assign(base, {
        code: 'nifas-lebih', tone: 'amber', label: 'Melebihi 60 hari', haidRange: [s, lim],
        lines: ['Nifas paling lama 60 hari. Darah setelah ' + U.fmtDateTime(lim) + ' dihukumi istihadhah: wajib mandi, lalu shalat dan puasa.',
          'Penentuan rinci (berdasarkan kebiasaan atau sifat darah) sebaiknya dikonsultasikan dengan ustadzah.'],
      });
    }

    const prev = prevHaid(data, p, e);
    if (prev) {
      const pS = new Date(prev.start), pE = new Date(prev.end);
      const gap = s - pE;
      if (gap < R.MIN_SUCI_D * DAY) {
        if (e - pS <= R.MAX_HAID_D * DAY) {
          return Object.assign(base, {
            code: 'lanjutan', tone: 'pink', label: 'Lanjutan haid sebelumnya', haidRange: [pE, e], // termasuk masa bersih (naqa')
            lines: ['Darah keluar lagi setelah bersih ' + U.fmtDuration(gap) + ', dan totalnya masih dalam 15 hari sejak awal haid (' + U.fmtShort(pS) + ').',
              'Menurut pendapat kuat mazhab Syafi\'i (qaul as-sahb), darah ini dan masa bersih di antaranya dihukumi satu haid.',
              'Puasa wajib yang sempat dikerjakan di masa bersih tadi perlu diqadha. Shalat yang dikerjakan tidak perlu diulang.'],
          });
        }
        const newStart = new Date(+pE + R.MIN_SUCI_D * DAY);
        const range = e - newStart >= R.MIN_HAID_H * HOUR ? [newStart > s ? newStart : s, e] : null;
        return Object.assign(base, {
          code: 'suci-kurang', tone: 'amber', label: 'Masa suci belum 15 hari', haidRange: range,
          lines: ['Jarak suci dari haid sebelumnya baru ' + U.fmtDuration(gap) + '. Masa suci minimal adalah 15 hari.',
            'Darah yang keluar sebelum genap 15 hari suci tidak dihitung haid baru, tetapi istihadhah: tetap wajib shalat dan puasa.',
            'Jika darah masih keluar setelah ' + U.fmtDateTime(newStart) + ', darah sejak saat itu bisa dihukumi haid baru (bila mencapai 24 jam).',
            'Kasus ini termasuk rinci. Sebaiknya konfirmasikan ke ustadzah.'],
        });
      }
    }

    if (dur < R.MIN_HAID_H * HOUR) {
      if (ongoing) {
        return Object.assign(base, {
          code: 'belum24', tone: 'pink', label: 'Darah keluar ' + U.fmtDuration(dur), haidRange: [s, e],
          lines: ['Begitu darah keluar di masa yang memungkinkan haid, tinggalkan shalat dan puasa dulu.',
            'Jika ternyata berhenti sebelum 24 jam, darah itu bukan haid. Shalat yang ditinggalkan wajib diqadha.'],
        });
      }
      const nx = nextJoin(data, p, now);
      if (nx) {
        return Object.assign(base, {
          code: 'haid', tone: 'pink', label: 'Haid (terputus, ' + U.fmtDuration(dur) + ')', haidRange: [s, e],
          lines: ['Darah ini kurang dari 24 jam, tetapi disusul darah lagi pada ' + U.fmtDateTime(nx.start) + ', masih dalam 15 hari.',
            'Menurut qaul as-sahb (mazhab Syafi\'i), keduanya beserta masa bersih di antaranya dihukumi satu haid.'],
        });
      }
      return Object.assign(base, {
        code: 'bukan-haid', tone: 'amber', label: 'Bukan haid (kurang dari 24 jam)', haidRange: null,
        lines: ['Darah keluar ' + U.fmtDuration(dur) + ', belum mencapai minimal haid (sehari semalam / 24 jam).',
          'Darah ini dihukumi istihadhah (darah fasad). Shalat yang ditinggalkan selama itu wajib diqadha.',
          'Puasa wajib yang tidak dikerjakan juga wajib diqadha.'],
      });
    }

    if (dur <= R.MAX_HAID_D * DAY) {
      return Object.assign(base, {
        code: 'haid', tone: 'pink', haidRange: [s, e],
        label: ongoing ? 'Haid hari ke-' + (U.diffDays(now, s) + 1) : 'Haid sah (' + U.fmtDuration(dur) + ')',
        lines: ongoing
          ? ['Sudah lebih dari 24 jam, jadi darah ini dihukumi haid.', 'Batas paling lama haid adalah 15 hari. Jika berhenti, segera mandi wajib.']
          : ['Lama darah di antara 24 jam dan 15 hari, jadi seluruhnya dihukumi haid.', 'Shalat tidak diqadha. Puasa wajib (misalnya Ramadhan) diqadha.'],
      });
    }

    const a = adah(data, p);
    const haidMs = a || R.MIN_HAID_H * HOUR;
    const hEnd = new Date(+s + haidMs);
    return Object.assign(base, {
      code: 'lebih15', tone: 'amber', label: 'Melebihi 15 hari: istihadhah', haidRange: [s, hEnd],
      lines: ['Darah keluar lebih dari 15 hari, jadi ada bagian yang dihukumi istihadhah.',
        'Pertama, lihat sifat darah (tamyiz). Darah kuat (hitam/merah pekat, kental, berbau) adalah haid, dan darah lemah (merah muda/kekuningan) adalah istihadhah.',
        a ? 'Jika tidak bisa membedakan, ikuti kebiasaan (\'adah) kamu: ' + U.fmtDuration(a) + '. Jadi haid sampai ' + U.fmtDateTime(hEnd) + ', setelah itu istihadhah.'
          : 'Karena belum ada catatan kebiasaan, bagi yang baru pertama haid (mubtada\'ah) dan tidak bisa membedakan darah: haid dihitung sehari semalam, sisanya istihadhah.',
        'Selama istihadhah tetap wajib shalat dan puasa. Shalat yang tertinggal setelah batas haid perlu diqadha.',
        'Kasus istihadhah sebaiknya dikonsultasikan dengan ustadzah.'],
    });
  }

  /** Koordinat untuk hitung offline: lokasi GPS, ibu kota kab/kota pilihan (Kemendagri), atau kota cadangan. */
  function coords(data) {
    const c = data.settings.coords;
    if (c && isFinite(c.lat) && isFinite(c.lng)) return { lat: c.lat, lng: c.lng, name: c.name || 'lokasi GPS kamu' };
    return T.Prayer.city(data.settings.city);
  }

  /** Analisis kewajiban shalat saat darah mulai keluar. */
  function atStart(data, t) {
    const c = coords(data);
    const w = T.Prayer.windowAt(t, c.lat, c.lng);
    if (!w.key) {
      return { tone: 'ok', text: 'Haid mulai pukul ' + U.fmtTime(t) + ', di waktu dhuha (setelah terbit matahari, sebelum Dzuhur). Tidak ada shalat fardhu yang perlu diqadha karena awal haid ini.' };
    }
    const mins = Math.floor((t - w.start) / 6e4);
    if (mins >= 10) {
      return { tone: 'warn', text: 'Haid mulai pukul ' + U.fmtTime(t) + ', saat waktu ' + w.name + ' sudah berjalan ' + U.fmtDuration(t - w.start) + ' (masuk ' + U.fmtTime(w.start) + '). Jika kamu belum sempat shalat ' + w.name + ', wajib mengqadhanya setelah suci.' };
    }
    return { tone: 'ok', text: 'Haid mulai ' + mins + ' menit setelah masuk waktu ' + w.name + ' (' + U.fmtTime(w.start) + '). Jika waktu itu belum cukup untuk bersuci dan shalat, shalat ' + w.name + ' tidak wajib diqadha.' };
  }

  /** Analisis kewajiban shalat saat darah berhenti (suci). */
  function atEnd(data, t) {
    const c = coords(data);
    const w = T.Prayer.windowAt(t, c.lat, c.lng);
    if (!w.key) {
      return { tone: 'ok', list: [], text: 'Darah berhenti pukul ' + U.fmtTime(t) + ', di waktu dhuha. Shalat pertama yang wajib adalah Dzuhur (sekitar ' + U.fmtTime(w.end) + ').' };
    }
    const list = w.key === 'asr' ? ['Dzuhur', 'Ashar'] : w.key === 'isha' ? ['Maghrib', 'Isya'] : [w.name];
    const jamak = list.length > 1 ? ' Dalam mazhab Syafi\'i, suci di waktu ' + w.name + ' juga mewajibkan ' + list[0] + ', karena keduanya bisa dijamak.' : '';
    return {
      tone: 'warn', list,
      text: 'Darah berhenti pukul ' + U.fmtTime(t) + ', di waktu ' + w.name + ' (berakhir ' + U.fmtTime(w.end) + '). Wajib mengerjakan shalat ' + list.join(' dan ') + '.' + jamak + ' Segera mandi wajib. Jika waktunya sudah habis, shalat tersebut diqadha.',
    };
  }

  /** Hari-hari Ramadhan yang terlewat puasanya karena haid/nifas → {'YYYY-MM-DD': tahunHijriah}. */
  function ramadanDays(data, now) {
    now = now || new Date();
    const c = coords(data);
    const out = {};
    for (const p of data.periods) {
      const ev = evaluate(data, p, now);
      if (!ev.haidRange) continue;
      const [s, e] = ev.haidRange;
      for (let d = U.sod(s); d <= e; d = U.addDays(d, 1)) {
        const noon = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
        const h = U.hijri(noon);
        if (!h || h.m !== 9) continue;
        const tt = T.Prayer.times(d, c.lat, c.lng);
        if (s < tt.maghrib && e > tt.fajr && tt.fajr < now) out[U.ymd(d)] = h.y;
      }
    }
    return out;
  }

  function qadhaSummary(data, now) {
    const days = ramadanDays(data, now);
    const byYear = {};
    Object.keys(days).sort().forEach((k) => { (byYear[days[k]] = byYear[days[k]] || []).push(k); });
    const auto = Object.keys(days).length;
    const adjust = data.qadha.adjust || 0;
    const paid = (data.qadha.paid || []).length;
    return { days, byYear, auto, adjust, paid, owed: Math.max(0, auto + adjust), remaining: Math.max(0, auto + adjust - paid) };
  }

  /** Status hukum hari ini untuk kartu di beranda. */
  function today(data, now) {
    now = now || new Date();
    const ps = T.Cycle.sorted(data.periods).filter((p) => new Date(p.start) <= now);
    const last = ps[ps.length - 1];
    if (!last) return { code: 'kosong', tone: 'green', title: 'Belum ada catatan', sub: 'Catat haid pertama kamu untuk mulai.' };
    const ev = evaluate(data, last, now);
    if (!last.end) {
      if (ev.code === 'lebih15' || ev.code === 'suci-kurang' || ev.code === 'nifas-lebih') {
        const hEnd = ev.haidRange && ev.haidRange[1];
        const inHaid = hEnd && now < hEnd && (ev.code !== 'suci-kurang' || now >= ev.haidRange[0]);
        if (!inHaid) return { code: 'istihadhah', tone: 'amber', title: 'Istihadhah', sub: 'Tetap wajib shalat & puasa. Wudhu setiap akan shalat fardhu.', ev, period: last };
      }
      if (last.kind === 'nifas') return { code: 'nifas', tone: 'pink', title: ev.label, sub: 'Tidak shalat & tidak puasa. Puasa wajib diqadha.', ev, period: last };
      return { code: 'haid', tone: 'pink', title: ev.code === 'belum24' ? 'Darah keluar · ' + U.fmtDuration(ev.dur) : 'Sedang haid · hari ke-' + (U.diffDays(now, last.start) + 1), sub: 'Tidak shalat & tidak puasa. Perbanyak dzikir dan doa.', ev, period: last };
    }
    const sinceEnd = now - new Date(last.end);
    const valid = ['haid', 'lanjutan', 'nifas', 'nifas-lebih', 'lebih15'].includes(ev.code);
    if (valid && !last.mandi && sinceEnd < 3 * DAY) {
      return { code: 'mandi', tone: 'green', title: 'Sudah suci: segera mandi wajib', sub: 'Setelah mandi, kembali wajib shalat & puasa.', ev, period: last };
    }
    return { code: 'suci', tone: 'green', title: 'Suci', sub: 'Wajib shalat & puasa seperti biasa.', ev, period: last };
  }

  T.Fiqh = { R, RULES, evaluate, atStart, atEnd, ramadanDays, qadhaSummary, today, adah };
})(window.Tamu);
