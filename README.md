# Portfólio — Júlia Araújo

Site de portfólio de uma página para **Júlia Araújo** (Lifestyle Creator · Social Media · Filmmaker).
HTML + CSS + JavaScript puros. **Zero dependências, zero build.**

---

## Como abrir

**Jeito rápido:** dê dois cliques em `index.html`.

**Jeito recomendado** (garante que os vídeos carreguem igual em qualquer navegador):
dois cliques em `abrir-portfolio.bat` — ele sobe um servidor local e abre `http://localhost:8899`.
Para encerrar, feche a janela preta.

---

## Estrutura

```
index.html                 estrutura e conteúdo
css/style.css              todo o design
js/main.js                 todas as animações e interações
assets/img/                fotos em alta (1500px) + posters de vídeo
assets/thumb/              miniaturas da galeria (700px)
assets/video/              vídeos já convertidos para web (H.264)
```

---

## O que tem dentro

| Seção | Conteúdo |
|---|---|
| Abertura | Preloader em contagem regressiva de rolo de filme, com progresso real |
| Hero | Vídeo ambiente, nome em tipografia gigante animada letra a letra, HUD de câmera |
| Sobre | Texto que acende palavra por palavra conforme você rola + fotos com parallax |
| Reel | Player 9:16 próprio (play, som, scrub, tela cheia) dentro de um "film gate" |
| Trabalhos | Contact sheet filtrável + lightbox com teclado, swipe e vídeo |
| Serviços | 4 cards com inclinação 3D e luz que segue o cursor |
| Formação | Linha do tempo das 4 certificações (22h) |
| Contato | Links do Instagram, da agência e do Linktree |

Extras: cursor customizado, grão de filme animado, timecode ao vivo, barra de progresso,
menu em círculo no mobile, contadores animados e suporte a `prefers-reduced-motion`.

---

## Como trocar o conteúdo

**Textos, títulos e links** → `index.html`. Está tudo comentado por seção.

**Cores** → topo do `css/style.css`, no bloco `:root`:

```css
--accent:   #ff2d55;   /* rosa/vermelho principal */
--accent-2: #d9a441;   /* dourado das certificações */
--ink:      #060608;   /* fundo */
--paper:    #f4f0e8;   /* texto */
```

**Trocar uma foto da galeria:** substitua o arquivo em `assets/img/` (versão grande) e
`assets/thumb/` (miniatura) mantendo o mesmo nome — ou aponte para o novo arquivo no
`index.html` (`src` da `<img>` e `data-src` do card).

**Adicionar um trabalho novo:** copie um bloco `<article class="card">` inteiro no `index.html`
e ajuste `data-cat`, `data-type`, `data-src`, `data-title` e `data-desc`.

**Trocar o vídeo do reel:** substitua `assets/video/reel-principal.mp4`.
Se o novo vídeo vier do iPhone (`.MOV`/HEVC), converta antes — Safari e Chrome no Windows
não tocam HEVC direto:

```bash
ffmpeg -i entrada.MOV -vf "scale=720:1280" -c:v libx264 -pix_fmt yuv420p \
       -crf 25 -movflags +faststart -c:a aac -b:a 128k assets/video/reel-principal.mp4
```

---

## Publicar na internet (grátis)

1. **Netlify Drop** — o mais fácil: acesse [app.netlify.com/drop](https://app.netlify.com/drop)
   e arraste esta pasta inteira para a página. O link sai em segundos.
2. **Vercel** — `vercel.com/new`, importe a pasta, deploy.
3. **GitHub Pages** — suba a pasta num repositório e ative Pages nas configurações.

Depois é só colocar o link na bio do Instagram ou dentro do Linktree.

---

## Nota sobre os certificados

Os arquivos originais em `certificados 2` trazem o **CPF da Júlia impresso na imagem**.
Por isso as imagens dos certificados **não foram publicadas no site** — as certificações
aparecem como cards de texto (curso, carga horária, instituição e período), que é o formato
usado em portfólio profissional e não expõe dado pessoal.

Se ela quiser mostrar os certificados como imagem, o caminho seguro é tampar o CPF antes.

---

## Compatibilidade

Chrome, Edge, Firefox e Safari atuais, desktop e mobile.
Funciona offline; só as fontes (Google Fonts) precisam de internet — sem elas o site usa
fontes de sistema equivalentes e continua legível.
