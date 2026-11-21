'use strict';

/* ============================================================
   FIGHTER — one blocky avatar; used for the player and bots
   ============================================================ */

let FIGHTER_ID = 0;

class Fighter {
  constructor(opts) {
    this.id = ++FIGHTER_ID;
    this.name = opts.name;
    this.isPlayer = !!opts.isPlayer;
    this.baseIndex = opts.baseIndex;
    this.color = opts.color;
    this.personality = opts.personality || {
      aggression: rand(0.4, 0.9), caution: rand(0.2, 0.8),
      greed: rand(0.2, 0.9), skill: rand(0.3, 0.95),
    };

    this.maxHp = CONFIG.playerHP;
    this.hp = this.maxHp;
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.facing = new THREE.Vector3(0, 0, 1);
    this.grounded = true;
    this.dead = false;
    this.respawnT = 0;

    this.weapon = FISTS;
    this.atkCd = 0;
    this.pendingHit = -1;
    this.swingT = 0;
    this.hurtFlash = 0;
    this.stunT = 0;

    this.kills = 0;
    this.deaths = 0;
    this.lastDamager = null;
    this.lastDamageTime = -99;

    this.shield = 0;
    this.invulnUntil = 0;
    this.speedUntil = 0;
    this.speedMult = 1;
    this.jumpUntil = 0;
    this.jumpMult = 1;
    this.rageUntil = 0;
    this.rageMult = 1;
    this.dots = [];               // {type, dps, until, src}

    /* bot brain state */
    this.think = 0;
    this.target = null;
    this.state = 'idle';
    this.stateT = 0;
    this.wanderTo = new THREE.Vector3();
    this.strafeDir = chance(0.5) ? 1 : -1;
    this.strafeT = 0;
    this.hesitate = 0;
    this.reactionT = 0;
    this.wantMove = new THREE.Vector3();
    this.wantJump = false;
    this.wantAttack = false;
    this.walkAnim = 0;
    this.slowUntil = 0;

    this.buildMesh();
    this.placeAtBase();
  }

  /* ---------- visuals ---------- */
  buildMesh() {
    const g = new THREE.Group();
    const skin = new THREE.MeshLambertMaterial({ color: 0xf0c090 });
    const cloth = new THREE.MeshLambertMaterial({ color: this.color });
    const dark = new THREE.MeshLambertMaterial({ color: 0x2a3350 });

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.86, 0.86), skin);
    head.position.y = 2.72;
    g.add(head);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111820 });
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.06), eyeMat);
      eye.position.set(0.19 * s, 2.78, 0.44);
      g.add(eye);
    }

    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.2, 0.55), cloth);
    torso.position.y = 1.72;
    g.add(torso);

    const armR = new THREE.Group();
    armR.position.set(0.68, 2.2, 0);
    const armRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.05, 0.3), cloth);
    armRMesh.position.y = -0.5;
    armR.add(armRMesh);
    g.add(armR);

    const armL = new THREE.Group();
    armL.position.set(-0.68, 2.2, 0);
    const armLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.05, 0.3), cloth);
    armLMesh.position.y = -0.5;
    armL.add(armLMesh);
    g.add(armL);

    const legL = new THREE.Group();
    legL.position.set(-0.24, 1.12, 0);
    const legLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.12, 0.42), dark);
    legLMesh.position.y = -0.56;
    legL.add(legLMesh);
    g.add(legL);

    const legR = new THREE.Group();
    legR.position.set(0.24, 1.12, 0);
    const legRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.12, 0.42), dark);
    legRMesh.position.y = -0.56;
    legR.add(legRMesh);
    g.add(legR);

    this.weaponMount = new THREE.Group();
    this.weaponMount.position.y = -1.0;
    armR.add(this.weaponMount);

    const bubble = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0x8ef0ff, transparent: true, opacity: 0.22, depthWrite: false })
    );
    bubble.position.y = 1.7;
    bubble.visible = false;
    g.add(bubble);

    const domeRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.07, 6, 24),
      new THREE.MeshBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0.8 })
    );
    domeRing.rotation.x = Math.PI / 2;
    domeRing.position.y = 0.15;
    domeRing.visible = false;
    g.add(domeRing);

    this.mesh = g;
    this.parts = { head, torso, armR, armL, legL, legR, armRMesh, armLMesh };
    this.bubble = bubble;
    this.domeRing = domeRing;
    this.materials = [cloth, dark, skin];
    State.scene.add(g);
    this.setWeapon(FISTS, true);
  }

  setWeapon(def, silent) {
    this.weapon = def;
    while (this.weaponMount.children.length) {
      const c = this.weaponMount.children.pop();
      this.weaponMount.remove(c);
    }
    if (def === FISTS) {
      const fist = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.34, 0.34),
        new THREE.MeshLambertMaterial({ color: 0xf0c090 })
      );
      fist.position.y = -0.12;
      this.weaponMount.add(fist);
      return;
    }
    const t = TIERS[def.tier];
    const mat = new THREE.MeshLambertMaterial({
      color: t.color, emissive: t.emissive, emissiveIntensity: 0.8,
    });
    let m;
    if (def.kind === 'ranged') {
      m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 1.4), mat);
      m.position.set(0, -0.2, 0.55);
    } else {
      m = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.35, 0.28), mat);
      m.position.set(0, -0.55, 0.1);
    }
    this.weaponMount.add(m);
    this.weaponMesh = m;
    if (!silent) Sound.pickup(def.tier);
  }

  /* ---------- position helpers ---------- */
  basePos() {
    const b = State.bases[this.baseIndex];
    return new THREE.Vector3(b.x, 0, b.z);
  }

  placeAtBase() {
    const b = State.bases[this.baseIndex];
    const off = 1.2;
    this.pos.set(b.x + Math.cos(b.angle) * off, 0, b.z + Math.sin(b.angle) * off);
    this.vel.set(0, 0, 0);
    this.mesh.position.copy(this.pos);
    this.facing.set(-Math.cos(b.angle), 0, -Math.sin(b.angle));
  }

  headPos() {
    return new THREE.Vector3(this.pos.x, this.pos.y + 3.35, this.pos.z);
  }

  inDome() { return domeAt(this.pos.x, this.pos.z, this.pos.y); }
  inOwnDome() { return domeAt(this.pos.x, this.pos.z, this.pos.y) === State.bases[this.baseIndex]; }

  /* ---------- loot ---------- */
  give(loot) {
    if (loot.type === 'weapon') {
      this.setWeapon(loot.def);
      if (this.isPlayer) UI.toast(loot.def.name + '  ·  ' + TIERS[loot.tier].label, '#' + TIERS[loot.tier].glow.toString(16).padStart(6, '0'));
    } else {
      this.useItem(loot.def, loot.tier);
    }
  }

  useItem(def, tier) {
    const now = State.time;
    switch (def.use) {
      case 'heal':
        this.hp = Math.min(this.maxHp, this.hp + def.amount);
        Sound.heal();
        this.floatText('+' + def.amount, '#5ef08a');
        break;
      case 'shield':
        this.shield = Math.min(150, this.shield + def.amount);
        Sound.shieldHit();
        this.floatText('SHIELD', '#8ef0ff');
        break;
      case 'speed':
        this.speedUntil = now + def.dur; this.speedMult = def.mult;
        this.floatText('SPEED', '#ffe57a');
        break;
      case 'jump':
        this.jumpUntil = now + def.dur; this.jumpMult = def.mult;
        this.floatText('MOON JUMP', '#c9a6ff');
        break;
      case 'rage':
        this.rageUntil = now + def.dur; this.rageMult = def.mult;
        this.floatText('RAGE', '#ff7a59');
        break;
      case 'invuln':
        this.invulnUntil = now + def.dur;
        this.floatText('GODSHIELD', '#ffd54d');
        break;
      case 'ascend':
        this.hp = this.maxHp;
        this.speedUntil = now + def.dur; this.speedMult = 1.45;
        this.jumpUntil = now + def.dur; this.jumpMult = 1.7;
        this.rageUntil = now + def.dur; this.rageMult = 1.35;
        this.floatText('ASCENDED', '#c9a6ff');
        Sound.pickup('galaxy');
        break;
    }
    if (this.isPlayer) UI.toast(def.name + '  ·  ' + TIERS[tier].label, '#' + TIERS[tier].glow.toString(16).padStart(6, '0'));
  }

  /* ---------- movement ---------- */
  moveInput(dir, dt) {
    const speed = CONFIG.walkSpeed * (State.time < this.speedUntil ? this.speedMult : 1);
    const len = Math.hypot(dir.x, dir.z);
    if (len > 0.01) {
      const nx = dir.x / len, nz = dir.z / len;
      this.vel.x = nx * speed;
      this.vel.z = nz * speed;
      this.facing.set(nx, 0, nz);
      this.walkAnim += dt * 11;
    } else {
      this.vel.x *= 0.78;
      this.vel.z *= 0.78;
      this.walkAnim += dt * 2;
    }
  }

  jump() {
    if (!this.grounded) return;
    const jm = State.time < this.jumpUntil ? this.jumpMult : 1;
    this.vel.y = CONFIG.jumpSpeed * jm;
    this.grounded = false;
    if (this.isPlayer) Sound.jump();
  }

  physics(dt) {
    this.vel.y += CONFIG.gravity * dt;
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.pos.z += this.vel.z * dt;

    const r = Math.hypot(this.pos.x, this.pos.z);
    if (r > BASE_DIST + BASE_R + 4) {
      const s = (BASE_DIST + BASE_R + 4) / r;
      this.pos.x *= s; this.pos.z *= s;
    }

    const g = groundAt(this.pos.x, this.pos.z);
    if (g !== null && this.pos.y <= g && this.vel.y <= 0) {
      this.pos.y = g;
      this.vel.y = 0;
      this.grounded = true;
    } else if (g === null || this.pos.y > g + 0.02) {
      this.grounded = false;
    }

    if (this.pos.y < CONFIG.voidY) this.fellIntoVoid();
  }

  fellIntoVoid() {
    if (this.dead) return;
    Sound.voidFall();
    if (this.isPlayer || chance(0.3)) UI.feed(this.name + ' fell into the void', '#6b7ba8');
    if (this.isPlayer) UI.toast('You fell into the void', '#6b7ba8');
    /* the void costs you health, not your loot — you just get sent home */
    this.hp = Math.max(25, this.hp - 25);
    this.invulnUntil = State.time + 1.2;
    this.stunT = 0.8;
    this.dots.length = 0;
    this.placeAtBase();
    World.burst(this.pos.clone().setY(1), 0x6b7ba8, 20, 9, 1.1);
  }

  /* ---------- combat ---------- */
  attack() {
    if (this.dead || this.atkCd > 0) return;
    const w = this.weapon;
    this.atkCd = w.cd * (this.isPlayer ? 1 : rand(0.95, 1.25));
    this.swingT = 0.22;
    Sound.swing();
    if (w.kind === 'melee') {
      this.pendingHit = 0.09;
    } else {
      this.pendingHit = -1;
      this.fireProjectile();
    }
  }

  fireProjectile() {
    const w = this.weapon;
    const t = TIERS[w.tier];
    const origin = this.headPos().addScaledVector(this.facing, 0.8);
    origin.y -= 0.6;
    const geo = w.splash ? new THREE.SphereGeometry(0.34, 8, 6) : new THREE.BoxGeometry(0.16, 0.16, 1.1);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: t.glow }));
    mesh.position.copy(origin);
    mesh.lookAt(origin.clone().add(this.facing));
    State.scene.add(mesh);
    State.projectiles.push({
      mesh, owner: this, weapon: w,
      vel: this.facing.clone().normalize().multiplyScalar(w.projSpeed),
      life: 2.4, hit: new Set(),
    });
    Sound.shoot();
  }

  outgoingDamage(w) {
    const rage = State.time < this.rageUntil ? this.rageMult : 1;
    return w.dmg * rage;
  }

  resolveMelee() {
    const w = this.weapon;
    const reach = w.range;
    const fwd = this.facing.clone().setY(0).normalize();
    const cosArc = Math.cos(THREE.MathUtils.degToRad(65));
    let hitSomething = false;

    for (const f of State.fighters) {
      if (f === this || f.dead) continue;
      const d = new THREE.Vector3().subVectors(f.pos, this.pos).setY(0);
      const dist = d.length();
      if (dist > reach + FIGHTER_R) continue;
      const dir = d.clone().normalize();
      if (dist > 1.4 && dir.dot(fwd) < cosArc) continue;

      let dmg = this.outgoingDamage(w);
      if (w.effect === 'backstab') {
        const fFacing = f.facing.clone().setY(0).normalize();
        if (fFacing.dot(dir) > 0.35) dmg *= 1.5;
      }
      this.dealDamage(f, dmg, w);
      hitSomething = true;

      if (w.effect === 'lifesteal') this.hp = Math.min(this.maxHp, this.hp + dmg * (w.steal || 0.3));

      if (w.aoe) {
        for (const o of State.fighters) {
          if (o === this || o === f || o.dead) continue;
          if (o.pos.distanceTo(f.pos) <= w.aoe) this.dealDamage(o, dmg * 0.55, w);
        }
        World.burst(f.pos.clone().setY(1.5), TIERS[w.tier].glow, 14, 8, 1.1);
      }
    }

    /* hitting blocks */
    for (const b of State.blocks.slice()) {
      if (!b.alive) continue;
      const dist = Math.hypot(b.mesh.position.x - this.pos.x, b.mesh.position.z - this.pos.z);
      if (dist <= reach + b.size * 0.6) {
        World.damageBlock(b, this.outgoingDamage(w), this);
        hitSomething = true;
      }
    }

    if (!hitSomething) World.burst(this.pos.clone().setY(1.6).addScaledVector(fwd, 1.6), 0x9aa7bd, 3, 3, 0.6);
  }

  dealDamage(target, amount, w) {
    target.takeDamage(amount, this, w);
  }

  takeDamage(amount, from, w) {
    if (this.dead) return;
    const now = State.time;

    if (now < this.invulnUntil) {
      this.floatText('IMMUNE', '#ffd54d');
      Sound.shieldHit();
      return;
    }
    if (this.inOwnDome()) {
      this.floatText('DOME', '#35e0ff');
      Sound.shieldHit();
      return;
    }

    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, amount);
      this.shield -= absorbed;
      amount -= absorbed;
      this.floatText('-' + Math.round(absorbed), '#8ef0ff');
      Sound.shieldHit();
      if (amount <= 0) return;
    }

    this.hp -= amount;
    this.lastDamager = from;
    this.lastDamageTime = now;
    this.hurtFlash = 0.16;

    this.floatText('-' + Math.round(amount), from && from.isPlayer ? '#ffd54d' : '#ff8f8f');
    if (from && from.isPlayer) Sound.crit(); else Sound.hit();
    World.burst(this.pos.clone().setY(1.8), 0xff6b6b, 6, 5, 0.8);

    if (w && w.kb && from) {
      const kd = new THREE.Vector3().subVectors(this.pos, from.pos).setY(0).normalize();
      this.vel.x += kd.x * w.kb;
      this.vel.z += kd.z * w.kb;
      if (w.kb > 10) this.vel.y = Math.max(this.vel.y, 4.5);
    }

    if (w && w.effect === 'burn') this.addDot('burn', 4, 4, from);
    if (w && w.effect === 'poison') this.addDot('poison', 2.5, 6, from);
    if (w && w.effect === 'slow') this.slowUntil = now + 3;

    if (this.hp <= 0) this.die(from);
  }

  addDot(type, dps, dur, src) {
    const existing = this.dots.find(d => d.type === type);
    if (existing) { existing.until = Math.max(existing.until, State.time + dur); existing.dps = Math.max(existing.dps, dps); return; }
    this.dots.push({ type, dps, until: State.time + dur, src, tick: 0 });
  }

  floatText(text, color) {
    if (!this.isPlayer && this.pos.distanceTo(State.player.pos) > 34) return;
    UI.floatText(this.headPos(), text, color);
  }

  die(killer) {
    if (this.dead) return;
    this.dead = true;
    this.deaths++;
    this.hp = 0;
    this.respawnT = CONFIG.respawnMs / 1000;
    this.dots.length = 0;
    this.shield = 0;
    this.setWeapon(FISTS, true);

    if (killer && killer !== this) {
      killer.kills++;
      if (killer.isPlayer) {
        UI.toast('You eliminated ' + this.name, '#ffd54d');
        Sound.pickup('gold');
      }
      UI.feed(killer.name + ' eliminated ' + this.name, '#ff9a6b');
      if (chance(0.35)) UI.chat(killer.name, pick(NAME_TAUNTS));
    } else {
      UI.feed(this.name + ' was eliminated', '#ff9a6b');
    }

    if (this.isPlayer) UI.showDeath(killer ? killer.name : 'the void');

    World.burst(this.pos.clone().setY(1.6), this.color, 26, 10, 1.2);
    World.burst(this.pos.clone().setY(1.6), 0xffffff, 10, 7, 0.9);
    Sound.death();
    this.mesh.visible = false;
  }

  respawn() {
    this.dead = false;
    this.hp = this.maxHp;
    this.shield = 0;
    this.invulnUntil = State.time + 1.5;
    this.dots.length = 0;
    this.mesh.visible = true;
    this.placeAtBase();
    this.mesh.rotation.z = 0;
    World.burst(this.pos.clone().setY(1.6), 0x8ef0ff, 16, 7, 1);
    Sound.spawn();
    if (this.isPlayer) UI.hideDeath();
  }

  /* ---------- per-frame ---------- */
  update(dt) {
    if (this.dead) {
      this.respawnT -= dt;
      if (this.respawnT <= 0) this.respawn();
      return;
    }

    const now = State.time;
    if (this.atkCd > 0) this.atkCd -= dt;

    /* brief stun after being dumped into the void */
    if (this.stunT > 0) {
      this.stunT -= dt;
      this.wantMove.set(0, 0, 0);
      this.wantAttack = false;
      this.wantJump = false;
    }

    for (let i = this.dots.length - 1; i >= 0; i--) {
      const d = this.dots[i];
      d.tick += dt;
      if (d.tick >= 0.5) {
        d.tick = 0;
        this.hp -= d.dps * 0.5;
        this.floatText('-' + Math.round(d.dps * 0.5), d.type === 'burn' ? '#ff7a59' : '#8fd14f');
        if (this.hp <= 0) { this.die(d.src); return; }
      }
      if (now > d.until) this.dots.splice(i, 1);
    }

    if (this.inOwnDome() && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + CONFIG.domeHealPerSec * dt);
    }

    if (this.pendingHit >= 0) {
      this.pendingHit -= dt;
      if (this.pendingHit < 0) this.resolveMelee();
    }

    const speedMult = now < this.slowUntil ? 0.55 : 1;
    this.moveInput(this.wantMove.clone().multiplyScalar(speedMult), dt);
    if (this.wantJump) { this.jump(); this.wantJump = false; }
    if (this.wantAttack) { this.attack(); this.wantAttack = false; }

    this.physics(dt);
    this.mesh.position.copy(this.pos);

    if (this.facing.lengthSq() > 0.01) {
      const yaw = Math.atan2(this.facing.x, this.facing.z);
      this.mesh.rotation.y = yaw;
    }

    const moving = Math.hypot(this.vel.x, this.vel.z) > 1.2;
    this.walkAnim += moving ? dt * 12 : dt * 3;
    const sw = moving ? Math.sin(this.walkAnim) * 0.7 : Math.sin(this.walkAnim * 0.6) * 0.06;
    this.parts.legL.rotation.x = sw;
    this.parts.legR.rotation.x = -sw;
    this.parts.armL.rotation.x = -sw * 0.8;

    if (this.swingT > 0) {
      this.swingT -= dt;
      const p = 1 - Math.max(0, this.swingT) / 0.22;
      this.parts.armR.rotation.x = -Math.sin(p * Math.PI) * 2.1;
      this.parts.armR.rotation.z = -Math.sin(p * Math.PI) * 0.4;
    } else {
      this.parts.armR.rotation.x = sw * 0.8;
      this.parts.armR.rotation.z = 0;
    }

    if (this.hurtFlash > 0) {
      this.hurtFlash -= dt;
      this.materials[0].color.setHex(0xff6b6b);
      this.materials[1].color.setHex(0xff6b6b);
    } else {
      this.materials[0].color.setHex(this.color);
      this.materials[1].color.setHex(0x2a3350);
    }

    this.bubble.visible = this.shield > 0;
    if (this.bubble.visible) this.bubble.material.opacity = 0.12 + 0.1 * Math.sin(now * 6);
    this.domeRing.visible = this.inOwnDome();
    if (this.domeRing.visible) this.domeRing.rotation.z += dt * 2;
  }
}
