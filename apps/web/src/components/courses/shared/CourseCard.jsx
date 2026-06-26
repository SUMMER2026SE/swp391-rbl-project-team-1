import React, { useState } from 'react';
import { HiPlay, HiArrowRight, HiBookOpen, HiClock, HiUserGroup, HiShoppingCart } from 'react-icons/hi';
import CourseBadge from './CourseBadge';
import RatingStars from './RatingStars';
import PriceDisplay from './PriceDisplay';
import InstructorAvatar from './InstructorAvatar';

const getSubjectStyle = (subj) => {
  const s = (subj || '').toLowerCase();
  if (s.includes('toán')) {
    return {
      bg: '#EEF2FF', // light indigo/blue
      border: '#C7D2FE',
      text: '#1E1B4B',
      accent: '#4F46E5',
      accentBg: '#E0E7FF'
    };
  }
  if (s.includes('lý') || s.includes('vật lý') || s.includes('địa lý')) {
    return {
      bg: '#ECFDF5', // light emerald/mint
      border: '#A7F3D0',
      text: '#064E3B',
      accent: '#059669',
      accentBg: '#D1FAE5'
    };
  }
  if (s.includes('anh') || s.includes('tiếng anh')) {
    return {
      bg: '#FFF7ED', // light orange
      border: '#FED7AA',
      text: '#7C2D12',
      accent: '#EA580C',
      accentBg: '#FFEDD5'
    };
  }
  if (s.includes('hóa')) {
    return {
      bg: '#FDF2F8', // light pink
      border: '#FBCFE8',
      text: '#9D174D',
      accent: '#EC4899',
      accentBg: '#FCE7F3'
    };
  }
  if (s.includes('sinh')) {
    return {
      bg: '#FAF5FF', // light purple
      border: '#E9D5FF',
      text: '#581C87',
      accent: '#7C3AED',
      accentBg: '#F3E8FF'
    };
  }
  if (s.includes('văn') || s.includes('ngữ văn') || s.includes('sử') || s.includes('lịch sử') || s.includes('gdcd')) {
    return {
      bg: '#F0F9FF', // light teal/sky
      border: '#BAE6FD',
      text: '#075985',
      accent: '#0284C7',
      accentBg: '#E0F2FE'
    };
  }
  // Default style (white/grey)
  return {
    bg: '#ffffff',
    border: '#E5E7EB',
    text: '#1F2937',
    accent: '#4B5563',
    accentBg: '#F3F4F6'
  };
};

export default function CourseCard({ course, onSelect, onPurchase, isOwned, layout = 'list' }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

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
  
  const styles = getSubjectStyle(subject);

  if (layout === 'list') {
    return (
      <div
        className={`cc-list-card ${isOwned ? 'cc-list-card--enrolled' : ''}`}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: styles.bg,
          borderColor: styles.border,
          borderWidth: '2px',
          borderStyle: 'solid',
          position: 'relative',
          overflow: 'hidden'
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        {/* Subtle abstract geometric pattern behind the card */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '180px',
          overflow: 'hidden',
          pointerEvents: 'none',
          opacity: 0.08,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          zIndex: 0
        }}>
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            <circle cx="160" cy="100" r="90" fill={styles.accent} />
            <circle cx="160" cy="100" r="55" fill={styles.text} />
            <circle cx="90" cy="160" r="70" fill={styles.accent} />
          </svg>
        </div>

        {/* Left side: Thumbnail */}
        <div className="cc-list-thumb" style={{ zIndex: 1 }}>
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
          {badge && <span className="cc-list-badge" style={{ backgroundColor: styles.accent }}>{badge}</span>}
        </div>

        {/* Middle side: Main content */}
        <div className="cc-list-body" style={{ zIndex: 1 }}>
          <h3 className="cc-list-title" title={title} style={{ color: styles.text }}>
            {title}
          </h3>
          <p className="cc-list-desc" style={{ color: styles.text, opacity: 0.8 }}>
            {description || `Khóa học ôn luyện THPT Quốc gia chất lượng cao môn ${subject || 'Kiến thức'}, bám sát chương trình của Bộ Giáo dục.`}
          </p>
          
          <div className="cc-list-rating-row" style={{ color: styles.text, opacity: 0.85 }}>
            <span className="cc-list-rating-num" style={{ color: styles.text }}>{rating.toFixed(1)}</span>
            <RatingStars rating={rating} showNumber={false} />
            <span className="cc-list-review-count" style={{ color: styles.text, opacity: 0.85 }}>({reviewCount} đánh giá)</span>
            <span className="cc-list-meta-divider" style={{ color: styles.border }}>•</span>
            <span className="cc-list-meta-item" style={{ color: styles.text, opacity: 0.85 }}>{durationHours} giờ học</span>
            <span className="cc-list-meta-divider" style={{ color: styles.border }}>•</span>
            <span className="cc-list-meta-item" style={{ color: styles.text, opacity: 0.85 }}>{lessonCount} bài giảng</span>
          </div>
        </div>

        {/* Right side: Prices and Action Button */}
        <div className="cc-list-right" style={{ background: 'transparent', borderLeft: `2px solid ${styles.border}`, position: 'relative', zIndex: 1 }}>
          <div className="cc-list-price-group">
            {priceOriginal > priceSale && (
              <span className="cc-list-price-original" style={{ color: styles.text, opacity: 0.6 }}>
                {priceOriginal.toLocaleString('vi-VN')}đ
              </span>
            )}
            <span className="cc-list-price-sale" style={{ color: styles.text }}>
              {priceSale === 0 ? 'Miễn phí' : `${priceSale.toLocaleString('vi-VN')}đ`}
            </span>
          </div>

          <button
            type="button"
            onClick={handleButtonClick}
            onMouseEnter={() => setIsBtnHovered(true)}
            onMouseLeave={() => setIsBtnHovered(false)}
            className={`cc-list-action-btn ${isOwned ? 'cc-list-action-btn--enrolled' : 'cc-list-action-btn--cart'}`}
            style={{
              backgroundColor: isBtnHovered ? styles.text : styles.accent,
              color: '#ffffff',
              borderColor: styles.text,
              borderWidth: '2px',
              borderStyle: 'solid',
              boxShadow: isBtnHovered ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
              transform: isBtnHovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s ease',
              // If it's a cart button, keep it circle shape
              ...(isOwned ? { borderRadius: '8px', width: '100%' } : { borderRadius: '50%', width: '44px', height: '44px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' })
            }}
            title={isOwned ? 'Vào học' : 'Thêm vào giỏ hàng'}
            aria-label={isOwned ? 'Vào học' : 'Thêm vào giỏ hàng'}
          >
            {isOwned ? 'Vào học' : <HiShoppingCart className="cc-list-cart-icon" size={20} style={{ color: '#ffffff' }} />}
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
      style={{
        backgroundColor: styles.bg,
        borderColor: styles.border,
        borderWidth: '2px',
        borderStyle: 'solid',
        position: 'relative',
        overflow: 'hidden'
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Subtle abstract geometric pattern behind the grid card */}
      <div style={{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: '100px',
        height: '100px',
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0.08,
        zIndex: 0
      }}>
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
          <circle cx="80" cy="80" r="40" fill={styles.accent} />
          <circle cx="80" cy="80" r="25" fill={styles.text} />
        </svg>
      </div>

      {/* ── THUMBNAIL AREA ── */}
      <div className="cc-thumb" style={{ zIndex: 1 }}>
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
      <div className="cc-body" style={{ zIndex: 1 }}>
        {/* Uppercase tag bar */}
        <div className="cc-tag-bar" style={{ color: styles.text, opacity: 0.8 }}>
          {block ? block.toUpperCase() : 'THPTQG'} · LUYỆN THI THPTQG
        </div>

        {/* Title */}
        <h3 className="cc-title" title={title} style={{ color: styles.text }}>
          {title}
        </h3>

        {/* Instructor row */}
        <div className="cc-instructor-row">
          <InstructorAvatar instructor={instructor} size="sm" />
          <div className="cc-instructor-info">
            <span className="cc-instructor-name" style={{ color: styles.text }}>{instructor.name}</span>
            <span className="cc-instructor-title" style={{ color: styles.text, opacity: 0.7 }}>{instructor.title || 'Giảng viên chuyên môn'}</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="cc-stats-row" style={{ color: styles.text, opacity: 0.8 }}>
          <div className="cc-stats-rating">
            <RatingStars rating={rating} showNumber={true} />
            <span className="cc-review-count">({reviewCount.toLocaleString('vi-VN')})</span>
          </div>
          <span className="cc-separator" style={{ color: styles.border }}>•</span>
          <span className="cc-stat-item">
            <HiUserGroup /> {studentCount >= 1000 ? `${(studentCount / 1000).toFixed(1)}k` : studentCount}
          </span>
          <span className="cc-separator" style={{ color: styles.border }}>•</span>
          <span className="cc-stat-item">
            <HiBookOpen /> {lessonCount} bài
          </span>
        </div>

        {/* Enrolled progress bar */}
        {isOwned && (
          <div className="cc-progress-container">
            <div className="cc-progress-text" style={{ color: styles.text }}>
              <span>Tiến độ học tập</span>
              <strong>{progressPercent}%</strong>
            </div>
            <div className="cc-progress-bar-bg" style={{ backgroundColor: styles.border }}>
              <div
                className="cc-progress-bar-fill"
                style={{ width: `${progressPercent}%`, backgroundColor: styles.accent }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER PRICE/CTA ── */}
      <div className="cc-footer-price-row" style={{ position: 'relative', zIndex: 1 }}>
        <div className="cc-price-wrapper">
          <PriceDisplay priceSale={priceSale} priceOriginal={priceOriginal} />
        </div>
        <button
          type="button"
          onClick={handleButtonClick}
          onMouseEnter={() => setIsBtnHovered(true)}
          onMouseLeave={() => setIsBtnHovered(false)}
          className={`cc-btn ${isOwned ? 'cc-btn--owned' : 'cc-btn--enroll cc-btn--cart'}`}
          style={{
            backgroundColor: isBtnHovered ? styles.text : styles.accent,
            color: '#ffffff',
            borderColor: styles.text,
            borderWidth: '2px',
            borderStyle: 'solid',
            boxShadow: isBtnHovered ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
            transform: isBtnHovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            ...(isOwned ? { padding: '8px 16px', borderRadius: '8px' } : { borderRadius: '50%', width: '40px', height: '40px', padding: 0 })
          }}
          aria-label={isOwned ? 'Tiếp tục học' : 'Thêm vào giỏ hàng'}
        >
          {isOwned ? (
            <>Tiếp tục học <HiArrowRight className="cc-arrow-icon" /></>
          ) : (
            <HiShoppingCart className="cc-cart-icon" size={18} style={{ color: '#ffffff' }} />
          )}
        </button>
      </div>
    </div>
  );
}
