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
