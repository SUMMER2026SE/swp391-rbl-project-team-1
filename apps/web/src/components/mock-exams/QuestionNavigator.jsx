import React from 'react';

export default function QuestionNavigator({
  questions = [],
  answers = {},
  bookmarks = {},
  currentQuestionIndex,
  onNavigateIndex,
  onSubmitClick
}) {
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).filter(qId => answers[qId]).length;
  const markedCount = Object.keys(bookmarks).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="exam-navigator-panel">
      <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 16px 0', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
        BẢNG ĐIỀU HƯỚNG CÂU HỎI
      </h3>

      {/* Stats summaries */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: 'rgba(108, 92, 231, 0.08)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>ĐÃ LÀM</span>
          <strong style={{ fontSize: '16px', color: 'var(--exams-purple)' }}>{answeredCount} / {totalQuestions}</strong>
        </div>
        <div style={{ background: 'rgba(225, 112, 85, 0.08)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>GHI CHÚ / LƯU</span>
          <strong style={{ fontSize: '16px', color: 'var(--exams-orange)' }}>{markedCount} câu</strong>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Chưa làm: <strong>{unansweredCount}</strong></span>
        <span>Tiến độ: <strong>{Math.round((answeredCount / totalQuestions) * 100) || 0}%</strong></span>
      </div>

      {/* Bubble grids */}
      <div className="navigator-bubbles-grid" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
        {questions.map((q, idx) => {
          const isCurrent = idx === currentQuestionIndex;
          const isAnswered = !!answers[q.id];
          const isMarked = !!bookmarks[q.id];

          let bubbleClass = '';
          if (isCurrent) bubbleClass += ' current';
          if (isAnswered) bubbleClass += ' answered';
          if (isMarked) bubbleClass += ' marked';

          return (
            <button
              key={q.id}
              onClick={() => onNavigateIndex(idx)}
              className={`nav-bubble-btn ${bubbleClass}`}
              title={`Câu số ${q.question_number}`}
            >
              {q.question_number}
            </button>
          );
        })}
      </div>

      {/* Submit Trigger Action */}
      <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        <button
          onClick={onSubmitClick}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '12px',
            background: 'var(--exams-red)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(214, 48, 49, 0.2)',
            cursor: 'pointer'
          }}
        >
          NỘP BÀI THI ⚡
        </button>
      </div>
    </div>
  );
}
