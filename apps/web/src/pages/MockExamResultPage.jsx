import React, { useState, useEffect } from 'react';
import ExamResultSummary from '../components/mock-exams/ExamResultSummary';
import ExamReviewList from '../components/mock-exams/ExamReviewList';
import TrustScoreCard from '../components/mock-exams/TrustScoreCard';
import TopicAnalysisChart from '../components/mock-exams/TopicAnalysisChart';
import DifficultyChart from '../components/mock-exams/DifficultyChart';
import CapabilityAnalysis from '../components/mock-exams/CapabilityAnalysis';
import AiCoachCard from '../components/mock-exams/AiCoachCard';
import SmartRetakeOptions from '../components/mock-exams/SmartRetakeOptions';
import ExamReplayTimeline from '../components/mock-exams/ExamReplayTimeline';
import { mockExamService } from '../services/mockExamService';
import { toast } from '../utils/toast';

const TABS = [
  { key: 'overview', label: '📊 Tổng quan' },
  { key: 'analysis', label: '📈 Phân tích' },
  { key: 'coach', label: '🤖 AI Coach' },
  { key: 'review', label: '📝 Xem lại bài' },
  { key: 'replay', label: '📼 Replay' }
];

export default function MockExamResultPage({ examId, attemptId, currentUser, navigateTo }) {
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [events, setEvents] = useState([]);
  const [coachPlan, setCoachPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadResultDetails = async () => {
    setLoading(true);
    try {
      const resultData = await mockExamService.getExamResult(attemptId);
      setResult(resultData);

      if (resultData?.questions?.length > 0) {
        setQuestions(resultData.questions);
      } else {
        const qs = await mockExamService.getExamQuestions(examId);
        const withOpts = await Promise.all(
          qs.map(async (q) => {
            const opts = await mockExamService.getExamOptions(q.id);
            return { ...q, options: opts };
          })
        );
        setQuestions(withOpts);
      }

      const answersList = await mockExamService.getAttemptAnswers(attemptId);
      const answersMap = {};
      answersList.forEach(ans => {
        answersMap[ans.question_id] = ans.selected_option_label;
      });
      setUserAnswers(answersMap);

      // Load analytics (topicStats, difficultyStats, trust score)
      const analyticsData = await mockExamService.getAttemptAnalytics(attemptId);
      if (analyticsData) {
        setAnalytics(analyticsData);
      }

      // Extract coach plan from existing aiFeedback if present
      if (resultData?.ai_feedback) {
        try {
          const fb = typeof resultData.ai_feedback === 'string'
            ? JSON.parse(resultData.ai_feedback)
            : resultData.ai_feedback;
          if (fb?.coachPlan) setCoachPlan(fb.coachPlan);
        } catch (_) {}
      }
    } catch (err) {
      console.error('Lỗi nạp kết quả thi:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    if (events.length > 0) return;
    setEventsLoading(true);
    try {
      const data = await mockExamService.getExamEvents(attemptId);
      setEvents(data);
    } catch (_) {
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleGenerateCoach = async () => {
    setCoachLoading(true);
    try {
      const plan = await mockExamService.generateAiCoach(attemptId);
      if (plan) {
        setCoachPlan(plan);
        toast('AI Coach đã tạo kế hoạch học 7 ngày cho bạn!', 'success');
      }
    } catch (_) {
      toast('Không thể tạo kế hoạch AI Coach. Vui lòng thử lại.', 'error');
    } finally {
      setCoachLoading(false);
    }
  };

  const handleRetake = async (eid, mode, aid) => {
    if (mode === 'bookmarked') {
      const bookmarkedKeys = Object.keys(
        JSON.parse(localStorage.getItem(`exam_taking_bookmarks_${examId}`) || '{}')
      );
      const bookmarkedQuestions = questions.filter(q => bookmarkedKeys.includes(String(q.id)));
      if (bookmarkedQuestions.length === 0) {
        toast('Không có câu hỏi đánh dấu nào!', 'warning');
        return;
      }
      
      const mappedQuestions = bookmarkedQuestions.map(q => {
        const dbOptions = q.options?.map(opt => ({
          label: opt.option_label,
          text: opt.option_text
        })) || [];
        
        let dbDifficulty = 'MEDIUM';
        if (q.difficulty === 'Dễ') dbDifficulty = 'EASY';
        else if (q.difficulty === 'Khó') dbDifficulty = 'HARD';

        return {
          id: Number(q.id),
          content: q.question_text,
          options: dbOptions,
          subject: result?.mock_exams?.subject || '',
          topic: q.topic,
          difficulty: dbDifficulty,
          imageUrl: q.question_image_url || null,
          explanation: q.explanation
        };
      });

      const retake = {
        exam: {
          id: Number(examId),
          title: `${result?.mock_exams?.title || 'Đề thi'} — Làm lại câu đánh dấu`,
          subject: result?.mock_exams?.subject || '',
          duration: Math.max(15, Math.ceil(mappedQuestions.length * 1.5)),
          totalQuestions: mappedQuestions.length,
          retakeMode: 'bookmarked',
          sourceExamId: Number(examId),
          sourceAttemptId: attemptId || null
        },
        questions: mappedQuestions
      };
      navigateTo(`/mock-exams/${eid}/start`, { retakeMode: mode, retakeData: retake });
      return;
    }
    try {
      const retake = await mockExamService.createSmartRetake(eid, mode, aid);
      if (retake?.questions?.length === 0) {
        toast('Không có câu hỏi phù hợp với chế độ này!', 'warning');
        return;
      }
      navigateTo(`/mock-exams/${eid}/start`, { retakeMode: mode, retakeData: retake });
    } catch (_) {
      toast('Không thể tạo phiên ôn luyện. Vui lòng thử lại.', 'error');
    }
  };

  useEffect(() => {
    loadResultDetails();
  }, [examId, attemptId]);

  useEffect(() => {
    if (activeTab === 'replay') loadEvents();
  }, [activeTab]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '30px', animation: 'pulse 1.5s infinite alternate' }}>⏳</div>
        <p style={{ marginTop: '12px', fontSize: '13px' }}>Đang nạp bảng điểm và phân tích kết quả...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <span style={{ fontSize: '48px' }}>⚠️</span>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '16px 0 8px', color: 'var(--text-primary)' }}>Không tìm thấy kết quả</h3>
        <button className="btn-primary" onClick={() => navigateTo('/mock-exams')} style={{ marginTop: '12px' }}>
          Quay lại danh mục đề thi
        </button>
      </div>
    );
  }

  const aiFeedback = (() => {
    try {
      if (!result.ai_feedback) return null;
      return typeof result.ai_feedback === 'string' ? JSON.parse(result.ai_feedback) : result.ai_feedback;
    } catch (_) { return null; }
  })();

  const topicStats = analytics?.topicStats || aiFeedback?.topicStats || {};
  const difficultyStats = analytics?.difficultyStats || aiFeedback?.difficultyStats || {};
  const trustScore = analytics?.examTrustScore ?? null;

  const bookmarkedKeys = Object.keys(
    JSON.parse(localStorage.getItem(`exam_taking_bookmarks_${examId}`) || '{}')
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '960px', margin: '0 auto', padding: '0 16px 48px' }} className="animate-in">

      {/* ── TOP NAVIGATION ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <button
          onClick={() => navigateTo(`/mock-exams/${examId}`)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          ← Chi tiết đề thi
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-outline" onClick={() => navigateTo('/mock-exams')} style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: 'bold' }}>
            Danh mục đề thi
          </button>
          <button
            className="btn-primary"
            onClick={() => navigateTo(`/mock-exams/${examId}/start`)}
            style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: 'bold', background: 'var(--exams-purple)', color: '#fff', border: 'none' }}
          >
            Thi lại ⚡
          </button>
        </div>
      </div>

      {/* ── SCORE SUMMARY ── */}
      <ExamResultSummary result={result} durationSeconds={result.duration_seconds || 0} />

      {/* ── TRUST SCORE (if available) ── */}
      {trustScore !== null && (
        <TrustScoreCard
          trustScore={trustScore}
          tabSwitchCount={analytics?.tabSwitchCount || 0}
          copyPasteCount={analytics?.copyPasteCount || 0}
          fullscreenExitCount={analytics?.fullscreenExitCount || 0}
        />
      )}

      {/* ── TABS ── */}
      <div>
        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid var(--border)', overflowX: 'auto', paddingBottom: '0' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: activeTab === tab.key ? '800' : '500',
                color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: '-2px', whiteSpace: 'nowrap',
                transition: 'color 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="card" style={{ padding: '24px', marginTop: '0', borderTopLeftRadius: '0', borderTopRightRadius: '0', borderTop: 'none' }}>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <CapabilityAnalysis topicStats={topicStats} difficultyStats={difficultyStats} />

              {/* Existing AI diagnostic feedback */}
              {aiFeedback && !aiFeedback.coachPlan && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px' }}>
                    💬 Nhận xét tổng quát
                  </div>
                  <div style={{ padding: '14px 16px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '12px', lineHeight: 1.7 }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 8px' }}>{aiFeedback.assessment}</p>
                    {aiFeedback.advice?.length > 0 && (
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>{aiFeedback.advice[0]}</p>
                    )}
                    {aiFeedback.encouragement && (
                      <p style={{ fontSize: '12px', color: 'var(--primary)', margin: '8px 0 0', fontStyle: 'italic' }}>✨ {aiFeedback.encouragement}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Prompt to go to AI Coach tab */}
              {!coachPlan && (
                <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #6c5ce710, #a29bfe18)', border: '1px solid #6c5ce730', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    🤖 <strong>AI Coach</strong> có thể tạo kế hoạch học 7 ngày cá nhân hóa cho bạn
                  </div>
                  <button
                    onClick={() => { setActiveTab('coach'); handleGenerateCoach(); }}
                    style={{ padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer', flexShrink: 0 }}
                  >
                    Tạo kế hoạch ✨
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── ANALYSIS TAB ── */}
          {activeTab === 'analysis' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
                  📚 Tỷ lệ đúng theo chủ đề
                </div>
                <TopicAnalysisChart topicStats={topicStats} />
              </div>

              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
                  🎯 Phân tích theo độ khó
                </div>
                <DifficultyChart difficultyStats={difficultyStats} />
              </div>

              {Object.keys(topicStats).length === 0 && Object.keys(difficultyStats).length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Chưa có dữ liệu phân tích. Dữ liệu chủ đề sẽ có ở những lần thi sau khi hệ thống cập nhật.
                </div>
              )}
            </div>
          )}

          {/* ── AI COACH TAB ── */}
          {activeTab === 'coach' && (
            <AiCoachCard
              coachPlan={coachPlan}
              onGenerateCoach={!coachPlan && !coachLoading ? handleGenerateCoach : null}
              isGenerating={coachLoading}
            />
          )}

          {/* ── REVIEW TAB ── */}
          {activeTab === 'review' && (
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
                🔍 Xem lại từng câu hỏi
              </div>
              <ExamReviewList questions={questions} userAnswers={userAnswers} />
            </div>
          )}

          {/* ── REPLAY TAB ── */}
          {activeTab === 'replay' && (
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
                📼 Lịch sử hành động trong phòng thi
              </div>
              <ExamReplayTimeline
                events={events}
                startedAt={result?.startedAt}
                loading={eventsLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── SMART RETAKE OPTIONS ── */}
      <SmartRetakeOptions
        examId={examId}
        attemptId={attemptId}
        onRetake={handleRetake}
        wrongCount={result?.wrong_count || 0}
        bookmarkedCount={bookmarkedKeys.length}
      />

      {/* ── BOTTOM CTA ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
        <button className="btn-outline" onClick={() => navigateTo('/mock-exams')} style={{ padding: '12px 24px', fontSize: '13.5px', fontWeight: 'bold' }}>
          Quay lại danh sách đề thi
        </button>
        <button
          className="btn-primary"
          onClick={() => navigateTo(`/mock-exams/${examId}/start`)}
          style={{ padding: '12px 24px', fontSize: '13.5px', fontWeight: 'bold', background: 'var(--exams-purple)', color: '#fff', border: 'none', boxShadow: '0 4px 12px rgba(108,92,231,0.2)' }}
        >
          Thi lại đề này ⚡
        </button>
      </div>
    </div>
  );
}
