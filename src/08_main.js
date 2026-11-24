'use strict';

/* ============================================================
   MAIN — renderer, camera, input, game loop
   ============================================================ */

const Game = {
  renderer: null,
  camera: null,
  yaw: 0,
  pitch: -0.3,
  camDist: 26,
  keys: Object.create(null),
  mouseDown: false,
  ads: false,             /* right button held */
  focus: false,           /* left button held with a gun out */
  aimBlend: 0,            /* smoothed 0..1 from ads */
  focusBlend: 0,          /* smoothed 0..1 from focus */
  locked: false,
  lastT: 0,
  frameAvg: 0,
  quality: 1,
  basePixelRatio: 1,

  init() {
    const canvas = document.getElementById('scene');
    this.debugFlags();
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.basePixelRatio = Math.min(window.devicePixelRatio || 1, CONFIG.maxPixelRatio);
    this.renderer.setPixelRatio(this.basePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    if ('outputColorSpace' in this.renderer) this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    State.scene = new THREE.Scene();
    State.camera = new THREE.PerspectiveCamera(CONFIG.baseFOV, window.innerWidth / window.innerHeight, 0.1, 1800);
    this.camera = State.camera;
    this.camera.position.set(0, 26, 60);

    World.init(this.renderer, State.scene);
    UI.init();
    this.spawnLobby();
    for (const f of State.fighters) UI.makePlate(f);
    this.bindInput();

    World.spawnBlock('big', 0, 0, { big: true, kind: 'big', y: BIG_SIZE * 0.5 + 3.6 });
    World.spawnBlock('galaxy', 42, -30, { kind: 'galaxy' });
    World.spawnBlock('rng', -40, 36, { kind: 'rng' });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.4;
      const r = i % 2 ? 48 : 96;
      World.spawnBlock(rollTier(), Math.cos(a) * r, Math.sin(a) * r, { kind: 'loose' });
    }

    this.lastT = performance.now();
    requestAnimationFrame(t => this.loop(t));
    if (this.autoStart) setTimeout(() => this.startMatch && this.startMatch(), 60);
  },

  spawnLobby() {
    const used = new Set();
    const pool = HERO_KEYS.slice();
    /* every bot wears a different hero skin */
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    const playerHero = UI.selectedHero || 'homelander';
    const botHeroes = pool.filter(k => k !== playerHero);
    const count = CONFIG.botCount + 1;

    for (let i = 0; i < count; i++) {
      const isPlayer = i === 0;
      const heroKey = isPlayer ? playerHero : botHeroes[(i - 1) % botHeroes.length];
      const f = new Fighter({
        name: isPlayer ? (UI.playerNameValue() || randomGamertag(used)) : randomGamertag(used),
        isPlayer, baseIndex: i, heroKey,
      });
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
      if (slotKey && State.started && State.player) State.player.useSlot(parseInt(slotKey[1], 10) - 1);

      if (e.code === 'KeyG' && State.started && State.player) {
        State.player.dropSlot(State.player.slotIndex);
      }

      const abilKey = { KeyQ: 0, KeyE: 1, KeyR: 2 }[e.code];
      if (abilKey !== undefined && State.started && State.player) {
        const pl = State.player;
        /* R reloads the gun when it needs it, otherwise fires ability 3 */
        if (e.code === 'KeyR' && pl.weapon.mag && pl.ammo < pl.weapon.mag) {
          pl.startReload();
        } else if (pl.powered) {
          pl.wantAbility = abilKey;
        }
      }
      if (e.code === 'Space' && State.started) e.preventDefault();
    });
    document.addEventListener('keyup', e => { this.keys[e.code] = false; });

    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) {
        this.mouseDown = true;
        this.focus = true;
        if (!this.locked && State.started) canvas.requestPointerLock();
      }
    });
    window.addEventListener('mouseup', e => {
      if (e.button === 0) { this.mouseDown = false; this.focus = false; }
      if (e.button === 2) this.ads = false;
    });
    canvas.addEventListener('mousedown', e => {
      if (e.button === 2) this.ads = true;
    });
    window.addEventListener('blur', () => { this.mouseDown = false; this.focus = false; this.ads = false; });
    window.addEventListener('contextmenu', e => e.preventDefault());

    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === canvas;
      document.getElementById('lockhint').style.display = (!this.locked && State.started) ? 'block' : 'none';
    });

    document.addEventListener('mousemove', e => {
      if (!this.locked) return;
      this.yaw -= e.movementX * 0.0024;
      this.pitch = clamp(this.pitch - e.movementY * 0.0022, -0.95, 0.5);
    });

    window.addEventListener('wheel', e => {
      this.camDist = clamp(this.camDist + Math.sign(e.deltaY) * 2, 12, 60);
    }, { passive: true });

    const startMatch = () => {
      if (State.started) return;
      /* name first, then character: keep the flow in order */
      if (!UI.playerNameValue()) {
        const inp = document.getElementById('name-input');
        if (inp) { inp.focus(); inp.style.borderColor = '#ff8a80'; setTimeout(() => { inp.style.borderColor = hexStr(HEROES[UI.selectedHero].color); }, 600); }
        if (UI.toast) UI.toast('Enter your name first', '#ff8a80');
        return;
      }
      Sound.init();
      Sound.resume();
      Sound.uiClick();

      /* apply the chosen name + hero skin */
      const p = State.player;
      const nm = UI.playerNameValue();
      if (nm) p.name = nm;
      if (UI.selectedHero && UI.selectedHero !== p.heroKey) p.setHero(UI.selectedHero);
      if (this.debugPower && !p.powered) {
        p.powered = true;
        State.superUnlocked = true;
        p.shield = 0;
      }
      if (this.debugWeapon) p.setWeapon(WEAPONS[this.debugWeapon], true);
      UI.updateInv();
      UI.updateTraits();

      document.getElementById('start').style.display = 'none';
      document.getElementById('hud').style.display = 'block';
      State.started = true;
      canvas.focus();
      canvas.requestPointerLock && canvas.requestPointerLock();
      UI.toast('Walk into blocks · roll the Super block for powers', '#8ef0ff');
      UI.feed('Big void block is live in the centre', '#35e0ff');
    };
    document.getElementById('play-btn').addEventListener('click', startMatch);
    this.startMatch = startMatch;
    this.autoStart = /[?&](auto|play)(=1)?\b/.test(location.search);
    if (this.autoStart) {
      /* debug runs: fill a name so the name gate doesn't block (e.g. ?auto=1) */
      const inp = document.getElementById('name-input');
      if (inp && !inp.value.trim()) {
        inp.value = 'TESTPILOT';
        inp.dispatchEvent(new Event('input'));
      }
      /* ?hero=key picks that character through the real click path */
    }
    if (this.debugHero) {
      const inp = document.getElementById('name-input');
      if (inp && !inp.value.trim()) { inp.value = 'TESTPILOT'; inp.dispatchEvent(new Event('input')); }
      UI.chooseHero(this.debugHero);
    }
    /* Enter also starts a match, for keyboard-only players */
    document.addEventListener('keydown', e => {
      if (!State.started && (e.code === 'Enter' || e.code === 'NumpadEnter')) {
        e.preventDefault();
        startMatch();
      }
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

    /* aim at the crosshair, independent of where you are running */
    p.aim.copy(fwd);
    p.aimPitch = this.pitch;
    p.aiming = (p.weapon.kind === 'ranged' || p.weapon.kind === 'thrown');
    /* left button with a gun out = focus zoom; right button = full ADS */
    const gunOut = p.weapon.kind === 'ranged';
    p.ads = this.ads && gunOut;
    p.focus = this.focus && gunOut && !p.ads;

    if (this.mouseDown && this.locked) {
      p.wantAttack = true;
      p.facing.copy(fwd);
    } else if (p.aiming) {
      p.facing.copy(fwd);
    } else if (dir.lengthSq() > 0.01) {
      p.facing.copy(dir.normalize());
    }
  },

  updateCamera(dt) {
    const p = State.player;

    /* top-down debug view of the whole map */
    if (this.mapView) {
      const d = p ? p.pos : new THREE.Vector3();
      this.camera.position.set(d.x + 0.01, 430, d.z + 0.01);
      this.camera.up.set(0, 0, -1);
      this.camera.lookAt(d.x, 0, d.z);
      this.camera.up.set(0, 1, 0);
      this.camera.fov = 50;
      this.camera.updateProjectionMatrix();
      return;
    }

    /* ?still=1 : a fixed portrait camera, used to inspect poses and grips */
    if (this.debugStill && p) {
      const fw = p.facing.clone().setY(0).normalize();
      this.camera.fov = 34;
      this.camera.updateProjectionMatrix();
      /* stand in front of the hero, slightly to the side */
      const side = new THREE.Vector3(fw.z, 0, -fw.x);
      this.camera.position.copy(p.pos)
        .addScaledVector(fw, 6.2)
        .addScaledVector(side, 2.4)
        .setY(p.pos.y + 2.2);
      this.camera.lookAt(p.pos.clone().setY(p.pos.y + 1.9));
      return;
    }

    /* smooth the two zoom inputs: right button = ADS, left = focus */
    const adsTarget = this.ads && p && p.weapon.kind === 'ranged' ? 1 : 0;
    const focusTarget = this.focus && p && p.weapon.kind === 'ranged' && !adsTarget ? 1 : 0;
    const aIn = 1 - Math.exp(-dt * CONFIG.aimInSpeed);
    const aOut = 1 - Math.exp(-dt * CONFIG.aimOutSpeed);
    this.aimBlend += (adsTarget - this.aimBlend) * (adsTarget > this.aimBlend ? aIn : aOut);
    this.focusBlend += (focusTarget - this.focusBlend) * (focusTarget > this.focusBlend ? aIn : aOut);
    this.aimBlend = clamp(this.aimBlend, 0, 1);
    this.focusBlend = clamp(this.focusBlend, 0, 1);

    const zoom = Math.max(this.aimBlend, this.focusBlend * CONFIG.focusBlend);

    const target = p.pos.clone().add(new THREE.Vector3(0, 3.4, 0));
    if (p.dead) target.y += 2;

    const cp = Math.cos(this.pitch);
    const baseDist = this.camDist;
    const aimDist = CONFIG.adsCamDist + (this.camDist - 26) * 0.4;
    const focusDist = CONFIG.focusCamDist + (this.camDist - 26) * 0.6;
    const dist = baseDist * (1 - zoom) + (aimDist * (1 - this.focusBlend) + focusDist * this.focusBlend) * zoom;
    /* aim over the shoulder a little, like a TPS shooter */
    const shoulder = this.aimBlend * 0.95;
    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * cp * dist + Math.cos(this.yaw) * shoulder,
      -Math.sin(this.pitch) * dist + (5 - zoom * 2.2) * 0.9,
      Math.cos(this.yaw) * cp * dist - Math.sin(this.yaw) * shoulder
    );
    const desired = target.clone().add(offset);
    desired.y = Math.max(desired.y, 2);

    const k = 1 - Math.exp(-dt * 9);
    this.camera.position.lerp(desired, k);

    /* punchy camera shake on heavy hits */
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const f = Math.max(0, this.shakeT / (this.shakeMax || 1));
      const a = (this.shakeAmt || 0) * f * f * 0.9;
      this.camera.position.x += (Math.random() - 0.5) * a;
      this.camera.position.y += (Math.random() - 0.5) * a;
      this.camera.position.z += (Math.random() - 0.5) * a;
    }

    this.camera.lookAt(target.x + Math.cos(this.yaw) * shoulder, target.y, target.z - Math.sin(this.yaw) * shoulder);

    /* aim zoom: ease between the hip FOV, the focus FOV and full ADS */
    const fovFocus = CONFIG.baseFOV * (1 - CONFIG.focusBlend) + CONFIG.focusFOV * CONFIG.focusBlend;
    const targetFov = fovFocus * (1 - this.aimBlend) + CONFIG.adsFOV * this.aimBlend;
    if (Math.abs(this.camera.fov - targetFov) > 0.02) {
      this.camera.fov = targetFov;
      this.camera.updateProjectionMatrix();
    }

    /* HUD feedback follows the zoom level, not just the button */
    const vg = document.getElementById('scope-vignette');
    if (vg) vg.style.opacity = String(clamp(this.aimBlend * 0.6 + this.focusBlend * CONFIG.focusBlend * 0.45, 0, 1));
    const ch = this.crosshairEl || (this.crosshairEl = document.getElementById('crosshair'));
    if (ch) {
      ch.classList.toggle('ads', this.aimBlend > 0.5);
      ch.classList.toggle('focus', this.focusBlend > 0.5 && this.aimBlend < 0.5);
      ch.style.transform = 'translate(-50%, -50%) scale(' + (1 + zoom * 0.22) + ')';
    }
  },

  /* Keep laptops smooth: if frames run slow for a while, drop the render
     resolution a notch; if there is headroom, ease it back up. The scene
     itself never changes, so the look stays consistent between devices. */
  /* screen feel: shake decays fast, hitstop freezes the sim for a beat */
  shake(amount, dur) {
    this.shakeT = Math.max(this.shakeT || 0, dur || 0.25);
    this.shakeMax = Math.max(this.shakeMax || 0, dur || 0.25);
    this.shakeAmt = Math.max(this.shakeAmt || 0, amount || 0.4);
  },

  hitstop(sec) {
    this.freeze = Math.max(this.freeze || 0, sec || 0.05);
  },

  trackQuality(dt) {
    if (!CONFIG.adaptiveQuality || this.qualityLocked) return;
    this.frameAvg = this.frameAvg * 0.9 + dt * 0.1;
    this.qualityT = (this.qualityT || 0) + dt;
    if (this.qualityT < 1.2) return;
    this.qualityT = 0;
    const fps = 1 / this.frameAvg;
    if (fps < 42 && this.quality > CONFIG.minRenderScale) {
      this.quality = Math.max(CONFIG.minRenderScale, this.quality - 0.1);
      this.applyQuality();
    } else if (fps > 58 && this.quality < 1) {
      this.quality = Math.min(1, this.quality + 0.05);
      this.applyQuality();
    }
  },

  applyQuality() {
    this.renderer.setPixelRatio(Math.max(0.75, this.basePixelRatio * this.quality));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  },

  /* ---- debug tooling: ?map=1 top-down view, ?demo=1 scripted walk + zoom ---- */
  debugFlags() {
    const q = location.search;
    this.mapView = /[?&]map(=1)?\b/.test(q);
    this.demoMode = /[?&]demo(=1)?\b/.test(q);
    this.showStats = this.mapView || this.demoMode || /[?&]debug(=1)?\b/.test(q);
    /* ?hero=soldierboy preselects a character (used by preview checks) */
    const hm = /[?&]hero=([a-z]+)/.exec(q);
    this.debugHero = hm && HEROES[hm[1]] ? hm[1] : null;
    /* ?power=1 unlocks the player's powers straight away */
    this.debugPower = /[?&]power(=1)?\b/.test(q);
    /* ?weapon=rusty_shiv equips a specific weapon for inspection */
    const wm2 = /[?&]weapon=([a-z_]+)/.exec(q);
    this.debugWeapon = wm2 && WEAPONS[wm2[1]] ? wm2[1] : null;
    /* ?still=1 freezes the camera and hero so animations can be inspected */
    this.debugStill = /[?&]still(=1)?\b/.test(q);
    if (this.showStats) {
      const d = document.createElement('div');
      d.id = 'debug-readout';
      d.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);padding:10px 14px;background:rgba(0,0,0,.82);border:1px solid #35e0ff;color:#8ef0ff;font:12px/1.5 monospace;white-space:pre;z-index:9999;pointer-events:none;border-radius:4px';
      document.body.appendChild(d);
      this.readout = d;
    }
  },

  updateDebug(dt) {
    if (this.demoT === undefined) this.demoT = 0;
    if (this.demoMode) {
      this.demoT += dt;
      /* 0-1.4s walk, then hold focus, release, then strafe */
      const t = this.demoT % 6;
      this.keys['KeyW'] = t > 0.2 && t < 4.2;
      this.keys['KeyD'] = t > 4.4;
      this.focus = t > 2.0 && t < 3.6;
      if (t > 3.6 && t < 3.7) this.focus = false;
    }
    if (!this.readout) return;
    const p = State.player;
    if (!p) return;
    const spd = Math.hypot(p.vel.x, p.vel.z);
    this.readout.textContent =
      'fps ' + (1 / (this.frameAvg || 1 / 60)).toFixed(0) +
      '  quality ' + this.quality.toFixed(2) +
      '\nfov ' + this.camera.fov.toFixed(1) +
      '  aim ' + this.aimBlend.toFixed(2) + '  focus ' + this.focusBlend.toFixed(2) +
      '\npos ' + p.pos.x.toFixed(1) + ',' + p.pos.y.toFixed(1) + ',' + p.pos.z.toFixed(1) +
      '  spd ' + spd.toFixed(1) +
      '\ngrounded ' + p.grounded + '  y-vel ' + p.vel.y.toFixed(1) +
      '\nweapon ' + p.weapon.name + '  aiming ' + p.aiming +
      '\nwalk ' + (HERO_WALK[p.heroKey] || 'hero') + '  phase ' + p.walkPhase.toFixed(2);
  },

  boom(pr, pos) {
    const w = pr.weapon;
    Sound.boom();
    World.burst(pos, (w.color || TIERS[w.tier].glow), 34, 14, 1.5);
    World.burst(pos, 0xffb066, 16, 10, 1.1);
    World.shockwave(pos, (w.color || TIERS[w.tier].glow), 10, 0.45);
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
      this.camera.position.set(Math.sin(this.yaw) * 150, 62, Math.cos(this.yaw) * 150);
      this.camera.lookAt(0, 4, 0);
      World.update(dt * 0.5);
      for (const f of State.fighters) f.mesh.position.copy(f.pos);
      HeroStage.update(dt);
      this.renderer.render(State.scene, this.camera);
      return;
    }

    if (this.mapView) {
      World.update(dt);
      for (const f of State.fighters) { f.update(dt); }
      this.renderer.render(State.scene, this.camera);
      return;
    }

    this.trackQuality(dt);

    /* hitstop: hold the simulation for a split second on heavy impacts */
    let simDt = dt;
    if (this.freeze > 0) { this.freeze -= dt; simDt = dt * 0.12; }

    World.update(simDt);
    this.updateDebug(dt);

    this.updatePlayerInput(simDt);
    for (const f of State.fighters) {
      if (!f.isPlayer) botThink(f, simDt);
      f.update(simDt);
    }
    this.separateFighters();
    this.updateProjectiles(simDt);
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

window.__LB = { State, World, Game, UI, CONFIG, WEAPONS, ITEMS, TIERS, HEROES, HERO_KEYS, Sound, randomGamertag, Fighter };

window.addEventListener('DOMContentLoaded', () => { Game.init(); });
