'use strict';

/* ============================================================
   MAIN — renderer, camera, input, game loop
   ============================================================ */

const Game = {
  renderer: null,
  camera: null,
  yaw: 0,
  pitch: -0.22,
  camDist: 11,
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
    State.camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 500);
    this.camera = State.camera;
    this.camera.position.set(0, 14, 30);

    World.init(this.renderer, State.scene);
    this.spawnLobby();
    UI.init();
    this.bindInput();

    /* opening wave so the arena is not empty on spawn */
    World.spawnBlock('big', 0, 0, true);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      World.spawnBlock(rollTier(), Math.cos(a) * 8.6, Math.sin(a) * 8.6, false);
    }

    this.lastT = performance.now();
    requestAnimationFrame(t => this.loop(t));
  },

  spawnLobby() {
    const used = new Set();
    const count = CONFIG.botCount + 1;
    for (let i = 0; i < count; i++) {
      const isPlayer = i === 0;
      const f = new Fighter({
        name: randomGamertag(used),
        isPlayer,
        baseIndex: i,
        color: isPlayer ? 0x35e0ff : AVATAR_COLORS[(i * 3) % AVATAR_COLORS.length],
      });
      State.fighters.push(f);
      if (isPlayer) State.player = f;
    }
  },

  /* ---------------- input ---------------- */
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
      this.pitch = clamp(this.pitch - e.movementY * 0.0022, -0.85, 0.55);
    });

    window.addEventListener('wheel', e => {
      this.camDist = clamp(this.camDist + Math.sign(e.deltaY) * 1.2, 6, 20);
    }, { passive: true });

    document.getElementById('play-btn').addEventListener('click', () => {
      Sound.init();
      Sound.resume();
      Sound.uiClick();
      document.getElementById('start').style.display = 'none';
      document.getElementById('hud').style.display = 'block';
      State.started = true;
      State.running = true;
      canvas.requestPointerLock();
      UI.toast('Fight. Break blocks. Survive.', '#8ef0ff');
      UI.feed('Big Lucky Block is live in the centre', '#35e0ff');
    });
  },

  /* ---------------- player control ---------------- */
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

  /* ---------------- camera ---------------- */
  updateCamera(dt) {
    const p = State.player;
    const target = p.pos.clone().add(new THREE.Vector3(0, 2.6, 0));
    if (p.dead) target.y += 1.5;

    const cp = Math.cos(this.pitch);
    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * cp * this.camDist,
      -Math.sin(this.pitch) * this.camDist + 3.2,
      Math.cos(this.yaw) * cp * this.camDist
    );
    const desired = target.clone().add(offset);
    desired.y = Math.max(desired.y, 1.6);

    const k = 1 - Math.exp(-dt * 9);
    this.camera.position.lerp(desired, k);
    this.camera.lookAt(target);
  },

  /* ---------------- projectiles ---------------- */
  updateProjectiles(dt) {
    for (let i = State.projectiles.length - 1; i >= 0; i--) {
      const pr = State.projectiles[i];
      pr.life -= dt;
      pr.vel.y += CONFIG.gravity * 0.12 * dt;
      pr.mesh.position.addScaledVector(pr.vel, dt);
      pr.mesh.lookAt(pr.mesh.position.clone().add(pr.vel));

      let hitTarget = null;
      for (const f of State.fighters) {
        if (f === pr.owner || f.dead) continue;
        if (pr.hit.has(f)) continue;
        const d = f.pos.clone().setY(f.pos.y + 1.6);
        if (d.distanceTo(pr.mesh.position) < 1.5) { hitTarget = f; break; }
      }

      const groundHit = groundAt(pr.mesh.position.x, pr.mesh.position.z) !== null
        && pr.mesh.position.y <= 0.15;

      if (hitTarget || groundHit || pr.life <= 0) {
        if (hitTarget || groundHit) {
          const pos = pr.mesh.position.clone();
          const w = pr.weapon;
          if (hitTarget) {
            hitTarget.takeDamage(pr.owner.outgoingDamage(w), pr.owner, w);
            pr.hit.add(hitTarget);
          }
          if (w.splash) {
            Sound.boom();
            World.burst(pos, TIERS[w.tier].glow, 30, 12, 1.3);
            for (const f of State.fighters) {
              if (f === pr.owner || f.dead) continue;
              if (f.pos.distanceTo(pos) < w.splash) {
                f.takeDamage(pr.owner.outgoingDamage(w) * 0.6, pr.owner, w);
              }
            }
          } else {
            World.burst(pos, TIERS[w.tier].glow, 8, 6, 0.8);
          }
        }
        State.scene.remove(pr.mesh);
        State.projectiles.splice(i, 1);
      }
    }
  },

  /* ---------------- body collisions ---------------- */
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

  /* ---------------- loop ---------------- */
  loop(t) {
    requestAnimationFrame(tt => this.loop(tt));
    let dt = (t - this.lastT) / 1000;
    this.lastT = t;
    if (!isFinite(dt) || dt <= 0) return;
    dt = Math.min(dt, 0.05);

    if (!State.started) {
      /* slow idle orbit on the title screen */
      this.yaw += dt * 0.12;
      this.camera.position.set(Math.sin(this.yaw) * 34, 16, Math.cos(this.yaw) * 34);
      this.camera.lookAt(0, 1, 0);
      World.update(dt * 0.6);
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

    /* keep the held-fire cadence for the player */
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
  return { time: State.time, blocks: State.blocks.length, pickups: State.pickups.length };
};

/* expose a small debug handle so the game can be poked from the console */
window.__LB = { State, World, Game, CONFIG, WEAPONS, ITEMS, TIERS, Sound, randomGamertag, Fighter };

window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
