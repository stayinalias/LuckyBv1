'use strict';

/* ============================================================
   UI — HUD, 5-slot inventory, nameplates, feed, overlays
   ============================================================ */

const UI = {
  el: {},
  plates: new Map(),
  floaters: [],
  feedItems: [],
  toastT: 0,
  boardTick: 0,

  init() {
    const $ = id => document.getElementById(id);
    this.el = {
      hpFill: $('hp-fill'),
      hpText: $('hp-text'),
      shieldFill: $('shield-fill'),
      weaponName: $('weapon-name'),
      weaponTier: $('weapon-tier'),
      playerName: $('player-name'),
      aliveCount: $('alive-count'),
      bigTimer: $('big-timer'),
      chamberTimer: $('chamber-timer'),
      galaxyTimer: $('galaxy-timer'),
      rngTimer: $('rng-timer'),
      feed: $('feed'),
      chat: $('chat'),
      toast: $('toast'),
      plates: $('plates'),
      floats: $('floats'),
      board: $('board'),
      death: $('death'),
      deathBy: $('death-by'),
      deathTimer: $('death-timer'),
      hud: $('hud'),
      muteState: $('mute-state'),
      build: $('build'),
      killCount: $('kill-count'),
      inv: $('inv'),
    };
    this.el.build.textContent = 'v' + BUILD.version + ' · ' + BUILD.stamp;

    for (const f of State.fighters) this.makePlate(f);
    this.buildInvBar();
    this.updateInv();
    this.updateBoard();
  },

  makePlate(f) {
    const d = document.createElement('div');
    d.className = 'plate' + (f.isPlayer ? ' plate-me' : '');
    d.innerHTML = '<div class="pname"></div><div class="pbar"><i></i></div>';
    d.querySelector('.pname').textContent = f.name;
    this.el.plates.appendChild(d);
    this.plates.set(f, { root: d, name: d.querySelector('.pname'), bar: d.querySelector('.pbar i') });
  },

  buildInvBar() {
    this.el.inv.innerHTML = '';
    for (let i = 0; i < CONFIG.slots; i++) {
      const d = document.createElement('div');
      d.className = 'slot';
      d.innerHTML = '<span class="num">' + (i + 1) + '</span><span class="nm"></span><span class="tg"></span>';
      this.el.inv.appendChild(d);
    }
  },

  updateInv() {
    const p = State.player;
    if (!p || !this.el.inv) return;
    const cells = this.el.inv.children;
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const s = p.slots[i];
      const nm = cell.querySelector('.nm');
      const tg = cell.querySelector('.tg');
      cell.classList.toggle('sel', i === p.slotIndex);
      cell.classList.toggle('filled', !!s);
      if (s) {
        const t = TIERS[s.tier];
        nm.textContent = s.def.name;
        tg.textContent = s.type === 'item' ? 'USE' : t.label;
        cell.style.setProperty('--tier', hexStr(t.glow));
      } else {
        nm.textContent = '—';
        tg.textContent = '';
        cell.style.setProperty('--tier', 'rgba(120,170,255,0.25)');
      }
    }
  },

  floatText(worldPos, text, color) {
    if (this.floaters.length > 70) return;
    const d = document.createElement('div');
    d.className = 'float';
    d.textContent = text;
    d.style.color = color || '#fff';
    this.el.floats.appendChild(d);
    this.floaters.push({ el: d, pos: worldPos.clone(), life: 0.9, max: 0.9, drift: rand(-0.4, 0.4) });
  },

  project(v3) {
    const p = v3.clone().project(State.camera);
    return {
      x: (p.x * 0.5 + 0.5) * window.innerWidth,
      y: (-p.y * 0.5 + 0.5) * window.innerHeight,
      visible: p.z < 1 && p.z > -1,
    };
  },

  feed(text, color) {
    const d = document.createElement('div');
    d.className = 'feed-item';
    d.style.borderLeftColor = color && color.length === 7 ? color : '#8ef0ff';
    d.textContent = text;
    this.el.feed.appendChild(d);
    this.feedItems.push({ el: d, life: 6 });
    while (this.feedItems.length > 6) {
      const old = this.feedItems.shift();
      old.el.remove();
    }
  },

  chat(name, text) {
    const d = document.createElement('div');
    d.className = 'chat-item';
    const b = document.createElement('b');
    b.textContent = name + ': ';
    d.appendChild(b);
    d.appendChild(document.createTextNode(text));
    this.el.chat.appendChild(d);
    setTimeout(() => d.classList.add('out'), 4200);
    setTimeout(() => d.remove(), 5200);
    while (this.el.chat.children.length > 4) this.el.chat.firstChild.remove();
  },

  toast(text, color) {
    const t = this.el.toast;
    t.textContent = text;
    t.style.color = color || '#fff';
    t.style.opacity = '1';
    t.style.transform = 'translate(-50%, 0) scale(1)';
    this.toastT = 1.6;
  },

  showDeath(by) {
    this.el.deathBy.textContent = by;
    this.el.death.style.display = 'flex';
  },
  hideDeath() { this.el.death.style.display = 'none'; },

  update(dt) {
    const p = State.player;

    const hpPct = clamp(p.hp / p.maxHp, 0, 1) * 100;
    this.el.hpFill.style.width = hpPct + '%';
    this.el.hpFill.style.background = hpPct > 55 ? 'linear-gradient(90deg,#3ddc84,#8ef07a)'
      : hpPct > 25 ? 'linear-gradient(90deg,#ffb648,#ffe07a)' : 'linear-gradient(90deg,#ff4d4d,#ff8f6b)';
    this.el.hpText.textContent = Math.max(0, Math.ceil(p.hp)) + ' / ' + p.maxHp;
    this.el.shieldFill.style.width = clamp(p.shield / 150, 0, 1) * 100 + '%';

    const w = p.weapon;
    this.el.weaponName.textContent = w.name;
    const t = TIERS[w.tier];
    this.el.weaponTier.textContent = t.label;
    this.el.weaponTier.style.color = hexStr(t.glow);
    this.el.weaponTier.style.borderColor = hexStr(t.glow);
    this.el.playerName.textContent = p.name + '  ·  ' + p.team.name;
    this.el.playerName.style.color = hexStr(p.team.glow);
    this.el.killCount.textContent = p.kills;

    this.el.aliveCount.textContent = State.fighters.filter(f => !f.dead).length;

    const bigLive = State.blocks.some(b => b.kind === 'big');
    this.el.bigTimer.textContent = bigLive ? 'LIVE' : World.formatTime(Math.max(0, State.timers.big));
    this.el.bigTimer.style.color = bigLive ? '#35e0ff' : '#8ea0c8';

    const galLive = State.blocks.some(b => b.kind === 'galaxy');
    this.el.galaxyTimer.textContent = galLive ? 'LIVE' : World.formatTime(Math.max(0, State.timers.galaxy));
    this.el.galaxyTimer.style.color = galLive ? '#c9a6ff' : '#8ea0c8';

    const rngLive = State.blocks.some(b => b.kind === 'rng');
    this.el.rngTimer.textContent = rngLive ? 'LIVE' : World.formatTime(Math.max(0, State.timers.rng));
    this.el.rngTimer.style.color = rngLive ? '#4dff8f' : '#8ea0c8';

    const own = State.chambers[p.baseIndex];
    if (own) {
      this.el.chamberTimer.textContent = own.ready ? 'READY' : World.formatTime(own.timer);
      this.el.chamberTimer.style.color = own.ready ? hexStr(TIERS[own.tier].glow) : '#8ea0c8';
    }

    if (p.dead) this.el.deathTimer.textContent = Math.ceil(Math.max(0, p.respawnT)) + 's';

    if (this.toastT > 0) {
      this.toastT -= dt;
      const a = clamp(this.toastT / 0.5, 0, 1);
      this.el.toast.style.opacity = String(a);
      this.el.toast.style.transform = 'translate(-50%, ' + (1 - a) * -12 + 'px) scale(' + (0.96 + a * 0.04) + ')';
    }

    for (const f of State.fighters) {
      const plate = this.plates.get(f);
      if (!plate) continue;
      if (f.dead) { plate.root.style.display = 'none'; continue; }
      const head = f.headPos();
      const dist = head.distanceTo(State.camera.position);
      const proj = this.project(head);
      if (!proj.visible || dist > 160) { plate.root.style.display = 'none'; continue; }
      plate.root.style.display = 'block';
      plate.root.style.transform = 'translate(-50%,-100%) translate(' + proj.x + 'px,' + proj.y + 'px)';
      plate.root.style.opacity = String(clamp(1.5 - dist / 130, 0.25, 1));
      plate.bar.style.width = clamp(f.hp / f.maxHp, 0, 1) * 100 + '%';
      plate.bar.style.background = f.isPlayer ? '#8ef0ff'
        : f.hp / f.maxHp > 0.5 ? '#5ef08a' : f.hp / f.maxHp > 0.25 ? '#ffb648' : '#ff5d5d';
      plate.name.style.color = hexStr(f.team.glow);
    }

    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const fl = this.floaters[i];
      fl.life -= dt;
      fl.pos.y += dt * 1.5;
      fl.pos.x += fl.drift * dt;
      if (fl.life <= 0) { fl.el.remove(); this.floaters.splice(i, 1); continue; }
      const proj = this.project(fl.pos);
      if (!proj.visible) { fl.el.style.display = 'none'; continue; }
      fl.el.style.display = 'block';
      const k = fl.life / fl.max;
      fl.el.style.transform = 'translate(-50%,-50%) translate(' + proj.x + 'px,' + proj.y + 'px) scale(' + (0.85 + k * 0.45) + ')';
      fl.el.style.opacity = String(clamp(k * 1.6, 0, 1));
    }

    for (let i = this.feedItems.length - 1; i >= 0; i--) {
      const it = this.feedItems[i];
      it.life -= dt;
      if (it.life < 1) it.el.style.opacity = String(clamp(it.life, 0, 1));
      if (it.life <= 0) { it.el.remove(); this.feedItems.splice(i, 1); }
    }

    this.updateBoard();
  },

  updateBoard() {
    this.boardTick += 1;
    if (this.boardTick % 12 !== 0 && this.boardTick > 1) return;
    const sorted = State.fighters.slice().sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
    let html = '';
    for (const f of sorted.slice(0, 8)) {
      const cls = f.isPlayer ? ' class="me"' : '';
      const dead = f.dead ? ' dead' : '';
      html += '<div' + cls + '><span class="dot" style="background:' + hexStr(f.team.hex) + '"></span>' +
        '<span class="bn' + dead + '">' + escapeHtml(f.name) + '</span>' +
        '<span class="bk">' + f.kills + '</span><span class="bd">' + f.deaths + '</span></div>';
    }
    this.el.board.innerHTML = '<div class="bhead"><span class="dot"></span><span class="bn">PLAYER</span><span class="bk">K</span><span class="bd">D</span></div>' + html;
  },
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
