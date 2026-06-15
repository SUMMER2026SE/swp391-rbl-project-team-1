import React from 'react';
import { 
  HiSearch, 
  HiCalendar, 
  HiBookOpen, 
  HiX,
  HiOutlineFolderOpen,
  HiShieldCheck,
  HiAcademicCap,
  HiLightningBolt
} from 'react-icons/hi';
import { FaCalculator, FaGlobe, FaAtom, FaFlask } from 'react-icons/fa';

const SUBJECT_ICONS = {
  1: FaCalculator,
  2: FaGlobe,
  3: FaAtom,
  4: FaFlask
};

export default function MockExamFilters({ filters, onFilterChange, subjects }) {
  const years = ['All', '2024', '2023', '2022', '2021', '2020'];
  
  const categories = [
    { value: 'All', label: 'Tất cả', icon: HiOutlineFolderOpen },
    { value: 'official', label: 'Đề chính thức', icon: HiShieldCheck },
    { value: 'mock', label: 'Đề Trường Chuyên', icon: HiAcademicCap },
    { value: 'internal', label: 'Đề Nội bộ', icon: HiLightningBolt }
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
            placeholder="Tìm kiếm tên đề thi, mã đề, năm học..." 
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
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
          />
          <HiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', opacity: 0.6 }} />
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
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px'
              }}
            >
              <HiX />
            </button>
          )}
        </div>

        {/* Category filtering tags */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {categories.map(cat => {
            const isActive = filters.examType === cat.value;
            const CatIcon = cat.icon;
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
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CatIcon style={{ fontSize: '15px' }} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subject tags selection row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <HiBookOpen /> Môn học:
        </span>
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
            const SubIcon = SUBJECT_ICONS[sub.id] || HiBookOpen;
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
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <SubIcon style={{ fontSize: '13px' }} /> {sub.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Year selection tags */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <HiCalendar /> Năm thi:
        </span>
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
