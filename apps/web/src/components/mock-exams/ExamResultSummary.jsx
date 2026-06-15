import React from 'react';
import { 
  HiSparkles, 
  HiCheckCircle, 
  HiOutlineExclamation, 
  HiClock,
  HiClipboardList
} from 'react-icons/hi';

export default function ExamResultSummary({ result, durationSeconds }) {
  const score = result.score || 0;
  const correct = result.correct_count || 0;
  const wrong = result.wrong_count || 0;
  const blank = result.blank_count || 0;
  const total = result.total_questions || 10;
  const percentage = result.percentage || 0;
  const rank = result.rank_label || 'Khá';

  // Format time
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} phút ${s} giây`;
  };

  // Radial calculation
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 10) * circumference;

  let scoreColor = 'var(--exams-red)';
  let ScoreIcon = HiOutlineExclamation;
  let iconColor = 'var(--exams-red)';

  if (score >= 8.5) {
    scoreColor = 'var(--exams-green)';
    ScoreIcon = HiSparkles;
    iconColor = 'var(--exams-orange)';
  } else if (score >= 6.5) {
    scoreColor = 'var(--exams-purple)';
    ScoreIcon = HiCheckCircle;
    iconColor = 'var(--exams-purple)';
  } else if (score >= 5.0) {
    scoreColor = 'var(--exams-orange)';
    ScoreIcon = HiCheckCircle;
    iconColor = 'var(--exams-orange)';
  }

  return (
    <div className="card" style={{ padding: '28px', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', gap: '28px', alignItems: 'center' }}>
      {/* Radial score ring */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div className="results-dial-wrapper">
          <svg className="radial-score-ring">
            <circle className="radial-score-bg" cx="70" cy="70" r={radius} />
            <circle 
              className="radial-score-bar" 
              cx="70" cy="70" r={radius} 
              stroke={scoreColor}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="radial-score-text" style={{ color: scoreColor }}>
            {score.toFixed(2)}
          </div>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Điểm số đạt được</span>
      </div>

      {/* Grid status details */}
      <div style={{ flex: 1, minWidth: '240px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
              KẾT QUẢ BÀI THI THỬ
            </h3>
            <span className="badge-pill" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '10.5px', marginTop: '4px', display: 'inline-block' }}>
              Xếp loại: {rank}
            </span>
          </div>
          <ScoreIcon style={{ fontSize: '32px', color: iconColor }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px' }}>
          <div style={{ background: 'rgba(0, 184, 148, 0.06)', padding: '10px', borderRadius: '10px', borderLeft: '3px solid var(--exams-green)' }}>
            <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>CÂU ĐÚNG</span>
            <strong style={{ fontSize: '15px', color: 'var(--exams-green)' }}>{correct} câu</strong>
          </div>
          <div style={{ background: 'rgba(214, 48, 49, 0.06)', padding: '10px', borderRadius: '10px', borderLeft: '3px solid var(--exams-red)' }}>
            <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>CÂU SAI</span>
            <strong style={{ fontSize: '15px', color: 'var(--exams-red)' }}>{wrong} câu</strong>
          </div>
          <div style={{ background: 'rgba(148, 163, 184, 0.06)', padding: '10px', borderRadius: '10px', borderLeft: '3px solid #64748b' }}>
            <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>BỎ TRỐNG</span>
            <strong style={{ fontSize: '15px', color: '#64748b' }}>{blank} câu</strong>
          </div>
          <div style={{ background: 'rgba(9, 132, 227, 0.06)', padding: '10px', borderRadius: '10px', borderLeft: '3px solid var(--exams-blue)' }}>
            <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>THỜI GIAN LÀM</span>
            <strong style={{ fontSize: '13px', color: 'var(--exams-blue)' }}><HiClock style={{ verticalAlign: 'middle', marginRight: '3px' }} />{formatTime(durationSeconds)}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          <span>Tỷ lệ làm đúng: <strong>{percentage.toFixed(1)}%</strong></span>
          <span>Tổng số câu hỏi: <strong>{total} câu</strong></span>
        </div>
      </div>
    </div>
  );
}
