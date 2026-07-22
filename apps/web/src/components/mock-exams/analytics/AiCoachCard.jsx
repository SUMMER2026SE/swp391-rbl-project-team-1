import React from 'react';
import { HiSparkles, HiLightBulb } from 'react-icons/hi';

export default function AiCoachCard({ insights }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.08) 0%, rgba(9, 132, 227, 0.08) 100%)',
      border: '1.5px solid rgba(108, 92, 231, 0.25)',
      borderRadius: '16px',
      padding: '22px',
      marginBottom: '28px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'var(--exams-purple)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            <HiSparkles />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)' }}>
              AI COACH & HƯỚNG DẪN LỘ TRÌNH THÔNG MINH
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Đề xuất cá nhân hóa tự động dựa trên hành vi làm bài của bạn
            </span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '14px'
      }}>
        {insights.map((item) => (
          <div
            key={item.id}
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <span style={{ fontSize: '24px', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {item.title}
              </h4>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
