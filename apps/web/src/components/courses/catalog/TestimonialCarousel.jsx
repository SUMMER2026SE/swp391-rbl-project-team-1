import React, { useState, useEffect } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const TESTIMONIALS = [
  {
    name: 'Phan Tuấn Đạt',
    class: 'Học sinh lớp 12 chuyên Lý, Nam Định',
    improvement: 'Môn Toán: 6.8 -> 9.4 điểm THPTQG',
    comment: 'Lộ trình Adaptivity AI của EduPath thực sự là cứu cánh cho em. Đoạn nào em yếu, AI tự động gợi ý bài giảng ôn lý thuyết cơ bản và sinh thêm bài tập tương tự. Em đạt điểm ngoài mong đợi!',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop'
  },
  {
    name: 'Trần Minh Anh',
    class: 'Học sinh lớp 12 THPT Chu Văn An, Hà Nội',
    improvement: 'Môn Tiếng Anh: 5.5 -> 9.0 điểm THPTQG',
    comment: 'Các bài ôn luyện ngữ pháp ngắn gọn, dễ hiểu kết hợp với việc luyện đề thi thử bám sát đề chính thức giúp em cải thiện kỹ năng làm bài đáng kể. Giao diện tối Dark Mode cũng rất dễ chịu khi học đêm.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop'
  },
  {
    name: 'Lê Hoàng Hải',
    class: 'Học sinh lớp 12 THPT Chuyên Lê Hồng Phong, TP.HCM',
    improvement: 'Khối A00: 24.5 -> 28.2 điểm Đại học',
    comment: 'Trình duyệt video có phím tắt tiện lợi, ghi chú thời gian trực quan giúp em lưu các câu vận dụng cao để xem lại dễ dàng. Gia sư AI giải đáp thắc mắc lý thuyết siêu tốc như một người thầy kế bên.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop'
  }
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[index];

  return (
    <div className="testimonial-section">
      <h2 className="catalog-section-title">Câu chuyện thành công từ học viên</h2>
      <div className="testimonial-carousel">
        <button type="button" onClick={handlePrev} className="testimonial-carousel__btn testimonial-carousel__btn--prev" aria-label="Previous testimonial">
          <HiChevronLeft />
        </button>

        <div className="testimonial-card animate-in">
          <div className="testimonial-card__avatar">
            <img src={current.avatar} alt={current.name} />
          </div>
          <div className="testimonial-card__content">
            <div className="testimonial-card__header">
              <span className="testimonial-card__improvement">{current.improvement}</span>
              <h3 className="testimonial-card__name">{current.name}</h3>
              <span className="testimonial-card__class">{current.class}</span>
            </div>
            <p className="testimonial-card__comment">
              &ldquo;{current.comment}&rdquo;
            </p>
          </div>
        </div>

        <button type="button" onClick={handleNext} className="testimonial-carousel__btn testimonial-carousel__btn--next" aria-label="Next testimonial">
          <HiChevronRight />
        </button>
      </div>
      <div className="testimonial-dots">
        {TESTIMONIALS.map((_, idx) => (
          <span
            key={idx}
            className={`testimonial-dot ${idx === index ? 'testimonial-dot--active' : ''}`}
            onClick={() => setIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
}
