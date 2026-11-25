/* Saiyan hair: three distinct, full silhouettes grown off the skull, so
   there are no bald patches, no hair over the eyes, and each character is
   recognisable at a glance. A spike is a cone aligned with a direction
   vector, so it always emerges from the skull and points outward. */

const _hairUp = new THREE.Vector3(0, 1, 0);

function hairSpike(head, mat, dir, len, wid) {
  const d = new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();
  const s = new THREE.Mesh(new THREE.ConeGeometry(wid, len, 5), mat);
  /* the base sits on the skull surface, so the whole spike is visible */
  s.position.copy(d).multiplyScalar(0.13).addScaledVector(d, len * 0.42);
  s.quaternion.setFromUnitVectors(_hairUp, d);
  head.add(s);
  return s;
}

/* a shallow skull cap: stops at the hairline, above the brow, so the face
   and eyes stay clear */
function hairCap(head, mat, r, y, spread) {
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(r, 18, 14, 0, Math.PI * 2, 0, Math.PI * (spread || 0.44)),
    mat
  );
  cap.position.y = y;
  head.add(cap);
  return cap;
}

function buildSaiyanHair(head, mat, style) {
  /* theta = angle from straight up, phi = 0 faces forward */
  const sph = (theta, phi) => [
    Math.sin(theta) * Math.sin(phi),
    Math.cos(theta),
    Math.sin(theta) * Math.cos(phi),
  ];
  /* ring of spikes at a given tilt, skipping the face unless asked */
  const ring = (theta, count, len, wid, phase, skipFront) => {
    for (let i = 0; i < count; i++) {
      const phi = (i / count) * Math.PI * 2 + (phase || 0);
      if (skipFront && Math.cos(phi) > 0.5) continue;
      hairSpike(head, mat, sph(theta, phi), len, wid);
    }
  };

  if (style === 'vegeta') {
    /* Vegeta: tall, narrow flame fan swept straight up, with a widow's
       peak dipping down the middle of the forehead. */
    hairCap(head, mat, 0.244, 0.012, 0.44);
    /* widow's peak + the hairline either side */
    hairSpike(head, mat, [0, -0.15, 1], 0.16, 0.055);
    hairSpike(head, mat, [-0.34, 0.1, 0.95], 0.14, 0.05);
    hairSpike(head, mat, [0.34, 0.1, 0.95], 0.14, 0.05);
    /* the fan: five tall spikes, longest in the middle, all near vertical */
    const tops = [
      [-0.45, 1, 0.1, 0.54], [-0.22, 1, 0.06, 0.66],
      [0, 1, 0.02, 0.78],
      [0.22, 1, 0.06, 0.66], [0.45, 1, 0.1, 0.54],
    ];
    for (const t of tops) hairSpike(head, mat, [t[0], t[1], t[2]], t[3], 0.085);
    /* a second, shorter layer fanning out to the sides so the fan is full */
    ring(0.6, 8, 0.44, 0.078, 0.3, false);
    ring(1.0, 8, 0.34, 0.072, 0.6, true);
  } else if (style === 'broly') {
    /* Broly: a huge wild mane. Long thick spikes burst out all round the
       skull, including low down the sides and back. */
    hairCap(head, mat, 0.252, 0.008, 0.46);
    /* crown: three very tall spikes */
    ring(0.26, 3, 0.86, 0.115, 0.4, false);
    /* upper ring: thick spikes all the way round, but clear of the face */
    ring(0.7, 9, 0.8, 0.11, 0.2, true);
    /* middle ring: mostly sides and back, keeps the face clear */
    ring(1.02, 10, 0.66, 0.1, 0, true);
    /* low ring: the mane hanging past the ears */
    ring(1.34, 10, 0.5, 0.095, 0.25, true);
    /* long fringe spikes either side of the brow, angled outward */
    hairSpike(head, mat, [-0.85, 0.55, 0.45], 0.5, 0.09);
    hairSpike(head, mat, [0.85, 0.55, 0.45], 0.5, 0.09);
  } else {
    /* Goku: the sideways sunburst fan, spikes jutting out left, right and
       back, with a couple of taller front spikes for the silhouette. */
    hairCap(head, mat, 0.244, 0.01, 0.44);
    /* main fan across the top: spikes pushed out sideways and back so it
       reads as a wide sunburst, not a tight ball */
    for (let i = 0; i < 5; i++) {
      const k = i / 4 - 0.5;
      hairSpike(head, mat,
        sph(0.72 + Math.abs(k) * 0.12, k * 2.3),
        0.7 - Math.abs(k) * 0.1, 0.085);
    }
    /* wide side spikes sweeping out almost horizontally, the signature look */
    for (const s of [-1, 1]) {
      hairSpike(head, mat, [s * 1, 0.28, 0.05], 0.62, 0.088);
      hairSpike(head, mat, [s * 0.98, 0.12, -0.35], 0.55, 0.08);
      hairSpike(head, mat, [s * 0.85, 0.55, -0.5], 0.5, 0.08);
      hairSpike(head, mat, [s * 0.7, -0.1, -0.7], 0.42, 0.075);
    }
    /* back of the head so the rear view is full */
    hairSpike(head, mat, [0, 0.55, -1], 0.48, 0.08);
    hairSpike(head, mat, [-0.4, 0.35, -0.85], 0.42, 0.075);
    hairSpike(head, mat, [0.4, 0.35, -0.85], 0.42, 0.075);
    /* short front spikes framing the brow */
    hairSpike(head, mat, [-0.45, 0.7, 0.7], 0.32, 0.065);
    hairSpike(head, mat, [0.45, 0.7, 0.7], 0.32, 0.065);
  }
}
