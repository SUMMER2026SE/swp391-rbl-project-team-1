import React from 'react';
import { HiFilter, HiBookOpen, HiClock, HiLightningBolt } from 'react-icons/hi';

export default function LearningFilters({ filters, onFilterChange }) {
  return (
    <div style={{
      background: 'var(--bg-card, #ffffff)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '16px 20px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'var(--exams-purple-bg, rgba(108, 92, 231, 0.1))',
          color: 'var(--exams-purple, #6c5ce7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px'
        }}>
          <HiFilter />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Bộ lọc phân tích dữ liệu AI
          </h4>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Tối ưu hóa báo cáo năng lực theo tiêu chí chọn
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Subject Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-main, #f8fafc)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <HiBookOpen style={{ color: 'var(--exams-purple)' }} />
          <select
            value={filters.subject}
            onChange={(e) => onFilterChange({ ...filters, subject: e.target.value })}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="math">Toán học</option>
            <option value="physics">Vật lý</option>
            <option value="chemistry">Hóa học</option>
            <option value="biology">Sinh học</option>
            <option value="english">Tiếng Anh</option>
            <option value="literature">Ngữ văn</option>
          </select>
        </div>

        {/* Time Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-main, #f8fafc)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <HiClock style={{ color: 'var(--exams-blue, #0984e3)' }} />
          <select
            value={filters.timeRange}
            onChange={(e) => onFilterChange({ ...filters, timeRange: e.target.value })}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
            <option value="all">Tất cả thời gian</option>
          </select>
        </div>

        {/* Learning Source Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-main, #f8fafc)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <HiLightningBolt style={{ color: 'var(--exams-orange, #fdcb6e)' }} />
          <select
            value={filters.source}
            onChange={(e) => onFilterChange({ ...filters, source: e.target.value })}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">Tất cả nguồn thi</option>
            <option value="official">Đề thi chính thức</option>
            <option value="practice">Đề thi trường chuyên</option>
            <option value="ai">AI tạo tự động</option>
          </select>
        </div>
      </div>
    </div>
  );
}
