import React from 'react';
import { HiCalendar } from 'react-icons/hi';

export default function StudyHeatmap({ heatmapData }) {
  const getLevelColor = (level) => {
    switch (level) {
      case 1: return 'rgba(108, 92, 231, 0.25)';
      case 2: return 'rgba(108, 92, 231, 0.5)';
      case 3: return 'rgba(108, 92, 231, 0.75)';
      case 4: return 'var(--exams-purple, #6c5ce7)';
      default: return 'var(--bg-main, #f1f5f9)';
    }
  };

  const totalQuestions = heatmapData.reduce((acc, curr) => acc + curr.count, 0);
  const activeDays = heatmapData.filter(item => item.count > 0).length;

  return (
    <div style={{
      background: 'var(--bg-card, #ffffff)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '22px',
      boxShadow: 'var(--shadow-sm)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HiCalendar style={{ color: 'var(--exams-purple)' }} /> TẦN SUẤT HỌC TẬP (STUDY HEATMAP)
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Theo dõi mật độ làm câu hỏi hàng ngày trong 60 ngày gần đây
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12.5px', fontWeight: '800' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            Đã hoạt động: <strong style={{ color: 'var(--exams-purple)' }}>{activeDays} / 60 ngày</strong>
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Tổng làm: <strong style={{ color: 'var(--exams-green)' }}>{totalQuestions} câu</strong>
          </span>
        </div>
      </div>

      {/* Grid cells */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(14px, 1fr))',
        gap: '6px',
        padding: '12px 0'
      }}>
        {heatmapData.map((item) => (
          <div
            key={item.date}
            title={`${item.date}: ${item.count} câu hỏi đã hoàn thành`}
            style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '4px',
              background: getLevelColor(item.level),
              border: '1px solid rgba(0,0,0,0.04)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              cursor: 'pointer'
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '10px', fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
        <span>Ít học</span>
        {[0, 1, 2, 3, 4].map(lvl => (
          <div key={lvl} style={{ width: '12px', height: '12px', borderRadius: '3px', background: getLevelColor(lvl) }} />
        ))}
        <span>Chăm chỉ</span>
      </div>
    </div>
  );
}
