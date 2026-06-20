import React, { useState } from 'react';
import { HiAcademicCap, HiSparkles, HiCheckCircle, HiStar, HiX, HiArrowRight } from 'react-icons/hi';
import RatingStars from '../shared/RatingStars';

export default function CompletionModal({ 
  isOpen, 
  onClose, 
  courseTitle = 'Khóa học', 
  stats = { totalLessons: 10, totalQuizzes: 5, averageScore: 85 },
  onRequestCertificate,
  onSubmitCourseReview
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [certRequested, setCertRequested] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  if (!isOpen) return null;

  const handleRequestCertificate = async () => {
    setRequestLoading(true);
    try {
      if (onRequestCertificate) {
        await onRequestCertificate();
      }
      setCertRequested(true);
    } catch (err) {
      console.error(err);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingReview) return;
    setIsSubmittingReview(true);
    try {
      if (onSubmitCourseReview) {
        await onSubmitCourseReview({ rating, text: reviewText });
      }
      setReviewSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="completion-modal-overlay animate-fade-in">
      {/* Visual background decorations for celebration effect */}
      <div className="celebration-particles">
        <div className="particle color-1"></div>
        <div className="particle color-2"></div>
        <div className="particle color-3"></div>
        <div className="particle color-4"></div>
        <div className="particle color-5"></div>
      </div>

      <div className="completion-modal-card animate-scale-in">
        <button type="button" onClick={onClose} className="completion-close-btn">
          <HiX />
        </button>

        <div className="completion-modal-header">
          <div className="trophy-wrapper">
            <HiAcademicCap className="academic-icon" />
            <HiSparkles className="sparkles-icon" />
          </div>
          <h2>Chúc Mừng Hoàn Thành!</h2>
          <p className="course-title-sub">Em đã xuất sắc hoàn thành khóa học</p>
          <h3 className="course-title-highlight">{courseTitle}</h3>
        </div>

        <div className="completion-modal-body">
          <div className="completion-stats-grid">
            <div className="stat-card">
              <span className="stat-value">{stats.totalLessons}</span>
              <span className="stat-label">Bài học đã xem</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.totalQuizzes}</span>
              <span className="stat-label">Bài tập hoàn thành</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.averageScore}%</span>
              <span className="stat-label">Điểm trung bình</span>
            </div>
          </div>

          <div className="certificate-section">
            <h4>Chứng nhận học tập</h4>
            <p>Chứng chỉ ghi nhận nỗ lực ôn thi THPT Quốc Gia của em từ EduPath.</p>
            {certRequested ? (
              <div className="cert-status-alert">
                <HiCheckCircle className="success-icon" />
                <span>Yêu cầu cấp chứng chỉ thành công. Đang chờ hệ thống phê duyệt!</span>
              </div>
            ) : (
              <button 
                type="button" 
                onClick={handleRequestCertificate} 
                className="btn-request-cert"
                disabled={requestLoading}
              >
                {requestLoading ? 'Đang gửi...' : 'Đăng ký nhận chứng chỉ số'} <HiArrowRight />
              </button>
            )}
          </div>

          <div className="course-feedback-section">
            <h4>Đánh giá khóa học</h4>
            {reviewSubmitted ? (
              <div className="feedback-status-alert">
                <HiCheckCircle className="success-icon" />
                <span>Cảm ơn em đã gửi đánh giá khóa học giúp EduPath hoàn thiện hơn!</span>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="feedback-form">
                <div className="feedback-stars-selector">
                  <span>Mức độ hài lòng của em:</span>
                  <div className="stars-interactive-row">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= (hoverRating || rating) ? 'star-btn--filled' : ''}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <HiStar />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Viết một vài cảm nhận, ý kiến góp ý của em về khóa học này nhé..."
                  rows={3}
                  className="feedback-textarea"
                  required
                />

                <button 
                  type="submit" 
                  className="btn-submit-feedback"
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="completion-modal-footer">
          <button type="button" onClick={onClose} className="btn-close-modal">
            Tiếp tục học tập
          </button>
        </div>
      </div>
    </div>
  );
}
