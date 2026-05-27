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

  // Используем requestAnimationFrame для плавности
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
  
  // Hover эффекты
  var hoverSelectors = 'a, button, .btn, .service-card, .tab-btn, .case-card, .tech-item, .blog-card, .guarantee-card, .faq-item summary, .floating-btn, .social-link, .contact-method';
  
  function addHoverListeners() {
    var elements = document.querySelectorAll(hoverSelectors);
    elements.forEach(function(el) {
      el.addEventListener('mouseenter', function() { 
        if (outline) outline.classList.add('hover'); 
      });
      el.addEventListener('mouseleave', function() { 
        if (outline) outline.classList.remove('hover'); 
      });
    });
  }
  
  // Добавляем слушатели при загрузке и при динамическом добавлении элементов
  addHoverListeners();
  
  // Наблюдаем за изменениями в DOM (для динамически добавленных элементов)
  var observer = new MutationObserver(function() {
    addHoverListeners();
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
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