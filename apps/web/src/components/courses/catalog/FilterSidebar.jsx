import React, { useMemo } from 'react';
import { HiX, HiAdjustments, HiSearch } from 'react-icons/hi';

const BLOCKS = ['A00', 'A01', 'B00', 'C00', 'D01'];
const LEVELS = ['Cơ bản', 'Nâng cao', 'Cấp tốc'];
const DURATIONS = [
  { id: 'short', label: 'Dưới 2 giờ' },
  { id: 'medium', label: 'Từ 2 - 5 giờ' },
  { id: 'long', label: 'Từ 5 - 10 giờ' },
  { id: 'unlimited', label: 'Trên 10 giờ' }
];

export default function FilterSidebar({
  subject, setSubject,
  block, setBlock,
  level, setLevel,
  priceLimit, setPriceLimit,
  onlyFree, setOnlyFree,
  duration, setDuration,
  ratingMin, setRatingMin,
  language, setLanguage,
  hasCert, setHasCert,
  hasLive, setHasLive,
  clearAll,
  subjectsList = [],
  resultsCount = 0,
  search = '',
  setSearch
}) {
  const activeChips = useMemo(() => {
    const list = [];
    if (search.trim()) list.push({ key: 'search', label: `Tìm kiếm: "${search}"`, reset: () => setSearch('') });
    if (subject !== 'All') list.push({ key: 'subject', label: `Môn: ${subject}`, reset: () => setSubject('All') });
    if (block !== 'All') list.push({ key: 'block', label: `Khối: ${block}`, reset: () => setBlock('All') });
    if (level !== 'All') list.push({ key: 'level', label: `Cấp độ: ${level}`, reset: () => setLevel('All') });
    if (priceLimit < 2000000) list.push({ key: 'priceLimit', label: `Dưới ${(priceLimit/1000).toLocaleString('vi-VN')}kđ`, reset: () => setPriceLimit(2000000) });
    if (onlyFree) list.push({ key: 'onlyFree', label: 'Miễn phí', reset: () => setOnlyFree(false) });
    if (duration !== 'All') {
      const match = DURATIONS.find(d => d.id === duration);
      list.push({ key: 'duration', label: match?.label || duration, reset: () => setDuration('All') });
    }
    if (ratingMin > 0) list.push({ key: 'ratingMin', label: `Từ ${ratingMin} sao`, reset: () => setRatingMin(0) });
    if (language !== 'All') list.push({ key: 'language', label: language, reset: () => setLanguage('All') });
    if (hasCert) list.push({ key: 'hasCert', label: 'Có chứng chỉ', reset: () => setHasCert(false) });
    if (hasLive) list.push({ key: 'hasLive', label: 'Có Live class', reset: () => setHasLive(false) });
    return list;
  }, [subject, block, level, priceLimit, onlyFree, duration, ratingMin, language, hasCert, hasLive, search]);

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar__header">
        <span className="filter-sidebar__title">
          <HiAdjustments className="filter-sidebar__title-icon" /> Bộ lọc khóa học
        </span>
        <span className="filter-sidebar__results">
          {resultsCount} kết quả
        </span>
      </div>

      {/* Search Filter input */}
      <div className="filter-section">
        <h4 className="filter-section__title">Tìm kiếm</h4>
        <div className="cf-search-wrap">
          <HiSearch className="cf-search-icon" />
          <input
            type="text"
            className="cf-search-input"
            placeholder="Tìm khóa học, giáo viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="active-filter-chips">
          <div className="active-filter-chips__list">
            {activeChips.map((chip, idx) => (
              <span key={idx} className="filter-chip">
                {chip.label}
                <button type="button" onClick={chip.reset} className="filter-chip__close">
                  <HiX />
                </button>
              </span>
            ))}
          </div>
          <button type="button" onClick={clearAll} className="filter-sidebar__clear-link">
            Xóa tất cả
          </button>
        </div>
      )}

      {/* Subject selection */}
      <div className="filter-section">
        <h4 className="filter-section__title">Môn học</h4>
        <div className="filter-section__options filter-section__options--chips">
          {['All', ...subjectsList].map((sub) => {
            const isActive = subject === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSubject(sub)}
                className={`filter-chip-btn ${isActive ? 'filter-chip-btn--active' : ''}`}
              >
                {sub === 'All' ? 'Tất cả' : sub}
              </button>
            );
          })}
        </div>
      </div>

      {/* Exam block select */}
      <div className="filter-section">
        <h4 className="filter-section__title">Khối thi</h4>
        <div className="filter-section__options filter-section__options--chips">
          {['All', ...BLOCKS].map((b) => {
            const isActive = block === b;
            return (
              <button
                key={b}
                type="button"
                onClick={() => setBlock(b)}
                className={`filter-chip-btn ${isActive ? 'filter-chip-btn--active' : ''}`}
              >
                {b === 'All' ? 'Tất cả' : b}
              </button>
            );
          })}
        </div>
      </div>

      {/* Level options */}
      <div className="filter-section">
        <h4 className="filter-section__title">Trình độ</h4>
        <div className="filter-section__options filter-section__options--chips">
          {['All', ...LEVELS].map((l) => {
            const isActive = level === l;
            return (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={`filter-chip-btn ${isActive ? 'filter-chip-btn--active' : ''}`}
              >
                {l === 'All' ? 'Tất cả' : l}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Limit Slider + Free toggle */}
      <div className="filter-section">
        <h4 className="filter-section__title">Học phí tối đa</h4>
        <div className="filter-price-slider">
          <input
            type="range"
            min="0"
            max="2000000"
            step="100000"
            value={priceLimit}
            onChange={(e) => {
              setPriceLimit(Number(e.target.value));
              if (Number(e.target.value) > 0) setOnlyFree(false);
            }}
            className="filter-slider"
          />
          <div className="filter-price-label">
            <span>0đ</span>
            <strong>{priceLimit === 0 ? 'Miễn phí' : `${priceLimit.toLocaleString('vi-VN')}đ`}</strong>
          </div>
        </div>

        <label className="filter-checkbox-label" style={{ marginTop: '12px' }}>
          <input
            type="checkbox"
            checked={onlyFree}
            onChange={(e) => {
              setOnlyFree(e.target.checked);
              if (e.target.checked) setPriceLimit(0);
            }}
            className="filter-checkbox"
          />
          <span>Chỉ xem Khóa học Miễn phí</span>
        </label>
      </div>

      {/* Duration options */}
      <div className="filter-section">
        <h4 className="filter-section__title">Thời lượng giảng dạy</h4>
        <div className="filter-section__options">
          {[{ id: 'All', label: 'Tất cả thời lượng' }, ...DURATIONS].map((d) => {
            const isActive = duration === d.id;
            return (
              <label key={d.id} className="filter-radio-label">
                <input
                  type="radio"
                  name="duration-radio"
                  checked={isActive}
                  onChange={() => setDuration(d.id)}
                  className="filter-radio"
                />
                <span>{d.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Rating radio */}
      <div className="filter-section">
        <h4 className="filter-section__title">Đánh giá tối thiểu</h4>
        <div className="filter-section__options">
          {[0, 4, 4.5, 5].map((val) => {
            const isActive = ratingMin === val;
            return (
              <label key={val} className="filter-radio-label">
                <input
                  type="radio"
                  name="rating-radio"
                  checked={isActive}
                  onChange={() => setRatingMin(val)}
                  className="filter-radio"
                />
                <span>
                  {val === 0 ? 'Tất cả mức đánh giá' : `Từ ${val} sao`}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div className="filter-section">
        <h4 className="filter-section__title">Ngôn ngữ</h4>
        <div className="filter-section__options">
          {['All', 'Tiếng Việt', 'English'].map((lang) => {
            const isActive = language === lang;
            return (
              <label key={lang} className="filter-radio-label">
                <input
                  type="radio"
                  name="language-radio"
                  checked={isActive}
                  onChange={() => setLanguage(lang)}
                  className="filter-radio"
                />
                <span>{lang === 'All' ? 'Tất cả ngôn ngữ' : lang}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Checkboxes row */}
      <div className="filter-section">
        <h4 className="filter-section__title">Tính năng đi kèm</h4>
        <div className="filter-section__options">
          <label className="filter-checkbox-label">
            <input
              type="checkbox"
              checked={hasCert}
              onChange={(e) => setHasCert(e.target.checked)}
              className="filter-checkbox"
            />
            <span>Cấp chứng nhận hoàn thành</span>
          </label>
          <label className="filter-checkbox-label">
            <input
              type="checkbox"
              checked={hasLive}
              onChange={(e) => setHasLive(e.target.checked)}
              className="filter-checkbox"
            />
            <span>Có lớp học trực tiếp (Live Class)</span>
          </label>
        </div>
      </div>
    </aside>
  );
}
