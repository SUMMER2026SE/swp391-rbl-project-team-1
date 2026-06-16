import React, { useState, useEffect, useRef } from 'react';
import ExamTimer from '../components/mock-exams/ExamTimer';
import QuestionCard from '../components/mock-exams/QuestionCard';
import QuestionNavigator from '../components/mock-exams/QuestionNavigator';
import ExamSubmitModal from '../components/mock-exams/ExamSubmitModal';
import { mockExamService } from '../services/mockExamService';
import { HiShieldCheck, HiOutlineExclamation, HiCalculator, HiClipboardCopy, HiPresentationChartLine, HiBookOpen, HiX } from 'react-icons/hi';

// Scientific Calculator Expression Evaluator
const evaluateExpression = (expr) => {
  try {
    let cleanExpr = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'Math.PI')
      .replace(/e/g, 'Math.E')
      .replace(/\^/g, '**');

    // Safe replace for functions
    cleanExpr = cleanExpr
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/sqrt\(/g, 'Math.sqrt(');
    
    // Evaluate safely
    const result = new Function(`return (${cleanExpr})`)();
    if (typeof result === 'number' && !isNaN(result)) {
      return Number(result.toFixed(6)).toString();
    }
    return 'Lỗi';
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
  
  // Widget states
  const [showCalculator, setShowCalculator] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchpadText, setScratchpadText] = useState(() => localStorage.getItem(`exam_taking_scratchpad_${examId}`) || '');
  const [calcInput, setCalcInput] = useState('');
  const [calcOutput, setCalcOutput] = useState('');

  // Refs for tracking
  const blurHandlerRegistered = useRef(false);

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
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Visibility & Tab-blur violation triggers
  const triggerViolation = (reason) => {
    setViolationCount(prev => {
      const nextVal = prev + 1;
      if (nextVal >= 3) {
        // Clear hooks immediately to prevent repeating alerts
        window.removeEventListener('blur', handleWindowBlur);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        alert(`🚨 BẠN ĐÃ VI PHẠM NỘI QUY CHỐNG GIAN LẬN QUÁ 3 LẦN! Hệ thống tự động khóa và nộp bài thi của bạn.`);
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

  // Final submit flow
  const handleFinalSubmit = async (forceSubmit = false) => {
    setIsSubmitModalOpen(false);
    setShowViolationModal(false);

    // Stop events
    window.removeEventListener('blur', handleWindowBlur);
    document.removeEventListener('visibilitychange', handleVisibilityChange);

    if (!currentUser && !forceSubmit) {
      alert('🔒 Bạn chưa đăng nhập. Vui lòng đăng nhập để nộp bài thi thử và nhận phân tích chi tiết từ AI!');
      localStorage.setItem('redirect_post_auth', window.location.pathname);
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }

    try {
      const durationSeconds = (exam.duration_minutes * 60) - secondsRemaining;
      const { score, attemptId: submittedId } = await mockExamService.submitMockExam(
        currentUser?.id || 101,
        examId,
        attemptId,
        answers,
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
      alert('Không thể nộp bài thi thử. Vui lòng kiểm tra lại kết nối mạng!');
    }
  };

  const handleTimeUp = () => {
    alert('⏱️ Hết giờ làm bài! Hệ thống tự động nộp bài thi của bạn.');
    handleFinalSubmit(true);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
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
            {isFullscreen ? '🖥️ Thu nhỏ' : '🖥️ Toàn màn hình'}
          </button>

          {secondsRemaining > 0 && (
            <ExamTimer 
              durationMinutes={exam.duration_minutes} 
              onTimeUp={handleTimeUp}
              onSecondsChange={handleSecondsChange}
            />
          )}
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

          {/* Draggable/Toggled Scientific Calculator Panel */}
          {showCalculator && (
            <div className="card casio-calculator-panel animate-in" style={{ padding: '16px', border: '2.5px solid #000', borderRadius: '16px', maxWidth: '320px', background: '#2D3436', color: '#fff', boxShadow: '6px 6px 0px #000' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #4a4a4a', paddingBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><HiCalculator /> CASIO fx-580VN X</span>
                <button onClick={() => setShowCalculator(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }}><HiX /></button>
              </div>

              {/* Calculator Screen */}
              <div style={{ background: '#DFE4EA', color: '#2F3542', padding: '10px 14px', borderRadius: '8px', minHeight: '56px', textAlign: 'right', marginBottom: '12px', fontFamily: 'monospace', position: 'relative' }}>
                <div style={{ fontSize: '13px', overflowX: 'auto', whiteSpace: 'nowrap' }}>{calcInput || '0'}</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '4px' }}>{calcOutput}</div>
              </div>

              {/* Calculator Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {/* Advanced Row 1 */}
                {['sin(', 'cos(', 'tan(', '(', ')'].map(btn => (
                  <button key={btn} onClick={() => handleCalcClick(btn)} style={{ background: '#4b5563', color: '#fff', border: 'none', padding: '8px 4px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{btn.replace('(', '')}</button>
                ))}
                {/* Advanced Row 2 */}
                {['sqrt(', '^', 'ln(', 'log(', 'π'].map(btn => (
                  <button key={btn} onClick={() => handleCalcClick(btn)} style={{ background: '#4b5563', color: '#fff', border: 'none', padding: '8px 4px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{btn === 'sqrt(' ? '√' : (btn === '^' ? 'xʸ' : btn.replace('(', ''))}</button>
                ))}
                {/* Normal calculator row 1 */}
                {['7', '8', '9', '⌫', 'C'].map(btn => (
                  <button key={btn} onClick={() => handleCalcClick(btn)} style={{ background: btn === 'C' ? '#d63031' : (btn === '⌫' ? '#e17055' : '#7f8c8d'), color: '#fff', border: 'none', padding: '10px 4px', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{btn}</button>
                ))}
                {/* Row 2 */}
                {['4', '5', '6', '×', '÷'].map(btn => (
                  <button key={btn} onClick={() => handleCalcClick(btn)} style={{ background: isNaN(btn) ? '#57606f' : '#7f8c8d', color: '#fff', border: 'none', padding: '10px 4px', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{btn}</button>
                ))}
                {/* Row 3 */}
                {['1', '2', '3', '+', '-'].map(btn => (
                  <button key={btn} onClick={() => handleCalcClick(btn)} style={{ background: isNaN(btn) ? '#57606f' : '#7f8c8d', color: '#fff', border: 'none', padding: '10px 4px', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{btn}</button>
                ))}
                {/* Row 4 */}
                {['0', '.', 'e', '(', '='].map(btn => (
                  <button key={btn} onClick={() => handleCalcClick(btn)} style={{ gridColumn: btn === '=' ? 'span 2' : 'span 1', background: btn === '=' ? '#00b894' : '#7f8c8d', color: '#fff', border: 'none', padding: '10px 4px', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{btn}</button>
                ))}
              </div>
            </div>
          )}

          {/* Toggleable Scratchpad Text Area */}
          {showScratchpad && (
            <div className="card scratchpad-panel animate-in" style={{ padding: '16px', border: '1.5px dashed var(--accent-green)', borderRadius: '16px', background: 'var(--bg-main)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}><HiClipboardCopy /> GIẤY NHÁP ĐIỆN TỬ (Tự động lưu trữ)</span>
                <button onClick={() => setShowScratchpad(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px' }}><HiX /></button>
              </div>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Nháp nhanh các dữ kiện hoặc lời giải tại đây... (Ví dụ: x = 2, y = 5 => sin(x) = 0.9)"
                value={scratchpadText}
                onChange={(e) => handleScratchpadChange(e.target.value)}
                style={{ width: '100%', padding: '10px', fontSize: '13px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
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

      {/* ── SECURITY VIOLATION ALERT MODAL ── */}
      {showViolationModal && (
        <div className="checkout-overlay" style={{ zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="checkout-modal animate-in" style={{ maxWidth: '460px', border: '3px solid var(--exams-red)', boxShadow: '0 10px 40px rgba(214, 48, 49, 0.2)' }}>
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: '48px', color: 'var(--exams-red)', animation: 'pulse 0.5s infinite alternate' }}>🚨</div>
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
