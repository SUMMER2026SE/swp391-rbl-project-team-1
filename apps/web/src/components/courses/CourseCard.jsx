import { HiStar, HiUserGroup, HiBookOpen, HiClock, HiPlay, HiCheckCircle } from 'react-icons/hi';

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

// Return accent color variable name based on subject
const getSubjectColorVar = (subject) => {
  switch (subject) {
    case 'Toán': return 'var(--subject-toan)';
    case 'Vật lý': return 'var(--subject-ly)';
    case 'Hóa học': return 'var(--subject-hoa)';
    case 'Ngữ văn': return 'var(--subject-van)';
    case 'Tiếng Anh': return 'var(--subject-anh)';
    case 'Sinh học': return 'var(--subject-sinh)';
    case 'Lịch sử': return 'var(--subject-su)';
    case 'Địa lý': return 'var(--subject-dia)';
    case 'GDCD': return 'var(--subject-gdcd)';
    default: return 'var(--emerald-primary)';
  }
};

const getBadgeClass = (badge) => {
  switch (badge) {
    case 'ĐỀ XUẤT': return 'cc-badge--de-xuat';
    case 'BÁN CHẠY': return 'cc-badge--ban-chay';
    case 'MỚI': return 'cc-badge--moi';
    case 'HOT': return 'cc-badge--hot';
    default: return '';
  }
};

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {Array.from({ length: 5 }, (_, i) => {
        const isFilled = i < full;
        const isHalf = i === full && half;
        return (
          <HiStar
            key={i}
            style={{
              color: isFilled || isHalf ? '#F59E0B' : '#E5E7EB',
              fontSize: '15px',
            }}
          />
        );
      })}
    </span>
  );
}

export default function CourseCard({ course, onSelect, onPurchase, isOwned }) {
  const {
    id,
    title,
    subject,
    block,
    thumbnail,
    badge,
    description,
    rating,
    reviewCount,
    lessonCount,
    durationHours,
    studentCount,
    instructor,
    priceOriginal,
    priceSale,
    discountPercent,
  } = course;

  const thumbUrl = thumbnail || SUBJECT_THUMBNAILS[subject] || '/course_thumb_math.png';
  const subjectColor = getSubjectColorVar(subject);
  const badgeClass = getBadgeClass(badge);

  const studentsFormatted = studentCount >= 1000
    ? `${(studentCount / 1000).toFixed(1)}k`
    : studentCount?.toString() || '0';

  const handleCardClick = () => {
    if (onSelect) onSelect(course);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation(); // prevent card click triggers
    if (isOwned) {
      if (onSelect) onSelect(course);
    } else {
      if (onPurchase) onPurchase(course);
    }
  };

  return (
    <div
      className="cc-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Khóa học ${title} giảng dạy bởi ${instructor.name}`}
      style={{ borderTop: `4px solid ${subjectColor}` }}
    >
      {/* ── THUMBNAIL ── */}
      <div className="cc-thumb">
        <img
          src={thumbUrl}
          alt={title}
          className="cc-thumb__img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/course_thumb_math.png';
          }}
        />
        <div className="cc-thumb__overlay" />

        {/* Badge */}
        {badge && (
          <span className={`cc-badge ${badgeClass}`}>
            {badge}
          </span>
        )}

        {/* Subject chip */}
        <span
          className="cc-subject-chip"
          style={{ backgroundColor: subjectColor }}
        >
          {subject}
        </span>

        {/* Play overlay on hover */}
        <div className="cc-play-overlay">
          <span className="cc-play-btn" style={{ color: subjectColor }}>
            <HiPlay />
          </span>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="cc-body">
        {/* Block info */}
        <span className="cc-grade-tag">
          {block} · Luyện thi THPTQG
        </span>

        {/* Title */}
        <h3 className="cc-title" title={title}>
          {title}
        </h3>

        {/* Description */}
        <p className="cc-desc">
          {description}
        </p>

        {/* Rating row */}
        <div className="cc-rating-row">
          <span className="cc-rating-num">{rating.toFixed(1)}</span>
          <StarRating rating={rating} />
          <span className="cc-rating-count">({reviewCount.toLocaleString('vi-VN')})</span>
        </div>

        {/* Metrics */}
        <div className="cc-metrics">
          <span className="cc-metric">
            <HiBookOpen className="cc-metric__icon" />
            {lessonCount} bài giảng
          </span>
          <span className="cc-metric">
            <HiClock className="cc-metric__icon" />
            {durationHours} giờ
          </span>
          <span className="cc-metric">
            <HiUserGroup className="cc-metric__icon" />
            {studentsFormatted} học viên
          </span>
        </div>

        {/* Teacher */}
        <div className="cc-teacher">
          <div
            className="cc-teacher__avatar"
            style={{ backgroundColor: subjectColor }}
          >
            {instructor.avatar || instructor.name.charAt(0).toUpperCase()}
          </div>
          <div className="cc-teacher__info">
            <span className="cc-teacher__name">{instructor.name}</span>
            <span className="cc-teacher__role">{instructor.title}</span>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="cc-footer">
        <div className="cc-price-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {discountPercent > 0 && priceOriginal > 0 && (
              <span className="cc-price-original">
                {priceOriginal.toLocaleString('vi-VN')}đ
              </span>
            )}
            {discountPercent > 0 && (
              <span className="cc-discount">-{discountPercent}%</span>
            )}
          </div>
          <span className="cc-price-current" style={{ color: subjectColor, fontWeight: 900 }}>
            {priceSale === 0 ? 'Miễn phí' : `${priceSale.toLocaleString('vi-VN')}đ`}
          </span>
        </div>

        {isOwned ? (
          <button
            className="cc-btn cc-btn--owned"
            onClick={handleButtonClick}
            aria-label="Tiếp tục học khóa này"
          >
            <HiCheckCircle style={{ marginRight: 4, fontSize: '16px' }} /> Vào học
          </button>
        ) : (
          <button
            className="cc-btn cc-btn--enroll"
            onClick={handleButtonClick}
            aria-label={`Đăng ký khóa học ${title}`}
            style={{
              background: `linear-gradient(135deg, ${subjectColor}, var(--emerald-primary))`,
              boxShadow: `0 4px 12px ${subjectColor}25`
            }}
          >
            Đăng ký ngay
          </button>
        )}
      </div>
    </div>
  );
}
