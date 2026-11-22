(function () {
  'use strict';

  // ================= CONFIG =================
  const CONFIG = {
    arenaRadius: 92,
    botCount: 7,
    baseFOV: 75,
    adsFOV: 58,
    adsSpeedMult: 0.62,
    adsCrosshairScale: 0.65,
    heroHpMin: 500,
    heroHpMax: 999,
    effectDurMs: 170000,
    superBlockMs: 360000,
    bigWaveMs: 900000,
    galaxyBlockMs: 300000,
    rngBlockMs: 180000,
    chamberMs: 600000,
    slots: 5,
    gravity: 0.015,
    jumpForce: 0.28,
    moveSpeed: 0.14,
    turnSpeed: 0.002,
  };

  // ================= HERO DATA =================
  const HEROES = [
    { name: 'Homelander', color: '#00a8ff', cape: true, flight: true, guard: false, hp: 650,
      abilities: [{ name: 'Laser Vision', key: 'Q', cd: 8000, dmg: 45 }, { name: 'Super Punch', key: 'E', cd: 4000, dmg: 30 }, { name: 'Super Yell', key: 'R', cd: 15000, dmg: 80 }] },
    { name: 'Black Noir', color: '#2d2d2d', cape: true, flight: false, guard: true, hp: 580,
      abilities: [{ name: 'Silent Step', key: 'Q', cd: 6000, dmg: 0 }, { name: 'Blade Strike', key: 'E', cd: 3000, dmg: 40 }, { name: 'Smoke Slam', key: 'R', cd: 12000, dmg: 65 }] },
    { name: 'Soldier Boy', color: '#ff4d4d', cape: false, flight: false, guard: true, hp: 700,
      abilities: [{ name: 'Shield Bash', key: 'Q', cd: 7000, dmg: 50 }, { name: 'War Cry', key: 'E', cd: 10000, dmg: 35 }, { name: 'Ground Breaker', key: 'R', cd: 18000, dmg: 90 }] },
    { name: 'Superman', color: '#0055ff', cape: true, flight: true, guard: false, hp: 800,
      abilities: [{ name: 'Heat Vision', key: 'Q', cd: 9000, dmg: 55 }, { name: 'Super Punch', key: 'E', cd: 4500, dmg: 40 }, { name: 'Freeze Breath', key: 'R', cd: 14000, dmg: 60 }] },
    { name: 'Goku', color: '#ff8800', cape: false, flight: true, guard: false, hp: 720,
      abilities: [{ name: 'Ki Blast', key: 'Q', cd: 5000, dmg: 35 }, { name: 'Kamehameha', key: 'E', cd: 8000, dmg: 70 }, { name: 'Instant Strike', key: 'R', cd: 20000, dmg: 100 }] },
    { name: 'Saitama', color: '#ffcc00', cape: false, flight: false, guard: false, hp: 600,
      abilities: [{ name: 'Normal Punch', key: 'Q', cd: 2000, dmg: 25 }, { name: 'Consecutive Punches', key: 'E', cd: 5000, dmg: 50 }, { name: 'Serious Punch', key: 'R', cd: 30000, dmg: 180 }] },
  ];

  // ================= THREE.JS SETUP =================
  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070b14);
  scene.fog = new THREE.FogExp2(0x070b14, 0.007);

  const camera = new THREE.PerspectiveCamera(CONFIG.baseFOV, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 3.5, 8);

  // Lighting (optimized for performance)
  const ambLight = new THREE.AmbientLight(0x405070, 0.6);
  scene.add(ambLight);
  const dirLight = new THREE.DirectionalLight(0xaaccff, 0.9);
  dirLight.position.set(30, 50, 20);
  scene.add(dirLight);
  const hemiLight = new THREE.HemisphereLight(0x8899cc, 0x223344, 0.4);
  scene.add(hemiLight);

  // ================= HUMANOID RIG =================
  function createHumanoid(hero, isPlayer = false) {
    const root = new THREE.Group();
    root.position.y = 0;

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffcc99, roughness: 0.6 });
    const suitMat = new THREE.MeshStandardMaterial({ color: hero.color, roughness: 0.5, metalness: 0.1 });
    const jointMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 });

    // Hips
    const hips = new THREE.Group();
    hips.position.y = 0.9;
    root.add(hips);

    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.15, 0.25), suitMat);
    hips.add(pelvis);

    // Spine & Chest
    const spine = new THREE.Group();
    spine.position.y = 0.08;
    hips.add(spine);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.28), suitMat);
    spine.add(torso);

    const chest = new THREE.Group();
    chest.position.y = 0.22;
    spine.add(chest);
    const upperChest = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.2, 0.3), suitMat);
    chest.add(upperChest);

    // Neck & Head
    const neck = new THREE.Group();
    neck.position.y = 0.18;
    chest.add(neck);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.28), skinMat);
    head.position.y = 0.16;
    neck.add(head);

    // Eyes & Hair
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.02), eyeMat);
    eyeL.position.set(-0.08, 0.02, 0.14);
    head.add(eyeL);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.08;
    head.add(eyeR);

    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.3), hairMat);
    hair.position.y = 0.22;
    head.add(hair);

    // Shoulders & Arms
    const shoulderL = new THREE.Group(); shoulderL.position.set(-0.32, 0.1, 0);
    const shoulderR = new THREE.Group(); shoulderR.position.set(0.32, 0.1, 0);
    chest.add(shoulderL, shoulderR);

    const upperArmGeo = new THREE.BoxGeometry(0.14, 0.3, 0.14);
    const lowerArmGeo = new THREE.BoxGeometry(0.12, 0.28, 0.12);
    const handGeo = new THREE.BoxGeometry(0.1, 0.12, 0.1);

    function createArm(shoulder) {
      const upper = new THREE.Mesh(upperArmGeo, suitMat);
      upper.position.y = -0.15;
      shoulder.add(upper);
      const elbow = new THREE.Group();
      elbow.position.y = -0.3;
      shoulder.add(elbow);
      const lower = new THREE.Mesh(lowerArmGeo, suitMat);
      lower.position.y = -0.14;
      elbow.add(lower);
      const hand = new THREE.Mesh(handGeo, skinMat);
      hand.position.y = -0.28;
      elbow.add(hand);
      return { shoulder, elbow, hand };
    }

    const leftArm = createArm(shoulderL);
    const rightArm = createArm(shoulderR);

    // Legs
    const legL = new THREE.Group(); legL.position.set(-0.12, -0.02, 0);
    const legR = new THREE.Group(); legR.position.set(0.12, -0.02, 0);
    hips.add(legL, legR);

    const upperLegGeo = new THREE.BoxGeometry(0.18, 0.35, 0.18);
    const lowerLegGeo = new THREE.BoxGeometry(0.16, 0.32, 0.16);
    const footGeo = new THREE.BoxGeometry(0.2, 0.08, 0.28);

    function createLeg(rootLeg) {
      const upper = new THREE.Mesh(upperLegGeo, suitMat);
      upper.position.y = -0.175;
      rootLeg.add(upper);
      const knee = new THREE.Group();
      knee.position.y = -0.35;
      rootLeg.add(knee);
      const lower = new THREE.Mesh(lowerLegGeo, suitMat);
      lower.position.y = -0.16;
      knee.add(lower);
      const foot = new THREE.Mesh(footGeo, skinMat);
      foot.position.y = -0.36;
      foot.position.z = 0.04;
      knee.add(foot);
      return { root: rootLeg, knee, foot };
    }

    const leftLeg = createLeg(legL);
    const rightLeg = createLeg(legR);

    // Weapon Mount
    const weaponMount = new THREE.Group();
    weaponMount.position.set(0.18, 0.12, 0.15);
    chest.add(weaponMount);

    // Shield Mount (if guard)
    let shieldMesh = null;
    if (hero.guard) {
      const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.6, roughness: 0.3 }));
      shield.rotation.x = Math.PI / 2;
      shield.position.set(0.28, 0, 0.18);
      chest.add(shield);
      shieldMesh = shield;
    }

    // Cape
    let capeMesh = null;
    if (hero.cape) {
      const capeGeo = new THREE.PlaneGeometry(0.6, 0.8, 4, 4);
      const capeMat = new THREE.MeshStandardMaterial({ color: hero.color, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
      capeMesh = new THREE.Mesh(capeGeo, capeMat);
      capeMesh.position.set(0, -0.1, -0.18);
      capeMesh.rotation.x = -0.3;
      spine.add(capeMesh);
    }

    // Animation State
    const anim = {
      root, hips, spine, chest, neck, head,
      shoulderL, shoulderR, elbowL: leftArm.elbow, elbowR: rightArm.elbow,
      legL: legL, legR: legR, kneeL: leftLeg.knee, kneeR: rightLeg.knee,
      weaponMount, capeMesh, shieldMesh,
      time: 0, state: 'idle', speed: 0, aimOffset: 0, recoil: 0
    };

    root.userData = anim;
    scene.add(root);
    return root;
  }

  // ================= MAP GENERATION =================
  function generateMap() {
    // Main Arena Floor
    const floorGeo = new THREE.CircleGeometry(CONFIG.arenaRadius, 64);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a2233, roughness: 0.8, metalness: 0.1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    scene.add(floor);

    // Grid Lines
    const gridHelper = new THREE.GridHelper(CONFIG.arenaRadius * 2, 40, 0x2a3a5a, 0x152030);
    gridHelper.position.y = -0.48;
    scene.add(gridHelper);

    // Floating Islands
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 25 + Math.random() * 55;
      const island = new THREE.Group();
      island.position.set(Math.cos(angle) * dist, 2 + Math.random() * 4, Math.sin(angle) * dist);
      
      const platGeo = new THREE.CylinderGeometry(3 + Math.random() * 4, 2 + Math.random() * 2, 0.6, 8);
      const platMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.7 });
      const plat = new THREE.Mesh(platGeo, platMat);
      island.add(plat);

      // Glowing edge
      const ringGeo = new THREE.RingGeometry(2.5, 3.2, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x35e0ff, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.35;
      island.add(ring);

      scene.add(island);
    }

    // Space Scenery
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 400;
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.4, sizeAttenuation: true });
    scene.add(new THREE.Points(starGeo, starMat));

    // Planets
    const planetMat = new THREE.MeshStandardMaterial({ color: 0x4466aa, roughness: 0.9 });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(8, 16, 16), planetMat);
    planet.position.set(60, 30, -70);
    scene.add(planet);

    // Ring
    const ringGeo2 = new THREE.RingGeometry(10, 14, 32);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x8899bb, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const planetRing = new THREE.Mesh(ringGeo2, ringMat2);
    planetRing.rotation.x = Math.PI / 2.5;
    planet.add(planetRing);
  }

  generateMap();

  // ================= PLAYER & INPUT =================
  const player = createHumanoid(HEROES[0], true);
  player.position.set(0, 0.5, 0);
  scene.add(player);

  const keys = {};
  let isAiming = false;
  let currentFOV = CONFIG.baseFOV;
  let moveSpeed = CONFIG.moveSpeed;

  document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Space') jump();
  });
  document.addEventListener('keyup', e => keys[e.code] = false);

  // Pointer Lock
  const lockHint = document.getElementById('lockhint');
  canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
  });
  document.addEventListener('pointerlockchange', () => {
    lockHint.style.display = document.pointerLockElement ? 'none' : 'block';
  });

  document.addEventListener('mousemove', e => {
    if (document.pointerLockElement === canvas) {
      player.rotation.y -= e.movementX * CONFIG.turnSpeed;
      camera.rotation.x -= e.movementY * CONFIG.turnSpeed;
      camera.rotation.x = Math.max(-1.2, Math.min(1.2, camera.rotation.x));
    }
  });

  // ADS (Hold LMB)
  document.addEventListener('mousedown', e => {
    if (e.button === 0) isAiming = true;
  });
  document.addEventListener('mouseup', e => {
    if (e.button === 0) isAiming = false;
  });

  // ================= ANIMATION SYSTEM =================
  function updateHumanoid(anim, dt) {
    anim.time += dt;
    const isMoving = keys['KeyW'] || keys['KeyA'] || keys['KeyS'] || keys['KeyD'];
    const isJumping = anim.state === 'jump';
    const isFlying = anim.state === 'fly';

    // Smooth speed transition
    const targetSpeed = isAiming ? moveSpeed * CONFIG.adsSpeedMult : moveSpeed;
    anim.speed = THREE.MathUtils.lerp(anim.speed, isMoving ? targetSpeed : 0, dt * 8);

    // Camera follow
    const camOffset = new THREE.Vector3(0, 1.4, 4.5);
    camOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), anim.root.rotation.y);
    const targetCamPos = anim.root.position.clone().add(camOffset);
    camera.position.lerp(targetCamPos, dt * 5);
    camera.lookAt(anim.root.position.clone().add(new THREE.Vector3(0, 1.2, 0)));

    // ADS FOV & Crosshair
    const targetFOV = isAiming ? CONFIG.adsFOV : CONFIG.baseFOV;
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, dt * 6);
    camera.updateProjectionMatrix();

    const crosshair = document.getElementById('crosshair');
    if (isAiming) crosshair.classList.add('ads');
    else crosshair.classList.remove('ads');

    const vignette = document.getElementById('scope-vignette');
    vignette.style.opacity = isAiming ? '1' : '0';

    // Animation Blends
    const t = anim.time;
    const cycle = Math.sin(t * (isMoving ? 9 : 1.5));
    const hipSway = Math.sin(t * (isMoving ? 8 : 1)) * (isMoving ? 0.08 : 0.02);

    // Hips & Spine
    anim.hips.rotation.z = hipSway;
    anim.spine.rotation.x = isFlying ? -0.4 : (isJumping ? 0.2 : 0);

    // Arms
    if (isFlying) {
      anim.shoulderL.rotation.x = 0.8; anim.shoulderL.rotation.z = -0.6;
      anim.shoulderR.rotation.x = 0.8; anim.shoulderR.rotation.z = 0.6;
      anim.elbowL.rotation.x = -0.5; anim.elbowR.rotation.x = -0.5;
    } else if (isAiming) {
      // Two-handed ADS pose
      anim.shoulderL.rotation.x = -0.1; anim.shoulderL.rotation.z = -0.2;
      anim.shoulderR.rotation.x = -0.1; anim.shoulderR.rotation.z = 0.2;
      anim.elbowL.rotation.x = -1.2; anim.elbowR.rotation.x = -1.2;
    } else {
      // Walk/Idle
      const armSwing = cycle * (isMoving ? 0.7 : 0.15);
      anim.shoulderL.rotation.x = armSwing;
      anim.shoulderR.rotation.x = -armSwing;
      anim.elbowL.rotation.x = Math.min(0.4, Math.abs(cycle) * 0.8);
      anim.elbowR.rotation.x = Math.min(0.4, Math.abs(cycle) * 0.8);
    }

    // Legs with Knee Bend
    if (isJumping) {
      anim.legL.rotation.x = -0.8; anim.legR.rotation.x = -0.8;
      anim.kneeL.rotation.x = -1.2; anim.kneeR.rotation.x = -1.2;
    } else {
      const legSwing = cycle * (isMoving ? 0.65 : 0.05);
      anim.legL.rotation.x = legSwing;
      anim.legR.rotation.x = -legSwing;
      // Knee bends forward when swinging back
      anim.kneeL.rotation.x = Math.max(0, legSwing) * 1.8;
      anim.kneeR.rotation.x = Math.max(0, -legSwing) * 1.8;
    }

    // Head & Neck
    anim.neck.rotation.y = Math.sin(t * 1.2) * 0.15;
    anim.head.rotation.x = isAiming ? 0 : 0.05;

    // Weapon Mount
    anim.weaponMount.rotation.x = isAiming ? -0.2 : (isMoving ? Math.sin(t * 8) * 0.05 : 0);
    anim.weaponMount.rotation.y = isAiming ? 0 : Math.sin(t * 6) * 0.03;

    // Cape Sway
    if (anim.capeMesh) {
      anim.capeMesh.rotation.x = -0.3 + Math.sin(t * 3) * 0.15;
      anim.capeMesh.position.z = -0.18 + Math.sin(t * 2.5) * 0.02;
    }
  }

  // ================= MOVEMENT & JUMP =================
  let playerVelY = 0;
  let onGround = true;
  let canDoubleJump = true;

  function jump() {
    if (onGround) {
      playerVelY = CONFIG.jumpForce;
      onGround = false;
      canDoubleJump = true;
    } else if (canDoubleJump) {
      playerVelY = CONFIG.jumpForce * 0.85;
      canDoubleJump = false;
    }
  }

  function updateMovement(dt) {
    const dir = new THREE.Vector3();
    if (keys['KeyW']) dir.z -= 1;
    if (keys['KeyS']) dir.z += 1;
    if (keys['KeyA']) dir.x -= 1;
    if (keys['KeyD']) dir.x += 1;
    dir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);

    player.position.x += dir.x * player.userData.speed;
    player.position.z += dir.z * player.userData.speed;

    // Gravity
    playerVelY -= CONFIG.gravity;
    player.position.y += playerVelY;

    if (player.position.y <= 0.5) {
      player.position.y = 0.5;
      playerVelY = 0;
      onGround = true;
      canDoubleJump = true;
    }

    updateHumanoid(player.userData, dt);
  }

  // ================= HUD & UI =================
  const hud = document.getElementById('hud');
  const playerNameEl = document.getElementById('player-name');
  const hpFill = document.getElementById('hp-fill');
  const hpText = document.getElementById('hp-text');
  const weaponName = document.getElementById('weapon-name');
  const weaponTier = document.getElementById('weapon-tier');
  const invEl = document.getElementById('inv');
  const abilitiesEl = document.getElementById('abilities');

  // Init HUD
  function initHUD() {
    document.getElementById('start').style.display = 'none';
    hud.style.display = 'block';
    playerNameEl.textContent = document.getElementById('name-input').value || 'Player';
    hpFill.style.width = '100%';
    hpText.textContent = '100 / 100';
    weaponName.textContent = 'Sidearm Pistol';
    weaponTier.textContent = 'FIRE';
    weaponTier.style.color = '#ff4d4d';

    // Inventory Slots
    for (let i = 1; i <= CONFIG.slots; i++) {
      const slot = document.createElement('div');
      slot.className = 'slot' + (i === 1 ? ' filled sel' : '');
      slot.innerHTML = `<span class="num">${i}</span><span class="nm">${i === 1 ? 'Sidearm Pistol' : 'Empty'}</span><span class="tg">${i === 1 ? 'FIRE' : '—'}</span>`;
      invEl.appendChild(slot);
    }

    // Abilities
    abilitiesEl.style.display = 'flex';
    HEROES[0].abilities.forEach((ab, i) => {
      const el = document.createElement('div');
      el.className = 'ability';
      el.style.setProperty('--ac', HEROES[0].color);
      el.innerHTML = `<span class="akey">${ab.key}</span><span class="anm">${ab.name}</span><div class="afill"></div>`;
      abilitiesEl.appendChild(el);
    });
  }

  document.getElementById('play-btn').addEventListener('click', initHUD);

  // Hero Picker
  const grid = document.getElementById('hero-grid');
  HEROES.forEach((hero, i) => {
    const card = document.createElement('button');
    card.className = 'hero-card' + (i === 0 ? ' sel' : '');
    card.style.setProperty('--hc', hero.color);
    card.innerHTML = `<div class="hp" style="background:${hero.color}"></div><div class="hinfo"><span class="hn">${hero.name}</span><span class="ht">${hero.flight ? 'FLY' : 'GROUND'} · ${hero.guard ? 'GUARD' : 'AGILE'}</span></div>`;
    card.onclick = () => {
      document.querySelectorAll('.hero-card').forEach(c => c.classList.remove('sel'));
      card.classList.add('sel');
      player.userData.root.userData.heroIndex = i;
    };
    grid.appendChild(card);
  });

  // ================= GAME LOOP =================
  let lastTime = performance.now();

  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (hud.style.display !== 'none') {
      updateMovement(dt);
    }

    renderer.render(scene, camera);
  }

  requestAnimationFrame(loop);

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Expose for debugging
  window.__LB = { CONFIG, HEROES, scene, camera, renderer, player };
})();
