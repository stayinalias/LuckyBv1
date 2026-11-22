# LUCKY BLOCKS BATTLEGROUNDS — offline fan build (v2)

A blocky third-person battle arena drifting through space, inspired by Roblox battlegrounds
games. Eight team-coloured fighters share a huge platform. Lucky blocks are opened by
**walking into them**, they roll tiered loot, and bots fight each other and you for it.

Runs completely offline: no internet, no server, no build step needed to play.

## Play it

1. Unzip the folder.
2. Double-click `index.html` (Chrome, Edge or Firefox).
3. Click **Play**, then click the arena once so the mouse is captured.

If your browser blocks pointer lock from a local file, serve the folder instead:

```
python3 -m http.server 8000
# then open http://localhost:8000
```

## Controls

| Input | Action |
| --- | --- |
| `W A S D` / arrows | Move |
| `Space` | Jump |
| Left click (hold) | Swing / shoot |
| `1` – `5` | Select a slot — weapons equip, items are used |
| Mouse | Look |
| Mouse wheel | Zoom camera |
| `M` | Mute |

## What changed in v2

- **Blocks are collected by touching them.** No punching blocks any more — walk into one and
  it opens, and the loot goes straight into your bag.
- **Much bigger map.** The centre platform went from radius 20 to 60, base platforms from 4.6
  to 14, bridges are wider and the camera pulls back.
- **5-slot inventory** shown bottom-right, Roblox style. Weapons fill slots and the newest
  one auto-equips; consumables sit in slots until you press their number. A full bag replaces
  whatever you are holding.
- **Space backdrop** instead of a black void: gradient sky, 2,200 stars, seven nebula clouds,
  a ringed planet and 16 floating islands drifting slowly past.
- **Team colours** — every fighter gets a base, dome, bridges rails, chamber glass and banner
  in their own colour: Blue, Red, Yellow, Green, Orange, Purple, Cyan, Pink.
- **New blocks** with their own skins (details below), all with a float/spin animation.
- **More weapons**: guns, explosives and heavy melee, including the Periastron Sword.

## The blocks

Every block type has its own cooldown. The timer only runs while that block is missing.

| Block | Skin | Where | Cooldown | What it gives |
| --- | --- | --- | --- | --- |
| Regular | yellow, "?" | scattered | 4s respawn tick, up to 18 at once | regular loot |
| Fire (Epic) | orange, "?" | scattered | same spawn pool | epic loot |
| Shiny Gold (Legendary) | gold, "?" | scattered | same spawn pool | legendary loot |
| Galaxy (Mythic) | purple nebula + stars + "?" | random spot in the arena | **5 minutes** | mythic loot |
| RNG `?!!` | green scrolling code + `?!!` tag | random spot in the arena | **3 minutes** | rolls a random block type (see below) |
| Big Void `???` | black vortex + cyan "?" | centre of the arena | **15 minutes** | three ??? items |

**RNG block odds** (weighted, normalised): Regular 65 · Fire 55 · Shiny Gold 35 · Galaxy 15 ·
Big Void 5. Touch it and it turns into that block's loot — an RNG block can hand you a Big
Void drop.

## Cryogenic chambers

Every base has one, in the team colour, with a rolling lucky block inside and a countdown
floating above it. Walk into the chamber to take the prize; it refills **10 minutes** later
with a fresh roll.

**Chamber odds** (lower than the arena): Regular 50 · Fire 20 · Shiny Gold 10 · Galaxy 5 ·
Big Void 3 · RNG block 9. A chamber can hand you an RNG block, which then rolls its own tier.

## Arena rules

- **Dome.** Standing in your own dome makes you immune and heals 22 HP/s. You cannot hit
  anyone from inside it, and bots will not follow you in.
- **Void.** Fall off the bridges and you are teleported home, −25 HP, keeping your loot.
- **Death.** Respawn at your base after 3.2s, full health, empty bag.

## Weapons

**Regular** — Old Reliable Blade, Rusty Shiv, Wooden Slugger, Frying Pan, Sling Shot, Sidearm Pistol

**Fire / Epic** — Emberbrand (burn), Chainlink Saber, Frost Shiv (slow), Steel Cleaver,
Boom Tube (rocket), Buzz SMG, Scatter Shotgun (5 pellets), Stick Dynamite (fuse, explodes)

**Shiny Gold / Legendary** — Luminar, Gloomheart (lifesteal), Toxinfang (poison), Gustforce,
Phantomstride (backstab ×1.5), Rattle Rifle, Lobber Launcher (arcing grenades)

**Galaxy / Mythic** — Starcaller (AoE), Voidreaver (lifesteal), Nova Lance (piercing),
Graviton Hammer (slam), **Periastron Sword** (42 dmg, burn + AoE), Longshot Rifle (sniper),
Skyfall Launcher (big splash)

**Big Void / ???** — Genesis Blade, Singularity Cannon, Timebreak Scythe, Havoc Minigun

**Items** — Med Kit, Field Kit, Sprint Spring, Moon Spring, Bubble Shield, Rage Chip,
Godshield, Ascension

## The bots

Each bot gets a random gamertag — ordinary, tryhard (`xX_..._Xx`), funny, weird, mildly rude,
fake-clan tagged — plus its own aggression, caution, greed and skill. They pick the nearest
valid target, so half of them duel each other while the rest loot. They hesitate, whiff swings,
circle-strafe, back off, run home below 22% health, and go quiet for a few seconds after
looting a block so the arena does not get vacuumed. They also grab their own chamber prize.

## Publish on GitHub Pages

1. Create a **public** repo (Pages on a free account needs public).
2. Upload every file in this folder to the repo root (`index.html` at the root).
3. Repo → Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save.
4. Live at `https://<username>.github.io/<repo>/`.

`.nojekyll` is included. `sw.js` caches the game after the first visit so the hosted copy also
works offline (bump `CACHE` in `sw.js` when you ship changes).

## Editing

- `game.js` is the whole game in one file — edit it directly for quick number tweaks.
- `src/` holds the same code as modules; rebuild with `python3 build.py`.

Knobs in `CONFIG` at the top of `game.js`:

| Setting | Default | Meaning |
| --- | --- | --- |
| `bigWaveMs` | 15 min | Big Void block cooldown |
| `galaxyBlockMs` | 5 min | Galaxy block cooldown |
| `rngBlockMs` | 3 min | RNG block cooldown |
| `chamberMs` | 10 min | Cryogenic chamber refill |
| `looseBlockMs` | 4000 | Ordinary block spawn tick |
| `maxLooseBlocks` | 18 | Cap on ordinary blocks |
| `slots` | 5 | Inventory size |
| `botCount` | 7 | Bots in the lobby |
| `walkSpeed`, `jumpSpeed`, `gravity` | 12, 13, −26 | Movement feel |
| `domeHealPerSec` | 22 | Dome healing |

Arena size lives just below: `ARENA_R` (60), `BASE_R` (14), `BASE_DIST` (84), `DOME_R` (15.5).
Drop `bigWaveMs`/`galaxyBlockMs`/`rngBlockMs` to a few seconds while testing so you can watch
the cycles.

Debug hook: `window.__LB` exposes `State`, `World`, `Game`, `CONFIG`; `__LB.Game.sim(30)`
fast-forwards 30 seconds without rendering.

## Files

```
index.html        page, HUD, inventory bar and styling
game.js           the whole game (built)
three.global.js   Three.js r187 bundled locally, no CDN
sw.js             offline cache for the hosted copy
manifest.json     installable-app metadata
.nojekyll         stops Jekyll on GitHub Pages
src/              module sources + build.py
```

## Disclaimer

Fan-made, non-commercial project. Not affiliated with, endorsed by, or connected to Roblox
Corporation or the makers of any battlegrounds game. All art is generated from primitives and
canvas textures, and all sound is synthesised in the browser; no assets are taken from anywhere.
