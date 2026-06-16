import { HiX } from 'react-icons/hi';

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

const REGISTRATION_STATUS = [
  { value: 'registered', label: 'Đã mua' },
  { value: 'free', label: 'Miễn phí' },
  { value: 'paid', label: 'Trả phí' },
];

export const BLOCK_SUBJECTS_MAP = {
  'All': ['Toán học', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học', 'Lịch sử', 'Địa lý', 'GDCD'],
  'Khối A00': ['Toán học', 'Vật lý', 'Hóa học'],
  'Khối A01': ['Toán học', 'Vật lý', 'Tiếng Anh'],
  'Khối B00': ['Toán học', 'Hóa học', 'Sinh học'],
  'Khối C00': ['Ngữ văn', 'Lịch sử', 'Địa lý', 'GDCD'],
  'Khối D01': ['Toán học', 'Ngữ văn', 'Tiếng Anh'],
};

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
  priceType,
  setPriceType,
  sortBy,
  setSortBy,
  clearFilters,
}) {
  const allowedSubjects = BLOCK_SUBJECTS_MAP[block] || BLOCK_SUBJECTS_MAP['All'];
  const filteredSubjectsList = SUBJECTS.filter(s => s.value === 'All' || allowedSubjects.includes(s.value));

  const handleBlockChange = (newBlock) => {
    setBlock(newBlock);
    const nextAllowed = BLOCK_SUBJECTS_MAP[newBlock] || BLOCK_SUBJECTS_MAP['All'];
    if (subject !== 'All' && !nextAllowed.includes(subject)) {
      setSubject('All');
    }
  };

  const hasActiveFilters = block !== 'All' || subject !== 'All' || level !== 'All' || priceType !== 'All';

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

      {/* Row 2: Dropdown Selects */}
      <div className="cf-dropdowns-row">
        <select
          className={`cf-filter-select cf-filter-select--block ${block !== 'All' ? 'cf-filter-select--active' : ''}`}
          value={block}
          onChange={(e) => handleBlockChange(e.target.value)}
        >
          {BLOCKS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.value === 'All' ? 'Khối thi (Tất cả)' : b.label}
            </option>
          ))}
        </select>

        <select
          className={`cf-filter-select cf-filter-select--subject ${subject !== 'All' ? 'cf-filter-select--active' : ''}`}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {filteredSubjectsList.map((s) => (
            <option key={s.value} value={s.value}>
              {s.value === 'All' ? 'Môn học (Tất cả)' : s.label}
            </option>
          ))}
        </select>

        <select
          className={`cf-filter-select cf-filter-select--level ${level !== 'All' ? 'cf-filter-select--active' : ''}`}
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.value === 'All' ? 'Trình độ (Tất cả)' : l.label}
            </option>
          ))}
        </select>

        <select
          className={`cf-filter-select cf-filter-select--type ${priceType !== 'All' ? 'cf-filter-select--active' : ''}`}
          value={priceType}
          onChange={(e) => setPriceType(e.target.value)}
        >
          <option value="All">Phân loại (Tất cả)</option>
          {REGISTRATION_STATUS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button className="cf-clear-btn" onClick={clearFilters} title="Xóa tất cả bộ lọc">
            Đặt lại
          </button>
        )}
      </div>

      {/* Row 3: Active tags/chips */}
      {hasActiveFilters && (
        <div className="cf-active-chips">
          <span className="cf-chips-label">Đang chọn:</span>
          <div className="cf-chips-list">
            {block !== 'All' && (
              <div className="cf-chip">
                <span>{block.replace('Khối ', '')}</span>
                <button className="cf-chip-close" onClick={() => handleBlockChange('All')} title="Bỏ chọn khối">
                  <HiX />
                </button>
              </div>
            )}
            {subject !== 'All' && (
              <div className="cf-chip">
                <span>{subject}</span>
                <button className="cf-chip-close" onClick={() => setSubject('All')} title="Bỏ chọn môn">
                  <HiX />
                </button>
              </div>
            )}
            {level !== 'All' && (
              <div className="cf-chip">
                <span>{level}</span>
                <button className="cf-chip-close" onClick={() => setLevel('All')} title="Bỏ chọn trình độ">
                  <HiX />
                </button>
              </div>
            )}
            {priceType !== 'All' && (
              <div className="cf-chip">
                <span>{REGISTRATION_STATUS.find(r => r.value === priceType)?.label || priceType}</span>
                <button className="cf-chip-close" onClick={() => setPriceType('All')} title="Bỏ chọn phân loại">
                  <HiX />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
