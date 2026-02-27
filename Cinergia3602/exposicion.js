// =========================================================
// CINERGIA 360 · EXPOSICIÓN (interacciones de página)
// =========================================================

(function initExposicion() {
  if (!window.IntersectionObserver) return;

  const targets = document.querySelectorAll(
    ".comp-card, .sentido-item, .comp-panel"
  );
  if (!targets.length) return;

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

  targets.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(10px)";
    el.style.transition = "opacity 0.38s ease, transform 0.38s ease";
    observer.observe(el);
  });
})();
