/* Tamu — antarmuka aplikasi. */
window.Tamu = window.Tamu || {};
(function (T) {
  'use strict';
  const { U, Store, Cycle, Fiqh, Prayer, Content, QA } = T;
  const esc = U.esc;
  const D = () => Store.data;
  const save = () => Store.save();
  const main = () => document.getElementById('main');

  const state = { view: 'home', month: U.sod(new Date()), sel: U.ymd(new Date()), chat: [], ob: { step: 0 }, hiddenAt: 0 };

  /* ---------- Ikon ---------- */
  const IC = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M19 19v2H6"/>',
    learn: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    check: '<path d="M5 12l5 5L20 7"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
    send: '<path d="M4 12 20 4l-6 16-3-7z"/>', shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', down: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', up: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    leaf: '<path d="M5 19C5 10 11 5 20 4c-1 9-6 15-15 15z"/><path d="M5 19 13 11"/>', baby: '<circle cx="12" cy="8" r="4"/><path d="M5 21c1-4 4-6 7-6s6 2 7 6"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
    share: '<path d="M12 3v12M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
    pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    scale: '<path d="M12 3v18M5 21h14M6 7h12M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/>',
  };
  const icon = (n, cls) => '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (IC[n] || '') + '</svg>';

  /* ---------- Util UI ---------- */
  /** Notifikasi singkat. opts: {action: 'Urungkan', onAction: fn, ms} menampilkan tombol aksi. */
  function toast(msg, opts) {
    const t = document.getElementById('toast');
    opts = opts || {};
    t.innerHTML = '<span>' + esc(msg) + '</span>' + (opts.action ? '<button type="button" class="toast-btn">' + esc(opts.action) + '</button>' : '');
    t.classList.toggle('has-action', !!opts.action);
    t.classList.add('show');
    const btn = t.querySelector('.toast-btn');
    if (btn) btn.onclick = () => { t.classList.remove('show'); clearTimeout(toast._t); opts.onAction && opts.onAction(); };
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), opts.ms || (opts.action ? 10000 : 2800));
  }
  T.toast = toast;

  function openSheet(html, opts) {
    const root = document.getElementById('sheet-root');
    root.innerHTML = '<div class="sheet-backdrop" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="sheet-grip"></div>' + html + '</div>';
    root.classList.add('open');
    document.body.classList.add('noscroll');
    const first = root.querySelector('input:not([type=hidden]),select,textarea');
    if (first && !(opts && opts.noFocus)) setTimeout(() => first.focus({ preventScroll: true }), 60);
  }
  function closeSheet() {
    const root = document.getElementById('sheet-root');
    root.classList.remove('open');
    root.innerHTML = '';
    document.body.classList.remove('noscroll');
  }
  const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };

  function chips(group, options, selected, multi) {
    const sel = Array.isArray(selected) ? selected : [selected];
    return '<div class="chips" data-group="' + group + '"' + (multi ? ' data-multi="1"' : '') + '>' +
      options.map(([v, label, cls]) => '<button type="button" class="chip ' + (cls || '') + '" data-val="' + esc(v) + '" aria-pressed="' + (sel.includes(v) ? 'true' : 'false') + '">' + esc(label) + '</button>').join('') + '</div>';
  }
  function chipVal(group) {
    const box = document.querySelector('.chips[data-group="' + group + '"]');
    if (!box) return null;
    const on = U.$$('.chip[aria-pressed="true"]', box).map((b) => b.dataset.val);
    return box.dataset.multi ? on : on[0] || null;
  }

  function applyTheme() {
    const t = D() ? D().settings.theme : 'auto';
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  }

  /* ---------- Data helpers ---------- */
  const ongoing = () => D().periods.find((p) => !p.end) || null;
  function overlaps(start, end, exceptId) {
    const e = end || new Date(8.64e15);
    return D().periods.some((p) => p.id !== exceptId && new Date(p.start) < e && (p.end ? new Date(p.end) : new Date(8.64e15)) > start);
  }
  const phaseInfo = (k) => Content.PHASES[k];

  /* ---------- Komponen ---------- */
  function ring(cur) {
    const size = 232, cx = 116, r = 96, C = 2 * Math.PI * r;
    let segs = [], marker = 0, big = '', small = '', sub = '';
    if (cur.mode === 'nifas') {
      const frac = Math.min(cur.dayN / 60, 1);
      segs = [{ a: 0, b: frac, c: 'var(--ph-mens)' }, { a: frac, b: 1, c: 'var(--track)' }];
      marker = frac;
      small = cur.ongoing ? 'Masa nifas' : 'Pasca nifas';
      big = cur.ongoing ? 'Hari ke-' + cur.dayN : 'Selesai';
      sub = cur.ongoing ? 'maksimal 60 hari' : 'catat haid berikutnya';
    } else {
      const Lt = Math.max(cur.L, cur.cycleDay);
      const P = cur.ongoing ? Math.max(cur.cycleDay, Math.min(cur.st.avgPeriod, cur.L)) : cur.periodDays;
      const o1 = Math.max(P, cur.ovuDay - 2), o2 = Math.max(P, cur.ovuDay + 1);
      const raw = [
        [0, P, 'var(--ph-mens)'], [P, o1, 'var(--ph-foli)'], [o1, o2, 'var(--ph-ovu)'], [o2, cur.L, 'var(--ph-lute)'], [cur.L, Lt, 'var(--late)'],
      ];
      segs = raw.filter(([a, b]) => b > a).map(([a, b, c]) => ({ a: a / Lt, b: b / Lt, c }));
      marker = (Math.min(cur.cycleDay, Lt) - 0.5) / Lt;
      small = phaseInfo(cur.phase).name;
      big = 'Hari ke-' + cur.cycleDay;
      if (cur.ongoing) sub = 'sedang haid';
      else if (cur.lateDays > 0) sub = 'terlambat ' + cur.lateDays + ' hari';
      else if (cur.daysToNext === 0) sub = 'perkiraan haid hari ini';
      else sub = 'haid ±' + cur.daysToNext + ' hari lagi';
    }
    const gap = 0.006;
    const arcs = segs.map((s) => {
      const len = Math.max(0, (s.b - s.a - gap) * C);
      return '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="' + s.c + '" stroke-width="14" stroke-linecap="butt" stroke-dasharray="' + len.toFixed(2) + ' ' + C.toFixed(2) + '" stroke-dashoffset="' + (-s.a * C).toFixed(2) + '" transform="rotate(-90 ' + cx + ' ' + cx + ')"/>';
    }).join('');
    const ang = 2 * Math.PI * marker - Math.PI / 2;
    const mx = cx + r * Math.cos(ang), my = cx + r * Math.sin(ang);
    return '<div class="ring" role="img" aria-label="' + esc(small + ', ' + big + ', ' + sub) + '"><svg viewBox="0 0 ' + size + ' ' + size + '">' +
      '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="var(--track)" stroke-width="14"/>' + arcs +
      '<circle cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="13" fill="var(--surface)" stroke="var(--text)" stroke-width="3"/></svg>' +
      '<div class="ring-c"><div class="ring-small">' + esc(small) + '</div><div class="ring-big">' + esc(big) + '</div><div class="ring-sub">' + esc(sub) + '</div></div></div>';
  }

  /** Lingkaran kosong untuk keadaan belum ada data. */
  function ringEmpty() {
    return '<div class="ring" role="img" aria-label="Belum dihitung, hari ke-0"><svg viewBox="0 0 232 232"><circle cx="116" cy="116" r="96" fill="none" stroke="var(--track)" stroke-width="14"/></svg>' +
      '<div class="ring-c"><div class="ring-small muted-small">Belum dihitung</div><div class="ring-big">Hari ke-0</div><div class="ring-sub">isi awal haid dulu</div></div></div>';
  }

  function statusCard(st, compact) {
    const d = D();
    let body = '<div class="st-title">' + esc(st.title) + '</div><div class="st-sub">' + esc(st.sub) + '</div>';
    if (st.ev && st.ev.lines && !['suci', 'mandi'].includes(st.code) && (st.code === 'istihadhah' || ['belum24', 'lanjutan', 'suci-kurang', 'lebih15', 'nifas-lebih'].includes(st.ev.code))) {
      body += '<ul class="st-lines">' + st.ev.lines.map((l) => '<li>' + esc(l) + '</li>').join('') + '</ul>';
    }
    if (st.code === 'haid' || st.code === 'nifas') {
      if (st.period && !compact) body += '<div class="st-note">' + icon('clock') + '<span>' + esc(Fiqh.atStart(d, new Date(st.period.start)).text) + '</span></div>';
      body += '<details class="rules"><summary>Yang dilarang & yang tetap bisa dilakukan</summary><div class="rules-grid"><div><h4>Dilarang</h4><ul>' +
        Fiqh.RULES.haid.dilarang.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div><div><h4>Tetap bisa</h4><ul>' +
        Fiqh.RULES.haid.boleh.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div></div></details>';
    }
    if (st.code === 'istihadhah') {
      body += '<details class="rules" open><summary>Cara bersuci & beribadah saat istihadhah</summary><ul>' + Fiqh.RULES.istihadhah.wajib.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></details>';
    }
    if (st.code === 'mandi') {
      body += '<div class="st-note">' + icon('clock') + '<span>' + esc(Fiqh.atEnd(d, new Date(st.period.end)).text) + '</span></div>' +
        '<div class="row gap"><button class="btn btn-green" data-act="mandi-done">' + icon('check') + 'Saya sudah mandi wajib</button><a class="btn btn-ghost" href="#a/mandi">Tata cara</a></div>';
    }
    return '<section class="card status tone-' + st.tone + '"><div class="st-head">' + icon(st.tone === 'green' ? 'leaf' : st.tone === 'amber' ? 'info' : 'drop') + '<span>Status fikih hari ini</span></div>' + body + '</section>';
  }

  function mainAction() {
    const og = ongoing();
    if (og) return '<button class="btn btn-primary btn-big" data-act="end-period">' + icon('check') + (og.kind === 'nifas' ? 'Darah nifas sudah berhenti' : 'Darah sudah berhenti') + '</button>';
    return '<button class="btn btn-primary btn-big" data-act="start-period">' + icon('drop') + 'Darah haid keluar</button>';
  }

  /* ---------- Halaman: Beranda ---------- */
  /* ---------- Pasang sebagai aplikasi di HP / laptop (PWA) ---------- */
  const inst = { prompt: null };
  const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = () => /android/i.test(navigator.userAgent);
  const isMobile = () => isIOS() || isAndroid() || /mobile/i.test(navigator.userAgent);

  /** Ajakan pasang di Beranda: hanya di HP (atau saat browser menawarkan pemasangan), belum terpasang, belum ditutup. */
  function installBanner() {
    const s = D().settings;
    if (isStandalone() || s.installDismissed || !(inst.prompt || isMobile())) return '';
    return '<section class="card install-banner">' + icon('phone') + '<div><b>Pasang Tamu di HP</b><small>Buka dari layar utama, tetap jalan tanpa internet.</small>' +
      '<div class="row gap"><button class="btn btn-primary small" data-act="install">Pasang aplikasi</button><button class="btn btn-ghost small" data-act="install-later">Nanti</button></div></div></section>';
  }
  /** Kartu di Pengaturan: selalu ada, berisi status pemasangan. */
  function installCard() {
    if (isStandalone()) return '<section class="card install-card"><h3 class="card-t">' + icon('phone') + 'Aplikasi</h3><p class="ok-line">' + icon('check') + 'Tamu sudah terpasang di perangkat ini.</p></section>';
    return '<section class="card install-card"><h3 class="card-t">' + icon('phone') + 'Pasang sebagai aplikasi</h3><p class="muted">Buka Tamu dari ikon seperti aplikasi biasa, juga saat offline.</p>' +
      '<button class="btn btn-primary btn-big" data-act="install">' + icon('down') + 'Pasang aplikasi</button></section>';
  }
  async function doInstall() {
    if (isStandalone()) return toast('Tamu sudah terpasang di perangkat ini.');
    if (inst.prompt) {
      const p = inst.prompt;
      try {
        await p.prompt(); // harus dipanggil langsung dari ketukan pengguna; menolak (reject) bila tidak bisa
        inst.prompt = null;
        const r = await p.userChoice;
        if (r && r.outcome === 'accepted') toast('Memasang Tamu… Ikonnya akan muncul di layar utama.');
        render();
        return;
      } catch (e) {
        // dialog bawaan browser tidak bisa dibuka (sudah dipakai / ditolak): tampilkan panduan manual
      }
    }
    sheetInstallHelp();
  }
  function sheetInstallHelp() {
    const ios = isIOS(), android = isAndroid(), web = /^https?:/.test(location.protocol);
    const step = (items) => '<ol class="install-steps">' + items.map((x) => '<li>' + x + '</li>').join('') + '</ol>';
    const iosSteps = step(['Buka Tamu di <b>Safari</b>.', 'Tekan tombol <b>Bagikan</b> ' + icon('share') + ' di bagian bawah layar.', 'Gulir lalu pilih <b>Tambahkan ke Layar Utama</b>.', 'Tekan <b>Tambah</b>. Ikon Tamu muncul di layar utama.']);
    const androidSteps = step(['Buka Tamu di <b>Chrome</b>.', 'Tekan menu <b>⋮</b> di kanan atas.', 'Pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>.', 'Tekan <b>Instal</b>.']);
    const pcSteps = step(['Buka Tamu di <b>Chrome</b> atau <b>Edge</b>.', 'Klik ikon pasang di ujung kanan kolom alamat, atau menu <b>⋮ → Instal Tamu</b>.']);
    openSheet('<h2>Cara memasang Tamu</h2>' +
      (!web ? '<p class="err">Tamu sedang dibuka dari file di komputer. Untuk dipasang, buka dari alamat webnya (https://…).</p>' : '') +
      (ios ? '<h3>iPhone / iPad</h3>' + iosSteps : android ? '<h3>Android</h3>' + androidSteps : '<h3>Laptop / PC</h3>' + pcSteps) +
      '<details class="rules"><summary>Perangkat lain</summary>' + (ios ? '' : '<h4>iPhone / iPad</h4>' + iosSteps) + (android ? '' : '<h4>Android</h4>' + androidSteps) + (!ios && !android ? '' : '<h4>Laptop / PC</h4>' + pcSteps) + '</details>' +
      '<p class="muted small">Setelah terpasang, Tamu tetap memakai data yang sama di perangkat ini dan bisa dibuka tanpa internet.</p>' +
      '<div class="sheet-actions"><button class="btn btn-primary" data-act="close-sheet">Mengerti</button></div>', { noFocus: true });
  }

  /* ---------- Panduan awal (checklist) & pengaturan siklus ---------- */
  function setupItems() {
    const d = D(), s = d.settings, su = s.setup || {};
    return [
      { key: 'cycle', done: !!su.cycle, title: 'Atur siklus & lama haid', desc: 'Berapa hari siklus dan haidmu biasanya.', act: 'cycle-setup', btn: 'Atur' },
      { key: 'haid', done: d.periods.length > 0, title: 'Isi data awal haid', desc: 'Kapan haid terakhirmu dimulai dan selesai.', act: 'init-open', btn: 'Isi' },
      { key: 'lokasi', done: !!su.lokasi, title: 'Tentukan lokasi jadwal shalat', desc: 'Untuk jadwal shalat. Bisa pakai GPS.', act: 'go-fiqh', btn: 'Atur' },
      { key: 'hijri', done: !!su.hijri, title: 'Pilih kalender Hijriah', desc: 'Kemenag atau Muhammadiyah.', act: 'hijri-setup', btn: 'Pilih' },
      { key: 'pin', done: Store.hasPin(), title: 'Kunci dengan PIN (opsional)', desc: 'Biar catatanmu tidak dibuka orang lain.', act: 'pin-set', btn: 'Aktifkan', optional: true },
    ];
  }
  function setupPending() {
    const s = D().settings;
    if (s.setup && s.setup.dismissed) return false;
    return setupItems().some((x) => !x.done && !x.optional);
  }
  function setupCard() {
    if (!setupPending()) return '';
    const items = setupItems();
    const done = items.filter((x) => x.done).length;
    return '<section class="card setup"><div class="setup-h">' + icon('info') + '<div><b>Yuk, siapkan dulu</b><small>' + done + ' dari ' + items.length + ' langkah selesai</small></div></div>' +
      '<div class="setup-bar"><i style="width:' + Math.round((done / items.length) * 100) + '%"></i></div><ol class="setup-list">' +
      items.map((x) => '<li class="' + (x.done ? 'done' : '') + '"><span class="setup-ic">' + icon(x.done ? 'check' : 'right') + '</span><div><b>' + esc(x.title) + '</b><small>' + esc(x.desc) + '</small></div>' +
        (x.done ? '' : '<button class="btn btn-soft small" data-act="' + x.act + '">' + esc(x.btn) + '</button>') + '</li>').join('') +
      '</ol><button class="link setup-skip" data-act="setup-dismiss">Nanti saja</button></section>';
  }

  function sheetCycle() {
    const d = D(), s = d.settings, st = Cycle.stats(d);
    const learned = st.dataCycle || st.dataPeriod
      ? '<div class="result tone-green"><b>' + icon('learn') + 'Dari catatanmu</b><p>' + (st.dataCycle ? 'Rata-rata siklus <b>' + st.dataCycle + ' hari</b> (' + st.count + ' siklus' + (st.count >= 2 ? ', ' + st.minCycle + '–' + st.maxCycle + ' hari' : '') + ')' : 'Siklus belum bisa dihitung (perlu minimal 2 kali haid tercatat)') + (st.dataPeriod ? ' · lama haid <b>' + st.dataPeriod + ' hari</b>' : '') + '.</p></div>'
      : '<p class="muted small">Belum ada catatan haid lengkap. Prediksi memakai angka di atas sampai catatanmu cukup.</p>';
    openSheet('<h2>Atur siklus haid</h2><p class="muted">Isi sesuai kebiasaanmu. Kalender dan perkiraan haid ikut menyesuaikan.</p>' +
      '<label class="lbl" for="cy-len">Panjang siklus <small>(hari pertama haid sampai haid berikutnya)</small></label><div class="stepper"><button class="btn btn-soft icon-only" data-act="step" data-t="cy-len" data-d="-1" aria-label="Kurangi">' + icon('minus') + '</button><input id="cy-len" type="number" min="18" max="60" inputmode="numeric" value="' + s.cycleLen + '"><button class="btn btn-soft icon-only" data-act="step" data-t="cy-len" data-d="1" aria-label="Tambah">' + icon('plus') + '</button></div>' +
      '<label class="lbl" for="cy-per">Lama haid <small>(hari)</small></label><div class="stepper"><button class="btn btn-soft icon-only" data-act="step" data-t="cy-per" data-d="-1" aria-label="Kurangi">' + icon('minus') + '</button><input id="cy-per" type="number" min="1" max="15" inputmode="numeric" value="' + s.periodLen + '"><button class="btn btn-soft icon-only" data-act="step" data-t="cy-per" data-d="1" aria-label="Tambah">' + icon('plus') + '</button></div>' +
      learned +
      '<label class="lbl">Cara prediksi</label>' + chips('pred-mode', [['auto', 'Otomatis (disarankan)'], ['manual', 'Pakai angka saya']], s.predMode || 'auto') +
      '<p class="muted small"><b>Otomatis:</b> mulai dari angka di atas, lalu belajar dari catatan haidmu (siklus terbaru paling berpengaruh). <b>Pakai angka saya:</b> prediksi selalu memakai angka di atas, cocok bila kamu sedang memakai kontrasepsi hormonal atau catatan lama tidak lengkap.</p>' +
      '<p class="muted small">Belum tahu? Biarkan 28 dan 7, nanti menyesuaikan sendiri.</p>' +
      '<div class="sheet-actions"><button class="btn btn-ghost" data-act="close-sheet">Batal</button><button class="btn btn-primary" data-act="cycle-save">' + icon('check') + 'Simpan</button></div>', { noFocus: true });
  }
  function sheetHijri() {
    const s = D().settings;
    openSheet('<h2>Kalender Hijriah</h2><p class="muted">Pilih yang kamu ikuti. Dipakai untuk tanggal Hijriah di aplikasi dan untuk menghitung hutang puasa Ramadhan.</p>' +
      chips('hcal', Object.keys(U.HIJRI_CALS).map((k) => [k, U.HIJRI_CALS[k]]), s.hijriCal || 'kemenag') +
      '<p class="muted small">Kemenag: prediksi hisab kriteria MABIMS (awal Ramadhan/Syawal/Dzulhijjah resmi ditetapkan sidang isbat). Muhammadiyah: Kalender Hijriah Global Tunggal. Koreksi ±hari tersedia di Pengaturan.</p>' +
      '<div class="sheet-actions"><button class="btn btn-ghost" data-act="close-sheet">Batal</button><button class="btn btn-primary" data-act="hijri-save">' + icon('check') + 'Simpan</button></div>', { noFocus: true });
  }
  function markSetup(key) { const s = D().settings; s.setup = Object.assign({}, s.setup, { [key]: true }); }

  function viewHome() {
    const d = D(), now = new Date();
    const cur = Cycle.current(d, now);
    const st = Fiqh.today(d, now);
    const name = d.settings.name ? ', ' + esc(d.settings.name) : '';
    let h = '<div class="greet"><div class="greet-hi">Assalamu\'alaikum' + name + '</div><div class="greet-date">' + U.fmtDate(now, true) + (U.fmtHijri(now) ? ' · ' + U.fmtHijri(now) : '') + '</div></div>';
    h += setupCard();
    h += installBanner();

    if (!cur) {
      // Belum ada catatan haid: semua masih nol, belum ada fase/prediksi yang dihitung
      h += '<section class="card hero empty-hero">' + ringEmpty() +
        '<p class="muted center">Belum ada catatan. Isi kapan haid terakhirmu dimulai, nanti Tamu yang menghitung sisanya.</p>' +
        '<button class="btn btn-primary btn-big" data-act="init-open">' + icon('edit') + 'Isi tanggal & jam haid terakhir</button>' +
        '<button class="btn btn-ghost hero-edit" data-act="start-period">' + icon('drop') + 'Haid mulai hari ini</button></section>' +
        '<section class="card"><h3 class="card-t">Perkiraan</h3><div class="pred empty-pred">' +
        ['Haid berikutnya', 'Masa subur', 'Perkiraan ovulasi', 'Rata-rata siklus', 'Rata-rata haid', 'Keteraturan'].map((k) => '<div><span class="k">' + k + '</span><span class="v">–</span></div>').join('') +
        '</div><p class="muted small">Muncul setelah awal haid diisi.</p></section>';
      return h + statusCard(st);
    }
    h += '<section class="card hero">' + ring(cur);
    if (cur.mode === 'cycle') {
      h += '<div class="legend">' + ['menstruasi', 'folikular', 'ovulasi', 'luteal'].map((k) => '<span><i class="dot ph-' + phaseInfo(k).color + '"></i>' + phaseInfo(k).name + '</span>').join('') + '</div>';
    }
    h += mainAction() + '<button class="btn btn-ghost hero-edit" data-act="init-open">' + icon('edit') + 'Isi / ubah tanggal & jam haid</button>' + '</section>';

    if (cur.mode === 'cycle' && cur.lateDays > 0) {
      h += '<section class="card banner ' + (cur.lateDays >= 7 ? 'tone-amber' : 'tone-soft') + '">' + icon('info') + '<div><b>Haid terlambat ' + cur.lateDays + ' hari</b> dari perkiraan (' + U.fmtShort(cur.nextStart) + ').' +
        (cur.lateDays >= 7 ? ' Bila ada kemungkinan hamil, lakukan test pack. ' : ' Selisih beberapa hari masih wajar. ') + '<a href="#a/telat">Penyebab haid terlambat</a></div></section>';
    }
    h += statusCard(st);

    if (cur.mode === 'cycle') {
      const ph = phaseInfo(cur.phase);
      h += '<section class="card phase"><div class="phase-tag ph-' + ph.color + '">Fase ' + esc(ph.name) + ' · ' + esc(ph.tag) + '</div><p class="lead">' + esc(ph.short) + '</p><p class="muted">' + esc(ph.hormon) + '</p>' +
        '<div class="two"><div><h4>Mungkin terasa</h4><ul>' + ph.tubuh.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div><div><h4>Tips</h4><ul>' + ph.tips.slice(0, 3).map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul></div></div>' +
        '<p class="ibadah">' + icon('moon') + '<span>' + esc(ph.ibadah) + '</span></p></section>';

      const st2 = cur.st;
      const range = cur.lateDays > 0 ? 'Segera (terlambat ' + cur.lateDays + ' hari)'
        : U.diffDays(cur.nextRange[1], cur.nextRange[0]) > 0 ? U.fmtShort(cur.nextRange[0]) + ' – ' + U.fmtShort(cur.nextRange[1]) : U.fmtShort(cur.nextStart);
      h += '<section class="card"><h3 class="card-t">Perkiraan</h3><div class="pred">' +
        '<div><span class="k">Haid berikutnya</span><span class="v">' + range + '</span></div>' +
        '<div><span class="k">Masa subur</span><span class="v">' + U.fmtShort(cur.fertile[0]) + ' – ' + U.fmtShort(cur.fertile[1]) + '</span></div>' +
        '<div><span class="k">Perkiraan ovulasi</span><span class="v">' + U.fmtShort(cur.ovulation) + '</span></div>' +
        '<div><span class="k">Rata-rata siklus</span><span class="v">' + st2.avgCycle + ' hari</span></div>' +
        '<div><span class="k">Rata-rata haid</span><span class="v">' + st2.avgPeriod + ' hari</span></div>' +
        '<div><span class="k">Keteraturan</span><span class="v">' + (st2.regular === null ? 'belum cukup data' : st2.regular ? 'teratur' : 'tidak teratur') + '</span></div></div>' +
        '<div class="basis">' + icon('info') + '<span>Dasar prediksi: ' + esc(Cycle.basisText(st2)) + '. Perkiraan ini bukan alat kontrasepsi.</span><button class="btn btn-ghost small" data-act="cycle-setup">Atur</button></div></section>';
    }
    const todayLog = d.logs[U.ymd(now)];
    h += '<section class="card log-cta"><div><h3 class="card-t">Catatan hari ini</h3><p class="muted">' + (todayLog ? esc(logSummary(todayLog)) : 'Catat aliran, warna darah, gejala, dan suasana hati.') + '</p></div><button class="btn btn-soft" data-act="log" data-date="' + U.ymd(now) + '">' + icon(todayLog ? 'edit' : 'plus') + (todayLog ? 'Ubah' : 'Catat') + '</button></section>';
    return h;
  }

  /* ---------- Log harian ---------- */
  const FLOW = [['flek', 'Flek'], ['ringan', 'Ringan'], ['sedang', 'Sedang'], ['deras', 'Deras']];
  const COLOR = [['hitam', 'Hitam', 'c-hitam'], ['merah-tua', 'Merah tua', 'c-merahtua'], ['merah', 'Merah', 'c-merah'], ['merah-muda', 'Merah muda', 'c-pink'], ['kuning', 'Kuning (shufrah)', 'c-kuning'], ['keruh', 'Keruh/coklat (kudrah)', 'c-keruh'], ['bening', 'Putih bening (tanda suci)', 'c-bening']];
  const SYMS = ['Kram perut', 'Sakit kepala', 'Nyeri punggung', 'Payudara nyeri', 'Kembung', 'Jerawat', 'Lelah', 'Mual', 'Pusing', 'Nafsu makan naik', 'Susah tidur', 'Keputihan', 'Lendir bening'];
  const MOODS = [['senang', 'Senang'], ['tenang', 'Tenang'], ['sensitif', 'Sensitif'], ['sedih', 'Sedih'], ['cemas', 'Cemas'], ['marah', 'Mudah marah']];
  const lbl = (arr, v) => { const x = arr.find((a) => a[0] === v); return x ? x[1] : v; };
  function logSummary(l) {
    const parts = [];
    if (l.flow) parts.push('Aliran ' + lbl(FLOW, l.flow).toLowerCase());
    if (l.color) parts.push(lbl(COLOR, l.color).toLowerCase());
    if (l.symptoms && l.symptoms.length) parts.push(l.symptoms.join(', ').toLowerCase());
    if (l.mood) parts.push('merasa ' + lbl(MOODS, l.mood).toLowerCase());
    if (l.note) parts.push('"' + l.note + '"');
    return parts.join(' · ') || 'Ada catatan';
  }
  function sheetLog(ymd) {
    const l = D().logs[ymd] || {};
    openSheet('<h2>Catatan ' + U.fmtDate(U.parseYMD(ymd), true) + '</h2>' +
      '<label class="lbl">Aliran darah</label>' + chips('flow', FLOW, l.flow) +
      '<label class="lbl">Warna darah <small>(penting untuk tamyiz)</small></label>' + chips('color', COLOR, l.color) +
      '<label class="lbl">Gejala</label>' + chips('sym', SYMS.map((s) => [s, s]), l.symptoms || [], true) +
      '<label class="lbl">Suasana hati</label>' + chips('mood', MOODS, l.mood) +
      '<label class="lbl" for="lg-note">Catatan pribadi</label><textarea id="lg-note" rows="3" maxlength="1000" placeholder="Tulis apa saja. Hanya tersimpan di perangkat ini.">' + esc(l.note || '') + '</textarea>' +
      '<div class="sheet-actions">' + (D().logs[ymd] ? '<button class="btn btn-ghost danger" data-act="log-del" data-date="' + ymd + '">' + icon('trash') + 'Hapus</button>' : '') + '<button class="btn btn-primary" data-act="log-save" data-date="' + ymd + '">' + icon('check') + 'Simpan</button></div>', { noFocus: true });
  }

  /* ---------- Mulai / akhiri darah ---------- */
  function sheetStart(kind, dateYMD) {
    kind = kind || 'haid';
    let def = new Date();
    if (dateYMD && dateYMD !== U.ymd(def)) { def = U.parseYMD(dateYMD); def.setHours(7, 0); }
    openSheet('<h2>' + (kind === 'nifas' ? 'Mulai nifas' : 'Darah haid keluar') + '</h2>' +
      '<p class="muted">' + (kind === 'nifas' ? 'Masukkan waktu darah keluar setelah bayi lahir (rahim kosong).' : 'Masukkan tanggal dan jam pertama kali kamu melihat darah. Jam penting untuk menentukan shalat yang perlu diqadha.') + '</p>' +
      '<label class="lbl" for="st-at">Waktu mulai</label><input type="datetime-local" id="st-at" value="' + U.toLocalInput(def) + '" max="' + U.toLocalInput(new Date(Date.now() + 6e4)) + '">' +
      '<label class="lbl">Jenis</label>' + chips('kind', [['haid', 'Haid'], ['nifas', 'Nifas (setelah melahirkan)']], kind) +
      '<div class="sheet-actions"><button class="btn btn-ghost" data-act="close-sheet">Batal</button><button class="btn btn-primary" data-act="start-save">' + icon('check') + 'Simpan</button></div>', { noFocus: true });
  }
  function sheetEnd(dateYMD) {
    const og = ongoing();
    if (!og) return;
    let def = new Date();
    if (dateYMD && dateYMD !== U.ymd(def)) { def = U.parseYMD(dateYMD); def.setHours(new Date().getHours(), new Date().getMinutes()); }
    if (def < new Date(og.start)) def = new Date(+new Date(og.start) + 6e4);
    openSheet('<h2>Darah sudah berhenti</h2><p class="muted">Mulai ' + U.fmtDateTime(og.start) + '. Masukkan waktumu yakin sudah suci (keluar cairan bening atau kapas bersih).</p>' +
      '<label class="lbl" for="en-at">Waktu berhenti</label><input type="datetime-local" id="en-at" value="' + U.toLocalInput(def) + '" min="' + U.toLocalInput(og.start) + '" max="' + U.toLocalInput(new Date(Date.now() + 6e4)) + '">' +
      '<div class="sheet-actions"><button class="btn btn-ghost" data-act="close-sheet">Batal</button><button class="btn btn-primary" data-act="end-save">' + icon('check') + 'Simpan</button></div>', { noFocus: true });
  }
  function sheetResult(p, which) {
    const d = D();
    const ev = Fiqh.evaluate(d, p);
    const pr = which === 'end' ? Fiqh.atEnd(d, new Date(p.end)) : Fiqh.atStart(d, new Date(p.start));
    openSheet('<h2>' + (which === 'end' ? 'Tercatat: darah berhenti' : 'Tercatat: darah keluar') + '</h2>' +
      '<div class="result tone-' + ev.tone + '"><b>' + esc(ev.label) + '</b><ul>' + ev.lines.map((l) => '<li>' + esc(l) + '</li>').join('') + '</ul></div>' +
      '<div class="result tone-' + (pr.tone === 'warn' ? 'amber' : 'green') + '"><b>' + icon('clock') + 'Shalat</b><p>' + esc(pr.text) + '</p><p class="muted small">' + esc(T.Kemenag.label(new Date(which === 'end' ? p.end : p.start))) + '.</p></div>' +
      (which === 'end' && ev.haidRange ? '<p><a href="#a/mandi" data-act="close-sheet">Niat & tata cara mandi wajib →</a></p>' : '') +
      '<div class="sheet-actions"><button class="btn btn-primary" data-act="close-sheet">Mengerti</button></div>', { noFocus: true });
  }
  function sheetEditPeriod(id) {
    const p = D().periods.find((x) => x.id === id);
    if (!p) return;
    openSheet('<h2>Ubah catatan</h2>' +
      '<label class="lbl">Jenis</label>' + chips('kind', [['haid', 'Haid'], ['nifas', 'Nifas']], p.kind) +
      '<label class="lbl" for="ed-s">Mulai</label><input type="datetime-local" id="ed-s" value="' + U.toLocalInput(p.start) + '">' +
      '<label class="lbl" for="ed-e">Berhenti <small>(kosongkan bila masih berlangsung)</small></label><input type="datetime-local" id="ed-e" value="' + (p.end ? U.toLocalInput(p.end) : '') + '">' +
      '<div class="sheet-actions"><button class="btn btn-ghost danger" data-act="period-del" data-id="' + id + '">' + icon('trash') + 'Hapus</button><button class="btn btn-primary" data-act="period-save" data-id="' + id + '">' + icon('check') + 'Simpan</button></div>', { noFocus: true });
  }

  /** Keterangan tanggal yang dipilih di kalender: haid/nifas hari ke-berapa, status fikihnya, perkiraan, atau keterlambatan. */
  function dayStatus(d, sd, mk, now) {
    const p = d.periods.find((x) => U.sod(x.start) <= sd && sd <= U.sod(x.end || now));
    if (p) {
      const ev = Fiqh.evaluate(d, p, now);
      const n = U.diffDays(sd, p.start) + 1;
      let hukum;
      if (!ev.haidRange) hukum = 'Bukan haid: istihadhah / darah kurang dari 24 jam';
      else {
        const a = U.sod(ev.haidRange[0]), b = U.sod(ev.haidRange[1]);
        hukum = sd >= a && sd <= b ? (p.kind === 'nifas' ? 'Dihukumi nifas' : 'Dihukumi haid') : (p.kind === 'nifas' ? 'Istihadhah (lewat batas nifas 60 hari)' : 'Istihadhah (di luar batas haid)');
      }
      return '<div class="day-status ' + (p.kind === 'nifas' ? 'ds-nifas' : 'ds-haid') + '">' + icon('drop') + '<div><b>' + (p.kind === 'nifas' ? 'Nifas' : 'Haid') + ' hari ke-' + n + '</b>' +
        '<small>Mulai ' + U.fmtDateTime(p.start) + (p.end ? ' · berhenti ' + U.fmtDateTime(p.end) : ' · masih berlangsung') + '</small>' +
        '<small>Status fikih: <b>' + esc(hukum) + '</b></small></div><button class="icon-btn" data-act="edit-period" data-id="' + p.id + '" aria-label="Ubah catatan">' + icon('edit') + '</button></div>';
    }
    const cur = Cycle.current(d, now);
    if (mk.haidPred) {
      const og = ongoing();
      return '<div class="day-status ds-haid">' + icon('drop') + '<div><b>Perkiraan haid hari ke-' + mk.haidPred + '</b><small>Haid sedang berlangsung sejak ' + (og ? U.fmtDateTime(og.start) : '') + '. Diperkirakan selesai sekitar ' + U.fmtDate(U.addDays(U.sod(og ? og.start : now), Cycle.stats(d).avgPeriod - 1)) + ', sesuai kebiasaan lama haid ' + Cycle.stats(d).avgPeriod + ' hari.</small><small>Bila darah berhenti lebih cepat atau lebih lama, warnanya menyesuaikan setelah kamu menandai selesai.</small></div></div>';
    }
    if (mk.late && cur) {
      return '<div class="day-status ds-late">' + icon('info') + '<div><b>Haid terlambat ' + mk.late + ' hari</b><small>Perkiraan semula ' + U.fmtDate(cur.nextStart) + '. Selisih beberapa hari masih wajar. <a href="#a/telat">Penyebab haid terlambat</a></small></div></div>';
    }
    if (mk.pred && cur) {
      return '<div class="day-status ds-pred">' + icon('drop') + '<div><b>Perkiraan haid</b><small>' + (mk.pred === 'late' ? 'Perkiraan digeser karena haid belum datang. Bisa datang kapan saja mulai besok.' : 'Berdasarkan rata-rata siklus ' + cur.st.avgCycle + ' hari dan lama haid ' + cur.st.avgPeriod + ' hari.') + '</small></div></div>';
    }
    if (mk.ovu) return '<div class="day-status ds-fertile">' + icon('leaf') + '<div><b>Perkiraan ovulasi</b><small>Puncak masa subur (perkiraan, bukan alat kontrasepsi).</small></div></div>';
    if (mk.fertile) return '<div class="day-status ds-fertile">' + icon('leaf') + '<div><b>Masa subur</b><small>Perkiraan dari panjang siklusmu.</small></div></div>';
    return '';
  }

  /* ---------- Halaman: Kalender ---------- */
  function viewCalendar() {
    const d = D(), now = new Date();
    const m = Cycle.marks(d, now);
    const first = new Date(state.month.getFullYear(), state.month.getMonth(), 1);
    const startOffset = first.getDay();
    const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const todayKey = U.ymd(now);
    let cells = '';
    for (let i = 0; i < startOffset; i++) cells += '<div class="cell blank"></div>';
    for (let day = 1; day <= days; day++) {
      const dt = new Date(first.getFullYear(), first.getMonth(), day);
      const key = U.ymd(dt);
      const mk = m[key] || {};
      const cls = ['cell'];
      if (mk.nifas) cls.push('is-nifas'); else if (mk.haid) cls.push('is-haid');
      else if (mk.haidPred) cls.push('is-haid-pred');
      else if (mk.late) cls.push('is-late');
      else if (mk.pred) cls.push('is-pred');
      else if (mk.fertile) cls.push('is-fertile');
      if (mk.ovu && !mk.haid) cls.push('is-ovu');
      if (key === todayKey) cls.push('is-today');
      if (key === state.sel) cls.push('is-sel');
      const h = U.hijri(new Date(dt.getFullYear(), dt.getMonth(), day, 12));
      cells += '<button class="' + cls.join(' ') + '" data-act="sel-day" data-date="' + key + '" aria-label="' + U.fmtDate(dt, true) + '"><span class="n">' + day + '</span>' + (h ? '<span class="hj" lang="ar">' + U.arabNum(h.d) + '</span>' : '') + (mk.log ? '<i class="logdot"></i>' : '') + '</button>';
    }
    const h1 = U.hijri(new Date(first.getFullYear(), first.getMonth(), 1, 12)), h2 = U.hijri(new Date(first.getFullYear(), first.getMonth(), days, 12));
    const hijriLbl = h1 && h2 ? (h1.m === h2.m ? U.HIJRI[h1.m - 1] + ' ' + h1.y : U.HIJRI[h1.m - 1] + ' – ' + U.HIJRI[h2.m - 1] + ' ' + h2.y) + ' H' : '';

    let h = '<section class="card cal"><div class="cal-head"><button class="icon-btn" data-act="month" data-dir="-1" aria-label="Bulan sebelumnya">' + icon('left') + '</button><div class="cal-title"><b>' + U.BULAN[first.getMonth()] + ' ' + first.getFullYear() + '</b><small>' + hijriLbl + '</small></div><button class="icon-btn" data-act="month" data-dir="1" aria-label="Bulan berikutnya">' + icon('right') + '</button></div>' +
      '<div class="cal-grid wk">' + ['Ahd', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((x) => '<div>' + x + '</div>').join('') + '</div><div class="cal-grid">' + cells + '</div>' +
      '<div class="legend cal-legend"><span><i class="sw sw-haid"></i>Haid</span><span><i class="sw sw-haid-pred"></i>Perkiraan sisa haid</span><span><i class="sw sw-pred"></i>Perkiraan haid</span><span><i class="sw sw-late"></i>Terlambat</span><span><i class="sw sw-fertile"></i>Masa subur</span><span><i class="sw sw-ovu"></i>Ovulasi</span><span><i class="sw sw-nifas"></i>Nifas</span></div>' +
      (Cycle.current(d, now) ? '<div class="basis cal-basis">' + icon('info') + '<span>Prediksi: ' + esc(Cycle.basisText(Cycle.stats(d))) + '</span><button class="btn btn-ghost small" data-act="cycle-setup">Atur</button></div>' : '') +
      '<p class="muted small cal-src">Tanggal Hijriah: ' + esc(U.HIJRI_CALS[d.settings.hijriCal] || U.HIJRI_CALS.kemenag) + (d.settings.hijriAdj ? ' (koreksi ' + (d.settings.hijriAdj > 0 ? '+' : '') + d.settings.hijriAdj + ' hari)' : '') + ' · <a href="#settings">ubah</a></p></section>';

    const sd = U.parseYMD(state.sel);
    const mk = m[state.sel] || {};
    const log = d.logs[state.sel];
    const og = ongoing();
    const tags = [];
    if (mk.haid) tags.push('<span class="tag tag-haid">Haid</span>');
    if (mk.nifas) tags.push('<span class="tag tag-nifas">Nifas</span>');
    if (mk.haidPred) tags.push('<span class="tag tag-haid">Perkiraan haid</span>');
    if (mk.late) tags.push('<span class="tag tag-late">Terlambat</span>');
    if (mk.pred && !mk.haid) tags.push('<span class="tag tag-line">Perkiraan haid</span>');
    if (mk.fertile) tags.push('<span class="tag tag-green">Masa subur</span>');
    if (mk.ovu) tags.push('<span class="tag tag-green">Ovulasi</span>');
    h += '<section class="card"><div class="day-head"><div><b>' + U.fmtDate(sd, true) + '</b><div class="muted small">' + U.fmtHijri(new Date(sd.getFullYear(), sd.getMonth(), sd.getDate(), 12)) + '</div></div><div class="tags">' + tags.join('') + '</div></div>' +
      dayStatus(d, sd, mk, now) +
      (log ? '<p class="muted">' + esc(logSummary(log)) + '</p>' : '') +
      '<div class="row gap wrap"><button class="btn btn-soft" data-act="log" data-date="' + state.sel + '">' + icon(log ? 'edit' : 'plus') + (log ? 'Ubah catatan' : 'Catat hari ini') + '</button>' +
      (!og && sd <= now && !mk.haid && !mk.nifas ? '<button class="btn btn-ghost" data-act="start-period" data-date="' + state.sel + '">' + icon('drop') + 'Haid mulai di tanggal ini</button>' : '') +
      (og && sd >= U.sod(og.start) && sd <= now ? '<button class="btn btn-ghost" data-act="end-period" data-date="' + state.sel + '">' + icon('check') + (og.kind === 'nifas' ? 'Nifas' : 'Haid') + ' berhenti di tanggal ini</button>' : '') + '</div></section>';

    const ps = Cycle.sorted(d.periods).reverse();
    h += '<section class="card"><div class="hist-head"><h3 class="card-t">Riwayat darah</h3>' + (ps.length ? '<button class="btn btn-ghost small danger" data-act="haid-reset">' + icon('trash') + 'Reset</button>' : '') + '</div>' + (ps.length ? '<ul class="hist">' + ps.map((p) => {
      const ev = Fiqh.evaluate(d, p, now);
      return '<li><div class="hist-main"><span class="badge tone-' + ev.tone + '">' + esc(ev.label) + '</span><div class="hist-dates">' + U.fmtDateTime(p.start) + ' → ' + (p.end ? U.fmtDateTime(p.end) : '<i>masih berlangsung</i>') + (p.approx ? ' · <i>jam perkiraan</i>' : '') + '</div></div><button class="icon-btn" data-act="edit-period" data-id="' + p.id + '" aria-label="Ubah">' + icon('edit') + '</button></li>';
    }).join('') + '</ul>' : '<p class="muted">Belum ada catatan. Pilih tanggal di kalender lalu tekan "Haid mulai di tanggal ini" untuk menambah riwayat.</p>') + '</section>';
    return h;
  }

  /* ---------- Halaman: Fikih ---------- */
  function viewFiqh() {
    const d = D(), now = new Date();
    const st = Fiqh.today(d, now);
    const q = Fiqh.qadhaSummary(d, now);
    const c = Prayer.city(d.settings.city);
    const tt = Prayer.times(now, c.lat, c.lng);
    let h = statusCard(st, true);
    h += '<section class="card qadha"><div class="qadha-top"><div><h3 class="card-t">Hutang puasa Ramadhan</h3><p class="muted small">Dihitung otomatis dari catatan haid/nifas yang jatuh di bulan Ramadhan.</p></div><div class="qadha-num"><b>' + q.remaining + '</b><span>hari lagi</span></div></div>' +
      '<div class="qadha-bar"><i style="width:' + (q.owed ? Math.min(100, (q.paid / q.owed) * 100) : 0).toFixed(0) + '%"></i></div>' +
      '<p class="small">' + q.paid + ' dari ' + q.owed + ' hari sudah diqadha' + (Object.keys(q.byYear).length ? ' · ' + Object.keys(q.byYear).map((y) => 'Ramadhan ' + y + ' H: ' + q.byYear[y].length + ' hari').join(', ') : '') + (q.adjust ? ' · koreksi manual ' + (q.adjust > 0 ? '+' : '') + q.adjust : '') + '</p>' +
      '<div class="row gap wrap"><button class="btn btn-green" data-act="qadha-pay"' + (q.remaining ? '' : ' disabled') + '>' + icon('check') + 'Saya qadha 1 hari</button><button class="btn btn-ghost" data-act="qadha-adjust">Koreksi jumlah</button></div>' +
      (d.qadha.paid.length ? '<details class="rules"><summary>Riwayat qadha (' + d.qadha.paid.length + ')</summary><ul class="paid">' + d.qadha.paid.slice().reverse().map((x, i) => '<li>' + U.fmtDate(U.parseYMD(x), true) + (i === 0 ? ' <button class="link" data-act="qadha-undo">batalkan</button>' : '') + '</li>').join('') + '</ul></details>' : '') +
      '<p class="muted small">Bulan Ramadhan ditentukan dengan kalender ' + esc(U.HIJRI_CALS[d.settings.hijriCal] || U.HIJRI_CALS.kemenag) + ' (<a href="#settings">ubah</a>). Bila tanggal Ramadhan yang kamu ikuti berbeda, gunakan "Koreksi jumlah". <a href="#a/puasa">Niat & batas qadha</a></p></section>';

    const last = Cycle.sorted(d.periods).pop();
    if (last) {
      h += '<section class="card"><h3 class="card-t">Analisis shalat, darah terakhir</h3><div class="result tone-' + (Fiqh.atStart(d, new Date(last.start)).tone === 'warn' ? 'amber' : 'green') + '"><b>Saat mulai · ' + U.fmtDateTime(last.start) + '</b><p>' + esc(Fiqh.atStart(d, new Date(last.start)).text) + '</p></div>' +
        (last.end ? '<div class="result tone-amber"><b>Saat berhenti · ' + U.fmtDateTime(last.end) + '</b><p>' + esc(Fiqh.atEnd(d, new Date(last.end)).text) + '</p></div>' : '') + '</section>';
    }
    h += prayerCard(tt, c);

    h += '<section class="card tools"><h3 class="card-t">Alat bantu</h3>' +
      '<button class="tool" data-act="simulate">' + icon('scale') + '<span><b>Cek hukum darah</b><small>Masukkan waktu mulai dan berhenti, lalu lihat hukumnya: haid, istihadhah, atau bukan haid.</small></span></button>' +
      '<button class="tool" data-act="start-nifas"' + (ongoing() ? ' disabled' : '') + '>' + icon('baby') + '<span><b>Mulai nifas</b><small>Setelah melahirkan atau keguguran. Batas nifas 60 hari.</small></span></button>' +
      '<a class="tool" href="#a/mandi">' + icon('drop') + '<span><b>Niat & tata cara mandi wajib</b><small>Rukun, sunnah, dan lafal niat.</small></span></a></section>';

    h += '<section class="card"><h3 class="card-t">Bacaan fikih</h3><ul class="links">' + Content.ARTICLES.filter((a) => a.cat === 'fikih' || a.cat === 'nifas').map((a) => '<li><a href="#a/' + a.id + '">' + esc(a.title) + '</a></li>').join('') + '</ul></section>';
    return h;
  }

  /* ---------- Jadwal shalat (Kemenag / hitung offline) ---------- */
  function prayerCard(tt, c) {
    const s = D().settings;
    const kmg = s.jadwalSource === 'kemenag';
    const isOfficial = tt.src === 'kemenag';
    const jc = D().jadwal || {};
    let status;
    if (isOfficial) status = '<p class="src ok">' + icon('check') + '<span>' + esc(T.Kemenag.label()) + '<small>Disimpan di perangkat, tetap tersedia saat offline.</small></span></p>';
    else if (kmg && s.kemenag) status = '<p class="src warn">' + icon('info') + '<span>' + esc(T.Kemenag.label()) + '<small>Jadwal Kemenag untuk ' + esc(s.kemenag.lokasi) + ' belum terunduh' + (jc.lastError ? ' (' + esc(jc.lastError) + ')' : navigator.onLine === false ? ' (sedang offline)' : '') + '. <button class="link" data-act="kmg-retry">Coba lagi</button></small></span></p>';
    else if (kmg) status = '<p class="src warn">' + icon('info') + '<span>' + esc(T.Kemenag.label()) + '<small>Pilih kab/kota di bawah untuk memakai jadwal resmi Kemenag.</small></span></p>';
    else status = '<p class="src">' + icon('info') + '<span>' + esc(T.Kemenag.label()) + '<small>Mode offline penuh: tidak ada koneksi internet sama sekali.</small></span></p>';

    return '<section class="card"><h3 class="card-t">Waktu shalat hari ini</h3><div class="pt">' + ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((k) => '<div><span>' + Prayer.NAMES[k] + '</span><b>' + U.fmtTime(tt[k]) + '</b></div>').join('') + '</div>' + status +
      (kmg ? '<button class="btn btn-soft gps-btn" data-act="gps">' + icon('pin') + (s.coords ? 'Perbarui lokasi GPS' : 'Gunakan lokasi saya (GPS)') + '</button>' +
        (s.coords ? '<p class="muted small">Lokasi GPS tersimpan di perangkat (±100 m)' + (s.kemenag && s.kemenag.km != null ? '. Titik acuan jadwal ' + esc(s.kemenag.lokasi) + ' berjarak ±' + s.kemenag.km + ' km dari kamu' : '') + '. <button class="link" data-act="gps-forget">Hapus lokasi</button></p>' : '<p class="muted small">Lokasi hanya dipakai di HP kamu untuk mencari kab/kota Kemenag terdekat. Yang dikirim tetap hanya ID kab/kota.</p>') +
        '<label class="lbl" for="kmg-q">Atau cari kabupaten/kota (data Bimas Islam Kemenag)</label><form class="kmg-form" data-act="kmg-form"><input id="kmg-q" type="search" placeholder="' + esc(s.kemenag ? s.kemenag.lokasi : 'Cari, mis. Sleman') + '" autocomplete="off" maxlength="40"><button class="btn btn-soft">Cari</button></form><div id="kmg-res" class="kmg-res"></div>' : '') +
      '<details class="rules"><summary>Pengaturan jadwal</summary>' +
      '<label class="lbl" for="src-sel">Sumber jadwal</label><select id="src-sel" data-change="jadwalSource"><option value="kemenag"' + (kmg ? ' selected' : '') + '>Jadwal resmi Kemenag RI (perlu internet sesekali)</option><option value="hitung"' + (!kmg ? ' selected' : '') + '>Hitung di perangkat (offline penuh)</option></select>' +
      '<label class="lbl" for="city-sel">Kota cadangan untuk hitung offline</label><select id="city-sel" data-change="city">' + Prayer.CITIES.map((x) => '<option value="' + x.id + '"' + (x.id === c.id ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select>' +
      '<p class="muted small">Jadwal Kemenag diambil dari api.myquran.com, yang menyajikan data Bimas Islam Kemenag RI. <b>Yang dikirim hanya ID kab/kota dan bulan</b>, tidak ada data haid atau identitas. Hitungan offline memakai kriteria Kemenag (Subuh 20°, Isya 18°, Ashar Syafi\'i, ihtiyath 2 menit), tetapi tanpa koreksi ketinggian tempat, sehingga bisa selisih beberapa menit.</p></details></section>';
  }
  async function kmgSearch() {
    const q = val('kmg-q');
    const box = document.getElementById('kmg-res');
    if (!box) return;
    if (q.trim().length < 3) { box.innerHTML = '<p class="muted small">Ketik minimal 3 huruf.</p>'; return; }
    box.innerHTML = '<p class="muted small">Mencari…</p>';
    try {
      const list = await T.Kemenag.search(q);
      box.innerHTML = list.length ? list.slice(0, 12).map((x) => '<button class="chip" data-act="kmg-pick" data-id="' + esc(x.id) + '" data-lokasi="' + esc(x.lokasi) + '">' + esc(x.lokasi) + '</button>').join('') : '<p class="muted small">Tidak ditemukan. Coba nama kabupaten/kota lain.</p>';
    } catch (e) {
      box.innerHTML = '<p class="err">Gagal mencari (' + esc(navigator.onLine === false ? 'sedang offline' : e.message || e) + ').</p>';
    }
  }
  async function kmgSync(manual) {
    const changed = await T.Kemenag.sync();
    if (changed && !Store.locked && D().settings.onboarded && !document.querySelector('.sheet-root.open')) render();
    if (manual) toast(T.Kemenag.lookup(new Date()) ? 'Jadwal Kemenag tersimpan di perangkat.' : 'Belum berhasil mengunduh jadwal Kemenag.');
  }

  function sheetSimulate() {
    const now = new Date();
    openSheet('<h2>Cek hukum darah</h2><p class="muted">Simulasi saja, tidak disimpan. Cocok untuk memahami kasus sendiri atau membantu teman.</p>' +
      '<label class="lbl" for="sm-s">Darah mulai</label><input type="datetime-local" id="sm-s" value="' + U.toLocalInput(U.addDays(now, -5)) + '">' +
      '<label class="lbl" for="sm-e">Darah berhenti</label><input type="datetime-local" id="sm-e" value="' + U.toLocalInput(now) + '">' +
      '<label class="lbl" for="sm-p">Haid sebelumnya berhenti <small>(opsional)</small></label><input type="datetime-local" id="sm-p" value="">' +
      '<label class="lbl" for="sm-pd">Lama haid sebelumnya, hari <small>(opsional, untuk \'adah)</small></label><input type="number" id="sm-pd" min="1" max="15" inputmode="numeric" placeholder="mis. 7">' +
      '<div id="sm-out"></div><div class="sheet-actions"><button class="btn btn-ghost" data-act="close-sheet">Tutup</button><button class="btn btn-primary" data-act="simulate-run">Periksa</button></div>', { noFocus: true });
  }
  function runSimulate() {
    const s = U.fromLocalInput(val('sm-s')), e = U.fromLocalInput(val('sm-e')), pe = U.fromLocalInput(val('sm-p'));
    const pd = parseFloat(val('sm-pd'));
    const out = document.getElementById('sm-out');
    if (!s || !e || e <= s) { out.innerHTML = '<p class="err">Waktu berhenti harus setelah waktu mulai.</p>'; return; }
    const periods = [];
    if (pe) {
      const len = (pd > 0 ? pd : 7) * U.DAY;
      periods.push({ id: 'prev', kind: 'haid', start: new Date(+pe - len).toISOString(), end: pe.toISOString() });
    }
    const p = { id: 'sim', kind: 'haid', start: s.toISOString(), end: e.toISOString() };
    periods.push(p);
    const fake = { settings: D().settings, periods, logs: {}, qadha: { adjust: 0, paid: [] } };
    const ev = Fiqh.evaluate(fake, p);
    const a = Fiqh.atStart(fake, s), b = Fiqh.atEnd(fake, e);
    out.innerHTML = '<div class="result tone-' + ev.tone + '"><b>' + esc(ev.label) + '</b><ul>' + ev.lines.map((l) => '<li>' + esc(l) + '</li>').join('') + '</ul></div>' +
      (ev.haidRange ? '<div class="result tone-green"><b>Shalat</b><p>' + esc(a.text) + '</p><p>' + esc(b.text) + '</p></div>' : '');
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ---------- Halaman: Edukasi ---------- */
  function viewLearn() {
    let h = '<div class="page-h"><h1>Edukasi</h1><p class="muted">Kesehatan reproduksi dan fikih haid dalam bahasa yang mudah. Semua bisa dibaca tanpa internet.</p></div>';
    for (const c of Content.CATS) {
      const list = Content.ARTICLES.filter((a) => a.cat === c.id);
      h += '<section class="card"><h3 class="card-t">' + esc(c.name) + '</h3><div class="arts">' + list.map((a) => '<a class="art" href="#a/' + a.id + '"><b>' + esc(a.title) + '</b><small>' + a.mins + ' menit baca</small></a>').join('') + '</div></section>';
    }
    h += '<p class="muted small center">Bagian fikih mengikuti mazhab Syafi\'i, yang dominan di Indonesia. Untuk kasus khusus, tanyakan kepada ustadzah atau ulama. Bagian kesehatan bukan pengganti konsultasi dokter.</p>';
    return h;
  }
  function viewArticle(id) {
    const a = Content.ARTICLES.find((x) => x.id === id);
    if (!a) return '<section class="card"><p>Artikel tidak ditemukan.</p><a href="#learn">Kembali</a></section>';
    const body = typeof a.body === 'function' ? a.body() : a.body;
    const cat = Content.CATS.find((c) => c.id === a.cat);
    return '<a class="back" href="#learn">' + icon('left') + 'Edukasi</a><article class="card article"><div class="muted small">' + esc(cat ? cat.name : '') + ' · ' + a.mins + ' menit</div><h1>' + esc(a.title) + '</h1>' + body + '</article>';
  }

  /* ---------- Halaman: Tanya ---------- */
  /* Tanya AI dinonaktifkan atas permintaan pemilik aplikasi: chat hanya memakai pustaka offline (tanpa Claude).
   * Kode server lama disimpan di _nonaktif/tanya-ai/. Ubah ke true hanya bila fitur itu diaktifkan kembali. */
  const AI_ENABLED = false;
  function aiOn() { return AI_ENABLED && !!D().settings.ai; }
  const mzBadge = (mz) => '<span class="mzb mz-' + mz + '">' + esc(T.Kitab.MZ[mz] ? T.Kitab.MZ[mz].name : mz) + '</span>';

  function mzBlock(mz) {
    if (!mz) return '';
    const body = mz.ijma
      ? '<p class="ijma">' + icon('check') + '<span>' + esc(mz.ijma) + '</span></p>'
      : ['hanafi', 'maliki', 'syafii', 'hanbali'].filter((k) => mz[k]).map((k) => '<div class="mz-row">' + mzBadge(k) + '<p>' + esc(mz[k]) + '</p></div>').join('');
    return '<details class="mz" open><summary>Perbandingan 4 mazhab</summary>' + body + '<p class="muted small">Ringkasan pendapat masyhur tiap mazhab (draf, perlu ditinjau ustadzah). Periksa kutipan kitab di bawah.</p></details>';
  }

  function kutipBlock(ids) {
    if (!ids || !ids.length) return '';
    const items = ids.map((id) => T.Kitab.get(id)).filter(Boolean).map((x) => {
      const meta = [x.book.author, x.p.h && x.p.h !== 'Pembahasan haid dalam kitab' ? x.p.h : '', T.Kitab.pageLabel(x.p.p)].filter(Boolean).join(' · ');
      return '<details class="kq" id="kq-' + x.id + '"><summary><span class="kq-n">[' + x.id + ']</span>' + mzBadge(x.book.mz) + '<b>' + esc(x.book.title) + '</b><small>' + esc(meta) + '</small><span class="ar ar-peek" dir="rtl" lang="ar">' + esc(x.p.t.slice(0, 110)) + '…</span></summary><p class="ar" dir="rtl" lang="ar">' + esc(x.p.t) + '</p></details>';
    }).join('');
    return '<details class="kutip"><summary>Kutipan kitab (' + ids.length + ')</summary>' + items + '<p class="muted small">Teks asli dari korpus OpenITI (CC BY-NC-SA 4.0). Nomor halaman mengikuti edisi digital sumbernya.</p></details>';
  }

  /** Teks jawaban AI → HTML aman: **tebal**, daftar "- ", dan penanda sumber [n] menjadi tombol. */
  function renderAI(text, allowed) {
    const ok = new Set(allowed || []);
    const inline = (s) => esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (m, list) => list.split(/\s*,\s*/).map((n) => ok.has(+n) ? '<button class="cite" data-act="cite" data-id="' + n + '">' + n + '</button>' : '').join(''));
    const out = [];
    let ul = null;
    for (const raw of String(text).split('\n')) {
      const line = raw.trim();
      if (/^[-•*]\s+/.test(line)) { (ul = ul || []).push('<li>' + inline(line.replace(/^[-•*]\s+/, '')) + '</li>'); continue; }
      if (ul) { out.push('<ul>' + ul.join('') + '</ul>'); ul = null; }
      if (line) out.push('<p>' + inline(line.replace(/^#+\s*/, '')) + '</p>');
    }
    if (ul) out.push('<ul>' + ul.join('') + '</ul>');
    return out.join('');
  }

  function aiBlock(m) {
    if (!AI_ENABLED) return '';
    if (!m.ai) {
      if (!aiOn() && m.cites && m.cites.length) return '<p class="ai-hint">' + icon('learn') + '<span>Ingin jawaban yang disusun dari kutipan kitab-kitab ini? <button class="link" data-act="ai-toggle">Aktifkan Tanya AI</button></span></p>';
      return '';
    }
    if (m.ai.status === 'loading') return '<div class="ai loading"><span class="spin" aria-hidden="true"></span><span>Tanya AI sedang membaca ' + (m.aiIds || []).length + ' kutipan kitab 4 mazhab…</span></div>';
    if (m.ai.status === 'error') return '<div class="ai err"><p>' + esc(m.ai.error) + '</p><button class="btn btn-ghost small" data-act="ai-retry" data-id="' + m.id + '">Coba lagi</button></div>';
    return '<div class="ai"><div class="ai-h">' + icon('learn') + '<b>Jawaban Tanya AI</b><small>disusun dari kutipan kitab · bukan fatwa</small></div><div class="ai-body">' + renderAI(m.ai.text, m.ai.ids) + '</div>' +
      (m.ai.truncated ? '<p class="muted small">Jawaban terpotong karena terlalu panjang.</p>' : '') +
      '<p class="muted small">AI bisa keliru. Cocokkan dengan kutipan bertanda nomor, dan tanyakan kepada ustadzah untuk kasusmu.</p></div>';
  }

  function botHTML(m) {
    let h = '<div class="msg bot" id="m-' + m.id + '">';
    const [top, ...rest] = m.results;
    if (top) {
      h += '<p class="q">' + esc(top.item.q) + '</p><p>' + top.item.a + '</p>' + (top.item.see ? '<a class="more" href="#a/' + top.item.see + '">Baca selengkapnya →</a>' : '') + mzBlock(top.item.mz);
    } else if (!m.kitabReady) {
      h += '<p class="muted">Mencari di kitab-kitab…</p>';
    } else if (m.cites.length) {
      h += '<p>Belum ada jawaban ringkas di pustaka Tamu untuk pertanyaan ini. Berikut kutipan kitab yang relevan.</p>';
    } else {
      h += '<p>Maaf, belum ada jawaban atau kutipan kitab yang cocok. Coba kata kunci lain (misalnya: <i>istihadhah</i>, <i>nifas</i>, <i>qadha</i>, <i>mushaf</i>), atau tanyakan langsung kepada ustadzah tepercaya.</p>';
    }
    h += aiBlock(m) + kutipBlock(m.cites);
    if (rest.length) h += '<div class="rel"><small>Pertanyaan terkait:</small>' + rest.map((r) => '<button class="chip" data-act="ask" data-q="' + esc(r.item.q) + '">' + esc(r.item.q) + '</button>').join('') + '</div>';
    return h + '</div>';
  }

  function viewAsk() {
    const on = aiOn();
    let h = '<div class="page-h"><h1>Tanya fikih haid</h1><p class="muted">Jawaban dari pustaka Tamu, dilengkapi perbandingan 4 mazhab dan kutipan asli dari 14 kitab Hanafi, Maliki, Syafi\'i, dan Hanbali.</p></div>' +
      (AI_ENABLED ? '<div class="ai-toggle"><div><b>' + icon('learn') + 'Tanya AI</b><small>' + (on ? 'Aktif: jawaban juga disusun AI dari kutipan kitab (perlu internet).' : 'Nonaktif: semua jawaban dari pustaka offline, tidak ada yang dikirim.') + '</small></div><button class="switch" role="switch" aria-checked="' + on + '" aria-label="Tanya AI" data-act="ai-toggle"><i></i></button></div>' : '') +
      '<section class="chat" id="chat"><div class="msg bot"><p>Assalamu\'alaikum. Silakan tanya seputar haid, nifas, istihadhah, mandi wajib, shalat, atau qadha puasa. Contohnya: <i>"flek coklat setelah haid"</i>.</p></div>';
    for (const m of state.chat) h += m.who === 'me' ? '<div class="msg me"><p>' + esc(m.text) + '</p></div>' : botHTML(m);
    h += '</section><div class="sugg">' + QA.SUGGEST.map((s) => '<button class="chip" data-act="ask" data-q="' + esc(s) + '">' + esc(s) + '</button>').join('') + '</div>' +
      '<form class="ask-bar" data-act="ask-form"><input id="ask-in" type="text" placeholder="Tulis pertanyaan…" autocomplete="off" maxlength="300" aria-label="Pertanyaan"><button class="btn btn-primary icon-only" aria-label="Kirim">' + icon('send') + '</button></form>' +
      '<p class="muted small center">Bukan fatwa. Untuk kasusmu, konsultasikan dengan ustadzah.' + (on ? ' Jangan menulis nama atau data pribadi dalam pertanyaan.' : '') + '</p>';
    return h;
  }

  function updateMsg(m) {
    const el = document.getElementById('m-' + m.id);
    if (el) el.outerHTML = botHTML(m);
  }

  async function askAI(m) {
    m.ai = { status: 'loading' };
    updateMsg(m);
    try {
      if (!/^https?:/.test(location.protocol)) throw new Error('Tanya AI hanya tersedia saat Tamu dibuka dari situsnya (bukan dari file lokal).');
      const r = await fetch('api/tanya', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', referrerPolicy: 'no-referrer', body: JSON.stringify({ q: m.q, ids: m.aiIds }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Tanya AI gagal (' + r.status + ').');
      m.ai = { status: 'done', text: j.text, ids: j.ids || m.aiIds, model: j.model, truncated: j.truncated };
      // kutipan yang dipakai AI ikut ditampilkan agar bisa dicek
      m.cites = Array.from(new Set(m.cites.concat(m.ai.ids)));
    } catch (e) {
      m.ai = { status: 'error', error: navigator.onLine === false ? 'Sedang offline. Tanya AI butuh internet; jawaban dari pustaka offline tetap tersedia di atas.' : (e.message || String(e)) };
    }
    updateMsg(m);
  }

  async function ask(text) {
    text = (text || '').trim().slice(0, 300);
    if (!text) return;
    const m = { who: 'bot', id: U.uid(), q: text, results: QA.search(text, 4), cites: [], aiIds: [], kitabReady: false };
    state.chat.push({ who: 'me', text }, m);
    if (state.chat.length > 40) state.chat = state.chat.slice(-40);
    render();
    const chat = document.getElementById('chat');
    if (chat && chat.lastElementChild) chat.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const ok = await T.Kitab.load();
    if (ok) {
      m.cites = T.Kitab.search(text, { perMadhhab: 2, max: 9 }).map((x) => x.id);
      m.aiIds = T.Kitab.search(text, { perMadhhab: 3, max: 12 }).map((x) => x.id);
    }
    m.kitabReady = true;
    updateMsg(m);
    if (aiOn() && m.aiIds.length) askAI(m);
  }

  function sheetCite(id) {
    const x = T.Kitab.get(+id);
    if (!x) return;
    openSheet('<h2>' + esc(x.book.title) + '</h2><p class="kitab-ar" dir="rtl" lang="ar">' + esc(x.book.titleAr) + '</p><p class="muted small">' + mzBadge(x.book.mz) + ' ' + esc(x.book.author) + ' (w. ' + x.book.died + ' H)' + (x.p.h ? ' · ' + esc(x.p.h) : '') + (x.p.p ? ' · ' + T.Kitab.pageLabel(x.p.p) : '') + '</p>' +
      '<p class="ar big" dir="rtl" lang="ar">' + esc(x.p.t) + '</p><p class="muted small">Kutipan [' + x.id + '] · sumber teks: OpenITI (' + esc(x.book.src) + ').</p>' +
      '<div class="sheet-actions"><button class="btn btn-primary" data-act="close-sheet">Tutup</button></div>', { noFocus: true });
  }

  function sheetAIConsent() {
    openSheet('<h2>Aktifkan Tanya AI?</h2>' +
      '<ul class="promise"><li>' + icon('info') + '<span>Pertanyaan yang kamu ketik dikirim ke server Tamu, lalu diproses oleh layanan AI <b>Claude (Anthropic)</b> bersama kutipan kitab yang relevan.</span></li>' +
      '<li>' + icon('shield') + '<span><b>Catatan haid, tanggal, dan PIN kamu tidak ikut terkirim.</b> Hanya teks pertanyaan.</span></li>' +
      '<li>' + icon('info') + '<span>Jangan menulis nama atau data pribadi di pertanyaan.</span></li>' +
      '<li>' + icon('info') + '<span>Butuh internet. AI bisa keliru, jadi jawabannya selalu disertai nomor kutipan kitab untuk dicek. Bukan fatwa.</span></li></ul>' +
      '<p class="muted small">Bisa dimatikan kapan saja dari halaman Tanya atau Pengaturan.</p>' +
      '<div class="sheet-actions"><button class="btn btn-ghost" data-act="close-sheet">Batal</button><button class="btn btn-primary" data-act="ai-enable">Aktifkan</button></div>', { noFocus: true });
  }

  /* ---------- Halaman: Pengaturan ---------- */
  function viewSettings() {
    const s = D().settings;
    const opt = (v, cur, label) => '<option value="' + v + '"' + (String(v) === String(cur) ? ' selected' : '') + '>' + label + '</option>';
    return '<div class="page-h"><h1>Pengaturan</h1></div>' + haidDataCard() + installCard() +
      '<section class="card form"><h3 class="card-t">Profil & siklus</h3>' +
      '<label class="lbl" for="s-name">Nama panggilan <small>(opsional)</small></label><input id="s-name" data-change="name" value="' + esc(s.name) + '" maxlength="30" placeholder="mis. Aisyah">' +
      '<div class="two"><div><label class="lbl" for="s-cl">Panjang siklus (hari)</label><input id="s-cl" type="number" min="18" max="60" inputmode="numeric" data-change="cycleLen" value="' + s.cycleLen + '"></div>' +
      '<div><label class="lbl" for="s-pl">Lama haid (hari)</label><input id="s-pl" type="number" min="1" max="15" inputmode="numeric" data-change="periodLen" value="' + s.periodLen + '"></div></div>' +
      '<label class="lbl" for="s-pm">Cara prediksi</label><select id="s-pm" data-change="predMode">' + opt('auto', s.predMode || 'auto', 'Otomatis: belajar dari catatan haid') + opt('manual', s.predMode || 'auto', 'Pakai angka di atas') + '</select>' +
      '<p class="muted small">Prediksi saat ini: ' + esc(Cycle.basisText(Cycle.stats(D()))) + '.</p>' +
      '<label class="lbl">Jadwal shalat</label><p class="src">' + icon('clock') + '<span>' + esc(T.Kemenag.label()) + '<small><a href="#fiqh">Ubah kab/kota atau sumber jadwal di halaman Fikih</a></small></span></p>' +
      '<label class="lbl" for="s-hcal">Kalender Hijriah</label><select id="s-hcal" data-change="hijriCal">' + Object.keys(U.HIJRI_CALS).map((k) => opt(k, s.hijriCal, U.HIJRI_CALS[k])).join('') + '</select>' +
      '<p class="muted small">' + ({
        kemenag: 'Prediksi hisab dengan kriteria MABIMS (tinggi hilal ≥3°, elongasi ≥6,4°). Awal Ramadhan, Syawal, dan Dzulhijjah resmi tetap ditetapkan sidang isbat.',
        muhammadiyah: 'Kalender Hijriah Global Tunggal (sejak 1447 H): tinggi ≥5° dan elongasi ≥8° di mana pun di dunia sebelum 24.00 UTC. Sebelum 1447 H memakai wujudul hilal.',
        ummalqura: 'Kalender resmi Arab Saudi.',
      }[s.hijriCal] || '') + ' Dipakai juga untuk menghitung hutang puasa Ramadhan.</p>' +
      '<label class="lbl" for="s-hadj">Koreksi tanggal Hijriah</label><select id="s-hadj" data-change="hijriAdj">' + [-2, -1, 0, 1, 2].map((n) => opt(n, s.hijriAdj || 0, n === 0 ? 'Tanpa koreksi' : (n > 0 ? '+' : '−') + Math.abs(n) + ' hari')).join('') + '</select>' +
      '<label class="lbl" for="s-theme">Tampilan</label><select id="s-theme" data-change="theme">' + opt('auto', s.theme, 'Ikuti perangkat') + opt('light', s.theme, 'Terang') + opt('dark', s.theme, 'Gelap') + '</select></section>' +

      '<section class="card form"><h3 class="card-t">' + icon('lock') + 'Keamanan</h3>' +
      (Store.hasPin()
        ? '<p class="ok-line">' + icon('shield') + 'PIN aktif. Data terenkripsi AES-256 di perangkat ini.</p><label class="lbl" for="s-al">Kunci otomatis</label><select id="s-al" data-change="autoLock">' + opt(0, s.autoLock, 'Hanya saat aplikasi dibuka ulang') + opt(1, s.autoLock, 'Setelah 1 menit di latar') + opt(5, s.autoLock, 'Setelah 5 menit di latar') + opt(15, s.autoLock, 'Setelah 15 menit di latar') + '</select>' +
          '<div class="row gap wrap"><button class="btn btn-soft" data-act="pin-set">Ganti PIN</button><button class="btn btn-ghost" data-act="pin-remove">Matikan PIN</button><button class="btn btn-ghost" data-act="lock-now">' + icon('lock') + 'Kunci sekarang</button></div>'
        : '<p class="muted">Aktifkan PIN agar orang lain yang memegang HP kamu tidak bisa membuka catatan. Data juga akan dienkripsi.</p><button class="btn btn-primary" data-act="pin-set"' + (Store.hasCrypto() ? '' : ' disabled') + '>' + icon('lock') + 'Aktifkan PIN</button>' + (Store.hasCrypto() ? '' : '<p class="err small">Enkripsi memerlukan HTTPS atau localhost.</p>')) +
      '</section>' +

      (AI_ENABLED ? '<section class="card form"><h3 class="card-t">' + icon('learn') + 'Tanya AI</h3><div class="ai-toggle flat"><div><b>' + (s.ai ? 'Aktif' : 'Nonaktif') + '</b><small>' + (s.ai ? 'Pertanyaan di halaman Tanya dikirim ke server Tamu dan diproses Claude (Anthropic) bersama kutipan kitab. Catatan haid tidak ikut terkirim.' : 'Semua jawaban dari pustaka offline. Tidak ada pertanyaan yang dikirim ke mana pun.') + '</small></div><button class="switch" role="switch" aria-checked="' + !!s.ai + '" aria-label="Tanya AI" data-act="ai-toggle"><i></i></button></div></section>' : '') +

      '<section class="card form"><h3 class="card-t">Datamu</h3><p class="muted">Data hanya ada di perangkat ini. Simpan cadangan untuk berjaga-jaga atau untuk pindah perangkat.</p>' +
      '<div class="row gap wrap"><button class="btn btn-soft" data-act="export">' + icon('down') + 'Ekspor cadangan</button><button class="btn btn-soft" data-act="import">' + icon('up') + 'Impor cadangan</button></div>' +
            '<button class="btn btn-ghost danger" data-act="wipe">' + icon('trash') + 'Hapus semua data</button></section>' +

      '<section class="card about"><div class="about-h"><img src="assets/logo.svg" alt="" width="48" height="48"><div><b>Tamu</b><div class="muted small">Teman siklus muslimah · versi ' + T.VERSION + '</div></div></div>' +
      '<ul class="promise"><li>' + icon('shield') + 'Tanpa server & tanpa akun: catatan haid tidak pernah dikirim ke mana pun</li><li>' + icon('shield') + 'Tanpa iklan, pelacak, atau analitik</li><li>' + icon('shield') + 'Berjalan offline. Internet hanya dipakai untuk mengunduh jadwal shalat Kemenag (bisa dimatikan).</li><li>' + icon('shield') + 'Gratis selamanya</li></ul>' +
      '<p class="muted small">Kutipan kitab 4 mazhab berasal dari korpus OpenITI (github.com/OpenITI), lisensi CC BY-NC-SA 4.0, dan dipakai untuk tujuan non-komersial. Koordinat kab/kota: ArrayAccess/Indonesia-Postal-And-Area (MIT). Tabel awal bulan Hijriah dihitung dengan astronomy-engine (MIT).</p>' +
      '<p class="muted small">Status fikih harian mengikuti mazhab Syafi\'i. Tamu bukan fatwa, bukan alat diagnosis medis, dan bukan alat kontrasepsi. <a href="#a/privasi">Tentang privasi</a></p></section>';
  }

  function sheetPin() {
    openSheet('<h2>' + (Store.hasPin() ? 'Ganti PIN' : 'Aktifkan PIN') + '</h2><p class="muted">PIN 4–8 angka. <b>Tidak bisa dipulihkan bila lupa</b>, karena tidak ada server. Simpan cadangan secara berkala.</p>' +
      (Store.hasPin() ? '<label class="lbl" for="pin-old">PIN lama</label><input id="pin-old" type="password" inputmode="numeric" autocomplete="off" maxlength="8">' : '') +
      '<label class="lbl" for="pin-1">PIN baru</label><input id="pin-1" type="password" inputmode="numeric" autocomplete="new-password" maxlength="8">' +
      '<label class="lbl" for="pin-2">Ulangi PIN baru</label><input id="pin-2" type="password" inputmode="numeric" autocomplete="new-password" maxlength="8"><p class="err" id="pin-err"></p>' +
      '<div class="sheet-actions"><button class="btn btn-ghost" data-act="close-sheet">Batal</button><button class="btn btn-primary" data-act="pin-save">Simpan PIN</button></div>');
  }

  /* ---------- Onboarding ---------- */
  function viewOnboarding() {
    const ob = state.ob, s = D().settings;
    const dots = '<div class="ob-dots">' + [0, 1, 2, 3].map((i) => '<i class="' + (i === ob.step ? 'on' : '') + '"></i>').join('') + '</div>';
    if (ob.step === 0) {
      return '<div class="ob">' + dots + '<img class="ob-logo" src="assets/logo.svg" alt="Logo Tamu" width="112" height="112"><h1>Tamu</h1><p class="ob-tag">Teman siklus muslimah. Mencatat haid, memahami fikihnya, dan menjaga privasimu.</p>' +
        '<ul class="promise big"><li>' + icon('shield') + '<span><b>Data hanya di HP kamu.</b> Tanpa server, tanpa akun, tanpa iklan.</span></li><li>' + icon('book') + '<span><b>Fikih haid lengkap.</b> Status haid/istihadhah, shalat yang perlu diqadha, dan hutang puasa otomatis.</span></li><li>' + icon('moon') + '<span><b>4 fase siklus.</b> Menstruasi, folikular, ovulasi, luteal, beserta tipsnya.</span></li></ul>' +
        '<button class="btn btn-primary btn-big" data-act="ob-next">Mulai</button><button class="btn btn-ghost" data-act="import">Saya punya file cadangan</button></div>';
    }
    if (ob.step === 1) {
      return '<div class="ob form">' + dots + '<h2>Kenalan dulu</h2><label class="lbl" for="ob-name">Nama panggilan <small>(opsional, hanya untuk sapaan)</small></label><input id="ob-name" value="' + esc(s.name) + '" maxlength="30" placeholder="mis. Aisyah">' +
        '<label class="lbl" for="ob-city">Kota terdekat <small>(untuk jadwal shalat; nanti bisa diganti ke kab/kotamu)</small></label><select id="ob-city">' + Prayer.CITIES.map((x) => '<option value="' + x.id + '"' + (x.id === s.city ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select>' +
        '<p class="muted small">Tamu tidak meminta izin lokasi. Kota hanya disimpan di perangkat.</p><div class="ob-actions"><button class="btn btn-ghost" data-act="ob-back">Kembali</button><button class="btn btn-primary" data-act="ob-next">Lanjut</button></div></div>';
    }
    if (ob.step === 2) {
      ob.init = ob.init || initModel();
      state.initCtx = 'ob';
      return '<div class="ob form">' + dots + '<h2>Data awal haid</h2><p class="muted">Isi seingatnya saja; semua bisa diubah nanti di Kalender.</p>' +
        initFormHTML(ob.init, 'ob') +
        '<div class="ob-actions"><button class="btn btn-ghost" data-act="ob-back">Kembali</button><button class="btn btn-ghost" data-act="ob-skip">Lewati</button><button class="btn btn-primary" data-act="ob-next">Lanjut</button></div></div>';
    }
    return '<div class="ob form">' + dots + '<h2>Kunci dengan PIN?</h2><p class="muted">Disarankan. Dengan PIN, seluruh catatan dienkripsi sehingga tidak bisa dibaca orang lain meski HP kamu dipinjam.</p>' +
      (Store.hasCrypto() ? '<label class="lbl" for="ob-pin1">PIN (4–8 angka)</label><input id="ob-pin1" type="password" inputmode="numeric" maxlength="8" autocomplete="new-password"><label class="lbl" for="ob-pin2">Ulangi PIN</label><input id="ob-pin2" type="password" inputmode="numeric" maxlength="8" autocomplete="new-password"><p class="err" id="ob-err"></p>' : '<p class="err">Enkripsi butuh HTTPS atau localhost. Kamu bisa mengaktifkannya nanti.</p>') +
      '<p class="muted small"><b>PIN tidak bisa dipulihkan bila lupa.</b></p><div class="ob-actions"><button class="btn btn-ghost" data-act="ob-back">Kembali</button><button class="btn btn-ghost" data-act="ob-finish" data-pin="0">Nanti saja</button>' + (Store.hasCrypto() ? '<button class="btn btn-primary" data-act="ob-finish" data-pin="1">Aktifkan & selesai</button>' : '') + '</div></div>';
  }
  /* ---------- Data awal haid: dipakai di onboarding dan bisa dibuka ulang ---------- */
  function initModel() {
    const d = D(), s = d.settings;
    const haid = Cycle.sorted(d.periods, 'haid');
    if (haid.length) {
      // Sudah ada catatan: tampilkan haid terakhir + hingga 3 sebelumnya agar tinggal diperbarui
      const last = haid[haid.length - 1];
      const prevP = haid.slice(-4, -1).reverse();
      const ls = new Date(last.start), le = last.end ? new Date(last.end) : null;
      const hm = (dt) => U.pad(dt.getHours()) + ':' + U.pad(dt.getMinutes());
      return {
        s: U.ymd(ls), st: last.approx ? '' : hm(ls), ongo: le ? 'tidak' : 'ya', e: U.ymd(le || new Date()), et: le && !last.approx ? hm(le) : '',
        prev: prevP.map((p) => ({ s: U.ymd(p.start), e: p.end ? U.ymd(p.end) : '', os: p.start, oe: p.end, oa: !!p.approx })),
        cl: s.cycleLen, pl: s.periodLen, mode: 'edit', ids: [last.id].concat(prevP.map((p) => p.id)), lastMandi: !!last.mandi, clTouched: true,
      };
    }
    // Belum ada catatan: mulai KOSONG agar tidak ada tanggal contoh yang ikut tersimpan
    return { s: '', st: '', ongo: 'tidak', e: '', et: '', prev: [], cl: s.cycleLen, pl: s.periodLen, mode: 'tambah', ids: [], clTouched: false };
  }
  function currentInit() { return state.initCtx === 'ob' ? state.ob.init : state.init; }

  /** Ubah isian menjadi daftar haid {start, end, approx} + daftar kesalahan + ringkasan siklus. */
  function initEntries(m) {
    const errors = [], warns = [], list = [], now = new Date();
    const at = (dateStr, timeStr, h) => {
      if (!dateStr) return null;
      const d = U.parseYMD(dateStr);
      const t = /^(\d{1,2}):(\d{2})$/.exec(timeStr || '');
      if (t) d.setHours(+t[1], +t[2]); else d.setHours(h, 0);
      return d;
    };
    const last = { start: at(m.s, m.st, 7), end: m.ongo === 'ya' ? null : at(m.e, m.et, 18), approx: !m.st || (m.ongo !== 'ya' && !m.et), last: true };
    if (!last.start) errors.push('Isi tanggal mulai haid terakhir.');
    else {
      if (m.ongo !== 'ya' && !last.end) errors.push('Isi tanggal selesai haid terakhir, atau pilih "Masih haid".');
      list.push(last);
    }
    m.prev.forEach((p, i) => {
      if (!p.s) return;
      // catatan lama yang tanggalnya tidak diubah: pertahankan jam aslinya
      const keepS = p.os && U.ymd(p.os) === p.s, keepE = p.oe && U.ymd(p.oe) === p.e;
      const start = keepS ? new Date(p.os) : at(p.s, '', 7);
      let end = keepE ? new Date(p.oe) : p.e ? at(p.e, '', 18) : null;
      if (keepS && keepE && !p.oa) { list.push({ start, end, approx: false, n: i + 1 }); return; }
      if (!end) { end = U.addDays(start, Math.max(1, m.pl || 7) - 1); end.setHours(18, 0); warns.push('Tanggal selesai haid sebelumnya ke-' + (i + 1) + ' dikosongkan; diperkirakan ' + (m.pl || 7) + ' hari.'); }
      list.push({ start, end, approx: true, n: i + 1 });
    });
    for (const e of list) {
      const label = e.last ? 'haid terakhir' : 'haid sebelumnya ke-' + e.n;
      if (e.start > now) errors.push('Tanggal mulai ' + label + ' tidak boleh di masa depan.');
      if (e.end && e.end <= e.start) errors.push('Tanggal selesai ' + label + ' harus setelah tanggal mulainya.');
      if (e.end && e.end > new Date(+now + 6e4) && U.ymd(e.end) !== U.ymd(now)) errors.push('Tanggal selesai ' + label + ' tidak boleh di masa depan.');
      if (e.end && e.end - e.start > 20 * U.DAY) warns.push('Lama ' + label + ' lebih dari 20 hari. Periksa lagi tanggalnya.');
    }
    if (last.start) for (const e of list) if (!e.last && e.start >= last.start) errors.push('Haid sebelumnya ke-' + e.n + ' harus lebih awal dari haid terakhir.');
    const sorted = list.filter((e) => e.start).sort((a, b) => a.start - b.start);
    for (let i = 1; i < sorted.length; i++) if (sorted[i - 1].end && sorted[i].start < sorted[i - 1].end) errors.push('Ada riwayat haid yang tanggalnya saling bertumpuk.');
    const cycles = [], durs = [];
    for (let i = 1; i < sorted.length; i++) {
      const c = U.diffDays(sorted[i].start, sorted[i - 1].start);
      if (c >= 15 && c <= 90) cycles.push(c); else warns.push('Jarak antarhaid ' + c + ' hari tidak dipakai untuk menghitung siklus.');
    }
    for (const e of sorted) if (e.end && e.end - e.start >= U.DAY && e.end - e.start <= 15 * U.DAY) durs.push(Math.ceil((e.end - e.start) / U.DAY));
    const avg = (a) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null);
    return { list: sorted, errors: Array.from(new Set(errors)), warns: Array.from(new Set(warns)), cycle: avg(cycles), period: avg(durs), cycles };
  }

  function initCollect(m) {
    if (!document.getElementById('in-form')) return m;
    const v = (id) => { const el = document.getElementById(id); return el ? el.value : undefined; };
    if (v('in-s') !== undefined) m.s = v('in-s');
    if (v('in-st') !== undefined) m.st = v('in-st');
    const og = chipVal('in-ongo'); if (og) m.ongo = og;
    if (v('in-e') !== undefined) m.e = v('in-e');
    if (v('in-et') !== undefined) m.et = v('in-et');
    m.prev = m.prev.map((p, i) => Object.assign({}, p, { s: v('in-ps-' + i) !== undefined ? v('in-ps-' + i) : p.s, e: v('in-pe-' + i) !== undefined ? v('in-pe-' + i) : p.e }));
    const cl = parseInt(v('in-cl'), 10), pl = parseInt(v('in-pl'), 10);
    // tanggal selesai terisi otomatis dari tanggal mulai + lama haid biasanya (hanya bila masih kosong)
    if (m.s && !m.e && m.ongo !== 'ya') {
      const end = U.addDays(U.parseYMD(m.s), Math.max(1, m.pl || 7) - 1);
      m.e = U.ymd(end > new Date() ? new Date() : end);
    }
    if (cl) m.cl = U.clamp(cl, 18, 60);
    if (pl) m.pl = U.clamp(pl, 1, 15);
    const md = chipVal('in-mode'); if (md) m.mode = md;
    // isi otomatis siklus & lama haid dari riwayat, selama pengguna belum mengubahnya sendiri
    const r = initEntries(m);
    if (!m.clTouched) { if (r.cycle) m.cl = r.cycle; if (r.period) m.pl = r.period; }
    return m;
  }

  function initFormHTML(m, ctx) {
    const today = U.ymd(new Date());
    const r = initEntries(m);
    const hasPeriods = D().periods.some((p) => p.kind === 'haid');
    let h = '<div id="in-form" data-ctx="' + ctx + '">' +
      '<label class="lbl" for="in-s">Kapan haid terakhir dimulai?</label><div class="dt"><input type="date" id="in-s" value="' + esc(m.s) + '" max="' + today + '"><input type="time" id="in-st" value="' + esc(m.st) + '" aria-label="Jam mulai (opsional)"></div>' +
      '<p class="muted small">Jam boleh dikosongkan kalau lupa.</p>' +
      '<label class="lbl">Sudah selesai?</label>' + chips('in-ongo', [['tidak', 'Sudah selesai'], ['ya', 'Masih haid sekarang']], m.ongo);
    if (m.ongo !== 'ya') h += '<label class="lbl" for="in-e">Kapan selesai (suci)?</label><div class="dt"><input type="date" id="in-e" value="' + esc(m.e) + '" max="' + today + '"><input type="time" id="in-et" value="' + esc(m.et) + '" aria-label="Jam selesai (opsional)"></div>';
    h += '<div class="in-prev"><b>Haid sebelumnya</b> <small class="muted">(opsional)</small><p class="muted small">Kalau ingat, isi 1–3 haid sebelumnya supaya siklusmu langsung terhitung.</p>' +
      m.prev.map((p, i) => '<div class="prev-row"><span class="prev-n">' + (i + 1) + '</span><div><label class="lbl" for="in-ps-' + i + '">Mulai</label><input type="date" id="in-ps-' + i + '" value="' + esc(p.s) + '" max="' + today + '"></div><div><label class="lbl" for="in-pe-' + i + '">Selesai</label><input type="date" id="in-pe-' + i + '" value="' + esc(p.e) + '" max="' + today + '"></div><button class="icon-btn" data-act="in-del-prev" data-i="' + i + '" aria-label="Hapus baris">' + icon('trash') + '</button></div>').join('') +
      (m.prev.length < 3 ? '<button class="btn btn-ghost small" data-act="in-add-prev">' + icon('plus') + 'Tambah haid sebelumnya</button>' : '') + '</div>';
    h += '<div id="in-sum" class="result ' + (r.cycle ? 'tone-green' : '') + '">' + (r.cycle
      ? '<b>' + icon('check') + 'Dari datamu</b><p>Panjang siklus ±<b>' + r.cycle + ' hari</b>' + (r.cycles.length > 1 && Math.min(...r.cycles) !== Math.max(...r.cycles) ? ' (' + Math.min(...r.cycles) + '–' + Math.max(...r.cycles) + ' hari)' : '') + (r.period ? ', lama haid ±<b>' + r.period + ' hari</b>' : '') + '. Angka di bawah sudah terisi otomatis.</p>'
      : '<p class="muted small">' + (r.period ? 'Lama haid terakhir ±' + r.period + ' hari. ' : '') + 'Isi minimal satu haid sebelumnya agar panjang siklus bisa dihitung. Bila tidak, pakai angka perkiraan di bawah.</p>') + '</div>';
    h += '<div class="two"><div><label class="lbl" for="in-cl">Siklus biasanya (hari)</label><input type="number" id="in-cl" min="18" max="60" inputmode="numeric" value="' + m.cl + '"></div><div><label class="lbl" for="in-pl">Lama haid biasanya (hari)</label><input type="number" id="in-pl" min="1" max="15" inputmode="numeric" value="' + m.pl + '"></div></div>' +
      '<p class="muted small">Belum tahu? Biarkan 28 dan 7, nanti menyesuaikan sendiri.</p>';
    if (ctx === 'sheet' && hasPeriods) {
      h += '<label class="lbl">Simpan sebagai</label>' + chips('in-mode', [['edit', 'Perbarui data ini'], ['ganti', 'Ganti semua riwayat haid']], m.mode === 'tambah' ? 'edit' : m.mode) +
        (m.mode === 'ganti' ? '<p class="err small">Semua catatan haid lama akan dihapus dan diganti isian ini. Catatan nifas, gejala, dan qadha tidak terhapus.</p>'
          : '<p class="muted small">Catatan haid yang tampil di atas akan diperbarui. Catatan yang lebih lama tetap aman. Baris "haid sebelumnya" yang kamu tambahkan akan ikut tersimpan.</p>');
    }
    if (r.warns.length) h += '<ul class="in-warn">' + r.warns.map((w) => '<li>' + esc(w) + '</li>').join('') + '</ul>';
    return h + '<p class="err" id="in-err"></p></div>';
  }

  function refreshInit() {
    const form = document.getElementById('in-form');
    const m = currentInit();
    if (!form || !m) return;
    initCollect(m);
    form.outerHTML = initFormHTML(m, form.dataset.ctx);
  }
  function showInitErrors(errs) { const el = document.getElementById('in-err'); if (el) { el.innerHTML = errs.map(esc).join('<br>'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }

  /** Simpan isian menjadi catatan haid. Mengembalikan {errors} atau {added, skipped}. */
  function initSave(m, ctx) {
    const r = initEntries(m);
    if (r.errors.length) return { errors: r.errors };
    const d = D(), s = d.settings, now = new Date();
    if (ctx === 'sheet' && m.mode === 'ganti') d.periods = d.periods.filter((p) => p.kind !== 'haid');
    else if (m.ids && m.ids.length) d.periods = d.periods.filter((p) => !m.ids.includes(p.id)); // mode perbarui
    let added = 0, skipped = 0;
    for (const e of r.list) {
      if (overlaps(e.start, e.end, null)) { skipped++; continue; }
      const p = { id: U.uid(), kind: 'haid', start: e.start.toISOString(), end: e.end ? e.end.toISOString() : null };
      if (e.approx) p.approx = true;
      if ((e.end && now - e.end > 3 * U.DAY) || (e.last && m.lastMandi && e.end)) p.mandi = true; // haid lama / sudah ditandai mandi
      d.periods.push(p);
      added++;
    }
    s.cycleLen = U.clamp(m.cl || 28, 18, 60);
    s.periodLen = U.clamp(m.pl || 7, 1, 15);
    markSetup('cycle');
    save();
    return { added, skipped };
  }

  /** Kartu ringkas di atas Pengaturan: haid terakhir + tombol isi/ubah tanggal & jam. */
  function haidDataCard() {
    const d = D();
    const last = Cycle.sorted(d.periods, 'haid').pop();
    const info = last
      ? '<p class="hd-last"><span>Haid terakhir</span><b>' + U.fmtDateTime(last.start) + '</b><span>' + (last.end ? 'sampai ' + U.fmtDateTime(last.end) : 'masih berlangsung') + (last.approx ? ' · jam perkiraan' : '') + '</span></p>'
      : '<p class="muted">Belum ada catatan haid. Isi kapan haid terakhir dimulai agar kalender dan prediksi langsung aktif.</p>';
    return '<section class="card form hd-card"><h3 class="card-t">' + icon('drop') + 'Data haid</h3>' + info +
      '<button class="btn btn-primary btn-big" data-act="init-open">' + icon('edit') + (last ? 'Ubah tanggal & jam haid' : 'Isi tanggal & jam haid terakhir') + '</button>' +
      '<button class="btn btn-ghost" data-act="cycle-setup">' + icon('calendar') + 'Atur siklus & cara prediksi</button>' +
      (d.periods.length ? '<button class="btn btn-ghost danger" data-act="haid-reset">' + icon('trash') + 'Reset catatan haid (mulai dari nol)</button>' : '') +
      (last ? '<p class="muted small">Prediksi: ' + esc(Cycle.basisText(Cycle.stats(d))) + '.</p>' : '') + '</section>';
  }

  /* ---------- Reset catatan haid (tanpa menghapus pengaturan) ---------- */
  function sheetReset() {
    const d = D();
    const nHaid = d.periods.filter((p) => p.kind === 'haid').length, nNifas = d.periods.filter((p) => p.kind === 'nifas').length;
    const nLogs = Object.keys(d.logs).length, nQadha = (d.qadha.paid || []).length + (d.qadha.adjust ? 1 : 0);
    const opt = (id, label, count, checked) => count ? '<label class="check"><input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + '><span>' + label + ' <small>(' + count + ')</small></span></label>' : '';
    openSheet('<h2>Reset catatan haid</h2><p>Semua <b>' + nHaid + ' catatan haid</b> akan dihapus agar kamu bisa mengisi ulang dari nol. Setelah itu formulir tanggal & jam haid langsung terbuka.</p>' +
      '<p class="muted small">Yang <b>tidak</b> terhapus: nama, PIN, panjang siklus & lama haid, lokasi jadwal shalat, kalender Hijriah, dan pengaturan lain.</p>' +
      '<div class="checks">' + opt('rs-nifas', 'Hapus juga catatan nifas', nNifas, true) + opt('rs-logs', 'Hapus juga catatan harian (gejala, warna darah, suasana hati)', nLogs, false) + opt('rs-qadha', 'Hapus juga riwayat qadha puasa', nQadha, false) + '</div>' +
      '<p class="muted small">Ingin berjaga-jaga? <button class="link" data-act="export">Unduh cadangan dulu</button>. Setelah reset, tombol <b>Urungkan</b> tersedia beberapa detik.</p>' +
      '<div class="sheet-actions"><button class="btn btn-ghost" data-act="close-sheet">Batal</button><button class="btn btn-primary danger-bg" data-act="haid-reset-ok">' + icon('trash') + 'Reset sekarang</button></div>', { noFocus: true });
  }
  function doReset() {
    const d = D();
    const checked = (id) => { const el = document.getElementById(id); return !!(el && el.checked); };
    const snap = JSON.parse(JSON.stringify({ periods: d.periods, logs: d.logs, qadha: d.qadha }));
    const alsoNifas = checked('rs-nifas'), alsoLogs = checked('rs-logs'), alsoQadha = checked('rs-qadha');
    const before = d.periods.length;
    d.periods = d.periods.filter((p) => p.kind !== 'haid' && !(alsoNifas && p.kind === 'nifas'));
    if (alsoLogs) d.logs = {};
    if (alsoQadha) d.qadha = { adjust: 0, paid: [] };
    const removed = before - d.periods.length;
    save(); closeSheet(); render();
    toast(removed + ' catatan dihapus. Silakan isi ulang dari awal.', {
      action: 'Urungkan',
      onAction: () => { Object.assign(D(), snap); save(); closeSheet(); render(); toast('Reset dibatalkan. Catatan dikembalikan.'); },
    });
    setTimeout(sheetInit, 250);
  }

  function sheetInit() {
    state.init = initModel();
    state.initCtx = 'sheet';
    const editing = state.init.mode === 'edit';
    openSheet('<h2>Tanggal & jam haid</h2><p class="muted">' + (editing ? 'Ubah yang kurang tepat, perkiraannya langsung dihitung ulang.' : 'Isi seingatnya saja, nanti bisa diubah.') + '</p>' + initFormHTML(state.init, 'sheet') +
      '<div class="sheet-actions"><button class="btn btn-ghost" data-act="close-sheet">Batal</button><button class="btn btn-primary" data-act="in-save">' + icon('check') + 'Simpan</button></div>', { noFocus: true });
  }

  function obCollect() {
    const s = D().settings, ob = state.ob;
    if (ob.step === 1) { s.name = val('ob-name').trim().slice(0, 30); s.city = val('ob-city') || s.city; markSetup('lokasi'); }
    if (ob.step === 2 && ob.init) {
      initCollect(ob.init);
      s.cycleLen = U.clamp(ob.init.cl || 28, 18, 60);
      s.periodLen = U.clamp(ob.init.pl || 7, 1, 15);
      markSetup('cycle');
    }
  }
  async function obFinish(withPin) {
    const d = D(), ob = state.ob;
    if (withPin) {
      const a = val('ob-pin1'), b = val('ob-pin2');
      const err = document.getElementById('ob-err');
      if (!/^\d{4,8}$/.test(a)) { err.textContent = 'PIN harus 4–8 angka.'; return; }
      if (a !== b) { err.textContent = 'PIN tidak sama.'; return; }
    }
    if (ob.init && !ob.skipped && !d.periods.length) initSave(ob.init, 'ob');
    d.settings.onboarded = true;
    if (withPin) await Store.setPin(val('ob-pin1'));
    await Store.flush();
    Store.requestPersist();
    location.hash = '#home';
    render();
    toast(withPin ? 'PIN aktif. Datamu terenkripsi.' : 'Selesai! Selamat datang di Tamu.');
    kmgSync(false);
  }

  /* ---------- Kunci ---------- */
  function viewLock() {
    return '<div class="ob lock"><img class="ob-logo" src="assets/logo.svg" alt="" width="88" height="88"><h2>Tamu terkunci</h2><p class="muted">Masukkan PIN untuk membuka catatanmu.</p>' +
      '<form data-act="unlock-form" class="lock-form"><input id="lk-pin" type="password" inputmode="numeric" autocomplete="current-password" maxlength="8" aria-label="PIN" autofocus><button class="btn btn-primary btn-big">' + icon('lock') + 'Buka</button></form><p class="err" id="lk-err"></p>' +
      '<button class="btn btn-ghost small" data-act="forgot">Lupa PIN?</button></div>';
  }

  /** Footer hak cipta: tahun mengikuti jam perangkat, jadi otomatis berganti setiap tahun baru. */
  function appFooter() {
    const year = new Date().getFullYear();
    return '<footer class="app-footer">© ' + year + ' Tamu for Muslimah · Dilindungi undang-undang.</footer>';
  }

  /* ---------- Render & navigasi ---------- */
  const TABS = [['home', 'Beranda', 'home'], ['calendar', 'Kalender', 'calendar'], ['fiqh', 'Fikih', 'book'], ['learn', 'Edukasi', 'learn'], ['ask', 'Tanya', 'chat']];
  function render() {
    const bare = Store.locked || !D().settings.onboarded;
    document.body.classList.toggle('bare', bare);
    let html;
    if (Store.locked) html = viewLock();
    else if (!D().settings.onboarded) html = viewOnboarding();
    else {
      const hash = (location.hash || '#home').slice(1);
      const [view, arg] = hash.split('/');
      state.view = view;
      if (view === 'a') html = viewArticle(arg);
      else html = ({ home: viewHome, calendar: viewCalendar, fiqh: viewFiqh, learn: viewLearn, ask: viewAsk, settings: viewSettings }[view] || viewHome)();
      const activeTab = view === 'a' ? 'learn' : view;
      document.getElementById('tabbar').innerHTML = TABS.map(([id, label, ic]) => '<a href="#' + id + '" class="tab' + (id === activeTab ? ' on' : '') + '"' + (id === activeTab ? ' aria-current="page"' : '') + '>' + icon(ic) + '<span>' + label + '</span></a>').join('');
      document.getElementById('top-settings').classList.toggle('on', view === 'settings');
      document.getElementById('top-settings').classList.toggle('has-dot', setupPending());
    }
    const onWelcome = !Store.locked && !D().settings.onboarded && state.ob.step > 0;
    main().innerHTML = html + (onWelcome ? '' : appFooter());
    if (Store.locked) setTimeout(() => { const i = document.getElementById('lk-pin'); if (i) i.focus(); }, 50);
  }

  function download(name, text) {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  /* ---------- Aksi ---------- */
  const A = {
    'close-sheet': () => closeSheet(),
    'start-period': (el) => sheetStart('haid', el.dataset.date),
    'start-nifas': () => sheetStart('nifas'),
    'end-period': (el) => sheetEnd(el.dataset.date),
    'start-save': () => {
      const at = U.fromLocalInput(val('st-at'));
      const kind = chipVal('kind') || 'haid';
      if (!at) return toast('Isi waktu mulai.');
      if (at > new Date(Date.now() + 6e4)) return toast('Waktu mulai tidak boleh di masa depan.');
      if (ongoing()) return toast('Masih ada darah yang belum ditandai berhenti.');
      if (overlaps(at, null)) return toast('Waktu ini bertumpuk dengan catatan lain. Ubah lewat Riwayat di Kalender.');
      const p = { id: U.uid(), kind, start: at.toISOString(), end: null };
      D().periods.push(p);
      save(); render(); sheetResult(p, 'start');
    },
    'end-save': () => {
      const og = ongoing();
      const at = U.fromLocalInput(val('en-at'));
      if (!og || !at) return;
      if (at <= new Date(og.start)) return toast('Waktu berhenti harus setelah waktu mulai.');
      if (at > new Date(Date.now() + 6e4)) return toast('Waktu berhenti tidak boleh di masa depan.');
      og.end = at.toISOString();
      save(); render(); sheetResult(og, 'end');
    },
    'mandi-done': () => {
      const p = Cycle.sorted(D().periods).pop();
      if (p) { p.mandi = true; save(); render(); toast('Alhamdulillah. Selamat kembali beribadah.'); }
    },
    'edit-period': (el) => sheetEditPeriod(el.dataset.id),
    'period-save': (el) => {
      const p = D().periods.find((x) => x.id === el.dataset.id);
      const s = U.fromLocalInput(val('ed-s')), e = U.fromLocalInput(val('ed-e'));
      if (!p || !s) return toast('Isi waktu mulai.');
      if (e && e <= s) return toast('Waktu berhenti harus setelah waktu mulai.');
      if (!e && D().periods.some((x) => x.id !== p.id && !x.end)) return toast('Hanya satu catatan yang boleh masih berlangsung.');
      if (overlaps(s, e, p.id)) return toast('Bertumpuk dengan catatan lain.');
      p.start = s.toISOString(); p.end = e ? e.toISOString() : null; p.kind = chipVal('kind') || p.kind; delete p.approx;
      save(); closeSheet(); render(); toast('Tersimpan.');
    },
    'period-del': (el) => {
      if (!confirm('Hapus catatan ini?')) return;
      D().periods = D().periods.filter((x) => x.id !== el.dataset.id);
      save(); closeSheet(); render(); toast('Catatan dihapus.');
    },
    log: (el) => sheetLog(el.dataset.date),
    'log-save': (el) => {
      const l = { flow: chipVal('flow'), color: chipVal('color'), symptoms: chipVal('sym') || [], mood: chipVal('mood'), note: val('lg-note').trim().slice(0, 1000) };
      const empty = !l.flow && !l.color && !l.symptoms.length && !l.mood && !l.note;
      if (empty) delete D().logs[el.dataset.date]; else D().logs[el.dataset.date] = l;
      save(); closeSheet(); render(); toast('Catatan tersimpan.');
    },
    'log-del': (el) => { delete D().logs[el.dataset.date]; save(); closeSheet(); render(); },
    'sel-day': (el) => { state.sel = el.dataset.date; render(); },
    month: (el) => { const m = state.month; state.month = new Date(m.getFullYear(), m.getMonth() + parseInt(el.dataset.dir, 10), 1); render(); },
    'qadha-pay': () => { D().qadha.paid.push(U.ymd(new Date())); save(); render(); toast('Qadha tercatat. Semoga diterima.'); },
    'qadha-undo': () => { D().qadha.paid.pop(); save(); render(); },
    'qadha-adjust': () => {
      const q = Fiqh.qadhaSummary(D());
      openSheet('<h2>Koreksi hutang puasa</h2><p class="muted">Hitungan otomatis: <b>' + q.auto + ' hari</b>. Tambahkan hutang dari tahun-tahun sebelum memakai Tamu, atau kurangi bila tanggal Ramadhan berbeda.</p>' +
        '<label class="lbl" for="qa-adj">Koreksi (+/− hari)</label><div class="stepper"><button class="btn btn-soft icon-only" data-act="step" data-t="qa-adj" data-d="-1" aria-label="Kurangi">' + icon('minus') + '</button><input id="qa-adj" type="number" inputmode="numeric" value="' + (D().qadha.adjust || 0) + '"><button class="btn btn-soft icon-only" data-act="step" data-t="qa-adj" data-d="1" aria-label="Tambah">' + icon('plus') + '</button></div>' +
        '<div class="sheet-actions"><button class="btn btn-ghost" data-act="close-sheet">Batal</button><button class="btn btn-primary" data-act="qadha-adj-save">Simpan</button></div>', { noFocus: true });
    },
    step: (el) => { const i = document.getElementById(el.dataset.t); i.value = (parseInt(i.value, 10) || 0) + parseInt(el.dataset.d, 10); },
    'qadha-adj-save': () => { D().qadha.adjust = parseInt(val('qa-adj'), 10) || 0; save(); closeSheet(); render(); },
    simulate: () => sheetSimulate(),
    'simulate-run': () => runSimulate(),
    ask: (el) => ask(el.dataset.q),
    'pin-set': () => sheetPin(),
    'pin-save': async () => {
      const err = document.getElementById('pin-err');
      if (Store.hasPin() && !(await Store.verifyPin(val('pin-old')))) { err.textContent = 'PIN lama salah.'; return; }
      const a = val('pin-1'), b = val('pin-2');
      if (!/^\d{4,8}$/.test(a)) { err.textContent = 'PIN harus 4–8 angka.'; return; }
      if (a !== b) { err.textContent = 'PIN tidak sama.'; return; }
      await Store.setPin(a); closeSheet(); render(); toast('PIN tersimpan. Data terenkripsi.');
    },
    'pin-remove': () => {
      openSheet('<h2>Matikan PIN</h2><p class="muted">Data akan disimpan tanpa enkripsi.</p><label class="lbl" for="pin-old">PIN saat ini</label><input id="pin-old" type="password" inputmode="numeric" maxlength="8"><p class="err" id="pin-err"></p><div class="sheet-actions"><button class="btn btn-ghost" data-act="close-sheet">Batal</button><button class="btn btn-primary" data-act="pin-remove-ok">Matikan</button></div>');
    },
    'pin-remove-ok': async () => {
      if (!(await Store.verifyPin(val('pin-old')))) { document.getElementById('pin-err').textContent = 'PIN salah.'; return; }
      await Store.removePin(); closeSheet(); render(); toast('PIN dimatikan.');
    },
    'lock-now': async () => { await Store.flush(); location.reload(); },
    forgot: () => {
      openSheet('<h2>Lupa PIN</h2><p>Karena Tamu tidak punya server, PIN <b>tidak bisa dipulihkan</b> dan data terenkripsi tidak bisa dibuka tanpanya.</p><p>Kamu bisa menghapus semua data di perangkat ini, lalu memulai lagi atau mengimpor file cadangan.</p><label class="lbl" for="wp">Ketik <b>HAPUS</b> untuk konfirmasi</label><input id="wp" autocomplete="off"><div class="sheet-actions"><button class="btn btn-ghost" data-act="close-sheet">Batal</button><button class="btn btn-primary danger-bg" data-act="wipe-ok">Hapus semua data</button></div>');
    },
    export: () => {
      openSheet('<h2>Ekspor cadangan</h2><p class="muted">File berisi seluruh catatanmu. Beri kata sandi agar aman bila file tersimpan di tempat lain (chat, cloud, flashdisk).</p><label class="lbl" for="ex-pw">Kata sandi file <small>(sangat disarankan)</small></label><input id="ex-pw" type="password" autocomplete="new-password"><div class="sheet-actions"><button class="btn btn-ghost" data-act="close-sheet">Batal</button><button class="btn btn-primary" data-act="export-ok">' + icon('down') + 'Unduh file</button></div>');
    },
    'export-ok': async () => {
      const pw = val('ex-pw');
      if (pw && !Store.hasCrypto()) return toast('Enkripsi butuh HTTPS/localhost.');
      const text = await Store.exportBackup(pw || null);
      download('tamu-cadangan-' + U.ymd(new Date()) + (pw ? '-terenkripsi' : '') + '.json', text);
      closeSheet(); toast('File cadangan diunduh.');
    },
    import: () => {
      openSheet('<h2>Impor cadangan</h2><p class="muted">Data di perangkat ini akan <b>diganti</b> dengan isi file.</p><input type="file" id="im-file" accept=".json,application/json"><label class="lbl" for="im-pw">Kata sandi file <small>(bila ada)</small></label><input id="im-pw" type="password" autocomplete="off"><p class="err" id="im-err"></p><div class="sheet-actions"><button class="btn btn-ghost" data-act="close-sheet">Batal</button><button class="btn btn-primary" data-act="import-ok">' + icon('up') + 'Impor</button></div>', { noFocus: true });
    },
    'import-ok': async () => {
      const f = document.getElementById('im-file').files[0];
      const err = document.getElementById('im-err');
      if (!f) { err.textContent = 'Pilih file cadangan.'; return; }
      try {
        const text = await f.text();
        const hadPin = Store.hasPin();
        const r = await Store.importBackup(text, val('im-pw') || null);
        if (r === 'need-password') { err.textContent = 'File ini terenkripsi. Masukkan kata sandinya.'; return; }
        closeSheet(); applyTheme(); location.hash = '#home'; render();
        toast('Cadangan berhasil diimpor.' + (hadPin ? ' PIN tetap aktif.' : ''));
      } catch (e) { err.textContent = e && e.name === 'OperationError' ? 'Kata sandi salah.' : 'Gagal membaca file: ' + (e.message || e); }
    },
    wipe: () => {
      openSheet('<h2>Hapus semua data</h2><p>Semua catatan haid, gejala, dan qadha di perangkat ini akan dihapus <b>permanen</b>.</p><label class="lbl" for="wp">Ketik <b>HAPUS</b> untuk konfirmasi</label><input id="wp" autocomplete="off"><div class="sheet-actions"><button class="btn btn-ghost" data-act="close-sheet">Batal</button><button class="btn btn-primary danger-bg" data-act="wipe-ok">Hapus permanen</button></div>');
    },
    'wipe-ok': () => {
      if (val('wp').trim().toUpperCase() !== 'HAPUS') return toast('Ketik HAPUS untuk konfirmasi.');
      Store.wipe(); state.ob = { step: 0 }; state.chat = []; closeSheet(); applyTheme(); location.hash = ''; render(); toast('Semua data telah dihapus.');
    },
    'ai-toggle': () => {
      if (!AI_ENABLED) return;
      if (aiOn()) { D().settings.ai = false; save(); render(); toast('Tanya AI dimatikan. Semua jawaban dari pustaka offline.'); }
      else sheetAIConsent();
    },
    'ai-enable': () => { if (!AI_ENABLED) return; D().settings.ai = true; save(); closeSheet(); render(); toast('Tanya AI aktif.'); },
    'ai-retry': (el) => { const m = state.chat.find((x) => x.id === el.dataset.id); if (m) askAI(m); },
    cite: (el) => sheetCite(el.dataset.id),
    'kmg-pick': (el) => {
      const s = D().settings;
      s.kemenag = { id: el.dataset.id, lokasi: el.dataset.lokasi, daerah: '' };
      s.coords = null; // dipilih manual: hitungan cadangan memakai kota, bukan GPS lama
      markSetup('lokasi');
      const fb = T.Kemenag.matchFallback(el.dataset.lokasi);
      if (fb) s.city = fb;
      save(); render(); toast('Mengunduh jadwal Kemenag ' + el.dataset.lokasi + '…');
      kmgSync(true);
    },
    'cycle-setup': () => sheetCycle(),
    'cycle-save': () => {
      const s = D().settings;
      s.cycleLen = U.clamp(parseInt(val('cy-len'), 10) || 28, 18, 60);
      s.periodLen = U.clamp(parseInt(val('cy-per'), 10) || 7, 1, 15);
      s.predMode = chipVal('pred-mode') || 'auto';
      markSetup('cycle');
      save(); closeSheet(); render();
      toast('Tersimpan. Prediksi: ' + Cycle.basisText(Cycle.stats(D())) + '.');
    },
    'hijri-setup': () => sheetHijri(),
    'hijri-save': () => { D().settings.hijriCal = chipVal('hcal') || 'kemenag'; markSetup('hijri'); save(); closeSheet(); render(); toast('Kalender Hijriah: ' + U.HIJRI_CALS[D().settings.hijriCal] + '.'); },
    'go-fiqh': () => { location.hash = '#fiqh'; setTimeout(() => { const b = document.querySelector('.gps-btn') || document.getElementById('kmg-q'); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 150); },
    'setup-dismiss': () => { markSetup('dismissed'); save(); render(); toast('Panduan disembunyikan. Semua pengaturan tetap ada di menu ⚙.'); },
    gps: async (el) => {
      el.disabled = true;
      toast('Mencari lokasi…');
      try {
        const r = await T.Kemenag.useGPS();
        markSetup('lokasi'); save();
        render();
        if (r.near) { toast('Lokasi ditemukan: ' + r.near.lokasi + ' (±' + Math.round(r.near.km) + ' km). Mengunduh jadwal Kemenag…'); kmgSync(true); }
        else toast('Lokasi di luar Indonesia: jadwal dihitung offline untuk lokasi GPS kamu.');
      } catch (e) {
        el.disabled = false;
        toast(e.message || 'Gagal mendapatkan lokasi.');
      }
    },
    'gps-forget': () => { T.Kemenag.forgetGPS(); render(); toast('Lokasi GPS dihapus dari perangkat.'); },
    'kmg-retry': () => { const j = D().jadwal; if (j) j.lastError = null; kmgSync(true); },
    'ob-next': () => {
      obCollect();
      if (state.ob.step === 2 && state.ob.init) {
        const r = initEntries(state.ob.init);
        if (r.errors.length) return showInitErrors(r.errors);
      }
      state.ob.skipped = state.ob.step === 2 ? false : state.ob.skipped;
      state.ob.step = Math.min(3, state.ob.step + 1); render();
    },
    'in-add-prev': () => {
      const m = currentInit(); initCollect(m);
      // usulan tanggal: satu siklus sebelum haid paling awal yang sudah diisi
      const earliest = [m.s].concat(m.prev.map((p) => p.s)).filter(Boolean).sort()[0];
      const s0 = earliest ? U.addDays(U.parseYMD(earliest), -(m.cl || 28)) : U.addDays(new Date(), -40);
      m.prev.push({ s: U.ymd(s0), e: U.ymd(U.addDays(s0, (m.pl || 7) - 1)) });
      const form = document.getElementById('in-form'); form.outerHTML = initFormHTML(m, form.dataset.ctx);
    },
    'in-del-prev': (el) => {
      const m = currentInit(); initCollect(m);
      m.prev.splice(+el.dataset.i, 1);
      const form = document.getElementById('in-form'); form.outerHTML = initFormHTML(m, form.dataset.ctx);
    },
    'init-open': () => sheetInit(),
    install: () => doInstall(),
    'install-later': () => { D().settings.installDismissed = true; save(); render(); toast('Bisa dipasang kapan saja dari Pengaturan → Pasang sebagai aplikasi.'); },
    'haid-reset': () => sheetReset(),
    'haid-reset-ok': () => doReset(),
    'in-save': () => {
      const m = initCollect(state.init);
      const r = initSave(m, 'sheet');
      if (r.errors) return showInitErrors(r.errors);
      closeSheet(); render();
      toast(r.added + ' catatan haid ' + (m.mode === 'edit' ? 'diperbarui' : 'tersimpan') + (r.skipped ? ', ' + r.skipped + ' dilewati karena bertumpuk dengan catatan lama' : '') + '. Prediksi: ' + Cycle.basisText(Cycle.stats(D())) + '.');
    },
    'ob-back': () => { obCollect(); state.ob.step = Math.max(0, state.ob.step - 1); render(); },
    'ob-skip': () => { state.ob.skipped = true; state.ob.step = 3; render(); },
    'ob-finish': (el) => obFinish(el.dataset.pin === '1'),
  };

  async function onUnlock() {
    const pin = val('lk-pin');
    const err = document.getElementById('lk-err');
    try {
      err.textContent = 'Membuka…';
      await Store.unlock(pin);
      applyTheme(); render();
      kmgSync(false);
    } catch (e) {
      err.textContent = 'PIN salah.';
      const i = document.getElementById('lk-pin'); if (i) { i.value = ''; i.focus(); }
    }
  }

  function bind() {
    document.addEventListener('click', (ev) => {
      const chip = ev.target.closest('.chips .chip');
      if (chip) {
        const box = chip.parentElement;
        const on = chip.getAttribute('aria-pressed') === 'true';
        if (!box.dataset.multi) U.$$('.chip', box).forEach((c) => c.setAttribute('aria-pressed', 'false'));
        chip.setAttribute('aria-pressed', on ? 'false' : 'true');
        if (box.closest('#in-form')) refreshInit();
        return;
      }
      const el = ev.target.closest('[data-act]');
      if (!el || el.tagName === 'FORM') return;
      const fn = A[el.dataset.act];
      if (fn) { if (!(el.tagName === 'A' && el.getAttribute('href'))) ev.preventDefault(); fn(el, ev); }
    });
    document.addEventListener('submit', (ev) => {
      const f = ev.target.closest('form[data-act]');
      if (!f) return;
      ev.preventDefault();
      if (f.dataset.act === 'ask-form') { const i = document.getElementById('ask-in'); ask(i.value); }
      if (f.dataset.act === 'unlock-form') onUnlock();
      if (f.dataset.act === 'kmg-form') kmgSearch();
    });
    document.addEventListener('change', (ev) => {
      if (ev.target.closest && ev.target.closest('#in-form')) {
        if (['in-cl', 'in-pl'].includes(ev.target.id)) { const m = currentInit(); if (m) m.clTouched = true; }
        refreshInit();
        return;
      }
      const el = ev.target.closest('[data-change]');
      if (!el) return;
      const s = D().settings, k = el.dataset.change;
      if (k === 'name') s.name = el.value.trim().slice(0, 30);
      if (['cycleLen', 'periodLen', 'predMode'].includes(k)) markSetup('cycle');
      if (k === 'hijriCal' || k === 'hijriAdj') markSetup('hijri');
      if (k === 'city') markSetup('lokasi');
      if (k === 'cycleLen') s.cycleLen = U.clamp(parseInt(el.value, 10) || 28, 18, 60);
      else if (k === 'periodLen') s.periodLen = U.clamp(parseInt(el.value, 10) || 7, 1, 15);
      else if (k === 'autoLock') s.autoLock = parseInt(el.value, 10) || 0;
      else if (k === 'hijriAdj') s.hijriAdj = U.clamp(parseInt(el.value, 10) || 0, -2, 2);
      else if (k === 'city') { s.city = el.value; s.coords = null; }
      else s[k] = el.value;
      save();
      if (k === 'theme') applyTheme();
      if (['city', 'theme', 'jadwalSource', 'hijriCal', 'hijriAdj', 'cycleLen', 'periodLen', 'predMode'].includes(k)) render();
      if (k === 'jadwalSource' && s.jadwalSource === 'kemenag') kmgSync(true);
      toast('Pengaturan tersimpan.');
    });
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') closeSheet(); });
    window.addEventListener('hashchange', () => { closeSheet(); render(); window.scrollTo(0, 0); });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') { state.hiddenAt = Date.now(); Store.flush(); return; }
      const mins = D() && D().settings.autoLock;
      if (Store.hasPin() && mins > 0 && state.hiddenAt && Date.now() - state.hiddenAt >= mins * 6e4) location.reload();
      else if (!Store.locked && D() && D().settings.onboarded) render(); // segarkan status (jam/hari berganti)
    });
    window.addEventListener('pagehide', () => Store.flush());
    window.addEventListener('online', () => kmgSync(false));
  }

  /** Splash logo saat aplikasi dibuka: tampil ±1,2 detik sejak halaman dimuat, lalu memudar. */
  function hideSplash() {
    const sp = document.getElementById('splash');
    if (!sp) return;
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minShow = reduce ? 500 : 1200;
    const wait = Math.max(0, minShow - performance.now());
    setTimeout(() => {
      sp.classList.add('hide');
      setTimeout(() => sp.remove(), 450);
      if (Store.locked) { const i = document.getElementById('lk-pin'); if (i) i.focus(); }
    }, wait);
  }

  function boot() {
    T.VERSION = '1.8.2';
    Store.load();
    applyTheme();
    bind();
    render();
    hideSplash();
    // Browser (Chrome/Edge/Android) menawarkan pemasangan: simpan, lalu tampilkan tombol "Pasang aplikasi" sendiri
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      inst.prompt = e;
      if (!Store.locked && D().settings.onboarded && (state.view === 'home' || state.view === 'settings') && !document.querySelector('.sheet-root.open')) render();
    });
    window.addEventListener('appinstalled', () => { inst.prompt = null; toast('Tamu terpasang. Buka dari ikon di layar utama.'); if (!Store.locked) render(); });
    if (!AI_ENABLED && D() && D().settings.ai) { D().settings.ai = false; save(); }
    kmgSync(false);
    if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* offline cache opsional */ });
    }
  }

  T.App = { render, state };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.Tamu);
