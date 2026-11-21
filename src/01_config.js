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
