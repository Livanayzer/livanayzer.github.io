export function observeCards(cards) {
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          card.style.transitionDelay = `${i * 50}ms`;
          card.classList.add('visible');
          observer.unobserve(card);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  cards.forEach(card => observer.observe(card));
}