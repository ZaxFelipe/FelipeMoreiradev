/**
 * Animações decorativas com GSAP + ScrollTrigger.
 * Carregado sob demanda pelo script.js. Se este arquivo não rodar,
 * a página continua completa e legível, apenas sem movimento.
 */
(() => {
  'use strict';

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const isSmall = () => window.innerWidth <= 700;

  // Barra de progresso de leitura no topo
  gsap.to('.scroll-progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'max', scrub: true }
  });

  // matchMedia desfaz tudo sozinho se o usuário ativar "reduzir movimento" com a página aberta
  const media = gsap.matchMedia();

  media.add('(prefers-reduced-motion: no-preference)', () => {

    // ---------- Entrada do hero ----------
    gsap.timeline({ defaults: { ease: 'power2.out' } })
      .fromTo('.hero-top > *', { y: 12 }, { y: 0, duration: .8, stagger: .12 })
      .fromTo('.hero h1 > span', { y: () => isSmall() ? 20 : 36 }, { y: 0, duration: 1.05, stagger: .16 }, .15)
      .fromTo('.hero-skills > span', { y: 9 }, { y: 0, duration: .65, stagger: .055 }, .55)
      .fromTo('.orb-scene', { scale: .94 }, { scale: 1, duration: 1.1 }, .25)
      .fromTo('.hero-bottom > *', { y: 15 }, { y: 0, duration: .85, stagger: .12 }, .7);

    // ---------- Transição hero → projetos ----------
    // Conforme o ticker sobe, o hero perde destaque e o título de projetos entra pelos lados.
    gsap.timeline({
      scrollTrigger: {
        trigger: '.ticker',
        start: () => {
          const tickerTop = document.querySelector('.ticker').getBoundingClientRect().top + window.scrollY;
          return isSmall()
            ? Math.max(1, tickerTop - window.innerHeight * .96)
            : Math.max(window.innerHeight * .2, tickerTop - window.innerHeight * .6);
        },
        end: () => isSmall() ? 'bottom 38%' : `+=${Math.max(280, window.innerHeight * .45)}`,
        scrub: .6,
        invalidateOnRefresh: true
      }
    })
      .to('.hero-top, .hero-bottom', { y: () => isSmall() ? -8 : -18, opacity: .35, ease: 'none', duration: 1 }, 0)
      .to('.hero-title', { y: () => isSmall() ? -12 : -28, scale: () => isSmall() ? .99 : .97, opacity: .48, transformOrigin: '50% 100%', ease: 'none', duration: 1 }, 0)
      .fromTo('.projects .section-heading > div', { x: () => isSmall() ? -24 : -70, y: 28, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: .8 }, .18)
      .fromTo('.projects .section-heading > p', { x: () => isSmall() ? 24 : 70, y: 28, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: .8 }, .18);

    // ---------- Revelação dos elementos ao entrar na tela ----------
    const entrances = [];

    /** Faz os alvos surgirem (fade + deslocamento) quando o container entra na tela. */
    const reveal = (container, targets, options = {}, start = 'top 92%') => {
      const { x = 0, y = () => isSmall() ? 16 : 28, scale = 1, ...timing } = options;
      const animation = gsap.fromTo(targets, { x, y, scale, opacity: 0 }, {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 1.25,
        stagger: .12,
        ease: 'power1.out',
        ...timing,
        scrollTrigger: { trigger: container, start, once: true, invalidateOnRefresh: true }
      });
      entrances.push({ container, animation });
    };

    document.querySelectorAll('.section-heading').forEach(heading => {
      if (!heading.closest('.projects')) reveal(heading, heading.children, { stagger: .14 });
    });

    // Cards de projeto: a imagem vem do lado de fora, os textos sobem logo depois
    const projects = [...document.querySelectorAll('.project')];
    projects.forEach((project, index) => {
      const visual = project.querySelector('.project-visual');
      const details = [...project.children].filter(child => child !== visual);
      const fromLeft = index % 2 === 0;

      reveal(project, visual, { x: () => isSmall() ? 0 : fromLeft ? -22 : 22, y: 26, scale: .98, duration: 1.45 }, 'top 90%');
      reveal(project, details, { y: 18, duration: 1.15, stagger: .11, delay: .18 }, 'top 90%');
    });

    // Destaca os cards que estão no meio da tela (no desktop, a linha inteira)
    const visuals = projects.map(project => project.querySelector('.project-visual'));
    const step = isSmall() ? 1 : 2;
    for (let i = 0; i < visuals.length; i += step) {
      const row = visuals.slice(i, i + step);
      ScrollTrigger.create({
        trigger: row[0],
        start: 'top 50%',
        end: 'bottom 50%',
        toggleClass: { targets: row, className: 'is-scroll-active' }
      });
    }

    reveal('.about-art', '.about-art', { x: () => isSmall() ? 0 : -28, y: () => isSmall() ? 18 : 0, scale: .985, duration: 1.45 });
    reveal('.about-copy', '.about-copy > *', { x: () => isSmall() ? 0 : 22, y: () => isSmall() ? 16 : 0, stagger: .13 });
    reveal('.process-grid', '.process-grid > div > *', { y: 23, stagger: .22, duration: 1 }, 'top 85%');
    reveal('.contact-top', '.contact-top > *', { stagger: .13 });
    reveal('.contact h2', '.contact h2', { y: () => isSmall() ? 20 : 38, duration: 1.45 });
    reveal('.contact-bottom', '.contact-bottom > *', { stagger: .13 });
    reveal('.footer', '.footer > *', { y: 12, stagger: .1 });

    // Quem navega pelo teclado não deve focar em algo ainda invisível
    const revealFocused = event => {
      entrances.forEach(({ container, animation }) => {
        const element = typeof container === 'string' ? document.querySelector(container) : container;
        if (element?.contains(event.target)) animation.progress(1);
      });
    };
    document.addEventListener('focusin', revealFocused);

    // ---------- Parallax suave ----------
    const parallax = (target, trigger, y) => gsap.to(target, {
      y,
      ease: 'none',
      scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 1.8, invalidateOnRefresh: true }
    });
    gsap.to('.orb-scene', {
      y: () => isSmall() ? 14 : 48,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.8, invalidateOnRefresh: true }
    });
    parallax('.about-art .monogram', '.about', () => isSmall() ? -12 : -34);
    parallax('.about-art .code-card', '.about', () => isSmall() ? 8 : 22);

    // ---------- Card de código "digitado" conforme a rolagem ----------
    const codeCard = document.querySelector('.code-card');
    const codeParts = [];
    const walker = document.createTreeWalker(codeCard, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      codeParts.push({ node: walker.currentNode, characters: [...walker.currentNode.textContent] });
    }
    const codeLength = codeParts.reduce((total, part) => total + part.characters.length, 0);
    codeCard.style.minHeight = `${codeCard.offsetHeight}px`; // evita o card "pular" de altura

    let visibleCharacters = -1;
    const writeCode = progress => {
      const count = Math.round(progress * codeLength);
      if (count === visibleCharacters) return;
      visibleCharacters = count;
      let remaining = count;
      codeParts.forEach(part => {
        part.node.textContent = part.characters.slice(0, Math.max(0, remaining)).join('');
        remaining -= part.characters.length;
      });
    };

    const codeProgress = { value: 0 };
    gsap.to(codeProgress, {
      value: 1,
      ease: 'none',
      onUpdate: () => writeCode(codeProgress.value),
      scrollTrigger: { trigger: codeCard, start: 'top 115%', end: 'bottom 55%', scrub: .35, invalidateOnRefresh: true }
    });
    writeCode(0);

    // ---------- Estrela que viaja: Sobre → Processo → Contato ----------
    // Uma cópia da estrela do "Processo" é posicionada sobre a página e
    // interpolada entre três pontos conforme a rolagem.
    const processStar = document.querySelector('.process-star');
    const flyingStar = processStar.cloneNode(true);
    flyingStar.style.cssText = 'position:absolute;left:0;top:0;margin:0;width:max-content;pointer-events:none;z-index:30;will-change:transform';
    document.body.appendChild(flyingStar);
    processStar.style.visibility = 'hidden';

    const styles = getComputedStyle(document.documentElement);
    const starLight = styles.getPropertyValue('--accent').trim();
    const starDark = styles.getPropertyValue('--ink').trim();
    const points = {};

    const measureStar = () => {
      flyingStar.style.fontSize = getComputedStyle(processStar).fontSize;
      const { offsetWidth: w, offsetHeight: h } = flyingStar;
      const art = document.querySelector('.about-art').getBoundingClientRect();
      const target = processStar.getBoundingClientRect();
      const contact = document.querySelector('.contact-star-target').getBoundingClientRect();

      points.start = { x: art.right + scrollX - w * (isSmall() ? 1.5 : .5), y: art.top + scrollY - h / 2 };
      // Desconta o deslocamento da animação de entrada, que ainda pode estar em andamento
      const revealOffset = Number(gsap.getProperty(processStar, 'y')) || 0;
      points.process = { x: target.left + scrollX + (target.width - w) / 2, y: target.top + scrollY + (target.height - h) / 2 - revealOffset };
      points.contact = { x: contact.left + scrollX - w / 2, y: contact.top + scrollY - h / 2 };
    };

    const placeStar = (from, to, progress, rotation) => {
      const x = from.x + (to.x - from.x) * progress;
      const y = from.y + (to.y - from.y) * progress;
      flyingStar.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
    };

    measureStar();
    const toProcess = { value: 0 };
    const toContact = { value: 0 };

    gsap.to(toProcess, {
      value: 1,
      ease: 'none',
      onUpdate: () => placeStar(points.start, points.process, toProcess.value, 120 * toProcess.value - 25),
      scrollTrigger: {
        trigger: codeCard,
        start: 'top 78%',
        endTrigger: '.process',
        end: 'top 20%',
        scrub: .6,
        invalidateOnRefresh: true,
        onRefresh: measureStar
      }
    });
    placeStar(points.start, points.process, 0, -25);

    gsap.to(toContact, {
      value: 1,
      ease: 'none',
      onUpdate: () => {
        // Só assume o controle depois que a primeira etapa terminou
        if (toContact.value === 0 && toProcess.value < .999) return;
        placeStar(points.process, points.contact, toContact.value, 120 + 100 * toContact.value);
        flyingStar.style.color = gsap.utils.interpolate(starLight, starDark, toContact.value);
      },
      scrollTrigger: {
        trigger: processStar,
        start: 'top 18%',
        endTrigger: '.contact',
        end: 'top 25%',
        scrub: .65,
        invalidateOnRefresh: true,
        onRefresh: measureStar
      }
    });

    // ---------- Esfera flutuando e órbita girando (pausam fora da tela) ----------
    const float = gsap.to('.orb', { y: -13, rotation: -9, duration: 3.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    const orbit = gsap.to('.orbit-one', { rotation: 325, duration: 28, repeat: -1, ease: 'none' });
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top bottom',
      end: 'bottom top',
      onToggle: self => { float.paused(!self.isActive); orbit.paused(!self.isActive); }
    });

    // Limpeza: restaura o estado original se o media query deixar de valer
    return () => {
      document.removeEventListener('focusin', revealFocused);
      codeParts.forEach(part => { part.node.textContent = part.characters.join(''); });
      codeCard.style.minHeight = '';
      flyingStar.remove();
      processStar.style.visibility = '';
    };
  });

  // ---------- Botões "magnéticos": seguem levemente o cursor ----------
  media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    const cleanups = [];

    document.querySelectorAll('.magnetic').forEach(element => {
      const move = event => {
        const rect = element.getBoundingClientRect();
        gsap.to(element, {
          x: (event.clientX - rect.left - rect.width / 2) * .12,
          y: (event.clientY - rect.top - rect.height / 2) * .15,
          duration: .35
        });
      };
      const leave = () => gsap.to(element, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1, .5)' });

      element.addEventListener('pointermove', move);
      element.addEventListener('pointerleave', leave);
      cleanups.push(() => {
        element.removeEventListener('pointermove', move);
        element.removeEventListener('pointerleave', leave);
        gsap.set(element, { x: 0, y: 0 });
      });
    });

    return () => cleanups.forEach(cleanup => cleanup());
  });

  // Recalcula posições depois que imagens e fontes terminam de carregar
  if (document.readyState === 'complete') ScrollTrigger.refresh();
  else window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
