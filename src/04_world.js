'use strict';

/* ============================================================
   STATE + WORLD: space backdrop, arena, bases, chambers,
   lucky blocks (incl. the glitching Super block), particles
   ============================================================ */

const State = {
  scene: null, camera: null, renderer: null,
  fighters: [], blocks: [], chambers: [], projectiles: [], particles: [], beams: [], shockwaves: [], casings: [],
  bases: [], player: null,
  time: 0,
  timers: { big: CONFIG.bigWaveMs, galaxy: CONFIG.galaxyBlockMs, rng: CONFIG.rngBlockMs, loose: 3000, super: CONFIG.superBlockMs },
  started: false, wave: 1,
  islands: [],
  superUnlocked: false,
};

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#________0123456789';

const World = {
  glowTex: null,
  particlePool: [],
  tex: {},
  matrix: null,
  glitchLabels: [],

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
    c.width = 32; c.height = 512;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0a0620');
    grad.addColorStop(0.32, '#141a44');
    grad.addColorStop(0.55, '#233066');
    grad.addColorStop(0.78, '#3b2a63');
    grad.addColorStop(1, '#0a0a1e');
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 512);
    return new THREE.CanvasTexture(c);
  },

  makeQuestionTexture(bg, mark, rim) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = bg;
    g.fillRect(0, 0, 256, 256);
    g.globalAlpha = 0.10;
    g.strokeStyle = '#ffffff';
    g.lineWidth = 2;
    for (let i = 32; i < 256; i += 32) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke();
      g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke();
    }
    g.globalAlpha = 1;
    g.strokeStyle = rim;
    g.lineWidth = 14;
    g.strokeRect(7, 7, 242, 242);
    g.font = 'bold 172px Arial, Helvetica, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = mark;
    g.shadowColor = mark;
    g.shadowBlur = 24;
    g.fillText('?', 128, 132);
    g.shadowBlur = 0;
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  },

  makeGalaxyTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#06031a';
    g.fillRect(0, 0, 256, 256);
    const clouds = [
      ['rgba(120,60,255,0.55)', 70, 80, 120],
      ['rgba(40,180,255,0.42)', 180, 150, 110],
      ['rgba(255,80,200,0.32)', 120, 200, 95],
      ['rgba(255,240,255,0.22)', 150, 70, 70],
    ];
    for (const [col, x, y, r] of clouds) {
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, col);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 256, 256);
    }
    g.strokeStyle = 'rgba(200,180,255,0.35)';
    g.lineWidth = 2;
    for (let arm = 0; arm < 2; arm++) {
      g.beginPath();
      for (let a = 0; a < Math.PI * 3; a += 0.12) {
        const r = 8 + a * 12;
        const x = 128 + Math.cos(a + arm * Math.PI) * r;
        const y = 128 + Math.sin(a + arm * Math.PI) * r * 0.85;
        if (a === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
    }
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * 256, y = Math.random() * 256;
      const r = Math.random() * 1.7 + 0.3;
      g.globalAlpha = 0.35 + Math.random() * 0.65;
      g.fillStyle = Math.random() > 0.8 ? '#b7d6ff' : '#ffffff';
      g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill();
    }
    g.globalAlpha = 1;
    g.font = 'bold 168px Arial, Helvetica, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.shadowColor = '#c9a6ff';
    g.shadowBlur = 34;
    g.fillStyle = '#efe6ff';
    g.fillText('?', 128, 132);
    g.shadowBlur = 0;
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  },

  makeVoidTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#03050c';
    g.fillRect(0, 0, 256, 256);
    const core = g.createRadialGradient(128, 128, 4, 128, 128, 120);
    core.addColorStop(0, 'rgba(53,224,255,0.55)');
    core.addColorStop(0.35, 'rgba(20,80,140,0.35)');
    core.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = core;
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 26; i++) {
      g.beginPath();
      const a0 = i * 0.5;
      for (let a = a0; a < a0 + 2.6; a += 0.1) {
        const r = 6 + a * 9;
        const x = 128 + Math.cos(a) * r;
        const y = 128 + Math.sin(a) * r * 0.9;
        if (a === a0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.strokeStyle = i % 3 === 0 ? 'rgba(120,230,255,0.30)' : 'rgba(70,120,255,0.16)';
      g.lineWidth = i % 3 === 0 ? 2.4 : 1.2;
      g.stroke();
    }
    for (let i = 0; i < 90; i++) {
      g.globalAlpha = 0.2 + Math.random() * 0.6;
      g.fillStyle = '#9bf0ff';
      g.beginPath();
      g.arc(Math.random() * 256, Math.random() * 256, Math.random() * 1.4 + 0.3, 0, 6.3);
      g.fill();
    }
    g.globalAlpha = 1;
    g.strokeStyle = '#35e0ff';
    g.lineWidth = 12;
    g.strokeRect(6, 6, 244, 244);
    g.font = 'bold 160px Arial, Helvetica, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.shadowColor = '#35e0ff';
    g.shadowBlur = 40;
    g.fillStyle = '#d8fbff';
    g.fillText('?', 128, 132);
    g.shadowBlur = 0;
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  },

  makeMatrixTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#02160a';
    g.fillRect(0, 0, 256, 256);
    const cols = 16;
    const colW = 256 / cols;
    const glyphs = '01アイウエオカキクケコサシスセソタチツテト?!#$%&*+=<>{}[]';
    for (let i = 0; i < cols; i++) {
      let y = Math.random() * 40;
      const len = 8 + Math.random() * 18;
      for (let j = 0; j < len; j++) {
        const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
        const fade = 1 - j / len;
        g.fillStyle = j === 0 ? '#d6ffe4'
          : 'rgba(' + Math.floor(40 + 60 * fade) + ',' + Math.floor(190 + 60 * fade) + ',' + Math.floor(90 + 40 * fade) + ',' + (0.25 + fade * 0.75) + ')';
        g.font = 'bold 16px monospace';
        g.fillText(ch, i * colW + 3, y);
        y += 15;
      }
    }
    g.strokeStyle = '#4dff8f';
    g.lineWidth = 10;
    g.strokeRect(5, 5, 246, 244);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  },

  /* glitching hero block: torn scanlines, magenta / cyan */
  makeSuperTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#12002a';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 26; i++) {
      const y = Math.random() * 256;
      const h = Math.random() * 10 + 2;
      g.fillStyle = Math.random() > 0.5 ? 'rgba(255,92,225,0.35)' : 'rgba(53,224,255,0.30)';
      g.fillRect(0, y, 256, h);
    }
    for (let i = 0; i < 40; i++) {
      g.fillStyle = 'rgba(255,255,255,' + (0.05 + Math.random() * 0.2) + ')';
      g.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 40 + 4, 2);
    }
    g.strokeStyle = '#ff5ce1';
    g.lineWidth = 12;
    g.strokeRect(6, 6, 244, 244);
    g.font = 'bold 120px "Courier New", monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.shadowColor = '#ff5ce1';
    g.shadowBlur = 30;
    g.fillStyle = '#ffe6ff';
    g.fillText('S', 128, 132);
    g.shadowColor = '#35e0ff';
    g.fillStyle = '#d8fbff';
    g.fillText('S', 120, 126);
    g.shadowBlur = 0;
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  },

  blockTexture(tierKey) {
    if (this.tex[tierKey]) return this.tex[tierKey];
    let t;
    if (tierKey === 'galaxy') t = this.makeGalaxyTexture();
    else if (tierKey === 'big') t = this.makeVoidTexture();
    else if (tierKey === 'rng') t = this.makeMatrixTexture();
    else if (tierKey === 'super') t = this.makeSuperTexture();
    else {
      const tier = TIERS[tierKey];
      t = this.makeQuestionTexture(hexStr(tier.color), '#2a2100', hexStr(tier.glow));
    }
    this.tex[tierKey] = t;
    return t;
  },

  makeLabel() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 96;
    const g = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false, depthTest: false,
    }));
    sprite.scale.set(9, 3.4, 1);
    const setText = (text, color) => {
      g.clearRect(0, 0, 256, 96);
      g.fillStyle = 'rgba(4,8,16,0.72)';
      g.fillRect(0, 12, 256, 72);
      g.strokeStyle = color || '#8ef0ff';
      g.lineWidth = 4;
      g.strokeRect(2, 14, 252, 68);
      g.font = 'bold 44px "Segoe UI", Arial, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = color || '#8ef0ff';
      g.fillText(text, 128, 50);
      tex.needsUpdate = true;
    };
    return { sprite, setText, tex };
  },

  /* "Super" written with random characters glitching through it */
  makeGlitchLabel(word, colorA, colorB) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 96;
    const g = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, transparent: true, depthWrite: false, depthTest: false,
    }));
    sprite.scale.set(11, 4.2, 1);
    let next = 0;
    const entry = { sprite, tex };
    const draw = () => {
      g.clearRect(0, 0, 256, 96);
      g.font = 'bold 56px "Courier New", monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const chars = word.split('');
      const glitched = chars.map(ch => (Math.random() < 0.45 ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : ch));
      const txt = glitched.join('');
      g.shadowColor = colorA;
      g.shadowBlur = 22;
      g.fillStyle = colorB;
      g.fillText(txt, 128, 46);
      g.globalAlpha = 0.75;
      g.fillStyle = colorA;
      g.fillText(txt, 122 + Math.random() * 10, 42 + Math.random() * 8);
      g.globalAlpha = 1;
      g.shadowBlur = 0;
      tex.needsUpdate = true;
    };
    draw();
    entry.draw = draw;
    entry.next = next;
    this.glitchLabels.push(entry);
    return entry;
  },

  init(renderer, scene) {
    this.renderer = renderer;
    this.scene = scene;
    this.glowTex = this.makeGlowTexture();
    this.matrix = this.blockTexture('rng');

    scene.background = new THREE.Color(0x05060f);
    scene.fog = new THREE.Fog(0x0a0d20, 420, 1400);

    this.buildSky();
    this.buildIslands();

    scene.add(new THREE.HemisphereLight(0x9db8ff, 0x1a2035, 1.05));
    const sun = new THREE.DirectionalLight(0xfff2d0, 1.5);
    sun.position.set(70, 120, 50);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x6d7bff, 0.85);
    rim.position.set(-60, 40, -90);
    scene.add(rim);

    this.buildArena();
    this.buildBases();
    this.initParticles();
  },

  buildSky() {
    const s = this.scene;
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(900, 32, 20),
      new THREE.MeshBasicMaterial({ map: this.makeSkyTexture(), side: THREE.BackSide, depthWrite: false, fog: false })
    );
    s.add(sky);

    const count = 2200;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 520 + Math.random() * 320;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(rand(-1, 1));
      pos[i * 3] = Math.sin(ph) * Math.cos(th) * r;
      pos[i * 3 + 1] = Math.cos(ph) * r * 0.7;
      pos[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const stars = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xdfe9ff, size: 2.6, sizeAttenuation: false, transparent: true, opacity: 0.95, fog: false,
    }));
    s.add(stars);
    this.stars = stars;

    const nebCols = [0x6a3cff, 0x2b6bff, 0xff4fb0, 0x35e0ff, 0x8b5cf6, 0x2fd6a8];
    for (let i = 0; i < 7; i++) {
      const col = nebCols[i % nebCols.length];
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: this.glowTex, color: col, transparent: true, opacity: 0.24,
        blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
      }));
      const a = (i / 7) * Math.PI * 2;
      const r = 250 + Math.random() * 130;
      sp.position.set(Math.cos(a) * r, rand(-120, 190), Math.sin(a) * r);
      sp.scale.setScalar(rand(300, 470));
      s.add(sp);
    }

    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(88, 24, 18),
      new THREE.MeshBasicMaterial({ color: 0x2a3b7a })
    );
    planet.position.set(-265, 135, -330);
    s.add(planet);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(140, 6, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0x6d7bd6, transparent: true, opacity: 0.55 })
    );
    ring.position.copy(planet.position);
    ring.rotation.x = 1.15;
    ring.rotation.z = 0.3;
    s.add(ring);

    /* ---------- more planets ---------- */
    this.planets = [];
    const planetDefs = [
      { r: 54, color: 0x8a5a2a, pos: [300, 95, -280], ring: 0xd8a24a },
      { r: 36, color: 0x2f5b8a, pos: [-340, -30, 260], ring: null },
      { r: 66, color: 0x4a2a6b, pos: [200, 210, 340], ring: 0x8b5cf6 },
      { r: 26, color: 0x2a7a6b, pos: [-200, 240, -320], ring: null },
      { r: 18, color: 0xb04a4a, pos: [120, -160, 300], ring: null },
    ];
    for (const d of planetDefs) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(d.r, 22, 16),
        new THREE.MeshBasicMaterial({ color: d.color, fog: false })
      );
      m.position.set(d.pos[0], d.pos[1], d.pos[2]);
      s.add(m);
      this.planets.push({ mesh: m, spin: rand(-0.02, 0.02) });
      if (d.ring) {
        const rg = new THREE.Mesh(
          new THREE.TorusGeometry(d.r * 1.7, d.r * 0.07, 6, 60),
          new THREE.MeshBasicMaterial({ color: d.ring, transparent: true, opacity: 0.5, fog: false })
        );
        rg.position.copy(m.position);
        rg.rotation.x = 1.2 + rand(-0.3, 0.3);
        s.add(rg);
        this.planets.push({ mesh: rg, spin: 0.004 });
      }
    }

    /* ---------- comets, supernovae, gamma rays ---------- */
    this.comets = [];
    for (let i = 0; i < 5; i++) this.comets.push(this.makeComet());
    this.novas = [];
    this.gammas = [];
    this.novaT = rand(4, 9);
    this.gammaT = rand(2, 5);
  },

  makeComet() {
    const g = new THREE.Group();
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(1.8, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false })
    );
    g.add(head);
    const tail = new THREE.Mesh(
      new THREE.ConeGeometry(2.6, 36, 6, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x9bd8ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    );
    tail.rotation.x = Math.PI / 2;
    tail.position.z = -19;
    g.add(tail);
    const a = rand(0, Math.PI * 2), r = rand(300, 620);
    g.position.set(Math.cos(a) * r, rand(-200, 220), Math.sin(a) * r);
    this.scene.add(g);
    return { mesh: g, life: rand(4, 10), vel: new THREE.Vector3(rand(-60, 60), rand(-30, 30), rand(-60, 60)) };
  },

  spawnNova() {
    const a = rand(0, Math.PI * 2), r = rand(320, 640);
    const pos = new THREE.Vector3(Math.cos(a) * r, rand(-120, 280), Math.sin(a) * r);
    const col = pick([0xffd27a, 0x9bd8ff, 0xff8ad8, 0xc9a6ff, 0xffffff]);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowTex, color: col, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
    }));
    glow.position.copy(pos);
    glow.scale.setScalar(10);
    this.scene.add(glow);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(6, 8, 40),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    );
    ring.position.copy(pos);
    ring.lookAt(0, 0, 0);
    this.scene.add(ring);
    this.novas.push({ glow, ring, t: 0, life: 2.6 });
    Sound.glitch();
  },

  spawnGamma() {
    const a = rand(0, Math.PI * 2);
    const start = new THREE.Vector3(Math.cos(a) * 520, rand(-80, 280), Math.sin(a) * 520);
    const dir = new THREE.Vector3(rand(-1, 1), rand(-0.4, 0.4), rand(-1, 1)).normalize();
    const len = 280;
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 1.8, len, 6, 1, true),
      new THREE.MeshBasicMaterial({ color: pick([0x9bd8ff, 0xffd27a, 0xff8ad8]), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
    );
    beam.position.copy(start).addScaledVector(dir, len / 2);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    this.scene.add(beam);
    this.gammas.push({ mesh: beam, t: 0, life: rand(0.5, 1.4) });
  },

  updateSky(dt) {
    if (this.stars) {
      this.stars.material.opacity = 0.82 + Math.sin(State.time * 1.7) * 0.12;
      this.stars.rotation.y += dt * 0.004;
    }
    for (const p of this.planets || []) p.mesh.rotation.y += dt * p.spin;

    for (const c of this.comets || []) {
      c.mesh.position.addScaledVector(c.vel, dt);
      c.mesh.lookAt(c.mesh.position.clone().add(c.vel));
      c.life -= dt;
      if (c.life <= 0) {
        const a = rand(0, Math.PI * 2), r = rand(300, 620);
        c.mesh.position.set(Math.cos(a) * r, rand(-200, 220), Math.sin(a) * r);
        c.vel.set(rand(-60, 60), rand(-30, 30), rand(-60, 60));
        c.life = rand(5, 12);
      }
    }

    this.novaT -= dt;
    if (this.novaT <= 0) { this.novaT = rand(7, 16); this.spawnNova(); }
    for (let i = this.novas.length - 1; i >= 0; i--) {
      const n = this.novas[i];
      n.t += dt;
      const k = n.t / n.life;
      n.glow.scale.setScalar(10 + k * 80);
      n.glow.material.opacity = Math.max(0, 1 - k);
      n.ring.scale.setScalar(1 + k * 10);
      n.ring.material.opacity = Math.max(0, 0.9 - k);
      if (k >= 1) { this.scene.remove(n.glow); this.scene.remove(n.ring); this.novas.splice(i, 1); }
    }

    this.gammaT -= dt;
    if (this.gammaT <= 0) { this.gammaT = rand(2.5, 6); this.spawnGamma(); }
    for (let i = this.gammas.length - 1; i >= 0; i--) {
      const gm = this.gammas[i];
      gm.t += dt;
      gm.mesh.material.opacity = Math.max(0, 0.85 * (1 - gm.t / gm.life));
      if (gm.t >= gm.life) { this.scene.remove(gm.mesh); this.gammas.splice(i, 1); }
    }
  },


  buildIslands() {
    const rockMats = [0x2c3450, 0x353f5e, 0x263049, 0x3a3355];
    const topMats = [0x3f6b58, 0x4a5f8a, 0x5a4b7a, 0x3d5f74];
    for (let i = 0; i < 24; i++) {
      const g = new THREE.Group();
      const r = rand(14, 42);
      const h = r * rand(0.9, 2.2);
      const rock = new THREE.Mesh(
        new THREE.ConeGeometry(r, h, 7, 1),
        new THREE.MeshLambertMaterial({ color: pick(rockMats), flatShading: true })
      );
      rock.rotation.x = Math.PI;
      rock.position.y = -h / 2;
      g.add(rock);
      const top = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r * 0.96, 1.6, 7),
        new THREE.MeshLambertMaterial({ color: pick(topMats), flatShading: true })
      );
      g.add(top);
      for (let k = 0; k < randInt(1, 4); k++) {
        const s = rand(1.4, 3.4);
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(s, s * rand(1, 2.4), s),
          new THREE.MeshLambertMaterial({ color: pick([0x6a7fa8, 0x8a6aa8, 0x4f7f6a]), flatShading: true })
        );
        box.position.set(rand(-r * 0.5, r * 0.5), s * 0.6, rand(-r * 0.5, r * 0.5));
        box.rotation.y = rand(0, 6.3);
        g.add(box);
      }
      const a = (i / 24) * Math.PI * 2 + rand(-0.2, 0.2);
      const dist = rand(150, 430);
      g.position.set(Math.cos(a) * dist, rand(-110, 80), Math.sin(a) * dist);
      g.rotation.y = rand(0, 6.3);
      this.scene.add(g);
      State.islands.push({ mesh: g, baseY: g.position.y, phase: rand(0, 6.3), drift: rand(0.4, 1.2), spin: rand(-0.05, 0.05) });
    }
  },

  buildArena() {
    const s = this.scene;
    const topTex = this.makeGridTexture('#2b3450', '#46567f');
    topTex.repeat.set(26, 26);
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(ARENA_R, ARENA_R, 2.4, 12),
      new THREE.MeshLambertMaterial({ map: topTex, color: 0xffffff })
    );
    top.position.y = -1.2;
    s.add(top);

    const under = new THREE.Mesh(
      new THREE.CylinderGeometry(ARENA_R * 0.94, ARENA_R * 0.45, 22, 12),
      new THREE.MeshLambertMaterial({ color: 0x1a2136, flatShading: true })
    );
    under.position.y = -13;
    s.add(under);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(ARENA_R + 0.1, 0.6, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0x35e0ff })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.05;
    s.add(rim);

    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(15, 15, 0.2, 12),
      new THREE.MeshBasicMaterial({ color: 0x0d3b52 })
    );
    pad.position.y = 0.02;
    s.add(pad);
    const padRing = new THREE.Mesh(
      new THREE.TorusGeometry(15, 0.35, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0.8 })
    );
    padRing.rotation.x = Math.PI / 2;
    padRing.position.y = 0.16;
    s.add(padRing);
    this.padRing = padRing;
  },

  buildBases() {
    const s = this.scene;
    const count = CONFIG.botCount + 1;
    for (let i = 0; i < count; i++) {
      const team = TEAM_COLORS[i % TEAM_COLORS.length];
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      const bx = Math.cos(a) * BASE_DIST;
      const bz = Math.sin(a) * BASE_DIST;
      const base = { index: i, x: bx, z: bz, angle: a, team, color: team.hex, glow: team.glow };
      State.bases.push(base);

      const colTex = this.makeGridTexture('#333d5c', '#4a5883');
      colTex.repeat.set(4, 12);
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(BASE_R, BASE_R * 0.7, 70, 12),
        new THREE.MeshLambertMaterial({ map: colTex, color: 0xffffff })
      );
      col.position.set(bx, -35, bz);
      s.add(col);

      const bt = new THREE.Mesh(
        new THREE.CylinderGeometry(BASE_R, BASE_R, 2, 12),
        new THREE.MeshLambertMaterial({ color: team.hex })
      );
      bt.position.set(bx, -1, bz);
      s.add(bt);

      const len = BASE_DIST - ARENA_R + 1;
      const mid = (ARENA_R + BASE_DIST) / 2;
      const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(BRIDGE_HALF * 2, 1, len),
        new THREE.MeshLambertMaterial({ color: 0x3a4463 })
      );
      bridge.position.set(Math.cos(a) * mid, -0.5, Math.sin(a) * mid);
      bridge.rotation.y = -a + Math.PI / 2;
      s.add(bridge);

      for (const side of [-1, 1]) {
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 1.6, len),
          new THREE.MeshBasicMaterial({ color: team.glow })
        );
        const off = side * (BRIDGE_HALF - 0.2);
        rail.position.set(
          Math.cos(a) * mid - Math.sin(a) * off, 0.8,
          Math.sin(a) * mid + Math.cos(a) * off
        );
        rail.rotation.y = -a + Math.PI / 2;
        s.add(rail);
      }

      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(DOME_R, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: team.glow, transparent: true, opacity: 0.09, side: THREE.DoubleSide, depthWrite: false })
      );
      dome.position.set(bx, 0, bz);
      s.add(dome);
      const domeWire = new THREE.Mesh(
        new THREE.SphereGeometry(DOME_R, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: team.glow, wireframe: true, transparent: true, opacity: 0.14 })
      );
      domeWire.position.set(bx, 0, bz);
      s.add(domeWire);
      base.dome = dome;
      base.domeWire = domeWire;

      const strip = new THREE.Mesh(
        new THREE.TorusGeometry(BASE_R - 0.4, 0.25, 6, 48),
        new THREE.MeshBasicMaterial({ color: team.glow })
      );
      strip.rotation.x = Math.PI / 2;
      strip.position.set(bx, 0.2, bz);
      s.add(strip);

      const post = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 9, 1.2),
        new THREE.MeshLambertMaterial({ color: team.hex })
      );
      post.position.set(bx + Math.cos(a + 1.2) * 9, 4.5, bz + Math.sin(a + 1.2) * 9);
      s.add(post);

      this.buildChamber(base);
    }
  },

  buildChamber(base) {
    const s = this.scene;
    const ca = base.angle + 1.05;
    const cx = base.x + Math.cos(ca) * 9;
    const cz = base.z + Math.sin(ca) * 9;

    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(CHAMBER_R, CHAMBER_R, 8, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: base.glow, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })
    );
    glass.position.set(cx, 4, cz);
    s.add(glass);

    const cage = new THREE.Mesh(
      new THREE.CylinderGeometry(CHAMBER_R + 0.05, CHAMBER_R + 0.05, 8, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: base.glow, wireframe: true, transparent: true, opacity: 0.35 })
    );
    cage.position.set(cx, 4, cz);
    s.add(cage);

    const floorRing = new THREE.Mesh(
      new THREE.TorusGeometry(CHAMBER_R, 0.28, 6, 40),
      new THREE.MeshBasicMaterial({ color: base.glow })
    );
    floorRing.rotation.x = Math.PI / 2;
    floorRing.position.set(cx, 0.18, cz);
    s.add(floorRing);

    const capRing = floorRing.clone();
    capRing.position.y = 8;
    s.add(capRing);

    const label = this.makeLabel();
    label.sprite.position.set(cx, 10.6, cz);
    s.add(label.sprite);

    const chamber = { base, x: cx, z: cz, glass, cage, label, ready: true, timer: 0, tier: rollChamberTier(), block: null };
    State.chambers.push(chamber);
    this.spawnChamberBlock(chamber);
    this.refreshChamberLabel(chamber);
  },

  spawnChamberBlock(chamber) {
    const block = this.makeBlockMesh(chamber.tier, chamber.x, 4.4, chamber.z, 2.8, false);
    this.scene.add(block.mesh);
    chamber.block = block;
    block.mesh.visible = chamber.ready;
  },

  refreshChamberLabel(chamber) {
    if (chamber.ready) {
      const t = TIERS[chamber.tier];
      chamber.label.setText(chamber.tier === 'rng' ? '?!! READY' : t.label, hexStr(t.glow));
    } else {
      chamber.label.setText(this.formatTime(chamber.timer), '#8ea0c8');
    }
  },

  makeBlockMesh(tierKey, x, y, z, size, big) {
    const t = TIERS[tierKey];
    const group = new THREE.Group();
    group.position.set(x, y, z);

    const tex = this.blockTexture(tierKey);
    const map = (tierKey === 'rng' || tierKey === 'super') ? tex.clone() : tex;
    if (tierKey === 'rng') { map.needsUpdate = true; map.wrapS = map.wrapT = THREE.RepeatWrapping; }

    const mat = new THREE.MeshLambertMaterial({
      map: map, emissive: 0xffffff, emissiveMap: map,
      emissiveIntensity: tierKey === 'regular' ? 0.32 : 0.55,
    });
    const core = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
    group.add(core);

    const wire = new THREE.Mesh(
      new THREE.BoxGeometry(size * 1.05, size * 1.05, size * 1.05),
      new THREE.MeshBasicMaterial({ color: t.glow, wireframe: true, transparent: true, opacity: 0.55 })
    );
    group.add(wire);

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowTex, color: t.glow, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glow.scale.setScalar(size * 3.2);
    group.add(glow);

    let tag = null;
    if (tierKey === 'rng') {
      tag = this.makeLabel();
      tag.setText('?!!', '#4dff8f');
      tag.sprite.scale.set(size * 2.2, size * 0.85, 1);
      tag.sprite.position.set(0, 0, size * 0.62);
      group.add(tag.sprite);
    } else if (tierKey === 'super') {
      tag = this.makeGlitchLabel('Super', '#ff5ce1', '#d8fbff');
      tag.sprite.scale.set(size * 3.0, size * 1.15, 1);
      tag.sprite.position.set(0, 0, size * 0.66);
      group.add(tag.sprite);
    }

    const shards = [];
    if (big) {
      for (let i = 0; i < 8; i++) {
        const sh = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.8, 0.8),
          new THREE.MeshBasicMaterial({ color: t.glow })
        );
        group.add(sh);
        shards.push({ mesh: sh, a: (i / 8) * Math.PI * 2, r: size * 0.95, y: rand(-1.5, 1.5) });
      }
    }

    return {
      tier: tierKey, big: !!big, mesh: group, core, wire, glow, shards, map, tag,
      size, baseY: y, bob: rand(0, 6.28), spawnT: 0, alive: true, x, z,
    };
  },

  spawnBlock(tierKey, x, z, opts) {
    opts = opts || {};
    const big = !!opts.big;
    const size = big ? BIG_SIZE : (opts.size || BLOCK_SIZE);
    const y = opts.y !== undefined ? opts.y : size * 0.5 + 2.4;
    const block = this.makeBlockMesh(tierKey, x, y, z, size, big);
    block.kind = opts.kind || 'loose';
    this.scene.add(block.mesh);
    State.blocks.push(block);
    Sound.spawn();
    this.burst(block.mesh.position, TIERS[tierKey].glow, big ? 60 : 18, big ? 16 : 8, big ? 1.8 : 1);
    return block;
  },

  spawnBigWave() {
    State.wave++;
    this.spawnBlock('big', 0, 0, { big: true, kind: 'big' });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      this.spawnBlock(rollTier(), Math.cos(a) * 26, Math.sin(a) * 26, { kind: 'loose' });
    }
    Sound.bigSpawn();
    UI.feed('A BIG VOID BLOCK has appeared in the centre!', '#35e0ff');
    UI.toast('BIG BLOCK WAVE ' + State.wave, '#35e0ff');
  },

  spawnSuperBlock(x, z) {
    const block = this.spawnBlock('super', x, z, { kind: 'super', size: 4.2 });
    UI.broadcast('A SUPER BLOCK HAS APPEARED', '#ff5ce1');
    return block;
  },

  openBlock(block, by) {
    if (!block.alive) return;
    block.alive = false;
    this.scene.remove(block.mesh);
    const idx = State.blocks.indexOf(block);
    if (idx >= 0) State.blocks.splice(idx, 1);

    /* the Super block: unlock this fighter's hero powers */
    if (block.tier === 'super') {
      this.burst(block.mesh.position, 0xff5ce1, 90, 20, 2.2);
      this.burst(block.mesh.position, 0x35e0ff, 60, 16, 1.8);
      by.unlockPowers();
      UI.broadcast(by.name + ' ROLLED THE SUPER BLOCK!', hexStr(by.hero.color));
      UI.feed(by.name + ' unlocked ' + by.hero.name + ' powers!', hexStr(by.hero.color));
      if (by.isPlayer) UI.toast('YOU ARE ' + by.hero.name.toUpperCase(), hexStr(by.hero.color));
      Sound.powerUnlock();
      return;
    }

    const tier = resolveTier(block.tier);

    /* rolling Super inside an RNG block drops the real thing */
    if (tier === 'super') {
      const t = TIERS.super;
      this.burst(block.mesh.position, t.glow, 50, 14, 1.8);
      Sound.blockBreak('super');
      UI.broadcast(by.name + ' ROLLED SUPER!', '#ff5ce1');
      UI.feed(by.name + ' rolled SUPER out of an RNG block', '#ff5ce1');
      if (by.isPlayer) UI.toast('SUPER!', '#ff5ce1');
      this.spawnSuperBlock(by.pos.x, by.pos.z + 3);
      return;
    }

    const t = TIERS[tier];
    const drops = tier === 'big' ? 3 : 1;
    for (let i = 0; i < drops; i++) by.give(lootFor(tier));

    Sound.blockBreak(tier);
    this.burst(block.mesh.position, t.glow, block.big ? 80 : 30, block.big ? 18 : 10, block.big ? 2 : 1.2);
    this.burst(block.mesh.position, 0xffffff, block.big ? 34 : 12, block.big ? 14 : 7, 1);

    if (by && !by.isPlayer) by.blockCd = rand(7, 13);

    const who = by ? by.name : 'Someone';
    if (tier === 'big') UI.feed(who + ' opened the BIG VOID BLOCK!', '#35e0ff');
    else if (block.tier === 'rng') UI.feed(who + ' cracked an RNG block → ' + t.name, '#4dff8f');
    else UI.feed(who + ' opened a ' + t.name + ' block', hexStr(t.glow));

    if (by && by.isPlayer) UI.toast('+ ' + t.name + ' loot', hexStr(t.glow));
  },

  initParticles() {
    const geo = new THREE.BoxGeometry(0.28, 0.28, 0.28);
    for (let i = 0; i < 340; i++) {
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
      p.life = rand(0.45, 1.0);
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

  spawnCasing(pos, dir) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.055, 0.11),
      new THREE.MeshBasicMaterial({ color: 0xd9b45a })
    );
    mesh.position.copy(pos);
    this.scene.add(mesh);
    State.casings.push({
      mesh,
      vel: new THREE.Vector3(dir.x * 3.5 + rand(-1.2, 1.2), rand(2.4, 4.2), dir.z * 3.5 + rand(-1.2, 1.2)),
      spin: rand(-9, 9), life: 2.4,
    });
  },

  updateCasings(dt) {
    for (let i = State.casings.length - 1; i >= 0; i--) {
      const c = State.casings[i];
      c.vel.y += CONFIG.gravity * dt;
      c.mesh.position.addScaledVector(c.vel, dt);
      c.mesh.rotation.x += c.spin * dt;
      c.mesh.rotation.z += c.spin * 0.6 * dt;
      const g = groundAt(c.mesh.position.x, c.mesh.position.z);
      if (g !== null && c.mesh.position.y < g + 0.05) {
        c.mesh.position.y = g + 0.05;
        c.vel.y *= -0.32; c.vel.x *= 0.6; c.vel.z *= 0.6; c.spin *= 0.55;
        if (Math.abs(c.vel.y) < 0.4) c.vel.y = 0;
      }
      c.life -= dt;
      if (c.life <= 0) { this.scene.remove(c.mesh); State.casings.splice(i, 1); }
    }
  },

  updateParticles(dt) {
    for (const p of this.particlePool) {
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { p.mesh.visible = false; continue; }
      p.vel.y += CONFIG.gravity * 0.35 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.x += p.spin.x * dt;
      p.mesh.rotation.y += p.spin.y * dt;
      p.mesh.material.opacity = clamp(p.life / p.maxLife, 0, 1);
    }
  },

  /* expanding shockwave ring used by super punches and slams */
  shockwave(pos, color, maxR, life) {
    const geo = new THREE.RingGeometry(0.6, 1.0, 40);
    const mat = new THREE.MeshBasicMaterial({
      color: color, transparent: true, opacity: 0.9, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(pos);
    m.rotation.x = -Math.PI / 2;
    this.scene.add(m);
    State.shockwaves.push({ mesh: m, t: 0, life: life || 0.55, maxR: maxR || 12 });
  },

  updateShockwaves(dt) {
    for (let i = State.shockwaves.length - 1; i >= 0; i--) {
      const s = State.shockwaves[i];
      s.t += dt;
      const k = s.t / s.life;
      s.mesh.scale.setScalar(1 + k * s.maxR);
      s.mesh.material.opacity = Math.max(0, 0.9 * (1 - k));
      if (k >= 1) { this.scene.remove(s.mesh); State.shockwaves.splice(i, 1); }
    }
  },

  /* laser beam: a stretched glowing box that fades out */
  beam(from, to, color, thickness) {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    if (len < 0.01) return;
    const geo = new THREE.CylinderGeometry(thickness || 0.18, (thickness || 0.18) * 0.6, len, 8, 1, true);
    const mat = new THREE.MeshBasicMaterial({
      color: color, transparent: true, opacity: 0.95,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(from).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    this.scene.add(m);
    State.beams.push({ mesh: m, life: 0.35, max: 0.35 });
    const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.glowTex, color: color, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    glowSprite.scale.setScalar(3.2);
    glowSprite.position.copy(from);
    this.scene.add(glowSprite);
    State.beams.push({ mesh: glowSprite, life: 0.3, max: 0.3 });
  },

  updateBeams(dt) {
    for (let i = State.beams.length - 1; i >= 0; i--) {
      const b = State.beams[i];
      b.life -= dt;
      b.mesh.material.opacity = Math.max(0, b.life / b.max);
      if (b.life <= 0) { this.scene.remove(b.mesh); State.beams.splice(i, 1); }
    }
  },

  update(dt) {
    State.time += dt;

    const hasKind = k => State.blocks.some(b => b.kind === k);

    if (!hasKind('big')) {
      State.timers.big -= dt * 1000;
      if (State.timers.big <= 0) { State.timers.big = CONFIG.bigWaveMs; this.spawnBigWave(); }
    }
    if (!hasKind('galaxy')) {
      State.timers.galaxy -= dt * 1000;
      if (State.timers.galaxy <= 0) {
        State.timers.galaxy = CONFIG.galaxyBlockMs;
        const a = rand(0, Math.PI * 2), r = rand(20, ARENA_R - 8);
        this.spawnBlock('galaxy', Math.cos(a) * r, Math.sin(a) * r, { kind: 'galaxy' });
        UI.feed('A GALAXY block drifted into the arena', '#c9a6ff');
      }
    }
    if (!hasKind('rng')) {
      State.timers.rng -= dt * 1000;
      if (State.timers.rng <= 0) {
        State.timers.rng = CONFIG.rngBlockMs;
        const a = rand(0, Math.PI * 2), r = rand(20, ARENA_R - 8);
        this.spawnBlock('rng', Math.cos(a) * r, Math.sin(a) * r, { kind: 'rng' });
        UI.feed('An RNG ?!! block materialised', '#4dff8f');
      }
    }
    /* guarantee: if nobody has unlocked powers yet, one Super block turns up */
    if (!State.superUnlocked && !hasKind('super')) {
      State.timers.super -= dt * 1000;
      if (State.timers.super <= 0) {
        State.timers.super = CONFIG.superBlockMs;
        const a = rand(0, Math.PI * 2), r = rand(14, 34);
        this.spawnSuperBlock(Math.cos(a) * r, Math.sin(a) * r);
        UI.feed('A SUPER block fell into the arena', '#ff5ce1');
      }
    }

    State.timers.loose -= dt * 1000;
    if (State.timers.loose <= 0) {
      State.timers.loose = CONFIG.looseBlockMs;
      const loose = State.blocks.filter(b => b.kind === 'loose').length;
      for (let n = 0; n < 1 && loose + n < CONFIG.maxLooseBlocks; n++) {
        const a = rand(0, Math.PI * 2), r = rand(12, ARENA_R - 6);
        this.spawnBlock(rollTier(), Math.cos(a) * r, Math.sin(a) * r, { kind: 'loose' });
      }
    }

    for (const b of State.blocks.slice()) {
      this.animateBlock(b, dt);
      for (const f of State.fighters) {
        if (f.dead) continue;
        const dx = f.pos.x - b.mesh.position.x;
        const dz = f.pos.z - b.mesh.position.z;
        const reach = b.size * 0.5 + CONFIG.touchRadius;
        if (dx * dx + dz * dz <= reach * reach &&
            Math.abs(f.pos.y + 1.5 - b.mesh.position.y) < b.size * 0.8 + 2.6) {
          this.openBlock(b, f);
          break;
        }
      }
    }

    for (const c of State.chambers) {
      if (c.ready && c.block) {
        this.animateBlock(c.block, dt);
        for (const f of State.fighters) {
          if (f.dead) continue;
          const dx = f.pos.x - c.x, dz = f.pos.z - c.z;
          if (dx * dx + dz * dz <= (CHAMBER_R + 0.6) * (CHAMBER_R + 0.6)) {
            this.collectChamber(c, f);
            break;
          }
        }
      } else {
        c.timer -= dt * 1000;
        c.label.setText(this.formatTime(c.timer), '#8ea0c8');
        if (c.timer <= 0) {
          c.ready = true;
          c.tier = rollChamberTier();
          this.rebuildChamberBlock(c);
          this.refreshChamberLabel(c);
          Sound.spawn();
        }
      }
      c.cage.rotation.y += dt * 0.4;
      c.glass.material.opacity = 0.13 + Math.sin(State.time * 2 + c.base.index) * 0.04;
    }

    if (this.padRing) this.padRing.material.opacity = 0.45 + Math.sin(State.time * 2) * 0.3;
    this.updateSky(dt);
    for (const is of State.islands) {
      is.phase += dt * 0.25 * is.drift;
      is.mesh.position.y = is.baseY + Math.sin(is.phase) * 3.5;
      is.mesh.rotation.y += dt * is.spin;
    }

    if (this.matrix) {
      this.matrix.offset.y = (this.matrix.offset.y + dt * 0.35) % 1;
      this.matrix.offset.x = (this.matrix.offset.x + dt * 0.05) % 1;
    }
    for (const b of State.blocks) {
      if (b.tier === 'rng' && b.map) b.map.offset.y = (b.map.offset.y + dt * 0.4) % 1;
    }

    /* glitching Super labels */
    for (const gl of this.glitchLabels) {
      gl.next -= dt;
      if (gl.next <= 0) { gl.next = rand(0.05, 0.12); gl.draw(); }
    }

    this.updateParticles(dt);
    this.updateCasings(dt);
    this.updateShockwaves(dt);
    this.updateBeams(dt);
  },

  animateBlock(b, dt) {
    b.spawnT = Math.min(1, b.spawnT + dt * 2.6);
    const pop = b.spawnT < 1 ? (1 + Math.sin(b.spawnT * Math.PI) * 0.35) : 1;
    b.mesh.scale.setScalar(pop * (0.4 + 0.6 * b.spawnT));
    b.bob += dt * (b.big ? 0.9 : 1.5);
    b.mesh.position.y = b.baseY + Math.sin(b.bob) * (b.big ? 1.1 : 0.55);
    b.mesh.rotation.y += dt * (b.big ? 0.4 : 0.8);
    b.mesh.rotation.x = Math.sin(b.bob * 0.7) * 0.09;
    b.wire.rotation.y -= dt * 1.6;
    b.wire.rotation.x += dt * 0.8;
    b.glow.material.opacity = 0.6 + Math.sin(State.time * 4 + b.bob) * 0.25;
    if (b.tier === 'super') {
      /* super blocks jitter like broken code */
      b.mesh.position.x = b.x + (Math.random() - 0.5) * 0.12;
      b.mesh.position.z = b.z + (Math.random() - 0.5) * 0.12;
    }
    for (const s of b.shards) {
      s.a += dt * 1.1;
      s.mesh.position.set(Math.cos(s.a) * s.r, s.y + Math.sin(s.a * 2) * 1.2, Math.sin(s.a) * s.r);
      s.mesh.rotation.x += dt * 2;
      s.mesh.rotation.y += dt * 3;
    }
  },

  collectChamber(chamber, by) {
    const tier = resolveTier(chamber.tier);
    const t = TIERS[tier];
    if (tier === 'super') {
      chamber.ready = false;
      chamber.timer = CONFIG.chamberMs;
      chamber.block.mesh.visible = false;
      this.refreshChamberLabel(chamber);
      this.spawnSuperBlock(chamber.x, chamber.z + 3);
      UI.broadcast(by.name + ' ROLLED SUPER FROM A CHAMBER!', '#ff5ce1');
      return;
    }
    const drops = tier === 'big' ? 2 : 1;
    for (let i = 0; i < drops; i++) by.give(lootFor(tier));

    Sound.blockBreak(tier);
    this.burst(chamber.block.mesh.position, t.glow, 40, 12, 1.4);
    chamber.ready = false;
    chamber.timer = CONFIG.chamberMs;
    chamber.block.mesh.visible = false;
    this.refreshChamberLabel(chamber);

    if (by.isPlayer) {
      UI.toast('Chamber: ' + t.name + ' loot', hexStr(t.glow));
      UI.feed('You cracked your cryo chamber → ' + t.name, hexStr(t.glow));
    } else if (tier === 'galaxy' || tier === 'big' || tier === 'rng') {
      UI.feed(by.name + ' cracked a cryo chamber → ' + t.name, hexStr(t.glow));
    }
  },

  rebuildChamberBlock(chamber) {
    if (chamber.block) this.scene.remove(chamber.block.mesh);
    const block = this.makeBlockMesh(chamber.tier, chamber.x, 4.4, chamber.z, 2.8, false);
    block.mesh.visible = chamber.ready;
    this.scene.add(block.mesh);
    chamber.block = block;
  },

  formatTime(ms) {
    const secs = Math.max(0, Math.ceil(ms / 1000));
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    return mm + ':' + ss;
  },
};

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
