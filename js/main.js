import { initCursor } from './modules/cursor.js';
import { initServices } from './modules/services.js';

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initServices();
});