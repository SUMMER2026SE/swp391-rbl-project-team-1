import React from 'react';
import { 
  HiSearch, 
  HiCheck, 
  HiX, 
  HiCheckCircle, 
  HiOutlineExclamation, 
  HiLightBulb 
} from 'react-icons/hi';

export default function ExamReviewList({ questions = [], userAnswers = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <HiSearch style={{ color: 'var(--exams-purple)' }} /> XEM LẠI BÀI LÀM CHI TIẾT
      </h3>

      {questions.map((q) => {
        const qOptions = q.options || [];
        const correctAnswer = qOptions.find(o => o.is_correct);
        const selectedLabel = userAnswers[q.id]; // e.g. 'A', 'B'
        const isCorrect = correctAnswer && correctAnswer.option_label === selectedLabel;
        const isBlank = !selectedLabel;

        return (
          <div 
            key={q.id}
            style={{
              background: 'var(--bg-card, #ffffff)',
              border: `1px solid ${isBlank ? 'var(--border)' : (isCorrect ? 'rgba(0, 184, 148, 0.3)' : 'rgba(214, 48, 49, 0.3)')}`,
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
              <strong style={{ fontSize: '13.5px', color: 'var(--exams-purple)' }}>Câu {q.question_number}</strong>
              <span 
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: isBlank ? '#64748b' : (isCorrect ? 'var(--exams-green)' : 'var(--exams-red)'),
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isBlank ? 'CHƯA TRẢ LỜI' : isCorrect ? (
                  <>ĐÚNG <HiCheck /></>
                ) : (
                  <>SAI <HiX /></>
                )}
              </span>
            </div>

            {/* Question Text */}
            <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px', whiteSpace: 'pre-line', lineHeight: 1.5 }}>
              {q.question_text}
            </p>

            {q.question_image_url && (
              <div style={{ margin: '12px 0', textAlign: 'center' }}>
                <img src={q.question_image_url} alt="Minh họa" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
              </div>
            )}

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {qOptions.map((opt) => {
                const isCorrectOpt = opt.is_correct;
                const isSelectedOpt = selectedLabel === opt.option_label;

                let optionBg = 'transparent';
                let optionBorder = 'var(--border)';
                let showStatus = false;
                let isOptCorrect = false;

                if (isCorrectOpt) {
                  optionBg = 'rgba(0, 184, 148, 0.08)';
                  optionBorder = 'var(--exams-green)';
                  showStatus = true;
                  isOptCorrect = true;
                } else if (isSelectedOpt && !isCorrectOpt) {
                  optionBg = 'rgba(214, 48, 49, 0.08)';
                  optionBorder = 'var(--exams-red)';
                  showStatus = true;
                  isOptCorrect = false;
                }

                return (
                  <div 
                    key={opt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: `1px solid ${optionBorder}`,
                      background: optionBg,
                      fontSize: '13px'
                    }}
                  >
                    <span 
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: isCorrectOpt ? 'var(--exams-green)' : (isSelectedOpt ? 'var(--exams-red)' : 'var(--bg-main)'),
                        color: (isCorrectOpt || isSelectedOpt) ? '#fff' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '11px',
                        flexShrink: 0
                      }}
                    >
                      {opt.option_label}
                    </span>
                    <span style={{ color: 'var(--text-primary)', flex: 1 }}>{opt.option_text}</span>
                    {showStatus && (
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 'bold', 
                        color: isOptCorrect ? 'var(--exams-green)' : 'var(--exams-red)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        {isOptCorrect ? (
                          <><HiCheckCircle /> (Đáp án đúng)</>
                        ) : (
                          <><HiOutlineExclamation /> (Lựa chọn của bạn)</>
                        )}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation box */}
            {(q.explanation || correctAnswer) && (
              <div 
                style={{
                  background: 'var(--bg-main, #f8fafc)',
                  borderRadius: '10px',
                  padding: '14px',
                  borderLeft: '3px solid var(--exams-purple)',
                  fontSize: '12.5px',
                  color: 'var(--text-secondary)'
                }}
              >
                <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--exams-purple)', marginBottom: '4px' }}>
                  <HiLightBulb /> Hướng dẫn giải chi tiết:
                </strong>
                <p style={{ margin: 0, whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                  {q.explanation || `Đáp án đúng là ${correctAnswer?.option_label}.`}
                </p>
                {q.topic && (
                  <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '11px', background: 'var(--exams-purple-bg)', color: 'var(--exams-purple)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    Chủ đề: {q.topic}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
