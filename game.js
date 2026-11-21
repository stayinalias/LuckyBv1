(function () {
'use strict';

/* ===== 01_config.js ===== */
'use strict';

/* ============================================================
   LUCKY BLOCKS BATTLEGROUNDS (offline fan-made build)
   Config, tiers, weapons, items, loot tables
   ============================================================ */

const BUILD = { version: '1.0.0', stamp: '2026-11-21 18:05 IST' };

const CONFIG = {
  botCount: 7,                 // bots in the lobby (player makes 8 fighters)
  bigWaveMs: 15 * 60 * 1000,   // big block wave every 15 minutes
  looseBlockMs: 6000,         // extra regular blocks spawn this often
  maxLooseBlocks: 14,
  gravity: -26,
  walkSpeed: 9.2,
  jumpSpeed: 11.6,
  playerHP: 100,
  respawnMs: 3200,
  domeHealPerSec: 22,
  voidY: -18,
  pickupRadius: 2.1,
  blockPunchDmg: 7,
};

/* ---- arena geometry (metres) ---- */
const ARENA_R = 20;       // central platform radius
const BASE_DIST = 34;     // distance of each base from centre
const BASE_R = 4.6;       // base platform radius
const BRIDGE_HALF = 2.6;  // half width of a bridge
const DOME_R = 5.4;       // protective dome radius
const FIGHTER_R = 0.75;   // body radius for collision

/* ---- rarity tiers ---- */
const TIERS = {
  regular: {
    key: 'regular', label: 'REGULAR', name: 'Regular',
    color: 0xf5d43c, emissive: 0xb89400, glow: 0xffe57a,
    chance: 0.62, blocks: 1.0,
  },
  fire: {
    key: 'fire', label: 'EPIC', name: 'Fire',
    color: 0xff5a1f, emissive: 0x8f2400, glow: 0xffa64d,
    chance: 0.23, blocks: 1.0,
  },
  gold: {
    key: 'gold', label: 'LEGENDARY', name: 'Shiny Gold',
    color: 0xffc21e, emissive: 0x9a6b00, glow: 0xfff0a0,
    chance: 0.11, blocks: 1.0,
  },
  galaxy: {
    key: 'galaxy', label: 'MYTHIC', name: 'Galaxy',
    color: 0x8b5cf6, emissive: 0x3b1d8f, glow: 0xc9a6ff,
    chance: 0.04, blocks: 1.0,
  },
  big: {
    key: 'big', label: '???', name: 'BIG BLOCK',
    color: 0x1b2338, emissive: 0x0e5f7a, glow: 0x35e0ff,
    chance: 0, blocks: 1.0,
  },
};
const TIER_ORDER = ['regular', 'fire', 'gold', 'galaxy'];

/* ---- weapons: renamed takes on the classic battlegrounds arsenal ---- */
const FISTS = {
  id: 'fists', name: 'Bare Hands', tier: 'regular', kind: 'melee',
  dmg: 6, range: 2.5, cd: 0.45, kb: 4, icon: 'fist',
};

const WEAPONS = {
  /* regular */
  reliable_blade: { name: 'Old Reliable Blade', tier: 'regular', kind: 'melee', dmg: 12, range: 3.5, cd: 0.55, kb: 6 },
  rusty_shiv:     { name: 'Rusty Shiv',         tier: 'regular', kind: 'melee', dmg: 9,  range: 2.8, cd: 0.34, kb: 3 },
  slugger:        { name: 'Wooden Slugger',     tier: 'regular', kind: 'melee', dmg: 14, range: 3.6, cd: 0.82, kb: 9 },
  frying_pan:     { name: 'Frying Pan',         tier: 'regular', kind: 'melee', dmg: 11, range: 3.1, cd: 0.62, kb: 13 },
  slingshot:      { name: 'Sling Shot',         tier: 'regular', kind: 'ranged', dmg: 9,  range: 40, cd: 0.85, kb: 3, projSpeed: 34 },

  /* fire / epic */
  emberbrand:   { name: 'Emberbrand',    tier: 'fire', kind: 'melee', dmg: 19, range: 3.7, cd: 0.55, kb: 7, effect: 'burn' },
  chainlink:    { name: 'Chainlink Saber', tier: 'fire', kind: 'melee', dmg: 18, range: 3.9, cd: 0.5, kb: 6 },
  frost_shiv:   { name: 'Frost Shiv',    tier: 'fire', kind: 'melee', dmg: 15, range: 3.0, cd: 0.4, kb: 4, effect: 'slow' },
  steel_cleaver:{ name: 'Steel Cleaver', tier: 'fire', kind: 'melee', dmg: 22, range: 3.6, cd: 0.86, kb: 10 },
  boom_tube:    { name: 'Boom Tube',     tier: 'fire', kind: 'ranged', dmg: 26, range: 45, cd: 1.5, kb: 8, projSpeed: 26, splash: 4.2 },

  /* gold / legendary */
  luminar:      { name: 'Luminar',      tier: 'gold', kind: 'melee', dmg: 25, range: 4.0, cd: 0.42, kb: 7 },
  gloomheart:   { name: 'Gloomheart',   tier: 'gold', kind: 'melee', dmg: 24, range: 3.8, cd: 0.6, kb: 8, effect: 'lifesteal', steal: 0.35 },
  toxinfang:    { name: 'Toxinfang',    tier: 'gold', kind: 'melee', dmg: 21, range: 3.6, cd: 0.5, kb: 5, effect: 'poison' },
  gustforce:    { name: 'Gustforce',    tier: 'gold', kind: 'ranged', dmg: 22, range: 55, cd: 0.95, kb: 16, projSpeed: 42 },
  phantomstride:{ name: 'Phantomstride',tier: 'gold', kind: 'melee', dmg: 27, range: 3.4, cd: 0.45, kb: 6, effect: 'backstab' },

  /* galaxy / mythic */
  starcaller:   { name: 'Starcaller',   tier: 'galaxy', kind: 'melee', dmg: 31, range: 4.2, cd: 0.6, kb: 9, aoe: 4.0 },
  voidreaver:   { name: 'Voidreaver',   tier: 'galaxy', kind: 'melee', dmg: 34, range: 4.1, cd: 0.52, kb: 9, effect: 'lifesteal', steal: 0.5 },
  nova_lance:   { name: 'Nova Lance',   tier: 'galaxy', kind: 'ranged', dmg: 30, range: 60, cd: 0.8, kb: 8, projSpeed: 48, pierce: true },
  graviton:     { name: 'Graviton Hammer', tier: 'galaxy', kind: 'melee', dmg: 38, range: 4.4, cd: 1.05, kb: 18, aoe: 5.0 },

  /* big block / ??? */
  genesis:      { name: 'Genesis Blade',     tier: 'big', kind: 'melee', dmg: 46, range: 4.6, cd: 0.45, kb: 12, effect: 'lifesteal', steal: 0.3, aoe: 3.4 },
  singularity:  { name: 'Singularity Cannon', tier: 'big', kind: 'ranged', dmg: 52, range: 70, cd: 1.2, kb: 20, projSpeed: 40, splash: 6.0 },
  timebreak:    { name: 'Timebreak Scythe',  tier: 'big', kind: 'melee', dmg: 40, range: 5.2, cd: 0.55, kb: 10, aoe: 5.6 },
};

/* ---- items ---- */
const ITEMS = {
  med_kit:      { name: 'Med Kit',        tier: 'regular', use: 'heal', amount: 45 },
  med_kit_big:  { name: 'Field Kit',      tier: 'fire',    use: 'heal', amount: 75 },
  sprint_spring:{ name: 'Sprint Spring',  tier: 'regular', use: 'speed', mult: 1.55, dur: 12 },
  moon_spring:  { name: 'Moon Spring',    tier: 'regular', use: 'jump',  mult: 1.5,  dur: 14 },
  bubble_shield:{ name: 'Bubble Shield',  tier: 'fire',    use: 'shield', amount: 70 },
  rage_chip:    { name: 'Rage Chip',      tier: 'gold',    use: 'rage',   mult: 1.6,  dur: 10 },
  godshield:    { name: 'Godshield',      tier: 'gold',    use: 'invuln', dur: 6 },
  ascension:    { name: 'Ascension',      tier: 'galaxy',  use: 'ascend', dur: 14 },
};

/* ---- loot tables: [id, weight] ---- */
const LOOT = {
  regular: [
    ['reliable_blade', 16], ['rusty_shiv', 14], ['slugger', 13], ['frying_pan', 13],
    ['slingshot', 13], ['med_kit', 12], ['sprint_spring', 10], ['moon_spring', 9],
  ],
  fire: [
    ['emberbrand', 17], ['chainlink', 15], ['frost_shiv', 15], ['steel_cleaver', 15],
    ['boom_tube', 14], ['med_kit_big', 12], ['bubble_shield', 12],
  ],
  gold: [
    ['luminar', 15], ['gloomheart', 15], ['toxinfang', 15], ['gustforce', 15],
    ['phantomstride', 15], ['rage_chip', 12], ['godshield', 13],
  ],
  galaxy: [
    ['starcaller', 20], ['voidreaver', 20], ['nova_lance', 20], ['graviton', 20], ['ascension', 20],
  ],
  big: [
    ['genesis', 22], ['singularity', 22], ['timebreak', 22], ['ascension', 17], ['godshield', 17],
  ],
};

/* ---- helpers ---- */
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function chance(p) { return Math.random() < p; }
function weightedPick(pairs) {
  let total = 0;
  for (const p of pairs) total += p[1];
  let r = Math.random() * total;
  for (const p of pairs) { r -= p[1]; if (r <= 0) return p[0]; }
  return pairs[pairs.length - 1][0];
}

function rollTier() {
  let r = Math.random();
  for (const k of TIER_ORDER) {
    r -= TIERS[k].chance;
    if (r <= 0) return k;
  }
  return 'regular';
}

function lootFor(tier) {
  const id = weightedPick(LOOT[tier] || LOOT.regular);
  if (WEAPONS[id]) return { type: 'weapon', id: id, def: WEAPONS[id], tier: tier };
  return { type: 'item', id: id, def: ITEMS[id], tier: tier };
}


/* ===== 02_names.js ===== */
'use strict';

/* ============================================================
   GAMERTAG GENERATOR
   Six flavours of lobby name: normal, tryhard, funny, weird,
   mildly rude (clean), and fake-clan tagged.
   No slurs, no real profanity, no real people or orgs.
   ============================================================ */

const NAME_BANK = {
  first: [
    'Aarav', 'Ishaan', 'Rohan', 'Kabir', 'Ved', 'Neha', 'Ananya', 'Priya', 'Arjun', 'Diya',
    'Carlos', 'Maya', 'Diego', 'Jonas', 'Lena', 'Omar', 'Yuki', 'Ravi', 'Sam', 'Tara',
    'Nikhil', 'Meera', 'Aditya', 'Sana', 'Zoya', 'Karan', 'Ira', 'Dev', 'Farah', 'Leo',
  ],
  handle: [
    'Plays', 'Gaming', 'OP', 'YT', 'Builds', 'Slays', 'Loots', 'Runs', 'Clutch', 'Sweats',
    'Clips', 'Quests', 'Blocks', 'Grinds',
  ],
  tryhard: [
    'Sn1perWolf', 'Dr4g0nSl4y3r', 'ShadowStrike', '0msReaction', 'ClutchGod', 'SweatLord99',
    'QuickScopeKing', 'SilentStriker', 'PixelAssassin', 'DarkNovaX', 'IceVeinTTV', 'BladeStormz',
    'CrimsonFang', 'NightRaidz', 'OmegaRush', 'FrostBytez', 'IronWraith', 'ZeroPingZed',
    'ComboBreaker', 'EdgeLordSupreme',
  ],
  funny: [
    'NoScopeNana', 'CerealKiller', 'ToxicToaster', 'SnackGoblin', 'FeralPotato',
    'AggressiveNugget', 'SoggyWaffle', 'BrokenWASD', 'LaggyOtter', 'MildlyAngryGoose',
    'SirSneezesAlot', 'CaptainCrumbs', 'WobblyKnight', 'ButterFingers99', 'SuspiciousBeans',
    'DefinitelyHuman', 'GarlicBreadGuy', 'PanicPickle', 'ShakySpoon', 'YeetTheOnion',
  ],
  weird: [
    'iamthetable', 'BlobfishEnjoyer', 'LocalCryptid', 'TwoRaccoonsInACoat', 'MoistGravel',
    'SeventhCoffee', 'LamppostFan', 'DrywallSniffer', 'MothEnthusiast', 'QuestionableSoup',
    'GravitySkeptic', 'xX_Toaster_Xx', 'CursedKettle', 'PigeonLawyer', 'SockGremlin',
    'HauntedBiscuit', 'VoidIntern', 'CabbageOracle',
  ],
  rude: [
    'UrMomsLasagna', 'GetGudKid', 'CryAboutIt', 'StayMadBro', 'RatioKing', 'TouchGrassPls',
    'SkillIssueGuy', 'WifiWarrior', 'EZClapAndy', 'CopeHarder', 'MadCuzBad', 'TryAgainNub',
    'CryMeABridge', 'SaltySprinkles', 'RageQuitRon', 'BigMadEnergy',
  ],
  clan: ['VOID', 'NEON', 'TRSH', 'BLOK', 'LUCKY', 'GHOST', 'RIOT', 'CRYPT', 'PIXL', 'HAZE'],
  suffixNum: ['07', '11', '23', '42', '69', '99', '123', '2007', '2011', 'XD', 'Z', 'TV'],
  decor: ['xX', 'Xx', 'oO', 'Oo', 'ii', 'vV'],
};

const NAME_TAUNTS = [
  'ez', 'gg', 'lucky', 'that was lucky', 'block carried me', 'come back', '1v1 me',
  'nice sword lol', 'my dome my rules', 'stop camping', 'who gave him that',
  'bro fell', 'skill issue', 'i was lagging', 'ok ok ok', 'free loot',
];

function makeNormalName() {
  const f = pick(NAME_BANK.first);
  const style = randInt(0, 3);
  if (style === 0) return f + pick(NAME_BANK.handle);
  if (style === 1) return f + '_' + randInt(1, 999);
  if (style === 2) return f.toLowerCase() + '.' + pick(NAME_BANK.first).toLowerCase();
  return f + pick(NAME_BANK.suffixNum);
}

function makeTryhardName() {
  const base = pick(NAME_BANK.tryhard);
  const style = randInt(0, 3);
  if (style === 0) return 'xX_' + base + '_Xx';
  if (style === 1) return base + 'TTV';
  if (style === 2) return 'i' + base;
  return base + randInt(1, 99);
}

function makeFunnyName() {
  const base = pick(NAME_BANK.funny);
  return chance(0.35) ? base + randInt(1, 99) : base;
}

function makeWeirdName() {
  const base = pick(NAME_BANK.weird);
  const style = randInt(0, 2);
  if (style === 0) return pick(NAME_BANK.decor) + base + pick(NAME_BANK.decor);
  if (style === 1) return base.replace(/[aeiou]/gi, (m, i) => (i % 2 ? m.toUpperCase() : m));
  return base + '_' + pick(NAME_BANK.weird).toLowerCase();
}

function makeRudeName() {
  const base = pick(NAME_BANK.rude);
  return chance(0.3) ? base + randInt(1, 99) : base;
}

function makeClanName() {
  return '[' + pick(NAME_BANK.clan) + '] ' + pick([
    makeNormalName(), pick(NAME_BANK.tryhard), pick(NAME_BANK.funny),
  ]);
}

/* weights: mostly normal + funny, a few loudmouths */
function randomGamertag(used) {
  const roll = Math.random();
  let name;
  if (roll < 0.26) name = makeNormalName();
  else if (roll < 0.48) name = makeTryhardName();
  else if (roll < 0.68) name = makeFunnyName();
  else if (roll < 0.80) name = makeWeirdName();
  else if (roll < 0.92) name = makeRudeName();
  else name = makeClanName();

  if (used) {
    let guard = 0;
    while (used.has(name.toLowerCase()) && guard++ < 40) {
      name = name + randInt(1, 9);
    }
    used.add(name.toLowerCase());
  }
  return name;
}

/* skin colours for blocky avatars */
const AVATAR_COLORS = [
  0x4f8cff, 0x54d18c, 0xff7a59, 0xb26bff, 0xffc94d, 0x39d0d8,
  0xff6fa8, 0x8fd14f, 0x9aa7bd, 0xe0663a, 0x6f7bff, 0xd8b04a,
];


/* ===== 03_audio.js ===== */
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


/* ===== 04_world.js ===== */
'use strict';

/* ============================================================
   STATE + WORLD: arena, bases, domes, lucky blocks, particles
   ============================================================ */

const State = {
  scene: null, camera: null, renderer: null,
  fighters: [], blocks: [], pickups: [], projectiles: [], particles: [], floaters: [],
  bases: [], player: null,
  time: 0, bigTimer: CONFIG.bigWaveMs, looseTimer: 4000,
  running: false, started: false,
  bigAlive: false, bigBlock: null,
  killFeed: [], wave: 1,
};

const World = {
  glowTex: null,
  particlePool: [],

  /* ---------- textures drawn on a canvas (no image files) ---------- */
  makeGlowTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  },

  makeGridTexture(base, line) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = line;
    g.lineWidth = 6;
    g.strokeRect(0, 0, 256, 256);
    g.lineWidth = 2;
    g.globalAlpha = 0.45;
    g.beginPath();
    g.moveTo(128, 0); g.lineTo(128, 256);
    g.moveTo(0, 128); g.lineTo(256, 128);
    g.stroke();
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  },

  makeSkyTexture() {
    const c = document.createElement('canvas');
    c.width = 32; c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#05070f');
    grad.addColorStop(0.45, '#111a33');
    grad.addColorStop(0.72, '#26365c');
    grad.addColorStop(1, '#0a0e1a');
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 256);
    return new THREE.CanvasTexture(c);
  },

  /* ---------- scene setup ---------- */
  init(renderer, scene) {
    this.renderer = renderer;
    this.scene = scene;
    this.glowTex = this.makeGlowTexture();

    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.Fog(0x070b14, 70, 190);

    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(300, 24, 16),
      new THREE.MeshBasicMaterial({ map: this.makeSkyTexture(), side: THREE.BackSide, depthWrite: false })
    );
    scene.add(sky);

    scene.add(new THREE.HemisphereLight(0x9db8ff, 0x1a2035, 1.15));
    const sun = new THREE.DirectionalLight(0xfff2d0, 1.55);
    sun.position.set(38, 62, 24);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x4d7bff, 0.7);
    rim.position.set(-30, 20, -40);
    scene.add(rim);

    this.buildArena();
    this.buildBases();
    this.initParticles();
  },

  buildArena() {
    const s = this.scene;

    const topTex = this.makeGridTexture('#2b3450', '#3f4d75');
    topTex.repeat.set(10, 10);
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(ARENA_R, ARENA_R, 1.4, 8),
      new THREE.MeshLambertMaterial({ map: topTex, color: 0xffffff })
    );
    top.position.y = -0.7;
    s.add(top);

    const under = new THREE.Mesh(
      new THREE.CylinderGeometry(ARENA_R * 0.94, ARENA_R * 0.5, 6, 8),
      new THREE.MeshLambertMaterial({ color: 0x1a2136 })
    );
    under.position.y = -4.2;
    s.add(under);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(ARENA_R + 0.05, 0.22, 6, 48),
      new THREE.MeshBasicMaterial({ color: 0x35e0ff })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.02;
    s.add(rim);

    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(6.6, 6.6, 0.12, 8),
      new THREE.MeshBasicMaterial({ color: 0x0d3b52 })
    );
    pad.position.y = 0.02;
    s.add(pad);
    const padRing = new THREE.Mesh(
      new THREE.TorusGeometry(6.6, 0.14, 6, 40),
      new THREE.MeshBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0.8 })
    );
    padRing.rotation.x = Math.PI / 2;
    padRing.position.y = 0.1;
    s.add(padRing);
    this.padRing = padRing;
  },

  buildBases() {
    const s = this.scene;
    const count = CONFIG.botCount + 1;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      const bx = Math.cos(a) * BASE_DIST;
      const bz = Math.sin(a) * BASE_DIST;
      State.bases.push({ index: i, x: bx, z: bz, angle: a });

      const colTex = this.makeGridTexture('#333d5c', '#4a5883');
      colTex.repeat.set(2, 8);
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(BASE_R, BASE_R * 0.86, 34, 8),
        new THREE.MeshLambertMaterial({ map: colTex })
      );
      col.position.set(bx, -17, bz);
      s.add(col);

      const bt = new THREE.Mesh(
        new THREE.CylinderGeometry(BASE_R, BASE_R, 1.2, 8),
        new THREE.MeshLambertMaterial({ color: 0x4a5786 })
      );
      bt.position.set(bx, -0.6, bz);
      s.add(bt);

      const len = BASE_DIST - ARENA_R + 0.6;
      const mid = (ARENA_R + BASE_DIST) / 2;
      const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(BRIDGE_HALF * 2, 0.6, len),
        new THREE.MeshLambertMaterial({ color: 0x3a4463 })
      );
      bridge.position.set(Math.cos(a) * mid, -0.3, Math.sin(a) * mid);
      bridge.rotation.y = -a + Math.PI / 2;
      s.add(bridge);

      for (const side of [-1, 1]) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.7, len),
          new THREE.MeshBasicMaterial({ color: 0x5b6ea8 })
        );
        const off = side * (BRIDGE_HALF - 0.1);
        rail.position.set(
          Math.cos(a) * mid - Math.sin(a) * off, 0.35,
          Math.sin(a) * mid + Math.cos(a) * off
        );
        rail.rotation.y = -a + Math.PI / 2;
        s.add(rail);
      }

      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(DOME_R, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshBasicMaterial({
          color: 0x35e0ff, transparent: true, opacity: 0.1,
          side: THREE.DoubleSide, depthWrite: false,
        })
      );
      dome.position.set(bx, 0, bz);
      s.add(dome);

      const domeWire = new THREE.Mesh(
        new THREE.SphereGeometry(DOME_R, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshBasicMaterial({
          color: 0x8ef0ff, wireframe: true, transparent: true, opacity: 0.16,
        })
      );
      domeWire.position.set(bx, 0, bz);
      s.add(domeWire);

      State.bases[i].dome = dome;
      State.bases[i].domeWire = domeWire;

      const strip = new THREE.Mesh(
        new THREE.TorusGeometry(BASE_R - 0.2, 0.09, 6, 32),
        new THREE.MeshBasicMaterial({ color: 0x8ef0ff })
      );
      strip.rotation.x = Math.PI / 2;
      strip.position.set(bx, 0.12, bz);
      s.add(strip);
    }
  },

  /* ---------- particles ---------- */
  initParticles() {
    const geo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    for (let i = 0; i < 260; i++) {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
      m.visible = false;
      this.scene.add(m);
      this.particlePool.push({ mesh: m, life: 0, vel: new THREE.Vector3(), spin: new THREE.Vector3(), maxLife: 1 });
    }
  },

  burst(pos, color, count, speed, size) {
    let spawned = 0;
    for (const p of this.particlePool) {
      if (spawned >= count) break;
      if (p.life > 0) continue;
      p.life = rand(0.45, 0.95);
      p.maxLife = p.life;
      p.mesh.visible = true;
      p.mesh.position.copy(pos);
      p.mesh.material.color.setHex(color);
      p.mesh.material.opacity = 1;
      const s = (size || 1) * rand(0.6, 1.5);
      p.mesh.scale.setScalar(s);
      p.vel.set(rand(-1, 1), rand(0.2, 1.3), rand(-1, 1)).normalize().multiplyScalar(speed * rand(0.4, 1));
      p.spin.set(rand(-6, 6), rand(-6, 6), rand(-6, 6));
      spawned++;
    }
  },

  updateParticles(dt) {
    for (const p of this.particlePool) {
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { p.mesh.visible = false; continue; }
      p.vel.y += CONFIG.gravity * 0.5 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.x += p.spin.x * dt;
      p.mesh.rotation.y += p.spin.y * dt;
      p.mesh.material.opacity = clamp(p.life / p.maxLife, 0, 1);
    }
  },

  /* ---------- lucky blocks ---------- */
  spawnBlock(tier, x, z, isBig) {
    const t = TIERS[tier];
    const size = isBig ? 5.2 : 2.2;
    const group = new THREE.Group();
    group.position.set(x, isBig ? 3.4 : 1.5, z);

    const core = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshLambertMaterial({
        color: t.color, emissive: t.emissive, emissiveIntensity: 1.0,
        transparent: true, opacity: 0.95,
      })
    );
    group.add(core);

    const wire = new THREE.Mesh(
      new THREE.BoxGeometry(size * 1.04, size * 1.04, size * 1.04),
      new THREE.MeshBasicMaterial({ color: t.glow, wireframe: true, transparent: true, opacity: 0.75 })
    );
    group.add(wire);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowTex, color: t.glow, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.setScalar(size * 3.4);
    group.add(glow);

    const shards = [];
    if (isBig) {
      for (let i = 0; i < 6; i++) {
        const sh = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.5, 0.5),
          new THREE.MeshBasicMaterial({ color: 0x8ef0ff })
        );
        group.add(sh);
        shards.push({ mesh: sh, a: (i / 6) * Math.PI * 2, r: 4.4, y: rand(-1, 1) });
      }
    }

    this.scene.add(group);

    const block = {
      tier, big: !!isBig, mesh: group, core, wire, glow, shards,
      hp: isBig ? 900 : 300, maxHp: isBig ? 900 : 300,
      alive: true, spawnT: 0, bob: rand(0, Math.PI * 2), flash: 0,
      x, z, baseY: isBig ? 3.4 : 1.5, size,
      label: isBig ? '???' : t.label,
    };
    State.blocks.push(block);
    if (isBig) { State.bigAlive = true; State.bigBlock = block; }
    Sound.spawn();
    this.burst(group.position, t.glow, isBig ? 40 : 14, isBig ? 12 : 7, isBig ? 1.6 : 1);
    return block;
  },

  spawnWave() {
    State.wave++;
    this.spawnBlock('big', 0, 0, true);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      this.spawnBlock('regular', Math.cos(a) * 8.6, Math.sin(a) * 8.6, false);
    }
    Sound.bigSpawn();
    UI.feed('A BIG LUCKY BLOCK has spawned in the centre!', '#35e0ff');
    UI.toast('BIG BLOCK WAVE ' + State.wave, '#35e0ff');
  },

  damageBlock(block, amount, by) {
    if (!block.alive) return;
    block.hp -= amount;
    block.flash = 0.18;
    this.burst(block.mesh.position, TIERS[block.tier].glow, 5, 5, 0.8);
    Sound.hit();
    if (block.hp <= 0) this.breakBlock(block, by);
  },

  breakBlock(block, by) {
    block.alive = false;
    const t = TIERS[block.tier];
    Sound.blockBreak(block.tier);
    this.burst(block.mesh.position, t.glow, block.big ? 70 : 26, block.big ? 16 : 9, block.big ? 1.8 : 1.1);
    this.burst(block.mesh.position, 0xffffff, block.big ? 30 : 10, block.big ? 12 : 6, 0.9);

    const drops = block.big ? 3 : 1;
    for (let i = 0; i < drops; i++) {
      const a = rand(0, Math.PI * 2);
      this.spawnPickup(lootFor(block.tier), block.mesh.position.x + Math.cos(a) * 1.4,
        block.mesh.position.z + Math.sin(a) * 1.4);
    }

    this.scene.remove(block.mesh);
    const idx = State.blocks.indexOf(block);
    if (idx >= 0) State.blocks.splice(idx, 1);

    if (block.big) {
      State.bigAlive = false;
      State.bigBlock = null;
      State.bigTimer = CONFIG.bigWaveMs;
      UI.feed((by ? by.name : 'Someone') + ' cracked the BIG LUCKY BLOCK!', '#35e0ff');
    } else {
      UI.feed((by ? by.name : 'Someone') + ' broke a ' + t.name + ' block', '#' + t.glow.toString(16).padStart(6, '0'));
    }
  },

  /* ---------- pickups ---------- */
  spawnPickup(loot, x, z) {
    const t = TIERS[loot.tier];
    const group = new THREE.Group();
    group.position.set(x, 1.6, z);

    let mesh;
    if (loot.type === 'weapon') {
      const isRanged = loot.def.kind === 'ranged';
      mesh = new THREE.Mesh(
        isRanged
          ? new THREE.BoxGeometry(0.22, 0.22, 1.5)
          : new THREE.BoxGeometry(0.16, 1.35, 0.34),
        new THREE.MeshLambertMaterial({ color: t.color, emissive: t.emissive, emissiveIntensity: 0.9 })
      );
      if (!isRanged) mesh.rotation.z = Math.PI * 0.15;
    } else {
      mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.52, 0),
        new THREE.MeshLambertMaterial({ color: t.color, emissive: t.emissive, emissiveIntensity: 0.9 })
      );
    }
    group.add(mesh);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowTex, color: t.glow, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.setScalar(3.2);
    group.add(glow);

    this.scene.add(group);
    State.pickups.push({
      mesh: group, inner: mesh, loot, tier: loot.tier,
      life: 45, bob: rand(0, 6.28),
      x, z,
    });
  },

  updatePickups(dt) {
    for (let i = State.pickups.length - 1; i >= 0; i--) {
      const p = State.pickups[i];
      p.life -= dt;
      p.bob += dt * 2.4;
      p.mesh.position.y = 1.6 + Math.sin(p.bob) * 0.28;
      p.mesh.rotation.y += dt * 1.6;
      p.mesh.children[1].material.opacity = p.life < 6 ? (0.4 + 0.4 * Math.sin(p.life * 12)) : 0.8;

      let taken = false;
      for (const f of State.fighters) {
        if (f.dead) continue;
        const dx = f.pos.x - p.x, dz = f.pos.z - p.z;
        const dy = Math.abs((f.pos.y + 1) - p.mesh.position.y);
        if (dx * dx + dz * dz < CONFIG.pickupRadius * CONFIG.pickupRadius && dy < 2.6) {
          f.give(p.loot);
          taken = true;
          break;
        }
      }

      if (taken || p.life <= 0) {
        if (!taken) this.burst(p.mesh.position, TIERS[p.tier].glow, 8, 4, 0.7);
        this.scene.remove(p.mesh);
        State.pickups.splice(i, 1);
      }
    }
  },

  /* ---------- per-frame ---------- */
  update(dt) {
    State.time += dt;

    if (!State.bigAlive) {
      State.bigTimer -= dt * 1000;
      if (State.bigTimer <= 0) {
        State.bigTimer = CONFIG.bigWaveMs;
        this.spawnWave();
      }
    }

    State.looseTimer -= dt * 1000;
    if (State.looseTimer <= 0) {
      State.looseTimer = CONFIG.looseBlockMs;
      const loose = State.blocks.filter(b => !b.big).length;
      if (loose < CONFIG.maxLooseBlocks) {
        const a = rand(0, Math.PI * 2);
        const r = rand(11, ARENA_R - 3);
        const tier = rollTier();
        this.spawnBlock(tier, Math.cos(a) * r, Math.sin(a) * r, false);
      }
    }

    for (const b of State.blocks) {
      b.spawnT = Math.min(1, b.spawnT + dt * 2.6);
      const pop = b.spawnT < 1 ? (1 + Math.sin(b.spawnT * Math.PI) * 0.35) : 1;
      b.mesh.scale.setScalar(pop * (0.4 + 0.6 * b.spawnT));
      b.bob += dt * (b.big ? 1.1 : 1.7);
      b.mesh.position.y = b.baseY + Math.sin(b.bob) * (b.big ? 0.5 : 0.22);
      b.mesh.rotation.y += dt * (b.big ? 0.45 : 0.9);
      b.mesh.rotation.x = Math.sin(b.bob * 0.6) * 0.06;

      const t = TIERS[b.tier];
      if (b.flash > 0) {
        b.flash -= dt;
        b.core.material.emissiveIntensity = 3.2;
        b.core.material.color.setHex(0xffffff);
      } else {
        b.core.material.emissiveIntensity = 0.85 + Math.sin(State.time * 3 + b.bob) * 0.3;
        b.core.material.color.setHex(t.color);
      }
      b.wire.rotation.y -= dt * 1.8;
      b.wire.rotation.x += dt * 0.9;
      b.glow.material.opacity = 0.65 + Math.sin(State.time * 4 + b.bob) * 0.2;

      for (const s of b.shards) {
        s.a += dt * 1.2;
        s.mesh.position.set(Math.cos(s.a) * s.r, s.y + Math.sin(s.a * 2) * 0.6, Math.sin(s.a) * s.r);
        s.mesh.rotation.x += dt * 2;
        s.mesh.rotation.y += dt * 3;
      }
    }

    if (this.padRing) this.padRing.material.opacity = 0.5 + Math.sin(State.time * 2) * 0.3;

    this.updatePickups(dt);
    this.updateParticles(dt);
  },
};

/* ---------- arena helpers ---------- */
function groundAt(x, z) {
  const r = Math.hypot(x, z);
  if (r <= ARENA_R) return 0;
  for (const b of State.bases) {
    if (Math.hypot(x - b.x, z - b.z) <= BASE_R) return 0;
    const ux = b.x / BASE_DIST, uz = b.z / BASE_DIST;
    const t = x * ux + z * uz;
    const perp = Math.abs(-x * uz + z * ux);
    if (t >= ARENA_R - 1 && t <= BASE_DIST && perp <= BRIDGE_HALF) return 0;
  }
  return null;
}

function domeAt(x, z, y) {
  if (y > DOME_R + 0.5) return null;
  for (const b of State.bases) {
    if (Math.hypot(x - b.x, z - b.z) <= DOME_R - 0.7) return b;
  }
  return null;
}


/* ===== 05_fighter.js ===== */
'use strict';

/* ============================================================
   FIGHTER — one blocky avatar; used for the player and bots
   ============================================================ */

let FIGHTER_ID = 0;

class Fighter {
  constructor(opts) {
    this.id = ++FIGHTER_ID;
    this.name = opts.name;
    this.isPlayer = !!opts.isPlayer;
    this.baseIndex = opts.baseIndex;
    this.color = opts.color;
    this.personality = opts.personality || {
      aggression: rand(0.4, 0.9), caution: rand(0.2, 0.8),
      greed: rand(0.2, 0.9), skill: rand(0.3, 0.95),
    };

    this.maxHp = CONFIG.playerHP;
    this.hp = this.maxHp;
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.facing = new THREE.Vector3(0, 0, 1);
    this.grounded = true;
    this.dead = false;
    this.respawnT = 0;

    this.weapon = FISTS;
    this.atkCd = 0;
    this.pendingHit = -1;
    this.swingT = 0;
    this.hurtFlash = 0;
    this.stunT = 0;

    this.kills = 0;
    this.deaths = 0;
    this.lastDamager = null;
    this.lastDamageTime = -99;

    this.shield = 0;
    this.invulnUntil = 0;
    this.speedUntil = 0;
    this.speedMult = 1;
    this.jumpUntil = 0;
    this.jumpMult = 1;
    this.rageUntil = 0;
    this.rageMult = 1;
    this.dots = [];               // {type, dps, until, src}

    /* bot brain state */
    this.think = 0;
    this.target = null;
    this.state = 'idle';
    this.stateT = 0;
    this.wanderTo = new THREE.Vector3();
    this.strafeDir = chance(0.5) ? 1 : -1;
    this.strafeT = 0;
    this.hesitate = 0;
    this.reactionT = 0;
    this.wantMove = new THREE.Vector3();
    this.wantJump = false;
    this.wantAttack = false;
    this.walkAnim = 0;
    this.slowUntil = 0;

    this.buildMesh();
    this.placeAtBase();
  }

  /* ---------- visuals ---------- */
  buildMesh() {
    const g = new THREE.Group();
    const skin = new THREE.MeshLambertMaterial({ color: 0xf0c090 });
    const cloth = new THREE.MeshLambertMaterial({ color: this.color });
    const dark = new THREE.MeshLambertMaterial({ color: 0x2a3350 });

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.86, 0.86), skin);
    head.position.y = 2.72;
    g.add(head);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111820 });
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.06), eyeMat);
      eye.position.set(0.19 * s, 2.78, 0.44);
      g.add(eye);
    }

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.2, 0.55), cloth);
    torso.position.y = 1.72;
    g.add(torso);

    const armR = new THREE.Group();
    armR.position.set(0.68, 2.2, 0);
    const armRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.05, 0.3), cloth);
    armRMesh.position.y = -0.5;
    armR.add(armRMesh);
    g.add(armR);

    const armL = new THREE.Group();
    armL.position.set(-0.68, 2.2, 0);
    const armLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.05, 0.3), cloth);
    armLMesh.position.y = -0.5;
    armL.add(armLMesh);
    g.add(armL);

    const legL = new THREE.Group();
    legL.position.set(-0.24, 1.12, 0);
    const legLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.12, 0.42), dark);
    legLMesh.position.y = -0.56;
    legL.add(legLMesh);
    g.add(legL);

    const legR = new THREE.Group();
    legR.position.set(0.24, 1.12, 0);
    const legRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.12, 0.42), dark);
    legRMesh.position.y = -0.56;
    legR.add(legRMesh);
    g.add(legR);

    this.weaponMount = new THREE.Group();
    this.weaponMount.position.y = -1.0;
    armR.add(this.weaponMount);

    const bubble = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0x8ef0ff, transparent: true, opacity: 0.22, depthWrite: false })
    );
    bubble.position.y = 1.7;
    bubble.visible = false;
    g.add(bubble);

    const domeRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.07, 6, 24),
      new THREE.MeshBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0.8 })
    );
    domeRing.rotation.x = Math.PI / 2;
    domeRing.position.y = 0.15;
    domeRing.visible = false;
    g.add(domeRing);

    this.mesh = g;
    this.parts = { head, torso, armR, armL, legL, legR, armRMesh, armLMesh };
    this.bubble = bubble;
    this.domeRing = domeRing;
    this.materials = [cloth, dark, skin];
    State.scene.add(g);
    this.setWeapon(FISTS, true);
  }

  setWeapon(def, silent) {
    this.weapon = def;
    while (this.weaponMount.children.length) {
      const c = this.weaponMount.children.pop();
      this.weaponMount.remove(c);
    }
    if (def === FISTS) {
      const fist = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.34, 0.34),
        new THREE.MeshLambertMaterial({ color: 0xf0c090 })
      );
      fist.position.y = -0.12;
      this.weaponMount.add(fist);
      return;
    }
    const t = TIERS[def.tier];
    const mat = new THREE.MeshLambertMaterial({
      color: t.color, emissive: t.emissive, emissiveIntensity: 0.8,
    });
    let m;
    if (def.kind === 'ranged') {
      m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 1.4), mat);
      m.position.set(0, -0.2, 0.55);
    } else {
      m = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.35, 0.28), mat);
      m.position.set(0, -0.55, 0.1);
    }
    this.weaponMount.add(m);
    this.weaponMesh = m;
    if (!silent) Sound.pickup(def.tier);
  }

  /* ---------- position helpers ---------- */
  basePos() {
    const b = State.bases[this.baseIndex];
    return new THREE.Vector3(b.x, 0, b.z);
  }

  placeAtBase() {
    const b = State.bases[this.baseIndex];
    const off = 1.2;
    this.pos.set(b.x + Math.cos(b.angle) * off, 0, b.z + Math.sin(b.angle) * off);
    this.vel.set(0, 0, 0);
    this.mesh.position.copy(this.pos);
    this.facing.set(-Math.cos(b.angle), 0, -Math.sin(b.angle));
  }

  headPos() {
    return new THREE.Vector3(this.pos.x, this.pos.y + 3.35, this.pos.z);
  }

  inDome() { return domeAt(this.pos.x, this.pos.z, this.pos.y); }
  inOwnDome() { return domeAt(this.pos.x, this.pos.z, this.pos.y) === State.bases[this.baseIndex]; }

  /* ---------- loot ---------- */
  give(loot) {
    if (loot.type === 'weapon') {
      this.setWeapon(loot.def);
      if (this.isPlayer) UI.toast(loot.def.name + '  ·  ' + TIERS[loot.tier].label, '#' + TIERS[loot.tier].glow.toString(16).padStart(6, '0'));
    } else {
      this.useItem(loot.def, loot.tier);
    }
  }

  useItem(def, tier) {
    const now = State.time;
    switch (def.use) {
      case 'heal':
        this.hp = Math.min(this.maxHp, this.hp + def.amount);
        Sound.heal();
        this.floatText('+' + def.amount, '#5ef08a');
        break;
      case 'shield':
        this.shield = Math.min(150, this.shield + def.amount);
        Sound.shieldHit();
        this.floatText('SHIELD', '#8ef0ff');
        break;
      case 'speed':
        this.speedUntil = now + def.dur; this.speedMult = def.mult;
        this.floatText('SPEED', '#ffe57a');
        break;
      case 'jump':
        this.jumpUntil = now + def.dur; this.jumpMult = def.mult;
        this.floatText('MOON JUMP', '#c9a6ff');
        break;
      case 'rage':
        this.rageUntil = now + def.dur; this.rageMult = def.mult;
        this.floatText('RAGE', '#ff7a59');
        break;
      case 'invuln':
        this.invulnUntil = now + def.dur;
        this.floatText('GODSHIELD', '#ffd54d');
        break;
      case 'ascend':
        this.hp = this.maxHp;
        this.speedUntil = now + def.dur; this.speedMult = 1.45;
        this.jumpUntil = now + def.dur; this.jumpMult = 1.7;
        this.rageUntil = now + def.dur; this.rageMult = 1.35;
        this.floatText('ASCENDED', '#c9a6ff');
        Sound.pickup('galaxy');
        break;
    }
    if (this.isPlayer) UI.toast(def.name + '  ·  ' + TIERS[tier].label, '#' + TIERS[tier].glow.toString(16).padStart(6, '0'));
  }

  /* ---------- movement ---------- */
  moveInput(dir, dt) {
    const speed = CONFIG.walkSpeed * (State.time < this.speedUntil ? this.speedMult : 1);
    const len = Math.hypot(dir.x, dir.z);
    if (len > 0.01) {
      const nx = dir.x / len, nz = dir.z / len;
      this.vel.x = nx * speed;
      this.vel.z = nz * speed;
      this.facing.set(nx, 0, nz);
      this.walkAnim += dt * 11;
    } else {
      this.vel.x *= 0.78;
      this.vel.z *= 0.78;
      this.walkAnim += dt * 2;
    }
  }

  jump() {
    if (!this.grounded) return;
    const jm = State.time < this.jumpUntil ? this.jumpMult : 1;
    this.vel.y = CONFIG.jumpSpeed * jm;
    this.grounded = false;
    if (this.isPlayer) Sound.jump();
  }

  physics(dt) {
    this.vel.y += CONFIG.gravity * dt;
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.pos.z += this.vel.z * dt;

    const r = Math.hypot(this.pos.x, this.pos.z);
    if (r > BASE_DIST + BASE_R + 4) {
      const s = (BASE_DIST + BASE_R + 4) / r;
      this.pos.x *= s; this.pos.z *= s;
    }

    const g = groundAt(this.pos.x, this.pos.z);
    if (g !== null && this.pos.y <= g && this.vel.y <= 0) {
      this.pos.y = g;
      this.vel.y = 0;
      this.grounded = true;
    } else if (g === null || this.pos.y > g + 0.02) {
      this.grounded = false;
    }

    if (this.pos.y < CONFIG.voidY) this.fellIntoVoid();
  }

  fellIntoVoid() {
    if (this.dead) return;
    Sound.voidFall();
    if (this.isPlayer || chance(0.3)) UI.feed(this.name + ' fell into the void', '#6b7ba8');
    if (this.isPlayer) UI.toast('You fell into the void', '#6b7ba8');
    /* the void costs you health, not your loot — you just get sent home */
    this.hp = Math.max(25, this.hp - 25);
    this.invulnUntil = State.time + 1.2;
    this.stunT = 0.8;
    this.dots.length = 0;
    this.placeAtBase();
    World.burst(this.pos.clone().setY(1), 0x6b7ba8, 20, 9, 1.1);
  }

  /* ---------- combat ---------- */
  attack() {
    if (this.dead || this.atkCd > 0) return;
    const w = this.weapon;
    this.atkCd = w.cd * (this.isPlayer ? 1 : rand(0.95, 1.25));
    this.swingT = 0.22;
    Sound.swing();
    if (w.kind === 'melee') {
      this.pendingHit = 0.09;
    } else {
      this.pendingHit = -1;
      this.fireProjectile();
    }
  }

  fireProjectile() {
    const w = this.weapon;
    const t = TIERS[w.tier];
    const origin = this.headPos().addScaledVector(this.facing, 0.8);
    origin.y -= 0.6;
    const geo = w.splash ? new THREE.SphereGeometry(0.34, 8, 6) : new THREE.BoxGeometry(0.16, 0.16, 1.1);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: t.glow }));
    mesh.position.copy(origin);
    mesh.lookAt(origin.clone().add(this.facing));
    State.scene.add(mesh);
    State.projectiles.push({
      mesh, owner: this, weapon: w,
      vel: this.facing.clone().normalize().multiplyScalar(w.projSpeed),
      life: 2.4, hit: new Set(),
    });
    Sound.shoot();
  }

  outgoingDamage(w) {
    const rage = State.time < this.rageUntil ? this.rageMult : 1;
    return w.dmg * rage;
  }

  resolveMelee() {
    const w = this.weapon;
    const reach = w.range;
    const fwd = this.facing.clone().setY(0).normalize();
    const cosArc = Math.cos(THREE.MathUtils.degToRad(65));
    let hitSomething = false;

    for (const f of State.fighters) {
      if (f === this || f.dead) continue;
      const d = new THREE.Vector3().subVectors(f.pos, this.pos).setY(0);
      const dist = d.length();
      if (dist > reach + FIGHTER_R) continue;
      const dir = d.clone().normalize();
      if (dist > 1.4 && dir.dot(fwd) < cosArc) continue;

      let dmg = this.outgoingDamage(w);
      if (w.effect === 'backstab') {
        const fFacing = f.facing.clone().setY(0).normalize();
        if (fFacing.dot(dir) > 0.35) dmg *= 1.5;
      }
      this.dealDamage(f, dmg, w);
      hitSomething = true;

      if (w.effect === 'lifesteal') this.hp = Math.min(this.maxHp, this.hp + dmg * (w.steal || 0.3));

      if (w.aoe) {
        for (const o of State.fighters) {
          if (o === this || o === f || o.dead) continue;
          if (o.pos.distanceTo(f.pos) <= w.aoe) this.dealDamage(o, dmg * 0.55, w);
        }
        World.burst(f.pos.clone().setY(1.5), TIERS[w.tier].glow, 14, 8, 1.1);
      }
    }

    /* hitting blocks */
    for (const b of State.blocks.slice()) {
      if (!b.alive) continue;
      const dist = Math.hypot(b.mesh.position.x - this.pos.x, b.mesh.position.z - this.pos.z);
      if (dist <= reach + b.size * 0.6) {
        World.damageBlock(b, this.outgoingDamage(w), this);
        hitSomething = true;
      }
    }

    if (!hitSomething) World.burst(this.pos.clone().setY(1.6).addScaledVector(fwd, 1.6), 0x9aa7bd, 3, 3, 0.6);
  }

  dealDamage(target, amount, w) {
    target.takeDamage(amount, this, w);
  }

  takeDamage(amount, from, w) {
    if (this.dead) return;
    const now = State.time;

    if (now < this.invulnUntil) {
      this.floatText('IMMUNE', '#ffd54d');
      Sound.shieldHit();
      return;
    }
    if (this.inOwnDome()) {
      this.floatText('DOME', '#35e0ff');
      Sound.shieldHit();
      return;
    }

    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, amount);
      this.shield -= absorbed;
      amount -= absorbed;
      this.floatText('-' + Math.round(absorbed), '#8ef0ff');
      Sound.shieldHit();
      if (amount <= 0) return;
    }

    this.hp -= amount;
    this.lastDamager = from;
    this.lastDamageTime = now;
    this.hurtFlash = 0.16;

    this.floatText('-' + Math.round(amount), from && from.isPlayer ? '#ffd54d' : '#ff8f8f');
    if (from && from.isPlayer) Sound.crit(); else Sound.hit();
    World.burst(this.pos.clone().setY(1.8), 0xff6b6b, 6, 5, 0.8);

    if (w && w.kb && from) {
      const kd = new THREE.Vector3().subVectors(this.pos, from.pos).setY(0).normalize();
      this.vel.x += kd.x * w.kb;
      this.vel.z += kd.z * w.kb;
      if (w.kb > 10) this.vel.y = Math.max(this.vel.y, 4.5);
    }

    if (w && w.effect === 'burn') this.addDot('burn', 4, 4, from);
    if (w && w.effect === 'poison') this.addDot('poison', 2.5, 6, from);
    if (w && w.effect === 'slow') this.slowUntil = now + 3;

    if (this.hp <= 0) this.die(from);
  }

  addDot(type, dps, dur, src) {
    const existing = this.dots.find(d => d.type === type);
    if (existing) { existing.until = Math.max(existing.until, State.time + dur); existing.dps = Math.max(existing.dps, dps); return; }
    this.dots.push({ type, dps, until: State.time + dur, src, tick: 0 });
  }

  floatText(text, color) {
    if (!this.isPlayer && this.pos.distanceTo(State.player.pos) > 34) return;
    UI.floatText(this.headPos(), text, color);
  }

  die(killer) {
    if (this.dead) return;
    this.dead = true;
    this.deaths++;
    this.hp = 0;
    this.respawnT = CONFIG.respawnMs / 1000;
    this.dots.length = 0;
    this.shield = 0;
    this.setWeapon(FISTS, true);

    if (killer && killer !== this) {
      killer.kills++;
      if (killer.isPlayer) {
        UI.toast('You eliminated ' + this.name, '#ffd54d');
        Sound.pickup('gold');
      }
      UI.feed(killer.name + ' eliminated ' + this.name, '#ff9a6b');
      if (chance(0.35)) UI.chat(killer.name, pick(NAME_TAUNTS));
    } else {
      UI.feed(this.name + ' was eliminated', '#ff9a6b');
    }

    if (this.isPlayer) UI.showDeath(killer ? killer.name : 'the void');

    World.burst(this.pos.clone().setY(1.6), this.color, 26, 10, 1.2);
    World.burst(this.pos.clone().setY(1.6), 0xffffff, 10, 7, 0.9);
    Sound.death();
    this.mesh.visible = false;
  }

  respawn() {
    this.dead = false;
    this.hp = this.maxHp;
    this.shield = 0;
    this.invulnUntil = State.time + 1.5;
    this.dots.length = 0;
    this.mesh.visible = true;
    this.placeAtBase();
    this.mesh.rotation.z = 0;
    World.burst(this.pos.clone().setY(1.6), 0x8ef0ff, 16, 7, 1);
    Sound.spawn();
    if (this.isPlayer) UI.hideDeath();
  }

  /* ---------- per-frame ---------- */
  update(dt) {
    if (this.dead) {
      this.respawnT -= dt;
      if (this.respawnT <= 0) this.respawn();
      return;
    }

    const now = State.time;
    if (this.atkCd > 0) this.atkCd -= dt;

    /* brief stun after being dumped into the void */
    if (this.stunT > 0) {
      this.stunT -= dt;
      this.wantMove.set(0, 0, 0);
      this.wantAttack = false;
      this.wantJump = false;
    }

    for (let i = this.dots.length - 1; i >= 0; i--) {
      const d = this.dots[i];
      d.tick += dt;
      if (d.tick >= 0.5) {
        d.tick = 0;
        this.hp -= d.dps * 0.5;
        this.floatText('-' + Math.round(d.dps * 0.5), d.type === 'burn' ? '#ff7a59' : '#8fd14f');
        if (this.hp <= 0) { this.die(d.src); return; }
      }
      if (now > d.until) this.dots.splice(i, 1);
    }

    if (this.inOwnDome() && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + CONFIG.domeHealPerSec * dt);
    }

    if (this.pendingHit >= 0) {
      this.pendingHit -= dt;
      if (this.pendingHit < 0) this.resolveMelee();
    }

    const speedMult = now < this.slowUntil ? 0.55 : 1;
    this.moveInput(this.wantMove.clone().multiplyScalar(speedMult), dt);
    if (this.wantJump) { this.jump(); this.wantJump = false; }
    if (this.wantAttack) { this.attack(); this.wantAttack = false; }

    this.physics(dt);
    this.mesh.position.copy(this.pos);

    if (this.facing.lengthSq() > 0.01) {
      const yaw = Math.atan2(this.facing.x, this.facing.z);
      this.mesh.rotation.y = yaw;
    }

    const moving = Math.hypot(this.vel.x, this.vel.z) > 1.2;
    this.walkAnim += moving ? dt * 12 : dt * 3;
    const sw = moving ? Math.sin(this.walkAnim) * 0.7 : Math.sin(this.walkAnim * 0.6) * 0.06;
    this.parts.legL.rotation.x = sw;
    this.parts.legR.rotation.x = -sw;
    this.parts.armL.rotation.x = -sw * 0.8;

    if (this.swingT > 0) {
      this.swingT -= dt;
      const p = 1 - Math.max(0, this.swingT) / 0.22;
      this.parts.armR.rotation.x = -Math.sin(p * Math.PI) * 2.1;
      this.parts.armR.rotation.z = -Math.sin(p * Math.PI) * 0.4;
    } else {
      this.parts.armR.rotation.x = sw * 0.8;
      this.parts.armR.rotation.z = 0;
    }

    if (this.hurtFlash > 0) {
      this.hurtFlash -= dt;
      this.materials[0].color.setHex(0xff6b6b);
      this.materials[1].color.setHex(0xff6b6b);
    } else {
      this.materials[0].color.setHex(this.color);
      this.materials[1].color.setHex(0x2a3350);
    }

    this.bubble.visible = this.shield > 0;
    if (this.bubble.visible) this.bubble.material.opacity = 0.12 + 0.1 * Math.sin(now * 6);
    this.domeRing.visible = this.inOwnDome();
    if (this.domeRing.visible) this.domeRing.rotation.z += dt * 2;
  }
}


/* ===== 06_ai.js ===== */
'use strict';

/* ============================================================
   BOT BRAIN
   Not a hive mind: every bot has its own aggression, caution,
   greed and skill, its own reaction delay, and its own bad
   habits (hesitating, whiffing, backing off, jumping for no
   reason). They pick the nearest valid target, so some end up
   duelling each other while others loot blocks.
   ============================================================ */

function nearestTarget(bot) {
  let best = null, bestD = Infinity;
  for (const f of State.fighters) {
    if (f === bot || f.dead) continue;
    /* don't chase someone hiding in their own dome */
    if (f.inOwnDome()) continue;
    const d = f.pos.distanceTo(bot.pos);
    if (d < bestD) { bestD = d; best = f; }
  }
  return { target: best, dist: bestD };
}

function nearestBlock(bot, maxDist) {
  let best = null, bestD = maxDist;
  for (const b of State.blocks) {
    if (!b.alive) continue;
    const d = Math.hypot(b.mesh.position.x - bot.pos.x, b.mesh.position.z - bot.pos.z);
    if (d < bestD) { bestD = d; best = b; }
  }
  return best;
}

function nearestPickup(bot, maxDist) {
  let best = null, bestD = maxDist;
  for (const p of State.pickups) {
    const d = Math.hypot(p.x - bot.pos.x, p.z - bot.pos.z);
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
}

function walkable(x, z) { return groundAt(x, z) !== null; }

/* turn the wanted direction until one step ahead is on solid ground */
function walkableDir(bot, dx, dz) {
  const angles = [0, 0.28, -0.28, 0.6, -0.6, 0.95, -0.95, 1.35, -1.35, 1.8, -1.8, 2.4, -2.4];
  for (const a of angles) {
    const c = Math.cos(a), s = Math.sin(a);
    const nx = dx * c - dz * s;
    const nz = dx * s + dz * c;
    if (walkable(bot.pos.x + nx * 2.0, bot.pos.z + nz * 2.0)) return [nx, nz];
  }
  return null;
}

/*
 * The arena is a star: a centre disc, eight radial bridges, eight base discs.
 * So the only route between a base and the middle is through the middle.
 * steerTo enforces that, then slides around edges instead of walking off them.
 */
function steerTo(bot, tx, tz) {
  let dx = tx - bot.pos.x, dz = tz - bot.pos.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.001) return;
  dx /= d; dz /= d;

  const rBot = Math.hypot(bot.pos.x, bot.pos.z);
  const rTgt = Math.hypot(tx, tz);

  if (rBot > ARENA_R - 2 && rTgt < ARENA_R - 2) {
    /* on a base or bridge, target in the middle: walk in along the bridge */
    dx = -bot.pos.x / (rBot || 1);
    dz = -bot.pos.z / (rBot || 1);
  } else if (rBot < ARENA_R - 2 && rTgt > ARENA_R - 2) {
    /* in the middle, target out on a base: head out on that base's spoke */
    dx = tx / (rTgt || 1);
    dz = tz / (rTgt || 1);
  }

  const safe = walkableDir(bot, dx, dz);
  if (safe) {
    bot.wantMove.set(safe[0], 0, safe[1]);
  } else {
    const r = Math.hypot(bot.pos.x, bot.pos.z) || 1;
    bot.wantMove.set(-bot.pos.x / r, 0, -bot.pos.z / r);
    if (bot.grounded && chance(0.05)) bot.wantJump = true;
  }
}

function setState(bot, s) {
  if (bot.state !== s) {
    bot.state = s;
    bot.stateT = rand(0.6, 1.8);
  }
}

function botThink(bot, dt) {
  if (bot.dead) return;
  bot.think -= dt;
  bot.stateT -= dt;
  bot.wantMove.set(0, 0, 0);

  /* knocked into the void? sit still for a beat when you land back home */
  if (bot.stunT > 0) {
    bot.stunT -= dt;
    return;
  }

  const p = bot.personality;
  const hpFrac = bot.hp / bot.maxHp;
  const now = State.time;

  if (bot.reactionT > 0) bot.reactionT -= dt;

  /* --- decision tick: re-evaluate the plan a few times a second --- */
  if (bot.think <= 0) {
    bot.think = rand(0.22, 0.5) / (0.6 + p.skill * 0.8);

    const nt = nearestTarget(bot);
    bot.nearTarget = nt.target;
    bot.nearDist = nt.dist;

    /* badly hurt? run home and hide in the dome */
    if (hpFrac < 0.22 && !bot.inOwnDome() && chance(0.55 + p.caution * 0.4)) {
      setState(bot, 'flee');
    } else if (bot.inOwnDome() && hpFrac < 0.92) {
      setState(bot, 'heal');
    } else if (bot.weapon === FISTS && !bot.inOwnDome()) {
      /* unarmed: go find a block or a dropped weapon */
      setState(bot, 'loot');
    } else if (nt.target && nt.dist < 22 + p.aggression * 10) {
      /* don't always pick a fight: cautious bots loot first */
      if (chance(0.18 * (1 - p.aggression))) setState(bot, 'loot');
      else setState(bot, 'hunt');
    } else {
      setState(bot, 'loot');
    }

    /* human-ish tics */
    if (chance(0.06)) bot.hesitate = rand(0.2, 0.7);
    if (chance(0.04)) bot.strafeDir *= -1;
    if (chance(0.02)) bot.wantJump = true;
  }

  /* --- act on the current state every frame --- */
  switch (bot.state) {
    case 'flee': {
      const b = State.bases[bot.baseIndex];
      steerTo(bot, b.x, b.z);
      if (bot.inOwnDome()) setState(bot, 'heal');
      if (hpFrac > 0.75) setState(bot, 'hunt');
      break;
    }

    case 'heal': {
      const b = State.bases[bot.baseIndex];
      const a = now * 0.6 + bot.id;
      bot.wantMove.set(Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35);
      if (hpFrac > 0.95 && chance(0.4)) setState(bot, 'hunt');
      if (bot.nearTarget && bot.nearDist < 5 && !bot.nearTarget.inOwnDome()) {
        bot.facing.set(bot.nearTarget.pos.x - bot.pos.x, 0, bot.nearTarget.pos.z - bot.pos.z).normalize();
        if (bot.reactionT <= 0 && bot.atkCd <= 0 && bot.nearDist < bot.weapon.range) bot.wantAttack = true;
      }
      break;
    }

    case 'hunt': {
      const t = bot.nearTarget;
      if (!t || t.dead || t.inOwnDome()) { setState(bot, 'loot'); break; }

      const dx = t.pos.x - bot.pos.x, dz = t.pos.z - bot.pos.z;
      const dist = Math.hypot(dx, dz);
      bot.facing.set(dx, 0, dz).normalize();

      const range = bot.weapon.range;

      if (bot.hesitate > 0) {
        bot.hesitate -= dt;
        /* stop dead and stare for a moment, like a real player */
        break;
      }

      if (dist > range * 0.85) {
        steerTo(bot, t.pos.x, t.pos.z);
        if (Math.abs(t.pos.y - bot.pos.y) > 2.2 && chance(0.08)) bot.wantJump = true;
      } else {
        /* in range: circle-strafe instead of standing still */
        bot.strafeT -= dt;
        if (bot.strafeT <= 0) { bot.strafeT = rand(0.7, 2.0); bot.strafeDir *= chance(0.35) ? -1 : 1; }
        const px = -dz / (dist || 1), pz = dx / (dist || 1);
        const backOff = hpFrac < 0.45 && chance(0.02) ? -0.9 : 0;
        bot.wantMove.set(px * bot.strafeDir * 0.75 + (dx / (dist || 1)) * backOff, 0,
          pz * bot.strafeDir * 0.75 + (dz / (dist || 1)) * backOff);
        /* keep them on the platform */
        const probe = new THREE.Vector3(bot.pos.x + bot.wantMove.x * 1.4, 0, bot.pos.z + bot.wantMove.z * 1.4);
        if (groundAt(probe.x, probe.z) === null) steerTo(bot, t.pos.x, t.pos.z);

        if (bot.reactionT <= 0 && bot.atkCd <= 0) {
          /* whiff sometimes, especially with low skill */
          const whiff = chance((1 - p.skill) * 0.28);
          if (whiff) {
            bot.wantAttack = true;
            bot.atkCd = bot.weapon.cd * rand(0.6, 1.0);
          } else if (dist <= range * 0.95) {
            bot.wantAttack = true;
            bot.reactionT = rand(0.12, 0.5) * (1.4 - p.skill);
          }
        }
      }

      /* give up a losing chase now and then */
      if (dist > 26 && chance(0.02)) setState(bot, 'loot');
      break;
    }

    case 'loot':
    default: {
      const pickup = nearestPickup(bot, 16);
      /* unarmed bots hunt blocks hard; armed bots only grab one in their path */
      const block = nearestBlock(bot, bot.weapon === FISTS ? 40 : 4);

      if (pickup) {
        steerTo(bot, pickup.x, pickup.z);
      } else if (block) {
        const bx = block.mesh.position.x, bz = block.mesh.position.z;
        const d = Math.hypot(bx - bot.pos.x, bz - bot.pos.z);
        steerTo(bot, bx, bz);
        bot.facing.set(bx - bot.pos.x, 0, bz - bot.pos.z).normalize();
        if (d < bot.weapon.range * 0.9 && bot.atkCd <= 0) bot.wantAttack = true;
      } else {
        /* wander the arena, drift toward the centre */
        if (bot.stateT <= 0 || bot.pos.distanceTo(bot.wanderTo) < 2.5) {
          const a = rand(0, Math.PI * 2);
          const r = rand(3, ARENA_R - 3);
          bot.wanderTo.set(Math.cos(a) * r, 0, Math.sin(a) * r);
          bot.stateT = rand(1.5, 3.5);
        }
        steerTo(bot, bot.wanderTo.x, bot.wanderTo.z);
      }

      /* opportunistic swing at whoever wanders into reach */
      if (bot.nearTarget && bot.nearDist < bot.weapon.range * 0.8 && bot.atkCd <= 0 && chance(0.5)) {
        bot.facing.set(bot.nearTarget.pos.x - bot.pos.x, 0, bot.nearTarget.pos.z - bot.pos.z).normalize();
        bot.wantAttack = true;
      }
      break;
    }
  }

  /* never stand in another player's dome if you can help it */
  const d = bot.inDome();
  if (d && d !== State.bases[bot.baseIndex] && bot.state !== 'heal') {
    const cl = Math.hypot(bot.pos.x, bot.pos.z) || 1;
    bot.wantMove.set(-bot.pos.x / cl, 0, -bot.pos.z / cl);
  }
}


/* ===== 07_ui.js ===== */
'use strict';

/* ============================================================
   UI — HUD, nameplates, kill feed, damage numbers, overlays
   ============================================================ */

const UI = {
  el: {},
  plates: new Map(),
  floaters: [],
  feedItems: [],
  toastT: 0,
  boardTick: 0,

  init() {
    const $ = id => document.getElementById(id);
    this.el = {
      hpFill: $('hp-fill'),
      hpText: $('hp-text'),
      shieldFill: $('shield-fill'),
      weaponName: $('weapon-name'),
      weaponTier: $('weapon-tier'),
      playerName: $('player-name'),
      aliveCount: $('alive-count'),
      bigTimer: $('big-timer'),
      waveLabel: $('wave-label'),
      feed: $('feed'),
      chat: $('chat'),
      toast: $('toast'),
      plates: $('plates'),
      floats: $('floats'),
      board: $('board'),
      death: $('death'),
      deathBy: $('death-by'),
      deathTimer: $('death-timer'),
      start: $('start'),
      hud: $('hud'),
      crosshair: $('crosshair'),
      muteState: $('mute-state'),
      build: $('build'),
      killCount: $('kill-count'),
    };
    this.el.build.textContent = 'v' + BUILD.version + ' · ' + BUILD.stamp;

    for (const f of State.fighters) this.makePlate(f);
    this.updateBoard();
  },

  makePlate(f) {
    const d = document.createElement('div');
    d.className = 'plate' + (f.isPlayer ? ' plate-me' : '');
    d.innerHTML = '<div class="pname"></div><div class="pbar"><i></i></div>';
    d.querySelector('.pname').textContent = f.name;
    this.el.plates.appendChild(d);
    this.plates.set(f, { root: d, name: d.querySelector('.pname'), bar: d.querySelector('.pbar i') });
  },

  floatText(worldPos, text, color) {
    if (this.floaters.length > 60) return;
    const d = document.createElement('div');
    d.className = 'float';
    d.textContent = text;
    d.style.color = color || '#fff';
    this.el.floats.appendChild(d);
    this.floaters.push({ el: d, pos: worldPos.clone(), life: 0.9, max: 0.9, drift: rand(-0.4, 0.4) });
  },

  project(v3) {
    const p = v3.clone().project(State.camera);
    return {
      x: (p.x * 0.5 + 0.5) * window.innerWidth,
      y: (-p.y * 0.5 + 0.5) * window.innerHeight,
      visible: p.z < 1 && p.z > -1,
    };
  },

  feed(text, color) {
    const d = document.createElement('div');
    d.className = 'feed-item';
    d.style.borderLeftColor = color && color.length === 7 ? color : '#8ef0ff';
    d.textContent = text;
    this.el.feed.appendChild(d);
    this.feedItems.push({ el: d, life: 6 });
    while (this.feedItems.length > 6) {
      const old = this.feedItems.shift();
      old.el.remove();
    }
  },

  chat(name, text) {
    const d = document.createElement('div');
    d.className = 'chat-item';
    const b = document.createElement('b');
    b.textContent = name + ': ';
    d.appendChild(b);
    d.appendChild(document.createTextNode(text));
    this.el.chat.appendChild(d);
    setTimeout(() => d.classList.add('out'), 4200);
    setTimeout(() => d.remove(), 5200);
    while (this.el.chat.children.length > 4) this.el.chat.firstChild.remove();
  },

  toast(text, color) {
    const t = this.el.toast;
    t.textContent = text;
    t.style.color = color || '#fff';
    t.style.opacity = '1';
    t.style.transform = 'translate(-50%, 0) scale(1)';
    this.toastT = 1.6;
  },

  showDeath(by) {
    this.el.deathBy.textContent = by;
    this.el.death.style.display = 'flex';
  },
  hideDeath() { this.el.death.style.display = 'none'; },

  update(dt) {
    const p = State.player;

    const hpPct = clamp(p.hp / p.maxHp, 0, 1) * 100;
    this.el.hpFill.style.width = hpPct + '%';
    this.el.hpFill.style.background = hpPct > 55 ? 'linear-gradient(90deg,#3ddc84,#8ef07a)'
      : hpPct > 25 ? 'linear-gradient(90deg,#ffb648,#ffe07a)' : 'linear-gradient(90deg,#ff4d4d,#ff8f6b)';
    this.el.hpText.textContent = Math.max(0, Math.ceil(p.hp)) + ' / ' + p.maxHp;
    this.el.shieldFill.style.width = clamp(p.shield / 150, 0, 1) * 100 + '%';

    const w = p.weapon;
    this.el.weaponName.textContent = w.name;
    const t = TIERS[w.tier];
    this.el.weaponTier.textContent = t.label;
    this.el.weaponTier.style.color = '#' + t.glow.toString(16).padStart(6, '0');
    this.el.weaponTier.style.borderColor = '#' + t.glow.toString(16).padStart(6, '0');
    this.el.playerName.textContent = p.name;
    this.el.killCount.textContent = p.kills;

    const alive = State.fighters.filter(f => !f.dead).length;
    this.el.aliveCount.textContent = alive;
    this.el.waveLabel.textContent = 'WAVE ' + State.wave;

    const secs = Math.max(0, Math.ceil(State.bigTimer / 1000));
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    this.el.bigTimer.textContent = State.bigAlive ? 'LIVE' : mm + ':' + ss;
    this.el.bigTimer.style.color = State.bigAlive ? '#35e0ff' : '#8ea0c8';

    if (p.dead) {
      this.el.deathTimer.textContent = Math.ceil(Math.max(0, p.respawnT)) + 's';
    }

    if (this.toastT > 0) {
      this.toastT -= dt;
      const a = clamp(this.toastT / 0.5, 0, 1);
      this.el.toast.style.opacity = String(a);
      this.el.toast.style.transform = 'translate(-50%, ' + (1 - a) * -12 + 'px) scale(' + (0.96 + a * 0.04) + ')';
    }

    /* nameplates */
    for (const f of State.fighters) {
      const plate = this.plates.get(f);
      if (!plate) continue;
      if (f.dead) { plate.root.style.display = 'none'; continue; }
      const head = f.headPos();
      const dist = head.distanceTo(State.camera.position);
      const proj = this.project(head);
      if (!proj.visible || dist > 70) { plate.root.style.display = 'none'; continue; }
      plate.root.style.display = 'block';
      plate.root.style.transform = 'translate(-50%,-100%) translate(' + proj.x + 'px,' + proj.y + 'px)';
      plate.root.style.opacity = String(clamp(1.4 - dist / 60, 0.25, 1));
      plate.bar.style.width = clamp(f.hp / f.maxHp, 0, 1) * 100 + '%';
      plate.bar.style.background = f.isPlayer ? '#8ef0ff'
        : f.hp / f.maxHp > 0.5 ? '#5ef08a' : f.hp / f.maxHp > 0.25 ? '#ffb648' : '#ff5d5d';
      plate.name.style.color = f.isPlayer ? '#8ef0ff' : '#dbe4ff';
    }

    /* floating numbers */
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const fl = this.floaters[i];
      fl.life -= dt;
      fl.pos.y += dt * 1.5;
      fl.pos.x += fl.drift * dt;
      if (fl.life <= 0) { fl.el.remove(); this.floaters.splice(i, 1); continue; }
      const proj = this.project(fl.pos);
      if (!proj.visible) { fl.el.style.display = 'none'; continue; }
      fl.el.style.display = 'block';
      const k = fl.life / fl.max;
      fl.el.style.transform = 'translate(-50%,-50%) translate(' + proj.x + 'px,' + proj.y + 'px) scale(' + (0.85 + k * 0.45) + ')';
      fl.el.style.opacity = String(clamp(k * 1.6, 0, 1));
    }

    /* kill feed fade */
    for (let i = this.feedItems.length - 1; i >= 0; i--) {
      const it = this.feedItems[i];
      it.life -= dt;
      if (it.life < 1) it.el.style.opacity = String(clamp(it.life, 0, 1));
      if (it.life <= 0) { it.el.remove(); this.feedItems.splice(i, 1); }
    }

    this.updateBoard();
  },

  updateBoard() {
    this.boardTick += 1;
    if (this.boardTick % 12 !== 0 && this.boardTick > 1) return;
    const sorted = State.fighters.slice().sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
    let html = '';
    for (const f of sorted.slice(0, 8)) {
      const cls = f.isPlayer ? ' class="me"' : '';
      const dead = f.dead ? ' dead' : '';
      html += '<div' + cls + '><span class="bn' + dead + '">' + escapeHtml(f.name) + '</span>' +
        '<span class="bk">' + f.kills + '</span><span class="bd">' + f.deaths + '</span></div>';
    }
    this.el.board.innerHTML = '<div class="bhead"><span class="bn">PLAYER</span><span class="bk">K</span><span class="bd">D</span></div>' + html;
  },
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}


/* ===== 08_main.js ===== */
'use strict';

/* ============================================================
   MAIN — renderer, camera, input, game loop
   ============================================================ */

const Game = {
  renderer: null,
  camera: null,
  yaw: 0,
  pitch: -0.22,
  camDist: 11,
  keys: Object.create(null),
  mouseDown: false,
  locked: false,
  lastT: 0,

  init() {
    const canvas = document.getElementById('scene');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = false;

    State.scene = new THREE.Scene();
    State.camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 500);
    this.camera = State.camera;
    this.camera.position.set(0, 14, 30);

    World.init(this.renderer, State.scene);
    this.spawnLobby();
    UI.init();
    this.bindInput();

    /* opening wave so the arena is not empty on spawn */
    World.spawnBlock('big', 0, 0, true);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      World.spawnBlock(rollTier(), Math.cos(a) * 8.6, Math.sin(a) * 8.6, false);
    }

    this.lastT = performance.now();
    requestAnimationFrame(t => this.loop(t));
  },

  spawnLobby() {
    const used = new Set();
    const count = CONFIG.botCount + 1;
    for (let i = 0; i < count; i++) {
      const isPlayer = i === 0;
      const f = new Fighter({
        name: randomGamertag(used),
        isPlayer,
        baseIndex: i,
        color: isPlayer ? 0x35e0ff : AVATAR_COLORS[(i * 3) % AVATAR_COLORS.length],
      });
      State.fighters.push(f);
      if (isPlayer) State.player = f;
    }
  },

  /* ---------------- input ---------------- */
  bindInput() {
    const canvas = this.renderer.domElement;

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (e.code === 'KeyM') {
        const m = Sound.toggle();
        UI.el.muteState.textContent = m ? 'MUTED' : 'SOUND ON';
        UI.toast(m ? 'Sound muted' : 'Sound on', '#8ea0c8');
      }
      if (e.code === 'Space' && State.started) e.preventDefault();
    });
    document.addEventListener('keyup', e => { this.keys[e.code] = false; });

    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) {
        this.mouseDown = true;
        if (!this.locked && State.started) canvas.requestPointerLock();
      }
    });
    window.addEventListener('mouseup', () => { this.mouseDown = false; });
    window.addEventListener('contextmenu', e => e.preventDefault());

    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === canvas;
      document.getElementById('lockhint').style.display =
        (!this.locked && State.started) ? 'block' : 'none';
    });

    document.addEventListener('mousemove', e => {
      if (!this.locked) return;
      this.yaw -= e.movementX * 0.0024;
      this.pitch = clamp(this.pitch - e.movementY * 0.0022, -0.85, 0.55);
    });

    window.addEventListener('wheel', e => {
      this.camDist = clamp(this.camDist + Math.sign(e.deltaY) * 1.2, 6, 20);
    }, { passive: true });

    document.getElementById('play-btn').addEventListener('click', () => {
      Sound.init();
      Sound.resume();
      Sound.uiClick();
      document.getElementById('start').style.display = 'none';
      document.getElementById('hud').style.display = 'block';
      State.started = true;
      State.running = true;
      canvas.requestPointerLock();
      UI.toast('Fight. Break blocks. Survive.', '#8ef0ff');
      UI.feed('Big Lucky Block is live in the centre', '#35e0ff');
    });
  },

  /* ---------------- player control ---------------- */
  updatePlayerInput(dt) {
    const p = State.player;
    if (!p || p.dead) return;

    const fwd = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const dir = new THREE.Vector3();
    if (this.keys['KeyW'] || this.keys['ArrowUp']) dir.add(fwd);
    if (this.keys['KeyS'] || this.keys['ArrowDown']) dir.sub(fwd);
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dir.add(right);
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) dir.sub(right);

    p.wantMove.copy(dir);
    if (this.keys['Space']) p.wantJump = true;

    if (this.mouseDown && this.locked) {
      p.wantAttack = true;
      p.facing.copy(fwd);
    } else if (dir.lengthSq() > 0.01) {
      p.facing.copy(dir.normalize());
    }
  },

  /* ---------------- camera ---------------- */
  updateCamera(dt) {
    const p = State.player;
    const target = p.pos.clone().add(new THREE.Vector3(0, 2.6, 0));
    if (p.dead) target.y += 1.5;

    const cp = Math.cos(this.pitch);
    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * cp * this.camDist,
      -Math.sin(this.pitch) * this.camDist + 3.2,
      Math.cos(this.yaw) * cp * this.camDist
    );
    const desired = target.clone().add(offset);
    desired.y = Math.max(desired.y, 1.6);

    const k = 1 - Math.exp(-dt * 9);
    this.camera.position.lerp(desired, k);
    this.camera.lookAt(target);
  },

  /* ---------------- projectiles ---------------- */
  updateProjectiles(dt) {
    for (let i = State.projectiles.length - 1; i >= 0; i--) {
      const pr = State.projectiles[i];
      pr.life -= dt;
      pr.vel.y += CONFIG.gravity * 0.12 * dt;
      pr.mesh.position.addScaledVector(pr.vel, dt);
      pr.mesh.lookAt(pr.mesh.position.clone().add(pr.vel));

      let hitTarget = null;
      for (const f of State.fighters) {
        if (f === pr.owner || f.dead) continue;
        if (pr.hit.has(f)) continue;
        const d = f.pos.clone().setY(f.pos.y + 1.6);
        if (d.distanceTo(pr.mesh.position) < 1.5) { hitTarget = f; break; }
      }

      const groundHit = groundAt(pr.mesh.position.x, pr.mesh.position.z) !== null
        && pr.mesh.position.y <= 0.15;

      if (hitTarget || groundHit || pr.life <= 0) {
        if (hitTarget || groundHit) {
          const pos = pr.mesh.position.clone();
          const w = pr.weapon;
          if (hitTarget) {
            hitTarget.takeDamage(pr.owner.outgoingDamage(w), pr.owner, w);
            pr.hit.add(hitTarget);
          }
          if (w.splash) {
            Sound.boom();
            World.burst(pos, TIERS[w.tier].glow, 30, 12, 1.3);
            for (const f of State.fighters) {
              if (f === pr.owner || f.dead) continue;
              if (f.pos.distanceTo(pos) < w.splash) {
                f.takeDamage(pr.owner.outgoingDamage(w) * 0.6, pr.owner, w);
              }
            }
          } else {
            World.burst(pos, TIERS[w.tier].glow, 8, 6, 0.8);
          }
        }
        State.scene.remove(pr.mesh);
        State.projectiles.splice(i, 1);
      }
    }
  },

  /* ---------------- body collisions ---------------- */
  separateFighters() {
    const fs = State.fighters;
    for (let i = 0; i < fs.length; i++) {
      const a = fs[i];
      if (a.dead) continue;
      for (let j = i + 1; j < fs.length; j++) {
        const b = fs[j];
        if (b.dead) continue;
        const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z;
        const d = Math.hypot(dx, dz);
        const min = FIGHTER_R * 2;
        if (d > 0.0001 && d < min) {
          const push = (min - d) / 2;
          const nx = dx / d, nz = dz / d;
          a.pos.x -= nx * push; a.pos.z -= nz * push;
          b.pos.x += nx * push; b.pos.z += nz * push;
        }
      }
    }
  },

  /* ---------------- loop ---------------- */
  loop(t) {
    requestAnimationFrame(tt => this.loop(tt));
    let dt = (t - this.lastT) / 1000;
    this.lastT = t;
    if (!isFinite(dt) || dt <= 0) return;
    dt = Math.min(dt, 0.05);

    if (!State.started) {
      /* slow idle orbit on the title screen */
      this.yaw += dt * 0.12;
      this.camera.position.set(Math.sin(this.yaw) * 34, 16, Math.cos(this.yaw) * 34);
      this.camera.lookAt(0, 1, 0);
      World.update(dt * 0.6);
      for (const f of State.fighters) f.mesh.position.copy(f.pos);
      this.renderer.render(State.scene, this.camera);
      return;
    }

    World.update(dt);

    this.updatePlayerInput(dt);
    for (const f of State.fighters) {
      if (!f.isPlayer) botThink(f, dt);
      f.update(dt);
    }
    this.separateFighters();
    this.updateProjectiles(dt);
    this.updateCamera(dt);
    UI.update(dt);

    /* keep the held-fire cadence for the player */
    if (this.mouseDown && this.locked && !State.player.dead) State.player.wantAttack = true;

    this.renderer.render(State.scene, this.camera);
  },
};

/* fast-forward the simulation without rendering (debug / testing) */
Game.sim = function (seconds, step) {
  const dt = step || 1 / 60;
  const steps = Math.floor(seconds / dt);
  for (let i = 0; i < steps; i++) {
    World.update(dt);
    this.updatePlayerInput(dt);
    for (const f of State.fighters) {
      if (!f.isPlayer) botThink(f, dt);
      f.update(dt);
    }
    this.separateFighters();
    this.updateProjectiles(dt);
  }
  return { time: State.time, blocks: State.blocks.length, pickups: State.pickups.length };
};

/* expose a small debug handle so the game can be poked from the console */
window.__LB = { State, World, Game, CONFIG, WEAPONS, ITEMS, TIERS, Sound, randomGamertag, Fighter };

window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});


})();