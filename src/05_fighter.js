'use strict';

/* ============================================================
   FIGHTER — humanoid avatar with a hero skin, a 5-slot
   inventory, real gun models and super powers
   ============================================================ */

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
    this.blockCd = 0;
    this.wantAbility = -1;

    this.buildBody();
    this.placeAtBase();
    this.setWeapon(FISTS, true);
  }

  /* ================= humanoid body ================= */
  buildBody() {
    const h = this.hero;
    const g = new THREE.Group();

    const suitMat = mat(h.suit);
    const accentMat = mat(h.accent);
    const trimMat = mat(h.trim || h.accent);
    const skinMat = mat(h.skin || 0xf0c090);
    const hairCol = h.hair === 'blond' ? 0xf2d06b : h.hair === 'white' ? 0xe8eefc
      : h.hair === 'red' ? 0xb33a1f : h.hair === 'brown' ? 0x5a3a22
      : h.hair === 'black' ? 0x1a1c22 : 0x2a2c33;
    const hairMat = mat(hairCol);

    /* ---- torso: tapered chest over a narrower waist ---- */
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.34, 0.86, 12), suitMat);
    chest.position.y = 1.86;
    g.add(chest);
    const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.3, 0.42, 12), accentMat);
    waist.position.y = 1.28;
    g.add(waist);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 6, 14), trimMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 2.24;
    g.add(collar);

    /* emblem on the chest */
    if (h.emblem) {
      const em = this.makeEmblem(h.emblem, h.color);
      em.position.set(0, 1.98, 0.42);
      em.scale.setScalar(0.62);
      g.add(em);
    }

    /* ---- head ---- */
    const head = new THREE.Group();
    head.position.y = 2.62;
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), skinMat);
    skull.scale.set(1, 1.08, 0.95);
    head.add(skull);
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.3), skinMat);
    jaw.position.set(0, -0.22, 0.08);
    head.add(jaw);

    /* eyes */
    const eyeCol = this.powered ? h.color : 0x1b2230;
    const eyeMat = new THREE.MeshBasicMaterial({ color: eyeCol });
    const eyes = [];
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), eyeMat);
      eye.position.set(0.12 * s, 0.04, 0.3);
      head.add(eye);
      eyes.push(eye);
    }

    /* hair */
    if (h.hair !== 'bald' && h.hair !== 'none') {
      if (h.hair === 'spiky') {
        for (let i = 0; i < 7; i++) {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.42, 5), hairMat);
          spike.position.set(rand(-0.22, 0.22), 0.28 + rand(0, 0.12), rand(-0.16, 0.16));
          spike.rotation.z = rand(-0.5, 0.5);
          spike.rotation.x = rand(-0.4, 0.4);
          head.add(spike);
        }
      } else {
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), hairMat);
        cap.position.y = 0.05;
        head.add(cap);
      }
    }
    if (h.stache) {
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.08), hairMat);
      st.position.set(0, -0.14, 0.31);
      head.add(st);
    }
    if (h.mask) {
      const mask = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.34), mat(0x101318));
      mask.position.set(0, 0.02, 0.12);
      head.add(mask);
    }
    g.add(head);

    /* ---- arms: upper, elbow, forearm, hand ---- */
    const makeArm = side => {
      const shoulder = new THREE.Group();
      shoulder.position.set(0.46 * side, 2.14, 0);
      const delt = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), suitMat);
      shoulder.add(delt);
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.46, 10), suitMat);
      upper.position.y = -0.26;
      shoulder.add(upper);
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.115, 8, 6), accentMat);
      elbow.position.y = -0.5;
      shoulder.add(elbow);
      const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.44, 10), side > 0 && h.metalArm ? mat(0xb9c3d4) : suitMat);
      fore.position.y = -0.74;
      shoulder.add(fore);
      const hand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.14), skinMat);
      hand.position.y = -1.0;
      shoulder.add(hand);
      return shoulder;
    };
    const armR = makeArm(1);
    const armL = makeArm(-1);
    g.add(armR); g.add(armL);

    /* ---- legs ---- */
    const makeLeg = side => {
      const hip = new THREE.Group();
      hip.position.set(0.18 * side, 1.08, 0);
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.5, 10), accentMat);
      thigh.position.y = -0.26;
      hip.add(thigh);
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), suitMat);
      knee.position.y = -0.52;
      hip.add(knee);
      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.5, 10), suitMat);
      shin.position.y = -0.78;
      hip.add(shin);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.34), mat(0x1c2233));
      foot.position.set(0, -1.04, 0.07);
      hip.add(foot);
      return hip;
    };
    const legR = makeLeg(1);
    const legL = makeLeg(-1);
    g.add(legR); g.add(legL);

    /* ---- cape ---- */
    let cape = null;
    if (h.cape) {
      cape = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.5, 0.05), mat(h.accent));
      cape.position.set(0, 1.55, -0.32);
      g.add(cape);
    }

    /* ---- shield (soldier boy / cap) ---- */
    let shield = null;
    if (h.shield) {
      shield = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 16), mat(h.accent));
      shield.rotation.x = Math.PI / 2;
      shield.position.set(0, -0.85, 0.2);
      armL.add(shield);
    }

    /* ---- weapon mount on the right hand ---- */
    this.weaponMount = new THREE.Group();
    this.weaponMount.position.set(0, -1.02, 0.1);
    armR.add(this.weaponMount);

    /* ---- shield bubble + powered aura ---- */
    const bubble = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 14, 10),
      new THREE.MeshBasicMaterial({ color: 0x8ef0ff, transparent: true, opacity: 0.22, depthWrite: false })
    );
    bubble.position.y = 1.7;
    bubble.visible = false;
    g.add(bubble);

    const aura = new THREE.Mesh(
      new THREE.RingGeometry(0.9, 1.25, 32),
      new THREE.MeshBasicMaterial({ color: h.color, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })
    );
    aura.rotation.x = -Math.PI / 2;
    aura.position.y = 0.08;
    aura.visible = false;
    g.add(aura);

    const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: World.glowTex, color: h.color, transparent: true, opacity: 0.0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glowSprite.scale.setScalar(4.5);
    glowSprite.position.y = 1.6;
    g.add(glowSprite);

    /* muzzle flash sprite, shown for a frame when firing */
    const muzzle = new THREE.Sprite(new THREE.SpriteMaterial({
      map: World.glowTex, color: 0xffd54d, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    muzzle.scale.setScalar(1.6);
    muzzle.position.set(0, 0, 1.1);
    this.weaponMount.add(muzzle);

    this.mesh = g;
    this.parts = { head, armR, armL, legL, legR, chest, waist, cape, shield, eyes, aura, glowSprite, muzzle, eyeMat };
    this.materials = [suitMat, accentMat, skinMat];
    this.bubble = bubble;
    State.scene.add(g);
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
      const fist = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), mat(0xf0c090));
      g.add(fist);
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
      box(0.09, 0.2, 0.09, dark, 0, -0.16, 0);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.12), glowMat);
      blade.position.set(0, 0.22, 0);
      g.add(blade);
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
    while (this.weaponMount.children.length) {
      const c = this.weaponMount.children.pop();
      this.weaponMount.remove(c);
    }
    const model = this.buildWeaponModel(def);
    this.weaponMount.add(model);
    this.weaponModel = model;

    const muzzle = new THREE.Sprite(new THREE.SpriteMaterial({
      map: World.glowTex, color: 0xffd54d, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    muzzle.scale.setScalar(1.8);
    muzzle.position.set(0, 0.05, 1.15);
    this.weaponMount.add(muzzle);
    this.parts.muzzle = muzzle;

    this.ammo = def.mag || 0;
    this.reloading = 0;
    if (!silent) Sound.pickup(def.tier);
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
    if (s && s.type === 'weapon') this.setWeapon(s.def, true);
    else this.setWeapon(FISTS, true);
  }

  useSlot(i) {
    const s = this.slots[i];
    if (!s) return false;
    if (s.type === 'weapon') {
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

  doBeam(ab) {
    const origin = this.headPos();
    origin.y -= 0.05;
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
    const end = this.pos.clone().addScaledVector(fwd, hit ? hitD : range).setY(origin.y);
    World.beam(origin, end, ab.color, 0.22);
    World.beam(origin.clone().add(new THREE.Vector3(0, -0.12, 0)), end, ab.color, 0.12);
    World.burst(end, ab.color, 18, 9, 1.1);
    Sound.laser();
    if (hit) {
      hit.takeDamage(ab.dmg, this, { dmg: ab.dmg, kb: 6, effect: 'burn', tier: 'galaxy', range: 0, cd: 0 });
      hit.floatText('-' + ab.dmg, hexStr(ab.color));
    }
    this.parts.muzzle.material.opacity = 0;
  }

  doSuperPunch(ab) {
    const fwd = this.facing.clone().setY(0).normalize();
    const impact = this.pos.clone().addScaledVector(fwd, 2.6).setY(1.6);
    World.shockwave(this.pos.clone().addScaledVector(fwd, 2.2).setY(0.25), ab.color, 13, 0.5);
    World.burst(impact, ab.color, 26, 12, 1.3);
    Sound.punchBoom();
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
    if (this.flying) {
      this.vel.y = 9;
      Sound.jump();
      World.burst(this.pos.clone().setY(0.3), this.hero.color, 10, 6, 0.9);
      return;
    }
    const boosted = State.time < this.jumpUntil;
    if (!this.grounded) {
      /* one extra hop while a jump boost is active */
      if (boosted && !this.doubleJumped) {
        this.doubleJumped = true;
        this.vel.y = CONFIG.jumpSpeed * this.jumpMult * 0.95;
        World.shockwave(this.pos.clone().setY(0.15), 0xc9a6ff, 5, 0.4);
        World.burst(this.pos.clone().setY(0.4), 0xc9a6ff, 14, 7, 1);
        Sound.boost();
        if (this.isPlayer) this.floatText('DOUBLE JUMP', '#c9a6ff');
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
      if (g !== null && this.pos.y <= g && this.vel.y <= 0) {
        this.pos.y = g; this.vel.y = 0; this.grounded = true;
      } else if (g === null || this.pos.y > g + 0.02) {
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
    }
    this.atkCd = w.cd * (this.isPlayer ? 1 : rand(0.95, 1.25));
    this.swingT = 0.22;

    if (w.kind === 'melee') {
      Sound.swing();
      this.pendingHit = 0.09;
    } else {
      this.pendingHit = -1;
      this.fireProjectile();
      this.recoil = w.model === 'minigun' ? 0.05 : w.model === 'sniper' ? 0.22 : 0.12;
      this.muzzleT = 0.06;
      if (this.parts.muzzle) {
        this.parts.muzzle.material.color.setHex(TIERS[w.tier].glow);
        this.parts.muzzle.material.opacity = 1;
      }
      Sound.gunshot(w.model);
      if (this.ammo <= 0) this.startReload();
    }
  }

  startReload() {
    const w = this.weapon;
    if (!w.mag || this.reloading > 0) return;
    this.reloading = w.reload || 1.6;
    Sound.reload();
    if (this.isPlayer) this.floatText('RELOAD', '#8ea0c8');
  }

  fireProjectile() {
    const w = this.weapon;
    const t = TIERS[w.tier];
    const pellets = w.pellets || 1;
    const baseDir = this.facing.clone().setY(0).normalize();

    for (let p = 0; p < pellets; p++) {
      const dir = baseDir.clone();
      if (w.spread) {
        const a = rand(-w.spread, w.spread);
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
      if (amount <= 0) return;
    }

    this.hp -= amount;
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
    if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - dt * 1.6);
    if (this.muzzleT > 0) {
      this.muzzleT -= dt;
      if (this.muzzleT <= 0 && this.parts.muzzle) this.parts.muzzle.material.opacity = 0;
    }
    if (this.reloading > 0) {
      this.reloading -= dt;
      if (this.reloading <= 0) {
        this.ammo = this.weapon.mag || 0;
        this.reloading = 0;
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

  pose(dt, now) {
    const p = this.parts;
    const moving = Math.hypot(this.vel.x, this.vel.z) > 1.2;
    this.walkAnim += moving ? dt * 12 : dt * 3;
    const sw = moving ? Math.sin(this.walkAnim) * 0.65 : Math.sin(this.walkAnim * 0.6) * 0.05;

    if (this.flying) {
      /* superhero flight: lean in, arms swept back, legs together */
      this.mesh.rotation.x = moving ? -0.28 : -0.08;
      p.legL.rotation.x = 0.18;
      p.legR.rotation.x = 0.18;
      p.armL.rotation.x = -2.5;
      p.armL.rotation.z = 0.35;
      p.armR.rotation.x = -2.5;
      p.armR.rotation.z = -0.35;
      this.mesh.position.y += Math.sin(now * 3 + this.id) * 0.12;
      if (chance(0.15)) World.burst(this.pos.clone().setY(this.pos.y - 1.6), this.hero.color, 1, 2, 0.5);
    } else {
      this.mesh.rotation.x = 0;
      p.legL.rotation.x = sw;
      p.legR.rotation.x = -sw;
      p.armL.rotation.x = -sw * 0.8;
      p.armR.rotation.x = sw * 0.8;
      p.armL.rotation.z = 0;
      p.armR.rotation.z = 0;
    }

    /* guard pose for shield heroes (soldier boy / captain america) */
    if (this.hero.guard && !this.flying && this.swingT <= 0) {
      p.armL.rotation.x = -1.5;
      p.armL.rotation.z = 0.25;
      p.armL.rotation.y = 0.2;
      p.head.rotation.x = 0.08;
    } else {
      p.head.rotation.x = 0;
      p.armL.rotation.y = 0;
    }

    /* swing / recoil */
    if (this.swingT > 0) {
      this.swingT -= dt;
      const k = 1 - Math.max(0, this.swingT) / 0.22;
      p.armR.rotation.x = -Math.sin(k * Math.PI) * 2.1;
      p.armR.rotation.z = -Math.sin(k * Math.PI) * 0.4;
    }
    if (this.recoil > 0) {
      this.weaponMount.position.z = 0.1 - this.recoil * 1.1;
      this.weaponMount.rotation.x = -this.recoil * 1.6;
    } else {
      this.weaponMount.position.z = 0.1;
      this.weaponMount.rotation.x = 0;
    }
    /* reload: tilt the gun down while the mag swaps */
    if (this.reloading > 0) {
      const w = this.weapon;
      const k = 1 - this.reloading / (w.reload || 1.6);
      this.weaponMount.rotation.x = Math.sin(k * Math.PI) * 0.9;
      this.weaponMount.position.y = -1.02 - Math.sin(k * Math.PI) * 0.25;
    } else {
      this.weaponMount.position.y = -1.02;
    }

    /* cape sway */
    if (p.cape) {
      p.cape.rotation.x = this.flying ? 0.5 + Math.sin(now * 6) * 0.08 : Math.sin(now * 2.2) * 0.08;
      p.cape.position.z = -0.32 - (this.flying ? 0.15 : 0);
    }

    /* powered aura + eyes */
    const powered = this.powered;
    p.aura.visible = powered;
    if (powered) {
      p.aura.material.opacity = 0.35 + Math.sin(now * 4) * 0.18;
      p.aura.rotation.z += dt * 1.2;
      p.glowSprite.material.opacity = 0.18 + Math.sin(now * 3) * 0.06;
      p.glowSprite.material.color.setHex(this.hero.color);
    } else {
      p.glowSprite.material.opacity = 0;
    }

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
