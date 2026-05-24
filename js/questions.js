
const API_BASE = 'http://127.0.0.1:3001';

const QuizAPI = (() => {
  async function getSubjects() {
    const res = await fetch(`${API_BASE}/subjects`);
    if (!res.ok) throw new Error(`Failed to load subjects (${res.status})`);
    return await res.json();
  }

  async function getQuestions(subjectKey, levelKey) {
    const url = new URL(`${API_BASE}/questions`);
    url.searchParams.set('subject', subjectKey);
    url.searchParams.set('level', levelKey);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Failed to load questions (${res.status})`);
    return await res.json();
  }

  return {
    getSubjects,
    getQuestions
  };
})();

window.QuizAPI = QuizAPI;
