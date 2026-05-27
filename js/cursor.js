(function() {
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

  var hoverSelectors = 'a, button, .btn, .service-card, .tab-btn, .case-card, .tech-item, .blog-card, .guarantee-card, .faq-item summary, .floating-btn';
  document.querySelectorAll(hoverSelectors).forEach(function(el) {
    el.addEventListener('mouseenter', function() { outline.classList.add('hover'); });
    el.addEventListener('mouseleave', function() { outline.classList.remove('hover'); });
  });
})();