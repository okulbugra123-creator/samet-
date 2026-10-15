/**
 * ODUNCU OYUNU (LUMBERJACK) - OYUN MOTORU
 * Saf JavaScript (Vanilla JS), hiçbir derleyiciye ihtiyaç duymadan doğrudan çalışır.
 */

(function () {
  'use strict';

  // --- SES SENTEZLEYİCİ (Web Audio API) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      const saved = localStorage.getItem('oduncu_sound_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    }

    init() {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('oduncu_sound_enabled', this.enabled);
      return this.enabled;
    }

    playChop() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      // Ahşap vurma darbe rezonansı
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Rastgele hafif perde değişimiyle daha doğal ahşap sesi
      const baseFreq = 160 + Math.random() * 40;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);

      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);

      // Balta sesi çıtırtısı (noise)
      this.playWoodCrack(t);
    }

    playWoodCrack(t) {
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 0.04;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(t);
      noise.stop(t + 0.04);
    }

    playGameOver() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.35);

      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.4);
    }

    playCombo() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.04);
        gain.gain.setValueAtTime(0.18, t + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.04);
        osc.stop(t + idx * 0.04 + 0.12);
      });
    }

    playRecordFanfare() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((f, i) => {
        const t = this.ctx.currentTime + i * 0.09;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.22);
      });
    }

    playClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.03);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.03);
    }
  }

  // --- KARAKTER TANIMLARI (SKINS) ---
  const SKINS = [
    {
      id: 'classic',
      name: 'Klasik Jack',
      desc: 'Geleneksel kırmızı ekose gömlekli ormancı.',
      icon: '🪓',
      req: 0,
      shirtColor: '#c62828',
      shirtPattern: 'plaid',
      hatColor: '#d32f2f',
      beardColor: '#4e342e',
      axeHead: '#b0bec5'
    },
    {
      id: 'hazel',
      name: 'Ormancı Hazel',
      desc: 'Zümrüt ormanların çevik koruyucusu.',
      icon: '🌲',
      req: 30,
      shirtColor: '#2e7d32',
      shirtPattern: 'solid',
      hatColor: '#1b5e20',
      beardColor: '#d84315',
      axeHead: '#cfd8dc'
    },
    {
      id: 'viking',
      name: 'Viking Ragnar',
      desc: 'Kuzeyin sert savaşçısı ve çift ağızlı baltası.',
      icon: '🛡️',
      req: 60,
      shirtColor: '#455a64',
      shirtPattern: 'fur',
      hatColor: '#90a4ae',
      beardColor: '#ffb300',
      axeHead: '#eceff1'
    },
    {
      id: 'cyber',
      name: 'Cyber Jack 2077',
      desc: 'Yüksek voltajlı plazma baltalı siborg.',
      icon: '⚡',
      req: 100,
      shirtColor: '#00e5ff',
      shirtPattern: 'neon',
      hatColor: '#ff007f',
      beardColor: '#37474f',
      axeHead: '#00e5ff'
    },
    {
      id: 'golden',
      name: 'Altın Şampiyon',
      desc: 'Efsanevi altın zırh ve parıldayan kraliyet baltası.',
      icon: '👑',
      req: 150,
      shirtColor: '#ffd700',
      shirtPattern: 'gold',
      hatColor: '#ffa000',
      beardColor: '#fff',
      axeHead: '#ffd700'
    }
  ];

  // --- OYUN SINIFI ---
  class LumberjackGame {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.sounds = new SoundEngine();

      // UI Öğeleri
      this.scoreDisplay = document.getElementById('score-display');
      this.comboBadge = document.getElementById('combo-badge');
      this.timerBar = document.getElementById('timer-bar');
      this.startPrompt = document.getElementById('start-prompt');
      this.btnLeft = document.getElementById('btn-left');
      this.btnRight = document.getElementById('btn-right');
      this.btnSound = document.getElementById('btn-sound');
      this.btnSkins = document.getElementById('btn-skins');
      this.btnHelp = document.getElementById('btn-help');
      this.btnStats = document.getElementById('btn-stats');

      // Modallar
      this.modalGameover = document.getElementById('modal-gameover');
      this.modalSkins = document.getElementById('modal-skins');
      this.modalHelp = document.getElementById('modal-help');
      this.modalStats = document.getElementById('modal-stats');

      // Durum Değişkenleri
      this.state = 'IDLE'; // IDLE, PLAYING, GAMEOVER, PAUSED
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.lastChopTime = 0;
      this.highScore = parseInt(localStorage.getItem('oduncu_highscore') || '0', 10);
      this.totalChops = parseInt(localStorage.getItem('oduncu_total_chops') || '0', 10);
      this.gamesPlayed = parseInt(localStorage.getItem('oduncu_games_played') || '0', 10);
      this.longestCombo = parseInt(localStorage.getItem('oduncu_longest_combo') || '0', 10);
      this.selectedSkinId = localStorage.getItem('oduncu_selected_skin') || 'classic';

      // Zaman Sayacı (0 - 100)
      this.timer = 100;
      this.maxTimer = 100;
      this.timerDrainRate = 14; // saniyede eksilen miktar

      // Oduncu
      this.playerSide = 'left'; // 'left' veya 'right'
      this.playerAnim = 'idle'; // 'idle', 'chop', 'dead'
      this.playerAnimTimer = 0;

      // Ağaç Parçaları
      this.trunkSegments = [];
      this.trunkWidth = 110;
      this.trunkHeight = 85;
      this.visibleSegments = 7;
      this.trunkBaseY = 0;

      // Parçacıklar & Uçan Odunlar
      this.flyingLogs = [];
      this.particles = [];
      this.floatingTexts = [];
      this.backgroundLeaves = [];

      // Ekran Sallantısı
      this.shakeIntensity = 0;

      // Boyutlar
      this.dpr = window.devicePixelRatio || 1;
      this.width = 480;
      this.height = 760;

      this.initTree();
      this.initBackgroundParticles();
      this.setupEventListeners();
      this.resize();
      this.updateSoundButtonUI();
      this.renderSkinGrid();

      // Oyun Döngüsü
      this.lastTimestamp = performance.now();
      requestAnimationFrame((ts) => this.loop(ts));
    }

    // Seçili Karakter
    getCurrentSkin() {
      return SKINS.find((s) => s.id === this.selectedSkinId) || SKINS[0];
    }

    // Ağaç Dizisini Başlatma
    initTree() {
      this.trunkSegments = [];
      // İlk 2 parça daima dalsız olmalı
      this.trunkSegments.push({ branch: 'none', yOffset: 0 });
      this.trunkSegments.push({ branch: 'none', yOffset: 0 });

      for (let i = 2; i < 10; i++) {
        this.trunkSegments.push(this.generateNextSegment());
      }
    }

    // Yeni Dal Üretme Mantığı (Adil & Eğlenceli)
    generateNextSegment() {
      const last = this.trunkSegments[this.trunkSegments.length - 1];
      let branch = 'none';

      // Eğer önceki parçada dal varsa, %40 olasılıkla dalsız, %60 olasılıkla aynı yönde veya ters yönde
      const rand = Math.random();
      if (last && last.branch !== 'none') {
        if (rand < 0.45) {
          branch = 'none';
        } else {
          // Bazen arka arkaya aynı yönde dal, bazen yön değiştir
          branch = rand < 0.72 ? last.branch : (last.branch === 'left' ? 'right' : 'left');
        }
      } else {
        if (rand < 0.35) {
          branch = 'none';
        } else if (rand < 0.67) {
          branch = 'left';
        } else {
          branch = 'right';
        }
      }

      return {
        branch: branch,
        yOffset: 0,
        barkVariation: Math.floor(Math.random() * 3)
      };
    }

    initBackgroundParticles() {
      this.backgroundLeaves = [];
      for (let i = 0; i < 20; i++) {
        this.backgroundLeaves.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          vx: -0.4 + Math.random() * 0.8,
          vy: 0.6 + Math.random() * 1.2,
          size: 4 + Math.random() * 6,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.05,
          color: Math.random() > 0.5 ? '#81c784' : '#ffb74d'
        });
      }
    }

    // Boyutlandırma
    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = rect.width;
      this.height = rect.height;

      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);

      this.trunkWidth = Math.max(90, Math.min(130, this.width * 0.22));
      this.trunkHeight = Math.max(75, Math.min(100, this.height * 0.12));
      this.trunkBaseY = this.height - 130;
    }

    // Dinleyiciler
    setupEventListeners() {
      window.addEventListener('resize', () => this.resize());

      // Klavye Kontrolleri
      window.addEventListener('keydown', (e) => {
        if (e.repeat) return;

        // Modal açıksa kapatma veya yeniden başlatma
        if (this.state === 'GAMEOVER') {
          if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            this.restartGame();
            return;
          }
        }

        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          e.preventDefault();
          this.triggerChop('left');
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          e.preventDefault();
          this.triggerChop('right');
        } else if (e.code === 'Escape') {
          this.togglePause();
        }
      });

      // Buton Tıklamaları
      this.btnLeft.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.btnLeft.classList.add('pressed');
        this.triggerChop('left');
      });
      window.addEventListener('pointerup', () => {
        this.btnLeft.classList.remove('pressed');
        this.btnRight.classList.remove('pressed');
      });

      this.btnRight.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.btnRight.classList.add('pressed');
        this.triggerChop('right');
      });

      // Canvas Üzerine Dokunma (Ekranı ikiye böler: sol yarı / sağ yarı)
      this.canvas.addEventListener('pointerdown', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const half = rect.width / 2;

        if (this.state === 'GAMEOVER') {
          this.restartGame();
          return;
        }

        if (clientX < half) {
          this.triggerChop('left');
        } else {
          this.triggerChop('right');
        }
      });

      // Üst Düğmeler
      this.btnSound.addEventListener('click', () => {
        const enabled = this.sounds.toggle();
        this.updateSoundButtonUI();
        if (enabled) this.sounds.playClick();
      });

      this.btnSkins.addEventListener('click', () => {
        this.sounds.playClick();
        this.openModal(this.modalSkins);
      });

      this.btnHelp.addEventListener('click', () => {
        this.sounds.playClick();
        this.openModal(this.modalHelp);
      });

      this.btnStats.addEventListener('click', () => {
        this.sounds.playClick();
        this.updateStatsModal();
        this.openModal(this.modalStats);
      });

      // Modal Kapatma Düğmeleri
      document.querySelectorAll('.modal-close, [data-close]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const targetModal = e.target.closest('.modal-backdrop');
          if (targetModal) {
            this.sounds.playClick();
            this.closeModal(targetModal);
          }
        });
      });

      // Dışına tıklayınca modal kapatma
      document.querySelectorAll('.modal-backdrop').forEach((mb) => {
        mb.addEventListener('click', (e) => {
          if (e.target === mb && mb !== this.modalGameover) {
            this.closeModal(mb);
          }
        });
      });

      // Tekrar Oyna Düğmesi
      const restartBtn = document.getElementById('btn-restart');
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          this.sounds.playClick();
          this.restartGame();
        });
      }
    }

    updateSoundButtonUI() {
      this.btnSound.textContent = this.sounds.enabled ? '🔊' : '🔇';
      this.btnSound.title = this.sounds.enabled ? 'Sesi Kapat' : 'Sesi Aç';
    }

    openModal(modal) {
      if (modal) {
        modal.classList.add('open');
      }
    }

    closeModal(modal) {
      if (modal) {
        modal.classList.remove('open');
      }
    }

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
      }
    }

    // --- VURUŞ / ODUN KESME MEKANİĞİ ---
    triggerChop(side) {
      if (this.state === 'GAMEOVER' || this.state === 'PAUSED') return;

      if (this.state === 'IDLE') {
        this.state = 'PLAYING';
        this.startPrompt.style.display = 'none';
        this.lastTimestamp = performance.now();
      }

      this.playerSide = side;
      this.playerAnim = 'chop';
      this.playerAnimTimer = 0.09; // saniye
      this.shakeIntensity = 5;

      const now = performance.now();
      const timeSinceLast = (now - this.lastChopTime) / 1000;
      this.lastChopTime = now;

      // Kombo Sayacı (0.75 saniye içinde vurursa kombo artar)
      if (timeSinceLast < 0.75) {
        this.combo++;
        if (this.combo > this.maxCombo) {
          this.maxCombo = this.combo;
        }
        if (this.combo > this.longestCombo) {
          this.longestCombo = this.combo;
          localStorage.setItem('oduncu_longest_combo', this.longestCombo);
        }
        if (this.combo % 10 === 0 && this.combo > 0) {
          this.sounds.playCombo();
          this.addFloatingText(`KOMBO x${this.combo}!`, this.width / 2, this.trunkBaseY - 140, '#ffd54f');
        }
      } else {
        this.combo = 1;
      }

      // En alttaki parçayı kes
      const choppedPiece = this.trunkSegments.shift();
      // Yeni bir parça yukarıya ekle
      this.trunkSegments.push(this.generateNextSegment());

      // Ağacın yeni alt parçası oyuncunun kafasına düştü mü kontrol et!
      const nextBottomPiece = this.trunkSegments[0];

      // Kesilen parçanın uçuş animasyonu
      this.spawnFlyingLog(choppedPiece, side);
      this.spawnWoodSplinters(side);
      this.sounds.playChop();

      // Skor arttır
      this.score++;
      this.totalChops++;
      localStorage.setItem('oduncu_total_chops', this.totalChops);

      // Enerji/Zaman doldur (+14% her vuruşta, hızlı vurunca dolu kalır)
      this.timer = Math.min(this.maxTimer, this.timer + 13);

      this.updateScoreUI();

      // Skor hedeflerine göre yeni karakter kilidi açıldı mı kontrol et
      this.checkUnlocks();

      // Çarpışma kontrolü: Yeni alt parçanın dalı oyuncunun durduğu tarafta mı?
      if (nextBottomPiece && nextBottomPiece.branch === side) {
        this.gameOver('branch');
      }
    }

    spawnFlyingLog(piece, cutSide) {
      const centerX = this.width / 2;
      const startY = this.trunkBaseY;
      const flyToRight = cutSide === 'left';

      this.flyingLogs.push({
        x: centerX,
        y: startY,
        vx: (flyToRight ? 1 : -1) * (14 + Math.random() * 8),
        vy: -9 - Math.random() * 5,
        gravity: 0.7,
        rotation: 0,
        vRot: (flyToRight ? 1 : -1) * (0.15 + Math.random() * 0.2),
        branch: piece.branch,
        width: this.trunkWidth,
        height: this.trunkHeight,
        opacity: 1
      });
    }

    spawnWoodSplinters(cutSide) {
      const treeX = this.width / 2;
      const hitX = cutSide === 'left' ? treeX - this.trunkWidth / 2 : treeX + this.trunkWidth / 2;
      const hitY = this.trunkBaseY + this.trunkHeight / 2;
      const dir = cutSide === 'left' ? 1 : -1;

      const colors = ['#8d6e63', '#d7ccc8', '#ffb74d', '#ffcc80', '#5d4037'];

      for (let i = 0; i < 14; i++) {
        this.particles.push({
          x: hitX,
          y: hitY,
          vx: dir * (3 + Math.random() * 10) + (Math.random() - 0.5) * 4,
          vy: -6 - Math.random() * 8,
          gravity: 0.45,
          size: 3 + Math.random() * 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.3,
          life: 1,
          decay: 0.02 + Math.random() * 0.03
        });
      }
    }

    addFloatingText(text, x, y, color = '#ffffff') {
      this.floatingTexts.push({
        text,
        x,
        y,
        color,
        opacity: 1,
        scale: 1.3,
        vy: -2
      });
    }

    updateScoreUI() {
      this.scoreDisplay.textContent = this.score;
      this.scoreDisplay.classList.remove('score-bump');
      // Reflow tetikleme
      void this.scoreDisplay.offsetWidth;
      this.scoreDisplay.classList.add('score-bump');

      if (this.combo >= 4) {
        this.comboBadge.textContent = `x${this.combo} KOMBO!`;
        this.comboBadge.classList.add('active');
      } else {
        this.comboBadge.classList.remove('active');
      }
    }

    checkUnlocks() {
      let newlyUnlocked = false;
      SKINS.forEach((skin) => {
        if (skin.req > 0 && this.score >= skin.req) {
          const unlockedKey = `oduncu_unlocked_${skin.id}`;
          if (!localStorage.getItem(unlockedKey)) {
            localStorage.setItem(unlockedKey, 'true');
            newlyUnlocked = true;
            this.addFloatingText(`YENİ KARAKTER: ${skin.name}!`, this.width / 2, 180, '#ffca28');
          }
        }
      });
      if (newlyUnlocked) {
        this.renderSkinGrid();
      }
    }

    gameOver(reason) {
      this.state = 'GAMEOVER';
      this.playerAnim = 'dead';
      this.shakeIntensity = 18;
      this.sounds.playGameOver();

      this.gamesPlayed++;
      localStorage.setItem('oduncu_games_played', this.gamesPlayed);

      const isNewRecord = this.score > this.highScore;
      if (isNewRecord) {
        this.highScore = this.score;
        localStorage.setItem('oduncu_highscore', this.highScore);
        setTimeout(() => this.sounds.playRecordFanfare(), 300);
      }

      // Game Over modalını doldur
      const modalScore = document.getElementById('gameover-score');
      const modalBest = document.getElementById('gameover-best');
      const modalCombo = document.getElementById('gameover-combo');
      const modalTotal = document.getElementById('gameover-total');
      const modalTitle = document.getElementById('gameover-title');
      const newRecordTag = document.getElementById('new-record-tag');

      if (modalScore) modalScore.textContent = this.score;
      if (modalBest) modalBest.textContent = this.highScore;
      if (modalCombo) modalCombo.textContent = this.maxCombo;
      if (modalTotal) modalTotal.textContent = this.totalChops;

      if (newRecordTag) {
        newRecordTag.style.display = isNewRecord && this.score > 0 ? 'inline-block' : 'none';
      }

      if (modalTitle) {
        if (reason === 'timeout') {
          modalTitle.textContent = '⏰ Zaman Bitti!';
        } else {
          modalTitle.textContent = '💥 Dal Çarptı!';
        }
      }

      setTimeout(() => {
        this.openModal(this.modalGameover);
      }, 350);
    }

    restartGame() {
      this.closeModal(this.modalGameover);
      this.state = 'IDLE';
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.timer = this.maxTimer;
      this.playerAnim = 'idle';
      this.playerSide = 'left';
      this.flyingLogs = [];
      this.particles = [];
      this.floatingTexts = [];
      this.initTree();
      this.updateScoreUI();
      this.startPrompt.style.display = 'flex';
      this.timerBar.style.width = '100%';
      this.timerBar.classList.remove('critical');
    }

    updateStatsModal() {
      const elHigh = document.getElementById('stat-high-score');
      const elChops = document.getElementById('stat-total-chops');
      const elGames = document.getElementById('stat-games-played');
      const elCombo = document.getElementById('stat-longest-combo');

      if (elHigh) elHigh.textContent = this.highScore;
      if (elChops) elChops.textContent = this.totalChops;
      if (elGames) elGames.textContent = this.gamesPlayed;
      if (elCombo) elCombo.textContent = this.longestCombo;
    }

    renderSkinGrid() {
      const container = document.getElementById('skins-grid');
      if (!container) return;
      container.innerHTML = '';

      SKINS.forEach((skin) => {
        const isUnlocked = skin.req === 0 || this.highScore >= skin.req || localStorage.getItem(`oduncu_unlocked_${skin.id}`) === 'true';
        const isSelected = this.selectedSkinId === skin.id;

        const card = document.createElement('div');
        card.className = `skin-card ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;

        card.innerHTML = `
          <div class="skin-preview-icon">${skin.icon}</div>
          <div class="skin-name">${skin.name}</div>
          <div class="skin-req">${isUnlocked ? 'Kullanıma Hazır' : `${skin.req} Skor Gerektirir`}</div>
          <div class="skin-badge">${isSelected ? 'Seçildi' : isUnlocked ? 'Seç' : 'Kilitli'}</div>
        `;

        if (isUnlocked) {
          card.addEventListener('click', () => {
            this.selectedSkinId = skin.id;
            localStorage.setItem('oduncu_selected_skin', skin.id);
            this.sounds.playClick();
            this.renderSkinGrid();
          });
        }

        container.appendChild(card);
      });
    }

    // --- OYUN GÜNCELLEME VE ÇİZİM DÖNGÜSÜ ---
    loop(timestamp) {
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      this.update(dt);
      this.draw();

      requestAnimationFrame((ts) => this.loop(ts));
    }

    update(dt) {
      if (this.state === 'PLAYING') {
        // Zaman sayacı azaltımı (Skor arttıkça hızlanır)
        const currentDrain = this.timerDrainRate + Math.min(32, this.score * 0.22);
        this.timer -= currentDrain * dt;

        if (this.timer <= 0) {
          this.timer = 0;
          this.gameOver('timeout');
        }

        // Timer Bar UI
        const pct = Math.max(0, Math.min(100, (this.timer / this.maxTimer) * 100));
        this.timerBar.style.width = `${pct}%`;
        if (pct < 25) {
          this.timerBar.classList.add('critical');
        } else {
          this.timerBar.classList.remove('critical');
        }
      }

      // Oduncu vuruş animasyonu geri dönüşü
      if (this.playerAnimTimer > 0) {
        this.playerAnimTimer -= dt;
        if (this.playerAnimTimer <= 0 && this.state !== 'GAMEOVER') {
          this.playerAnim = 'idle';
        }
      }

      // Ekran sarsıntısı sönümü
      if (this.shakeIntensity > 0) {
        this.shakeIntensity = Math.max(0, this.shakeIntensity - 35 * dt);
      }

      // Uçan odunlar fiziği
      for (let i = this.flyingLogs.length - 1; i >= 0; i--) {
        const log = this.flyingLogs[i];
        log.x += log.vx;
        log.y += log.vy;
        log.vy += log.gravity;
        log.rotation += log.vRot;
        log.opacity -= 0.015;

        if (log.y > this.height + 150 || log.opacity <= 0) {
          this.flyingLogs.splice(i, 1);
        }
      }

      // Ahşap kıymıkları ve parçacıklar
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.vRot;
        p.life -= p.decay;

        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }

      // Uçuşan yapraklar / arkaplan tanecikleri
      for (let i = 0; i < this.backgroundLeaves.length; i++) {
        const leaf = this.backgroundLeaves[i];
        leaf.x += leaf.vx;
        leaf.y += leaf.vy;
        leaf.rot += leaf.rotSpeed;

        if (leaf.y > this.height + 20) {
          leaf.y = -20;
          leaf.x = Math.random() * this.width;
        }
        if (leaf.x < -20) leaf.x = this.width + 20;
        if (leaf.x > this.width + 20) leaf.x = -20;
      }

      // Uçan yazılar
      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y += ft.vy;
        ft.opacity -= 0.02;
        ft.scale = Math.max(1, ft.scale - 0.01);
        if (ft.opacity <= 0) {
          this.floatingTexts.splice(i, 1);
        }
      }
    }

    // --- GRAFİK ÇİZİM (CANVAS RENDER) ---
    draw() {
      const ctx = this.ctx;
      ctx.save();
      ctx.scale(this.dpr, this.dpr);

      // Ekran sarsıntısı uygulama
      if (this.shakeIntensity > 0) {
        const sx = (Math.random() - 0.5) * this.shakeIntensity;
        const sy = (Math.random() - 0.5) * this.shakeIntensity;
        ctx.translate(sx, sy);
      }

      // 1. Arka Planı Çiz (Skora göre değişen atmosfer)
      this.drawAtmosphericBackground(ctx);

      // 2. Arkaplan Uçuşan Parçacıkları (Yapraklar / Kar)
      this.drawBackgroundLeaves(ctx);

      // 3. Ağaç Gövdesini ve Dalları Çiz
      this.drawTree(ctx);

      // 4. Oduncuyu Çiz
      this.drawLumberjack(ctx);

      // 5. Uçan Kesilmiş Odunlar
      this.drawFlyingLogs(ctx);

      // 6. Ahşap Kıymıkları / Efektler
      this.drawParticles(ctx);

      // 7. Zemin Çimleri ve Kütük Tabanı
      this.drawGround(ctx);

      // 8. Uçan Metinler
      this.drawFloatingTexts(ctx);

      ctx.restore();
    }

    // Atmosfer & Manzara
    drawAtmosphericBackground(ctx) {
      const w = this.width;
      const h = this.height;

      // Seviye teması: 0-29 Gündüz, 30-69 Gün Batımı, 70-119 Gece, 120+ Kış
      let topColor = '#388e3c';
      let bottomColor = '#a5d6a7';
      let mountainColor = '#2e7d32';

      if (this.score >= 120) {
        // Kış Teması
        topColor = '#455a64';
        bottomColor = '#cfd8dc';
        mountainColor = '#607d8b';
      } else if (this.score >= 70) {
        // Gece Teması
        topColor = '#0d1b2a';
        bottomColor = '#1b263b';
        mountainColor = '#243447';
      } else if (this.score >= 30) {
        // Gün Batımı
        topColor = '#b71c1c';
        bottomColor = '#ff8f00';
        mountainColor = '#5d4037';
      } else {
        // Orman Yeşili / Mavi Gökyüzü
        topColor = '#4fc3f7';
        bottomColor = '#b2ebf2';
        mountainColor = '#2e7d32';
      }

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, topColor);
      grad.addColorStop(1, bottomColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Güneş veya Ay
      ctx.save();
      if (this.score >= 70 && this.score < 120) {
        // Ay
        ctx.fillStyle = '#fffde7';
        ctx.beginPath();
        ctx.arc(w * 0.8, 110, 32, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.score < 70) {
        // Güneş
        ctx.fillStyle = '#fff59d';
        ctx.shadowColor = '#ffe082';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(w * 0.8, 120, 38, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Uzaktaki Çam Dağları Silüeti
      ctx.fillStyle = mountainColor;
      ctx.beginPath();
      ctx.moveTo(0, h - 180);
      for (let x = 0; x <= w; x += 40) {
        const peakY = h - 220 - Math.sin(x * 0.02) * 50 - Math.cos(x * 0.05) * 20;
        ctx.lineTo(x, peakY);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
    }

    drawBackgroundLeaves(ctx) {
      for (const leaf of this.backgroundLeaves) {
        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.rot);
        ctx.fillStyle = leaf.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.size, leaf.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Ağaç Gövdesi ve Dalların Çizimi
    drawTree(ctx) {
      const centerX = this.width / 2;
      const tw = this.trunkWidth;
      const th = this.trunkHeight;

      for (let i = 0; i < this.trunkSegments.length; i++) {
        const seg = this.trunkSegments[i];
        const segY = this.trunkBaseY - i * th;

        // Görünür alanın çok üstündeyse çizme
        if (segY < -th * 2) continue;

        // Gövde Parçasını Çiz
        this.drawTrunkSegment(ctx, centerX, segY, tw, th, seg);

        // Dal Varsa Dalı Çiz
        if (seg.branch !== 'none') {
          this.drawBranch(ctx, centerX, segY, tw, th, seg.branch);
        }
      }
    }

    drawTrunkSegment(ctx, centerX, y, w, h, seg) {
      const x = centerX - w / 2;

      // Dış Kabuk
      const barkGrad = ctx.createLinearGradient(x, y, x + w, y);
      barkGrad.addColorStop(0, '#3e2723');
      barkGrad.addColorStop(0.2, '#5d4037');
      barkGrad.addColorStop(0.5, '#6d4c41');
      barkGrad.addColorStop(0.85, '#5d4037');
      barkGrad.addColorStop(1, '#3e2723');

      ctx.fillStyle = barkGrad;
      ctx.fillRect(x, y, w, h);

      // Kabuk çizgileri & Doku
      ctx.strokeStyle = 'rgba(33, 19, 14, 0.45)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.25, y);
      ctx.lineTo(x + w * 0.28, y + h);
      ctx.moveTo(x + w * 0.65, y);
      ctx.lineTo(x + w * 0.62, y + h);
      ctx.stroke();

      // Yatay halka çizgisi (kütük sınırı)
      ctx.strokeStyle = '#271612';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.stroke();
    }

    drawBranch(ctx, centerX, y, tw, th, side) {
      const isLeft = side === 'left';
      const branchLength = Math.max(90, tw * 1.1);
      const branchHeight = th * 0.45;
      const branchY = y + th * 0.28;

      ctx.save();

      // Dal Gövdesi
      const bx = isLeft ? centerX - tw / 2 - branchLength : centerX + tw / 2;
      const bgGrad = ctx.createLinearGradient(bx, branchY, bx + branchLength, branchY);
      bgGrad.addColorStop(0, isLeft ? '#4e342e' : '#3e2723');
      bgGrad.addColorStop(1, isLeft ? '#3e2723' : '#4e342e');

      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      if (isLeft) {
        ctx.moveTo(centerX - tw / 2, branchY);
        ctx.lineTo(bx, branchY + 6);
        ctx.lineTo(bx, branchY + branchHeight - 6);
        ctx.lineTo(centerX - tw / 2, branchY + branchHeight);
      } else {
        ctx.moveTo(centerX + tw / 2, branchY);
        ctx.lineTo(bx + branchLength, branchY + 6);
        ctx.lineTo(bx + branchLength, branchY + branchHeight - 6);
        ctx.lineTo(centerX + tw / 2, branchY + branchHeight);
      }
      ctx.closePath();
      ctx.fill();

      // Dalın ucu kesilmiş ahşap halkası
      ctx.fillStyle = '#ffcc80';
      ctx.beginPath();
      const endX = isLeft ? bx : bx + branchLength;
      ctx.ellipse(endX, branchY + branchHeight / 2, 6, branchHeight / 2 - 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4e342e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Dal Yaprakları / İbreli Çam İğneleri
      const leafColor = this.score >= 120 ? '#eceff1' : '#2e7d32';
      ctx.fillStyle = leafColor;
      for (let j = 0; j < 3; j++) {
        const lx = isLeft ? bx + j * 26 + 10 : bx + branchLength - j * 26 - 10;
        const ly = branchY - 6;
        ctx.beginPath();
        ctx.arc(lx, ly, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Oduncunun Çizimi
    drawLumberjack(ctx) {
      const skin = this.getCurrentSkin();
      const centerX = this.width / 2;
      const tw = this.trunkWidth;
      const isLeft = this.playerSide === 'left';

      // Oduncunun X konumu (Ağacın solunda veya sağında)
      const playerX = isLeft ? centerX - tw / 2 - 55 : centerX + tw / 2 + 55;
      const playerY = this.trunkBaseY + this.trunkHeight - 10;

      ctx.save();
      ctx.translate(playerX, playerY);

      // Eğer sağdaysa karakteri yatayda aynala
      if (!isLeft) {
        ctx.scale(-1, 1);
      }

      // Duruma göre çizim
      if (this.playerAnim === 'dead') {
        this.drawDeadLumberjack(ctx, skin);
      } else if (this.playerAnim === 'chop') {
        this.drawChoppingLumberjack(ctx, skin);
      } else {
        this.drawIdleLumberjack(ctx, skin);
      }

      ctx.restore();
    }

    drawIdleLumberjack(ctx, skin) {
      // Bacaklar & Çizmeler
      ctx.fillStyle = '#263238';
      ctx.fillRect(-14, -28, 10, 28);
      ctx.fillRect(4, -28, 10, 28);

      // Kahverengi Çizmeler
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(-17, -8, 14, 8);
      ctx.fillRect(1, -8, 14, 8);

      // Gövde / Gömlek
      ctx.fillStyle = skin.shirtColor;
      ctx.fillRect(-16, -60, 32, 34);

      // Ekose çizgileri
      if (skin.shirtPattern === 'plaid') {
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-16, -45);
        ctx.lineTo(16, -45);
        ctx.moveTo(0, -60);
        ctx.lineTo(0, -26);
        ctx.stroke();
      }

      // Kemer
      ctx.fillStyle = '#212121';
      ctx.fillRect(-16, -30, 32, 5);
      ctx.fillStyle = '#ffb300';
      ctx.fillRect(-4, -31, 8, 7);

      // Kafa & Yüz
      ctx.fillStyle = '#ffcc80'; // Ten rengi
      ctx.beginPath();
      ctx.arc(0, -74, 15, 0, Math.PI * 2);
      ctx.fill();

      // Sakal / Bıyık
      ctx.fillStyle = skin.beardColor;
      ctx.beginPath();
      ctx.arc(5, -70, 11, 0, Math.PI * 0.9);
      ctx.fill();

      // Göz
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(6, -76, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Bere / Başlık
      ctx.fillStyle = skin.hatColor;
      ctx.beginPath();
      ctx.arc(0, -82, 16, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-16, -83, 32, 6);

      // Balta (Boşta dururken omzunda)
      ctx.save();
      ctx.translate(-10, -50);
      ctx.rotate(-0.4);

      // Sap
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(-3, -35, 6, 45);

      // Balta Başı
      ctx.fillStyle = skin.axeHead;
      ctx.beginPath();
      ctx.moveTo(-3, -35);
      ctx.lineTo(-18, -39);
      ctx.lineTo(-14, -22);
      ctx.lineTo(-3, -24);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    drawChoppingLumberjack(ctx, skin) {
      // Vuruş pozisyonu: Gövde öne eğik, balta ağaca doğru savrulmuş
      ctx.save();
      ctx.rotate(0.12);

      // Bacaklar gergin
      ctx.fillStyle = '#263238';
      ctx.fillRect(-18, -26, 11, 26);
      ctx.fillRect(6, -26, 11, 26);

      // Çizmeler
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(-22, -6, 15, 6);
      ctx.fillRect(4, -6, 15, 6);

      // Gövde
      ctx.fillStyle = skin.shirtColor;
      ctx.fillRect(-12, -58, 34, 34);

      // Kemer
      ctx.fillStyle = '#212121';
      ctx.fillRect(-12, -28, 34, 5);

      // Kafa
      ctx.fillStyle = '#ffcc80';
      ctx.beginPath();
      ctx.arc(10, -70, 15, 0, Math.PI * 2);
      ctx.fill();

      // Sakal
      ctx.fillStyle = skin.beardColor;
      ctx.beginPath();
      ctx.arc(14, -66, 11, 0, Math.PI * 0.9);
      ctx.fill();

      // Göz (Kararlı vuruş bakışı)
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(13, -73);
      ctx.lineTo(19, -71);
      ctx.stroke();

      // Bere
      ctx.fillStyle = skin.hatColor;
      ctx.beginPath();
      ctx.arc(10, -78, 16, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-5, -79, 32, 6);

      // Balta vuruş savrulması ve balta izi
      ctx.save();
      ctx.translate(25, -45);
      ctx.rotate(1.2);

      // Balta Rüzgarı / Savurma İzi (Axe streak)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(-10, -10, 48, -0.6, 1.2);
      ctx.stroke();

      // Balta Sapı
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(-4, -40, 8, 55);

      // Balta Başı (Ağaca saplanan yön)
      ctx.fillStyle = skin.axeHead;
      ctx.beginPath();
      ctx.moveTo(4, -38);
      ctx.lineTo(24, -44);
      ctx.lineTo(20, -22);
      ctx.lineTo(4, -26);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
      ctx.restore();
    }

    drawDeadLumberjack(ctx, skin) {
      // Yere serilmiş / nakavt olmuş oduncu
      ctx.save();
      ctx.rotate(Math.PI / 2);
      ctx.translate(35, 15);

      // Bacaklar
      ctx.fillStyle = '#263238';
      ctx.fillRect(-12, -25, 10, 25);
      ctx.fillRect(4, -25, 10, 25);

      // Gövde
      ctx.fillStyle = skin.shirtColor;
      ctx.fillRect(-14, -55, 30, 32);

      // Kafa
      ctx.fillStyle = '#ffcc80';
      ctx.beginPath();
      ctx.arc(0, -68, 14, 0, Math.PI * 2);
      ctx.fill();

      // Gözler X şeklinde (nakavt)
      ctx.strokeStyle = '#d32f2f';
      ctx.lineWidth = 2.5;
      // Sol X
      ctx.beginPath();
      ctx.moveTo(-5, -72);
      ctx.lineTo(1, -66);
      ctx.moveTo(1, -72);
      ctx.lineTo(-5, -66);
      // Sağ X
      ctx.moveTo(4, -72);
      ctx.lineTo(10, -66);
      ctx.moveTo(10, -72);
      ctx.lineTo(4, -66);
      ctx.stroke();

      // Başının üstünde dönen yıldızlar
      ctx.fillStyle = '#ffd54f';
      const time = performance.now() * 0.005;
      for (let s = 0; s < 3; s++) {
        const ang = time + s * ((Math.PI * 2) / 3);
        const starX = Math.cos(ang) * 16;
        const starY = -86 + Math.sin(ang) * 6;
        ctx.beginPath();
        ctx.arc(starX, starY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Uçan Kesilmiş Kütükler
    drawFlyingLogs(ctx) {
      for (const log of this.flyingLogs) {
        ctx.save();
        ctx.translate(log.x, log.y);
        ctx.rotate(log.rotation);
        ctx.globalAlpha = Math.max(0, log.opacity);

        // Kütük gövdesi
        const w = log.width * 0.85;
        const h = log.height * 0.85;
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(-w / 2, -h / 2, w, h);

        // Kütük kesim ucu (ahşap halkaları)
        ctx.fillStyle = '#ffcc80';
        ctx.beginPath();
        ctx.ellipse(w / 2, 0, 8, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4e342e';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
      }
    }

    // Parçacıklar
    drawParticles(ctx) {
      for (const p of this.particles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        ctx.restore();
      }
    }

    // Zemin ve Kütük Tabanı
    drawGround(ctx) {
      const w = this.width;
      const h = this.height;
      const groundY = this.trunkBaseY + this.trunkHeight;

      // Zemin / Çimen
      const groundColor = this.score >= 120 ? '#eceff1' : '#1b5e20';
      ctx.fillStyle = groundColor;
      ctx.fillRect(0, groundY, w, h - groundY);

      // Çimen Püskülleri
      ctx.fillStyle = this.score >= 120 ? '#cfd8dc' : '#2e7d32';
      for (let x = 10; x < w; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x + 5, groundY - 8);
        ctx.lineTo(x + 10, groundY);
        ctx.fill();
      }

      // Kök Tabanı / Ağaç Köşesi
      const treeX = w / 2;
      const tw = this.trunkWidth;
      ctx.fillStyle = '#2e1913';
      ctx.beginPath();
      ctx.moveTo(treeX - tw / 2 - 14, groundY + 25);
      ctx.lineTo(treeX - tw / 2, groundY);
      ctx.lineTo(treeX + tw / 2, groundY);
      ctx.lineTo(treeX + tw / 2 + 14, groundY + 25);
      ctx.closePath();
      ctx.fill();
    }

    // Uçan Metinler
    drawFloatingTexts(ctx) {
      for (const ft of this.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.opacity);
        ctx.font = `bold ${Math.round(22 * ft.scale)}px 'Impact', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }
    }
  }

  // DOM Yüklendiğinde Oyunu Başlat
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new LumberjackGame();
  });
})();
