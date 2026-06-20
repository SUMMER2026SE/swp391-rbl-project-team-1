import { HiX } from 'react-icons/hi';

const SUBJECTS = [
  { value: 'All', label: 'Tất cả môn' },
  { value: 'Toán', label: 'Toán học' },
  { value: 'Ngữ văn', label: 'Ngữ văn' },
  { value: 'Tiếng Anh', label: 'Tiếng Anh' },
  { value: 'Vật lý', label: 'Vật lý' },
  { value: 'Hóa học', label: 'Hóa học' },
  { value: 'Sinh học', label: 'Sinh học' },
  { value: 'Lịch sử', label: 'Lịch sử' },
  { value: 'Địa lý', label: 'Địa lý' },
  { value: 'GDCD', label: 'GDCD' },
];

const BLOCKS = [
  { value: 'All', label: 'Tất cả khối' },
  { value: 'Khối A00', label: 'Khối A00 (Toán, Lý, Hóa)' },
  { value: 'Khối A01', label: 'Khối A01 (Toán, Lý, Anh)' },
  { value: 'Khối B00', label: 'Khối B00 (Toán, Hóa, Sinh)' },
  { value: 'Khối C00', label: 'Khối C00 (Văn, Sử, Địa)' },
  { value: 'Khối D01', label: 'Khối D01 (Toán, Văn, Anh)' },
];

const LEVELS = [
  { value: 'All', label: 'Tất cả trình độ' },
  { value: 'Cơ bản', label: 'Cơ bản' },
  { value: 'Nâng cao', label: 'Nâng cao' },
  { value: 'Cấp tốc', label: 'Cấp tốc' },
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price_asc', label: 'Giá từ thấp đến cao' },
  { value: 'price_desc', label: 'Giá từ cao đến thấp' },
  { value: 'newest', label: 'Mới nhất' },
];

export default function CourseFilter({
  search,
  setSearch,
  subject,
  setSubject,
  block,
  setBlock,
  level,
  setLevel,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="cf-bar">
      {/* Row 1: Search input & Sorting */}
      <div className="cf-row cf-row--top">
        <div className="cf-search-wrap">
          <svg className="cf-search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            className="cf-search-input"
            placeholder="Tìm kiếm tên khóa học, giáo viên, chuyên đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--stone-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                fontSize: '16px'
              }}
              title="Xóa tìm kiếm"
            >
              <HiX />
            </button>
          )}
        </div>

        <div className="cf-sort-wrap">
          <label className="cf-label">Sắp xếp:</label>
          <select
            className="cf-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Subject selectors */}
      <div className="cf-section">
        <span className="cf-label">Môn học</span>
        <div className="cf-pills">
          {SUBJECTS.map((s) => (
            <button
              key={s.value}
              className={`cf-pill ${subject === s.value ? 'cf-pill--active' : ''}`}
              onClick={() => setSubject(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 3: Block Selectors & Level Selectors */}
      <div className="cf-row cf-row--filters">
        <div className="cf-section" style={{ flex: 1, minWidth: '240px' }}>
          <span className="cf-label">Khối thi THPT</span>
          <div className="cf-pills">
            {BLOCKS.map((b) => (
              <button
                key={b.value}
                className={`cf-pill ${block === b.value ? 'cf-pill--active' : ''}`}
                onClick={() => setBlock(b.value)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cf-section" style={{ flex: 1, minWidth: '240px' }}>
          <span className="cf-label">Mức độ học tập</span>
          <div className="cf-pills">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                className={`cf-pill ${level === l.value ? 'cf-pill--active' : ''}`}
                onClick={() => setLevel(l.value)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
