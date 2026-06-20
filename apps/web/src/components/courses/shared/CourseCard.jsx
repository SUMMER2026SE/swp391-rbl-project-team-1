import React, { useState } from 'react';
import { HiPlay, HiArrowRight, HiBookOpen, HiClock, HiUserGroup, HiShoppingCart } from 'react-icons/hi';
import CourseBadge from './CourseBadge';
import RatingStars from './RatingStars';
import PriceDisplay from './PriceDisplay';
import InstructorAvatar from './InstructorAvatar';

export default function CourseCard({ course, onSelect, onPurchase, isOwned, layout = 'list' }) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    id,
    title,
    subject,
    block,
    thumbnail,
    badge,
    rating,
    reviewCount,
    lessonCount,
    durationHours,
    studentCount,
    instructor,
    priceOriginal,
    priceSale,
    trailerUrl,
    description
  } = course;

  // Read progress from localStorage if owned
  let progressPercent = 0;
  if (isOwned) {
    const progressKey = `course_progress_percent_${id}`;
    const savedProgress = localStorage.getItem(progressKey);
    if (savedProgress) {
      progressPercent = Number(savedProgress);
    } else {
      const completedKey = `course_${id}_completed_lessons`;
      const savedCompleted = localStorage.getItem(completedKey);
      if (savedCompleted) {
        try {
          const completedArr = JSON.parse(savedCompleted);
          if (Array.isArray(completedArr) && lessonCount > 0) {
            progressPercent = Math.min(100, Math.round((completedArr.length / lessonCount) * 100));
          }
        } catch (_) {}
      }
    }
  }

  const handleCardClick = () => {
    if (onSelect) onSelect(course);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (isOwned) {
      if (onSelect) onSelect(course);
    } else {
      if (onPurchase) onPurchase(course);
    }
  };

  const SUBJECT_THUMBNAILS = {
    'Toán': '/course_thumb_math.png',
    'Vật lý': '/course_thumb_physics.png',
    'Tiếng Anh': '/course_thumb_english.png',
    'Hóa học': '/course_thumb_chemistry.png',
    'Ngữ văn': '/course_thumb_literature.png',
    'Sinh học': '/course_thumb_chemistry.png',
    'Lịch sử': '/course_thumb_literature.png',
    'Địa lý': '/course_thumb_physics.png',
    'GDCD': '/course_thumb_literature.png',
  };

  const thumbUrl = thumbnail || SUBJECT_THUMBNAILS[subject] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop';

  if (layout === 'list') {
    return (
      <div
        className={`cc-list-card ${isOwned ? 'cc-list-card--enrolled' : ''}`}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        {/* Left side: Thumbnail */}
        <div className="cc-list-thumb">
          {isHovered && trailerUrl ? (
            <video
              src={trailerUrl}
              className="cc-list-thumb__video"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={thumbUrl}
              alt={title}
              className="cc-list-thumb__img"
              loading="lazy"
            />
          )}
          {badge && <span className="cc-list-badge">{badge}</span>}
        </div>

        {/* Middle side: Main content */}
        <div className="cc-list-body">
          <h3 className="cc-list-title" title={title}>
            {title}
          </h3>
          <p className="cc-list-desc">
            {description || `Khóa học ôn luyện THPT Quốc gia chất lượng cao môn ${subject || 'Kiến thức'}, bám sát chương trình của Bộ Giáo dục.`}
          </p>
          
          <div className="cc-list-rating-row">
            <span className="cc-list-rating-num">{rating.toFixed(1)}</span>
            <RatingStars rating={rating} showNumber={false} />
            <span className="cc-list-review-count">({reviewCount} đánh giá)</span>
            <span className="cc-list-meta-divider">•</span>
            <span className="cc-list-meta-item">{durationHours} giờ học</span>
            <span className="cc-list-meta-divider">•</span>
            <span className="cc-list-meta-item">{lessonCount} bài giảng</span>
          </div>
        </div>

        {/* Right side: Prices and Action Button */}
        <div className="cc-list-right">
          <div className="cc-list-price-group">
            {priceOriginal > priceSale && (
              <span className="cc-list-price-original">
                {priceOriginal.toLocaleString('vi-VN')}đ
              </span>
            )}
            <span className="cc-list-price-sale">
              {priceSale === 0 ? 'Miễn phí' : `${priceSale.toLocaleString('vi-VN')}đ`}
            </span>
          </div>

          <button
            type="button"
            onClick={handleButtonClick}
            className={`cc-list-action-btn ${isOwned ? 'cc-list-action-btn--enrolled' : 'cc-list-action-btn--cart'}`}
            title={isOwned ? 'Vào học' : 'Thêm vào giỏ hàng'}
            aria-label={isOwned ? 'Vào học' : 'Thêm vào giỏ hàng'}
          >
            {isOwned ? 'Vào học' : <HiShoppingCart className="cc-list-cart-icon" size={20} />}
          </button>
        </div>
      </div>
    );
  }

  // Grid layout (legacy support)
  return (
    <div
      className={`cc-card ${isOwned ? 'cc-card--enrolled' : ''}`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* ── THUMBNAIL AREA ── */}
      <div className="cc-thumb">
        {isHovered && trailerUrl ? (
          <video
            src={trailerUrl}
            className="cc-thumb__video"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={thumbUrl}
            alt={title}
            className="cc-thumb__img"
            loading="lazy"
          />
        )}
        <div className="cc-thumb__overlay" />

        {/* Badge top-left */}
        {badge && (
          <div className="cc-thumb__badge-wrap">
            <CourseBadge type={badge} />
          </div>
        )}

        {/* Play Icon center on hover */}
        {isHovered && (
          <div className="cc-play-center-btn">
            <HiPlay />
          </div>
        )}

        {/* Duration pill bottom-right */}
        <span className="cc-thumb__duration-pill">
          <HiClock style={{ marginRight: '3px' }} /> {durationHours}h
        </span>
      </div>

      {/* ── CONTENT BODY ── */}
      <div className="cc-body">
        {/* Uppercase tag bar */}
        <div className="cc-tag-bar">
          {block ? block.toUpperCase() : 'THPTQG'} · LUYỆN THI THPTQG
        </div>

        {/* Title */}
        <h3 className="cc-title" title={title}>
          {title}
        </h3>

        {/* Instructor row */}
        <div className="cc-instructor-row">
          <InstructorAvatar instructor={instructor} size="sm" />
          <div className="cc-instructor-info">
            <span className="cc-instructor-name">{instructor.name}</span>
            <span className="cc-instructor-title">{instructor.title || 'Giảng viên chuyên môn'}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="cc-stats-row">
          <div className="cc-stats-rating">
            <RatingStars rating={rating} showNumber={true} />
            <span className="cc-review-count">({reviewCount.toLocaleString('vi-VN')})</span>
          </div>
          <span className="cc-separator">•</span>
          <span className="cc-stat-item">
            <HiUserGroup /> {studentCount >= 1000 ? `${(studentCount / 1000).toFixed(1)}k` : studentCount}
          </span>
          <span className="cc-separator">•</span>
          <span className="cc-stat-item">
            <HiBookOpen /> {lessonCount} bài
          </span>
        </div>

        {/* Enrolled progress bar */}
        {isOwned && (
          <div className="cc-progress-container">
            <div className="cc-progress-text">
              <span>Tiến độ học tập</span>
              <strong>{progressPercent}%</strong>
            </div>
            <div className="cc-progress-bar-bg">
              <div
                className="cc-progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER PRICE/CTA ── */}
      <div className="cc-footer-price-row">
        <div className="cc-price-wrapper">
          <PriceDisplay priceSale={priceSale} priceOriginal={priceOriginal} />
        </div>
        <button
          type="button"
          onClick={handleButtonClick}
          className={`cc-btn ${isOwned ? 'cc-btn--owned' : 'cc-btn--enroll cc-btn--cart'}`}
          aria-label={isOwned ? 'Tiếp tục học' : 'Thêm vào giỏ hàng'}
        >
          {isOwned ? (
            <>Tiếp tục học <HiArrowRight className="cc-arrow-icon" /></>
          ) : (
            <HiShoppingCart className="cc-cart-icon" size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
