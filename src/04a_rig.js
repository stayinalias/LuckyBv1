'use strict';

/* ============================================================
   RIG — a humanoid body with real joint hierarchy.
   Proportions read more like a stylised hero model: smaller head,
   wider shoulders, long legs, tapered limbs, visible hands and feet.
   Every joint is a Group, so animation is just rotation, never mesh
   juggling. Parts are shared names with the older code.
   ============================================================ */

/* materials are cheap: Lambert shades nicely without heavy shaders */
function rigMat(color, opts) {
  const o = opts || {};
  return new THREE.MeshLambertMaterial({
    color: color,
    emissive: o.emissive || 0x000000,
    emissiveIntensity: o.ei || 0,
    transparent: !!o.transparent,
    opacity: o.opacity === undefined ? 1 : o.opacity,
  });
}

function capsulePart(radius, length, material, taper) {
  /* a cylinder with rounded ends reads as a limb far better than a box */
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * (taper || 0.86), radius, length, 10, 1),
    material
  );
  body.position.y = -length / 2;
  g.add(body);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 8), material);
  cap.position.y = -length;
  cap.scale.y = 0.85;
  g.add(cap);
  const top = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 8), material);
  top.scale.y = 0.8;
  g.add(top);
  return g;
}

const HERO_IDLE = {
  /* relaxed: arms hanging naturally at the sides, shoulders down */
  homelander:   { pose: 'relaxed', headTilt: 0.02, armX: 0.06, armZ: 0.15, elb: -0.24, lean: 0.02 },
  /* crouched, ready to pounce, weight low */
  blacknoir:    { pose: 'stalk',  headTilt: 0.14, armX: 0.25, armZ: 0.28, elb: -0.5 },
  /* shield up in front of the face, peering over the rim, off arm wide */
  soldierboy:   { pose: 'shieldGuard', headTilt: -0.1, armX: -1.35, armZ: 0.5, elb: -1.7 },
  /* same idea but the shield is shouldered, upright and composed */
  cap:          { pose: 'shieldGuard', headTilt: -0.05, armX: -1.25, armZ: 0.62, elb: -1.5 },
  /* relaxed, chin up a touch, cape hanging */
  superman:     { pose: 'relaxed', headTilt: -0.02, armX: 0.05, armZ: 0.14, elb: -0.22, lean: 0 },
  /* relaxed, head tilted slightly down and away */
  sentry:       { pose: 'relaxed', headTilt: 0.06, armX: 0.08, armZ: 0.17, elb: -0.3, lean: 0.04 },
  /* knife hand, weight back, watching */
  wintersoldier: { pose: 'stalk', headTilt: 0.1, armX: -0.2, armZ: 0.3, elb: -0.9 },
  /* hands loose, bouncing on the balls of the feet */
  flash:        { pose: 'bounce', headTilt: 0.04, armX: -0.3, armZ: 0.22, elb: -0.6 },
  wallywest:    { pose: 'bounce', headTilt: 0.02, armX: -0.35, armZ: 0.25, elb: -0.55 },
  /* fighting stance, fists up, ki glow between the palms */
  goku:         { pose: 'stance', headTilt: 0.06, armX: -1.1, armZ: 0.35, elb: -1.5 },
  vegeta:       { pose: 'crossed', headTilt: -0.02, armX: -1.0, armZ: 0.5, elb: -1.95 },
  /* hands in pockets, slouching */
  saitama:      { pose: 'casual', headTilt: 0.1, armX: 0.15, armZ: 0.16, elb: -0.35 },
  broly:        { pose: 'stance', headTilt: 0.08, armX: -0.85, armZ: 0.45, elb: -1.2 },
  /* relaxed, heavy shoulders, arms a little further out */
  omniman:      { pose: 'relaxed', headTilt: -0.03, armX: 0.04, armZ: 0.19, elb: -0.2, lean: 0 },
  /* relaxed, hunched forward, arms tight to the body */
  conquest:     { pose: 'relaxed', headTilt: 0.09, armX: 0.1, armZ: 0.11, elb: -0.34, lean: 0.07 },
  /* relaxed, youthful, weight on one leg */
  invincible:   { pose: 'relaxed', headTilt: 0.03, armX: 0.07, armZ: 0.16, elb: -0.28, lean: 0.03 },
  greenlantern: { pose: 'ring',   headTilt: 0.02, armX: -1.15, armZ: 0.7, elb: -1.6 },
};

function heroIdle(key) { return HERO_IDLE[key] || HERO_IDLE.homelander; }

/* Melee swing timelines: keys are normalized 0..1 through the swing.
   each key sets the arm across the body and the torso twist, so a blade
   carves an arc instead of poking straight up. */
const MELEE_SWINGS = {
  blade:  { dur: 0.34, keys: [[0, -0.9, 0.5, 0.1], [0.28, -2.3, -0.5, -0.5], [0.55, -0.2, -0.9, 0.55], [1, -0.4, -0.2, 0.15]] },
  dagger: [
    /* stab 1: short forward lunge, elbow leading, shoulder square */
    { dur: 0.24, keys: [[0, -0.55, 0.35, 0.05], [0.3, -1.55, 0.1, -0.25], [0.62, -1.15, 0.16, 0.1], [1, -0.55, 0.3, 0.05]] },
    /* stab 2: reverse slash across the body, wrist rolls over */
    { dur: 0.28, keys: [[0, -0.75, 0.85, -0.2], [0.26, -1.85, -0.35, -0.55], [0.58, -0.5, -0.9, 0.5], [1, -0.7, 0.4, 0.0]] },
  ],
  bat:    { dur: 0.5,  keys: [[0, -0.3, 0.9, -0.15], [0.35, -2.1, 0.3, -0.6], [0.62, -0.5, -0.6, 0.6], [1, -0.5, -0.1, 0.1]] },
  pan:    { dur: 0.42, keys: [[0, -0.4, 0.8, -0.1], [0.32, -2.0, 0.2, -0.55], [0.6, -0.4, -0.5, 0.5], [1, -0.5, -0.1, 0.1]] },
  axe:    { dur: 0.55, keys: [[0, -1.0, 0.7, -0.2], [0.4, -2.5, 0.1, -0.6], [0.68, -0.3, -0.4, 0.5], [1, -0.5, -0.1, 0.1]] },
  hammer: { dur: 0.6,  keys: [[0, -1.1, 0.6, -0.25], [0.4, -2.6, 0.0, -0.7], [0.7, -0.2, -0.3, 0.55], [1, -0.5, -0.1, 0.1]] },
  scythe: { dur: 0.5,  keys: [[0, -0.7, 0.8, -0.2], [0.34, -2.2, -0.9, -0.3], [0.62, -0.3, -1.0, 0.6], [1, -0.5, -0.1, 0.1]] },
  fist:   { dur: 0.24, keys: [[0, -0.7, 0.4, 0.05], [0.35, -1.9, 0.05, -0.35], [0.7, -1.1, 0.1, 0.1], [1, -0.6, 0.1, 0.05]] },
};

function meleeSwing(model, alt) {
  const set = MELEE_SWINGS[model] || MELEE_SWINGS.blade;
  if (Array.isArray(set)) return set[alt ? 1 : 0];
  return set;
}

function buildHumanoidRig(f) {
  const h = f.hero;
  const look = heroLook(f.heroKey);
  const root = new THREE.Group();

  const suitMat = rigMat(h.suit);
  const accentMat = rigMat(h.accent);
  const trimMat = rigMat(h.trim || h.accent);
  const skinMat = rigMat(h.skin || 0xf0c090);
  const hairMat = rigMat(look.hairColor || 0x2a2c33);
  const padMat = rigMat(look.pads || h.accent);
  const beltMat = rigMat(look.belt || h.accent);
  const bootMat = rigMat(look.boots || 0x1c2233);
  const gloveMat = rigMat(look.gloves || h.suit);

  /* ---------------- legs ---------------- */
  const makeLeg = side => {
    const hip = new THREE.Group();
    hip.position.set(0.19 * side, 1.06, 0);
    const thigh = capsulePart(0.155, 0.5, accentMat, 0.8);
    hip.add(thigh);

    const knee = new THREE.Group();
    knee.position.y = -0.5;
    const kneeCap = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), suitMat);
    kneeCap.scale.set(1, 0.9, 1.05);
    knee.add(kneeCap);
    const shin = capsulePart(0.125, 0.46, suitMat, 0.78);
    knee.add(shin);

    const ankle = new THREE.Group();
    ankle.position.y = -0.46;
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.4), bootMat);
    foot.position.set(0, -0.07, 0.08);
    ankle.add(foot);
    const heel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.12), bootMat);
    heel.position.set(0, -0.08, -0.11);
    ankle.add(heel);
    knee.add(ankle);
    hip.add(knee);
    return { hip, knee, ankle };
  };
  const legR = makeLeg(1), legL = makeLeg(-1);
  root.add(legR.hip, legL.hip);

  /* ---------------- pelvis + spine ---------------- */
  const pelvis = new THREE.Group();
  pelvis.position.y = 1.06;
  root.add(pelvis);
  const hips = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.3, 12), accentMat);
  hips.position.y = 0.05;
  pelvis.add(hips);
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.265, 0.055, 6, 18), beltMat);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.16;
  pelvis.add(belt);

  const spine = new THREE.Group();          /* lean + twist live here */
  spine.position.y = 0.18;
  pelvis.add(spine);

  const abdomen = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.265, 0.32, 12), accentMat);
  abdomen.position.y = 0.19;
  spine.add(abdomen);

  const chest = new THREE.Group();          /* breathing scale lives here */
  chest.position.y = 0.38;
  spine.add(chest);

  const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.31, 0.46, 14), suitMat);
  chestMesh.position.y = 0.16;
  chest.add(chestMesh);
  /* trapezius wedge softens the neck line */
  const traps = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), suitMat);
  traps.scale.set(1.25, 0.5, 0.85);
  traps.position.y = 0.36;
  chest.add(traps);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.055, 6, 14), trimMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.4;
  chest.add(collar);

  /* chest emblem: a small plate so it reads at distance */
  if (h.emblem) {
    const em = f.makeEmblem(h.emblem, h.color);
    em.position.set(0, 0.2, 0.3);
    em.scale.setScalar(0.5);
    chest.add(em);
  }

  /* ---------------- head ---------------- */
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.14, 0.14, 10), skinMat);
  neck.position.y = 0.44;
  chest.add(neck);

  const head = new THREE.Group();
  head.position.y = 0.62;
  chest.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.235, 20, 16), skinMat);
  skull.scale.set(1.0, 1.12, 1.02);
  head.add(skull);
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.15, 0.2), skinMat);
  jaw.position.set(0, -0.14, 0.03);
  head.add(jaw);
  const chin = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), skinMat);
  chin.position.set(0, -0.2, 0.06);
  head.add(chin);
  const masked = look.hair === 'mask';
  const brow = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.045, 0.07), skinMat);
  brow.position.set(0, 0.075, 0.2);
  brow.visible = !masked;
  head.add(brow);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.1, 4), skinMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, -0.02, 0.235);
  nose.visible = !masked;
  head.add(nose);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), skinMat);
    ear.position.set(0.225 * s, -0.01, 0);
    ear.visible = !masked;
    head.add(ear);
  }

  const eyeMat = new THREE.MeshBasicMaterial({ color: f.powered ? (look.eyes || h.color) : 0x1b2230 });
  const eyes = [];
  const eyeNodes = [];
  for (const s of [-1, 1]) {
    /* a masked hero gets no bare eye whites: the lens is drawn by the mask */
    if (look.hair !== 'mask') {
      const socket = new THREE.Mesh(new THREE.SphereGeometry(0.062, 10, 8), rigMat(0xf7f9ff));
      socket.position.set(0.085 * s, 0.015, 0.185);
      socket.scale.set(1, 0.72, 0.55);
      head.add(socket);
    }
    const eyeNode = new THREE.Group();
    eyeNode.position.set(0.085 * s, 0.015, look.hair === 'mask' ? 0.222 : 0.2);
    head.add(eyeNode);
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(look.hair === 'mask' ? 0.03 : 0.036, 10, 8),
      look.hair === 'mask' ? rigMat(0x2b3040) : eyeMat
    );
    eyeNode.add(eye);
    /* each eye carries its own glow so the laser has an obvious source */
    const eyeGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: World.glowTex, color: look.eyes || h.color, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    eyeGlow.scale.setScalar(0.35);
    eyeNode.add(eyeGlow);
    eyes.push(eye);
    eyeNodes.push({ node: eyeNode, glow: eyeGlow });
  }

  /* hair, mask, beard: same set of options as the portraits */
  if (look.hair === 'spiky') {
    buildSaiyanHair(head, hairMat, look.spikeStyle || 'goku');
  } else if (look.hair === 'mask') {
    /* full hood: covers skull, jaw, ears and neck with no skin showing */
    const maskMat = rigMat(look.maskColor || 0x0d1015);
    const mask = new THREE.Mesh(new THREE.SphereGeometry(0.246, 20, 16), maskMat);
    mask.scale.set(1.0, 1.14, 1.04);
    head.add(mask);
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 12), maskMat);
    muzzle.scale.set(0.92, 0.9, 1.0);
    muzzle.position.set(0, -0.11, 0.07);
    head.add(muzzle);
    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.2, 14), maskMat);
    hood.position.y = -0.19;
    head.add(hood);
    /* eye lenses sit proud of the mask so the mask reads as cloth */
    for (const s of [-1, 1]) {
      const lens = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 10), rigMat(0x2b3040));
      lens.position.set(0.082 * s, 0.015, 0.208);
      lens.scale.set(1.15, 0.8, 0.4);
      head.add(lens);
    }
  } else if (look.hair === 'bald') {
    /* bare scalp */
  } else if (look.hair === 'long') {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.245, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), hairMat);
    cap.position.y = 0.04;
    head.add(cap);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.4, 0.12), hairMat);
    back.position.set(0, -0.15, -0.15);
    head.add(back);
  } else {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.238, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56), hairMat);
    cap.position.y = 0.03;
    head.add(cap);
    if (look.hair === 'swept') {
      const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.09, 0.14), hairMat);
      fringe.position.set(0.02, 0.16, 0.15);
      fringe.rotation.z = -0.18;
      head.add(fringe);
    }
  }
  if (look.beard) {
    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.1), hairMat);
    beard.position.set(0, -0.21, 0.14);
    head.add(beard);
  }
  if (look.stache) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.06), hairMat);
    st.position.set(0, -0.09, 0.22);
    head.add(st);
  }

  /* ---------------- arms ---------------- */
  const makeArm = side => {
    const shoulder = new THREE.Group();
    shoulder.position.set(0.44 * side, 0.34, 0);
    const delt = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 10), suitMat);
    delt.scale.set(1, 0.95, 1);
    shoulder.add(delt);
    const upper = capsulePart(0.115, 0.36, suitMat, 0.82);
    shoulder.add(upper);

    const elbow = new THREE.Group();
    elbow.position.y = -0.36;
    const elbowBall = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 8), accentMat);
    elbow.add(elbowBall);
    const foreMat = (side > 0 && h.metalArm) ? rigMat(0xb9c3d4) : suitMat;
    const fore = capsulePart(0.095, 0.34, foreMat, 0.8);
    elbow.add(fore);

    const wrist = new THREE.Group();
    wrist.position.y = -0.34;
    /* a proper fist: palm, knuckles and a thumb that can wrap a grip */
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.14, 0.105), gloveMat);
    palm.position.y = -0.06;
    wrist.add(palm);
    const knuckles = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.06, 0.115), gloveMat);
    knuckles.position.set(0, -0.12, 0.015);
    wrist.add(knuckles);
    const thumb = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.024, 0.09, 6), gloveMat);
    thumb.position.set(-0.055 * side, -0.05, 0.052);
    thumb.rotation.z = 0.7 * side;
    thumb.rotation.x = 0.35;
    wrist.add(thumb);
    const fingers = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.055, 0.05), gloveMat);
    fingers.position.set(0, -0.085, 0.062);
    wrist.add(fingers);
    const hand = palm;
    elbow.add(wrist);
    shoulder.add(elbow);
    return { shoulder, elbow, wrist, hand };
  };
  const armR = makeArm(1), armL = makeArm(-1);
  chest.add(armR.shoulder, armL.shoulder);

  /* shoulder pads: small and angled, not spheres stuck on */
  for (const side of [-1, 1]) {
    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 8), padMat);
    pad.scale.set(1.15, 0.62, 1.05);
    pad.position.set(0.45 * side, 0.38, 0);
    pad.rotation.z = -0.22 * side;
    chest.add(pad);
  }

  /* ---------------- shield ---------------- */
  let shield = null;
  if (h.shield) {
    shield = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.05, 20), trimMat);
    disc.rotation.x = Math.PI / 2;
    shield.add(disc);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.04, 6, 22), accentMat);
    shield.add(rim);
    const star = f.makeEmblem(h.emblem || '★', h.color);
    star.scale.setScalar(0.6);
    star.position.z = 0.05;
    shield.add(star);
    /* held on the chest, facing forward: the rim sits just under the eyes */
    shield.position.set(0, 0.08, 0.44);
    shield.rotation.x = 0.12;
    chest.add(shield);
  }

  /* ---------------- cape ---------------- */
  let cape = null;
  if (h.cape) {
    cape = new THREE.Group();
    const cloth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.62, 1.25, 10, 3, true, -Math.PI * 0.55, Math.PI * 1.1),
      rigMat(look.capeColor || h.accent, { transparent: false })
    );
    cloth.position.y = -0.62;
    cloth.rotation.y = Math.PI;
    cape.add(cloth);
    cape.position.set(0, 0.42, -0.16);
    chest.add(cape);
  }

  /* ---------------- weapon mount ---------------- */
  /* grip: a pivot inside the fist. The pivot points the weapon down the
     forearm axis (so nothing sticks out of the arm), and each weapon kind
     gets its own roll/pitch so a blade, a bat and a rifle all sit right. */
  const weaponMount = new THREE.Group();
  weaponMount.position.set(0, -0.09, 0.055);
  armR.wrist.add(weaponMount);
  const weaponGrip = new THREE.Group();
  weaponMount.add(weaponGrip);

  /* ---------------- fx anchors ---------------- */
  const aura = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 1.2, 32),
    new THREE.MeshBasicMaterial({ color: h.color, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false })
  );
  aura.rotation.x = -Math.PI / 2;
  aura.position.y = 0.06;
  aura.visible = false;
  root.add(aura);

  const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: World.glowTex, color: h.color, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  glowSprite.scale.setScalar(4.2);
  glowSprite.position.y = 1.5;
  root.add(glowSprite);

  const bubble = new THREE.Mesh(
    new THREE.SphereGeometry(1.45, 14, 10),
    new THREE.MeshBasicMaterial({ color: 0x8ef0ff, transparent: true, opacity: 0.2, depthWrite: false })
  );
  bubble.position.y = 1.5;
  bubble.visible = false;
  root.add(bubble);

  const muzzle = new THREE.Sprite(new THREE.SpriteMaterial({
    map: World.glowTex, color: 0xffd54d, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  muzzle.scale.setScalar(1.5);
  muzzle.position.set(0, 0, 0.95);
  weaponGrip.add(muzzle);

  f.mesh = root;
  f.parts = {
    head, chest, spine, pelvis, cape, shield, eyes, aura, glowSprite, muzzle, eyeMat,
    eyeL: eyeNodes[0].node, eyeR: eyeNodes[1].node,
    eyeGlowL: eyeNodes[0].glow, eyeGlowR: eyeNodes[1].glow,
    armR: armR.shoulder, armL: armL.shoulder,
    elbowR: armR.elbow, elbowL: armL.elbow,
    wristR: armR.wrist, wristL: armL.wrist,
    legR: legR.hip, legL: legL.hip,
    kneeR: legR.knee, kneeL: legL.knee,
    ankleR: legR.ankle, ankleL: legL.ankle,
    waist: abdomen,
  };
  f.materials = [suitMat, accentMat, skinMat];
  f.bubble = bubble;
  f.weaponMount = weaponMount;
  f.weaponGrip = weaponGrip;
  State.scene.add(root);
}
