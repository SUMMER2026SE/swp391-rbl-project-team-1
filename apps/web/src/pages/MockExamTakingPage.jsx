import React, { useState, useEffect, useRef } from 'react';
import { toast } from '../utils/toast';
import ExamTimer from '../components/mock-exams/ExamTimer';
import QuestionCard from '../components/mock-exams/QuestionCard';
import QuestionNavigator from '../components/mock-exams/QuestionNavigator';
import ExamSubmitModal from '../components/mock-exams/ExamSubmitModal';
import DraggableFloatingWidget from '../components/mock-exams/DraggableFloatingWidget';
import { mockExamService } from '../services/mockExamService';
import { 
  HiShieldCheck, 
  HiOutlineExclamation, 
  HiCalculator, 
  HiClipboardCopy, 
  HiPresentationChartLine, 
  HiBookOpen, 
  HiX,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineShieldExclamation
} from 'react-icons/hi';

// Dangerous identifiers that must never reach new Function
const CALC_DANGEROUS = /constructor|prototype|__proto__|fetch|XMLHttpRequest|window\b|document\b|\beval\b|Function\b|import\b|require\b|process\b|global\b|\bthis\b|alert\b|confirm\b|prompt\b/i;

// Scientific Calculator Expression Evaluator
const evaluateExpression = (expr) => {
  if (CALC_DANGEROUS.test(expr)) return 'Lỗi';
  try {
    let cleanExpr = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'Math.PI')
      .replace(/\^/g, '**');

    // Replace math functions before replacing bare 'e' to avoid clobbering 'Math.E' in function names
    cleanExpr = cleanExpr
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/sqrt\(/g, 'Math.sqrt(');

    // Replace bare 'e' (not already part of Math.*) as Euler's number
    cleanExpr = cleanExpr.replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, 'Math.E');

    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${cleanExpr})`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return Number(result.toFixed(6)).toString();
    }
    return result === Infinity || result === -Infinity ? String(result) : 'Lỗi';
  } catch (err) {
    return 'Lỗi';
  }
};

export default function MockExamTakingPage({ examId, currentUser, onFinished, navigateTo }) {
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Local storage state keys
  const [answers, setAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [attemptId, setAttemptId] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // ── Real Exam Experience Upgrades ──
  const [isPreExam, setIsPreExam] = useState(true);
  const [rulesAgreed, setRulesAgreed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationReason, setViolationReason] = useState('');
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);
  
  // Widget states
  const [showCalculator, setShowCalculator] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchpadText, setScratchpadText] = useState(() => localStorage.getItem(`exam_taking_scratchpad_${examId}`) || '');
  const [calcInput, setCalcInput] = useState('');
  const [calcOutput, setCalcOutput] = useState('');

  // Refs for tracking
  const blurHandlerRegistered = useRef(false);

  // Refs to provide fresh values to stale-closure callbacks (violation/timer auto-submit)
  const answersRef = useRef(answers);
  const secondsRemainingRef = useRef(secondsRemaining);
  const showViolationModalRef = useRef(showViolationModal);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { secondsRemainingRef.current = secondsRemaining; }, [secondsRemaining]);
  useEffect(() => { showViolationModalRef.current = showViolationModal; }, [showViolationModal]);

  // Initialize and load questions
  const loadExamWorkspace = async () => {
    setLoading(true);
    try {
      const examData = await mockExamService.getMockExamById(examId);
      setExam(examData);

      const qs = await mockExamService.getExamQuestions(examId);
      const questionsWithOptions = await Promise.all(
        qs.map(async (q) => {
          const opts = await mockExamService.getExamOptions(q.id);
          return { ...q, options: opts };
        })
      );
      setQuestions(questionsWithOptions);

      // Restore states from localStorage
      const savedAnswers = localStorage.getItem(`exam_taking_answers_${examId}`);
      if (savedAnswers) setAnswers(JSON.parse(savedAnswers));

      const savedBookmarks = localStorage.getItem(`exam_taking_bookmarks_${examId}`);
      if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

      const savedAttemptId = localStorage.getItem(`exam_taking_attempt_id_${examId}`);
      if (savedAttemptId) {
        setAttemptId(savedAttemptId);
      } else if (currentUser) {
        const att = await mockExamService.startMockExam(currentUser.id, examId);
        setAttemptId(att.id);
        localStorage.setItem(`exam_taking_attempt_id_${examId}`, att.id);
      } else {
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

  // Sync answers & scratchpad
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

  const handleScratchpadChange = (text) => {
    setScratchpadText(text);
    localStorage.setItem(`exam_taking_scratchpad_${examId}`, text);
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
    if (currentUser) {
      await mockExamService.bookmarkQuestion(currentUser.id, questionId, note);
    }
  };

  const handleSecondsChange = (secondsLeft) => {
    setSecondsRemaining(secondsLeft);
    localStorage.setItem(`exam_taking_seconds_${examId}`, secondsLeft);
  };

  // Fullscreen implementation
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Visibility & Tab-blur violation triggers
  const triggerViolation = (reason) => {
    if (showViolationModalRef.current) return; // Ignore secondary triggers while standard alert dialog is visible
    setViolationCount(prev => {
      const nextVal = prev + 1;
      if (nextVal >= 3) {
        // Clear hooks immediately to prevent repeating alerts
        window.removeEventListener('blur', handleWindowBlur);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        toast('Bạn đã vi phạm nội quy chống gian lận quá 3 lần! Hệ thống tự động nộp bài.', 'error');
        handleFinalSubmit(true);
      } else {
        setViolationReason(reason);
        setShowViolationModal(true);
      }
      return nextVal;
    });
  };

  const handleWindowBlur = () => {
    triggerViolation("Rời khỏi tab thi (chuyển đổi ứng dụng hoặc mở cửa sổ mới)");
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      triggerViolation("Rời khỏi màn hình thi (chuyển đổi tab trình duyệt)");
    }
  };

  useEffect(() => {
    if (isPreExam) return;

    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    blurHandlerRegistered.current = true;

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      blurHandlerRegistered.current = false;
    };
  }, [isPreExam]);

  // Fullscreen exit warning listener
  useEffect(() => {
    const onFsChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull && !isPreExam) {
        triggerViolation("Thoát chế độ toàn màn hình khi đang thi");
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [isPreExam]);

  // Keyboard shortcuts: A/B/C/D to select options, Left/Right to navigate questions
  useEffect(() => {
    if (isPreExam || questions.length === 0) return;
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key;
      if (key === 'ArrowLeft' || key === 'ArrowUp') {
        e.preventDefault();
        setCurrentIdx(prev => Math.max(0, prev - 1));
      } else if (key === 'ArrowRight' || key === 'ArrowDown') {
        e.preventDefault();
        setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1));
      } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(key)) {
        const currentQuestion = questions[currentIdx];
        if (currentQuestion) handleSelectOption(currentQuestion.id, key.toUpperCase());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreExam, questions, currentIdx]);

  // Final submit flow
  const handleFinalSubmit = async (forceSubmit = false) => {
    setIsSubmitModalOpen(false);
    setShowViolationModal(false);

    // Stop events
    window.removeEventListener('blur', handleWindowBlur);
    document.removeEventListener('visibilitychange', handleVisibilityChange);

    if (!currentUser && !forceSubmit) {
      toast('Bạn chưa đăng nhập. Vui lòng đăng nhập để nộp bài và nhận phân tích từ AI!', 'warning');
      localStorage.setItem('redirect_post_auth', window.location.pathname);
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }

    try {
      const durationSeconds = (exam.duration_minutes * 60) - secondsRemainingRef.current;
      const { score, attemptId: submittedId } = await mockExamService.submitMockExam(
        currentUser?.id || 101,
        examId,
        attemptId,
        answersRef.current,
        durationSeconds
      );

      // Clean local storage states
      localStorage.removeItem(`exam_taking_answers_${examId}`);
      localStorage.removeItem(`exam_taking_bookmarks_${examId}`);
      localStorage.removeItem(`exam_taking_attempt_id_${examId}`);
      localStorage.removeItem(`exam_taking_seconds_${examId}`);
      localStorage.removeItem(`exam_taking_scratchpad_${examId}`);

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      onFinished(examId, submittedId);
    } catch (err) {
      console.error('Lỗi nộp bài thi:', err);
      toast('Không thể nộp bài thi thử. Vui lòng kiểm tra lại kết nối mạng!', 'error');
    }
  };

  const handleTimeUp = () => {
    setShowTimeUpModal(true);
  };

  // Calculator button click handler
  const handleCalcClick = (val) => {
    if (val === 'C') {
      setCalcInput('');
      setCalcOutput('');
    } else if (val === '⌫') {
      setCalcInput(prev => prev.slice(0, -1));
    } else if (val === '=') {
      const output = evaluateExpression(calcInput);
      setCalcOutput(output);
    } else {
      setCalcInput(prev => prev + val);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '30px', animation: 'pulse 1.5s infinite alternate' }}>⏳</div>
        <p style={{ marginTop: '12px', fontSize: '13px' }}>Đang nạp đề bài và chuẩn bị phòng thi...</p>
      </div>
    );
  }

  // Render Pre-exam strict instruction view
  if (isPreExam) {
    return (
      <div style={{ maxWidth: '650px', margin: '40px auto', padding: '0 16px' }} className="animate-in">
        <div className="card" style={{ padding: '32px', border: '2px solid var(--border)', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '48px' }}>🛡️</span>
            <h2 style={{ fontSize: '20px', fontWeight: '950', color: 'var(--text-primary)', marginTop: '14px', letterSpacing: '-0.5px' }}>
              XÁC THỰC THÍ SINH & NỘI QUY PHÒNG THI
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>EduPath Mock Exam Security System</p>
          </div>

          <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginBottom: '24px' }}>
            <div>👤 <strong>Họ tên thí sinh:</strong> {currentUser?.name || 'Thí sinh tự do'}</div>
            <div>📧 <strong>Tài khoản thi:</strong> {currentUser?.email || 'Chưa đăng nhập'}</div>
            <div>📝 <strong>Đề thi ôn luyện:</strong> {exam?.title}</div>
            <div>⏱️ <strong>Thời gian làm bài:</strong> {exam?.duration_minutes} phút</div>
            <div>❓ <strong>Số lượng câu hỏi:</strong> {exam?.total_questions} câu trắc nghiệm</div>
          </div>

          <h3 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--exams-red)', marginBottom: '12px' }}>
            🚨 CÁC QUY CHẾ THI BẮT BUỘC:
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '28px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span>🖥️</span>
              <span><strong>Chế độ toàn màn hình:</strong> Khuyến khích làm bài thi ở chế độ toàn màn hình để hạn chế phân tâm và tối ưu hóa diện tích hiển thị câu hỏi.</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span>🛡️</span>
              <span><strong>Cảnh báo rời phòng thi:</strong> Hệ thống tự động giám sát. Nếu bạn chuyển tab trình duyệt, đổi cửa sổ hoặc thoát màn hình thi quá **3 lần**, hệ thống sẽ khóa và tự động nộp bài chấm điểm ngay lập tức.</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span>🧮</span>
              <span><strong>Công cụ bổ trợ:</strong> Thí sinh được trang bị sẵn **Máy tính Casio ảo** và **Giấy nháp điện tử** trực tiếp tại khu vực làm bài.</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px', padding: '12px', background: 'var(--primary-bg)', borderRadius: '8px', border: '1px solid var(--primary-light)' }}>
            <input 
              type="checkbox" 
              id="agree-rules" 
              checked={rulesAgreed}
              onChange={(e) => setRulesAgreed(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="agree-rules" style={{ fontSize: '12.5px', fontWeight: 'bold', color: 'var(--primary)', cursor: 'pointer' }}>
              Tôi cam kết tự giác, nghiêm túc tuân thủ mọi quy chế phòng thi.
            </label>
          </div>

          <button
            className="btn-primary"
            disabled={!rulesAgreed}
            onClick={() => {
              setIsPreExam(false);
              // Proactively request fullscreen on agree
              document.documentElement.requestFullscreen().catch(() => {});
              setIsFullscreen(true);
            }}
            style={{
              width: '100%',
              padding: '14px',
              background: rulesAgreed ? 'var(--exams-purple)' : 'var(--text-muted)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: rulesAgreed ? 'pointer' : 'not-allowed',
              boxShadow: rulesAgreed ? '0 8px 20px rgba(108, 92, 231, 0.25)' : 'none'
            }}
          >
            ĐỒNG Ý VÀ BẮT ĐẦU THI
          </button>
        </div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 16px', maxWidth: '1300px', margin: '0 auto', position: 'relative' }} className="animate-in">
      
      {/* ── TOP HEADER TOOLBAR ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="source-badge official">Bộ GD&ĐT</span>
              <h2 style={{ fontSize: '17px', fontWeight: '950', color: 'var(--text-primary)', margin: 0 }}>
                {exam?.title}
              </h2>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Môn thi: {exam?.exam_subjects?.name} • Mã đề: {exam?.exam_code} • Khóa thi: {exam?.year}</span>
          </div>

          {/* Real-time Status and Violation indicators */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(231, 76, 60, 0.08)', color: 'var(--accent-red)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(231,76,60,0.15)', fontSize: '11.5px', fontWeight: 'bold' }}>
              <span>⚠️ Cảnh báo:</span>
              <span>{violationCount}/3 lần</span>
            </div>

            <button 
              onClick={toggleFullscreen} 
              className="btn-outline"
              style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              🖥️ {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            </button>

            {secondsRemaining > 0 && (
              <ExamTimer
                durationMinutes={exam.duration_minutes}
                initialSeconds={secondsRemaining}
                onTimeUp={handleTimeUp}
                onSecondsChange={handleSecondsChange}
              />
            )}
          </div>
        </div>

        {/* Progress bar container */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            Tiến độ: {answeredCount}/{questions.length} câu ({Math.round(answeredCount / questions.length * 100 || 0)}%)
          </span>
          <div className="taking-progress-container" style={{ flex: 1, margin: 0 }}>
            <div className="taking-progress-bar" style={{ width: `${(answeredCount / questions.length) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <div className="exam-taking-container">
        
        {/* Left main content panel: Questions + Widgets */}
        <div className="exam-questions-panel">
          
          {/* Quick Utility Tools Toolbar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '4px' }}>
            <button 
              className={`btn-outline ${showCalculator ? 'active' : ''}`}
              onClick={() => setShowCalculator(!showCalculator)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', background: showCalculator ? 'var(--primary-bg)' : '', borderColor: showCalculator ? 'var(--primary)' : '' }}
            >
              <HiCalculator style={{ fontSize: '16px', color: 'var(--primary)' }} />
              Máy tính Casio ảo
            </button>
            <button 
              className={`btn-outline ${showScratchpad ? 'active' : ''}`}
              onClick={() => setShowScratchpad(!showScratchpad)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', background: showScratchpad ? 'var(--primary-bg)' : '', borderColor: showScratchpad ? 'var(--primary)' : '' }}
            >
              <HiClipboardCopy style={{ fontSize: '16px', color: 'var(--accent-green)' }} />
              Giấy nháp điện tử
            </button>
          </div>

          {/* Draggable Scientific Calculator Panel */}
          {showCalculator && (
            <DraggableFloatingWidget
              title="CASIO fx-580VN X"
              icon={HiCalculator}
              onClose={() => setShowCalculator(false)}
              defaultPosition={{ x: window.innerWidth - 360, y: 150 }}
            >
              <div className="casio-calculator-body">
                <div className="casio-screen">
                  <div className="casio-screen-input">{calcInput || '0'}</div>
                  <div className="casio-screen-output">{calcOutput}</div>
                </div>

                <div className="casio-grid">
                  {/* Row 1: Sci functions */}
                  {['sin(', 'cos(', 'tan(', '(', ')'].map(btn => (
                    <button 
                      type="button"
                      key={btn} 
                      onClick={() => handleCalcClick(btn)} 
                      className="casio-btn casio-btn-sci"
                    >
                      {btn.replace('(', '')}
                    </button>
                  ))}
                  {/* Row 2: Sci functions */}
                  {['sqrt(', '^', 'ln(', 'log(', 'π'].map(btn => (
                    <button 
                      type="button"
                      key={btn} 
                      onClick={() => handleCalcClick(btn)} 
                      className="casio-btn casio-btn-sci"
                    >
                      {btn === 'sqrt(' ? '√' : (btn === '^' ? 'xʸ' : btn.replace('(', ''))}
                    </button>
                  ))}
                  {/* Row 3: Numbers + controls */}
                  {['7', '8', '9', '⌫', 'C'].map(btn => {
                    let btnClass = 'casio-btn casio-btn-num';
                    if (btn === 'C' || btn === '⌫') btnClass = 'casio-btn casio-btn-clear';
                    return (
                      <button 
                        type="button"
                        key={btn} 
                        onClick={() => handleCalcClick(btn)} 
                        className={btnClass}
                      >
                        {btn}
                      </button>
                    );
                  })}
                  {/* Row 4 */}
                  {['4', '5', '6', '×', '÷'].map(btn => {
                    const isOp = isNaN(btn);
                    return (
                      <button 
                        type="button"
                        key={btn} 
                        onClick={() => handleCalcClick(btn)} 
                        className={`casio-btn ${isOp ? 'casio-btn-op' : 'casio-btn-num'}`}
                      >
                        {btn}
                      </button>
                    );
                  })}
                  {/* Row 5 */}
                  {['1', '2', '3', '+', '-'].map(btn => {
                    const isOp = isNaN(btn);
                    return (
                      <button 
                        type="button"
                        key={btn} 
                        onClick={() => handleCalcClick(btn)} 
                        className={`casio-btn ${isOp ? 'casio-btn-op' : 'casio-btn-num'}`}
                      >
                        {btn}
                      </button>
                    );
                  })}
                  {/* Row 6 */}
                  {['0', '.', 'e', ')', '='].map(btn => {
                    let btnClass = 'casio-btn casio-btn-num';
                    if (btn === '=') btnClass = 'casio-btn casio-btn-equal';
                    else if (btn === ')' || btn === 'e') btnClass = 'casio-btn casio-btn-sci';
                    return (
                      <button 
                        type="button"
                        key={btn} 
                        onClick={() => handleCalcClick(btn)} 
                        className={btnClass}
                      >
                        {btn}
                      </button>
                    );
                  })}
                </div>
              </div>
            </DraggableFloatingWidget>
          )}

          {/* Draggable Electronic Scratchpad */}
          {showScratchpad && (
            <DraggableFloatingWidget
              title="GIẤY NHÁP ĐIỆN TỬ"
              icon={HiClipboardCopy}
              onClose={() => setShowScratchpad(false)}
              defaultPosition={{ x: window.innerWidth - 380, y: 480 }}
              width="360px"
            >
              <textarea
                className="scratchpad-widget-textarea"
                rows="5"
                placeholder="Nháp nhanh các dữ kiện hoặc lời giải tại đây... (Tự động lưu trữ)"
                value={scratchpadText}
                onChange={(e) => handleScratchpadChange(e.target.value)}
              />
            </DraggableFloatingWidget>
          )}

          {/* Question Card Display */}
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

          {/* Bottom navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <button 
              className="btn-outline"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              style={{ padding: '10px 20px', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <HiChevronLeft /> Câu trước
            </button>

            <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
              Câu hỏi {currentIdx + 1} / {questions.length}
            </span>

            {currentIdx < questions.length - 1 ? (
              <button 
                className="btn-outline"
                onClick={() => setCurrentIdx(prev => prev + 1)}
                style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                Câu tiếp theo <HiChevronRight />
              </button>
            ) : (
              <button 
                className="btn-primary"
                onClick={() => setIsSubmitModalOpen(true)}
                style={{ padding: '10px 20px', background: 'var(--exams-red)', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Nộp bài & Hoàn thành ⚡
              </button>
            )}
          </div>
        </div>

        {/* Right Navigator Panel */}
        <QuestionNavigator 
          questions={questions}
          answers={answers}
          bookmarks={bookmarks}
          currentQuestionIndex={currentIdx}
          onNavigateIndex={setCurrentIdx}
          onSubmitClick={() => setIsSubmitModalOpen(true)}
        />
      </div>

      {/* ── TIME UP MODAL ── */}
      {showTimeUpModal && (
        <div className="checkout-overlay" style={{ zIndex: 12000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="checkout-modal animate-in" style={{ maxWidth: '420px', border: '3px solid var(--exams-orange)', boxShadow: '0 10px 40px rgba(243, 156, 18, 0.25)' }}>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: '52px' }}>⏱️</div>
              <h3 style={{ fontSize: '18px', fontWeight: '950', color: 'var(--text-primary)', marginTop: '14px', letterSpacing: '-0.5px' }}>
                HẾT THỜI GIAN LÀM BÀI
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '12px 0 24px 0', lineHeight: 1.5 }}>
                Thời gian thi đã kết thúc. Bài làm của bạn sẽ được nộp ngay để chấm điểm và phân tích kết quả từ AI.
              </p>
              <button
                className="btn-primary"
                onClick={() => { setShowTimeUpModal(false); handleFinalSubmit(true); }}
                style={{ width: '100%', padding: '13px', background: 'var(--exams-orange)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
              >
                Nộp bài & Xem kết quả ⚡
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECURITY VIOLATION ALERT MODAL ── */}
      {showViolationModal && (
        <div className="checkout-overlay" style={{ zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="checkout-modal animate-in" style={{ maxWidth: '460px', border: '3px solid var(--exams-red)', boxShadow: '0 10px 40px rgba(214, 48, 49, 0.2)' }}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: '48px', color: 'var(--exams-red)', animation: 'pulse 0.5s infinite alternate' }}><HiOutlineShieldExclamation style={{ display: 'block', margin: '0 auto' }} /></div>
              <h3 style={{ fontSize: '17px', fontWeight: '950', color: 'var(--exams-red)', marginTop: '16px', letterSpacing: '-0.5px' }}>
                CẢNH BÁO VI PHẠM NỘI QUY THI
              </h3>
              
              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', margin: '18px 0', fontSize: '13px', color: 'var(--text-primary)', textAlign: 'left', lineHeight: 1.5 }}>
                <p>🔴 <strong>Lý do vi phạm:</strong> {violationReason}</p>
                <p style={{ marginTop: '8px' }}>⚠️ <strong>Số lần vi phạm hiện tại:</strong> <strong style={{ color: 'var(--exams-red)', fontSize: '14.5px' }}>{violationCount}/3 lần</strong></p>
                <p style={{ marginTop: '8px', fontSize: '11.5px', color: 'var(--text-secondary)' }}><em>Lưu ý:</em> Nếu bạn vi phạm quá **3 lần**, hệ thống sẽ lập tức dừng bài thi, khóa bài làm và tự động gửi kết quả về chấm điểm.</p>
              </div>

              <button
                className="btn-primary"
                onClick={() => {
                  setShowViolationModal(false);
                  // Request fullscreen back if they exited
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--text-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                TÔI ĐÃ HIỂU VÀ QUAY LẠI LÀM BÀI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit confirmation modal */}
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
