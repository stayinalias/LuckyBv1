# LUCKY BLOCKS BATTLEGROUNDS — offline fan build (v3.4)

A blocky space arena with hero skins, real guns and super powers. Eight fighters, a huge
platform, lucky blocks you open by walking into them, and a glitching **Super** block that
unlocks the powers of whichever hero you picked.

Runs completely offline: no internet, no server, no build step needed to play.


## New in v3.1

- **Hero portraits in the picker.** Every hero card now shows a painted portrait next to the
  name — suit, cape, hair, beard/mask and glowing eyes in that hero's colours (Homelander's
  teal suit, red trim, blond sweep and red eyes, Saitama's bald head, Goku's spiky hair and
  orange gi, Black Noir's mask, and so on). They are drawn in canvas at load time, so there are
  still no image files and nothing is downloaded.
- **Aim and shoot while moving.** The body now stays square to the crosshair while you run:
  your aim no longer follows the movement stick. Guns fire along the camera direction with a
  little vertical aim from the camera pitch, and the arms come up into a two-handed aim pose.
- **Full avatar rebuild.** Neck, brow, nose, chin, ears, jaw, eye sockets, shoulder pads, belt,
  gloves and boots, with hair styles (swept / short / long / spiky / bald / masked) and beards.
  Legs now have knee joints, so the walk cycle actually bends.
- **Animations.** Idle breathing with a head glance and arm sway; a proper walk cycle with
  knee bend and counter-swinging arms; a faster, forward-leaning run; a tuck-and-reach jump;
  and the arms-behind-back flight pose.
- **Much bigger map.** Arena radius 92 (was 60), bases 19, wider bridges, dome 20.5, and the
  camera pulls back further.
- **Real space scenery.** Five more planets (two with rings), 24 big drifting islands, five
  comets with tails crossing the sky, supernovae that flash and expand every few seconds, and
  gamma-ray bursts streaking past — plus the twinkling starfield and nebula clouds.
- **Nameplate fix.** Your typed gamertag now updates the floating name above your head, not
  just the HUD and scoreboard.


## New in v3.2

- **Unequip and drop.** Press the number of the slot you are already holding to put the weapon
  away (bare hands, gun stays in the bag). Press **G** to drop the selected slot entirely, which
  clears it — so consumables no longer clog the bag.
- **Boosts die with you.** Any death (or void death) cancels every timed effect immediately —
  speed, jump, rage, shield, godshield, invincibility — regardless of how much time was left,
  and the multipliers reset to 1.
- **Sprint animation.** Running now has a longer stride, pumping bent-elbow arms, a deeper body
  lean and a higher bob; a speed boost pushes it into a full sprint cycle.
- **Chunkier Fortnite-style bodies.** Bigger heads, larger hands and boots, and a backpack with
  a trim strap on every hero.


## New in v3.3 — aim-down-sights and a proper movement rig

Taken from the prototype `game.js` and merged into the full game:

- **ADS (aim down sights).** Hold **right mouse** with a gun out: the FOV pulls from 70° to 52°,
  the camera comes in closer, a scope vignette closes around the screen, the crosshair shrinks
  and turns cyan, you move at 60% speed, and bullet spread tightens to 40%. The character drops
  into a proper two-handed sighted stance with the head tucked to the stock.
- **Double jump is always available** now (the prototype's behaviour), with a shockwave ring and
  dust puff on the second hop. A jump boost still makes both jumps higher.
- **Weight-shift animation.** Hips sway side to side through the walk cycle, the body leans
  into a sprint, and the whole rig keeps the idle breathing, head glances, knee bends, air tuck
  and arms-behind-back flight pose.

Everything from the prototype that needs the battle systems — its hero list, the static HPs, the
standalone camera — was left out, because the full game already has 17 heroes, random 500–999 HP,
lucky blocks, bots, powers and the inventory.


## New in v3.4 — ammo, reloads and a calmer arena

- **Ammo HUD.** A live counter beside the weapon name: `12 / 12`, turning red under 25% and
  switching to a pulsing `RELOADING` while the mag swaps.
- **Manual reload.** Press **R** to reload. If you are powered and the gun is already full, **R**
  fires ability 3 instead, so the key does both jobs.
- **Firing feel config.** `fireRateMult`, `reloadSpeedMult`, `recoilRecovery`, `muzzleFlashDur`,
  `weaponSway` and `switchTime` all live in `CONFIG`.
- **Slower block economy.** Big block 15 → **20 min**, Galaxy 5 → **7 min**, RNG 3 → **5 min**,
  Super 6 → **8 min**, chambers 10 → **12 min**, ordinary blocks every 4 → **6 s**, and only
  **one** block per tick with a cap of **16** instead of 24.
- **Weapon sway.** The gun drifts with your movement (halved while aiming down sights) so it
  never looks welded to the hand.
- **Hit markers.** A white X flashes at the crosshair every time you land damage.
- **Shell casings.** Real brass boxes eject from the gun, fall with gravity, bounce on the floor
  and fade — not just a particle puff.
- **Weapon switching animation.** Pulling out a different weapon dips it out of frame and brings
  it back up over 0.32 s.

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
| `1` – `5` | Inventory slots — weapons equip, press again to put away, consumables are used |
| `G` | Drop the selected slot |
| Right mouse (hold) | Aim down sights — zoom, tighter spread, slower walk |
| `R` | Reload (or ability 3 when the gun is full and you are powered) |
| `Q` `E` `R` | Hero powers (once unlocked) |
| Mouse / wheel | Look / zoom |
| `M` | Mute |
| Right mouse (hold) | Aim down sights |

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
three abilities with damage and cooldown. Costume details (hair style, beard, pads, belt,
boots, gloves, eye glow, cape colour) are in `LOOKS`, used by both the 3D body and the portrait. Ability behaviour is in `Fighter.useAbility` and the
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
