// ============================================================
//  Hero: slider (crossfade) + efekat vode koja se talasa pod kursorom.
//  - Prva slika je u HTML-u (brz prvi prikaz); ostale se učitaju ovdje,
//    a slika koja se ne može učitati se jednostavno preskoči.
//  - Efekat vode je WebGL (bez biblioteka). Bez WebGL-a ili uz
//    "prefers-reduced-motion" ostaje običan slider.
// ============================================================

const SLIDE_MS = 6500; // koliko se slika zadržava
const FADE_MS = 1400; // trajanje prelaza

// ---------- talasi: simulacija na malom polju + shader ----------
const GRID_W = 180; // širina polja simulacije (visina prati odnos stranica)
const DAMPING = 0.985;
const SLOPE_GAIN = 2.4;
const REFRACT = 0.02; // koliko talas pomjera sliku (udio širine)
const IDLE_ENERGY = 0.0015;

const VERT = `attribute vec2 p; varying vec2 v;
void main(){ v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;

const FRAG = `precision mediump float;
varying vec2 v;
uniform sampler2D uA, uB, uN;
uniform float uMix;
uniform vec4 uCa, uCb;
void main(){
  vec2 n = texture2D(uN, v).rg * 2. - 1.;
  vec2 uv = v + vec2(n.x, -n.y) * ${REFRACT.toFixed(3)};
  vec3 a = texture2D(uA, uv * uCa.xy + uCa.zw).rgb;
  vec3 b = texture2D(uB, uv * uCb.xy + uCb.zw).rgb;
  vec3 c = mix(a, b, uMix);
  c += clamp(dot(n, vec2(-.6, .8)) * 3.5, 0., 1.) * .12;
  gl_FragColor = vec4(c, 1.);
}`;

function createWater(section, host) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'absolute inset-0 h-full w-full';
  canvas.style.display = 'none';
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
  if (!gl) return null;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = (n) => gl.getUniformLocation(prog, n);
  const uMix = U('uMix'), uCa = U('uCa'), uCb = U('uCb');
  gl.uniform1i(U('uA'), 0);
  gl.uniform1i(U('uB'), 1);
  gl.uniform1i(U('uN'), 2);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const newTexture = (unit) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };
  const normalTex = newTexture(2);
  const imageTex = new Map(); // HTMLImageElement -> WebGLTexture

  // tekstura slike se pravi unaprijed (prepare), a ne usred prelaza
  const textureFor = (img) => {
    let t = imageTex.get(img);
    if (!t) {
      t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE3); // posebna jedinica, da ne remeti teksture koje se crtaju
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      imageTex.set(img, t);
    }
    return t;
  };

  // ----- simulacija -----
  let gw = GRID_W, gh = 100;
  let cur = new Float32Array(gw * gh), prev = new Float32Array(gw * gh);
  let normals = new Uint8Array(gw * gh * 4);
  let energy = 0;
  let cssW = 1, cssH = 1;

  const reset = () => {
    gh = Math.max(20, Math.round((GRID_W * cssH) / cssW));
    cur = new Float32Array(gw * gh);
    prev = new Float32Array(gw * gh);
    normals = new Uint8Array(gw * gh * 4);
    energy = 0;
  };

  const drop = (gx, gy, radius, amp) => {
    const x0 = Math.max(1, Math.floor(gx - radius)), x1 = Math.min(gw - 2, Math.ceil(gx + radius));
    const y0 = Math.max(1, Math.floor(gy - radius)), y1 = Math.min(gh - 2, Math.ceil(gy + radius));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x - gx, y - gy) / radius;
        if (d < 1) cur[y * gw + x] -= amp * (1 - d) * (1 - d);
      }
    }
    energy = Math.max(energy, amp);
  };

  const step = () => {
    let max = 0;
    for (let y = 1; y < gh - 1; y++) {
      for (let x = 1; x < gw - 1; x++) {
        const i = y * gw + x;
        const v = ((cur[i - 1] + cur[i + 1] + cur[i - gw] + cur[i + gw]) * 0.5 - prev[i]) * DAMPING;
        prev[i] = v;
        const a = v < 0 ? -v : v;
        if (a > max) max = a;
      }
    }
    const t = cur; cur = prev; prev = t;
    energy = max;
    for (let y = 1; y < gh - 1; y++) {
      for (let x = 1; x < gw - 1; x++) {
        const i = y * gw + x, o = i * 4;
        const nx = Math.max(-1, Math.min(1, (cur[i + 1] - cur[i - 1]) * SLOPE_GAIN));
        const ny = Math.max(-1, Math.min(1, (cur[i + gw] - cur[i - gw]) * SLOPE_GAIN));
        normals[o] = 127.5 + nx * 127.5;
        normals[o + 1] = 127.5 + ny * 127.5;
        normals[o + 2] = 127;
        normals[o + 3] = 255;
      }
    }
  };

  // ----- crtanje -----
  const coverUniform = (img, posX) => {
    const ca = canvas.width / canvas.height;
    const ia = img.naturalWidth / img.naturalHeight;
    if (ca > ia) {
      const sy = ia / ca;
      return [1, sy, 0, (1 - sy) * 0.5];
    }
    const sx = ca / ia;
    return [sx, 1, (1 - sx) * posX, 0];
  };

  let drawnOnce = false;
  const draw = (imgA, imgB, mix, posX) => {
    if (gl.isContextLost() || !imgA || !imgA.naturalWidth) return;
    const b = imgB && imgB.naturalWidth ? imgB : imgA;
    gl.viewport(0, 0, canvas.width, canvas.height);
    const texA = textureFor(imgA);
    const texB = textureFor(b);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texA);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texB);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, normalTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gw, gh, 0, gl.RGBA, gl.UNSIGNED_BYTE, normals);
    gl.uniform1f(uMix, mix);
    gl.uniform4fv(uCa, coverUniform(imgA, posX));
    gl.uniform4fv(uCb, coverUniform(b, posX));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (!drawnOnce) {
      drawnOnce = true;
      canvas.style.display = '';
    }
  };

  const resize = () => {
    const r = section.getBoundingClientRect();
    cssW = Math.max(1, r.width);
    cssH = Math.max(1, r.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    reset();
  };

  // ----- ulaz: kursor / dodir -----
  let last = null;
  const toGrid = (e) => {
    const r = section.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * gw, y: ((e.clientY - r.top) / r.height) * gh, t: e.timeStamp };
  };
  const onMove = (e) => {
    const p = toGrid(e);
    if (last) {
      const dist = Math.hypot(p.x - last.x, p.y - last.y);
      const speed = dist / Math.max(1, p.t - last.t); // polja po ms
      const amp = Math.min(0.35, 0.06 + speed * 0.8);
      const n = Math.max(1, Math.ceil(dist / 2));
      for (let k = 1; k <= n; k++) {
        const f = k / n;
        drop(last.x + (p.x - last.x) * f, last.y + (p.y - last.y) * f, 4, amp);
      }
    }
    last = p;
    api.wake();
  };
  const onDown = (e) => {
    const p = toGrid(e);
    drop(p.x, p.y, 7, 0.7);
    last = p;
    api.wake();
  };
  section.addEventListener('pointermove', onMove, { passive: true });
  section.addEventListener('pointerdown', onDown, { passive: true });
  section.addEventListener('pointerleave', () => { last = null; }, { passive: true });

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    canvas.style.display = 'none';
    api.lost = true;
  });
  canvas.addEventListener('webglcontextrestored', () => {
    // jednostavno: stranica ostaje na običnom sliderima dok se ne osvježi
  });

  host.appendChild(canvas);
  const ro = new ResizeObserver(resize);
  ro.observe(section);
  resize();

  const api = {
    lost: false,
    wake: () => {},
    needsFrame: () => energy > IDLE_ENERGY,
    tick: () => { if (energy > IDLE_ENERGY || last) step(); },
    draw,
    prepare: (img) => { if (!gl.isContextLost() && img.naturalWidth) textureFor(img); },
    hide: () => { canvas.style.display = 'none'; },
  };
  return api;
}

// ---------- slider ----------
export function initHero() {
  const root = document.querySelector('[data-hero]');
  if (!root) return;
  const section = root.closest('section') || root;
  const dotsBox = section.querySelector('[data-hero-dots]');
  const first = root.querySelector('[data-hero-slide]');
  if (!first) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = window.matchMedia('(min-width: 768px)');
  let extra = [];
  try { extra = JSON.parse(root.dataset.slides || '[]'); } catch { extra = []; }

  const slides = [first]; // HTMLImageElement-i koji su se uspješno učitali
  let index = 0;
  let timer = null;
  let visible = true;
  let transition = null; // { from, to, t0 }
  let raf = null;

  const fadeStyle = `opacity ${FADE_MS}ms ease`;
  first.style.transition = fadeStyle;

  // ----- efekat vode -----
  const water = reduceMotion ? null : createWater(section, root);
  if (water) {
    water.wake = () => schedule();
    window.addEventListener('pagehide', () => water.hide());
  }
  const posX = () => (desktop.matches ? 0.5 : 0.68);

  const ease = (x) => x * x * (3 - 2 * x);
  const render = (t) => {
    if (!water || water.lost) return false;
    let mix = 0;
    let a = slides[index];
    let b = null;
    if (transition) {
      mix = ease(Math.max(0, Math.min(1, (t - transition.t0) / FADE_MS)));
      a = slides[transition.from];
      b = slides[transition.to];
      if (mix >= 1) {
        transition = null;
        mix = 0;
        a = slides[index];
        b = null;
      }
    }
    water.tick();
    water.draw(a, b, mix, posX());
    return !!transition || water.needsFrame();
  };
  const frame = (t) => {
    raf = null;
    if (render(t)) schedule();
  };
  function schedule() {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  }

  // ----- prikaz slike -----
  const dots = [];
  const paintDots = () => {
    dots.forEach((d, k) => {
      d.setAttribute('aria-current', String(k === index));
      d.style.background = k === index ? '#fff' : 'rgba(255,255,255,.35)';
    });
  };

  let layer = 1;
  let settleTimer = null;
  const show = (to) => {
    if (to === index || to < 0 || to >= slides.length) return;
    const from = index;
    index = to;
    // nova slika se pojavljuje IZNAD stare (stara ostaje potpuno vidljiva dok se prelaz ne završi),
    // pa pozadina ne probija kroz dvije poluprozirne slike (to je davalo "blic")
    slides[to].style.zIndex = String(++layer);
    slides[to].style.opacity = '1';
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      slides.forEach((s, k) => {
        if (k === index) return;
        s.style.transition = 'none';
        s.style.opacity = '0';
        requestAnimationFrame(() => { s.style.transition = fadeStyle; });
      });
    }, FADE_MS + 100);
    if (water) {
      transition = { from, to, t0: performance.now() };
      schedule();
    }
    paintDots();
    restart();
  };
  const next = () => show((index + 1) % slides.length);

  function restart() {
    clearTimeout(timer);
    if (reduceMotion || slides.length < 2 || !visible || document.hidden) return;
    timer = setTimeout(next, SLIDE_MS);
  }

  const buildDots = () => {
    if (!dotsBox) return;
    dotsBox.innerHTML = '';
    dots.length = 0;
    if (slides.length < 2) return;
    slides.forEach((_, k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', (root.dataset.ariaSlide || 'Slika {n} od {m}').replace('{n}', k + 1).replace('{m}', slides.length));
      b.className = 'h-2.5 w-2.5 rounded-full border border-white/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white';
      b.addEventListener('click', () => show(k));
      dotsBox.appendChild(b);
      dots.push(b);
    });
    paintDots();
  };

  // ostale slike: dodaju se tek kad se učitaju (nedostajuća se preskaču)
  const loadExtra = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.alt = '';
      img.decoding = 'async';
      img.className = 'absolute inset-0 h-full w-full object-cover object-[68%_50%] md:object-center';
      img.style.opacity = '0';
      img.style.transition = fadeStyle;
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

  Promise.all(extra.map(loadExtra)).then((imgs) => {
    imgs.filter(Boolean).forEach((img) => {
      slides.push(img);
      root.insertBefore(img, root.querySelector('canvas'));
      water?.prepare(img); // tekstura se šalje na grafičku unaprijed, da prelaz ne zastane
    });
    buildDots();
    restart();
  });

  // prvi frame čim je prva slika spremna
  const start = () => { water?.prepare(first); buildDots(); schedule(); if (water) render(performance.now()); };
  if (first.complete && first.naturalWidth) start();
  else first.addEventListener('load', start, { once: true });

  // pauza kad hero nije vidljiv ili je kartica u pozadini
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) { schedule(); restart(); } else clearTimeout(timer);
  }).observe(section);
  document.addEventListener('visibilitychange', restart);
  new ResizeObserver(() => { if (water) schedule(); }).observe(section);
}
