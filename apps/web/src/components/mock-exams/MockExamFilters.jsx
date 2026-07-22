import React from 'react';
import { 
  HiSearch, 
  HiCalendar, 
  HiBookOpen, 
  HiX,
  HiAcademicCap
} from 'react-icons/hi';
import { FaCalculator, FaGlobe, FaAtom, FaFlask } from 'react-icons/fa';

const SUBJECT_ICONS = {
  1: FaCalculator,
  2: FaGlobe,
  3: FaAtom,
  4: FaFlask
};

export default function MockExamFilters({ filters, onFilterChange, subjects, subjectCounts = {} }) {
  const years = ['All', '2026', '2025', '2024', '2023', '2022', '2021', '2020'];

  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleSubjectClick = (subId) => {
    onFilterChange({ ...filters, subjectId: subId });
  };

  const handleYearClick = (year) => {
    onFilterChange({ ...filters, year });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      marginBottom: '32px',
      background: 'var(--bg-card, #ffffff)',
      padding: '24px',
      borderRadius: '20px',
      border: '1.5px solid var(--border, #e2e8f0)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
    }}>
      {/* Search Input Bar */}
      <div style={{ position: 'relative', width: '100%' }}>
        <input 
          type="text" 
          placeholder="Tìm kiếm tên đề thi, mã đề, môn học, năm thi..." 
          value={filters.search || ''} 
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '12px 42px 12px 44px',
            fontSize: '14px',
            borderRadius: '14px',
            border: '1.5px solid var(--border, #cbd5e1)',
            background: 'var(--bg-main, #f8fafc)',
            color: 'var(--text-primary, #0f172a)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
            fontWeight: '500'
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--exams-purple)'; e.target.style.boxShadow = '0 0 0 3px rgba(108, 92, 231, 0.15)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        />
        <HiSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '18px', opacity: 0.6 }} />
        {filters.search && (
          <button 
            type="button"
            onClick={() => onFilterChange({ ...filters, search: '' })}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'var(--bg-card)',
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <HiX />
          </button>
        )}
      </div>

      {/* Subject Filter Row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: '90px' }}>
          <HiBookOpen style={{ color: 'var(--exams-purple)' }} /> Môn học:
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
          <button
            type="button"
            onClick={() => handleSubjectClick('All')}
            style={{
              padding: '6px 14px',
              fontSize: '12.5px',
              borderRadius: '100px',
              border: filters.subjectId === 'All' ? 'none' : '1px solid var(--border)',
              background: filters.subjectId === 'All' ? 'linear-gradient(135deg, #6c5ce7 0%, #4f46e5 100%)' : 'var(--bg-main)',
              color: filters.subjectId === 'All' ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: '700',
              boxShadow: filters.subjectId === 'All' ? '0 3px 10px rgba(108, 92, 231, 0.25)' : 'none',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Tất cả môn</span>
            <span style={{
              fontSize: '11px',
              fontWeight: '800',
              padding: '1px 7px',
              borderRadius: '100px',
              background: filters.subjectId === 'All' ? 'rgba(255,255,255,0.25)' : 'rgba(108, 92, 231, 0.12)',
              color: filters.subjectId === 'All' ? '#ffffff' : 'var(--exams-purple)',
            }}>
              {subjectCounts['All'] || 0}
            </span>
          </button>
          {subjects.map(sub => {
            const isSelected = String(filters.subjectId) === String(sub.id);
            const SubIcon = SUBJECT_ICONS[sub.id] || HiBookOpen;
            const count = subjectCounts[sub.id] ?? subjectCounts[sub.name] ?? 0;
            return (
              <button
                type="button"
                key={sub.id}
                onClick={() => handleSubjectClick(sub.id)}
                style={{
                  padding: '6px 14px',
                  fontSize: '12.5px',
                  borderRadius: '100px',
                  border: isSelected ? 'none' : '1px solid var(--border)',
                  background: isSelected ? 'linear-gradient(135deg, #6c5ce7 0%, #4f46e5 100%)' : 'var(--bg-main)',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: '700',
                  boxShadow: isSelected ? '0 3px 10px rgba(108, 92, 231, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <SubIcon style={{ fontSize: '13px' }} /> 
                <span>{sub.name}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '1px 7px',
                  borderRadius: '100px',
                  background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(108, 92, 231, 0.12)',
                  color: isSelected ? '#ffffff' : 'var(--exams-purple)',
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Year Filter Row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: '90px' }}>
          <HiCalendar style={{ color: 'var(--exams-blue)' }} /> Năm thi:
        </span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
          {years.map(year => {
            const isActive = filters.year === year;
            return (
              <button
                type="button"
                key={year}
                onClick={() => handleYearClick(year)}
                style={{
                  padding: '5px 13px',
                  fontSize: '12px',
                  fontWeight: '700',
                  borderRadius: '100px',
                  border: isActive ? 'none' : '1px solid var(--border)',
                  background: isActive ? 'linear-gradient(135deg, #0984e3 0%, #74b9ff 100%)' : 'var(--bg-main)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 3px 10px rgba(9, 132, 227, 0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {year === 'All' ? 'Tất cả' : year}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade Filter Row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: '90px' }}>
          <HiAcademicCap style={{ color: 'var(--exams-green)' }} /> Khối lớp:
        </span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
          {[
            { value: 'All', label: 'Tất cả lớp' },
            { value: '10', label: 'Lớp 10' },
            { value: '11', label: 'Lớp 11' },
            { value: '12', label: 'Lớp 12' }
          ].map(g => {
            const isActive = (filters.grade || 'All') === g.value;
            return (
              <button
                type="button"
                key={g.value}
                onClick={() => onFilterChange({ ...filters, grade: g.value })}
                style={{
                  padding: '5px 13px',
                  fontSize: '12px',
                  fontWeight: '700',
                  borderRadius: '100px',
                  border: isActive ? 'none' : '1px solid var(--border)',
                  background: isActive ? 'linear-gradient(135deg, #00b894 0%, #55efc4 100%)' : 'var(--bg-main)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 3px 10px rgba(0, 184, 148, 0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
