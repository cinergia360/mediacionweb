// =========================================================
// CINERGIA 360 · FAUNO RECURSOS
// Carga antes que fauno-modelo.js (módulo ES, diferido).
//
// Responsabilidades:
//   1. Definir window.C360Audio — gestor global de audio
//      (garantiza un solo audio activo a la vez en toda la página)
//   2. Manejar los botones de audio del fallback accesible
// =========================================================


// ============================================================
//  window.C360Audio — Gestor global de audio
//  Usado por este archivo Y por fauno-modelo.js
// ============================================================
window.C360Audio = (function () {
  var _el     = null;   // HTMLAudioElement actualmente activo
  var _onStop = null;   // callback para resetear la UI del reproductor activo

  // Detiene el audio activo y llama al callback de reset de UI
  function _doStop() {
    var el = _el, cb = _onStop;
    _el = null;
    _onStop = null;
    if (el) { el.pause(); el.currentTime = 0; }
    if (typeof cb === 'function') { try { cb(); } catch (e) {} }
  }

  return {
    /**
     * Detiene lo anterior y reproduce src en audioEl.
     * onStopFn se llama cuando el audio es detenido externamente,
     * lo que permite al llamador resetear su UI.
     */
    play: function (audioEl, src, onStopFn) {
      _doStop();
      _el     = audioEl;
      _onStop = onStopFn || null;
      audioEl.onerror = function () { _doStop(); };
      audioEl.src = src;
      audioEl.play().catch(function () { _doStop(); });
    },

    /** Detiene el audio activo (si lo hay). */
    stop: function () { _doStop(); },

    /**
     * Detiene el audio solo si el elemento indicado es el activo.
     * Útil para no interrumpir audio de otra fuente.
     */
    stopIfEl: function (audioEl) {
      if (_el === audioEl) _doStop();
    },

    /**
     * Llamar desde el evento "ended" del elemento de audio.
     * Limpia el estado interno sin interrumpir otro audio.
     */
    onEnded: function (audioEl) {
      if (_el === audioEl) _doStop();
    },

    /** True si este elemento está activo Y reproduciendo ahora mismo. */
    isPlaying: function (audioEl) {
      return _el === audioEl && audioEl && !audioEl.paused;
    }
  };
})();


// ============================================================
//  Botones de audio del fallback accesible (lista de partes)
// ============================================================
(function initFaunoRecursos() {

  var audioEl   = new Audio();
  var activeBtn = null;   // botón cuya reproducción está en curso

  // Resetea el botón a su estado inicial
  function resetBtn(btn) {
    if (!btn) return;
    btn.classList.remove('is-playing');
    btn.querySelector('i').className   = 'fa-solid fa-volume-high';
    btn.querySelector('span').textContent = 'Escuchar descripción';
    btn.setAttribute('aria-pressed', 'false');
  }

  // El evento "ended" delega al gestor global para limpiar estado
  audioEl.addEventListener('ended', function () {
    window.C360Audio.onEnded(audioEl);
  });

  // Asignar listeners a todos los botones de audio del fallback
  document.querySelectorAll('.parte-audio-btn').forEach(function (btn) {
    var src = btn.dataset.audio;
    if (!src) return;

    btn.setAttribute('aria-pressed', 'false');

    btn.addEventListener('click', function () {
      // Toggle: si este botón ya está sonando, detener
      if (window.C360Audio.isPlaying(audioEl) && activeBtn === btn) {
        window.C360Audio.stop();
        return;
      }

      // Reproducir (C360Audio detiene lo anterior y llama su onStop)
      // El onStop del botón previo reseteará su UI correctamente
      window.C360Audio.play(audioEl, src, function () {
        resetBtn(btn);
        if (activeBtn === btn) activeBtn = null;
      });

      // Actualizar UI del botón activo
      activeBtn = btn;
      btn.classList.add('is-playing');
      btn.querySelector('i').className   = 'fa-solid fa-pause';
      btn.querySelector('span').textContent = 'Pausar audio';
      btn.setAttribute('aria-pressed', 'true');
    });
  });

})();
