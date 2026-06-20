import React, { useState, useEffect, useRef } from 'react';
import { HiSearch } from 'react-icons/hi';

export default function HeroSection({ onSearch, courses }) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const containerRef = useRef(null);

  const SUGGESTED_CHIPS = [
    { text: 'Toán 12', val: 'Toán' },
    { text: 'Vật lý dao động', val: 'Vật lý' },
    { text: 'Tiếng Anh ngữ pháp', val: 'Tiếng Anh' },
    { text: 'Hóa hữu cơ', val: 'Hóa học' }
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = [];

    // Search matching course titles
    courses.forEach(c => {
      if (c.title?.toLowerCase().includes(q) && matches.length < 5) {
        matches.push({ type: 'course', text: c.title, id: c.id, query: c.title });
      }
    });

    // Search matching teachers
    const teachersSeen = new Set();
    courses.forEach(c => {
      const name = c.instructor?.name;
      if (name && name.toLowerCase().includes(q) && !teachersSeen.has(name) && matches.length < 8) {
        teachersSeen.add(name);
        matches.push({ type: 'instructor', text: name, query: name });
      }
    });

    // Search matching subjects
    const subjectsSeen = new Set();
    courses.forEach(c => {
      const sub = c.subject;
      if (sub && sub.toLowerCase().includes(q) && !subjectsSeen.has(sub) && matches.length < 10) {
        subjectsSeen.add(sub);
        matches.push({ type: 'subject', text: `Môn học: ${sub}`, query: sub });
      }
    });

    setSuggestions(matches);
  }, [query, courses]);

  const handleSuggestionClick = (item) => {
    onSearch(item.query);
    setQuery(item.query);
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
    setShowSuggestions(false);
  };

  return (
    <div className="catalog-hero" ref={containerRef}>
      <div className="catalog-hero__left">
        <span className="catalog-hero__badge">
          Nền tảng học trực tuyến thích ứng AI hàng đầu
        </span>
        <h1 className="catalog-hero__title">
          Khóa học luyện thi <span className="catalog-hero__title-accent">THPT Quốc Gia 2026</span>
        </h1>
        <p className="catalog-hero__desc">
          Hệ thống bài giảng chuyên sâu bám sát cấu trúc Bộ Giáo dục, kết hợp ngân hàng đề phong phú và Trợ lý ảo AI chấm điểm chẩn đoán học thuật 24/7.
        </p>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="catalog-hero__search-form">
          <div className="catalog-hero__search-wrapper">
            <HiSearch className="catalog-hero__search-input-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học, giáo viên, chuyên đề..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="catalog-hero__search-input"
            />
            <button type="submit" className="catalog-hero__search-btn">
              Tìm kiếm
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="catalog-hero__suggestions">
              {suggestions.map((item, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSuggestionClick(item)}
                  className="catalog-hero__suggestion-item"
                >
                  <span className={`catalog-hero__suggestion-tag catalog-hero__suggestion-tag--${item.type}`}>
                    {item.type === 'course' ? 'Khóa học' : item.type === 'instructor' ? 'Giáo viên' : 'Môn học'}
                  </span>
                  <span className="catalog-hero__suggestion-text">{item.text}</span>
                </li>
              ))}
            </ul>
          )}
        </form>

        {/* suggestion chips */}
        <div className="catalog-hero__chips">
          {SUGGESTED_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(chip.val);
                onSearch(chip.val);
              }}
              className="catalog-hero__chip"
            >
              {chip.text}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog-hero__right">
        <div className="catalog-hero__floating-grid">
          <div className="catalog-hero__stat-card catalog-hero__stat-card--c1">
            <strong>50.000+</strong>
            <span>Học viên tin tưởng</span>
          </div>
          <div className="catalog-hero__stat-card catalog-hero__stat-card--c2">
            <strong>100+</strong>
            <span>Chuyên đề ôn thi</span>
          </div>
          <div className="catalog-hero__stat-card catalog-hero__stat-card--c3">
            <strong>4.9★</strong>
            <span>Đánh giá trung bình</span>
          </div>
          <div className="catalog-hero__stat-card catalog-hero__stat-card--c4">
            <strong>98%</strong>
            <span>Đạt mục tiêu Đại học</span>
          </div>
        </div>
      </div>
    </div>
  );
}
