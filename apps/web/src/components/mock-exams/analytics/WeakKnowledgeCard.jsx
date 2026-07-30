import React from 'react';
import { HiExclamation, HiLightningBolt, HiArrowRight } from 'react-icons/hi';
import { toast } from '../../../utils/toast';

export default function WeakKnowledgeCard({ weakKnowledgeList, onStartPractice }) {
  const handlePracticeClick = (item) => {
    toast(`⚡ Đang vào thẳng bài thi 20 câu cho chủ đề "${item.subTopic}"...`, 'info');
    if (onStartPractice) onStartPractice(item);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(214, 48, 49, 0.05) 0%, rgba(253, 203, 110, 0.08) 100%)',
      border: '1.5px solid rgba(214, 48, 49, 0.2)',
      borderRadius: '16px',
      padding: '22px',
      marginBottom: '28px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'rgba(214, 48, 49, 0.12)',
            color: 'var(--exams-red, #d63031)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            <HiExclamation />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)' }}>
              CẢNH BÁO VÙNG KIẾN THỨC CẦN CẢI THIỆN (AI DETECTED)
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              AI phát hiện các chủ đề có tỷ lệ câu hỏi sai cao nhất qua các bài thi gần đây
            </span>
          </div>
        </div>
      </div>

      {weakKnowledgeList.length === 0 ? (
        <div style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px dashed var(--border)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '13.5px',
          fontWeight: '600'
        }}>
          🎉 Chưa phát hiện vùng kiến thức yếu. Hãy hoàn thành thêm bài thi thử để AI hỗ trợ phát hiện điểm cần cải thiện!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {weakKnowledgeList.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(108, 92, 231, 0.1)',
                    color: 'var(--exams-purple)'
                  }}>
                    {item.subject}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                    {item.topic}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {item.subTopic}
                </h4>

                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  💡 <strong>Gợi ý AI:</strong> {item.recommendation}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--exams-red)' }}>
                    {item.mistakes} <span style={{ fontSize: '11px' }}>lỗi</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Số lỗi đã mắc</span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--exams-orange)' }}>
                    {item.accuracy}%
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Tỷ lệ đúng</span>
                </div>

                <button
                  onClick={() => handlePracticeClick(item)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #d63031 0%, #ff7675 100%)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(214, 48, 49, 0.25)',
                    transition: 'all 0.2s'
                  }}
                >
                  <HiLightningBolt /> Luyện 20 câu <HiArrowRight />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
