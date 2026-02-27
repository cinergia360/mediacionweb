// =========================================================
// CINERGIA 360 · NAVEGACIÓN GLOBAL
// Maneja: hamburger móvil, cierre con Esc, aria-expanded
// Incluir en todas las páginas.
// =========================================================

(function initSiteNav() {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;

  const toggle = nav.querySelector(".site-nav__toggle");
  const links = nav.querySelector(".site-nav__links");
  if (!toggle || !links) return;

  function openMenu() {
    links.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    toggle.setAttribute("aria-label", "Cerrar menú de navegación");
  }

  function closeMenu() {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    toggle.setAttribute("aria-label", "Abrir menú de navegación");
  }

  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", links.id || "siteNavLinks");
  if (!links.id) links.id = "siteNavLinks";

  toggle.addEventListener("click", () => {
    if (links.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  // Cerrar con Esc
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && links.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });

  // Cerrar al hacer click fuera del nav
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && links.classList.contains("is-open")) {
      closeMenu();
    }
  });

  // Cerrar al hacer click en un link (útil en SPA o anclas)
  links.querySelectorAll(".site-nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 780) closeMenu();
    });
  });
})();
