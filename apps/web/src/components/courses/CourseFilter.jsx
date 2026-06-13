import { useState } from 'react';
import { HiSearch, HiFilter } from 'react-icons/hi';

export default function CourseFilter({ onFilterChange }) {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [level, setLevel] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const updateFilters = (changes) => {
    const updated = {
      search,
      subject,
      priceRange,
      level,
      sortBy,
      ...changes
    };
    onFilterChange(updated);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    updateFilters({ search: e.target.value });
  };

  const handleSubjectChange = (subj) => {
    setSubject(subj);
    updateFilters({ subject: subj });
  };

  const handlePriceChange = (e) => {
    setPriceRange(e.target.value);
    updateFilters({ priceRange: e.target.value });
  };

  const handleLevelChange = (lvl) => {
    setLevel(lvl);
    updateFilters({ level: lvl });
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    updateFilters({ sortBy: e.target.value });
  };

  const subjects = [
    { value: 'All', label: 'Tất cả' },
    { value: 'Toán học', label: 'Toán' },
    { value: 'Ngữ văn', label: 'Văn' },
    { value: 'Tiếng Anh', label: 'Anh' },
    { value: 'Vật lý', label: 'Lý' },
    { value: 'Hóa học', label: 'Hóa' },
    { value: 'Sinh học', label: 'Sinh' },
    { value: 'Lịch sử', label: 'Sử' },
    { value: 'Địa lý', label: 'Địa' },
    { value: 'GDCD', label: 'GDCD' }
  ];

  const levels = [
    { value: 'All', label: 'Tất cả cấp độ' },
    { value: 'Beginner', label: 'Cơ bản (Chống liệt)' },
    { value: 'Intermediate', label: 'Khá (Khóa 8+)' },
    { value: 'Advanced', label: 'Giỏi (Khóa 9+)' },
    { value: 'Sprint', label: 'Thực chiến luyện đề cấp tốc' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} className="animate-in">
      {/* Row 1: Search & Sort */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
          <HiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '18px' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm tên khóa học, giáo viên, chuyên đề ôn thi..." 
            value={search}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '10px 16px 10px 38px',
              fontSize: '13px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              outline: 'none',
              background: 'var(--bg-main)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Sort selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Sắp xếp:</span>
          <select 
            value={sortBy} 
            onChange={handleSortChange}
            className="form-control"
            style={{ fontSize: '13px', padding: '8px 12px', borderRadius: '10px', minWidth: '160px' }}
          >
            <option value="popular">Phổ biến nhất</option>
            <option value="newest">Mới nhất</option>
            <option value="rating">Đánh giá cao</option>
            <option value="price_asc">Giá từ thấp đến cao</option>
            <option value="price_desc">Giá từ cao đến thấp</option>
          </select>
        </div>
      </div>

      {/* Row 2: Subject pills select */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Môn học:</span>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {subjects.map(subj => {
            const isSelected = subject === subj.value;
            return (
              <button
                key={subj.value}
                onClick={() => handleSubjectChange(subj.value)}
                style={{
                  border: '1px solid var(--border)',
                  background: isSelected ? 'var(--primary)' : 'var(--bg-main)',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {subj.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 3: Price and Level Filters */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        {/* Price filter dropdown */}
        <div style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Mức học phí:</span>
          <select 
            value={priceRange} 
            onChange={handlePriceChange}
            className="form-control"
            style={{ fontSize: '13px', padding: '8px 12px', borderRadius: '10px' }}
          >
            <option value="All">Tất cả mức giá</option>
            <option value="Free">Miễn phí</option>
            <option value="Paid">Có phí</option>
            <option value="Under500">Dưới 500k</option>
            <option value="500to1M">Từ 500k - 1 triệu</option>
            <option value="Above1M">Trên 1 triệu</option>
          </select>
        </div>

        {/* Level filter quick select */}
        <div style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Mục tiêu học tập:</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {levels.map(lvl => {
              const isSelected = level === lvl.value;
              return (
                <button
                  key={lvl.value}
                  onClick={() => handleLevelChange(lvl.value)}
                  style={{
                    border: '1px solid var(--border)',
                    background: isSelected ? 'var(--primary-bg)' : 'var(--bg-main)',
                    color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
