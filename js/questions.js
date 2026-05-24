const API_BASE = '/quiz-app/data'; 

const QuizAPI = (() => {
  async function getData() {
    const res = await fetch(`${API_BASE}/db.json`); 
    if (!res.ok) throw new Error(`Failed to load db.json (${res.status})`);
    return await res.json();
  }

  async function getSubjects() {
    const data = await getData();
    return data.subjects; 
  }

  async function getQuestions(subjectKey, levelKey) {
    const data = await getData();
    return data.questions.filter(q => 
      q.subject === subjectKey && q.level === levelKey
    );
  }

  return {
    getSubjects,
    getQuestions
  };
})();

window.QuizAPI = QuizAPI;
