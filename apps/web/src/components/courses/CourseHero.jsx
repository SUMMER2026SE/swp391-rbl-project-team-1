import { HiStar, HiUserGroup, HiBookOpen, HiClock, HiCheck } from 'react-icons/hi';

export default function CourseHero({ course, isOwned, onEnroll }) {
  const {
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
    teacher_name,
    teacher_avatar
  } = course;

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        color: '#fff',
        padding: '40px 0',
        borderRadius: '20px',
        marginBottom: '28px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}
      className="animate-in"
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Left column: metadata */}
        <div style={{ flex: '2', minWidth: '320px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '12px' }}>
              Khối {subject_group}
            </span>
            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#e0e7ff', fontSize: '11px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '12px' }}>
              {subject}
            </span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '900', lineHeight: '1.3', marginBottom: '16px', color: '#fff' }}>
            {title}
          </h1>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', fontSize: '13px', color: '#c7d2fe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HiStar style={{ color: '#fbbf24' }} />
              <strong style={{ color: '#fff' }}>{rating}</strong> (Đánh giá học sinh)
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HiUserGroup />
              <strong style={{ color: '#fff' }}>{student_count}</strong> Học sinh đã đăng ký
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HiBookOpen />
              <strong style={{ color: '#fff' }}>{lesson_count}</strong> Bài giảng
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HiClock />
              <strong style={{ color: '#fff' }}>{duration}</strong> học tập
            </div>
          </div>

          {/* Teacher Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', background: 'rgba(255,255,255,0.05)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', width: 'fit-content' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#6c5ce7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>
              {teacher_avatar || teacher_name.slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '11.5px', color: '#a5b4fc' }}>Giáo viên phụ trách</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{teacher_name}</div>
            </div>
          </div>
        </div>

        {/* Right column: purchase card layout */}
        <div style={{ flex: '1', minWidth: '280px', background: 'var(--bg-card)', color: 'var(--text-primary)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 12px 30px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
          <div style={{ position: 'relative', height: '160px', background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '50px' }}>🎬</span>
            <span style={{ position: 'absolute', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '11px', padding: '4px 10px', borderRadius: '4px', bottom: '10px', left: '10px' }}>
              Xem thử 2 bài giảng miễn phí
            </span>
          </div>

          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px', fontWeight: '950', color: 'var(--primary)' }}>
                {price === 0 ? 'Miễn phí' : `${price.toLocaleString('vi-VN')}đ`}
              </span>
              {discount_percent > 0 && (
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  {original_price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            {isOwned ? (
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '12px', fontSize: '13.5px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'var(--accent-green)', color: '#fff', border: 'none', borderRadius: '10px' }}
                onClick={() => onEnroll('learn')}
              >
                <HiCheck /> BẮT ĐẦU HỌC NGAY
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '12px', fontSize: '13.5px', fontWeight: 'bold', borderRadius: '10px' }}
                  onClick={() => onEnroll('buy')}
                >
                  KÍCH HOẠT HỌC THỬ (DEMO)
                </button>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                  * Kích hoạt demo để tự động mở khóa toàn bộ bài giảng.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
