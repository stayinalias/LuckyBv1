'use strict';

/* ============================================================
   BOT BRAIN
   Not a hive mind: every bot has its own aggression, caution,
   greed and skill, its own reaction delay, and its own bad
   habits (hesitating, whiffing, backing off, jumping for no
   reason). They pick the nearest valid target, so some end up
   duelling each other while others loot blocks.
   ============================================================ */

function nearestTarget(bot) {
  let best = null, bestD = Infinity;
  for (const f of State.fighters) {
    if (f === bot || f.dead) continue;
    /* don't chase someone hiding in their own dome */
    if (f.inOwnDome()) continue;
    const d = f.pos.distanceTo(bot.pos);
    if (d < bestD) { bestD = d; best = f; }
  }
  return { target: best, dist: bestD };
}

function nearestBlock(bot, maxDist) {
  let best = null, bestD = maxDist;
  for (const b of State.blocks) {
    if (!b.alive) continue;
    const d = Math.hypot(b.mesh.position.x - bot.pos.x, b.mesh.position.z - bot.pos.z);
    if (d < bestD) { bestD = d; best = b; }
  }
  return best;
}

function nearestPickup(bot, maxDist) {
  let best = null, bestD = maxDist;
  for (const p of State.pickups) {
    const d = Math.hypot(p.x - bot.pos.x, p.z - bot.pos.z);
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
}

function walkable(x, z) { return groundAt(x, z) !== null; }

/* turn the wanted direction until one step ahead is on solid ground */
function walkableDir(bot, dx, dz) {
  const angles = [0, 0.28, -0.28, 0.6, -0.6, 0.95, -0.95, 1.35, -1.35, 1.8, -1.8, 2.4, -2.4];
  for (const a of angles) {
    const c = Math.cos(a), s = Math.sin(a);
    const nx = dx * c - dz * s;
    const nz = dx * s + dz * c;
    if (walkable(bot.pos.x + nx * 2.0, bot.pos.z + nz * 2.0)) return [nx, nz];
  }
  return null;
}

/*
 * The arena is a star: a centre disc, eight radial bridges, eight base discs.
 * So the only route between a base and the middle is through the middle.
 * steerTo enforces that, then slides around edges instead of walking off them.
 */
function steerTo(bot, tx, tz) {
  let dx = tx - bot.pos.x, dz = tz - bot.pos.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.001) return;
  dx /= d; dz /= d;

  const rBot = Math.hypot(bot.pos.x, bot.pos.z);
  const rTgt = Math.hypot(tx, tz);

  if (rBot > ARENA_R - 2 && rTgt < ARENA_R - 2) {
    /* on a base or bridge, target in the middle: walk in along the bridge */
    dx = -bot.pos.x / (rBot || 1);
    dz = -bot.pos.z / (rBot || 1);
  } else if (rBot < ARENA_R - 2 && rTgt > ARENA_R - 2) {
    /* in the middle, target out on a base: head out on that base's spoke */
    dx = tx / (rTgt || 1);
    dz = tz / (rTgt || 1);
  }

  const safe = walkableDir(bot, dx, dz);
  if (safe) {
    bot.wantMove.set(safe[0], 0, safe[1]);
  } else {
    const r = Math.hypot(bot.pos.x, bot.pos.z) || 1;
    bot.wantMove.set(-bot.pos.x / r, 0, -bot.pos.z / r);
    if (bot.grounded && chance(0.05)) bot.wantJump = true;
  }
}

function setState(bot, s) {
  if (bot.state !== s) {
    bot.state = s;
    bot.stateT = rand(0.6, 1.8);
  }
}

function botThink(bot, dt) {
  if (bot.dead) return;
  bot.think -= dt;
  bot.stateT -= dt;
  bot.wantMove.set(0, 0, 0);

  /* knocked into the void? sit still for a beat when you land back home */
  if (bot.stunT > 0) {
    bot.stunT -= dt;
    return;
  }

  const p = bot.personality;
  const hpFrac = bot.hp / bot.maxHp;
  const now = State.time;

  if (bot.reactionT > 0) bot.reactionT -= dt;

  /* --- decision tick: re-evaluate the plan a few times a second --- */
  if (bot.think <= 0) {
    bot.think = rand(0.22, 0.5) / (0.6 + p.skill * 0.8);

    const nt = nearestTarget(bot);
    bot.nearTarget = nt.target;
    bot.nearDist = nt.dist;

    /* badly hurt? run home and hide in the dome */
    if (hpFrac < 0.22 && !bot.inOwnDome() && chance(0.55 + p.caution * 0.4)) {
      setState(bot, 'flee');
    } else if (bot.inOwnDome() && hpFrac < 0.92) {
      setState(bot, 'heal');
    } else if (bot.weapon === FISTS && !bot.inOwnDome()) {
      /* unarmed: go find a block or a dropped weapon */
      setState(bot, 'loot');
    } else if (nt.target && nt.dist < 22 + p.aggression * 10) {
      /* don't always pick a fight: cautious bots loot first */
      if (chance(0.18 * (1 - p.aggression))) setState(bot, 'loot');
      else setState(bot, 'hunt');
    } else {
      setState(bot, 'loot');
    }

    /* human-ish tics */
    if (chance(0.06)) bot.hesitate = rand(0.2, 0.7);
    if (chance(0.04)) bot.strafeDir *= -1;
    if (chance(0.02)) bot.wantJump = true;
  }

  /* --- act on the current state every frame --- */
  switch (bot.state) {
    case 'flee': {
      const b = State.bases[bot.baseIndex];
      steerTo(bot, b.x, b.z);
      if (bot.inOwnDome()) setState(bot, 'heal');
      if (hpFrac > 0.75) setState(bot, 'hunt');
      break;
    }

    case 'heal': {
      const b = State.bases[bot.baseIndex];
      const a = now * 0.6 + bot.id;
      bot.wantMove.set(Math.cos(a) * 0.35, 0, Math.sin(a) * 0.35);
      if (hpFrac > 0.95 && chance(0.4)) setState(bot, 'hunt');
      if (bot.nearTarget && bot.nearDist < 5 && !bot.nearTarget.inOwnDome()) {
        bot.facing.set(bot.nearTarget.pos.x - bot.pos.x, 0, bot.nearTarget.pos.z - bot.pos.z).normalize();
        if (bot.reactionT <= 0 && bot.atkCd <= 0 && bot.nearDist < bot.weapon.range) bot.wantAttack = true;
      }
      break;
    }

    case 'hunt': {
      const t = bot.nearTarget;
      if (!t || t.dead || t.inOwnDome()) { setState(bot, 'loot'); break; }

      const dx = t.pos.x - bot.pos.x, dz = t.pos.z - bot.pos.z;
      const dist = Math.hypot(dx, dz);
      bot.facing.set(dx, 0, dz).normalize();

      const range = bot.weapon.range;

      if (bot.hesitate > 0) {
        bot.hesitate -= dt;
        /* stop dead and stare for a moment, like a real player */
        break;
      }

      if (dist > range * 0.85) {
        steerTo(bot, t.pos.x, t.pos.z);
        if (Math.abs(t.pos.y - bot.pos.y) > 2.2 && chance(0.08)) bot.wantJump = true;
      } else {
        /* in range: circle-strafe instead of standing still */
        bot.strafeT -= dt;
        if (bot.strafeT <= 0) { bot.strafeT = rand(0.7, 2.0); bot.strafeDir *= chance(0.35) ? -1 : 1; }
        const px = -dz / (dist || 1), pz = dx / (dist || 1);
        const backOff = hpFrac < 0.45 && chance(0.02) ? -0.9 : 0;
        bot.wantMove.set(px * bot.strafeDir * 0.75 + (dx / (dist || 1)) * backOff, 0,
          pz * bot.strafeDir * 0.75 + (dz / (dist || 1)) * backOff);
        /* keep them on the platform */
        const probe = new THREE.Vector3(bot.pos.x + bot.wantMove.x * 1.4, 0, bot.pos.z + bot.wantMove.z * 1.4);
        if (groundAt(probe.x, probe.z) === null) steerTo(bot, t.pos.x, t.pos.z);

        if (bot.reactionT <= 0 && bot.atkCd <= 0) {
          /* whiff sometimes, especially with low skill */
          const whiff = chance((1 - p.skill) * 0.28);
          if (whiff) {
            bot.wantAttack = true;
            bot.atkCd = bot.weapon.cd * rand(0.6, 1.0);
          } else if (dist <= range * 0.95) {
            bot.wantAttack = true;
            bot.reactionT = rand(0.12, 0.5) * (1.4 - p.skill);
          }
        }
      }

      /* give up a losing chase now and then */
      if (dist > 26 && chance(0.02)) setState(bot, 'loot');
      break;
    }

    case 'loot':
    default: {
      const pickup = nearestPickup(bot, 16);
      /* unarmed bots hunt blocks hard; armed bots only grab one in their path */
      const block = nearestBlock(bot, bot.weapon === FISTS ? 40 : 4);

      if (pickup) {
        steerTo(bot, pickup.x, pickup.z);
      } else if (block) {
        const bx = block.mesh.position.x, bz = block.mesh.position.z;
        const d = Math.hypot(bx - bot.pos.x, bz - bot.pos.z);
        steerTo(bot, bx, bz);
        bot.facing.set(bx - bot.pos.x, 0, bz - bot.pos.z).normalize();
        if (d < bot.weapon.range * 0.9 && bot.atkCd <= 0) bot.wantAttack = true;
      } else {
        /* wander the arena, drift toward the centre */
        if (bot.stateT <= 0 || bot.pos.distanceTo(bot.wanderTo) < 2.5) {
          const a = rand(0, Math.PI * 2);
          const r = rand(3, ARENA_R - 3);
          bot.wanderTo.set(Math.cos(a) * r, 0, Math.sin(a) * r);
          bot.stateT = rand(1.5, 3.5);
        }
        steerTo(bot, bot.wanderTo.x, bot.wanderTo.z);
      }

      /* opportunistic swing at whoever wanders into reach */
      if (bot.nearTarget && bot.nearDist < bot.weapon.range * 0.8 && bot.atkCd <= 0 && chance(0.5)) {
        bot.facing.set(bot.nearTarget.pos.x - bot.pos.x, 0, bot.nearTarget.pos.z - bot.pos.z).normalize();
        bot.wantAttack = true;
      }
      break;
    }
  }

  /* never stand in another player's dome if you can help it */
  const d = bot.inDome();
  if (d && d !== State.bases[bot.baseIndex] && bot.state !== 'heal') {
    const cl = Math.hypot(bot.pos.x, bot.pos.z) || 1;
    bot.wantMove.set(-bot.pos.x / cl, 0, -bot.pos.z / cl);
  }
}
