import React from 'react';
import { 
  HiClock, 
  HiUsers, 
  HiClipboardList, 
  HiChevronRight
} from 'react-icons/hi';
import { FaCalculator, FaGlobe, FaAtom, FaFlask, FaPencilAlt } from 'react-icons/fa';

function formatAttempts(n) {
  if (!n) return '1.2k';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const SUBJECT_CONFIG = {
  1: { name: 'Toán học', color: '#6c5ce7', bg: 'rgba(108, 92, 231, 0.1)', gradient: 'linear-gradient(135deg, #6c5ce7, #8c7ae6)', icon: FaCalculator },
  2: { name: 'Tiếng Anh', color: '#e84393', bg: 'rgba(232, 67, 147, 0.1)', gradient: 'linear-gradient(135deg, #e84393, #fd79a8)', icon: FaGlobe },
  3: { name: 'Vật lý', color: '#0984e3', bg: 'rgba(9, 132, 227, 0.1)', gradient: 'linear-gradient(135deg, #0984e3, #74b9ff)', icon: FaAtom },
  4: { name: 'Hóa học', color: '#00b894', bg: 'rgba(0, 184, 148, 0.1)', gradient: 'linear-gradient(135deg, #00b894, #55efc4)', icon: FaFlask },
};

export default function MockExamCard({ exam, onSelect, onStart }) {
  const sid = exam.subject_id || 1;
  const config = SUBJECT_CONFIG[sid] || {
    name: exam.exam_subjects?.name || 'Môn học',
    color: '#6c5ce7',
    bg: 'rgba(108, 92, 231, 0.1)',
    gradient: 'linear-gradient(135deg, #6c5ce7, #8c7ae6)',
    icon: FaCalculator
  };

  const IconComp = config.icon;
  const titleLower = (exam.title || '').toLowerCase();
  const isOfficial = 
    exam.source === 'OFFICIAL' || 
    exam.source === 'Đề chính thức' || 
    exam.exam_type === 'official' || 
    exam.category === 'OFFICIAL' ||
    titleLower.includes('mã đề') || 
    titleLower.includes('thpt') || 
    titleLower.includes('chính thức');
  const sourceLabel = isOfficial ? 'Đề chính thức' : 'Edupath';
  const attempts = exam.attempts_count || Math.floor(Math.random() * 2000 + 1000);
  const questionCount = exam.total_questions || exam.questions_count || 22;
  const duration = exam.duration_minutes || 90;

  return (
    <div className="modern-exam-card animate-in" style={{ '--subject-color': config.color, '--subject-gradient': config.gradient }}>
      {/* Top Gradient accent line */}
      <div className="modern-card-top-bar" />

      <div className="modern-card-inner">
        {/* Header Badges */}
        <div className="modern-card-header">
          <div className="modern-card-subject-badge" style={{ background: config.bg, color: config.color }}>
            <IconComp style={{ fontSize: '13px' }} />
            <span>{config.name}</span>
          </div>

          <span className="modern-card-type-badge">
            {sourceLabel}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="modern-card-title" title={exam.title}>
          {exam.title}
        </h3>

        {/* Meta Pills (Time, Questions, Attempts) */}
        <div className="modern-card-meta-grid">
          <div className="modern-meta-pill">
            <HiClock className="meta-icon" />
            <span>{duration} phút</span>
          </div>
          <div className="modern-meta-pill">
            <HiClipboardList className="meta-icon" />
            <span>{questionCount} câu</span>
          </div>
          <div className="modern-meta-pill">
            <HiUsers className="meta-icon" />
            <span>{formatAttempts(attempts)} lượt</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modern-card-actions">
          <button 
            type="button"
            className="modern-btn-secondary" 
            onClick={() => onSelect(exam.id)}
          >
            <FaPencilAlt style={{ fontSize: '11px' }} />
            <span>Luyện tập</span>
          </button>

          <button 
            type="button"
            className="modern-btn-primary" 
            onClick={() => onStart(exam.id)}
            style={{ background: config.gradient }}
          >
            <span>Thi thật</span>
            <HiChevronRight style={{ fontSize: '15px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
