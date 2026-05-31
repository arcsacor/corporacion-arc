/* ============================================================
   CORPORACION ARC S.A. — leads.js
   Versión: 4.0 | Mayo 2026
   Captacion de leads -> Google Sheets via Apps Script
   ============================================================ */

'use strict';

const LEADS = {

  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxhxReE4_b354I8lXVo-hgwCL6lNsdOGAsVeA_oNUDMbRetMMWBHzclovP1txjJssQ8mA/exec',

  config: {
    maxSubmits: 3,
    cooldownMs: 600000,
    minFillTimeMs: 3000,
  },

  submitLog: [],

  init() {
    document.querySelectorAll('.leads-form-el').forEach(form => {
      this.setupForm(form);
    });
  },

  setupForm(form) {
    form.dataset.loadTime = Date.now();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(form);
    });

    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => {
        field.classList.remove('field-error');
        const errEl = field.parentElement.querySelector('.field-error-msg');
        if (errEl) errEl.remove();
      });
    });
  },

  async handleSubmit(form) {
    const btn = form.querySelector('.form-submit');
    const msgEl = form.querySelector('.form-message');

    // 1. Honeypot anti-bot
    const honeypot = form.querySelector('.form-honeypot input');
    if (honeypot && honeypot.value.trim() !== '') {
      this.showSuccess(form, msgEl, btn);
      return;
    }

    // 2. Tiempo minimo anti-bot
    const fillTime = Date.now() - parseInt(form.dataset.loadTime || 0);
    if (fillTime < this.config.minFillTimeMs) {
      this.showSuccess(form, msgEl, btn);
      return;
    }

    // 3. Rate limiting
    const now = Date.now();
    this.submitLog = this.submitLog.filter(t => now - t < this.config.cooldownMs);
    if (this.submitLog.length >= this.config.maxSubmits) {
      this.showError(msgEl, 'Has alcanzado el límite de envíos. Intenta en 10 minutos.');
      return;
    }

    // 4. Validar campos
    if (!this.validateForm(form)) return;

    // 5. Preparar datos
    btn.disabled = true;
    btn.textContent = '...';

    const formData = new FormData(form);
    const fields = Array.from(formData.entries());

    // Mapear campos especificos por division
    const data = {
      division: formData.get('division') || form.getAttribute('name') || 'General',
      nombre:   formData.get('nombre') || '',
      correo:   formData.get('correo') || '',
      telefono: formData.get('telefono') || '',
      mensaje:  formData.get('mensaje') || '',
      campo1:   '',
      campo2:   '',
      campo3:   ''
    };

    // Campos adicionales segun division
    const extras = fields.filter(([k]) =>
      !['division','nombre','correo','telefono','mensaje','form-name','bot-field'].includes(k)
    );
    if (extras[0]) data.campo1 = `${extras[0][0]}: ${extras[0][1]}`;
    if (extras[1]) data.campo2 = `${extras[1][0]}: ${extras[1][1]}`;
    if (extras[2]) data.campo3 = `${extras[2][0]}: ${extras[2][1]}`;

    // 6. Enviar a Google Sheets
    try {
      const response = await fetch(this.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // no-cors siempre retorna opaque — asumimos exito si no hay error
      this.submitLog.push(Date.now());
      this.showSuccess(form, msgEl, btn);

    } catch (err) {
      this.showError(msgEl, 'Hubo un error al enviar. Por favor intenta de nuevo.');
      btn.disabled = false;
      btn.textContent = 'Enviar Solicitud';
    }
  },

  validateForm(form) {
    let isValid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!this.validateField(field)) isValid = false;
    });
    return isValid;
  },

  validateField(field) {
    const value = field.value.trim();
    let error = '';

    if (field.hasAttribute('required') && !value) {
      error = 'Este campo es obligatorio.';
    } else if (field.type === 'email' && value) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'Ingresa un correo electrónico válido.';
      }
    } else if (field.type === 'tel' && value) {
      if (!/^[\+]?[\d\s\-\(\)]{7,15}$/.test(value)) {
        error = 'Ingresa un número de teléfono válido.';
      }
    } else if (field.tagName === 'SELECT' && value === '') {
      error = 'Selecciona una opción.';
    }

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

  showSuccess(form, msgEl, btn) {
    form.reset();
    if (msgEl) {
      msgEl.className = 'form-message success';
      msgEl.textContent = '¡Mensaje enviado! Te contactaremos en menos de 24 horas.';
    }
    if (btn) {
      btn.disabled = true;
      btn.textContent = '✓ Enviado';
    }
    msgEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  showError(msgEl, text) {
    if (!msgEl) return;
    msgEl.className = 'form-message error';
    msgEl.textContent = text;
    msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

(function addValidationStyles() {
  const style = document.createElement('style');
  style.textContent = `.field-error { border-color: #ff5050 !important; box-shadow: 0 0 0 3px rgba(255,80,80,0.12) !important; }`;
  document.head.appendChild(style);
})();

document.addEventListener('DOMContentLoaded', () => LEADS.init());
