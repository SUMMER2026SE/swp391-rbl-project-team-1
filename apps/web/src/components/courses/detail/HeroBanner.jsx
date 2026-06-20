import React, { useState } from 'react';
import { HiStar, HiBookOpen } from 'react-icons/hi';

export default function HeroBanner({ course, reviewsCount = 0 }) {
  const [descExpanded, setDescExpanded] = useState(false);

  const {
    title,
    description = '',
    instructor = {},
    rating = 5.0,
    curriculum = []
  } = course;

  // Description collapse/expand logic
  const isDescLong = description.length > 250;
  const displayedDesc = isDescLong && !descExpanded 
    ? `${description.slice(0, 250)}...` 
    : description;

  const totalSections = curriculum.length;

  return (
    <div className="fts-hero animate-in">
      <div className="fts-hero-grid">
        {/* Left column content */}
        <div className="fts-hero-left">
          {/* 1. Title */}
          <h1 className="fts-hero-title">
            {title}
          </h1>

          {/* 2. Description */}
          <p className="fts-hero-desc">
            {displayedDesc}
            {isDescLong && (
              <button 
                type="button"
                className="fts-hero-desc-expand-btn"
                onClick={() => setDescExpanded(!descExpanded)}
              >
                {descExpanded ? 'Rút gọn' : 'Xem thêm'}
              </button>
            )}
          </p>

          {/* 3. Author */}
          <div className="fts-hero-author">
            Giảng viên: <strong>{instructor?.name || 'EduPath AI Specialist'}</strong>
          </div>

          {/* 4. Rating Row */}
          <div className="fts-hero-rating-row">
            <span className="fts-hero-rating-value">{Number(rating).toFixed(1)}</span>
            <div className="fts-hero-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <HiStar 
                  key={i} 
                  className="fts-hero-star-icon"
                  style={{
                    color: i < Math.round(rating) ? 'var(--fts-yellow-star)' : 'rgba(255, 255, 255, 0.3)'
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginLeft: '4px' }}>
              ({reviewsCount} đánh giá)
            </span>
          </div>

          {/* 5. Lesson Count */}
          <div className="fts-hero-lessons-count">
            <HiBookOpen style={{ fontSize: '16px' }} />
            <span>{totalSections} học phần</span>
          </div>
        </div>

        {/* Right column spacing (reserved for overlapping video player) */}
        <div style={{ pointerEvents: 'none' }} />
      </div>
    </div>
  );
}
