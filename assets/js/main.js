/* ============================================================
   CORPORACION ARC S.A. — main.js
   Versión: 1.0 | Mayo 2026
   Animaciones, efectos y comportamiento global
   ============================================================ */

'use strict';

/* ── 1. NAVBAR SCROLL + HAMBURGER ───────────────────────── */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.navbar__hamburger');
  const menu = document.querySelector('.navbar__menu');

  if (!navbar) return;

  // Sombra al hacer scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Menú hamburger móvil
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Cerrar al hacer clic en un link
    menu.querySelectorAll('.navbar__link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', false);
      });
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        menu.classList.remove('open');
        hamburger.classList.remove('active');
      }
    });
  }
})();


/* ── 2. EFECTO #2 — INNER PARALLAX ──────────────────────── */
(function initParallax() {
  const cards = document.querySelectorAll('.parallax-card');
  if (!cards.length) return;

  // Desactivar en móvil por rendimiento
  const isMobile = () => window.innerWidth <= 768;

  function updateParallax() {
    if (isMobile()) return;

    cards.forEach(card => {
      const img = card.querySelector('.parallax-card__img');
      if (!img) return;

      const rect = card.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const offset = (centerY - viewportCenter) * 0.15;

      img.style.transform = `translateY(${offset}px)`;
    });
  }

  window.addEventListener('scroll', updateParallax, { passive: true });
  window.addEventListener('resize', updateParallax, { passive: true });
  updateParallax();
})();


/* ── 3. EFECTO #3 — CURTAIN TRANSITION ──────────────────── */
(function initCurtain() {
  const curtain = document.querySelector('.curtain');
  if (!curtain) return;

  // Entrada: revelar página al cargar
  window.addEventListener('load', () => {
    curtain.classList.remove('entering');
    curtain.classList.add('leaving');
    setTimeout(() => {
      curtain.style.display = 'none';
    }, 600);
  });

  // Detectar navegacion hacia atras del navegador
  window.addEventListener('pageshow', (e) => {
    curtain.style.display = 'none';
    curtain.classList.remove('entering');
    curtain.classList.remove('leaving');
    curtain.style.transform = 'translateY(100%)';
  });

  // Por si el navegador restaura pagina desde cache
  window.addEventListener('popstate', () => {
    curtain.style.display = 'none';
    curtain.classList.remove('entering');
    curtain.style.transform = 'translateY(100%)';
  });

  // Salida: cubrir antes de navegar
  document.querySelectorAll('a[data-curtain]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      e.preventDefault();
      curtain.style.display = 'block';
      curtain.classList.remove('leaving');

      requestAnimationFrame(() => {
        curtain.classList.add('entering');
      });

      setTimeout(() => {
        window.location.href = href;
      }, 520);
    });
  });
})();


/* ── 4. EFECTO #4 — MAGNETIC HOVER + AUDIO ──────────────── */
(function initMagnetic() {
  const elements = document.querySelectorAll('.magnetic');
  if (!elements.length) return;

  // Audio: click mecánico con Web Audio API nativa
  let audioCtx = null;

  function playTick() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.04);

      gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      // Audio no disponible — continúa sin sonido
    }
  }

  elements.forEach(el => {
    let played = false;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const strength = 0.25;

      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;

      if (!played) {
        playTick();
        played = true;
      }
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
      played = false;
    });
  });
})();


/* ── 5. AOS — ANIMACIONES AL HACER SCROLL ───────────────── */
(function initAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disable: 'mobile'
    });
  }
})();


/* ── 6. NAVBAR — LINK ACTIVO SEGÚN SECCIÓN VISIBLE ──────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${id}`
          );
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(section => observer.observe(section));
})();


/* ── 7. CARRUSEL LOGOS — DUPLICAR PARA LOOP INFINITO ────── */
(function initLogos() {
  const inner = document.querySelector('.logos-inner');
  if (!inner) return;

  // Duplicar contenido para efecto infinito
  inner.innerHTML += inner.innerHTML;
})();


/* ── 8. SMOOTH SCROLL PARA LINKS INTERNOS ───────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;

      e.preventDefault();
      const navHeight = document.querySelector('.navbar')?.offsetHeight || 72;

      window.scrollTo({
        top: target.offsetTop - navHeight,
        behavior: 'smooth'
      });
    });
  });
})();


/* ── 9. LAZY LOADING IMÁGENES NATIVO ────────────────────── */
(function initLazyImages() {
  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  images.forEach(img => observer.observe(img));
})();


/* ── 10. PROTECCIÓN — DESHABILITAR CLIC DERECHO EN IMÁGENES */
(function initImageProtection() {
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('contextmenu', e => e.preventDefault());
    img.setAttribute('draggable', 'false');
  });
})();


/* ── DROPDOWN SERVICIOS ──────────────────────────────────── */
(function initDropdown() {
  const wraps = document.querySelectorAll('.navbar__dropdown-wrap');
  wraps.forEach(wrap => {
    const btn = wrap.querySelector('.navbar__dropdown-btn');
    const menu = wrap.querySelector('.navbar__dropdown');
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen);
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });

    // Cerrar al elegir una opción
    menu.querySelectorAll('.navbar__dropdown-link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', false);
      });
    });
  });
})();


/* ── CARRUSEL DE CARDS ───────────────────────────────────── */
(function initCarousel() {
  const grid   = document.getElementById('cardsCarousel');
  const dots   = document.querySelectorAll('.carousel-dot');
  if (!grid || !dots.length) return;

  const cards       = grid.querySelectorAll('.service-card');
  const totalCards  = cards.length;    // 6
  let currentGroup  = 0;
  let autoTimer     = null;

  // Detectar cuántas columnas hay visible según CSS
  function getVisible() {
    if (window.innerWidth <= 540)  return 1;
    if (window.innerWidth <= 900)  return 2;
    return 3;
  }

  function totalGroups() {
    return Math.ceil(totalCards / getVisible());
  }

  function goTo(index) {
    const visible = getVisible();
    const groups  = totalGroups();
    currentGroup  = (index + groups) % groups;

    // Ocultar / mostrar cards
    cards.forEach((card, i) => {
      const inGroup = Math.floor(i / visible) === currentGroup;
      card.style.display = inGroup ? '' : 'none';
    });

    // Sincronizar dots (solo mostramos dots si hay más de un grupo)
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentGroup);
      dot.style.display = i < groups ? '' : 'none';
    });
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(currentGroup + 1), 4500);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }

  // Dots click
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      stopAuto();
      startAuto();
    });
  });

  // Parar al hover
  grid.addEventListener('mouseenter', stopAuto);
  grid.addEventListener('mouseleave', startAuto);

  // Init
  goTo(0);
  startAuto();

  // Re-init al cambiar tamaño
  window.addEventListener('resize', () => goTo(currentGroup), { passive: true });
})();
