import React from 'react';
import { HiSparkles } from 'react-icons/hi';
import PriceDisplay from '../shared/PriceDisplay';

export default function BundleSuggestion({ currentCourse, onCheckoutBundle }) {
  if (!currentCourse) return null;

  const isBlockA = currentCourse.block === 'Khối A00' || currentCourse.block === 'Khối A01';
  const comboTitle = isBlockA ? 'Combo Luyện Thi Khối A (Toán + Lý + Hóa)' : 'Combo Đột Phá Điểm Số Toàn Diện THPTQG';
  const bundleOriginal = 1500000;
  const bundleSale = 999000;

  const handleCheckout = () => {
    if (onCheckoutBundle) {
      onCheckoutBundle({ title: comboTitle, priceSale: bundleSale });
    }
  };

  return (
    <div className="bundle-suggestion animate-in">
      <div className="bundle-suggestion__badge">
        <HiSparkles /> Gợi ý tiết kiệm
      </div>
      <div className="bundle-suggestion__content">
        <div className="bundle-suggestion__desc">
          <h4 className="bundle-title">{comboTitle}</h4>
          <p className="bundle-text">
            Đăng ký học trọn gói các môn thi tốt nghiệp để nhận học phí ưu đãi tốt nhất từ EduPath. Giảm thêm <strong>30%</strong> so với đăng ký đơn lẻ từng môn học.
          </p>
        </div>
        <div className="bundle-suggestion__pricing">
          <PriceDisplay priceSale={bundleSale} priceOriginal={bundleOriginal} size="md" />
          <button
            type="button"
            onClick={handleCheckout}
            className="bundle-btn"
          >
            Đăng ký trọn gói
          </button>
        </div>
      </div>
    </div>
  );
}
