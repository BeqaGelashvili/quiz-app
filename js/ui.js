function $(id) {
  return document.getElementById(id);
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const el = $(screenId);
  el.classList.add('active');
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = '';
}

function showToast(msg, type) {
  const t = $('feedbackToast');
  t.textContent = msg;
  t.className = `feedback-toast ${type}-toast show`;
  setTimeout(() => t.classList.remove('show'), 1800);
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function renderHome(subjects) {
  const grid = $('subjectsGrid');
  grid.innerHTML = '';

  subjects.forEach((subject) => {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.style.setProperty('--subject-color', subject.color);
    card.innerHTML = `
      <span class="subject-icon">${subject.icon}</span>
      <div class="subject-name">${subject.name}</div>
      <div class="subject-count">45 Questions</div>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.subject-card').forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');

      const overlay = document.getElementById('loaderOverlay');
      if (overlay) overlay.classList.add('show');

      setTimeout(() => {
        if (overlay) overlay.classList.remove('show');
        if (window.app?.selectSubject) window.app.selectSubject(subject.key);
      }, 1000);
    });

    grid.appendChild(card);
  });
}

function renderDifficulty(subject) {
  const badge = $('diffSubjectBadge');
  badge.innerHTML = `${subject.icon} ${subject.name}`;
  badge.style.color = subject.color;
  badge.style.borderColor = `${subject.color}30`;

  const grid = $('diffGrid');
  grid.innerHTML = '';

  const diffs = [
    { key: 'entry',        icon: '🌱', color: '#00e5a0', desc: 'Beginner-friendly fundamentals' },
    { key: 'intermediate', icon: '⚡', color: '#f59e0b', desc: 'For the curious enthusiast' },
    { key: 'expert',       icon: '🔥', color: '#ef4444', desc: 'Deep knowledge required' }
  ];

  diffs.forEach((d) => {
    const levelData = subject.levels?.[d.key] ?? null;
    const points = levelData?.points ?? (d.key === 'entry' ? 1 : d.key === 'intermediate' ? 2 : 3);

    const card = document.createElement('div');
    card.className = 'diff-card';
    card.style.setProperty('--diff-color', d.color);
    card.innerHTML = `
      <div class="diff-left">
        <div class="diff-icon">${d.icon}</div>
        <div>
          <div class="diff-name">${levelData?.label ?? d.key[0].toUpperCase() + d.key.slice(1)}</div>
          <div class="diff-desc">${d.desc} · +${points} pt${points > 1 ? 's' : ''}/question</div>
        </div>
      </div>
      <svg class="diff-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    `;

    card.addEventListener('click', () => {
      if (window.app?.startQuiz) window.app.startQuiz(subject.key, d.key);
    });

    grid.appendChild(card);
  });

  showScreen('screenDifficulty');
}

function renderQuizQuestion(params) {
  const {
    subjectName,
    levelLabel,
    total,
    idx,
    score,
    correctCount,
    wrongCount,
    question,
    points,
    isLast
  } = params;

  $('qSubject').textContent = subjectName;
  $('qLevel').textContent = levelLabel;

  const pct = (idx / total) * 100;
  $('progressFill').style.width = pct + '%';
  $('questionNum').textContent = `Question ${idx + 1} of ${total}`;

  $('qScore').textContent = `${score} pts`;
  $('qCorrect').textContent = correctCount;
  $('qWrong').textContent = wrongCount;

  $('questionText').textContent = question.q;

  const grid = $('optionsGrid');
  grid.innerHTML = '';

  const letters = ['A', 'B', 'C', 'D'];
  question.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.setAttribute('data-letter', letters[i] ?? '');
    btn.textContent = opt;
    btn.dataset.index = i;

    btn.addEventListener('click', () => {
      if (window.app?.handleAnswer) window.app.handleAnswer(i, btn, question.answer, points);
    });

    grid.appendChild(btn);
  });

  const nextBtn = $('nextBtn');
  nextBtn.disabled = true;

  nextBtn.innerHTML = isLast
    ? 'Finish <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'
    : 'Next <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
}

function renderResults(params) {
  const { total, correctCount, wrongCount } = params;
  const pct = Math.round((correctCount / total) * 100);

  $('resultScoreNum').textContent = correctCount;
  $('resultScoreTotal').textContent = `/ ${total}`;
  $('resCorrect').textContent = correctCount;
  $('resWrong').textContent = wrongCount;
  $('resPct').textContent = pct + '%';

  let grade, msg, ringColor;
  if (pct >= 90)      { grade = '🏆 Masterful!';   msg = 'Outstanding. You truly know your stuff.'; ringColor = '#00e5a0'; }
  else if (pct >= 75) { grade = '⭐ Excellent!';    msg = 'Great performance — only minor gaps.'; ringColor = '#6c63ff'; }
  else if (pct >= 60) { grade = '👍 Good Job!';      msg = 'Solid foundation. Keep pushing forward.'; ringColor = '#f59e0b'; }
  else if (pct >= 40) { grade = '📚 Keep Going!';   msg = 'Room to grow — revisit and try again.'; ringColor = '#f59e0b'; }
  else                { grade = '💡 Keep Learning'; msg = "Don't give up — every expert was once a novice."; ringColor = '#ef4444'; }

  $('resultGrade').textContent = grade;
  $('resultMsg').textContent = msg;

  const circumference = 345;
  const offset = circumference - (pct / 100) * circumference;
  const ring = $('resultRingFill');

  ring.style.stroke = ringColor;
  ring.style.strokeDashoffset = circumference;

  showScreen('screenResults');
  setTimeout(() => {
    ring.style.strokeDashoffset = offset;
  }, 100);
}

window.ui = {
  showScreen,
  showToast,
  shuffle,
  renderHome,
  renderDifficulty,
  renderQuizQuestion,
  renderResults
};
