# Portfólio — Felipe Moreira

Site estático feito com HTML, CSS e JavaScript puro. As animações usam GSAP + ScrollTrigger (em `js/vendor/`).

## Estrutura

```
index.html          página única
css/style.css       estilos (paleta de cores no topo, em :root)
js/script.js        menu mobile, cabeçalho, copiar e-mail e carregamento das animações
js/motion.js        animações GSAP (opcionais: o site funciona sem elas)
js/vendor/          GSAP 3.12.5 e ScrollTrigger
assets/             favicon e imagens
```

## Rodando localmente

Abra o `index.html` no navegador ou use a extensão Live Server do VS Code.

## O que editar

Procure por `EDITAR` no `index.html`:

- **Competências:** etiquetas da hero e da seção "Sobre mim"

### Projetos

Cada projeto é um `<article class="project">`. Duplique um para adicionar mais e ajuste:

- `href` do card (link do site no ar)
- **sem link:** troque o `<a class="project-visual">` por `<div class="project-visual is-static">` (o selo perde a seta). Se for privado, adicione também `is-private` (mostra um cadeado)
- categoria, endereço na barra do navegador, título, descrição e tags
- **print:** salve a imagem em `assets/img/` e descomente o `<img>`. Enquanto não houver print, aparece um mini site desenhado em CSS.

### Cores

Todas as cores estão nas variáveis do `:root`, no começo de `css/style.css`.
