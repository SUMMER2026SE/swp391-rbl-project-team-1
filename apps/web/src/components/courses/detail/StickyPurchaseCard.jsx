import React, { useState, useEffect } from 'react';
import { 
  HiCheck, 
  HiPlay, 
  HiShoppingCart, 
  HiLightningBolt, 
  HiShieldCheck, 
  HiGift, 
  HiShare, 
  HiBookmark, 
  HiX 
} from 'react-icons/hi';
import { toast } from '../../shared/Toast'; // Try import from standard path or fallback

export default function StickyPurchaseCard({ course, isOwned, onEnroll }) {
  const {
    priceOriginal,
    priceSale,
    subject,
    thumbnail,
    trailerUrl
  } = course;

  const [showTrailer, setShowTrailer] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 23,
    minutes: 45,
    seconds: 12
  });

  // Countdown timer logic
  useEffect(() => {
    const getTargetTime = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(23, 59, 59, 999); // End of today
      if (target.getTime() - now.getTime() < 4 * 60 * 60 * 1000) {
        // If less than 4 hours left, extend to tomorrow
        target.setDate(target.getDate() + 1);
      }
      return target;
    };

    const targetTime = getTargetTime();

    const updateTimer = () => {
      const difference = targetTime.getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const discountPercent = priceOriginal > priceSale 
    ? Math.round(((priceOriginal - priceSale) / priceOriginal) * 100)
    : 0;

  const handleOpenTrailer = () => {
    if (trailerUrl) {
      setShowTrailer(true);
    } else {
      toast('Khóa học này hiện chưa có video giới thiệu.', 'info');
    }
  };

  const showToast = (message, type = 'info') => {
    try {
      // Import dynamic to avoid loading error
      import('../../utils/toast').then(m => {
        m.toast(message, type);
      }).catch(() => {
        // Fallback alert or console log if toast module fails
        alert(message);
      });
    } catch (e) {
      console.log(message);
    }
  };

  return (
    <div className="sticky-purchase-card" style={{
      background: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
      overflow: 'hidden',
      border: '1px solid var(--border-warm, #EAE6DF)',
      width: '100%',
      minWidth: '320px',
      boxSizing: 'border-box'
    }}>
      {/* 1. Thumbnail/trailer container */}
      <div 
        onClick={handleOpenTrailer} 
        style={{
          position: 'relative',
          aspectRatio: '16/9',
          overflow: 'hidden',
          cursor: trailerUrl ? 'pointer' : 'default',
          backgroundColor: '#000000',
          width: '100%',
          display: 'block'
        }}
      >
        <img
          src={thumbUrl}
          alt={course.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
        {trailerUrl && (
          <>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.3)',
              transition: 'background 0.2s'
            }}>
              <HiPlay size={56} style={{ color: '#ffffff', opacity: 0.9, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }} />
            </div>
            <span style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              Xem trailer miễn phí
            </span>
          </>
        )}
      </div>

      {/* 2. Body container */}
      <div style={{ padding: '20px', boxSizing: 'border-box' }}>
        
        {/* Price Section */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '16px',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontSize: '32px', fontWeight: '900', color: 'var(--stone-text-main, #292524)' }}>
            {priceSale === 0 ? 'Miễn phí' : `${priceSale.toLocaleString('vi-VN')} đ`}
          </span>
          {priceOriginal > priceSale && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--stone-text-muted, #878681)' }}>
                {priceOriginal.toLocaleString('vi-VN')} đ
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: '800',
                color: '#ffffff',
                background: '#ef4444',
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                -{discountPercent}%
              </span>
            </div>
          )}
        </div>

        {/* Countdown Timer */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.04)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            fontSize: '11.5px',
            fontWeight: '800',
            color: '#ef4444',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Ưu đãi kết thúc sau:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Day box */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '800',
                padding: '4px 6px',
                borderRadius: '6px',
                minWidth: '22px',
                textAlign: 'center'
              }}>
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <span style={{ fontSize: '9px', color: 'var(--stone-text-secondary)', marginTop: '4px', fontWeight: '600' }}>ngày</span>
            </div>
            
            <span style={{ fontWeight: '800', color: '#ef4444', alignSelf: 'flex-start', marginTop: '2px' }}>:</span>

            {/* Hour box */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '800',
                padding: '4px 6px',
                borderRadius: '6px',
                minWidth: '22px',
                textAlign: 'center'
              }}>
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span style={{ fontSize: '9px', color: 'var(--stone-text-secondary)', marginTop: '4px', fontWeight: '600' }}>giờ</span>
            </div>

            <span style={{ fontWeight: '800', color: '#ef4444', alignSelf: 'flex-start', marginTop: '2px' }}>:</span>

            {/* Minute box */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '800',
                padding: '4px 6px',
                borderRadius: '6px',
                minWidth: '22px',
                textAlign: 'center'
              }}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span style={{ fontSize: '9px', color: 'var(--stone-text-secondary)', marginTop: '4px', fontWeight: '600' }}>phút</span>
            </div>

            <span style={{ fontWeight: '800', color: '#ef4444', alignSelf: 'flex-start', marginTop: '2px' }}>:</span>

            {/* Second box */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '800',
                padding: '4px 6px',
                borderRadius: '6px',
                minWidth: '22px',
                textAlign: 'center'
              }}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <span style={{ fontSize: '9px', color: 'var(--stone-text-secondary)', marginTop: '4px', fontWeight: '600' }}>giây</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {isOwned ? (
            <button
              type="button"
              onClick={() => onEnroll('learn')}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: '800',
                background: 'var(--emerald-primary, #059669)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              className="purchase-card-cta"
            >
              <HiPlay size={20} />
              Vào học ngay
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onEnroll('buy')}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: '800',
                  background: 'var(--primary, #6C5CE7)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                className="purchase-card-cta"
              >
                <HiLightningBolt size={20} />
                Đăng ký ngay
              </button>
              <button
                type="button"
                onClick={() => onEnroll('cart')}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  background: '#ffffff',
                  color: 'var(--primary, #6C5CE7)',
                  border: '1.5px solid var(--primary, #6C5CE7)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                className="purchase-card-cta-secondary"
              >
                <HiShoppingCart size={20} />
                Thêm vào giỏ hàng
              </button>
            </>
          )}
        </div>

        {/* Guarantee Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '12.5px',
          color: '#059669',
          fontWeight: '700',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-warm, #EAE6DF)',
          paddingBottom: '16px'
        }}>
          <HiShieldCheck size={18} />
          <span>Hoàn tiền trong 7 ngày</span>
        </div>

        {/* 4. Course Inclusions */}
        <div className="sticky-purchase-card__inclusions" style={{ marginBottom: '20px' }}>
          <h4 className="sticky-purchase-card__inclusions-title" style={{
            fontSize: '13px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--stone-text-main, #292524)',
            marginBottom: '12px'
          }}>
            Khóa học này bao gồm:
          </h4>
          <ul className="sticky-purchase-card__inclusions-list" style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {[
              '5 bài giảng video chất lượng cao',
              'Tài liệu PDF tải xuống không giới hạn',
              'Nhóm hỏi đáp thắc mắc 24/7',
              'Chứng chỉ hoàn thành',
              'Truy cập trọn đời'
            ].map((item, idx) => (
              <li key={idx} className="sticky-purchase-card__inclusion-item" style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '13.5px',
                lineHeight: '1.45',
                color: 'var(--stone-text-secondary, #57534e)',
                whiteSpace: 'normal'
              }}>
                <HiCheck className="sticky-purchase-card__inclusion-icon" style={{
                  color: 'var(--primary, #6C5CE7)',
                  fontSize: '16px',
                  flexShrink: 0,
                  marginTop: '2px'
                }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5. Warning Preview Note */}
        {!isOwned && (
          <div style={{
            fontSize: '12px',
            color: 'var(--stone-text-muted, #878681)',
            lineHeight: '1.5',
            background: 'var(--cream-card, #FAF8F5)',
            border: '1px solid var(--border-warm, #EAE6DF)',
            borderRadius: '8px',
            padding: '10px',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            Bạn đang xem preview của khóa học này. Hãy đăng ký để mở khóa toàn bộ bài giảng.
          </div>
        )}

        {/* 6. Action Row buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          borderTop: '1px solid var(--border-warm, #EAE6DF)',
          paddingTop: '16px'
        }}>
          <button 
            type="button" 
            title="Tặng người khác"
            onClick={() => showToast('Tính năng quà tặng đang được phát triển!', 'info')}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-warm, #EAE6DF)',
              borderRadius: '50%',
              background: '#ffffff',
              color: 'var(--stone-text-secondary, #57534e)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            className="card-action-btn"
          >
            <HiGift size={18} />
          </button>
          
          <button 
            type="button" 
            title="Chia sẻ khóa học"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast('Đã sao chép liên kết khóa học vào bộ nhớ tạm!', 'success');
            }}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-warm, #EAE6DF)',
              borderRadius: '50%',
              background: '#ffffff',
              color: 'var(--stone-text-secondary, #57534e)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            className="card-action-btn"
          >
            <HiShare size={18} />
          </button>

          <button 
            type="button" 
            title="Lưu khóa học"
            onClick={() => showToast('Đã lưu khóa học vào danh sách yêu thích!', 'success')}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-warm, #EAE6DF)',
              borderRadius: '50%',
              background: '#ffffff',
              color: 'var(--stone-text-secondary, #57534e)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            className="card-action-btn"
          >
            <HiBookmark size={18} />
          </button>
        </div>

      </div>

      {/* Trailer Video Modal Dialog */}
      {showTrailer && (
        <div 
          onClick={() => setShowTrailer(false)} 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{
              position: 'relative',
              width: '90%',
              maxWidth: '800px',
              aspectRatio: '16/9',
              background: '#000000',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <button 
              onClick={() => setShowTrailer(false)} 
              aria-label="Close trailer"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                color: '#ffffff',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <HiX size={20} />
            </button>
            <video
              src={trailerUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
              controls
              autoPlay
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
