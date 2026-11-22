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
