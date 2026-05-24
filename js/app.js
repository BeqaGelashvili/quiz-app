const state = {
  subjectKey: null,
  levelKey: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  wrongCount: 0,
  answered: false,
  levelPoints: 1
};

async function init() {
  if (!window.QuizAPI) {
    console.error('QuizAPI missing. Ensure questions.js is loaded.');
    return;
  }

  try {
    const subjects = await window.QuizAPI.getSubjects();
    window.app.selectSubjects(subjects);
  } catch (err) {
    console.error(err);
    window.ui?.showToast?.('Error loading quiz data.', 'wrong');
  }
}

window.app = {
  selectSubject: null,
  startQuiz: null,
  handleAnswer: null,
  selectSubjects: null
};

window.app.selectSubjects = function (subjects) {
  window.ui.renderHome(subjects);

  window.app.selectSubject = (subjectKey) => {
    const subject = subjects.find((x) => x.key === subjectKey);
    if (!subject) return;
    window.ui.renderDifficulty(subject);
    state.subjectKey = subjectKey;
  };
};

window.app.startQuiz = async function (subjectKey, levelKey) {
  state.subjectKey = subjectKey;
  state.levelKey = levelKey;
  state.currentIndex = 0;
  state.score = 0;
  state.correctCount = 0;
  state.wrongCount = 0;
  state.answered = false;

  const subjects = await window.QuizAPI.getSubjects();
  const subject = subjects.find((s) => s.key === subjectKey);
  const level = subject?.levels?.[levelKey];
  
  state.levelPoints = level?.points ?? (levelKey === 'entry' ? 1 : levelKey === 'intermediate' ? 2 : 3);

  const questions = await window.QuizAPI.getQuestions(subjectKey, levelKey);
  state.questions = window.ui.shuffle(questions);

  state._subjectName = subject?.name ?? subjectKey;
  state._levelLabel = level?.label ?? levelKey;

  renderCurrentQuestion();
  window.ui.showScreen('screenQuiz');
  bindFooterButtons();
};

function renderCurrentQuestion() {
  window.ui.renderQuizQuestion({
    subjectName: state._subjectName,
    levelLabel: state._levelLabel,
    total: state.questions.length,
    idx: state.currentIndex,
    score: state.score,
    correctCount: state.correctCount,
    wrongCount: state.wrongCount,
    question: state.questions[state.currentIndex],
    points: state.levelPoints,
    isLast: state.currentIndex === state.questions.length - 1
  });
}

function bindFooterButtons() {
  const nextBtn = document.getElementById('nextBtn');
  const restartBtn = document.getElementById('btnRestart');
  const homeBtn = document.getElementById('btnGoHome');
  const backHomeBtn = document.getElementById('btnBackHome');

  if (nextBtn) nextBtn.onclick = () => nextQuestion();
  if (restartBtn) restartBtn.onclick = () => window.app.startQuiz(state.subjectKey, state.levelKey);
  if (homeBtn) homeBtn.onclick = () => window.ui.showScreen('screenHome');
  if (backHomeBtn) backHomeBtn.onclick = () => window.ui.showScreen('screenHome');

  const quizIcon = document.querySelector('header .logo-mark');
  if (quizIcon) {
    quizIcon.style.cursor = 'pointer';
    quizIcon.onclick = () => window.ui.showScreen('screenHome');
  }
}

window.app.handleAnswer = function (selectedIndex, btnEl, correctIndex, points) {
  if (state.answered) return;
  state.answered = true;

  const allButtons = document.querySelectorAll('.option-btn');
  allButtons.forEach((b) => (b.disabled = true));

  const feedbackContainer = document.querySelector('.question-counter');

  if (selectedIndex === correctIndex) {
    btnEl.classList.add('correct');
    state.score += points;
    state.correctCount++;
    if (feedbackContainer) feedbackContainer.innerHTML = `<span style="color: var(--primary2)">✓ Correct! +${points} pts</span>`;
  } else {
    btnEl.classList.add('wrong');
    const correctBtn = allButtons[correctIndex];
    if (correctBtn) correctBtn.classList.add('correct');
    state.wrongCount++;
    if (feedbackContainer) feedbackContainer.innerHTML = `<span style="color: #ef4444">✗ Incorrect</span>`;
  }

  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) nextBtn.disabled = false;

  const scoreEl = document.getElementById('qScore');
  const correctEl = document.getElementById('qCorrect');
  const wrongEl = document.getElementById('qWrong');
  
  if (scoreEl) scoreEl.textContent = `${state.score} pts`;
  if (correctEl) correctEl.textContent = state.correctCount;
  if (wrongEl) wrongEl.textContent = state.wrongCount;
};

function nextQuestion() {
  state.currentIndex++;

  if (state.currentIndex >= state.questions.length) {
    window.ui.renderResults({
      total: state.questions.length,
      correctCount: state.correctCount,
      wrongCount: state.wrongCount
    });
    return;
  }

  state.answered = false;
  renderCurrentQuestion();
}

window.addEventListener('DOMContentLoaded', init);
