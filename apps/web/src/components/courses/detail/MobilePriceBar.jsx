import React from 'react';
import { HiLightningBolt, HiPlay } from 'react-icons/hi';

export default function MobilePriceBar({ course, isOwned, onEnroll }) {
  const { priceOriginal, priceSale } = course;

  const formatCompactPrice = (price) => {
    if (price === 0) return 'Miễn phí';
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1).replace('.0', '')}M đ`;
    }
    if (price >= 1000) {
      return `${Math.round(price / 1000)}K đ`;
    }
    return `${price.toLocaleString('vi-VN')} đ`;
  };

  return (
    <div className="mobile-price-bar" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '72px',
      background: '#ffffff',
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      zIndex: 9999,
      boxSizing: 'border-box'
    }}>
      {/* Price section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary, #2D3436)', whiteSpace: 'nowrap' }}>
            {formatCompactPrice(priceSale)}
          </span>
          {priceOriginal > priceSale && (
            <span style={{ fontSize: '12px', textDecoration: 'line-through', color: 'var(--text-muted, #B2BEC3)' }}>
              {formatCompactPrice(priceOriginal)}
            </span>
          )}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--accent-red, #E74C3C)', fontWeight: 'bold' }}>
          Đang giảm giá đặc biệt
        </div>
      </div>

      {/* Button Action */}
      <div>
        {isOwned ? (
          <button
            type="button"
            onClick={() => onEnroll('learn')}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--accent-green, #00B894)',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <HiPlay size={16} />
            Vào học ngay
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onEnroll('buy')}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: 'none',
              background: 'var(--primary, #6C5CE7)',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <HiLightningBolt size={16} />
            Đăng ký ngay
          </button>
        )}
      </div>
    </div>
  );
}
