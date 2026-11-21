'use strict';

/* ============================================================
   SOUND — all synthesised in the browser with WebAudio.
   No audio files, so the game stays a single offline folder.
   ============================================================ */

const Sound = {
  ctx: null,
  master: null,
  muted: false,
  ready: false,

  init() {
    if (this.ready) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
    this.ready = true;
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  toggle() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  },

  /* ---- primitives ---- */
  tone(freq, dur, type, gain, slideTo) {
    if (!this.ready || this.muted) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  },

  noise(dur, gain, freq, q, slideTo) {
    if (!this.ready || this.muted) return;
    const t = this.ctx.currentTime;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(freq || 1200, t);
    f.Q.value = q || 1;
    if (slideTo) f.frequency.exponentialRampToValueAtTime(Math.max(60, slideTo), t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t); src.stop(t + dur + 0.02);
  },

  /* ---- game sounds ---- */
  swing() { this.noise(0.13, 0.13, 2200, 1.2, 700); },
  hit() { this.noise(0.09, 0.22, 420, 0.8, 140); this.tone(160, 0.08, 'square', 0.10, 90); },
  crit() { this.noise(0.16, 0.3, 900, 0.7, 180); this.tone(320, 0.12, 'square', 0.14, 120); },
  shoot() { this.tone(700, 0.09, 'square', 0.12, 220); this.noise(0.07, 0.12, 3000, 1.5, 900); },
  boom() { this.noise(0.4, 0.4, 260, 0.6, 60); this.tone(90, 0.35, 'sawtooth', 0.18, 40); },
  blockBreak(tier) {
    const base = tier === 'big' ? 110 : tier === 'galaxy' ? 160 : 200;
    this.noise(0.28, 0.28, 900, 0.7, 220);
    this.tone(base, 0.22, 'triangle', 0.18, base * 0.5);
    if (tier === 'galaxy' || tier === 'big') this.tone(base * 3, 0.5, 'sine', 0.14, base * 5);
  },
  pickup(tier) {
    const f = tier === 'big' ? 880 : tier === 'galaxy' ? 760 : tier === 'gold' ? 640 : 520;
    this.tone(f, 0.1, 'triangle', 0.16, f * 1.5);
    setTimeout(() => this.tone(f * 1.5, 0.12, 'triangle', 0.12, f * 2), 70);
  },
  spawn() { this.tone(300, 0.18, 'sine', 0.14, 900); },
  jump() { this.tone(420, 0.09, 'sine', 0.07, 620); },
  death() { this.tone(300, 0.5, 'sawtooth', 0.16, 70); this.noise(0.4, 0.14, 700, 0.5, 120); },
  voidFall() { this.tone(600, 0.7, 'sine', 0.14, 60); },
  shieldHit() { this.tone(520, 0.14, 'sine', 0.12, 900); },
  bigSpawn() {
    this.tone(120, 1.1, 'sine', 0.22, 300);
    this.tone(180, 1.1, 'triangle', 0.14, 450);
    this.noise(0.9, 0.16, 500, 0.6, 2400);
  },
  heal() { this.tone(520, 0.14, 'sine', 0.1, 780); setTimeout(() => this.tone(780, 0.16, 'sine', 0.08, 980), 90); },
  uiClick() { this.tone(660, 0.06, 'square', 0.08, 880); },
};
