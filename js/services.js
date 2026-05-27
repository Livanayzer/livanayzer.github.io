(function() {
  // Иконки прямо внутри файла (без импортов)
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

  function getIcon(name) {
    return icons[name] || icons.video;
  }

  // Функция для создания элемента
  function createElement(tag, attrs) {
    attrs = attrs || {};
    var el = document.createElement(tag);
    Object.keys(attrs).forEach(function(k) {
      if (k === 'class') {
        el.className = attrs[k];
      } else {
        el.setAttribute(k, attrs[k]);
      }
    });
    return el;
  }

  // Переключение вкладок
  function switchTab(card, selectedBtn) {
    var tablist = card.querySelector('.tabs');
    if (!tablist) return;
    
    tablist.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.setAttribute('aria-selected', 'false');
    });
    
    card.querySelectorAll('.tab-panel').forEach(function(panel) {
      panel.setAttribute('aria-hidden', 'true');
    });
    
    selectedBtn.setAttribute('aria-selected', 'true');
    
    var panelId = selectedBtn.getAttribute('data-panel');
    if (panelId) {
      var panel = card.querySelector('#' + panelId);
      if (panel) panel.setAttribute('aria-hidden', 'false');
    }
  }

  // Создание карточки услуги
  function buildServiceCard(service, index) {
    var card = createElement('div', { class: 'service-card' });
    
    var iconDiv = createElement('div', { class: 'service-icon' });
    iconDiv.innerHTML = getIcon(service.icon);
    card.appendChild(iconDiv);
    
    var title = createElement('h3');
    title.textContent = service.title;
    card.appendChild(title);
    
    var tabsContainer = createElement('div', { class: 'tabs', role: 'tablist' });
    var panelsContainer = createElement('div');
    
    service.tabs.forEach(function(tab, ti) {
      var tabId = 's-' + index + '-t-' + ti;
      var panelId = 's-' + index + '-p-' + ti;
      var isFirst = ti === 0;
      
      var btn = createElement('button', {
        class: 'tab-btn',
        role: 'tab',
        id: tabId,
        'aria-selected': isFirst ? 'true' : 'false',
        'aria-controls': panelId,
        'data-panel': panelId
      });
      btn.textContent = tab.name;
      
      btn.addEventListener('click', (function(card, button) {
        return function() { switchTab(card, button); };
      })(card, btn));
      
      tabsContainer.appendChild(btn);
      
      var panel = createElement('div', {
        class: 'tab-panel',
        role: 'tabpanel',
        id: panelId,
        'aria-labelledby': tabId,
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

  // Показать скелетон
  function showSkeleton(grid, count) {
    grid.innerHTML = '';
    for (var i = 0; i < count; i++) {
      var skeleton = createElement('div', { class: 'skeleton-card skeleton-loader' });
      grid.appendChild(skeleton);
    }
  }

  // Рендер услуг
  function renderServices(grid, services) {
    grid.innerHTML = '';
    var fragment = document.createDocumentFragment();
    
    services.forEach(function(service, i) {
      var card = buildServiceCard(service, i);
      fragment.appendChild(card);
    });
    
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
    
    grid.querySelectorAll('.service-card').forEach(function(card) {
      observer.observe(card);
    });
  }

  // Загрузка данных
  function loadServices(grid) {
    showSkeleton(grid, 6);
    
    if (window.servicesData && window.servicesData.services) {
      renderServices(grid, window.servicesData.services);
      return;
    }
    
    fetch('data/services.json')
      .then(function(response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function(data) {
        if (data && data.services) {
          renderServices(grid, data.services);
        } else {
          throw new Error('Неверный формат данных');
        }
      })
      .catch(function(error) {
        console.error('Ошибка загрузки услуг:', error);
        grid.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.5);padding:60px;">⚠️ Не удалось загрузить услуги. Пожалуйста, обновите страницу.</div>';
      });
  }

  // Запуск
  var grid = document.getElementById('servicesGrid');
  if (grid) {
    loadServices(grid);
  }
})();