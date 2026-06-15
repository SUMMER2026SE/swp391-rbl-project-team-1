import React from 'react';
import { 
  HiSparkles, 
  HiOutlineExclamation, 
  HiCalendar,
  HiLightBulb
} from 'react-icons/hi';
import { FaRobot } from 'react-icons/fa';

export default function AiExamFeedback({ feedback }) {
  if (!feedback) return null;

  // Ensure feedback is parsed if it was stored as string
  const data = typeof feedback === 'string' ? JSON.parse(feedback) : feedback;

  const strengths = data.strengths || [];
  const weaknesses = data.weaknesses || [];
  const suggestedTopics = data.suggestedTopics || [];
  const studyPlan = data.studyPlan || [];
  const advice = data.aiAdvice || '';

  return (
    <div className="ai-feedback-container animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
        <FaRobot style={{ fontSize: '28px', color: 'var(--exams-purple)' }} />
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '950', color: 'var(--exams-purple)', margin: 0 }}>
            CHẨN ĐOÁN HỌC TẬP TỪ TRỢ LÝ AI EDUBOT
          </h3>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Phân tích tự động dựa trên kết quả làm bài trắc nghiệm thích ứng</span>
        </div>
      </div>

      {/* Main Advice Summary */}
      {advice && (
        <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0, padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: '3px solid var(--exams-purple)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <HiLightBulb style={{ fontSize: '18px', color: 'var(--exams-purple)', flexShrink: 0, marginTop: '2px' }} />
          <span>{advice}</span>
        </p>
      )}

      {/* Strengths & Weaknesses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Strengths */}
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0, 184, 148, 0.2)' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--exams-green)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HiSparkles style={{ fontSize: '16px', color: 'var(--exams-green)' }} /> Điểm mạnh nổi bật:
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {strengths.map((s, idx) => (
              <li key={idx} style={{ lineHeight: 1.4 }}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(214, 48, 49, 0.2)' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--exams-red)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HiOutlineExclamation style={{ fontSize: '16px', color: 'var(--exams-red)' }} /> Điểm yếu & Lỗ hổng:
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {weaknesses.map((w, idx) => (
              <li key={idx} style={{ lineHeight: 1.4 }}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Topics */}
      {suggestedTopics.length > 0 && (
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
            🎯 Chuyên đề cần ưu tiên ôn tập lại:
          </h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {suggestedTopics.map((t, idx) => (
              <span 
                key={idx} 
                style={{
                  padding: '6px 12px',
                  fontSize: '11.5px',
                  background: 'var(--exams-purple-bg)',
                  color: 'var(--exams-purple)',
                  borderRadius: '16px',
                  fontWeight: 'bold'
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 7-Day Study Plan */}
      {studyPlan.length > 0 && (
        <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HiCalendar style={{ fontSize: '16px', color: 'var(--exams-purple)' }} /> Kế hoạch hành động 7 ngày khắc phục lỗi sai:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {studyPlan.map((d) => (
              <div 
                key={d.day}
                className="study-plan-day-card"
                style={{
                  background: 'var(--bg-card)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <strong style={{ fontSize: '12.5px', color: 'var(--exams-purple)', display: 'block', marginBottom: '2px' }}>
                  Ngày {d.day}:
                </strong>
                <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {d.task}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
