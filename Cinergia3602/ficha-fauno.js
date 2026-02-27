// =========================================================
// CINERGIA 360 · FICHA FAUNO
// Script de la ficha del proyecto. Mínimo y enfocado.
// =========================================================

// La navegación es manejada por nav.js (incluido en el HTML).
// Aquí se pueden agregar comportamientos específicos de la ficha.

(function initFichaFauno() {
  // Animación de entrada sencilla para las tarjetas de dimensiones
  // al entrar en el viewport (si IntersectionObserver está disponible)
  if (!window.IntersectionObserver) return;

  const targets = document.querySelectorAll(
    ".ficha-dim, .ficha-dato, .ficha-recurso, .ficha-text-block"
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
    el.style.transform = "translateY(12px)";
    el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    observer.observe(el);
  });
})();
