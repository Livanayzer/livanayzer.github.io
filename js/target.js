(function() {
  // ============ КОНФИГУРАЦИЯ ============
  var CONFIG = {
    comboTimeout: 2500,
    particleBaseCount: 5,
    maxParticles: 200,
    ctaIntervalAfterMax: 15,
    bossHP: 30,
    bossDuration: 8000,
    audio: { hit: 0.12, combo: 0.25, milestone: 0.4, cta: 0.2 },
    throttleDelay: 16 // ~60fps
  };

  var MILESTONES = {
    3:  { text: 'ТОЧНО!',   color: '#ffffff' },
    5:  { text: 'КРУТО!',   color: '#ffd700', sound: 'hit', soundVol: 0.1 },
    10: { text: 'ОГОНЬ!',   color: '#ff8800', sound: 'combo', soundVol: 0.25, cta: true },
    15: { text: 'СУПЕР!',   color: '#ff8800', cta: true },
    20: { text: 'МЕГА!',    color: '#ff4444', sound: 'milestone', soundVol: 0.35, cta: true, burst: true },
    30: { text: 'УЛЬТРА!',  color: '#ff4444', sound: 'milestone', soundVol: 0.4, cta: true, burst: true, chainReaction: true },
    40: { text: 'МАСТЕР!',  color: '#ff4444', sound: 'combo', soundVol: 0.3, cta: true, burst: true, chainReaction: true },
    50: { text: 'ЛЕГЕНДА!', color: '#ff4444', sound: 'milestone', soundVol: 0.5, cta: true, burst: true, chainReaction: true, spawnBoss: true }
  };

  var SECRET_PHRASES = {
    7:  '🍀 Счастливое число!',
    13: '🎃 Чёртова дюжина!',
    42: '🤔 Ответ на всё!',
    69: '😏 Nice!',
    100: '💯 СОТНЯ! Вы легенда!'
  };

  var CTA_MESSAGES = [
    ['Готовы к проекту?', 'Обсудим сегодня'],
    ['Нужна надёжная', 'IT-инфраструктура?'],
    ['Позвоните —', 'приедем завтра'],
    ['Бесплатный выезд', 'инженера на объект'],
    ['Скидка 10%', 'на первый заказ'],
    ['Доверьте IT нам —', 'занимайтесь бизнесом'],
    ['12 месяцев', 'гарантии на монтаж'],
    ['Поддержка 24/7', 'без выходных'],
    ['Прозрачная смета', 'без сюрпризов'],
    ['На связи', 'Telegram / WhatsApp']
  ];

  var BOSS_CTA = '🔥 БОСС ПОВЕРЖЕН!';

  // ============ DOM ЭЛЕМЕНТЫ ============
  var heroTarget = document.getElementById('heroTarget');
  var nodeCenter = document.getElementById('nodeCenter');
  var hitRipple = document.getElementById('hitRipple');
  var comboCounter = document.getElementById('comboCounter');
  var heroParticles = document.getElementById('heroParticles');

  if (!heroTarget) return;

  // ============ СОСТОЯНИЕ ============
  var comboCount = 0;
  var totalScore = 0;
  var comboTimer = null;
  var lastCTAShown = -1;
  var berserkMode = false;
  var berserkTimer = null;
  var berserkClicks = 0;
  var activeParticles = 0;
  var perfectHits = 0;
  var hasFirstBlood = false;
  var chainReactionActive = false;
  var chainReactionTimer = null;
  var lastHitTime = 0;
  var throttleTimer = null;

  // Босс
  var bossActive = false;
  var bossHP = 0;
  var bossTimer = null;
  var bossEl = null;
  var bossHPFill = null;

  // Достижения
  var achievements = JSON.parse(localStorage.getItem('haze_achievements') || '{}');

  var ACHIEVEMENTS = {
    firstBlood:    { icon: '🩸', name: 'Первая кровь', desc: 'Первый клик по мишени' },
    sniper:        { icon: '🎯', name: 'Снайпер', desc: '10 идеальных попаданий' },
    berserker:     { icon: '⚡', name: 'Берсерк', desc: 'Активировать режим берсерка' },
    kojima:        { icon: '🎮', name: 'Кодзима', desc: 'Найти пасхалку Konami Code' },
    fifty:         { icon: '👑', name: 'Полтинник', desc: 'Достичь комбо ×50' },
    bossSlayer:    { icon: '🐉', name: 'Убийца боссов', desc: 'Победить босса' },
    centurion:     { icon: '💯', name: 'Центурион', desc: 'Комбо ×100' },
    lucky7:        { icon: '🍀', name: 'Счастливчик', desc: 'Поймать комбо ×7' }
  };

  var konamiCode = [];
  var KONAMI_SEQUENCE = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

  // ============ AUDIO ============
  var audioCtx = null;
  var audioBuffers = {};
  var audioInitialized = false;

  function initAudio() {
    if (audioInitialized) return;
    
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Создаём простые звуки синтетически (чтобы не зависеть от файлов)
      audioInitialized = true;
      
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    } catch(e) {
      console.warn('Web Audio API не поддерживается');
    }
  }

  function playBeep(frequency, duration, volume) {
    if (!audioCtx || !audioInitialized) return;
    
    try {
      var now = audioCtx.currentTime;
      var oscillator = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      
      oscillator.frequency.value = frequency || 880;
      gain.gain.value = volume || 0.15;
      
      oscillator.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, now + (duration || 0.1));
      oscillator.stop(now + (duration || 0.1));
    } catch(e) {}
  }

  function playSound(name, volume, rate) {
    if (!audioInitialized) return;
    
    var sounds = {
      hit: { freq: 660, dur: 0.08 },
      combo: { freq: 880, dur: 0.12 },
      milestone: { freq: 1046.5, dur: 0.2 }
    };
    
    var s = sounds[name] || sounds.hit;
    playBeep(s.freq, s.dur, volume || 0.15);
  }

  // ============ ДОСТИЖЕНИЯ ============
  function unlockAchievement(id) {
    if (achievements[id]) return;
    achievements[id] = Date.now();
    try { localStorage.setItem('haze_achievements', JSON.stringify(achievements)); } catch(e) {}
    
    var ach = ACHIEVEMENTS[id];
    if (!ach) return;
    
    var rect = heroTarget.getBoundingClientRect();
    showFloatingText(rect.left + rect.width / 2, rect.top - 80, ach.icon + ' ' + ach.name + '!', '#ffd700');
    playSound('milestone', 0.5, 1.2);
  }

  // ============ СЧЁТЧИК ОЧКОВ ============
  var scoreEl = document.createElement('div');
  scoreEl.id = 'scoreDisplay';
  scoreEl.style.cssText = 
    'position:absolute;top:12px;right:16px;font-size:13px;font-weight:600;' +
    'color:rgba(255,255,255,0.6);letter-spacing:1px;pointer-events:none;z-index:3;';
  heroTarget.appendChild(scoreEl);

  function updateScore(points) {
    totalScore += points;
    scoreEl.textContent = '★ ' + totalScore;
  }

  // ============ PARTICLE SYSTEM (ОПТИМИЗИРОВАН) ============
  function clearOldParticles() {
    if (heroParticles.children.length > CONFIG.maxParticles) {
      var toRemove = heroParticles.children.length - CONFIG.maxParticles;
      for (var i = 0; i < toRemove; i++) {
        if (heroParticles.firstChild) heroParticles.firstChild.remove();
      }
      activeParticles = heroParticles.children.length;
    }
  }

  function spawnParticles(x, y, count, color, size, spread) {
    clearOldParticles();
    
    count = Math.min(count, 30);
    if (count <= 0) return;
    
    var frag = document.createDocumentFragment();
    
    for (var i = 0; i < count; i++) {
      var p = document.createElement('div');
      p.className = 'hero-particle';
      var angle = Math.random() * Math.PI * 2;
      var dist = (spread || 40) * (0.3 + Math.random() * 0.7);
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.width = (size || 2) + 'px';
      p.style.height = (size || 2) + 'px';
      p.style.backgroundColor = color || '#ffffff';
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      p.style.opacity = (0.5 + Math.random() * 0.5);
      
      p.addEventListener('animationend', function() {
        this.remove();
      });
      
      frag.appendChild(p);
    }
    
    heroParticles.appendChild(frag);
  }

  // ============ FLOATING TEXT ============
  function showFloatingText(x, y, text, color) {
    var el = document.createElement('div');
    el.className = 'hero-floating-text';
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = color || '#ffffff';
    el.style.fontSize = '16px';
    el.style.fontWeight = 'bold';
    el.style.textShadow = '0 0 20px ' + (color || '#ffffff');
    el.style.whiteSpace = 'nowrap';
    el.addEventListener('animationend', function() { el.remove(); });
    document.body.appendChild(el);
  }

  // ============ CTA POPUP ============
  function showCTA(x, y, customText) {
    var msg = customText || CTA_MESSAGES[Math.floor(Math.random() * CTA_MESSAGES.length)];
    var container = document.createElement('div');
    container.className = 'hero-cta-popup';
    container.style.left = x + 'px';
    container.style.top = y + 'px';
    container.addEventListener('animationend', function() { container.remove(); });
    
    if (typeof msg === 'string') {
      container.innerHTML = 
        '<div class="hero-cta-glow"></div>' +
        '<div class="hero-cta-card" style="white-space:pre-line;font-size:15px;">' + msg + '</div>';
    } else {
      container.innerHTML = 
        '<div class="hero-cta-glow"></div>' +
        '<div class="hero-cta-card">' +
          '<div class="hero-cta-line1">' + msg[0] + '</div>' +
          '<div class="hero-cta-line2">' + msg[1] + '</div>' +
        '</div>';
    }
    
    document.body.appendChild(container);
    playSound('milestone', CONFIG.audio.cta, 0.9);
  }

  // ============ БОСС ============
  function spawnBoss(x, y) {
    if (bossActive) return;
    
    bossActive = true;
    bossHP = CONFIG.bossHP;
    
    bossEl = document.createElement('div');
    bossEl.className = 'hero-boss';
    bossEl.style.cssText = 
      'position:fixed;left:' + (x - 50) + 'px;top:' + (y - 80) + 'px;width:100px;height:100px;' +
      'background:radial-gradient(circle,#ff4444,#990000);border-radius:50%;' +
      'border:3px solid #ffd700;box-shadow:0 0 40px rgba(255,0,0,0.8);' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
      'z-index:1000;cursor:pointer;';
    
    bossEl.innerHTML = '<div style="font-size:40px;pointer-events:none;">👾</div><div style="font-size:12px;color:#fff;pointer-events:none;">БОСС</div>';
    
    var bossHPBar = document.createElement('div');
    bossHPBar.style.cssText = 
      'position:absolute;bottom:-20px;left:0;width:100%;height:8px;background:#330000;border-radius:4px;overflow:hidden;';
    bossHPFill = document.createElement('div');
    bossHPFill.style.cssText = 'width:100%;height:100%;background:#ff4444;transition:width 0.1s ease;';
    bossHPBar.appendChild(bossHPFill);
    bossEl.appendChild(bossHPBar);
    
    bossEl.addEventListener('click', function(e) {
      e.stopPropagation();
      hitBoss(e.clientX, e.clientY);
    });
    
    document.body.appendChild(bossEl);
    
    bossTimer = setTimeout(function() {
      if (bossActive) defeatBoss(false);
    }, CONFIG.bossDuration);
    
    setTimeout(function() { if (bossEl) bossEl.style.transform = 'scale(1)'; }, 10);
    showFloatingText(x, y - 60, '⚠️ БОСС ПОЯВИЛСЯ! ⚠️', '#ff4444');
    playSound('milestone', 0.6, 0.7);
  }
  
  function hitBoss(clickX, clickY) {
    if (!bossActive || !bossEl) return;
    
    bossHP--;
    
    if (bossHPFill) {
      var percent = (bossHP / CONFIG.bossHP) * 100;
      bossHPFill.style.width = percent + '%';
    }
    
    spawnParticles(clickX, clickY, 15, '#ff4444', 3, 60);
    playSound('hit', 0.3, 1.4);
    
    bossEl.style.transform = 'scale(0.85)';
    setTimeout(function() { if (bossEl) bossEl.style.transform = 'scale(1)'; }, 100);
    showFloatingText(clickX, clickY - 20, 'УРОН!', '#ff8888');
    
    if (bossHP <= 0) {
      clearTimeout(bossTimer);
      defeatBoss(true);
    }
  }

  function defeatBoss(won) {
    if (!bossActive) return;
    
    bossActive = false;
    var rect = heroTarget.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    
    if (bossEl) {
      bossEl.remove();
      bossEl = null;
    }
    bossHPFill = null;
    
    if (won) {
      spawnParticles(cx, cy, 40, '#ffd700', 4, 180);
      showFloatingText(cx, cy - 50, '🏆 ПОБЕДА! +500 ★', '#ffd700');
      showCTA(cx, cy - 100, BOSS_CTA);
      unlockAchievement('bossSlayer');
      updateScore(500);
    } else {
      showFloatingText(cx, cy - 50, '💀 Босс ушёл...', '#888888');
      spawnParticles(cx, cy, 20, '#888888', 2, 100);
    }
  }

  // ============ ЦЕПНАЯ РЕАКЦИЯ ============
  function activateChainReaction() {
    if (chainReactionActive) {
      clearTimeout(chainReactionTimer);
    }
    chainReactionActive = true;
    
    var cards = document.querySelectorAll('.service-card, .case-card, .guarantee-card, .blog-card');
    cards.forEach(function(card) {
      card.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
      card.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      card.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.05)';
    });
    
    chainReactionTimer = setTimeout(function() {
      chainReactionActive = false;
      cards.forEach(function(card) {
        card.style.borderColor = '';
        card.style.boxShadow = '';
      });
    }, 2000);
  }

  // ============ БЕРСЕРК ============
  function activateBerserkMode() {
    if (berserkMode) return;
    berserkMode = true;
    heroTarget.style.borderColor = 'rgba(255, 50, 50, 0.6)';
    heroTarget.style.boxShadow = '0 0 40px rgba(255, 50, 50, 0.3)';
    
    var rect = heroTarget.getBoundingClientRect();
    showFloatingText(rect.left + rect.width / 2, rect.top - 20, '⚡ БЕРСЕРК! ⚡', '#ff3333');
    playSound('milestone', 0.6, 0.8);
    unlockAchievement('berserker');
    
    clearTimeout(berserkTimer);
    berserkTimer = setTimeout(function() {
      berserkMode = false;
      berserkClicks = 0;
      heroTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      heroTarget.style.boxShadow = '';
    }, 5000);
  }

  // ============ КОМБО ДИСПЛЕЙ ============
  function updateComboDisplay(text, color) {
    if (comboCounter && text) {
      comboCounter.textContent = text;
      comboCounter.style.color = color;
      comboCounter.classList.remove('show');
      setTimeout(function() { if (comboCounter) comboCounter.classList.add('show'); }, 10);
    } else if (comboCounter && !text) {
      comboCounter.classList.remove('show');
      comboCounter.textContent = '';
    }
  }

  // ============ ОБРАБОТКА MILESTONES ============
  function processMilestones(comboBefore, comboAfter, cx, cy) {
    var achievedMilestones = [];
    var keys = Object.keys(MILESTONES).map(Number).sort(function(a,b){ return a-b; });
    
    for (var i = 0; i < keys.length; i++) {
      var threshold = keys[i];
      if (comboBefore < threshold && comboAfter >= threshold) {
        achievedMilestones.push(threshold);
      }
    }
    
    var secretKeys = Object.keys(SECRET_PHRASES).map(Number);
    for (var i = 0; i < secretKeys.length; i++) {
      var secretThreshold = secretKeys[i];
      if (comboBefore < secretThreshold && comboAfter >= secretThreshold) {
        showFloatingText(cx, cy - 40, SECRET_PHRASES[secretThreshold], '#ffd700');
        if (secretThreshold === 7) unlockAchievement('lucky7');
        if (secretThreshold === 100) unlockAchievement('centurion');
      }
    }
    
    var hasBurst = false;
    var hasChainReaction = false;
    var hasCTA = false;
    var hasBoss = false;
    var currentText = '';
    var currentColor = '#ffffff';
    
    for (var i = 0; i < achievedMilestones.length; i++) {
      var m = MILESTONES[achievedMilestones[i]];
      if (!m) continue;
      
      currentText = '×' + comboAfter + ' ' + m.text;
      currentColor = m.color;
      
      if (m.sound) playSound(m.sound, m.soundVol || 0.2, m.soundRate || 1);
      if (m.burst) hasBurst = true;
      if (m.chainReaction) hasChainReaction = true;
      if (m.cta) hasCTA = true;
      if (m.spawnBoss) hasBoss = true;
      
      if (achievedMilestones[i] === 50) unlockAchievement('fifty');
      updateScore(50);
    }
    
    if (hasBurst) {
      spawnParticles(cx, cy, 25, '#ffd700', 3, 100);
      heroTarget.style.boxShadow = berserkMode ? '0 0 80px rgba(255,50,50,0.8)' : '0 0 60px rgba(255,215,0,0.5)';
      setTimeout(function() { heroTarget.style.boxShadow = ''; }, 400);
    }
    if (hasChainReaction) activateChainReaction();
    if (hasBoss) spawnBoss(cx, cy);
    if (hasCTA) showCTA(cx, cy - 70);
    
    if (achievedMilestones.length === 0 && comboAfter > 1) {
      for (var i = keys.length - 1; i >= 0; i--) {
        if (comboAfter >= keys[i]) {
          currentText = '×' + comboAfter + ' ' + MILESTONES[keys[i]].text;
          currentColor = MILESTONES[keys[i]].color;
          break;
        }
      }
    }
    
    if (comboAfter > 1) {
      updateComboDisplay(currentText, currentColor);
    } else {
      updateComboDisplay(null, null);
    }
    
    return achievedMilestones.length > 0;
  }

  // ============ KONAMI CODE ============
  function checkKonamiCode() {
    var rect = heroTarget.getBoundingClientRect();
    showFloatingText(rect.left + rect.width / 2, rect.top + rect.height / 2, '🎉 EASTER EGG! 🎉', '#ff00ff');
    for (var i = 0; i < 5; i++) {
      (function(d) {
        setTimeout(function() {
          spawnParticles(rect.left + Math.random() * rect.width, rect.top + Math.random() * rect.height, 15, '#ff00ff', 4, 60);
        }, d * 200);
      })(i);
    }
    playSound('milestone', 0.7, 1.5);
    unlockAchievement('kojima');
  }

  // ============ ОСНОВНОЙ ОБРАБОТЧИК ============
  function handleHit(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Инициализируем аудио при первом хите
    if (!audioInitialized) {
      initAudio();
    }
    
    // Throttle для производительности
    var now = Date.now();
    if (throttleTimer) return;
    throttleTimer = setTimeout(function() { throttleTimer = null; }, CONFIG.throttleDelay);
    
    var rect = heroTarget.getBoundingClientRect();
    var clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
    var clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    
    var distFromCenter = Math.sqrt(Math.pow(clientX - cx, 2) + Math.pow(clientY - cy, 2));
    var maxDist = rect.width / 2;
    var accuracy = 1 - Math.min(1, distFromCenter / maxDist);
    
    var multiplier = 1;
    var isPerfect = false;
    
    if (accuracy > 0.9) {
      multiplier = 2;
      isPerfect = true;
      perfectHits++;
      if (perfectHits >= 10) unlockAchievement('sniper');
    } else if (accuracy < 0.3) {
      multiplier = 0;
    }
    
    if (multiplier === 0) {
      comboCount = 0;
      showFloatingText(cx, cy, 'Промах!', '#ff0000');
      playSound('hit', 0.05, 0.3);
      updateComboDisplay(null, null);
      return;
    }
    
    var comboBefore = comboCount;
    comboCount++;
    updateScore(10 * multiplier);
    
    if (!hasFirstBlood) {
      hasFirstBlood = true;
      unlockAchievement('firstBlood');
    }
    
    clearTimeout(comboTimer);
    comboTimer = setTimeout(function() { 
      comboCount = 0;
      updateComboDisplay(null, null);
    }, CONFIG.comboTimeout);
    
    if (berserkMode) {
      berserkClicks++;
      comboCount += 2;
      spawnParticles(cx, cy, 8, '#ff3333', 2, 45);
      
      if (berserkClicks >= 15) {
        showFloatingText(cx, cy - 30, '💥 УЛЬТРА-УДАР! 💥', '#ff3333');
        spawnParticles(cx, cy, 40, '#ff3333', 3, 140);
        playSound('milestone', 0.7, 0.6);
        berserkClicks = 0;
        updateScore(100);
      }
    }
    
    if (comboCount >= 10 && !berserkMode) {
      activateBerserkMode();
    }
    
    playSound('hit', CONFIG.audio.hit, 0.7 + accuracy * 0.5);
    
    if (nodeCenter) {
      nodeCenter.classList.add('hit');
      setTimeout(function() { nodeCenter.classList.remove('hit'); }, 250);
    }
    
    if (hitRipple) {
      hitRipple.classList.add('expand');
      setTimeout(function() { hitRipple.classList.remove('expand'); }, 500);
    }
    
    var pColor = berserkMode ? '#ff3333' : (isPerfect ? '#ffd700' : '#ffffff');
    var pCount = Math.min(5 + Math.floor(comboCount / 5), 20);
    spawnParticles(cx, cy, pCount, pColor, 2, 45);
    
    if (multiplier === 2) {
      showFloatingText(clientX, clientY - 20, '×2!', '#ffd700');
    }
    
    processMilestones(comboBefore, comboCount, cx, cy);
    
    lastHitTime = now;
  }
  
  // Добавляем обработчики для мыши и тача
  heroTarget.addEventListener('click', handleHit);
  heroTarget.addEventListener('touchstart', handleHit, { passive: false });
  
  // KONAMI CODE
  document.addEventListener('keydown', function(e) {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > KONAMI_SEQUENCE.length) konamiCode.shift();
    
    var match = true;
    for (var i = 0; i < konamiCode.length; i++) {
      if (konamiCode[i] !== KONAMI_SEQUENCE[i]) {
        match = false;
        break;
      }
    }
    
    if (match && konamiCode.length === KONAMI_SEQUENCE.length) {
      checkKonamiCode();
      konamiCode = [];
    }
  });
  
  // Доступность
  heroTarget.setAttribute('tabindex', '0');
  heroTarget.setAttribute('role', 'button');
  heroTarget.setAttribute('aria-label', 'Кликер-мишень');
  
  heroTarget.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleHit(e);
    }
  });
  
  console.log('🎯 Target game initialized!');
})();