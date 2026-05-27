const icons = {
  video: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="16" height="14" rx="2"/><polygon points="23 7 18 10.5 18 13.5 23 17 23 7"/><circle cx="8" cy="12" r="2"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1"/></svg>`,
  wifi: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h.01"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M1.5 8.5a15 15 0 0 1 21 0"/></svg>`,
  home: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5L12 3l9 7.5"/><rect x="6" y="10" width="12" height="11" rx="1"/><rect x="10" y="15" width="4" height="6"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M1 12h4M19 12h4M4.2 19.8l2.8-2.8M17 7l2.8-2.8"/></svg>`,
  zap: `<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  cpu: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/></svg>`,
  code: `<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.5 9a9 9 0 0 1 14.8-3.4L23 10M1 14l4.7 4.7A9 9 0 0 0 20.5 15"/></svg>`,
  default: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/></svg>`
};

export function getIcon(name) {
  return icons[name] || icons.default;
}