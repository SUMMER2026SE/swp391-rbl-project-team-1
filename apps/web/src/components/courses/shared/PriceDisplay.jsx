import React from 'react';

export default function PriceDisplay({ priceSale, priceOriginal, size = 'md' }) {
  const formatVnd = (val) => {
    if (val === 0) return 'Miễn phí';
    return `${val.toLocaleString('vi-VN')}đ`;
  };

  const hasDiscount = priceOriginal && priceOriginal > priceSale;
  const discountPercent = hasDiscount ? Math.round(((priceOriginal - priceSale) / priceOriginal) * 100) : 0;

  return (
    <div className={`price-display price-display--${size}`}>
      <span className="price-display__sale">
        {formatVnd(priceSale)}
      </span>
      {hasDiscount && (
        <>
          <span className="price-display__original">
            {formatVnd(priceOriginal)}
          </span>
          <span className="price-display__discount">
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
}
