import React, { useState } from 'react';

const DAY_COLORS = ['#6c5ce7', '#00b894', '#0984e3', '#e17055', '#f39c12', '#a29bfe', '#fd79a8'];

export default function AiCoachCard({ coachPlan, onGenerateCoach, isGenerating = false }) {
  const [expandedDay, setExpandedDay] = useState(1);

  if (!coachPlan && !isGenerating) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>🤖</div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px' }}>
            AI Coach chưa được kích hoạt
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '360px' }}>
            AI sẽ phân tích điểm mạnh/yếu và tạo kế hoạch học 7 ngày cá nhân hóa theo kết quả thi của bạn.
          </div>
        </div>
        {onGenerateCoach && (
          <button
            className="btn-primary"
            onClick={onGenerateCoach}
            style={{ padding: '11px 28px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '13.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            ✨ Tạo kế hoạch AI Coach
          </button>
        )}
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 24px', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '36px', animation: 'pulse 1.5s infinite alternate' }}>🤖</div>
        <p style={{ marginTop: '14px', fontSize: '13px', fontWeight: '600' }}>AI đang phân tích kết quả thi và tạo kế hoạch học...</p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>Thường mất 5-15 giây</p>
      </div>
    );
  }

  const { summary, strengths = [], weaknesses = [], priority_topics = [], study_plan = [], motivational_message } = coachPlan;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Summary */}
      <div style={{ padding: '16px 18px', background: 'var(--primary-bg)', border: '1px solid var(--primary-light)', borderRadius: '14px', display: 'flex', gap: '12px' }}>
        <span style={{ fontSize: '24px', flexShrink: 0, marginTop: '2px' }}>🤖</span>
        <div>
          <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--primary)', marginBottom: '6px' }}>Nhận xét từ AI Coach</div>
          <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.7, margin: 0 }}>{summary}</p>
        </div>
      </div>

      {/* Strengths + Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ padding: '14px 16px', background: '#00b89410', border: '1px solid #00b89430', borderRadius: '12px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#00b894', marginBottom: '10px' }}>💪 Điểm mạnh</div>
            {strengths.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {strengths.map((s, i) => (
                  <div key={i} style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#00b894', flexShrink: 0 }}>✓</span> {s}
                  </div>
                ))}
              </div>
            ) : <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chưa xác định</div>}
          </div>

          <div style={{ padding: '14px 16px', background: '#e1705510', border: '1px solid #e1705530', borderRadius: '12px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#e17055', marginBottom: '10px' }}>📚 Cần ôn luyện</div>
            {weaknesses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {weaknesses.map((w, i) => (
                  <div key={i} style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#e17055', flexShrink: 0 }}>!</span> {w}
                  </div>
                ))}
              </div>
            ) : <div style={{ fontSize: '12px', color: '#00b894' }}>Tất cả chủ đề đều tốt!</div>}
          </div>
        </div>
      )}

      {/* Priority topics */}
      {priority_topics.length > 0 && (
        <div>
          <div style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '10px' }}>🎯 Ưu tiên học ngay</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {priority_topics.map((t, i) => (
              <span key={i} style={{
                fontSize: '12px', fontWeight: '600', padding: '5px 12px',
                background: 'var(--primary-bg)', color: 'var(--primary)',
                border: '1px solid var(--primary-light)', borderRadius: '99px'
              }}>
                #{i + 1} {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 7-day study plan */}
      {study_plan.length > 0 && (
        <div>
          <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px' }}>
            📅 Kế hoạch học 7 ngày
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {study_plan.map((day) => {
              const color = DAY_COLORS[(day.day - 1) % DAY_COLORS.length];
              const isExpanded = expandedDay === day.day;
              return (
                <div
                  key={day.day}
                  style={{
                    border: `1.5px solid ${isExpanded ? color : 'var(--border)'}`,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                    style={{
                      width: '100%', background: isExpanded ? `${color}12` : 'transparent',
                      border: 'none', cursor: 'pointer',
                      padding: '12px 16px',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: color, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: '800', flexShrink: 0
                    }}>
                      {day.day}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        Ngày {day.day}: {day.focus}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        🎯 {day.goal}
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </button>

                  {isExpanded && day.tasks && (
                    <div style={{ padding: '4px 16px 14px 56px', borderTop: `1px solid ${color}30` }}>
                      {day.tasks.map((task, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '8px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          <span style={{ color, flexShrink: 0, marginTop: '2px' }}>›</span>
                          {task}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Motivational message */}
      {motivational_message && (
        <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, #6c5ce710, #a29bfe18)', border: '1px solid #6c5ce730', borderRadius: '12px', fontSize: '13px', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.6 }}>
          ✨ {motivational_message}
        </div>
      )}
    </div>
  );
}
