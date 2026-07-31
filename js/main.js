/* ═══════════════════════════════════════════════════════════
   JÚLIA ARAÚJO — PORTFÓLIO · main.js
   Vanilla JS, zero dependências.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ══════════════════════════════════════════════
     1. PRELOADER  —  film leader + progresso real
     ══════════════════════════════════════════════ */
  const Loader = (() => {
    const el   = $('#loader');
    const num  = $('#loaderNum');
    const pct  = $('#loaderPct');
    const bar  = $('#loaderBar');
    const prog = $('.lead-prog');
    const CIRC = 2 * Math.PI * 88;
    let done = false;

    const assets = [
      'assets/img/poster-hero.jpg',
      'assets/img/poster-reel.jpg',
      'assets/img/poster-clipe.jpg',
      'assets/img/juju-07-studio.jpg',
      'assets/img/juju-05-desk.jpg',
      'assets/thumb/juju-01-market.jpg',
      'assets/thumb/juju-02-rooftop.jpg',
      'assets/thumb/juju-03-crates.jpg',
      'assets/thumb/juju-04-shades.jpg',
      'assets/thumb/juju-06-garden.jpg',
      'assets/thumb/juju-08-home.jpg'
    ];

    let loaded = 0, shown = 0, lastNum = 5;

    function paint(p) {
      const v = Math.round(p * 100);
      pct.textContent = String(v).padStart(2, '0') + '%';
      bar.style.width = v + '%';
      if (prog) prog.style.strokeDashoffset = String(CIRC * (1 - p));
      const n = clamp(5 - Math.floor(p * 5), 1, 5);
      if (n !== lastNum) {
        lastNum = n;
        num.textContent = n;
        num.classList.remove('tick');
        void num.offsetWidth;
        num.classList.add('tick');
      }
    }

    // animação suave do progresso (nunca "pula")
    function tick() {
      const target = loaded / assets.length;
      shown = lerp(shown, target, 0.1);
      if (target - shown < 0.005) shown = target;
      paint(shown);
      if (shown < 1) requestAnimationFrame(tick);
      else setTimeout(finish, 420);
    }

    function preload() {
      assets.forEach(src => {
        const img = new Image();
        const bump = () => { loaded++; };
        img.onload = bump;
        img.onerror = bump;
        img.src = src;
      });
    }

    function finish() {
      if (done) return;
      done = true;
      el.classList.add('is-done');
      document.body.classList.remove('is-loading');
      $('#curtain').classList.add('is-open');
      setTimeout(() => { el.remove(); }, 900);
      document.dispatchEvent(new CustomEvent('site:ready'));
    }

    function start() {
      if (REDUCED) { paint(1); setTimeout(finish, 200); return; }
      preload();
      requestAnimationFrame(tick);
      setTimeout(finish, 6500); // rede de segurança
    }

    return { start, finish };
  })();

  /* ══════════════════════════════════════════════
     2. GRÃO DE FILME (canvas)
     ══════════════════════════════════════════════ */
  function initGrain() {
    if (REDUCED) return;
    const cv = $('#grain');
    const ctx = cv.getContext('2d', { alpha: true });
    let w = 0, h = 0, frames = [], i = 0, raf = null, last = 0;

    function build() {
      w = cv.width = Math.ceil(window.innerWidth / 2);
      h = cv.height = Math.ceil(window.innerHeight / 2);
      cv.style.width = '100%';
      cv.style.height = '100%';
      frames = [];
      for (let f = 0; f < 4; f++) {
        const d = ctx.createImageData(w, h);
        const buf = d.data;
        for (let p = 0; p < buf.length; p += 4) {
          const v = (Math.random() * 255) | 0;
          buf[p] = buf[p + 1] = buf[p + 2] = v;
          buf[p + 3] = 255;
        }
        frames.push(d);
      }
    }

    function loop(t) {
      raf = requestAnimationFrame(loop);
      if (t - last < 70) return;         // ~14 fps: textura sem custo
      last = t;
      ctx.putImageData(frames[i = (i + 1) % frames.length], 0, 0);
    }

    build();
    raf = requestAnimationFrame(loop);

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(build, 220);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
      else if (!raf) raf = requestAnimationFrame(loop);
    });
  }

  /* ══════════════════════════════════════════════
     3. CURSOR CUSTOMIZADO + MAGNETISMO
     ══════════════════════════════════════════════ */
  function initCursor() {
    if (!FINE_POINTER || REDUCED) return;
    const cur = $('#cursor');
    const dot = $('.cursor__dot', cur);
    const ring = $('.cursor__ring', cur);
    const label = $('.cursor__label', cur);
    let mx = innerWidth / 2, my = innerHeight / 2;
    let dx = mx, dy = my, rx = mx, ry = my;

    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      document.body.classList.add('has-cursor');
    }, { passive: true });

    (function loop() {
      dx = lerp(dx, mx, 0.9); dy = lerp(dy, my, 0.9);
      rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
      dot.style.transform = `translate(${dx}px,${dy}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      label.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    const HOT = 'a, button, [data-cursor], .card, .chip, .scard';
    document.addEventListener('mouseover', e => {
      const t = e.target.closest(HOT);
      if (!t) return;
      cur.classList.add('is-hot');
      label.textContent = t.getAttribute('data-cursor') || '';
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(HOT) && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(HOT))) {
        cur.classList.remove('is-hot');
      }
    });

    // magnético
    $$('[data-magnet]').forEach(el => {
      const s = 0.32;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * s}px,${(e.clientY - r.top - r.height / 2) * s}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ══════════════════════════════════════════════
     4. SPLIT DE TEXTO
     ══════════════════════════════════════════════ */
  function splitChars(el) {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    [...text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = c === ' ' ? ' ' : c;
      s.style.animationDelay = (i * 42) + 'ms';
      el.appendChild(s);
    });
  }

  function wrapLines(h) {
    $$('span', h).forEach(sp => {
      const i = document.createElement('i');
      i.innerHTML = sp.innerHTML;
      sp.innerHTML = '';
      sp.appendChild(i);
    });
  }

  function splitWords(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      if (!n.nodeValue.trim()) return;
      const frag = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(p => {
        if (!p) return;
        if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(' '));
        else {
          const s = document.createElement('span');
          s.className = 'w';
          s.textContent = p;
          frag.appendChild(s);
        }
      });
      n.parentNode.replaceChild(frag, n);
    });
    return $$('.w', root);
  }

  /* ══════════════════════════════════════════════
     5. REVEALS (IntersectionObserver)
     ══════════════════════════════════════════════ */
  function initReveals() {
    const targets = $$('[data-reveal], .card, .player');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(t => t.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const d = parseInt(el.getAttribute('data-delay') || '0', 10);
        setTimeout(() => el.classList.add('is-in'), d);
        io.unobserve(el);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

    targets.forEach(t => io.observe(t));

    // cards da galeria com stagger em cascata
    $$('#grid .card').forEach((c, i) => c.style.transitionDelay = (i % 4) * 70 + 'ms');
  }

  /* ══════════════════════════════════════════════
     6. SCROLL ENGINE (progresso, parallax, scrub, nav)
     ══════════════════════════════════════════════ */
  function initScroll() {
    const bar = $('#progressBar');
    const nav = $('#nav');
    const parallax = $$('[data-parallax]').map(el => ({ el, f: parseFloat(el.getAttribute('data-parallax')) }));
    const scrubs = $$('[data-scrub]').map(el => ({ el, words: splitWords(el) }));
    let lastY = window.scrollY, ticking = false;

    function frame() {
      ticking = false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;

      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

      // nav
      nav.classList.toggle('is-stuck', y > 40);
      if (y > 420 && y > lastY + 4) nav.classList.add('is-hidden');
      else if (y < lastY - 4) nav.classList.remove('is-hidden');
      lastY = y;

      if (!REDUCED) {
        parallax.forEach(p => {
          const r = p.el.getBoundingClientRect();
          const off = (r.top + r.height / 2 - vh / 2) * p.f;
          p.el.style.transform = `translate3d(0,${off.toFixed(2)}px,0)`;
        });
      }

      // texto que acende conforme o scroll
      scrubs.forEach(s => {
        const r = s.el.getBoundingClientRect();
        const start = vh * 0.86, end = vh * 0.30;
        const p = clamp((start - r.top) / (start - end + r.height * 0.55), 0, 1);
        const n = Math.round(p * s.words.length);
        s.words.forEach((w, i) => w.classList.toggle('lit', i < n));
      });
    }

    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(frame); }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    frame();

    // link ativo
    const links = $$('.nav__links a');
    const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window && secs.length) {
      const io = new IntersectionObserver(ents => {
        ents.forEach(e => {
          if (!e.isIntersecting) return;
          links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      secs.forEach(s => io.observe(s));
    }
  }

  /* ══════════════════════════════════════════════
     7. CONTADORES
     ══════════════════════════════════════════════ */
  function initCounters() {
    const els = $$('.count');
    if (!els.length) return;
    const fmt = (n, sep) => sep ? n.toLocaleString('pt-BR') : String(n);

    const run = el => {
      const to = parseFloat(el.getAttribute('data-to')) || 0;
      const sfx = el.getAttribute('data-suffix') || '';
      const sep = el.hasAttribute('data-sep');
      if (REDUCED) { el.textContent = fmt(to, sep) + sfx; return; }
      const dur = 1700, t0 = performance.now();
      (function step(t) {
        const p = clamp((t - t0) / dur, 0, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(to * e), sep) + sfx;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    };

    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    const io = new IntersectionObserver(ents => {
      ents.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    els.forEach(e => io.observe(e));
  }

  /* ══════════════════════════════════════════════
     8. NAV / MENU MOBILE
     ══════════════════════════════════════════════ */
  function initNav() {
    const burger = $('#burger');
    const menu = $('#menu');
    const close = () => {
      burger.classList.remove('is-on');
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
    };
    burger.addEventListener('click', () => {
      const on = menu.classList.toggle('is-open');
      burger.classList.toggle('is-on', on);
      menu.setAttribute('aria-hidden', String(!on));
      burger.setAttribute('aria-expanded', String(on));
    });
    $$('[data-nav]', menu).forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ══════════════════════════════════════════════
     9. TIMECODE (HH:MM:SS:FF @24fps)
     ══════════════════════════════════════════════ */
  function initTimecode() {
    const el = $('#timecode');
    if (!el) return;
    const t0 = performance.now();
    const pad = n => String(n).padStart(2, '0');
    (function loop() {
      const ms = performance.now() - t0;
      const s = Math.floor(ms / 1000);
      el.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(Math.floor((ms % 1000) / 1000 * 24))}`;
      setTimeout(loop, 42);
    })();
  }

  /* ══════════════════════════════════════════════
     10. PLAYER DO REEL
     ══════════════════════════════════════════════ */
  function initPlayer() {
    const wrap = $('#player');
    if (!wrap) return;
    const v = $('#reelVideo', wrap);
    const big = $('#playBig');
    const toggle = $('#playToggle');
    const mute = $('#muteToggle');
    const fs = $('#fsToggle');
    const pbar = $('#pbar');
    const pfill = $('#pfill');
    const phandle = $('#phandle');
    const ptime = $('#ptime');

    const fmt = t => {
      if (!isFinite(t)) t = 0;
      const m = Math.floor(t / 60), s = Math.floor(t % 60);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const play = () => v.play().then(() => wrap.classList.add('is-playing')).catch(() => {});
    const pause = () => { v.pause(); wrap.classList.remove('is-playing'); };

    big.addEventListener('click', () => {
      // primeiro clique: toca já com som
      v.muted = false;
      wrap.classList.add('is-unmuted');
      play();
    });
    toggle.addEventListener('click', () => (v.paused ? play() : pause()));
    v.addEventListener('click', () => (v.paused ? play() : pause()));
    v.addEventListener('play', () => wrap.classList.add('is-playing'));
    v.addEventListener('pause', () => wrap.classList.remove('is-playing'));

    mute.addEventListener('click', () => {
      v.muted = !v.muted;
      wrap.classList.toggle('is-unmuted', !v.muted);
    });

    fs.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else (wrap.requestFullscreen || wrap.webkitRequestFullscreen || function () {}).call(wrap);
    });

    v.addEventListener('timeupdate', () => {
      const p = v.duration ? v.currentTime / v.duration : 0;
      pfill.style.width = (p * 100) + '%';
      phandle.style.left = (p * 100) + '%';
      pbar.setAttribute('aria-valuenow', Math.round(p * 100));
      ptime.textContent = `${fmt(v.currentTime)} / ${fmt(v.duration)}`;
    });
    v.addEventListener('loadedmetadata', () => {
      ptime.textContent = `00:00 / ${fmt(v.duration)}`;
    });

    // scrub
    let dragging = false;
    const seek = e => {
      const r = pbar.getBoundingClientRect();
      const p = clamp((e.clientX - r.left) / r.width, 0, 1);
      if (v.duration) v.currentTime = p * v.duration;
      pfill.style.width = (p * 100) + '%';
      phandle.style.left = (p * 100) + '%';
    };
    pbar.addEventListener('pointerdown', e => { dragging = true; pbar.setPointerCapture(e.pointerId); seek(e); });
    pbar.addEventListener('pointermove', e => { if (dragging) seek(e); });
    pbar.addEventListener('pointerup', e => { dragging = false; try { pbar.releasePointerCapture(e.pointerId); } catch (_) {} });
    pbar.addEventListener('keydown', e => {
      if (!v.duration) return;
      if (e.key === 'ArrowRight') { v.currentTime = Math.min(v.duration, v.currentTime + 5); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { v.currentTime = Math.max(0, v.currentTime - 5); e.preventDefault(); }
    });

    // preview silencioso ao entrar em tela / pausa ao sair
    if ('IntersectionObserver' in window && !REDUCED) {
      const io = new IntersectionObserver(ents => {
        ents.forEach(e => {
          if (e.isIntersecting) {
            if (v.paused && v.muted) v.play().then(() => wrap.classList.add('is-playing')).catch(() => {});
          } else if (!v.paused) {
            pause();
          }
        });
      }, { threshold: 0.45 });
      io.observe(wrap);
    }

    document.addEventListener('visibilitychange', () => { if (document.hidden && !v.paused) pause(); });
  }

  /* ══════════════════════════════════════════════
     11. VÍDEO AMBIENTE DO HERO
     ══════════════════════════════════════════════ */
  function initHeroVideo() {
    const v = $('#heroVideo');
    if (!v) return;
    v.muted = true;
    if (REDUCED) return;
    const go = () => v.play().catch(() => {});
    go();
    document.addEventListener('site:ready', go);
    document.addEventListener('click', go, { once: true });
    document.addEventListener('visibilitychange', () => (document.hidden ? v.pause() : go()));
  }

  /* ══════════════════════════════════════════════
     12. FILTROS + LIGHTBOX
     ══════════════════════════════════════════════ */
  function initGallery() {
    const grid = $('#grid');
    if (!grid) return;
    const cards = $$('.card', grid);
    const chips = $$('.chip');

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const f = chip.getAttribute('data-filter');
        chips.forEach(c => {
          const on = c === chip;
          c.classList.toggle('is-on', on);
          c.setAttribute('aria-selected', String(on));
        });
        cards.forEach((c, i) => {
          const show = f === 'all' || c.getAttribute('data-cat') === f;
          c.classList.toggle('is-hidden', !show);
          if (show) {
            c.style.transitionDelay = (i % 4) * 55 + 'ms';
            c.classList.remove('is-in');
            requestAnimationFrame(() => requestAnimationFrame(() => c.classList.add('is-in')));
          }
        });
      });
    });

    /* ---- lightbox ---- */
    const lb = $('#lb');
    const media = $('#lbMedia');
    const tEl = $('#lbTitle'), dEl = $('#lbDesc'), cEl = $('#lbCount');
    let list = [], idx = 0, lastFocus = null;

    const visible = () => cards.filter(c => !c.classList.contains('is-hidden'));

    function render() {
      const c = list[idx];
      if (!c) return;
      media.innerHTML = '';
      const type = c.getAttribute('data-type');
      const src = c.getAttribute('data-src');
      if (type === 'video') {
        const v = document.createElement('video');
        v.src = src;
        v.poster = c.getAttribute('data-poster') || '';
        v.controls = true; v.autoplay = true; v.playsInline = true; v.loop = true;
        v.setAttribute('playsinline', '');
        media.appendChild(v);
        v.play().catch(() => {});
      } else {
        const i = document.createElement('img');
        i.src = src;
        i.alt = c.getAttribute('data-title') || '';
        media.appendChild(i);
      }
      tEl.textContent = c.getAttribute('data-title') || '';
      dEl.textContent = c.getAttribute('data-desc') || '';
      cEl.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(list.length).padStart(2, '0');
    }

    function open(card) {
      list = visible();
      idx = Math.max(0, list.indexOf(card));
      lastFocus = document.activeElement;
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lb-open');
      render();
      $('#lbClose').focus();
    }
    function close() {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('lb-open');
      setTimeout(() => { media.innerHTML = ''; }, 450);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    const step = d => { idx = (idx + d + list.length) % list.length; render(); };

    cards.forEach(c => {
      c.setAttribute('tabindex', '0');
      c.setAttribute('role', 'button');
      c.addEventListener('click', () => open(c));
      c.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(c); }
      });
    });

    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', () => step(-1));
    $('#lbNext').addEventListener('click', () => step(1));
    lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb__stage')) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });

    // swipe no mobile
    let sx = 0;
    lb.addEventListener('touchstart', e => { sx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════
     13. TILT 3D + SPOTLIGHT NOS CARDS DE SERVIÇO
     ══════════════════════════════════════════════ */
  function initTilt() {
    if (!FINE_POINTER || REDUCED) return;
    $$('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (px * 100) + '%');
        el.style.setProperty('--my', (py * 100) + '%');
        el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 5}deg) rotateY(${(px - 0.5) * 5}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ══════════════════════════════════════════════
     14. TOAST + EASTER EGG
     ══════════════════════════════════════════════ */
  const toast = (() => {
    const el = $('#toast');
    let t;
    return msg => {
      el.textContent = msg;
      el.classList.add('is-on');
      clearTimeout(t);
      t = setTimeout(() => el.classList.remove('is-on'), 3600);
    };
  })();

  function initEgg() {
    const h = $('#heart');
    if (!h) return;
    const msgs = [
      'Feito com muito amor para a Juju ♥',
      'Orgulho de ver seu trabalho em cada frame ♥',
      'A melhor filmmaker que eu conheço ♥'
    ];
    let i = 0;
    h.addEventListener('click', () => { toast(msgs[i % msgs.length]); i++; });
  }

  /* ══════════════════════════════════════════════
     15. SCROLL SUAVE PARA ÂNCORAS
     ══════════════════════════════════════════════ */
  function initAnchors() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const t = $(id);
        if (!t) return;
        e.preventDefault();
        const y = t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : 40);
        window.scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' });
        history.replaceState(null, '', id);
      });
    });
  }

  /* ══════════════════════════════════════════════
     BOOT
     ══════════════════════════════════════════════ */
  function boot() {
    // prepara o texto antes de qualquer reveal
    $$('[data-split]').forEach(splitChars);
    $$('[data-reveal="lines"]').forEach(wrapLines);

    initGrain();
    initCursor();
    initNav();
    initTimecode();
    initHeroVideo();
    initPlayer();
    initGallery();
    initTilt();
    initReveals();
    initScroll();
    initCounters();
    initAnchors();
    initEgg();

    Loader.start();

    // hero entra assim que o site abre
    document.addEventListener('site:ready', () => {
      $$('.hero__title .line, .cta__title .line').forEach(l => l.classList.add('is-in'));
      $$('.hero [data-reveal]').forEach(el => {
        const d = parseInt(el.getAttribute('data-delay') || '0', 10);
        setTimeout(() => el.classList.add('is-in'), 200 + d);
      });
    }, { once: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
