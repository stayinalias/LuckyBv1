'use strict';

/* ============================================================
   MAIN — renderer, camera, input, game loop
   ============================================================ */

const Game = {
  renderer: null,
  camera: null,
  yaw: 0,
  pitch: -0.3,
  camDist: 20,
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
    State.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1400);
    this.camera = State.camera;
    this.camera.position.set(0, 26, 60);

    World.init(this.renderer, State.scene);
    this.spawnLobby();
    UI.init();
    this.bindInput();

    World.spawnBlock('big', 0, 0, { big: true, kind: 'big' });
    World.spawnBlock('galaxy', 30, -22, { kind: 'galaxy' });
    World.spawnBlock('rng', -28, 26, { kind: 'rng' });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.4;
      World.spawnBlock(rollTier(), Math.cos(a) * 34, Math.sin(a) * 34, { kind: 'loose' });
    }

    this.lastT = performance.now();
    requestAnimationFrame(t => this.loop(t));
  },

  spawnLobby() {
    const used = new Set();
    const count = CONFIG.botCount + 1;
    for (let i = 0; i < count; i++) {
      const isPlayer = i === 0;
      const f = new Fighter({ name: randomGamertag(used), isPlayer, baseIndex: i });
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
      if (slotKey && State.started && State.player) {
        State.player.useSlot(parseInt(slotKey[1], 10) - 1);
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
      this.pitch = clamp(this.pitch - e.movementY * 0.0022, -0.95, 0.5);
    });

    window.addEventListener('wheel', e => {
      this.camDist = clamp(this.camDist + Math.sign(e.deltaY) * 2, 10, 45);
    }, { passive: true });

    document.getElementById('play-btn').addEventListener('click', () => {
      Sound.init();
      Sound.resume();
      Sound.uiClick();
      document.getElementById('start').style.display = 'none';
      document.getElementById('hud').style.display = 'block';
      State.started = true;
      canvas.requestPointerLock();
      UI.toast('Walk into blocks to open them', '#8ef0ff');
      UI.feed('Big void block is live in the centre', '#35e0ff');
      UI.updateInv();
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

    if (this.mouseDown && this.locked) {
      p.wantAttack = true;
      p.facing.copy(fwd);
    } else if (dir.lengthSq() > 0.01) {
      p.facing.copy(dir.normalize());
    }
  },

  updateCamera(dt) {
    const p = State.player;
    const target = p.pos.clone().add(new THREE.Vector3(0, 3.2, 0));
    if (p.dead) target.y += 2;

    const cp = Math.cos(this.pitch);
    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * cp * this.camDist,
      -Math.sin(this.pitch) * this.camDist + 5,
      Math.cos(this.yaw) * cp * this.camDist
    );
    const desired = target.clone().add(offset);
    desired.y = Math.max(desired.y, 2);

    const k = 1 - Math.exp(-dt * 8);
    this.camera.position.lerp(desired, k);
    this.camera.lookAt(target);
  },

  boom(pr, pos) {
    const w = pr.weapon;
    Sound.boom();
    World.burst(pos, TIERS[w.tier].glow, 34, 14, 1.5);
    World.burst(pos, 0xffb066, 16, 10, 1.1);
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
      this.camera.position.set(Math.sin(this.yaw) * 105, 44, Math.cos(this.yaw) * 105);
      this.camera.lookAt(0, 4, 0);
      World.update(dt * 0.5);
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

window.__LB = { State, World, Game, CONFIG, WEAPONS, ITEMS, TIERS, Sound, randomGamertag, Fighter };

window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
