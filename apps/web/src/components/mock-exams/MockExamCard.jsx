import React from 'react';
import { 
  HiCalendar, 
  HiClock, 
  HiUsers, 
  HiClipboardList, 
  HiLightningBolt 
} from 'react-icons/hi';
import { FaCalculator, FaGlobe, FaAtom, FaFlask } from 'react-icons/fa';

const SUBJECT_HEADER_BG = {
  1: 'linear-gradient(135deg, #6c5ce7, #8e7cf8)',
  2: 'linear-gradient(135deg, #e17055, #ff7675)',
  3: 'linear-gradient(135deg, #0984e3, #3498db)',
  4: 'linear-gradient(135deg, #00b894, #55efc4)',
};

const SUBJECT_ICONS = {
  1: FaCalculator,
  2: FaGlobe,
  3: FaAtom,
  4: FaFlask
};

function formatAttempts(n) {
  if (!n) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function MockExamCard({ exam, onSelect, onStart }) {
  const sid = exam.subject_id;
  const cardHeaderBg = SUBJECT_HEADER_BG[sid] || 'linear-gradient(135deg, #6c5ce7, #8e7cf8)';
  const SubjectIcon = SUBJECT_ICONS[sid] || HiClipboardList;

  const sourceLabel = exam.source || 'Thi thử';
  let sourceClass = 'mock';
  if (exam.exam_type === 'official' || sourceLabel.toLowerCase().includes('bộ')) {
    sourceClass = 'official';
  } else if (exam.exam_type === 'internal') {
    sourceClass = 'internal';
  }

  const diff = exam.difficulty || 'Trung bình';
  let diffColor = '#f59e0b';
  if (diff === 'Dễ') diffColor = '#22c55e';
  else if (diff === 'Khó') diffColor = '#ef4444';

  const attempts = exam.attempts_count || Math.floor(Math.random() * 3000 + 1000);
  const isHot = attempts > 2000;
  const isNew = exam.year === 2024;

  const subjectName =
    exam.exam_subjects?.name ||
    (sid === 1 ? 'Toán học' : sid === 2 ? 'Tiếng Anh' : sid === 3 ? 'Vật lý' : 'Hóa học');

  return (
    <div className="exam-paper-card animate-in">
      {/* ── Colored header ── */}
      <div className="exam-paper-header" style={{ background: cardHeaderBg }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className={`source-badge ${sourceClass}`}>{sourceLabel}</span>
          {isNew && !isHot && <span className="exam-badge-new">Mới</span>}
          {isHot && (
            <span className="exam-badge-hot" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <HiLightningBolt style={{ fontSize: '11px' }} /> Hot
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 800,
              background: diffColor,
              color: '#fff',
              padding: '3px 9px',
              borderRadius: '6px',
            }}
          >
            {diff}
          </span>
          <SubjectIcon 
            style={{
              fontSize: '18px',
              color: '#fff',
            }}
          />
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="exam-paper-body">
        <span className="exam-paper-subject" style={{ color: 'var(--exams-purple)' }}>
          {subjectName}
        </span>

        <h4 className="exam-paper-title" title={exam.title}>{exam.title}</h4>

        {/* Year + exam code tags */}
        <div className="exam-paper-meta-row">
          {exam.year && (
            <span className="exam-meta-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <HiCalendar /> Năm {exam.year}
            </span>
          )}
          {exam.exam_code && (
            <span className="exam-meta-tag">Mã: {exam.exam_code}</span>
          )}
        </div>

        {/* Stats: time, questions, attempts, source */}
        <div className="exam-stats-grid-v2">
          <div className="exam-stat-v2">
            <span className="exam-stat-v2-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <HiClock style={{ color: 'var(--text-secondary)' }} /> {exam.duration_minutes || 90}′
            </span>
            <span className="exam-stat-v2-lbl">Thời gian</span>
          </div>
          <div className="exam-stat-v2">
            <span className="exam-stat-v2-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <HiClipboardList style={{ color: 'var(--text-secondary)' }} /> {exam.total_questions || 50}
            </span>
            <span className="exam-stat-v2-lbl">Câu hỏi</span>
          </div>
          <div className="exam-stat-v2">
            <span className="exam-stat-v2-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <HiUsers style={{ color: 'var(--text-secondary)' }} /> {formatAttempts(attempts)}
            </span>
            <span className="exam-stat-v2-lbl">Lượt làm</span>
          </div>
          <div className="exam-stat-v2">
            <span
              className="exam-stat-v2-val"
              style={{ color: diffColor, fontSize: '13px', fontWeight: 800 }}
            >
              ● {diff}
            </span>
            <span className="exam-stat-v2-lbl">Độ khó</span>
          </div>
        </div>
      </div>

      {/* ── Footer CTA ── */}
      <div className="exam-paper-footer">
        <button className="exam-btn-detail" onClick={() => onSelect(exam.id)}>
          Xem chi tiết
        </button>
        <button className="exam-btn-start" onClick={() => onStart(exam.id)}>
          Làm bài ngay ⚡
        </button>
      </div>
    </div>
  );
}
