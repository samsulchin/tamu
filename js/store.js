/* Tamu — penyimpanan lokal + enkripsi AES-GCM (Web Crypto).
 * Semua data hanya ada di perangkat ini. Tidak ada server, tidak ada akun, tidak ada analitik.
 * Bila PIN diaktifkan, seluruh data dienkripsi dengan kunci turunan PIN (PBKDF2-SHA256).
 */
window.Tamu = window.Tamu || {};
(function (T) {
  'use strict';
  const KEY = 'tamu.v1';
  const ITER = 250000;
  const te = new TextEncoder();
  const td = new TextDecoder();

  function defaults() {
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      settings: {
        name: '',
        cycleLen: 28,
        periodLen: 7,
        lutealLen: 14,
        city: 'jakarta', // kota cadangan untuk hitung offline
        jadwalSource: 'kemenag', // 'kemenag' (jadwal resmi, diunduh lalu disimpan) | 'hitung' (offline penuh)
        kemenag: null, // {id, lokasi, daerah} kab/kota Bimas Islam Kemenag
        predMode: 'auto', // 'auto' (belajar dari catatan) | 'manual' (pakai cycleLen/periodLen)
        setup: { cycle: false, lokasi: false, hijri: false, dismissed: false }, // panduan awal di Beranda
        hijriCal: 'kemenag', // 'kemenag' | 'muhammadiyah' | 'ummalqura'
        hijriAdj: 0, // koreksi manual tanggal Hijriah (−2…+2 hari)
        coords: null, // {lat, lng} dari GPS (dibulatkan), hanya disimpan di perangkat
        ai: false, // Tanya AI dinonaktifkan (lihat AI_ENABLED di js/app.js)
        theme: 'auto',
        autoLock: 1, // menit; 0 = tidak mengunci otomatis
        onboarded: false,
      },
      periods: [], // {id, kind:'haid'|'nifas', start ISO, end ISO|null, approx?, mandi?}
      logs: {}, // 'YYYY-MM-DD' -> {flow, color, symptoms[], mood, note}
      qadha: { adjust: 0, paid: [] }, // paid: ['YYYY-MM-DD']
    };
  }

  function b64(buf) {
    const bytes = new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }
  function unb64(str) {
    const s = atob(str);
    const out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }

  async function deriveKey(secret, salt, iter) {
    const base = await crypto.subtle.importKey('raw', te.encode(secret), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: iter || ITER, hash: 'SHA-256' },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  async function encryptWith(key, salt, obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(obj)));
    return { tamu: 1, enc: 'AES-GCM', kdf: 'PBKDF2-SHA256', iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
  }
  async function decryptBlob(blob, secret) {
    const salt = unb64(blob.salt);
    const key = await deriveKey(secret, salt, blob.iter);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(blob.iv) }, key, unb64(blob.ct));
    return { data: JSON.parse(td.decode(pt)), key, salt };
  }

  function migrate(d) {
    const base = defaults();
    d = d && typeof d === 'object' ? d : base;
    d.settings = Object.assign({}, base.settings, d.settings || {});
    d.periods = Array.isArray(d.periods) ? d.periods : [];
    d.logs = d.logs && typeof d.logs === 'object' ? d.logs : {};
    d.qadha = Object.assign({ adjust: 0, paid: [] }, d.qadha || {});
    d.version = 1;
    return d;
  }

  const Store = {
    data: null,
    key: null,
    salt: null,
    locked: false,
    _timer: null,

    hasCrypto() { return !!(window.crypto && crypto.subtle); },
    hasPin() { return !!this.key; },

    /** Muat data. Mengembalikan 'new' | 'ok' | 'locked'. */
    load() {
      let raw = null;
      try { raw = localStorage.getItem(KEY); } catch (e) { /* mode privat */ }
      if (!raw) { this.data = defaults(); return 'new'; }
      let parsed;
      try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
      if (parsed && parsed.enc && parsed.ct) { this._blob = parsed; this.locked = true; return 'locked'; }
      this.data = migrate(parsed);
      return 'ok';
    },

    async unlock(pin) {
      const r = await decryptBlob(this._blob, pin); // melempar error bila PIN salah
      this.data = migrate(r.data);
      this.key = r.key;
      this.salt = r.salt;
      this.locked = false;
      this._blob = null;
      return true;
    },

    save() {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => this.flush(), 250);
    },
    async flush() {
      clearTimeout(this._timer);
      if (!this.data || this.locked) return;
      let payload;
      if (this.key) payload = JSON.stringify(await encryptWith(this.key, this.salt, this.data));
      else payload = JSON.stringify(this.data);
      try { localStorage.setItem(KEY, payload); } catch (e) { console.error('Gagal menyimpan', e); T.toast && T.toast('Gagal menyimpan: penyimpanan perangkat penuh atau diblokir.'); }
    },

    async setPin(pin) {
      this.salt = crypto.getRandomValues(new Uint8Array(16));
      this.key = await deriveKey(pin, this.salt);
      await this.flush();
    },
    async verifyPin(pin) {
      try {
        const raw = JSON.parse(localStorage.getItem(KEY));
        await decryptBlob(raw, pin);
        return true;
      } catch (e) { return false; }
    },
    async removePin() {
      this.key = null;
      this.salt = null;
      await this.flush();
    },

    async exportBackup(password) {
      const payload = { app: 'tamu', exportedAt: new Date().toISOString(), data: this.data };
      if (password) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const key = await deriveKey(password, salt);
        return JSON.stringify(Object.assign({ app: 'tamu-backup' }, await encryptWith(key, salt, payload)));
      }
      return JSON.stringify(payload, null, 1);
    },
    /** Mengembalikan 'need-password' bila file terenkripsi dan password belum diberikan. */
    async importBackup(text, password) {
      let obj = JSON.parse(text);
      if (obj.enc && obj.ct) {
        if (!password) return 'need-password';
        obj = (await decryptBlob(obj, password)).data;
      }
      if (!obj || obj.app !== 'tamu' || !obj.data) throw new Error('Bukan file cadangan Tamu.');
      this.data = migrate(obj.data);
      this.data.settings.onboarded = true;
      await this.flush();
      return 'ok';
    },

    wipe() {
      try { localStorage.removeItem(KEY); } catch (e) { /* abaikan */ }
      this.data = defaults();
      this.key = null;
      this.salt = null;
      this.locked = false;
    },

    async requestPersist() {
      try { if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist(); } catch (e) { /* abaikan */ }
      return false;
    },
  };

  T.Store = Store;
  T.defaults = defaults;
})(window.Tamu);
