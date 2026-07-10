/* ==========================================================================
   FRIENDSHIP SITE — SHARED SCRIPT
   Handles: auth, ambient particles, cursor glow, and every page's
   interactive pieces (typing effect, compliments, quiz, reveal-on-scroll,
   confetti, memory wall, mood forecast, timeline, stickers, mute toggle).
   ========================================================================== */

/* --------------------------------------------------------------------------
   0. CONFIG
   Instead of a password, the login only needs your best friend's name.
   Change SPECIAL_NAME if you want a different "unlock" name.
   -------------------------------------------------------------------------- */
const SPECIAL_NAME = 'sufyan';
// the fan page is about Ayesha — this is what gets stored/displayed regardless
// of whose name unlocks the site
const DISPLAY_NAME = 'Ayesha';

/* --------------------------------------------------------------------------
   1. AUTH HELPERS
   -------------------------------------------------------------------------- */
function isLoggedIn() {
  return localStorage.getItem('friendsite_loggedIn') === 'true';
}

function getUsername() {
  return localStorage.getItem('friendsite_username') || 'Friend';
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'index.html';
  }
}

function logout() {
  localStorage.removeItem('friendsite_loggedIn');
  localStorage.removeItem('friendsite_username');
  window.location.href = 'index.html';
}

// wire up any element with [data-logout]
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-logout]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });
});

/* --------------------------------------------------------------------------
   2. AMBIENT PARTICLE CANVAS  (floating "mood" orbs, present on every page)
   -------------------------------------------------------------------------- */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles;
  const COLORS = ['#ff9fce', '#c8b6ff', '#9b5cff', '#8ecbff'];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const count = window.innerWidth < 640 ? 26 : 48;
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.8 + 0.6,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    c: COLORS[Math.floor(Math.random() * COLORS.length)],
    a: Math.random() * 0.5 + 0.25
  }));

  function tick() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.a;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  tick();
}

/* --------------------------------------------------------------------------
   3. CURSOR GLOW
   -------------------------------------------------------------------------- */
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;
  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

/* --------------------------------------------------------------------------
   4. TOAST
   -------------------------------------------------------------------------- */
function showToast(msg, duration = 2200) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), duration);
}

/* --------------------------------------------------------------------------
   5. CONFETTI
   -------------------------------------------------------------------------- */
function fireConfetti(count = 60) {
  const colors = ['#ff9fce', '#c8b6ff', '#9b5cff', '#8ecbff', '#ffe3f1'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = Math.random() * 7 + 4;
    piece.style.width = size + 'px';
    piece.style.height = size * 0.5 + 'px';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);

    const duration = Math.random() * 1.6 + 1.8;
    const drift = (Math.random() - 0.5) * 200;
    piece.animate([
      { transform: `translate(0,0) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${drift}px, ${window.innerHeight + 40}px) rotate(${Math.random() * 720 - 360}deg)`, opacity: 0.9 }
    ], { duration: duration * 1000, easing: 'cubic-bezier(.2,.6,.4,1)' });

    setTimeout(() => piece.remove(), duration * 1000 + 50);
  }
}

/* --------------------------------------------------------------------------
   6. MUTE / UNMUTE (music optional — drop an mp3 in assets/music/ and
      point the <audio id="bg-music"> src at it; button just toggles it)
   -------------------------------------------------------------------------- */
function initMusicToggle() {
  const btn = document.getElementById('mute-toggle');
  const audio = document.getElementById('bg-music');
  if (!btn) return;
  let playing = false;

  btn.addEventListener('click', () => {
    if (!audio || !audio.src) {
      showToast('Add a track to assets/music/ to enable sound ♪');
      return;
    }
    playing = !playing;
    if (playing) { audio.play().catch(() => {}); btn.textContent = '♪'; }
    else { audio.pause(); btn.textContent = '♫'; }
  });
}

/* --------------------------------------------------------------------------
   7. REVEAL ON SCROLL
   -------------------------------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll('.card, .mood-item, .tl-item, .reveal');
  if (!items.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
}

/* ==========================================================================
   PAGE: index.html (LOGIN)
   ========================================================================== */
function initLoginPage() {
  const form = document.getElementById('login-form');
  if (!form) return;

  // if already logged in, skip straight through
  if (isLoggedIn()) {
    window.location.href = 'welcome.html';
    return;
  }

  const nameInput = document.getElementById('nameInput');
  const errorMsg = document.getElementById('error-msg');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = (nameInput.value || '').trim();

    if (value.toLowerCase() === SPECIAL_NAME) {
      localStorage.setItem('friendsite_loggedIn', 'true');
      localStorage.setItem('friendsite_username', DISPLAY_NAME);
      errorMsg.classList.remove('show');

      const modal = document.getElementById('welcome-modal');
      const continueBtn = document.getElementById('modal-continue');
      modal.classList.add('show');
      fireConfetti(40);

      const goNext = () => { window.location.href = 'welcome.html'; };
      continueBtn.addEventListener('click', goNext, { once: true });
      setTimeout(goNext, 2600);
    } else {
      errorMsg.textContent = "That's not the name I'm looking for... try again 👀";
      errorMsg.classList.remove('show');
      void errorMsg.offsetWidth; // restart animation
      errorMsg.classList.add('show');
      nameInput.focus();
    }
  });
}

/* ==========================================================================
   PAGE: welcome.html (GREETING)
   ========================================================================== */
const SELF_PRAISES = [
  "You're effortlessly cute, in that way that makes people smile without knowing why.",
  "You have the kind of charm that lights up a whole room.",
  "Your personality is genuinely magnetic.",
  "You have one of the most beautiful hearts anyone could know.",
  "You're warm in a way that makes people feel instantly comfortable.",
  "Your energy is unmatched, and everyone around you feels it.",
  "You're kind even when nobody's watching.",
  "You have a smile that could fix a bad day.",
  "You're funnier than you give yourself credit for.",
  "You care about people more deeply than you let on.",
  "You're one of the most genuine people out there.",
  "You make people feel safe just by being around.",
  "Your laugh is honestly one of the best sounds ever.",
  "You're loyal in a way that's rare these days.",
  "You're simply one of a kind, and everyone who knows you agrees."
];

function typeLine(el, text, speed = 50) {
  return new Promise(resolve => {
    el.textContent = '';
    let i = 0;
    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else {
        resolve();
      }
    })();
  });
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runPraiseSequence() {
  const box = document.getElementById('praise-wrap');
  const list = document.getElementById('praise-list');
  const nextActions = document.getElementById('next-actions');
  if (!box || !list) return;

  box.classList.add('show');

  for (const praise of SELF_PRAISES) {
    const line = document.createElement('div');
    line.className = 'praise-line-item';
    list.appendChild(line);
    await typeLine(line, praise, 18);
    box.scrollTop = box.scrollHeight;
    await wait(220);
  }

  nextActions.classList.add('show');
}

/* the "No" button dodges the cursor so only "Yes" can ever be picked */
function initDodgingNoButton() {
  const noBtn = document.getElementById('no-btn');
  const container = document.getElementById('greet-actions');
  if (!noBtn || !container) return;

  function dodge() {
    const cRect = container.getBoundingClientRect();
    const bRect = noBtn.getBoundingClientRect();
    const maxLeft = Math.max(cRect.width - bRect.width, 0);
    const maxTop = Math.max(cRect.height - bRect.height, 0);
    const left = Math.random() * maxLeft;
    const top = Math.random() * maxTop;
    noBtn.classList.add('dodging');
    noBtn.style.left = left + 'px';
    noBtn.style.top = top + 'px';
  }

  noBtn.addEventListener('mouseenter', dodge);
  noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); dodge(); }, { passive: false });
  noBtn.addEventListener('click', (e) => { e.preventDefault(); dodge(); });
  noBtn.addEventListener('focus', dodge);
}

function initWelcomePage() {
  const typedEl = document.getElementById('typed-line');
  if (!typedEl) return;

  requireAuth();
  initDodgingNoButton();

  const line = `Would you like to know yourself, ${getUsername()}?`;
  let i = 0;

  const cursor = document.createElement('span');
  cursor.className = 'cursor-blink';

  function type() {
    if (i <= line.length) {
      typedEl.textContent = line.slice(0, i);
      typedEl.appendChild(cursor);
      i++;
      setTimeout(type, 45);
    } else {
      const actions = document.getElementById('greet-actions');
      setTimeout(() => actions && actions.classList.add('show'), 300);
    }
  }
  type();

  const yesBtn = document.getElementById('yes-btn');
  if (yesBtn) {
    yesBtn.addEventListener('click', () => {
      const actions = document.getElementById('greet-actions');
      actions.style.transition = 'opacity .4s ease';
      actions.style.opacity = '0';
      setTimeout(() => {
        actions.style.display = 'none';
        runPraiseSequence();
      }, 400);
    });
  }
}

/* ==========================================================================
   PAGE: friend.html (MAIN PAGE)
   ========================================================================== */

const COMPLIMENTS = [
  "You always make conversations fun.",
  "Your smile improves everyone's mood.",
  "You are an amazing friend.",
  "You have the funniest reactions.",
  "Your positivity is contagious.",
  "You make ordinary days feel like an event.",
  "You give the best advice, even when nobody asks.",
  "You're the friend everyone wishes they had.",
  "Your laugh is basically a personality trait at this point.",
  "You remember the small things, and that means a lot.",
  "You turn boring plans into main character moments.",
  "You're annoyingly good at cheering people up.",
  "Your energy walks into the room before you do.",
  "You're the definition of ride-or-die loyal.",
  "You somehow make chaos look organized.",
  "You never let anyone feel left out.",
  "Your texts are always worth the notification sound.",
  "You have impeccable comic timing.",
  "You make people feel heard, not just listened to.",
  "You're proof that drama and kindness can co-exist beautifully.",
  "You're weirdly good at knowing when someone needs a laugh.",
  "You make friendship look effortless.",
  "Your honesty is a gift, even when it stings a little.",
  "You're the calm and the storm, depending on the day.",
  "You show up. Every single time.",
  "You make people brave enough to be themselves.",
  "Your hugs could probably fix half the world's problems.",
  "You're a certified vibe curator.",
  "You never let a good meme go unsent.",
  "You're allergic to boring conversations, and honestly, respect.",
  "You make people laugh until it's not even funny anymore.",
  "You're the friend group's unofficial therapist.",
  "You somehow remember every inside joke ever made.",
  "You make people feel important just by listening.",
  "You're chaotic good, and it works.",
  "You've never met a silence you couldn't fill with something funny.",
  "You're the reason group chats never sleep.",
  "You're proof that mood swings can be entertaining, not exhausting.",
  "You make people better just by being around them.",
  "You're the human equivalent of comfort food.",
  "You have main character energy on a random Tuesday.",
  "You know exactly when to be serious and when to be unserious.",
  "You're the friend who actually means it when they say 'let's hang out'.",
  "Your loyalty could probably be bottled and sold.",
  "You make people feel like the funniest version of themselves.",
  "You're incredibly easy to talk to.",
  "You're a safe space wrapped in sarcasm.",
  "You make people feel like they matter.",
  "You're the friend who remembers birthdays without a reminder.",
  "You're refreshingly real in a world of filters.",
  "You make ordinary hangouts feel like an inside joke waiting to happen.",
  "You somehow make everyone around you a little braver.",
  "Your friendship comes with a lifetime warranty."
];

function initComplimentGenerator() {
  const btn = document.getElementById('compliment-btn');
  const text = document.getElementById('compliment-text');
  if (!btn || !text) return;

  let lastIndex = -1;
  btn.addEventListener('click', () => {
    let idx;
    do { idx = Math.floor(Math.random() * COMPLIMENTS.length); } while (idx === lastIndex && COMPLIMENTS.length > 1);
    lastIndex = idx;
    text.style.animation = 'none';
    void text.offsetWidth;
    text.textContent = COMPLIMENTS[idx];
    text.style.animation = 'fadeUp .5s ease';
    fireConfetti(28);
  });
}

const QUIZ = [
  {
    q: 'Who gets angry first?',
    opts: ['Definitely them 😤', 'Depends on the day', 'Nobody, ever'],
    reactions: ['Called it. 3-second fuse, max. 🌪️', 'Fair — mood roulette is real. 🎲', "Suspiciously diplomatic answer. 🕊️"]
  },
  {
    q: 'Who laughs the loudest?',
    opts: ['Them, no contest 😂', 'It\'s a tie', 'Honestly, unclear'],
    reactions: ['The whole street heard that one. 🔊', 'A rare and beautiful balance. ⚖️', 'Investigation ongoing. 🔍']
  },
  {
    q: 'Who acts innocent after chaos?',
    opts: ['The "masoom" act, every time 🙏🏻', 'Sometimes...', 'Nope, not this one'],
    reactions: ['Oscar-worthy performance. 🏆', 'The acting range is impressive. 🎭', 'Bold claim. We\'ll allow it. 😏']
  },
  {
    q: 'Who forgets things the most?',
    opts: ['Selective memory, activated 🧠', 'Both, equally', 'Never forgets a thing'],
    reactions: ['Convenient timing, as always. 🙃', 'A truly balanced forgetfulness. 🤝', 'Elephant-level memory. 🐘']
  }
];

function initQuiz() {
  const container = document.getElementById('quiz-container');
  if (!container) return;

  QUIZ.forEach((item, qi) => {
    const card = document.createElement('div');
    card.className = 'glass glass-hover quiz-card';
    card.innerHTML = `
      <div class="quiz-q">${qi + 1}. ${item.q}</div>
      <div class="quiz-opts">
        ${item.opts.map((o, oi) => `<button class="quiz-opt" data-qi="${qi}" data-oi="${oi}">${o}</button>`).join('')}
      </div>
      <div class="quiz-result" id="quiz-result-${qi}"></div>
    `;
    container.appendChild(card);
  });

  container.addEventListener('click', (e) => {
    const target = e.target.closest('.quiz-opt');
    if (!target) return;
    const qi = +target.dataset.qi;
    const oi = +target.dataset.oi;
    const card = target.closest('.quiz-card');
    card.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('picked'));
    target.classList.add('picked');
    const resultEl = document.getElementById(`quiz-result-${qi}`);
    resultEl.textContent = QUIZ[qi].reactions[oi];
    fireConfetti(18);
  });
}

const MEMORY_WALL = [
  "Masoom hony ka natak krny wali larki 🙏🏻🥲",
  "Certified Mood Swing Queen.",
  "Professional Drama Detector.",
  "\"Mujhe gussa nahi aya\" — narrator: it did.",
  "Hr time Sony wali larki 😂",
  "Warning: extremely funny without trying.",
  "Serious mode: loading... 0.5 seconds.",
  "The friendship group's chief entertainment officer.",
  "Innocent until proven otherwise (always proven).",
  "Certified expert at turning nothing into a whole story.",
  "Would argue with a wall and somehow win.",
  "The plot twist in every group hangout."
];

function initMemoryWall() {
  const wall = document.getElementById('memory-wall');
  if (!wall) return;
  wall.innerHTML = MEMORY_WALL.map(note => `<div class="sticky">${note}</div>`).join('');
}

const MOOD_FORECAST = [
  { time: '12:00 PM', label: 'Happy & Sunshine', emoji: '☀️' },
  { time: '1:00 PM', label: 'Gussa & Toofan', emoji: '⛈️' },
  { time: '2:00 PM', label: 'Back to Normal', emoji: '😌' },
  { time: '3:00 PM', label: 'Laughing Again', emoji: '😂' }
];

function initMoodForecast() {
  const wrap = document.getElementById('mood-timeline');
  if (!wrap) return;
  wrap.innerHTML = MOOD_FORECAST.map(m => `
    <div class="glass glass-hover mood-item">
      <div class="mood-time">${m.time}</div>
      <div class="mood-emoji">${m.emoji}</div>
      <div class="mood-label">${m.label}</div>
    </div>
  `).join('');
}

/* simple inline SVG stickers scattered around the hero */
const STICKER_SVGS = {
  star: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4L12 2z" fill="#c8b6ff"/></svg>`,
  sparkle: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" fill="#ff9fce"/></svg>`,
  cloud: `<svg viewBox="0 0 64 40" width="46" height="30" fill="none"><path d="M18 30a10 10 0 010-20 12 12 0 0123 3 9 9 0 01-2 17H18z" fill="#8ecbff" opacity=".8"/></svg>`,
  butterfly: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none"><path d="M12 4c-2 0-4 2-4 5s2 5 4 3c2 2 4 0 4-3s-2-5-4-5z" fill="#ffc3e0"/><line x1="12" y1="4" x2="12" y2="20" stroke="#c8b6ff" stroke-width="1"/></svg>`,
  ribbon: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M12 8a3 3 0 100-6 3 3 0 000 6zM12 8v13M7 21l5-4 5 4" stroke="#ff9fce" stroke-width="1.5" fill="none"/></svg>`
};

function scatterStickers() {
  const zones = document.querySelectorAll('[data-sticker-zone]');
  const keys = Object.keys(STICKER_SVGS);
  zones.forEach(zone => {
    const num = 3;
    for (let i = 0; i < num; i++) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      const el = document.createElement('div');
      el.className = 'sticker';
      el.innerHTML = STICKER_SVGS[key];
      el.style.left = Math.random() * 90 + '%';
      el.style.top = Math.random() * 90 + '%';
      el.style.animationDelay = (Math.random() * 3) + 's';
      zone.appendChild(el);
    }
  });
}

function initStepper() {
  const stage = document.getElementById('stepper-stage');
  if (!stage) return null;

  const steps = Array.from(stage.querySelectorAll('.step'));
  const dotsWrap = document.getElementById('step-dots');
  const backBtn = document.getElementById('step-back');
  const nextBtn = document.getElementById('step-next');
  let current = 0;

  dotsWrap.innerHTML = steps.map(() => '<span class="dot"></span>').join('');
  const dots = Array.from(dotsWrap.children);

  function render() {
    steps.forEach((s, i) => s.classList.toggle('active', i === current));
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === current);
      d.classList.toggle('done', i < current);
    });
    backBtn.disabled = current === 0;
    nextBtn.textContent = current === steps.length - 1 ? 'Restart' : 'Next';
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  backBtn.addEventListener('click', () => {
    if (current > 0) { current--; render(); }
  });

  nextBtn.addEventListener('click', () => {
    if (current === steps.length - 1) {
      fireConfetti(50);
      current = 0;
    } else {
      current++;
    }
    render();
  });

  render();
  return { steps, dots };
}

function initFriendPage() {
  const marker = document.getElementById('friend-page-marker');
  if (!marker) return;

  requireAuth();

  initComplimentGenerator();
  initQuiz();
  initMemoryWall();
  initMoodForecast();
  scatterStickers();
  initStepper();
}

/* ==========================================================================
   BOOT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initCursorGlow();
  initMusicToggle();
  initLoginPage();
  initWelcomePage();
  initFriendPage();
});
