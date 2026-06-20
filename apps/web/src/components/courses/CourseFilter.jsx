<<<<<<< HEAD
import { HiX } from 'react-icons/hi';

const SUBJECTS = [
  { value: 'All', label: 'Tất cả môn' },
=======
import { useState, useRef, useEffect, useMemo } from 'react';
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
>>>>>>> 4bc1289b76ef82769a2eecdb6c5655fe53eecbeb
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

<<<<<<< HEAD
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
=======
const LEVELS = [
  { value: 'All', label: 'Trình độ (Tất cả)' },
  { value: 'Cơ bản', label: 'Cơ bản' },
  { value: 'Nâng cao', label: 'Nâng cao' },
  { value: 'Cấp tốc', label: 'Cấp tốc' },
];

const BADGES = [
  { value: 'All', label: 'Phân loại (Tất cả)' },
  { value: 'MIỄN PHÍ', label: 'Miễn phí' },
  { value: 'BÁN CHẠY', label: 'Bán chạy' },
  { value: 'HOT', label: 'Hot' },
  { value: 'ĐỀ XUẤT', label: 'Đề xuất' },
  { value: 'MỚI', label: 'Mới' },
>>>>>>> 4bc1289b76ef82769a2eecdb6c5655fe53eecbeb
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'price_asc', label: 'Giá từ thấp đến cao' },
  { value: 'price_desc', label: 'Giá từ cao đến thấp' },
  { value: 'newest', label: 'Mới nhất' },
];

<<<<<<< HEAD
=======
function CustomDropdown({ options, value, onChange, colorClass }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        className={colorClass === 'sort' ? 'cf-sort-select' : `cf-custom-select cf-custom-select--${colorClass}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          textAlign: 'left',
          display: 'block'
        }}
      >
        {selectedOption.label}
      </button>

      {isOpen && (
        <ul
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1.5px solid var(--border-warm, #EAE6DF)',
            borderRadius: '16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
            padding: '6px',
            margin: 0,
            listStyle: 'none',
            zIndex: 1100,
            maxHeight: '250px',
            overflowY: 'auto',
            animation: 'cpFadeInUp 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: isSelected ? '800' : '600',
                  color: isSelected 
                    ? (colorClass === 'purple' ? '#4F46E5' : colorClass === 'green' ? '#059669' : colorClass === 'orange' ? '#D97706' : colorClass === 'blue' ? '#2563EB' : '#57534E')
                    : '#292524',
                  background: isSelected 
                    ? (colorClass === 'purple' ? '#F5F3FF' : colorClass === 'green' ? '#ECFDF5' : colorClass === 'orange' ? '#FEF3C7' : colorClass === 'blue' ? '#EFF6FF' : '#F5F5F4')
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                  marginBottom: '2px',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#FAF9F6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

>>>>>>> 4bc1289b76ef82769a2eecdb6c5655fe53eecbeb
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
<<<<<<< HEAD
}) {
=======
  badgeFilter,
  setBadgeFilter,
}) {
  // Lấy danh sách môn học động dựa theo khối thi đang chọn
  const filteredSubjects = useMemo(() => {
    if (block === 'All') return SUBJECTS;

    const subjectsInBlock = {
      'Khối A00': ['Toán', 'Vật lý', 'Hóa học'],
      'Khối A01': ['Toán', 'Vật lý', 'Tiếng Anh'],
      'Khối B00': ['Toán', 'Hóa học', 'Sinh học'],
      'Khối C00': ['Ngữ văn', 'Lịch sử', 'Địa lý'],
      'Khối D01': ['Toán', 'Ngữ văn', 'Tiếng Anh'],
    };

    const allowed = subjectsInBlock[block] || [];
    return [
      { value: 'All', label: 'Môn học (Tất cả)' },
      ...SUBJECTS.filter(s => allowed.includes(s.value))
    ];
  }, [block]);

  // Tự động reset bộ lọc môn học về "Tất cả" nếu môn đang chọn không nằm trong khối mới chọn
  const handleBlockChange = (newBlock) => {
    setBlock(newBlock);
    if (newBlock !== 'All') {
      const subjectsInBlock = {
        'Khối A00': ['Toán', 'Vật lý', 'Hóa học'],
        'Khối A01': ['Toán', 'Vật lý', 'Tiếng Anh'],
        'Khối B00': ['Toán', 'Hóa học', 'Sinh học'],
        'Khối C00': ['Ngữ văn', 'Lịch sử', 'Địa lý'],
        'Khối D01': ['Toán', 'Ngữ văn', 'Tiếng Anh'],
      };
      const allowed = subjectsInBlock[newBlock] || [];
      if (subject !== 'All' && !allowed.includes(subject)) {
        setSubject('All');
      }
    }
  };

>>>>>>> 4bc1289b76ef82769a2eecdb6c5655fe53eecbeb
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
<<<<<<< HEAD
=======
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

        <div className="cf-sort-wrap" style={{ minWidth: '240px' }}>
          <label className="cf-label" style={{ letterSpacing: '1px', whiteSpace: 'nowrap' }}>SẮP XẾP:</label>
          <CustomDropdown
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={setSortBy}
            colorClass="sort"
>>>>>>> 4bc1289b76ef82769a2eecdb6c5655fe53eecbeb
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
<<<<<<< HEAD

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
=======
      </div>

      <div style={{ height: '1.5px', background: 'var(--border-warm)', margin: '0 0' }} />

      {/* Row 2: Four custom dropdown selectors styled in a grid */}
      <div className="cf-dropdown-grid">
        <CustomDropdown
          options={BLOCKS}
          value={block}
          onChange={handleBlockChange}
          colorClass="purple"
        />

        <CustomDropdown
          options={filteredSubjects}
          value={subject}
          onChange={setSubject}
          colorClass="green"
        />

        <CustomDropdown
          options={LEVELS}
          value={level}
          onChange={setLevel}
          colorClass="orange"
        />

        <CustomDropdown
          options={BADGES}
          value={badgeFilter}
          onChange={setBadgeFilter}
          colorClass="blue"
        />
>>>>>>> 4bc1289b76ef82769a2eecdb6c5655fe53eecbeb
      </div>
    </div>
  );
}
