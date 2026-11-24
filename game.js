(function () {
'use strict';

/* ===== 01_config.js ===== */
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

/* ---- map size: roughly 1.9x the old arena ----
   The centre is an octagon (landmark ring, ramps, floating pads) and a
   wide ring road circles it, with bridges out to every team base.        */
const ARENA_R = 128;                   // octagon circumradius (was 92)
const INNER_R = 46;                    // landmark ring around the middle
const RING_R = 78;                     // stone ring road radius
const BASE_DIST = 172;                 // centres of the team platforms (was 124)
const BASE_R = 19;
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
    this.tone(1800, 0.55, 'sawtooth', 0.13, 420);
    this.tone(2400, 0.5, 'square', 0.06, 600);
    this.noise(0.55, 0.16, 3200, 0.8, 700);
  },
  punchBoom() {
    this.noise(0.28, 0.4, 220, 0.5, 60);
    this.tone(70, 0.3, 'sawtooth', 0.22, 35);
    this.tone(180, 0.12, 'square', 0.12, 60);
  },
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


/* ===== 04_world.js ===== */
'use strict';

/* ============================================================
   STATE + WORLD: space backdrop, arena, bases, chambers,
   lucky blocks (incl. the glitching Super block), particles
   ============================================================ */

const State = {
  scene: null, camera: null, renderer: null,
  fighters: [], blocks: [], chambers: [], projectiles: [], particles: [], beams: [], shockwaves: [], casings: [],
  bases: [], player: null,
  time: 0,
  timers: { big: CONFIG.bigWaveMs, galaxy: CONFIG.galaxyBlockMs, rng: CONFIG.rngBlockMs, loose: 3000, super: CONFIG.superBlockMs },
  started: false, wave: 1,
  islands: [],
  superUnlocked: false,
};

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#________0123456789';

const World = {
  glowTex: null,
  particlePool: [],
  tex: {},
  matrix: null,
  glitchLabels: [],

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
    g.strokeRect(5, 5, 246, 244);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  },

  /* glitching hero block: torn scanlines, magenta / cyan */
  makeSuperTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#12002a';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 26; i++) {
      const y = Math.random() * 256;
      const h = Math.random() * 10 + 2;
      g.fillStyle = Math.random() > 0.5 ? 'rgba(255,92,225,0.35)' : 'rgba(53,224,255,0.30)';
      g.fillRect(0, y, 256, h);
    }
    for (let i = 0; i < 40; i++) {
      g.fillStyle = 'rgba(255,255,255,' + (0.05 + Math.random() * 0.2) + ')';
      g.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 40 + 4, 2);
    }
    g.strokeStyle = '#ff5ce1';
    g.lineWidth = 12;
    g.strokeRect(6, 6, 244, 244);
    g.font = 'bold 120px "Courier New", monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.shadowColor = '#ff5ce1';
    g.shadowBlur = 30;
    g.fillStyle = '#ffe6ff';
    g.fillText('S', 128, 132);
    g.shadowColor = '#35e0ff';
    g.fillStyle = '#d8fbff';
    g.fillText('S', 120, 126);
    g.shadowBlur = 0;
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  },

  blockTexture(tierKey) {
    if (this.tex[tierKey]) return this.tex[tierKey];
    let t;
    if (tierKey === 'galaxy') t = this.makeGalaxyTexture();
    else if (tierKey === 'big') t = this.makeVoidTexture();
    else if (tierKey === 'rng') t = this.makeMatrixTexture();
    else if (tierKey === 'super') t = this.makeSuperTexture();
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

  /* "Super" written with random characters glitching through it */
  makeGlitchLabel(word, colorA, colorB) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 96;
    const g = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false, depthTest: false,
    }));
    sprite.scale.set(11, 4.2, 1);
    let next = 0;
    const entry = { sprite, tex };
    const draw = () => {
      g.clearRect(0, 0, 256, 96);
      g.font = 'bold 56px "Courier New", monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const chars = word.split('');
      const glitched = chars.map(ch => (Math.random() < 0.45 ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : ch));
      const txt = glitched.join('');
      g.shadowColor = colorA;
      g.shadowBlur = 22;
      g.fillStyle = colorB;
      g.fillText(txt, 128, 46);
      g.globalAlpha = 0.75;
      g.fillStyle = colorA;
      g.fillText(txt, 122 + Math.random() * 10, 42 + Math.random() * 8);
      g.globalAlpha = 1;
      g.shadowBlur = 0;
      tex.needsUpdate = true;
    };
    draw();
    entry.draw = draw;
    entry.next = next;
    this.glitchLabels.push(entry);
    return entry;
  },

  init(renderer, scene) {
    this.renderer = renderer;
    this.scene = scene;
    this.glowTex = this.makeGlowTexture();
    this.matrix = this.blockTexture('rng');

    scene.background = new THREE.Color(0x05060f);
    scene.fog = new THREE.Fog(0x0a0d20, 420, 1400);

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
        map: this.glowTex, color: col, transparent: true, opacity: 0.13,
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

    /* ---------- more planets ---------- */
    this.planets = [];
    const planetDefs = [
      { r: 54, color: 0x8a5a2a, pos: [300, 95, -280], ring: 0xd8a24a },
      { r: 36, color: 0x2f5b8a, pos: [-340, -30, 260], ring: null },
      { r: 66, color: 0x4a2a6b, pos: [200, 210, 340], ring: 0x8b5cf6 },
      { r: 26, color: 0x2a7a6b, pos: [-200, 240, -320], ring: null },
      { r: 18, color: 0xb04a4a, pos: [120, -160, 300], ring: null },
    ];
    for (const d of planetDefs) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(d.r, 22, 16),
        new THREE.MeshBasicMaterial({ color: d.color, fog: false })
      );
      m.position.set(d.pos[0], d.pos[1], d.pos[2]);
      s.add(m);
      this.planets.push({ mesh: m, spin: rand(-0.02, 0.02) });
      if (d.ring) {
        const rg = new THREE.Mesh(
          new THREE.TorusGeometry(d.r * 1.7, d.r * 0.07, 6, 60),
          new THREE.MeshBasicMaterial({ color: d.ring, transparent: true, opacity: 0.5, fog: false })
        );
        rg.position.copy(m.position);
        rg.rotation.x = 1.2 + rand(-0.3, 0.3);
        s.add(rg);
        this.planets.push({ mesh: rg, spin: 0.004 });
      }
    }

    /* ---------- comets, supernovae, gamma rays ---------- */
    this.comets = [];
    for (let i = 0; i < 5; i++) this.comets.push(this.makeComet());
    this.novas = [];
    this.gammas = [];
    this.novaT = rand(4, 9);
    this.gammaT = rand(2, 5);
  },

  makeComet() {
    const g = new THREE.Group();
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false })
    );
    g.add(head);
    const tail = new THREE.Mesh(
      new THREE.ConeGeometry(2.6, 36, 6, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x9bd8ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    );
    tail.rotation.x = Math.PI / 2;
    tail.position.z = -19;
    g.add(tail);
    const a = rand(0, Math.PI * 2), r = rand(300, 620);
    g.position.set(Math.cos(a) * r, rand(-200, 220), Math.sin(a) * r);
    this.scene.add(g);
    return { mesh: g, life: rand(4, 10), vel: new THREE.Vector3(rand(-60, 60), rand(-30, 30), rand(-60, 60)) };
  },

  spawnNova() {
    const a = rand(0, Math.PI * 2), r = rand(320, 640);
    const pos = new THREE.Vector3(Math.cos(a) * r, rand(-120, 280), Math.sin(a) * r);
    const col = pick([0xffd27a, 0x9bd8ff, 0xff8ad8, 0xc9a6ff, 0xffffff]);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowTex, color: col, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
    }));
    glow.position.copy(pos);
    glow.scale.setScalar(10);
    this.scene.add(glow);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(6, 8, 40),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    );
    ring.position.copy(pos);
    ring.lookAt(0, 0, 0);
    this.scene.add(ring);
    this.novas.push({ glow, ring, t: 0, life: 2.6 });
    Sound.glitch();
  },

  spawnGamma() {
    const a = rand(0, Math.PI * 2);
    const start = new THREE.Vector3(Math.cos(a) * 520, rand(-80, 280), Math.sin(a) * 520);
    const dir = new THREE.Vector3(rand(-1, 1), rand(-0.4, 0.4), rand(-1, 1)).normalize();
    const len = 280;
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.8, len, 6, 1, true),
      new THREE.MeshBasicMaterial({ color: pick([0x9bd8ff, 0xffd27a, 0xff8ad8]), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    );
    beam.position.copy(start).addScaledVector(dir, len / 2);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    this.scene.add(beam);
    this.gammas.push({ mesh: beam, t: 0, life: rand(0.5, 1.4) });
  },

  updateSky(dt) {
    if (this.stars) {
      this.stars.material.opacity = 0.82 + Math.sin(State.time * 1.7) * 0.12;
      this.stars.rotation.y += dt * 0.004;
    }
    for (const p of this.planets || []) p.mesh.rotation.y += dt * p.spin;

    for (const c of this.comets || []) {
      c.mesh.position.addScaledVector(c.vel, dt);
      c.mesh.lookAt(c.mesh.position.clone().add(c.vel));
      c.life -= dt;
      if (c.life <= 0) {
        const a = rand(0, Math.PI * 2), r = rand(300, 620);
        c.mesh.position.set(Math.cos(a) * r, rand(-200, 220), Math.sin(a) * r);
        c.vel.set(rand(-60, 60), rand(-30, 30), rand(-60, 60));
        c.life = rand(5, 12);
      }
    }

    this.novaT -= dt;
    if (this.novaT <= 0) { this.novaT = rand(7, 16); this.spawnNova(); }
    for (let i = this.novas.length - 1; i >= 0; i--) {
      const n = this.novas[i];
      n.t += dt;
      const k = n.t / n.life;
      n.glow.scale.setScalar(10 + k * 80);
      n.glow.material.opacity = Math.max(0, 1 - k);
      n.ring.scale.setScalar(1 + k * 10);
      n.ring.material.opacity = Math.max(0, 0.9 - k);
      if (k >= 1) { this.scene.remove(n.glow); this.scene.remove(n.ring); this.novas.splice(i, 1); }
    }

    this.gammaT -= dt;
    if (this.gammaT <= 0) { this.gammaT = rand(2.5, 6); this.spawnGamma(); }
    for (let i = this.gammas.length - 1; i >= 0; i--) {
      const gm = this.gammas[i];
      gm.t += dt;
      gm.mesh.material.opacity = Math.max(0, 0.85 * (1 - gm.t / gm.life));
      if (gm.t >= gm.life) { this.scene.remove(gm.mesh); this.gammas.splice(i, 1); }
    }
  },


  buildIslands() {
    const rockMats = [0x2c3450, 0x353f5e, 0x263049, 0x3a3355];
    const topMats = [0x3f6b58, 0x4a5f8a, 0x5a4b7a, 0x3d5f74];
    for (let i = 0; i < 24; i++) {
      const g = new THREE.Group();
      const r = rand(14, 42);
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
      const a = (i / 24) * Math.PI * 2 + rand(-0.2, 0.2);
      const dist = rand(210, 520);
      g.position.set(Math.cos(a) * dist, rand(-110, 80), Math.sin(a) * dist);
      g.rotation.y = rand(0, 6.3);
      this.scene.add(g);
      State.islands.push({ mesh: g, baseY: g.position.y, phase: rand(0, 6.3), drift: rand(0.4, 1.2), spin: rand(-0.05, 0.05) });
    }
  },

  buildArena() {
    const s = this.scene;

    /* ---- main octagon deck ---- */
    const topTex = this.makeGridTexture('#2b3450', '#46567f');
    topTex.repeat.set(36, 36);
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(ARENA_R, ARENA_R, 2.4, 8),
      new THREE.MeshLambertMaterial({ map: topTex, color: 0xffffff })
    );
    top.position.y = -1.2;
    s.add(top);

    const under = new THREE.Mesh(
      new THREE.CylinderGeometry(ARENA_R * 0.96, ARENA_R * 0.42, 30, 8),
      new THREE.MeshLambertMaterial({ color: 0x1a2136, flatShading: true })
    );
    under.position.y = -17;
    s.add(under);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(ARENA_R + 0.1, 0.7, 6, 8),
      new THREE.MeshBasicMaterial({ color: 0x35e0ff })
    );
    rim.rotation.x = Math.PI / 2;
    rim.rotation.z = Math.PI / 8;
    rim.position.y = 0.05;
    s.add(rim);

    /* ---- ring road inlay: lighter stone band with glowing edge lines ---- */
    const roadTex = this.makeGridTexture('#33405f', '#59689c');
    roadTex.repeat.set(30, 4);
    const road = new THREE.Mesh(
      new THREE.RingGeometry(RING_R - 9, RING_R + 9, 8, 1),
      new THREE.MeshLambertMaterial({ map: roadTex, color: 0xffffff })
    );
    road.rotation.x = -Math.PI / 2;
    road.rotation.z = Math.PI / 8;
    road.position.y = 0.03;
    s.add(road);
    for (const rr of [RING_R - 9.4, RING_R + 9.4]) {
      const line = new THREE.Mesh(
        new THREE.RingGeometry(rr, rr + 0.5, 8, 1),
        new THREE.MeshBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
      );
      line.rotation.x = -Math.PI / 2;
      line.rotation.z = Math.PI / 8;
      line.position.y = 0.06;
      s.add(line);
    }

    /* ---- centre landmark: raised disc + socket for the big block ---- */
    const mid = new THREE.Mesh(
      new THREE.CylinderGeometry(26, 27, 1.2, 16),
      new THREE.MeshLambertMaterial({ color: 0x3a4a72 })
    );
    mid.position.y = 0.55;
    s.add(mid);

    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 15, 0.2, 16),
      new THREE.MeshBasicMaterial({ color: 0x0d3b52 })
    );
    pad.position.y = 1.24;
    s.add(pad);
    const padRing = new THREE.Mesh(
      new THREE.TorusGeometry(15, 0.35, 6, 48),
      new THREE.MeshBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0.8 })
    );
    padRing.rotation.x = Math.PI / 2;
    padRing.position.y = 1.4;
    s.add(padRing);
    this.padRing = padRing;

    /* inner ring of pillars marking the landmark */
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const px = Math.cos(a) * INNER_R, pz = Math.sin(a) * INNER_R;
      const p = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.9, 7, 6),
        new THREE.MeshLambertMaterial({ color: 0x2e3d5e, flatShading: true })
      );
      p.position.set(px, 3.5, pz);
      s.add(p);
      const cap = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.7, 3.6),
        new THREE.MeshBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0.75 })
      );
      cap.position.set(px, 7.2, pz);
      s.add(cap);
    }

    this.buildPlatforms();
    this.buildRamps();
  },

  /* raised blocks the fighters can climb, all reachable from the flat deck */
  buildPlatforms() {
    const s = this.scene;
    const defs = [
      /* x, z, w, d, h, colour */
      [-64, -30, 22, 18, 3.2, 0x3d4c74],
      [64, 26, 24, 18, 4.0, 0x3d4c74],
      [-52, 62, 18, 18, 2.6, 0x46557f],
      [52, -62, 18, 18, 2.6, 0x46557f],
      [4, -88, 30, 10, 2.2, 0x3a4868],
      [-6, 92, 30, 10, 2.2, 0x3a4868],
      [96, -8, 12, 30, 2.8, 0x404f78],
      [-98, 12, 12, 28, 2.8, 0x404f78],
      [-104, -74, 16, 16, 3.6, 0x46557f],
      [102, 78, 16, 16, 3.6, 0x46557f],
      [0, -116, 26, 14, 2.0, 0x3a4868],
      [0, 118, 26, 14, 2.0, 0x3a4868],
      [-26, -8, 12, 12, 2.2, 0x4a5a86],
      [28, 10, 12, 12, 2.2, 0x4a5a86],
    ];
    for (const [x, z, w, d, h, col] of defs) {
      const tex = this.makeGridTexture('#3a4868', '#56679b');
      tex.repeat.set(Math.max(1, w / 6), Math.max(1, d / 6));
      const slab = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshLambertMaterial({ map: tex, color: 0xffffff })
      );
      slab.position.set(x, h / 2, z);
      s.add(slab);

      const lip = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.5, 0.28, d + 0.5),
        new THREE.MeshBasicMaterial({ color: 0x8ef0ff, transparent: true, opacity: 0.35 })
      );
      lip.position.set(x, h, z);
      s.add(lip);

      PLATFORMS.push({ x, z, w, d, h, top: h });
      /* a few crates on top for cover */
      for (let i = 0; i < randInt(1, 3); i++) {
        const cs = rand(1.8, 2.8);
        const crate = new THREE.Mesh(
          new THREE.BoxGeometry(cs, cs, cs),
          new THREE.MeshLambertMaterial({ color: pick([0x6a7fa8, 0x8a6aa8, 0x4f7f6a, 0x7a5a3a]), flatShading: true })
        );
        crate.position.set(
          x + rand(-w * 0.35, w * 0.35), h + cs * 0.5,
          z + rand(-d * 0.35, d * 0.35)
        );
        crate.rotation.y = rand(0, 6.3);
        s.add(crate);
      }
    }
  },

  /* ramps so every raised platform can be walked onto */
  buildRamps() {
    const s = this.scene;
    const list = [
      [-64, -30, 22, 18, 3.2],
      [64, 26, 24, 18, 4.0],
      [-52, 62, 18, 18, 2.6],
      [52, -62, 18, 18, 2.6],
      [4, -88, 30, 10, 2.2],
      [96, -8, 12, 30, 2.8],
      [-98, 12, 12, 28, 2.8],
      [-104, -74, 16, 16, 3.6],
      [102, 78, 16, 16, 3.6],
    ];
    for (const [x, z, w, d, h] of list) {
      /* aim the ramp away from the arena centre */
      const out = new THREE.Vector2(x, z).normalize();
      const len = Math.max(w, d) * 0.9;
      const ramp = new THREE.Mesh(
        new THREE.BoxGeometry(7, 0.5, len),
        new THREE.MeshLambertMaterial({ color: 0x4a5a86 })
      );
      const midX = x + out.x * (Math.min(w, d) * 0.5 + len * 0.5);
      const midZ = z + out.y * (Math.min(w, d) * 0.5 + len * 0.5);
      ramp.position.set(midX, h * 0.5, midZ);
      ramp.rotation.y = Math.atan2(out.x, out.y);
      ramp.rotation.x = -Math.atan2(h, len);
      ramp.rotation.order = 'YXZ';
      s.add(ramp);

      RAMP_DEFS.push({ x: midX, z: midZ, outx: out.x, outz: out.y, len, h, baseX: x, baseZ: z, w, d });
    }
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
      colTex.repeat.set(4, 18);
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(BASE_R, BASE_R * 0.7, 90, 12),
        new THREE.MeshLambertMaterial({ map: colTex, color: 0xffffff })
      );
      col.position.set(bx, -45, bz);
      s.add(col);

      const bt = new THREE.Mesh(
        new THREE.CylinderGeometry(BASE_R, BASE_R, 2, 12),
        new THREE.MeshLambertMaterial({ color: team.hex })
      );
      bt.position.set(bx, -1, bz);
      s.add(bt);

      const len = BASE_DIST - ARENA_R + 1;
      const mid = (ARENA_R + BASE_DIST) / 2;
      const bridgeTex = this.makeGridTexture('#3a4463', '#5a6896');
      bridgeTex.repeat.set(2, Math.max(1, Math.round(len / 5)));
      const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(BRIDGE_HALF * 2, 1, len),
        new THREE.MeshLambertMaterial({ map: bridgeTex, color: 0xffffff })
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
        new THREE.MeshBasicMaterial({ color: team.glow, transparent: true, opacity: 0.09, side: THREE.DoubleSide, depthWrite: false })
      );
      dome.position.set(bx, 0, bz);
      s.add(dome);
      const domeWire = new THREE.Mesh(
        new THREE.SphereGeometry(DOME_R, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: team.glow, wireframe: true, transparent: true, opacity: 0.14 })
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
      new THREE.MeshBasicMaterial({ color: base.glow, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })
    );
    glass.position.set(cx, 4, cz);
    s.add(glass);

    const cage = new THREE.Mesh(
      new THREE.CylinderGeometry(CHAMBER_R + 0.05, CHAMBER_R + 0.05, 8, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: base.glow, wireframe: true, transparent: true, opacity: 0.35 })
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

    const chamber = { base, x: cx, z: cz, glass, cage, label, ready: true, timer: 0, tier: rollChamberTier(), block: null };
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
    const map = (tierKey === 'rng' || tierKey === 'super') ? tex.clone() : tex;
    if (tierKey === 'rng') { map.needsUpdate = true; map.wrapS = map.wrapT = THREE.RepeatWrapping; }

    const mat = new THREE.MeshLambertMaterial({
      map: map, emissive: 0xffffff, emissiveMap: map,
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
    } else if (tierKey === 'super') {
      tag = this.makeGlitchLabel('Super', '#ff5ce1', '#d8fbff');
      tag.sprite.scale.set(size * 3.0, size * 1.15, 1);
      tag.sprite.position.set(0, 0, size * 0.66);
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
      size, baseY: y, bob: rand(0, 6.28), spawnT: 0, alive: true, x, z,
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

  spawnSuperBlock(x, z) {
    const block = this.spawnBlock('super', x, z, { kind: 'super', size: 4.2 });
    UI.broadcast('A SUPER BLOCK HAS APPEARED', '#ff5ce1');
    return block;
  },

  openBlock(block, by) {
    if (!block.alive) return;
    block.alive = false;
    this.scene.remove(block.mesh);
    const idx = State.blocks.indexOf(block);
    if (idx >= 0) State.blocks.splice(idx, 1);

    /* the Super block: unlock this fighter's hero powers */
    if (block.tier === 'super') {
      this.burst(block.mesh.position, 0xff5ce1, 90, 20, 2.2);
      this.burst(block.mesh.position, 0x35e0ff, 60, 16, 1.8);
      by.unlockPowers();
      UI.broadcast(by.name + ' ROLLED THE SUPER BLOCK!', hexStr(by.hero.color));
      UI.feed(by.name + ' unlocked ' + by.hero.name + ' powers!', hexStr(by.hero.color));
      if (by.isPlayer) UI.toast('YOU ARE ' + by.hero.name.toUpperCase(), hexStr(by.hero.color));
      Sound.powerUnlock();
      return;
    }

    const tier = resolveTier(block.tier);

    /* rolling Super inside an RNG block drops the real thing */
    if (tier === 'super') {
      const t = TIERS.super;
      this.burst(block.mesh.position, t.glow, 50, 14, 1.8);
      Sound.blockBreak('super');
      UI.broadcast(by.name + ' ROLLED SUPER!', '#ff5ce1');
      UI.feed(by.name + ' rolled SUPER out of an RNG block', '#ff5ce1');
      if (by.isPlayer) UI.toast('SUPER!', '#ff5ce1');
      this.spawnSuperBlock(by.pos.x, by.pos.z + 3);
      return;
    }

    const t = TIERS[tier];
    const drops = tier === 'big' ? 3 : 1;
    for (let i = 0; i < drops; i++) by.give(lootFor(tier));

    Sound.blockBreak(tier);
    this.burst(block.mesh.position, t.glow, block.big ? 80 : 30, block.big ? 18 : 10, block.big ? 2 : 1.2);
    this.burst(block.mesh.position, 0xffffff, block.big ? 34 : 12, block.big ? 14 : 7, 1);

    if (by && !by.isPlayer) by.blockCd = rand(7, 13);

    const who = by ? by.name : 'Someone';
    if (tier === 'big') UI.feed(who + ' opened the BIG VOID BLOCK!', '#35e0ff');
    else if (block.tier === 'rng') UI.feed(who + ' cracked an RNG block → ' + t.name, '#4dff8f');
    else UI.feed(who + ' opened a ' + t.name + ' block', hexStr(t.glow));

    if (by && by.isPlayer) UI.toast('+ ' + t.name + ' loot', hexStr(t.glow));
  },

  initParticles() {
    const geo = new THREE.BoxGeometry(0.28, 0.28, 0.28);
    for (let i = 0; i < 340; i++) {
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

  spawnCasing(pos, dir) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.055, 0.11),
      new THREE.MeshBasicMaterial({ color: 0xd9b45a })
    );
    mesh.position.copy(pos);
    this.scene.add(mesh);
    State.casings.push({
      mesh,
      vel: new THREE.Vector3(dir.x * 3.5 + rand(-1.2, 1.2), rand(2.4, 4.2), dir.z * 3.5 + rand(-1.2, 1.2)),
      spin: rand(-9, 9), life: 2.4,
    });
  },

  updateCasings(dt) {
    for (let i = State.casings.length - 1; i >= 0; i--) {
      const c = State.casings[i];
      c.vel.y += CONFIG.gravity * dt;
      c.mesh.position.addScaledVector(c.vel, dt);
      c.mesh.rotation.x += c.spin * dt;
      c.mesh.rotation.z += c.spin * 0.6 * dt;
      const g = groundAt(c.mesh.position.x, c.mesh.position.z);
      if (g !== null && c.mesh.position.y < g + 0.05) {
        c.mesh.position.y = g + 0.05;
        c.vel.y *= -0.32; c.vel.x *= 0.6; c.vel.z *= 0.6; c.spin *= 0.55;
        if (Math.abs(c.vel.y) < 0.4) c.vel.y = 0;
      }
      c.life -= dt;
      if (c.life <= 0) { this.scene.remove(c.mesh); State.casings.splice(i, 1); }
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

  /* expanding shockwave ring used by super punches and slams */
  shockwave(pos, color, maxR, life) {
    const geo = new THREE.RingGeometry(0.6, 1.0, 40);
    const mat = new THREE.MeshBasicMaterial({
      color: color, transparent: true, opacity: 0.9, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(pos);
    m.rotation.x = -Math.PI / 2;
    this.scene.add(m);
    State.shockwaves.push({ mesh: m, t: 0, life: life || 0.55, maxR: maxR || 12 });
  },

  updateShockwaves(dt) {
    for (let i = State.shockwaves.length - 1; i >= 0; i--) {
      const s = State.shockwaves[i];
      s.t += dt;
      const k = s.t / s.life;
      s.mesh.scale.setScalar(1 + k * s.maxR);
      s.mesh.material.opacity = Math.max(0, 0.9 * (1 - k));
      if (k >= 1) { this.scene.remove(s.mesh); State.shockwaves.splice(i, 1); }
    }
  },

  /* laser beam: a stretched glowing box that fades out */
  beam(from, to, color, thickness) {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    if (len < 0.01) return;
    const geo = new THREE.CylinderGeometry(thickness || 0.18, (thickness || 0.18) * 0.6, len, 8, 1, true);
    const mat = new THREE.MeshBasicMaterial({
      color: color, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(from).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    this.scene.add(m);
    State.beams.push({ mesh: m, life: 0.35, max: 0.35 });
    const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowTex, color: color, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glowSprite.scale.setScalar(3.2);
    glowSprite.position.copy(from);
    this.scene.add(glowSprite);
    State.beams.push({ mesh: glowSprite, life: 0.3, max: 0.3 });
  },

  updateBeams(dt) {
    for (let i = State.beams.length - 1; i >= 0; i--) {
      const b = State.beams[i];
      b.life -= dt;
      b.mesh.material.opacity = Math.max(0, b.life / b.max);
      if (b.life <= 0) { this.scene.remove(b.mesh); State.beams.splice(i, 1); }
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
        const a = rand(0, Math.PI * 2), r = rand(24, ARENA_R - 10);
        this.spawnBlock('galaxy', Math.cos(a) * r, Math.sin(a) * r, { kind: 'galaxy', y: 4.6 });
        UI.feed('A GALAXY block drifted into the arena', '#c9a6ff');
      }
    }
    if (!hasKind('rng')) {
      State.timers.rng -= dt * 1000;
      if (State.timers.rng <= 0) {
        State.timers.rng = CONFIG.rngBlockMs;
        const a = rand(0, Math.PI * 2), r = rand(24, ARENA_R - 10);
        this.spawnBlock('rng', Math.cos(a) * r, Math.sin(a) * r, { kind: 'rng', y: 4.6 });
        UI.feed('An RNG ?!! block materialised', '#4dff8f');
      }
    }
    /* guarantee: if nobody has unlocked powers yet, one Super block turns up */
    if (!State.superUnlocked && !hasKind('super')) {
      State.timers.super -= dt * 1000;
      if (State.timers.super <= 0) {
        State.timers.super = CONFIG.superBlockMs;
        const a = rand(0, Math.PI * 2), r = rand(16, 60);
        this.spawnSuperBlock(Math.cos(a) * r, Math.sin(a) * r);
        UI.feed('A SUPER block fell into the arena', '#ff5ce1');
      }
    }

    State.timers.loose -= dt * 1000;
    if (State.timers.loose <= 0) {
      State.timers.loose = CONFIG.looseBlockMs;
      const loose = State.blocks.filter(b => b.kind === 'loose').length;
      for (let n = 0; n < 1 && loose + n < CONFIG.maxLooseBlocks; n++) {
        const a = rand(0, Math.PI * 2), r = rand(16, ARENA_R - 8);
        this.spawnBlock(rollTier(), Math.cos(a) * r, Math.sin(a) * r, { kind: 'loose', y: 4.6 });
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
            Math.abs(f.pos.y + 1.5 - b.mesh.position.y) < b.size * 0.8 + 2.6) {
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
    this.updateSky(dt);
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

    /* glitching Super labels */
    for (const gl of this.glitchLabels) {
      gl.next -= dt;
      if (gl.next <= 0) { gl.next = rand(0.05, 0.12); gl.draw(); }
    }

    this.updateParticles(dt);
    this.updateCasings(dt);
    this.updateShockwaves(dt);
    this.updateBeams(dt);
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
    if (b.tier === 'super') {
      /* super blocks jitter like broken code */
      b.mesh.position.x = b.x + (Math.random() - 0.5) * 0.12;
      b.mesh.position.z = b.z + (Math.random() - 0.5) * 0.12;
    }
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
    if (tier === 'super') {
      chamber.ready = false;
      chamber.timer = CONFIG.chamberMs;
      chamber.block.mesh.visible = false;
      this.refreshChamberLabel(chamber);
      this.spawnSuperBlock(chamber.x, chamber.z + 3);
      UI.broadcast(by.name + ' ROLLED SUPER FROM A CHAMBER!', '#ff5ce1');
      return;
    }
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

/* Height of the walkable surface at (x, z), or null where there is none.
   The octagon deck is the main floor, the centre landmark sits a little
   higher, ramps slope up to the raised platforms, and their flat tops are
   returned as a height so fighters stand on them instead of collapsing. */
function groundAt(x, z) {
  let best = null;

  /* centre landmark disc */
  if (Math.hypot(x, z) <= 26.5) best = 1.15;

  /* raised platforms + the ramps that lead onto them */
  for (let i = 0; i < PLATFORMS.length; i++) {
    const p = PLATFORMS[i];
    if (Math.abs(x - p.x) <= p.w * 0.5 + 0.2 && Math.abs(z - p.z) <= p.d * 0.5 + 0.2) {
      if (best === null || p.top > best) best = p.top;
    }
  }
  for (let i = 0; i < RAMP_DEFS.length; i++) {
    const r = RAMP_DEFS[i];
    const dx = x - r.baseX, dz = z - r.baseZ;
    const along = dx * r.outx + dz * r.outz;              // distance out from the slab edge
    const across = Math.abs(-dx * r.outz + dz * r.outx);
    const start = Math.min(r.w, r.d) * 0.5;
    if (across <= 3.6 && along > start - 0.2 && along < start + r.len) {
      const k = clamp((along - start) / r.len, 0, 1);
      const h = r.h * (1 - k);
      if (best === null || h > best) best = h;
    }
  }
  if (best !== null) return best;

  const rad = Math.hypot(x, z);
  if (rad <= ARENA_R) return 0;
  for (const b of State.bases) {
    if (Math.hypot(x - b.x, z - b.z) <= BASE_R) return 0;
    const ux = b.x / BASE_DIST, uz = b.z / BASE_DIST;
    const t = x * ux + z * uz;
    const perp = Math.abs(-x * uz + z * ux);
    if (t >= ARENA_R - 1 && t <= BASE_DIST && perp <= BRIDGE_HALF) return 0;
  }
  return null;
}

/* Can a walker stand here without dropping off a ledge? Used by the bots so
   they path around platform edges instead of stepping into the void. */
function walkableAt(x, z) {
  const g = groundAt(x, z);
  if (g === null) return false;
  return g <= 1.4;   /* stay on the deck and low slabs */
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
   FIGHTER — humanoid avatar with a hero skin, a 5-slot
   inventory, real gun models and super powers
   ============================================================ */

/* optional debug spawn point from the URL, e.g. ?spawn=0,60 */
const DEBUG_SPAWN = (function () {
  const m = /[?&]spawn=(-?[\d.]+),(-?[\d.]+)/.exec(location.search);
  return m ? { x: parseFloat(m[1]), z: parseFloat(m[2]) } : null;
})();

let FIGHTER_ID = 0;

function mat(color, emissive, ei) {
  return new THREE.MeshLambertMaterial({
    color: color, emissive: emissive || 0x000000, emissiveIntensity: ei || 0,
  });
}

class Fighter {
  constructor(opts) {
    this.id = ++FIGHTER_ID;
    this.name = opts.name;
    this.isPlayer = !!opts.isPlayer;
    this.baseIndex = opts.baseIndex;
    this.team = State.bases[opts.baseIndex] ? State.bases[opts.baseIndex].team : TEAM_COLORS[0];
    this.heroKey = opts.heroKey || pick(HERO_KEYS);
    this.hero = HEROES[this.heroKey];
    this.color = this.hero.color;

    this.personality = opts.personality || {
      aggression: rand(0.4, 0.9), caution: rand(0.2, 0.8),
      greed: rand(0.2, 0.9), skill: rand(0.3, 0.95),
    };

    this.maxHp = CONFIG.playerHP;
    this.hp = this.maxHp;
    this.powered = false;
    this.noRegen = false;
    this.abCd = [0, 0, 0];
    this.barrage = null;
    this.reloading = 0;
    this.ammo = 0;
    this.recoil = 0;
    this.muzzleT = 0;
    this.switchT = 0;
    this.jumpBoostFx = 0;

    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.facing = new THREE.Vector3(0, 0, 1);
    this.grounded = true;
    this.flying = false;
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

    this.shield = 0;
    this.invulnUntil = 0;
    this.speedUntil = 0;
    this.speedMult = 1;
    this.jumpUntil = 0;
    this.jumpMult = 1;
    this.rageUntil = 0;
    this.rageMult = 1;
    this.slowUntil = 0;
    this.doubleJumped = false;
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
    this.walkPhase = 0;
    this.bumpedWall = 0;
    this.upperBlend = 0;
    this.airT = 0;
    this.stepT = 0;
    this.landT = 0;
    this.prevGrounded = true;
    this.blockCd = 0;
    this.wantAbility = -1;
    this.aim = new THREE.Vector3(0, 0, 1);
    this.aiming = false;
    this.ads = false;
    this.focus = false;

    this.buildBody();
    this.placeAtBase();
    this.setWeapon(FISTS, true);
  }

  /* ================= humanoid body ================= */
  buildBody() {
    const h = this.hero;
    const look = heroLook(this.heroKey);
    const g = new THREE.Group();

    const suitMat = mat(h.suit);
    const accentMat = mat(h.accent);
    const trimMat = mat(h.trim || h.accent);
    const skinMat = mat(h.skin || 0xf0c090);
    const hairMat = mat(look.hairColor || 0x2a2c33);
    const padMat = mat(look.pads || h.accent);
    const beltMat = mat(look.belt || h.accent);
    const bootMat = mat(look.boots || 0x1c2233);
    const gloveMat = mat(look.gloves || h.suit);

    /* ---- torso: tapered chest over a narrower waist ---- */
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.34, 0.86, 12), suitMat);
    chest.position.y = 1.86;
    g.add(chest);
    const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.3, 0.42, 12), accentMat);
    waist.position.y = 1.28;
    g.add(waist);
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.055, 6, 16), beltMat);
    belt.rotation.x = Math.PI / 2;
    belt.position.y = 1.1;
    g.add(belt);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 6, 14), trimMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 2.24;
    g.add(collar);

    /* backpack */
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.62, 0.24), accentMat);
    pack.position.set(0, 1.82, -0.34);
    g.add(pack);
    const packTrim = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.1, 0.26), trimMat);
    packTrim.position.set(0, 2.08, -0.34);
    g.add(packTrim);

    /* emblem on the chest */
    if (h.emblem) {
      const em = this.makeEmblem(h.emblem, h.color);
      em.position.set(0, 1.98, 0.42);
      em.scale.setScalar(0.62);
      g.add(em);
    }

    /* ---- neck + head ---- */
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.24, 10), skinMat);
    neck.position.y = 2.33;
    g.add(neck);

    const head = new THREE.Group();
    head.position.y = 2.66;
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 14), skinMat);
    skull.scale.set(1.04, 1.14, 1.02);
    head.add(skull);
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.28), skinMat);
    jaw.position.set(0, -0.2, 0.02);
    head.add(jaw);
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), skinMat);
    chin.position.set(0, -0.3, 0.1);
    head.add(chin);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.055, 0.1), skinMat);
    brow.position.set(0, 0.11, 0.25);
    head.add(brow);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.15, 4), skinMat);
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, -0.03, 0.3);
    head.add(nose);
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), skinMat);
      ear.position.set(0.29 * s, 0, 0.02);
      head.add(ear);
    }

    /* eyes — they light up in the hero colour once powers unlock */
    const eyeMat = new THREE.MeshBasicMaterial({ color: this.powered ? (look.eyes || h.color) : 0x1b2230 });
    const eyes = [];
    for (const s of [-1, 1]) {
      const socket = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), mat(0xf7f9ff));
      socket.position.set(0.115 * s, 0.03, 0.235);
      socket.scale.set(1, 0.75, 0.5);
      head.add(socket);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), eyeMat);
      eye.position.set(0.115 * s, 0.03, 0.285);
      head.add(eye);
      eyes.push(eye);
    }

    /* hair styles */
    if (look.hair === 'spiky') {
      for (let i = 0; i < 9; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.46, 5), hairMat);
        spike.position.set(rand(-0.2, 0.2), 0.3 + rand(0, 0.14), rand(-0.14, 0.14));
        spike.rotation.z = rand(-0.55, 0.55);
        spike.rotation.x = rand(-0.45, 0.45);
        head.add(spike);
      }
    } else if (look.hair === 'bald') {
      /* nothing on top */
    } else if (look.hair === 'mask') {
      const mask = new THREE.Mesh(new THREE.SphereGeometry(0.315, 16, 12), mat(look.maskColor || 0x0d1015));
      mask.scale.set(1.0, 1.1, 1.0);
      head.add(mask);
    } else if (look.hair === 'long') {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.33, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
      cap.position.y = 0.05;
      head.add(cap);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.16), hairMat);
      back.position.set(0, -0.2, -0.2);
      head.add(back);
    } else {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.315, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMat);
      cap.position.y = 0.04;
      head.add(cap);
      if (look.hair === 'swept') {
        const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.18), hairMat);
        fringe.position.set(0.02, 0.21, 0.2);
        fringe.rotation.z = -0.16;
        head.add(fringe);
      }
    }
    if (look.beard) {
      const beard = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.17, 0.12), hairMat);
      beard.position.set(0, -0.29, 0.19);
      head.add(beard);
    }
    if (look.stache) {
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.08), hairMat);
      st.position.set(0, -0.11, 0.3);
      head.add(st);
    }
    g.add(head);

    /* ---- arms: upper, elbow, forearm, hand ---- */
    const makeArm = side => {
      const shoulder = new THREE.Group();
      shoulder.position.set(0.46 * side, 2.14, 0);
      const delt = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), suitMat);
      shoulder.add(delt);
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.46, 10), suitMat);
      upper.position.y = -0.26;
      shoulder.add(upper);
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.115, 8, 6), accentMat);
      elbow.position.y = -0.5;
      shoulder.add(elbow);
      const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.44, 10), side > 0 && h.metalArm ? mat(0xb9c3d4) : suitMat);
      fore.position.y = -0.74;
      shoulder.add(fore);
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.23, 0.18), gloveMat);
      hand.position.y = -1.0;
      shoulder.add(hand);
      return shoulder;
    };
    const armR = makeArm(1);
    const armL = makeArm(-1);
    g.add(armR); g.add(armL);

    /* shoulder pads */
    for (const side of [-1, 1]) {
      const pad = new THREE.Mesh(new THREE.SphereGeometry(0.21, 10, 8), padMat);
      pad.scale.set(1.15, 0.8, 1.15);
      pad.position.set(0.47 * side, 2.22, 0);
      g.add(pad);
    }

    /* ---- legs (hip + knee joints so the knee can bend) ---- */
    const makeLeg = side => {
      const hip = new THREE.Group();
      hip.position.set(0.18 * side, 1.08, 0);
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.5, 10), accentMat);
      thigh.position.y = -0.26;
      hip.add(thigh);
      const kneeBall = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), suitMat);
      kneeBall.position.y = -0.52;
      hip.add(kneeBall);
      const shinGroup = new THREE.Group();
      shinGroup.position.y = -0.52;
      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.5, 10), suitMat);
      shin.position.y = -0.26;
      shinGroup.add(shin);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.44), bootMat);
      foot.position.set(0, -0.56, 0.07);
      shinGroup.add(foot);
      hip.add(shinGroup);
      return { hip: hip, shin: shinGroup };
    };
    const legR = makeLeg(1);
    const legL = makeLeg(-1);
    g.add(legR.hip); g.add(legL.hip);

    /* ---- cape ---- */
    let cape = null;
    if (h.cape) {
      cape = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.5, 0.05), mat(look.capeColor || h.accent));
      cape.position.set(0, 1.55, -0.32);
      g.add(cape);
    }

    /* ---- shield (soldier boy / cap) ---- */
    let shield = null;
    if (h.shield) {
      shield = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 16), mat(h.accent));
      shield.rotation.x = Math.PI / 2;
      shield.position.set(0, -0.85, 0.2);
      armL.add(shield);
    }

    /* ---- weapon mount on the right hand ---- */
    this.weaponMount = new THREE.Group();
    this.weaponMount.position.set(0, -1.02, 0.1);
    armR.add(this.weaponMount);

    /* ---- shield bubble + powered aura ---- */
    const bubble = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0x8ef0ff, transparent: true, opacity: 0.22, depthWrite: false })
    );
    bubble.position.y = 1.7;
    bubble.visible = false;
    g.add(bubble);

    const aura = new THREE.Mesh(
      new THREE.RingGeometry(0.9, 1.25, 32),
      new THREE.MeshBasicMaterial({ color: h.color, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })
    );
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.08;
    aura.visible = false;
    g.add(aura);

    const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: World.glowTex, color: h.color, transparent: true, opacity: 0.0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glowSprite.scale.setScalar(4.5);
    glowSprite.position.y = 1.6;
    g.add(glowSprite);

    /* muzzle flash sprite, shown for a frame when firing */
    const muzzle = new THREE.Sprite(new THREE.SpriteMaterial({
      map: World.glowTex, color: 0xffd54d, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    muzzle.scale.setScalar(1.6);
    muzzle.position.set(0, 0, 1.1);
    this.weaponMount.add(muzzle);

    this.mesh = g;
    this.parts = {
      head, armR, armL, legL: legL.hip, legR: legR.hip, kneeL: legL.shin, kneeR: legR.shin,
      chest, waist, cape, shield, eyes, aura, glowSprite, muzzle, eyeMat,
    };
    this.materials = [suitMat, accentMat, skinMat];
    this.bubble = bubble;
    State.scene.add(g);
  }

  setHero(key) {
    this.heroKey = key;
    this.hero = HEROES[key];
    this.color = this.hero.color;
    State.scene.remove(this.mesh);
    this.buildBody();
    this.setWeapon(this.weapon, true);
    this.mesh.position.copy(this.pos);
    this.mesh.visible = !this.dead;
    this.rebuildEyes();
  }

  makeEmblem(char, color) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0)';
    g.fillRect(0, 0, 128, 128);
    g.font = 'bold 96px Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#ffffff';
    g.shadowColor = hexStr(color);
    g.shadowBlur = 18;
    g.fillText(char, 64, 68);
    const tex = new THREE.CanvasTexture(c);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    sprite.scale.set(0.55, 0.55, 1);
    return sprite;
  }

  /* ================= weapons ================= */
  buildWeaponModel(def) {
    const g = new THREE.Group();
    if (!def || def === FISTS) {
      const fist = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), mat(0xf0c090));
      g.add(fist);
      return g;
    }
    const t = TIERS[def.tier];
    const metal = mat(0x2c3446);
    const dark = mat(0x151a26);
    const glowMat = mat(t.color, t.emissive, 0.8);
    const model = def.model || 'blade';

    const box = (w, h, d, m, x, y, z) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      b.position.set(x || 0, y || 0, z || 0);
      g.add(b);
      return b;
    };
    const cyl = (r1, r2, h, m, x, y, z, rotX) => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 10), m);
      c.position.set(x || 0, y || 0, z || 0);
      if (rotX) c.rotation.x = rotX;
      g.add(c);
      return c;
    };

    if (model === 'pistol') {
      box(0.1, 0.13, 0.34, metal, 0, 0, 0.1);
      cyl(0.035, 0.035, 0.26, dark, 0, 0.03, 0.3, Math.PI / 2);
      box(0.09, 0.2, 0.1, dark, 0, -0.14, -0.02);
      box(0.06, 0.12, 0.06, glowMat, 0, -0.02, -0.08);
      box(0.05, 0.03, 0.05, metal, 0, 0.09, 0.0);
    } else if (model === 'smg') {
      box(0.11, 0.15, 0.5, metal, 0, 0, 0.12);
      cyl(0.032, 0.032, 0.3, dark, 0, 0.04, 0.45, Math.PI / 2);
      box(0.08, 0.22, 0.09, dark, 0, -0.15, 0.02);
      box(0.06, 0.26, 0.08, dark, 0, -0.16, 0.2);
      box(0.06, 0.1, 0.1, glowMat, 0, 0.0, -0.12);
      box(0.07, 0.05, 0.16, metal, 0, 0.11, 0.05);
    } else if (model === 'rifle') {
      box(0.1, 0.14, 0.62, metal, 0, 0, 0.14);
      cyl(0.028, 0.028, 0.46, dark, 0, 0.03, 0.62, Math.PI / 2);
      box(0.08, 0.2, 0.09, dark, 0, -0.15, 0.02);
      box(0.07, 0.24, 0.09, dark, 0, -0.15, 0.22);
      box(0.1, 0.12, 0.3, metal, 0, -0.02, -0.3);
      cyl(0.045, 0.045, 0.18, dark, 0, 0.11, 0.14, Math.PI / 2);
      box(0.05, 0.12, 0.06, glowMat, 0, -0.02, -0.12);
    } else if (model === 'shotgun') {
      cyl(0.045, 0.045, 0.62, dark, 0, 0.04, 0.4, Math.PI / 2);
      cyl(0.04, 0.04, 0.5, dark, 0, -0.04, 0.36, Math.PI / 2);
      box(0.1, 0.13, 0.34, metal, 0, 0, 0.02);
      box(0.09, 0.11, 0.12, mat(0x5a3a22), 0, -0.02, 0.26);
      box(0.09, 0.22, 0.24, mat(0x5a3a22), 0, -0.05, -0.28);
      box(0.06, 0.12, 0.07, dark, 0, -0.14, -0.02);
    } else if (model === 'sniper') {
      box(0.09, 0.13, 0.72, metal, 0, 0, 0.16);
      cyl(0.024, 0.024, 0.75, dark, 0, 0.03, 0.85, Math.PI / 2);
      cyl(0.05, 0.05, 0.3, dark, 0, 0.15, 0.16, Math.PI / 2);
      box(0.09, 0.18, 0.22, mat(0x5a3a22), 0, -0.05, -0.34);
      box(0.06, 0.2, 0.09, dark, 0, -0.16, 0.0);
      box(0.05, 0.1, 0.06, glowMat, 0, 0.0, -0.16);
    } else if (model === 'minigun') {
      cyl(0.16, 0.16, 0.34, metal, 0, 0, 0.1, Math.PI / 2);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.03, 0.03, 0.6, dark, Math.cos(a) * 0.09, Math.sin(a) * 0.09, 0.52, Math.PI / 2);
      }
      box(0.12, 0.2, 0.2, dark, 0, -0.16, -0.05);
      box(0.16, 0.14, 0.24, glowMat, 0, 0.02, -0.2);
    } else if (model === 'launcher') {
      cyl(0.11, 0.11, 0.8, metal, 0, 0, 0.2, Math.PI / 2);
      cyl(0.13, 0.13, 0.1, dark, 0, 0, 0.6, Math.PI / 2);
      box(0.09, 0.2, 0.12, dark, 0, -0.16, -0.02);
      box(0.07, 0.09, 0.2, glowMat, 0, 0.13, 0.0);
      box(0.1, 0.12, 0.18, dark, 0, 0, -0.2);
    } else if (model === 'slingshot' || model === 'bow') {
      box(0.06, 0.3, 0.06, mat(0x5a3a22), 0, 0, 0.05);
      for (const s of [-1, 1]) {
        const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 6), mat(0x5a3a22));
        prong.position.set(0.1 * s, 0.18, 0.05);
        prong.rotation.z = 0.5 * s;
        g.add(prong);
      }
      box(0.02, 0.02, 0.02, glowMat, 0, 0.1, 0.1);
    } else if (model === 'dynamite') {
      for (let i = 0; i < 3; i++) {
        cyl(0.045, 0.045, 0.3, mat(0xc42a2a), (i - 1) * 0.09, 0, 0.05, Math.PI / 2);
      }
      box(0.24, 0.02, 0.06, mat(0xd8c48a), 0, 0.05, 0.05);
    } else if (model === 'blade') {
      box(0.1, 0.3, 0.1, dark, 0, -0.2, 0);
      box(0.24, 0.05, 0.1, glowMat, 0, -0.06, 0);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.15, 0.16), glowMat);
      blade.position.set(0, 0.55, 0);
      g.add(blade);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.2, 4), glowMat);
      tip.position.set(0, 1.2, 0);
      g.add(tip);
    } else if (model === 'dagger') {
      box(0.09, 0.2, 0.09, dark, 0, -0.16, 0);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.12), glowMat);
      blade.position.set(0, 0.22, 0);
      g.add(blade);
    } else if (model === 'axe' || model === 'hammer') {
      box(0.08, 0.8, 0.08, mat(0x4a3a2a), 0, 0.1, 0);
      const headM = new THREE.Mesh(
        model === 'axe' ? new THREE.CylinderGeometry(0.28, 0.12, 0.1, 3) : new THREE.BoxGeometry(0.42, 0.34, 0.3),
        glowMat
      );
      headM.position.set(0, 0.5, 0);
      g.add(headM);
    } else if (model === 'scythe') {
      box(0.07, 1.2, 0.07, dark, 0, 0.1, 0);
      const hook = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 6, 12, Math.PI), glowMat);
      hook.position.set(0.2, 0.68, 0);
      hook.rotation.z = -0.4;
      g.add(hook);
    } else {
      box(0.1, 0.7, 0.1, glowMat, 0, 0.1, 0);
    }
    return g;
  }

  setWeapon(def, silent) {
    this.weapon = def;
    while (this.weaponMount.children.length) {
      const c = this.weaponMount.children.pop();
      this.weaponMount.remove(c);
    }
    const model = this.buildWeaponModel(def);
    this.weaponMount.add(model);
    this.weaponModel = model;

    const muzzle = new THREE.Sprite(new THREE.SpriteMaterial({
      map: World.glowTex, color: 0xffd54d, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    muzzle.scale.setScalar(1.8);
    muzzle.position.set(0, 0.05, 1.15);
    this.weaponMount.add(muzzle);
    this.parts.muzzle = muzzle;

    this.ammo = def.mag || 0;
    this.reloading = 0;
    if (!silent) {
      Sound.pickup(def.tier);
      this.switchT = CONFIG.switchTime;
    }
    if (this.isPlayer) UI.updateAmmo(this.ammo, def.mag || 0, false);
  }

  /* ================= inventory ================= */
  give(loot) {
    if (loot.type === 'super') { this.unlockPowers(); return; }

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
    const next = (s && s.type === 'weapon') ? s.def : FISTS;
    const changed = next !== this.weapon;
    if (s && s.type === 'weapon') this.setWeapon(s.def, true);
    else this.setWeapon(FISTS, true);
    /* pulling out something different plays the swap animation */
    if (changed) this.switchT = CONFIG.switchTime;
  }

  useSlot(i) {
    const s = this.slots[i];
    if (!s) return false;
    if (s.type === 'weapon') {
      /* pressing the slot you already hold puts the weapon away */
      if (this.slotIndex === i && this.weapon !== FISTS) {
        this.unequip();
        return true;
      }
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

  unequip() {
    this.setWeapon(FISTS, true);
    this.ammo = 0;
    this.reloading = 0;
    if (this.isPlayer) {
      UI.toast('Weapon put away', '#8ea0c8');
      Sound.uiClick();
      UI.updateInv();
    }
  }

  dropSlot(i) {
    const s = this.slots[i];
    if (!s) return false;
    this.slots[i] = null;
    if (this.slotIndex === i) this.setWeapon(FISTS, true);
    World.burst(this.pos.clone().setY(1.2), TIERS[s.tier].glow, 10, 5, 0.9);
    if (this.isPlayer) {
      UI.toast('Dropped ' + s.def.name, '#8ea0c8');
      Sound.uiClick();
      UI.updateInv();
    }
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
    const dur = CONFIG.effectDurMs / 1000;
    switch (def.use) {
      case 'heal':
        this.hp = Math.min(this.maxHp, this.hp + def.amount);
        Sound.heal();
        this.floatText('+' + def.amount, '#5ef08a');
        break;
      case 'shield':
        this.shield = Math.min(400, this.shield + def.amount);
        Sound.shieldHit();
        this.floatText('SHIELD', '#8ef0ff');
        break;
      case 'speed':
        this.speedUntil = now + dur; this.speedMult = def.mult;
        this.floatText('SPEED', '#ffe57a'); Sound.boost();
        break;
      case 'jump':
        this.jumpUntil = now + dur; this.jumpMult = def.mult;
        this.floatText('JUMP BOOST', '#c9a6ff'); Sound.boost();
        break;
      case 'rage':
        this.rageUntil = now + dur; this.rageMult = def.mult;
        this.floatText('RAGE', '#ff7a59');
        break;
      case 'invuln':
        this.invulnUntil = now + dur;
        this.floatText('GODSHIELD', '#ffd54d');
        break;
      case 'ascend':
        this.hp = this.maxHp;
        this.speedUntil = now + dur; this.speedMult = 1.45;
        this.jumpUntil = now + dur; this.jumpMult = 1.7;
        this.rageUntil = now + dur; this.rageMult = 1.35;
        this.floatText('ASCENDED', '#c9a6ff');
        Sound.pickup('galaxy');
        break;
    }
    if (this.isPlayer) {
      UI.toast(def.name + '  ·  ' + TIERS[tier].label, hexStr(TIERS[tier].glow));
      UI.updateTraits();
    }
  }

  /* ================= powers ================= */
  unlockPowers() {
    if (this.powered) return;
    this.powered = true;
    this.noRegen = true;
    this.maxHp = heroHp();
    this.hp = this.maxHp;
    this.invulnUntil = State.time + 2;
    State.superUnlocked = true;
    this.rebuildEyes();
    World.burst(this.pos.clone().setY(2), this.hero.color, 70, 16, 1.8);
    World.shockwave(this.pos.clone().setY(0.2), this.hero.color, 14, 0.9);
    Sound.powerUnlock();
    if (this.isPlayer) UI.updateTraits();
  }

  rebuildEyes() {
    const col = this.powered ? this.hero.color : 0x1b2230;
    this.parts.eyeMat.color.setHex(col);
    this.parts.eyeMat.toneMapped = false;
  }

  heroAbilities() { return this.powered ? this.hero.abilities : []; }

  useAbility(i) {
    if (!this.powered || this.dead) return false;
    const ab = this.hero.abilities[i];
    if (!ab) return false;
    const now = State.time;
    if (this.abCd[i] > now) return false;
    this.abCd[i] = now + ab.cd;
    this.swingT = 0.24;

    switch (ab.type) {
      case 'beam': this.doBeam(ab); break;
      case 'punch': this.doSuperPunch(ab); break;
      case 'barrage': this.doBarrage(ab); break;
      case 'yell': this.doYell(ab); break;
      case 'dash': this.doDash(ab); break;
      case 'slam': this.doSlam(ab); break;
      case 'throw': this.doThrow(ab); break;
      case 'shield': this.doConstruct(ab); break;
    }
    if (this.isPlayer) UI.updateTraits();
    return true;
  }

  doBeam(ab) {
    const origin = this.headPos();
    origin.y -= 0.05;
    const fwd = this.facing.clone().setY(0).normalize();
    const range = 55;
    let hit = null, hitD = range;
    for (const f of State.fighters) {
      if (f === this || f.dead) continue;
      const d = new THREE.Vector3().subVectors(f.pos, this.pos).setY(0);
      const dist = d.length();
      if (dist > range) continue;
      if (d.normalize().dot(fwd) < 0.86) continue;
      if (dist < hitD) { hitD = dist; hit = f; }
    }
    const end = this.pos.clone().addScaledVector(fwd, hit ? hitD : range).setY(origin.y);
    World.beam(origin, end, ab.color, 0.22);
    World.beam(origin.clone().add(new THREE.Vector3(0, -0.12, 0)), end, ab.color, 0.12);
    World.burst(end, ab.color, 18, 9, 1.1);
    Sound.laser();
    if (hit) {
      hit.takeDamage(ab.dmg, this, { dmg: ab.dmg, kb: 6, effect: 'burn', tier: 'galaxy', range: 0, cd: 0 });
      hit.floatText('-' + ab.dmg, hexStr(ab.color));
    }
    this.parts.muzzle.material.opacity = 0;
  }

  doSuperPunch(ab) {
    const fwd = this.facing.clone().setY(0).normalize();
    const impact = this.pos.clone().addScaledVector(fwd, 2.6).setY(1.6);
    World.shockwave(this.pos.clone().addScaledVector(fwd, 2.2).setY(0.25), ab.color, 13, 0.5);
    World.burst(impact, ab.color, 26, 12, 1.3);
    Sound.punchBoom();
    const cosArc = Math.cos(THREE.MathUtils.degToRad(80));
    for (const f of State.fighters) {
      if (f === this || f.dead) continue;
      const d = new THREE.Vector3().subVectors(f.pos, this.pos).setY(0);
      const dist = d.length();
      if (dist > 6.5) continue;
      if (dist > 1.2 && d.clone().normalize().dot(fwd) < cosArc) continue;
      f.takeDamage(ab.dmg, this, { dmg: ab.dmg, kb: 22, tier: 'big', range: 0, cd: 0 });
      f.floatText('-' + ab.dmg, hexStr(ab.color));
      World.burst(f.pos.clone().setY(1.6), ab.color, 16, 11, 1.2);
    }
  }

  doBarrage(ab) {
    this.barrage = { left: 5, timer: 0, ab: ab };
    Sound.swing();
  }

  doYell(ab) {
    const fwd = this.facing.clone().setY(0).normalize();
    World.shockwave(this.pos.clone().setY(0.3), ab.color, 20, 0.75);
    World.beam(this.headPos(), this.headPos().addScaledVector(fwd, 16), ab.color, 0.5);
    Sound.yell();
    for (const f of State.fighters) {
      if (f === this || f.dead) continue;
      const d = new THREE.Vector3().subVectors(f.pos, this.pos).setY(0);
      const dist = d.length();
      if (dist > 18) continue;
      if (d.clone().normalize().dot(fwd) < 0.35) continue;
      f.takeDamage(ab.dmg, this, { dmg: ab.dmg, kb: 26, tier: 'galaxy', range: 0, cd: 0 });
      if (this.heroKey === 'superman') f.slowUntil = State.time + 4;
      f.floatText('-' + ab.dmg, hexStr(ab.color));
    }
  }

  doDash(ab) {
    const fwd = this.facing.clone().setY(0).normalize();
    const from = this.pos.clone();
    const to = this.pos.clone().addScaledVector(fwd, 16);
    const g = groundAt(to.x, to.z);
    if (g !== null) to.y = g;
    World.beam(from.clone().setY(1.5), to.clone().setY(1.5), ab.color, 0.35);
    World.burst(from.clone().setY(1.5), ab.color, 18, 10, 1.2);
    Sound.dash();
    for (const f of State.fighters) {
      if (f === this || f.dead) continue;
      const seg = new THREE.Line3(from, to);
      const closest = new THREE.Vector3();
      seg.closestPointToPoint(f.pos, true, closest);
      if (closest.distanceTo(f.pos) < 2.6) {
        f.takeDamage(ab.dmg, this, { dmg: ab.dmg, kb: 18, tier: 'galaxy', range: 0, cd: 0 });
        f.floatText('-' + ab.dmg, hexStr(ab.color));
      }
    }
    this.pos.copy(to);
    World.burst(to.clone().setY(1.5), ab.color, 20, 10, 1.2);
  }

  doSlam(ab) {
    World.shockwave(this.pos.clone().setY(0.25), ab.color, 26, 0.8);
    World.burst(this.pos.clone().setY(0.8), ab.color, 40, 16, 1.6);
    Sound.slam();
    for (const f of State.fighters) {
      if (f === this || f.dead) continue;
      const dist = f.pos.distanceTo(this.pos);
      if (dist > 11) continue;
      f.takeDamage(ab.dmg, this, { dmg: ab.dmg, kb: 20, tier: 'big', range: 0, cd: 0 });
      f.floatText('-' + ab.dmg, hexStr(ab.color));
    }
  }

  doThrow(ab) {
    const dir = this.facing.clone().setY(0).normalize();
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.1, 14),
      new THREE.MeshBasicMaterial({ color: ab.color })
    );
    mesh.rotation.x = Math.PI / 2;
    const origin = this.headPos().addScaledVector(dir, 1.2);
    mesh.position.copy(origin);
    State.scene.add(mesh);
    State.projectiles.push({
      mesh, owner: this,
      weapon: { dmg: ab.dmg, kb: 14, tier: 'galaxy', splash: 3.5, projSpeed: 55, color: ab.color },
      vel: dir.clone().multiplyScalar(52), life: 2.2, fuse: 0, arc: 0, hit: new Set(), pierce: false,
    });
    Sound.shoot();
  }

  doConstruct(ab) {
    this.shield = Math.min(400, this.shield + 160);
    this.invulnUntil = Math.max(this.invulnUntil, State.time + 1.0);
    Sound.construct();
    World.burst(this.pos.clone().setY(1.6), ab.color, 24, 8, 1.3);
    this.floatText('SHIELD', hexStr(ab.color));
  }

  /* ================= traits for the HUD ================= */
  traits() {
    const now = State.time;
    const list = [];
    if (this.powered) {
      for (let i = 0; i < this.hero.abilities.length; i++) {
        const ab = this.hero.abilities[i];
        list.push({
          icon: ab.icon, color: hexStr(ab.color), name: ab.name,
          ready: this.abCd[i] <= now,
          remaining: Math.max(0, this.abCd[i] - now), total: ab.cd, permanent: true,
        });
      }
      if (this.hero.flight) list.push({ icon: 'FLY', color: hexStr(this.hero.color), name: 'Flight', ready: true, remaining: 0, total: 0, permanent: true });
    }
    const push = (icon, color, name, until) => {
      if (until <= now) return;
      list.push({ icon, color, name, ready: true, remaining: until - now, total: CONFIG.effectDurMs / 1000, permanent: false });
    };
    push('SPD', '#ffe57a', 'Speed', this.speedUntil);
    push('JMP', '#c9a6ff', 'Jump Boost', this.jumpUntil);
    push('RAG', '#ff7a59', 'Rage', this.rageUntil);
    push('SHD', '#8ef0ff', 'Shield', this.shield > 0 ? now + 1 : 0);
    push('GOD', '#ffd54d', 'Godshield', this.invulnUntil);
    return list;
  }

  /* ================= movement ================= */
  placeAtBase() {
    const b = State.bases[this.baseIndex];
    const off = 4.5;
    /* debug spawn: ?spawn=0,20 drops the player in the middle of the map */
    if (this.isPlayer && DEBUG_SPAWN) {
      this.pos.set(DEBUG_SPAWN.x, groundAt(DEBUG_SPAWN.x, DEBUG_SPAWN.z) || 0, DEBUG_SPAWN.z);
      this.vel.set(0, 0, 0);
      this.mesh.position.copy(this.pos);
      this.facing.set(0, 0, 1);
      return;
    }
    this.pos.set(b.x + Math.cos(b.angle) * off, 0, b.z + Math.sin(b.angle) * off);
    this.vel.set(0, 0, 0);
    this.mesh.position.copy(this.pos);
    this.facing.set(-Math.cos(b.angle), 0, -Math.sin(b.angle));
  }

  headPos() { return new THREE.Vector3(this.pos.x, this.pos.y + 3.0, this.pos.z); }
  inDome() { return domeAt(this.pos.x, this.pos.z, this.pos.y); }
  inOwnDome() { return domeAt(this.pos.x, this.pos.z, this.pos.y) === State.bases[this.baseIndex]; }

  moveInput(dir, dt) {
    let speed = CONFIG.walkSpeed * (State.time < this.speedUntil ? this.speedMult : 1);
    if (this.flying) speed *= 1.35;
    if (this.ads) speed *= CONFIG.adsSpeedMult;
    else if (this.focus) speed *= CONFIG.focusSpeedMult;
    const len = Math.hypot(dir.x, dir.z);
    if (len > 0.01) {
      const nx = dir.x / len, nz = dir.z / len;
      this.vel.x = nx * speed;
      this.vel.z = nz * speed;
      /* while aiming a gun the body stays square to the crosshair */
      if (!this.aiming) this.facing.set(nx, 0, nz);
      this.walkAnim += dt * 11;
    } else {
      this.vel.x *= 0.78;
      this.vel.z *= 0.78;
      this.walkAnim += dt * 2;
    }
  }

  jump() {
    if (this.flying) {
      this.vel.y = 9;
      Sound.jump();
      World.burst(this.pos.clone().setY(0.3), this.hero.color, 10, 6, 0.9);
      return;
    }
    const boosted = State.time < this.jumpUntil;
    if (!this.grounded) {
      /* one extra hop in the air; a jump boost makes it higher */
      if (!this.doubleJumped) {
        this.doubleJumped = true;
        this.vel.y = CONFIG.jumpSpeed * (boosted ? this.jumpMult : 0.85);
        World.shockwave(this.pos.clone().setY(0.15), boosted ? 0xc9a6ff : 0x8ea0c8, 5, 0.4);
        World.burst(this.pos.clone().setY(0.4), boosted ? 0xc9a6ff : 0x8ea0c8, 14, 7, 1);
        Sound.boost();
        if (this.isPlayer) this.floatText('DOUBLE JUMP', boosted ? '#c9a6ff' : '#8ea0c8');
      }
      return;
    }
    const jm = boosted ? this.jumpMult : 1;
    this.vel.y = CONFIG.jumpSpeed * jm;
    this.grounded = false;
    this.doubleJumped = false;
    World.shockwave(this.pos.clone().setY(0.12), boosted ? 0xc9a6ff : 0x8ea0c8, boosted ? 6 : 3.5, 0.35);
    World.burst(this.pos.clone().setY(0.25), boosted ? 0xc9a6ff : 0x8ea0c8, boosted ? 12 : 5, boosted ? 7 : 4, 0.9);
    if (this.isPlayer) Sound.jump();
  }

  physics(dt) {
    this.flying = this.powered && this.hero.flight && !this.dead;
    const prevX = this.pos.x, prevZ = this.pos.z;

    if (this.flying) {
      /* superhero hover: hold a height above whatever is below */
      const g = groundAt(this.pos.x, this.pos.z);
      const hover = (g === null ? this.pos.y - 1 : g) + 2.6;
      this.vel.y += (hover - this.pos.y) * 6 * dt;
      this.vel.y *= 0.86;
      if (this.wantJump) { this.vel.y += 12 * dt * 8; }
    } else {
      this.vel.y += CONFIG.gravity * dt;
    }

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.pos.z += this.vel.z * dt;

    const r = Math.hypot(this.pos.x, this.pos.z);
    const limit = BASE_DIST + BASE_R + 6;
    if (r > limit) { const s = limit / r; this.pos.x *= s; this.pos.z *= s; }

    if (!this.flying) {
      const g = groundAt(this.pos.x, this.pos.z);
      /* a ledge taller than a step blocks you instead of snapping you up */
      if (g !== null && g > this.pos.y + 1.15 && this.grounded) {
        this.pos.x = prevX;
        this.pos.z = prevZ;
        this.vel.x = 0;
        this.vel.z = 0;
        this.bumpedWall = 0.25;
      }
      const g2 = groundAt(this.pos.x, this.pos.z);
      if (g2 !== null && this.pos.y <= g2 && this.vel.y <= 0) {
        this.pos.y = g2; this.vel.y = 0; this.grounded = true;
      } else if (g2 === null || this.pos.y > g2 + 0.02) {
        this.grounded = false;
      }
    } else {
      this.grounded = false;
    }

    if (this.pos.y < CONFIG.voidY) this.fellIntoVoid();
  }

  fellIntoVoid() {
    if (this.dead) return;
    Sound.voidFall();
    if (this.isPlayer || chance(0.3)) UI.feed(this.name + ' fell into the void', '#6b7ba8');
    if (this.isPlayer) UI.toast('You fell into the void', '#6b7ba8');
    if (!this.noRegen) this.hp = Math.max(25, this.hp - 25);
    else this.hp = Math.max(25, this.hp - 60);
    this.invulnUntil = State.time + 1.2;
    this.stunT = 0.8;
    this.dots.length = 0;
    this.placeAtBase();
    World.burst(this.pos.clone().setY(1), 0x6b7ba8, 24, 10, 1.2);
  }

  /* ================= combat ================= */
  attack() {
    if (this.dead || this.atkCd > 0) return;
    const w = this.weapon;
    if (w.kind === 'ranged' && w.mag) {
      if (this.reloading > 0) return;
      if (this.ammo <= 0) { this.startReload(); return; }
      this.ammo--;
      if (this.isPlayer) UI.updateAmmo(this.ammo, w.mag, false);
    }
    this.atkCd = w.cd * (this.isPlayer ? 1 : rand(0.95, 1.25)) * CONFIG.fireRateMult;
    this.swingT = 0.22;

    if (w.kind === 'melee') {
      Sound.swing();
      this.pendingHit = 0.09;
    } else {
      this.pendingHit = -1;
      this.fireProjectile();
      this.recoil = w.model === 'minigun' ? 0.05 : w.model === 'sniper' ? 0.22 : 0.12;
      this.muzzleT = CONFIG.muzzleFlashDur;
      if (this.parts.muzzle) {
        this.parts.muzzle.material.color.setHex(TIERS[w.tier].glow);
        this.parts.muzzle.material.opacity = 1;
      }
      Sound.gunshot(w.model);
      /* eject a real brass casing that falls and bounces */
      if (w.model && w.model !== 'slingshot' && w.model !== 'bow') {
        const side = new THREE.Vector3(this.facing.z, 0, -this.facing.x).multiplyScalar(0.42);
        const cp = this.pos.clone().setY(this.pos.y + 1.8).add(side);
        World.spawnCasing(cp, this.facing);
      }
      if (this.ammo <= 0) this.startReload();
    }
  }

  startReload() {
    const w = this.weapon;
    if (!w.mag || this.reloading > 0) return;
    this.reloading = (w.reload || 1.6) * CONFIG.reloadSpeedMult;
    Sound.reload();
    if (this.isPlayer) {
      this.floatText('RELOADING', '#ffe57a');
      UI.updateAmmo(0, w.mag, true);
    }
  }

  fireProjectile() {
    const w = this.weapon;
    const t = TIERS[w.tier];
    const pellets = w.pellets || 1;
    const baseDir = (this.aiming ? this.aim : this.facing).clone().normalize();
    if (this.aiming) baseDir.y = clamp(Math.sin(this.aimPitch || 0) * 0.3, -0.18, 0.18);
    baseDir.normalize();

    for (let p = 0; p < pellets; p++) {
      const dir = baseDir.clone();
      if (w.spread) {
        const spreadAmt = w.spread * (this.ads ? 0.3 : this.focus ? 0.55 : 1);
        const a = rand(-spreadAmt, spreadAmt);
        const c = Math.cos(a), s = Math.sin(a);
        dir.set(dir.x * c - dir.z * s, 0, dir.x * s + dir.z * c).normalize();
      }
      const origin = this.headPos().addScaledVector(dir, 1.1);
      origin.y -= 0.55;

      let mesh;
      if (w.splash) {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6), new THREE.MeshBasicMaterial({ color: t.glow }));
      } else {
        /* tracer round: a thin stretched box */
        mesh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 1.6), new THREE.MeshBasicMaterial({ color: t.glow }));
      }
      mesh.position.copy(origin);
      mesh.lookAt(origin.clone().add(dir));
      State.scene.add(mesh);

      const vel = dir.clone().multiplyScalar(w.projSpeed);
      if (w.fuse) vel.y += 6.5;
      if (w.arc) vel.y += 7;

      State.projectiles.push({
        mesh, owner: this, weapon: w, vel,
        life: w.fuse ? 6 : 2.6, fuse: w.fuse || 0, arc: w.arc || 0,
        hit: new Set(), pierce: !!w.pierce,
      });
    }
  }

  outgoingDamage(w) {
    const rage = State.time < this.rageUntil ? this.rageMult : 1;
    return (w.dmg || 0) * rage;
  }

  resolveMelee() {
    const w = this.weapon;
    const reach = w.range || 3;
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
      f.takeDamage(dmg, this, w);
      hitSomething = true;
      if (w.effect === 'lifesteal') this.hp = Math.min(this.maxHp, this.hp + dmg * (w.steal || 0.3));
      if (w.aoe) {
        for (const o of State.fighters) {
          if (o === this || o === f || o.dead) continue;
          if (o.pos.distanceTo(f.pos) <= w.aoe) o.takeDamage(dmg * 0.55, this, w);
        }
        World.shockwave(f.pos.clone().setY(0.3), TIERS[w.tier].glow, 6, 0.35);
        World.burst(f.pos.clone().setY(1.5), TIERS[w.tier].glow, 16, 9, 1.2);
      }
    }

    if (!hitSomething) World.burst(this.pos.clone().setY(1.6).addScaledVector(fwd, 1.8), 0x9aa7bd, 3, 3, 0.6);
  }

  takeDamage(amount, from, w) {
    if (this.dead) return;
    const now = State.time;

    if (now < this.invulnUntil) { this.floatText('IMMUNE', '#ffd54d'); Sound.shieldHit(); return; }
    if (this.inOwnDome()) { this.floatText('DOME', '#35e0ff'); Sound.shieldHit(); return; }

    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, amount);
      this.shield -= absorbed;
      amount -= absorbed;
      this.floatText('-' + Math.round(absorbed), '#8ef0ff');
      Sound.shieldHit();
      if (amount <= 0) return;
    }

    this.hp -= amount;
    this.hurtFlash = 0.16;
    this.floatText('-' + Math.round(amount), from && from.isPlayer ? '#ffd54d' : '#ff8f8f');
    if (from && from.isPlayer) UI.hitMarker();
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
    if (!this.isPlayer && this.pos.distanceTo(State.player.pos) > 70) return;
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
    /* dying cancels every boost, however much time was left */
    this.speedUntil = 0; this.speedMult = 1;
    this.jumpUntil = 0; this.jumpMult = 1;
    this.rageUntil = 0; this.rageMult = 1;
    this.invulnUntil = 0;
    this.slowUntil = 0;
    this.reloading = 0;
    this.ammo = 0;
    this.barrage = null;
    this.aiming = false;
    this.doubleJumped = false;
    if (this.isPlayer) { UI.updateTraits(); UI.updateAbilities(); }

    if (killer && killer !== this) {
      killer.kills++;
      if (killer.isPlayer) { UI.toast('You eliminated ' + this.name, '#ffd54d'); Sound.pickup('gold'); }
      UI.feed(killer.name + ' eliminated ' + this.name, '#ff9a6b');
      if (chance(0.35)) UI.chat(killer.name, pick(NAME_TAUNTS));
    } else {
      UI.feed(this.name + ' was eliminated', '#ff9a6b');
    }
    if (this.isPlayer) UI.showDeath(killer ? killer.name : 'the void');

    World.burst(this.pos.clone().setY(1.6), this.hero.color, 30, 11, 1.3);
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
    World.burst(this.pos.clone().setY(1.6), this.hero.color, 18, 8, 1);
    Sound.spawn();
    if (this.isPlayer) UI.hideDeath();
  }

  /* ================= per-frame ================= */
  update(dt) {
    if (this.dead) {
      this.respawnT -= dt;
      if (this.respawnT <= 0) this.respawn();
      return;
    }

    const now = State.time;
    if (this.atkCd > 0) this.atkCd -= dt;
    if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - dt * CONFIG.recoilRecovery);
    if (this.muzzleT > 0) {
      this.muzzleT -= dt;
      if (this.muzzleT <= 0 && this.parts.muzzle) this.parts.muzzle.material.opacity = 0;
    }
    if (this.reloading > 0) {
      this.reloading -= dt;
      if (this.reloading <= 0) {
        this.ammo = this.weapon.mag || 0;
        this.reloading = 0;
        if (this.isPlayer) UI.updateAmmo(this.ammo, this.weapon.mag || 0, false);
      }
    }

    if (this.stunT > 0) {
      this.stunT -= dt;
      this.wantMove.set(0, 0, 0);
      this.wantAttack = false;
      this.wantJump = false;
    }

    /* barrage: five fast hits */
    if (this.barrage) {
      this.barrage.timer -= dt;
      if (this.barrage.timer <= 0) {
        this.barrage.timer = 0.11;
        this.barrage.left--;
        const ab = this.barrage.ab;
        const fwd = this.facing.clone().setY(0).normalize();
        for (const f of State.fighters) {
          if (f === this || f.dead) continue;
          const d = new THREE.Vector3().subVectors(f.pos, this.pos).setY(0);
          if (d.length() < 6 && d.clone().normalize().dot(fwd) > 0.3) {
            f.takeDamage(ab.dmg, this, { dmg: ab.dmg, kb: 5, tier: 'galaxy', range: 0, cd: 0 });
          }
        }
        World.burst(this.pos.clone().addScaledVector(fwd, 2.4).setY(1.6), ab.color, 6, 8, 0.9);
        Sound.swing();
        if (this.barrage.left <= 0) this.barrage = null;
      }
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

    /* dome healing only for normal fighters — supers never heal */
    if (!this.noRegen && this.inOwnDome() && this.hp < this.maxHp) {
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
    if (this.wantAbility >= 0) { this.useAbility(this.wantAbility); this.wantAbility = -1; }

    this.physics(dt);
    this.mesh.position.copy(this.pos);

    if (this.facing.lengthSq() > 0.01) {
      this.mesh.rotation.y = Math.atan2(this.facing.x, this.facing.z);
    }

    this.pose(dt, now);
  }

  /* ================= animation =================
     Two layers:
       1. the whole body (locomotion) — driven by the hero's walk style
       2. the arms/head (stance)       — picks idle, gun-ready, aim or swing
     Keeping them apart is what makes it read as a real walk cycle while
     a gun stays levelled at the crosshair.
  */
  pose(dt, now) {
    const p = this.parts;
    const walk = heroWalk(this.heroKey);
    const speedNow = Math.hypot(this.vel.x, this.vel.z);
    const moving = speedNow > 1.2;
    const running = moving && speedNow > CONFIG.walkSpeed * 1.2;
    const speedFrac = clamp(speedNow / CONFIG.walkSpeed, 0, 1.6);

    /* airborne bookkeeping, so landings can be cushioned */
    if (this.grounded && !this.prevGrounded) this.landT = 0.16;
    this.prevGrounded = this.grounded;
    if (!this.grounded) this.airT += dt; else this.airT = 0;
    if (this.landT > 0) this.landT = Math.max(0, this.landT - dt);

    /* advance the cycle: cadence comes from the hero's style */
    if (moving) {
      this.walkAnim += dt * (running ? 15 : 11) * walk.cadence * (0.55 + 0.45 * Math.min(1, speedFrac));
    } else {
      this.walkAnim += dt * 2.2;
    }
    this.walkPhase = this.walkAnim;

    /* ---------- default joint values each frame ---------- */
    this.mesh.rotation.set(0, this.mesh.rotation.y, 0);
    p.head.rotation.set(0, 0, 0);
    p.armL.rotation.set(0, 0, 0);
    p.armR.rotation.set(0, 0, 0);
    p.legL.rotation.set(0, 0, 0);
    p.legR.rotation.set(0, 0, 0);
    p.kneeL.rotation.set(0, 0, 0);
    p.kneeR.rotation.set(0, 0, 0);

    let baseY = 0;            /* body bob applied on top of physics */
    let aimPose = 0;          /* 0 = free arms, 1 = fully aiming a gun */
    let armLx = 0, armRx = 0, armLz = 0, armRz = 0;
    let kneeL = 0, kneeR = 0;
    let headX = 0, headY = 0;
    let bodyLean = 0, bodyRoll = 0;

    if (this.flying) {
      /* ---------------- flight ---------------- */
      bodyLean = moving ? -0.42 : -0.12;
      p.legL.rotation.x = moving ? 0.28 : 0.16;
      p.legR.rotation.x = moving ? 0.2 : 0.2;
      kneeL = moving ? 0.35 : 0.12;
      kneeR = moving ? 0.25 : 0.12;
      armLx = -2.55 + Math.sin(now * 2.2) * 0.06;
      armRx = -2.55 + Math.cos(now * 2.2) * 0.06;
      armLz = 0.38;
      armRz = -0.38;
      baseY = Math.sin(now * 3 + this.id) * 0.12 - 0.1;
      if (chance(0.12)) World.burst(this.pos.clone().setY(this.pos.y - 1.7), this.hero.color, 1, 2, 0.5);
    } else if (!this.grounded) {
      /* ---------------- airborne ---------------- */
      const rising = this.vel.y > 0;
      const t = clamp(this.airT * 4, 0, 1);
      bodyLean = rising ? -0.14 : 0.12;
      p.legL.rotation.x = rising ? -0.85 * t - 0.1 : -0.35 + this.airT * 0.2;
      p.legR.rotation.x = rising ? 0.5 * t : 0.2;
      kneeL = rising ? 1.25 * t : 0.55;
      kneeR = rising ? 0.3 : 0.3;
      armLx = rising ? -1.35 : -0.7;
      armRx = rising ? -0.8 : -0.5;
      armLz = 0.4;
      armRz = -0.35;
    } else if (moving) {
      /* ---------------- walking / running ---------------- */
      const s = Math.sin(this.walkPhase);
      const c = Math.cos(this.walkPhase);
      const sprint = running || State.time < this.speedUntil;
      const stride = walk.stride * (sprint ? 1.25 : 0.85);
      const bounce = walk.bounce * (sprint ? 1.6 : 1);
      const amp = stride * (0.6 + 0.4 * Math.min(1, speedFrac));

      p.legL.rotation.x = s * amp;
      p.legR.rotation.x = -s * amp;
      /* the trailing knee bends hardest as the foot leaves the ground */
      kneeL = Math.max(0, -s) * (sprint ? 1.5 : 0.95);
      kneeR = Math.max(0, s) * (sprint ? 1.5 : 0.95);
      /* slight inward-turning of the feet keeps it from looking mechanical */
      p.legL.rotation.z = 0.04 + Math.sin(this.walkPhase) * 0.02;
      p.legR.rotation.z = -0.04 - Math.sin(this.walkPhase) * 0.02;

      bodyLean = walk.lean + (sprint ? 0.16 : 0);
      bodyRoll = s * walk.sway;
      baseY = Math.abs(c) * bounce - bounce * 0.45;
      headX = sprint ? 0.1 : 0.02;

      armLx = -s * walk.armSwing * (sprint ? 1.35 : 0.85);
      armRx = s * walk.armSwing * (sprint ? 1.35 : 0.85);
      armLz = (sprint ? 0.3 : 0.1);
      armRz = -(sprint ? 0.3 : 0.1);

      /* ---- per-style flourishes that make each hero read differently ---- */
      switch (walk.style) {
        case 'march':
          p.legL.rotation.x = Math.max(0, s) * 0.55 - 0.2;
          p.legR.rotation.x = Math.max(0, -s) * 0.55 - 0.2;
          kneeL = 0.55 + Math.max(0, s) * 0.4;
          kneeR = 0.55 + Math.max(0, -s) * 0.4;
          armLx = -0.35 + Math.sin(this.walkPhase) * 0.22;
          armRx = -0.35 - Math.sin(this.walkPhase) * 0.22;
          armLz = 0.16; armRz = -0.16;
          baseY = Math.abs(s) * 0.06;
          break;
        case 'stealth':
          bodyLean = 0.28;
          baseY = -0.12 + Math.abs(c) * 0.035;
          p.head.rotation.y = 0;
          headY = Math.sin(now * 0.8 + this.id) * 0.2;
          kneeL = 0.32 + Math.max(0, -s) * 0.5;
          kneeR = 0.32 + Math.max(0, s) * 0.5;
          armLx = 0.5; armRx = -0.35;
          break;
        case 'guard':
          armLx = -0.55 + Math.sin(this.walkPhase) * 0.1;
          armLz = 0.18;
          headX = 0.05;
          bodyRoll = s * 0.025;
          break;
        case 'sprint':
          bodyLean = 0.34 + Math.sin(this.walkPhase * 2) * 0.02;
          armLx = -1.0 + s * 0.6;
          armRx = -1.0 - s * 0.6;
          armLz = 0.24; armRz = -0.24;
          kneeL = 0.6 + Math.max(0, -s) * 0.95;
          kneeR = 0.6 + Math.max(0, s) * 0.95;
          baseY = Math.abs(c) * 0.07;
          break;
        case 'casual':
          p.legL.rotation.x = s * amp * 0.8;
          p.legR.rotation.x = -s * amp * 0.8;
          armLx = -s * 0.3;
          armRx = s * 0.5;
          armLz = 0.28 + Math.sin(this.walkPhase) * 0.05;
          headX = -0.05;
          headY = Math.sin(now * 0.9) * 0.12;
          break;
        case 'swagger':
          bodyRoll = s * walk.sway * 1.6;
          armLx = -s * 0.4;
          armRx = s * 0.4;
          armLz = 0.45 + Math.cos(this.walkPhase) * 0.1;
          armRz = -0.45 - Math.cos(this.walkPhase) * 0.1;
          headX = -0.08;
          p.legR.rotation.z = -0.09;
          p.legL.rotation.z = 0.09;
          break;
        case 'stride':
          p.legL.rotation.x = s * amp * 1.1;
          p.legR.rotation.x = -s * amp * 1.1;
          armLz = 0.34; armRz = -0.34;
          baseY = Math.abs(c) * 0.14;
          bodyRoll = s * 0.045;
          break;
        case 'hover':
          baseY = 0.16 + Math.sin(now * 3.4 + this.id) * 0.1;
          p.legL.rotation.x = Math.sin(this.walkPhase) * 0.3;
          p.legR.rotation.x = -Math.sin(this.walkPhase) * 0.3;
          kneeL = 0.25; kneeR = 0.25;
          armLx = -0.6 + Math.sin(now * 2) * 0.1;
          armRx = -0.35;
          armLz = 0.5;
          bodyLean = 0.12;
          break;
      }
    } else {
      /* ---------------- idle ---------------- */
      const b = Math.sin(now * 1.7 + this.id) * 0.035;
      p.chest.scale.set(1 + b, 1 + b * 0.6, 1 + b);
      bodyLean = 0.02;
      headY = Math.sin(now * 0.6 + this.id) * 0.22;
      headX = Math.sin(now * 0.9 + this.id) * 0.04;
      armLx = b * 1.6;
      armRx = -b * 1.6;
      armLz = 0.08 + b * 0.5;
      armRz = -0.08 - b * 0.5;
      /* weight shifts from foot to foot while standing still */
      const sway = Math.sin(now * 0.9 + this.id);
      bodyRoll = sway * 0.03;
      p.legL.rotation.z = 0.03;
      p.legR.rotation.z = -0.03;
      kneeL = 0.06 + Math.max(0, sway) * 0.1;
      kneeR = 0.06 + Math.max(0, -sway) * 0.1;
      this.stepT = 0;
    }

    /* landing squash */
    if (this.landT > 0) {
      const k = this.landT / 0.16;
      baseY -= Math.sin(k * Math.PI) * 0.16;
      kneeL += Math.sin(k * Math.PI) * 0.5;
      kneeR += Math.sin(k * Math.PI) * 0.5;
    }
    /* walked into a ledge: a small forward stumble */
    if (this.bumpedWall > 0) {
      this.bumpedWall -= dt;
      bodyLean += Math.sin((this.bumpedWall / 0.25) * Math.PI) * 0.1;
    }

    /* ---------------- upper body stance ---------------- */
    const armed = this.weapon.kind === 'ranged' || this.weapon.kind === 'thrown';
    /* guns are levelled even when you aren't jumping or flying */
    if (armed && this.grounded && !this.flying) aimPose = this.aiming ? 1 : 0.55;
    if (this.ads) aimPose = 1;
    else if (this.focus) aimPose = Math.max(aimPose, 0.82);
    this.upperBlend += ((aimPose) - this.upperBlend) * (1 - Math.exp(-dt * 12));

    if (this.upperBlend > 0.01) {
      const k = this.upperBlend;
      const both = armed && this.grounded;
      armRx = armRx * (1 - k) + (-1.5) * k;
      armRz = armRz * (1 - k) + (-0.1) * k;
      if (both) {
        armLx = armLx * (1 - k) + (-1.42) * k;
        armLz = armLz * (1 - k) + (0.52) * k;
        headX = headX * (1 - k) + 0.06 * k;
      }
      if (this.ads) {
        armRx = -1.6;
        armLx = -1.56;
        armLz = 0.58;
        headX = 0.12;
        baseY -= 0.04;
      }
    }

    /* guard stance for shield heroes, unless they're mid-swing */
    if (this.hero.guard && !this.flying && this.swingT <= 0 && this.upperBlend < 0.4) {
      armLx = -1.5;
      armLz = 0.25;
      p.armL.rotation.y = 0.2;
      headX = 0.08;
    } else {
      p.armL.rotation.y = 0;
    }

    /* apply everything */
    this.mesh.rotation.x = bodyLean;
    this.mesh.rotation.z = bodyRoll;
    p.armL.rotation.x = armLx;
    p.armR.rotation.x = armRx;
    p.armL.rotation.z = armLz;
    p.armR.rotation.z = armRz;
    p.kneeL.rotation.x = kneeL;
    p.kneeR.rotation.x = kneeR;
    p.head.rotation.x += headX;
    p.head.rotation.y += headY;
    this.mesh.position.y += baseY;

    /* ---------------- swing / recoil ---------------- */
    if (this.swingT > 0) {
      this.swingT -= dt;
      const k = 1 - Math.max(0, this.swingT) / 0.22;
      p.armR.rotation.x = -Math.sin(k * Math.PI) * 2.1;
      p.armR.rotation.z = -Math.sin(k * Math.PI) * 0.4;
      /* melee swings twist the torso too */
      if (this.weapon.kind === 'melee') this.mesh.rotation.y += Math.sin(k * Math.PI) * 0.35;
    }
    if (this.recoil > 0) {
      this.weaponMount.position.z = 0.1 - this.recoil * 1.1;
      this.weaponMount.rotation.x = -this.recoil * 1.6;
    } else {
      this.weaponMount.position.z = 0.1;
      this.weaponMount.rotation.x = 0;
    }
    /* weapon sway while moving or aiming */
    if (this.weaponMount && this.weapon.kind !== 'melee') {
      const swayAmp = CONFIG.weaponSway * (this.ads ? 0.45 : 1);
      const speedFrac2 = Math.min(1, Math.hypot(this.vel.x, this.vel.z) / CONFIG.walkSpeed);
      this.weaponMount.rotation.z = Math.sin(now * 7 + this.id) * swayAmp * speedFrac2;
      this.weaponMount.rotation.y = Math.cos(now * 5.5 + this.id) * swayAmp * 0.6 * speedFrac2;
      this.weaponMount.position.x = Math.sin(now * 7 + this.id) * swayAmp * 0.35 * speedFrac2;
    }

    /* weapon switch: the gun drops out of frame and comes back up */
    if (this.switchT > 0) {
      this.switchT -= dt;
      const k = 1 - Math.max(0, this.switchT) / CONFIG.switchTime;
      const dip = Math.sin(k * Math.PI);
      this.weaponMount.position.y = -1.02 - dip * 0.55;
      this.weaponMount.rotation.x = -dip * 0.9;
    }

    /* reload: tilt the gun down while the mag swaps */
    if (this.reloading > 0 && this.switchT <= 0) {
      const w = this.weapon;
      const k = 1 - this.reloading / ((w.reload || 1.6) * CONFIG.reloadSpeedMult);
      this.weaponMount.rotation.x = Math.sin(k * Math.PI) * 0.9;
      this.weaponMount.position.y = -1.02 - Math.sin(k * Math.PI) * 0.25;
    } else {
      this.weaponMount.position.y = -1.02;
    }

    /* cape sway */
    if (p.cape) {
      p.cape.rotation.x = this.flying ? 0.5 + Math.sin(now * 6) * 0.08 : Math.sin(now * 2.2) * 0.08;
      p.cape.position.z = -0.32 - (this.flying ? 0.15 : 0);
    }

    /* powered aura + eyes */
    const powered = this.powered;
    p.aura.visible = powered;
    if (powered) {
      p.aura.material.opacity = 0.35 + Math.sin(now * 4) * 0.18;
      p.aura.rotation.z += dt * 1.2;
      p.glowSprite.material.opacity = 0.18 + Math.sin(now * 3) * 0.06;
      p.glowSprite.material.color.setHex(this.hero.color);
    } else {
      p.glowSprite.material.opacity = 0;
    }

    if (this.hurtFlash > 0) {
      this.hurtFlash -= dt;
      this.materials[0].color.setHex(0xff6b6b);
      this.materials[1].color.setHex(0xff6b6b);
    } else {
      this.materials[0].color.setHex(this.hero.suit);
      this.materials[1].color.setHex(this.hero.accent);
    }

    this.bubble.visible = this.shield > 0;
    if (this.bubble.visible) this.bubble.material.opacity = 0.12 + 0.1 * Math.sin(now * 6);

    /* chest only breathes while idle; reset it in other states */
    if (!(this.grounded && !this.flying && Math.hypot(this.vel.x, this.vel.z) <= 1.2)) {
      p.chest.scale.set(1, 1, 1);
    }
  }
}


/* ===== 06_ai.js ===== */
'use strict';

/* ============================================================
   BOT BRAIN — loots blocks, fights, and uses hero powers
   ============================================================ */

const BLOCK_VALUE = { big: 4.0, rng: 3.0, galaxy: 2.6, super: 6.0, loose: 1.0 };

function nearestTarget(bot) {
  let best = null, bestD = Infinity;
  for (const f of State.fighters) {
    if (f === bot || f.dead) continue;
    if (f.inOwnDome() && !f.powered) continue;
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

function walkable(x, z) { return walkableAt(x, z); }

function walkableDir(bot, dx, dz) {
  const angles = [0, 0.28, -0.28, 0.6, -0.6, 0.95, -0.95, 1.35, -1.35, 1.8, -1.8, 2.4, -2.4];
  for (const a of angles) {
    const c = Math.cos(a), s = Math.sin(a);
    const nx = dx * c - dz * s;
    const nz = dx * s + dz * c;
    if (walkable(bot.pos.x + nx * 2.8, bot.pos.z + nz * 2.8)) return [nx, nz];
  }
  return null;
}

function steerTo(bot, tx, tz) {
  let dx = tx - bot.pos.x, dz = tz - bot.pos.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.001) return;
  dx /= d; dz /= d;

  if (bot.flying) { bot.wantMove.set(dx, 0, dz); return; }

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
  if (safe) bot.wantMove.set(safe[0], 0, safe[1]);
  else {
    const r = Math.hypot(bot.pos.x, bot.pos.z) || 1;
    bot.wantMove.set(-bot.pos.x / r, 0, -bot.pos.z / r);
    if (bot.grounded && chance(0.05)) bot.wantJump = true;
  }
}

function setState(bot, s) {
  if (bot.state !== s) { bot.state = s; bot.stateT = rand(0.6, 1.8); }
}

/* fire the best ready power at whatever is in front of us */
function tryPowers(bot, dist) {
  if (!bot.powered) return;
  const now = State.time;
  const abil = bot.hero.abilities;
  for (let i = 0; i < abil.length; i++) {
    if (bot.abCd[i] > now) continue;
    const ab = abil[i];
    const usable =
      (ab.type === 'beam' && dist < 40) ||
      (ab.type === 'punch' && dist < 6.5) ||
      (ab.type === 'barrage' && dist < 6) ||
      (ab.type === 'yell' && dist < 15) ||
      (ab.type === 'dash' && dist > 6 && dist < 22) ||
      (ab.type === 'slam' && dist < 10) ||
      (ab.type === 'throw' && dist < 30) ||
      (ab.type === 'shield' && bot.hp < bot.maxHp * 0.6);
    if (!usable) continue;
    if (chance(0.35 + bot.personality.skill * 0.5)) {
      bot.wantAbility = i;
      return;
    }
  }
}

function botThink(bot, dt) {
  if (bot.dead) return;
  bot.think -= dt;
  bot.stateT -= dt;
  bot.wantMove.set(0, 0, 0);

  if (bot.stunT > 0) { bot.stunT -= dt; return; }

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

    if (hpFrac < 0.22 && !bot.inOwnDome() && !bot.noRegen && chance(0.55 + p.caution * 0.4)) {
      setState(bot, 'flee');
    } else if (bot.inOwnDome() && hpFrac < 0.92 && !bot.noRegen) {
      setState(bot, 'heal');
    } else if (!armed && !bot.inOwnDome()) {
      setState(bot, 'loot');
    } else if (nt.target && nt.dist < 26 + p.aggression * 12) {
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
      if (prize) steerTo(bot, prize.x, prize.z);
      else {
        const a = now * 0.6 + bot.id;
        bot.wantMove.set(Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4);
      }
      if (hpFrac > 0.95 && chance(0.4)) setState(bot, 'hunt');
      break;
    }

    case 'hunt': {
      const t = bot.nearTarget;
      if (!t || t.dead) { setState(bot, 'loot'); break; }

      const dx = t.pos.x - bot.pos.x, dz = t.pos.z - bot.pos.z;
      const dist = Math.hypot(dx, dz);
      bot.facing.set(dx, 0, dz).normalize();
      const range = bot.weapon.range || 3;

      tryPowers(bot, dist);

      if (bot.hesitate > 0) { bot.hesitate -= dt; break; }

      if (dist > range * 0.85) {
        steerTo(bot, t.pos.x, t.pos.z);
        if (Math.abs(t.pos.y - bot.pos.y) > 2.2 && chance(0.08)) bot.wantJump = true;
      } else {
        bot.strafeT -= dt;
        if (bot.strafeT <= 0) { bot.strafeT = rand(0.7, 2.0); bot.strafeDir *= chance(0.35) ? -1 : 1; }
        const px = -dz / (dist || 1), pz = dx / (dist || 1);
        bot.wantMove.set(px * bot.strafeDir * 0.75, 0, pz * bot.strafeDir * 0.75);
        const probeX = bot.pos.x + bot.wantMove.x * 1.6;
        const probeZ = bot.pos.z + bot.wantMove.z * 1.6;
        if (!bot.flying && groundAt(probeX, probeZ) === null) steerTo(bot, t.pos.x, t.pos.z);

        if (bot.reactionT <= 0 && bot.atkCd <= 0) {
          const whiff = chance((1 - p.skill) * 0.28);
          if (whiff) { bot.wantAttack = true; bot.atkCd = bot.weapon.cd * rand(0.6, 1.0); }
          else if (dist <= range * 0.95) {
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
      const prize = bot.blockCd > 0 ? null : nearestChamberPrize(bot, armed ? 14 : 30);
      const block = bot.blockCd > 0 ? null : bestBlock(bot, armed ? 34 : 60);

      if (prize && (!block || chance(0.5))) steerTo(bot, prize.x, prize.z);
      else if (block) {
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

      if (bot.nearTarget && bot.nearDist < (bot.weapon.range || 3) * 0.8 && bot.atkCd <= 0 && chance(0.5)) {
        bot.facing.set(bot.nearTarget.pos.x - bot.pos.x, 0, bot.nearTarget.pos.z - bot.pos.z).normalize();
        bot.wantAttack = true;
      }
      if (bot.nearTarget) tryPowers(bot, bot.nearDist);
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
   UI — HUD, inventory, trait icons, ability bar, hero picker
   ============================================================ */


/* ---------- generated hero portraits (original art, drawn in canvas) ---------- */
function rgba(hex, a) {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}
const PORTRAIT_CACHE = {};

function makeHeroPortrait(key) {
  if (PORTRAIT_CACHE[key]) return PORTRAIT_CACHE[key];
  const h = HEROES[key];
  const look = heroLook(key);
  const c = document.createElement('canvas');
  c.width = 128; c.height = 160;
  const g = c.getContext('2d');

  const bg = g.createRadialGradient(64, 70, 6, 64, 90, 130);
  bg.addColorStop(0, rgba(h.color, 0.55));
  bg.addColorStop(0.55, rgba(h.suit, 0.92));
  bg.addColorStop(1, '#05070f');
  g.fillStyle = bg;
  g.fillRect(0, 0, 128, 160);

  if (look.capeColor) {
    g.fillStyle = rgba(look.capeColor, 0.95);
    g.beginPath();
    g.moveTo(24, 118); g.lineTo(104, 118); g.lineTo(120, 160); g.lineTo(8, 160);
    g.closePath(); g.fill();
  }

  g.fillStyle = rgba(h.suit, 1);
  g.beginPath();
  g.moveTo(10, 160); g.quadraticCurveTo(24, 116, 64, 116);
  g.quadraticCurveTo(104, 116, 118, 160);
  g.closePath(); g.fill();

  g.strokeStyle = rgba(h.accent, 1); g.lineWidth = 3;
  g.beginPath(); g.moveTo(26, 130); g.quadraticCurveTo(64, 118, 102, 130); g.stroke();

  g.fillStyle = rgba(look.pads || h.accent, 1);
  for (const s of [-1, 1]) {
    g.beginPath(); g.ellipse(64 + s * 41, 127, 13, 9, 0, 0, 6.3); g.fill();
  }

  g.fillStyle = '#e8b98d';
  g.fillRect(56, 100, 16, 22);

  g.fillStyle = '#f2c49a';
  g.beginPath(); g.ellipse(64, 74, 27, 33, 0, 0, 6.3); g.fill();
  g.fillStyle = 'rgba(180,120,80,0.16)';
  g.beginPath(); g.ellipse(64, 93, 20, 12, 0, 0, 6.3); g.fill();
  g.fillStyle = '#eebd92';
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(64 + s * 27, 76, 5, 8, 0, 0, 6.3); g.fill(); }

  const hair = look.hairColor || 0x2a2c33;
  g.fillStyle = rgba(hair, 1);
  if (look.hair === 'spiky') {
    for (let i = 0; i < 10; i++) {
      const x = 38 + i * 5.4;
      g.beginPath();
      g.moveTo(x, 54); g.lineTo(x + 3, 24 + (i % 3) * 7); g.lineTo(x + 7, 54);
      g.closePath(); g.fill();
    }
  } else if (look.hair === 'bald') {
    /* bald */
  } else if (look.hair === 'mask') {
    g.fillStyle = rgba(look.maskColor || 0x0d1015, 1);
    g.beginPath(); g.ellipse(64, 74, 28, 34, 0, 0, 6.3); g.fill();
  } else if (look.hair === 'long') {
    g.beginPath(); g.ellipse(64, 52, 30, 22, 0, 0, 6.3); g.fill();
    g.fillRect(33, 58, 9, 58); g.fillRect(86, 58, 9, 58);
  } else {
    g.beginPath(); g.ellipse(64, 54, 28, 20, 0, 0, 6.3); g.fill();
    if (look.hair === 'swept') {
      g.beginPath(); g.ellipse(57, 52, 26, 12, -0.22, 0, 6.3); g.fill();
    }
  }

  const eyeCol = look.eyes;
  for (const s of [-1, 1]) {
    g.fillStyle = '#f7f9ff';
    g.beginPath(); g.ellipse(64 + s * 11, 72, 7, 4.6, 0, 0, 6.3); g.fill();
    if (eyeCol) { g.shadowColor = rgba(eyeCol, 1); g.shadowBlur = 14; }
    g.fillStyle = eyeCol ? rgba(eyeCol, 1) : '#1b2230';
    g.beginPath(); g.arc(64 + s * 11, 72, 3.6, 0, 6.3); g.fill();
    g.shadowBlur = 0;
  }

  g.strokeStyle = rgba(hair, 0.9); g.lineWidth = 2.6;
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(64 + s * 6, 64); g.lineTo(64 + s * 17, 62); g.stroke();
  }
  g.strokeStyle = 'rgba(150,100,70,0.5)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(64, 74); g.lineTo(62, 85); g.stroke();
  g.strokeStyle = 'rgba(120,60,60,0.7)';
  g.beginPath(); g.moveTo(57, 92); g.quadraticCurveTo(64, 95, 71, 92); g.stroke();

  if (look.beard) {
    g.fillStyle = rgba(hair, 0.95);
    g.beginPath(); g.ellipse(64, 96, 20, 12, 0, 0, Math.PI); g.fill();
  }
  if (look.stache) {
    g.fillStyle = rgba(hair, 1);
    g.fillRect(56, 88, 16, 4);
  }

  if (h.emblem) {
    g.fillStyle = rgba(look.emblemColor || 0xffd23d, 1);
    g.beginPath(); g.arc(64, 138, 11, 0, 6.3); g.fill();
    g.fillStyle = 'rgba(6,10,20,0.9)';
    g.font = 'bold 15px Arial';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(h.emblem, 64, 139);
  }

  g.fillStyle = 'rgba(0,0,0,0.12)';
  for (let y = 0; y < 160; y += 3) g.fillRect(0, y, 128, 1);
  const vg = g.createLinearGradient(0, 96, 0, 160);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = vg; g.fillRect(0, 96, 128, 64);

  const url = c.toDataURL('image/png');
  PORTRAIT_CACHE[key] = url;
  return url;
}

const UI = {
  el: {},
  plates: new Map(),
  floaters: [],
  feedItems: [],
  toastT: 0,
  boardTick: 0,
  traitTick: 0,
  selectedHero: 'homelander',

  init() {
    const $ = id => document.getElementById(id);
    this.el = {
      hpFill: $('hp-fill'), hpText: $('hp-text'), shieldFill: $('shield-fill'),
      weaponName: $('weapon-name'), weaponTier: $('weapon-tier'), playerName: $('player-name'),
      aliveCount: $('alive-count'), bigTimer: $('big-timer'), chamberTimer: $('chamber-timer'),
      galaxyTimer: $('galaxy-timer'), rngTimer: $('rng-timer'), superTimer: $('super-timer'),
      feed: $('feed'), chat: $('chat'), toast: $('toast'), announce: $('announce'),
      plates: $('plates'), floats: $('floats'), board: $('board'),
      death: $('death'), deathBy: $('death-by'), deathTimer: $('death-timer'),
      hud: $('hud'), muteState: $('mute-state'), build: $('build'), killCount: $('kill-count'),
      inv: $('inv'), traits: $('traits'), abilities: $('abilities'),
      ammo: $('ammo-display'), hitmarker: $('hitmarker'),
      heroGrid: $('hero-grid'), nameInput: $('name-input'), heroPreview: $('hero-preview'),
    };
    this.el.build.textContent = 'v' + BUILD.version + ' · ' + BUILD.stamp;

    for (const f of State.fighters) this.makePlate(f);
    this.buildInvBar();
    this.buildHeroPicker();
    this.buildAbilityBar();
    this.updateInv();
    this.updateBoard();
    this.updateTraits();
  },

  /* ---------- start screen ---------- */
  buildHeroPicker() {
    const grid = this.el.heroGrid;
    if (!grid) return;
    grid.innerHTML = '';
    for (const key of HERO_KEYS) {
      const h = HEROES[key];
      const b = document.createElement('button');
      b.className = 'hero-card' + (key === this.selectedHero ? ' sel' : '');
      b.style.setProperty('--hc', hexStr(h.color));
      b.style.setProperty('--hs', hexStr(h.suit));
      b.innerHTML = '<img class="hp" alt="" src="' + makeHeroPortrait(key) + '" />' +
        '<span class="hinfo"><span class="hn">' + escapeHtml(h.name) + '</span>' +
        '<span class="ht">' + (h.flight ? 'FLIGHT' : h.guard ? 'GUARD' : h.speedster ? 'SPEED' : 'BRAWLER') + '</span></span>';
      b.addEventListener('click', () => {
        this.selectedHero = key;
        Sound.uiClick();
        for (const c of grid.children) c.classList.remove('sel');
        b.classList.add('sel');
        this.el.nameInput.style.borderColor = hexStr(h.color);
        this.updateHeroPreview();
      });
      grid.appendChild(b);
    }
    this.updateHeroPreview();
  },

  updateHeroPreview() {
    const h = HEROES[this.selectedHero];
    if (!this.el.heroPreview) return;
    this.el.heroPreview.innerHTML =
      '<b style="color:' + hexStr(h.color) + '">' + escapeHtml(h.name) + '</b>' +
      '<span>' + h.abilities.map(a => a.name).join(' · ') + '</span>';
  },

  playerNameValue() {
    const v = (this.el.nameInput && this.el.nameInput.value || '').trim();
    return v ? v.slice(0, 18) : null;
  },

  /* ---------- plates / inventory ---------- */
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

  updateAmmo(current, max, reloading) {
    const el = this.el.ammo;
    if (!el) return;
    if (reloading) {
      el.textContent = 'RELOADING';
      el.className = 'reloading';
    } else if (max > 0) {
      el.textContent = current + ' / ' + max;
      el.className = current <= max * 0.25 ? 'low' : '';
    } else {
      el.textContent = '∞';
      el.className = '';
    }
  },

  hitMarker() {
    const el = this.el.hitmarker;
    if (!el) return;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(this._hmT);
    this._hmT = setTimeout(() => el.classList.remove('show'), 170);
  },

  /* ---------- ability bar ---------- */
  buildAbilityBar() {
    const bar = this.el.abilities;
    if (!bar) return;
    bar.innerHTML = '';
    const keys = ['Q', 'E', 'R'];
    for (let i = 0; i < 3; i++) {
      const d = document.createElement('div');
      d.className = 'ability';
      d.innerHTML = '<span class="akey">' + keys[i] + '</span><span class="anm"></span><span class="afill"></span>';
      bar.appendChild(d);
    }
  },

  updateAbilities() {
    const p = State.player;
    const bar = this.el.abilities;
    if (!p || !bar) return;
    bar.style.display = p.powered ? 'flex' : 'none';
    if (!p.powered) return;
    const now = State.time;
    for (let i = 0; i < bar.children.length; i++) {
      const cell = bar.children[i];
      const ab = p.hero.abilities[i];
      if (!ab) { cell.style.display = 'none'; continue; }
      cell.style.display = 'block';
      cell.querySelector('.anm').textContent = ab.name;
      cell.style.setProperty('--ac', hexStr(ab.color));
      const cd = Math.max(0, p.abCd[i] - now);
      const frac = ab.cd > 0 ? clamp(cd / ab.cd, 0, 1) : 0;
      const fill = cell.querySelector('.afill');
      fill.style.height = (frac * 100) + '%';
      cell.classList.toggle('ready', cd <= 0);
    }
  },

  /* ---------- trait icons ---------- */
  updateTraits() {
    const p = State.player;
    const box = this.el.traits;
    if (!p || !box) return;
    const list = p.traits();
    box.innerHTML = '';
    for (const t of list) {
      const d = document.createElement('div');
      d.className = 'trait' + (t.permanent ? ' perm' : '');
      const fade = t.permanent ? 1 : clamp(t.remaining / t.total, 0.15, 1);
      d.style.opacity = String(fade);
      d.style.setProperty('--tc', t.color);
      d.innerHTML = '<span class="ticon">' + t.icon + '</span><span class="tname">' + escapeHtml(t.name) + '</span>';
      box.appendChild(d);
    }
  },

  /* ---------- world text ---------- */
  floatText(worldPos, text, color) {
    if (this.floaters.length > 80) return;
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
    this.toastT = 1.6;
  },

  /* lobby-wide announcement, used for the Super block */
  broadcast(text, color) {
    const a = this.el.announce;
    if (a) {
      a.textContent = text;
      a.style.color = color || '#fff';
      a.style.opacity = '1';
      a.style.transform = 'translate(-50%, 0) scale(1)';
      clearTimeout(this._annT);
      this._annT = setTimeout(() => { a.style.opacity = '0'; a.style.transform = 'translate(-50%,-14px) scale(0.96)'; }, 3200);
    }
    this.feed(text, color);
    Sound.glitch();
  },

  showDeath(by) { this.el.deathBy.textContent = by; this.el.death.style.display = 'flex'; },
  hideDeath() { this.el.death.style.display = 'none'; },

  update(dt) {
    const p = State.player;

    const hpPct = clamp(p.hp / p.maxHp, 0, 1) * 100;
    this.el.hpFill.style.width = hpPct + '%';
    this.el.hpFill.style.background = hpPct > 55 ? 'linear-gradient(90deg,#3ddc84,#8ef07a)'
      : hpPct > 25 ? 'linear-gradient(90deg,#ffb648,#ffe07a)' : 'linear-gradient(90deg,#ff4d4d,#ff8f6b)';
    this.el.hpText.textContent = Math.max(0, Math.ceil(p.hp)) + ' / ' + p.maxHp;
    this.el.shieldFill.style.width = clamp(p.shield / 400, 0, 1) * 100 + '%';

    const w = p.weapon;
    this.el.weaponName.textContent = w.name + (w.mag ? '  [' + p.ammo + '/' + w.mag + ']' : '');
    const t = TIERS[w.tier];
    this.el.weaponTier.textContent = t.label;
    this.el.weaponTier.style.color = hexStr(t.glow);
    this.el.weaponTier.style.borderColor = hexStr(t.glow);
    this.el.playerName.textContent = p.name + '  ·  ' + p.hero.name;
    this.el.playerName.style.color = hexStr(p.hero.color);
    this.el.killCount.textContent = p.kills;
    this.updateAmmo(p.ammo, w.mag || 0, p.reloading > 0);

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

    if (this.el.superTimer) {
      const superLive = State.blocks.some(b => b.kind === 'super');
      this.el.superTimer.textContent = State.superUnlocked ? 'TAKEN' : superLive ? 'LIVE' : World.formatTime(Math.max(0, State.timers.super));
      this.el.superTimer.style.color = State.superUnlocked ? '#8ea0c8' : '#ff5ce1';
    }

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
      plate.bar.style.background = f.powered ? hexStr(f.hero.color)
        : f.hp / f.maxHp > 0.5 ? '#5ef08a' : f.hp / f.maxHp > 0.25 ? '#ffb648' : '#ff5d5d';
      if (plate.name.textContent !== f.name) plate.name.textContent = f.name;
      plate.name.style.color = hexStr(f.hero.color);
      plate.name.style.textShadow = f.powered
        ? '0 0 8px ' + hexStr(f.hero.color) + ', 0 1px 3px #000' : '0 1px 3px #000';
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

    this.traitTick += 1;
    if (this.traitTick % 6 === 0) { this.updateTraits(); this.updateAbilities(); }
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
      html += '<div' + cls + '><span class="dot" style="background:' + hexStr(f.hero.color) + '"></span>' +
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
  camDist: 26,
  keys: Object.create(null),
  mouseDown: false,
  ads: false,             /* right button held */
  focus: false,           /* left button held with a gun out */
  aimBlend: 0,            /* smoothed 0..1 from ads */
  focusBlend: 0,          /* smoothed 0..1 from focus */
  locked: false,
  lastT: 0,
  frameAvg: 0,
  quality: 1,
  basePixelRatio: 1,

  init() {
    const canvas = document.getElementById('scene');
    this.debugFlags();
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.basePixelRatio = Math.min(window.devicePixelRatio || 1, CONFIG.maxPixelRatio);
    this.renderer.setPixelRatio(this.basePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    if ('outputColorSpace' in this.renderer) this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    State.scene = new THREE.Scene();
    State.camera = new THREE.PerspectiveCamera(CONFIG.baseFOV, window.innerWidth / window.innerHeight, 0.1, 1800);
    this.camera = State.camera;
    this.camera.position.set(0, 26, 60);

    World.init(this.renderer, State.scene);
    UI.init();
    this.spawnLobby();
    for (const f of State.fighters) UI.makePlate(f);
    this.bindInput();

    World.spawnBlock('big', 0, 0, { big: true, kind: 'big', y: BIG_SIZE * 0.5 + 3.6 });
    World.spawnBlock('galaxy', 42, -30, { kind: 'galaxy' });
    World.spawnBlock('rng', -40, 36, { kind: 'rng' });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.4;
      const r = i % 2 ? 48 : 96;
      World.spawnBlock(rollTier(), Math.cos(a) * r, Math.sin(a) * r, { kind: 'loose' });
    }

    this.lastT = performance.now();
    requestAnimationFrame(t => this.loop(t));
    if (this.autoStart) setTimeout(() => this.startMatch && this.startMatch(), 60);
  },

  spawnLobby() {
    const used = new Set();
    const pool = HERO_KEYS.slice();
    /* every bot wears a different hero skin */
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    const playerHero = UI.selectedHero || 'homelander';
    const botHeroes = pool.filter(k => k !== playerHero);
    const count = CONFIG.botCount + 1;

    for (let i = 0; i < count; i++) {
      const isPlayer = i === 0;
      const heroKey = isPlayer ? playerHero : botHeroes[(i - 1) % botHeroes.length];
      const f = new Fighter({
        name: isPlayer ? (UI.playerNameValue() || randomGamertag(used)) : randomGamertag(used),
        isPlayer, baseIndex: i, heroKey,
      });
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
      if (slotKey && State.started && State.player) State.player.useSlot(parseInt(slotKey[1], 10) - 1);

      if (e.code === 'KeyG' && State.started && State.player) {
        State.player.dropSlot(State.player.slotIndex);
      }

      const abilKey = { KeyQ: 0, KeyE: 1, KeyR: 2 }[e.code];
      if (abilKey !== undefined && State.started && State.player) {
        const pl = State.player;
        /* R reloads the gun when it needs it, otherwise fires ability 3 */
        if (e.code === 'KeyR' && pl.weapon.mag && pl.ammo < pl.weapon.mag) {
          pl.startReload();
        } else if (pl.powered) {
          pl.wantAbility = abilKey;
        }
      }
      if (e.code === 'Space' && State.started) e.preventDefault();
    });
    document.addEventListener('keyup', e => { this.keys[e.code] = false; });

    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) {
        this.mouseDown = true;
        this.focus = true;
        if (!this.locked && State.started) canvas.requestPointerLock();
      }
    });
    window.addEventListener('mouseup', e => {
      if (e.button === 0) { this.mouseDown = false; this.focus = false; }
      if (e.button === 2) this.ads = false;
    });
    canvas.addEventListener('mousedown', e => {
      if (e.button === 2) this.ads = true;
    });
    window.addEventListener('blur', () => { this.mouseDown = false; this.focus = false; this.ads = false; });
    window.addEventListener('contextmenu', e => e.preventDefault());

    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === canvas;
      document.getElementById('lockhint').style.display = (!this.locked && State.started) ? 'block' : 'none';
    });

    document.addEventListener('mousemove', e => {
      if (!this.locked) return;
      this.yaw -= e.movementX * 0.0024;
      this.pitch = clamp(this.pitch - e.movementY * 0.0022, -0.95, 0.5);
    });

    window.addEventListener('wheel', e => {
      this.camDist = clamp(this.camDist + Math.sign(e.deltaY) * 2, 12, 60);
    }, { passive: true });

    const startMatch = () => {
      if (State.started) return;
      Sound.init();
      Sound.resume();
      Sound.uiClick();

      /* apply the chosen name + hero skin */
      const p = State.player;
      const nm = UI.playerNameValue();
      if (nm) p.name = nm;
      if (UI.selectedHero && UI.selectedHero !== p.heroKey) p.setHero(UI.selectedHero);
      UI.updateInv();
      UI.updateTraits();

      document.getElementById('start').style.display = 'none';
      document.getElementById('hud').style.display = 'block';
      State.started = true;
      canvas.focus();
      canvas.requestPointerLock && canvas.requestPointerLock();
      UI.toast('Walk into blocks · roll the Super block for powers', '#8ef0ff');
      UI.feed('Big void block is live in the centre', '#35e0ff');
    };
    document.getElementById('play-btn').addEventListener('click', startMatch);
    this.startMatch = startMatch;
    this.autoStart = /[?&](auto|play)(=1)?\b/.test(location.search);
    /* Enter also starts a match, for keyboard-only players */
    document.addEventListener('keydown', e => {
      if (!State.started && (e.code === 'Enter' || e.code === 'NumpadEnter')) {
        e.preventDefault();
        startMatch();
      }
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

    /* aim at the crosshair, independent of where you are running */
    p.aim.copy(fwd);
    p.aimPitch = this.pitch;
    p.aiming = (p.weapon.kind === 'ranged' || p.weapon.kind === 'thrown');
    /* left button with a gun out = focus zoom; right button = full ADS */
    const gunOut = p.weapon.kind === 'ranged';
    p.ads = this.ads && gunOut;
    p.focus = this.focus && gunOut && !p.ads;

    if (this.mouseDown && this.locked) {
      p.wantAttack = true;
      p.facing.copy(fwd);
    } else if (p.aiming) {
      p.facing.copy(fwd);
    } else if (dir.lengthSq() > 0.01) {
      p.facing.copy(dir.normalize());
    }
  },

  updateCamera(dt) {
    const p = State.player;

    /* top-down debug view of the whole map */
    if (this.mapView) {
      const d = p ? p.pos : new THREE.Vector3();
      this.camera.position.set(d.x + 0.01, 430, d.z + 0.01);
      this.camera.up.set(0, 0, -1);
      this.camera.lookAt(d.x, 0, d.z);
      this.camera.up.set(0, 1, 0);
      this.camera.fov = 50;
      this.camera.updateProjectionMatrix();
      return;
    }

    /* smooth the two zoom inputs: right button = ADS, left = focus */
    const adsTarget = this.ads && p && p.weapon.kind === 'ranged' ? 1 : 0;
    const focusTarget = this.focus && p && p.weapon.kind === 'ranged' && !adsTarget ? 1 : 0;
    const aIn = 1 - Math.exp(-dt * CONFIG.aimInSpeed);
    const aOut = 1 - Math.exp(-dt * CONFIG.aimOutSpeed);
    this.aimBlend += (adsTarget - this.aimBlend) * (adsTarget > this.aimBlend ? aIn : aOut);
    this.focusBlend += (focusTarget - this.focusBlend) * (focusTarget > this.focusBlend ? aIn : aOut);
    this.aimBlend = clamp(this.aimBlend, 0, 1);
    this.focusBlend = clamp(this.focusBlend, 0, 1);

    const zoom = Math.max(this.aimBlend, this.focusBlend * CONFIG.focusBlend);

    const target = p.pos.clone().add(new THREE.Vector3(0, 3.4, 0));
    if (p.dead) target.y += 2;

    const cp = Math.cos(this.pitch);
    const baseDist = this.camDist;
    const aimDist = CONFIG.adsCamDist + (this.camDist - 26) * 0.4;
    const focusDist = CONFIG.focusCamDist + (this.camDist - 26) * 0.6;
    const dist = baseDist * (1 - zoom) + (aimDist * (1 - this.focusBlend) + focusDist * this.focusBlend) * zoom;
    /* aim over the shoulder a little, like a TPS shooter */
    const shoulder = this.aimBlend * 0.95;
    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * cp * dist + Math.cos(this.yaw) * shoulder,
      -Math.sin(this.pitch) * dist + (5 - zoom * 2.2) * 0.9,
      Math.cos(this.yaw) * cp * dist - Math.sin(this.yaw) * shoulder
    );
    const desired = target.clone().add(offset);
    desired.y = Math.max(desired.y, 2);

    const k = 1 - Math.exp(-dt * 9);
    this.camera.position.lerp(desired, k);
    this.camera.lookAt(target.x + Math.cos(this.yaw) * shoulder, target.y, target.z - Math.sin(this.yaw) * shoulder);

    /* aim zoom: ease between the hip FOV, the focus FOV and full ADS */
    const fovFocus = CONFIG.baseFOV * (1 - CONFIG.focusBlend) + CONFIG.focusFOV * CONFIG.focusBlend;
    const targetFov = fovFocus * (1 - this.aimBlend) + CONFIG.adsFOV * this.aimBlend;
    if (Math.abs(this.camera.fov - targetFov) > 0.02) {
      this.camera.fov = targetFov;
      this.camera.updateProjectionMatrix();
    }

    /* HUD feedback follows the zoom level, not just the button */
    const vg = document.getElementById('scope-vignette');
    if (vg) vg.style.opacity = String(clamp(this.aimBlend * 0.6 + this.focusBlend * CONFIG.focusBlend * 0.45, 0, 1));
    const ch = this.crosshairEl || (this.crosshairEl = document.getElementById('crosshair'));
    if (ch) {
      ch.classList.toggle('ads', this.aimBlend > 0.5);
      ch.classList.toggle('focus', this.focusBlend > 0.5 && this.aimBlend < 0.5);
      ch.style.transform = 'translate(-50%, -50%) scale(' + (1 + zoom * 0.22) + ')';
    }
  },

  /* Keep laptops smooth: if frames run slow for a while, drop the render
     resolution a notch; if there is headroom, ease it back up. The scene
     itself never changes, so the look stays consistent between devices. */
  trackQuality(dt) {
    if (!CONFIG.adaptiveQuality || this.qualityLocked) return;
    this.frameAvg = this.frameAvg * 0.9 + dt * 0.1;
    this.qualityT = (this.qualityT || 0) + dt;
    if (this.qualityT < 1.2) return;
    this.qualityT = 0;
    const fps = 1 / this.frameAvg;
    if (fps < 42 && this.quality > CONFIG.minRenderScale) {
      this.quality = Math.max(CONFIG.minRenderScale, this.quality - 0.1);
      this.applyQuality();
    } else if (fps > 58 && this.quality < 1) {
      this.quality = Math.min(1, this.quality + 0.05);
      this.applyQuality();
    }
  },

  applyQuality() {
    this.renderer.setPixelRatio(Math.max(0.75, this.basePixelRatio * this.quality));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  },

  /* ---- debug tooling: ?map=1 top-down view, ?demo=1 scripted walk + zoom ---- */
  debugFlags() {
    const q = location.search;
    this.mapView = /[?&]map(=1)?\b/.test(q);
    this.demoMode = /[?&]demo(=1)?\b/.test(q);
    this.showStats = this.mapView || this.demoMode || /[?&]debug(=1)?\b/.test(q);
    if (this.showStats) {
      const d = document.createElement('div');
      d.id = 'debug-readout';
      d.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);padding:10px 14px;background:rgba(0,0,0,.82);border:1px solid #35e0ff;color:#8ef0ff;font:12px/1.5 monospace;white-space:pre;z-index:9999;pointer-events:none;border-radius:4px';
      document.body.appendChild(d);
      this.readout = d;
    }
  },

  updateDebug(dt) {
    if (this.demoT === undefined) this.demoT = 0;
    if (this.demoMode) {
      this.demoT += dt;
      /* 0-1.4s walk, then hold focus, release, then strafe */
      const t = this.demoT % 6;
      this.keys['KeyW'] = t > 0.2 && t < 4.2;
      this.keys['KeyD'] = t > 4.4;
      this.focus = t > 2.0 && t < 3.6;
      if (t > 3.6 && t < 3.7) this.focus = false;
    }
    if (!this.readout) return;
    const p = State.player;
    if (!p) return;
    const spd = Math.hypot(p.vel.x, p.vel.z);
    this.readout.textContent =
      'fps ' + (1 / (this.frameAvg || 1 / 60)).toFixed(0) +
      '  quality ' + this.quality.toFixed(2) +
      '\nfov ' + this.camera.fov.toFixed(1) +
      '  aim ' + this.aimBlend.toFixed(2) + '  focus ' + this.focusBlend.toFixed(2) +
      '\npos ' + p.pos.x.toFixed(1) + ',' + p.pos.y.toFixed(1) + ',' + p.pos.z.toFixed(1) +
      '  spd ' + spd.toFixed(1) +
      '\ngrounded ' + p.grounded + '  y-vel ' + p.vel.y.toFixed(1) +
      '\nweapon ' + p.weapon.name + '  aiming ' + p.aiming +
      '\nwalk ' + (HERO_WALK[p.heroKey] || 'hero') + '  phase ' + p.walkPhase.toFixed(2);
  },

  boom(pr, pos) {
    const w = pr.weapon;
    Sound.boom();
    World.burst(pos, (w.color || TIERS[w.tier].glow), 34, 14, 1.5);
    World.burst(pos, 0xffb066, 16, 10, 1.1);
    World.shockwave(pos, (w.color || TIERS[w.tier].glow), 10, 0.45);
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
      this.camera.position.set(Math.sin(this.yaw) * 150, 62, Math.cos(this.yaw) * 150);
      this.camera.lookAt(0, 4, 0);
      World.update(dt * 0.5);
      for (const f of State.fighters) f.mesh.position.copy(f.pos);
      this.renderer.render(State.scene, this.camera);
      return;
    }

    if (this.mapView) {
      World.update(dt);
      for (const f of State.fighters) { f.update(dt); }
      this.renderer.render(State.scene, this.camera);
      return;
    }

    this.trackQuality(dt);
    World.update(dt);
    this.updateDebug(dt);

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

window.__LB = { State, World, Game, UI, CONFIG, WEAPONS, ITEMS, TIERS, HEROES, HERO_KEYS, Sound, randomGamertag, Fighter };

window.addEventListener('DOMContentLoaded', () => { Game.init(); });


})();