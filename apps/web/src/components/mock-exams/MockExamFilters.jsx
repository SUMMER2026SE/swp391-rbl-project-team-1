import React from 'react';

export default function MockExamFilters({ filters, onFilterChange, subjects }) {
  const years = ['All', '2024', '2023', '2022', '2021', '2020'];
  const categories = [
    { value: 'All', label: '🗂️ Tất cả' },
    { value: 'official', label: '📌 Đề chính thức' },
    { value: 'mock', label: '🏫 Đề Trường Chuyên' },
    { value: 'internal', label: '🎯 Đề Nội bộ' }
  ];

  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleSubjectClick = (subId) => {
    onFilterChange({ ...filters, subjectId: subId });
  };

  const handleYearClick = (year) => {
    onFilterChange({ ...filters, year });
  };

  const handleCategoryClick = (catVal) => {
    onFilterChange({ ...filters, examType: catVal });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px', background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
      {/* Search Input and Category Selector */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1', minWidth: '280px', position: 'relative' }}>
          <input 
            type="text" 
            placeholder="🔍 Tìm kiếm tên đề thi, mã đề, năm học..." 
            value={filters.search || ''} 
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '10px 16px 10px 36px',
              fontSize: '13.5px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'var(--bg-main)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-sm)',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>🔍</span>
          {filters.search && (
            <button 
              onClick={() => onFilterChange({ ...filters, search: '' })}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontSize: '13px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category filtering tags */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map(cat => {
            const isActive = filters.examType === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                style={{
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  borderRadius: '10px',
                  border: isActive ? '1px solid var(--exams-purple)' : '1px solid var(--border)',
                  background: isActive ? 'var(--exams-purple)' : 'var(--bg-main)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject tags selection row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>📚 Môn học:</span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleSubjectClick('All')}
            className={filters.subjectId === 'All' ? 'active' : ''}
            style={{
              padding: '6px 12px',
              fontSize: '12.5px',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              background: filters.subjectId === 'All' ? 'var(--exams-purple)' : 'var(--bg-main)',
              color: filters.subjectId === 'All' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            Tất cả môn
          </button>
          {subjects.map(sub => {
            const isSelected = String(filters.subjectId) === String(sub.id);
            return (
              <button
                key={sub.id}
                onClick={() => handleSubjectClick(sub.id)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12.5px',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  background: isSelected ? 'var(--exams-purple)' : 'var(--bg-main)',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                {sub.icon} {sub.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Year selection tags */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>🗓️ Năm thi:</span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {years.map(year => {
            const isActive = filters.year === year;
            return (
              <button
                key={year}
                onClick={() => handleYearClick(year)}
                style={{
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '20px',
                  border: isActive ? '1px solid var(--exams-purple)' : '1px solid var(--border)',
                  background: isActive ? 'var(--exams-purple)' : 'var(--bg-main)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {year === 'All' ? 'Tất cả' : year}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
