'use strict';

/* ============================================================
   FIGHTER — humanoid avatar with a hero skin, a 5-slot
   inventory, real gun models and super powers
   ============================================================ */

/* optional debug spawn point from the URL, e.g. ?spawn=0,60 */
const DEBUG_SPAWN = (function () {
  const m = /[?&]spawn=(-?[\d.]+),(-?[\d.]+)/.exec(location.search);
  return m ? { x: parseFloat(m[1]), z: parseFloat(m[2]) } : null;
})();

let FIGHTER_ID = 0;

function mat(color, emissive, ei) {
  return new THREE.MeshLambertMaterial({
    color: color, emissive: emissive || 0x000000, emissiveIntensity: ei || 0,
  });
}

class Fighter {
  constructor(opts) {
    this.id = ++FIGHTER_ID;
    this.name = opts.name;
    this.isPlayer = !!opts.isPlayer;
    this.baseIndex = opts.baseIndex;
    this.team = State.bases[opts.baseIndex] ? State.bases[opts.baseIndex].team : TEAM_COLORS[0];
    this.heroKey = opts.heroKey || pick(HERO_KEYS);
    this.hero = HEROES[this.heroKey];
    this.color = this.hero.color;

    this.personality = opts.personality || {
      aggression: rand(0.4, 0.9), caution: rand(0.2, 0.8),
      greed: rand(0.2, 0.9), skill: rand(0.3, 0.95),
    };

    this.maxHp = CONFIG.playerHP;
    this.hp = this.maxHp;
    this.powered = false;
    this.noRegen = false;
    this.abCd = [0, 0, 0];
    this.barrage = null;
    this.reloading = 0;
    this.ammo = 0;
    this.recoil = 0;
    this.muzzleT = 0;
    this.switchT = 0;
    this.jumpBoostFx = 0;

    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.facing = new THREE.Vector3(0, 0, 1);
    this.grounded = true;
    this.flying = false;
    this.dead = false;
    this.respawnT = 0;

    this.slots = new Array(CONFIG.slots).fill(null);
    this.slotIndex = 0;
    this.weapon = FISTS;

    this.atkCd = 0;
    this.pendingHit = -1;
    this.swingT = 0;
    this.hurtFlash = 0;
    this.stunT = 0;
    this.kills = 0;
    this.deaths = 0;

    this.shield = 0;
    this.invulnUntil = 0;
    this.speedUntil = 0;
    this.speedMult = 1;
    this.jumpUntil = 0;
    this.jumpMult = 1;
    this.rageUntil = 0;
    this.rageMult = 1;
    this.slowUntil = 0;
    this.doubleJumped = false;
    this.dots = [];

    this.think = 0;
    this.state = 'idle';
    this.stateT = 0;
    this.wanderTo = new THREE.Vector3();
    this.strafeDir = chance(0.5) ? 1 : -1;
    this.strafeT = 0;
    this.hesitate = 0;
    this.reactionT = 0;
    this.nearTarget = null;
    this.nearDist = Infinity;
    this.wantMove = new THREE.Vector3();
    this.wantJump = false;
    this.wantAttack = false;
    this.walkAnim = 0;
    this.swingAlt = 0;
    this.walkPhase = 0;
    this.bumpedWall = 0;
    this.upperBlend = 0;
    this.readyBlend = 0;
    this.idleBlend = 0;
    this.airT = 0;
    this.stepT = 0;
    this.landT = 0;
    this.prevGrounded = true;
    this.dt = 1 / 60;
    this.eyeGlow = 0;
    this.chargeFx = 0;
    this.beamT = 0;
    this.flashT = 0;
    this.blockCd = 0;
    this.wantAbility = -1;
    this.aim = new THREE.Vector3(0, 0, 1);
    this.aiming = false;
    this.ads = false;
    this.focus = false;

    this.buildBody();
    this.placeAtBase();
    this.setWeapon(FISTS, true);
  }

  /* ================= humanoid body ================= */
  buildBody() {
    buildHumanoidRig(this);
  }

  setHero(key) {
    this.heroKey = key;
    this.hero = HEROES[key];
    this.color = this.hero.color;
    State.scene.remove(this.mesh);
    this.buildBody();
    this.setWeapon(this.weapon, true);
    this.mesh.position.copy(this.pos);
    this.mesh.visible = !this.dead;
    this.rebuildEyes();
  }

  makeEmblem(char, color) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0)';
    g.fillRect(0, 0, 128, 128);
    g.font = 'bold 96px Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#ffffff';
    g.shadowColor = hexStr(color);
    g.shadowBlur = 18;
    g.fillText(char, 64, 68);
    const tex = new THREE.CanvasTexture(c);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    sprite.scale.set(0.55, 0.55, 1);
    return sprite;
  }

  /* ================= weapons ================= */
  buildWeaponModel(def) {
    const g = new THREE.Group();
    if (!def || def === FISTS) {
      /* empty hand: no weapon model at all, the fist already reads */
      return g;
    }
    const t = TIERS[def.tier];
    const metal = mat(0x2c3446);
    const dark = mat(0x151a26);
    const glowMat = mat(t.color, t.emissive, 0.8);
    const model = def.model || 'blade';

    const box = (w, h, d, m, x, y, z) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      b.position.set(x || 0, y || 0, z || 0);
      g.add(b);
      return b;
    };
    const cyl = (r1, r2, h, m, x, y, z, rotX) => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 10), m);
      c.position.set(x || 0, y || 0, z || 0);
      if (rotX) c.rotation.x = rotX;
      g.add(c);
      return c;
    };

    if (model === 'pistol') {
      box(0.1, 0.13, 0.34, metal, 0, 0, 0.1);
      cyl(0.035, 0.035, 0.26, dark, 0, 0.03, 0.3, Math.PI / 2);
      box(0.09, 0.2, 0.1, dark, 0, -0.14, -0.02);
      box(0.06, 0.12, 0.06, glowMat, 0, -0.02, -0.08);
      box(0.05, 0.03, 0.05, metal, 0, 0.09, 0.0);
    } else if (model === 'smg') {
      box(0.11, 0.15, 0.5, metal, 0, 0, 0.12);
      cyl(0.032, 0.032, 0.3, dark, 0, 0.04, 0.45, Math.PI / 2);
      box(0.08, 0.22, 0.09, dark, 0, -0.15, 0.02);
      box(0.06, 0.26, 0.08, dark, 0, -0.16, 0.2);
      box(0.06, 0.1, 0.1, glowMat, 0, 0.0, -0.12);
      box(0.07, 0.05, 0.16, metal, 0, 0.11, 0.05);
    } else if (model === 'rifle') {
      box(0.1, 0.14, 0.62, metal, 0, 0, 0.14);
      cyl(0.028, 0.028, 0.46, dark, 0, 0.03, 0.62, Math.PI / 2);
      box(0.08, 0.2, 0.09, dark, 0, -0.15, 0.02);
      box(0.07, 0.24, 0.09, dark, 0, -0.15, 0.22);
      box(0.1, 0.12, 0.3, metal, 0, -0.02, -0.3);
      cyl(0.045, 0.045, 0.18, dark, 0, 0.11, 0.14, Math.PI / 2);
      box(0.05, 0.12, 0.06, glowMat, 0, -0.02, -0.12);
    } else if (model === 'shotgun') {
      cyl(0.045, 0.045, 0.62, dark, 0, 0.04, 0.4, Math.PI / 2);
      cyl(0.04, 0.04, 0.5, dark, 0, -0.04, 0.36, Math.PI / 2);
      box(0.1, 0.13, 0.34, metal, 0, 0, 0.02);
      box(0.09, 0.11, 0.12, mat(0x5a3a22), 0, -0.02, 0.26);
      box(0.09, 0.22, 0.24, mat(0x5a3a22), 0, -0.05, -0.28);
      box(0.06, 0.12, 0.07, dark, 0, -0.14, -0.02);
    } else if (model === 'sniper') {
      box(0.09, 0.13, 0.72, metal, 0, 0, 0.16);
      cyl(0.024, 0.024, 0.75, dark, 0, 0.03, 0.85, Math.PI / 2);
      cyl(0.05, 0.05, 0.3, dark, 0, 0.15, 0.16, Math.PI / 2);
      box(0.09, 0.18, 0.22, mat(0x5a3a22), 0, -0.05, -0.34);
      box(0.06, 0.2, 0.09, dark, 0, -0.16, 0.0);
      box(0.05, 0.1, 0.06, glowMat, 0, 0.0, -0.16);
    } else if (model === 'minigun') {
      cyl(0.16, 0.16, 0.34, metal, 0, 0, 0.1, Math.PI / 2);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        cyl(0.03, 0.03, 0.6, dark, Math.cos(a) * 0.09, Math.sin(a) * 0.09, 0.52, Math.PI / 2);
      }
      box(0.12, 0.2, 0.2, dark, 0, -0.16, -0.05);
      box(0.16, 0.14, 0.24, glowMat, 0, 0.02, -0.2);
    } else if (model === 'launcher') {
      cyl(0.11, 0.11, 0.8, metal, 0, 0, 0.2, Math.PI / 2);
      cyl(0.13, 0.13, 0.1, dark, 0, 0, 0.6, Math.PI / 2);
      box(0.09, 0.2, 0.12, dark, 0, -0.16, -0.02);
      box(0.07, 0.09, 0.2, glowMat, 0, 0.13, 0.0);
      box(0.1, 0.12, 0.18, dark, 0, 0, -0.2);
    } else if (model === 'slingshot' || model === 'bow') {
      box(0.06, 0.3, 0.06, mat(0x5a3a22), 0, 0, 0.05);
      for (const s of [-1, 1]) {
        const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 6), mat(0x5a3a22));
        prong.position.set(0.1 * s, 0.18, 0.05);
        prong.rotation.z = 0.5 * s;
        g.add(prong);
      }
      box(0.02, 0.02, 0.02, glowMat, 0, 0.1, 0.1);
    } else if (model === 'dynamite') {
      for (let i = 0; i < 3; i++) {
        cyl(0.045, 0.045, 0.3, mat(0xc42a2a), (i - 1) * 0.09, 0, 0.05, Math.PI / 2);
      }
      box(0.24, 0.02, 0.06, mat(0xd8c48a), 0, 0.05, 0.05);
    } else if (model === 'blade') {
      box(0.1, 0.3, 0.1, dark, 0, -0.2, 0);
      box(0.24, 0.05, 0.1, glowMat, 0, -0.06, 0);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.15, 0.16), glowMat);
      blade.position.set(0, 0.55, 0);
      g.add(blade);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.2, 4), glowMat);
      tip.position.set(0, 1.2, 0);
      g.add(tip);
    } else if (model === 'dagger') {
      /* a proper knife: wrapped handle through the fist, guard, then blade */
      cyl(0.036, 0.04, 0.26, dark, 0, -0.02, 0);
      box(0.14, 0.035, 0.06, mat(0xb9c3d4), 0, 0.13, 0);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.44, 0.1), glowMat);
      blade.position.set(0, 0.37, 0.012);
      g.add(blade);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.16, 4), glowMat);
      tip.position.set(0, 0.63, 0.012);
      tip.rotation.y = Math.PI / 4;
      g.add(tip);
      box(0.05, 0.06, 0.05, mat(0xd8c48a), 0, -0.16, 0);
    } else if (model === 'axe' || model === 'hammer') {
      box(0.08, 0.8, 0.08, mat(0x4a3a2a), 0, 0.1, 0);
      const headM = new THREE.Mesh(
        model === 'axe' ? new THREE.CylinderGeometry(0.28, 0.12, 0.1, 3) : new THREE.BoxGeometry(0.42, 0.34, 0.3),
        glowMat
      );
      headM.position.set(0, 0.5, 0);
      g.add(headM);
    } else if (model === 'scythe') {
      box(0.07, 1.2, 0.07, dark, 0, 0.1, 0);
      const hook = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 6, 12, Math.PI), glowMat);
      hook.position.set(0.2, 0.68, 0);
      hook.rotation.z = -0.4;
      g.add(hook);
    } else {
      box(0.1, 0.7, 0.1, glowMat, 0, 0.1, 0);
    }
    return g;
  }

  setWeapon(def, silent) {
    this.weapon = def;
    const holder = this.weaponGrip || this.weaponMount;
    while (holder.children.length) {
      const c = holder.children.pop();
      holder.remove(c);
    }
    const model = this.buildWeaponModel(def);
    holder.add(model);
    this.weaponModel = model;

    const muzzle = new THREE.Sprite(new THREE.SpriteMaterial({
      map: World.glowTex, color: 0xffd54d, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    muzzle.scale.setScalar(1.8);
    muzzle.position.set(0, 0.05, 1.15);
    holder.add(muzzle);
    this.parts.muzzle = muzzle;

    this.ammo = def.mag || 0;
    this.reloading = 0;
    if (!silent) {
      Sound.pickup(def.tier);
      this.switchT = CONFIG.switchTime;
    }
    if (this.isPlayer) UI.updateAmmo(this.ammo, def.mag || 0, false);
  }

  /* ================= inventory ================= */
  give(loot) {
    if (loot.type === 'super') { this.unlockPowers(); return; }

    if (!this.isPlayer) {
      if (loot.type === 'weapon') {
        if (loot.def.dmg >= this.weapon.dmg) this.setWeapon(loot.def);
      } else {
        this.useItem(loot.def, loot.tier);
      }
      return;
    }

    let idx = this.slots.findIndex(s => s === null);
    if (idx === -1) idx = this.slotIndex;
    this.slots[idx] = { type: loot.type, def: loot.def, tier: loot.tier, id: loot.id };

    if (loot.type === 'weapon') {
      this.slotIndex = idx;
      this.refreshWeapon();
    }
    UI.toast(loot.def.name + '  ·  ' + TIERS[loot.tier].label, hexStr(TIERS[loot.tier].glow));
    UI.updateInv();
  }

  refreshWeapon() {
    const s = this.slots[this.slotIndex];
    const next = (s && s.type === 'weapon') ? s.def : FISTS;
    const changed = next !== this.weapon;
    if (s && s.type === 'weapon') this.setWeapon(s.def, true);
    else this.setWeapon(FISTS, true);
    /* pulling out something different plays the swap animation */
    if (changed) this.switchT = CONFIG.switchTime;
  }

  useSlot(i) {
    const s = this.slots[i];
    if (!s) return false;
    if (s.type === 'weapon') {
      /* pressing the slot you already hold puts the weapon away */
      if (this.slotIndex === i && this.weapon !== FISTS) {
        this.unequip();
        return true;
      }
      this.slotIndex = i;
      this.refreshWeapon();
      if (this.isPlayer) Sound.uiClick();
      UI.updateInv();
      return true;
    }
    this.useItem(s.def, s.tier);
    this.slots[i] = null;
    if (this.slotIndex === i) this.refreshWeapon();
    UI.updateInv();
    return true;
  }

  unequip() {
    this.setWeapon(FISTS, true);
    this.ammo = 0;
    this.reloading = 0;
    if (this.isPlayer) {
      UI.toast('Weapon put away', '#8ea0c8');
      Sound.uiClick();
      UI.updateInv();
    }
  }

  dropSlot(i) {
    const s = this.slots[i];
    if (!s) return false;
    this.slots[i] = null;
    if (this.slotIndex === i) this.setWeapon(FISTS, true);
    World.burst(this.pos.clone().setY(1.2), TIERS[s.tier].glow, 10, 5, 0.9);
    if (this.isPlayer) {
      UI.toast('Dropped ' + s.def.name, '#8ea0c8');
      Sound.uiClick();
      UI.updateInv();
    }
    return true;
  }

  clearInventory() {
    this.slots = new Array(CONFIG.slots).fill(null);
    this.slotIndex = 0;
    this.setWeapon(FISTS, true);
    if (this.isPlayer) UI.updateInv();
  }

  useItem(def, tier) {
    const now = State.time;
    const dur = CONFIG.effectDurMs / 1000;
    switch (def.use) {
      case 'heal':
        this.hp = Math.min(this.maxHp, this.hp + def.amount);
        Sound.heal();
        this.floatText('+' + def.amount, '#5ef08a');
        break;
      case 'shield':
        this.shield = Math.min(400, this.shield + def.amount);
        Sound.shieldHit();
        this.floatText('SHIELD', '#8ef0ff');
        break;
      case 'speed':
        this.speedUntil = now + dur; this.speedMult = def.mult;
        this.floatText('SPEED', '#ffe57a'); Sound.boost();
        break;
      case 'jump':
        this.jumpUntil = now + dur; this.jumpMult = def.mult;
        this.floatText('JUMP BOOST', '#c9a6ff'); Sound.boost();
        break;
      case 'rage':
        this.rageUntil = now + dur; this.rageMult = def.mult;
        this.floatText('RAGE', '#ff7a59');
        break;
      case 'invuln':
        this.invulnUntil = now + dur;
        this.floatText('GODSHIELD', '#ffd54d');
        break;
      case 'ascend':
        this.hp = this.maxHp;
        this.speedUntil = now + dur; this.speedMult = 1.45;
        this.jumpUntil = now + dur; this.jumpMult = 1.7;
        this.rageUntil = now + dur; this.rageMult = 1.35;
        this.floatText('ASCENDED', '#c9a6ff');
        Sound.pickup('galaxy');
        break;
    }
    if (this.isPlayer) {
      UI.toast(def.name + '  ·  ' + TIERS[tier].label, hexStr(TIERS[tier].glow));
      UI.updateTraits();
    }
  }

  /* ================= powers ================= */
  unlockPowers() {
    if (this.powered) return;
    this.powered = true;
    this.noRegen = true;
    this.maxHp = heroHp();
    this.hp = this.maxHp;
    this.invulnUntil = State.time + 2;
    State.superUnlocked = true;
    this.rebuildEyes();
    World.burst(this.pos.clone().setY(2), this.hero.color, 70, 16, 1.8);
    World.shockwave(this.pos.clone().setY(0.2), this.hero.color, 14, 0.9);
    Sound.powerUnlock();
    if (this.isPlayer) UI.updateTraits();
  }

  rebuildEyes() {
    const col = this.powered ? this.hero.color : 0x1b2230;
    this.parts.eyeMat.color.setHex(col);
    this.parts.eyeMat.toneMapped = false;
  }

  heroAbilities() { return this.powered ? this.hero.abilities : []; }

  useAbility(i) {
    if (!this.powered || this.dead) return false;
    const ab = this.hero.abilities[i];
    if (!ab) return false;
    const now = State.time;
    if (this.abCd[i] > now) return false;
    this.abCd[i] = now + ab.cd;
    this.swingT = 0.24;

    switch (ab.type) {
      case 'beam': this.doBeam(ab); break;
      case 'punch': this.doSuperPunch(ab); break;
      case 'barrage': this.doBarrage(ab); break;
      case 'yell': this.doYell(ab); break;
      case 'dash': this.doDash(ab); break;
      case 'slam': this.doSlam(ab); break;
      case 'throw': this.doThrow(ab); break;
      case 'shield': this.doConstruct(ab); break;
    }
    if (this.isPlayer) UI.updateTraits();
    return true;
  }

  /* world position of an eye, used as the laser source */
  eyeWorld(side) {
    const node = side > 0 ? this.parts.eyeR : this.parts.eyeL;
    if (!node) return this.headPos();
    node.updateWorldMatrix(true, false);
    return new THREE.Vector3().setFromMatrixPosition(node.matrixWorld);
  }

  doBeam(ab) {
    const fwd = this.facing.clone().setY(0).normalize();
    const range = 55;
    let hit = null, hitD = range;
    for (const f of State.fighters) {
      if (f === this || f.dead) continue;
      const d = new THREE.Vector3().subVectors(f.pos, this.pos).setY(0);
      const dist = d.length();
      if (dist > range) continue;
      if (d.normalize().dot(fwd) < 0.86) continue;
      if (dist < hitD) { hitD = dist; hit = f; }
    }

    /* both eyes fire, or one big energy blast from the hands for ki heroes */
    const isEye = this.heroKey === 'homelander' || this.heroKey === 'superman';
    if (isEye) {
      this.eyeGlow = 1.6;
      this.beamT = 0.55;
      this.headShake(0.5);
      const srcR = this.eyeWorld(1);
      const srcL = this.eyeWorld(-1);
      const endR = srcR.clone().addScaledVector(fwd, hit ? hitD : range);
      const endL = srcL.clone().addScaledVector(fwd, hit ? hitD : range);
      for (const [a, b] of [[srcR, endR], [srcL, endL]]) {
        World.beam(a, b, ab.color, 0.14);
        World.beam(a, b, 0xffffff, 0.05);
      }
      World.burst(endR, ab.color, 26, 10, 1.2);
      if (hit) World.burst(hit.pos.clone().setY(1.7), ab.color, 20, 12, 1.3);
      World.lensFlare(srcR, ab.color);
      Game.shake(0.35);
    } else {
      const origin = this.headPos();
      origin.y -= 0.3;
      this.chargeFx = 0.25;
      const end = this.pos.clone().addScaledVector(fwd, hit ? hitD : range).setY(origin.y);
      World.beam(origin, end, ab.color, 0.34);
      World.beam(origin, end, 0xffffff, 0.12);
      World.burst(end, ab.color, 22, 10, 1.3);
      World.burst(this.handWorld(), ab.color, 16, 8, 1.1);
      Game.shake(0.2);
    }
    Sound.laser();
    if (hit) {
      hit.takeDamage(ab.dmg, this, { dmg: ab.dmg, kb: 6, effect: 'burn', tier: 'galaxy', range: 0, cd: 0 });
      hit.floatText('-' + ab.dmg, hexStr(ab.color));
    }
  }

  /* the world position of the right hand, for muzzle-ish effects */
  handWorld() {
    if (!this.parts.wristR) return this.headPos();
    this.parts.wristR.updateWorldMatrix(true, false);
    return new THREE.Vector3().setFromMatrixPosition(this.parts.wristR.matrixWorld);
  }

  headShake() { /* pose hook kept for readability */ }

  doSuperPunch(ab) {
    const fwd = this.facing.clone().setY(0).normalize();
    const impact = this.pos.clone().addScaledVector(fwd, 2.6).setY(1.6);
    /* ring shockwave on the ground, a sphere shock at the fist, sparks */
    World.shockwave(this.pos.clone().addScaledVector(fwd, 2.2).setY(0.25), ab.color, 15, 0.55);
    World.shockwave(impact, ab.color, 9, 0.4, 'flat');
    World.burst(impact, ab.color, 30, 14, 1.4);
    World.burst(impact, 0xffffff, 12, 16, 1.0);
    World.ringBurst(impact, ab.color, 5.5, 0.35);
    Game.shake(0.55, 0.22);
    Game.hitstop(0.045);
    Sound.punchBoom();
    Sound.impactHeavy();
    const cosArc = Math.cos(THREE.MathUtils.degToRad(80));
    for (const f of State.fighters) {
      if (f === this || f.dead) continue;
      const d = new THREE.Vector3().subVectors(f.pos, this.pos).setY(0);
      const dist = d.length();
      if (dist > 6.5) continue;
      if (dist > 1.2 && d.clone().normalize().dot(fwd) < cosArc) continue;
      f.takeDamage(ab.dmg, this, { dmg: ab.dmg, kb: 22, tier: 'big', range: 0, cd: 0 });
      f.floatText('-' + ab.dmg, hexStr(ab.color));
      World.burst(f.pos.clone().setY(1.6), ab.color, 16, 11, 1.2);
      World.ringBurst(f.pos.clone().setY(1.6), 0xffffff, 3.2, 0.28);
    }
  }

  doBarrage(ab) {
    this.barrage = { left: 5, timer: 0, ab: ab };
    Sound.swing();
  }

  doYell(ab) {
    const fwd = this.facing.clone().setY(0).normalize();
    World.shockwave(this.pos.clone().setY(0.3), ab.color, 20, 0.75);
    World.beam(this.headPos(), this.headPos().addScaledVector(fwd, 16), ab.color, 0.5);
    Sound.yell();
    for (const f of State.fighters) {
      if (f === this || f.dead) continue;
      const d = new THREE.Vector3().subVectors(f.pos, this.pos).setY(0);
      const dist = d.length();
      if (dist > 18) continue;
      if (d.clone().normalize().dot(fwd) < 0.35) continue;
      f.takeDamage(ab.dmg, this, { dmg: ab.dmg, kb: 26, tier: 'galaxy', range: 0, cd: 0 });
      if (this.heroKey === 'superman') f.slowUntil = State.time + 4;
      f.floatText('-' + ab.dmg, hexStr(ab.color));
    }
  }

  doDash(ab) {
    const fwd = this.facing.clone().setY(0).normalize();
    const from = this.pos.clone();
    const to = this.pos.clone().addScaledVector(fwd, 16);
    const g = groundAt(to.x, to.z);
    if (g !== null) to.y = g;
    World.beam(from.clone().setY(1.5), to.clone().setY(1.5), ab.color, 0.35);
    World.burst(from.clone().setY(1.5), ab.color, 18, 10, 1.2);
    Sound.dash();
    for (const f of State.fighters) {
      if (f === this || f.dead) continue;
      const seg = new THREE.Line3(from, to);
      const closest = new THREE.Vector3();
      seg.closestPointToPoint(f.pos, true, closest);
      if (closest.distanceTo(f.pos) < 2.6) {
        f.takeDamage(ab.dmg, this, { dmg: ab.dmg, kb: 18, tier: 'galaxy', range: 0, cd: 0 });
        f.floatText('-' + ab.dmg, hexStr(ab.color));
      }
    }
    this.pos.copy(to);
    World.burst(to.clone().setY(1.5), ab.color, 20, 10, 1.2);
  }

  doSlam(ab) {
    World.shockwave(this.pos.clone().setY(0.25), ab.color, 26, 0.8);
    World.burst(this.pos.clone().setY(0.8), ab.color, 40, 16, 1.6);
    Sound.slam();
    for (const f of State.fighters) {
      if (f === this || f.dead) continue;
      const dist = f.pos.distanceTo(this.pos);
      if (dist > 11) continue;
      f.takeDamage(ab.dmg, this, { dmg: ab.dmg, kb: 20, tier: 'big', range: 0, cd: 0 });
      f.floatText('-' + ab.dmg, hexStr(ab.color));
    }
  }

  doThrow(ab) {
    const dir = this.facing.clone().setY(0).normalize();
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.1, 14),
      new THREE.MeshBasicMaterial({ color: ab.color })
    );
    mesh.rotation.x = Math.PI / 2;
    const origin = this.headPos().addScaledVector(dir, 1.2);
    mesh.position.copy(origin);
    State.scene.add(mesh);
    State.projectiles.push({
      mesh, owner: this,
      weapon: { dmg: ab.dmg, kb: 14, tier: 'galaxy', splash: 3.5, projSpeed: 55, color: ab.color },
      vel: dir.clone().multiplyScalar(52), life: 2.2, fuse: 0, arc: 0, hit: new Set(), pierce: false,
    });
    Sound.shoot();
  }

  doConstruct(ab) {
    this.shield = Math.min(400, this.shield + 160);
    this.invulnUntil = Math.max(this.invulnUntil, State.time + 1.0);
    Sound.construct();
    World.burst(this.pos.clone().setY(1.6), ab.color, 24, 8, 1.3);
    this.floatText('SHIELD', hexStr(ab.color));
  }

  /* ================= traits for the HUD ================= */
  traits() {
    const now = State.time;
    const list = [];
    if (this.powered) {
      for (let i = 0; i < this.hero.abilities.length; i++) {
        const ab = this.hero.abilities[i];
        list.push({
          icon: ab.icon, color: hexStr(ab.color), name: ab.name,
          ready: this.abCd[i] <= now,
          remaining: Math.max(0, this.abCd[i] - now), total: ab.cd, permanent: true,
        });
      }
      if (this.hero.flight) list.push({ icon: 'FLY', color: hexStr(this.hero.color), name: 'Flight', ready: true, remaining: 0, total: 0, permanent: true });
    }
    const push = (icon, color, name, until) => {
      if (until <= now) return;
      list.push({ icon, color, name, ready: true, remaining: until - now, total: CONFIG.effectDurMs / 1000, permanent: false });
    };
    push('SPD', '#ffe57a', 'Speed', this.speedUntil);
    push('JMP', '#c9a6ff', 'Jump Boost', this.jumpUntil);
    push('RAG', '#ff7a59', 'Rage', this.rageUntil);
    push('SHD', '#8ef0ff', 'Shield', this.shield > 0 ? now + 1 : 0);
    push('GOD', '#ffd54d', 'Godshield', this.invulnUntil);
    return list;
  }

  /* ================= movement ================= */
  placeAtBase() {
    const b = State.bases[this.baseIndex];
    const off = 4.5;
    /* debug spawn: ?spawn=0,20 drops the player in the middle of the map */
    if (this.isPlayer && DEBUG_SPAWN) {
      this.pos.set(DEBUG_SPAWN.x, groundAt(DEBUG_SPAWN.x, DEBUG_SPAWN.z) || 0, DEBUG_SPAWN.z);
      this.vel.set(0, 0, 0);
      this.mesh.position.copy(this.pos);
      this.facing.set(0, 0, 1);
      return;
    }
    this.pos.set(b.x + Math.cos(b.angle) * off, 0, b.z + Math.sin(b.angle) * off);
    this.vel.set(0, 0, 0);
    this.mesh.position.copy(this.pos);
    this.facing.set(-Math.cos(b.angle), 0, -Math.sin(b.angle));
  }

  headPos() { return new THREE.Vector3(this.pos.x, this.pos.y + 3.0, this.pos.z); }
  inDome() { return domeAt(this.pos.x, this.pos.z, this.pos.y); }
  inOwnDome() { return domeAt(this.pos.x, this.pos.z, this.pos.y) === State.bases[this.baseIndex]; }

  moveInput(dir, dt) {
    let speed = CONFIG.walkSpeed * (State.time < this.speedUntil ? this.speedMult : 1);
    if (this.flying) speed *= 1.35;
    if (this.ads) speed *= CONFIG.adsSpeedMult;
    else if (this.focus) speed *= CONFIG.focusSpeedMult;
    const len = Math.hypot(dir.x, dir.z);
    if (len > 0.01) {
      const nx = dir.x / len, nz = dir.z / len;
      this.vel.x = nx * speed;
      this.vel.z = nz * speed;
      /* while aiming a gun the body stays square to the crosshair */
      if (!this.aiming) this.facing.set(nx, 0, nz);
      this.walkAnim += dt * 11;
    } else {
      this.vel.x *= 0.78;
      this.vel.z *= 0.78;
      this.walkAnim += dt * 2;
    }
  }

  jump() {
    if (this.flying) {
      this.vel.y = 9;
      Sound.jump();
      World.burst(this.pos.clone().setY(0.3), this.hero.color, 10, 6, 0.9);
      return;
    }
    const boosted = State.time < this.jumpUntil;
    if (!this.grounded) {
      /* one extra hop in the air; a jump boost makes it higher */
      if (!this.doubleJumped) {
        this.doubleJumped = true;
        this.vel.y = CONFIG.jumpSpeed * (boosted ? this.jumpMult : 0.85);
        World.shockwave(this.pos.clone().setY(0.15), boosted ? 0xc9a6ff : 0x8ea0c8, 5, 0.4);
        World.burst(this.pos.clone().setY(0.4), boosted ? 0xc9a6ff : 0x8ea0c8, 14, 7, 1);
        Sound.boost();
        if (this.isPlayer) this.floatText('DOUBLE JUMP', boosted ? '#c9a6ff' : '#8ea0c8');
      }
      return;
    }
    const jm = boosted ? this.jumpMult : 1;
    this.vel.y = CONFIG.jumpSpeed * jm;
    this.grounded = false;
    this.doubleJumped = false;
    World.shockwave(this.pos.clone().setY(0.12), boosted ? 0xc9a6ff : 0x8ea0c8, boosted ? 6 : 3.5, 0.35);
    World.burst(this.pos.clone().setY(0.25), boosted ? 0xc9a6ff : 0x8ea0c8, boosted ? 12 : 5, boosted ? 7 : 4, 0.9);
    if (this.isPlayer) Sound.jump();
  }

  physics(dt) {
    this.flying = this.powered && this.hero.flight && !this.dead;
    const prevX = this.pos.x, prevZ = this.pos.z;

    if (this.flying) {
      /* superhero hover: hold a height above whatever is below */
      const g = groundAt(this.pos.x, this.pos.z);
      const hover = (g === null ? this.pos.y - 1 : g) + 2.6;
      this.vel.y += (hover - this.pos.y) * 6 * dt;
      this.vel.y *= 0.86;
      if (this.wantJump) { this.vel.y += 12 * dt * 8; }
    } else {
      this.vel.y += CONFIG.gravity * dt;
    }

    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
    this.pos.z += this.vel.z * dt;

    const r = Math.hypot(this.pos.x, this.pos.z);
    const limit = BASE_DIST + BASE_R + 6;
    if (r > limit) { const s = limit / r; this.pos.x *= s; this.pos.z *= s; }

    if (!this.flying) {
      const g = groundAt(this.pos.x, this.pos.z);
      /* a ledge taller than a step blocks you instead of snapping you up */
      if (g !== null && g > this.pos.y + 1.15 && this.grounded) {
        this.pos.x = prevX;
        this.pos.z = prevZ;
        this.vel.x = 0;
        this.vel.z = 0;
        this.bumpedWall = 0.25;
      }
      const g2 = groundAt(this.pos.x, this.pos.z);
      if (g2 !== null && this.pos.y <= g2 && this.vel.y <= 0) {
        const wasAir = !this.grounded;
        const fallSpeed = this.vel.y;
        this.pos.y = g2; this.vel.y = 0; this.grounded = true;
        if (wasAir && fallSpeed < -7) {
          World.shockwave(this.pos.clone().setY(g2 + 0.12), this.hero.color, 4, 0.32);
          World.burst(this.pos.clone().setY(g2 + 0.3), 0xc9d4e8, 8, 5, 0.8);
          if (this.isPlayer) Sound.land();
        }
      } else if (g2 === null || this.pos.y > g2 + 0.02) {
        this.grounded = false;
      }
    } else {
      this.grounded = false;
    }

    if (this.pos.y < CONFIG.voidY) this.fellIntoVoid();
  }

  fellIntoVoid() {
    if (this.dead) return;
    Sound.voidFall();
    if (this.isPlayer || chance(0.3)) UI.feed(this.name + ' fell into the void', '#6b7ba8');
    if (this.isPlayer) UI.toast('You fell into the void', '#6b7ba8');
    if (!this.noRegen) this.hp = Math.max(25, this.hp - 25);
    else this.hp = Math.max(25, this.hp - 60);
    this.invulnUntil = State.time + 1.2;
    this.stunT = 0.8;
    this.dots.length = 0;
    this.placeAtBase();
    World.burst(this.pos.clone().setY(1), 0x6b7ba8, 24, 10, 1.2);
  }

  /* ================= combat ================= */
  attack() {
    if (this.dead || this.atkCd > 0) return;
    const w = this.weapon;
    if (w.kind === 'ranged' && w.mag) {
      if (this.reloading > 0) return;
      if (this.ammo <= 0) { this.startReload(); return; }
      this.ammo--;
      if (this.isPlayer) UI.updateAmmo(this.ammo, w.mag, false);
    }
    this.atkCd = w.cd * (this.isPlayer ? 1 : rand(0.95, 1.25)) * CONFIG.fireRateMult;
    this.swingT = 0.22;

    if (w.kind === 'melee') {
      /* alternate between the two swing variants so combos don't loop */
      this.swingAlt = this.swingAlt ? 0 : 1;
      this.swingT = meleeSwing(w.model || 'fist', this.swingAlt).dur;
      Sound.swing();
      Sound.meleeSwing(w.model || 'fist');
      World.swingArc(this, TIERS[w.tier].glow);
      this.pendingHit = 0.09;
    } else {
      this.pendingHit = -1;
      this.fireProjectile();
      this.recoil = w.model === 'minigun' ? 0.05 : w.model === 'sniper' ? 0.22 : 0.12;
      this.muzzleT = CONFIG.muzzleFlashDur;
      if (this.parts.muzzle) {
        this.parts.muzzle.material.color.setHex(TIERS[w.tier].glow);
        this.parts.muzzle.material.opacity = 1;
      }
      Sound.gunshot(w.model);
      /* eject a real brass casing that falls and bounces */
      if (w.model && w.model !== 'slingshot' && w.model !== 'bow') {
        const side = new THREE.Vector3(this.facing.z, 0, -this.facing.x).multiplyScalar(0.42);
        const cp = this.pos.clone().setY(this.pos.y + 1.8).add(side);
        World.spawnCasing(cp, this.facing);
      }
      if (this.ammo <= 0) this.startReload();
    }
  }

  startReload() {
    const w = this.weapon;
    if (!w.mag || this.reloading > 0) return;
    this.reloading = (w.reload || 1.6) * CONFIG.reloadSpeedMult;
    Sound.reload();
    if (this.isPlayer) {
      this.floatText('RELOADING', '#ffe57a');
      UI.updateAmmo(0, w.mag, true);
    }
  }

  fireProjectile() {
    const w = this.weapon;
    const t = TIERS[w.tier];
    const pellets = w.pellets || 1;
    const baseDir = (this.aiming ? this.aim : this.facing).clone().normalize();
    if (this.aiming) baseDir.y = clamp(Math.sin(this.aimPitch || 0) * 0.3, -0.18, 0.18);
    baseDir.normalize();

    for (let p = 0; p < pellets; p++) {
      const dir = baseDir.clone();
      if (w.spread) {
        const spreadAmt = w.spread * (this.ads ? 0.3 : this.focus ? 0.55 : 1);
        const a = rand(-spreadAmt, spreadAmt);
        const c = Math.cos(a), s = Math.sin(a);
        dir.set(dir.x * c - dir.z * s, 0, dir.x * s + dir.z * c).normalize();
      }
      const origin = this.headPos().addScaledVector(dir, 1.1);
      origin.y -= 0.55;

      let mesh;
      if (w.splash) {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 6), new THREE.MeshBasicMaterial({ color: t.glow }));
      } else {
        /* tracer round: a thin stretched box */
        mesh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 1.6), new THREE.MeshBasicMaterial({ color: t.glow }));
      }
      mesh.position.copy(origin);
      mesh.lookAt(origin.clone().add(dir));
      State.scene.add(mesh);

      const vel = dir.clone().multiplyScalar(w.projSpeed);
      if (w.fuse) vel.y += 6.5;
      if (w.arc) vel.y += 7;

      State.projectiles.push({
        mesh, owner: this, weapon: w, vel,
        life: w.fuse ? 6 : 2.6, fuse: w.fuse || 0, arc: w.arc || 0,
        hit: new Set(), pierce: !!w.pierce,
      });
    }
  }

  outgoingDamage(w) {
    const rage = State.time < this.rageUntil ? this.rageMult : 1;
    return (w.dmg || 0) * rage;
  }

  resolveMelee() {
    const w = this.weapon;
    const reach = w.range || 3;
    const fwd = this.facing.clone().setY(0).normalize();
    const cosArc = Math.cos(THREE.MathUtils.degToRad(65));
    let hitSomething = false;

    for (const f of State.fighters) {
      if (f === this || f.dead) continue;
      const d = new THREE.Vector3().subVectors(f.pos, this.pos).setY(0);
      const dist = d.length();
      if (dist > reach + FIGHTER_R) continue;
      const dir = d.clone().normalize();
      if (dist > 1.5 && dir.dot(fwd) < cosArc) continue;

      let dmg = this.outgoingDamage(w);
      if (w.effect === 'backstab') {
        const fFacing = f.facing.clone().setY(0).normalize();
        if (fFacing.dot(dir) > 0.35) dmg *= 1.5;
      }
      f.takeDamage(dmg, this, w);
      hitSomething = true;
      if (this.isPlayer) Sound.meleeHit(w.model || 'fist');
      Game.shake(0.15, 0.12);
      Game.hitstop(0.03);
      World.ringBurst(f.pos.clone().setY(1.6), TIERS[w.tier].glow, 3.2, 0.26);
      if (w.effect === 'lifesteal') this.hp = Math.min(this.maxHp, this.hp + dmg * (w.steal || 0.3));
      if (w.aoe) {
        for (const o of State.fighters) {
          if (o === this || o === f || o.dead) continue;
          if (o.pos.distanceTo(f.pos) <= w.aoe) o.takeDamage(dmg * 0.55, this, w);
        }
        World.shockwave(f.pos.clone().setY(0.3), TIERS[w.tier].glow, 6, 0.35);
        World.burst(f.pos.clone().setY(1.5), TIERS[w.tier].glow, 16, 9, 1.2);
      }
    }

    if (!hitSomething) World.burst(this.pos.clone().setY(1.6).addScaledVector(fwd, 1.8), 0x9aa7bd, 3, 3, 0.6);
  }

  takeDamage(amount, from, w) {
    if (this.dead) return;
    const now = State.time;

    if (now < this.invulnUntil) { this.floatText('IMMUNE', '#ffd54d'); Sound.shieldHit(); return; }
    if (this.inOwnDome()) { this.floatText('DOME', '#35e0ff'); Sound.shieldHit(); return; }

    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, amount);
      this.shield -= absorbed;
      amount -= absorbed;
      this.floatText('-' + Math.round(absorbed), '#8ef0ff');
      Sound.shieldHit();
      if (this.isPlayer) Sound.shieldClang();
      World.ringBurst(this.pos.clone().setY(1.6), 0x8ef0ff, 3, 0.24);
      if (amount <= 0) return;
    }

    this.hp -= amount;
    this.hurtFlash = 0.16;
    this.floatText('-' + Math.round(amount), from && from.isPlayer ? '#ffd54d' : '#ff8f8f');
    if (from && from.isPlayer) UI.hitMarker();
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
    if (!this.isPlayer && this.pos.distanceTo(State.player.pos) > 70) return;
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
    this.clearInventory();
    /* dying cancels every boost, however much time was left */
    this.speedUntil = 0; this.speedMult = 1;
    this.jumpUntil = 0; this.jumpMult = 1;
    this.rageUntil = 0; this.rageMult = 1;
    this.invulnUntil = 0;
    this.slowUntil = 0;
    this.reloading = 0;
    this.ammo = 0;
    this.barrage = null;
    this.aiming = false;
    this.doubleJumped = false;
    if (this.isPlayer) { UI.updateTraits(); UI.updateAbilities(); }

    if (killer && killer !== this) {
      killer.kills++;
      if (killer.isPlayer) { UI.toast('You eliminated ' + this.name, '#ffd54d'); Sound.pickup('gold'); }
      UI.feed(killer.name + ' eliminated ' + this.name, '#ff9a6b');
      if (chance(0.35)) UI.chat(killer.name, pick(NAME_TAUNTS));
    } else {
      UI.feed(this.name + ' was eliminated', '#ff9a6b');
    }
    if (this.isPlayer) UI.showDeath(killer ? killer.name : 'the void');

    World.burst(this.pos.clone().setY(1.6), this.hero.color, 30, 11, 1.3);
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
    World.burst(this.pos.clone().setY(1.6), this.hero.color, 18, 8, 1);
    Sound.spawn();
    if (this.isPlayer) UI.hideDeath();
  }

  /* ================= per-frame ================= */
  update(dt) {
    if (this.dead) {
      this.respawnT -= dt;
      if (this.respawnT <= 0) this.respawn();
      return;
    }

    const now = State.time;
    if (this.atkCd > 0) this.atkCd -= dt;
    if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - dt * CONFIG.recoilRecovery);
    if (this.muzzleT > 0) {
      this.muzzleT -= dt;
      if (this.muzzleT <= 0 && this.parts.muzzle) this.parts.muzzle.material.opacity = 0;
    }
    if (this.reloading > 0) {
      this.reloading -= dt;
      if (this.reloading <= 0) {
        this.ammo = this.weapon.mag || 0;
        this.reloading = 0;
        if (this.isPlayer) UI.updateAmmo(this.ammo, this.weapon.mag || 0, false);
      }
    }

    if (this.stunT > 0) {
      this.stunT -= dt;
      this.wantMove.set(0, 0, 0);
      this.wantAttack = false;
      this.wantJump = false;
    }

    /* barrage: five fast hits */
    if (this.barrage) {
      this.barrage.timer -= dt;
      if (this.barrage.timer <= 0) {
        this.barrage.timer = 0.11;
        this.barrage.left--;
        const ab = this.barrage.ab;
        const fwd = this.facing.clone().setY(0).normalize();
        for (const f of State.fighters) {
          if (f === this || f.dead) continue;
          const d = new THREE.Vector3().subVectors(f.pos, this.pos).setY(0);
          if (d.length() < 6 && d.clone().normalize().dot(fwd) > 0.3) {
            f.takeDamage(ab.dmg, this, { dmg: ab.dmg, kb: 5, tier: 'galaxy', range: 0, cd: 0 });
          }
        }
        World.burst(this.pos.clone().addScaledVector(fwd, 2.4).setY(1.6), ab.color, 6, 8, 0.9);
        Sound.swing();
        if (this.barrage.left <= 0) this.barrage = null;
      }
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

    /* dome healing only for normal fighters — supers never heal */
    if (!this.noRegen && this.inOwnDome() && this.hp < this.maxHp) {
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
    if (this.wantAbility >= 0) { this.useAbility(this.wantAbility); this.wantAbility = -1; }

    this.physics(dt);
    this.mesh.position.copy(this.pos);

    if (this.facing.lengthSq() > 0.01) {
      this.mesh.rotation.y = Math.atan2(this.facing.x, this.facing.z);
    }

    this.pose(dt, now);
  }

  /* ================= animation =================
     Two layers:
       1. the whole body (locomotion) — driven by the hero's walk style
       2. the arms/head (stance)       — picks idle, gun-ready, aim or swing
     Keeping them apart is what makes it read as a real walk cycle while
     a gun stays levelled at the crosshair.
  /* ================= animation =================
     Poses are built as a small named set of joint values and blended, so
     a walk can carry a gun stance or a melee swing at the same time.
     Clips: locomotion (walk/run/float/air), idle (per hero), stance
     (gun ready/ADS), melee (timed arc), and shoot (recoil kick).
  */
  blankPose() {
    return {
      lean: 0, roll: 0, twist: 0, bob: 0,
      headX: 0, headY: 0, headZ: 0,
      armLX: 0, armLZ: 0, armLY: 0, elbL: 0,
      armRX: 0, armRZ: 0, armRY: 0, elbR: 0,
      hipLX: 0, hipLZ: 0, kneeL: 0, ankL: 0,
      hipRX: 0, hipRZ: 0, kneeR: 0, ankR: 0,
      wristR: 0,
      chest: 1,
    };
  }

  /* blend b into a by weight w */
  blendPose(a, b, w) {
    if (w <= 0) return a;
    for (const k in b) {
      if (k === 'chest') a.chest = a.chest * (1 - w) + b.chest * w;
      else a[k] = a[k] * (1 - w) + b[k] * w;
    }
    return a;
  }

  /* ---------------- locomotion clip ---------------- */
  locomotionPose(out, now) {
    const walk = heroWalk(this.heroKey);
    const speedNow = Math.hypot(this.vel.x, this.vel.z);
    const moving = speedNow > 1.2;
    const running = moving && speedNow > CONFIG.walkSpeed * 1.2;
    const speedFrac = clamp(speedNow / CONFIG.walkSpeed, 0, 1.6);
    const player = this.isPlayer;

    if (moving) {
      this.walkAnim += (player ? this.dt : 1 / 60) * (running ? 15 : 11) * walk.cadence * (0.55 + 0.45 * Math.min(1, speedFrac));
    } else {
      this.walkAnim += (player ? this.dt : 1 / 60) * 2.2;
    }
    this.walkPhase = this.walkAnim;

    if (this.flying) {
      /* flying heroes: upright chest, arms held wide and open like a
         caped figure hovering, with a slow float and a forward lean */
      const drift = clamp(speedFrac, 0, 1);
      const floaty = Math.sin(now * 1.7 + this.id);
      out.lean = 0.1 + drift * 0.22;
      out.bob = floaty * 0.1;
      out.roll = Math.sin(now * 0.7 + this.id) * 0.035;
      /* arms straight out to the sides, palms open, like a caped figure hovering */
      out.armLX = -0.12;
      out.armRX = -0.12;
      out.armLZ = -1.24 - floaty * 0.04;
      out.armRZ = 1.24 + floaty * 0.04;
      out.armLY = 0; out.armRY = 0;
      out.elbL = -0.16;
      out.elbR = -0.16;
      /* legs trail together, slightly bent, like a hovering statue */
      out.hipLX = 0.16 + drift * 0.24 + Math.sin(now * 1.5) * 0.05;
      out.hipRX = 0.24 + drift * 0.3 + Math.cos(now * 1.5) * 0.05;
      out.kneeL = 0.2 + drift * 0.25;
      out.kneeR = 0.12 + drift * 0.2;
      out.ankL = 0.28; out.ankR = 0.32;
      out.hipLZ = 0.06; out.hipRZ = -0.06;
      out.headX = -0.04 - drift * 0.1;
      return;
    }

    if (!this.grounded) {
      const rising = this.vel.y > 0;
      const t = clamp(this.airT * 4, 0, 1);
      out.lean = rising ? -0.12 : 0.14;
      out.hipLX = rising ? -0.8 * t : -0.3;
      out.hipRX = rising ? 0.45 * t : 0.22;
      out.kneeL = rising ? 1.1 * t : 0.5;
      out.kneeR = rising ? 0.3 : 0.3;
      out.armLX = rising ? -1.2 : -0.7;
      out.armRX = rising ? -0.9 : -0.55;
      out.armLZ = 0.42; out.armRZ = -0.36;
      out.elbL = -0.5; out.elbR = -0.5;
      return;
    }

    if (!moving) return;   /* idle clip handles the rest */

    const s = Math.sin(this.walkPhase);
    const c = Math.cos(this.walkPhase);
    const sprint = running || State.time < this.speedUntil;
    const amp = walk.stride * (sprint ? 1.15 : 0.75) * (0.6 + 0.4 * Math.min(1, speedFrac));
    const bounce = walk.bounce * (sprint ? 1.5 : 1);

    out.hipLX = s * amp;
    out.hipRX = -s * amp;
    /* knees bend on the swing leg and absorb on contact */
    out.kneeL = Math.max(0, -s) * (sprint ? 1.45 : 0.95) + Math.max(0, c) * 0.12;
    out.kneeR = Math.max(0, s) * (sprint ? 1.45 : 0.95) + Math.max(0, -c) * 0.12;
    out.ankL = -out.kneeL * 0.35 + s * 0.1;
    out.ankR = -out.kneeR * 0.35 - s * 0.1;
    out.hipLZ = 0.04 + s * 0.02;
    out.hipRZ = -0.04 - s * 0.02;
    out.lean = walk.lean + (sprint ? 0.18 : 0);
    out.roll = s * walk.sway;
    out.bob = Math.abs(c) * bounce - bounce * 0.45;
    out.headX = 0.02 + (sprint ? 0.08 : 0);
    out.headY = Math.sin(this.walkPhase * 0.5) * 0.06;
    out.armLX = -s * walk.armSwing * (sprint ? 1.35 : 0.85);
    out.armRX = s * walk.armSwing * (sprint ? 1.35 : 0.85);
    out.armLZ = sprint ? 0.26 : 0.1;
    out.armRZ = -(sprint ? 0.26 : 0.1);
    out.elbL = -0.35 - (sprint ? 0.7 : 0.25);
    out.elbR = -0.35 - (sprint ? 0.7 : 0.25);

    switch (walk.style) {
      case 'march':
        out.hipLX = Math.max(0, s) * 0.6 - 0.16;
        out.hipRX = Math.max(0, -s) * 0.6 - 0.16;
        out.kneeL = 0.5 + Math.max(0, s) * 0.45;
        out.kneeR = 0.5 + Math.max(0, -s) * 0.45;
        out.ankL = -0.25; out.ankR = -0.25;
        out.armLX = -0.4 + s * 0.2; out.armRX = -0.4 - s * 0.2;
        out.armLZ = 0.14; out.armRZ = -0.14;
        out.elbL = -0.9; out.elbR = -0.9;
        out.bob = Math.abs(s) * 0.05;
        out.lean = 0.02;
        break;
      case 'stealth':
        out.lean = 0.3;
        out.bob = -0.1 + Math.abs(c) * 0.03;
        out.headX = -0.12;
        out.headY = Math.sin(now * 0.8 + this.id) * 0.18;
        out.kneeL = 0.3 + Math.max(0, -s) * 0.5;
        out.kneeR = 0.3 + Math.max(0, s) * 0.5;
        out.armLX = 0.42; out.armRX = -0.3;
        out.elbL = -0.8; out.elbR = -0.7;
        out.armLZ = 0.16; out.armRZ = -0.18;
        break;
      case 'guard':
        out.armLX = -1.3 + s * 0.1;
        out.armLZ = 0.42;
        out.elbL = -1.7;
        out.headX = -0.08;
        out.roll = s * 0.02;
        break;
      case 'sprint':
        out.lean = 0.36;
        out.armLX = -1.0 + s * 0.65; out.armRX = -1.0 - s * 0.65;
        out.armLZ = 0.2; out.armRZ = -0.2;
        out.elbL = -1.3; out.elbR = -1.3;
        out.kneeL = 0.55 + Math.max(0, -s) * 0.9;
        out.kneeR = 0.55 + Math.max(0, s) * 0.9;
        break;
      case 'casual':
        out.hipLX = s * amp * 0.8;
        out.hipRX = -s * amp * 0.8;
        out.armLX = -s * 0.26; out.armRX = s * 0.4;
        out.armLZ = 0.16; out.armRZ = -0.16;
        out.elbL = -0.22; out.elbR = -0.22;
        out.headX = 0.06;
        break;
      case 'swagger':
        out.roll = s * walk.sway * 1.7;
        out.armLX = -s * 0.35; out.armRX = s * 0.35;
        out.armLZ = 0.4 + Math.cos(this.walkPhase) * 0.08;
        out.armRZ = -0.4 - Math.cos(this.walkPhase) * 0.08;
        out.elbL = -0.7; out.elbR = -0.7;
        out.headX = -0.04;
        out.hipRZ = -0.08; out.hipLZ = 0.08;
        break;
      case 'stride':
        out.armLZ = 0.3; out.armRZ = -0.3;
        out.elbL = -0.5; out.elbR = -0.5;
        out.bob = Math.abs(c) * 0.13;
        break;
      case 'hover':
        out.bob = 0.14 + Math.sin(now * 3.4 + this.id) * 0.08;
        out.hipLX = Math.sin(this.walkPhase) * 0.26;
        out.hipRX = -Math.sin(this.walkPhase) * 0.26;
        out.kneeL = 0.22; out.kneeR = 0.22;
        out.armLX = -0.5; out.armRX = -0.32;
        out.armLZ = 0.45; out.elbL = -0.9;
        out.lean = 0.1;
        break;
    }
  }

  /* ---------------- per hero idle clip ---------------- */
  idlePose(out, now) {
    const id = heroIdle(this.heroKey);
    const breathe = Math.sin(now * 1.6 + this.id);
    const shift = Math.sin(now * 0.75 + this.id);
    out.chest = 1 + breathe * 0.022;
    out.bob = breathe * 0.012;
    out.roll = shift * 0.025;
    out.hipLZ = 0.03; out.hipRZ = -0.03;
    out.kneeL = 0.05 + Math.max(0, shift) * 0.08;
    out.kneeR = 0.05 + Math.max(0, -shift) * 0.08;
    out.headX = Math.sin(now * 0.9 + this.id) * 0.03;
    out.headY = Math.sin(now * 0.55 + this.id) * 0.18;
    out.headZ = id.headTilt;
    out.armLX = breathe * 0.12;
    out.armRX = -breathe * 0.12;
    out.armLZ = 0.09; out.armRZ = -0.09;
    out.elbL = -0.18; out.elbR = -0.18;

    switch (id.pose) {
      case 'eyes':
        /* laser eyes: hands at the temples, head tipped forward */
        out.armLX = -2.42 + breathe * 0.03;
        out.armRX = -2.42 - breathe * 0.03;
        out.armLZ = 0.8; out.armRZ = -0.8;
        out.elbL = -2.0; out.elbR = -2.0;
        out.headX = 0.12;
        out.lean = 0.06;
        break;
      case 'shieldGuard':
        /* shield up at chest/chin height: eyes just clear the rim, off arm wide */
        out.armLX = -1.05 + breathe * 0.04;
        out.armRX = -0.4 - breathe * 0.05;
        out.armLZ = 0.6; out.armRZ = -0.6;
        out.armLY = 0.85;
        out.elbL = -1.95; out.elbR = -0.55;
        out.headX = 0.12; out.headZ = -0.1; out.headY = Math.sin(now * 0.4) * 0.06;
        out.lean = 0.05;
        out.hipLX = 0.14; out.hipRX = -0.12;
        out.kneeL = 0.16; out.kneeR = 0.2;
        out.bob = -0.02;
        break;
      case 'hero':
        /* fists on hips, chin up, cape catching the wind */
        out.armLX = -0.6 + breathe * 0.03;
        out.armRX = -0.6 - breathe * 0.03;
        out.armLZ = 1.05; out.armRZ = -1.05;
        out.elbL = -1.55; out.elbR = -1.55;
        out.headX = -0.08;
        out.lean = -0.03;
        break;
      case 'crossed':
        /* arms folded across the chest */
        out.armLX = -1.15; out.armRX = -1.15;
        out.armLZ = 0.62; out.armRZ = -0.62;
        out.elbL = -2.0; out.elbR = -2.0;
        out.armLY = 0.5; out.armRY = -0.5;
        out.headX = 0.02;
        break;
      case 'stalk':
        /* low crouch, knife hand out, scanning */
        out.lean = 0.24;
        out.hipLX = 0.3; out.hipRX = -0.26;
        out.kneeL = 0.5; out.kneeR = 0.44;
        out.ankL = -0.2; out.ankR = -0.18;
        out.bob = -0.1;
        out.armLX = 0.3; out.armRX = -0.55;
        out.armLZ = 0.3; out.armRZ = -0.25;
        out.elbL = -0.6; out.elbR = -1.0;
        out.headX = -0.12;
        out.headY = Math.sin(now * 0.5 + this.id) * 0.3;
        break;
      case 'bounce':
        /* light on the feet, hands loose, shoulders rolling */
        const b = Math.sin(now * 6 + this.id);
        out.bob = Math.abs(b) * 0.06;
        out.kneeL = 0.12 + Math.abs(b) * 0.1;
        out.kneeR = 0.12 + Math.abs(b) * 0.1;
        out.armLX = -0.28 + b * 0.1; out.armRX = -0.28 - b * 0.1;
        out.armLZ = 0.24; out.armRZ = -0.24;
        out.elbL = -0.7; out.elbR = -0.7;
        out.lean = 0.08;
        break;
      case 'stance':
        /* fighting stance: guard up, weight split */
        out.lean = 0.1;
        out.hipLX = 0.16; out.hipRX = -0.14;
        out.kneeL = 0.26; out.kneeR = 0.2;
        out.armLX = -1.05 + breathe * 0.05;
        out.armRX = -1.2 - breathe * 0.05;
        out.armLZ = 0.38; out.armRZ = -0.42;
        out.elbL = -1.6; out.elbR = -1.75;
        out.headX = -0.05;
        break;
      case 'casual':
        /* hands low, shoulders slack */
        out.armLX = 0.1; out.armRX = 0.1;
        out.armLZ = 0.16; out.armRZ = -0.16;
        out.elbL = -0.3; out.elbR = -0.3;
        out.lean = 0.06;
        out.headX = 0.1;
        break;
      case 'relaxed': {
        /* arms hanging naturally at the sides: shoulders down, elbows
           barely bent, weight settled with a slow sway */
        const sw = Math.sin(now * 0.6 + this.id);
        out.armLX = id.armX + breathe * 0.05 + sw * 0.02;
        out.armRX = id.armX - breathe * 0.05 - sw * 0.02;
        out.armLZ = id.armZ + sw * 0.015;
        out.armRZ = -id.armZ - sw * 0.015;
        out.elbL = id.elb; out.elbR = id.elb;
        out.lean = id.lean || 0.02;
        out.hipLZ = 0.04; out.hipRZ = -0.04;
        out.kneeL = 0.06 + Math.max(0, shift) * 0.06;
        out.kneeR = 0.06 + Math.max(0, -shift) * 0.06;
        out.headX = id.headTilt + Math.sin(now * 0.8 + this.id) * 0.02;
        break;
      }
      case 'ring':
        /* arm raised, ring glowing beside the head */
        out.armRX = -1.9; out.armRZ = -0.75;
        out.elbR = -1.5;
        out.armLX = -0.3; out.armLZ = 0.2; out.elbL = -0.5;
        out.headX = -0.05;
        break;
    }
  }

  /* ---------------- gun stance clip ---------------- */
  stancePose(out, ads, focus) {
    const both = ads || focus;
    out.armRX = -1.62;
    out.armRZ = -0.06;
    out.elbR = -0.32;
    out.armRY = 0.08;
    if (both) {
      /* support hand meets the grip */
      out.armLX = -1.5;
      out.armLZ = 0.62;
      out.armLY = -0.3;
      out.elbL = -1.35;
      out.headX = 0.1;
      out.lean = 0.04;
      if (ads) {
        out.armRX = -1.7; out.armLX = -1.62;
        out.armLZ = 0.7;
        out.headX = 0.15;
        out.bob -= 0.03;
      }
    } else {
      out.armLX = -0.4;
      out.armLZ = 0.3;
      out.elbL = -0.7;
    }
  }

  /* ---------------- melee ready clip ---------------- */
  meleeReadyPose(out, model) {
    /* weapon held out in front of the body, off hand up as a guard */
    out.armRX = -0.62;
    out.armRZ = -0.24;
    out.elbR = -1.15;
    out.wristR = -0.25;
    out.armLX = -0.42;
    out.armLZ = 0.34;
    out.elbL = -1.0;
    if (model === 'axe' || model === 'hammer' || model === 'bat') {
      /* heavy weapons ride lower and further out */
      out.armRX = -0.3;
      out.armRZ = -0.5;
      out.elbR = -0.55;
    }
    if (model === 'dagger') {
      /* knives stay tucked closer, ready to stab */
      out.armRX = -0.55;
      out.armRZ = -0.18;
      out.elbR = -1.35;
    }
    out.lean = 0.05;
    out.twist = -0.06;
    out.kneeL = 0.1; out.kneeR = 0.12;
  }

  /* ---------------- melee arc clip ---------------- */
  meleePose(out, k) {
    const swing = meleeSwing(this.weapon.model || 'fist', this.swingAlt);
    const keys = swing.keys;
    let a = keys[0], b = keys[keys.length - 1];
    for (let i = 0; i < keys.length - 1; i++) {
      if (k >= keys[i][0] && k <= keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; break; }
    }
    const span = Math.max(0.0001, b[0] - a[0]);
    const t = clamp((k - a[0]) / span, 0, 1);
    const ease = t * t * (3 - 2 * t);
    const lerp = (x, y) => x + (y - x) * ease;
    out.armRX = lerp(a[1], b[1]);
    out.armRZ = lerp(a[2], b[2]);
    out.twist = lerp(a[3], b[3]);
    out.elbR = -0.45 - Math.sin(ease * Math.PI) * 0.5;
    /* the wrist rolls through the cut so the blade leads with its edge */
    out.wristR = lerp(-0.2, -1.25) * Math.sin(ease * Math.PI);
    /* the off arm counterbalances */
    out.armLX = -0.35 - Math.sin(ease * Math.PI) * 0.7;
    out.armLZ = 0.35 + Math.sin(ease * Math.PI) * 0.35;
    out.elbL = -0.8;
    out.lean = 0.06 + Math.sin(ease * Math.PI) * 0.16;
    out.hipLX = Math.sin(ease * Math.PI) * 0.18;
    out.hipRX = -Math.sin(ease * Math.PI) * 0.12;
  }

  /* ================= main pose pass ================= */
  pose(dt, now) {
    this.dt = dt;
    const p = this.parts;
    const P = this.blankPose();

    if (this.grounded && !this.prevGrounded) this.landT = 0.16;
    this.prevGrounded = this.grounded;
    if (!this.grounded) this.airT += dt; else this.airT = 0;
    if (this.landT > 0) this.landT = Math.max(0, this.landT - dt);
    if (this.bumpedWall > 0) this.bumpedWall -= dt;

    /* ---- 1. locomotion + idle ---- */
    const loco = this.blankPose();
    this.locomotionPose(loco, now);
    const speedNow = Math.hypot(this.vel.x, this.vel.z);
    const isMoving = speedNow > 1.2;
    const idleW = (this.grounded && !this.flying && !isMoving) ? 1 : 0;
    this.idleBlend += (idleW - this.idleBlend) * (1 - Math.exp(-dt * 6));
    this.blendPose(P, loco, 1);
    if (this.idleBlend > 0.01) {
      const idle = this.blankPose();
      this.idlePose(idle, now);
      this.blendPose(P, idle, this.idleBlend);
    }

    /* ---- 2. gun stance / melee guard ---- */
    const armed = this.weapon.kind === 'ranged' || this.weapon.kind === 'thrown';
    const meleeArmed = this.weapon.kind === 'melee' && this.weapon.model !== 'fist';
    let aimTarget = 0;
    if (armed && this.grounded && !this.flying) aimTarget = this.aiming ? 0.75 : 0.4;
    if (this.ads) aimTarget = 1;
    else if (this.focus) aimTarget = Math.max(aimTarget, 0.85);
    this.upperBlend += (aimTarget - this.upperBlend) * (1 - Math.exp(-dt * 12));
    if (this.upperBlend > 0.01) {
      const st = this.blankPose();
      this.stancePose(st, this.ads, this.focus);
      this.blendPose(P, st, this.upperBlend);
    }
    /* a melee weapon is always held ready, even while walking */
    const readyTarget = meleeArmed && !this.dead ? 1 : 0;
    this.readyBlend += (readyTarget - this.readyBlend) * (1 - Math.exp(-dt * 10));
    if (this.readyBlend > 0.01) {
      const rd = this.blankPose();
      this.meleeReadyPose(rd, this.weapon.model);
      this.blendPose(P, rd, this.readyBlend * (this.weapon.kind === 'melee' ? 1 : 0));
    }

    /* ---- 3. melee arc ---- */
    if (this.swingT > 0 && this.weapon.kind === 'melee') {
      this.swingT -= dt;
      const swing = meleeSwing(this.weapon.model || 'fist', this.swingAlt);
      const k = clamp(1 - Math.max(0, this.swingT) / (swing.dur * 1.1), 0, 1);
      const m = this.blankPose();
      this.meleePose(m, k);
      this.blendPose(P, m, Math.sin(clamp(k, 0, 1) * Math.PI) * 0.95 + 0.05);
    } else if (this.swingT > 0) {
      /* ability / gun flourish: a short punch-out of the right arm */
      this.swingT -= dt;
      const k = 1 - Math.max(0, this.swingT) / 0.22;
      const s = Math.sin(k * Math.PI);
      P.armRX = P.armRX * (1 - s) + (-1.9) * s;
      P.armRZ = P.armRZ * (1 - s) + (-0.05) * s;
      P.elbR = P.elbR * (1 - s) + (-0.2) * s;
      P.lean += s * 0.12;
      P.twist = s * -0.18;
    }

    /* ---- 4. shoot kick ---- */
    if (this.recoil > 0) {
      P.lean -= this.recoil * 0.35;
      P.armRX += this.recoil * 0.5;
      P.headX -= this.recoil * 0.3;
    }

    /* ---- 5. accents ---- */
    if (this.landT > 0) {
      const k = this.landT / 0.16;
      P.bob -= Math.sin(k * Math.PI) * 0.17;
      P.kneeL += Math.sin(k * Math.PI) * 0.5;
      P.kneeR += Math.sin(k * Math.PI) * 0.5;
      P.lean += Math.sin(k * Math.PI) * 0.1;
    }
    if (this.bumpedWall > 0) P.lean += Math.sin((this.bumpedWall / 0.25) * Math.PI) * 0.1;

    /* powers: hands come up when charging a beam */
    if (this.chargeFx > 0) {
      this.chargeFx -= dt;
      P.armRX = -1.25; P.armRZ = -0.2;
      P.elbR = -1.1;
      P.armLX = -1.25; P.armLZ = 0.2;
      P.elbL = -1.1;
    }

    /* ---- apply to the rig ---- */
    this.mesh.rotation.x = P.lean;
    this.mesh.rotation.z = P.roll;
    this.mesh.position.y += P.bob;
    if (p.spine) p.spine.rotation.y = P.twist;
    if (p.chest) p.chest.scale.set(P.chest, P.chest * 0.98, P.chest);
    p.head.rotation.x = P.headX;
    p.head.rotation.y += P.headY;
    p.head.rotation.z = P.headZ;

    p.armL.rotation.x = P.armLX; p.armL.rotation.z = P.armLZ; p.armL.rotation.y = P.armLY;
    p.armR.rotation.x = P.armRX; p.armR.rotation.z = P.armRZ; p.armR.rotation.y = P.armRY;
    p.elbowL.rotation.x = P.elbL;
    p.elbowR.rotation.x = P.elbR;
    if (p.wristR) p.wristR.rotation.z = P.wristR || 0;

    p.legL.rotation.x = P.hipLX; p.legL.rotation.z = P.hipLZ;
    p.legR.rotation.x = P.hipRX; p.legR.rotation.z = P.hipRZ;
    p.kneeL.rotation.x = P.kneeL;
    p.kneeR.rotation.x = P.kneeR;
    p.ankleL.rotation.x = P.ankL;
    p.ankleR.rotation.x = P.ankR;

    /* weapon hold: point the muzzle along the aim while levelled */
    /* weapon hold: each kind sits in the fist at its own angle */
    const wm = this.weaponMount;
    if (wm) {
      const model = this.weapon.model || 'fist';
      wm.position.set(0, -0.09, 0.055);
      wm.rotation.set(0, 0, 0);
      if (this.weapon.kind !== 'melee') {
        /* guns point away from the knuckles, muzzle forward */
        wm.rotation.x = -1.5;
        wm.position.set(0, -0.05, 0.06);
        const swayAmp = CONFIG.weaponSway * (this.ads ? 0.45 : 1);
        const sf = Math.min(1, speedNow / CONFIG.walkSpeed);
        wm.rotation.z += Math.sin(now * 7 + this.id) * swayAmp * sf;
        wm.rotation.y += Math.cos(now * 5.5 + this.id) * swayAmp * 0.6 * sf;
        wm.position.x += Math.sin(now * 7 + this.id) * swayAmp * 0.3 * sf;
      } else {
        /* melee: blade axis follows the forearm, tilted so the edge leads */
        const grips = {
          blade:  { x: -1.35, z: 0.15 },
          dagger: { x: -1.25, z: 0.0 },
          axe:    { x: -1.45, z: 0.1 },
          hammer: { x: -1.5, z: 0.1 },
          bat:    { x: -1.4, z: 0.12 },
          pan:    { x: -1.35, z: 0.1 },
          scythe: { x: -1.4, z: 0.2 },
          fist:   { x: -0.1, z: 0 },
        };
        const gp = grips[model] || grips.blade;
        wm.rotation.x = gp.x;
        wm.rotation.z = gp.z;
        wm.position.y = -0.11;
      }
      if (this.recoil > 0) {
        wm.position.z = 0.06 - this.recoil * 0.55;
        wm.rotation.x -= this.recoil * 1.1;
      }
      if (this.switchT > 0) {
        this.switchT -= dt;
        const k = 1 - Math.max(0, this.switchT) / CONFIG.switchTime;
        const dip = Math.sin(k * Math.PI);
        wm.position.y -= dip * 0.5;
        wm.rotation.x -= dip * 0.9;
      }
      if (this.reloading > 0 && this.switchT <= 0) {
        const w = this.weapon;
        const k = 1 - this.reloading / ((w.reload || 1.6) * CONFIG.reloadSpeedMult);
        wm.rotation.x += Math.sin(k * Math.PI) * 0.8;
        wm.position.y -= Math.sin(k * Math.PI) * 0.2;
      }
    }

    /* cape */
    if (p.cape) {
      const flap = this.flying ? 0.55 + Math.sin(now * 6) * 0.08
        : (isMoving ? 0.28 + Math.abs(Math.sin(this.walkPhase)) * 0.18 : Math.sin(now * 2.2) * 0.07);
      p.cape.rotation.x = flap;
    }

    /* flying heroes leave a bright streak behind them */
    if (this.flying && (isMoving || this.vel.y > 2)) {
      this.trailT = (this.trailT || 0) - dt;
      if (this.trailT <= 0) {
        this.trailT = 0.055;
        World.burst(this.pos.clone().addScaledVector(this.facing, -0.8).setY(this.pos.y + 1.3), this.hero.color, 3, 2.6, 0.6);
      }
    }

    /* eye glow: always a little if powered, blazing while lasering */
    this.eyeGlow = Math.max(0, (this.eyeGlow || 0) - dt * 3.2);
    const eyeGlow = Math.max(this.eyeGlow, this.powered ? 0.22 : 0);
    if (p.eyeGlowL && p.eyeGlowR) {
      p.eyeGlowL.material.opacity = eyeGlow;
      p.eyeGlowR.material.opacity = eyeGlow;
      const s = 0.3 + eyeGlow * 1.4;
      p.eyeGlowL.scale.setScalar(s);
      p.eyeGlowR.scale.setScalar(s);
    }

    /* aura + powered glow */
    p.aura.visible = this.powered;
    if (this.powered) {
      p.aura.material.opacity = 0.32 + Math.sin(now * 4) * 0.16;
      p.aura.rotation.z += dt * 1.2;
      p.glowSprite.material.opacity = 0.16 + Math.sin(now * 3) * 0.05;
      p.glowSprite.material.color.setHex(this.hero.color);
    } else {
      p.glowSprite.material.opacity = 0;
    }

    /* damage flash */
    if (this.hurtFlash > 0) {
      this.hurtFlash -= dt;
      this.materials[0].color.setHex(0xff6b6b);
      this.materials[1].color.setHex(0xff6b6b);
    } else {
      this.materials[0].color.setHex(this.hero.suit);
      this.materials[1].color.setHex(this.hero.accent);
    }

    this.bubble.visible = this.shield > 0;
    if (this.bubble.visible) this.bubble.material.opacity = 0.12 + 0.1 * Math.sin(now * 6);
  }
}
