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
    <div className="card animate-in" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '18px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
        ⭐ ĐÁNH GIÁ TỪ HỌC VIÊN
      </h3>

      {/* Summary Scorecard */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', background: 'var(--bg-main)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: '950', color: 'var(--primary)' }}>{avgRating}</div>
          <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', color: '#F59E0B', margin: '4px 0' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <HiStar key={star} style={{ opacity: star <= Math.round(Number(avgRating)) ? 1 : 0.2 }} />
            ))}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{reviews.length} đánh giá thực tế</div>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[5, 4, 3, 2, 1].map(num => {
            const count = reviews.filter(r => r.rating === num).length;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                <span style={{ width: '10px' }}>{num}</span>
                <HiStar style={{ color: '#F59E0B' }} />
                <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                </div>
                <span style={{ width: '24px', textAlign: 'right' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write a Review */}
      {currentUser && (
        <form onSubmit={handleSubmit} style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: '12px', background: 'var(--bg-card)', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '10px' }}>
            Viết nhận xét của bạn:
          </h4>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Chọn số sao:</span>
            <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <HiStar 
                  key={star} 
                  style={{ fontSize: '20px', color: star <= rating ? '#F59E0B' : 'var(--border)' }} 
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <textarea
            placeholder="Hãy chia sẻ cảm nghĩ của em về bài giảng của thầy cô..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="form-control"
            required
            rows={3}
            style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '8px', outline: 'none', background: 'var(--bg-main)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          />

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ marginTop: '10px', padding: '8px 18px', fontSize: '12.5px', borderRadius: '8px' }}
          >
            Gửi đánh giá
          </button>
        </form>
      )}

      {/* Review List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {reviews.length > 0 ? (
          reviews.map((rev, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px', flexShrink: 0 }}>
                {rev.student_avatar && rev.student_avatar.length <= 10 ? rev.student_avatar : 'U'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{rev.student_name}</strong>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '2px', color: '#F59E0B', margin: '4px 0' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <HiStar key={star} style={{ fontSize: '12px', opacity: star <= rev.rating ? 1 : 0.2 }} />
                  ))}
                </div>

                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {rev.comment}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px 0' }}>Chưa có đánh giá nào cho khóa học này. Hãy học thử và gửi phản hồi đầu tiên nhé!</p>
        )}
      </div>
    </div>
  );
}
