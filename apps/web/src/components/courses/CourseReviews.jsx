import { useState } from 'react';
import { HiStar, HiUser } from 'react-icons/hi';

export default function CourseReviews({ reviews, onAddReview, currentUser }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onAddReview({
      rating,
      comment,
      student_name: currentUser?.name || 'Học viên ẩn danh',
      student_avatar: currentUser?.avatar || 'U',
      created_at: new Date().toISOString()
    });
    setComment('');
    setRating(5);
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="cr-card animate-in">
      <h3 className="cr-title">
        ⭐ Đánh giá từ học viên
      </h3>

      {/* Summary Scorecard */}
      <div className="cr-summary">
        <div className="cr-score">
          <div className="cr-score__num">{avgRating}</div>
          <div className="cr-score__stars">
            {[1, 2, 3, 4, 5].map(star => (
              <HiStar key={star} style={{ opacity: star <= Math.round(Number(avgRating)) ? 1 : 0.2 }} />
            ))}
          </div>
          <div className="cr-score__count">{reviews.length} đánh giá thực tế</div>
        </div>
        
        <div className="cr-bars">
          {[5, 4, 3, 2, 1].map(num => {
            const count = reviews.filter(r => r.rating === num).length;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={num} className="cr-bar-row">
                <span style={{ width: '10px' }}>{num}</span>
                <HiStar style={{ color: '#F59E0B' }} />
                <div className="cr-bar-bg">
                  <div className="cr-bar-fill" style={{ width: `${pct}%` }}></div>
                </div>
                <span style={{ width: '24px', textAlign: 'right' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write a Review */}
      {currentUser && (
        <form onSubmit={handleSubmit} className="cr-form">
          <h4 className="cr-form__title">
            Viết nhận xét của bạn:
          </h4>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--stone-text-secondary)', fontWeight: '600' }}>Chọn số sao:</span>
            <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <HiStar 
                  key={star} 
                  style={{ fontSize: '20px', color: star <= rating ? '#F59E0B' : 'var(--border-warm)' }} 
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <textarea
            placeholder="Hãy chia sẻ cảm nghĩ của em về bài giảng của thầy cô..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="cr-textarea"
            required
            rows={3}
          />

          <button 
            type="submit" 
            className="cr-submit-btn"
          >
            Gửi đánh giá
          </button>
        </form>
      )}

      {/* Review List */}
      <div className="cr-list">
        {reviews.length > 0 ? (
          reviews.map((rev, idx) => (
            <div key={idx} className="cr-item">
              <div className="cr-avatar">
                {rev.student_avatar && rev.student_avatar.length <= 10 ? rev.student_avatar : 'U'}
              </div>
              <div className="cr-item-body">
                <div className="cr-author-row">
                  <strong className="cr-author">{rev.student_name}</strong>
                  <span className="cr-date">
                    {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                
                <div className="cr-item-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <HiStar key={star} style={{ fontSize: '13px', opacity: star <= rev.rating ? 1 : 0.2 }} />
                  ))}
                </div>

                <p className="cr-text">
                  {rev.comment}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ fontSize: '12.5px', color: 'var(--stone-text-secondary)', textAlign: 'center', padding: '16px 0', margin: 0 }}>
            Chưa có đánh giá nào cho khóa học này. Hãy học thử và gửi phản hồi đầu tiên nhé!
          </p>
        )}
      </div>
    </div>
  );
}
