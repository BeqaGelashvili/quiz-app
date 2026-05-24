

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
    console.error('QuizAPI missing. Ensure questions.js is loaded in index.html');
    return;
  }

  try {
    const subjects = await window.QuizAPI.getSubjects();
    window.app.selectSubjects(subjects);
  } catch (err) {
    console.error(err);
    window.ui?.showToast?.('Error loading quiz data. Check console.', 'wrong');
  }
}

function normalizeSubjects(subjects) {
  return subjects.map((s) => ({
    key: s.key,
    name: s.name,
    icon: s.icon,
    color: s.color,
    levels: s.levels
  }));
}

window.app = {
  selectSubject: null,
  startQuiz: null,
  handleAnswer: null,
  selectSubjects: null
};

window.app.selectSubjects = function (subjects) {
  const selectedSubjects = subjects;

  window.ui.renderHome(selectedSubjects);

  window.app.selectSubject = (subjectKey) => {
    const subject = selectedSubjects.find((x) => x.key === subjectKey);
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

  const subject = (await window.QuizAPI.getSubjects()).find((s) => s.key === subjectKey);

  const level = subject?.levels?.[levelKey];
  state.levelPoints = level?.points ?? (levelKey === 'entry' ? 1 : levelKey === 'intermediate' ? 2 : 3);

  const questions = await window.QuizAPI.getQuestions(subjectKey, levelKey);

  state.questions = window.ui.shuffle(questions);



  const subjectName = subject?.name ?? subjectKey;
  const levelLabel = level?.label ?? levelKey;

  state._subjectName = subjectName;
  state._levelLabel = levelLabel;

  window.ui.renderQuizQuestion({
    subjectName,
    levelLabel,
    total: state.questions.length,
    idx: state.currentIndex,
    score: state.score,
    correctCount: state.correctCount,
    wrongCount: state.wrongCount,
    question: state.questions[state.currentIndex],
    points: state.levelPoints,
    isLast: state.currentIndex === state.questions.length - 1
  });
  window.ui.showScreen('screenQuiz');

  bindFooterButtons();
};

function bindFooterButtons() {
  const nextBtn = document.getElementById('nextBtn');
  const restartBtn = document.getElementById('btnRestart');
  const homeBtn = document.getElementById('btnGoHome');
  const backHomeBtn = document.getElementById('btnBackHome');

  let skipBtn = document.getElementById('btnSkip');

  let menuBtn = document.getElementById('btnBackToMenu');

  if ((!skipBtn || !menuBtn) && nextBtn?.parentElement) {
    if (!skipBtn) {

      skipBtn = document.createElement('button');
      skipBtn.type = 'button';
      skipBtn.id = 'btnSkip';
      skipBtn.className = 'btn btn-ghost';
      skipBtn.style.marginRight = 'auto';
      skipBtn.textContent = 'Skip';
      nextBtn.parentElement.insertBefore(skipBtn, nextBtn);

      skipBtn.addEventListener('click', () => {
        if (!state.answered) {
          window.ui?.showToast?.('Skip requires selecting an answer.', 'wrong');
          return;
        }
        nextQuestion();
      });
    }


    if (!menuBtn) {
      menuBtn = document.createElement('button');
      menuBtn.type = 'button';
      menuBtn.id = 'btnBackToMenu';
      menuBtn.className = 'btn btn-ghost';
      menuBtn.textContent = 'Back to menu';
      nextBtn.parentElement.insertBefore(menuBtn, nextBtn);

      menuBtn.addEventListener('click', () => {
        window.ui?.showScreen?.('screenHome');
      });
    }
  }


  if (nextBtn) {
    nextBtn.onclick = () => nextQuestion();
  }

  if (restartBtn) {
    restartBtn.onclick = () => window.app.startQuiz(state.subjectKey, state.levelKey);
  }
  if (homeBtn) {
    homeBtn.onclick = () => window.ui.showScreen('screenHome');
  }
  if (backHomeBtn) {
    backHomeBtn.onclick = () => window.ui.showScreen('screenHome');
  }

  const quizIcon = document.querySelector('header .logo-mark');

  if (quizIcon) {
    quizIcon.style.cursor = 'pointer';
    quizIcon.style.border = 'none';
    quizIcon.onclick = () => window.ui.showScreen('screenHome');
  }



}

window.app.handleAnswer = function (selectedIndex, btnEl, correctIndex, points) {
  if (state.answered) return;
  state.answered = true;

  const allButtons = document.querySelectorAll('.option-btn');
  allButtons.forEach((b) => (b.disabled = true));

  if (selectedIndex === correctIndex) {
    btnEl.classList.add('correct');
    state.score += points;
    state.correctCount++;
    window.ui.showToast('✓ Correct! +' + points + ' point' + (points > 1 ? 's' : ''), 'correct');
  } else {
    btnEl.classList.add('wrong');
    const correctBtn = allButtons[correctIndex];
    if (correctBtn) correctBtn.classList.add('correct');
    state.wrongCount++;
    window.ui.showToast('✗ Incorrect!', 'wrong');
  }

  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) nextBtn.disabled = false;

  document.getElementById('qScore').textContent = `${state.score} pts`;
  document.getElementById('qCorrect').textContent = state.correctCount;
  document.getElementById('qWrong').textContent = state.wrongCount;
};

function nextQuestion() {
  state.currentIndex++;

  if (state.currentIndex >= state.questions.length) {
    return showResults();
  }

  state.answered = false;

  const idx = state.currentIndex;
  const total = state.questions.length;
  const question = state.questions[idx];

  window.ui.renderQuizQuestion({
    subjectName: state._subjectName,
    levelLabel: state._levelLabel,
    total,
    idx,
    score: state.score,
    correctCount: state.correctCount,
    wrongCount: state.wrongCount,
    question,
    points: state.levelPoints,
    isLast: idx === total - 1
  });
}

function showResults() {
  window.ui.renderResults({
    total: state.questions.length,
    correctCount: state.correctCount,
    wrongCount: state.wrongCount
  });
}

window.addEventListener('DOMContentLoaded', init);
