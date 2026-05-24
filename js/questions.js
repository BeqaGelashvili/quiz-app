const API_BASE = '.'; 

const QuizAPI = (() => {
  async function getSubjects() {
    const res = await fetch(`${API_BASE}/subjects.json`); 
    if (!res.ok) throw new Error(`Failed to load subjects (${res.status})`);
    return await res.json();
  }

  async function getQuestions(subjectKey, levelKey) {
    const res = await fetch(`${API_BASE}/questions.json`);
    if (!res.ok) throw new Error(`Failed to load questions (${res.status})`);
    
    const allData = await res.json();

    const filteredQuestions = allData.filter(q => 
      q.subject === subjectKey && q.level === levelKey
    );

    return filteredQuestions;
  }

  return {
    getSubjects,
    getQuestions
  };
})();

window.QuizAPI = QuizAPI;
