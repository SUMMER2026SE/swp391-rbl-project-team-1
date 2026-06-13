import { HiStar, HiUserGroup, HiBookOpen, HiClock } from 'react-icons/hi';

export default function CourseCard({ course, onSelect, onPurchase, isOwned }) {
  const {
    id,
    title,
    subject,
    subject_group,
    price,
    original_price,
    discount_percent,
    rating,
    student_count,
    lesson_count,
    duration,
    badge,
    teacher_name,
    teacher_avatar
  } = course;

  const getSubjectColor = (subj) => {
    switch (subj) {
      case 'Toán học': return { bg: '#EEF2FF', text: '#4F46E5' };
      case 'Vật lý': return { bg: '#ECFDF5', text: '#059669' };
      case 'Tiếng Anh': return { bg: '#FFF7ED', text: '#EA580C' };
      case 'Hóa học': return { bg: '#ECFEFF', text: '#0891B2' };
      case 'Ngữ văn': return { bg: '#FDF2F8', text: '#DB2777' };
      case 'Sinh học': return { bg: '#F0FDF4', text: '#16A34A' };
      default: return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  const color = getSubjectColor(subject);

  return (
    <div 
      className="course-card animate-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
        height: '100%',
        cursor: 'pointer'
      }}
      onClick={() => onSelect(course)}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(108,92,231,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
      }}
    >
      {/* Thumbnail / Header Area */}
      <div style={{ position: 'relative', height: '170px', background: 'linear-gradient(135deg, #a29bfe, #74b9ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '64px' }}>
          {subject === 'Toán học' ? '📐' : subject === 'Vật lý' ? '⚡' : subject === 'Tiếng Anh' ? '🇬🇧' : subject === 'Hóa học' ? '🧪' : subject === 'Ngữ văn' ? '✍️' : '📖'}
        </span>
        
        {badge && (
          <span 
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: badge === 'Best seller' ? '#F59E0B' : badge === 'Hot' ? '#EF4444' : '#10B981',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '4px 10px',
              borderRadius: '20px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
          >
            {badge}
          </span>
        )}

        <span 
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: color.bg,
            color: color.text,
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '3px 10px',
            borderRadius: '12px'
          }}
        >
          {subject}
        </span>
      </div>

      {/* Body Area */}
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          <span className="badge-pill" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: '10px', fontWeight: 'bold' }}>
            Khối {subject_group}
          </span>
          <span className="badge-pill" style={{ background: 'var(--bg-main)', color: 'var(--text-secondary)', fontSize: '10px' }}>
            Luyện thi THPTQG
          </span>
        </div>

        <h3 
          style={{ 
            fontSize: '15px', 
            fontWeight: 'bold', 
            lineHeight: '1.4', 
            color: 'var(--text-primary)', 
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: '42px'
          }}
        >
          {title}
        </h3>

        {/* Specs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            <HiBookOpen style={{ color: 'var(--primary)' }} />
            <span>{lesson_count} bài giảng</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            <HiClock style={{ color: 'var(--primary)' }} />
            <span>{duration}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            <HiUserGroup style={{ color: 'var(--primary)' }} />
            <span>{student_count} học sinh</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#F59E0B', fontWeight: 'bold' }}>
            <HiStar />
            <span>{rating} / 5</span>
          </div>
        </div>

        {/* Teacher Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
            {teacher_avatar || teacher_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{teacher_name}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Giảng viên chuyên môn</div>
          </div>
        </div>

        {/* Footer Area: Price & CTA */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {discount_percent > 0 && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                {original_price.toLocaleString('vi-VN')}đ
              </span>
            )}
            <span style={{ fontSize: '15px', fontWeight: '900', color: 'var(--primary)' }}>
              {price === 0 ? 'Miễn phí' : `${price.toLocaleString('vi-VN')}đ`}
            </span>
          </div>

          {isOwned ? (
            <span 
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'var(--accent-green)',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '6px 14px',
                borderRadius: '8px'
              }}
            >
              Đã sở hữu
            </span>
          ) : (
            <button 
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '11.5px', borderRadius: '8px' }}
              onClick={(e) => {
                e.stopPropagation();
                onPurchase(course);
              }}
            >
              Học ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
