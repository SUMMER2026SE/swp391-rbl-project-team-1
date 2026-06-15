import { HiCheck, HiDeviceMobile, HiDocumentReport, HiInboxIn, HiKey, HiUser } from 'react-icons/hi';

export default function CoursePurchaseCard({ course, isOwned, onEnroll }) {
  const {
    thumbnail,
    priceOriginal,
    priceSale,
    discountPercent,
    lessonCount,
    durationHours,
    level
  } = course;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid rgba(139, 92, 26, 0.08)',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: '0 20px 32px -8px rgba(139, 92, 26, 0.08), 0 4px 12px -2px rgba(139, 92, 26, 0.03)',
        overflow: 'hidden',
      }}
    >
      {/* Thumbnail with overlay icon */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '16 / 9',
          height: 'auto',
          background: 'linear-gradient(135deg, #FAF6EE, #EAE6DF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <img
          src={thumbnail || '/course_thumb_math.png'}
          alt="Ảnh bìa khóa học"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => onEnroll('preview')}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              color: 'var(--emerald-primary)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            ▶
          </div>
        </div>
        <span
          style={{
            position: 'absolute',
            background: 'rgba(255,255,255,0.9)',
            color: 'var(--stone-text-main)',
            fontSize: '11px',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '99px',
            bottom: '12px',
            left: '12px'
          }}
        >
          Xem thử miễn phí
        </span>
      </div>

      <div style={{ padding: '28px' }}>
        {/* Price Tag */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '20px' }}>
          <span style={{ fontSize: '26px', fontWeight: '900', color: '#ea580c' }}>
            {priceSale === 0 ? 'Miễn phí' : `${priceSale.toLocaleString('vi-VN')}đ`}
          </span>
          {discountPercent > 0 && priceOriginal > 0 && (
            <span style={{ fontSize: '15px', color: 'var(--stone-text-muted)', textDecoration: 'line-through' }}>
              {priceOriginal.toLocaleString('vi-VN')}đ
            </span>
          )}
          {discountPercent > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: '800',
                color: '#dc2626',
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                padding: '2px 8px',
                borderRadius: '6px'
              }}
            >
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Action Button */}
        {isOwned ? (
          <button
            className="cc-btn cc-btn--enroll"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '14.5px',
              fontWeight: '800',
              borderRadius: '12px',
              marginBottom: '16px',
              background: 'linear-gradient(135deg, var(--emerald-primary), var(--emerald-hover))',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onClick={() => onEnroll('learn')}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            VÀO LỚP HỌC NGAY
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <button
              className="cc-btn cc-btn--enroll"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '14.5px',
                fontWeight: '800',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--emerald-primary), #10B981)',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => onEnroll('buy')}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              ĐĂNG KÝ HỌC NGAY
            </button>
            
            <button
              className="cc-btn cc-btn--demo"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '13.5px',
                fontWeight: '800',
                borderRadius: '12px',
                border: '2px solid var(--emerald-primary)',
                background: 'var(--emerald-light)',
                color: 'var(--emerald-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onClick={() => onEnroll('demo')}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(5, 150, 105, 0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--emerald-light)'; }}
            >
              🚀 VÀO HỌC DEMO (TRẢI NGHIỆM)
            </button>
 
            <button
              className="cc-btn"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '13.5px',
                fontWeight: '700',
                borderRadius: '12px',
                border: '1.5px solid var(--border-warm)',
                background: '#ffffff',
                color: 'var(--stone-text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => onEnroll('cart')}
              onMouseEnter={e => { e.currentTarget.style.background = '#FBFBFA'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        )}

        {/* Benefits Checklist */}
        <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--stone-text-secondary)', marginBottom: '14px', letterSpacing: '0.5px' }}>
          Khóa học này bao gồm:
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--stone-text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiInboxIn style={{ color: 'var(--emerald-primary)', fontSize: '16px', flexShrink: 0 }} />
            <span>Tổng số {lessonCount} bài giảng chất lượng</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiKey style={{ color: 'var(--emerald-primary)', fontSize: '16px', flexShrink: 0 }} />
            <span>Quyền học trọn đời, mọi thời điểm</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiDeviceMobile style={{ color: 'var(--emerald-primary)', fontSize: '16px', flexShrink: 0 }} />
            <span>Học được trên Máy tính, Điện thoại, Máy tính bảng</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiUser style={{ color: 'var(--emerald-primary)', fontSize: '16px', flexShrink: 0 }} />
            <span>Có sự đồng hành hỗ trợ 24/7 của Gia sư AI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiDocumentReport style={{ color: 'var(--emerald-primary)', fontSize: '16px', flexShrink: 0 }} />
            <span>Tài liệu tự luyện trắc nghiệm PDF đính kèm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
