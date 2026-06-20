import React from 'react';

const DIFF_CONFIG = {
  EASY: { label: 'Dễ', color: '#00b894', bg: '#00b89420', icon: '🟢' },
  MEDIUM: { label: 'Trung bình', color: '#f39c12', bg: '#f39c1220', icon: '🟡' },
  HARD: { label: 'Khó', color: '#e17055', bg: '#e1705520', icon: '🔴' }
};

function DonutRing({ pct, color, size = 64, strokeWidth = 7 }) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const cx = size / 2;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

export default function DifficultyChart({ difficultyStats = {} }) {
  const hasData = Object.values(difficultyStats).some(s => s.total > 0);

  if (!hasData) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
        Chưa có dữ liệu phân tích độ khó
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {Object.entries(DIFF_CONFIG).map(([key, cfg]) => {
        const s = difficultyStats[key] || { total: 0, correct: 0, accuracy: 0 };
        if (s.total === 0) return null;
        const pct = Math.round((s.accuracy || 0) * 100);
        return (
          <div key={key} style={{
            flex: '1', minWidth: '130px',
            background: cfg.bg,
            border: `1.5px solid ${cfg.color}40`,
            borderRadius: '14px', padding: '16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'
          }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DonutRing pct={pct} color={cfg.color} size={72} strokeWidth={8} />
              <div style={{ position: 'absolute', fontSize: '15px', fontWeight: '800', color: cfg.color }}>
                {pct}%
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {cfg.icon} {cfg.label}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {s.correct}/{s.total} câu đúng
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {s.total - s.correct} câu cần cải thiện
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
