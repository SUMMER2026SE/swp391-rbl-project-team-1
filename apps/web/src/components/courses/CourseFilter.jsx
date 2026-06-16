import { HiX } from 'react-icons/hi';

const BLOCKS = [
  { value: 'All', label: 'Khối thi (Tất cả)' },
  { value: 'Khối A00', label: 'Khối A00 (Toán, Lý, Hóa)' },
  { value: 'Khối A01', label: 'Khối A01 (Toán, Lý, Anh)' },
  { value: 'Khối B00', label: 'Khối B00 (Toán, Hóa, Sinh)' },
  { value: 'Khối C00', label: 'Khối C00 (Văn, Sử, Địa)' },
  { value: 'Khối D01', label: 'Khối D01 (Toán, Văn, Anh)' },
];

const SUBJECTS = [
  { value: 'All', label: 'Môn học (Tất cả)' },
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

const LEVELS = [
  { value: 'All', label: 'Trình độ (Tất cả)' },
  { value: 'Cơ bản', label: 'Cơ bản' },
  { value: 'Nâng cao', label: 'Nâng cao' },
  { value: 'Cấp tốc', label: 'Cấp tốc' },
];

const BADGES = [
  { value: 'All', label: 'Phân loại (Tất cả)' },
  { value: 'BÁN CHẠY', label: 'Bán chạy' },
  { value: 'HOT', label: 'Hot' },
  { value: 'ĐỀ XUẤT', label: 'Đề xuất' },
  { value: 'MỚI', label: 'Mới' },
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
  badgeFilter,
  setBadgeFilter,
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
          <label className="cf-label" style={{ letterSpacing: '1px' }}>SẮP XẾP:</label>
          <select
            className="cf-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ height: '1.5px', background: 'var(--border-warm)', margin: '0 0' }} />

      {/* Row 2: Four dropdown selectors styled in a grid */}
      <div className="cf-dropdown-grid">
        <select
          className="cf-custom-select cf-custom-select--purple"
          value={block}
          onChange={(e) => setBlock(e.target.value)}
        >
          {BLOCKS.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>

        <select
          className="cf-custom-select cf-custom-select--green"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          className="cf-custom-select cf-custom-select--orange"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>

        <select
          className="cf-custom-select cf-custom-select--blue"
          value={badgeFilter}
          onChange={(e) => setBadgeFilter(e.target.value)}
        >
          {BADGES.map((bg) => (
            <option key={bg.value} value={bg.value}>{bg.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
