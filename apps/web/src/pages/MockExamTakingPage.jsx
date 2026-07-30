import React, { useState, useEffect, useRef } from 'react';
import { toast } from '../utils/toast';
import ExamTimer from '../components/mock-exams/ExamTimer';
import QuestionCard from '../components/mock-exams/QuestionCard';
import QuestionNavigator from '../components/mock-exams/QuestionNavigator';
import ExamSubmitModal from '../components/mock-exams/ExamSubmitModal';
import DraggableFloatingWidget from '../components/mock-exams/DraggableFloatingWidget';
import { mockExamService } from '../services/mockExamService';
import { resolveUploadUrl } from '../utils/courseMapper';
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
  const [showNoQuestionsModal, setShowNoQuestionsModal] = useState(false);
  const [targetTopicTitle, setTargetTopicTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Per-type violation counters (for display + thresholds)
  const [tabViolations, setTabViolations] = useState(0);
  const [copyPasteViolations, setCopyPasteViolations] = useState(0);
  const [fullscreenViolations, setFullscreenViolations] = useState(0);
  const [estimatedTrustScore, setEstimatedTrustScore] = useState(100);

  // Refs for tracking
  const blurHandlerRegistered = useRef(false);

  // Refs to provide fresh values to stale-closure callbacks (violation/timer auto-submit)
  const answersRef = useRef(answers);
  const secondsRemainingRef = useRef(secondsRemaining);
  const showViolationModalRef = useRef(showViolationModal);
  const tabViolRef = useRef(0);
  const copyPasteViolRef = useRef(0);
  const fullscreenViolRef = useRef(0);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { secondsRemainingRef.current = secondsRemaining; }, [secondsRemaining]);
  useEffect(() => { showViolationModalRef.current = showViolationModal; }, [showViolationModal]);

  // Initialize and load questions
  const loadExamWorkspace = async () => {
    setLoading(true);
    try {
      const historyState = window.history.state;
      const retakeData = historyState?.retakeData;
      const retakeMode = historyState?.retakeMode;

      if (retakeData && retakeData.questions && retakeData.exam) {
        const examData = {
          id: String(retakeData.exam.id),
          title: retakeData.exam.title,
          duration_minutes: retakeData.exam.duration,
          total_questions: retakeData.exam.totalQuestions,
          description: `Phiên ôn luyện thông minh: ${retakeData.exam.title}`,
          status: 'published',
          exam_subjects: {
            name: retakeData.exam.subject
          },
          retakeMode: retakeData.exam.retakeMode,
          sourceExamId: retakeData.exam.sourceExamId,
          sourceAttemptId: retakeData.exam.sourceAttemptId
        };
        setExam(examData);

        const mappedQuestions = retakeData.questions.map((q, idx) => {
          const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
          const mappedOptions = (options || []).map((opt, optIdx) => ({
            id: `opt-${q.id}-${opt.label || opt.option_label || optIdx}`,
            question_id: String(q.id),
            option_label: opt.label || opt.option_label || String.fromCharCode(65 + optIdx),
            option_text: opt.content ?? opt.text ?? opt.option_text ?? opt.value ?? opt.option_content ?? '',
            is_correct: (opt.label || opt.option_label) === q.correctAnswer || opt.is_correct || opt.isCorrect || false
          }));

          let diffLabel = 'Trung bình';
          if (q.difficulty === 'EASY') diffLabel = 'Dễ';
          else if (q.difficulty === 'HARD') diffLabel = 'Khó';

          const rawImg = q.imageUrl || q.question_image_url || null;
          const formattedImg = resolveUploadUrl(rawImg);

          return {
            id: String(q.id),
            exam_id: String(examData.id),
            question_number: idx + 1,
            question_text: q.content || q.question_text || '',
            imageUrl: formattedImg,
            question_image_url: formattedImg,
            type: q.type || q.question_type || 'MULTIPLE_CHOICE',
            question_type: q.type || q.question_type || 'MULTIPLE_CHOICE',
            difficulty: diffLabel,
            explanation: q.explanation || '',
            topic: q.topic || 'Kiến thức cốt lõi',
            options: mappedOptions
          };
        });
        setQuestions(mappedQuestions);

        const savedAnswers = localStorage.getItem(`exam_taking_answers_${examId}`);
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));

        const savedBookmarks = localStorage.getItem(`exam_taking_bookmarks_${examId}`);
        if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

        const savedAttemptId = localStorage.getItem(`exam_taking_attempt_id_${examId}`);
        if (savedAttemptId) {
          setAttemptId(savedAttemptId);
        } else if (currentUser) {
          const qIds = mappedQuestions.map(mq => Number(mq.id));
          const att = await mockExamService.startMockExam(currentUser.id, examId, retakeMode || retakeData.exam.retakeMode, qIds);
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
          setSecondsRemaining(examData.duration_minutes * 60);
        }
      } else {
        const savedAttemptId = localStorage.getItem(`exam_taking_attempt_id_${examId}`);
        
        let attPromise = Promise.resolve(null);
        if (!savedAttemptId && currentUser) {
          attPromise = mockExamService.startMockExam(currentUser.id, examId);
        }

        const [examData, qs, att] = await Promise.all([
          mockExamService.getMockExamById(examId),
          mockExamService.getExamQuestions(examId),
          attPromise
        ]);

        let finalQs = qs;
        const targetTopic = historyState?.targetTopic || historyState?.usr?.targetTopic;
        const practiceConfig = historyState?.practiceConfig || historyState?.usr?.practiceConfig;

        let customTitle = examData?.title;
        let activeTopicName = null;
        if (targetTopic) {
          activeTopicName = targetTopic.subTopic || targetTopic.topic || targetTopic.name;
        } else if (practiceConfig && practiceConfig.singleTopicName) {
          activeTopicName = practiceConfig.singleTopicName;
        }

        const isTopicMatch = (qTopic, qText, searchTopic) => {
          if (!searchTopic) return true;
          const s = searchTopic.toLowerCase();
          const t = (qTopic || '').toLowerCase();
          const txt = (qText || '').toLowerCase();

          if (s.includes('xác suất') || s.includes('tổ hợp')) {
            return t.includes('xác suất') || t.includes('tổ hợp') || txt.includes('xác suất') || txt.includes('tổ hợp');
          }
          if (s.includes('mũ') || s.includes('lôgarit') || s.includes('logarit')) {
            return t.includes('mũ') || t.includes('lôgarit') || t.includes('logarit') || txt.includes('mũ') || txt.includes('log');
          }
          if (s.includes('tích phân') || s.includes('nguyên hàm')) {
            return t.includes('tích phân') || t.includes('nguyên hàm') || txt.includes('tích phân') || txt.includes('nguyên hàm');
          }
          if (s.includes('hàm số') || s.includes('đồ thị')) {
            return t.includes('hàm số') || t.includes('đồ thị') || txt.includes('hàm số') || txt.includes('đồ thị');
          }
          if (s.includes('oxyz') || s.includes('tọa độ')) {
            return t.includes('oxyz') || t.includes('tọa độ');
          }
          if (s.includes('dao động') || s.includes('sóng')) {
            return t.includes('dao động') || t.includes('sóng');
          }
          if (s.includes('dòng điện') || s.includes('xoay chiều')) {
            return t.includes('dòng điện') || t.includes('xoay chiều');
          }
          if (s.includes('hạt nhân')) {
            return t.includes('hạt nhân');
          }

          return t.includes(s) || s.includes(t) || txt.includes(s);
        };

        if (activeTopicName) {
          customTitle = `⚡ Đề luyện tập AI: ${activeTopicName} (Chuyên đề trọng tâm)`;
          setTargetTopicTitle(activeTopicName);
          const matching = qs.filter(q => isTopicMatch(q.topic, q.question_text || q.content, activeTopicName));
          if (matching.length > 0) {
            finalQs = matching.slice(0, 20);
            setIsPreExam(true); // Có câu hỏi -> Mở trang xác nhận làm bài!
          } else {
            setIsPreExam(false);
            setShowNoQuestionsModal(true); // Không có câu hỏi -> Bật popup thông báo, KHÔNG chuyển vào trang làm bài!
            finalQs = [];
          }
        } else {
          setIsPreExam(true); // Đề thi thông thường -> Mở trang xác nhận làm bài!
        }

        setExam({ ...examData, title: customTitle, total_questions: finalQs.length });
        setQuestions(finalQs);

        const savedAnswers = localStorage.getItem(`exam_taking_answers_${examId}`);
        if (savedAnswers) setAnswers(JSON.parse(savedAnswers));

        const savedBookmarks = localStorage.getItem(`exam_taking_bookmarks_${examId}`);
        if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

        if (savedAttemptId) {
          setAttemptId(savedAttemptId);
        } else if (att) {
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
          setSecondsRemaining(((examData && examData.duration_minutes) || 90) * 60);
        }
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
    const isChange = !!answers[questionId];
    const nextAnswers = { ...answers, [questionId]: optionLabel };
    setAnswers(nextAnswers);
    localStorage.setItem(`exam_taking_answers_${examId}`, JSON.stringify(nextAnswers));
    if (attemptId && !attemptId.toString().startsWith('guest')) {
      mockExamService.saveAttemptAnswer(attemptId, questionId, optionLabel);
      mockExamService.recordExamEvent(
        attemptId,
        isChange ? 'CHANGE_ANSWER' : 'SELECT_ANSWER',
        questionId,
        { answer: optionLabel }
      );
    }
  };

  const handleChangeEssay = (questionId, text) => {
    const nextAnswers = { ...answers, [questionId]: text };
    setAnswers(nextAnswers);
    localStorage.setItem(`exam_taking_answers_${examId}`, JSON.stringify(nextAnswers));
    if (attemptId && !attemptId.toString().startsWith('guest')) {
      mockExamService.saveAttemptAnswer(attemptId, questionId, text);
    }
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
    if (attemptId && !attemptId.toString().startsWith('guest')) {
      mockExamService.recordExamEvent(attemptId, 'BOOKMARK', questionId, { action: note === null ? 'remove' : 'add' });
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

  // Compute estimated trust score from local counters
  const recalcTrustScore = (tabs, copies, fullscreen) => {
    return Math.max(0, 100 - tabs * 15 - copies * 10 - fullscreen * 8);
  };



  // Visibility & Tab-blur violation triggers (enhanced with per-type tracking)
  const triggerViolation = (violationType, reason) => {
    if (showViolationModalRef.current) return;

    // Update per-type counter refs (sync for immediate threshold check)
    let newTabs = tabViolRef.current;
    let newCopies = copyPasteViolRef.current;
    let newFullscreen = fullscreenViolRef.current;

    if (violationType === 'TAB_SWITCH') {
      tabViolRef.current += 1;
      newTabs = tabViolRef.current;
      setTabViolations(newTabs);
    } else if (violationType === 'COPY_PASTE') {
      copyPasteViolRef.current += 1;
      newCopies = copyPasteViolRef.current;
      setCopyPasteViolations(newCopies);
    } else if (violationType === 'FULLSCREEN_EXIT') {
      fullscreenViolRef.current += 1;
      newFullscreen = fullscreenViolRef.current;
      setFullscreenViolations(newFullscreen);
    }

    const newTrust = recalcTrustScore(newTabs, newCopies, newFullscreen);
    setEstimatedTrustScore(newTrust);

    // Report to backend (non-blocking)
    if (attemptId && !attemptId.toString().startsWith('guest')) {
      mockExamService.recordViolationDetail(attemptId, violationType).then(res => {
        if (res?.examTrustScore != null) setEstimatedTrustScore(res.examTrustScore);
      });
    }

    // Auto-submit thresholds
    const autoSubmit = newTabs >= 3 || newCopies >= 5 || newFullscreen >= 3;
    setViolationCount(prev => prev + 1);

    if (autoSubmit) {
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      const label = violationType === 'COPY_PASTE' ? 'copy/paste' : violationType === 'FULLSCREEN_EXIT' ? 'thoát toàn màn hình' : 'rời tab';
      toast(`Vi phạm ${label} quá giới hạn! Hệ thống tự động nộp bài.`, 'error');
      handleFinalSubmit(true);
    } else if (violationType !== 'COPY_PASTE') {
      // Show modal only for tab switch and fullscreen exit (not copy/paste)
      setViolationReason(reason);
      setShowViolationModal(true);
    }
  };

  const handleWindowBlur = () => {
    triggerViolation('TAB_SWITCH', 'Rời khỏi tab thi (chuyển đổi ứng dụng hoặc mở cửa sổ mới)');
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      triggerViolation('TAB_SWITCH', 'Rời khỏi màn hình thi (chuyển đổi tab trình duyệt)');
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
        triggerViolation('FULLSCREEN_EXIT', 'Thoát chế độ toàn màn hình khi đang thi');
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [isPreExam]);

  // Copy/paste detection
  useEffect(() => {
    if (isPreExam) return;
    const handleCopyPaste = (e) => {
      e.preventDefault();
      triggerViolation('COPY_PASTE', 'Sao chép hoặc dán nội dung trong phòng thi');
    };
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    return () => {
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
    };
  }, [isPreExam, attemptId]);

  // Track question view events for replay
  useEffect(() => {
    if (isPreExam || questions.length === 0 || !attemptId) return;
    const currentQ = questions[currentIdx];
    if (currentQ) {
      mockExamService.recordExamEvent(attemptId, 'VIEW_QUESTION', currentQ.id, { questionNumber: currentIdx + 1 });
    }
  }, [currentIdx, isPreExam]);

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
    setIsSubmitting(true);

    // Record submit event (fire-and-forget)
    if (attemptId && !attemptId.toString().startsWith('guest')) {
      mockExamService.recordExamEvent(attemptId, 'SUBMIT', null, {
        answeredCount: Object.keys(answersRef.current).filter(k => answersRef.current[k]).length,
        forced: forceSubmit
      });
    }

    // Stop events
    window.removeEventListener('blur', handleWindowBlur);
    document.removeEventListener('visibilitychange', handleVisibilityChange);

    if (!currentUser && !forceSubmit) {
      toast('Bạn chưa đăng nhập. Vui lòng đăng nhập để nộp bài và nhận phân tích từ AI!', 'warning');
      localStorage.setItem('redirect_post_auth', window.location.pathname);
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      setIsSubmitting(false);
      return;
    }

    try {
      const savedSecs = localStorage.getItem(`exam_taking_seconds_${examId}`);
      const secLeft = savedSecs ? parseInt(savedSecs, 10) : (secondsRemainingRef.current || (exam?.duration_minutes * 60));
      const durationSeconds = Math.max(0, ((exam?.duration_minutes || 90) * 60) - secLeft);
      const historyState = window.history.state;
      const activeRetakeMode = exam?.retakeMode || historyState?.retakeMode || null;
      const qIds = activeRetakeMode ? questions.map(q => Number(q.id)) : [];
      const { score, attemptId: submittedId } = await mockExamService.submitMockExam(
        currentUser?.id || 101,
        examId,
        attemptId,
        answersRef.current,
        durationSeconds,
        activeRetakeMode,
        qIds
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
      setIsSubmitting(false);
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
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '16px', color: 'var(--text-primary)' }}>
          Đề thi chưa có câu hỏi
        </h3>
        <button
          className="btn-outline"
          onClick={() => navigateTo('/mock-exams')}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            borderRadius: '10px',
            fontWeight: '800',
            cursor: 'pointer'
          }}
        >
          ← Quay lại trang thi thử
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Trust score badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: estimatedTrustScore >= 90 ? 'rgba(0,184,148,0.1)' : estimatedTrustScore >= 70 ? 'rgba(243,156,18,0.1)' : 'rgba(214,48,49,0.1)',
              color: estimatedTrustScore >= 90 ? '#00b894' : estimatedTrustScore >= 70 ? '#f39c12' : '#d63031',
              padding: '5px 10px', borderRadius: '8px',
              border: `1px solid ${estimatedTrustScore >= 90 ? 'rgba(0,184,148,0.25)' : estimatedTrustScore >= 70 ? 'rgba(243,156,18,0.25)' : 'rgba(214,48,49,0.25)'}`,
              fontSize: '11px', fontWeight: 'bold'
            }}>
              🛡️ Tin cậy: {Math.round(estimatedTrustScore)}%
            </div>

            {/* Per-type violation indicators */}
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: tabViolRef.current > 0 ? 'rgba(231,76,60,0.08)' : 'var(--bg-main)', color: tabViolRef.current > 0 ? 'var(--accent-red)' : 'var(--text-muted)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 'bold' }}>
                ↔️ {tabViolRef.current}/3
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: copyPasteViolRef.current > 0 ? 'rgba(231,76,60,0.08)' : 'var(--bg-main)', color: copyPasteViolRef.current > 0 ? 'var(--accent-red)' : 'var(--text-muted)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 'bold' }}>
                📋 {copyPasteViolRef.current}/5
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: fullscreenViolRef.current > 0 ? 'rgba(231,76,60,0.08)' : 'var(--bg-main)', color: fullscreenViolRef.current > 0 ? 'var(--accent-red)' : 'var(--text-muted)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '11px', fontWeight: 'bold' }}>
                🖥️ {fullscreenViolRef.current}/3
              </div>
            </div>

            <button 
              onClick={toggleFullscreen} 
              className="btn-outline"
              style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              🖥️ {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            </button>

            <ExamTimer
              examId={examId}
              durationMinutes={exam?.duration_minutes}
              initialSeconds={secondsRemaining}
              onTimeUp={handleTimeUp}
            />
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

            <button 
              className="btn-outline"
              disabled={currentIdx === questions.length - 1}
              onClick={() => setCurrentIdx(prev => prev + 1)}
              style={{ 
                padding: '10px 20px', 
                cursor: currentIdx === questions.length - 1 ? 'not-allowed' : 'pointer', 
                opacity: currentIdx === questions.length - 1 ? 0.4 : 1,
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px' 
              }}
            >
              Câu tiếp theo <HiChevronRight />
            </button>
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
        <div className="checkout-overlay" style={{ zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)' }}>
          <div className="checkout-modal animate-in" style={{ maxWidth: '460px', background: 'rgba(30, 41, 59, 0.95)', border: '2px solid #ef4444', borderRadius: '20px', boxShadow: '0 20px 50px rgba(239, 68, 68, 0.15)', color: '#f8fafc', padding: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '56px', color: '#ef4444', animation: 'pulse 1s infinite alternate', margin: '0 auto 12px' }}>
                <HiOutlineShieldExclamation style={{ display: 'block', margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '950', color: '#ef4444', letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 16px 0', fontFamily: "'Outfit', sans-serif" }}>
                CẢNH BÁO AN NINH PHÒNG THI
              </h3>
              
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px', borderRadius: '14px', border: '1.5px solid rgba(255, 255, 255, 0.08)', margin: '18px 0', fontSize: '13.5px', textAlign: 'left', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 12px 0' }}>🔴 <strong>Lý do vi phạm:</strong> <span style={{ color: '#fca5a5' }}>{violationReason}</span></p>
                
                {/* Stats rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <span style={{ color: '#94a3b8' }}>↔️ Rời tab / cửa sổ</span>
                    <strong style={{ color: tabViolRef.current >= 2 ? '#ef4444' : '#f8fafc' }}>{tabViolRef.current}/3 lần</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <span style={{ color: '#94a3b8' }}>🖥️ Thoát toàn màn hình</span>
                    <strong style={{ color: fullscreenViolRef.current >= 2 ? '#ef4444' : '#f8fafc' }}>{fullscreenViolRef.current}/3 lần</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <span style={{ color: '#94a3b8' }}>📋 Sao chép/Dán (Copy/Paste)</span>
                    <strong style={{ color: copyPasteViolRef.current >= 4 ? '#ef4444' : '#f8fafc' }}>{copyPasteViolRef.current}/5 lần</strong>
                  </div>
                </div>

                {/* Progress bar of Trust score */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Chỉ số tin cậy bài làm:</span>
                    <strong style={{ color: estimatedTrustScore < 70 ? '#ef4444' : '#10b981' }}>{Math.round(estimatedTrustScore)}/100</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${estimatedTrustScore}%`, height: '100%', background: estimatedTrustScore >= 80 ? '#10b981' : estimatedTrustScore >= 50 ? '#f59e0b' : '#ef4444', transition: 'width 0.3s ease' }}></div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '8px 0 0 0', fontStyle: 'italic' }}>*Lưu ý: Nếu một trong các chỉ số vượt quá giới hạn tối đa, hệ thống sẽ tự động nộp bài làm của bạn.</p>
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={() => {
                  setShowViolationModal(false);
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  }
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.15)'}
                onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
              >
                XÁC NHẬN & QUAY LẠI LÀM BÀI THI
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

      {/* Submitting Loading Modal */}
      {isSubmitting && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '24px',
            padding: '40px 32px',
            maxWidth: '460px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            {/* Spinning Gradient Ring */}
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid rgba(99, 102, 241, 0.2)',
              borderTop: '4px solid #6366f1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc', margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>
                ⚡ Đang Nộp Bài Thi & Chấm Điểm...
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.6' }}>
                Hệ thống đang lưu lại kết quả bài làm, tính toán điểm số và tổng hợp dữ liệu phân tích từ AI. Vui lòng không thoát trang web!
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              width: '100%',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '16px 18px',
              borderRadius: '16px',
              fontSize: '12.5px',
              color: '#cbd5e1',
              textAlign: 'left',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> Đang lưu kết quả bài làm ({answeredCount}/{questions.length} câu)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> Đang xác nhận thời gian & độ tin cậy
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#6366f1', fontWeight: 'bold' }}>⏳</span> Đang tổng hợp phân tích AI & chuyển sang báo cáo
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL: KHÔNG TÌM THẤY CÂU HỎI PHÙ HỢP */}
      {showNoQuestionsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            border: '2px solid #000000',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              margin: '0 auto 18px auto',
              border: '2px solid #000000',
              boxShadow: '3px 3px 0px #000000'
            }}>
              ⚠️
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '10px' }}>
              Không tìm thấy câu hỏi phù hợp!
            </h3>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
              Hệ thống không tìm thấy câu hỏi phù hợp thuộc chủ đề <strong>"{targetTopicTitle || 'yêu cầu'}"</strong> trong CSDL. Vui lòng chọn chủ đề khác hoặc luyện tập với bộ đề tổng hợp!
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowNoQuestionsModal(false);
                  if (navigateTo) navigateTo('/mock-exams');
                }}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  background: '#F3F4F6',
                  color: '#374151',
                  fontWeight: '800',
                  fontSize: '13.5px',
                  border: '2px solid #000000',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px #000000'
                }}
              >
                ← Chọn chủ đề khác
              </button>
              <button
                onClick={() => setShowNoQuestionsModal(false)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6c5ce7 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  fontWeight: '900',
                  fontSize: '13.5px',
                  border: '2px solid #000000',
                  boxShadow: '2px 2px 0px #000000',
                  cursor: 'pointer'
                }}
              >
                Luyện tập đề tổng hợp 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
