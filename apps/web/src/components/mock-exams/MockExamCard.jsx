import React from 'react';

export default function MockExamCard({ exam, onSelect, onStart }) {
  const isMath = exam.subject_id === 1 || exam.title.includes('Toán');
  const isPhysics = exam.subject_id === 3 || exam.title.includes('Vật lý');
  const isChemistry = exam.subject_id === 4 || exam.title.includes('Hóa');
  const isEnglish = exam.subject_id === 2 || exam.title.includes('Anh');

  const cardHeaderBg = isMath 
    ? 'linear-gradient(135deg, #6c5ce7, #8e7cf8)' 
    : (isPhysics 
        ? 'linear-gradient(135deg, #0984e3, #3498db)' 
        : (isChemistry 
            ? 'linear-gradient(135deg, #00b894, #55efc4)' 
            : 'linear-gradient(135deg, #e17055, #ff7675)'));

  const mascot = isMath ? '🦉' : (isPhysics ? '⚛️' : (isChemistry ? '🧪' : '🗣️'));
  
  // Format source badge
  const sourceLabel = exam.source || 'Thi thử';
  let sourceClass = 'mock';
  if (exam.exam_type === 'official' || sourceLabel.toLowerCase().includes('bộ')) {
    sourceClass = 'official';
  } else if (exam.exam_type === 'internal') {
    sourceClass = 'internal';
  }

  // Format difficulty color
  const diff = exam.difficulty || 'Trung bình';
  let diffBg = '#f59e0b';
  if (diff === 'Dễ') diffBg = '#22c55e';
  else if (diff === 'Khó') diffBg = '#ef4444';

  return (
    <div className="exam-paper-card animate-in">
      <div className="exam-paper-header" style={{ background: cardHeaderBg }}>
        <span className={`source-badge ${sourceClass}`}>
          {sourceLabel}
        </span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span className="exam-paper-difficulty" style={{ background: diffBg }}>{diff}</span>
          <span style={{ fontSize: '18px' }}>{mascot}</span>
        </div>
      </div>

      <div className="exam-paper-body">
        <span className="exam-paper-subject" style={{ color: 'var(--exams-purple)' }}>
          {exam.exam_subjects?.name || (isMath ? 'Toán học' : (isPhysics ? 'Vật lý' : (isChemistry ? 'Hóa học' : 'Tiếng Anh')))}
        </span>
        
        <h4 className="exam-paper-title" title={exam.title}>{exam.title}</h4>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {exam.year && <span className="badge-pill" style={{ background: 'var(--bg-main)', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 'bold' }}>Năm {exam.year}</span>}
          {exam.exam_code && <span className="badge-pill" style={{ background: 'var(--bg-main)', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 'bold' }}>Mã đề: {exam.exam_code}</span>}
        </div>
        
        <div className="exam-paper-info-grid">
          <div className="info-item">⏱ {exam.duration_minutes || 90} phút</div>
          <div className="info-item">📝 {exam.total_questions || 50} câu</div>
          <div className="info-item" style={{ gridColumn: 'span 2' }}>👥 {exam.attempts_count || Math.floor(Math.random() * 3000 + 1000)} lượt làm bài</div>
        </div>
      </div>

      <div className="exam-paper-footer">
        <button 
          className="btn-outline" 
          onClick={() => onSelect(exam.id)}
          style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
        >
          Chi tiết 🔎
        </button>
        <button 
          className="btn-primary" 
          onClick={() => onStart(exam.id)}
          style={{ background: 'var(--exams-purple)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
        >
          Làm bài ngay ⚡
        </button>
      </div>
    </div>
  );
}
