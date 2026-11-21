/* Tamu — statistik siklus, prediksi, dan fase (menstruasi, folikular, ovulasi, luteal). */
window.Tamu = window.Tamu || {};
(function (T) {
  'use strict';
  const U = T.U;

  function sorted(periods, kind) {
    return periods
      .filter((p) => !kind || p.kind === kind)
      .slice()
      .sort((a, b) => new Date(a.start) - new Date(b.start));
  }

  /** Haid yang memulai siklus baru (bukan lanjutan dalam 15 hari dari awal haid sebelumnya). */
  function cycleStarts(periods) {
    const hs = sorted(periods, 'haid');
    const out = [];
    for (const p of hs) {
      const prev = out[out.length - 1];
      if (prev && U.diffDays(p.start, prev.start) <= 15) continue;
      out.push(p);
    }
    return out;
  }

  function stats(data) {
    const s = data.settings;
    const nifas = sorted(data.periods, 'nifas');
    const starts = cycleStarts(data.periods);
    const cycles = [];
    for (let i = 1; i < starts.length; i++) {
      const a = starts[i - 1], b = starts[i];
      const len = U.diffDays(b.start, a.start);
      const nifasBetween = nifas.some((n) => new Date(n.start) > new Date(a.start) && new Date(n.start) < new Date(b.start));
      if (nifasBetween || len < 16 || len > 90) continue;
      cycles.push(len);
    }
    const recent = cycles.slice(-6);
    const durs = sorted(data.periods, 'haid')
      .filter((p) => { const d = p.end && new Date(p.end) - new Date(p.start); return d && d >= U.DAY && d <= 15 * U.DAY; })
      .map((p) => Math.ceil((new Date(p.end) - new Date(p.start)) / U.DAY))
      .slice(-6);
    // Rata-rata berbobot: siklus yang lebih baru lebih berpengaruh (bobot 1, 2, 3, …)
    const wavg = (arr) => { let sw = 0, sx = 0; arr.forEach((x, i) => { sw += i + 1; sx += x * (i + 1); }); return sx / sw; };
    const dataCycle = recent.length ? Math.round(wavg(recent)) : null;
    const dataPeriod = durs.length ? Math.round(wavg(durs)) : null;

    const manual = s.predMode === 'manual';
    let avgCycle, avgPeriod, source;
    if (manual) {
      avgCycle = s.cycleLen; avgPeriod = s.periodLen; source = 'manual';
    } else {
      // Catatan masih sedikit: gabungkan dengan angka pengaturan agar tidak melonjak karena satu siklus
      avgCycle = !recent.length ? s.cycleLen : recent.length < 3 ? Math.round((recent.reduce((a, b) => a + b, 0) + s.cycleLen) / (recent.length + 1)) : dataCycle;
      avgPeriod = !durs.length ? s.periodLen : durs.length < 2 ? Math.round((durs[0] + s.periodLen) / 2) : dataPeriod;
      source = !recent.length && !durs.length ? 'setting' : recent.length >= 3 ? 'data' : 'blend';
    }
    const minCycle = recent.length ? Math.min(...recent) : avgCycle;
    const maxCycle = recent.length ? Math.max(...recent) : avgCycle;
    return {
      avgCycle: U.clamp(avgCycle, 18, 60),
      avgPeriod: U.clamp(avgPeriod, 1, 15),
      minCycle, maxCycle,
      count: recent.length,
      periodCount: durs.length,
      cycles: recent,
      dataCycle, dataPeriod,
      regular: recent.length < 2 ? null : maxCycle - minCycle <= 7,
      fromData: !manual && recent.length > 0,
      source,
    };
  }

  /** Penjelasan singkat dasar prediksi untuk ditampilkan ke pengguna. */
  function basisText(st) {
    const base = 'siklus ' + st.avgCycle + ' hari · haid ' + st.avgPeriod + ' hari';
    if (st.source === 'manual') return base + ' (sesuai pengaturan Anda)';
    if (st.source === 'data') return base + ' (otomatis dari ' + st.count + ' siklus terakhir)';
    if (st.source === 'blend') return base + ' (gabungan catatan Anda dan pengaturan; makin akurat setelah 3 siklus)';
    return base + ' (dari pengaturan; akan menyesuaikan otomatis setelah ada haid yang tercatat lengkap)';
  }

  function phaseOf(day, o) {
    if (o.ongoing || day <= o.periodDays) return 'menstruasi';
    if (day < o.ovuDay - 1) return 'folikular';
    if (day <= o.ovuDay + 1) return 'ovulasi';
    return 'luteal';
  }

  /** Kondisi siklus saat ini. null bila belum ada data. */
  function current(data, now) {
    now = now || new Date();
    const all = sorted(data.periods).filter((p) => new Date(p.start) <= now);
    const last = all[all.length - 1];
    if (!last) return null;
    const st = stats(data);
    if (last.kind === 'nifas') {
      return { mode: 'nifas', last, ongoing: !last.end, dayN: U.diffDays(now, last.start) + 1, st };
    }
    const starts = cycleStarts(all);
    const cs = starts[starts.length - 1];
    const cycleStart = U.sod(cs.start);
    const lastHaid = sorted(all, 'haid').pop();
    const ongoing = !lastHaid.end;
    const L = st.avgCycle;
    const luteal = U.clamp(data.settings.lutealLen || 14, 10, 16);
    const ovuDay = Math.max(L - luteal, 6);
    const cycleDay = U.diffDays(now, cycleStart) + 1;
    const periodDays = ongoing ? cycleDay : U.diffDays(lastHaid.end, cycleStart) + 1;
    const nextStart = U.addDays(cycleStart, L);
    const spread = st.source !== 'manual' && st.count >= 3 ? [st.minCycle, st.maxCycle] : [L - 2, L + 2];
    const nextRange = [U.addDays(cycleStart, Math.min(spread[0], L)), U.addDays(cycleStart, Math.max(spread[1], L))];
    const ovulation = U.addDays(cycleStart, ovuDay - 1);
    const daysToNext = U.diffDays(nextStart, now);
    const lateDays = ongoing ? 0 : Math.max(0, -daysToNext);
    // Bila terlambat, perkiraan haid bergeser: kemungkinan datang mulai besok
    const predNext = lateDays > 0 ? U.addDays(U.sod(now), 1) : nextStart;
    return {
      mode: 'cycle', last: lastHaid, cycleStart, ongoing, cycleDay, L, ovuDay, periodDays, st,
      phase: phaseOf(cycleDay, { ongoing, periodDays, ovuDay }),
      nextStart, predNext, nextRange: lateDays > 0 ? [predNext, U.addDays(predNext, Math.max(2, spread[1] - spread[0]))] : nextRange, ovulation,
      fertile: [U.addDays(ovulation, -5), U.addDays(ovulation, 1)],
      daysToNext,
      lateDays,
    };
  }

  /** Penanda kalender per tanggal 'YYYY-MM-DD'. */
  function marks(data, now) {
    now = now || new Date();
    const m = {};
    const mark = (d, k, v) => { const key = U.ymd(d); (m[key] || (m[key] = {}))[k] = v === undefined ? true : v; };
    const st = stats(data);
    const today0 = U.sod(now);
    for (const p of data.periods) {
      const s = U.sod(p.start);
      const e = U.sod(p.end || now);
      for (let d = s; d <= e; d = U.addDays(d, 1)) mark(d, p.kind);
      mark(s, 'start', p.id);
      // Haid yang sedang berlangsung: tandai sisa harinya sesuai kebiasaan lama haid (mis. mulai 21, kebiasaan 7 hari → s.d. 27)
      if (p.kind === 'haid' && !p.end) {
        const expEnd = U.addDays(s, st.avgPeriod - 1);
        for (let d = U.addDays(today0, 1); d <= expEnd; d = U.addDays(d, 1)) mark(d, 'haidPred', U.diffDays(d, s) + 1);
      }
    }
    for (const k in data.logs) (m[k] || (m[k] = {})).log = true;
    const cur = current(data, now);
    if (cur && cur.mode === 'cycle') {
      const today = U.sod(now);
      // hari-hari keterlambatan: dari perkiraan semula sampai hari ini
      if (cur.lateDays > 0) for (let d = U.sod(cur.nextStart), n = 1; d <= today; d = U.addDays(d, 1), n++) mark(d, 'late', n);
      for (let k = 0; k < 4; k++) {
        // siklus saat ini dimulai dari haid terakhir; siklus berikutnya dari perkiraan (bergeser bila terlambat)
        const cs = k === 0 ? cur.cycleStart : U.addDays(cur.predNext, cur.L * (k - 1));
        if (k > 0) for (let i = 0; i < cur.st.avgPeriod; i++) mark(U.addDays(cs, i), 'pred', k === 1 && cur.lateDays > 0 ? 'late' : true);
        if (k === 0 && cur.lateDays > 0) continue; // masa subur siklus yang terlambat sudah lewat
        const ov = U.addDays(cs, cur.ovuDay - 1);
        for (let i = -5; i <= 1; i++) mark(U.addDays(ov, i), 'fertile');
        mark(ov, 'ovu');
      }
    }
    return m;
  }

  T.Cycle = { sorted, cycleStarts, stats, current, marks, phaseOf, basisText };
})(window.Tamu);
