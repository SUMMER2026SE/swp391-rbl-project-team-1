import { HiStar, HiUserGroup, HiBookOpen, HiClock, HiPlay, HiLockClosed } from 'react-icons/hi';

// Subject-to-thumbnail mapping using real generated images
const SUBJECT_THUMBS = {
  'Toán học': '/course_thumb_math.png',
  'Vật lý': '/course_thumb_physics.png',
  'Tiếng Anh': '/course_thumb_english.png',
  'Hóa học': '/course_thumb_chemistry.png',
  'Ngữ văn': '/course_thumb_literature.png',
  'Sinh học': '/course_thumb_chemistry.png',
  'Lịch sử': '/course_thumb_literature.png',
  'Địa lý': '/course_thumb_physics.png',
  'GDCD': '/course_thumb_literature.png',
};

const SUBJECT_COLORS = {
  'Toán học':   { accent: '#4F46E5', light: '#EEF2FF', label: 'Toán học' },
  'Vật lý':     { accent: '#0891B2', light: '#ECFEFF', label: 'Vật lý' },
  'Tiếng Anh':  { accent: '#D97706', light: '#FFFBEB', label: 'Tiếng Anh' },
  'Hóa học':    { accent: '#0D9488', light: '#F0FDFA', label: 'Hóa học' },
  'Ngữ văn':    { accent: '#BE185D', light: '#FDF2F8', label: 'Ngữ văn' },
  'Sinh học':   { accent: '#16A34A', light: '#F0FDF4', label: 'Sinh học' },
  'Lịch sử':    { accent: '#92400E', light: '#FFFBEB', label: 'Lịch sử' },
  'Địa lý':     { accent: '#0369A1', light: '#F0F9FF', label: 'Địa lý' },
  'GDCD':       { accent: '#6D28D9', light: '#F5F3FF', label: 'GDCD' },
};

const BADGE_STYLES = {
  'Best seller': { bg: '#F59E0B', label: 'Bán chạy' },
  'Hot':         { bg: '#EF4444', label: 'Hot' },
  'New':         { bg: '#10B981', label: 'Mới' },
  'Recommended': { bg: '#6366F1', label: 'Đề xuất' },
};

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          style={{
            color: i < full ? '#F59E0B' : (i === full && half ? '#F59E0B' : '#D1D5DB'),
            fontSize: '13px',
          }}
        >
          {i < full ? '★' : (i === full && half ? '⯨' : '★')}
        </span>
      ))}
    </span>
  );
}

export default function CourseCard({ course, onSelect, onPurchase, isOwned }) {
  const {
    title,
    subject,
    subject_group,
    description,
    price,
    original_price,
    discount_percent,
    rating,
    student_count,
    lesson_count,
    duration,
    badge,
    teacher_name,
    thumbnail_url,
  } = course;

  const thumb = thumbnail_url || SUBJECT_THUMBS[subject] || '/course_thumb_math.png';
  const subjectStyle = SUBJECT_COLORS[subject] || { accent: '#4F46E5', light: '#EEF2FF', label: subject };
  const badgeStyle = badge ? BADGE_STYLES[badge] : null;

  const ratingNum = typeof rating === 'number' ? rating : parseFloat(rating) || 4.7;
  const studentsFormatted = student_count >= 1000
    ? `${(student_count / 1000).toFixed(1)}k`
    : student_count?.toString() || '0';

  return (
    <div
      className="cc-card"
      onClick={() => onSelect(course)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(course)}
    >
      {/* ── THUMBNAIL ── */}
      <div className="cc-thumb">
        <img
          src={thumb}
          alt={title}
          className="cc-thumb__img"
          onError={e => {
            e.target.onerror = null;
            e.target.src = '/course_thumb_math.png';
          }}
        />
        {/* Gradient overlay for text legibility */}
        <div className="cc-thumb__overlay" />

        {/* Badge */}
        {badgeStyle && (
          <span
            className="cc-badge"
            style={{ background: badgeStyle.bg }}
          >
            {badgeStyle.label}
          </span>
        )}

        {/* Subject chip */}
        <span
          className="cc-subject-chip"
          style={{ background: subjectStyle.accent }}
        >
          {subjectStyle.label}
        </span>

        {/* Play overlay on hover */}
        <div className="cc-play-overlay">
          <span className="cc-play-btn">
            <HiPlay />
          </span>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="cc-body">
        {/* Grade tag */}
        {subject_group && (
          <span className="cc-grade-tag">Khối {subject_group} · Luyện thi THPTQG</span>
        )}

        {/* Title */}
        <h3 className="cc-title">{title}</h3>

        {/* Description */}
        {description && (
          <p className="cc-desc">{description}</p>
        )}

        {/* Rating row */}
        <div className="cc-rating-row">
          <span className="cc-rating-num">{ratingNum.toFixed(1)}</span>
          <StarRating rating={ratingNum} />
          <span className="cc-rating-count">({student_count?.toLocaleString('vi-VN') || 0})</span>
        </div>

        {/* Metrics */}
        <div className="cc-metrics">
          <span className="cc-metric">
            <HiBookOpen className="cc-metric__icon" />
            {lesson_count} bài
          </span>
          <span className="cc-metric">
            <HiClock className="cc-metric__icon" />
            {duration}
          </span>
          <span className="cc-metric">
            <HiUserGroup className="cc-metric__icon" />
            {studentsFormatted} học sinh
          </span>
        </div>

        {/* Teacher */}
        <div className="cc-teacher">
          <div
            className="cc-teacher__avatar"
            style={{ background: subjectStyle.accent }}
          >
            {teacher_name?.charAt(0).toUpperCase() || 'G'}
          </div>
          <div className="cc-teacher__info">
            <span className="cc-teacher__name">{teacher_name}</span>
            <span className="cc-teacher__role">Giảng viên chuyên môn</span>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="cc-footer">
        <div className="cc-price-group">
          {discount_percent > 0 && original_price > 0 && (
            <span className="cc-price-original">
              {original_price.toLocaleString('vi-VN')}đ
            </span>
          )}
          <span className="cc-price-current">
            {price === 0 ? 'Miễn phí' : `${price.toLocaleString('vi-VN')}đ`}
          </span>
          {discount_percent > 0 && (
            <span className="cc-discount">-{discount_percent}%</span>
          )}
        </div>

        {isOwned ? (
          <button
            className="cc-btn cc-btn--owned"
            onClick={e => { e.stopPropagation(); onSelect(course); }}
          >
            <HiPlay style={{ marginRight: 4 }} /> Tiếp tục học
          </button>
        ) : (
          <button
            className="cc-btn cc-btn--enroll"
            onClick={e => { e.stopPropagation(); onPurchase(course); }}
          >
            Đăng ký ngay
          </button>
        )}
      </div>
    </div>
  );
}
