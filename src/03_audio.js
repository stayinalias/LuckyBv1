'use strict';

/* ============================================================
   SOUND — everything synthesised with WebAudio, no files
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
    this.master.gain.value = 0.45;
    this.master.connect(this.ctx.destination);
    this.ready = true;
  },

  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  toggle() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.45;
    return this.muted;
  },

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

  /* ---- weapons ---- */
  swing() { this.noise(0.13, 0.12, 2200, 1.2, 700); },
  hit() { this.noise(0.09, 0.2, 420, 0.8, 140); this.tone(160, 0.08, 'square', 0.1, 90); },
  crit() { this.noise(0.16, 0.28, 900, 0.7, 180); this.tone(320, 0.12, 'square', 0.13, 120); },
  shoot() { this.tone(700, 0.09, 'square', 0.11, 220); this.noise(0.07, 0.11, 3000, 1.5, 900); },
  gunshot(kind) {
    if (kind === 'sniper') {
      this.noise(0.3, 0.3, 900, 0.6, 120); this.tone(120, 0.25, 'sawtooth', 0.16, 50);
    } else if (kind === 'shotgun') {
      this.noise(0.22, 0.32, 600, 0.5, 90); this.tone(90, 0.18, 'square', 0.14, 45);
    } else if (kind === 'minigun' || kind === 'smg') {
      this.noise(0.06, 0.16, 2400, 1.2, 700); this.tone(220, 0.05, 'square', 0.07, 120);
    } else if (kind === 'launcher') {
      this.noise(0.3, 0.26, 500, 0.7, 160); this.tone(160, 0.22, 'sawtooth', 0.12, 60);
    } else {
      this.noise(0.11, 0.22, 1500, 0.9, 300); this.tone(260, 0.09, 'square', 0.1, 110);
    }
  },
  reload() {
    this.noise(0.05, 0.14, 2600, 2.0, 1200);
    setTimeout(() => this.noise(0.06, 0.16, 1800, 2.0, 900), 180);
    setTimeout(() => this.noise(0.07, 0.18, 1200, 1.6, 600), 420);
  },
  boom() { this.noise(0.4, 0.36, 260, 0.6, 60); this.tone(90, 0.35, 'sawtooth', 0.16, 40); },
  blockBreak(tier) {
    const base = tier === 'big' ? 110 : tier === 'super' ? 90 : tier === 'galaxy' ? 160 : 200;
    this.noise(0.28, 0.26, 900, 0.7, 220);
    this.tone(base, 0.22, 'triangle', 0.17, base * 0.5);
    if (tier === 'galaxy' || tier === 'big') this.tone(base * 3, 0.5, 'sine', 0.13, base * 5);
    if (tier === 'super') { this.tone(base * 4, 0.7, 'square', 0.1, base * 9); this.tone(base * 2, 0.7, 'sine', 0.1, base * 6); }
  },
  pickup(tier) {
    const f = tier === 'super' ? 980 : tier === 'big' ? 880 : tier === 'galaxy' ? 760 : tier === 'gold' ? 640 : 520;
    this.tone(f, 0.1, 'triangle', 0.15, f * 1.5);
    setTimeout(() => this.tone(f * 1.5, 0.12, 'triangle', 0.11, f * 2), 70);
  },
  spawn() { this.tone(300, 0.18, 'sine', 0.13, 900); },
  jump() { this.tone(420, 0.1, 'sine', 0.07, 620); },
  boost() { this.tone(300, 0.18, 'sine', 0.09, 900); this.noise(0.2, 0.08, 900, 1.2, 2400); },
  death() { this.tone(300, 0.5, 'sawtooth', 0.15, 70); this.noise(0.4, 0.13, 700, 0.5, 120); },
  voidFall() { this.tone(600, 0.7, 'sine', 0.13, 60); },
  shieldHit() { this.tone(520, 0.14, 'sine', 0.11, 900); },
  bigSpawn() {
    this.tone(120, 1.1, 'sine', 0.2, 300);
    this.tone(180, 1.1, 'triangle', 0.13, 450);
    this.noise(0.9, 0.15, 500, 0.6, 2400);
  },
  heal() { this.tone(520, 0.14, 'sine', 0.09, 780); setTimeout(() => this.tone(780, 0.16, 'sine', 0.07, 980), 90); },
  uiClick() { this.tone(660, 0.06, 'square', 0.07, 880); },

  /* ---- hero powers ---- */
  laser() {
    /* rising whine, crackling sizzle, low rumble: reads as "eye beam" */
    this.tone(1600, 0.12, 'sawtooth', 0.10, 3200);
    this.tone(2400, 0.5, 'square', 0.05, 900);
    this.noise(0.45, 0.18, 3800, 1.2, 900);
    this.tone(90, 0.4, 'sawtooth', 0.10, 60);
    setTimeout(() => this.noise(0.2, 0.1, 5200, 2.0, 2400), 90);
  },
  laserCharge() {
    this.tone(400, 0.5, 'sine', 0.10, 1800);
    this.noise(0.4, 0.07, 2400, 1.6, 6000);
  },
  punchBoom() {
    this.noise(0.28, 0.4, 220, 0.5, 60);
    this.tone(70, 0.3, 'sawtooth', 0.22, 35);
    this.tone(180, 0.12, 'square', 0.12, 60);
  },
  /* meaty thud layered on top of punchBoom for the shockwave feel */
  impactHeavy() {
    this.noise(0.16, 0.3, 140, 0.7, 45);
    this.tone(52, 0.32, 'sine', 0.24, 30);
    this.noise(0.1, 0.18, 1800, 1.4, 300);
  },
  /* weapon whoosh pitched by weapon weight */
  meleeSwing(model) {
    const heavy = model === 'hammer' || model === 'axe' || model === 'bat' || model === 'pan';
    if (heavy) {
      this.noise(0.2, 0.16, 700, 0.9, 260);
      this.tone(180, 0.14, 'triangle', 0.06, 90);
    } else {
      this.noise(0.11, 0.13, 2600, 1.6, 900);
      this.tone(900, 0.07, 'sine', 0.04, 400);
    }
  },
  /* blade/claw rings when it connects */
  meleeHit(model) {
    const metal = model === 'blade' || model === 'dagger' || model === 'scythe';
    if (metal) {
      this.tone(1400, 0.12, 'triangle', 0.10, 600);
      this.tone(2100, 0.09, 'sine', 0.06, 900);
      this.noise(0.07, 0.12, 3000, 2, 1200);
    } else {
      this.noise(0.1, 0.2, 500, 0.8, 160);
      this.tone(140, 0.1, 'square', 0.09, 80);
    }
  },
  /* landing from a jump or slam */
  land() {
    this.noise(0.14, 0.16, 260, 0.8, 70);
    this.tone(110, 0.1, 'sine', 0.10, 60);
  },
  /* shield strikes / blocks */
  shieldClang() {
    this.tone(880, 0.22, 'triangle', 0.12, 1320);
    this.tone(1320, 0.3, 'sine', 0.07, 1980);
    this.noise(0.08, 0.1, 2600, 2.4, 1400);
  },
  /**/
  yell() {
    this.tone(300, 0.7, 'sawtooth', 0.16, 120);
    this.tone(450, 0.7, 'square', 0.08, 180);
    this.noise(0.7, 0.18, 700, 0.6, 200);
  },
  dash() {
    this.noise(0.24, 0.2, 1400, 1.4, 400);
    this.tone(600, 0.2, 'sine', 0.1, 1400);
  },
  slam() {
    this.noise(0.45, 0.36, 180, 0.5, 50);
    this.tone(60, 0.4, 'sawtooth', 0.2, 28);
  },
  construct() { this.tone(520, 0.4, 'triangle', 0.12, 1040); this.tone(780, 0.4, 'sine', 0.08, 1560); },
  powerUnlock() {
    this.tone(220, 0.9, 'sawtooth', 0.14, 880);
    this.tone(330, 0.9, 'triangle', 0.12, 1320);
    setTimeout(() => this.tone(660, 0.7, 'sine', 0.12, 1760), 220);
    setTimeout(() => this.noise(0.9, 0.16, 1800, 0.7, 3200), 120);
  },
  glitch() {
    this.noise(0.05, 0.12, 4000, 3, 1200);
    this.tone(120, 0.05, 'square', 0.08, 900);
  },
};
