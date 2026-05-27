(function() {
  var heroTarget = document.getElementById('heroTarget');
  var nodeCenter = document.getElementById('nodeCenter');
  var hitRipple = document.getElementById('hitRipple');
  var comboCounter = document.getElementById('comboCounter');
  var heroParticles = document.getElementById('heroParticles');
  var nodeRings = document.querySelectorAll('.node-ring');
  
  var comboCount = 0;
  var comboTimer = null;

  if (!heroTarget) return;

  heroTarget.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    comboCount++;
    
    clearTimeout(comboTimer);
    comboTimer = setTimeout(function() {
      comboCount = 0;
    }, 1500);
    
    if (nodeCenter) {
      nodeCenter.classList.add('hit');
      setTimeout(function() {
        nodeCenter.classList.remove('hit');
      }, 300);
    }
    
    if (hitRipple) {
      hitRipple.classList.add('expand');
      setTimeout(function() {
        hitRipple.classList.remove('expand');
      }, 600);
    }
    
    nodeRings.forEach(function(ring) {
      ring.classList.add('shake');
      setTimeout(function() {
        ring.classList.remove('shake');
      }, 400);
    });
    
    if (comboCounter && comboCount > 1) {
      comboCounter.textContent = '×' + comboCount;
      comboCounter.classList.remove('show');
      void comboCounter.offsetWidth;
      comboCounter.classList.add('show');
    }
    
    if (heroParticles) {
      var rect = heroTarget.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      var count = 16 + comboCount * 4;
      var frag = document.createDocumentFragment();
      
      for (var i = 0; i < count; i++) {
        var p = document.createElement('div');
        p.className = 'particle';
        var angle = (Math.PI * 2 * i) / count;
        var dist = 40 + Math.random() * 60;
        p.style.left = cx + 'px';
        p.style.top = cy + 'px';
        p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
        p.style.animationDuration = (0.4 + Math.random() * 0.6) + 's';
        frag.appendChild(p);
      }
      
      heroParticles.appendChild(frag);
      setTimeout(function() {
        heroParticles.innerHTML = '';
      }, 1000);
    }
    
    if (navigator.vibrate) {
      navigator.vibrate(20 + comboCount * 5);
    }
  });

  heroTarget.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      heroTarget.click();
    }
  });
})();