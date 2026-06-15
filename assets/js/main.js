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
Lanzamiento de ARC Logistics 
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

/* ── DROPDOWN SERVICIOS — hover PC + clic móvil ─────────── */
(function initDropdown() {
  document.querySelectorAll('.navbar__dropdown-wrap').forEach(wrap => {
    const btn  = wrap.querySelector('.navbar__dropdown-btn');
    const menu = wrap.querySelector('.navbar__dropdown');
    if (!btn || !menu) return;
    const isMobile = () => window.innerWidth <= 900;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (isMobile()) { const o = menu.classList.toggle('open'); btn.setAttribute('aria-expanded', o); }
    });
    wrap.addEventListener('mouseenter', () => { if (!isMobile()) { menu.classList.add('open'); btn.setAttribute('aria-expanded', true); } });
    wrap.addEventListener('mouseleave', () => { if (!isMobile()) { menu.classList.remove('open'); btn.setAttribute('aria-expanded', false); } });
    document.addEventListener('click', () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded', false); });
    menu.addEventListener('click', e => e.stopPropagation());
  });
})();


/* ── CARRUSEL FLUIDO ─────────────────────────────────────── */
(function initCarousel() {
  const wrapper = document.querySelector('.carousel-wrapper');
  if (!wrapper) return;
  const grid = document.getElementById('cardsCarousel');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.service-card'));
  if (!cards.length) return;
  const dotsContainer = wrapper.querySelector('.carousel-dots');

  const trackWrap = document.createElement('div');
  trackWrap.className = 'carousel-track-wrap';
  const track = document.createElement('div');
  track.className = 'carousel-track';
  cards.forEach(c => track.appendChild(c));
  trackWrap.appendChild(track);
  grid.parentNode.insertBefore(trackWrap, grid);
  grid.parentNode.removeChild(grid);
  if (dotsContainer) wrapper.appendChild(dotsContainer);

  let current = 0, timer = null;

  function pp() {
    if (window.innerWidth <= 540) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }
  function groups() { return Math.ceil(cards.length / pp()); }

  function layout() {
    const n = pp();
    track.style.display = 'flex';
    track.style.width = (cards.length * (100 / n)) + '%';
    cards.forEach(c => {
      c.style.flex = '0 0 ' + (100 / cards.length) + '%';
      c.style.maxWidth = (100 / cards.length) + '%';
      c.style.boxSizing = 'border-box';
      c.style.padding = '0 12px';
    });
  }

  function goTo(idx) {
    const g = groups();
    current = ((idx % g) + g) % g;
    layout();
    const pct = current * (100 / cards.length) * pp();
    track.style.transform = 'translateX(-' + pct + '%)';
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
        d.style.display = i < g ? '' : 'none';
      });
    }
  }

  function start() { stop(); timer = setInterval(() => goTo(current + 1), 4500); }
  function stop()  { clearInterval(timer); }

  if (dotsContainer) {
    dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.addEventListener('click', () => { goTo(i); stop(); start(); });
    });
  }
  trackWrap.addEventListener('mouseenter', stop);
  trackWrap.addEventListener('mouseleave', start);
  let tx = 0;
  trackWrap.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  trackWrap.addEventListener('touchend', e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) { goTo(current + (d > 0 ? 1 : -1)); stop(); start(); }
  }, { passive: true });
  window.addEventListener('resize', () => { layout(); goTo(current); }, { passive: true });
  goTo(0); start();
})();


/* ── TYPEWRITER COTIZACIÓN ───────────────────────────────── */
(function initCotizacionTypewriter() {
  const el = document.getElementById('cotizacionTypewriter');
  if (!el) return;

  /* Frases completas — cada una se escribe desde cero y se borra completa */
  const phrases = [
    el.textContent.trim(),
    'Sin Costo',
    'Sin Compromiso',
    
  ];

  let pi = 0, ci = 0, deleting = false, paused = false;

  /* Empezar borrando el texto inicial que ya está en el HTML */
  el.textContent = phrases[0];
  ci = phrases[0].length;
  deleting = true;

  function tick() {
    if (paused) return;
    const word = phrases[pi];
    if (deleting) {
      ci--;
      el.textContent = word.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        paused = true;
        setTimeout(() => { paused = false; tick(); }, 300);
        return;
      }
    } else {
      ci++;
      el.textContent = phrases[pi].slice(0, ci);
      if (ci >= phrases[pi].length) {
        deleting = true;
        paused = true;
        setTimeout(() => { paused = false; tick(); }, 2200);
        return;
      }
    }
    setTimeout(tick, deleting ? 35 : 70);
  }

  setTimeout(tick, 1200);
})();
