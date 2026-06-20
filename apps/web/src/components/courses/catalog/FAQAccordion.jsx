import React, { useState } from 'react';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

const FAQS = [
  {
    q: 'Khóa học có đi kèm lộ trình ôn thi cụ thể không?',
    a: 'Có. Mỗi khóa học của EduPath đều được xây dựng lộ trình ôn tập khoa học theo từng tuần, từng chương. Đặc biệt, Cố vấn AI sẽ tự động phân tích kết quả thi thử để gợi ý bài học cần ôn luyện bù đắp kiến thức bị hổng của riêng em.'
  },
  {
    q: 'Làm thế nào để hỏi bài giảng viên khi em gặp thắc mắc?',
    a: 'Em có thể đặt câu hỏi ngay tại mục "Hỏi Giáo viên" trong khung phát bài giảng video hoặc tham gia thảo luận trực tiếp cùng cộng đồng học viên học cùng chuyên mục. Thầy cô và trợ giảng của EduPath luôn giải đáp chi tiết trong vòng 24 giờ.'
  },
  {
    q: 'Adaptive AI hoạt động như thế nào trong khóa học?',
    a: 'Khi em làm các bài kiểm tra trắc nghiệm, Adaptive AI sẽ chẩn đoán chính xác những phần kiến thức em nắm chưa chắc, từ đó đề xuất đúng bài giảng lý thuyết và sinh các câu hỏi tương tự để em rèn luyện kỹ năng phản xạ đề.'
  },
  {
    q: 'Em có thể tải tài liệu học tập của khóa học về máy không?',
    a: 'Hoàn toàn được. Toàn bộ sổ tay công thức, slide sơ đồ tư duy lý thuyết và kho bài tập tự luyện có đáp án chi tiết đều được lưu trữ trên Google Drive tốc độ cao để em dễ dàng lưu về máy hoặc in ra tự học.'
  },
  {
    q: 'Chính sách hoàn tiền khi đăng ký khóa học trả phí như thế nào?',
    a: 'EduPath cam kết hoàn tiền 100% học phí trong vòng 7 ngày kể từ lúc kích hoạt khóa học nếu học viên cảm thấy không hài lòng với chất lượng bài giảng hoặc phương pháp sư phạm, không cần chứng minh lý do phức tạp.'
  },
  {
    q: 'Lớp học trực tiếp (Live Class) tương tác diễn ra vào khi nào?',
    a: 'Đối với các khóa luyện thi THPTQG nâng cao, ngoài video bài giảng quay sẵn, giảng viên sẽ tổ chức các buổi Live Class hàng tuần để tổng ôn chuyên đề khó, hướng dẫn mẹo giải nhanh và trực tiếp trả lời thắc mắc của học sinh.'
  }
];

export default function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="faq-accordion-section">
      <h2 className="catalog-section-title">Câu hỏi thường gặp</h2>
      <div className="faq-accordion">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className={`faq-row ${isOpen ? 'faq-row--open' : ''}`}>
              <button type="button" onClick={() => toggle(idx)} className="faq-row__question">
                <span>{faq.q}</span>
                {isOpen ? <HiChevronUp className="faq-row__arrow" /> : <HiChevronDown className="faq-row__arrow" />}
              </button>
              {isOpen && (
                <div className="faq-row__answer animate-in">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
