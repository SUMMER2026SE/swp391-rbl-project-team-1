import React, { useState } from 'react';

const EVENT_CONFIG = {
  VIEW_QUESTION: { icon: '👁️', label: 'Xem câu hỏi', color: '#0984e3' },
  SELECT_ANSWER: { icon: '✅', label: 'Chọn đáp án', color: '#00b894' },
  CHANGE_ANSWER: { icon: '🔄', label: 'Đổi đáp án', color: '#6c5ce7' },
  BOOKMARK: { icon: '🔖', label: 'Đánh dấu câu', color: '#f39c12' },
  TAB_SWITCH: { icon: '⚠️', label: 'Rời tab', color: '#e17055' },
  FULLSCREEN_EXIT: { icon: '🖥️', label: 'Thoát full màn hình', color: '#e17055' },
  COPY_PASTE: { icon: '📋', label: 'Copy/Paste', color: '#d63031' },
  SUBMIT: { icon: '📨', label: 'Nộp bài', color: '#00b894' }
};

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatRelative(dateStr, startDateStr) {
  const ms = new Date(dateStr) - new Date(startDateStr);
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `+${m}:${String(s).padStart(2, '0')}`;
}

export default function ExamReplayTimeline({ events = [], startedAt, loading = false }) {
  const [filterType, setFilterType] = useState('ALL');

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
        <div style={{ fontSize: '24px', animation: 'pulse 1.5s infinite alternate' }}>⏳</div>
        <p style={{ marginTop: '10px' }}>Đang tải lịch sử làm bài...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📼</div>
        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Chưa có dữ liệu replay</div>
        <div style={{ fontSize: '12px' }}>Tính năng Exam Replay sẽ ghi lại hành động trong các lần thi tiếp theo</div>
      </div>
    );
  }

  const eventTypes = ['ALL', ...new Set(events.map(e => e.eventType))];
  const filtered = filterType === 'ALL' ? events : events.filter(e => e.eventType === filterType);

  const violations = events.filter(e => ['TAB_SWITCH', 'FULLSCREEN_EXIT', 'COPY_PASTE'].includes(e.eventType));
  const answers = events.filter(e => e.eventType === 'SELECT_ANSWER');
  const changes = events.filter(e => e.eventType === 'CHANGE_ANSWER');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary stats */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '100px', padding: '10px 14px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{events.length}</div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Tổng hành động</div>
        </div>
        <div style={{ flex: 1, minWidth: '100px', padding: '10px 14px', background: '#00b89410', border: '1px solid #00b89430', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#00b894' }}>{answers.length}</div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Lần chọn đáp án</div>
        </div>
        <div style={{ flex: 1, minWidth: '100px', padding: '10px 14px', background: '#6c5ce710', border: '1px solid #6c5ce730', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#6c5ce7' }}>{changes.length}</div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Lần đổi đáp án</div>
        </div>
        <div style={{ flex: 1, minWidth: '100px', padding: '10px 14px', background: violations.length > 0 ? '#e1705510' : 'var(--bg-main)', border: `1px solid ${violations.length > 0 ? '#e1705530' : 'var(--border)'}`, borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: '800', color: violations.length > 0 ? '#e17055' : 'var(--text-primary)' }}>{violations.length}</div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Vi phạm</div>
        </div>
      </div>

      {/* Event type filter */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {eventTypes.map(type => {
          const cfg = type === 'ALL' ? { icon: '📋', label: 'Tất cả', color: 'var(--primary)' } : EVENT_CONFIG[type] || { icon: '•', label: type, color: 'var(--text-muted)' };
          const isActive = filterType === type;
          return (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '5px 12px', borderRadius: '99px', border: `1px solid ${isActive ? cfg.color : 'var(--border)'}`,
                background: isActive ? `${cfg.color}18` : 'transparent',
                color: isActive ? cfg.color : 'var(--text-secondary)',
                fontSize: '11.5px', fontWeight: isActive ? '700' : '500', cursor: 'pointer'
              }}
            >
              {cfg.icon} {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: '20px' }}>
        <div style={{ position: 'absolute', left: '7px', top: 0, bottom: 0, width: '2px', background: 'var(--border)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((event, idx) => {
            const cfg = EVENT_CONFIG[event.eventType] || { icon: '•', label: event.eventType, color: 'var(--text-muted)' };
            const payload = event.payload || {};
            const isViolation = ['TAB_SWITCH', 'FULLSCREEN_EXIT', 'COPY_PASTE'].includes(event.eventType);

            return (
              <div key={event.id || idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: '-16px', top: '6px',
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: cfg.color, border: '2px solid var(--bg-card)',
                  flexShrink: 0
                }} />

                <div style={{
                  flex: 1, padding: '9px 12px',
                  background: isViolation ? '#e1705508' : 'var(--bg-main)',
                  border: `1px solid ${isViolation ? '#e1705530' : 'var(--border)'}`,
                  borderRadius: '10px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ fontSize: '14px', flexShrink: 0 }}>{cfg.icon}</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: cfg.color }}>{cfg.label}</div>
                      {event.questionId && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Câu {event.questionId}{payload.answer ? ` → chọn ${payload.answer}` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatTime(event.createdAt)}</div>
                    {startedAt && (
                      <div style={{ fontSize: '10.5px', color: cfg.color, fontWeight: '600' }}>
                        {formatRelative(event.createdAt, startedAt)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
