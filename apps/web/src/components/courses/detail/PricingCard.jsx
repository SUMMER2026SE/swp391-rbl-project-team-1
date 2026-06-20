import React from 'react';
import { 
  HiShoppingCart, 
  HiCheck, 
  HiCode, 
  HiQuestionMarkCircle, 
  HiDocumentText 
} from 'react-icons/hi';

export default function PricingCard({ course, isOwned, onEnroll }) {
  const {
    price = 0,
    priceSale = 0
  } = course;

  // Format currency helper
  const formatPrice = (val) => {
    return Number(val).toLocaleString('vi-VN') + ' đ';
  };

  // Calculate discount percentage
  const discountPercent = price > 0 && priceSale < price
    ? Math.round(((price - priceSale) / price) * 100)
    : 0;

  const handleAction = () => {
    if (isOwned) {
      onEnroll('learn');
    } else {
      onEnroll('cart');
    }
  };

  return (
    <div className="fts-pricing animate-in">
      {/* Price block */}
      <div className="fts-pricing-price-row">
        <span className="fts-pricing-sale">
          {formatPrice(priceSale)}
        </span>
        {price > priceSale && (
          <>
            <span className="fts-pricing-original">
              {formatPrice(price)}
            </span>
            <span className="fts-pricing-discount-badge">
              Giảm {discountPercent}%
            </span>
          </>
        )}
      </div>

      {/* CTA Button */}
      <button 
        type="button" 
        className="fts-pricing-cta"
        onClick={handleAction}
      >
        <HiShoppingCart style={{ fontSize: '18px' }} />
        <span>{isOwned ? 'Vào học ngay' : 'Thêm giỏ hàng'}</span>
      </button>

      <hr className="fts-pricing-divider" />

      {/* Includes checklist */}
      <div className="fts-pricing-includes">
        <h4 className="fts-pricing-includes-title">Khoá học này bao gồm</h4>
        <ul className="fts-pricing-checklist">
          <li className="fts-pricing-checklist-item">
            <HiCheck className="fts-pricing-check-icon" />
            <span className="fts-pricing-check-label">Lộ trình chất lượng cam kết đầu ra</span>
          </li>
          <li className="fts-pricing-checklist-item">
            <HiCode className="fts-pricing-check-icon" />
            <span className="fts-pricing-check-label">Học phần chi tiết, có bài tập để luyện tập hàng ngày</span>
          </li>
          <li className="fts-pricing-checklist-item">
            <HiQuestionMarkCircle className="fts-pricing-check-icon" />
            <span className="fts-pricing-check-label">Có nhóm hỏi đáp thắc mắc 24/7</span>
          </li>
          <li className="fts-pricing-checklist-item">
            <HiDocumentText className="fts-pricing-check-icon" />
            <span className="fts-pricing-check-label">Tài liệu tổng hợp đầy đủ</span>
          </li>
        </ul>
      </div>

      {/* Preview note */}
      <p className="fts-pricing-preview-note">
        Bạn đang xem preview của khóa học này. Để truy cập đầy đủ nội dung, vui lòng đăng ký khóa học.
      </p>
    </div>
  );
}
