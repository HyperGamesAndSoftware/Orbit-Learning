const modal = document.querySelector('#register-modal');
const content = document.querySelector('#register-content');
const openButtons = document.querySelectorAll('[data-open-register]');
const closeButton = document.querySelector('[data-close-register]');
const codeForm = document.querySelector('#code-form');
const revisionState = { subject: 'Physics', year: '10', questionIndex: 0, score: 0, answered: false };
const questionBank = {
  Physics: [
    { topic: 'Forces', prompt: 'A cyclist accelerates from rest at 2 m/s² for 5 seconds. What is their final velocity?', answers: ['5 m/s', '10 m/s', '2.5 m/s', '25 m/s'], correct: 1, explanation: 'Use v = u + at: 0 + (2 × 5) = 10 m/s.' },
    { topic: 'Energy', prompt: 'A 2 kg book is lifted 3 m. Using g = 10 N/kg, how much gravitational potential energy is gained?', answers: ['6 J', '15 J', '60 J', '600 J'], correct: 2, explanation: 'GPE = mass × g × height = 2 × 10 × 3 = 60 J.' },
    { topic: 'Waves', prompt: 'A wave has a frequency of 5 Hz and a wavelength of 2 m. What is its speed?', answers: ['2.5 m/s', '7 m/s', '10 m/s', '25 m/s'], correct: 2, explanation: 'Wave speed = frequency × wavelength = 5 × 2 = 10 m/s.' }
  ],
  Mathematics: [
    { topic: 'Algebra', prompt: 'Solve 3x + 4 = 19. What is x?', answers: ['4', '5', '6', '7'], correct: 1, explanation: 'Subtract 4 to get 3x = 15, then divide by 3. x = 5.' },
    { topic: 'Percentages', prompt: 'A £40 jacket is reduced by 25%. What is the sale price?', answers: ['£10', '£25', '£30', '£35'], correct: 2, explanation: '25% of £40 is £10, so £40 − £10 = £30.' },
    { topic: 'Probability', prompt: 'A fair six-sided die is rolled. What is the probability of rolling an even number?', answers: ['1/6', '1/3', '1/2', '2/3'], correct: 2, explanation: 'There are three even results out of six: 3/6 simplifies to 1/2.' }
  ],
  Biology: [
    { topic: 'Cells', prompt: 'Which structure controls the activities of a eukaryotic cell?', answers: ['Cell wall', 'Nucleus', 'Cytoplasm', 'Ribosome'], correct: 1, explanation: 'The nucleus contains genetic material and controls cell activities.' },
    { topic: 'Photosynthesis', prompt: 'Which gas is taken in by plants during photosynthesis?', answers: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], correct: 2, explanation: 'Plants use carbon dioxide, water and light to make glucose and oxygen.' }
  ],
  Chemistry: [
    { topic: 'Particles', prompt: 'Which state of matter has a fixed volume but no fixed shape?', answers: ['Solid', 'Liquid', 'Gas', 'Plasma'], correct: 1, explanation: 'Liquid particles stay close together but can move past one another.' },
    { topic: 'Acids', prompt: 'A solution with pH 2 is best described as what?', answers: ['Strongly acidic', 'Weakly acidic', 'Neutral', 'Alkaline'], correct: 0, explanation: 'The lower the pH, the more acidic the solution. pH 2 is strongly acidic.' }
  ]
};

function openRegister() { modal.hidden = false; document.body.style.overflow = 'hidden'; document.querySelector('#learner-code').focus(); }
function closeRegister() { modal.hidden = true; document.body.style.overflow = ''; }
openButtons.forEach(button => button.addEventListener('click', openRegister));
closeButton.addEventListener('click', closeRegister);
modal.addEventListener('click', event => { if (event.target === modal) closeRegister(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeRegister(); });

codeForm.addEventListener('submit', event => {
  event.preventDefault();
  const code = document.querySelector('#learner-code').value.trim();
  const error = document.querySelector('#code-error');
  if (code !== '7368') { error.textContent = 'That code is not in our orbit yet. Try 7368.'; return; }
  showHumanCheck();
});

function showHumanCheck() {
  content.innerHTML = `<p class="eyebrow"><span class="eyebrow-line"></span> one last check</p><h2>Quick human<br><em>check.</em></h2><p class="modal-lead">Select both tiles that show the same shape. This keeps your learner space personal.</p><div class="captcha-box"><div class="captcha-prompt">Select all <strong>triangles</strong></div><div class="captcha-tiles captcha-grid"><button data-answer="circle">○</button><button data-answer="triangle">△</button><button data-answer="star">✦</button><button data-answer="triangle">△</button><button data-answer="square">□</button><button data-answer="moon">☾</button></div></div><p class="form-error" id="captcha-error"></p>`;
  let selected = 0;
  content.querySelectorAll('[data-answer]').forEach(tile => tile.addEventListener('click', () => {
    if (tile.classList.contains('selected')) return;
    if (tile.dataset.answer !== 'triangle') {
      document.querySelector('#captcha-error').textContent = 'One of those shapes does not belong. Try again.';
      content.querySelectorAll('.captcha-tiles button').forEach(item => item.classList.remove('selected'));
      selected = 0;
      return;
    }
    tile.classList.add('selected');
    selected += 1;
    if (selected === 2) { document.querySelector('#captcha-error').textContent = 'Check complete.'; setTimeout(enterSecretGames, 260); }
  }));
}

function enterApp() {
  closeRegister();
  document.body.innerHTML = `<div class="app-shell"><aside class="app-sidebar"><a class="brand" href="#"><span class="brand-mark">◒</span><span>ORBIT<span class="brand-dot">.</span></span></a><div class="user-chip"><div class="user-avatar">73</div><div><strong>Orbit learner</strong><small>Year 10 · 7368</small></div></div><nav class="app-nav"><button class="active" data-view="home">⌂ <span>Overview</span></button><button data-view="practice">◎ <span>Practice</span></button><button data-view="ask">✎ <span>Ask Orbit</span></button></nav><div class="sidebar-bottom"><div class="streak-mini"><span>✦</span><div><strong>3 days</strong><small>current streak</small></div></div><button class="logout" id="logout">↩ Sign out</button></div></aside><main class="app-main" id="app-main"></main></div>`;
  renderView('home');
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-view]').forEach(item => item.classList.remove('active')); button.classList.add('active'); renderView(button.dataset.view); }));
  document.querySelector('#logout').addEventListener('click', () => window.location.reload());
}

function enterSecretGames() {
  closeRegister();
  document.body.innerHTML = `<main class="secret-arcade"><header class="arcade-header"><div><p class="arcade-kicker">connection established · private channel</p><h1>NEON<span>//</span>ARCADE</h1></div><button class="arcade-exit" id="arcade-exit">Return to Orbit ↗</button></header><section class="arcade-intro"><p class="arcade-kicker">no homework beyond this point</p><h2>Pick your <em>escape.</em></h2><p>Two quick games. No scores to revise. Just beat your best.</p></section><section class="arcade-grid"><article class="arcade-card racer-card"><div class="arcade-card-head"><span>01 / RACE</span><span id="race-score">BEST 0</span></div><canvas id="race-canvas" width="520" height="330"></canvas><div class="arcade-controls"><button class="arcade-button" id="start-race">Start race</button><span>Use ← → to dodge</span></div></article><article class="arcade-card aim-card"><div class="arcade-card-head"><span>02 / AIM</span><span id="aim-score">0 HITS</span></div><div class="aim-arena" id="aim-arena"><button class="aim-target" id="aim-target" aria-label="Target"></button><div class="aim-message">Click start, then hit 10 targets.</div></div><div class="arcade-controls"><button class="arcade-button" id="start-aim">Start aim run</button><span>Click the targets</span></div></article></section></main>`;
  document.querySelector('#arcade-exit').addEventListener('click', () => window.location.reload());
  wireRacer();
  wireAim();
}

function renderView(view) {
  const main = document.querySelector('#app-main');
  const views = {
    home: `<header class="app-header"><div><p class="eyebrow">monday · 11 november</p><h1>Good afternoon, <em>learner.</em></h1></div><div class="header-badge">✦ <span>3 day streak</span></div></header><section class="welcome-panel"><div><p class="eyebrow">your next move</p><h2>Ten minutes<br>of <em>momentum.</em></h2><p>Pick up where you left off in Physics.</p><button class="button button-dark" data-jump="practice">Continue session <span>→</span></button></div><div class="panel-orbit"><div class="mini-planet">O</div><span>F = ma</span><span>λ</span></div></section><div class="dashboard-grid"><section class="dash-section"><div class="dash-title"><h2>Choose a subject</h2><span>View all →</span></div><div class="subject-list"><button class="dash-subject maths" data-jump="practice"><span>∑</span><strong>Mathematics</strong><small>12 topics · 64% complete</small><i>→</i></button><button class="dash-subject science" data-jump="practice"><span>⚛</span><strong>Science</strong><small>18 topics · 42% complete</small><i>→</i></button></div></section><section class="progress-card"><div class="dash-title"><h2>This week</h2><span>⌁</span></div><div class="progress-number">42<span>%</span></div><p>of your weekly target</p><div class="week-bars"><i style="height:55%"></i><i style="height:78%"></i><i style="height:35%"></i><i class="today" style="height:90%"></i><i style="height:0%"></i><i style="height:0%"></i><i style="height:0%"></i></div><div class="week-labels"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></section></div>`,
    practice: `<header class="app-header"><div><p class="eyebrow">practice deck</p><h1>Make it <em>click.</em></h1></div><div class="header-badge">12 <span>questions ready</span></div></header><div class="practice-layout"><section class="question-card"><div class="question-meta"><span>PHYSICS · YEAR 10</span><span>01 / 05</span></div><h2>A cyclist accelerates from rest at 2 m/s² for 5 seconds. What is their final velocity?</h2><div class="answer-grid"><button data-correct="false">5 m/s</button><button data-correct="true">10 m/s</button><button data-correct="false">2.5 m/s</button><button data-correct="false">25 m/s</button></div><p class="answer-feedback"></p></section><aside class="hint-card"><span>✦</span><h3>Need a nudge?</h3><p>Remember: final velocity equals starting velocity plus acceleration multiplied by time.</p><button class="text-link" data-view="ask">Ask Orbit →</button></aside></div>`,
    games: `<header class="app-header"><div><p class="eyebrow">games lab</p><h1>Learn by <em>playing.</em></h1></div><div class="header-badge">+120 <span>XP available</span></div></header><div class="games-grid"><section class="game-card game-math"><span class="game-symbol">∑</span><div><p class="eyebrow">speed round</p><h2>Number<br>Navigator</h2><p>Find the missing number before the orbit closes.</p><button class="button button-dark" data-game="math">Play now <span>→</span></button></div></section><section class="game-card game-science"><span class="game-symbol">⚛</span><div><p class="eyebrow">match up</p><h2>Element<br>Rush</h2><p>Pair the element with its symbol and score a streak.</p><button class="button button-dark" data-game="element">Play now <span>→</span></button></div></section></div><div id="game-status"></div>`,
    ask: `<header class="app-header"><div><p class="eyebrow">your study companion</p><h1>Ask <em>Orbit.</em></h1></div><div class="header-badge">AI <span>ready to help</span></div></header><section class="chat-card"><div class="chat-top"><div class="orb-small">O</div><div><strong>Orbit AI</strong><small>Explains, never just tells</small></div><span class="online-dot"></span></div><div class="chat-messages"><div class="message bot">Hi! I can break down a tricky topic, make you a quiz, or help you plan a revision session. What are you working on?</div><div class="suggestions"><button>Explain photosynthesis</button><button>Quiz me on forces</button><button>Help with fractions</button></div></div><form class="chat-form" id="chat-form"><input id="chat-input" placeholder="Ask a question..." autocomplete="off"><button aria-label="Send question">↑</button></form></section>`
  };
  main.innerHTML = views[view] || views.home;
  main.querySelectorAll('[data-jump]').forEach(button => button.addEventListener('click', () => document.querySelector(`[data-view="${button.dataset.jump}"]`).click()));
  main.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => document.querySelector(`[data-view="${button.dataset.view}"]`).click()));
  if (view === 'practice') wirePractice(); if (view === 'games') wireGames(); if (view === 'ask') wireChat();
}

function wirePractice() {
  const questionCard = document.querySelector('.question-card');
  questionCard.insertAdjacentHTML('afterbegin', `<div class="revision-controls"><label>Subject <select id="revision-subject"><option>Physics</option><option>Mathematics</option><option>Biology</option><option>Chemistry</option></select></label><label>Year <select id="revision-year"><option>7</option><option>8</option><option>9</option><option selected>10</option><option>11</option><option>12</option><option>13</option></select></label><button class="text-link" id="reset-revision">Reset session</button></div>`);
  document.querySelector('#revision-subject').value = revisionState.subject;
  document.querySelector('#revision-subject').addEventListener('change', event => { revisionState.subject = event.target.value; revisionState.questionIndex = 0; revisionState.score = 0; renderRevisionQuestion(); });
  document.querySelector('#revision-year').addEventListener('change', event => { revisionState.year = event.target.value; renderRevisionQuestion(); });
  document.querySelector('#reset-revision').addEventListener('click', () => { revisionState.questionIndex = 0; revisionState.score = 0; renderRevisionQuestion(); });
  renderRevisionQuestion();
}

function renderRevisionQuestion() {
  const question = questionBank[revisionState.subject][revisionState.questionIndex % questionBank[revisionState.subject].length];
  const questionCard = document.querySelector('.question-card');
  questionCard.querySelector('.question-meta').innerHTML = `<span>${revisionState.subject.toUpperCase()} · YEAR ${revisionState.year} · ${question.topic.toUpperCase()}</span><span>${(revisionState.questionIndex % questionBank[revisionState.subject].length) + 1} / ${questionBank[revisionState.subject].length}</span>`;
  questionCard.querySelector('h2').textContent = question.prompt;
  questionCard.querySelector('.answer-grid').innerHTML = question.answers.map((answer, index) => `<button data-answer-index="${index}">${answer}</button>`).join('');
  questionCard.querySelector('.answer-feedback').textContent = `Score: ${revisionState.score} / ${revisionState.questionIndex}`;
  revisionState.answered = false;
  questionCard.querySelectorAll('.answer-grid button').forEach(button => button.addEventListener('click', () => checkRevisionAnswer(Number(button.dataset.answerIndex), question)));
}

function checkRevisionAnswer(answerIndex, question) {
  if (revisionState.answered) return;
  revisionState.answered = true;
  const buttons = document.querySelectorAll('.answer-grid button');
  buttons.forEach(button => { button.disabled = true; if (Number(button.dataset.answerIndex) === question.correct) button.classList.add('correct'); });
  const feedback = document.querySelector('.answer-feedback');
  if (answerIndex === question.correct) { revisionState.score += 1; feedback.innerHTML = `Correct. ${question.explanation} <button class="next-question" id="next-question">Next question →</button>`; }
  else { buttons[answerIndex].classList.add('wrong'); feedback.innerHTML = `Not quite. ${question.explanation} <button class="next-question" id="next-question">Try another →</button>`; }
  document.querySelector('#next-question').addEventListener('click', () => { revisionState.questionIndex += 1; renderRevisionQuestion(); });
}
function wireGames() { document.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => { const status = document.querySelector('#game-status'); const math = button.dataset.game === 'math'; status.innerHTML = `<div class="game-play"><p class="eyebrow">${math ? 'number navigator' : 'element rush'}</p><h2>${math ? 'What is 7 × 8?' : 'What is the symbol for oxygen?'}</h2><div class="game-options">${(math ? ['54', '56', '64'] : ['Ox', 'O', 'Og']).map(answer => `<button>${answer}</button>`).join('')}</div></div>`; status.querySelectorAll('button').forEach(answer => answer.addEventListener('click', () => { answer.classList.add((math && answer.textContent === '56') || (!math && answer.textContent === 'O') ? 'correct' : 'wrong'); })); })); }
function wireChat() { const form = document.querySelector('#chat-form'); const input = document.querySelector('#chat-input'); const messages = document.querySelector('.chat-messages'); document.querySelectorAll('.suggestions button').forEach(button => button.addEventListener('click', () => { input.value = button.textContent; form.requestSubmit(); })); form.addEventListener('submit', event => { event.preventDefault(); const question = input.value.trim(); if (!question) return; messages.insertAdjacentHTML('beforeend', `<div class="message user">${question}</div><div class="message bot">Here is a way in: start with what you know, draw the relationship between the ideas, and test yourself with one example. For <strong>${question}</strong>, I would begin by defining the key term and then work through a simple case together.</div>`); input.value = ''; messages.scrollTop = messages.scrollHeight; }); }

function wireRacer() {
  const canvas = document.querySelector('#race-canvas');
  const context = canvas.getContext('2d');
  const start = document.querySelector('#start-race');
  const scoreLabel = document.querySelector('#race-score');
  let frameId; let running = false; let score = 0; let lane = 1; let obstacles = [];
  const keys = new Set();
  document.addEventListener('keydown', event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') keys.add(event.key); });
  document.addEventListener('keyup', event => keys.delete(event.key));
  function draw() {
    context.fillStyle = '#222938'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#414b5d'; context.lineWidth = 3;
    for (let x = 85; x < canvas.width; x += 175) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, canvas.height); context.stroke(); }
    context.strokeStyle = '#f6f1df'; context.setLineDash([18, 19]); context.lineWidth = 2;
    context.beginPath(); context.moveTo(173, 0); context.lineTo(173, canvas.height); context.moveTo(347, 0); context.lineTo(347, canvas.height); context.stroke(); context.setLineDash([]);
    if (running) { if (keys.has('ArrowLeft')) lane = Math.max(0, lane - .08); if (keys.has('ArrowRight')) lane = Math.min(2, lane + .08); }
    const playerX = 55 + lane * 175;
    context.fillStyle = '#55d6c0'; context.beginPath(); context.moveTo(playerX + 30, 275); context.lineTo(playerX + 8, 315); context.lineTo(playerX + 52, 315); context.closePath(); context.fill();
    obstacles.forEach(obstacle => { obstacle.y += 4; context.fillStyle = '#f26e5d'; context.fillRect(55 + obstacle.lane * 175, obstacle.y, 44, 38); });
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height + 40);
    if (running && Math.random() < .035) obstacles.push({ lane: Math.floor(Math.random() * 3), y: -40 });
    if (running) { score += 1; scoreLabel.textContent = `SCORE ${Math.floor(score / 10)}`; const hit = obstacles.some(obstacle => obstacle.lane === Math.round(lane) && obstacle.y > 250 && obstacle.y < 315); if (hit) { running = false; start.textContent = 'Race again'; } }
    frameId = requestAnimationFrame(draw);
  }
  start.addEventListener('click', () => { cancelAnimationFrame(frameId); score = 0; lane = 1; obstacles = []; running = true; start.textContent = 'Restart race'; draw(); });
  draw();
}

function wireAim() {
  const arena = document.querySelector('#aim-arena'); const target = document.querySelector('#aim-target'); const start = document.querySelector('#start-aim'); const scoreLabel = document.querySelector('#aim-score'); let hits = 0; let active = false;
  function moveTarget() { target.style.left = `${Math.random() * (arena.clientWidth - 45)}px`; target.style.top = `${Math.random() * (arena.clientHeight - 45)}px`; }
  start.addEventListener('click', () => { hits = 0; active = true; arena.classList.add('running'); scoreLabel.textContent = '0 HITS'; start.textContent = 'Restart aim run'; moveTarget(); });
  target.addEventListener('click', () => { if (!active) return; hits += 1; scoreLabel.textContent = `${hits} HITS`; if (hits >= 10) { active = false; arena.classList.remove('running'); start.textContent = 'Play again'; arena.querySelector('.aim-message').textContent = 'Run complete. Nice reflexes.'; } else moveTarget(); });
}