/* ============================================================
   CORPORACION ARC S.A. — leads.js
   Versión: 1.0 | Mayo 2026
   Captación de leads — seguridad, validación y envío
   ============================================================ */

'use strict';

const LEADS = {

  /* ── CONFIGURACIÓN ─────────────────────────────────────── */
  config: {
    // En DEMO: Netlify Forms procesa el formulario automáticamente
    // En PRODUCCIÓN con Hostinger: reemplazar por URL de Formspree
    // Ejemplo Formspree: 'https://formspree.io/f/XXXXXXXX'
    endpoint: '',

    // Rate limiting: máximo de envíos por sesión
    maxSubmits: 3,
    cooldownMs: 600000, // 10 minutos en milisegundos

    // Tiempo mínimo para llenar el formulario (anti-bot)
    minFillTimeMs: 3000,
  },

  // Registro de envíos para rate limiting
  submitLog: [],
  formLoadTime: Date.now(),

  /* ── INICIALIZAR ────────────────────────────────────────── */
  init() {
    document.querySelectorAll('.leads-form-el').forEach(form => {
      this.setupForm(form);
    });
  },

  /* ── CONFIGURAR FORMULARIO ──────────────────────────────── */
  setupForm(form) {
    // Registrar tiempo de carga del formulario
    form.dataset.loadTime = Date.now();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(form);
    });

    // Validación en tiempo real
    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => {
        field.classList.remove('field-error');
        const errEl = field.parentElement.querySelector('.field-error-msg');
        if (errEl) errEl.remove();
      });
    });
  },

  /* ── MANEJAR ENVÍO ──────────────────────────────────────── */
  async handleSubmit(form) {
    const btn = form.querySelector('.form-submit');
    const msgEl = form.querySelector('.form-message');

    // 1. Verificar honeypot
    const honeypot = form.querySelector('.form-honeypot input');
    if (honeypot && honeypot.value.trim() !== '') {
      // Es un bot — ignorar silenciosamente
      this.showSuccess(form, msgEl, btn);
      return;
    }

    // 2. Verificar tiempo mínimo de llenado (anti-bot)
    const fillTime = Date.now() - parseInt(form.dataset.loadTime || 0);
    if (fillTime < this.config.minFillTimeMs) {
      // Llenado demasiado rápido — es un bot
      this.showSuccess(form, msgEl, btn);
      return;
    }

    // 3. Rate limiting por sesión
    const now = Date.now();
    this.submitLog = this.submitLog.filter(t => now - t < this.config.cooldownMs);
    if (this.submitLog.length >= this.config.maxSubmits) {
      this.showError(msgEl, 'Has alcanzado el límite de envíos. Intenta en 10 minutos.');
      return;
    }

    // 4. Validar todos los campos
    const isValid = this.validateForm(form);
    if (!isValid) return;

    // 5. Enviar
    btn.disabled = true;
    btn.textContent = '...';

    try {
      const formData = new FormData(form);

      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });

      if (response.ok) {
        this.submitLog.push(Date.now());
        this.showSuccess(form, msgEl, btn);
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      this.showError(msgEl, typeof I18N !== 'undefined'
        ? I18N.t('form_error')
        : 'Hubo un error. Por favor intenta de nuevo.');
      btn.disabled = false;
      btn.textContent = typeof I18N !== 'undefined'
        ? I18N.t('btn_enviar')
        : 'Enviar Solicitud';
    }
  },

  /* ── VALIDAR FORMULARIO COMPLETO ────────────────────────── */
  validateForm(form) {
    let isValid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    return isValid;
  },

  /* ── VALIDAR CAMPO INDIVIDUAL ───────────────────────────── */
  validateField(field) {
    const value = field.value.trim();
    let error = '';

    if (field.hasAttribute('required') && !value) {
      error = 'Este campo es obligatorio.';
    } else if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = 'Ingresa un correo electrónico válido.';
      }
    } else if (field.type === 'tel' && value) {
      const telRegex = /^[\+]?[\d\s\-\(\)]{7,15}$/;
      if (!telRegex.test(value)) {
        error = 'Ingresa un número de teléfono válido.';
      }
    } else if (field.tagName === 'SELECT' && value === '') {
      error = 'Selecciona una opción.';
    }

    // Mostrar u ocultar error
    field.classList.toggle('field-error', !!error);
    let errEl = field.parentElement.querySelector('.field-error-msg');

    if (error) {
      if (!errEl) {
        errEl = document.createElement('span');
        errEl.className = 'field-error-msg';
        errEl.style.cssText = 'color:#ff5050;font-size:0.75rem;margin-top:4px;display:block;';
        field.parentElement.appendChild(errEl);
      }
      errEl.textContent = error;
      return false;
    } else {
      if (errEl) errEl.remove();
      return true;
    }
  },

  /* ── MOSTRAR ÉXITO ──────────────────────────────────────── */
  showSuccess(form, msgEl, btn) {
    form.reset();
    if (msgEl) {
      msgEl.className = 'form-message success';
      msgEl.textContent = typeof I18N !== 'undefined'
        ? I18N.t('form_success')
        : '¡Mensaje enviado! Te contactaremos en menos de 24 horas.';
    }
    if (btn) {
      btn.disabled = true;
      btn.textContent = '✓ Enviado';
    }

    // Scroll suave al mensaje
    msgEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  /* ── MOSTRAR ERROR ──────────────────────────────────────── */
  showError(msgEl, text) {
    if (!msgEl) return;
    msgEl.className = 'form-message error';
    msgEl.textContent = text;
    msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

/* ── ESTILOS DE VALIDACIÓN INLINE ───────────────────────── */
(function addValidationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .field-error {
      border-color: #ff5050 !important;
      box-shadow: 0 0 0 3px rgba(255,80,80,0.12) !important;
    }
  `;
  document.head.appendChild(style);
})();

/* ── INICIAR ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => LEADS.init());
