// =========================================================
// CINERGIA 360 · PODCAST (interacciones de página)
// La navegación es manejada por nav.js.
// =========================================================

(function initPodcast() {
  // Animación de entrada para las tarjetas
  if (!window.IntersectionObserver) return;

  const cards = document.querySelectorAll(".comp-card, .comp-panel");
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  cards.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(10px)";
    el.style.transition = "opacity 0.38s ease, transform 0.38s ease";
    observer.observe(el);
  });
})();
