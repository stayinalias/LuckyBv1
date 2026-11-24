'use strict';

/* ============================================================
   LUCKY BLOCKS BATTLEGROUNDS v3
   heroes, powers, guns, blocks, timers
   ============================================================ */

const BUILD = { version: '4.0.0', stamp: '2026-11-24 12:00 IST' };

const CONFIG = {
  botCount: 7,
  slots: 5,

  bigWaveMs: 20 * 60 * 1000,
  galaxyBlockMs: 7 * 60 * 1000,
  rngBlockMs: 5 * 60 * 1000,
  superBlockMs: 8 * 60 * 1000,     // a fresh Super block if nobody has rolled one
  chamberMs: 12 * 60 * 1000,
  looseBlockMs: 6000,
  maxLooseBlocks: 16,

  /* camera + aim zoom
     aimBlend goes 0 -> 1 while holding the right button,
     0 -> focusBlend while holding the left button with a gun out */
  baseFOV: 74,
  adsFOV: 52,
  focusFOV: 64,
  focusBlend: 0.6,
  aimInSpeed: 14,
  aimOutSpeed: 9,
  adsSpeedMult: 0.62,
  focusSpeedMult: 0.85,
  adsCamDist: 17,
  focusCamDist: 22,
  turnSpeed: 0.0024,

  /* graphics: keeps laptops smooth without looking flat */
  maxPixelRatio: 1.6,
  minRenderScale: 0.72,
  adaptiveQuality: true,

  /* weapon feel */
  fireRateMult: 1.0,
  reloadSpeedMult: 1.0,
  recoilRecovery: 1.8,
  muzzleFlashDur: 0.06,
  weaponSway: 0.045,
  switchTime: 0.32,

  gravity: -26,
  walkSpeed: 14.5,
  jumpSpeed: 13.5,
  playerHP: 100,
  respawnMs: 3200,
  domeHealPerSec: 22,
  voidY: -40,
  touchRadius: 1.9,

  effectDurMs: 170000,             // every buff lasts 2:50
  heroHpMin: 500,
  heroHpMax: 999,
};

/* ---- map size: this is the third enlargement, ~2.2x the original ----
   The centre is an octagon (landmark ring, ramps, floating pads) and a
   wide ring road circles it, with bridges out to every team base.
   Everything else is laid out relative to these numbers, so the whole
   map grows together.                                                    */
const ARENA_R = 190;                   // octagon circumradius (was 128)
const INNER_R = 64;                    // landmark ring around the middle
const RING_R = 116;                    // stone ring road radius
const BASE_DIST = 252;                 // centres of the team platforms (was 172)
const BASE_R = 21;
const MAP_SCALE = ARENA_R / 128;       // platforms scale with the deck
const BRIDGE_HALF = 8.5;
const DOME_R = 20.5;
const FIGHTER_R = 0.95;
const BLOCK_SIZE = 3.4;
const BIG_SIZE = 9.5;
const CHAMBER_R = 3.6;

/* raised platforms scattered over the map: flat tops the walkers can use */
const PLATFORMS = [];
const RAMP_DEFS = [];

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

/* ---------------- tiers ---------------- */
const TIERS = {
  regular: { key: 'regular', label: 'REGULAR', name: 'Regular', color: 0xf5d43c, emissive: 0xb89400, glow: 0xffe57a, skin: 'question', chance: 0.62 },
  fire:    { key: 'fire', label: 'EPIC', name: 'Fire', color: 0xff5a1f, emissive: 0x8f2400, glow: 0xffa64d, skin: 'question', chance: 0.23 },
  gold:    { key: 'gold', label: 'LEGENDARY', name: 'Shiny Gold', color: 0xffc21e, emissive: 0x9a6b00, glow: 0xfff0a0, skin: 'question', chance: 0.11 },
  galaxy:  { key: 'galaxy', label: 'MYTHIC', name: 'Galaxy', color: 0x8b5cf6, emissive: 0x3b1d8f, glow: 0xc9a6ff, skin: 'galaxy', chance: 0.04 },
  big:     { key: 'big', label: '???', name: 'Big Block', color: 0x1b2338, emissive: 0x0e5f7a, glow: 0x35e0ff, skin: 'void', chance: 0 },
  rng:     { key: 'rng', label: 'RNG', name: 'RNG Block', color: 0x123d22, emissive: 0x0d5c2a, glow: 0x4dff8f, skin: 'matrix', chance: 0 },
  super:   { key: 'super', label: 'SUPER', name: 'Super', color: 0x2b0b3a, emissive: 0x7a1bd6, glow: 0xff5ce1, skin: 'super', chance: 0 },
};
const TIER_ORDER = ['regular', 'fire', 'gold', 'galaxy'];

/* Super is 0.5% of every RNG roll */
const RNG_CHANCES = [['regular', 65], ['fire', 55], ['gold', 35], ['galaxy', 15], ['big', 5], ['super', 0.5]];
const CHAMBER_CHANCES = [['regular', 50], ['fire', 20], ['gold', 10], ['galaxy', 5], ['big', 3], ['rng', 9]];

/* ---------------- heroes ----------------
   suit: main colour, accent: trim, hair, skin, cape, flight, guard pose
   abilities: three each, drawn from beam / punch / barrage / yell / dash / slam / throw / shield
*/
const HEROES = {
  homelander: {
    name: 'Homelander', color: 0xff3b30, suit: 0x16327f, accent: 0xd42a2a, trim: 0xf2d06b,
    cape: true, flight: true, hair: 'blond', guard: false, emblem: 'A',
    abilities: [
      { type: 'beam', name: 'Laser Vision', dmg: 62, cd: 3.2, color: 0xff2a2a, icon: 'LSR' },
      { type: 'punch', name: 'Super Punch', dmg: 96, cd: 2.2, color: 0xffd54d, icon: 'PCH' },
      { type: 'yell', name: 'Super Yell', dmg: 46, cd: 5.0, color: 0xff8a80, icon: 'YEL' },
    ],
  },
  blacknoir: {
    name: 'Black Noir', color: 0x9aa7bd, suit: 0x14161c, accent: 0x2b2f3a, trim: 0x3a3f4d,
    cape: false, flight: false, hair: 'none', guard: false, emblem: null, mask: true,
    abilities: [
      { type: 'dash', name: 'Silent Step', dmg: 58, cd: 3.6, color: 0x9aa7bd, icon: 'DSH' },
      { type: 'punch', name: 'Blade Strike', dmg: 88, cd: 2.4, color: 0xcfd8e6, icon: 'PCH' },
      { type: 'slam', name: 'Smoke Slam', dmg: 70, cd: 5.0, color: 0x6b7ba8, icon: 'SLM' },
    ],
  },
  soldierboy: {
    name: 'Soldier Boy', color: 0x3ddc84, suit: 0x2f6b3f, accent: 0x1f4a2b, trim: 0xd8c48a,
    cape: false, flight: false, hair: 'brown', guard: true, shield: true, emblem: '★',
    abilities: [
      { type: 'punch', name: 'Shield Bash', dmg: 92, cd: 2.3, color: 0x9bf0b5, icon: 'PCH' },
      { type: 'yell', name: 'War Cry', dmg: 44, cd: 4.6, color: 0xffe57a, icon: 'YEL' },
      { type: 'slam', name: 'Ground Breaker', dmg: 74, cd: 5.2, color: 0x8ef0ff, icon: 'SLM' },
    ],
  },
  cap: {
    name: 'Captain America', color: 0x4f8cff, suit: 0x1f4fa8, accent: 0xd42a2a, trim: 0xf0f4ff,
    cape: false, flight: false, hair: 'blond', guard: true, shield: true, emblem: '★',
    abilities: [
      { type: 'throw', name: 'Shield Throw', dmg: 66, cd: 3.0, color: 0x8ecbff, icon: 'THR' },
      { type: 'punch', name: 'Super Soldier Punch', dmg: 86, cd: 2.4, color: 0xffd54d, icon: 'PCH' },
      { type: 'slam', name: 'Shield Slam', dmg: 68, cd: 5.0, color: 0x8ef0ff, icon: 'SLM' },
    ],
  },
  superman: {
    name: 'Superman', color: 0x3d8bff, suit: 0x1b3f9c, accent: 0xd42a2a, trim: 0xffd23d,
    cape: true, flight: true, hair: 'black', guard: false, emblem: 'S',
    abilities: [
      { type: 'beam', name: 'Heat Vision', dmg: 60, cd: 3.0, color: 0xff3b30, icon: 'LSR' },
      { type: 'punch', name: 'Super Punch', dmg: 98, cd: 2.2, color: 0xffd54d, icon: 'PCH' },
      { type: 'yell', name: 'Freeze Breath', dmg: 40, cd: 4.8, color: 0x9bf0ff, icon: 'BRE' },
    ],
  },
  sentry: {
    name: 'Sentry', color: 0xffd23d, suit: 0xd9a520, accent: 0x8a6a00, trim: 0xfff3c4,
    cape: true, flight: true, hair: 'blond', guard: false, emblem: 'S',
    abilities: [
      { type: 'beam', name: 'Solar Beam', dmg: 64, cd: 3.2, color: 0xffe57a, icon: 'LSR' },
      { type: 'punch', name: 'Void Punch', dmg: 94, cd: 2.3, color: 0xc9a6ff, icon: 'PCH' },
      { type: 'yell', name: 'Scream', dmg: 48, cd: 5.0, color: 0x8b5cf6, icon: 'YEL' },
    ],
  },
  wintersoldier: {
    name: 'Winter Soldier', color: 0x8ea0c8, suit: 0x23262e, accent: 0x8a1c1c, trim: 0xb9c3d4,
    cape: false, flight: false, hair: 'brown', guard: false, emblem: '★', metalArm: true,
    abilities: [
      { type: 'punch', name: 'Metal Fist', dmg: 90, cd: 2.3, color: 0xb9c3d4, icon: 'PCH' },
      { type: 'barrage', name: 'Rifle Burst', dmg: 20, cd: 4.0, color: 0xffd54d, icon: 'BRG' },
      { type: 'dash', name: 'Tactical Dash', dmg: 52, cd: 3.8, color: 0x8ea0c8, icon: 'DSH' },
    ],
  },
  flash: {
    name: 'Flash', color: 0xff5a1f, suit: 0xc21b1b, accent: 0xffd23d, trim: 0xffe57a,
    cape: false, flight: false, hair: 'brown', guard: false, emblem: '⚡', speedster: true,
    abilities: [
      { type: 'dash', name: 'Speed Blitz', dmg: 66, cd: 2.8, color: 0xffe57a, icon: 'DSH' },
      { type: 'punch', name: 'Infinite Mass Punch', dmg: 100, cd: 3.0, color: 0xffd54d, icon: 'PCH' },
      { type: 'slam', name: 'Vortex', dmg: 72, cd: 5.0, color: 0xff8a80, icon: 'SLM' },
    ],
  },
  wallywest: {
    name: 'Wally West', color: 0xff7a2b, suit: 0xb31b1b, accent: 0xffd23d, trim: 0xfff0a0,
    cape: false, flight: false, hair: 'red', guard: false, emblem: '⚡', speedster: true,
    abilities: [
      { type: 'dash', name: 'Lightning Run', dmg: 64, cd: 2.9, color: 0xffe57a, icon: 'DSH' },
      { type: 'punch', name: 'Kinetic Punch', dmg: 96, cd: 2.8, color: 0xffd54d, icon: 'PCH' },
      { type: 'slam', name: 'Tornado', dmg: 70, cd: 5.0, color: 0xffa64d, icon: 'SLM' },
    ],
  },
  goku: {
    name: 'Goku', color: 0xff9a3c, suit: 0xff7a1f, accent: 0x1f4fa8, trim: 0xffd23d,
    cape: false, flight: true, hair: 'spiky', guard: false, emblem: '悟',
    abilities: [
      { type: 'beam', name: 'Ki Blast', dmg: 58, cd: 2.8, color: 0x8ef0ff, icon: 'LSR' },
      { type: 'beam', name: 'Kamehameha', dmg: 90, cd: 5.5, color: 0x35e0ff, icon: 'KHH' },
      { type: 'punch', name: 'Instant Strike', dmg: 88, cd: 2.2, color: 0xffd54d, icon: 'PCH' },
    ],
  },
  saitama: {
    name: 'Saitama', color: 0xffd23d, suit: 0xffd23d, accent: 0xd42a2a, trim: 0xf0c090,
    cape: true, flight: false, hair: 'bald', guard: false, emblem: null,
    abilities: [
      { type: 'barrage', name: 'Consecutive Punches', dmg: 19, cd: 4.0, color: 0xffe57a, icon: 'BRG' },
      { type: 'punch', name: 'Normal Punch', dmg: 84, cd: 1.8, color: 0xffd54d, icon: 'PCH' },
      { type: 'punch', name: 'Serious Punch', dmg: 180, cd: 9.0, color: 0xff5a1f, icon: 'SRP' },
    ],
  },
  vegeta: {
    name: 'Vegeta', color: 0x6d7bff, suit: 0x1f2a6b, accent: 0xf0f4ff, trim: 0xffd23d,
    cape: false, flight: true, hair: 'spiky', guard: false, emblem: 'ベ',
    abilities: [
      { type: 'beam', name: 'Galick Gun', dmg: 86, cd: 5.0, color: 0xa06bff, icon: 'LSR' },
      { type: 'barrage', name: 'Energy Barrage', dmg: 18, cd: 4.2, color: 0x8ef0ff, icon: 'BRG' },
      { type: 'punch', name: 'Royal Strike', dmg: 90, cd: 2.3, color: 0xffd54d, icon: 'PCH' },
    ],
  },
  broly: {
    name: 'Broly', color: 0x4ddc7a, suit: 0x2b6b3f, accent: 0xd8c48a, trim: 0x9bf0b5,
    cape: false, flight: true, hair: 'spiky', guard: false, emblem: null,
    abilities: [
      { type: 'beam', name: 'Omega Blaster', dmg: 96, cd: 5.5, color: 0x4dff8f, icon: 'LSR' },
      { type: 'barrage', name: 'Gigantic Rage', dmg: 21, cd: 4.4, color: 0x9bf0b5, icon: 'BRG' },
      { type: 'slam', name: 'Gigantic Slam', dmg: 82, cd: 5.0, color: 0x4dff8f, icon: 'SLM' },
    ],
  },
  omniman: {
    name: 'Omni-Man', color: 0xff4d4d, suit: 0xd42a2a, accent: 0xf0f4ff, trim: 0x9aa7bd,
    cape: true, flight: true, hair: 'black', guard: false, emblem: 'O', stache: true,
    abilities: [
      { type: 'punch', name: 'Viltrumite Punch', dmg: 97, cd: 2.2, color: 0xffd54d, icon: 'PCH' },
      { type: 'dash', name: 'Flight Charge', dmg: 60, cd: 3.4, color: 0xff8a80, icon: 'DSH' },
      { type: 'yell', name: 'Viltrumite Roar', dmg: 44, cd: 4.8, color: 0xff4d4d, icon: 'YEL' },
    ],
  },
  conquest: {
    name: 'Conquest', color: 0xcfd8e6, suit: 0x9aa7bd, accent: 0x8a1c1c, trim: 0xe8eefc,
    cape: true, flight: true, hair: 'white', guard: false, emblem: 'C',
    abilities: [
      { type: 'punch', name: 'Brutal Punch', dmg: 95, cd: 2.3, color: 0xffd54d, icon: 'PCH' },
      { type: 'slam', name: 'Crater Slam', dmg: 80, cd: 5.0, color: 0xcfd8e6, icon: 'SLM' },
      { type: 'yell', name: 'War Roar', dmg: 42, cd: 4.8, color: 0xff9a8a, icon: 'YEL' },
    ],
  },
  invincible: {
    name: 'Invincible', color: 0xffd23d, suit: 0x1f4fa8, accent: 0xffd23d, trim: 0xf0f4ff,
    cape: false, flight: true, hair: 'brown', guard: false, emblem: 'i',
    abilities: [
      { type: 'punch', name: 'Viltrumite Uppercut', dmg: 88, cd: 2.4, color: 0xffd54d, icon: 'PCH' },
      { type: 'dash', name: 'Tackle', dmg: 56, cd: 3.6, color: 0xffd23d, icon: 'DSH' },
      { type: 'yell', name: 'Battle Cry', dmg: 40, cd: 4.6, color: 0xffe57a, icon: 'YEL' },
    ],
  },
  greenlantern: {
    name: 'Green Lantern', color: 0x4dff8f, suit: 0x14361f, accent: 0x4dff8f, trim: 0x9bf0b5,
    cape: false, flight: true, hair: 'brown', guard: false, emblem: '⌾',
    abilities: [
      { type: 'beam', name: 'Ring Blast', dmg: 58, cd: 3.0, color: 0x4dff8f, icon: 'LSR' },
      { type: 'throw', name: 'Construct Hammer', dmg: 70, cd: 3.4, color: 0x9bf0b5, icon: 'THR' },
      { type: 'shield', name: 'Construct Shield', dmg: 0, cd: 8.0, color: 0x4dff8f, icon: 'SHD' },
    ],
  },
};
const HERO_KEYS = Object.keys(HEROES);

/* short role word used on the roster and the stage label */
function heroRole(h) {
  if (h.flight) return 'FLIGHT';
  if (h.speedster) return 'SPEED';
  if (h.shield) return 'SHIELD';
  if (h.guard) return 'GUARD';
  return 'BRAWLER';
}

/* Stats shown on "Choose Your Character". They are derived from the
   hero's real kit, so the bars always tell the truth.               */
function heroStats(key) {
  const h = HEROES[key];
  const ab = h.abilities || [];
  const types = ab.map(a => a.type);
  const maxDmg = Math.max.apply(null, ab.map(a => a.dmg || 0).concat([0]));

  let power = 34 + Math.round(maxDmg * 0.26);
  if (types.includes('beam')) power += 8;
  if (types.includes('slam')) power += 5;
  if (h.metalArm) power += 6;
  if (h.speedster) power += 4;

  let range = 26;
  if (types.includes('beam')) range += 46;
  if (types.includes('throw')) range += 26;
  if (types.includes('barrage')) range += 18;
  if (types.includes('yell')) range += 12;
  if (types.includes('dash')) range += 8;
  if (types.includes('punch')) range += 2;
  if (types.includes('slam')) range += 4;

  let armor = 40;
  if (h.shield) armor += 26;
  if (h.flight) armor += 14;
  if (h.guard) armor += 8;

  let mobility = 48;
  if (h.flight) mobility += 34;
  if (h.speedster) mobility += 30;
  if (types.includes('dash')) mobility += 12;

  return {
    power: clamp(Math.round(power), 12, 100),
    range: clamp(Math.round(range), 12, 100),
    armor: clamp(Math.round(armor), 12, 100),
    mobility: clamp(Math.round(mobility), 12, 100),
  };
}

/* ---------------- weapons ---------------- */
const FISTS = {
  id: 'fists', name: 'Bare Hands', tier: 'regular', kind: 'melee', model: 'fist',
  dmg: 6, range: 2.6, cd: 0.45, kb: 4,
};

const WEAPONS = {
  /* regular */
  reliable_blade: { name: 'Old Reliable Blade', tier: 'regular', kind: 'melee', model: 'blade', dmg: 12, range: 3.6, cd: 0.55, kb: 6 },
  rusty_shiv:     { name: 'Rusty Shiv',         tier: 'regular', kind: 'melee', model: 'dagger', dmg: 9,  range: 2.9, cd: 0.34, kb: 3 },
  slugger:        { name: 'Wooden Slugger',     tier: 'regular', kind: 'melee', model: 'bat', dmg: 14, range: 3.7, cd: 0.82, kb: 9 },
  frying_pan:     { name: 'Frying Pan',         tier: 'regular', kind: 'melee', model: 'pan', dmg: 11, range: 3.2, cd: 0.62, kb: 13 },
  slingshot:      { name: 'Sling Shot',         tier: 'regular', kind: 'ranged', model: 'slingshot', dmg: 9, range: 46, cd: 0.8, kb: 3, projSpeed: 42, mag: 1, reload: 1.2 },
  pistol:         { name: 'Sidearm Pistol',     tier: 'regular', kind: 'ranged', model: 'pistol', dmg: 11, range: 50, cd: 0.42, kb: 4, projSpeed: 62, mag: 12, reload: 1.4 },

  /* fire */
  emberbrand:   { name: 'Emberbrand',    tier: 'fire', kind: 'melee', model: 'blade', dmg: 19, range: 3.8, cd: 0.55, kb: 7, effect: 'burn' },
  chainlink:    { name: 'Chainlink Saber', tier: 'fire', kind: 'melee', model: 'blade', dmg: 18, range: 4.0, cd: 0.5, kb: 6 },
  frost_shiv:   { name: 'Frost Shiv',    tier: 'fire', kind: 'melee', model: 'dagger', dmg: 15, range: 3.1, cd: 0.4, kb: 4, effect: 'slow' },
  steel_cleaver:{ name: 'Steel Cleaver', tier: 'fire', kind: 'melee', model: 'axe', dmg: 22, range: 3.7, cd: 0.86, kb: 10 },
  boom_tube:    { name: 'Boom Tube',     tier: 'fire', kind: 'ranged', model: 'launcher', dmg: 26, range: 55, cd: 1.4, kb: 8, projSpeed: 34, splash: 5.0, mag: 1, reload: 2.0 },
  smg:          { name: 'Buzz SMG',      tier: 'fire', kind: 'ranged', model: 'smg', dmg: 6,  range: 45, cd: 0.11, kb: 2, projSpeed: 66, mag: 30, reload: 1.8 },
  shotgun:      { name: 'Scatter Shotgun', tier: 'fire', kind: 'ranged', model: 'shotgun', dmg: 9, range: 26, cd: 0.95, kb: 7, projSpeed: 58, pellets: 5, spread: 0.13, mag: 6, reload: 2.2 },
  dynamite:     { name: 'Stick Dynamite', tier: 'fire', kind: 'thrown', model: 'dynamite', dmg: 34, range: 26, cd: 1.6, kb: 14, projSpeed: 24, splash: 6.5, fuse: 1.5, mag: 3, reload: 2.4 },

  /* gold */
  luminar:      { name: 'Luminar',      tier: 'gold', kind: 'melee', model: 'blade', dmg: 25, range: 4.1, cd: 0.42, kb: 7 },
  gloomheart:   { name: 'Gloomheart',   tier: 'gold', kind: 'melee', model: 'blade', dmg: 24, range: 3.9, cd: 0.6, kb: 8, effect: 'lifesteal', steal: 0.35 },
  toxinfang:    { name: 'Toxinfang',    tier: 'gold', kind: 'melee', model: 'dagger', dmg: 21, range: 3.7, cd: 0.5, kb: 5, effect: 'poison' },
  gustforce:    { name: 'Gustforce',    tier: 'gold', kind: 'ranged', model: 'bow', dmg: 22, range: 62, cd: 0.95, kb: 16, projSpeed: 48, mag: 1, reload: 1.0 },
  phantomstride:{ name: 'Phantomstride',tier: 'gold', kind: 'melee', model: 'blade', dmg: 27, range: 3.5, cd: 0.45, kb: 6, effect: 'backstab' },
  rifle:        { name: 'Rattle Rifle', tier: 'gold', kind: 'ranged', model: 'rifle', dmg: 12, range: 70, cd: 0.14, kb: 3, projSpeed: 78, mag: 30, reload: 2.0 },
  grenade_launcher: { name: 'Lobber Launcher', tier: 'gold', kind: 'ranged', model: 'launcher', dmg: 30, range: 60, cd: 1.15, kb: 12, projSpeed: 40, splash: 6.0, arc: 1.0, mag: 4, reload: 2.4 },

  /* galaxy */
  starcaller:   { name: 'Starcaller',   tier: 'galaxy', kind: 'melee', model: 'hammer', dmg: 31, range: 4.3, cd: 0.6, kb: 9, aoe: 4.5 },
  voidreaver:   { name: 'Voidreaver',   tier: 'galaxy', kind: 'melee', model: 'scythe', dmg: 34, range: 4.2, cd: 0.52, kb: 9, effect: 'lifesteal', steal: 0.5 },
  nova_lance:   { name: 'Nova Lance',   tier: 'galaxy', kind: 'ranged', model: 'rifle', dmg: 30, range: 70, cd: 0.8, kb: 8, projSpeed: 55, pierce: true, mag: 8, reload: 2.2 },
  graviton:     { name: 'Graviton Hammer', tier: 'galaxy', kind: 'melee', model: 'hammer', dmg: 38, range: 4.5, cd: 1.05, kb: 18, aoe: 5.5 },
  periastron:   { name: 'Periastron Sword', tier: 'galaxy', kind: 'melee', model: 'blade', dmg: 42, range: 4.6, cd: 0.5, kb: 13, aoe: 3.6, effect: 'burn' },
  sniper:       { name: 'Longshot Rifle', tier: 'galaxy', kind: 'ranged', model: 'sniper', dmg: 46, range: 90, cd: 1.1, kb: 10, projSpeed: 130, mag: 5, reload: 2.8 },
  rocket_launcher: { name: 'Skyfall Launcher', tier: 'galaxy', kind: 'ranged', model: 'launcher', dmg: 40, range: 75, cd: 1.25, kb: 16, projSpeed: 46, splash: 7.5, mag: 3, reload: 2.6 },

  /* big */
  genesis:      { name: 'Genesis Blade',     tier: 'big', kind: 'melee', model: 'blade', dmg: 46, range: 4.7, cd: 0.45, kb: 12, effect: 'lifesteal', steal: 0.3, aoe: 3.6 },
  singularity:  { name: 'Singularity Cannon', tier: 'big', kind: 'ranged', model: 'launcher', dmg: 52, range: 85, cd: 1.2, kb: 20, projSpeed: 44, splash: 8.0, mag: 2, reload: 3.0 },
  timebreak:    { name: 'Timebreak Scythe',  tier: 'big', kind: 'melee', model: 'scythe', dmg: 40, range: 5.3, cd: 0.55, kb: 10, aoe: 6.2 },
  minigun:      { name: 'Havoc Minigun',     tier: 'big', kind: 'ranged', model: 'minigun', dmg: 13, range: 60, cd: 0.075, kb: 2, projSpeed: 88, mag: 120, reload: 3.2 },
};

const ITEMS = {
  med_kit:      { name: 'Med Kit',        tier: 'regular', use: 'heal', amount: 45 },
  med_kit_big:  { name: 'Field Kit',      tier: 'fire',    use: 'heal', amount: 75 },
  sprint_spring:{ name: 'Sprint Spring',  tier: 'regular', use: 'speed', mult: 1.55 },
  moon_spring:  { name: 'Moon Spring',    tier: 'regular', use: 'jump',  mult: 1.6 },
  bubble_shield:{ name: 'Bubble Shield',  tier: 'fire',    use: 'shield', amount: 70 },
  rage_chip:    { name: 'Rage Chip',      tier: 'gold',    use: 'rage',   mult: 1.6 },
  godshield:    { name: 'Godshield',      tier: 'gold',    use: 'invuln' },
  ascension:    { name: 'Ascension',      tier: 'galaxy',  use: 'ascend' },
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
  super: [],
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
  if (t === 'super') return { type: 'super', id: 'super', def: { name: 'SUPER' }, tier: 'super' };
  const id = weightedPick(LOOT[t] || LOOT.regular);
  if (WEAPONS[id]) return { type: 'weapon', id: id, def: WEAPONS[id], tier: t };
  return { type: 'item', id: id, def: ITEMS[id], tier: t };
}
function hexStr(hex) { return '#' + hex.toString(16).padStart(6, '0'); }
function heroHp() { return randInt(CONFIG.heroHpMin, CONFIG.heroHpMax); }

/* ---------------- per-hero costume details ----------------
   eyes: glowing eye colour, hair: style, pads/belt/boots/gloves: trim colours.
   Used by both the 3D body builder and the portrait painter.
*/
const LOOKS = {
  homelander:   { eyes: 0xff2a2a, hair: 'swept', hairColor: 0xf2d06b, pads: 0xd9b45a, belt: 0xd42a2a, boots: 0x0f2a38, gloves: 0x0f2a38, capeColor: 0x9c1f2a, emblemColor: 0xffd23d, chestTrim: 0xd42a2a },
  blacknoir:    { eyes: null, hair: 'mask', hairColor: 0x14161c, maskColor: 0x0d1015, pads: 0x2b2f3a, belt: 0x2b2f3a, boots: 0x0d1015, gloves: 0x0d1015, capeColor: null, emblemColor: 0x6b7ba8 },
  soldierboy:   { eyes: null, hair: 'short', hairColor: 0x5a3a22, beard: true, pads: 0xd8c48a, belt: 0xd8c48a, boots: 0x2f4a33, gloves: 0x2f4a33, capeColor: null, emblemColor: 0xd8c48a, chestTrim: 0xd8c48a },
  cap:          { eyes: null, hair: 'short', hairColor: 0xf2d06b, pads: 0xf0f4ff, belt: 0xd42a2a, boots: 0xd42a2a, gloves: 0xd42a2a, capeColor: null, emblemColor: 0xf0f4ff, chestTrim: 0xd42a2a },
  superman:     { eyes: 0xff3b30, hair: 'swept', hairColor: 0x1a1c22, pads: 0x1b3f9c, belt: 0xffd23d, boots: 0xd42a2a, gloves: 0x1b3f9c, capeColor: 0xd42a2a, emblemColor: 0xffd23d, chestTrim: 0xffd23d },
  sentry:       { eyes: 0xffe57a, hair: 'long', hairColor: 0xf2d06b, pads: 0xd9a520, belt: 0xd9a520, boots: 0xd9a520, gloves: 0xd9a520, capeColor: 0xb8860b, emblemColor: 0xfff3c4 },
  wintersoldier: { eyes: null, hair: 'long', hairColor: 0x5a3a22, pads: 0x23262e, belt: 0x23262e, boots: 0x1a1c22, gloves: 0x1a1c22, capeColor: null, emblemColor: 0x8a1c1c, metalArm: true },
  flash:        { eyes: null, hair: 'short', hairColor: 0x5a3a22, pads: 0xffd23d, belt: 0xffd23d, boots: 0xffd23d, gloves: 0xffd23d, capeColor: null, emblemColor: 0xffd23d },
  wallywest:    { eyes: null, hair: 'short', hairColor: 0xb33a1f, pads: 0xffd23d, belt: 0xffd23d, boots: 0xffd23d, gloves: 0xffd23d, capeColor: null, emblemColor: 0xffd23d },
  goku:         { eyes: null, hair: 'spiky', hairColor: 0x1a1c22, pads: 0x1f4fa8, belt: 0x1f4fa8, boots: 0x1f4fa8, gloves: 0x1f4fa8, capeColor: null, emblemColor: 0xffd23d, chestTrim: 0x1f4fa8 },
  saitama:      { eyes: null, hair: 'bald', hairColor: 0xf0c090, pads: 0xffd23d, belt: 0xd42a2a, boots: 0xd42a2a, gloves: 0xd42a2a, capeColor: 0xf5f5f5, emblemColor: 0xd42a2a },
  vegeta:       { eyes: null, hair: 'spiky', hairColor: 0x1a1c22, pads: 0xf0f4ff, belt: 0xffd23d, boots: 0xf0f4ff, gloves: 0xf0f4ff, capeColor: null, emblemColor: 0xffd23d },
  broly:        { eyes: null, hair: 'spiky', hairColor: 0x1a1c22, pads: 0xd8c48a, belt: 0xd8c48a, boots: 0x2b6b3f, gloves: 0xd8c48a, capeColor: null, emblemColor: 0x4dff8f },
  omniman:      { eyes: null, hair: 'swept', hairColor: 0x1a1c22, stache: true, pads: 0xf0f4ff, belt: 0xf0f4ff, boots: 0xf0f4ff, gloves: 0xd42a2a, capeColor: 0xf0f4ff, emblemColor: 0xf0f4ff },
  conquest:     { eyes: null, hair: 'short', hairColor: 0xe8eefc, beard: true, pads: 0xe8eefc, belt: 0x8a1c1c, boots: 0xcfd8e6, gloves: 0xcfd8e6, capeColor: 0x9aa7bd, emblemColor: 0x8a1c1c },
  invincible:   { eyes: null, hair: 'short', hairColor: 0x5a3a22, pads: 0xffd23d, belt: 0xffd23d, boots: 0xffd23d, gloves: 0xffd23d, capeColor: null, emblemColor: 0xffd23d },
  greenlantern: { eyes: 0x4dff8f, hair: 'short', hairColor: 0x5a3a22, pads: 0x14361f, belt: 0x4dff8f, boots: 0x14361f, gloves: 0x14361f, capeColor: null, emblemColor: 0x4dff8f, chestTrim: 0x4dff8f },
};

function heroLook(key) { return LOOKS[key] || LOOKS.homelander; }

/* ---------------- walking styles ----------------
   Each hero moves differently, so the arena reads as a crowd instead of
   one animation played on eight skins. Numbers are multipliers on the
   base cycle: stride is leg swing, lean is forward tilt, armSwing is the
   counter-swing of the arms, bounce is how high the body rises per step,
   sway is the side-to-side weight shift, style changes the pose logic.
*/
const WALK_STYLES = {
  hero:      { style: 'hero',  stride: 1.0,  lean: 0.12, armSwing: 0.85, bounce: 0.10, sway: 0.05, cadence: 1.0 },
  silent:    { style: 'stealth', stride: 0.8, lean: 0.2, armSwing: 0.35, bounce: 0.04, sway: 0.02, cadence: 0.95 },
  soldier:   { style: 'march', stride: 0.9,  lean: 0.04, armSwing: 0.45, bounce: 0.12, sway: 0.02, cadence: 1.05 },
  shield:    { style: 'guard', stride: 0.85, lean: 0.06, armSwing: 0.4,  bounce: 0.07, sway: 0.03, cadence: 1.0 },
  heavy:     { style: 'stride', stride: 1.2, lean: 0.16, armSwing: 1.0, bounce: 0.16, sway: 0.08, cadence: 0.82 },
  speed:     { style: 'sprint', stride: 1.1, lean: 0.35, armSwing: 1.25, bounce: 0.08, sway: 0.03, cadence: 1.55 },
  energy:    { style: 'hero',  stride: 1.0,  lean: 0.22, armSwing: 1.1,  bounce: 0.09, sway: 0.05, cadence: 1.15 },
  scrapper:  { style: 'casual', stride: 0.95, lean: 0.05, armSwing: 0.75, bounce: 0.07, sway: 0.07, cadence: 0.9 },
  swagger:   { style: 'swagger', stride: 1.0, lean: 0.02, armSwing: 0.95, bounce: 0.05, sway: 0.11, cadence: 0.88 },
  lantern:   { style: 'hover', stride: 0.6,  lean: 0.1, armSwing: 0.5,  bounce: 0.22, sway: 0.02, cadence: 0.9 },
};

const HERO_WALK = {
  homelander: 'hero', blacknoir: 'silent', soldierboy: 'soldier', cap: 'shield',
  superman: 'hero', sentry: 'heavy', wintersoldier: 'soldier', flash: 'speed',
  wallywest: 'speed', goku: 'energy', saitama: 'scrapper', vegeta: 'swagger',
  broly: 'heavy', omniman: 'hero', conquest: 'heavy', invincible: 'energy',
  greenlantern: 'lantern',
};

function heroWalk(key) { return WALK_STYLES[HERO_WALK[key]] || WALK_STYLES.hero; }
