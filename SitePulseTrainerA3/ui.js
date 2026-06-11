/**
 * PulseTrainer — feedback visual, spinners e tolerância a erros
 */
const UI = {
  toastContainer: null,
  confirmOverlay: null,

  init() {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toastContainer';
      this.toastContainer.className = 'toast-container';
      this.toastContainer.setAttribute('role', 'status');
      this.toastContainer.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.toastContainer);
    }
    if (!this.confirmOverlay) {
      this.confirmOverlay = document.createElement('div');
      this.confirmOverlay.id = 'confirmOverlay';
      this.confirmOverlay.className = 'confirm-overlay hidden';
      this.confirmOverlay.innerHTML = `
        <div class="confirm-box" role="alertdialog" aria-modal="true">
          <p class="confirm-message" id="confirmMessage"></p>
          <div class="confirm-actions">
            <button class="btn btn-ghost" id="confirmCancel" type="button">Cancelar</button>
            <button class="btn btn-primary" id="confirmOk" type="button" style="width:auto;min-width:120px;">Confirmar</button>
          </div>
        </div>`;
      document.body.appendChild(this.confirmOverlay);
    }
  },

  toast(message, type = 'info', duration = 3500) {
    this.init();
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-text">${message}</span>`;
    this.toastContainer.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, duration);
  },

  success(msg) { this.toast(msg, 'success'); },
  error(msg) { this.toast(msg, 'error', 5000); },
  warning(msg) { this.toast(msg, 'warning'); },
  info(msg) { this.toast(msg, 'info'); },

  setLoading(btn, loading, originalText) {
    if (!btn) return;
    if (loading) {
      btn.dataset.originalText = btn.innerHTML;
      btn.disabled = true;
      btn.classList.add('loading');
      btn.innerHTML = '<span class="spinner"></span> Aguarde...';
      btn.setAttribute('aria-busy', 'true');
    } else {
      btn.disabled = false;
      btn.classList.remove('loading');
      btn.innerHTML = originalText || btn.dataset.originalText || btn.innerHTML;
      btn.removeAttribute('aria-busy');
    }
  },

  showPageSpinner(pageEl) {
    if (!pageEl) return;
    let overlay = pageEl.querySelector('.page-spinner');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'page-spinner';
      overlay.innerHTML = '<div class="spinner spinner-lg"></div>';
      pageEl.style.position = 'relative';
      pageEl.appendChild(overlay);
    }
    overlay.classList.remove('hidden');
  },

  hidePageSpinner(pageEl) {
    const overlay = pageEl?.querySelector('.page-spinner');
    if (overlay) overlay.classList.add('hidden');
  },

  confirm(message) {
    this.init();
    return new Promise(resolve => {
      const msg = document.getElementById('confirmMessage');
      const ok = document.getElementById('confirmOk');
      const cancel = document.getElementById('confirmCancel');
      msg.textContent = message;
      this.confirmOverlay.classList.remove('hidden');

      const cleanup = (result) => {
        this.confirmOverlay.classList.add('hidden');
        ok.removeEventListener('click', onOk);
        cancel.removeEventListener('click', onCancel);
        resolve(result);
      };
      const onOk = () => cleanup(true);
      const onCancel = () => cleanup(false);
      ok.addEventListener('click', onOk);
      cancel.addEventListener('click', onCancel);
    });
  },

  validateCpf(cpf) {
    const n = Storage.normalizeCpf(cpf);
    if (n.length !== 11) return false;
    if (/^(\d)\1+$/.test(n)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(n[i]) * (10 - i);
    let d1 = (sum * 10) % 11;
    if (d1 === 10) d1 = 0;
    if (d1 !== parseInt(n[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(n[i]) * (11 - i);
    let d2 = (sum * 10) % 11;
    if (d2 === 10) d2 = 0;
    return d2 === parseInt(n[10]);
  },

  setFieldError(input, message) {
    if (!input) return;
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
    let err = input.parentElement.querySelector('.field-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'field-error';
      err.setAttribute('role', 'alert');
      input.parentElement.appendChild(err);
    }
    err.textContent = message;
  },

  clearFieldError(input) {
    if (!input) return;
    input.classList.remove('input-error');
    input.removeAttribute('aria-invalid');
    const err = input.parentElement?.querySelector('.field-error');
    if (err) err.remove();
  },

  clearAllErrors(form) {
    form?.querySelectorAll('.input-error').forEach(el => this.clearFieldError(el));
  },

  maskCpf(input) {
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    input.value = v;
  },

  maskPhone(input) {
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    input.value = v;
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    Storage.setTheme(theme);
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
      toggle.classList.toggle('active', theme === 'dark');
    }
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
    this.info(next === 'light' ? 'Tema claro ativado ☀️' : 'Tema escuro ativado 🌙');
  },

  modal(title, contentHtml) {
    this.init();
    let overlay = document.getElementById('modalOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modalOverlay';
      overlay.className = 'confirm-overlay';
      overlay.innerHTML = `
        <div class="confirm-box" role="dialog" aria-modal="true" style="max-width:420px;width:90%;max-height:80vh;overflow-y:auto;padding:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.08);">
            <div id="modalTitle" style="font-family:var(--font-display);font-size:15px;font-weight:700;"></div>
            <button class="btn btn-ghost btn-sm" id="modalClose" type="button">✕</button>
          </div>
          <div id="modalBody" style="padding:0;"></div>
        </div>`;
      document.body.appendChild(overlay);
      document.getElementById('modalClose').addEventListener('click', () => {
        overlay.classList.add('hidden');
      });
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.add('hidden');
      });
    }
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = contentHtml;
    overlay.classList.remove('hidden');
  },
};
