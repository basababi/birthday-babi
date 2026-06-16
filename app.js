/* =============================================
   app.js – Enhanced Birthday Website Logic
============================================= */

// ── DOM refs ─────────────────────────────────
const audio   = document.getElementById('bgMusic');
const vinyl   = document.getElementById('vinylDisc');
const waveEl  = document.getElementById('musicWave');
const overlay = document.getElementById('enterOverlay');

let isPlaying = false;
let lbImages  = [];
let lbCurrent = 0;

// Prev countdown values for flip animation
let prevVals = { d: -1, h: -1, m: -1, s: -1 };

// ══════════════════════════════════════════════
// 1. ENTER SITE
// ══════════════════════════════════════════════
function enterSite() {
  audio.volume = 0.4;
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isPlaying = true;
        vinyl.classList.add('playing');
        waveEl.classList.add('active');
      })
      .catch(() => {});
  }

  overlay.classList.add('hidden');
  setTimeout(() => { overlay.style.display = 'none'; }, 900);

  spawnPetals();
  initScrollReveals();
}

// ── Toggle music ─────────────────────────────
function toggleMusic() {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    vinyl.classList.remove('playing');
    waveEl.classList.remove('active');
  } else {
    audio.play().then(() => {
      isPlaying = true;
      vinyl.classList.add('playing');
      waveEl.classList.add('active');
    }).catch(() => {});
  }
}

// ══════════════════════════════════════════════
// 2. COUNTDOWN — with flip animation
// ══════════════════════════════════════════════
function updateCountdown() {
  // June 17, 2026, midnight Mongolian time (UTC+8)
  const target = new Date('2026-06-17T00:00:00+08:00').getTime();
  const now    = Date.now();
  const diff   = target - now;

  const boxes   = document.getElementById('countdownBoxes');
  const message = document.getElementById('birthdayMessage');

  if (diff <= 0) {
    boxes.style.display   = 'none';
    message.style.display = 'block';
    launchConfetti();
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000)  / 60000);
  const s = Math.floor((diff % 60000)    / 1000);

  setFlip('c-days',  d, 'cb-d', prevVals.d);
  setFlip('c-hours', h, 'cb-h', prevVals.h);
  setFlip('c-mins',  m, 'cb-m', prevVals.m);
  setFlip('c-secs',  s, 'cb-s', prevVals.s);

  prevVals = { d, h, m, s };
}

function setFlip(spanId, val, boxId, prev) {
  const str = String(val).padStart(2, '0');
  const el  = document.getElementById(spanId);
  const box = document.getElementById(boxId);
  if (!el) return;

  if (prev !== val) {
    el.textContent = str;
    if (box && prev >= 0) {
      box.classList.remove('flip');
      void box.offsetWidth; // reflow
      box.classList.add('flip');
    } else if (el) {
      el.textContent = str;
    }
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ══════════════════════════════════════════════
// 3. FLOATING PETALS — drifting path
// ══════════════════════════════════════════════
function spawnPetals() {
  const container = document.getElementById('petals');
  if (!container) return;
  const colors = ['#8b0000', '#c0392b', '#e8c4c4', '#d4a96a', '#f5ece0', '#a0002a'];

  function makePetal() {
    const p = document.createElement('div');
    p.className = 'petal';
    const size  = 7 + Math.random() * 12;
    const isRound = Math.random() > .5;
    p.style.cssText = `
      left: ${Math.random() * 105}%;
      width: ${size}px;
      height: ${size * (1.2 + Math.random() * .6)}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${6 + Math.random() * 10}s;
      animation-delay: ${-Math.random() * 5}s;
      opacity: ${0.35 + Math.random() * 0.45};
      border-radius: ${isRound ? '50%' : '0 100% 0 100%'};
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), 20000);
  }

  for (let i = 0; i < 10; i++) makePetal();
  setInterval(makePetal, 600);
}

// ══════════════════════════════════════════════
// 4. SCROLL REVEALS — staggered fade-up
// ══════════════════════════════════════════════
function initScrollReveals() {
  // Letter paragraphs — staggered
  const letterPs = document.querySelectorAll('.letter-body p');
  const letterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const ps = entry.target.querySelectorAll('p');
        ps.forEach((p, i) => {
          setTimeout(() => p.classList.add('revealed'), i * 120);
        });
        letterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  const letterBody = document.querySelector('.letter-body');
  if (letterBody) letterObs.observe(letterBody);

  // Gallery cards — staggered
  const cards = document.querySelectorAll('.sc-card');
  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(cards).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('revealed'), idx * 150);
        cardObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  cards.forEach(c => cardObs.observe(c));

  // Wish cards — staggered
  const wishCards = document.querySelectorAll('.wish-card');
  const wishObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(wishCards).indexOf(entry.target);
        const delay = parseFloat(getComputedStyle(entry.target).getPropertyValue('--cd') || '0') * 1000;
        setTimeout(() => entry.target.classList.add('revealed'), delay);
        wishObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  wishCards.forEach(w => wishObs.observe(w));
}

// ══════════════════════════════════════════════
// 5. GALLERY LIGHTBOX
// ══════════════════════════════════════════════
const lb    = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');

function openLightbox(index) {
  lbCurrent = index;
  lbImg.src = lbImages[index];
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lb.classList.remove('open');
  document.body.style.overflow = '';
}
function lbNav(dir) {
  lbCurrent = (lbCurrent + dir + lbImages.length) % lbImages.length;
  // Fade swap
  lbImg.style.opacity = '0';
  lbImg.style.transform = `scale(.96) translateX(${dir > 0 ? '-' : ''}20px)`;
  setTimeout(() => {
    lbImg.src = lbImages[lbCurrent];
    lbImg.style.transition = 'opacity .25s ease, transform .25s ease';
    lbImg.style.opacity    = '1';
    lbImg.style.transform  = 'scale(1) translateX(0)';
  }, 180);
}

// Swipe support
let touchStartX = 0;
lb.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) { e.stopPropagation(); lbNav(dx < 0 ? 1 : -1); }
});

document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  lbNav(-1);
  if (e.key === 'ArrowRight') lbNav(1);
});

// ══════════════════════════════════════════════
// 6. HERO PARALLAX — subtle mouse tracking
// ══════════════════════════════════════════════
const hero = document.getElementById('hero');
if (hero) {
  document.addEventListener('mousemove', e => {
    const { innerWidth: W, innerHeight: H } = window;
    const dx = (e.clientX / W - .5) * 20;
    const dy = (e.clientY / H - .5) * 12;
    const orb1 = document.querySelector('.hero-orb-1');
    const orb2 = document.querySelector('.hero-orb-2');
    if (orb1) orb1.style.transform = `translate(${dx * 1.2}px, ${dy * .8}px)`;
    if (orb2) orb2.style.transform = `translate(${-dx * .8}px, ${-dy * .6}px)`;
  }, { passive: true });
}

// ══════════════════════════════════════════════
// 7. SMOOTH SCROLL for anchor links
// ══════════════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ══════════════════════════════════════════════
// 8. DOMContentLoaded INIT
// ══════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  // Build lightbox image array from all gallery images
  const seen = new Set();
  document.querySelectorAll('.sc-card img, .sc-photo-double img').forEach(img => {
    if (!seen.has(img.src)) {
      seen.add(img.src);
      lbImages.push(img.src);
    }
  });

  // Preload images for lightbox
  lbImages.forEach(src => { const i = new Image(); i.src = src; });
});

// ══════════════════════════════════════════════
// 9. CONFETTI — birthday day
// ══════════════════════════════════════════════
function launchConfetti() {
  const colors = ['#8b0000','#d4a96a','#e8c4c4','#fff8f0','#c0392b','#f0cc8a'];
  for (let i = 0; i < 140; i++) {
    const c = document.createElement('div');
    const isCircle = Math.random() > .4;
    const size = 5 + Math.random() * 9;
    c.style.cssText = `
      position:fixed;
      left:${Math.random() * 100}vw;
      top:-20px;
      width:${size}px;
      height:${isCircle ? size : size * 1.6}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${isCircle ? '50%' : '2px'};
      pointer-events:none;
      z-index:9998;
      animation:fall ${3 + Math.random() * 5}s linear forwards;
      animation-delay:${Math.random() * 3}s;
      transform:rotate(${Math.random() * 360}deg);
    `;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 10000);
  }
}