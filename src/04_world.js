'use strict';

/* ============================================================
   STATE + WORLD: arena, bases, domes, lucky blocks, particles
   ============================================================ */

const State = {
  scene: null, camera: null, renderer: null,
  fighters: [], blocks: [], pickups: [], projectiles: [], particles: [], floaters: [],
  bases: [], player: null,
  time: 0, bigTimer: CONFIG.bigWaveMs, looseTimer: 4000,
  running: false, started: false,
  bigAlive: false, bigBlock: null,
  killFeed: [], wave: 1,
};

const World = {
  glowTex: null,
  particlePool: [],

  /* ---------- textures drawn on a canvas (no image files) ---------- */
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
    c.width = 32; c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#05070f');
    grad.addColorStop(0.45, '#111a33');
    grad.addColorStop(0.72, '#26365c');
    grad.addColorStop(1, '#0a0e1a');
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 256);
    return new THREE.CanvasTexture(c);
  },

  /* ---------- scene setup ---------- */
  init(renderer, scene) {
    this.renderer = renderer;
    this.scene = scene;
    this.glowTex = this.makeGlowTexture();

    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.Fog(0x070b14, 70, 190);

    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(300, 24, 16),
      new THREE.MeshBasicMaterial({ map: this.makeSkyTexture(), side: THREE.BackSide, depthWrite: false })
    );
    scene.add(sky);

    scene.add(new THREE.HemisphereLight(0x9db8ff, 0x1a2035, 1.15));
    const sun = new THREE.DirectionalLight(0xfff2d0, 1.55);
    sun.position.set(38, 62, 24);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x4d7bff, 0.7);
    rim.position.set(-30, 20, -40);
    scene.add(rim);

    this.buildArena();
    this.buildBases();
    this.initParticles();
  },

  buildArena() {
    const s = this.scene;

    const topTex = this.makeGridTexture('#2b3450', '#3f4d75');
    topTex.repeat.set(10, 10);
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(ARENA_R, ARENA_R, 1.4, 8),
      new THREE.MeshLambertMaterial({ map: topTex, color: 0xffffff })
    );
    top.position.y = -0.7;
    s.add(top);

    const under = new THREE.Mesh(
      new THREE.CylinderGeometry(ARENA_R * 0.94, ARENA_R * 0.5, 6, 8),
      new THREE.MeshLambertMaterial({ color: 0x1a2136 })
    );
    under.position.y = -4.2;
    s.add(under);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(ARENA_R + 0.05, 0.22, 6, 48),
      new THREE.MeshBasicMaterial({ color: 0x35e0ff })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.02;
    s.add(rim);

    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(6.6, 6.6, 0.12, 8),
      new THREE.MeshBasicMaterial({ color: 0x0d3b52 })
    );
    pad.position.y = 0.02;
    s.add(pad);
    const padRing = new THREE.Mesh(
      new THREE.TorusGeometry(6.6, 0.14, 6, 40),
      new THREE.MeshBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0.8 })
    );
    padRing.rotation.x = Math.PI / 2;
    padRing.position.y = 0.1;
    s.add(padRing);
    this.padRing = padRing;
  },

  buildBases() {
    const s = this.scene;
    const count = CONFIG.botCount + 1;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      const bx = Math.cos(a) * BASE_DIST;
      const bz = Math.sin(a) * BASE_DIST;
      State.bases.push({ index: i, x: bx, z: bz, angle: a });

      const colTex = this.makeGridTexture('#333d5c', '#4a5883');
      colTex.repeat.set(2, 8);
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(BASE_R, BASE_R * 0.86, 34, 8),
        new THREE.MeshLambertMaterial({ map: colTex })
      );
      col.position.set(bx, -17, bz);
      s.add(col);

      const bt = new THREE.Mesh(
        new THREE.CylinderGeometry(BASE_R, BASE_R, 1.2, 8),
        new THREE.MeshLambertMaterial({ color: 0x4a5786 })
      );
      bt.position.set(bx, -0.6, bz);
      s.add(bt);

      const len = BASE_DIST - ARENA_R + 0.6;
      const mid = (ARENA_R + BASE_DIST) / 2;
      const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(BRIDGE_HALF * 2, 0.6, len),
        new THREE.MeshLambertMaterial({ color: 0x3a4463 })
      );
      bridge.position.set(Math.cos(a) * mid, -0.3, Math.sin(a) * mid);
      bridge.rotation.y = -a + Math.PI / 2;
      s.add(bridge);

      for (const side of [-1, 1]) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.7, len),
          new THREE.MeshBasicMaterial({ color: 0x5b6ea8 })
        );
        const off = side * (BRIDGE_HALF - 0.1);
        rail.position.set(
          Math.cos(a) * mid - Math.sin(a) * off, 0.35,
          Math.sin(a) * mid + Math.cos(a) * off
        );
        rail.rotation.y = -a + Math.PI / 2;
        s.add(rail);
      }

      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(DOME_R, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshBasicMaterial({
          color: 0x35e0ff, transparent: true, opacity: 0.1,
          side: THREE.DoubleSide, depthWrite: false,
        })
      );
      dome.position.set(bx, 0, bz);
      s.add(dome);

      const domeWire = new THREE.Mesh(
        new THREE.SphereGeometry(DOME_R, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshBasicMaterial({
          color: 0x8ef0ff, wireframe: true, transparent: true, opacity: 0.16,
        })
      );
      domeWire.position.set(bx, 0, bz);
      s.add(domeWire);

      State.bases[i].dome = dome;
      State.bases[i].domeWire = domeWire;

      const strip = new THREE.Mesh(
        new THREE.TorusGeometry(BASE_R - 0.2, 0.09, 6, 32),
        new THREE.MeshBasicMaterial({ color: 0x8ef0ff })
      );
      strip.rotation.x = Math.PI / 2;
      strip.position.set(bx, 0.12, bz);
      s.add(strip);
    }
  },

  /* ---------- particles ---------- */
  initParticles() {
    const geo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    for (let i = 0; i < 260; i++) {
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
      p.life = rand(0.45, 0.95);
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

  updateParticles(dt) {
    for (const p of this.particlePool) {
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { p.mesh.visible = false; continue; }
      p.vel.y += CONFIG.gravity * 0.5 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.x += p.spin.x * dt;
      p.mesh.rotation.y += p.spin.y * dt;
      p.mesh.material.opacity = clamp(p.life / p.maxLife, 0, 1);
    }
  },

  /* ---------- lucky blocks ---------- */
  spawnBlock(tier, x, z, isBig) {
    const t = TIERS[tier];
    const size = isBig ? 5.2 : 2.2;
    const group = new THREE.Group();
    group.position.set(x, isBig ? 3.4 : 1.5, z);

    const core = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshLambertMaterial({
        color: t.color, emissive: t.emissive, emissiveIntensity: 1.0,
        transparent: true, opacity: 0.95,
      })
    );
    group.add(core);

    const wire = new THREE.Mesh(
      new THREE.BoxGeometry(size * 1.04, size * 1.04, size * 1.04),
      new THREE.MeshBasicMaterial({ color: t.glow, wireframe: true, transparent: true, opacity: 0.75 })
    );
    group.add(wire);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowTex, color: t.glow, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.setScalar(size * 3.4);
    group.add(glow);

    const shards = [];
    if (isBig) {
      for (let i = 0; i < 6; i++) {
        const sh = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.5, 0.5),
          new THREE.MeshBasicMaterial({ color: 0x8ef0ff })
        );
        group.add(sh);
        shards.push({ mesh: sh, a: (i / 6) * Math.PI * 2, r: 4.4, y: rand(-1, 1) });
      }
    }

    this.scene.add(group);

    const block = {
      tier, big: !!isBig, mesh: group, core, wire, glow, shards,
      hp: isBig ? 900 : 300, maxHp: isBig ? 900 : 300,
      alive: true, spawnT: 0, bob: rand(0, Math.PI * 2), flash: 0,
      x, z, baseY: isBig ? 3.4 : 1.5, size,
      label: isBig ? '???' : t.label,
    };
    State.blocks.push(block);
    if (isBig) { State.bigAlive = true; State.bigBlock = block; }
    Sound.spawn();
    this.burst(group.position, t.glow, isBig ? 40 : 14, isBig ? 12 : 7, isBig ? 1.6 : 1);
    return block;
  },

  spawnWave() {
    State.wave++;
    this.spawnBlock('big', 0, 0, true);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      this.spawnBlock('regular', Math.cos(a) * 8.6, Math.sin(a) * 8.6, false);
    }
    Sound.bigSpawn();
    UI.feed('A BIG LUCKY BLOCK has spawned in the centre!', '#35e0ff');
    UI.toast('BIG BLOCK WAVE ' + State.wave, '#35e0ff');
  },

  damageBlock(block, amount, by) {
    if (!block.alive) return;
    block.hp -= amount;
    block.flash = 0.18;
    this.burst(block.mesh.position, TIERS[block.tier].glow, 5, 5, 0.8);
    Sound.hit();
    if (block.hp <= 0) this.breakBlock(block, by);
  },

  breakBlock(block, by) {
    block.alive = false;
    const t = TIERS[block.tier];
    Sound.blockBreak(block.tier);
    this.burst(block.mesh.position, t.glow, block.big ? 70 : 26, block.big ? 16 : 9, block.big ? 1.8 : 1.1);
    this.burst(block.mesh.position, 0xffffff, block.big ? 30 : 10, block.big ? 12 : 6, 0.9);

    const drops = block.big ? 3 : 1;
    for (let i = 0; i < drops; i++) {
      const a = rand(0, Math.PI * 2);
      this.spawnPickup(lootFor(block.tier), block.mesh.position.x + Math.cos(a) * 1.4,
        block.mesh.position.z + Math.sin(a) * 1.4);
    }

    this.scene.remove(block.mesh);
    const idx = State.blocks.indexOf(block);
    if (idx >= 0) State.blocks.splice(idx, 1);

    if (block.big) {
      State.bigAlive = false;
      State.bigBlock = null;
      State.bigTimer = CONFIG.bigWaveMs;
      UI.feed((by ? by.name : 'Someone') + ' cracked the BIG LUCKY BLOCK!', '#35e0ff');
    } else {
      UI.feed((by ? by.name : 'Someone') + ' broke a ' + t.name + ' block', '#' + t.glow.toString(16).padStart(6, '0'));
    }
  },

  /* ---------- pickups ---------- */
  spawnPickup(loot, x, z) {
    const t = TIERS[loot.tier];
    const group = new THREE.Group();
    group.position.set(x, 1.6, z);

    let mesh;
    if (loot.type === 'weapon') {
      const isRanged = loot.def.kind === 'ranged';
      mesh = new THREE.Mesh(
        isRanged
          ? new THREE.BoxGeometry(0.22, 0.22, 1.5)
          : new THREE.BoxGeometry(0.16, 1.35, 0.34),
        new THREE.MeshLambertMaterial({ color: t.color, emissive: t.emissive, emissiveIntensity: 0.9 })
      );
      if (!isRanged) mesh.rotation.z = Math.PI * 0.15;
    } else {
      mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.52, 0),
        new THREE.MeshLambertMaterial({ color: t.color, emissive: t.emissive, emissiveIntensity: 0.9 })
      );
    }
    group.add(mesh);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowTex, color: t.glow, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.setScalar(3.2);
    group.add(glow);

    this.scene.add(group);
    State.pickups.push({
      mesh: group, inner: mesh, loot, tier: loot.tier,
      life: 45, bob: rand(0, 6.28),
      x, z,
    });
  },

  updatePickups(dt) {
    for (let i = State.pickups.length - 1; i >= 0; i--) {
      const p = State.pickups[i];
      p.life -= dt;
      p.bob += dt * 2.4;
      p.mesh.position.y = 1.6 + Math.sin(p.bob) * 0.28;
      p.mesh.rotation.y += dt * 1.6;
      p.mesh.children[1].material.opacity = p.life < 6 ? (0.4 + 0.4 * Math.sin(p.life * 12)) : 0.8;

      let taken = false;
      for (const f of State.fighters) {
        if (f.dead) continue;
        const dx = f.pos.x - p.x, dz = f.pos.z - p.z;
        const dy = Math.abs((f.pos.y + 1) - p.mesh.position.y);
        if (dx * dx + dz * dz < CONFIG.pickupRadius * CONFIG.pickupRadius && dy < 2.6) {
          f.give(p.loot);
          taken = true;
          break;
        }
      }

      if (taken || p.life <= 0) {
        if (!taken) this.burst(p.mesh.position, TIERS[p.tier].glow, 8, 4, 0.7);
        this.scene.remove(p.mesh);
        State.pickups.splice(i, 1);
      }
    }
  },

  /* ---------- per-frame ---------- */
  update(dt) {
    State.time += dt;

    if (!State.bigAlive) {
      State.bigTimer -= dt * 1000;
      if (State.bigTimer <= 0) {
        State.bigTimer = CONFIG.bigWaveMs;
        this.spawnWave();
      }
    }

    State.looseTimer -= dt * 1000;
    if (State.looseTimer <= 0) {
      State.looseTimer = CONFIG.looseBlockMs;
      const loose = State.blocks.filter(b => !b.big).length;
      if (loose < CONFIG.maxLooseBlocks) {
        const a = rand(0, Math.PI * 2);
        const r = rand(11, ARENA_R - 3);
        const tier = rollTier();
        this.spawnBlock(tier, Math.cos(a) * r, Math.sin(a) * r, false);
      }
    }

    for (const b of State.blocks) {
      b.spawnT = Math.min(1, b.spawnT + dt * 2.6);
      const pop = b.spawnT < 1 ? (1 + Math.sin(b.spawnT * Math.PI) * 0.35) : 1;
      b.mesh.scale.setScalar(pop * (0.4 + 0.6 * b.spawnT));
      b.bob += dt * (b.big ? 1.1 : 1.7);
      b.mesh.position.y = b.baseY + Math.sin(b.bob) * (b.big ? 0.5 : 0.22);
      b.mesh.rotation.y += dt * (b.big ? 0.45 : 0.9);
      b.mesh.rotation.x = Math.sin(b.bob * 0.6) * 0.06;

      const t = TIERS[b.tier];
      if (b.flash > 0) {
        b.flash -= dt;
        b.core.material.emissiveIntensity = 3.2;
        b.core.material.color.setHex(0xffffff);
      } else {
        b.core.material.emissiveIntensity = 0.85 + Math.sin(State.time * 3 + b.bob) * 0.3;
        b.core.material.color.setHex(t.color);
      }
      b.wire.rotation.y -= dt * 1.8;
      b.wire.rotation.x += dt * 0.9;
      b.glow.material.opacity = 0.65 + Math.sin(State.time * 4 + b.bob) * 0.2;

      for (const s of b.shards) {
        s.a += dt * 1.2;
        s.mesh.position.set(Math.cos(s.a) * s.r, s.y + Math.sin(s.a * 2) * 0.6, Math.sin(s.a) * s.r);
        s.mesh.rotation.x += dt * 2;
        s.mesh.rotation.y += dt * 3;
      }
    }

    if (this.padRing) this.padRing.material.opacity = 0.5 + Math.sin(State.time * 2) * 0.3;

    this.updatePickups(dt);
    this.updateParticles(dt);
  },
};

/* ---------- arena helpers ---------- */
function groundAt(x, z) {
  const r = Math.hypot(x, z);
  if (r <= ARENA_R) return 0;
  for (const b of State.bases) {
    if (Math.hypot(x - b.x, z - b.z) <= BASE_R) return 0;
    const ux = b.x / BASE_DIST, uz = b.z / BASE_DIST;
    const t = x * ux + z * uz;
    const perp = Math.abs(-x * uz + z * ux);
    if (t >= ARENA_R - 1 && t <= BASE_DIST && perp <= BRIDGE_HALF) return 0;
  }
  return null;
}

function domeAt(x, z, y) {
  if (y > DOME_R + 0.5) return null;
  for (const b of State.bases) {
    if (Math.hypot(x - b.x, z - b.z) <= DOME_R - 0.7) return b;
  }
  return null;
}
