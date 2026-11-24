'use strict';

/* ============================================================
   HERO STAGE — the full-body 3D avatar on "Choose Your Character".
   It builds the same humanoid rig the game uses, stands it on a
   small plinth and plays the hero's real idle loop, so what you
   pick is exactly what you get in the match.
   ============================================================ */

const HeroStage = {
  ok: false,
  rig: null,
  renderer: null,
  scene: null,
  camera: null,
  canvas: null,
  t0: 0,
  key: null,
  spin: 0,

  init() {
    this.canvas = document.getElementById('hero-3d');
    if (!this.canvas) return;
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    } catch (e) {
      this.fail();
      return;
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    if ('outputColorSpace' in this.renderer) this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    this.camera.position.set(0, 1.95, 7.1);
    this.camera.lookAt(0, 1.55, 0);

    this.scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x141a2a, 1.15));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(3.5, 7, 5);
    this.scene.add(key);
    const rim = new THREE.PointLight(0x35e0ff, 22, 22);
    rim.position.set(-4, 3, -4);
    this.scene.add(rim);
    this.rim = rim;

    /* plinth + glow disc so the hero reads against the panel */
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 2.1, 0.16, 40),
      new THREE.MeshLambertMaterial({ color: 0x18203a })
    );
    disc.position.y = -0.08;
    this.scene.add(disc);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.86, 0.045, 6, 48),
      new THREE.MeshBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0.9 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.03;
    this.scene.add(ring);
    this.ring = ring;

    this.t0 = performance.now();
    this.ok = true;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  fail() {
    this.ok = false;
    const img = document.getElementById('hero-fallback');
    if (img && this.key) {
      img.src = makeHeroPortrait(this.key);
      img.style.display = 'block';
    }
  },

  resize() {
    if (!this.ok) return;
    const r = this.canvas.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return;
    this.renderer.setSize(r.width, r.height, false);
    this.camera.aspect = r.width / r.height;
    /* pull back on narrow panels so the whole body stays visible */
    this.camera.position.z = this.camera.aspect < 0.85 ? 9.4 : 7.1;
    this.camera.updateProjectionMatrix();
  },

  /* rebuild the avatar for a hero key */
  show(key) {
    if (!this.ok) {
      const img = document.getElementById('hero-fallback');
      if (img) { img.src = makeHeroPortrait(key); img.style.display = 'block'; }
      return;
    }
    if (this.key === key && this.rig) return;
    if (this.rig && this.rig.mesh) {
      this.scene.remove(this.rig.mesh);
      this.rig.mesh.traverse(o => {
        if (o.geometry) o.geometry.dispose();
      });
    }
    this.key = key;

    const rig = Object.create(Fighter.prototype);
    rig.heroKey = key;
    rig.hero = HEROES[key];
    rig.color = rig.hero.color;
    rig.powered = true;          /* powered so eyes/aura glow on the stage */
    rig.id = 2;
    rig.vel = new THREE.Vector3();
    rig.grounded = true;
    rig.flying = false;
    rig.dead = false;
    rig.dt = 1 / 60;
    rig.walkAnim = 0;
    rig.walkPhase = 0;
    rig.airT = 0;
    rig.landT = 0;
    rig.prevGrounded = true;
    rig.bumpedWall = 0;
    rig.upperBlend = 0;
    rig.readyBlend = 0;
    rig.swingT = 0;
    rig.weapon = { kind: 'melee', model: 'fist' };
    rig.eyeGlow = 0.4;
    rig.hurtFlash = 0;
    rig.shield = 0;
    rig.isPlayer = false;

    buildHumanoidRig(rig);
    /* the rig helper adds to the game scene; move it onto the stage */
    State.scene.remove(rig.mesh);
    this.scene.add(rig.mesh);
    rig.mesh.rotation.y = 0;
    this.rig = rig;

    if (this.rim) this.rim.color.setHex(rig.hero.color);
    if (this.ring) this.ring.material.color.setHex(rig.hero.color);
    this.spin = 0;
  },

  update(dt) {
    if (!this.ok || !this.rig) return;
    const now = (performance.now() - this.t0) / 1000;
    const rig = this.rig;

    /* the idle clip from the game, frame for frame */
    const P = rig.blankPose();
    rig.idlePose(P, now);

    rig.mesh.rotation.x = P.lean;
    rig.mesh.rotation.z = P.roll;
    rig.mesh.position.y = 0.06 + P.bob;
    if (rig.parts.spine) rig.parts.spine.rotation.y = P.twist;
    if (rig.parts.chest) rig.parts.chest.scale.set(P.chest, P.chest * 0.98, P.chest);
    rig.parts.head.rotation.x = P.headX;
    rig.parts.head.rotation.y = P.headY;
    rig.parts.head.rotation.z = P.headZ;

    rig.parts.armL.rotation.set(P.armLX, P.armLY, P.armLZ);
    rig.parts.armR.rotation.set(P.armRX, P.armRY, P.armRZ);
    rig.parts.elbowL.rotation.x = P.elbL;
    rig.parts.elbowR.rotation.x = P.elbR;
    rig.parts.legL.rotation.set(P.hipLX, 0, P.hipLZ);
    rig.parts.legR.rotation.set(P.hipRX, 0, P.hipRZ);
    rig.parts.kneeL.rotation.x = P.kneeL;
    rig.parts.kneeR.rotation.x = P.kneeR;
    rig.parts.ankleL.rotation.x = P.ankL;
    rig.parts.ankleR.rotation.x = P.ankR;

    /* slow turntable: the whole body turns, so both sides show */
    this.spin += dt * 0.42;
    rig.mesh.rotation.y = Math.sin(this.spin) * 0.55;

    if (rig.parts.cape) rig.parts.cape.rotation.x = 0.12 + Math.sin(now * 2.1) * 0.05;

    const g = 0.32 + Math.sin(now * 2.6) * 0.1;
    if (rig.parts.eyeGlowL) {
      rig.parts.eyeGlowL.material.opacity = g;
      rig.parts.eyeGlowR.material.opacity = g;
    }
    if (rig.parts.aura) {
      rig.parts.aura.visible = true;
      rig.parts.aura.material.opacity = 0.22 + Math.sin(now * 3) * 0.1;
      rig.parts.aura.rotation.z += dt * 0.8;
    }
    if (rig.parts.glowSprite) {
      rig.parts.glowSprite.material.opacity = 0.14 + Math.sin(now * 2.4) * 0.05;
    }
    this.resize();
    this.renderer.render(this.scene, this.camera);
  },
};
