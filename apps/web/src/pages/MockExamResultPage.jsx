import React, { useState, useEffect } from 'react';
import ExamResultSummary from '../components/mock-exams/ExamResultSummary';
import ExamReviewList from '../components/mock-exams/ExamReviewList';
import AiExamFeedback from '../components/mock-exams/AiExamFeedback';
import { mockExamService } from '../services/mockExamService';

export default function MockExamResultPage({ examId, attemptId, currentUser, navigateTo }) {
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  const loadResultDetails = async () => {
    setLoading(true);
    try {
      // 1. Fetch result summary
      const resultData = await mockExamService.getExamResult(attemptId);
      setResult(resultData);

      // 2. Fetch exam questions and their options
      const qs = await mockExamService.getExamQuestions(examId);
      const questionsWithOptions = await Promise.all(
        qs.map(async (q) => {
          const opts = await mockExamService.getExamOptions(q.id);
          return { ...q, options: opts };
        })
      );
      setQuestions(questionsWithOptions);

      // 3. Fetch user chosen answers
      const answersList = await mockExamService.getAttemptAnswers(attemptId);
      const answersMap = {};
      answersList.forEach(ans => {
        answersMap[ans.question_id] = ans.selected_option_label;
      });
      setUserAnswers(answersMap);
    } catch (err) {
      console.error('Lỗi nạp kết quả thi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResultDetails();
  }, [examId, attemptId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '30px', animation: 'pulse 1.5s infinite alternate' }}>⏳</div>
        <p style={{ marginTop: '12px', fontSize: '13px' }}>Đang nạp bảng điểm và phân tích từ AI...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <span style={{ fontSize: '48px' }}>⚠️</span>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '16px 0 8px 0', color: 'var(--text-primary)' }}>Không tìm thấy kết quả</h3>
        <button className="btn-primary" onClick={() => navigateTo('/mock-exams')} style={{ marginTop: '12px' }}>
          Quay lại danh mục đề thi
        </button>
      </div>
    );
  }

  const aiFeedback = result.ai_feedback ? JSON.parse(result.ai_feedback) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto', padding: '0 16px 40px 16px' }} className="animate-in">
      {/* Top Navigation Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button 
          onClick={() => navigateTo(`/mock-exams/${examId}`)}
          style={{
            border: 'none', background: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          ← Quay lại trang chi tiết đề thi
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-outline"
            onClick={() => navigateTo('/mock-exams')}
            style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Danh mục đề thi
          </button>
          <button 
            className="btn-primary"
            onClick={() => navigateTo(`/mock-exams/${examId}/start`)}
            style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: 'bold', background: 'var(--exams-purple)', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Thi thử lại ⚡
          </button>
        </div>
      </div>

      {/* 1. Score Summary Dials Card */}
      <ExamResultSummary 
        result={result} 
        durationSeconds={result.duration_seconds || 0} 
      />

      {/* 2. AI Diagnostics section */}
      {aiFeedback && (
        <AiExamFeedback feedback={aiFeedback} />
      )}

      {/* 3. Question review checklist */}
      <ExamReviewList 
        questions={questions} 
        userAnswers={userAnswers} 
      />

      {/* Bottom CTA triggers */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
        <button 
          className="btn-outline"
          onClick={() => navigateTo('/mock-exams')}
          style={{ padding: '12px 24px', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Quay lại trang chủ đề thi
        </button>
        <button 
          className="btn-primary"
          onClick={() => navigateTo(`/mock-exams/${examId}/start`)}
          style={{ padding: '12px 24px', fontSize: '13.5px', fontWeight: 'bold', background: 'var(--exams-purple)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(108, 92, 231, 0.2)' }}
        >
          Thi thử lại đề này ⚡
        </button>
      </div>
    </div>
  );
}
