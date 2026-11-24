'use strict';

/* ============================================================
   BOT BRAIN — loots blocks, fights, and uses hero powers
   ============================================================ */

const BLOCK_VALUE = { big: 4.0, rng: 3.0, galaxy: 2.6, super: 6.0, loose: 1.0 };

function nearestTarget(bot) {
  let best = null, bestD = Infinity;
  for (const f of State.fighters) {
    if (f === bot || f.dead) continue;
    if (f.inOwnDome() && !f.powered) continue;
    const d = f.pos.distanceTo(bot.pos);
    if (d < bestD) { bestD = d; best = f; }
  }
  return { target: best, dist: bestD };
}

function bestBlock(bot, maxDist) {
  let best = null, bestScore = Infinity;
  for (const b of State.blocks) {
    if (!b.alive) continue;
    const d = Math.hypot(b.mesh.position.x - bot.pos.x, b.mesh.position.z - bot.pos.z);
    if (d > maxDist) continue;
    const score = d / (BLOCK_VALUE[b.kind] || 1);
    if (score < bestScore) { bestScore = score; best = b; }
  }
  return best;
}

function nearestChamberPrize(bot, maxDist) {
  let best = null, bestD = maxDist;
  for (const c of State.chambers) {
    if (!c.ready) continue;
    const d = Math.hypot(c.x - bot.pos.x, c.z - bot.pos.z);
    if (d < bestD) { bestD = d; best = c; }
  }
  return best;
}

function walkable(x, z) { return walkableAt(x, z); }

function walkableDir(bot, dx, dz) {
  const angles = [0, 0.28, -0.28, 0.6, -0.6, 0.95, -0.95, 1.35, -1.35, 1.8, -1.8, 2.4, -2.4];
  for (const a of angles) {
    const c = Math.cos(a), s = Math.sin(a);
    const nx = dx * c - dz * s;
    const nz = dx * s + dz * c;
    if (walkable(bot.pos.x + nx * 2.8, bot.pos.z + nz * 2.8)) return [nx, nz];
  }
  return null;
}

function steerTo(bot, tx, tz) {
  let dx = tx - bot.pos.x, dz = tz - bot.pos.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.001) return;
  dx /= d; dz /= d;

  if (bot.flying) { bot.wantMove.set(dx, 0, dz); return; }

  const rBot = Math.hypot(bot.pos.x, bot.pos.z);
  const rTgt = Math.hypot(tx, tz);
  if (rBot > ARENA_R - 2 && rTgt < ARENA_R - 2) {
    dx = -bot.pos.x / (rBot || 1);
    dz = -bot.pos.z / (rBot || 1);
  } else if (rBot < ARENA_R - 2 && rTgt > ARENA_R - 2) {
    dx = tx / (rTgt || 1);
    dz = tz / (rTgt || 1);
  }

  const safe = walkableDir(bot, dx, dz);
  if (safe) bot.wantMove.set(safe[0], 0, safe[1]);
  else {
    const r = Math.hypot(bot.pos.x, bot.pos.z) || 1;
    bot.wantMove.set(-bot.pos.x / r, 0, -bot.pos.z / r);
    if (bot.grounded && chance(0.05)) bot.wantJump = true;
  }
}

function setState(bot, s) {
  if (bot.state !== s) { bot.state = s; bot.stateT = rand(0.6, 1.8); }
}

/* fire the best ready power at whatever is in front of us */
function tryPowers(bot, dist) {
  if (!bot.powered) return;
  const now = State.time;
  const abil = bot.hero.abilities;
  for (let i = 0; i < abil.length; i++) {
    if (bot.abCd[i] > now) continue;
    const ab = abil[i];
    const usable =
      (ab.type === 'beam' && dist < 40) ||
      (ab.type === 'punch' && dist < 6.5) ||
      (ab.type === 'barrage' && dist < 6) ||
      (ab.type === 'yell' && dist < 15) ||
      (ab.type === 'dash' && dist > 6 && dist < 22) ||
      (ab.type === 'slam' && dist < 10) ||
      (ab.type === 'throw' && dist < 30) ||
      (ab.type === 'shield' && bot.hp < bot.maxHp * 0.6);
    if (!usable) continue;
    if (chance(0.35 + bot.personality.skill * 0.5)) {
      bot.wantAbility = i;
      return;
    }
  }
}

function botThink(bot, dt) {
  if (bot.dead) return;
  bot.think -= dt;
  bot.stateT -= dt;
  bot.wantMove.set(0, 0, 0);

  if (bot.stunT > 0) { bot.stunT -= dt; return; }

  const p = bot.personality;
  const hpFrac = bot.hp / bot.maxHp;
  const now = State.time;

  if (bot.reactionT > 0) bot.reactionT -= dt;
  if (bot.blockCd > 0) bot.blockCd -= dt;

  if (bot.think <= 0) {
    bot.think = rand(0.22, 0.5) / (0.6 + p.skill * 0.8);
    const nt = nearestTarget(bot);
    bot.nearTarget = nt.target;
    bot.nearDist = nt.dist;
    const armed = bot.weapon !== FISTS;

    if (hpFrac < 0.22 && !bot.inOwnDome() && !bot.noRegen && chance(0.55 + p.caution * 0.4)) {
      setState(bot, 'flee');
    } else if (bot.inOwnDome() && hpFrac < 0.92 && !bot.noRegen) {
      setState(bot, 'heal');
    } else if (!armed && !bot.inOwnDome()) {
      setState(bot, 'loot');
    } else if (nt.target && nt.dist < 26 + p.aggression * 12) {
      if (chance(0.18 * (1 - p.aggression))) setState(bot, 'loot');
      else setState(bot, 'hunt');
    } else {
      setState(bot, 'loot');
    }

    if (chance(0.06)) bot.hesitate = rand(0.2, 0.7);
    if (chance(0.04)) bot.strafeDir *= -1;
    if (chance(0.02)) bot.wantJump = true;
  }

  switch (bot.state) {
    case 'flee': {
      const b = State.bases[bot.baseIndex];
      steerTo(bot, b.x, b.z);
      if (bot.inOwnDome()) setState(bot, 'heal');
      if (hpFrac > 0.75) setState(bot, 'hunt');
      break;
    }

    case 'heal': {
      const prize = bot.blockCd > 0 ? null : nearestChamberPrize(bot, 8);
      if (prize) steerTo(bot, prize.x, prize.z);
      else {
        const a = now * 0.6 + bot.id;
        bot.wantMove.set(Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4);
      }
      if (hpFrac > 0.95 && chance(0.4)) setState(bot, 'hunt');
      break;
    }

    case 'hunt': {
      const t = bot.nearTarget;
      if (!t || t.dead) { setState(bot, 'loot'); break; }

      const dx = t.pos.x - bot.pos.x, dz = t.pos.z - bot.pos.z;
      const dist = Math.hypot(dx, dz);
      bot.facing.set(dx, 0, dz).normalize();
      const range = bot.weapon.range || 3;

      tryPowers(bot, dist);

      if (bot.hesitate > 0) { bot.hesitate -= dt; break; }

      if (dist > range * 0.85) {
        steerTo(bot, t.pos.x, t.pos.z);
        if (Math.abs(t.pos.y - bot.pos.y) > 2.2 && chance(0.08)) bot.wantJump = true;
      } else {
        bot.strafeT -= dt;
        if (bot.strafeT <= 0) { bot.strafeT = rand(0.7, 2.0); bot.strafeDir *= chance(0.35) ? -1 : 1; }
        const px = -dz / (dist || 1), pz = dx / (dist || 1);
        bot.wantMove.set(px * bot.strafeDir * 0.75, 0, pz * bot.strafeDir * 0.75);
        const probeX = bot.pos.x + bot.wantMove.x * 1.6;
        const probeZ = bot.pos.z + bot.wantMove.z * 1.6;
        if (!bot.flying && groundAt(probeX, probeZ) === null) steerTo(bot, t.pos.x, t.pos.z);

        if (bot.reactionT <= 0 && bot.atkCd <= 0) {
          const whiff = chance((1 - p.skill) * 0.28);
          if (whiff) { bot.wantAttack = true; bot.atkCd = bot.weapon.cd * rand(0.6, 1.0); }
          else if (dist <= range * 0.95) {
            bot.wantAttack = true;
            bot.reactionT = rand(0.12, 0.5) * (1.4 - p.skill);
          }
        }
      }
      if (dist > 30 && chance(0.02)) setState(bot, 'loot');
      break;
    }

    case 'loot':
    default: {
      const armed = bot.weapon !== FISTS;
      const prize = bot.blockCd > 0 ? null : nearestChamberPrize(bot, armed ? 14 : 30);
      const block = bot.blockCd > 0 ? null : bestBlock(bot, armed ? 34 : 60);

      if (prize && (!block || chance(0.5))) steerTo(bot, prize.x, prize.z);
      else if (block) {
        const bx = block.mesh.position.x, bz = block.mesh.position.z;
        steerTo(bot, bx, bz);
        bot.facing.set(bx - bot.pos.x, 0, bz - bot.pos.z).normalize();
      } else {
        if (bot.stateT <= 0 || bot.pos.distanceTo(bot.wanderTo) < 3) {
          const a = rand(0, Math.PI * 2);
          const r = rand(6, ARENA_R - 6);
          bot.wanderTo.set(Math.cos(a) * r, 0, Math.sin(a) * r);
          bot.stateT = rand(1.5, 3.5);
        }
        steerTo(bot, bot.wanderTo.x, bot.wanderTo.z);
      }

      if (bot.nearTarget && bot.nearDist < (bot.weapon.range || 3) * 0.8 && bot.atkCd <= 0 && chance(0.5)) {
        bot.facing.set(bot.nearTarget.pos.x - bot.pos.x, 0, bot.nearTarget.pos.z - bot.pos.z).normalize();
        bot.wantAttack = true;
      }
      if (bot.nearTarget) tryPowers(bot, bot.nearDist);
      break;
    }
  }

  const d = bot.inDome();
  if (d && d !== State.bases[bot.baseIndex] && bot.state !== 'heal') {
    const cl = Math.hypot(bot.pos.x, bot.pos.z) || 1;
    bot.wantMove.set(-bot.pos.x / cl, 0, -bot.pos.z / cl);
  }
}
