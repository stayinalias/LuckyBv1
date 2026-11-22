(function () {
'use strict';

/* ===== 01_config.js ===== */
'use strict';

/* ============================================================
   LUCKY BLOCKS BATTLEGROUNDS v2 (offline fan-made build)
   ============================================================ */

const BUILD = { version: '2.0.0', stamp: '2026-11-22 05:45 IST' };

const CONFIG = {
  botCount: 7,
  slots: 5,

  bigWaveMs: 15 * 60 * 1000,
  galaxyBlockMs: 5 * 60 * 1000,
  rngBlockMs: 3 * 60 * 1000,
  chamberMs: 10 * 60 * 1000,
  looseBlockMs: 4000,
  maxLooseBlocks: 18,

  gravity: -26,
  walkSpeed: 12,
  jumpSpeed: 13,
  playerHP: 100,
  respawnMs: 3200,
  domeHealPerSec: 22,
  voidY: -40,
  touchRadius: 1.9,
};

const ARENA_R = 60;
const BASE_DIST = 84;
const BASE_R = 14;
const BRIDGE_HALF = 5.5;
const DOME_R = 15.5;
const FIGHTER_R = 0.95;
const BLOCK_SIZE = 3.4;
const BIG_SIZE = 9.5;
const CHAMBER_R = 3.6;

const TEAM_COLORS = [
  { name: 'Blue',   hex: 0x3d8bff, glow: 0x8ecbff },
  { name: 'Red',    hex: 0xff4d4d, glow: 0xff9a8a },
  { name: 'Yellow', hex: 0xffd23d, glow: 0xffe98a },
  { name: 'Green',  hex: 0x4ddc7a, glow: 0x9bf0b5 },
  { name: 'Orange', hex: 0xff8a2b, glow: 0xffbf80 },
  { name: 'Purple', hex: 0xa06bff, glow: 0xcbb0ff },
  { name: 'Cyan',   hex: 0x35e0ff, glow: 0x9bf0ff },
  { name: 'Pink',   hex: 0xff6fbf, glow: 0xffb3dd },
];

const TIERS = {
  regular: { key: 'regular', label: 'REGULAR', name: 'Regular', color: 0xf5d43c, emissive: 0xb89400, glow: 0xffe57a, skin: 'question', chance: 0.62 },
  fire:    { key: 'fire', label: 'EPIC', name: 'Fire', color: 0xff5a1f, emissive: 0x8f2400, glow: 0xffa64d, skin: 'question', chance: 0.23 },
  gold:    { key: 'gold', label: 'LEGENDARY', name: 'Shiny Gold', color: 0xffc21e, emissive: 0x9a6b00, glow: 0xfff0a0, skin: 'question', chance: 0.11 },
  galaxy:  { key: 'galaxy', label: 'MYTHIC', name: 'Galaxy', color: 0x8b5cf6, emissive: 0x3b1d8f, glow: 0xc9a6ff, skin: 'galaxy', chance: 0.04 },
  big:     { key: 'big', label: '???', name: 'Big Block', color: 0x1b2338, emissive: 0x0e5f7a, glow: 0x35e0ff, skin: 'void', chance: 0 },
  rng:     { key: 'rng', label: 'RNG', name: 'RNG Block', color: 0x123d22, emissive: 0x0d5c2a, glow: 0x4dff8f, skin: 'matrix', chance: 0 },
};
const TIER_ORDER = ['regular', 'fire', 'gold', 'galaxy'];

const RNG_CHANCES = [['regular', 65], ['fire', 55], ['gold', 35], ['galaxy', 15], ['big', 5]];
const CHAMBER_CHANCES = [['regular', 50], ['fire', 20], ['gold', 10], ['galaxy', 5], ['big', 3], ['rng', 9]];

const FISTS = {
  id: 'fists', name: 'Bare Hands', tier: 'regular', kind: 'melee',
  dmg: 6, range: 2.6, cd: 0.45, kb: 4,
};

const WEAPONS = {
  reliable_blade: { name: 'Old Reliable Blade', tier: 'regular', kind: 'melee', dmg: 12, range: 3.6, cd: 0.55, kb: 6 },
  rusty_shiv:     { name: 'Rusty Shiv',         tier: 'regular', kind: 'melee', dmg: 9,  range: 2.9, cd: 0.34, kb: 3 },
  slugger:        { name: 'Wooden Slugger',     tier: 'regular', kind: 'melee', dmg: 14, range: 3.7, cd: 0.82, kb: 9 },
  frying_pan:     { name: 'Frying Pan',         tier: 'regular', kind: 'melee', dmg: 11, range: 3.2, cd: 0.62, kb: 13 },
  slingshot:      { name: 'Sling Shot',         tier: 'regular', kind: 'ranged', dmg: 9,  range: 46, cd: 0.8, kb: 3, projSpeed: 42 },
  pistol:         { name: 'Sidearm Pistol',     tier: 'regular', kind: 'ranged', dmg: 11, range: 50, cd: 0.48, kb: 4, projSpeed: 62 },

  emberbrand:   { name: 'Emberbrand',    tier: 'fire', kind: 'melee', dmg: 19, range: 3.8, cd: 0.55, kb: 7, effect: 'burn' },
  chainlink:    { name: 'Chainlink Saber', tier: 'fire', kind: 'melee', dmg: 18, range: 4.0, cd: 0.5, kb: 6 },
  frost_shiv:   { name: 'Frost Shiv',    tier: 'fire', kind: 'melee', dmg: 15, range: 3.1, cd: 0.4, kb: 4, effect: 'slow' },
  steel_cleaver:{ name: 'Steel Cleaver', tier: 'fire', kind: 'melee', dmg: 22, range: 3.7, cd: 0.86, kb: 10 },
  boom_tube:    { name: 'Boom Tube',     tier: 'fire', kind: 'ranged', dmg: 26, range: 55, cd: 1.4, kb: 8, projSpeed: 34, splash: 5.0 },
  smg:          { name: 'Buzz SMG',      tier: 'fire', kind: 'ranged', dmg: 6,  range: 45, cd: 0.13, kb: 2, projSpeed: 66 },
  shotgun:      { name: 'Scatter Shotgun', tier: 'fire', kind: 'ranged', dmg: 9, range: 26, cd: 0.95, kb: 7, projSpeed: 58, pellets: 5, spread: 0.13 },
  dynamite:     { name: 'Stick Dynamite', tier: 'fire', kind: 'thrown', dmg: 34, range: 26, cd: 1.6, kb: 14, projSpeed: 24, splash: 6.5, fuse: 1.5 },

  luminar:      { name: 'Luminar',      tier: 'gold', kind: 'melee', dmg: 25, range: 4.1, cd: 0.42, kb: 7 },
  gloomheart:   { name: 'Gloomheart',   tier: 'gold', kind: 'melee', dmg: 24, range: 3.9, cd: 0.6, kb: 8, effect: 'lifesteal', steal: 0.35 },
  toxinfang:    { name: 'Toxinfang',    tier: 'gold', kind: 'melee', dmg: 21, range: 3.7, cd: 0.5, kb: 5, effect: 'poison' },
  gustforce:    { name: 'Gustforce',    tier: 'gold', kind: 'ranged', dmg: 22, range: 62, cd: 0.95, kb: 16, projSpeed: 48 },
  phantomstride:{ name: 'Phantomstride',tier: 'gold', kind: 'melee', dmg: 27, range: 3.5, cd: 0.45, kb: 6, effect: 'backstab' },
  rifle:        { name: 'Rattle Rifle', tier: 'gold', kind: 'ranged', dmg: 12, range: 70, cd: 0.16, kb: 3, projSpeed: 78 },
  grenade_launcher: { name: 'Lobber Launcher', tier: 'gold', kind: 'ranged', dmg: 30, range: 60, cd: 1.15, kb: 12, projSpeed: 40, splash: 6.0, arc: 1.0 },

  starcaller:   { name: 'Starcaller',   tier: 'galaxy', kind: 'melee', dmg: 31, range: 4.3, cd: 0.6, kb: 9, aoe: 4.5 },
  voidreaver:   { name: 'Voidreaver',   tier: 'galaxy', kind: 'melee', dmg: 34, range: 4.2, cd: 0.52, kb: 9, effect: 'lifesteal', steal: 0.5 },
  nova_lance:   { name: 'Nova Lance',   tier: 'galaxy', kind: 'ranged', dmg: 30, range: 70, cd: 0.8, kb: 8, projSpeed: 55, pierce: true },
  graviton:     { name: 'Graviton Hammer', tier: 'galaxy', kind: 'melee', dmg: 38, range: 4.5, cd: 1.05, kb: 18, aoe: 5.5 },
  periastron:   { name: 'Periastron Sword', tier: 'galaxy', kind: 'melee', dmg: 42, range: 4.6, cd: 0.5, kb: 13, aoe: 3.6, effect: 'burn' },
  sniper:       { name: 'Longshot Rifle', tier: 'galaxy', kind: 'ranged', dmg: 46, range: 90, cd: 1.15, kb: 10, projSpeed: 130 },
  rocket_launcher: { name: 'Skyfall Launcher', tier: 'galaxy', kind: 'ranged', dmg: 40, range: 75, cd: 1.25, kb: 16, projSpeed: 46, splash: 7.5 },

  genesis:      { name: 'Genesis Blade',     tier: 'big', kind: 'melee', dmg: 46, range: 4.7, cd: 0.45, kb: 12, effect: 'lifesteal', steal: 0.3, aoe: 3.6 },
  singularity:  { name: 'Singularity Cannon', tier: 'big', kind: 'ranged', dmg: 52, range: 85, cd: 1.2, kb: 20, projSpeed: 44, splash: 8.0 },
  timebreak:    { name: 'Timebreak Scythe',  tier: 'big', kind: 'melee', dmg: 40, range: 5.3, cd: 0.55, kb: 10, aoe: 6.2 },
  minigun:      { name: 'Havoc Minigun',     tier: 'big', kind: 'ranged', dmg: 13, range: 60, cd: 0.08, kb: 2, projSpeed: 88 },
};

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

const LOOT = {
  regular: [
    ['reliable_blade', 13], ['rusty_shiv', 12], ['slugger', 11], ['frying_pan', 11],
    ['slingshot', 10], ['pistol', 11], ['med_kit', 11], ['sprint_spring', 8], ['moon_spring', 7],
  ],
  fire: [
    ['emberbrand', 13], ['chainlink', 12], ['frost_shiv', 12], ['steel_cleaver', 12],
    ['boom_tube', 10], ['smg', 11], ['shotgun', 11], ['dynamite', 9],
    ['med_kit_big', 9], ['bubble_shield', 9],
  ],
  gold: [
    ['luminar', 12], ['gloomheart', 12], ['toxinfang', 12], ['gustforce', 11],
    ['phantomstride', 12], ['rifle', 11], ['grenade_launcher', 9],
    ['rage_chip', 9], ['godshield', 10],
  ],
  galaxy: [
    ['starcaller', 12], ['voidreaver', 12], ['nova_lance', 11], ['graviton', 12],
    ['periastron', 13], ['sniper', 10], ['rocket_launcher', 11], ['ascension', 9],
  ],
  big: [
    ['genesis', 18], ['singularity', 18], ['timebreak', 18], ['minigun', 16],
    ['ascension', 15], ['godshield', 15],
  ],
};

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
function rollRngTier() { return weightedPick(RNG_CHANCES); }
function rollChamberTier() { return weightedPick(CHAMBER_CHANCES); }
function resolveTier(tier) { return tier === 'rng' ? rollRngTier() : tier; }
function lootFor(tier) {
  const t = resolveTier(tier);
  const id = weightedPick(LOOT[t] || LOOT.regular);
  if (WEAPONS[id]) return { type: 'weapon', id: id, def: WEAPONS[id], tier: t };
  return { type: 'item', id: id, def: ITEMS[id], tier: t };
}
function hexStr(hex) { return '#' + hex.toString(16).padStart(6, '0'); }


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
   STATE + WORLD: space backdrop, arena, bases, domes,
   cryogenic chambers, lucky blocks and their skins
   ============================================================ */

const State = {
  scene: null, camera: null, renderer: null,
  fighters: [], blocks: [], chambers: [], projectiles: [], particles: [],
  bases: [], player: null,
  time: 0,
  timers: { big: CONFIG.bigWaveMs, galaxy: CONFIG.galaxyBlockMs, rng: CONFIG.rngBlockMs, loose: 3000 },
  started: false, wave: 1,
  islands: [],
};

const World = {
  glowTex: null,
  particlePool: [],
  tex: {},
  matrix: null,

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
    c.width = 32; c.height = 512;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0a0620');
    grad.addColorStop(0.32, '#141a44');
    grad.addColorStop(0.55, '#233066');
    grad.addColorStop(0.78, '#3b2a63');
    grad.addColorStop(1, '#0a0a1e');
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 512);
    return new THREE.CanvasTexture(c);
  },

  makeQuestionTexture(bg, mark, rim) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = bg;
    g.fillRect(0, 0, 256, 256);

    g.globalAlpha = 0.10;
    g.strokeStyle = '#ffffff';
    g.lineWidth = 2;
    for (let i = 32; i < 256; i += 32) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke();
      g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke();
    }
    g.globalAlpha = 1;

    g.strokeStyle = rim;
    g.lineWidth = 14;
    g.strokeRect(7, 7, 242, 242);

    g.font = 'bold 172px Arial, Helvetica, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = mark;
    g.shadowColor = mark;
    g.shadowBlur = 24;
    g.fillText('?', 128, 132);
    g.shadowBlur = 0;

    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  },

  makeGalaxyTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#06031a';
    g.fillRect(0, 0, 256, 256);

    const clouds = [
      ['rgba(120,60,255,0.55)', 70, 80, 120],
      ['rgba(40,180,255,0.42)', 180, 150, 110],
      ['rgba(255,80,200,0.32)', 120, 200, 95],
      ['rgba(255,240,255,0.22)', 150, 70, 70],
    ];
    for (const [col, x, y, r] of clouds) {
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, col);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 256, 256);
    }

    g.strokeStyle = 'rgba(200,180,255,0.35)';
    g.lineWidth = 2;
    for (let arm = 0; arm < 2; arm++) {
      g.beginPath();
      for (let a = 0; a < Math.PI * 3; a += 0.12) {
        const r = 8 + a * 12;
        const x = 128 + Math.cos(a + arm * Math.PI) * r;
        const y = 128 + Math.sin(a + arm * Math.PI) * r * 0.85;
        if (a === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    }

    for (let i = 0; i < 220; i++) {
      const x = Math.random() * 256, y = Math.random() * 256;
      const r = Math.random() * 1.7 + 0.3;
      g.globalAlpha = 0.35 + Math.random() * 0.65;
      g.fillStyle = Math.random() > 0.8 ? '#b7d6ff' : '#ffffff';
      g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill();
    }
    g.globalAlpha = 1;

    g.font = 'bold 168px Arial, Helvetica, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.shadowColor = '#c9a6ff';
    g.shadowBlur = 34;
    g.fillStyle = '#efe6ff';
    g.fillText('?', 128, 132);
    g.shadowBlur = 0;

    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  },

  makeVoidTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#03050c';
    g.fillRect(0, 0, 256, 256);

    const core = g.createRadialGradient(128, 128, 4, 128, 128, 120);
    core.addColorStop(0, 'rgba(53,224,255,0.55)');
    core.addColorStop(0.35, 'rgba(20,80,140,0.35)');
    core.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = core;
    g.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 26; i++) {
      g.beginPath();
      const a0 = i * 0.5;
      for (let a = a0; a < a0 + 2.6; a += 0.1) {
        const r = 6 + a * 9;
        const x = 128 + Math.cos(a) * r;
        const y = 128 + Math.sin(a) * r * 0.9;
        if (a === a0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.strokeStyle = i % 3 === 0 ? 'rgba(120,230,255,0.30)' : 'rgba(70,120,255,0.16)';
      g.lineWidth = i % 3 === 0 ? 2.4 : 1.2;
      g.stroke();
    }

    for (let i = 0; i < 90; i++) {
      g.globalAlpha = 0.2 + Math.random() * 0.6;
      g.fillStyle = '#9bf0ff';
      g.beginPath();
      g.arc(Math.random() * 256, Math.random() * 256, Math.random() * 1.4 + 0.3, 0, 6.3);
      g.fill();
    }
    g.globalAlpha = 1;

    g.strokeStyle = '#35e0ff';
    g.lineWidth = 12;
    g.strokeRect(6, 6, 244, 244);

    g.font = 'bold 160px Arial, Helvetica, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.shadowColor = '#35e0ff';
    g.shadowBlur = 40;
    g.fillStyle = '#d8fbff';
    g.fillText('?', 128, 132);
    g.shadowBlur = 0;

    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  },

  makeMatrixTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#02160a';
    g.fillRect(0, 0, 256, 256);

    const cols = 16;
    const colW = 256 / cols;
    const glyphs = '01アイウエオカキクケコサシスセソタチツテト?!#$%&*+=<>{}[]';
    for (let i = 0; i < cols; i++) {
      let y = Math.random() * 40;
      const len = 8 + Math.random() * 18;
      for (let j = 0; j < len; j++) {
        const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
        const fade = 1 - j / len;
        g.fillStyle = j === 0 ? '#d6ffe4'
          : 'rgba(' + Math.floor(40 + 60 * fade) + ',' + Math.floor(190 + 60 * fade) + ',' + Math.floor(90 + 40 * fade) + ',' + (0.25 + fade * 0.75) + ')';
        g.font = 'bold 16px monospace';
        g.fillText(ch, i * colW + 3, y);
        y += 15;
      }
    }
    g.strokeStyle = '#4dff8f';
    g.lineWidth = 10;
    g.strokeRect(5, 5, 246, 246);

    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  },

  blockTexture(tierKey) {
    if (this.tex[tierKey]) return this.tex[tierKey];
    let t;
    if (tierKey === 'galaxy') t = this.makeGalaxyTexture();
    else if (tierKey === 'big') t = this.makeVoidTexture();
    else if (tierKey === 'rng') t = this.makeMatrixTexture();
    else {
      const tier = TIERS[tierKey];
      t = this.makeQuestionTexture(hexStr(tier.color), '#2a2100', hexStr(tier.glow));
    }
    this.tex[tierKey] = t;
    return t;
  },

  makeLabel() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 96;
    const g = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false, depthTest: false,
    }));
    sprite.scale.set(9, 3.4, 1);
    const setText = (text, color) => {
      g.clearRect(0, 0, 256, 96);
      g.fillStyle = 'rgba(4,8,16,0.72)';
      g.fillRect(0, 12, 256, 72);
      g.strokeStyle = color || '#8ef0ff';
      g.lineWidth = 4;
      g.strokeRect(2, 14, 252, 68);
      g.font = 'bold 44px "Segoe UI", Arial, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = color || '#8ef0ff';
      g.fillText(text, 128, 50);
      tex.needsUpdate = true;
    };
    return { sprite, setText, tex };
  },

  init(renderer, scene) {
    this.renderer = renderer;
    this.scene = scene;
    this.glowTex = this.makeGlowTexture();
    this.matrix = this.blockTexture('rng');

    scene.background = new THREE.Color(0x05060f);
    scene.fog = new THREE.Fog(0x0a0d20, 340, 1000);

    this.buildSky();
    this.buildIslands();

    scene.add(new THREE.HemisphereLight(0x9db8ff, 0x1a2035, 1.05));
    const sun = new THREE.DirectionalLight(0xfff2d0, 1.5);
    sun.position.set(70, 120, 50);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x6d7bff, 0.85);
    rim.position.set(-60, 40, -90);
    scene.add(rim);

    this.buildArena();
    this.buildBases();
    this.initParticles();
  },

  buildSky() {
    const s = this.scene;

    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(900, 32, 20),
      new THREE.MeshBasicMaterial({ map: this.makeSkyTexture(), side: THREE.BackSide, depthWrite: false, fog: false })
    );
    s.add(sky);

    const count = 2200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 520 + Math.random() * 320;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(rand(-1, 1));
      pos[i * 3] = Math.sin(ph) * Math.cos(th) * r;
      pos[i * 3 + 1] = Math.cos(ph) * r * 0.7;
      pos[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const stars = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xdfe9ff, size: 2.6, sizeAttenuation: false, transparent: true, opacity: 0.95, fog: false,
    }));
    s.add(stars);
    this.stars = stars;

    const nebCols = [0x6a3cff, 0x2b6bff, 0xff4fb0, 0x35e0ff, 0x8b5cf6, 0x2fd6a8];
    for (let i = 0; i < 7; i++) {
      const col = nebCols[i % nebCols.length];
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.glowTex, color: col, transparent: true, opacity: 0.24,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
      }));
      const a = (i / 7) * Math.PI * 2;
      const r = 250 + Math.random() * 130;
      sp.position.set(Math.cos(a) * r, rand(-120, 190), Math.sin(a) * r);
      sp.scale.setScalar(rand(300, 470));
      s.add(sp);
    }

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(88, 24, 18),
      new THREE.MeshBasicMaterial({ color: 0x2a3b7a })
    );
    planet.position.set(-265, 135, -330);
    s.add(planet);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(140, 6, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0x6d7bd6, transparent: true, opacity: 0.55 })
    );
    ring.position.copy(planet.position);
    ring.rotation.x = 1.15;
    ring.rotation.z = 0.3;
    s.add(ring);
  },

  buildIslands() {
    const rockMats = [0x2c3450, 0x353f5e, 0x263049, 0x3a3355];
    const topMats = [0x3f6b58, 0x4a5f8a, 0x5a4b7a, 0x3d5f74];
    for (let i = 0; i < 16; i++) {
      const g = new THREE.Group();
      const r = rand(9, 26);
      const h = r * rand(0.9, 2.2);

      const rock = new THREE.Mesh(
        new THREE.ConeGeometry(r, h, 7, 1),
        new THREE.MeshLambertMaterial({ color: pick(rockMats), flatShading: true })
      );
      rock.rotation.x = Math.PI;
      rock.position.y = -h / 2;
      g.add(rock);

      const top = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r * 0.96, 1.6, 7),
        new THREE.MeshLambertMaterial({ color: pick(topMats), flatShading: true })
      );
      g.add(top);

      for (let k = 0; k < randInt(1, 4); k++) {
        const s = rand(1.4, 3.4);
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(s, s * rand(1, 2.4), s),
          new THREE.MeshLambertMaterial({ color: pick([0x6a7fa8, 0x8a6aa8, 0x4f7f6a]), flatShading: true })
        );
        box.position.set(rand(-r * 0.5, r * 0.5), s * 0.6, rand(-r * 0.5, r * 0.5));
        box.rotation.y = rand(0, 6.3);
        g.add(box);
      }

      const a = (i / 16) * Math.PI * 2 + rand(-0.2, 0.2);
      const dist = rand(95, 235);
      g.position.set(Math.cos(a) * dist, rand(-70, 45), Math.sin(a) * dist);
      g.rotation.y = rand(0, 6.3);
      this.scene.add(g);
      State.islands.push({
        mesh: g, baseY: g.position.y, phase: rand(0, 6.3),
        drift: rand(0.4, 1.2), spin: rand(-0.05, 0.05),
      });
    }
  },

  buildArena() {
    const s = this.scene;

    const topTex = this.makeGridTexture('#2b3450', '#46567f');
    topTex.repeat.set(26, 26);
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(ARENA_R, ARENA_R, 2.4, 12),
      new THREE.MeshLambertMaterial({ map: topTex, color: 0xffffff })
    );
    top.position.y = -1.2;
    s.add(top);

    const under = new THREE.Mesh(
      new THREE.CylinderGeometry(ARENA_R * 0.94, ARENA_R * 0.45, 22, 12),
      new THREE.MeshLambertMaterial({ color: 0x1a2136, flatShading: true })
    );
    under.position.y = -13;
    s.add(under);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(ARENA_R + 0.1, 0.6, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0x35e0ff })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.05;
    s.add(rim);
    this.arenaRim = rim;

    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 15, 0.2, 12),
      new THREE.MeshBasicMaterial({ color: 0x0d3b52 })
    );
    pad.position.y = 0.02;
    s.add(pad);
    const padRing = new THREE.Mesh(
      new THREE.TorusGeometry(15, 0.35, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0.8 })
    );
    padRing.rotation.x = Math.PI / 2;
    padRing.position.y = 0.16;
    s.add(padRing);
    this.padRing = padRing;
  },

  buildBases() {
    const s = this.scene;
    const count = CONFIG.botCount + 1;
    for (let i = 0; i < count; i++) {
      const team = TEAM_COLORS[i % TEAM_COLORS.length];
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      const bx = Math.cos(a) * BASE_DIST;
      const bz = Math.sin(a) * BASE_DIST;
      const base = { index: i, x: bx, z: bz, angle: a, team, color: team.hex, glow: team.glow };
      State.bases.push(base);

      const colTex = this.makeGridTexture('#333d5c', '#4a5883');
      colTex.repeat.set(4, 12);
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(BASE_R, BASE_R * 0.7, 70, 12),
        new THREE.MeshLambertMaterial({ map: colTex, color: 0xffffff })
      );
      col.position.set(bx, -35, bz);
      s.add(col);

      const bt = new THREE.Mesh(
        new THREE.CylinderGeometry(BASE_R, BASE_R, 2, 12),
        new THREE.MeshLambertMaterial({ color: team.hex })
      );
      bt.position.set(bx, -1, bz);
      s.add(bt);

      const len = BASE_DIST - ARENA_R + 1;
      const mid = (ARENA_R + BASE_DIST) / 2;
      const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(BRIDGE_HALF * 2, 1, len),
        new THREE.MeshLambertMaterial({ color: 0x3a4463 })
      );
      bridge.position.set(Math.cos(a) * mid, -0.5, Math.sin(a) * mid);
      bridge.rotation.y = -a + Math.PI / 2;
      s.add(bridge);

      for (const side of [-1, 1]) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 1.6, len),
          new THREE.MeshBasicMaterial({ color: team.glow })
        );
        const off = side * (BRIDGE_HALF - 0.2);
        rail.position.set(
          Math.cos(a) * mid - Math.sin(a) * off, 0.8,
          Math.sin(a) * mid + Math.cos(a) * off
        );
        rail.rotation.y = -a + Math.PI / 2;
        s.add(rail);
      }

      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(DOME_R, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshBasicMaterial({
          color: team.glow, transparent: true, opacity: 0.09,
          side: THREE.DoubleSide, depthWrite: false,
        })
      );
      dome.position.set(bx, 0, bz);
      s.add(dome);
      const domeWire = new THREE.Mesh(
        new THREE.SphereGeometry(DOME_R, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshBasicMaterial({
          color: team.glow, wireframe: true, transparent: true, opacity: 0.14,
        })
      );
      domeWire.position.set(bx, 0, bz);
      s.add(domeWire);
      base.dome = dome;
      base.domeWire = domeWire;

      const strip = new THREE.Mesh(
        new THREE.TorusGeometry(BASE_R - 0.4, 0.25, 6, 48),
        new THREE.MeshBasicMaterial({ color: team.glow })
      );
      strip.rotation.x = Math.PI / 2;
      strip.position.set(bx, 0.2, bz);
      s.add(strip);

      const post = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 9, 1.2),
        new THREE.MeshLambertMaterial({ color: team.hex })
      );
      post.position.set(bx + Math.cos(a + 1.2) * 9, 4.5, bz + Math.sin(a + 1.2) * 9);
      s.add(post);

      this.buildChamber(base);
    }
  },

  buildChamber(base) {
    const s = this.scene;
    const ca = base.angle + 1.05;
    const cx = base.x + Math.cos(ca) * 9;
    const cz = base.z + Math.sin(ca) * 9;

    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(CHAMBER_R, CHAMBER_R, 8, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: base.glow, transparent: true, opacity: 0.16,
        side: THREE.DoubleSide, depthWrite: false,
      })
    );
    glass.position.set(cx, 4, cz);
    s.add(glass);

    const cage = new THREE.Mesh(
      new THREE.CylinderGeometry(CHAMBER_R + 0.05, CHAMBER_R + 0.05, 8, 8, 1, true),
      new THREE.MeshBasicMaterial({
        color: base.glow, wireframe: true, transparent: true, opacity: 0.35,
      })
    );
    cage.position.set(cx, 4, cz);
    s.add(cage);

    const floorRing = new THREE.Mesh(
      new THREE.TorusGeometry(CHAMBER_R, 0.28, 6, 40),
      new THREE.MeshBasicMaterial({ color: base.glow })
    );
    floorRing.rotation.x = Math.PI / 2;
    floorRing.position.set(cx, 0.18, cz);
    s.add(floorRing);

    const capRing = floorRing.clone();
    capRing.position.y = 8;
    s.add(capRing);

    const label = this.makeLabel();
    label.sprite.position.set(cx, 10.6, cz);
    s.add(label.sprite);

    const chamber = {
      base, x: cx, z: cz, glass, cage, label,
      ready: true, timer: 0, tier: rollChamberTier(), block: null,
    };
    State.chambers.push(chamber);
    this.spawnChamberBlock(chamber);
    this.refreshChamberLabel(chamber);
  },

  spawnChamberBlock(chamber) {
    const block = this.makeBlockMesh(chamber.tier, chamber.x, 4.4, chamber.z, 2.8, false);
    this.scene.add(block.mesh);
    chamber.block = block;
    block.mesh.visible = chamber.ready;
  },

  refreshChamberLabel(chamber) {
    if (chamber.ready) {
      const t = TIERS[chamber.tier];
      chamber.label.setText(chamber.tier === 'rng' ? '?!! READY' : t.label, hexStr(t.glow));
    } else {
      chamber.label.setText(this.formatTime(chamber.timer), '#8ea0c8');
    }
  },

  makeBlockMesh(tierKey, x, y, z, size, big) {
    const t = TIERS[tierKey];
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const tex = this.blockTexture(tierKey);
    const map = tierKey === 'rng' ? tex.clone() : tex;
    if (tierKey === 'rng') {
      map.needsUpdate = true;
      map.wrapS = map.wrapT = THREE.RepeatWrapping;
    }
    const mat = new THREE.MeshLambertMaterial({
      map: map,
      emissive: 0xffffff,
      emissiveMap: map,
      emissiveIntensity: tierKey === 'regular' ? 0.32 : 0.55,
    });
    const core = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
    group.add(core);

    const wire = new THREE.Mesh(
      new THREE.BoxGeometry(size * 1.05, size * 1.05, size * 1.05),
      new THREE.MeshBasicMaterial({ color: t.glow, wireframe: true, transparent: true, opacity: 0.55 })
    );
    group.add(wire);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowTex, color: t.glow, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.setScalar(size * 3.2);
    group.add(glow);

    let tag = null;
    if (tierKey === 'rng') {
      tag = this.makeLabel();
      tag.setText('?!!', '#4dff8f');
      tag.sprite.scale.set(size * 2.2, size * 0.85, 1);
      tag.sprite.position.set(0, 0, size * 0.62);
      group.add(tag.sprite);
    }

    const shards = [];
    if (big) {
      for (let i = 0; i < 8; i++) {
        const sh = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.8, 0.8),
          new THREE.MeshBasicMaterial({ color: t.glow })
        );
        group.add(sh);
        shards.push({ mesh: sh, a: (i / 8) * Math.PI * 2, r: size * 0.95, y: rand(-1.5, 1.5) });
      }
    }

    return {
      tier: tierKey, big: !!big, mesh: group, core, wire, glow, shards, map, tag,
      size, baseY: y, bob: rand(0, 6.28), spawnT: 0, alive: true,
      x, z,
    };
  },

  spawnBlock(tierKey, x, z, opts) {
    opts = opts || {};
    const big = !!opts.big;
    const size = big ? BIG_SIZE : (opts.size || BLOCK_SIZE);
    const y = opts.y !== undefined ? opts.y : size * 0.5 + 2.4;
    const block = this.makeBlockMesh(tierKey, x, y, z, size, big);
    block.kind = opts.kind || 'loose';
    this.scene.add(block.mesh);
    State.blocks.push(block);
    Sound.spawn();
    this.burst(block.mesh.position, TIERS[tierKey].glow, big ? 60 : 18, big ? 16 : 8, big ? 1.8 : 1);
    return block;
  },

  spawnBigWave() {
    State.wave++;
    this.spawnBlock('big', 0, 0, { big: true, kind: 'big' });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      this.spawnBlock(rollTier(), Math.cos(a) * 26, Math.sin(a) * 26, { kind: 'loose' });
    }
    Sound.bigSpawn();
    UI.feed('A BIG VOID BLOCK has appeared in the centre!', '#35e0ff');
    UI.toast('BIG BLOCK WAVE ' + State.wave, '#35e0ff');
  },

  openBlock(block, by) {
    if (!block.alive) return;
    block.alive = false;
    const tier = resolveTier(block.tier);
    const t = TIERS[tier];
    const drops = tier === 'big' ? 3 : 1;

    for (let i = 0; i < drops; i++) by.give(lootFor(tier));

    Sound.blockBreak(tier);
    this.burst(block.mesh.position, t.glow, block.big ? 80 : 30, block.big ? 18 : 10, block.big ? 2 : 1.2);
    this.burst(block.mesh.position, 0xffffff, block.big ? 34 : 12, block.big ? 14 : 7, 1);

    this.scene.remove(block.mesh);
    const idx = State.blocks.indexOf(block);
    if (idx >= 0) State.blocks.splice(idx, 1);

    if (by && !by.isPlayer) by.blockCd = rand(7, 13);

    const who = by ? by.name : 'Someone';
    if (tier === 'big') UI.feed(who + ' opened the BIG VOID BLOCK!', '#35e0ff');
    else if (block.tier === 'rng') UI.feed(who + ' cracked an RNG block → ' + t.name, '#4dff8f');
    else UI.feed(who + ' opened a ' + t.name + ' block', hexStr(t.glow));

    if (by && by.isPlayer) UI.toast('+ ' + t.name + ' loot', hexStr(t.glow));
  },

  initParticles() {
    const geo = new THREE.BoxGeometry(0.28, 0.28, 0.28);
    for (let i = 0; i < 300; i++) {
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
      p.life = rand(0.45, 1.0);
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
      p.vel.y += CONFIG.gravity * 0.35 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.x += p.spin.x * dt;
      p.mesh.rotation.y += p.spin.y * dt;
      p.mesh.material.opacity = clamp(p.life / p.maxLife, 0, 1);
    }
  },

  update(dt) {
    State.time += dt;

    const hasKind = k => State.blocks.some(b => b.kind === k);

    if (!hasKind('big')) {
      State.timers.big -= dt * 1000;
      if (State.timers.big <= 0) { State.timers.big = CONFIG.bigWaveMs; this.spawnBigWave(); }
    }
    if (!hasKind('galaxy')) {
      State.timers.galaxy -= dt * 1000;
      if (State.timers.galaxy <= 0) {
        State.timers.galaxy = CONFIG.galaxyBlockMs;
        const a = rand(0, Math.PI * 2), r = rand(20, ARENA_R - 8);
        this.spawnBlock('galaxy', Math.cos(a) * r, Math.sin(a) * r, { kind: 'galaxy' });
        UI.feed('A GALAXY block drifted into the arena', '#c9a6ff');
      }
    }
    if (!hasKind('rng')) {
      State.timers.rng -= dt * 1000;
      if (State.timers.rng <= 0) {
        State.timers.rng = CONFIG.rngBlockMs;
        const a = rand(0, Math.PI * 2), r = rand(20, ARENA_R - 8);
        this.spawnBlock('rng', Math.cos(a) * r, Math.sin(a) * r, { kind: 'rng' });
        UI.feed('An RNG ?!! block materialised', '#4dff8f');
      }
    }
    State.timers.loose -= dt * 1000;
    if (State.timers.loose <= 0) {
      State.timers.loose = CONFIG.looseBlockMs;
      const loose = State.blocks.filter(b => b.kind === 'loose').length;
      for (let n = 0; n < 2 && loose + n < CONFIG.maxLooseBlocks; n++) {
        const a = rand(0, Math.PI * 2), r = rand(12, ARENA_R - 6);
        this.spawnBlock(rollTier(), Math.cos(a) * r, Math.sin(a) * r, { kind: 'loose' });
      }
    }

    for (const b of State.blocks.slice()) {
      this.animateBlock(b, dt);
      for (const f of State.fighters) {
        if (f.dead) continue;
        const dx = f.pos.x - b.mesh.position.x;
        const dz = f.pos.z - b.mesh.position.z;
        const reach = b.size * 0.5 + CONFIG.touchRadius;
        if (dx * dx + dz * dz <= reach * reach &&
            Math.abs(f.pos.y + 1.5 - b.mesh.position.y) < b.size * 0.8 + 2.2) {
          this.openBlock(b, f);
          break;
        }
      }
    }

    for (const c of State.chambers) {
      if (c.ready && c.block) {
        this.animateBlock(c.block, dt);
        for (const f of State.fighters) {
          if (f.dead) continue;
          const dx = f.pos.x - c.x, dz = f.pos.z - c.z;
          if (dx * dx + dz * dz <= (CHAMBER_R + 0.6) * (CHAMBER_R + 0.6)) {
            this.collectChamber(c, f);
            break;
          }
        }
      } else {
        c.timer -= dt * 1000;
        c.label.setText(this.formatTime(c.timer), '#8ea0c8');
        if (c.timer <= 0) {
          c.ready = true;
          c.tier = rollChamberTier();
          this.rebuildChamberBlock(c);
          this.refreshChamberLabel(c);
          Sound.spawn();
        }
      }
      c.cage.rotation.y += dt * 0.4;
      c.glass.material.opacity = 0.13 + Math.sin(State.time * 2 + c.base.index) * 0.04;
    }

    if (this.padRing) this.padRing.material.opacity = 0.45 + Math.sin(State.time * 2) * 0.3;
    if (this.stars) this.stars.rotation.y += dt * 0.004;
    for (const is of State.islands) {
      is.phase += dt * 0.25 * is.drift;
      is.mesh.position.y = is.baseY + Math.sin(is.phase) * 3.5;
      is.mesh.rotation.y += dt * is.spin;
    }

    if (this.matrix) {
      this.matrix.offset.y = (this.matrix.offset.y + dt * 0.35) % 1;
      this.matrix.offset.x = (this.matrix.offset.x + dt * 0.05) % 1;
    }
    for (const b of State.blocks) {
      if (b.tier === 'rng' && b.map) b.map.offset.y = (b.map.offset.y + dt * 0.4) % 1;
    }
    for (const c of State.chambers) {
      if (c.block && c.block.tier === 'rng' && c.block.map) {
        c.block.map.offset.y = (c.block.map.offset.y + dt * 0.4) % 1;
      }
    }

    this.updateParticles(dt);
  },

  animateBlock(b, dt) {
    b.spawnT = Math.min(1, b.spawnT + dt * 2.6);
    const pop = b.spawnT < 1 ? (1 + Math.sin(b.spawnT * Math.PI) * 0.35) : 1;
    b.mesh.scale.setScalar(pop * (0.4 + 0.6 * b.spawnT));
    b.bob += dt * (b.big ? 0.9 : 1.5);
    b.mesh.position.y = b.baseY + Math.sin(b.bob) * (b.big ? 1.1 : 0.55);
    b.mesh.rotation.y += dt * (b.big ? 0.4 : 0.8);
    b.mesh.rotation.x = Math.sin(b.bob * 0.7) * 0.09;
    b.wire.rotation.y -= dt * 1.6;
    b.wire.rotation.x += dt * 0.8;
    b.glow.material.opacity = 0.6 + Math.sin(State.time * 4 + b.bob) * 0.25;
    for (const s of b.shards) {
      s.a += dt * 1.1;
      s.mesh.position.set(Math.cos(s.a) * s.r, s.y + Math.sin(s.a * 2) * 1.2, Math.sin(s.a) * s.r);
      s.mesh.rotation.x += dt * 2;
      s.mesh.rotation.y += dt * 3;
    }
  },

  collectChamber(chamber, by) {
    const tier = resolveTier(chamber.tier);
    const t = TIERS[tier];
    const drops = tier === 'big' ? 2 : 1;
    for (let i = 0; i < drops; i++) by.give(lootFor(tier));

    Sound.blockBreak(tier);
    this.burst(chamber.block.mesh.position, t.glow, 40, 12, 1.4);
    chamber.ready = false;
    chamber.timer = CONFIG.chamberMs;
    chamber.block.mesh.visible = false;
    this.refreshChamberLabel(chamber);

    if (by.isPlayer) {
      UI.toast('Chamber: ' + t.name + ' loot', hexStr(t.glow));
      UI.feed('You cracked your cryo chamber → ' + t.name, hexStr(t.glow));
    } else if (tier === 'galaxy' || tier === 'big' || tier === 'rng') {
      UI.feed(by.name + ' cracked a cryo chamber → ' + t.name, hexStr(t.glow));
    }
  },

  rebuildChamberBlock(chamber) {
    if (chamber.block) this.scene.remove(chamber.block.mesh);
    const block = this.makeBlockMesh(chamber.tier, chamber.x, 4.4, chamber.z, 2.8, false);
    block.mesh.visible = chamber.ready;
    this.scene.add(block.mesh);
    chamber.block = block;
  },

  formatTime(ms) {
    const secs = Math.max(0, Math.ceil(ms / 1000));
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    return mm + ':' + ss;
  },
};

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
   FIGHTER — one blocky avatar with a 5-slot inventory
   ============================================================ */

let FIGHTER_ID = 0;

class Fighter {
  constructor(opts) {
    this.id = ++FIGHTER_ID;
    this.name = opts.name;
    this.isPlayer = !!opts.isPlayer;
    this.baseIndex = opts.baseIndex;
    this.team = State.bases[opts.baseIndex] ? State.bases[opts.baseIndex].team : TEAM_COLORS[0];
    this.color = this.team.hex;
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

    this.slots = new Array(CONFIG.slots).fill(null);
    this.slotIndex = 0;
    this.weapon = FISTS;

    this.atkCd = 0;
    this.pendingHit = -1;
    this.swingT = 0;
    this.hurtFlash = 0;
    this.stunT = 0;

    this.kills = 0;
    this.deaths = 0;
    this.lastDamager = null;

    this.shield = 0;
    this.invulnUntil = 0;
    this.speedUntil = 0;
    this.speedMult = 1;
    this.jumpUntil = 0;
    this.jumpMult = 1;
    this.rageUntil = 0;
    this.rageMult = 1;
    this.slowUntil = 0;
    this.dots = [];

    this.think = 0;
    this.state = 'idle';
    this.stateT = 0;
    this.wanderTo = new THREE.Vector3();
    this.strafeDir = chance(0.5) ? 1 : -1;
    this.strafeT = 0;
    this.hesitate = 0;
    this.reactionT = 0;
    this.nearTarget = null;
    this.nearDist = Infinity;
    this.wantMove = new THREE.Vector3();
    this.wantJump = false;
    this.wantAttack = false;
    this.walkAnim = 0;
    this.blockCd = 0;

    this.buildMesh();
    this.placeAtBase();
  }

  buildMesh() {
    const g = new THREE.Group();
    const skin = new THREE.MeshLambertMaterial({ color: 0xf0c090 });
    const cloth = new THREE.MeshLambertMaterial({ color: this.color });
    const dark = new THREE.MeshLambertMaterial({ color: 0x222a44 });

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
      new THREE.TorusGeometry(1.3, 0.08, 6, 24),
      new THREE.MeshBasicMaterial({ color: this.team.glow, transparent: true, opacity: 0.85 })
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
      m = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 1.6), mat);
      m.position.set(0, -0.2, 0.6);
    } else if (def.kind === 'thrown') {
      m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.3), mat);
      m.position.set(0, -0.25, 0.15);
    } else {
      m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.5, 0.3), mat);
      m.position.set(0, -0.6, 0.1);
    }
    this.weaponMount.add(m);
    this.weaponMesh = m;
    if (!silent) Sound.pickup(def.tier);
  }

  /* ---------- inventory ---------- */
  give(loot) {
    if (!this.isPlayer) {
      if (loot.type === 'weapon') {
        if (loot.def.dmg >= this.weapon.dmg) this.setWeapon(loot.def);
      } else {
        this.useItem(loot.def, loot.tier);
      }
      return;
    }

    let idx = this.slots.findIndex(s => s === null);
    if (idx === -1) idx = this.slotIndex;
    this.slots[idx] = { type: loot.type, def: loot.def, tier: loot.tier, id: loot.id };

    if (loot.type === 'weapon') {
      this.slotIndex = idx;
      this.refreshWeapon();
    }
    UI.toast(loot.def.name + '  ·  ' + TIERS[loot.tier].label, hexStr(TIERS[loot.tier].glow));
    UI.updateInv();
  }

  refreshWeapon() {
    const s = this.slots[this.slotIndex];
    if (s && s.type === 'weapon') this.setWeapon(s.def, true);
    else this.setWeapon(FISTS, true);
  }

  useSlot(i) {
    const s = this.slots[i];
    if (!s) return false;
    if (s.type === 'weapon') {
      this.slotIndex = i;
      this.refreshWeapon();
      if (this.isPlayer) Sound.uiClick();
      UI.updateInv();
      return true;
    }
    this.useItem(s.def, s.tier);
    this.slots[i] = null;
    if (this.slotIndex === i) this.refreshWeapon();
    UI.updateInv();
    return true;
  }

  clearInventory() {
    this.slots = new Array(CONFIG.slots).fill(null);
    this.slotIndex = 0;
    this.setWeapon(FISTS, true);
    if (this.isPlayer) UI.updateInv();
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
    if (this.isPlayer) UI.toast(def.name + '  ·  ' + TIERS[tier].label, hexStr(TIERS[tier].glow));
  }

  placeAtBase() {
    const b = State.bases[this.baseIndex];
    const off = 4.5;
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
    const limit = BASE_DIST + BASE_R + 6;
    if (r > limit) {
      const s = limit / r;
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
    this.hp = Math.max(25, this.hp - 25);
    this.invulnUntil = State.time + 1.2;
    this.stunT = 0.8;
    this.dots.length = 0;
    this.placeAtBase();
    World.burst(this.pos.clone().setY(1), 0x6b7ba8, 24, 10, 1.2);
  }

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
    const pellets = w.pellets || 1;
    const baseDir = this.facing.clone().setY(0).normalize();

    for (let p = 0; p < pellets; p++) {
      const dir = baseDir.clone();
      if (w.spread) {
        const a = rand(-w.spread, w.spread);
        const c = Math.cos(a), s = Math.sin(a);
        const nx = dir.x * c - dir.z * s;
        const nz = dir.x * s + dir.z * c;
        dir.set(nx, 0, nz).normalize();
      }
      const origin = this.headPos().addScaledVector(dir, 1.1);
      origin.y -= 0.75;

      const geo = w.splash
        ? new THREE.SphereGeometry(0.42, 8, 6)
        : new THREE.BoxGeometry(0.16, 0.16, 1.2);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: t.glow }));
      mesh.position.copy(origin);
      mesh.lookAt(origin.clone().add(dir));
      State.scene.add(mesh);

      const vel = dir.clone().multiplyScalar(w.projSpeed);
      if (w.fuse) vel.y += 6.5;
      if (w.arc) vel.y += 7;

      State.projectiles.push({
        mesh, owner: this, weapon: w, vel,
        life: w.fuse ? 6 : 2.6,
        fuse: w.fuse || 0,
        arc: w.arc || 0,
        hit: new Set(),
        pierce: !!w.pierce,
      });
    }
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
      if (dist > 1.5 && dir.dot(fwd) < cosArc) continue;

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
        World.burst(f.pos.clone().setY(1.5), TIERS[w.tier].glow, 16, 9, 1.2);
      }
    }

    if (!hitSomething) World.burst(this.pos.clone().setY(1.6).addScaledVector(fwd, 1.8), 0x9aa7bd, 3, 3, 0.6);
  }

  dealDamage(target, amount, w) { target.takeDamage(amount, this, w); }

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
    if (!this.isPlayer && this.pos.distanceTo(State.player.pos) > 60) return;
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
    this.clearInventory();

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
    World.burst(this.pos.clone().setY(1.6), this.team.glow, 18, 8, 1);
    Sound.spawn();
    if (this.isPlayer) UI.hideDeath();
  }

  update(dt) {
    if (this.dead) {
      this.respawnT -= dt;
      if (this.respawnT <= 0) this.respawn();
      return;
    }

    const now = State.time;
    if (this.atkCd > 0) this.atkCd -= dt;

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
      this.mesh.rotation.y = Math.atan2(this.facing.x, this.facing.z);
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
      this.materials[1].color.setHex(0x222a44);
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
   BOT BRAIN — blocks are opened by walking into them
   ============================================================ */

const BLOCK_VALUE = { big: 4.0, rng: 3.0, galaxy: 2.6, loose: 1.0 };

function nearestTarget(bot) {
  let best = null, bestD = Infinity;
  for (const f of State.fighters) {
    if (f === bot || f.dead) continue;
    if (f.inOwnDome()) continue;
    const d = f.pos.distanceTo(bot.pos);
    if (d < bestD) { bestD = d; best = f; }
  }
  return { target: best, dist: bestD };
}

function bestBlock(bot, maxDist) {
  let best = null, bestScore = Infinity;
  for (const b of State.blocks) {
    if (!b.alive) continue;
    const d = Math.hypot(b.mesh.position.x - bot.pos.x, b.mesh.position.z - bot.pos.z);
    if (d > maxDist) continue;
    const score = d / (BLOCK_VALUE[b.kind] || 1);
    if (score < bestScore) { bestScore = score; best = b; }
  }
  return best;
}

function nearestChamberPrize(bot, maxDist) {
  let best = null, bestD = maxDist;
  for (const c of State.chambers) {
    if (!c.ready) continue;
    const d = Math.hypot(c.x - bot.pos.x, c.z - bot.pos.z);
    if (d < bestD) { bestD = d; best = c; }
  }
  return best;
}

function walkable(x, z) { return groundAt(x, z) !== null; }

function walkableDir(bot, dx, dz) {
  const angles = [0, 0.28, -0.28, 0.6, -0.6, 0.95, -0.95, 1.35, -1.35, 1.8, -1.8, 2.4, -2.4];
  for (const a of angles) {
    const c = Math.cos(a), s = Math.sin(a);
    const nx = dx * c - dz * s;
    const nz = dx * s + dz * c;
    if (walkable(bot.pos.x + nx * 2.4, bot.pos.z + nz * 2.4)) return [nx, nz];
  }
  return null;
}

function steerTo(bot, tx, tz) {
  let dx = tx - bot.pos.x, dz = tz - bot.pos.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.001) return;
  dx /= d; dz /= d;

  const rBot = Math.hypot(bot.pos.x, bot.pos.z);
  const rTgt = Math.hypot(tx, tz);

  if (rBot > ARENA_R - 2 && rTgt < ARENA_R - 2) {
    dx = -bot.pos.x / (rBot || 1);
    dz = -bot.pos.z / (rBot || 1);
  } else if (rBot < ARENA_R - 2 && rTgt > ARENA_R - 2) {
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

  if (bot.stunT > 0) {
    bot.stunT -= dt;
    return;
  }

  const p = bot.personality;
  const hpFrac = bot.hp / bot.maxHp;
  const now = State.time;

  if (bot.reactionT > 0) bot.reactionT -= dt;
  if (bot.blockCd > 0) bot.blockCd -= dt;

  if (bot.think <= 0) {
    bot.think = rand(0.22, 0.5) / (0.6 + p.skill * 0.8);

    const nt = nearestTarget(bot);
    bot.nearTarget = nt.target;
    bot.nearDist = nt.dist;

    const armed = bot.weapon !== FISTS;

    if (hpFrac < 0.22 && !bot.inOwnDome() && chance(0.55 + p.caution * 0.4)) {
      setState(bot, 'flee');
    } else if (bot.inOwnDome() && hpFrac < 0.92) {
      setState(bot, 'heal');
    } else if (!armed && !bot.inOwnDome()) {
      setState(bot, 'loot');
    } else if (nt.target && nt.dist < 22 + p.aggression * 12) {
      if (chance(0.18 * (1 - p.aggression))) setState(bot, 'loot');
      else setState(bot, 'hunt');
    } else {
      setState(bot, 'loot');
    }

    if (chance(0.06)) bot.hesitate = rand(0.2, 0.7);
    if (chance(0.04)) bot.strafeDir *= -1;
    if (chance(0.02)) bot.wantJump = true;
  }

  switch (bot.state) {
    case 'flee': {
      const b = State.bases[bot.baseIndex];
      steerTo(bot, b.x, b.z);
      if (bot.inOwnDome()) setState(bot, 'heal');
      if (hpFrac > 0.75) setState(bot, 'hunt');
      break;
    }

    case 'heal': {
      const prize = bot.blockCd > 0 ? null : nearestChamberPrize(bot, 8);
      if (prize) {
        steerTo(bot, prize.x, prize.z);
      } else {
        const a = now * 0.6 + bot.id;
        bot.wantMove.set(Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4);
      }
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
        break;
      }

      if (dist > range * 0.85) {
        steerTo(bot, t.pos.x, t.pos.z);
        if (Math.abs(t.pos.y - bot.pos.y) > 2.2 && chance(0.08)) bot.wantJump = true;
      } else {
        bot.strafeT -= dt;
        if (bot.strafeT <= 0) { bot.strafeT = rand(0.7, 2.0); bot.strafeDir *= chance(0.35) ? -1 : 1; }
        const px = -dz / (dist || 1), pz = dx / (dist || 1);
        const backOff = hpFrac < 0.45 && chance(0.02) ? -0.9 : 0;
        bot.wantMove.set(px * bot.strafeDir * 0.75 + (dx / (dist || 1)) * backOff, 0,
          pz * bot.strafeDir * 0.75 + (dz / (dist || 1)) * backOff);
        const probeX = bot.pos.x + bot.wantMove.x * 1.6;
        const probeZ = bot.pos.z + bot.wantMove.z * 1.6;
        if (groundAt(probeX, probeZ) === null) steerTo(bot, t.pos.x, t.pos.z);

        if (bot.reactionT <= 0 && bot.atkCd <= 0) {
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

      if (dist > 30 && chance(0.02)) setState(bot, 'loot');
      break;
    }

    case 'loot':
    default: {
      const armed = bot.weapon !== FISTS;
      const prize = bot.blockCd > 0 ? null : nearestChamberPrize(bot, armed ? 10 : 30);
      const block = bot.blockCd > 0 ? null : bestBlock(bot, armed ? 26 : 60);

      if (prize && (!block || chance(0.5))) {
        steerTo(bot, prize.x, prize.z);
      } else if (block) {
        const bx = block.mesh.position.x, bz = block.mesh.position.z;
        steerTo(bot, bx, bz);
        bot.facing.set(bx - bot.pos.x, 0, bz - bot.pos.z).normalize();
      } else {
        if (bot.stateT <= 0 || bot.pos.distanceTo(bot.wanderTo) < 3) {
          const a = rand(0, Math.PI * 2);
          const r = rand(6, ARENA_R - 6);
          bot.wanderTo.set(Math.cos(a) * r, 0, Math.sin(a) * r);
          bot.stateT = rand(1.5, 3.5);
        }
        steerTo(bot, bot.wanderTo.x, bot.wanderTo.z);
      }

      if (bot.nearTarget && bot.nearDist < bot.weapon.range * 0.8 && bot.atkCd <= 0 && chance(0.5)) {
        bot.facing.set(bot.nearTarget.pos.x - bot.pos.x, 0, bot.nearTarget.pos.z - bot.pos.z).normalize();
        bot.wantAttack = true;
      }
      break;
    }
  }

  const d = bot.inDome();
  if (d && d !== State.bases[bot.baseIndex] && bot.state !== 'heal') {
    const cl = Math.hypot(bot.pos.x, bot.pos.z) || 1;
    bot.wantMove.set(-bot.pos.x / cl, 0, -bot.pos.z / cl);
  }
}


/* ===== 07_ui.js ===== */
'use strict';

/* ============================================================
   UI — HUD, 5-slot inventory, nameplates, feed, overlays
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
      chamberTimer: $('chamber-timer'),
      galaxyTimer: $('galaxy-timer'),
      rngTimer: $('rng-timer'),
      feed: $('feed'),
      chat: $('chat'),
      toast: $('toast'),
      plates: $('plates'),
      floats: $('floats'),
      board: $('board'),
      death: $('death'),
      deathBy: $('death-by'),
      deathTimer: $('death-timer'),
      hud: $('hud'),
      muteState: $('mute-state'),
      build: $('build'),
      killCount: $('kill-count'),
      inv: $('inv'),
    };
    this.el.build.textContent = 'v' + BUILD.version + ' · ' + BUILD.stamp;

    for (const f of State.fighters) this.makePlate(f);
    this.buildInvBar();
    this.updateInv();
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

  buildInvBar() {
    this.el.inv.innerHTML = '';
    for (let i = 0; i < CONFIG.slots; i++) {
      const d = document.createElement('div');
      d.className = 'slot';
      d.innerHTML = '<span class="num">' + (i + 1) + '</span><span class="nm"></span><span class="tg"></span>';
      this.el.inv.appendChild(d);
    }
  },

  updateInv() {
    const p = State.player;
    if (!p || !this.el.inv) return;
    const cells = this.el.inv.children;
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const s = p.slots[i];
      const nm = cell.querySelector('.nm');
      const tg = cell.querySelector('.tg');
      cell.classList.toggle('sel', i === p.slotIndex);
      cell.classList.toggle('filled', !!s);
      if (s) {
        const t = TIERS[s.tier];
        nm.textContent = s.def.name;
        tg.textContent = s.type === 'item' ? 'USE' : t.label;
        cell.style.setProperty('--tier', hexStr(t.glow));
      } else {
        nm.textContent = '—';
        tg.textContent = '';
        cell.style.setProperty('--tier', 'rgba(120,170,255,0.25)');
      }
    }
  },

  floatText(worldPos, text, color) {
    if (this.floaters.length > 70) return;
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
    this.el.weaponTier.style.color = hexStr(t.glow);
    this.el.weaponTier.style.borderColor = hexStr(t.glow);
    this.el.playerName.textContent = p.name + '  ·  ' + p.team.name;
    this.el.playerName.style.color = hexStr(p.team.glow);
    this.el.killCount.textContent = p.kills;

    this.el.aliveCount.textContent = State.fighters.filter(f => !f.dead).length;

    const bigLive = State.blocks.some(b => b.kind === 'big');
    this.el.bigTimer.textContent = bigLive ? 'LIVE' : World.formatTime(Math.max(0, State.timers.big));
    this.el.bigTimer.style.color = bigLive ? '#35e0ff' : '#8ea0c8';

    const galLive = State.blocks.some(b => b.kind === 'galaxy');
    this.el.galaxyTimer.textContent = galLive ? 'LIVE' : World.formatTime(Math.max(0, State.timers.galaxy));
    this.el.galaxyTimer.style.color = galLive ? '#c9a6ff' : '#8ea0c8';

    const rngLive = State.blocks.some(b => b.kind === 'rng');
    this.el.rngTimer.textContent = rngLive ? 'LIVE' : World.formatTime(Math.max(0, State.timers.rng));
    this.el.rngTimer.style.color = rngLive ? '#4dff8f' : '#8ea0c8';

    const own = State.chambers[p.baseIndex];
    if (own) {
      this.el.chamberTimer.textContent = own.ready ? 'READY' : World.formatTime(own.timer);
      this.el.chamberTimer.style.color = own.ready ? hexStr(TIERS[own.tier].glow) : '#8ea0c8';
    }

    if (p.dead) this.el.deathTimer.textContent = Math.ceil(Math.max(0, p.respawnT)) + 's';

    if (this.toastT > 0) {
      this.toastT -= dt;
      const a = clamp(this.toastT / 0.5, 0, 1);
      this.el.toast.style.opacity = String(a);
      this.el.toast.style.transform = 'translate(-50%, ' + (1 - a) * -12 + 'px) scale(' + (0.96 + a * 0.04) + ')';
    }

    for (const f of State.fighters) {
      const plate = this.plates.get(f);
      if (!plate) continue;
      if (f.dead) { plate.root.style.display = 'none'; continue; }
      const head = f.headPos();
      const dist = head.distanceTo(State.camera.position);
      const proj = this.project(head);
      if (!proj.visible || dist > 160) { plate.root.style.display = 'none'; continue; }
      plate.root.style.display = 'block';
      plate.root.style.transform = 'translate(-50%,-100%) translate(' + proj.x + 'px,' + proj.y + 'px)';
      plate.root.style.opacity = String(clamp(1.5 - dist / 130, 0.25, 1));
      plate.bar.style.width = clamp(f.hp / f.maxHp, 0, 1) * 100 + '%';
      plate.bar.style.background = f.isPlayer ? '#8ef0ff'
        : f.hp / f.maxHp > 0.5 ? '#5ef08a' : f.hp / f.maxHp > 0.25 ? '#ffb648' : '#ff5d5d';
      plate.name.style.color = hexStr(f.team.glow);
    }

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
      html += '<div' + cls + '><span class="dot" style="background:' + hexStr(f.team.hex) + '"></span>' +
        '<span class="bn' + dead + '">' + escapeHtml(f.name) + '</span>' +
        '<span class="bk">' + f.kills + '</span><span class="bd">' + f.deaths + '</span></div>';
    }
    this.el.board.innerHTML = '<div class="bhead"><span class="dot"></span><span class="bn">PLAYER</span><span class="bk">K</span><span class="bd">D</span></div>' + html;
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
  pitch: -0.3,
  camDist: 20,
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
    State.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1400);
    this.camera = State.camera;
    this.camera.position.set(0, 26, 60);

    World.init(this.renderer, State.scene);
    this.spawnLobby();
    UI.init();
    this.bindInput();

    World.spawnBlock('big', 0, 0, { big: true, kind: 'big' });
    World.spawnBlock('galaxy', 30, -22, { kind: 'galaxy' });
    World.spawnBlock('rng', -28, 26, { kind: 'rng' });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.4;
      World.spawnBlock(rollTier(), Math.cos(a) * 34, Math.sin(a) * 34, { kind: 'loose' });
    }

    this.lastT = performance.now();
    requestAnimationFrame(t => this.loop(t));
  },

  spawnLobby() {
    const used = new Set();
    const count = CONFIG.botCount + 1;
    for (let i = 0; i < count; i++) {
      const isPlayer = i === 0;
      const f = new Fighter({ name: randomGamertag(used), isPlayer, baseIndex: i });
      State.fighters.push(f);
      if (isPlayer) State.player = f;
    }
  },

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
      const slotKey = /^Digit([1-5])$/.exec(e.code);
      if (slotKey && State.started && State.player) {
        State.player.useSlot(parseInt(slotKey[1], 10) - 1);
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
      this.pitch = clamp(this.pitch - e.movementY * 0.0022, -0.95, 0.5);
    });

    window.addEventListener('wheel', e => {
      this.camDist = clamp(this.camDist + Math.sign(e.deltaY) * 2, 10, 45);
    }, { passive: true });

    document.getElementById('play-btn').addEventListener('click', () => {
      Sound.init();
      Sound.resume();
      Sound.uiClick();
      document.getElementById('start').style.display = 'none';
      document.getElementById('hud').style.display = 'block';
      State.started = true;
      canvas.requestPointerLock();
      UI.toast('Walk into blocks to open them', '#8ef0ff');
      UI.feed('Big void block is live in the centre', '#35e0ff');
      UI.updateInv();
    });
  },

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

  updateCamera(dt) {
    const p = State.player;
    const target = p.pos.clone().add(new THREE.Vector3(0, 3.2, 0));
    if (p.dead) target.y += 2;

    const cp = Math.cos(this.pitch);
    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * cp * this.camDist,
      -Math.sin(this.pitch) * this.camDist + 5,
      Math.cos(this.yaw) * cp * this.camDist
    );
    const desired = target.clone().add(offset);
    desired.y = Math.max(desired.y, 2);

    const k = 1 - Math.exp(-dt * 8);
    this.camera.position.lerp(desired, k);
    this.camera.lookAt(target);
  },

  boom(pr, pos) {
    const w = pr.weapon;
    Sound.boom();
    World.burst(pos, TIERS[w.tier].glow, 34, 14, 1.5);
    World.burst(pos, 0xffb066, 16, 10, 1.1);
    const radius = w.splash || 3;
    for (const f of State.fighters) {
      if (f === pr.owner || f.dead) continue;
      const d = f.pos.clone().setY(f.pos.y + 1.4).distanceTo(pos);
      if (d < radius) {
        const falloff = 1 - (d / radius) * 0.55;
        f.takeDamage(pr.owner.outgoingDamage(w) * falloff, pr.owner, w);
      }
    }
  },

  updateProjectiles(dt) {
    for (let i = State.projectiles.length - 1; i >= 0; i--) {
      const pr = State.projectiles[i];
      pr.life -= dt;

      if (pr.fuse) {
        pr.fuse -= dt;
        if (pr.fuse <= 0) {
          this.boom(pr, pr.mesh.position.clone());
          State.scene.remove(pr.mesh);
          State.projectiles.splice(i, 1);
          continue;
        }
      }

      pr.vel.y += CONFIG.gravity * (0.12 + (pr.arc || 0)) * dt;
      pr.mesh.position.addScaledVector(pr.vel, dt);
      pr.mesh.lookAt(pr.mesh.position.clone().add(pr.vel));

      let hitTarget = null;
      for (const f of State.fighters) {
        if (f === pr.owner || f.dead) continue;
        if (pr.hit.has(f)) continue;
        const d = f.pos.clone().setY(f.pos.y + 1.6);
        if (d.distanceTo(pr.mesh.position) < 1.7) { hitTarget = f; break; }
      }

      const gY = groundAt(pr.mesh.position.x, pr.mesh.position.z);
      const groundHit = gY !== null && pr.mesh.position.y <= gY + 0.2;

      if (hitTarget) {
        const pos = pr.mesh.position.clone();
        if (pr.weapon.splash) {
          this.boom(pr, pos);
          State.scene.remove(pr.mesh);
          State.projectiles.splice(i, 1);
          continue;
        }
        hitTarget.takeDamage(pr.owner.outgoingDamage(pr.weapon), pr.owner, pr.weapon);
        World.burst(pos, TIERS[pr.weapon.tier].glow, 10, 7, 0.9);
        pr.hit.add(hitTarget);
        if (!pr.pierce) {
          State.scene.remove(pr.mesh);
          State.projectiles.splice(i, 1);
          continue;
        }
      } else if (groundHit) {
        if (pr.weapon.splash && !pr.fuse) {
          this.boom(pr, pr.mesh.position.clone());
          State.scene.remove(pr.mesh);
          State.projectiles.splice(i, 1);
          continue;
        }
        World.burst(pr.mesh.position.clone(), TIERS[pr.weapon.tier].glow, 6, 5, 0.7);
        State.scene.remove(pr.mesh);
        State.projectiles.splice(i, 1);
        continue;
      }

      if (pr.life <= 0) {
        State.scene.remove(pr.mesh);
        State.projectiles.splice(i, 1);
      }
    }
  },

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

  loop(t) {
    requestAnimationFrame(tt => this.loop(tt));
    let dt = (t - this.lastT) / 1000;
    this.lastT = t;
    if (!isFinite(dt) || dt <= 0) return;
    dt = Math.min(dt, 0.05);

    if (!State.started) {
      this.yaw += dt * 0.1;
      this.camera.position.set(Math.sin(this.yaw) * 105, 44, Math.cos(this.yaw) * 105);
      this.camera.lookAt(0, 4, 0);
      World.update(dt * 0.5);
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
  return { time: State.time, blocks: State.blocks.length };
};

window.__LB = { State, World, Game, CONFIG, WEAPONS, ITEMS, TIERS, Sound, randomGamertag, Fighter };

window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});


})();