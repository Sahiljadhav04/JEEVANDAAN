import React, { useState } from 'react';

const questions = [
  { q: 'Are you between 18 and 65 years of age?', correct: 'Yes', tip: 'Donors must be 18-65 years old.' },
  { q: 'Do you weigh at least 45 kg?', correct: 'Yes', tip: 'Minimum weight is 45 kg for safety.' },
  { q: 'Have you eaten a proper meal today?', correct: 'Yes', tip: 'Always eat before donating blood.' },
  { q: 'Do you have any fever, cold or infection currently?', correct: 'No', tip: 'You must be in good health to donate.' },
  { q: 'Have you donated blood in the last 90 days?', correct: 'No', tip: 'Wait at least 90 days between donations.' },
  { q: 'Are you on any antibiotics or regular medication?', correct: 'No', tip: 'Certain medications disqualify donors temporarily.' },
  { q: 'Have you had a tattoo or piercing in the last 6 months?', correct: 'No', tip: 'Recent tattoos/piercings require a waiting period.' },
  { q: 'Are you feeling fit and healthy today?', correct: 'Yes', tip: 'General wellness is important for safe donation.' },
];

const tips = [
  { icon: '💧', title: 'Stay Hydrated', desc: 'Drink 2-3 extra glasses of water before donating' },
  { icon: '🍽️', title: 'Eat Well', desc: 'Have a full meal at least 2 hours before donation' },
  { icon: '😴', title: 'Get Rest', desc: 'Ensure 7-8 hours of sleep the night before' },
  { icon: '🚫', title: 'Avoid Alcohol', desc: 'No alcohol for at least 24 hours before donation' },
  { icon: '👕', title: 'Wear Right', desc: 'Wear comfortable, loose-fitting clothing' },
  { icon: '🩺', title: 'After Donation', desc: 'Rest for 15 mins, have juice and snacks after' },
];

export default function HealthQuiz() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const answer = (i, val) => {
    if (submitted) return;
    setAnswers({ ...answers, [i]: val });
  };

  const submit = () => setSubmitted(true);
  const reset = () => { setAnswers({}); setSubmitted(false); };

  const allAnswered = Object.keys(answers).length === questions.length;
  const allCorrect = submitted && questions.every((q, i) => answers[i] === q.correct);
  const wrongOnes = submitted ? questions.filter((q, i) => answers[i] !== q.correct) : [];

  return (
    <div className="page-container fade-in">
      <div className="section-header">
        <div>
          <div className="section-title">💊 Health & Eligibility Check</div>
          <div className="section-subtitle">Quick quiz to check if you're ready to donate blood</div>
        </div>
      </div>

      {/* Result Banner */}
      {submitted && (
        <div className={`alert ${allCorrect ? 'alert-success' : 'alert-danger'}`} style={{ fontSize: '16px', padding: '20px', marginBottom: '24px' }}>
          {allCorrect ? (
            <div>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉 You're Eligible to Donate!</div>
              <div>All criteria are met. You can safely donate blood. Please book a slot at a nearby camp!</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚠️ Not Eligible Right Now</div>
              <div>You don't meet all eligibility criteria. Please check the notes below and try again when conditions are met.</div>
              <div style={{ marginTop: '12px' }}>
                {wrongOnes.map((q, i) => <div key={i} style={{ marginTop: '6px', fontSize: '13px' }}>• {q.tip}</div>)}
              </div>
            </div>
          )}
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }} onClick={reset}>🔄 Retake Quiz</button>
        </div>
      )}

      <div className="grid-2">
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>📋 Eligibility Questions</h3>
          {questions.map((qItem, i) => (
            <div key={i} className="quiz-question">
              <div className="quiz-q-text">{i + 1}. {qItem.q}</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['Yes', 'No'].map(opt => {
                  let cls = 'quiz-option';
                  if (answers[i] === opt) {
                    if (!submitted) cls += ' selected';
                    else if (opt === qItem.correct) cls += ' correct';
                    else cls += ' wrong';
                  } else if (submitted && opt === qItem.correct && answers[i] !== opt) {
                    cls += ' correct';
                  }
                  return (
                    <div key={opt} className={cls} onClick={() => answer(i, opt)} style={{ flex: 1, justifyContent: 'center' }}>
                      {opt === 'Yes' ? '✅ Yes' : '❌ No'}
                    </div>
                  );
                })}
              </div>
              {submitted && answers[i] !== qItem.correct && (
                <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '8px' }}>💡 {qItem.tip}</div>
              )}
            </div>
          ))}

          {!submitted && (
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} disabled={!allAnswered} onClick={submit}>
              {allAnswered ? '🩺 Check Eligibility' : `Answer all ${questions.length} questions to continue`}
            </button>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>💡 Donation Tips</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tips.map(tip => (
              <div key={tip.title} className="card" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '16px' }}>
                <div style={{ fontSize: '28px', flexShrink: 0 }}>{tip.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', fontSize: '15px' }}>{tip.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{tip.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card mt-16" style={{ background: 'rgba(200,16,46,0.08)', borderColor: 'rgba(200,16,46,0.2)' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--blood-red)', marginBottom: '12px' }}>📊 Did You Know?</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 2 }}>
              <div>• Blood has a shelf life of only <strong style={{ color: 'var(--text-primary)' }}>35–42 days</strong></div>
              <div>• O- is the <strong style={{ color: 'var(--text-primary)' }}>universal donor</strong> blood type</div>
              <div>• AB+ is the <strong style={{ color: 'var(--text-primary)' }}>universal recipient</strong> blood type</div>
              <div>• India needs <strong style={{ color: 'var(--text-primary)' }}>5 crore units</strong> of blood every year</div>
              <div>• Only <strong style={{ color: 'var(--text-primary)' }}>7%</strong> of population donates blood</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
