export function createElement(tag, attributes = {}) {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'class') {
      element.className = value;
    } else if (key.startsWith('aria-') || key === 'role') {
      element.setAttribute(key, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  return element;
}

export function createFragment() {
  return document.createDocumentFragment();
}