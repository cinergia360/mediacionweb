// =========================================================
// CINERGIA 360 · CARRUSEL DE COMPONENTES (EDITORIAL / CIRCULAR)
// - Flechas laterales
// - Capas traseras (prev2/next2)
// - Click en tarjetas laterales
// - Teclado + swipe
// =========================================================

(function initComponentesCarousel() {
  const carousel = document.getElementById("componentesCarousel");
  if (!carousel) return;

  const track = document.getElementById("componentesTrack");
  const slides = Array.from(track.querySelectorAll(".componente-slide"));
  const prevBtn = document.getElementById("componentesPrev");
  const nextBtn = document.getElementById("componentesNext");
  const dotsWrap = document.getElementById("componentesDots");

  if (!slides.length) return;

  let current = slides.findIndex(s => s.classList.contains("is-active"));
  if (current < 0) current = 0;

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  // Crear dots
  slides.forEach((slide, index) => {
    const dot = document.createElement("button");
    dot.className = "componentes-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Ir a ${slide.getAttribute("aria-label") || `componente ${index + 1}`}`);
    dot.addEventListener("click", () => goTo(index));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.querySelectorAll(".componentes-dot"));

  function clearStateClasses(slide) {
    slide.classList.remove(
      "is-active",
      "is-prev",
      "is-next",
      "is-prev2",
      "is-next2",
      "is-hidden-left",
      "is-hidden-right"
    );
  }

  function setClasses() {
    const total = slides.length;

    slides.forEach((slide, i) => {
      clearStateClasses(slide);
      slide.removeAttribute("aria-current");

      // Distancias circulares
      const rightDist = mod(i - current, total); // cuántos pasos a la derecha
      const leftDist = mod(current - i, total);  // cuántos pasos a la izquierda

      if (i === current) {
        slide.classList.add("is-active");
        slide.setAttribute("aria-current", "true");
        return;
      }

      // Reglas por número de slides
      if (total === 1) {
        slide.classList.add("is-active");
        return;
      }

      if (total === 2) {
        // 1 centro + 1 lateral
        if (rightDist === 1) slide.classList.add("is-next");
        else slide.classList.add("is-prev");
        return;
      }

      if (total === 3) {
        if (rightDist === 1) slide.classList.add("is-next");
        else if (leftDist === 1) slide.classList.add("is-prev");
        else slide.classList.add("is-hidden-right");
        return;
      }

      // 4 o más: mostrar capas traseras
      if (rightDist === 1) slide.classList.add("is-next");
      else if (leftDist === 1) slide.classList.add("is-prev");
      else if (rightDist === 2) slide.classList.add("is-next2");
      else if (leftDist === 2) slide.classList.add("is-prev2");
      else {
        // Ocultar lo demás al lado "más cercano"
        if (leftDist < rightDist) slide.classList.add("is-hidden-left");
        else slide.classList.add("is-hidden-right");
      }
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === current);
      dot.setAttribute("aria-pressed", i === current ? "true" : "false");
    });
  }

  function goTo(index) {
    current = mod(index, slides.length);
    setClasses();
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  // Botones
  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", next);

  // Click en tarjetas (si no clickean link)
  slides.forEach((slide, index) => {
    slide.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;

      // Permitir activar si no es la activa (incluye laterales y capas)
      if (index !== current) goTo(index);
    });

    slide.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && index !== current) {
        e.preventDefault();
        goTo(index);
      }
    });
  });

  // Teclado dentro del carrusel
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  });

  // Swipe básico (touch)
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const dx = touchEndX - touchStartX;
    const threshold = 40;

    if (Math.abs(dx) < threshold) return;
    if (dx < 0) next();
    else prev();
  }, { passive: true });

  // (Opcional) autoplay suave — apagado por defecto
  // let autoplay = setInterval(next, 5000);
  // carousel.addEventListener("mouseenter", () => clearInterval(autoplay));
  // carousel.addEventListener("mouseleave", () => autoplay = setInterval(next, 5000));

  setClasses();
})();