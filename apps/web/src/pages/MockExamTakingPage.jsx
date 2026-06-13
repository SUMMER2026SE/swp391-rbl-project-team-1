import React, { useState, useEffect } from 'react';
import ExamTimer from '../components/mock-exams/ExamTimer';
import QuestionCard from '../components/mock-exams/QuestionCard';
import QuestionNavigator from '../components/mock-exams/QuestionNavigator';
import ExamSubmitModal from '../components/mock-exams/ExamSubmitModal';
import { mockExamService } from '../services/mockExamService';

export default function MockExamTakingPage({ examId, currentUser, onFinished, navigateTo }) {
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // States stored/loaded from localStorage to prevent loss on refresh
  const [answers, setAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Initialize and load questions
  const loadExamWorkspace = async () => {
    setLoading(true);
    try {
      const examData = await mockExamService.getMockExamById(examId);
      setExam(examData);

      const qs = await mockExamService.getExamQuestions(examId);
      
      // Load options nested inside each question for easy pass down
      const questionsWithOptions = await Promise.all(
        qs.map(async (q) => {
          const opts = await mockExamService.getExamOptions(q.id);
          return { ...q, options: opts };
        })
      );
      setQuestions(questionsWithOptions);

      // Restore states from localStorage if available
      const savedAnswers = localStorage.getItem(`exam_taking_answers_${examId}`);
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }

      const savedBookmarks = localStorage.getItem(`exam_taking_bookmarks_${examId}`);
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }

      const savedAttemptId = localStorage.getItem(`exam_taking_attempt_id_${examId}`);
      
      if (savedAttemptId) {
        setAttemptId(savedAttemptId);
      } else if (currentUser) {
        // Start live attempt on Supabase/localStorage
        const att = await mockExamService.startMockExam(currentUser.id, examId);
        setAttemptId(att.id);
        localStorage.setItem(`exam_taking_attempt_id_${examId}`, att.id);
      } else {
        // Guest placeholder attempt
        const guestAttId = `guest-attempt-${Date.now()}`;
        setAttemptId(guestAttId);
        localStorage.setItem(`exam_taking_attempt_id_${examId}`, guestAttId);
      }

      const savedSeconds = localStorage.getItem(`exam_taking_seconds_${examId}`);
      if (savedSeconds) {
        setSecondsRemaining(parseInt(savedSeconds, 10));
      } else {
        setSecondsRemaining((examData.duration_minutes || 90) * 60);
      }
    } catch (err) {
      console.error('Lỗi khởi tạo phòng thi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamWorkspace();
  }, [examId, currentUser]);

  // Sync answers and bookmarks to localStorage
  const handleSelectOption = (questionId, optionLabel) => {
    const nextAnswers = { ...answers, [questionId]: optionLabel };
    setAnswers(nextAnswers);
    localStorage.setItem(`exam_taking_answers_${examId}`, JSON.stringify(nextAnswers));
  };

  const handleChangeEssay = (questionId, text) => {
    const nextAnswers = { ...answers, [questionId]: text };
    setAnswers(nextAnswers);
    localStorage.setItem(`exam_taking_answers_${examId}`, JSON.stringify(nextAnswers));
  };

  const handleBookmarkToggle = async (questionId, note) => {
    const nextBookmarks = { ...bookmarks };
    if (note === null) {
      delete nextBookmarks[questionId];
    } else {
      nextBookmarks[questionId] = note;
    }
    setBookmarks(nextBookmarks);
    localStorage.setItem(`exam_taking_bookmarks_${examId}`, JSON.stringify(nextBookmarks));

    // Save to DB if logged in
    if (currentUser) {
      await mockExamService.bookmarkQuestion(currentUser.id, questionId, note);
    }
  };

  const handleSecondsChange = (secondsLeft) => {
    setSecondsRemaining(secondsLeft);
    localStorage.setItem(`exam_taking_seconds_${examId}`, secondsLeft);
  };

  // Submit flow
  const handleFinalSubmit = async () => {
    setIsSubmitModalOpen(false);

    // Guest guard interceptor
    if (!currentUser) {
      alert('🔒 Bạn chưa đăng nhập. Vui lòng đăng nhập hoặc tạo tài khoản để nộp bài thi thử, chấm điểm tự động và nhận phân tích học tập từ AI!');
      localStorage.setItem('redirect_post_auth', window.location.pathname);
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }

    try {
      const durationSeconds = (exam.duration_minutes * 60) - secondsRemaining;
      const { score, attemptId: submittedId } = await mockExamService.submitMockExam(
        currentUser.id,
        examId,
        attemptId,
        answers,
        durationSeconds
      );

      // Clean localStorage values on successful submission
      localStorage.removeItem(`exam_taking_answers_${examId}`);
      localStorage.removeItem(`exam_taking_bookmarks_${examId}`);
      localStorage.removeItem(`exam_taking_attempt_id_${examId}`);
      localStorage.removeItem(`exam_taking_seconds_${examId}`);

      onFinished(examId, submittedId);
    } catch (err) {
      console.error('Lỗi khi nộp bài thi:', err);
      alert('Không thể nộp bài thi thử. Vui lòng kiểm tra lại kết nối mạng!');
    }
  };

  const handleTimeUp = () => {
    alert('⏱️ Hết thời gian làm bài! Hệ thống tự động nộp bài thi thử của bạn.');
    handleFinalSubmit();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '30px', animation: 'pulse 1.5s infinite alternate' }}>⏳</div>
        <p style={{ marginTop: '12px', fontSize: '13px' }}>Đang nạp đề bài và chuẩn bị phòng thi...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <span style={{ fontSize: '48px' }}>📂</span>
        <h3>Đề thi chưa có câu hỏi</h3>
        <button className="btn-outline" onClick={() => navigateTo(`/mock-exams/${examId}`)} style={{ marginTop: '12px' }}>
          Quay lại trang chi tiết
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).filter(qId => answers[qId]).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 16px', maxWidth: '1200px', margin: '0 auto' }} className="animate-in">
      
      {/* Top Banner Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '950', color: 'var(--text-primary)', margin: 0 }}>
            {exam?.title}
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Môn thi: {exam?.exam_subjects?.name} • Mã đề: {exam?.exam_code}</span>
        </div>

        {/* Countdown component */}
        {secondsRemaining > 0 && (
          <ExamTimer 
            durationMinutes={exam.duration_minutes} 
            onTimeUp={handleTimeUp}
            onSecondsChange={handleSecondsChange}
          />
        )}
      </div>

      {/* Main split work space */}
      <div className="exam-taking-container">
        
        {/* Left questions column */}
        <div className="exam-questions-panel">
          <QuestionCard 
            question={currentQ}
            options={currentQ.options}
            selectedOptionLabel={answers[currentQ.id]}
            onSelectOption={handleSelectOption}
            isBookmarked={!!bookmarks[currentQ.id]}
            onBookmarkToggle={handleBookmarkToggle}
            essayAnswer={answers[currentQ.id]}
            onChangeEssayAnswer={handleChangeEssay}
          />

          {/* Bottom navigation links */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <button 
              className="btn-outline"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              style={{ padding: '10px 20px', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer' }}
            >
              ◀ Câu trước
            </button>

            <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
              Câu hỏi {currentIdx + 1} / {questions.length}
            </span>

            {currentIdx < questions.length - 1 ? (
              <button 
                className="btn-outline"
                onClick={() => setCurrentIdx(prev => prev + 1)}
                style={{ padding: '10px 20px', cursor: 'pointer' }}
              >
                Câu tiếp theo ▶
              </button>
            ) : (
              <button 
                className="btn-primary"
                onClick={() => setIsSubmitModalOpen(true)}
                style={{ padding: '10px 20px', background: 'var(--exams-red)', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Hoàn thành & Nộp bài ⚡
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar Navigator */}
        <QuestionNavigator 
          questions={questions}
          answers={answers}
          bookmarks={bookmarks}
          currentQuestionIndex={currentIdx}
          onNavigateIndex={setCurrentIdx}
          onSubmitClick={() => setIsSubmitModalOpen(true)}
        />
      </div>

      {/* Submit warning modal overlay */}
      <ExamSubmitModal 
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleFinalSubmit}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
      />
    </div>
  );
}
