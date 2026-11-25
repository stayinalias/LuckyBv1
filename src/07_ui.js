'use strict';

/* ============================================================
   UI — HUD, inventory, trait icons, ability bar, hero picker
   ============================================================ */


/* ---------- generated hero portraits (original art, drawn in canvas) ---------- */
function rgba(hex, a) {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}
const PORTRAIT_CACHE = {};
const TRAIT_CACHE = {};

/* small square badge per hero: their own emblem drawn as vector shapes so
   every icon renders the same on any device. Powered fighters show this
   icon lit up next to their name. */
const TRAIT_STYLE = {
  homelander: 'A', blacknoir: 'X', soldierboy: 'shieldstar', cap: 'shieldstar',
  superman: 'diamondS', sentry: 'S', wintersoldier: 'star', flash: 'bolt',
  wallywest: 'bolt', goku: 'dragonball', saitama: 'S', vegeta: 'V',
  broly: 'B', omniman: 'O', conquest: 'C', invincible: 'I', greenlantern: 'ring',
};

function starPath(g, cx, cy, outer, inner, points) {
  g.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = -Math.PI / 2 + i * Math.PI / points;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.closePath();
}

function drawTraitShape(g, style, col) {
  const cx = 32, cy = 32;
  switch (style) {
    case 'bolt':
      g.beginPath();
      g.moveTo(38, 10); g.lineTo(20, 36); g.lineTo(31, 36);
      g.lineTo(26, 54); g.lineTo(45, 26); g.lineTo(33, 26);
      g.closePath();
      g.fillStyle = col; g.fill();
      g.lineWidth = 2; g.strokeStyle = '#ffffff'; g.stroke();
      return;
    case 'shieldstar':
      g.beginPath();
      g.moveTo(cx, 11); g.lineTo(50, 18); g.lineTo(47, 38);
      g.lineTo(cx, 54); g.lineTo(17, 38); g.lineTo(14, 18);
      g.closePath();
      g.fillStyle = col; g.fill();
      starPath(g, cx, cy - 1, 10, 4.4, 5);
      g.fillStyle = '#ffffff'; g.fill();
      return;
    case 'star':
      starPath(g, cx, cy, 17, 7, 5);
      g.fillStyle = col; g.fill();
      g.lineWidth = 2; g.strokeStyle = '#ffffff'; g.stroke();
      return;
    case 'diamondS':
      g.beginPath();
      g.moveTo(cx, 8); g.lineTo(54, cy); g.lineTo(cx, 56); g.lineTo(10, cy);
      g.closePath();
      g.fillStyle = col; g.fill();
      g.font = 'bold 26px Arial, sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#ffffff'; g.fillText('S', cx, cy + 1);
      return;
    case 'dragonball':
      g.beginPath(); g.arc(cx, cy, 17, 0, Math.PI * 2);
      g.fillStyle = col; g.fill();
      g.lineWidth = 2; g.strokeStyle = '#ffffff'; g.stroke();
      for (let i = 0; i < 4; i++) {
        const a = -Math.PI / 2 + i * Math.PI / 2;
        starPath(g, cx + Math.cos(a) * 7.5, cy + Math.sin(a) * 7.5, 3.4, 1.5, 5);
        g.fillStyle = '#ffffff'; g.fill();
      }
      return;
    case 'ring':
      g.beginPath(); g.arc(cx, cy, 15, 0, Math.PI * 2);
      g.lineWidth = 6; g.strokeStyle = col; g.stroke();
      g.beginPath(); g.moveTo(cx - 14, cy - 9); g.lineTo(cx + 14, cy - 9);
      g.lineWidth = 4; g.strokeStyle = '#ffffff'; g.stroke();
      return;
    case 'V':
      g.beginPath();
      g.moveTo(18, 12); g.lineTo(29, 12); g.lineTo(32, 40); g.lineTo(35, 12);
      g.lineTo(46, 12); g.lineTo(36, 52); g.lineTo(28, 52);
      g.closePath();
      g.fillStyle = col; g.fill();
      return;
    case 'X':
      g.lineWidth = 7; g.lineCap = 'round'; g.strokeStyle = col;
      g.beginPath(); g.moveTo(19, 19); g.lineTo(45, 45); g.stroke();
      g.beginPath(); g.moveTo(45, 19); g.lineTo(19, 45); g.stroke();
      g.lineWidth = 2.5; g.strokeStyle = '#ffffff';
      g.beginPath(); g.moveTo(20, 20); g.lineTo(40, 40); g.stroke();
      g.beginPath(); g.moveTo(44, 20); g.lineTo(24, 40); g.stroke();
      return;
    case 'O':
      g.beginPath(); g.arc(cx, cy, 15, 0, Math.PI * 2);
      g.lineWidth = 6; g.strokeStyle = col; g.stroke();
      g.beginPath(); g.moveTo(14, 46); g.lineTo(50, 18);
      g.lineWidth = 3; g.strokeStyle = '#ffffff'; g.stroke();
      return;
    default:
      g.font = 'bold 36px Arial, sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 4; g.strokeStyle = '#ffffff';
      g.strokeText(style, cx, cy + 1);
      g.fillStyle = col;
      g.fillText(style, cx, cy + 1);
  }
}

function makeTraitIcon(key) {
  if (TRAIT_CACHE[key]) return TRAIT_CACHE[key];
  const h = HEROES[key] || {};
  const col = hexStr(h.color || 0xffffff);
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 64, 64);
  /* rounded badge */
  const r = 14;
  g.beginPath();
  g.moveTo(r, 2); g.lineTo(64 - r, 2); g.quadraticCurveTo(62, 2, 62, r);
  g.lineTo(62, 64 - r); g.quadraticCurveTo(62, 62, 64 - r, 62);
  g.lineTo(r, 62); g.quadraticCurveTo(2, 62, 2, 64 - r);
  g.lineTo(2, r); g.quadraticCurveTo(2, 2, r, 2);
  g.closePath();
  g.fillStyle = 'rgba(6,9,17,.92)';
  g.fill();
  g.lineWidth = 4;
  g.strokeStyle = col;
  g.stroke();
  /* emblem, drawn as a vector shape in the hero's own colour */
  g.shadowColor = col;
  g.shadowBlur = 10;
  drawTraitShape(g, TRAIT_STYLE[key] || (h.name || '?').charAt(0), col);
  g.shadowBlur = 0;
  const url = c.toDataURL();
  TRAIT_CACHE[key] = url;
  return url;
}

function makeHeroPortrait(key) {
  if (PORTRAIT_CACHE[key]) return PORTRAIT_CACHE[key];
  const h = HEROES[key];
  const look = heroLook(key);
  const c = document.createElement('canvas');
  c.width = 128; c.height = 160;
  const g = c.getContext('2d');

  const bg = g.createRadialGradient(64, 70, 6, 64, 90, 130);
  bg.addColorStop(0, rgba(h.color, 0.55));
  bg.addColorStop(0.55, rgba(h.suit, 0.92));
  bg.addColorStop(1, '#05070f');
  g.fillStyle = bg;
  g.fillRect(0, 0, 128, 160);

  if (look.capeColor) {
    g.fillStyle = rgba(look.capeColor, 0.95);
    g.beginPath();
    g.moveTo(24, 118); g.lineTo(104, 118); g.lineTo(120, 160); g.lineTo(8, 160);
    g.closePath(); g.fill();
  }

  g.fillStyle = rgba(h.suit, 1);
  g.beginPath();
  g.moveTo(10, 160); g.quadraticCurveTo(24, 116, 64, 116);
  g.quadraticCurveTo(104, 116, 118, 160);
  g.closePath(); g.fill();

  g.strokeStyle = rgba(h.accent, 1); g.lineWidth = 3;
  g.beginPath(); g.moveTo(26, 130); g.quadraticCurveTo(64, 118, 102, 130); g.stroke();

  g.fillStyle = rgba(look.pads || h.accent, 1);
  for (const s of [-1, 1]) {
    g.beginPath(); g.ellipse(64 + s * 41, 127, 13, 9, 0, 0, 6.3); g.fill();
  }

  g.fillStyle = '#e8b98d';
  g.fillRect(56, 100, 16, 22);

  g.fillStyle = '#f2c49a';
  g.beginPath(); g.ellipse(64, 74, 27, 33, 0, 0, 6.3); g.fill();
  g.fillStyle = 'rgba(180,120,80,0.16)';
  g.beginPath(); g.ellipse(64, 93, 20, 12, 0, 0, 6.3); g.fill();
  g.fillStyle = '#eebd92';
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(64 + s * 27, 76, 5, 8, 0, 0, 6.3); g.fill(); }

  const hair = look.hairColor || 0x2a2c33;
  g.fillStyle = rgba(hair, 1);
  if (look.hair === 'spiky') {
    for (let i = 0; i < 10; i++) {
      const x = 38 + i * 5.4;
      g.beginPath();
      g.moveTo(x, 54); g.lineTo(x + 3, 24 + (i % 3) * 7); g.lineTo(x + 7, 54);
      g.closePath(); g.fill();
    }
  } else if (look.hair === 'bald') {
    /* bald */
  } else if (look.hair === 'mask') {
    g.fillStyle = rgba(look.maskColor || 0x0d1015, 1);
    g.beginPath(); g.ellipse(64, 74, 28, 34, 0, 0, 6.3); g.fill();
  } else if (look.hair === 'long') {
    g.beginPath(); g.ellipse(64, 52, 30, 22, 0, 0, 6.3); g.fill();
    g.fillRect(33, 58, 9, 58); g.fillRect(86, 58, 9, 58);
  } else {
    g.beginPath(); g.ellipse(64, 54, 28, 20, 0, 0, 6.3); g.fill();
    if (look.hair === 'swept') {
      g.beginPath(); g.ellipse(57, 52, 26, 12, -0.22, 0, 6.3); g.fill();
    }
  }

  const eyeCol = look.eyes;
  for (const s of [-1, 1]) {
    g.fillStyle = '#f7f9ff';
    g.beginPath(); g.ellipse(64 + s * 11, 72, 7, 4.6, 0, 0, 6.3); g.fill();
    if (eyeCol) { g.shadowColor = rgba(eyeCol, 1); g.shadowBlur = 14; }
    g.fillStyle = eyeCol ? rgba(eyeCol, 1) : '#1b2230';
    g.beginPath(); g.arc(64 + s * 11, 72, 3.6, 0, 6.3); g.fill();
    g.shadowBlur = 0;
  }

  g.strokeStyle = rgba(hair, 0.9); g.lineWidth = 2.6;
  for (const s of [-1, 1]) {
    g.beginPath(); g.moveTo(64 + s * 6, 64); g.lineTo(64 + s * 17, 62); g.stroke();
  }
  g.strokeStyle = 'rgba(150,100,70,0.5)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(64, 74); g.lineTo(62, 85); g.stroke();
  g.strokeStyle = 'rgba(120,60,60,0.7)';
  g.beginPath(); g.moveTo(57, 92); g.quadraticCurveTo(64, 95, 71, 92); g.stroke();

  if (look.beard) {
    g.fillStyle = rgba(hair, 0.95);
    g.beginPath(); g.ellipse(64, 96, 20, 12, 0, 0, Math.PI); g.fill();
  }
  if (look.stache) {
    g.fillStyle = rgba(hair, 1);
    g.fillRect(56, 88, 16, 4);
  }

  if (h.emblem) {
    g.fillStyle = rgba(look.emblemColor || 0xffd23d, 1);
    g.beginPath(); g.arc(64, 138, 11, 0, 6.3); g.fill();
    g.fillStyle = 'rgba(6,10,20,0.9)';
    g.font = 'bold 15px Arial';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(h.emblem, 64, 139);
  }

  g.fillStyle = 'rgba(0,0,0,0.12)';
  for (let y = 0; y < 160; y += 3) g.fillRect(0, y, 128, 1);
  const vg = g.createLinearGradient(0, 96, 0, 160);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = vg; g.fillRect(0, 96, 128, 64);

  const url = c.toDataURL('image/png');
  PORTRAIT_CACHE[key] = url;
  return url;
}

const UI = {
  el: {},
  plates: new Map(),
  floaters: [],
  feedItems: [],
  toastT: 0,
  boardTick: 0,
  traitTick: 0,
  selectedHero: 'homelander',

  init() {
    const $ = id => document.getElementById(id);
    this.el = {
      hpFill: $('hp-fill'), hpText: $('hp-text'), shieldFill: $('shield-fill'),
      weaponName: $('weapon-name'), weaponTier: $('weapon-tier'), playerName: $('player-name'),
      aliveCount: $('alive-count'), bigTimer: $('big-timer'), chamberTimer: $('chamber-timer'),
      galaxyTimer: $('galaxy-timer'), rngTimer: $('rng-timer'), superTimer: $('super-timer'),
      feed: $('feed'), chat: $('chat'), toast: $('toast'), announce: $('announce'),
      plates: $('plates'), floats: $('floats'), board: $('board'),
      death: $('death'), deathBy: $('death-by'), deathTimer: $('death-timer'),
      hud: $('hud'), muteState: $('mute-state'), build: $('build'), killCount: $('kill-count'),
      inv: $('inv'), traits: $('traits'), abilities: $('abilities'),
      ammo: $('ammo-display'), hitmarker: $('hitmarker'),
      heroGrid: $('roster'), nameInput: $('name-input'), heroPreview: $('stage-info'),
      stageName: $('stage-name'), stageTag: $('stage-tag'), stageChips: $('stage-chips'),
      stageIdle: $('stage-idle'), stats: $('stats'), playBtn: $('play-btn'),
      step1: $('step-1'), step2: $('step-2'), traitsMini: $('traits-mini'),
    };
    this.el.build.textContent = 'v' + BUILD.version + ' · ' + BUILD.stamp;

    this.heroChosen = false;
    this.buildStatPanel();
    this.bindNameStep();
    HeroStage.init();
    for (const f of State.fighters) this.makePlate(f);
    this.buildInvBar();
    this.buildHeroPicker();
    this.buildAbilityBar();
    this.updateInv();
    this.updateBoard();
    this.updateTraits();
  },

  /* ---------- step 1: name gating ---------- */
  bindNameStep() {
    const input = this.el.nameInput;
    if (!input) return;
    const sync = () => {
      const named = input.value.trim().length > 0;
      this.el.heroGrid.classList.toggle('locked', !named);
      this.el.step1.classList.toggle('on', !named);
      this.el.step2.classList.toggle('on', named);
      this.syncPlayButton();
    };
    input.addEventListener('input', sync);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (!input.value.trim()) { input.focus(); return; }
        const first = this.el.heroGrid.querySelector('.hero-card');
        if (first) first.click();
      }
    });
    sync();
  },

  syncPlayButton() {
    const btn = this.el.playBtn;
    if (!btn) return;
    const named = !!(this.el.nameInput && this.el.nameInput.value.trim());
    btn.disabled = !named;
  },

  /* ---------- step 2: roster + stage + stats ---------- */
  buildHeroPicker() {
    const grid = this.el.heroGrid;
    if (!grid) return;
    grid.innerHTML = '';
    for (const key of HERO_KEYS) {
      const h = HEROES[key];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hero-card' + (key === this.selectedHero ? ' sel' : '');
      b.dataset.hero = key;
      b.style.setProperty('--hc', hexStr(h.color));
      b.style.setProperty('--hs', hexStr(h.suit));
      b.innerHTML = '<img class="hp" alt="" src="' + makeHeroPortrait(key) + '" />' +
        '<span class="hinfo"><span class="hn">' + escapeHtml(h.name) + '</span>' +
        '<span class="ht">' + heroRole(h) + '</span></span>';
      b.addEventListener('click', () => this.chooseHero(key));
      grid.appendChild(b);
    }
    this.updateHeroPreview();
  },

  chooseHero(key) {
    const grid = this.el.heroGrid;
    const input = this.el.nameInput;
    if (input && !input.value.trim()) {
      /* name comes first: nudge the player to the field */
      input.focus();
      input.style.borderColor = '#ff8a80';
      setTimeout(() => { input.style.borderColor = hexStr(HEROES[key].color); }, 500);
      this.toast('Type your name first', '#ff8a80');
      return;
    }
    this.selectedHero = key;
    this.heroChosen = true;
    Sound.uiClick();
    for (const c of grid.children) c.classList.toggle('sel', c.dataset.hero === key);
    const sel = grid.querySelector('.hero-card.sel');
    if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
    input.style.borderColor = hexStr(HEROES[key].color);
    this.updateHeroPreview();
  },

  updateHeroPreview() {
    const key = this.selectedHero;
    const h = HEROES[key];
    if (!h) return;
    const named = !!(this.el.nameInput && this.el.nameInput.value.trim());
    if (this.el.stageName) {
      if (named) {
        this.el.stageName.innerHTML =
          '<img src="' + makeTraitIcon(key) + '" alt="" style="width:26px;height:26px;vertical-align:-5px;margin-right:8px;filter:drop-shadow(0 0 8px ' + hexStr(h.color) + ')" />' +
          escapeHtml(h.name);
      } else {
        this.el.stageName.textContent = 'Choose a character';
      }
      this.el.stageName.style.color = named ? hexStr(h.color) : '#8ea0c8';
      this.el.stageName.style.textShadow = named ? '0 0 22px ' + rgba(h.color, 0.55) : 'none';
    }
    if (this.el.stageTag) {
      this.el.stageTag.textContent = named
        ? (h.flight ? 'Cape hero' : h.speedster ? 'Speedster' : h.shield ? 'Shield bearer' : 'Street fighter')
        : 'type your name, then pick a hero';
    }
    if (this.el.stageChips) {
      this.el.stageChips.innerHTML = h.abilities.map(a =>
        '<span class="chip" style="color:' + hexStr(a.color) + '">' + escapeHtml(a.name) + '</span>'
      ).join('');
    }
      if (this.el.stageIdle) {
        /* keep the small idle caption blank: it read as unnecessary info */
        this.el.stageIdle.textContent = '';
        this.el.stageIdle.style.display = 'none';
      }
    HeroStage.show(key);
    this.updateStats();
    this.syncPlayButton();
  },

  /* live bars: derived from the hero's actual kit so they mean something */
  buildStatPanel() {
    const box = this.el.stats;
    if (!box) return;
    const defs = [
      ['power', 'POWER'],
      ['range', 'RANGE'],
      ['armor', 'ARMOR'],
      ['mobility', 'MOBILITY'],
    ];
    box.innerHTML = defs.map(([id, label]) =>
      '<div class="stat-row" data-stat="' + id + '">' +
      '<div class="lbl"><span>' + label + '</span><b>0</b></div>' +
      '<div class="stat-track"><i></i></div></div>'
    ).join('');
  },

  updateStats() {
    const key = this.selectedHero;
    const h = HEROES[key];
    if (!h || !this.el.stats) return;
    const s = heroStats(key);
    for (const row of this.el.stats.children) {
      const id = row.dataset.stat;
      const v = s[id];
      row.querySelector('b').textContent = String(v);
      const fill = row.querySelector('i');
      fill.style.width = clamp(v, 0, 100) + '%';
      fill.style.background = 'linear-gradient(90deg,' + rgba(h.color, 0.55) + ',' + hexStr(h.color) + ')';
      fill.style.boxShadow = '0 0 10px -2px ' + hexStr(h.color);
    }
    if (this.el.traitsMini) {
      this.el.traitsMini.innerHTML =
        '<b style="color:' + hexStr(h.color) + '">' + escapeHtml(h.name) + '</b> · ' +
        h.abilities.map(a => escapeHtml(a.name)).join(' · ');
    }
  },

  playerNameValue() {
    const v = (this.el.nameInput && this.el.nameInput.value || '').trim();
    return v ? v.slice(0, 18) : null;
  },

  /* ---------- plates / inventory ---------- */
  makePlate(f) {
    const d = document.createElement('div');
    d.className = 'plate' + (f.isPlayer ? ' plate-me' : '');
    d.innerHTML =
      '<div class="prow"><img class="ptrait" alt="" />' +
      '<div class="pname"></div></div>' +
      '<div class="pbar"><i></i></div>';
    d.querySelector('.pname').textContent = f.name;
    d.classList.add('plate-hero');
    d.style.setProperty('--hc', hexStr(f.hero.color));
    const img = d.querySelector('.ptrait');
    img.src = makeTraitIcon(f.heroKey);
    this.el.plates.appendChild(d);
    this.plates.set(f, {
      root: d, name: d.querySelector('.pname'), bar: d.querySelector('.pbar i'),
      icon: img, powered: false,
    });
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

  updateAmmo(current, max, reloading) {
    const el = this.el.ammo;
    if (!el) return;
    if (reloading) {
      el.textContent = 'RELOADING';
      el.className = 'reloading';
    } else if (max > 0) {
      el.textContent = current + ' / ' + max;
      el.className = current <= max * 0.25 ? 'low' : '';
    } else {
      el.textContent = '∞';
      el.className = '';
    }
  },

  hitMarker() {
    const el = this.el.hitmarker;
    if (!el) return;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(this._hmT);
    this._hmT = setTimeout(() => el.classList.remove('show'), 170);
  },

  /* ---------- ability bar ---------- */
  buildAbilityBar() {
    const bar = this.el.abilities;
    if (!bar) return;
    bar.innerHTML = '';
    const keys = ['Q', 'E', 'R'];
    for (let i = 0; i < 3; i++) {
      const d = document.createElement('div');
      d.className = 'ability';
      d.innerHTML = '<span class="akey">' + keys[i] + '</span><span class="anm"></span><span class="afill"></span>';
      bar.appendChild(d);
    }
  },

  updateAbilities() {
    const p = State.player;
    const bar = this.el.abilities;
    if (!p || !bar) return;
    bar.style.display = p.powered ? 'flex' : 'none';
    if (!p.powered) return;
    const now = State.time;
    for (let i = 0; i < bar.children.length; i++) {
      const cell = bar.children[i];
      const ab = p.hero.abilities[i];
      if (!ab) { cell.style.display = 'none'; continue; }
      cell.style.display = 'block';
      cell.querySelector('.anm').textContent = ab.name;
      cell.style.setProperty('--ac', hexStr(ab.color));
      const cd = Math.max(0, p.abCd[i] - now);
      const frac = ab.cd > 0 ? clamp(cd / ab.cd, 0, 1) : 0;
      const fill = cell.querySelector('.afill');
      fill.style.height = (frac * 100) + '%';
      cell.classList.toggle('ready', cd <= 0);
    }
  },

  /* ---------- trait icons ---------- */
  updateTraits() {
    const p = State.player;
    const box = this.el.traits;
    if (!p || !box) return;
    const list = p.traits();
    box.innerHTML = '';
    for (const t of list) {
      const d = document.createElement('div');
      d.className = 'trait' + (t.permanent ? ' perm' : '');
      const fade = t.permanent ? 1 : clamp(t.remaining / t.total, 0.15, 1);
      d.style.opacity = String(fade);
      d.style.setProperty('--tc', t.color);
      d.innerHTML = '<span class="ticon">' + t.icon + '</span><span class="tname">' + escapeHtml(t.name) + '</span>';
      box.appendChild(d);
    }
  },

  /* ---------- world text ---------- */
  floatText(worldPos, text, color) {
    if (this.floaters.length > 80) return;
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
    this.toastT = 1.6;
  },

  /* lobby-wide announcement, used for the Super block */
  broadcast(text, color) {
    const a = this.el.announce;
    if (a) {
      a.textContent = text;
      a.style.color = color || '#fff';
      a.style.opacity = '1';
      a.style.transform = 'translate(-50%, 0) scale(1)';
      clearTimeout(this._annT);
      this._annT = setTimeout(() => { a.style.opacity = '0'; a.style.transform = 'translate(-50%,-14px) scale(0.96)'; }, 3200);
    }
    this.feed(text, color);
    Sound.glitch();
  },

  showDeath(by) { this.el.deathBy.textContent = by; this.el.death.style.display = 'flex'; },
  hideDeath() { this.el.death.style.display = 'none'; },

  update(dt) {
    const p = State.player;

    const hpPct = clamp(p.hp / p.maxHp, 0, 1) * 100;
    this.el.hpFill.style.width = hpPct + '%';
    this.el.hpFill.style.background = hpPct > 55 ? 'linear-gradient(90deg,#3ddc84,#8ef07a)'
      : hpPct > 25 ? 'linear-gradient(90deg,#ffb648,#ffe07a)' : 'linear-gradient(90deg,#ff4d4d,#ff8f6b)';
    this.el.hpText.textContent = Math.max(0, Math.ceil(p.hp)) + ' / ' + p.maxHp;
    this.el.shieldFill.style.width = clamp(p.shield / 400, 0, 1) * 100 + '%';

    const w = p.weapon;
    this.el.weaponName.textContent = w.name + (w.mag ? '  [' + p.ammo + '/' + w.mag + ']' : '');
    const t = TIERS[w.tier];
    this.el.weaponTier.textContent = t.label;
    this.el.weaponTier.style.color = hexStr(t.glow);
    this.el.weaponTier.style.borderColor = hexStr(t.glow);
    this.el.playerName.textContent = p.name + '  ·  ' + p.hero.name;
    this.el.playerName.style.color = hexStr(p.hero.color);
    this.el.killCount.textContent = p.kills;
    this.updateAmmo(p.ammo, w.mag || 0, p.reloading > 0);

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

    if (this.el.superTimer) {
      const superLive = State.blocks.some(b => b.kind === 'super');
      this.el.superTimer.textContent = State.superUnlocked ? 'TAKEN' : superLive ? 'LIVE' : World.formatTime(Math.max(0, State.timers.super));
      this.el.superTimer.style.color = State.superUnlocked ? '#8ea0c8' : '#ff5ce1';
    }

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
      plate.bar.style.background = f.powered ? hexStr(f.hero.color)
        : f.hp / f.maxHp > 0.5 ? '#5ef08a' : f.hp / f.maxHp > 0.25 ? '#ffb648' : '#ff5d5d';
      if (plate.name.textContent !== f.name) plate.name.textContent = f.name;
      const col = hexStr(f.hero.color);
      plate.name.style.color = col;
      plate.name.style.textShadow = f.powered
        ? '0 0 10px ' + col + ', 0 0 22px ' + col + ', 0 1px 3px #000'
        : '0 0 6px ' + col + ', 0 1px 3px #000';
      plate.name.style.opacity = f.powered ? '1' : '0.92';
      /* powered: highlight the whole tag and light up the hero's trait icon */
      if (plate.powered !== f.powered) {
        plate.powered = f.powered;
        plate.root.classList.toggle('powered', f.powered);
      }
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

    this.traitTick += 1;
    if (this.traitTick % 6 === 0) { this.updateTraits(); this.updateAbilities(); }
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
      html += '<div' + cls + '><span class="dot" style="background:' + hexStr(f.hero.color) + '"></span>' +
        '<span class="bn' + dead + '">' + escapeHtml(f.name) + '</span>' +
        '<span class="bk">' + f.kills + '</span><span class="bd">' + f.deaths + '</span></div>';
    }
    this.el.board.innerHTML = '<div class="bhead"><span class="dot"></span><span class="bn">PLAYER</span><span class="bk">K</span><span class="bd">D</span></div>' + html;
  },
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
