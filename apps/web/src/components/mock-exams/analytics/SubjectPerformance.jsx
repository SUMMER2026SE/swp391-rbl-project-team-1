import React from 'react';
import { HiBookOpen, HiChevronRight, HiCheckCircle } from 'react-icons/hi';

export default function SubjectPerformance({ subjects, selectedSubjectId, onSelectSubject }) {
  return (
    <div style={{
      background: 'var(--bg-card, #ffffff)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiBookOpen style={{ color: 'var(--exams-purple)' }} /> NĂNG LỰC THEO MÔN HỌC
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Nhấp vào từng môn để xem phân tích chi tiết từng chủ đề kiến thức
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {subjects.map((subj) => {
          const isSelected = selectedSubjectId === subj.id;
          return (
            <div
              key={subj.id}
              onClick={() => onSelectSubject(isSelected ? null : subj.id)}
              style={{
                background: isSelected ? 'rgba(108, 92, 231, 0.05)' : 'var(--bg-main, #f8fafc)',
                border: isSelected ? `2px solid ${subj.color}` : '1.5px solid var(--border)',
                borderRadius: '14px',
                padding: '16px 18px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{subj.icon}</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {subj.name}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {subj.solvedQuestions} câu đã làm
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: subj.color }}>
                    {subj.avgScore} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>/10</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    Điểm TB
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Độ chính xác:</span>
                  <span style={{ color: subj.color }}>{subj.accuracy}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${subj.accuracy}%`, 
                      height: '100%', 
                      background: subj.color, 
                      borderRadius: '4px',
                      transition: 'width 0.5s ease-out'
                    }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px dashed var(--border)', fontSize: '12px' }}>
                <span style={{ color: isSelected ? subj.color : 'var(--text-secondary)', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {isSelected ? <><HiCheckCircle /> Đang xem chi tiết</> : 'Xem chi tiết chủ đề'}
                </span>
                <HiChevronRight style={{ transform: isSelected ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: isSelected ? subj.color : 'var(--text-secondary)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
