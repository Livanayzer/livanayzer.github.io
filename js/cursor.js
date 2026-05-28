(function() {
  var dot = document.querySelector('.cursor-dot');
  var outline = document.querySelector('.cursor-outline');
  
  if (!dot || !outline) return;
  
  var isFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  var isNotTouch = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  
  if (!isFinePointer || !isNotTouch || window.innerWidth <= 768) {
    dot.style.display = 'none';
    outline.style.display = 'none';
    return;
  }

  var rafId = null;
  var mouseX = 0, mouseY = 0;
  
  function updateCursor() {
    dot.style.transform = 'translate(' + (mouseX - 3) + 'px, ' + (mouseY - 3) + 'px)';
    outline.style.transform = 'translate(' + (mouseX - 20) + 'px, ' + (mouseY - 20) + 'px)';
    rafId = null;
  }
  
  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (rafId === null) {
      rafId = requestAnimationFrame(updateCursor);
    }
  });
  
  var hoverSelector = 'a, button, .btn, .service-card, .tab-btn, .case-card, .tech-item, .blog-card, .guarantee-card, .faq-item summary, .floating-btn, .social-link, .contact-method, .form-input, .form-textarea';
  
  document.addEventListener('mouseover', function(e) {
    if (e.target.closest(hoverSelector) && outline) {
      outline.classList.add('hover');
    }
  });
  
  document.addEventListener('mouseout', function(e) {
    if (e.target.closest(hoverSelector) && outline) {
      var related = e.relatedTarget;
      if (!related || !related.closest(hoverSelector)) {
        outline.classList.remove('hover');
      }
    }
  });
  
  document.addEventListener('mouseleave', function() {
    if (dot) dot.style.opacity = '0';
    if (outline) outline.style.opacity = '0';
  });
  
  document.addEventListener('mouseenter', function() {
    if (dot) dot.style.opacity = '1';
    if (outline) outline.style.opacity = '1';
  });
})();