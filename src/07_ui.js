'use strict';

/* ============================================================
   UI — HUD, nameplates, kill feed, damage numbers, overlays
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
      waveLabel: $('wave-label'),
      feed: $('feed'),
      chat: $('chat'),
      toast: $('toast'),
      plates: $('plates'),
      floats: $('floats'),
      board: $('board'),
      death: $('death'),
      deathBy: $('death-by'),
      deathTimer: $('death-timer'),
      start: $('start'),
      hud: $('hud'),
      crosshair: $('crosshair'),
      muteState: $('mute-state'),
      build: $('build'),
      killCount: $('kill-count'),
    };
    this.el.build.textContent = 'v' + BUILD.version + ' · ' + BUILD.stamp;

    for (const f of State.fighters) this.makePlate(f);
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

  floatText(worldPos, text, color) {
    if (this.floaters.length > 60) return;
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
    this.el.weaponTier.style.color = '#' + t.glow.toString(16).padStart(6, '0');
    this.el.weaponTier.style.borderColor = '#' + t.glow.toString(16).padStart(6, '0');
    this.el.playerName.textContent = p.name;
    this.el.killCount.textContent = p.kills;

    const alive = State.fighters.filter(f => !f.dead).length;
    this.el.aliveCount.textContent = alive;
    this.el.waveLabel.textContent = 'WAVE ' + State.wave;

    const secs = Math.max(0, Math.ceil(State.bigTimer / 1000));
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    this.el.bigTimer.textContent = State.bigAlive ? 'LIVE' : mm + ':' + ss;
    this.el.bigTimer.style.color = State.bigAlive ? '#35e0ff' : '#8ea0c8';

    if (p.dead) {
      this.el.deathTimer.textContent = Math.ceil(Math.max(0, p.respawnT)) + 's';
    }

    if (this.toastT > 0) {
      this.toastT -= dt;
      const a = clamp(this.toastT / 0.5, 0, 1);
      this.el.toast.style.opacity = String(a);
      this.el.toast.style.transform = 'translate(-50%, ' + (1 - a) * -12 + 'px) scale(' + (0.96 + a * 0.04) + ')';
    }

    /* nameplates */
    for (const f of State.fighters) {
      const plate = this.plates.get(f);
      if (!plate) continue;
      if (f.dead) { plate.root.style.display = 'none'; continue; }
      const head = f.headPos();
      const dist = head.distanceTo(State.camera.position);
      const proj = this.project(head);
      if (!proj.visible || dist > 70) { plate.root.style.display = 'none'; continue; }
      plate.root.style.display = 'block';
      plate.root.style.transform = 'translate(-50%,-100%) translate(' + proj.x + 'px,' + proj.y + 'px)';
      plate.root.style.opacity = String(clamp(1.4 - dist / 60, 0.25, 1));
      plate.bar.style.width = clamp(f.hp / f.maxHp, 0, 1) * 100 + '%';
      plate.bar.style.background = f.isPlayer ? '#8ef0ff'
        : f.hp / f.maxHp > 0.5 ? '#5ef08a' : f.hp / f.maxHp > 0.25 ? '#ffb648' : '#ff5d5d';
      plate.name.style.color = f.isPlayer ? '#8ef0ff' : '#dbe4ff';
    }

    /* floating numbers */
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

    /* kill feed fade */
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
      html += '<div' + cls + '><span class="bn' + dead + '">' + escapeHtml(f.name) + '</span>' +
        '<span class="bk">' + f.kills + '</span><span class="bd">' + f.deaths + '</span></div>';
    }
    this.el.board.innerHTML = '<div class="bhead"><span class="bn">PLAYER</span><span class="bk">K</span><span class="bd">D</span></div>' + html;
  },
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
