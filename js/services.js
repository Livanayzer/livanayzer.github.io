(function() {
  var icons = {
    video: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="16" height="14" rx="2"/><polygon points="23 7 18 10.5 18 13.5 23 17 23 7"/><circle cx="8" cy="12" r="2"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1"/></svg>',
    wifi: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h.01"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M1.5 8.5a15 15 0 0 1 21 0"/></svg>',
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5L12 3l9 7.5"/><rect x="6" y="10" width="12" height="11" rx="1"/><rect x="10" y="15" width="4" height="6"/></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M1 12h4M19 12h4M4.2 19.8l2.8-2.8M17 7l2.8-2.8"/></svg>',
    zap: '<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    cpu: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/></svg>',
    code: '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.5 9a9 9 0 0 1 14.8-3.4L23 10M1 14l4.7 4.7A9 9 0 0 0 20.5 15"/></svg>'
  };

  function createElement(tag, attrs) {
    attrs = attrs || {};
    var el = document.createElement(tag);
    Object.keys(attrs).forEach(function(k) {
      if (k === 'class') el.className = attrs[k];
      else el.setAttribute(k, attrs[k]);
    });
    return el;
  }

  function buildServiceCard(service, index) {
    var card = createElement('div', { class: 'service-card', role: 'tablist', 'aria-label': service.title });
    
    var iconDiv = createElement('div', { class: 'service-icon' });
    iconDiv.innerHTML = icons[service.icon] || '';
    card.appendChild(iconDiv);
    
    var title = createElement('h3');
    title.textContent = service.title;
    card.appendChild(title);
    
    var tabsContainer = createElement('div', { class: 'tabs' });
    var panelsContainer = createElement('div');
    
    service.tabs.forEach(function(tab, ti) {
      var tabId = 's-' + index + '-t-' + ti;
      var panelId = 's-' + index + '-p-' + ti;
      var isFirst = ti === 0;
      
      var btn = createElement('button', {
        class: 'tab-btn', role: 'tab',
        'aria-selected': isFirst ? 'true' : 'false',
        'aria-controls': panelId, id: tabId, 'data-panel': panelId
      });
      btn.textContent = tab.name;
      btn.addEventListener('click', function() { switchTab(card, btn); });
      tabsContainer.appendChild(btn);
      
      var panel = createElement('div', {
        class: 'tab-panel', role: 'tabpanel',
        id: panelId, 'aria-labelledby': tabId,
        'aria-hidden': isFirst ? 'false' : 'true'
      });
      var ul = createElement('ul');
      tab.items.forEach(function(item) {
        var li = createElement('li');
        li.textContent = item;
        ul.appendChild(li);
      });
      panel.appendChild(ul);
      panelsContainer.appendChild(panel);
    });
    
    card.appendChild(tabsContainer);
    card.appendChild(panelsContainer);
    
    var footer = createElement('div', { class: 'service-footer' });
    var link = createElement('a', { href: 'contact.html' });
    link.textContent = 'Заказать расчёт →';
    footer.appendChild(link);
    card.appendChild(footer);
    
    return card;
  }

  function switchTab(card, selectedBtn) {
    card.querySelectorAll('.tab-btn').forEach(function(b) { b.setAttribute('aria-selected', 'false'); });
    card.querySelectorAll('.tab-panel').forEach(function(p) { p.setAttribute('aria-hidden', 'true'); });
    selectedBtn.setAttribute('aria-selected', 'true');
    var panel = card.querySelector('#' + selectedBtn.getAttribute('data-panel'));
    if (panel) panel.setAttribute('aria-hidden', 'false');
  }

  function renderServices(grid, services) {
    var fragment = document.createDocumentFragment();
    services.forEach(function(s, i) { fragment.appendChild(buildServiceCard(s, i)); });
    grid.appendChild(fragment);
    
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry, i) {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = (i * 50) + 'ms';
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    grid.querySelectorAll('.service-card').forEach(function(card) { observer.observe(card); });
  }

  var grid = document.getElementById('servicesGrid');
  if (grid) {
    if (window.servicesData) {
      renderServices(grid, window.servicesData.services);
    } else {
      fetch('data/services.json')
        .then(function(r) { return r.json(); })
        .then(function(data) { renderServices(grid, data.services); })
        .catch(function() {
          grid.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.3);">Не удалось загрузить услуги</p>';
        });
    }
  }
})();