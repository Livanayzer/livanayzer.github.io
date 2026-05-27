import { createElement, createFragment } from '../utils/dom.js';
import { getIcon } from '../utils/icons.js';
import { observeCards } from './animations.js';

const SKELETON_COUNT = 9;
const SERVICES_URL = 'data/services.json';

export async function initServices() {
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;

  showSkeletons(grid);

  try {
    const response = await fetch(SERVICES_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    renderServices(grid, data.services);
    
  } catch (error) {
    console.error('Ошибка загрузки услуг:', error);
    renderError(grid);
  }
}

function showSkeletons(grid) {
  grid.innerHTML = '';
  const fragment = createFragment();
  
  for (let i = 0; i < SKELETON_COUNT; i++) {
    const card = createElement('div', { class: 'service-card skeleton' });
    card.appendChild(createElement('div', { class: 'skeleton-icon' }));
    card.appendChild(createElement('div', { class: 'skeleton-title' }));
    card.appendChild(createElement('div', { class: 'skeleton-tabs' }));
    card.appendChild(createElement('div', { class: 'skeleton-list' }));
    fragment.appendChild(card);
  }
  
  grid.appendChild(fragment);
}

function renderServices(grid, services) {
  grid.innerHTML = '';
  const fragment = createFragment();
  
  services.forEach((service, index) => {
    const card = buildServiceCard(service, index);
    fragment.appendChild(card);
  });
  
  grid.appendChild(fragment);
  observeCards(grid.querySelectorAll('.service-card'));
}

function buildServiceCard(service, index) {
  const card = createElement('div', {
    class: 'service-card',
    role: 'tablist',
    'aria-label': service.title
  });

  // Иконка
  const iconContainer = createElement('div', { class: 'service-icon' });
  iconContainer.innerHTML = getIcon(service.icon);
  card.appendChild(iconContainer);

  // Заголовок
  const title = createElement('h3');
  title.textContent = service.title;
  card.appendChild(title);

  // Табы
  const tabsContainer = createElement('div', { class: 'tabs' });
  const panelsContainer = createElement('div');

  service.tabs.forEach((tab, tabIndex) => {
    const tabId = `service-${index}-tab-${tabIndex}`;
    const panelId = `service-${index}-panel-${tabIndex}`;
    const isFirst = tabIndex === 0;

    const tabBtn = createElement('button', {
      class: `tab-btn`,
      role: 'tab',
      'aria-selected': isFirst ? 'true' : 'false',
      'aria-controls': panelId,
      id: tabId,
      'data-panel': panelId
    });
    tabBtn.textContent = tab.name;
    
    tabBtn.addEventListener('click', () => switchTab(card, tabBtn));
    tabBtn.addEventListener('keydown', (e) => handleTabKeydown(e, tabsContainer));
    
    tabsContainer.appendChild(tabBtn);

    // Панель
    const panel = createElement('div', {
      class: `tab-panel`,
      role: 'tabpanel',
      id: panelId,
      'aria-labelledby': tabId,
      'aria-hidden': isFirst ? 'false' : 'true'
    });

    const list = createElement('ul');
    tab.items.forEach(itemText => {
      const li = createElement('li');
      li.textContent = itemText;
      list.appendChild(li);
    });
    panel.appendChild(list);
    panelsContainer.appendChild(panel);
  });

  card.appendChild(tabsContainer);
  card.appendChild(panelsContainer);

  // Футер
  const footer = createElement('div', { class: 'service-footer' });
  const link = createElement('a', { href: '#contact' });
  link.textContent = 'Заказать расчёт →';
  footer.appendChild(link);
  card.appendChild(footer);

  return card;
}

function switchTab(card, selectedBtn) {
  card.querySelectorAll('.tab-btn').forEach(btn => {
    btn.setAttribute('aria-selected', 'false');
  });
  card.querySelectorAll('.tab-panel').forEach(panel => {
    panel.setAttribute('aria-hidden', 'true');
  });

  selectedBtn.setAttribute('aria-selected', 'true');
  const panelId = selectedBtn.getAttribute('data-panel');
  const panel = card.querySelector(`#${panelId}`);
  if (panel) {
    panel.setAttribute('aria-hidden', 'false');
  }
}

function handleTabKeydown(event, tabsContainer) {
  const tabs = Array.from(tabsContainer.querySelectorAll('.tab-btn'));
  const currentIndex = tabs.indexOf(document.activeElement);
  let newIndex;

  switch (event.key) {
    case 'ArrowRight':
      newIndex = (currentIndex + 1) % tabs.length;
      break;
    case 'ArrowLeft':
      newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      break;
    case 'Home':
      newIndex = 0;
      break;
    case 'End':
      newIndex = tabs.length - 1;
      break;
    default:
      return;
  }

  event.preventDefault();
  tabs[newIndex].focus();
  switchTab(tabs[newIndex].closest('.service-card'), tabs[newIndex]);
}

function renderError(grid) {
  grid.innerHTML = '';
  const errorDiv = createElement('div', { class: 'services-error' });
  const message = createElement('p');
  message.textContent = 'Не удалось загрузить услуги. Пожалуйста, попробуйте позже.';
  errorDiv.appendChild(message);
  grid.appendChild(errorDiv);
}