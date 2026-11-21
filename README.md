# LUCKY BLOCKS BATTLEGROUNDS — offline fan build

A blocky third-person battle arena inspired by Roblox battlegrounds games. Eight fighters
(you plus seven bots) share a star-shaped arena. Lucky blocks drop tiered loot, bots fight
each other and you, and the void under the bridges sends you home.

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
| Mouse | Look |
| Mouse wheel | Zoom camera |
| `M` | Mute |

## How a round works

- **Bases.** Every fighter has a pillar base at the end of a bridge. Standing inside your
  dome makes you immune to damage and heals you (22 HP/s). You cannot hit anyone from
  inside it, and bots will not chase you into it.
- **Void.** Walk or get knocked off the bridges and you fall. You are teleported back to
  your base, lose 25 HP and keep your weapon.
- **Lucky blocks.** Punch a block to break it; a weapon or item pops out and is picked up
  automatically by whoever reaches it.
- **The big block.** Sits in the middle of the arena and drops three high-tier items.
  When it is destroyed, the next **big block wave** (the big block plus four regular blocks
  around it) spawns **15 minutes later**. Extra regular blocks also drop every 6 seconds
  so the arena is never empty.
- **Death.** You respawn at your base after 3.2 seconds with full health and bare hands.

## Tiers

| Tier | Colour | Chance | Contents |
| --- | --- | --- | --- |
| Regular | yellow | 62% | Old Reliable Blade, Rusty Shiv, Wooden Slugger, Frying Pan, Sling Shot, Med Kit, Sprint Spring, Moon Spring |
| Fire (Epic) | orange | 23% | Emberbrand (burn), Chainlink Saber, Frost Shiv (slow), Steel Cleaver, Boom Tube (splash), Field Kit, Bubble Shield |
| Shiny Gold (Legendary) | gold | 11% | Luminar, Gloomheart (lifesteal), Toxinfang (poison), Gustforce, Phantomstride (backstab), Rage Chip, Godshield |
| Galaxy (Mythic) | purple | 4% | Starcaller (AoE), Voidreaver (lifesteal), Nova Lance, Graviton Hammer (slam), Ascension |
| ??? (Big block) | cyan | — | Genesis Blade, Singularity Cannon, Timebreak Scythe, Ascension, Godshield |

Weapon names are original takes on the classic battlegrounds arsenal, not copies.

## The bots

Each bot gets a random gamertag from six flavours — ordinary, tryhard (`xX_..._Xx`),
funny, weird, mildly rude, and fake-clan tagged — plus its own personality: aggression,
caution, greed and skill. They pick the **nearest** valid target, so some end up duelling
each other while others loot. They also:

- hesitate, whiff swings, circle-strafe and back off mid-fight
- run home to heal below 22% health, then come back out
- hunt blocks when unarmed, ignore most of them when armed
- chat the occasional taunt after a kill

## Publish on GitHub Pages

1. Create a **public** repo (Pages on a free account needs public).
2. Upload every file in this folder to the repo root (`index.html` must be at the root).
3. Repo → Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)` → Save.
4. Your game is live at `https://<username>.github.io/<repo>/` within a minute or two.

`.nojekyll` is already included so GitHub does not run the files through Jekyll.
`sw.js` caches the game after the first visit, so the hosted copy also works with the
network off (bump `CACHE` in `sw.js` when you ship changes).

## Editing

- `game.js` is the whole game in one file — edit it directly if you just want to tweak numbers.
- `src/` holds the same code split into modules (config, names, audio, world, fighter, AI, UI, main).
  Edit those and rebuild:

```
python3 build.py     # concatenates src/*.js into game.js
```

Handy knobs, all in `CONFIG` at the top of `game.js`:

| Setting | Default | Meaning |
| --- | --- | --- |
| `bigWaveMs` | `15 * 60 * 1000` | Delay between big block waves (drop to `3 * 60 * 1000` while testing) |
| `looseBlockMs` | `6000` | Extra block spawn interval |
| `botCount` | `7` | Bots in the lobby |
| `walkSpeed`, `jumpSpeed`, `gravity` | `9.2`, `11.6`, `-26` | Movement feel |
| `domeHealPerSec` | `22` | Dome healing |

Debug hook: `window.__LB` exposes `State`, `World`, `Game`, `CONFIG`; `__LB.Game.sim(30)`
fast-forwards 30 seconds of simulation without rendering.

## Files

```
index.html        page, HUD and styling
game.js           the whole game (built)
three.global.js   Three.js r187 bundled locally, no CDN
sw.js             offline cache for the hosted copy
manifest.json     installable-app metadata
.nojekyll         stops Jekyll on GitHub Pages
src/              module sources + build.py
```

## Disclaimer

Fan-made, non-commercial project. Not affiliated with, endorsed by, or connected to Roblox
Corporation or the makers of any battlegrounds game. All art is generated from primitives
and all sound is synthesised in the browser; no assets are taken from anywhere.
