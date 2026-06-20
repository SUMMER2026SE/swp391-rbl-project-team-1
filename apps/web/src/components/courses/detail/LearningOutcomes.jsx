import React from 'react';
import { HiCheck } from 'react-icons/hi';

const DEFAULT_OUTCOMES = [
  'Nắm vững toàn bộ kiến thức trọng tâm bám sát cấu trúc của Bộ GD&ĐT.',
  'Thành thạo phương pháp phân tích nhanh, loại trừ trắc nghiệm chuẩn xác.',
  'Học các mẹo giải nhanh bằng máy tính Casio giúp tiết kiệm thời gian làm bài.',
  'Tránh những bẫy nhận biết và thông hiểu kinh điển thường gặp trong đề thi.',
  'Tiếp cận kho đề thi thử phong phú có lời giải chi tiết và video sửa lỗi sai.',
  'Tự đánh giá năng lực qua bài thi kiểm tra đầu vào và định kỳ bằng Adaptive AI.',
  'Tự tin nâng điểm số cấp tốc để đỗ nguyện vọng mong muốn vào trường Đại học.',
  'Gia tăng tư duy phản xạ đề thi thực tế một cách hệ thống và khoa học nhất.'
];

export default function LearningOutcomes({ outcomes }) {
  const list = outcomes && outcomes.length > 0 ? outcomes : DEFAULT_OUTCOMES;

  return (
    <div className="learning-outcomes">
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: '800', 
        marginBottom: '16px', 
        color: 'var(--stone-text-main, #292524)' 
      }}>
        Bạn sẽ học được gì
      </h3>
      <div className="learning-outcomes__grid">
        {list.map((item, idx) => (
          <div key={idx} className="learning-outcomes__item" style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <HiCheck className="outcome-icon" style={{
              color: 'var(--primary, #6C5CE7)',
              fontSize: '18px',
              flexShrink: 0,
              marginTop: '2px'
            }} />
            <span className="outcome-text" style={{
              fontSize: '14.5px',
              lineHeight: '1.55',
              color: 'var(--stone-text-secondary, #57534e)'
            }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
