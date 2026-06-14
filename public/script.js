/* ═══════════════════════════════════════════
   MOODCANVAS — script.js
   All interactivity, canvas art, transitions
═══════════════════════════════════════════ */
'use strict';

/* ── MOOD DATA ──────────────────────────── */
const MOODS = {
  joy: {
    label: 'Joy',
    colors: ['#f59e0b','#fbbf24','#fde68a','#f97316','#ef4444','#fff7ed'],
    bg: ['#1c0a00','#2d1000'],
    particles: 'burst',
    therapy: '"Joy is the simplest form of gratitude." Let it rise.',
    quotes: [
      'Joy is not in things — it is in us. — Richard Wagner',
      'Find ecstasy in life; the mere sense of living is joy enough. — Emily Dickinson',
      'The most wasted of all days is one without laughter. — e.e. cummings'
    ]
  },
  calm: {
    label: 'Calm',
    colors: ['#0ea5e9','#38bdf8','#7dd3fc','#0284c7','#bae6fd','#e0f7fa'],
    bg: ['#020617','#0c1a2e'],
    particles: 'flow',
    therapy: 'Calm is a superpower. Your breath is proof of it.',
    quotes: [
      'Nothing is so aggravating as calmness. — Oscar Wilde',
      'Calm mind brings inner strength and self-confidence. — Dalai Lama',
      'Within you, there is a stillness and a sanctuary. — Hermann Hesse'
    ]
  },
  melancholy: {
    label: 'Melancholy',
    colors: ['#818cf8','#a5b4fc','#6366f1','#4338ca','#c7d2fe','#ddd6fe'],
    bg: ['#0d0f1a','#1a1530'],
    particles: 'drift',
    therapy: 'Melancholy is not sadness — it is depth. You are feeling fully.',
    quotes: [
      'Melancholy is the happiness of being sad. — Victor Hugo',
      'There is no exquisite beauty without some strangeness in the proportion. — Edgar Allan Poe',
      'The soul that sees beauty may sometimes walk alone. — Goethe'
    ]
  },
  passion: {
    label: 'Passion',
    colors: ['#f43f5e','#fb7185','#ff0040','#e11d48','#fda4af','#ffe4e6'],
    bg: ['#1a0008','#2d0010'],
    particles: 'fire',
    therapy: 'Passion is the fire that lights your true self. Let it burn.',
    quotes: [
      'Passion is energy. Feel the power that comes from focusing on what excites you. — Oprah',
      'Chase your passion, not your pension. — Denis Waitley',
      'There is no greatness without a passion to be great. — Anthony Robbins'
    ]
  },
  awe: {
    label: 'Awe',
    colors: ['#a78bfa','#c084fc','#e879f9','#8b5cf6','#7c3aed','#f0abfc'],
    bg: ['#050010','#0d0520'],
    particles: 'cosmos',
    therapy: 'Awe reminds you: you are small, and that is a beautiful relief.',
    quotes: [
      'The universe is under no obligation to make sense to you. — Neil deGrasse Tyson',
      'Two things fill me with wonder: the starry sky above, the moral law within. — Kant',
      'Look up at the stars, not down at your feet. — Stephen Hawking'
    ]
  },
  chaos: {
    label: 'Chaos',
    colors: ['#4ade80','#86efac','#22c55e','#16a34a','#bef264','#d9f99d'],
    bg: ['#001a08','#0a2010'],
    particles: 'electric',
    therapy: 'Chaos contains every possibility. You are not broken — you are becoming.',
    quotes: [
      'In the midst of chaos, there is also opportunity. — Sun Tzu',
      'Chaos was the law of nature; order was the dream of man. — Henry Adams',
      'Out of chaos, find simplicity. From discord, find harmony. — Bruce Lee'
    ]
  }
};

/* ── STATE ──────────────────────────────── */
const state = {
  currentPage: 'home',
  currentMood: null,
  artLoop: null,
  heroLoop: null,
  transitioning: false,
  transitionIndex: 0,
  particles: [],
  heroParticles: [],
  intensity: 5,
  density: 5,
  speed: 5,
  seed: Math.random()
};

/* ── DOM REFS ────────────────────────────── */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const artCanvas     = $('art-canvas');
const heroCanvas    = $('hero-canvas');
const transCanvas   = $('transition-canvas');
const transOverlay  = $('transition-overlay');
const cursor        = $('cursor');
const cursorTrail   = $('cursor-trail');
const moodPanel     = $('panel-mood');
const controlPanel  = $('panel-controls');
const moodTag       = $('current-mood-tag');
const therapyNote   = $('therapy-note');
const homeQuote     = $('home-quote');

/* ══════════════════════════════════════════
   CURSOR
══════════════════════════════════════════ */
let mouseX = -100, mouseY = -100;
let trailX = -100, trailY = -100;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});
function animateTrail() {
  trailX += (mouseX - trailX) * 0.12;
  trailY += (mouseY - trailY) * 0.12;
  cursorTrail.style.left = trailX + 'px';
  cursorTrail.style.top  = trailY + 'px';
  requestAnimationFrame(animateTrail);
}
animateTrail();
document.addEventListener('mousedown', () => {
  cursor.style.transform = 'translate(-50%,-50%) scale(0.7)';
  cursorTrail.style.transform = 'translate(-50%,-50%) scale(1.4)';
});
document.addEventListener('mouseup', () => {
  cursor.style.transform = 'translate(-50%,-50%) scale(1)';
  cursorTrail.style.transform = 'translate(-50%,-50%) scale(1)';
});

/* ══════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════ */
function navigateTo(page) {
  if (page === state.currentPage || state.transitioning) return;
  state.transitioning = true;

  // Pick a transition style, cycling through them
  const transitions = ['ink', 'spiral', 'wipe', 'mosaic', 'ripple', 'fade'];
  const style = transitions[state.transitionIndex % transitions.length];
  state.transitionIndex++;

  playTransition(style, () => {
    // Hide current, show next
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.nav === page);
    });
    $('page-' + page).classList.add('active');
    document.body.dataset.page = page;
    state.currentPage = page;
    window.scrollTo(0, 0);

    // Page init
    if (page === 'home')   initHomePage();
    if (page === 'create') initCreatePage();
    if (page === 'about')  initAboutPage();

    state.transitioning = false;
  });
}

// Attach nav listeners
document.addEventListener('click', e => {
  const el = e.target.closest('[data-nav]');
  if (el) navigateTo(el.dataset.nav);
});

// Hamburger
$('hamburger').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('open');
});

/* ══════════════════════════════════════════
   TRANSITIONS — each one unique
══════════════════════════════════════════ */
function playTransition(style, callback) {
  const canvas = transCanvas;
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const W = canvas.width, H = canvas.height;
  transOverlay.style.opacity = 1;
  transOverlay.classList.add('active');

  let prog = 0;
  let midFired = false;
  let raf;

  function tick() {
    prog += 0.025;
    if (prog > 1) prog = 1;
    ctx.clearRect(0,0,W,H);

    switch(style) {
      case 'ink':     drawInk(ctx, W, H, prog);    break;
      case 'spiral':  drawSpiral(ctx, W, H, prog);  break;
      case 'wipe':    drawWipe(ctx, W, H, prog);    break;
      case 'mosaic':  drawMosaic(ctx, W, H, prog);  break;
      case 'ripple':  drawRipple(ctx, W, H, prog);  break;
      case 'fade':    drawFade(ctx, W, H, prog);    break;
    }

    if (prog >= 0.5 && !midFired) {
      midFired = true;
      callback();
    }
    if (prog < 1) {
      raf = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf);
      transOverlay.style.opacity = 0;
      transOverlay.classList.remove('active');
      ctx.clearRect(0,0,W,H);
    }
  }
  requestAnimationFrame(tick);
}

function drawInk(ctx, W, H, p) {
  const cx = W/2, cy = H/2;
  const phase = p < 0.5 ? p*2 : 1-(p-0.5)*2;
  const r = Math.max(W,H) * phase * 1.5;
  ctx.beginPath();
  // Organic blob using sin waves
  ctx.save();
  ctx.translate(cx, cy);
  for(let i=0;i<6;i++){
    const angle = (i/6)*Math.PI*2;
    const wobble = 1 + 0.3*Math.sin(p*12 + i*1.5);
    const x = Math.cos(angle)*r*wobble;
    const y = Math.sin(angle)*r*wobble;
    i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
  }
  ctx.closePath();
  ctx.fillStyle = '#0d0b14';
  ctx.fill();
  ctx.restore();
}

function drawSpiral(ctx, W, H, p) {
  const phase = p < 0.5 ? p*2 : 1-(p-0.5)*2;
  ctx.save();
  ctx.translate(W/2, H/2);
  ctx.rotate(p * Math.PI * 4);
  ctx.scale(phase*2, phase*2);
  ctx.fillStyle = '#0d0b14';
  for(let i=0;i<8;i++){
    ctx.beginPath();
    ctx.moveTo(0,0);
    const a1 = (i/8)*Math.PI*2;
    const a2 = ((i+0.5)/8)*Math.PI*2;
    const r = Math.max(W,H);
    ctx.lineTo(Math.cos(a1)*r, Math.sin(a1)*r);
    ctx.lineTo(Math.cos(a2)*r, Math.sin(a2)*r);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawWipe(ctx, W, H, p) {
  const phase = p < 0.5 ? p*2 : 1-(p-0.5)*2;
  // Diagonal wipe with ripple edge
  ctx.fillStyle = '#0d0b14';
  ctx.beginPath();
  const edge = W * phase * 1.4;
  ctx.moveTo(0, 0);
  ctx.lineTo(edge, 0);
  for(let y=0; y<=H; y+=6){
    const ripple = Math.sin(y*0.04 + p*20) * 30 * phase;
    ctx.lineTo(edge - y * 0.6 + ripple, y);
  }
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
}

function drawMosaic(ctx, W, H, p) {
  const phase = p < 0.5 ? p*2 : 1-(p-0.5)*2;
  const size  = 60;
  ctx.fillStyle = '#0d0b14';
  for(let x=0;x<W;x+=size){
    for(let y=0;y<H;y+=size){
      const dist = Math.sqrt((x-W/2)**2 + (y-H/2)**2) / Math.max(W,H);
      const threshold = phase * 1.4 - dist * 0.5;
      if(threshold > Math.random()*0.3) {
        const s = size * Math.min(1, threshold * 2);
        const cx = x + size/2, cy = y + size/2;
        ctx.fillRect(cx-s/2, cy-s/2, s, s);
      }
    }
  }
}

function drawRipple(ctx, W, H, p) {
  const phase = p < 0.5 ? p*2 : 1-(p-0.5)*2;
  const cx = W/2, cy = H/2;
  const maxR = Math.sqrt(W*W+H*H)/2;
  for(let i=5; i>=0; i--){
    const rOuter = maxR * phase * (1 + i*0.12);
    const rInner = maxR * phase * (0.9 + i*0.12);
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, Math.PI*2);
    ctx.arc(cx, cy, Math.max(0, rInner), 0, Math.PI*2, true);
    ctx.fillStyle = `rgba(13,11,20,${1 - i*0.15})`;
    ctx.fill();
  }
}

function drawFade(ctx, W, H, p) {
  const phase = p < 0.5 ? p*2 : 1-(p-0.5)*2;
  // Starburst fade
  ctx.save();
  ctx.translate(W/2, H/2);
  const rays = 12;
  for(let i=0;i<rays;i++){
    const angle = (i/rays)*Math.PI*2 + p*Math.PI;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const spread = (Math.PI*2/rays) * phase;
    ctx.arc(0, 0, Math.max(W,H), angle - spread/2, angle + spread/2);
    ctx.closePath();
    ctx.fillStyle = '#0d0b14';
    ctx.fill();
  }
  ctx.restore();
}

/* ══════════════════════════════════════════
   HERO CANVAS — HOME
══════════════════════════════════════════ */
function initHeroCanvas() {
  const canvas = heroCanvas;
  const ctx    = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Floating nebula orbs
  const orbs = Array.from({length: 7}, (_, i) => ({
    x: Math.random() * 1000,
    y: Math.random() * 600,
    r: 80 + Math.random() * 180,
    vx: (Math.random()-0.5) * 0.3,
    vy: (Math.random()-0.5) * 0.3,
    hue: 240 + i * 30,
    opacity: 0.2 + Math.random() * 0.2
  }));

  // Star field
  const stars = Array.from({length: 120}, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.5 + Math.random() * 1.5,
    twinkle: Math.random() * Math.PI * 2
  }));

  let t = 0;

  function draw() {
    ctx.clearRect(0,0,W,H);

    // Gradient base
    const grd = ctx.createLinearGradient(0,0,W,H);
    grd.addColorStop(0, '#0d0b14');
    grd.addColorStop(1, '#13101f');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,W,H);

    // Stars
    stars.forEach(s => {
      s.twinkle += 0.02;
      const a = 0.3 + 0.7 * Math.abs(Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    });

    // Nebula orbs
    orbs.forEach(o => {
      o.x += o.vx;
      o.y += o.vy;
      if(o.x < -o.r) o.x = W + o.r;
      if(o.x > W+o.r) o.x = -o.r;
      if(o.y < -o.r) o.y = H + o.r;
      if(o.y > H+o.r) o.y = -o.r;

      const hue = o.hue + t * 0.2;
      const grd = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      grd.addColorStop(0, `hsla(${hue},80%,65%,${o.opacity})`);
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI*2);
      ctx.fillStyle = grd;
      ctx.fill();
    });

    // Wave lines
    for(let w=0; w<4; w++){
      ctx.beginPath();
      const yOff = H * (0.3 + w * 0.15);
      const amp  = 15 + w * 8;
      const freq = 0.005 + w * 0.002;
      const speed = t * 0.8 + w * 100;
      for(let x=0; x<=W; x+=3){
        const y = yOff + Math.sin(x * freq + speed) * amp + Math.sin(x*freq*2.3 + speed*0.7)*amp*0.4;
        x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.strokeStyle = `hsla(${270 + w*20},70%,70%,${0.06 - w*0.01})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    t++;
    state.heroLoop = requestAnimationFrame(draw);
  }

  if(state.heroLoop) cancelAnimationFrame(state.heroLoop);
  draw();
}

/* ══════════════════════════════════════════
   ART CANVAS — CREATE PAGE
══════════════════════════════════════════ */
function initArtCanvas(mood) {
  if(state.artLoop) cancelAnimationFrame(state.artLoop);
  state.particles = [];
  state.seed = Math.random();

  const canvas = artCanvas;
  const ctx    = canvas.getContext('2d');
  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const data = MOODS[mood];
  const colors = data.colors;
  const bgColors = data.bg;
  const type = data.particles;
  const intensity = state.intensity / 5;
  const density = Math.floor(state.density * 20);
  const spd = state.speed / 5;
  const seed = state.seed;

  // Background gradient — animated
  let t = 0;

  // Build particles based on type
  function createParticle() {
    const base = {
      x: Math.random() * W,
      y: Math.random() * H,
      life: 0,
      maxLife: 150 + Math.random() * 200,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    switch(type){
      case 'burst':
        return { ...base,
          vx: (Math.random()-0.5) * 3 * intensity,
          vy: (Math.random()-0.5) * 3 * intensity - 1.5,
          r: 2 + Math.random() * 6,
          trail: [],
        };
      case 'flow':
        return { ...base,
          vx: (Math.random()-0.5) * 1,
          vy: -0.5 - Math.random() * 0.5,
          r: 2 + Math.random() * 12,
          wave: Math.random() * Math.PI * 2,
        };
      case 'drift':
        return { ...base,
          vx: (Math.random()-0.5) * 0.5,
          vy: -0.2 - Math.random() * 0.4,
          r: 1 + Math.random() * 5,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpd: 0.02 + Math.random()*0.03,
        };
      case 'fire':
        return { ...base,
          x: W/3 + Math.random()*(W/3),
          y: H,
          vx: (Math.random()-0.5) * 2,
          vy: -2 - Math.random() * 4 * intensity,
          r: 3 + Math.random() * 8,
          maxLife: 80 + Math.random() * 80,
        };
      case 'cosmos':
        return { ...base,
          vx: 0,
          vy: 0,
          r: 0.5 + Math.random() * 4,
          orbit: Math.random() * Math.PI * 2,
          orbitR: 20 + Math.random() * (Math.min(W,H)/2.5),
          orbitSpd: (Math.random()-0.5) * 0.02 * spd,
          cx: W/2 + (Math.random()-0.5)*200,
          cy: H/2 + (Math.random()-0.5)*200,
        };
      case 'electric':
        return { ...base,
          vx: (Math.random()-0.5) * 5 * intensity,
          vy: (Math.random()-0.5) * 5 * intensity,
          r: 1 + Math.random() * 4,
          trail: [],
          decay: 0.88 + Math.random()*0.08,
        };
    }
  }

  // Populate
  for(let i=0;i<density;i++) {
    const p = createParticle();
    if(p) { p.life = Math.random() * p.maxLife; state.particles.push(p); }
  }

  // Draw background swirls (static base)
  function drawBg() {
    const grd = ctx.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, bgColors[0]);
    grd.addColorStop(1, bgColors[1] || bgColors[0]);
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,W,H);

    // Two large background gradient orbs
    const orbPositions = [
      { x: W*0.2, y: H*0.3, r: W*0.4 },
      { x: W*0.8, y: H*0.7, r: W*0.3 },
    ];
    orbPositions.forEach((o, i) => {
      const col = colors[i * 2 % colors.length];
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      g.addColorStop(0, col + '22');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI*2);
      ctx.fill();
    });
  }

  function drawLoop() {
    // Fade trail
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    ctx.fillRect(0,0,W,H);

    // Refill particles
    while(state.particles.length < density) {
      const p = createParticle();
      if(p) state.particles.push(p);
    }

    state.particles.forEach((p, idx) => {
      p.life += spd;
      if(p.life > p.maxLife) {
        state.particles[idx] = createParticle();
        return;
      }

      const lifePct = p.life / p.maxLife;
      const alpha = lifePct < 0.2
        ? lifePct / 0.2
        : lifePct > 0.8
          ? 1 - (lifePct - 0.8) / 0.2
          : 1;

      ctx.globalAlpha = alpha * 0.85;

      switch(type) {
        case 'burst': {
          p.vx *= 0.98; p.vy *= 0.98; p.vy += 0.03;
          p.x += p.vx * spd; p.y += p.vy * spd;
          p.trail.push({x:p.x, y:p.y});
          if(p.trail.length > 10) p.trail.shift();
          // Trail
          p.trail.forEach((pt, i) => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, p.r*(i/p.trail.length)*0.6, 0, Math.PI*2);
            ctx.fillStyle = p.color + Math.floor((i/p.trail.length)*60).toString(16).padStart(2,'0');
            ctx.fill();
          });
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
          ctx.fillStyle = p.color;
          ctx.fill();
          // Glow
          const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
          g.addColorStop(0, p.color+'44'); g.addColorStop(1,'transparent');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2); ctx.fill();
          break;
        }
        case 'flow': {
          p.wave += 0.03;
          p.vx = Math.sin(p.wave + p.y*0.008) * 1.5;
          p.x += p.vx * spd; p.y += p.vy * spd * 0.6;
          if(p.y < -p.r) p.y = H + p.r;
          if(p.x < 0) p.x = W; if(p.x > W) p.x = 0;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.r, p.r*1.6, Math.atan2(p.vy, p.vx), 0, Math.PI*2);
          ctx.fillStyle = p.color + 'aa';
          ctx.fill();
          const gb = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
          gb.addColorStop(0, p.color+'33'); gb.addColorStop(1,'transparent');
          ctx.fillStyle = gb;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r*4,0,Math.PI*2); ctx.fill();
          break;
        }
        case 'drift': {
          p.wobble += p.wobbleSpd;
          p.x += (Math.sin(p.wobble) * 1.2 + p.vx) * spd;
          p.y += p.vy * spd;
          if(p.y < -10) p.y = H + 10;
          // Soft orb
          const gd = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*2);
          gd.addColorStop(0, p.color);
          gd.addColorStop(0.5, p.color+'66');
          gd.addColorStop(1,'transparent');
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r*2.5,0,Math.PI*2);
          ctx.fillStyle = gd; ctx.fill();
          break;
        }
        case 'fire': {
          p.x += p.vx * spd * 0.7;
          p.y += p.vy * spd;
          p.vx += (Math.random()-0.5)*0.3;
          const fr = p.r * (1-lifePct);
          const gf = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,fr*3);
          const fireColors = ['#fff7ed','#fde68a','#f59e0b','#f97316','#ef4444','#7f1d1d'];
          const ci = Math.floor(lifePct * (fireColors.length-1));
          gf.addColorStop(0, fireColors[ci] + 'ff');
          gf.addColorStop(0.5, fireColors[Math.min(ci+1,fireColors.length-1)] + '88');
          gf.addColorStop(1,'transparent');
          ctx.beginPath(); ctx.arc(p.x,p.y,fr*3,0,Math.PI*2);
          ctx.fillStyle = gf; ctx.fill();
          break;
        }
        case 'cosmos': {
          p.orbit += p.orbitSpd * spd;
          p.x = p.cx + Math.cos(p.orbit) * p.orbitR;
          p.y = p.cy + Math.sin(p.orbit) * p.orbitR * 0.5;
          // Star
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.fillStyle = p.color; ctx.fill();
          // Glimmer
          const gs = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*5);
          gs.addColorStop(0, p.color+'55'); gs.addColorStop(1,'transparent');
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r*5,0,Math.PI*2);
          ctx.fillStyle = gs; ctx.fill();
          // Connect nearest (sparse)
          if(Math.random() < 0.003) {
            const nearest = state.particles.reduce((best, o) => {
              if(o === p) return best;
              const d = Math.hypot(o.x-p.x, o.y-p.y);
              return d < (best?.d ?? Infinity) ? {o, d} : best;
            }, null);
            if(nearest && nearest.d < 120) {
              ctx.beginPath();
              ctx.moveTo(p.x,p.y); ctx.lineTo(nearest.o.x, nearest.o.y);
              ctx.strokeStyle = p.color + '22'; ctx.lineWidth = 0.5; ctx.stroke();
            }
          }
          break;
        }
        case 'electric': {
          p.vx *= p.decay; p.vy *= p.decay;
          p.vx += (Math.random()-0.5)*2*intensity;
          p.vy += (Math.random()-0.5)*2*intensity;
          p.x += p.vx * spd; p.y += p.vy * spd;
          p.trail.push({x:p.x,y:p.y});
          if(p.trail.length > 20) p.trail.shift();
          // Neon trail
          for(let i=1;i<p.trail.length;i++){
            const a = i/p.trail.length;
            ctx.beginPath();
            ctx.moveTo(p.trail[i-1].x, p.trail[i-1].y);
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
            ctx.strokeStyle = p.color + Math.floor(a*200).toString(16).padStart(2,'0');
            ctx.lineWidth = p.r * a;
            ctx.lineCap = 'round'; ctx.stroke();
          }
          if(p.x<0||p.x>W||p.y<0||p.y>H) { state.particles[state.particles.indexOf(p)] = createParticle(); }
          break;
        }
      }
    });

    ctx.globalAlpha = 1;
    t++;
    state.artLoop = requestAnimationFrame(drawLoop);
  }

  drawBg();
  drawLoop();
}

/* ══════════════════════════════════════════
   PAGE: HOME — init
══════════════════════════════════════════ */
function initHomePage() {
  initHeroCanvas();
  initScrollReveal();
  initHomeStrip();
  rotateQuotes();
}

function initHomeStrip() {
  $$('#home-mood-strip .strip-card').forEach(card => {
    card.addEventListener('click', () => {
      navigateTo('create');
      // Small delay so page flips first
      setTimeout(() => selectMood(card.dataset.mood), 600);
    });
  });
}

function initScrollReveal() {
  const cards = $$('.feat-card');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), e.target.dataset.index * 120);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  cards.forEach(c => obs.observe(c));
}

const ALL_QUOTES = Object.values(MOODS).flatMap(m => m.quotes);
let quoteIndex = 0;
function rotateQuotes() {
  clearInterval(window._quoteTimer);
  window._quoteTimer = setInterval(() => {
    if(state.currentPage !== 'home') return;
    quoteIndex = (quoteIndex + 1) % ALL_QUOTES.length;
    if(homeQuote) {
      homeQuote.style.opacity = 0;
      setTimeout(() => {
        const q = ALL_QUOTES[quoteIndex];
        const parts = q.split('—');
        homeQuote.innerHTML = `"${parts[0].trim()}"<cite>— ${parts[1]?.trim() || ''}</cite>`;
        homeQuote.style.opacity = 1;
      }, 500);
    }
  }, 5000);
}

/* ══════════════════════════════════════════
   PAGE: CREATE — init & mood selection
══════════════════════════════════════════ */
function initCreatePage() {
  moodPanel.classList.remove('hidden');
  controlPanel.classList.add('hidden');

  // If mood already selected, restart art
  if(state.currentMood) {
    startArt(state.currentMood);
  } else {
    // Black canvas while waiting
    const ctx = artCanvas.getContext('2d');
    artCanvas.width = window.innerWidth;
    artCanvas.height = window.innerHeight;
    ctx.fillStyle = '#0d0b14';
    ctx.fillRect(0,0,artCanvas.width,artCanvas.height);
  }
}

function selectMood(mood) {
  state.currentMood = mood;
  document.body.dataset.mood = mood;
  startArt(mood);

  moodPanel.classList.add('hidden');
  controlPanel.classList.remove('hidden');

  const data = MOODS[mood];
  moodTag.textContent = '✦ ' + data.label;

  // Cycle therapy note
  therapyNote.style.opacity = 0;
  setTimeout(() => {
    therapyNote.textContent = data.therapy;
    therapyNote.style.opacity = 1;
  }, 400);
}

function startArt(mood) {
  initArtCanvas(mood);
}

// Mood buttons
$$('.mood-btn').forEach(btn => {
  btn.addEventListener('click', () => selectMood(btn.dataset.mood));
});

// Mood text submit
$('mood-text-submit').addEventListener('click', () => {
  const text = $('mood-text').value.trim();
  if(!text) return;

  // Analyse keywords to pick mood
  const keywords = {
    joy:        ['happy','joy','excited','great','wonderful','love','smile','laugh','bright','sun'],
    calm:       ['calm','peace','relax','quiet','still','breath','gentle','slow','soft','blue'],
    melancholy: ['sad','miss','lonely','tired','blue','grey','lost','empty','hollow','rain'],
    passion:    ['love','fire','angry','intense','burning','desire','red','fierce','strong'],
    awe:        ['amazed','wow','beautiful','vast','infinite','stars','wonder','cosmic','huge'],
    chaos:      ['confused','overwhelmed','scattered','electric','spinning','wild','crash','noise']
  };

  const lower = text.toLowerCase();
  let best = 'awe', bestCount = 0;
  Object.entries(keywords).forEach(([mood, words]) => {
    const count = words.filter(w => lower.includes(w)).length;
    if(count > bestCount) { bestCount = count; best = mood; }
  });

  selectMood(best);
});

// Change mood
$('change-mood-btn').addEventListener('click', () => {
  controlPanel.classList.add('hidden');
  moodPanel.classList.remove('hidden');
  if(state.artLoop) cancelAnimationFrame(state.artLoop);
  const ctx = artCanvas.getContext('2d');
  ctx.fillStyle = '#0d0b14';
  ctx.fillRect(0,0,artCanvas.width,artCanvas.height);
  $('mood-text').value = '';
});

// Sliders
['intensity','density','speed'].forEach(key => {
  const el = $(`${key}-slider`);
  el.addEventListener('input', () => {
    state[key] = parseInt(el.value);
    if(state.currentMood) startArt(state.currentMood);
  });
});

// Regenerate
$('btn-regenerate').addEventListener('click', () => {
  if(!state.currentMood) return;
  state.seed = Math.random();
  startArt(state.currentMood);
  // Flash effect
  const ctx = artCanvas.getContext('2d');
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fillRect(0,0,artCanvas.width,artCanvas.height);
});

// Download
$('btn-download').addEventListener('click', () => {
  if(!state.currentMood) return;
  // Pause briefly to capture, then resume
  cancelAnimationFrame(state.artLoop);
  setTimeout(() => {
    const url = artCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `moodcanvas_${state.currentMood}_${Date.now()}.png`;
    a.click();
    startArt(state.currentMood);
  }, 50);
});

// Fullscreen
$('btn-fullscreen').addEventListener('click', () => {
  const el = document.getElementById('page-create');
  if(!document.fullscreenElement) el.requestFullscreen?.();
  else document.exitFullscreen?.();
});

/* ══════════════════════════════════════════
   PAGE: ABOUT — init
══════════════════════════════════════════ */
function initAboutPage() {
  initAboutReveal();
  const items = $$('.showcase-item');
  items.forEach(item => {
    const mood = item.dataset.mood;
    item.addEventListener('mouseenter', () => {
      item.style.setProperty('--hover-glow', MOODS[mood]?.colors[0] + '55');
    });
    item.addEventListener('click', () => {
      navigateTo('create');
      setTimeout(() => selectMood(mood), 600);
    });
  });
}

/* ══════════════════════════════════════════
   ABOUT PAGE — text reveal on scroll
══════════════════════════════════════════ */
function initAboutReveal() {
  const els = $$('.about-col, .about-team, .about-moods-showcase, .about-hero-text');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.34,1.56,0.64,1)';
    obs.observe(el);
  });
}

/* ══════════════════════════════════════════
   KEYBOARD SHORTCUT
══════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if(e.key === 'Escape' && state.currentPage === 'create') {
    controlPanel.classList.add('hidden');
    moodPanel.classList.remove('hidden');
  }
  if(e.key === 'r' && state.currentPage === 'create' && state.currentMood) {
    state.seed = Math.random();
    startArt(state.currentMood);
  }
});

/* ══════════════════════════════════════════
   MOUSE INTERACTION on art canvas
══════════════════════════════════════════ */
artCanvas.addEventListener('mousemove', e => {
  if(!state.currentMood || !state.artLoop) return;
  // Spawn a burst at mouse position
  if(Math.random() < 0.3) {
    const mood = state.currentMood;
    const colors = MOODS[mood].colors;
    state.particles.push({
      x: e.clientX, y: e.clientY,
      vx: (Math.random()-0.5)*3,
      vy: (Math.random()-0.5)*3 - 1,
      r: 2 + Math.random()*5,
      life: 0, maxLife: 80,
      color: colors[Math.floor(Math.random()*colors.length)],
      trail: [],
    });
  }
});

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
initHomePage();

// Handle page unload cleanup
window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(state.artLoop);
  cancelAnimationFrame(state.heroLoop);
});