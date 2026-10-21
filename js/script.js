/**
 * Comportamentos essenciais da página: cabeçalho, menu mobile e copiar e-mail.
 * As animações decorativas ficam em motion.js e só são carregadas depois,
 * quando o navegador estiver livre.
 */
(() => {
  'use strict';

  // ---------- Cabeçalho: fica "fosco" depois que a página rola ----------
  const header = document.querySelector('.header');
  let headerFrame = 0;

  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  updateHeader();

  // requestAnimationFrame evita recalcular mais de uma vez por quadro
  window.addEventListener('scroll', () => {
    if (headerFrame) return;
    headerFrame = requestAnimationFrame(() => {
      headerFrame = 0;
      updateHeader();
    });
  }, { passive: true });

  document.querySelector('#year').textContent = new Date().getFullYear();

  // ---------- Menu mobile ----------
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-nav');

  // Sem JS o menu continua "hidden". Com JS ele passa a ser controlado por classe,
  // e "inert" impede o foco nos links enquanto está fechado.
  menu.hidden = false;
  menu.inert = true;

  function openMenu() {
    menu.inert = false;
    menu.classList.add('is-open');
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Fechar menu');
  }

  function closeMenu() {
    menu.inert = true;
    menu.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');
  }

  menuButton.addEventListener('click', () => {
    menu.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      menuButton.focus();
    }
  });

  // Se a tela aumentar com o menu aberto (ex.: girar o tablet), fecha o menu
  window.matchMedia('(min-width: 701px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });

  // ---------- Prints dos projetos: se a imagem falhar, mostra o fallback em CSS ----------
  document.querySelectorAll('.browser img').forEach(img => {
    const hide = () => { img.style.display = 'none'; };
    img.addEventListener('error', hide);
    if (img.complete && !img.naturalWidth) hide();
  });

  // ---------- Copiar e-mail ----------
  // O endereço é lido do próprio link, então só precisa ser editado no HTML.
  const emailLink = document.querySelector('.email');
  const email = emailLink.getAttribute('href').replace('mailto:', '');
  const copyStatus = document.querySelector('.copy-status');

  document.querySelector('.copy-email').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard indisponível');
      await navigator.clipboard.writeText(email);
      copyStatus.textContent = 'E-mail copiado! Vamos conversar.';
    } catch {
      // Sem acesso à área de transferência: seleciona o texto para o usuário copiar
      copyStatus.textContent = `Selecione e copie: ${email}`;
      const range = document.createRange();
      range.selectNodeContents(emailLink);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });

  // ---------- Ticker: pausa a animação CSS quando sai da tela ----------
  const ticker = document.querySelector('.ticker-track');
  if (ticker && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      ticker.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
    }).observe(ticker);
  }

  // ---------- Carregamento das animações (GSAP) ----------
  // Não carrega nada para quem pediu menos movimento ou está economizando dados.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || navigator.connection?.saveData) return;

  const scriptBase = new URL('.', document.currentScript.src);

  const loadScript = file => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL(file, scriptBase).href;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  const startMotion = () => {
    Promise.all([loadScript('vendor/gsap.min.js'), loadScript('vendor/ScrollTrigger.min.js')])
      .then(() => loadScript('motion.js'))
      .catch(() => { /* Sem animações, o conteúdo continua visível normalmente. */ });
  };

  // Dá prioridade à primeira renderização; as animações vêm quando o navegador estiver livre.
  requestAnimationFrame(() => {
    if ('requestIdleCallback' in window) requestIdleCallback(startMotion, { timeout: 1500 });
    else setTimeout(startMotion, 100);
  });
})();
