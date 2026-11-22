# LUCKY BLOCKS BATTLEGROUNDS — offline fan build (v3)

A blocky space arena with hero skins, real guns and super powers. Eight fighters, a huge
platform, lucky blocks you open by walking into them, and a glitching **Super** block that
unlocks the powers of whichever hero you picked.

Runs completely offline: no internet, no server, no build step needed to play.

## Play it

1. Unzip the folder.
2. Double-click `index.html` (Chrome, Edge or Firefox).
3. Type your gamertag, pick a hero skin, press **Play**, then click the arena once.

If your browser blocks pointer lock from a local file, serve the folder:
`python3 -m http.server 8000` then open `http://localhost:8000`.

## Controls

| Input | Action |
| --- | --- |
| `W A S D` / arrows | Move |
| `Space` | Jump — and a second time for a boosted double jump; hold to fly when powered |
| Left click (hold) | Swing / shoot (guns reload themselves when empty) |
| `1` – `5` | Inventory slots — weapons equip, consumables are used |
| `Q` `E` `R` | Hero powers (once unlocked) |
| Mouse / wheel | Look / zoom |
| `M` | Mute |

## New in v3

### Your name and your hero
The start screen has a gamertag box and a grid of 17 hero skins. Your choice sets the body,
suit, cape, shield, hair and the colour of your name in-game. Bots each wear a **different**
hero skin, so no two fighters look the same.

### Humanoid avatars
Fighters are no longer blocky boxes: tapered chest, separate waist, sphere shoulders, elbow
and knee joints, forearms, hands, feet, a jaw, hair (blond / spiky / bald / mask) and capes
that sway. Shield heroes (Soldier Boy, Captain America) hold their shield up in a guard pose
with their eyes just visible over the rim.

### Flight
Heroes with flight (Homelander, Superman, Sentry, Goku, Vegeta, Broly, Omni-Man, Conquest,
Invincible, Green Lantern) hover once their powers unlock — leaning into the direction they
move with both arms swept behind their back, a hover bob and a faint trail.

### The Super block
A new block that rolls out of any **RNG block at 0.5%** (and out of a cryo chamber if that
chamber rolls Super). Its name is written with glitching, scrambling letters. When it is
rolled, the whole lobby gets a broadcast: *"NAME ROLLED SUPER!"*. Touch the block it drops to
unlock that fighter's powers. Bots can roll it too.

A safety net: if nobody has unlocked powers after 6 minutes, one Super block lands in the
arena so a session always gets to use the feature.

### Powers
Unlocking gives you that hero's three abilities, a random **500–999 HP** and **no health
regeneration at all** (not even in your dome) so supers can actually be beaten. Two powered
fighters can fight each other normally.

| Hero | Abilities |
| --- | --- |
| Homelander | Laser Vision · Super Punch · Super Yell |
| Black Noir | Silent Step · Blade Strike · Smoke Slam |
| Soldier Boy | Shield Bash · War Cry · Ground Breaker |
| Captain America | Shield Throw · Super Soldier Punch · Shield Slam |
| Superman | Heat Vision · Super Punch · Freeze Breath (slows) |
| Sentry | Solar Beam · Void Punch · Scream |
| Winter Soldier | Metal Fist · Rifle Burst · Tactical Dash |
| Flash | Speed Blitz · Infinite Mass Punch · Vortex |
| Wally West | Lightning Run · Kinetic Punch · Tornado |
| Goku | Ki Blast · Kamehameha · Instant Strike |
| Saitama | Consecutive Punches · Normal Punch · Serious Punch (180) |
| Vegeta | Galick Gun · Energy Barrage · Royal Strike |
| Broly | Omega Blaster · Gigantic Rage · Gigantic Slam |
| Omni-Man | Viltrumite Punch · Flight Charge · Viltrumite Roar |
| Conquest | Brutal Punch · Crater Slam · War Roar |
| Invincible | Viltrumite Uppercut · Tackle · Battle Cry |
| Green Lantern | Ring Blast · Construct Hammer · Construct Shield |

Every ability has its own sound (laser whine, punch boom, yell, dash whoosh, ground slam,
construct chime) and its own effects: eye beams drawn from the head with a glow sprite,
expanding shockwave rings, particle bursts, screen announcements and damage numbers.

### Guns that look like guns
Pistols, SMGs, rifles, shotguns, snipers, miniguns and rocket launchers are built from
barrels, receivers, grips, magazines, stocks and scopes instead of plain boxes. They have:
- **muzzle flash** on every shot and a recoil kick that settles back
- **ammo and reloads** — the gun tilts down and swaps its magazine, with click-clack sounds
- tracer rounds instead of fat blocks, with impact sparks

### Trait icons
Top right, under the leaderboard: one icon per power (LSR / PCH / YEL / DSH / BRG / SLM / FLY…)
in that hero's colour, and icons for speed, jump boost, rage, shield and godshield buffs.
Buff icons fade as their timer runs out. **All buffs now last 2:50.**

### Jump and boost fixes
Jump boosts apply properly and give a **double jump**, with a shockwave ring and dust burst on
take-off and landing. Powered flyers get a hover instead of a jump.

## Blocks and timers

| Block | Skin | Cooldown |
| --- | --- | --- |
| Regular / Fire / Gold | tier colour with a big **?** | 4s spawn tick, up to 18 |
| Galaxy | purple nebula, stars, **?** | 5 min |
| RNG `?!!` | scrolling green code + `?!!` tag | 3 min |
| **Super** | glitching magenta/cyan code, scrambling name | 0.5% of RNG rolls (+6 min safety net) |
| Big Void `???` | black vortex with cyan **?** | 15 min |
| Cryo chamber | team colour, countdown above it | 10 min |

RNG odds: Regular 65 · Fire 55 · Gold 35 · Galaxy 15 · Big 5 · **Super 0.5**.
Chamber odds: Regular 50 · Fire 20 · Gold 10 · Galaxy 5 · Big 3 · RNG 9.

## Weapons

**Regular** Old Reliable Blade, Rusty Shiv, Wooden Slugger, Frying Pan, Sling Shot, Sidearm Pistol
**Fire** Emberbrand, Chainlink Saber, Frost Shiv, Steel Cleaver, Boom Tube, Buzz SMG, Scatter Shotgun, Stick Dynamite
**Gold** Luminar, Gloomheart, Toxinfang, Gustforce, Phantomstride, Rattle Rifle, Lobber Launcher
**Galaxy** Starcaller, Voidreaver, Nova Lance, Graviton Hammer, **Periastron Sword**, Longshot Rifle, Skyfall Launcher
**Big** Genesis Blade, Singularity Cannon, Timebreak Scythe, Havoc Minigun

## Publish on GitHub Pages

Upload every file to the root of a **public** repo → Settings → Pages → *Deploy from a branch*
→ `main` / `(root)`. Live at `https://<username>.github.io/<repo>/`. `.nojekyll` is included and
`sw.js` caches the game after the first visit.

## Editing

`game.js` is the whole game in one file. `src/` holds the modules — rebuild with `python3 build.py`.

Key knobs in `CONFIG`:

| Setting | Default | Meaning |
| --- | --- | --- |
| `heroHpMin` / `heroHpMax` | 500 / 999 | Random HP on unlocking powers |
| `effectDurMs` | 170000 | Buff duration (2:50) |
| `superBlockMs` | 6 min | Safety-net Super block if nobody has powers |
| `bigWaveMs` / `galaxyBlockMs` / `rngBlockMs` / `chamberMs` | 15 / 5 / 3 / 10 min | Block cooldowns |
| `slots` | 5 | Inventory size |
| `botCount` | 7 | Bots in the lobby |

Heroes live in `HEROES` at the top of `game.js` — colours, cape/flight/guard flags and their
three abilities with damage and cooldown. Ability behaviour is in `Fighter.useAbility` and the
`doBeam` / `doSuperPunch` / `doYell` / `doDash` / `doSlam` / `doThrow` / `doConstruct` methods.

Debug hook: `window.__LB` exposes `State`, `World`, `Game`, `UI`, `CONFIG`, `HEROES`;
`__LB.Game.sim(30)` fast-forwards 30 seconds without rendering.

## Files

```
index.html        page, HUD, start screen with name + hero picker
game.js           the whole game (built)
three.global.js   Three.js r187 bundled locally, no CDN
sw.js             offline cache for the hosted copy
manifest.json     installable-app metadata
.nojekyll         stops Jekyll on GitHub Pages
src/              module sources + build.py
```

## Disclaimer

Fan-made, non-commercial project. Not affiliated with, endorsed by, or connected to Roblox
Corporation, Marvel, DC, Image Comics, Dragon Ball, One Punch Man or any rights holder. Hero
names are used descriptively for fan content; all models, textures and sounds are generated
procedurally in code, and no assets are taken from anywhere.
