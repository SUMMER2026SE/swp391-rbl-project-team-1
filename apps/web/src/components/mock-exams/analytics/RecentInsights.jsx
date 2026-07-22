import React from 'react';
import { HiClock } from 'react-icons/hi';

export default function RecentInsights({ insights }) {
  return (
    <div style={{
      background: 'var(--bg-card, #ffffff)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '22px',
      marginBottom: '28px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiClock style={{ color: 'var(--exams-blue)' }} /> NHẬT KÝ SỰ KIỆN & PHÁT HIỆN GẦN ĐÂY (AI TIMELINE)
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Dòng thời gian ghi nhận các cột mốc và sự kiện học tập mới nhất
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
        {insights.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'var(--bg-main, #f8fafc)',
              border: '1px solid var(--border)',
              transition: 'transform 0.15s'
            }}
          >
            <div style={{
              fontSize: '22px',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--bg-card, #ffffff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              flexShrink: 0
            }}>
              {item.icon}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: item.badgeColor ? `${item.badgeColor}18` : 'rgba(108, 92, 231, 0.12)',
                  color: item.badgeColor || 'var(--exams-purple)'
                }}>
                  {item.badge}
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '700' }}>
                  {item.timestamp}
                </span>
              </div>

              <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {item.title}
              </h4>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
