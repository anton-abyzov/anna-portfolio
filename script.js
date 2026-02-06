// ============================================
// Anna Abyzova — Portfolio Script
// ============================================

(function() {
    'use strict';

    // ============================================
    // Birthday Detection (Feb 5, 6, 7)
    // ============================================
    const BIRTHDAY_MONTH = 1; // February (0-indexed)
    const BIRTHDAY_RANGE = [5, 6, 7]; // Active days

    function isBirthdayPeriod() {
        const now = new Date();
        return now.getMonth() === BIRTHDAY_MONTH && BIRTHDAY_RANGE.includes(now.getDate());
    }

    // ============================================
    // Birthday Audio — Web Audio API
    // ============================================
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    }

    function playNote(ctx, freq, startTime, duration, volume, type) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume || 0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    function playOpenChime() {
        try {
            const ctx = getAudioContext();
            const t = ctx.currentTime;
            playNote(ctx, 523.25, t, 0.5, 0.1, 'sine');
            playNote(ctx, 659.25, t + 0.12, 0.5, 0.1, 'sine');
            playNote(ctx, 783.99, t + 0.24, 0.5, 0.1, 'sine');
            playNote(ctx, 1046.5, t + 0.36, 0.8, 0.12, 'sine');
            playNote(ctx, 523.25, t + 0.1, 1.2, 0.04, 'triangle');
            playNote(ctx, 659.25, t + 0.1, 1.2, 0.04, 'triangle');
            playNote(ctx, 783.99, t + 0.1, 1.2, 0.04, 'triangle');
        } catch (e) {}
    }

    function playCelebrationMelody() {
        try {
            const ctx = getAudioContext();
            const t = ctx.currentTime;
            const melody = [
                [261.63, 0.25], [261.63, 0.25], [293.66, 0.5], [261.63, 0.5],
                [349.23, 0.5], [329.63, 1.0],
                [261.63, 0.25], [261.63, 0.25], [293.66, 0.5], [261.63, 0.5],
                [392.00, 0.5], [349.23, 1.0]
            ];
            let offset = 0;
            melody.forEach(function(note) {
                playNote(ctx, note[0], t + offset, note[1] * 0.9, 0.1, 'sine');
                playNote(ctx, note[0] * 1.5, t + offset, note[1] * 0.9, 0.03, 'triangle');
                offset += note[1] * 0.45;
            });
            playNote(ctx, 261.63, t + offset, 2, 0.06, 'triangle');
            playNote(ctx, 329.63, t + offset, 2, 0.06, 'triangle');
            playNote(ctx, 392.00, t + offset, 2, 0.06, 'triangle');
        } catch (e) {}
    }

    // ============================================
    // Birthday Space Game — "Cosmic Birthday Rescue"
    // ============================================
    class SpaceBirthdayGame {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.w = 0;
            this.h = 0;

            this.state = 'IDLE';
            this.frame = 0;
            this.sf = 0;
            this.running = false;
            this.shakeFrames = 0;

            this.ship = { x: 0, y: 0, trail: [] };
            this.bgStars = [];
            this.items = [];
            this.particles = [];

            this.score = 0;
            this.maxScore = 25;
            this.lives = 3;
            this.spawnTimer = 0;

            this.beamY = 0;
            this.motherX = 0;
            this.motherHit = false;

            this.inputX = 0;
            this.onVictory = null;

            this._resize = this._resize.bind(this);
            this._onMouse = this._onMouse.bind(this);
            this._onTouch = this._onTouch.bind(this);
            this._onTouchStart = this._onTouchStart.bind(this);
        }

        _resize() {
            const dpr = window.devicePixelRatio || 1;
            this.w = window.innerWidth;
            this.h = window.innerHeight;
            this.canvas.width = this.w * dpr;
            this.canvas.height = this.h * dpr;
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        _onMouse(e) { this.inputX = e.clientX; }
        _onTouch(e) { e.preventDefault(); this.inputX = e.touches[0].clientX; }
        _onTouchStart(e) { this.inputX = e.touches[0].clientX; }

        start() {
            if (this.running) this.stop();

            this._resize();
            window.addEventListener('resize', this._resize);
            window.addEventListener('mousemove', this._onMouse);
            window.addEventListener('touchmove', this._onTouch, { passive: false });
            window.addEventListener('touchstart', this._onTouchStart);

            this.state = 'INTRO';
            this.frame = 0;
            this.sf = 0;
            this.score = 0;
            this.lives = 3;
            this.items = [];
            this.particles = [];
            this.ship.trail = [];
            this.spawnTimer = 0;
            this.beamY = 0;
            this.motherHit = false;
            this.shakeFrames = 0;

            this.bgStars = [];
            for (let i = 0; i < 150; i++) {
                this.bgStars.push({
                    x: Math.random() * this.w,
                    y: Math.random() * this.h,
                    s: Math.random() * 1.8 + 0.4,
                    sp: Math.random() * 0.3 + 0.1,
                    tw: Math.random() * 6.28
                });
            }

            this.ship.x = this.w / 2;
            this.ship.y = this.h * 0.82;
            this.inputX = this.w / 2;
            this.motherX = this.w / 2;

            this.running = true;
            this._loop();
        }

        stop() {
            this.running = false;
            window.removeEventListener('resize', this._resize);
            window.removeEventListener('mousemove', this._onMouse);
            window.removeEventListener('touchmove', this._onTouch);
            window.removeEventListener('touchstart', this._onTouchStart);
        }

        _loop() {
            if (!this.running) return;
            this.frame++;
            this.sf++;
            this._update();
            this._render();
            requestAnimationFrame(() => this._loop());
        }

        // ============ UPDATE ============

        _update() {
            for (let i = 0; i < this.bgStars.length; i++) {
                const s = this.bgStars[i];
                s.y += s.sp;
                if (s.y > this.h) { s.y = -2; s.x = Math.random() * this.w; }
            }

            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx; p.y += p.vy;
                p.vy += p.g || 0;
                p.life -= p.d;
                if (p.rot !== undefined) p.rot += p.rs || 0;
                if (p.life <= 0) this.particles.splice(i, 1);
            }

            if (this.shakeFrames > 0) this.shakeFrames--;

            if (this.state === 'INTRO') this._uIntro();
            else if (this.state === 'PLAYING') this._uPlaying();
            else if (this.state === 'BEAM') this._uBeam();
            else if (this.state === 'VICTORY') this._uVictory();
        }

        _uIntro() {
            if (this.sf >= 300) { this.state = 'PLAYING'; this.sf = 0; }
        }

        _uPlaying() {
            this.ship.x += (this.inputX - this.ship.x) * 0.12;
            this.ship.x = Math.max(24, Math.min(this.w - 24, this.ship.x));

            if (this.frame % 2 === 0) {
                this.ship.trail.push({ x: this.ship.x, y: this.ship.y + 20, l: 1 });
                if (this.ship.trail.length > 10) this.ship.trail.shift();
            }
            for (let i = 0; i < this.ship.trail.length; i++) this.ship.trail[i].l -= 0.1;

            this.spawnTimer++;
            const rate = Math.max(18, 38 - this.sf / 45);
            if (this.spawnTimer >= rate) {
                this.spawnTimer = 0;
                this._spawn();
            }

            for (let i = this.items.length - 1; i >= 0; i--) {
                const it = this.items[i];
                it.y += it.sp;
                it.x += it.dr;
                it.rot += it.rs;

                if (it.y > this.h + 40) { this.items.splice(i, 1); continue; }

                const dx = it.x - this.ship.x, dy = it.y - this.ship.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (it.type === 'a') {
                    if (dist < 28) {
                        this.lives--;
                        this.items.splice(i, 1);
                        this._burst(it.x, it.y, '#ff4444', 10);
                        this._burst(this.ship.x, this.ship.y, '#ffffff', 5);
                        this.shakeFrames = 10;
                        this._sndHit();
                        if (this.lives <= 0) { this.lives = 3; this.score = Math.max(0, this.score - 5); }
                    }
                } else if (dist < 42) {
                    this.score = Math.min(this.maxScore, this.score + it.pts);
                    this.items.splice(i, 1);
                    this._burst(it.x, it.y, it.col, 8);
                    this._sndCollect();
                    if (this.score >= this.maxScore) {
                        this.state = 'BEAM';
                        this.sf = 0;
                        this.items = [];
                        this.beamY = this.ship.y;
                        break;
                    }
                }
            }
        }

        _spawn() {
            const r = Math.random();
            let t, sp, sz, col, pts;
            if (r < 0.28) { t = 'a'; sp = 1.5 + Math.random() * 1.5; sz = 14 + Math.random() * 10; col = '#8b7d7b'; pts = 0; }
            else if (r < 0.65) { t = 's'; sp = 1 + Math.random(); sz = 10 + Math.random() * 4; col = '#ffd700'; pts = 1; }
            else if (r < 0.88) { t = 'g'; sp = 0.8 + Math.random() * 0.8; sz = 16 + Math.random() * 4; col = '#ff69b4'; pts = 3; }
            else { t = 'u'; sp = 1.5 + Math.random() * 1.5; sz = 14; col = '#39ff14'; pts = 5; }

            this.items.push({
                type: t, sp, sz, col, pts,
                x: 30 + Math.random() * (this.w - 60), y: -30,
                dr: (Math.random() - 0.5) * 0.5, rot: 0,
                rs: (Math.random() - 0.5) * 0.03
            });
        }

        _uBeam() {
            this.beamY -= 12;
            for (let i = 0; i < 3; i++) {
                this.particles.push({
                    x: this.ship.x + (Math.random() - 0.5) * 20,
                    y: this.beamY + Math.random() * 40,
                    vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 2,
                    g: 0, life: 1, d: 0.03,
                    sz: 2 + Math.random() * 3,
                    col: Math.random() > 0.5 ? '#ffd700' : '#ff69b4'
                });
            }
            if (this.beamY <= 120 && !this.motherHit) {
                this.motherHit = true;
                this._burst(this.motherX, 80, '#39ff14', 30);
                this._burst(this.motherX, 80, '#ffd700', 20);
                this._burst(this.motherX, 80, '#ff69b4', 15);
                this._sndExplosion();
            }
            if (this.sf >= 120) {
                this.state = 'VICTORY';
                this.sf = 0;
                if (this.onVictory) this.onVictory();
            }
        }

        _uVictory() {
            if (this.sf % 3 === 0 && this.sf < 180) {
                const cols = ['#ffd700', '#ff69b4', '#87ceeb', '#ff4444', '#39ff14', '#dda0dd', '#ffa500', '#fff'];
                for (let i = 0; i < 4; i++) {
                    this.particles.push({
                        x: Math.random() * this.w, y: -10,
                        vx: (Math.random() - 0.5) * 3, vy: Math.random() * 2 + 1,
                        g: 0.02, life: 1, d: 0.007,
                        sz: 3 + Math.random() * 5,
                        col: cols[Math.floor(Math.random() * cols.length)],
                        shape: Math.random() > 0.5 ? 'r' : 'c',
                        rot: 0, rs: (Math.random() - 0.5) * 0.1
                    });
                }
            }
        }

        _burst(x, y, col, n) {
            for (let i = 0; i < n; i++) {
                const a = (6.28 / n) * i + Math.random() * 0.5;
                const v = 1 + Math.random() * 3;
                this.particles.push({
                    x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
                    g: 0.04, life: 1, d: 0.02 + Math.random() * 0.02,
                    sz: 2 + Math.random() * 3, col
                });
            }
        }

        // ============ RENDER ============

        _render() {
            const c = this.ctx, w = this.w, h = this.h;
            c.clearRect(0, 0, w, h);
            c.save();

            if (this.shakeFrames > 0) {
                c.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
            }

            // Background stars
            for (let i = 0; i < this.bgStars.length; i++) {
                const s = this.bgStars[i];
                c.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(this.frame * 0.01 + s.tw));
                c.fillStyle = '#fff';
                c.beginPath();
                c.arc(s.x, s.y, s.s, 0, 6.28);
                c.fill();
            }
            c.globalAlpha = 1;

            if (this.state === 'INTRO') this._rIntro(c, w, h);
            else if (this.state === 'PLAYING') this._rPlaying(c, w, h);
            else if (this.state === 'BEAM') this._rBeam(c, w, h);

            // Particles
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                c.globalAlpha = Math.max(0, p.life);
                c.fillStyle = p.col;
                if (p.shape === 'r') {
                    c.save(); c.translate(p.x, p.y); c.rotate(p.rot || 0);
                    c.fillRect(-p.sz, -p.sz / 2, p.sz * 2, p.sz);
                    c.restore();
                } else {
                    c.beginPath(); c.arc(p.x, p.y, p.sz, 0, 6.28); c.fill();
                }
            }
            c.globalAlpha = 1;
            c.restore();
        }

        _rIntro(c, w, h) {
            const lines = [
                { t: 'INCOMING TRANSMISSION', s: 30, col: '#ff4444', f: 'bold 18px "Space Grotesk",monospace' },
                { t: 'Aliens stole your birthday surprise!', s: 80, col: '#fff', f: '20px "Plus Jakarta Sans",sans-serif' },
                { t: 'Collect stars to charge the rescue beam', s: 140, col: '#ffd700', f: '18px "Plus Jakarta Sans",sans-serif' },
                { t: 'move to navigate', s: 210, col: 'rgba(255,255,255,0.5)', f: '14px "Space Grotesk",sans-serif' }
            ];
            const cy = h * 0.38;
            for (let i = 0; i < lines.length; i++) {
                const ln = lines[i];
                if (this.sf < ln.s) continue;
                const prog = Math.min(1, (this.sf - ln.s) / 20);
                const fade = this.sf > 260 ? Math.max(0, 1 - (this.sf - 260) / 30) : 1;
                c.globalAlpha = prog * fade;
                c.fillStyle = ln.col;
                c.font = ln.f;
                c.textAlign = 'center';
                c.fillText(ln.t, w / 2, cy + i * 42);
            }
            c.globalAlpha = 1;
            c.textAlign = 'left';

            if (this.sf > 230) {
                c.globalAlpha = Math.min(1, (this.sf - 230) / 40);
                this._dShip(c, this.ship.x, this.ship.y);
                c.globalAlpha = 1;
            }
        }

        _rPlaying(c, w, h) {
            // Engine trail
            for (let i = 0; i < this.ship.trail.length; i++) {
                const t = this.ship.trail[i];
                if (t.l <= 0) continue;
                c.globalAlpha = t.l * 0.3;
                c.fillStyle = '#ffa500';
                c.beginPath();
                c.arc(t.x, t.y, 3 * t.l, 0, 6.28);
                c.fill();
            }
            c.globalAlpha = 1;

            this._dShip(c, this.ship.x, this.ship.y);

            // Items
            for (let i = 0; i < this.items.length; i++) {
                const it = this.items[i];
                c.save(); c.translate(it.x, it.y); c.rotate(it.rot);
                if (it.type === 's') this._dStar(c, 0, 0, it.sz, it.col);
                else if (it.type === 'g') this._dGift(c, 0, 0, it.sz);
                else if (it.type === 'a') this._dRock(c, 0, 0, it.sz);
                else if (it.type === 'u') this._dUFO(c, 0, 0, it.sz);
                c.restore();
            }

            this._rHUD(c, w);
        }

        _rBeam(c, w, h) {
            this._dShip(c, this.ship.x, this.ship.y);

            // Beam
            const g = c.createLinearGradient(this.ship.x, this.ship.y, this.ship.x, this.beamY);
            g.addColorStop(0, 'rgba(255,215,0,0.8)');
            g.addColorStop(0.5, 'rgba(255,105,180,0.6)');
            g.addColorStop(1, 'rgba(255,255,255,0.9)');
            c.strokeStyle = g;
            c.lineWidth = 6;
            c.shadowColor = '#ffd700';
            c.shadowBlur = 20;
            c.beginPath();
            c.moveTo(this.ship.x, this.ship.y - 24);
            c.lineTo(this.ship.x, Math.max(0, this.beamY));
            c.stroke();
            c.globalAlpha = 0.3;
            c.lineWidth = 20;
            c.stroke();
            c.globalAlpha = 1;
            c.lineWidth = 1;
            c.shadowBlur = 0;

            if (!this.motherHit) {
                this._dMother(c, this.motherX, 80);
            }

            if (this.sf < 60) {
                c.globalAlpha = Math.min(1, this.sf / 15);
                c.fillStyle = '#ffd700';
                c.font = 'bold 22px "Space Grotesk",monospace';
                c.textAlign = 'center';
                c.shadowColor = '#ffd700';
                c.shadowBlur = 15;
                c.fillText('BIRTHDAY BEAM CHARGED', w / 2, h * 0.45);
                c.shadowBlur = 0;
                c.globalAlpha = 1;
                c.textAlign = 'left';
            }
        }

        _rHUD(c, w) {
            for (let i = 0; i < 3; i++) {
                c.fillStyle = i < this.lives ? '#ff4444' : 'rgba(255,255,255,0.2)';
                c.font = '20px sans-serif';
                c.fillText('\u2665', 20 + i * 28, 30);
            }

            const bw = Math.min(200, w * 0.4), bx = (w - bw) / 2, by = 18, bh = 8;
            const prog = this.score / this.maxScore;

            c.fillStyle = 'rgba(255,255,255,0.15)';
            this._rr(c, bx, by, bw, bh, 4);
            c.fill();

            if (prog > 0) {
                const fg = c.createLinearGradient(bx, 0, bx + bw * prog, 0);
                fg.addColorStop(0, '#ffd700');
                fg.addColorStop(1, '#ff69b4');
                c.fillStyle = fg;
                this._rr(c, bx, by, bw * prog, bh, 4);
                c.fill();
                c.shadowColor = '#ffd700';
                c.shadowBlur = 8;
                c.fill();
                c.shadowBlur = 0;
            }

            c.fillStyle = 'rgba(255,255,255,0.4)';
            c.font = '11px "Space Grotesk",sans-serif';
            c.textAlign = 'center';
            c.fillText('RESCUE BEAM', w / 2, by + bh + 16);
            c.textAlign = 'left';
        }

        _rr(c, x, y, w, h, r) {
            c.beginPath();
            if (c.roundRect) { c.roundRect(x, y, Math.max(0, w), h, r); }
            else {
                const rr = Math.min(r, w / 2, h / 2);
                c.moveTo(x + rr, y);
                c.arcTo(x + w, y, x + w, y + h, rr);
                c.arcTo(x + w, y + h, x, y + h, rr);
                c.arcTo(x, y + h, x, y, rr);
                c.arcTo(x, y, x + w, y, rr);
                c.closePath();
            }
        }

        // ============ ENTITIES ============

        _dShip(c, x, y) {
            c.save();
            c.translate(x, y);

            // Engine glow
            const eg = c.createRadialGradient(0, 20, 0, 0, 20, 15);
            eg.addColorStop(0, 'rgba(255,150,50,0.6)');
            eg.addColorStop(0.5, 'rgba(255,100,50,0.2)');
            eg.addColorStop(1, 'transparent');
            c.fillStyle = eg;
            c.fillRect(-15, 12, 30, 30);

            // Engine flame flicker
            const flameH = 8 + Math.sin(this.frame * 0.3) * 4;
            const fg = c.createLinearGradient(0, 14, 0, 14 + flameH);
            fg.addColorStop(0, 'rgba(255,200,50,0.8)');
            fg.addColorStop(0.5, 'rgba(255,100,20,0.5)');
            fg.addColorStop(1, 'transparent');
            c.fillStyle = fg;
            c.beginPath();
            c.moveTo(-5, 14);
            c.lineTo(5, 14);
            c.lineTo(1, 14 + flameH);
            c.lineTo(-1, 14 + flameH);
            c.closePath();
            c.fill();

            // Body
            c.beginPath();
            c.moveTo(0, -22);
            c.lineTo(-16, 18);
            c.lineTo(-6, 12);
            c.lineTo(6, 12);
            c.lineTo(16, 18);
            c.closePath();
            const bg = c.createLinearGradient(0, -22, 0, 18);
            bg.addColorStop(0, '#e0e0ff');
            bg.addColorStop(0.5, '#8888cc');
            bg.addColorStop(1, '#5555aa');
            c.fillStyle = bg;
            c.fill();
            c.strokeStyle = 'rgba(255,255,255,0.3)';
            c.lineWidth = 0.5;
            c.stroke();

            // Cockpit
            c.beginPath();
            c.ellipse(0, -4, 5, 8, 0, 0, 6.28);
            const cg = c.createRadialGradient(0, -6, 0, 0, -4, 6);
            cg.addColorStop(0, '#aaddff');
            cg.addColorStop(1, '#4488cc');
            c.fillStyle = cg;
            c.fill();

            // Birthday hat
            c.beginPath();
            c.moveTo(0, -34);
            c.lineTo(-6, -22);
            c.lineTo(6, -22);
            c.closePath();
            const hg = c.createLinearGradient(0, -34, 0, -22);
            hg.addColorStop(0, '#ff3399');
            hg.addColorStop(1, '#ff69b4');
            c.fillStyle = hg;
            c.fill();

            // Pom-pom
            c.beginPath();
            c.arc(0, -35, 3, 0, 6.28);
            c.fillStyle = '#ffd700';
            c.fill();
            c.shadowColor = '#ffd700';
            c.shadowBlur = 6;
            c.fill();
            c.shadowBlur = 0;

            c.restore();
        }

        _dStar(c, x, y, sz, col) {
            c.save();
            c.shadowColor = col;
            c.shadowBlur = 10;
            c.fillStyle = col;
            c.beginPath();
            for (let i = 0; i < 5; i++) {
                const a = (i * 4 * Math.PI / 5) - Math.PI / 2;
                const px = x + Math.cos(a) * sz;
                const py = y + Math.sin(a) * sz;
                if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
            }
            c.closePath();
            c.fill();
            c.shadowBlur = 0;
            c.restore();
        }

        _dGift(c, x, y, sz) {
            c.save();
            c.shadowColor = '#ff69b4';
            c.shadowBlur = 8;
            c.fillStyle = '#ff69b4';
            c.fillRect(x - sz / 2, y - sz / 2, sz, sz);
            c.shadowBlur = 0;
            c.fillStyle = '#ffd700';
            c.fillRect(x - sz / 2, y - 2, sz, 4);
            c.fillRect(x - 2, y - sz / 2, 4, sz);
            c.beginPath();
            c.arc(x - 4, y - sz / 2 - 3, 4, 0, 6.28);
            c.arc(x + 4, y - sz / 2 - 3, 4, 0, 6.28);
            c.fill();
            c.restore();
        }

        _dRock(c, x, y, sz) {
            c.fillStyle = '#7a6b6b';
            c.beginPath();
            for (let i = 0; i < 8; i++) {
                const a = (6.28 / 8) * i;
                const r = sz * (0.7 + 0.3 * Math.sin(i * 2.7));
                const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
                if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
            }
            c.closePath();
            c.fill();
            c.fillStyle = 'rgba(0,0,0,0.2)';
            c.beginPath();
            c.arc(x + sz * 0.2, y - sz * 0.1, sz * 0.25, 0, 6.28);
            c.fill();
        }

        _dUFO(c, x, y, sz) {
            c.save();
            c.shadowColor = '#39ff14';
            c.shadowBlur = 12;
            c.fillStyle = '#39ff14';
            c.beginPath();
            c.ellipse(x, y, sz, sz * 0.4, 0, 0, 6.28);
            c.fill();
            c.shadowBlur = 0;
            c.fillStyle = 'rgba(200,255,200,0.5)';
            c.beginPath();
            c.ellipse(x, y - sz * 0.3, sz * 0.5, sz * 0.4, 0, 0, 6.28);
            c.fill();
            for (let i = 0; i < 3; i++) {
                c.fillStyle = i % 2 === 0 ? '#ff0' : '#f44';
                c.beginPath();
                c.arc(x - sz * 0.5 + i * sz * 0.5, y + sz * 0.15, 2, 0, 6.28);
                c.fill();
            }
            c.restore();
        }

        _dMother(c, x, y) {
            c.save();
            c.translate(x, y);

            c.fillStyle = '#2a5a2a';
            c.shadowColor = '#39ff14';
            c.shadowBlur = 20;
            c.beginPath();
            c.ellipse(0, 0, 60, 18, 0, 0, 6.28);
            c.fill();
            c.shadowBlur = 0;

            c.fillStyle = '#1a3a1a';
            c.beginPath();
            c.ellipse(0, -14, 30, 20, 0, 0, 6.28);
            c.fill();

            c.fillStyle = 'rgba(57,255,20,0.4)';
            c.beginPath();
            c.ellipse(0, -18, 12, 8, 0, 0, 6.28);
            c.fill();

            for (let i = 0; i < 8; i++) {
                const a = (6.28 / 8) * i + this.frame * 0.05;
                c.fillStyle = 'hsl(' + ((i * 45 + this.frame * 2) % 360) + ',100%,60%)';
                c.beginPath();
                c.arc(Math.cos(a) * 55, Math.sin(a) * 15, 3, 0, 6.28);
                c.fill();
            }

            // Tractor beam holding the gift
            c.globalAlpha = 0.12 + 0.05 * Math.sin(this.frame * 0.03);
            c.fillStyle = '#39ff14';
            c.beginPath();
            c.moveTo(-15, 18); c.lineTo(15, 18);
            c.lineTo(25, 60); c.lineTo(-25, 60);
            c.closePath();
            c.fill();
            c.globalAlpha = 1;

            this._dGift(c, 0, 50, 20);

            c.restore();
        }

        // ============ SOUNDS ============

        _sndCollect() {
            try {
                const ctx = getAudioContext(), t = ctx.currentTime;
                const pitch = 500 + (this.score / this.maxScore) * 500;
                playNote(ctx, pitch, t, 0.12, 0.06, 'sine');
                playNote(ctx, pitch * 1.5, t + 0.04, 0.1, 0.03, 'triangle');
            } catch (e) {}
        }

        _sndHit() {
            try {
                const ctx = getAudioContext(), t = ctx.currentTime;
                playNote(ctx, 80, t, 0.3, 0.1, 'sine');
                playNote(ctx, 120, t, 0.15, 0.06, 'square');
            } catch (e) {}
        }

        _sndExplosion() {
            try {
                const ctx = getAudioContext(), t = ctx.currentTime;
                const bufSz = ctx.sampleRate * 0.5;
                const buf = ctx.createBuffer(1, bufSz, ctx.sampleRate);
                const data = buf.getChannelData(0);
                for (let i = 0; i < bufSz; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSz, 2);
                const src = ctx.createBufferSource();
                src.buffer = buf;
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
                src.connect(gain);
                gain.connect(ctx.destination);
                src.start(t);
                playNote(ctx, 523.25, t + 0.2, 1, 0.08, 'sine');
                playNote(ctx, 659.25, t + 0.2, 1, 0.06, 'triangle');
                playNote(ctx, 783.99, t + 0.2, 1, 0.06, 'triangle');
            } catch (e) {}
        }
    }

    // ============================================
    // Birthday Celebration — Space Game Init
    // ============================================
    function initBirthday() {
        if (!isBirthdayPeriod()) return;

        const overlay = document.getElementById('birthdayOverlay');
        const banner = document.getElementById('birthdayBanner');
        const canvas = document.getElementById('birthdayCanvas');
        const title = document.getElementById('birthdayTitle');
        const subtitle = document.getElementById('birthdaySubtitle');

        if (!overlay || !banner || !canvas) return;

        banner.style.display = 'flex';
        document.body.classList.add('birthday-active');
        banner.style.cursor = 'pointer';

        let game = null;

        banner.addEventListener('click', function() {
            overlay.style.display = 'flex';
            overlay.classList.remove('hiding');
            document.body.style.overflow = 'hidden';
            title.classList.remove('visible');
            subtitle.classList.remove('visible');

            if (!game) {
                game = new SpaceBirthdayGame(canvas);
            }

            game.onVictory = function() {
                setTimeout(function() {
                    title.classList.add('visible');
                    subtitle.classList.add('visible');
                }, 400);
                setTimeout(function() { playCelebrationMelody(); }, 300);
                setTimeout(function() { dismissOverlay(); }, 6000);
            };

            playOpenChime();
            game.start();
        });

        function dismissOverlay() {
            overlay.classList.add('hiding');
            document.body.style.overflow = '';
            setTimeout(function() {
                overlay.style.display = 'none';
                if (game) game.stop();
            }, 1200);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay.style.display === 'flex') {
                dismissOverlay();
            }
        });
    }

    // ============================================
    // Sidebar Navigation
    // ============================================
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
            document.body.classList.toggle('sidebar-expanded');
        });
    }

    // Close sidebar on mobile link click
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                sidebar.classList.remove('expanded');
                document.body.classList.remove('sidebar-expanded');
            }
        });
    });

    // Active link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');

        sections.forEach(section => {
            const top = section.offsetTop;
            if (window.pageYOffset >= top - 200) {
                current = section.getAttribute('id');
            }
        });

        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ============================================
    // Scroll Progress Bar
    // ============================================
    const progressBar = document.createElement('div');
    progressBar.id = 'scrollProgress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const winHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / winHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // ============================================
    // Scroll Reveal (IntersectionObserver)
    // ============================================
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ============================================
    // Cursor Glow Effect (Apple-style)
    // ============================================
    const cursorGlow = document.createElement('div');
    cursorGlow.style.cssText = `
        position: fixed;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(6,182,212,0.06) 0%, rgba(236,72,153,0.03) 40%, transparent 70%);
        pointer-events: none;
        z-index: 0;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        opacity: 0;
    `;
    document.body.appendChild(cursorGlow);

    let glowX = 0, glowY = 0, curX = 0, curY = 0;
    document.addEventListener('mousemove', (e) => {
        glowX = e.clientX;
        glowY = e.clientY;
        cursorGlow.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });

    function animateGlow() {
        curX += (glowX - curX) * 0.08;
        curY += (glowY - curY) * 0.08;
        cursorGlow.style.left = curX + 'px';
        cursorGlow.style.top = curY + 'px';
        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // ============================================
    // Floating Sparkle Particles (Hero Section)
    // ============================================
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const sparkleContainer = document.createElement('div');
        sparkleContainer.style.cssText = `
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            pointer-events: none; z-index: 1; overflow: hidden;
        `;
        heroSection.appendChild(sparkleContainer);

        function createSparkle() {
            const spark = document.createElement('div');
            const size = Math.random() * 4 + 2;
            const colors = ['#06b6d4', '#ec4899', '#f59e0b', '#8b5cf6'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const startX = Math.random() * 100;
            const duration = Math.random() * 8 + 6;
            const delay = Math.random() * 4;

            spark.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${startX}%;
                bottom: -10px;
                opacity: 0;
                box-shadow: 0 0 ${size * 2}px ${color}40;
                animation: sparkleRise ${duration}s ${delay}s ease-in-out infinite;
            `;
            sparkleContainer.appendChild(spark);
        }

        for (let i = 0; i < 15; i++) {
            createSparkle();
        }
    }

    // ============================================
    // Video Modal
    // ============================================
    const videoModal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');
    const modalTitle = document.getElementById('modalTitle');
    const modalClose = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');

    document.querySelectorAll('[data-video]').forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.getAttribute('data-video');
            const title = card.querySelector('h3')?.textContent || 'Performance';
            if (videoId) openVideoModal(videoId, title);
        });
    });

    function openVideoModal(videoId, title) {
        videoFrame.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1';
        modalTitle.textContent = title;
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal() {
        videoFrame.src = '';
        videoModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    if (modalClose) modalClose.addEventListener('click', closeVideoModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeVideoModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });

    // ============================================
    // Testimonials Carousel
    // ============================================
    let currentTestimonial = 0;
    const testimonials = document.querySelectorAll('.testimonial');
    const navDots = document.querySelectorAll('.nav-dot');

    window.showTestimonial = function(index) {
        testimonials.forEach(t => t.classList.remove('active'));
        navDots.forEach(d => d.classList.remove('active'));
        testimonials[index].classList.add('active');
        navDots[index].classList.add('active');
        currentTestimonial = index;
    };

    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        window.showTestimonial(currentTestimonial);
    }, 6000);

    // ============================================
    // Contact Form
    // ============================================
    const contactForm = document.querySelector('.fun-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = contactForm.querySelector('#name').value.trim();
            const email = contactForm.querySelector('#email').value.trim();
            const service = contactForm.querySelector('#service').value;
            const message = contactForm.querySelector('#message').value.trim();

            if (!name || !email || !service || !message) {
                showNotification('Please fill in all fields.');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showNotification('Please enter a valid email address.');
                return;
            }

            const serviceNames = {
                'math': 'Math Tutoring',
                'science': 'Science Tutoring',
                'language': 'Language Learning',
                'piano': 'Piano Lessons',
                'other': 'General Inquiry'
            };

            const serviceName = serviceNames[service] || 'General Inquiry';
            const subject = encodeURIComponent(serviceName + ' - Message from ' + name);
            const body = encodeURIComponent(
                'Hi Anna,\n\n' +
                'My name is ' + name + ' and I\'m interested in: ' + serviceName + '\n\n' +
                message + '\n\n' +
                'Best regards,\n' + name
            );

            window.location.href = 'mailto:abyzovann@icloud.com?subject=' + subject + '&body=' + body;
            showNotification('Email client opened. Don\'t forget to send!');

            // Reset form
            contactForm.querySelectorAll('input, select, textarea').forEach(el => {
                el.value = '';
            });
        });
    }

    // ============================================
    // Notification System
    // ============================================
    function showNotification(message) {
        document.querySelectorAll('.fun-notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = 'fun-notification';

        const content = document.createElement('div');
        content.className = 'notification-content';
        content.textContent = message;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.textContent = '\u00d7';
        closeBtn.onclick = () => removeNotification(notification);

        notification.appendChild(content);
        notification.appendChild(closeBtn);
        document.body.appendChild(notification);

        setTimeout(() => removeNotification(notification), 5000);
    }

    function removeNotification(el) {
        if (el && el.parentNode) {
            el.style.opacity = '0';
            el.style.transform = 'translateX(100%)';
            el.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 300);
        }
    }

    // ============================================
    // Music Library Data (Anna's Performances)
    // ============================================
    const musicLibrary = [
        {
            videoId: 'ZVZhNhyyErM',
            title: "Tchaikovsky's Sentimental Waltz",
            composer: 'Pyotr Ilyich Tchaikovsky',
            era: 'Romantic',
            period: '1876',
            difficulty: 'Advanced',
            duration: '5:38',
            description: 'A beautiful and sentimental waltz showcasing Tchaikovsky\'s lyrical melodic style.',
            tags: ['Classical', 'Waltz', 'Romantic Era'],
            featured: true
        },
        {
            videoId: 'LyNPFwqxKwA',
            title: 'Rachmaninoff Musical Moment',
            composer: 'Sergei Rachmaninoff',
            era: 'Romantic',
            period: 'Op. 16',
            difficulty: 'Virtuoso',
            duration: '4:22',
            description: 'One of Rachmaninoff\'s exquisite Moments Musicaux, requiring advanced technique and musical sensitivity.',
            tags: ['Romantic', 'Russian', 'Technical'],
            featured: true
        },
        {
            videoId: 'DS6IOTnFQGA',
            title: 'Chopin Nocturne in C# Minor',
            composer: 'Frédéric Chopin',
            era: 'Romantic',
            period: '1830',
            difficulty: 'Intermediate',
            duration: '3:45',
            description: 'A hauntingly beautiful nocturne demonstrating Chopin\'s mastery of lyrical expression.',
            tags: ['Romantic', 'Nocturne', 'Lyrical'],
            featured: false
        },
        {
            videoId: 'cFDlzbXOsf0',
            title: 'Summer Concert 2025',
            composer: 'Various Artists',
            era: 'Contemporary',
            period: '2025',
            difficulty: 'Varied',
            duration: '3:12',
            description: 'Live performance from the Dozen Beats Fiesta summer concert series.',
            tags: ['Concert', 'Live', 'Contemporary'],
            featured: false
        },
        {
            videoId: 'Zseu7UEHduY',
            title: 'Sunny Isles Live Show',
            composer: 'With Maestro Michael',
            era: 'Contemporary',
            period: '2024',
            difficulty: 'Advanced',
            duration: '4:50',
            description: 'Collaborative performance with Maestro Michael at the Sunny Isles venue.',
            tags: ['Live', 'Collaboration', 'Concert'],
            featured: false
        },
        {
            videoId: 'BFF_hzafEuo',
            title: 'Bach: Air on G String',
            composer: 'Johann Sebastian Bach',
            era: 'Baroque',
            period: '1723',
            difficulty: 'Intermediate',
            duration: '5:15',
            description: 'A timeless Baroque masterpiece, arranged for solo piano with grace and elegance.',
            tags: ['Baroque', 'Timeless', 'Transcription'],
            featured: false
        }
    ];

    // ============================================
    // Chill-out Library Data (Background Music)
    // ============================================
    const chilloutCategories = {
        lofi: { label: 'Lofi Beats', icon: '\u{1F3B5}', description: 'Chill beats to study/relax to' },
        focus: { label: 'Deep Focus', icon: '\u{1F9E0}', description: 'Concentration & productivity music' },
        relaxing: { label: 'Relaxing', icon: '\u{1F33F}', description: 'Stress relief & ambient music' },
        nature: { label: 'Nature Sounds', icon: '\u{1F333}', description: 'Ambient environmental sounds' },
        classical: { label: 'Classical', icon: '\u{1F3B9}', description: 'Timeless classical compositions' },
        frequencies: { label: 'Frequencies', icon: '\u{1F300}', description: 'Binaural beats & healing tones' }
    };

    const chilloutLibrary = [
        // Lofi Beats
        { id: 'lofi-1', videoId: 'jfKfPfyJRdk', title: 'lofi hip hop radio - beats to relax/study to', channel: 'Lofi Girl', duration: 'LIVE', category: 'lofi', isLive: true, views: '41K watching' },
        { id: 'lofi-2', videoId: 'rUxyKA_-grg', title: 'lofi hip hop radio - beats to sleep/chill to', channel: 'Lofi Girl', duration: 'LIVE', category: 'lofi', isLive: true, views: '15K watching' },
        { id: 'lofi-3', videoId: '5yx6BWlEVcY', title: 'Chillhop Radio - jazzy & lofi hip hop beats', channel: 'Chillhop Music', duration: 'LIVE', category: 'lofi', isLive: true, views: '8K watching' },
        { id: 'lofi-4', videoId: 'lP26UCnoH9s', title: 'Coffee Shop Radio - lofi & jazzy beats', channel: 'STEEZYASFUCK', duration: 'LIVE', category: 'lofi', isLive: true, views: '5K watching' },
        // Deep Focus
        { id: 'focus-1', videoId: 'lTRiuFIWV54', title: 'Deep Focus Music To Improve Concentration', channel: 'Greenred Productions', duration: '11:54:56', category: 'focus', isLive: false, views: '25M' },
        { id: 'focus-2', videoId: 'sjkrrmBnpGE', title: '4 Hours of Ambient Study Music', channel: 'Quiet Quest', duration: '4:00:00', category: 'focus', isLive: false, views: '12M' },
        { id: 'focus-3', videoId: 'oPVte6aMprI', title: 'Productive Morning - Study Music', channel: 'The Soul of Wind', duration: '3:28:15', category: 'focus', isLive: false, views: '8M' },
        { id: 'focus-4', videoId: 'WPni755-Krg', title: 'Brain Power - Focus Music', channel: 'Yellow Brick Cinema', duration: '3:00:12', category: 'focus', isLive: false, views: '45M' },
        // Relaxing
        { id: 'relax-1', videoId: '1fueZCTYkpA', title: 'Relaxing Sleep Music + Rain Sounds', channel: 'Soothing Relaxation', duration: '8:00:00', category: 'relaxing', isLive: false, views: '150M' },
        { id: 'relax-2', videoId: '77ZozI0rw7w', title: 'Peaceful Piano & Soft Rain', channel: 'OCB Relax Music', duration: '3:00:00', category: 'relaxing', isLive: false, views: '22M' },
        { id: 'relax-3', videoId: 'hlWiI4xVXKY', title: 'Beautiful Relaxing Music for Stress Relief', channel: 'Soothing Relaxation', duration: '3:17:42', category: 'relaxing', isLive: false, views: '85M' },
        { id: 'relax-4', videoId: '9Q634rbsypE', title: 'Calm Piano Music 24/7', channel: 'Relaxing Music', duration: 'LIVE', category: 'relaxing', isLive: true, views: '2.1M' },
        // Nature Sounds
        { id: 'nature-1', videoId: 'WHPEKLQID4U', title: 'Relaxing Ocean Waves', channel: 'Relaxing White Noise', duration: '10:00:00', category: 'nature', isLive: false, views: '87M' },
        { id: 'nature-2', videoId: 'xNN7iTA57jM', title: 'Forest Sounds - Birds Singing', channel: 'Nature Sounds', duration: '8:00:00', category: 'nature', isLive: false, views: '35M' },
        { id: 'nature-3', videoId: 'q76bMs-NwRk', title: 'Rain Sounds for Sleeping', channel: 'Rain Sounds', duration: '10:00:00', category: 'nature', isLive: false, views: '120M' },
        { id: 'nature-4', videoId: 'nDq6TstdEi8', title: 'Thunderstorm Sounds for Sleep', channel: 'The Relaxed Guy', duration: '8:00:00', category: 'nature', isLive: false, views: '56M' },
        // Classical
        { id: 'classical-1', videoId: '4Tr0otuiQuU', title: 'Beethoven - Moonlight Sonata (Full)', channel: 'HALIDONMUSIC', duration: '15:03', category: 'classical', isLive: false, views: '250M' },
        { id: 'classical-2', videoId: 'Rb0UmrCXxVA', title: 'Mozart - Classical Music for Brain Power', channel: 'HALIDONMUSIC', duration: '3:04:46', category: 'classical', isLive: false, views: '45M' },
        { id: 'classical-3', videoId: 'WJ8RVjm49hE', title: 'Chopin - Nocturnes (Complete)', channel: 'Classical Music Only', duration: '1:55:38', category: 'classical', isLive: false, views: '18M' },
        { id: 'classical-4', videoId: '1prweT95Mo0', title: 'Bach - Cello Suite No. 1', channel: 'Yo-Yo Ma', duration: '2:41:09', category: 'classical', isLive: false, views: '62M' },
        { id: 'classical-5', videoId: 'CvFH_6DNRCY', title: 'Debussy - Clair de Lune', channel: 'Rousseau', duration: '5:14', category: 'classical', isLive: false, views: '85M' },
        { id: 'classical-6', videoId: 'GRxofEmo3HA', title: 'Vivaldi - The Four Seasons', channel: 'HALIDONMUSIC', duration: '42:35', category: 'classical', isLive: false, views: '180M' },
        // Frequencies
        { id: 'freq-1', videoId: 'NPVX75VIpqg', title: '432 Hz - Deep Healing Frequency', channel: 'Meditative Mind', duration: '8:00:00', category: 'frequencies', isLive: false, views: '28M' },
        { id: 'freq-2', videoId: 'dCIA6XVe2nc', title: '528 Hz - DNA Repair & Transformation', channel: 'PowerThoughts Meditation Club', duration: '3:00:00', category: 'frequencies', isLive: false, views: '15M' },
        { id: 'freq-3', videoId: 'LXKRsJWqORc', title: '40 Hz Gamma Binaural Beats - Focus & Memory', channel: 'Brainwave Music', duration: '2:00:00', category: 'frequencies', isLive: false, views: '5.2M' },
        { id: 'freq-4', videoId: 'WTr9xnvnLKo', title: 'Alpha Waves 10 Hz - Relaxation & Creativity', channel: 'Greenred Productions', duration: '3:00:00', category: 'frequencies', isLive: false, views: '8M' },
        { id: 'freq-5', videoId: 'SyUXGfS4NyY', title: '963 Hz - Crown Chakra Activation', channel: 'Meditative Mind', duration: '2:00:00', category: 'frequencies', isLive: false, views: '12M' },
        { id: 'freq-6', videoId: 'tJlODWp3Dso', title: 'Theta Waves 6 Hz - Deep Meditation & Sleep', channel: 'Solfeggio Frequencies', duration: '8:00:00', category: 'frequencies', isLive: false, views: '22M' }
    ];

    // Music Player (YouTube IFrame API)
    // ============================================
    const playlist = [];
    let playerState = {
        currentIndex: -1,
        isPlaying: false,
        ytPlayer: null,
        ytReady: false,
        progressTimer: null,
        loadingTrack: false,
        queue: [], // Playlist queue
        history: [], // Track history for back-navigation during shuffle
        errorSkipCount: 0 // Prevent infinite error→skip loops
    };

    // Build playlist from musicLibrary
    musicLibrary.forEach(track => {
        playlist.push({
            videoId: track.videoId,
            title: track.title,
            composer: track.composer,
            era: track.era,
            duration: track.duration,
            description: track.description,
            tags: track.tags,
            featured: track.featured
        });
    });

    const musicPlayerEl = document.getElementById('musicPlayer');
    const musicTitle = document.getElementById('musicTitle');
    const musicComposer = document.getElementById('musicComposer');
    const musicThumbImg = document.getElementById('musicThumbImg');
    const musicPlayBtn = document.getElementById('musicPlayBtn');
    const musicPrev = document.getElementById('musicPrev');
    const musicNext = document.getElementById('musicNext');
    const musicClose = document.getElementById('musicClose');
    const musicProgressFill = document.getElementById('musicProgressFill');
    const musicProgressInput = document.getElementById('musicProgressInput');
    const musicTime = document.getElementById('musicTime');
    const iconPlay = musicPlayBtn.querySelector('.icon-play');
    const iconPause = musicPlayBtn.querySelector('.icon-pause');

    // YouTube IFrame API ready callback
    window.onYouTubeIframeAPIReady = function() {
        playerState.ytPlayer = new YT.Player('ytPlayer', {
            height: '150',
            width: '200',
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                rel: 0,
                origin: window.location.origin
            },
            events: {
                onReady: function(event) {
                    playerState.ytReady = true;
                    event.target.unMute();
                    event.target.setVolume(100);
                },
                onStateChange: function(event) {
                    if (event.data === YT.PlayerState.PLAYING) {
                        playerState.loadingTrack = false;
                        clearTimeout(playerState.loadingTimeout);
                        playerState.errorSkipCount = 0; // Reset on successful play
                        // Ensure unmuted after every video load (autoplay policy can reset mute)
                        event.target.unMute();
                        event.target.setVolume(100);
                        playerState.isPlaying = true;
                        updatePlayIcon();
                        startProgressTimer();
                    } else if (event.data === YT.PlayerState.PAUSED) {
                        // Ignore PAUSED from previous video during track switch
                        if (playerState.loadingTrack) return;
                        playerState.isPlaying = false;
                        updatePlayIcon();
                        stopProgressTimer();
                    } else if (event.data === YT.PlayerState.ENDED) {
                        if (playerState.loadingTrack) return;
                        playNext();
                    }
                },
                onError: function(event) {
                    playerState.loadingTrack = false;
                    clearTimeout(playerState.loadingTimeout);
                    playerState.errorSkipCount++;
                    var source = getActiveSource();
                    // Stop if all tracks in queue have errored
                    if (playerState.errorSkipCount >= source.length) {
                        playerState.errorSkipCount = 0;
                        playerState.isPlaying = false;
                        updatePlayIcon();
                        stopProgressTimer();
                        return;
                    }
                    playNext();
                }
            }
        });
    };

    // Robust video loading: loadVideoById + retry playVideo if needed
    function loadAndPlayVideo(videoId) {
        playerState.loadingTrack = true;
        clearTimeout(playerState.loadingTimeout);
        playerState.ytPlayer.loadVideoById(videoId);

        // Recovery: if PLAYING hasn't fired within 2s, force playVideo + unmute
        playerState.loadingTimeout = setTimeout(function() {
            if (playerState.loadingTrack && playerState.ytPlayer) {
                playerState.ytPlayer.playVideo();
                playerState.ytPlayer.unMute();
                playerState.ytPlayer.setVolume(100);
            }
            // Final check: if still not playing after 5s total, correct UI state
            setTimeout(function() {
                playerState.loadingTrack = false;
                if (playerState.ytPlayer && playerState.ytPlayer.getPlayerState) {
                    var state = playerState.ytPlayer.getPlayerState();
                    if (state !== YT.PlayerState.PLAYING) {
                        playerState.isPlaying = false;
                        updatePlayIcon();
                        stopProgressTimer();
                    }
                }
            }, 3000);
        }, 2000);

        playerState.isPlaying = true;
        updatePlayIcon();
        startProgressTimer();
    }

    function playTrack(index) {
        if (index < 0 || index >= playlist.length) return;
        if (!playerState.ytReady) return;

        playerState.isChilloutSource = false;
        playerState.currentIndex = index;
        const track = playlist[index];

        // Auto-populate queue with full playlist (Spotify-like behavior)
        playerState.queue = playlist.slice();

        // Update UI
        musicTitle.textContent = track.title;
        musicComposer.textContent = track.composer;
        musicThumbImg.src = 'https://img.youtube.com/vi/' + track.videoId + '/mqdefault.jpg';
        musicThumbImg.alt = track.title;
        musicPlayerEl.classList.add('visible');

        // Update card states
        document.querySelectorAll('.performance-card').forEach(c => c.classList.remove('now-playing'));
        document.querySelectorAll('.listen-btn').forEach(b => b.classList.remove('playing'));

        const activeBtn = document.querySelector('[data-listen="' + track.videoId + '"]');
        if (activeBtn) {
            activeBtn.classList.add('playing');
            activeBtn.closest('.performance-card')?.classList.add('now-playing');
        }

        // Load and play
        loadAndPlayVideo(track.videoId);
        renderQueue();
    }

    function togglePlay() {
        if (!playerState.ytReady || playerState.currentIndex === -1) return;

        if (playerState.isPlaying) {
            playerState.loadingTrack = false; // Clear loading flag on explicit pause
            playerState.ytPlayer.pauseVideo();
            playerState.isPlaying = false;
            updatePlayIcon();
            stopProgressTimer();
        } else {
            playerState.ytPlayer.playVideo();
            playerState.ytPlayer.unMute();
            playerState.ytPlayer.setVolume(100);
            playerState.isPlaying = true;
            updatePlayIcon();
            startProgressTimer();
        }
    }

    // Get the active track list based on current source
    function getActiveSource() {
        if (playerState.isChilloutSource && playerState.queue.length > 0) {
            return playerState.queue;
        }
        return playlist;
    }

    // Play a track from the chillout queue by index
    function playQueueTrack(index) {
        if (index < 0 || index >= playerState.queue.length) return;
        if (!playerState.ytReady) return;

        playerState.isChilloutSource = true;
        playerState.currentIndex = index;
        const track = playerState.queue[index];

        musicTitle.textContent = track.title;
        musicComposer.textContent = track.composer;
        musicThumbImg.src = 'https://img.youtube.com/vi/' + track.videoId + '/mqdefault.jpg';
        musicThumbImg.alt = track.title;
        musicPlayerEl.classList.add('visible');

        loadAndPlayVideo(track.videoId);
        renderQueue();
    }

    function playNext() {
        var source = getActiveSource();
        if (source.length === 0) return;

        // Repeat one: restart current track
        if (playerState.repeatMode === 'one') {
            if (playerState.ytPlayer && playerState.ytPlayer.seekTo) {
                playerState.ytPlayer.seekTo(0);
                playerState.ytPlayer.playVideo();
            }
            return;
        }

        var nextIndex;
        if (playerState.shuffleEnabled) {
            // Push current to history before moving
            if (playerState.currentIndex >= 0) {
                playerState.history.push(playerState.currentIndex);
            }
            // Pick a random track, avoid current if possible
            if (source.length > 1) {
                do {
                    nextIndex = Math.floor(Math.random() * source.length);
                } while (nextIndex === playerState.currentIndex);
            } else {
                nextIndex = 0;
            }
        } else {
            nextIndex = (playerState.currentIndex + 1) % source.length;
            if (nextIndex === 0 && playerState.repeatMode === 'off' && !playerState.isChilloutSource) {
                closePlayer();
                return;
            }
        }

        if (playerState.isChilloutSource) {
            playQueueTrack(nextIndex);
        } else {
            playTrack(nextIndex);
        }
    }

    function playPrev() {
        var source = getActiveSource();
        if (source.length === 0) return;

        // If more than 3 seconds in, restart current track
        if (playerState.ytReady && playerState.ytPlayer.getCurrentTime && playerState.ytPlayer.getCurrentTime() > 3) {
            playerState.ytPlayer.seekTo(0);
            return;
        }

        var prevIndex;
        if (playerState.shuffleEnabled && playerState.history.length > 0) {
            // Go back through history
            prevIndex = playerState.history.pop();
        } else {
            prevIndex = (playerState.currentIndex - 1 + source.length) % source.length;
        }

        if (playerState.isChilloutSource) {
            playQueueTrack(prevIndex);
        } else {
            playTrack(prevIndex);
        }
    }

    function closePlayer() {
        if (playerState.ytReady && playerState.ytPlayer.stopVideo) {
            playerState.ytPlayer.stopVideo();
        }
        playerState.isPlaying = false;
        playerState.currentIndex = -1;
        playerState.history = [];
        musicPlayerEl.classList.remove('visible');
        document.querySelectorAll('.performance-card').forEach(c => c.classList.remove('now-playing'));
        document.querySelectorAll('.listen-btn').forEach(b => b.classList.remove('playing'));
        stopProgressTimer();
        musicProgressFill.style.width = '0%';
        musicTime.textContent = '0:00';
        updatePlayIcon();
    }

    function updatePlayIcon() {
        var playing = playerState.isPlaying;
        if (playing) {
            iconPlay.style.display = 'none';
            iconPause.style.display = 'block';
        } else {
            iconPlay.style.display = 'block';
            iconPause.style.display = 'none';
        }
        // Update sidebar library button playing indicator
        updateSidebarLibraryIndicator(playing);
    }

    function updateSidebarLibraryIndicator(playing) {
        if (!sidebarLibraryBtn) return;
        var isChillout = playing && playerState.isChilloutSource;
        if (isChillout) {
            sidebarLibraryBtn.classList.add('is-playing');
        } else {
            sidebarLibraryBtn.classList.remove('is-playing');
        }
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function startProgressTimer() {
        stopProgressTimer();
        playerState.progressTimer = setInterval(updateProgress, 500);
    }

    function stopProgressTimer() {
        if (playerState.progressTimer) {
            clearInterval(playerState.progressTimer);
            playerState.progressTimer = null;
        }
    }

    function updateProgress() {
        if (!playerState.ytReady || !playerState.ytPlayer.getCurrentTime) return;

        var current = playerState.ytPlayer.getCurrentTime() || 0;
        var duration = playerState.ytPlayer.getDuration() || 0;

        // Live streams return very large durations (>86400s = 24h)
        var isLiveStream = duration > 86400;

        if (isLiveStream) {
            musicProgressFill.style.width = '100%';
            musicProgressInput.value = 100;
            musicTime.textContent = 'LIVE';
        } else if (duration > 0) {
            var pct = (current / duration) * 100;
            musicProgressFill.style.width = pct + '%';
            musicProgressInput.value = pct;
            musicTime.textContent = formatTime(current) + ' / ' + formatTime(duration);
        }

        // Self-correct icon state
        updatePlayIcon();
    }

    // Seek via progress bar
    musicProgressInput.addEventListener('input', function() {
        if (!playerState.ytReady || !playerState.ytPlayer.getDuration) return;
        var duration = playerState.ytPlayer.getDuration() || 0;
        if (duration > 0 && duration <= 86400) {
            var seekTo = (this.value / 100) * duration;
            playerState.ytPlayer.seekTo(seekTo, true);
            musicProgressFill.style.width = this.value + '%';
        }
    });

    // Controls
    musicPlayBtn.addEventListener('click', togglePlay);
    musicNext.addEventListener('click', playNext);
    musicPrev.addEventListener('click', playPrev);
    musicClose.addEventListener('click', closePlayer);

    // Listen buttons — stop propagation so video modal doesn't open
    document.querySelectorAll('.listen-btn').forEach((btn, i) => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();

            // If this track is already playing, toggle play/pause
            if (playerState.currentIndex === i && playerState.isPlaying) {
                togglePlay();
                return;
            }
            playTrack(i);
        });
    });

    // Play All button
    var playAllBtn = document.getElementById('playAllBtn');
    if (playAllBtn) {
        playAllBtn.addEventListener('click', function() {
            if (playlist.length > 0) playTrack(0);
        });
    }

    // Keyboard: space to toggle, arrows to skip
    document.addEventListener('keydown', function(e) {
        if (playerState.currentIndex === -1) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

        if (e.code === 'Space' && !videoModal.classList.contains('active')) {
            e.preventDefault();
            togglePlay();
        }
    });

    // ============================================
    // Chill-out Library Modal
    // ============================================
    const libraryPanel = document.getElementById('libraryPanel');
    const libraryBackdrop = document.getElementById('libraryBackdrop');
    const sidebarLibraryBtn = document.getElementById('sidebarLibraryBtn');
    const libraryPanelClose = document.getElementById('libraryPanelClose');
    const libraryGrid = document.getElementById('libraryGrid');
    const libraryToggleBtn = document.getElementById('libraryToggleBtn');
    const librarySearch = document.getElementById('librarySearch');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const chilloutShuffleBtn = document.getElementById('chilloutShuffleBtn');

    let currentFilter = 'all';
    let searchQuery = '';

    function renderCardHTML(track, nowPlayingId) {
        return `
            <div class="library-card chillout-card${track.videoId === nowPlayingId ? ' now-playing' : ''}" data-video-id="${track.videoId}" data-category="${track.category}">
                <div class="library-card-thumb">
                    <img src="https://img.youtube.com/vi/${track.videoId}/mqdefault.jpg" alt="${track.title}" loading="lazy">
                    <div class="library-card-play-overlay">
                        <div class="library-card-play-icon">
                            ${track.videoId === nowPlayingId
                                ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
                                : '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
                            }
                        </div>
                    </div>
                    ${track.isLive ? '<span class="chillout-live-badge">LIVE</span>' : `<span class="chillout-duration-badge">${track.duration}</span>`}
                </div>
                <div class="library-card-info">
                    <h4 class="library-card-title">${track.title}</h4>
                    <p class="library-card-composer">${track.channel}</p>
                    <div class="library-card-meta">
                        <span class="meta-badge">${chilloutCategories[track.category].label}</span>
                        <span class="meta-badge">${track.views}</span>
                    </div>
                </div>
            </div>`;
    }

    function renderChilloutGrid(tracks) {
        if (tracks.length === 0) {
            libraryGrid.innerHTML = '<div class="chillout-empty">No tracks found</div>';
            return;
        }

        // Determine currently playing video ID for highlighting
        var nowPlayingId = '';
        if (playerState.isChilloutSource && playerState.isPlaying && playerState.queue.length > 0 && playerState.currentIndex >= 0) {
            nowPlayingId = playerState.queue[playerState.currentIndex]?.videoId || '';
        }

        // Group tracks by category
        var grouped = {};
        tracks.forEach(function(track) {
            if (!grouped[track.category]) grouped[track.category] = [];
            grouped[track.category].push(track);
        });

        var html = '';

        // Hero banner — first live track
        var heroTrack = tracks.find(function(t) { return t.isLive; });
        if (heroTrack) {
            html += `
                <div class="chillout-hero" data-video-id="${heroTrack.videoId}">
                    <div class="chillout-hero-bg" style="background-image: url('https://img.youtube.com/vi/${heroTrack.videoId}/maxresdefault.jpg')"></div>
                    <div class="chillout-hero-content">
                        <span class="chillout-hero-badge">LIVE NOW</span>
                        <div class="chillout-hero-title">${heroTrack.title}</div>
                        <div class="chillout-hero-meta">${heroTrack.channel} &middot; ${heroTrack.views}</div>
                    </div>
                    <button class="chillout-hero-play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Listen Now
                    </button>
                </div>`;
        }

        // Category sections with horizontal carousels
        var categoryOrder = ['lofi', 'focus', 'relaxing', 'nature', 'classical', 'frequencies'];
        categoryOrder.forEach(function(catKey) {
            var catTracks = grouped[catKey];
            if (!catTracks || catTracks.length === 0) return;
            var cat = chilloutCategories[catKey];

            html += `
                <div class="chillout-category-section" data-cat="${catKey}">
                    <div class="chillout-category-header">
                        <div class="chillout-category-info">
                            <div class="chillout-category-icon">${cat.icon}</div>
                            <div class="chillout-category-text">
                                <h4>${cat.label}</h4>
                                <p>${cat.description}</p>
                            </div>
                        </div>
                        <div class="chillout-category-actions">
                            <button class="chillout-play-all-btn" data-play-cat="${catKey}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                Play All
                            </button>
                            <button class="chillout-scroll-btn" data-scroll-dir="left" data-scroll-cat="${catKey}">&lsaquo;</button>
                            <button class="chillout-scroll-btn" data-scroll-dir="right" data-scroll-cat="${catKey}">&rsaquo;</button>
                        </div>
                    </div>
                    <div class="chillout-carousel" data-carousel="${catKey}">
                        ${catTracks.map(function(track) { return renderCardHTML(track, nowPlayingId); }).join('')}
                    </div>
                </div>`;
        });

        libraryGrid.innerHTML = html;

        // Click handlers — cards
        document.querySelectorAll('.chillout-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var videoId = card.dataset.videoId;
                var track = chilloutLibrary.find(function(t) { return t.videoId === videoId; });
                if (track) {
                    playChilloutTrack(track);
                    closeLibraryPanel();
                }
            });
        });

        // Click handler — hero banner
        var hero = document.querySelector('.chillout-hero');
        if (hero) {
            hero.addEventListener('click', function() {
                var videoId = hero.dataset.videoId;
                var track = chilloutLibrary.find(function(t) { return t.videoId === videoId; });
                if (track) {
                    playChilloutTrack(track);
                    closeLibraryPanel();
                }
            });
        }

        // Click handlers — Play All per category
        document.querySelectorAll('.chillout-play-all-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var catKey = btn.dataset.playCat;
                var catTracks = chilloutLibrary.filter(function(t) { return t.category === catKey; });
                if (catTracks.length > 0) {
                    playChilloutTrack(catTracks[0]);
                    closeLibraryPanel();
                }
            });
        });

        // Click handlers — carousel scroll buttons
        document.querySelectorAll('.chillout-scroll-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var dir = btn.dataset.scrollDir;
                var catKey = btn.dataset.scrollCat;
                var carousel = document.querySelector('[data-carousel="' + catKey + '"]');
                if (carousel) {
                    var scrollAmount = 240;
                    carousel.scrollBy({ left: dir === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
                }
            });
        });
    }

    function playChilloutTrack(track) {
        playerState.isChilloutSource = true;
        // Queue all tracks from same category for continuous play
        const categoryTracks = chilloutLibrary
            .filter(t => t.category === track.category)
            .map(t => ({
                videoId: t.videoId,
                title: t.title,
                composer: t.channel,
                era: chilloutCategories[t.category].label,
                duration: t.duration,
                description: '',
                tags: [t.category],
                featured: false
            }));

        const startIndex = categoryTracks.findIndex(t => t.videoId === track.videoId);

        // Replace the queue with category tracks
        playerState.queue = categoryTracks;
        playerState.currentIndex = startIndex >= 0 ? startIndex : 0;

        // Update UI and play
        const current = playerState.queue[playerState.currentIndex];
        musicTitle.textContent = current.title;
        musicComposer.textContent = current.composer;
        musicThumbImg.src = `https://img.youtube.com/vi/${current.videoId}/mqdefault.jpg`;
        musicPlayerEl.classList.add('visible');

        if (playerState.ytReady && playerState.ytPlayer) {
            loadAndPlayVideo(current.videoId);
        }

        renderQueue();
    }

    function shuffleChillout() {
        playerState.isChilloutSource = true;
        const allTracks = [...chilloutLibrary].sort(() => Math.random() - 0.5);
        const queueTracks = allTracks.map(t => ({
            videoId: t.videoId,
            title: t.title,
            composer: t.channel,
            era: chilloutCategories[t.category].label,
            duration: t.duration,
            description: '',
            tags: [t.category],
            featured: false
        }));

        playerState.queue = queueTracks;
        playerState.currentIndex = 0;

        const current = queueTracks[0];
        musicTitle.textContent = current.title;
        musicComposer.textContent = current.composer;
        musicThumbImg.src = `https://img.youtube.com/vi/${current.videoId}/mqdefault.jpg`;
        musicPlayerEl.classList.add('visible');

        if (playerState.ytReady && playerState.ytPlayer) {
            loadAndPlayVideo(current.videoId);
        }

        renderQueue();
        closeLibraryPanel();
    }

    function filterChilloutLibrary() {
        let filtered = chilloutLibrary;

        // Apply category filter
        if (currentFilter !== 'all') {
            filtered = filtered.filter(t => t.category === currentFilter);
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(query) ||
                t.channel.toLowerCase().includes(query) ||
                chilloutCategories[t.category].label.toLowerCase().includes(query)
            );
        }

        renderChilloutGrid(filtered);
    }

    function openLibraryPanel() {
        libraryPanel.classList.add('active');
        libraryBackdrop.classList.add('active');
        if (sidebarLibraryBtn) sidebarLibraryBtn.classList.add('active');
        filterChilloutLibrary();
    }

    function closeLibraryPanel() {
        libraryPanel.classList.remove('active');
        libraryBackdrop.classList.remove('active');
        if (sidebarLibraryBtn) sidebarLibraryBtn.classList.remove('active');
    }

    // Event listeners — sidebar button (primary)
    if (sidebarLibraryBtn) {
        sidebarLibraryBtn.addEventListener('click', () => {
            if (libraryPanel.classList.contains('active')) {
                closeLibraryPanel();
            } else {
                openLibraryPanel();
            }
        });
    }

    // Performances section button (secondary)
    if (libraryToggleBtn) {
        libraryToggleBtn.addEventListener('click', openLibraryPanel);
    }

    if (chilloutShuffleBtn) {
        chilloutShuffleBtn.addEventListener('click', shuffleChillout);
    }

    // Close button inside panel
    if (libraryPanelClose) {
        libraryPanelClose.addEventListener('click', closeLibraryPanel);
    }

    // Click backdrop to close
    if (libraryBackdrop) {
        libraryBackdrop.addEventListener('click', closeLibraryPanel);
    }

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            filterChilloutLibrary();
        });
    });

    if (librarySearch) {
        librarySearch.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            filterChilloutLibrary();
        });
    }

    // Escape key handler for library panel
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && libraryPanel && libraryPanel.classList.contains('active')) {
            closeLibraryPanel();
        }
    });

    // ============================================
    // Queue Management
    // ============================================
    const queuePanel = document.getElementById('queuePanel');
    const queueList = document.getElementById('queueList');
    const queueToggleBtn = document.getElementById('queueToggleBtn');
    const queueClearBtn = document.getElementById('queueClearBtn');
    const queueCloseBtn = document.getElementById('queueCloseBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');

    // Extend playerState
    playerState.queue = [];
    playerState.repeatMode = 'off'; // 'off' | 'all' | 'one'
    playerState.shuffleEnabled = false;

    function addToQueue(trackIndex) {
        if (!playerState.queue.includes(trackIndex)) {
            playerState.queue.push(trackIndex);
            renderQueue();
            updateQueueCount();
        }
    }

    function removeFromQueue(position) {
        playerState.queue.splice(position, 1);
        renderQueue();
        updateQueueCount();
    }

    function clearQueue() {
        playerState.queue = [];
        renderQueue();
        updateQueueCount();
    }

    function renderQueue() {
        if (!queueList) return;

        queueList.innerHTML = playerState.queue.map((item, queuePosition) => {
            // Support both index-based queue (original) and object-based queue (chillout)
            const track = typeof item === 'number' ? playlist[item] : item;
            if (!track) return '';
            const isCurrent = queuePosition === playerState.currentIndex;
            return `
                <div class="queue-item ${isCurrent ? 'current' : ''}" data-position="${queuePosition}" data-track="${typeof item === 'number' ? item : queuePosition}">
                    <span class="queue-item-number">${isCurrent ? '▶' : queuePosition + 1}</span>
                    <img class="queue-item-thumb" src="https://img.youtube.com/vi/${track.videoId}/mqdefault.jpg" alt="">
                    <div class="queue-item-info">
                        <div class="queue-item-title">${track.title}</div>
                        <div class="queue-item-composer">${track.composer}</div>
                    </div>
                    <button class="queue-item-remove" data-remove="${queuePosition}" title="Remove">✕</button>
                </div>
            `;
        }).join('');

        // Click handlers
        document.querySelectorAll('.queue-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.queue-item-remove')) {
                    const position = parseInt(item.dataset.position);
                    if (playerState.isChilloutSource) {
                        playQueueTrack(position);
                    } else {
                        playTrack(position);
                    }
                }
            });
        });

        document.querySelectorAll('.queue-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromQueue(parseInt(btn.dataset.remove));
            });
        });

        updateQueueCount();
    }

    function updateQueueCount() {
        if (queueToggleBtn) {
            const countSpan = queueToggleBtn.querySelector('span');
            if (countSpan) {
                countSpan.textContent = `Queue (${playerState.queue.length})`;
            }
        }
    }

    function toggleQueue() {
        if (queuePanel) {
            queuePanel.classList.toggle('visible');
        }
    }

    function cycleRepeatMode() {
        const modes = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(playerState.repeatMode);
        playerState.repeatMode = modes[(currentIndex + 1) % modes.length];
        updateRepeatButton();
    }

    function updateRepeatButton() {
        if (!repeatBtn) return;

        const labels = {
            'off': 'Repeat: Off',
            'all': 'Repeat: All',
            'one': 'Repeat: One'
        };

        const labelSpan = repeatBtn.querySelector('span');
        if (labelSpan) {
            labelSpan.textContent = labels[playerState.repeatMode];
        }

        repeatBtn.classList.toggle('active', playerState.repeatMode !== 'off');
        repeatBtn.dataset.mode = playerState.repeatMode;
    }

    function toggleShuffle() {
        playerState.shuffleEnabled = !playerState.shuffleEnabled;

        if (shuffleBtn) {
            shuffleBtn.classList.toggle('active', playerState.shuffleEnabled);
            const labelSpan = shuffleBtn.querySelector('span');
            if (labelSpan) {
                labelSpan.textContent = playerState.shuffleEnabled ? 'Shuffle: On' : 'Shuffle: Off';
            }
        }
    }

    // Event listeners
    if (queueToggleBtn) {
        queueToggleBtn.addEventListener('click', toggleQueue);
    }

    if (queueClearBtn) {
        queueClearBtn.addEventListener('click', clearQueue);
    }

    if (queueCloseBtn) {
        queueCloseBtn.addEventListener('click', function() {
            if (queuePanel) queuePanel.classList.remove('visible');
        });
    }

    if (repeatBtn) {
        repeatBtn.addEventListener('click', cycleRepeatMode);
    }

    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', toggleShuffle);
    }

    // ============================================
    // Initialize
    // ============================================
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        initBirthday();
    });

})();
