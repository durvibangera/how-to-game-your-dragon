/**
 * DragonBossGame — "Save Toothless"
 *
 * Hiccup rides a dragon to fight the Red Death and save Toothless.
 * 2D canvas-based boss fight game.
 *
 * Controls:
 * - Arrow keys / WASD: Move
 * - Space / Click: Shoot plasma blast
 * - Shift: Barrel roll (dodge)
 */
export class DragonBossGame {
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.running = false;
    this.won = false;

    // Canvas setup
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Game dimensions
    this.width = 0;
    this.height = 0;

    // Timing
    this.elapsed = 0;
    this.lastTime = 0;

    // Input
    this.keys = {};
    this.mouseDown = false;
    this.mousePos = { x: 0, y: 0 };

    // Game state
    this.state = 'intro'; // intro, playing, victory, defeat
    this.introTimer = 0;
    this.stateTimer = 0;

    // Player
    this.player = {
      x: 0, y: 0,
      vx: 0, vy: 0,
      width: 60, height: 40,
      hp: 100, maxHp: 100,
      speed: 280,
      fireRate: 0.25,
      fireCooldown: 0,
      dodgeCooldown: 0,
      dodgeDuration: 0,
      isDodging: false,
      invincibleTimer: 0,
      score: 0,
    };

    // Boss (Red Death)
    this.boss = {
      x: 0, y: 0,
      width: 300, height: 200,
      hp: 800, maxHp: 800,
      phase: 1,
      attackTimer: 2,
      attackPattern: 0,
      moveTimer: 0,
      targetX: 0,
      isAttacking: false,
      attackAnimTimer: 0,
      roarTimer: 8,
      isRoaring: false,
      stunTimer: 0,
      mouthOpen: 0,
      wingAngle: 0,
      eyeGlow: 0,
      shakeAmount: 0,
    };

    // Projectiles
    this.playerProjectiles = [];
    this.bossProjectiles = [];

    // Minions
    this.minions = [];

    // Particles
    this.particles = [];

    // Screen effects
    this.screenShake = 0;
    this.flashAlpha = 0;
    this.flashColor = '#fff';

    // Toothless (captured)
    this.toothless = {
      x: 0, y: 0,
      struggling: 0,
      freed: false,
      freeTimer: 0,
    };

    // Background
    this.clouds = [];
    this.stars = [];

    this._init();
  }

  _init() {
    this._resize();
    this._setupInput();
    this._initBackground();
    this._initPositions();

    this.running = true;
    this.lastTime = performance.now();
    this._gameLoop = this._gameLoop.bind(this);
    requestAnimationFrame(this._gameLoop);
  }

  _resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this._resizeHandler = () => this._resize();
    window.addEventListener('resize', this._resizeHandler);
  }

  _setupInput() {
    this._keyDown = (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === ' ') e.preventDefault();
    };
    this._keyUp = (e) => {
      this.keys[e.key.toLowerCase()] = false;
    };
    this._mouseDown = (e) => {
      this.mouseDown = true;
      this.mousePos = { x: e.clientX, y: e.clientY };
    };
    this._mouseUp = () => { this.mouseDown = false; };
    this._mouseMove = (e) => {
      this.mousePos = { x: e.clientX, y: e.clientY };
    };

    document.addEventListener('keydown', this._keyDown);
    document.addEventListener('keyup', this._keyUp);
    document.addEventListener('mousedown', this._mouseDown);
    document.addEventListener('mouseup', this._mouseUp);
    document.addEventListener('mousemove', this._mouseMove);
  }

  _initBackground() {
    for (let i = 0; i < 15; i++) {
      this.clouds.push({
        x: Math.random() * 2000 - 200,
        y: Math.random() * 400,
        width: 100 + Math.random() * 200,
        height: 30 + Math.random() * 60,
        speed: 10 + Math.random() * 30,
        opacity: 0.1 + Math.random() * 0.3,
      });
    }
    for (let i = 0; i < 50; i++) {
      this.stars.push({
        x: Math.random() * 2000,
        y: Math.random() * 400,
        size: 0.5 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  }

  _initPositions() {
    this.player.x = this.width / 2;
    this.player.y = this.height * 0.75;

    this.boss.x = this.width / 2;
    this.boss.y = this.height * 0.18;
    this.boss.targetX = this.boss.x;

    this.toothless.x = this.width / 2;
    this.toothless.y = this.height * 0.10;
  }

  // ===== GAME LOOP =====

  _gameLoop(now) {
    if (!this.running) return;
    const delta = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.elapsed += delta;

    this._update(delta);
    this._draw();

    requestAnimationFrame(this._gameLoop);
  }

  _update(delta) {
    this.stateTimer += delta;

    switch (this.state) {
      case 'intro': this._updateIntro(delta); break;
      case 'playing': this._updatePlaying(delta); break;
      case 'victory': this._updateVictory(delta); break;
      case 'defeat': this._updateDefeat(delta); break;
    }

    this._updateBackground(delta);
    this._updateParticles(delta);
    this.screenShake *= 0.9;
    this.flashAlpha *= 0.92;
  }

  _updateIntro(delta) {
    this.introTimer += delta;
    if (this.introTimer > 4 || this.keys[' '] || this.keys['enter']) {
      this.state = 'playing';
      this.stateTimer = 0;
    }
  }

  _updatePlaying(delta) {
    this._updatePlayer(delta);
    this._updateBoss(delta);
    this._updateProjectiles(delta);
    this._updateMinions(delta);
    this._checkCollisions();

    if (this.boss.hp <= 0) {
      this.state = 'victory';
      this.stateTimer = 0;
      this.won = true;
      this.screenShake = 20;
      this.flashAlpha = 1;
      this.flashColor = '#ffd700';
      this._spawnVictoryParticles();
    }

    if (this.player.hp <= 0) {
      this.state = 'defeat';
      this.stateTimer = 0;
      this.screenShake = 15;
      this.flashAlpha = 0.8;
      this.flashColor = '#ff0000';
    }
  }

  _updatePlayer(delta) {
    const p = this.player;
    let mx = 0, my = 0;
    if (this.keys['a'] || this.keys['arrowleft']) mx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) mx += 1;
    if (this.keys['w'] || this.keys['arrowup']) my -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) my += 1;
    if (mx !== 0 && my !== 0) { mx *= 0.707; my *= 0.707; }

    const speed = p.isDodging ? p.speed * 2.5 : p.speed;
    p.vx = mx * speed;
    p.vy = my * speed;
    p.x += p.vx * delta;
    p.y += p.vy * delta;
    p.x = Math.max(p.width / 2, Math.min(this.width - p.width / 2, p.x));
    p.y = Math.max(this.height * 0.35, Math.min(this.height - p.height / 2 - 20, p.y));

    // Dodge (barrel roll)
    if ((this.keys['shift'] || this.keys['q']) && p.dodgeCooldown <= 0 && !p.isDodging) {
      p.isDodging = true;
      p.dodgeDuration = 0.3;
      p.dodgeCooldown = 1.5;
      p.invincibleTimer = 0.35;
    }
    if (p.isDodging) {
      p.dodgeDuration -= delta;
      if (p.dodgeDuration <= 0) p.isDodging = false;
    }
    if (p.dodgeCooldown > 0) p.dodgeCooldown -= delta;
    if (p.invincibleTimer > 0) p.invincibleTimer -= delta;

    // Shooting
    p.fireCooldown -= delta;
    if ((this.keys[' '] || this.mouseDown) && p.fireCooldown <= 0) {
      p.fireCooldown = p.fireRate;
      this._playerShoot();
    }
  }

  _playerShoot() {
    const p = this.player;
    this.playerProjectiles.push({
      x: p.x, y: p.y - p.height / 2 - 5,
      vx: 0, vy: -600,
      width: 12, height: 16,
      damage: 15,
      type: 'plasma',
      life: 3,
    });
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: p.x + (Math.random() - 0.5) * 10,
        y: p.y - p.height / 2,
        vx: (Math.random() - 0.5) * 80,
        vy: -100 - Math.random() * 100,
        life: 0.3 + Math.random() * 0.2,
        maxLife: 0.5,
        size: 3 + Math.random() * 4,
        color: '#8844ff',
      });
    }
  }

  _updateBoss(delta) {
    const b = this.boss;
    if (b.stunTimer > 0) { b.stunTimer -= delta; return; }

    const hpPercent = b.hp / b.maxHp;
    if (hpPercent <= 0.33) b.phase = 3;
    else if (hpPercent <= 0.66) b.phase = 2;
    else b.phase = 1;

    // Animation
    b.wingAngle = Math.sin(this.elapsed * 3) * 0.2;
    b.mouthOpen = b.isAttacking ? Math.min(b.mouthOpen + delta * 5, 1) : Math.max(b.mouthOpen - delta * 3, 0);
    b.eyeGlow = 0.5 + Math.sin(this.elapsed * 4) * 0.3;

    // Movement
    b.moveTimer -= delta;
    if (b.moveTimer <= 0) {
      b.targetX = this.width * 0.2 + Math.random() * this.width * 0.6;
      b.moveTimer = 2 + Math.random() * 2;
    }
    const moveSpeed = 100 + b.phase * 40;
    const dx = b.targetX - b.x;
    if (Math.abs(dx) > 5) b.x += Math.sign(dx) * moveSpeed * delta;

    // Attack patterns
    b.attackTimer -= delta;
    if (b.attackTimer <= 0) {
      this._bossAttack();
      const cooldown = b.phase === 3 ? 1 : b.phase === 2 ? 1.5 : 2;
      b.attackTimer = cooldown + Math.random() * cooldown;
    }

    // Phase 2+: summon minions
    if (b.phase >= 2) {
      b.roarTimer -= delta;
      if (b.roarTimer <= 0 && this.minions.length < 4) {
        this._spawnMinion();
        b.roarTimer = 5 + Math.random() * 3;
      }
    }
    b.shakeAmount *= 0.95;
  }

  _bossAttack() {
    const b = this.boss;
    b.isAttacking = true;
    setTimeout(() => { b.isAttacking = false; }, 800);

    const patterns = b.phase === 1 ? [0, 1, 2] : b.phase === 2 ? [0, 1, 2, 3, 4] : [0, 1, 2, 3, 4, 5];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];

    switch (pattern) {
      case 0: this._bossFireBreath(); break;
      case 1: this._bossMeteorShower(); break;
      case 2: this._bossTailSweep(); break;
      case 3: this._bossRoar(); break;
      case 4: this._bossHomingAttack(); break;
      case 5: this._bossFireRing(); break;
    }
  }

  _bossFireBreath() {
    const b = this.boss;
    const angle = Math.atan2(this.player.y - b.y, this.player.x - b.x);
    for (let i = 0; i < 5; i++) {
      const spread = (i - 2) * 0.15;
      const speed = 350 + i * 30;
      setTimeout(() => {
        if (!this.running) return;
        this.bossProjectiles.push({
          x: b.x, y: b.y + b.height / 2,
          vx: Math.cos(angle + spread) * speed,
          vy: Math.sin(angle + spread) * speed,
          width: 16, height: 16,
          damage: 12, type: 'fireball', life: 4,
        });
      }, i * 100);
    }
  }

  _bossMeteorShower() {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        if (!this.running) return;
        this.bossProjectiles.push({
          x: Math.random() * this.width, y: -20,
          vx: (Math.random() - 0.5) * 60,
          vy: 250 + Math.random() * 150,
          width: 14, height: 14,
          damage: 10, type: 'meteor', life: 5,
        });
      }, i * 150);
    }
  }

  _bossTailSweep() {
    const fromLeft = Math.random() > 0.5;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        if (!this.running) return;
        this.bossProjectiles.push({
          x: fromLeft ? -20 : this.width + 20,
          y: this.boss.y + this.boss.height + 50 + i * 40,
          vx: fromLeft ? 400 : -400, vy: 30,
          width: 20, height: 12,
          damage: 15, type: 'sweep', life: 4,
        });
      }, i * 80);
    }
  }

  _bossRoar() {
    this.screenShake = 12;
    this.boss.isRoaring = true;
    this.boss.shakeAmount = 10;
    const savedSpeed = this.player.speed;
    this.player.speed = 140;
    setTimeout(() => {
      this.player.speed = savedSpeed;
      this.boss.isRoaring = false;
    }, 1500);
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      this.particles.push({
        x: this.boss.x, y: this.boss.y + this.boss.height / 2,
        vx: Math.cos(angle) * 200, vy: Math.sin(angle) * 200,
        life: 1, maxLife: 1,
        size: 6 + Math.random() * 4,
        color: '#ff6600',
      });
    }
  }

  _bossHomingAttack() {
    this.bossProjectiles.push({
      x: this.boss.x, y: this.boss.y + this.boss.height / 2,
      vx: 0, vy: 100,
      width: 20, height: 20,
      damage: 18, type: 'homing', life: 5,
      homingStrength: 200, speed: 220,
    });
  }

  _bossFireRing() {
    const count = 12 + this.boss.phase * 4;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      this.bossProjectiles.push({
        x: this.boss.x, y: this.boss.y + this.boss.height / 2,
        vx: Math.cos(angle) * 200, vy: Math.sin(angle) * 200,
        width: 10, height: 10,
        damage: 8, type: 'ring', life: 4,
      });
    }
    this.screenShake = 5;
  }

  _spawnMinion() {
    const side = Math.random() > 0.5;
    this.minions.push({
      x: side ? -30 : this.width + 30,
      y: this.height * 0.3 + Math.random() * this.height * 0.3,
      vx: side ? 80 : -80, vy: 20 + Math.random() * 40,
      width: 40, height: 30,
      hp: 30, maxHp: 30,
      fireCooldown: 2 + Math.random(),
      wingAngle: 0,
    });
  }

  _updateProjectiles(delta) {
    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      const p = this.playerProjectiles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.life -= delta;
      if (p.life <= 0 || p.y < -20 || p.y > this.height + 20 || p.x < -20 || p.x > this.width + 20) {
        this.playerProjectiles.splice(i, 1);
      }
    }
    for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
      const p = this.bossProjectiles[i];
      if (p.type === 'homing') {
        const ddx = this.player.x - p.x;
        const ddy = this.player.y - p.y;
        const dist = Math.hypot(ddx, ddy);
        if (dist > 0) {
          p.vx += (ddx / dist) * p.homingStrength * delta;
          p.vy += (ddy / dist) * p.homingStrength * delta;
          const spd = Math.hypot(p.vx, p.vy);
          if (spd > p.speed) { p.vx = (p.vx / spd) * p.speed; p.vy = (p.vy / spd) * p.speed; }
        }
      }
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.life -= delta;
      if (Math.random() > 0.5) {
        this.particles.push({
          x: p.x + (Math.random() - 0.5) * 6,
          y: p.y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30,
          life: 0.3 + Math.random() * 0.3, maxLife: 0.6,
          size: 3 + Math.random() * 4,
          color: p.type === 'homing' ? '#ff00ff' : '#ff4400',
        });
      }
      if (p.life <= 0 || p.y > this.height + 40 || p.y < -40 || p.x < -40 || p.x > this.width + 40) {
        this.bossProjectiles.splice(i, 1);
      }
    }
  }

  _updateMinions(delta) {
    for (let i = this.minions.length - 1; i >= 0; i--) {
      const m = this.minions[i];
      m.x += m.vx * delta;
      m.y += m.vy * delta;
      m.wingAngle = Math.sin(this.elapsed * 6 + i) * 0.3;
      if (m.x < 30 || m.x > this.width - 30) m.vx *= -1;
      if (m.y < this.height * 0.25 || m.y > this.height * 0.6) m.vy *= -1;

      m.fireCooldown -= delta;
      if (m.fireCooldown <= 0) {
        m.fireCooldown = 2 + Math.random();
        const angle = Math.atan2(this.player.y - m.y, this.player.x - m.x);
        this.bossProjectiles.push({
          x: m.x, y: m.y + 10,
          vx: Math.cos(angle) * 200, vy: Math.sin(angle) * 200,
          width: 10, height: 10,
          damage: 6, type: 'minion_fire', life: 4,
        });
      }
      if (m.hp <= 0) {
        this._spawnExplosion(m.x, m.y, '#ff6600', 15);
        this.minions.splice(i, 1);
        this.player.score += 50;
      }
    }
  }

  _checkCollisions() {
    // Player projectiles vs boss
    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      const proj = this.playerProjectiles[i];
      if (this._rectsOverlap(proj, this.boss)) {
        this.boss.hp -= proj.damage;
        this.boss.shakeAmount = 3;
        this._spawnExplosion(proj.x, proj.y, '#8844ff', 8);
        this.playerProjectiles.splice(i, 1);
        this.player.score += 10;
        continue;
      }
      for (let j = this.minions.length - 1; j >= 0; j--) {
        if (this._rectsOverlap(proj, this.minions[j])) {
          this.minions[j].hp -= proj.damage;
          this._spawnExplosion(proj.x, proj.y, '#ff8800', 6);
          this.playerProjectiles.splice(i, 1);
          break;
        }
      }
    }
    // Boss projectiles vs player
    if (this.player.invincibleTimer <= 0) {
      for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
        const proj = this.bossProjectiles[i];
        if (this._rectsOverlap(proj, this.player)) {
          this.player.hp -= proj.damage;
          this.player.invincibleTimer = 0.5;
          this._spawnExplosion(proj.x, proj.y, '#ff0000', 10);
          this.bossProjectiles.splice(i, 1);
          this.screenShake = Math.max(this.screenShake, 5);
          this.flashAlpha = 0.3;
          this.flashColor = '#ff0000';
        }
      }
    }
  }

  _rectsOverlap(a, b) {
    return Math.abs(a.x - b.x) < (a.width + b.width) / 2 &&
           Math.abs(a.y - b.y) < (a.height + b.height) / 2;
  }

  _spawnExplosion(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 0.3 + Math.random() * 0.5, maxLife: 0.8,
        size: 3 + Math.random() * 6, color,
      });
    }
  }

  _spawnVictoryParticles() {
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 300;
      const colors = ['#ffd700', '#ff6600', '#8844ff', '#00ff88', '#ff44aa'];
      this.particles.push({
        x: this.boss.x + (Math.random() - 0.5) * 100,
        y: this.boss.y + (Math.random() - 0.5) * 100,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 1 + Math.random() * 2, maxLife: 3,
        size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  _updateParticles(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.vy += 50 * delta;
      p.life -= delta;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  _updateBackground(delta) {
    for (const c of this.clouds) {
      c.x += c.speed * delta;
      if (c.x > this.width + c.width) {
        c.x = -c.width;
        c.y = Math.random() * this.height * 0.5;
      }
    }
  }

  _updateVictory(delta) {
    this.toothless.freed = true;
    this.toothless.freeTimer += delta;
    if (this.stateTimer > 6 || (this.stateTimer > 3 && (this.keys[' '] || this.keys['enter']))) {
      this._endGame(true);
    }
  }

  _updateDefeat(delta) {
    if (this.stateTimer > 4 || (this.stateTimer > 2 && (this.keys[' '] || this.keys['enter']))) {
      this._endGame(false);
    }
  }

  // ===== DRAWING =====

  _draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    ctx.save();

    if (this.screenShake > 0.5) {
      ctx.translate((Math.random() - 0.5) * this.screenShake, (Math.random() - 0.5) * this.screenShake);
    }

    this._drawBackground(ctx, w, h);

    switch (this.state) {
      case 'intro': this._drawIntro(ctx, w, h); break;
      case 'playing':
      case 'victory':
      case 'defeat':
        this._drawGame(ctx, w, h); break;
    }

    if (this.flashAlpha > 0.01) {
      ctx.globalAlpha = this.flashAlpha;
      ctx.fillStyle = this.flashColor;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  _drawBackground(ctx, w, h) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#0a0015');
    skyGrad.addColorStop(0.3, '#1a0a2e');
    skyGrad.addColorStop(0.6, '#2a1520');
    skyGrad.addColorStop(0.85, '#3a1a10');
    skyGrad.addColorStop(1, '#1a0800');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    this.stars.forEach(s => {
      const twinkle = 0.3 + Math.sin(this.elapsed * 2 + s.twinkle) * 0.4;
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x % w, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Clouds
    this.clouds.forEach(c => {
      ctx.globalAlpha = c.opacity;
      ctx.fillStyle = '#2a1525';
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.width / 2, c.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Volcanic island
    ctx.fillStyle = '#0a0505';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.88);
    ctx.quadraticCurveTo(w * 0.15, h * 0.82, w * 0.3, h * 0.85);
    ctx.quadraticCurveTo(w * 0.4, h * 0.78, w * 0.5, h * 0.82);
    ctx.quadraticCurveTo(w * 0.6, h * 0.76, w * 0.7, h * 0.84);
    ctx.quadraticCurveTo(w * 0.85, h * 0.8, w, h * 0.87);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Lava glow
    const lavaGrad = ctx.createLinearGradient(0, h * 0.85, 0, h);
    lavaGrad.addColorStop(0, 'rgba(255,60,0,0)');
    lavaGrad.addColorStop(0.5, 'rgba(255,80,20,0.1)');
    lavaGrad.addColorStop(1, 'rgba(255,40,0,0.2)');
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, h * 0.85, w, h * 0.15);
  }

  _drawIntro(ctx, w, h) {
    this._drawBossShape(ctx, this.boss.x, this.boss.y, 0.5);
    this._drawToothless(ctx);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const alpha = Math.min(this.introTimer / 1.5, 1);
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 48px Georgia, serif';
    ctx.fillStyle = '#ff6600';
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 20;
    ctx.fillText('SAVE TOOTHLESS', w / 2, h * 0.4);

    if (this.introTimer > 1) {
      ctx.globalAlpha = Math.min((this.introTimer - 1) / 1, 1);
      ctx.font = '24px Georgia, serif';
      ctx.fillStyle = '#ffcc88';
      ctx.shadowBlur = 10;
      ctx.fillText('The Red Death has captured your dragon!', w / 2, h * 0.48);
    }
    if (this.introTimer > 2) {
      ctx.globalAlpha = Math.min((this.introTimer - 2) / 1, 1);
      ctx.font = '20px Georgia, serif';
      ctx.fillStyle = '#aaaacc';
      ctx.shadowBlur = 5;
      ctx.fillText('Arrow Keys: Move  |  Space: Shoot  |  Shift: Dodge', w / 2, h * 0.55);
    }
    if (this.introTimer > 2.5 && Math.sin(this.elapsed * 4) > 0) {
      ctx.globalAlpha = 0.8;
      ctx.font = '22px Georgia, serif';
      ctx.fillStyle = '#ffd700';
      ctx.fillText('Press SPACE to begin', w / 2, h * 0.63);
    }
    ctx.restore();
  }

  _drawGame(ctx, w, h) {
    this._drawToothless(ctx);
    if (this.state !== 'victory' || this.stateTimer < 1) this._drawBoss(ctx);
    this._drawMinions(ctx);
    this._drawProjectiles(ctx);
    this._drawPlayer(ctx);
    this._drawParticles(ctx);
    this._drawHUD(ctx, w, h);
    if (this.state === 'victory') this._drawVictory(ctx, w, h);
    else if (this.state === 'defeat') this._drawDefeat(ctx, w, h);
  }

  _drawBoss(ctx) {
    const b = this.boss;
    ctx.save();
    const shakeX = b.shakeAmount > 0 ? (Math.random() - 0.5) * b.shakeAmount : 0;
    const shakeY = b.shakeAmount > 0 ? (Math.random() - 0.5) * b.shakeAmount : 0;
    ctx.translate(b.x + shakeX, b.y + shakeY);

    let bodyColor, accentColor;
    if (b.phase === 3) { bodyColor = '#4a0808'; accentColor = '#ff2200'; }
    else if (b.phase === 2) { bodyColor = '#3a1010'; accentColor = '#ff4400'; }
    else { bodyColor = '#2a1515'; accentColor = '#ff6600'; }

    this._drawBossShape(ctx, 0, 0, 1, bodyColor, accentColor);
    ctx.restore();
  }

  _drawBossShape(ctx, cx, cy, scale, bodyColor = '#2a1515', accentColor = '#ff6600') {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    const b = this.boss;
    const wingSpread = 160 + Math.sin(this.elapsed * 2) * 20;

    // Left wing
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-30, -20);
    ctx.quadraticCurveTo(-wingSpread, -80 + b.wingAngle * 40, -wingSpread * 0.8, 20);
    ctx.quadraticCurveTo(-wingSpread * 0.5, 40, -20, 30);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(100,30,20,0.5)';
    ctx.beginPath();
    ctx.moveTo(-30, -10);
    ctx.quadraticCurveTo(-wingSpread * 0.6, -40, -wingSpread * 0.6, 10);
    ctx.quadraticCurveTo(-wingSpread * 0.3, 30, -20, 20);
    ctx.closePath();
    ctx.fill();

    // Right wing
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(30, -20);
    ctx.quadraticCurveTo(wingSpread, -80 + b.wingAngle * 40, wingSpread * 0.8, 20);
    ctx.quadraticCurveTo(wingSpread * 0.5, 40, 20, 30);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(100,30,20,0.5)';
    ctx.beginPath();
    ctx.moveTo(30, -10);
    ctx.quadraticCurveTo(wingSpread * 0.6, -40, wingSpread * 0.6, 10);
    ctx.quadraticCurveTo(wingSpread * 0.3, 30, 20, 20);
    ctx.closePath();
    ctx.fill();

    // Body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(0, 20, 50, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(80,40,30,0.6)';
    ctx.beginPath();
    ctx.ellipse(0, 35, 30, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck + Head
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-20, -30);
    ctx.quadraticCurveTo(-15, -60, 0, -70);
    ctx.quadraticCurveTo(15, -60, 20, -30);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -75, 30, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.fillStyle = '#1a0808';
    ctx.beginPath(); ctx.moveTo(-15, -95); ctx.lineTo(-25, -120); ctx.lineTo(-10, -90); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(15, -95); ctx.lineTo(25, -120); ctx.lineTo(10, -90); ctx.closePath(); ctx.fill();

    // Eyes
    ctx.fillStyle = accentColor;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10 * b.eyeGlow;
    ctx.beginPath(); ctx.ellipse(-12, -78, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -78, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(-12, -78, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, -78, 2, 3, 0, 0, Math.PI * 2); ctx.fill();

    // Mouth (fire)
    const mouthOpen = b.mouthOpen || 0;
    if (mouthOpen > 0) {
      ctx.fillStyle = '#ff2200';
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.ellipse(0, -58 + mouthOpen * 8, 15, 5 + mouthOpen * 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,100,0,0.4)';
      ctx.beginPath(); ctx.ellipse(0, -45 + mouthOpen * 15, 10 + mouthOpen * 5, 3 + mouthOpen * 20, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ddd';
    for (let i = -2; i <= 2; i++) ctx.fillRect(-12 + i * 6, -63, 3, 5 + mouthOpen * 3);

    // Tail
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, 85);
    ctx.quadraticCurveTo(40 + Math.sin(this.elapsed * 2) * 20, 110, 60 + Math.sin(this.elapsed * 2.5) * 30, 100);
    ctx.stroke();

    // Spines
    ctx.fillStyle = '#1a0808';
    for (let i = 0; i < 5; i++) {
      const sy = -85 + i * 12;
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(-4, sy + 8); ctx.lineTo(4, sy + 8); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  _drawToothless(ctx) {
    const t = this.toothless;
    const freed = this.state === 'victory' && this.stateTimer > 0.5;
    ctx.save();

    if (freed) {
      const angle = this.stateTimer * 2;
      const radius = 50 + this.stateTimer * 20;
      t.x = this.width / 2 + Math.cos(angle) * radius;
      t.y = this.height * 0.3 + Math.sin(angle * 0.5) * 30 - this.stateTimer * 15;
    }
    ctx.translate(t.x, t.y);
    ctx.translate(freed ? 0 : Math.sin(this.elapsed * 5) * 3, 0);

    const scale = freed ? 1.2 : 0.8;
    ctx.scale(scale, scale);
    const wingFlap = freed ? Math.sin(this.elapsed * 8) * 0.4 : Math.sin(this.elapsed * 3) * 0.1;

    // Wings
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.moveTo(-8, -5); ctx.quadraticCurveTo(-35, -25 + wingFlap * 20, -30, 5); ctx.quadraticCurveTo(-20, 10, -8, 5); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(8, -5); ctx.quadraticCurveTo(35, -25 + wingFlap * 20, 30, 5); ctx.quadraticCurveTo(20, 10, 8, 5); ctx.closePath(); ctx.fill();

    // Body
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath(); ctx.ellipse(0, 0, 12, 18, 0, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.ellipse(0, -20, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
    // Ear fins
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath(); ctx.moveTo(-6, -26); ctx.lineTo(-12, -35); ctx.lineTo(-4, -24); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(6, -26); ctx.lineTo(12, -35); ctx.lineTo(4, -24); ctx.closePath(); ctx.fill();

    // Green eyes
    ctx.fillStyle = freed ? '#44ff44' : '#228822';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = freed ? 8 : 3;
    ctx.beginPath(); ctx.ellipse(-4, -21, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, -21, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(-4, -21, 1.2, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, -21, 1.2, 1.5, 0, 0, Math.PI * 2); ctx.fill();

    // Chains if not freed
    if (!freed) {
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 2]);
      ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(-25, 15); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(25, 15); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Tail + fin
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 15); ctx.quadraticCurveTo(10 + Math.sin(this.elapsed * 3) * 5, 25, 15 + Math.sin(this.elapsed * 2) * 8, 22); ctx.stroke();
    ctx.fillStyle = freed ? '#1a1a1a' : '#882222';
    ctx.beginPath();
    const tx = 15 + Math.sin(this.elapsed * 2) * 8;
    ctx.moveTo(tx, 22); ctx.lineTo(tx + 5, 16); ctx.lineTo(tx + 7, 25); ctx.closePath(); ctx.fill();

    ctx.restore();
  }

  _drawPlayer(ctx) {
    const p = this.player;
    ctx.save();
    ctx.translate(p.x, p.y);
    if (p.isDodging) { ctx.rotate(Math.sin(p.dodgeDuration * 20) * Math.PI); ctx.globalAlpha = 0.6; }
    if (p.invincibleTimer > 0) ctx.globalAlpha = 0.5 + Math.sin(this.elapsed * 20) * 0.3;

    const wingFlap = Math.sin(this.elapsed * 8) * 0.3;

    // Wings
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath(); ctx.moveTo(-10, -5); ctx.quadraticCurveTo(-40, -20 + wingFlap * 25, -35, 8); ctx.quadraticCurveTo(-20, 12, -10, 5); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10, -5); ctx.quadraticCurveTo(40, -20 + wingFlap * 25, 35, 8); ctx.quadraticCurveTo(20, 12, 10, 5); ctx.closePath(); ctx.fill();

    // Body
    ctx.fillStyle = '#111122';
    ctx.beginPath(); ctx.ellipse(0, 0, 15, 20, 0, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath(); ctx.ellipse(0, -22, 11, 9, 0, 0, Math.PI * 2); ctx.fill();
    // Green eyes
    ctx.fillStyle = '#44ff66';
    ctx.shadowColor = '#00ff44';
    ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.ellipse(-4, -23, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(4, -23, 3, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    // Hiccup (rider)
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath(); ctx.ellipse(0, -12, 5, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c4956a';
    ctx.beginPath(); ctx.arc(0, -22, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4a3a2a';
    ctx.beginPath(); ctx.arc(0, -24, 4.5, Math.PI, Math.PI * 2); ctx.fill();
    // Helmet horns
    ctx.fillStyle = '#5a4a3a';
    ctx.beginPath(); ctx.moveTo(-4, -26); ctx.lineTo(-7, -32); ctx.lineTo(-3, -27); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(4, -26); ctx.lineTo(7, -32); ctx.lineTo(3, -27); ctx.closePath(); ctx.fill();

    // Tail + prosthetic fin
    ctx.strokeStyle = '#111122';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 18); ctx.quadraticCurveTo(8, 28, 12, 25); ctx.stroke();
    ctx.fillStyle = '#882222';
    ctx.beginPath(); ctx.moveTo(12, 25); ctx.lineTo(18, 20); ctx.lineTo(18, 30); ctx.closePath(); ctx.fill();

    // Plasma ready glow
    if (p.fireCooldown <= 0) {
      ctx.fillStyle = 'rgba(100,50,255,0.3)';
      ctx.beginPath(); ctx.arc(0, -30, 8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  _drawMinions(ctx) {
    this.minions.forEach((m, i) => {
      ctx.save();
      ctx.translate(m.x, m.y);
      const wing = Math.sin(this.elapsed * 6 + i) * 0.3;

      ctx.fillStyle = '#3a2020';
      ctx.beginPath(); ctx.moveTo(-5, -3); ctx.quadraticCurveTo(-22, -12 + wing * 15, -18, 5); ctx.quadraticCurveTo(-12, 8, -5, 3); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(5, -3); ctx.quadraticCurveTo(22, -12 + wing * 15, 18, 5); ctx.quadraticCurveTo(12, 8, 5, 3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2a1515';
      ctx.beginPath(); ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ff4400';
      ctx.shadowColor = '#ff2200'; ctx.shadowBlur = 5;
      ctx.beginPath(); ctx.arc(-3, -6, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(3, -6, 2, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // HP bar
      const hpP = m.hp / m.maxHp;
      ctx.fillStyle = '#333';
      ctx.fillRect(-12, -18, 24, 3);
      ctx.fillStyle = hpP > 0.5 ? '#44ff44' : '#ff4444';
      ctx.fillRect(-12, -18, 24 * hpP, 3);
      ctx.restore();
    });
  }

  _drawProjectiles(ctx) {
    // Player plasma blasts
    this.playerProjectiles.forEach(p => {
      ctx.save(); ctx.translate(p.x, p.y);
      ctx.fillStyle = 'rgba(100,50,255,0.3)';
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8844ff';
      ctx.shadowColor = '#6622ff'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ccaaff';
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    });
    // Boss fireballs
    this.bossProjectiles.forEach(p => {
      ctx.save(); ctx.translate(p.x, p.y);
      let color, glow, size;
      switch (p.type) {
        case 'homing': color = '#ff00ff'; glow = 'rgba(255,0,255,0.3)'; size = 10; break;
        case 'meteor': color = '#ff6600'; glow = 'rgba(255,100,0,0.3)'; size = 8; break;
        case 'sweep': color = '#ff4400'; glow = 'rgba(255,68,0,0.3)'; size = 10; break;
        case 'ring': color = '#ff8800'; glow = 'rgba(255,136,0,0.3)'; size = 6; break;
        default: color = '#ff4400'; glow = 'rgba(255,68,0,0.3)'; size = 8;
      }
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(0, 0, size * 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color;
      ctx.shadowColor = color; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffdd44';
      ctx.beginPath(); ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    });
  }

  _drawParticles(ctx) {
    this.particles.forEach(p => {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  _drawHUD(ctx, w, h) {
    // Player HP bar
    const barW = 200, barH = 16, barX = 20, barY = h - 40;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    const hpP = Math.max(0, this.player.hp / this.player.maxHp);
    ctx.fillStyle = hpP > 0.5 ? '#44ff44' : hpP > 0.25 ? '#ffaa00' : '#ff2222';
    ctx.fillRect(barX, barY, barW * hpP, barH);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'left';
    ctx.fillText(`HP: ${Math.ceil(this.player.hp)}/${this.player.maxHp}`, barX + 5, barY + 12);
    ctx.font = '11px monospace'; ctx.fillStyle = '#88ff88';
    ctx.fillText('HICCUP & DRAGON', barX, barY - 6);

    // Boss HP bar
    if (this.state === 'playing') {
      const bossW = w * 0.5, bossX = (w - bossW) / 2, bossY = 20;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(bossX - 2, bossY - 2, bossW + 4, barH + 8);
      ctx.fillStyle = '#ff6600'; ctx.font = 'bold 14px Georgia, serif'; ctx.textAlign = 'center';
      const phaseText = this.boss.phase === 3 ? ' — ENRAGED' : this.boss.phase === 2 ? ' — FURIOUS' : '';
      ctx.fillText(`THE RED DEATH${phaseText}`, w / 2, bossY + 3);
      ctx.fillStyle = '#333';
      ctx.fillRect(bossX, bossY + 8, bossW, barH);
      const bossHpP = Math.max(0, this.boss.hp / this.boss.maxHp);
      ctx.fillStyle = this.boss.phase === 3 ? '#ff2222' : this.boss.phase === 2 ? '#ff6600' : '#ff8844';
      ctx.fillRect(bossX, bossY + 8, bossW * bossHpP, barH);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace';
      ctx.fillText(`${Math.ceil(this.boss.hp)}/${this.boss.maxHp}`, w / 2, bossY + 20);
      if (this.boss.phase >= 2) {
        ctx.fillStyle = this.boss.phase === 3 ? '#ff0000' : '#ff6600';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`PHASE ${this.boss.phase}`, w / 2, bossY + 38);
      }
    }

    // Dodge cooldown
    const dodgeReady = this.player.dodgeCooldown <= 0;
    ctx.fillStyle = dodgeReady ? '#44ff88' : '#666';
    ctx.font = '11px monospace'; ctx.textAlign = 'right';
    ctx.fillText(dodgeReady ? 'DODGE: READY' : `DODGE: ${this.player.dodgeCooldown.toFixed(1)}s`, w - 20, h - 26);
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 14px monospace';
    ctx.fillText(`SCORE: ${this.player.score}`, w - 20, h - 8);
  }

  _drawVictory(ctx, w, h) {
    const alpha = Math.min(this.stateTimer / 2, 0.7);
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(0, 0, w, h);

    if (this.stateTimer > 1) {
      ctx.globalAlpha = Math.min((this.stateTimer - 1) / 1.5, 1);
      ctx.textAlign = 'center';
      ctx.font = 'bold 56px Georgia, serif';
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 30;
      ctx.fillText('TOOTHLESS IS FREE!', w / 2, h * 0.4);
      ctx.font = '28px Georgia, serif';
      ctx.fillStyle = '#88ff88';
      ctx.shadowColor = '#44ff44'; ctx.shadowBlur = 15;
      ctx.fillText('You defeated the Red Death!', w / 2, h * 0.5);
      ctx.font = '20px Georgia, serif';
      ctx.fillStyle = '#aaaacc'; ctx.shadowBlur = 0;
      ctx.fillText(`Score: ${this.player.score}`, w / 2, h * 0.58);
      if (this.stateTimer > 3 && Math.sin(this.elapsed * 3) > 0) {
        ctx.font = '22px Georgia, serif'; ctx.fillStyle = '#ffcc88';
        ctx.fillText('Press SPACE to continue', w / 2, h * 0.68);
      }
      ctx.globalAlpha = 1;
    }
  }

  _drawDefeat(ctx, w, h) {
    const alpha = Math.min(this.stateTimer / 2, 0.8);
    ctx.fillStyle = `rgba(20,0,0,${alpha})`;
    ctx.fillRect(0, 0, w, h);

    if (this.stateTimer > 1) {
      ctx.globalAlpha = Math.min((this.stateTimer - 1) / 1.5, 1);
      ctx.textAlign = 'center';
      ctx.font = 'bold 48px Georgia, serif';
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 20;
      ctx.fillText('DEFEATED', w / 2, h * 0.4);
      ctx.font = '24px Georgia, serif';
      ctx.fillStyle = '#ffcc88'; ctx.shadowBlur = 0;
      ctx.fillText('Toothless still needs you...', w / 2, h * 0.5);
      if (this.stateTimer > 2 && Math.sin(this.elapsed * 3) > 0) {
        ctx.font = '20px Georgia, serif'; ctx.fillStyle = '#aaaacc';
        ctx.fillText('Press SPACE to try again', w / 2, h * 0.6);
      }
      ctx.globalAlpha = 1;
    }
  }

  _endGame(won) {
    this.running = false;
    this.won = won;
    document.removeEventListener('keydown', this._keyDown);
    document.removeEventListener('keyup', this._keyUp);
    document.removeEventListener('mousedown', this._mouseDown);
    document.removeEventListener('mouseup', this._mouseUp);
    document.removeEventListener('mousemove', this._mouseMove);
    window.removeEventListener('resize', this._resizeHandler);
    setTimeout(() => {
      if (this.canvas && this.canvas.parentNode) this.canvas.remove();
      if (this.onComplete) this.onComplete(won);
    }, 500);
  }

  dispose() {
    this.running = false;
    document.removeEventListener('keydown', this._keyDown);
    document.removeEventListener('keyup', this._keyUp);
    document.removeEventListener('mousedown', this._mouseDown);
    document.removeEventListener('mouseup', this._mouseUp);
    document.removeEventListener('mousemove', this._mouseMove);
    window.removeEventListener('resize', this._resizeHandler);
    if (this.canvas && this.canvas.parentNode) this.canvas.remove();
  }
}
