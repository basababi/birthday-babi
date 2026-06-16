/* =============================================
   app.js – Birthday Website Logic
============================================= */

// ── DOM refs ──────────────────────────────────
const audio    = document.getElementById('bgMusic');
const vinyl    = document.getElementById('vinylDisc');
const waveEl   = document.getElementById('musicWave');
const overlay  = document.getElementById('enterOverlay');

let isPlaying = false;
let lbImages  = [];
let lbCurrent = 0;

// ══════════════════════════════════════════════
// 1. ENTER SITE — overlay товч дарахад дуу эхэлнэ
// ══════════════════════════════════════════════
function enterSite() {
  audio.volume = 0.45;
  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        isPlaying = true;
        vinyl.classList.add('playing');
        waveEl.classList.add('active');
      })
      .catch(() => {
        // Хэрэв browser блоклосон ч overlay хаана
      });
  }

  // Overlay-г сайхан хаана
  overlay.classList.add('hidden');
  setTimeout(() => { overlay.style.display = 'none'; }, 700);

  // Петалуудыг идэвхжүүлнэ
  spawnPetals();
}

// ── Toggle music bar дээр дарахад ───────────
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
// 2. COUNTDOWN to June 17, 2026
// ══════════════════════════════════════════════
function updateCountdown() {
  // Монгол цагийн бүс (UTC+8) ашиглана
  const target = new Date('2026-06-17T00:00:00+08:00').getTime();
  const now    = Date.now();
  const diff   = target - now;

  const boxes   = document.getElementById('countdownBoxes');
  const message = document.getElementById('birthdayMessage');

  if (diff <= 0) {
    boxes.style.display = 'none';
    message.style.display = 'block';
    launchConfetti();
    return;
  }

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000)  / 60000);
  const s = Math.floor((diff % 60000)    / 1000);

  document.getElementById('c-days').textContent  = String(d).padStart(2, '0');
  document.getElementById('c-hours').textContent = String(h).padStart(2, '0');
  document.getElementById('c-mins').textContent  = String(m).padStart(2, '0');
  document.getElementById('c-secs').textContent  = String(s).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ══════════════════════════════════════════════
// 3. FLOATING PETALS
// ══════════════════════════════════════════════
function spawnPetals() {
  const container = document.getElementById('petals');
  if (!container) return;
  const colors = ['#8b0000', '#c0392b', '#e8c4c4', '#d4a96a', '#f5ece0'];

  function makePetal() {
    const p = document.createElement('div');
    p.className = 'petal';
    const size = 8 + Math.random() * 14;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size * 1.4}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${5 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 4}s;
      opacity: ${0.4 + Math.random() * 0.5};
      border-radius: ${Math.random() > .5 ? '0 100% 0 100%' : '100% 0 100% 0'};
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), 20000);
  }

  // Эхний batch
  for (let i = 0; i < 12; i++) makePetal();
  setInterval(makePetal, 500);
}

// ══════════════════════════════════════════════
// 4. GALLERY LIGHTBOX
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
  lbImg.src = lbImages[lbCurrent];
}

// Swipe support for mobile lightbox
let lbTouchStartX = 0;
lb.addEventListener('touchstart', e => { lbTouchStartX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - lbTouchStartX;
  if (Math.abs(dx) > 50) {
    e.stopPropagation();
    lbNav(dx < 0 ? 1 : -1);
  }
});

document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   lbNav(-1);
  if (e.key === 'ArrowRight')  lbNav(1);
});

// ══════════════════════════════════════════════
// 5. INIT on DOMContentLoaded
// ══════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  // Attach polaroid click → lightbox
  document.querySelectorAll('.polaroid').forEach((card, i) => {
    const img = card.querySelector('img');
    lbImages.push(img.src);
    card.addEventListener('click', () => openLightbox(i));
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll(
    '.polaroid, .wish-card, .letter-container, .c-box'
  );
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
});

// ══════════════════════════════════════════════
// 6. CONFETTI (birthday day)
// ══════════════════════════════════════════════
function launchConfetti() {
  const colors = ['#8b0000', '#d4a96a', '#e8c4c4', '#fff8f0', '#c0392b'];
  for (let i = 0; i < 120; i++) {
    const c = document.createElement('div');
    c.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}vw;
      top: -20px;
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > .5 ? '50%' : '2px'};
      pointer-events: none;
      z-index: 9998;
      animation: fall ${3 + Math.random() * 4}s linear forwards;
      animation-delay: ${Math.random() * 3}s;
    `;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 8000);
  }
}
