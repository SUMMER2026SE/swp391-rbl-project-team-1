import { useState } from 'react';

const SUBJECTS = [
  { value: 'All', label: 'Tất cả môn' },
  { value: 'Toán học', label: 'Toán học' },
  { value: 'Ngữ văn', label: 'Ngữ văn' },
  { value: 'Tiếng Anh', label: 'Tiếng Anh' },
  { value: 'Vật lý', label: 'Vật lý' },
  { value: 'Hóa học', label: 'Hóa học' },
  { value: 'Sinh học', label: 'Sinh học' },
  { value: 'Lịch sử', label: 'Lịch sử' },
  { value: 'Địa lý', label: 'Địa lý' },
  { value: 'GDCD', label: 'GDCD' },
];

const LEVELS = [
  { value: 'All', label: 'Tất cả' },
  { value: 'Beginner', label: 'Cơ bản' },
  { value: 'Intermediate', label: 'Nâng cao' },
  { value: 'Advanced', label: 'Luyện đề' },
  { value: 'Sprint', label: 'Cấp tốc' },
];

const PRICE_OPTIONS = [
  { value: 'All', label: 'Tất cả' },
  { value: 'Free', label: 'Miễn phí' },
  { value: 'Under500', label: 'Dưới 500K' },
  { value: '500to1M', label: '500K – 1 triệu' },
  { value: 'Above1M', label: 'Trên 1 triệu' },
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

export default function CourseFilter({ onFilterChange }) {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [level, setLevel] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const emit = (patch) => {
    onFilterChange({ search, subject, priceRange, level, sortBy, ...patch });
  };

  return (
    <div className="cf-bar">
      {/* Row 1: Search + Sort */}
      <div className="cf-row cf-row--top">
        <div className="cf-search-wrap">
          <svg className="cf-search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            className="cf-search-input"
            placeholder="Tìm kiếm khóa học, giáo viên, chủ đề..."
            value={search}
            onChange={e => { setSearch(e.target.value); emit({ search: e.target.value }); }}
          />
        </div>

        <div className="cf-sort-wrap">
          <label className="cf-label">Sắp xếp:</label>
          <select
            className="cf-select"
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); emit({ sortBy: e.target.value }); }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Subject pills */}
      <div className="cf-section">
        <span className="cf-label">Môn học</span>
        <div className="cf-pills">
          {SUBJECTS.map(s => (
            <button
              key={s.value}
              className={`cf-pill ${subject === s.value ? 'cf-pill--active' : ''}`}
              onClick={() => { setSubject(s.value); emit({ subject: s.value }); }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 3: Level + Price */}
      <div className="cf-row cf-row--filters">
        <div className="cf-section">
          <span className="cf-label">Cấp độ</span>
          <div className="cf-pills">
            {LEVELS.map(l => (
              <button
                key={l.value}
                className={`cf-pill ${level === l.value ? 'cf-pill--active' : ''}`}
                onClick={() => { setLevel(l.value); emit({ level: l.value }); }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cf-section">
          <span className="cf-label">Học phí</span>
          <div className="cf-pills">
            {PRICE_OPTIONS.map(p => (
              <button
                key={p.value}
                className={`cf-pill ${priceRange === p.value ? 'cf-pill--active' : ''}`}
                onClick={() => { setPriceRange(p.value); emit({ priceRange: p.value }); }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
