/* =========================================================
   Stack Cards — Landing Page
   Interações: tema, scroll suave, ano dinâmico
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Tema claro/escuro ---------- */
  const THEME_KEY = 'stackcards-theme';
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');

  function getInitialTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    // Atualiza theme-color da meta para barra de navegação mobile
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#14110d' : '#f7f4ed');
    }
  }

  applyTheme(getInitialTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }

  // Acompanha mudança de preferência do sistema (se não houver escolha explícita)
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  /* ---------- Ano dinâmico no footer ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Fade-in no scroll ---------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const animated = document.querySelectorAll(
      '.section-head, .science-card, .feature, .step, .progression-wrapper, .faq-item, .final-cta-box, .problem-chart, .problem-text, .mock-flashcard, .ai-content, .ai-visual'
    );

    animated.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 600ms cubic-bezier(0.4, 0, 0.2, 1), transform 600ms cubic-bezier(0.4, 0, 0.2, 1)';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    animated.forEach((el) => observer.observe(el));
  }

  /* ---------- FAQ: fecha outros ao abrir um (accordion behavior) ---------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item && other.open) other.open = false;
        });
      }
    });
  });

  /* ---------- Scroll suave com offset para header sticky ---------- */
  const HEADER_OFFSET = 80;
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  });

  /* ---------- Header: classe 'scrolled' para mudar sutilmente ao rolar ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    let lastScroll = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 10 && lastScroll <= 10) header.classList.add('scrolled');
      if (y <= 10 && lastScroll > 10) header.classList.remove('scrolled');
      lastScroll = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Toast ---------- */
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  /* ---------- Copiar texto para clipboard ---------- */
  const copyButtons = document.querySelectorAll('[data-copy-target]');

  async function copyTextFallback(text) {
    // Fallback para navegadores sem Clipboard API
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (e) {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }

  copyButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const selector = btn.getAttribute('data-copy-target');
      const target = document.querySelector(selector);
      if (!target) return;

      const text = target.innerText || target.textContent || '';

      let success = false;
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          success = true;
        } catch (e) {
          success = await copyTextFallback(text);
        }
      } else {
        success = await copyTextFallback(text);
      }

      if (success) {
        btn.classList.add('copied');
        showToast('Prompt copiado para a área de transferência');
        setTimeout(() => btn.classList.remove('copied'), 2200);
      } else {
        showToast('Não foi possível copiar — selecione e copie manualmente');
      }
    });
  });

})();
