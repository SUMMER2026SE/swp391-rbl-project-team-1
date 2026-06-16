import React from 'react';

const ACCURACY_COLOR = (acc) => {
  if (acc >= 0.8) return '#00b894';
  if (acc >= 0.6) return '#f39c12';
  return '#e17055';
};

const ACCURACY_LABEL = (acc) => {
  if (acc >= 0.8) return 'Tốt';
  if (acc >= 0.6) return 'Khá';
  if (acc >= 0.4) return 'Yếu';
  return 'Kém';
};

export default function TopicAnalysisChart({ topicStats = {} }) {
  const topics = Object.entries(topicStats)
    .map(([name, s]) => ({ name, ...s }))
    .sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));

  if (topics.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
        Chưa có dữ liệu phân tích chủ đề
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {topics.map((t) => {
        const pct = Math.round((t.accuracy || 0) * 100);
        const color = ACCURACY_COLOR(t.accuracy || 0);
        return (
          <div key={t.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.name}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {t.correct}/{t.total} câu
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: '700', color,
                  background: `${color}18`, padding: '2px 7px',
                  borderRadius: '10px', border: `1px solid ${color}40`
                }}>
                  {pct}% · {ACCURACY_LABEL(t.accuracy || 0)}
                </span>
              </div>
            </div>
            <div style={{ height: '8px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: color,
                borderRadius: '99px',
                transition: 'width 0.6s ease'
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
