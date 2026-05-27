export function initCursor() {
  // Интерактивная мишень в hero
  const heroTarget = document.getElementById('heroTarget');
  const nodeCenter = document.getElementById('nodeCenter');
  const hitRipple = document.getElementById('hitRipple');
  const comboCounter = document.getElementById('comboCounter');
  const heroParticles = document.getElementById('heroParticles');
  const nodeRings = document.querySelectorAll('.node-ring');
  
  let comboCount = 0;
  let comboTimer = null;

  if (heroTarget) {
    heroTarget.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      comboCount++;
      
      // Сброс комбо через 1.5 секунды
      clearTimeout(comboTimer);
      comboTimer = setTimeout(() => {
        comboCount = 0;
      }, 1500);
      
      // Анимация центра
      if (nodeCenter) {
        nodeCenter.classList.add('hit');
        setTimeout(() => nodeCenter.classList.remove('hit'), 300);
      }
      
      // Анимация ripple
      if (hitRipple) {
        hitRipple.classList.add('expand');
        setTimeout(() => hitRipple.classList.remove('expand'), 600);
      }
      
      // Тряска колец
      nodeRings.forEach(ring => {
        ring.classList.add('shake');
        setTimeout(() => ring.classList.remove('shake'), 400);
      });
      
      // Комбо-счётчик
      if (comboCounter && comboCount > 1) {
        comboCounter.textContent = `×${comboCount}`;
        comboCounter.classList.remove('show');
        void comboCounter.offsetWidth;
        comboCounter.classList.add('show');
      }
      
      // Частицы относительно центра hero-visual
      if (heroParticles && heroTarget) {
        const rect = heroTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        spawnParticles(centerX, centerY, heroParticles);
      }
      
      // Вибрация
      if (navigator.vibrate) {
        navigator.vibrate(20 + comboCount * 5);
      }
    });
    
    // Клавиатурная доступность
    heroTarget.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        heroTarget.click();
      }
    });
  }

  function spawnParticles(x, y, container) {
    const particleCount = 16 + comboCount * 4;
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      const angle = (Math.PI * 2 * i) / particleCount;
      const distance = 40 + Math.random() * 60;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      particle.style.setProperty('--dx', dx + 'px');
      particle.style.setProperty('--dy', dy + 'px');
      particle.style.animationDuration = (0.4 + Math.random() * 0.6) + 's';
      
      fragment.appendChild(particle);
    }
    
    container.appendChild(fragment);
    
    setTimeout(() => {
      container.innerHTML = '';
    }, 1000);
  }

  // Кастомный курсор
  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');
  
  if (!dot || !outline) return;
  
  if (window.innerWidth <= 768) {
    dot.style.display = 'none';
    outline.style.display = 'none';
    return;
  }

  document.addEventListener('mousemove', (e) => {
    dot.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
    outline.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
  });

  const hoverElements = document.querySelectorAll(
    'a, button, .btn, .service-card, .tab-btn, .case-card, .tech-item'
  );
  
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => outline.classList.add('hover'));
    el.addEventListener('mouseleave', () => outline.classList.remove('hover'));
  });
}