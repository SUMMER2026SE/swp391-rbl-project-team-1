import React, { useState, useMemo } from 'react';
import { HiStar, HiThumbUp, HiCheckCircle } from 'react-icons/hi';
import RatingStars from '../shared/RatingStars';

export default function ReviewSection({ reviews = [], onAddReview, currentUser, isOwned }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [starFilter, setStarFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const [votedReviews, setVotedReviews] = useState(new Set());

  const handleVoteHelpful = (id) => {
    if (votedReviews.has(id)) return;
    setHelpfulVotes(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    setVotedReviews(prev => {
      const copy = new Set(prev);
      copy.add(id);
      return copy;
    });
  };

  const handleAddCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onAddReview({
      rating,
      comment,
      student_name: currentUser?.fullName || currentUser?.name || 'Học viên ẩn danh',
      student_avatar: currentUser?.avatarUrl || currentUser?.avatar || 'U',
      created_at: new Date().toISOString()
    });
    setComment('');
    setRating(5);
  };

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 5.0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    if (starFilter !== 'All') {
      result = result.filter(r => r.rating === Number(starFilter));
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
    } else if (sortBy === 'high_rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'low_rating') {
      result.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === 'helpful') {
      result.sort((a, b) => {
        const countA = helpfulVotes[a.id] || 0;
        const countB = helpfulVotes[b.id] || 0;
        return countB - countA;
      });
    }

    return result;
  }, [reviews, starFilter, sortBy, helpfulVotes]);

  return (
    <div className="cr-card animate-in">
      <h3 className="detail-section-title">Đánh giá từ học viên</h3>

      <div className="cr-summary">
        <div className="cr-score">
          <div className="cr-score__num">{avgRating}</div>
          <div className="cr-score__stars">
            <RatingStars rating={Number(avgRating)} />
          </div>
          <div className="cr-score__count">{reviews.length} đánh giá thực tế</div>
        </div>
        
        <div className="cr-bars">
          {[5, 4, 3, 2, 1].map(num => {
            const count = reviews.filter(r => r.rating === num).length;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={num} className="cr-bar-row">
                <span className="cr-bar-num">{num} sao</span>
                <div className="cr-bar-bg">
                  <div className="cr-bar-fill" style={{ width: `${pct}%` }}></div>
                </div>
                <span className="cr-bar-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cr-divider" />

      <div className="cr-toolbar">
        <div className="cr-filter-chips">
          <button
            type="button"
            onClick={() => setStarFilter('All')}
            className={`cr-chip-btn ${starFilter === 'All' ? 'cr-chip-btn--active' : ''}`}
          >
            Tất cả
          </button>
          {[5, 4, 3, 2, 1].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => setStarFilter(num.toString())}
              className={`cr-chip-btn ${starFilter === num.toString() ? 'cr-chip-btn--active' : ''}`}
            >
              {num} sao
            </button>
          ))}
        </div>

        <div className="cr-sort">
          <label className="cr-sort-label">Sắp xếp:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="cr-sort-select"
          >
            <option value="newest">Mới nhất</option>
            <option value="helpful">Hữu ích nhất</option>
            <option value="high_rating">Đánh giá cao</option>
            <option value="low_rating">Đánh giá thấp</option>
          </select>
        </div>
      </div>

      {currentUser && isOwned && (
        <form onSubmit={handleAddCommentSubmit} className="cr-form">
          <h4 className="cr-form__title">Viết nhận xét của em:</h4>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--stone-text-secondary)', fontWeight: '700' }}>Chọn mức độ hài lòng:</span>
            <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <HiStar 
                  key={star} 
                  style={{ fontSize: '22px', color: star <= rating ? '#F59E0B' : 'var(--border-warm)' }} 
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <textarea
            placeholder="Hãy chia sẻ nhận xét chi tiết về giảng viên và bài học của khóa học..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="cr-textarea"
            required
            rows={3}
          />

          <button type="submit" className="cr-submit-btn">
            Gửi nhận xét
          </button>
        </form>
      )}

      <div className="cr-list">
        {filteredAndSortedReviews.length > 0 ? (
          filteredAndSortedReviews.map((rev, idx) => {
            const rId = rev.id || `r-${idx}`;
            const votesCount = helpfulVotes[rId] || 0;
            const hasVoted = votedReviews.has(rId);
            const avatarInitials = rev.student_name ? rev.student_name.slice(0, 2).toUpperCase() : 'U';

            return (
              <div key={rId} className="cr-item">
                <div className="cr-avatar">
                  {rev.student_avatar && rev.student_avatar.length > 2 ? (
                    <img src={rev.student_avatar} alt={rev.student_name} className="cr-avatar__img" />
                  ) : avatarInitials}
                </div>
                <div className="cr-item-body">
                  <div className="cr-author-row">
                    <span className="cr-author">{rev.student_name}</span>
                    <span className="cr-verified-badge"><HiCheckCircle /> Đã kiểm chứng</span>
                    <span className="cr-date">
                      {new Date(rev.created_at || rev.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  <div className="cr-item-stars">
                    <RatingStars rating={rev.rating} />
                  </div>

                  <p className="cr-text">{rev.comment}</p>

                  <div className="cr-item-actions">
                    <button
                      type="button"
                      onClick={() => handleVoteHelpful(rId)}
                      className={`cr-helpful-btn ${hasVoted ? 'cr-helpful-btn--voted' : ''}`}
                      disabled={hasVoted}
                    >
                      <HiThumbUp /> Hữu ích ({votesCount})
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="cr-empty">
            Chưa có đánh giá nào phù hợp với bộ lọc đã chọn.
          </div>
        )}
      </div>
    </div>
  );
}
