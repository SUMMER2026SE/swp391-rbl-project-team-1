import React from 'react';

export default function ExamSubmitModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  totalQuestions, 
  answeredCount 
}) {
  if (!isOpen) return null;

  const unansweredCount = totalQuestions - answeredCount;
  const isWarning = unansweredCount > 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div 
        className="animate-in"
        style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          padding: '28px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '48px' }}>🚨</span>
          <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)', margin: '12px 0 6px 0' }}>
            XÁC NHẬN NỘP BÀI THI
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Bạn có chắc chắn muốn kết thúc bài thi thử này và nộp bài?
          </p>
        </div>

        <div style={{
          background: 'var(--bg-main, #f8fafc)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          border: '1px solid var(--border, #e2e8f0)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Tổng số câu hỏi:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{totalQuestions} câu</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Đã làm:</span>
            <strong style={{ color: 'var(--exams-green)' }}>{answeredCount} câu</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Chưa làm:</span>
            <strong style={{ color: isWarning ? 'var(--exams-red)' : 'var(--text-primary)' }}>{unansweredCount} câu</strong>
          </div>
        </div>

        {isWarning && (
          <div style={{
            background: 'rgba(214, 48, 49, 0.08)',
            borderLeft: '4px solid var(--exams-red)',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '12.5px',
            color: 'var(--exams-red)',
            lineHeight: 1.4
          }}>
            ⚠️ <strong>Cảnh báo:</strong> Bạn vẫn còn <strong>{unansweredCount} câu hỏi</strong> chưa điền câu trả lời. Hệ thống sẽ tính các câu này là câu sai hoặc bỏ trống!
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-outline" 
            onClick={onClose}
            style={{ flex: 1, padding: '12px', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Quay lại làm tiếp
          </button>
          <button 
            className="btn-primary" 
            onClick={onSubmit}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--exams-purple)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(108, 92, 231, 0.2)'
            }}
          >
            Đồng ý nộp bài ⚡
          </button>
        </div>
      </div>
    </div>
  );
}
