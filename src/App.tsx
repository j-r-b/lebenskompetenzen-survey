import { useState, useEffect } from 'react';
import { SurveyForm } from './components/SurveyForm';
import { ResultsDashboard } from './components/ResultsDashboard';

function App() {
  const [view, setView] = useState<'survey' | 'results'>('survey');
  const [answers, setAnswers] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const isDone = localStorage.getItem('survey_2026_done');
    if (isDone === 'true') {
      setView('results');
    }
  }, []);

  const handleSurveySubmit = (submittedAnswers: Record<string, number>) => {
    // 1. Asynchronous POST - fire and forget
    const payload = {
      timestamp: new Date().toISOString(),
      data: submittedAnswers,
    };

    fetch('https://[DEINE-DOMAIN.CH]/api/submit.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.warn('POST failed (fire & forget):', err);
    });

    // 2. Local State & Storage
    localStorage.setItem('survey_2026_done', 'true');
    localStorage.setItem('survey_2026_answers', JSON.stringify(submittedAnswers));

    setAnswers(submittedAnswers);
    setView('results');
  };

  const handleReset = () => {
    localStorage.removeItem('survey_2026_done');
    localStorage.removeItem('survey_2026_answers');
    setAnswers(null);
    setView('survey');
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Lebenskompetenzen-Assessment</h1>
        </header>

        <main>
          {view === 'survey' ? (
            <SurveyForm onSubmit={handleSurveySubmit} />
          ) : (
            <ResultsDashboard answers={answers} onReset={handleReset} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
