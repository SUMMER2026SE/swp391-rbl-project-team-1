import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function RatingStars({ rating, showNumber = false, count }) {
  const stars = [];
  const roundedRating = Math.round(rating * 10) / 10;
  
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<FaStar key={i} className="rating-star rating-star--full" />);
    } else if (i - 0.5 <= rating) {
      stars.push(<FaStarHalfAlt key={i} className="rating-star rating-star--half" />);
    } else {
      stars.push(<FaRegStar key={i} className="rating-star rating-star--empty" />);
    }
  }

  return (
    <div className="rating-stars-container">
      {showNumber && <span className="rating-stars-value">{roundedRating.toFixed(1)}</span>}
      <div className="rating-stars-row">{stars}</div>
      {count !== undefined && <span className="rating-stars-count">({count.toLocaleString('vi-VN')})</span>}
    </div>
  );
}
