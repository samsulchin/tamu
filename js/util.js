/* Tamu — utilitas tanggal, format, dan HTML. Tanpa dependensi luar. */
window.Tamu = window.Tamu || {};
(function (T) {
  'use strict';
  const DAY = 864e5;
  const HOUR = 36e5;
  const pad = (n) => String(n).padStart(2, '0');

  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const BULAN_S = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const HARI = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const HIJRI = ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban", 'Ramadhan', 'Syawal', "Dzulqa'dah", 'Dzulhijjah'];

  let hijriFmt; // undefined = belum dicoba, null = tidak didukung
  function getHijriFmt() {
    if (hijriFmt !== undefined) return hijriFmt;
    hijriFmt = null;
    for (const cal of ['islamic-umalqura', 'islamic', 'islamic-civil']) {
      try {
        const f = new Intl.DateTimeFormat('en-u-ca-' + cal + '-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' });
        if (f.resolvedOptions().calendar.indexOf('islamic') === 0) { hijriFmt = f; break; }
      } catch (e) { /* lanjut */ }
    }
    return hijriFmt;
  }

  /* Tabel awal bulan dari data/hijri.js (dibangun tools/build-hijri.js). */
  const tableCache = {};
  function table(cal) {
    if (tableCache[cal]) return tableCache[cal];
    const src = T.HIJRI_TABLES && T.HIJRI_TABLES[cal];
    if (!src) return null;
    tableCache[cal] = src.map(([y, m, iso]) => { const [Y, M, D] = iso.split('-').map(Number); return { y, m, t: new Date(Y, M - 1, D).getTime() }; });
    return tableCache[cal];
  }
  function hijriFromTable(cal, d) {
    const rows = table(cal);
    if (!rows || !rows.length) return null;
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if (t < rows[0].t || t >= rows[rows.length - 1].t + 30 * DAY) return null;
    let lo = 0, hi = rows.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (rows[mid].t <= t) lo = mid; else hi = mid - 1; }
    const r = rows[lo];
    return { y: r.y, m: r.m, d: Math.round((t - r.t) / DAY) + 1 };
  }

  const U = {
    DAY, HOUR, BULAN, BULAN_S, HARI, HIJRI,
    HIJRI_CALS: { kemenag: 'Kemenag RI (kriteria MABIMS)', muhammadiyah: 'Muhammadiyah (KHGT)', ummalqura: 'Umm al-Qura (Arab Saudi)' },
    pad,
    ymd(d) { d = new Date(d); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); },
    parseYMD(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); },
    sod(d) { d = new Date(d); d.setHours(0, 0, 0, 0); return d; },
    addDays(d, n) { d = new Date(d); d.setDate(d.getDate() + n); return d; },
    /** a - b dalam hari kalender */
    diffDays(a, b) { return Math.round((U.sod(a) - U.sod(b)) / DAY); },
    toLocalInput(d) { d = new Date(d); return U.ymd(d) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); },
    fromLocalInput(s) { if (!s) return null; const d = new Date(s); return isNaN(d) ? null : d; },
    clamp(x, a, b) { return Math.max(a, Math.min(b, x)); },
    uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); },

    fmtDate(d, withDay) {
      d = new Date(d);
      const s = d.getDate() + ' ' + BULAN[d.getMonth()] + ' ' + d.getFullYear();
      return withDay ? HARI[d.getDay()] + ', ' + s : s;
    },
    fmtShort(d) { d = new Date(d); return d.getDate() + ' ' + BULAN_S[d.getMonth()]; },
    fmtTime(d) { d = new Date(d); return pad(d.getHours()) + '.' + pad(d.getMinutes()); },
    fmtDateTime(d) { return U.fmtDate(d, true) + ', ' + U.fmtTime(d); },
    fmtDuration(ms) {
      if (ms < 0) ms = 0;
      const days = Math.floor(ms / DAY);
      const hours = Math.floor((ms % DAY) / HOUR);
      const mins = Math.floor((ms % HOUR) / 6e4);
      if (days > 0) return days + ' hari' + (hours ? ' ' + hours + ' jam' : '');
      if (hours > 0) return hours + ' jam' + (mins ? ' ' + mins + ' menit' : '');
      return mins + ' menit';
    },

    /**
     * Tanggal Hijriah sesuai kalender pilihan pengguna:
     *  'kemenag' (hisab kriteria MABIMS), 'muhammadiyah' (KHGT; wujudul hilal sebelum 1447 H), atau 'ummalqura'.
     * Ditambah koreksi manual (settings.hijriAdj, −2…+2 hari).
     */
    hijri(d) {
      const s = T.Store && T.Store.data && T.Store.data.settings;
      const cal = (s && s.hijriCal) || 'kemenag';
      const adj = (s && s.hijriAdj) || 0;
      d = new Date(d);
      if (adj) d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + adj, 12);
      if (cal !== 'ummalqura') {
        const r = hijriFromTable(cal, d);
        if (r) return r;
      }
      return U.hijriUmmAlQura(d);
    },
    hijriUmmAlQura(d) {
      const f = getHijriFmt();
      if (!f) return null;
      try {
        const parts = f.formatToParts(new Date(d));
        const get = (t) => { const p = parts.find((x) => x.type === t); return p ? parseInt(p.value, 10) : NaN; };
        const r = { d: get('day'), m: get('month'), y: get('year') };
        if (isNaN(r.d) || isNaN(r.m) || isNaN(r.y)) return null;
        return r;
      } catch (e) { return null; }
    },
    fmtHijri(d) {
      const h = U.hijri(d);
      return h ? h.d + ' ' + HIJRI[h.m - 1] + ' ' + h.y + ' H' : '';
    },

    esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    },
    $(sel, root) { return (root || document).querySelector(sel); },
    $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); },
  };

  T.U = U;
})(window.Tamu);
