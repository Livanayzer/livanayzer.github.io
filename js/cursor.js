(function() {
  var dot = document.querySelector('.cursor-dot');
  var outline = document.querySelector('.cursor-outline');
  
  if (!dot || !outline) return;
  
  // Проверяем, что устройство поддерживает кастомный курсор
  var isFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  var isNotTouch = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  
  if (!isFinePointer || !isNotTouch || window.innerWidth <= 768) {
    dot.style.display = 'none';
    outline.style.display = 'none';
    return;
  }

  // requestAnimationFrame для плавности
  var rafId = null;
  var mouseX = 0, mouseY = 0;
  
  function updateCursor() {
    if (dot && outline) {
      dot.style.transform = 'translate(' + (mouseX - 3) + 'px, ' + (mouseY - 3) + 'px)';
      outline.style.transform = 'translate(' + (mouseX - 20) + 'px, ' + (mouseY - 20) + 'px)';
    }
    rafId = null;
  }
  
  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (rafId === null) {
      rafId = requestAnimationFrame(updateCursor);
    }
  }
  
  document.addEventListener('mousemove', onMouseMove);
  
  // Hover эффекты через делегирование (без MutationObserver!)
  var hoverSelector = 'a, button, .btn, .service-card, .tab-btn, .case-card, .tech-item, .blog-card, .guarantee-card, .faq-item summary, .floating-btn, .social-link, .contact-method';
  
  document.addEventListener('mouseover', function(e) {
    var target = e.target;
    // Ищем ближайший подходящий элемент
    var hoverTarget = target.closest(hoverSelector);
    if (hoverTarget && outline) {
      outline.classList.add('hover');
    }
  });
  
  document.addEventListener('mouseout', function(e) {
    var target = e.target;
    var hoverTarget = target.closest(hoverSelector);
    if (hoverTarget && outline) {
      // Проверяем, не переместился ли курсор на другой hover-элемент
      var relatedTarget = e.relatedTarget;
      if (!relatedTarget || !relatedTarget.closest(hoverSelector)) {
        outline.classList.remove('hover');
      }
    }
  });
  
  // Скрываем курсор при выходе за пределы окна
  document.addEventListener('mouseleave', function() {
    if (dot) dot.style.opacity = '0';
    if (outline) outline.style.opacity = '0';
  });
  
  document.addEventListener('mouseenter', function() {
    if (dot) dot.style.opacity = '1';
    if (outline) outline.style.opacity = '1';
  });
})();