import { useState, useEffect } from 'react';
import { toast } from '../utils/toast';
import { HiClock, HiCheckCircle, HiChevronRight, HiChevronLeft, HiSparkles, HiFlag } from 'react-icons/hi';
import studentLearningImg from '../assets/student_learning.png';
import { api } from '../api';

const sampleQuizQuestions = [
  {
    id: 1,
    question: "Cho hàm số $y = x^3 - 3x^2 + 2$. Khẳng định nào sau đây về tính đơn điệu của hàm số là ĐÚNG?",
    options: [
      { key: 'A', value: "Hàm số đồng biến trên khoảng $(0; 2)$" },
      { key: 'B', value: "Hàm số nghịch biến trên khoảng $(0; 2)$" },
      { key: 'C', value: "Hàm số nghịch biến trên khoảng $(-\\infty; 0)$" },
      { key: 'D', value: "Hàm số đồng biến trên khoảng $(2; +\\infty)$ và nghịch biến trên $(-\\infty; 0)$" }
    ],
    correctAnswer: 'B',
    difficulty: 'Dễ',
    difficultyClass: 'diff-easy',
    explanation: "Đạo hàm: y' = 3x^2 - 6x = 3x(x - 2).\ny' = 0 <=> x = 0 hoặc x = 2.\nLập bảng biến thiên:\n- Trong khoảng (0; 2), y' < 0 => Hàm số nghịch biến trên khoảng (0; 2).\n- Trong khoảng (-oo; 0) và (2; +oo), y' > 0 => Hàm số đồng biến.",
    topic: "Sự biến thiên của hàm số"
  },
  {
    id: 2,
    question: "Một vật dao động điều hòa theo phương trình $x = 5\\cos(4\\pi t + \\pi/3)$ (cm). Biên độ và pha ban đầu của dao động lần lượt là:",
    options: [
      { key: 'A', value: "5 cm; \\pi/3 rad" },
      { key: 'B', value: "5 cm; 4\\pi t rad" },
      { key: 'C', value: "-5 cm; \\pi/3 rad" },
      { key: 'D', value: "5 cm; 4\\pi rad" }
    ],
    correctAnswer: 'A',
    difficulty: 'Dễ',
    difficultyClass: 'diff-easy',
    explanation: "Phương trình dao động điều hòa có dạng: x = A cos(omega t + phi).\nSo sánh phương trình dao động x = 5 cos(4*pi*t + pi/3) (cm):\n- Biên độ dao động: A = 5 (cm).\n- Pha ban đầu: phi = pi/3 (rad).",
    topic: "Dao động điều hòa"
  },
  {
    id: 3,
    question: "Cho khối chóp S.ABC có đáy ABC là tam giác vuông tại B, AB = a, BC = 2a, cạnh bên SA vuông góc với đáy và SA = 3a. Thể tích V của khối chóp S.ABC bằng:",
    options: [
      { key: 'A', value: "V = a^3" },
      { key: 'B', value: "V = 3a^3" },
      { key: 'C', value: "V = 2a^3" },
      { key: 'D', value: "V = a^3 / 3" }
    ],
    correctAnswer: 'A',
    difficulty: 'Trung bình',
    difficultyClass: 'diff-medium',
    explanation: "Diện tích đáy S_ABC = 1/2 * AB * BC = 1/2 * a * 2a = a^2.\nThể tích khối chóp: V = 1/3 * SA * S_ABC = 1/3 * 3a * a^2 = a^3.",
    topic: "Thể tích khối đa diện"
  },
  {
    id: 4,
    question: "Trong không gian Oxyz, cho mặt cầu (S): x^2 + y^2 + z^2 - 2x + 4y - 6z - 2 = 0. Tâm I và bán kính R của mặt cầu là:",
    options: [
      { key: 'A', value: "I(1; -2; 3), R = 4" },
      { key: 'B', value: "I(-1; 2; -3), R = 4" },
      { key: 'C', value: "I(1; -2; 3), R = 16" },
      { key: 'D', value: "I(1; -2; 3), R = sqrt(14)" }
    ],
    correctAnswer: 'A',
    difficulty: 'Trung bình',
    difficultyClass: 'diff-medium',
    explanation: "Mặt cầu (S) có hệ số: a = 1, b = -2, c = 3, d = -2.\nTâm mặt cầu I(a; b; c) => I(1; -2; 3).\nBán kính R = sqrt(a^2 + b^2 + c^2 - d) = sqrt(1 + 4 + 9 - (-2)) = sqrt(16) = 4.",
    topic: "Phương trình mặt cầu"
  },
  {
    id: 5,
    question: "Tìm tất cả các giá trị thực của tham số m để phương trình $9^x - 2.3^x + m = 0$ có hai nghiệm thực phân biệt?",
    options: [
      { key: 'A', value: "m < 1" },
      { key: 'B', value: "0 < m < 1" },
      { key: 'C', value: "m > 0" },
      { key: 'D', value: "m <= 0" }
    ],
    correctAnswer: 'B',
    difficulty: 'Khó',
    difficultyClass: 'diff-hard',
    explanation: "Đặt t = 3^x (t > 0). Phương trình trở thành: t^2 - 2t + m = 0 (*).\nĐể phương trình ban đầu có 2 nghiệm thực phân biệt thì phương trình (*) phải có 2 nghiệm t dương phân biệt (t1 > 0, t2 > 0).\nĐiều kiện:\n1) Delta' = 1 - m > 0 <=> m < 1\n2) S = t1 + t2 = 2 > 0 (luôn đúng)\n3) P = t1.t2 = m > 0 <=> m > 0.\nKết hợp điều kiện: 0 < m < 1.",
    topic: "Phương trình mũ và lôgarit"
  }
];

const autoWrapMath = (text) => {
  if (!text) return '';
  if (text.includes('$') || text.includes('\\(') || text.includes('\\[') || text.includes('$$')) {
    return text;
  }
  const latexPattern = /\\(frac|sqrt|vec|alpha|beta|gamma|delta|pi|theta|phi|omega|sigma|int|log|cos|sin|tan|lim|sum|prod|cup|cap|subset|subseteq|in|notin|neq|ge|le|approx|equiv|partial|nabla|to|rightarrow|left|right|cdot|text|mu|omega)/i;
  const mathCharsPattern = /[\^\\_]/;
  const isSimpleOptionFormula = text.length < 80 && (
    latexPattern.test(text) ||
    mathCharsPattern.test(text) ||
    /^[a-zA-Z\s]*[=><\-\+]/i.test(text) && (text.includes('^') || text.includes('/') || text.includes('*'))
  );
  if (isSimpleOptionFormula) {
    return `$${text.trim()}$`;
  }
  let processed = text;
  processed = processed.replace(/(?:\b|\s)(\([-+\infty\w\s]+;[-+\infty\w\s]+(?:\s*;\s*[-+\infty\w\s]+)?\))(?:\b|\s)/g, (match, p1) => {
    return match.replace(p1, `$${p1.trim()}$`);
  });
  processed = processed.replace(/([a-zA-Z_0-9']+(?:_[a-zA-Z0-9]+)?\s*(?:[=><]+|\\approx)\s*(?:[a-zA-Z0-9_+\-*\/\\^{}()[\]\s\.\u03c0\u221e]+))/g, (match, p1) => {
    if (/[\^\\_/\*\u03c0\u221e\(\)]|[a-zA-Z]{2,}\s+[a-zA-Z]/.test(p1) || p1.includes('\\') || p1.includes('^')) {
      let formula = p1.trim();
      const trail = formula.match(/[\.,;:\?]+$/);
      let suffix = '';
      if (trail) {
        formula = formula.slice(0, -trail[0].length);
        suffix = trail[0];
      }
      return ` $${formula}$${suffix} `;
    }
    return match;
  });
  processed = processed.replace(/(?:\s|^)([a-zA-Z0-9_+\-*\/\\^{}()[\]\.]*[\^\\_][a-zA-Z0-9_+\-*\/\\^{}()[\]\.]*)(?:\s|$)/g, (match, p1) => {
    if (!p1.startsWith('$') && !p1.endsWith('$')) {
      let formula = p1.trim();
      const trail = formula.match(/[\.,;:\?]+$/);
      let suffix = '';
      if (trail) {
        formula = formula.slice(0, -trail[0].length);
        suffix = trail[0];
      }
      return ` $${formula}$${suffix} `;
    }
    return match;
  });
  return processed.replace(/\s+/g, ' ');
};

export default function TestSimulator({ exam, testName, onFinished, addLog }) {
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins
  const [submitted, setSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [testMode, setTestMode] = useState('exam'); // 'exam' or 'practice'
  const [flagged, setFlagged] = useState({}); // { [qId]: boolean }
  const [isPaused, setIsPaused] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all', 'correct', 'incorrect', 'unanswered'
  
  // Adaptive AI Practice state
  const [aiGeneratedPractice, setAiGeneratedPractice] = useState(null);
  const [generatingPractice, setGeneratingPractice] = useState(false);

  useEffect(() => {
    const initTest = async () => {
      if (exam && exam.id) {
        setLoading(true);
        try {
          const res = await api.startAttempt(exam.dbExamId || exam.id);
          if (res && res.attempt) {
            setAttemptId(res.attempt.id);
            if (res.questions && res.questions.length > 0) {
              const mapped = res.questions.map(q => {
                let parsedOptions = [];
                if (typeof q.options === 'string') {
                  parsedOptions = JSON.parse(q.options);
                } else if (Array.isArray(q.options)) {
                  parsedOptions = q.options;
                }
                
                const mappedOptions = parsedOptions.map(opt => ({
                  key: opt.label || opt.key,
                  value: autoWrapMath(opt.text || opt.value)
                }));

                return {
                  id: q.id,
                  question: autoWrapMath(q.content),
                  options: mappedOptions,
                  correctAnswer: q.correctAnswer,
                  difficulty: q.difficulty === 'HARD' ? 'Khó' : (q.difficulty === 'MEDIUM' ? 'Trung bình' : 'Dễ'),
                  difficultyClass: q.difficulty === 'HARD' ? 'diff-hard' : (q.difficulty === 'MEDIUM' ? 'diff-medium' : 'diff-easy'),
                  explanation: autoWrapMath(q.explanation || 'Không có lời giải chi tiết.'),
                  topic: q.topic,
                  subject: q.subject
                };
              });
              setQuestions(mapped);
            }
            setTimeLeft((exam.duration || 30) * 60);
          }
        } catch (err) {
          console.error("Lỗi khi tải đề thi từ server:", err);
          toast("Không thể tải đề thi từ hệ thống. Sử dụng đề thi thử nghiệm!", 'warning');
          setQuestions(sampleQuizQuestions);
        } finally {
          setLoading(false);
        }
      } else {
        setQuestions(sampleQuizQuestions);
      }
    };
    initTest();
  }, [exam]);

  useEffect(() => {
    if (testMode === 'practice' || isPaused) return;
    if (timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !submitted) {
      handleSubmitTest();
    }
  }, [timeLeft, submitted, testMode, isPaused]);

  const handleSelectOption = (qId, optionKey) => {
    if (submitted) return;
    setAnswers({
      ...answers,
      [qId]: optionKey
    });
  };

  const toggleFlag = (qId) => {
    if (submitted) return;
    setFlagged(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  useEffect(() => {
    const styleId = 'test-simulator-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes timerPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 rgba(231, 76, 60, 0); }
          100% { transform: scale(1.04); box-shadow: 0 0 12px rgba(231, 76, 60, 0.45); }
        }
        .option-btn:disabled {
          cursor: not-allowed;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (window.MathJax) {
      setTimeout(() => {
        window.MathJax.typesetPromise?.().catch((err) => console.log("MathJax error:", err));
      }, 100);
    }
  }, [currentIdx, questions, submitted, reviewing, aiGeneratedPractice, hasStarted, testMode]);

  const handleSubmitTest = async () => {
    setSubmitted(true);
    let correctCount = 0;
    const failedTopicsList = [];

    if (attemptId && exam) {
      setLoading(true);
      try {
        const backendAnswers = Object.keys(answers).map(qId => ({
          questionId: Number(qId),
          selectedAnswer: answers[qId]
        }));
        
        const res = await api.submitAttempt(exam.dbExamId || exam.id, attemptId, backendAnswers);
        if (res && res.attemptAnswers) {
          correctCount = res.attemptAnswers.filter(ans => ans.isCorrect).length;
          const score = res.score;
          const aiFeedback = res.aiFeedback || {};
          
          setScoreResult({
            score: score,
            correct: correctCount,
            total: questions.length,
            failedTopics: aiFeedback.knowledgeGaps || [],
            aiAdvice: aiFeedback.advice || [],
            aiEncouragement: aiFeedback.encouragement || ""
          });

          addLog(`Học viên nộp bài kiểm tra "${exam.title}". Điểm số: ${score.toFixed(1)}/10`, 'sys');
          
          setTimeout(() => {
            addLog(`[AI] Quét câu trả lời học viên... phát hiện lỗ hổng kiến thức thuộc các chuyên đề: ${(aiFeedback.knowledgeGaps || []).join(', ') || 'Không phát hiện điểm yếu'}`, 'ai');
          }, 1000);
        }
      } catch (err) {
        console.error("Lỗi khi nộp bài thi:", err);
        toast("Có lỗi xảy ra khi gửi kết quả lên hệ thống.", 'error');
      } finally {
        setLoading(false);
      }
    } else {
      questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) {
          correctCount++;
        } else {
          if (!failedTopicsList.includes(q.topic)) {
            failedTopicsList.push(q.topic);
          }
        }
      });

      const finalScore = (correctCount / questions.length) * 10;
      setScoreResult({
        score: finalScore,
        correct: correctCount,
        total: questions.length,
        failedTopics: failedTopicsList
      });

      addLog(`Học viên nộp bài kiểm tra "${testName}". Số câu đúng: ${correctCount}/${questions.length}, Điểm số: ${finalScore.toFixed(1)}`, 'sys');
      
      setTimeout(() => {
        addLog(`[AI] Quét câu trả lời học viên... phát hiện lỗ hổng kiến thức thuộc các chuyên đề: ${failedTopicsList.join(', ') || 'Không phát hiện điểm yếu'}`, 'ai');
      }, 1000);
    }
  };

  const handleGenerateAIPractice = () => {
    setGeneratingPractice(true);
    addLog(`[AI] Đang tổng hợp lỗi sai, tự động sinh 3 câu hỏi ôn luyện chuyên biệt...`, 'ai');
    
    setTimeout(() => {
      setGeneratingPractice(false);
      const generated = [
        {
          id: 101,
          question: "[AI sinh ra - Chủ đề: Phương trình mũ] Cho phương trình $4^x - 6.2^x + 5 = 0$. Tìm tổng các nghiệm thực của phương trình?",
          options: [
            { key: 'A', value: "5" },
            { key: 'B', value: "log2(5)" },
            { key: 'C', value: "1" },
            { key: 'D', value: "log5(2)" }
          ],
          correctAnswer: 'B',
          explanation: "Đặt t = 2^x (t > 0). Phương trình <=> t^2 - 6t + 5 = 0 <=> t = 1 hoặc t = 5.\n=> 2^x = 1 <=> x = 0\n=> 2^x = 5 <=> x = log2(5).\nTổng các nghiệm là: 0 + log2(5) = log2(5)."
        },
        {
          id: 102,
          question: "[AI sinh ra - Chủ đề: Sự biến thiên] Cho hàm số y = -x^3 + 3x. Mệnh đề nào sau đây đúng?",
          options: [
            { key: 'A', value: "Hàm số đồng biến trên (-1; 1)" },
            { key: 'B', value: "Hàm số nghịch biến trên (-1; 1)" },
            { key: 'C', value: "Hàm số đồng biến trên (-oo; -1)" },
            { key: 'D', value: "Hàm số đồng biến trên (1; +oo)" }
          ],
          correctAnswer: 'A',
          explanation: "y' = -3x^2 + 3 = -3(x^2 - 1). y' = 0 <=> x = -1 hoặc x = 1. Trong khoảng (-1; 1), y' > 0 => Hàm số đồng biến."
        }
      ].map(q => ({
        ...q,
        question: autoWrapMath(q.question),
        options: q.options.map(opt => ({ ...opt, value: autoWrapMath(opt.value) })),
        explanation: autoWrapMath(q.explanation)
      }));
      setAiGeneratedPractice(generated);
      addLog(`[AI] Đã tạo thành công 2 câu luyện tập thông minh dựa trên lịch sử lỗi sai!`, 'ai');
    }, 1500);
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const rs = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${rs < 10 ? '0' : ''}${rs}`;
  };

  const currentQuestion = questions && questions.length > 0 ? questions[currentIdx] : null;

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.keys(flagged).filter(id => flagged[id]).length;
  const totalCount = questions.length;
  const blankCount = totalCount - answeredCount;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  const isTimeCritical = timeLeft < 300;
  const criticalTimerStyle = isTimeCritical ? {
    color: 'var(--accent-red)',
    animation: 'timerPulse 1s infinite alternate',
    background: 'rgba(231, 76, 96, 0.1)',
    border: '1.5px solid var(--accent-red)',
    transition: 'all 0.3s ease'
  } : {
    color: 'var(--accent-orange)',
    background: 'rgba(243, 156, 18, 0.05)',
    border: '1px solid var(--border)'
  };

  const statsByDifficulty = {
    'Dễ': { correct: 0, total: 0 },
    'Trung bình': { correct: 0, total: 0 },
    'Khó': { correct: 0, total: 0 }
  };
  
  const statsByTopic = {};
  
  questions.forEach(q => {
    const isCorrect = answers[q.id] === q.correctAnswer;
    const diff = q.difficulty || 'Dễ';
    const topic = q.topic || 'Khác';
    
    if (statsByDifficulty[diff]) {
      statsByDifficulty[diff].total++;
      if (isCorrect) statsByDifficulty[diff].correct++;
    } else {
      statsByDifficulty[diff] = { correct: isCorrect ? 1 : 0, total: 1 };
    }
    
    if (!statsByTopic[topic]) {
      statsByTopic[topic] = { correct: 0, total: 0 };
    }
    statsByTopic[topic].total++;
    if (isCorrect) statsByTopic[topic].correct++;
  });

  return (
    <div className="animate-in">
      {!hasStarted && !submitted ? (
        // PREPARATION AND RULES PORTAL WITH COVER PHOTO
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <div 
            style={{ 
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${studentLearningImg})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center', 
              borderRadius: 'var(--radius-lg)', 
              padding: '40px', 
              color: '#fff', 
              boxShadow: 'var(--shadow-md)' 
            }}
          >
            <span style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Hệ thống Luyện thi THPTQG
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: '900', marginTop: '14px', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.5)', margin: '14px 0 8px 0' }}>
              {testName}
            </h2>
            <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.5', textShadow: '0 1px 2px rgba(0,0,0,0.5)', margin: 0 }}>
              Chào mừng bạn đến với hệ thống thi thử trực tuyến thích ứng AI. Hãy đọc kỹ hướng dẫn dưới đây trước khi bắt đầu làm bài.
            </p>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-main)', margin: '0 0 16px 0' }}>
              📝 QUY CHẾ & HƯỚNG DẪN LÀM BÀI
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '18px' }}>⏰</span>
                <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)', marginTop: '8px' }}>Thời gian làm bài:</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>30 phút (Hệ thống tự động thu bài khi hết giờ).</span>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '18px' }}>📚</span>
                <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)', marginTop: '8px' }}>Số lượng câu hỏi:</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>5 câu trắc nghiệm chuẩn cấu trúc THPTQG.</span>
              </div>
              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '18px' }}>🧠</span>
                <strong style={{ display: 'block', fontSize: '13px', color: 'var(--text-primary)', marginTop: '8px' }}>Tích hợp Adaptive AI:</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>AI chẩn đoán lỗ hổng và tự sinh đề sửa sai ngay lập tức.</span>
              </div>
            </div>

            <h3 style={{ fontSize: '14.5px', fontWeight: 'bold', marginBottom: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
              🎯 CHỌN CHẾ ĐỘ ÔN THI
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <label 
                style={{ 
                  border: testMode === 'exam' ? '2.5px solid var(--primary)' : '1px solid var(--border)', 
                  background: testMode === 'exam' ? 'rgba(108,92,231,0.06)' : 'var(--bg-card)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '16px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '6px',
                  transition: 'all 0.2s',
                  boxShadow: testMode === 'exam' ? 'var(--shadow-sm)' : 'none'
                }}
                onClick={() => setTestMode('exam')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="radio" checked={testMode === 'exam'} readOnly style={{ accentColor: 'var(--primary)', cursor: 'pointer' }} />
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Chế độ Thi thử (Exam Mode)</strong>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Hệ thống đếm ngược thời gian nghiêm ngặt. Chỉ hiển thị đáp án, lời giải chi tiết và nhận xét của Adaptive AI sau khi đã nộp bài thi.
                </span>
              </label>

              <label 
                style={{ 
                  border: testMode === 'practice' ? '2.5px solid var(--primary)' : '1px solid var(--border)', 
                  background: testMode === 'practice' ? 'rgba(108,92,231,0.06)' : 'var(--bg-card)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '16px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '6px',
                  transition: 'all 0.2s',
                  boxShadow: testMode === 'practice' ? 'var(--shadow-sm)' : 'none'
                }}
                onClick={() => setTestMode('practice')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="radio" checked={testMode === 'practice'} readOnly style={{ accentColor: 'var(--primary)', cursor: 'pointer' }} />
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Chế độ Luyện tập (Practice Mode)</strong>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Không đếm ngược áp lực thời gian. Đáp án và giải thích chi tiết hiển thị ngay lập tức sau khi bấm chọn mỗi câu hỏi.
                </span>
              </label>
            </div>

            <div style={{ background: 'rgba(243,156,18,0.08)', borderLeft: '4px solid var(--accent-orange)', padding: '12px 16px', borderRadius: '0 8px 8px 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
              ⚠️ **Lưu ý quan trọng:** Không tải lại trang (reload) hoặc đóng trình duyệt trong quá trình thi. Kết quả bài thi sẽ được lưu tự động để cập nhật Lộ trình thích ứng cá nhân hóa.
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="btn-outline" 
                onClick={() => window.location.reload()}
                style={{ padding: '10px 24px', fontSize: '13px' }}
              >
                Quay lại Bảng điều khiển
              </button>
              <button 
                className="btn-primary" 
                onClick={() => { setHasStarted(true); addLog(`Học sinh bắt đầu bài thi thử: "${testName}"`, 'sys'); }}
                style={{ padding: '10px 32px', fontSize: '13px', background: 'linear-gradient(135deg, var(--primary), #a29bfe)', border: 'none', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(108,92,231,0.3)' }}
              >
                Bắt đầu làm bài ngay 🚀
              </button>
            </div>
          </div>
        </div>
      ) : !submitted ? (
        loading || questions.length === 0 ? (
          <div className="card animate-in" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', margin: '40px auto', maxWidth: '600px' }}>
            <div className="progress-spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', fontWeight: '500' }}>Đang nạp đề thi từ hệ thống Adaptive AI...</p>
          </div>
        ) : (
          // ACTIVE TEST TAKING ENVIRONMENT
          <div className="test-simulator-layout">
            <div className="test-questions-panel" style={{ position: 'relative', minHeight: '400px' }}>
              {isPaused && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.85)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  zIndex: 1000, borderRadius: 'var(--radius-lg)', padding: '24px', color: '#fff',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '48px', marginBottom: '16px' }}>⏸️</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#fff' }}>ĐÃ TẠM DỪNG BÀI THI</h3>
                  <p style={{ fontSize: '13px', opacity: 0.8, maxWidth: '320px', marginBottom: '24px', lineHeight: 1.5 }}>
                    Nội dung câu hỏi đã được ẩn đi để đảm bảo tính công bằng. Bạn có thể tiếp tục làm bài bất cứ lúc nào.
                  </p>
                  <button className="btn-primary" onClick={() => setIsPaused(false)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px 32px', fontWeight: 'bold', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                    Tiếp tục làm bài 🚀
                  </button>
                </div>
              )}
              <div className="question-item-box">
                <div className="question-header">
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>
                    Câu {currentIdx + 1} của {questions.length}
                  </span>
                  <span className={`difficulty-tag ${currentQuestion?.difficultyClass}`}>
                    Độ khó: {currentQuestion?.difficulty}
                  </span>
                </div>
                <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', lineHeight: '1.6' }}>
                  {currentQuestion?.question}
                </p>

                <div className="options-list">
                  {currentQuestion?.options.map((opt) => {
                    const selectedOption = answers[currentQuestion.id];
                    const isSelected = selectedOption === opt.key;
                    const isCorrect = currentQuestion.correctAnswer === opt.key;
                    const hasAnswered = !!selectedOption;
                    
                    let btnClass = `option-btn`;
                    let btnStyle = {};
                    let iconStyle = {};
                    
                    if (testMode === 'practice' && hasAnswered) {
                      if (isCorrect) {
                        btnStyle = { border: '2px solid var(--accent-green)', background: 'rgba(0,184,148,0.08)' };
                        iconStyle = { background: 'var(--accent-green)', color: '#fff', borderColor: 'var(--accent-green)' };
                      } else if (isSelected) {
                        btnStyle = { border: '2px solid var(--accent-red)', background: 'rgba(231,76,60,0.08)' };
                        iconStyle = { background: 'var(--accent-red)', color: '#fff', borderColor: 'var(--accent-red)' };
                      } else {
                        btnStyle = { opacity: 0.6 };
                      }
                    } else {
                      if (isSelected) {
                        btnClass += ' selected';
                      }
                    }

                    return (
                      <button
                        key={opt.key}
                        className={btnClass}
                        style={btnStyle}
                        disabled={testMode === 'practice' && hasAnswered}
                        onClick={() => handleSelectOption(currentQuestion.id, opt.key)}
                      >
                        <span className="option-letter" style={iconStyle}>{opt.key}</span>
                        <span style={{ fontSize: '13.5px' }}>{opt.value}</span>
                        {testMode === 'practice' && hasAnswered && isCorrect && (
                          <span style={{ marginLeft: 'auto', color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '12px' }}>✓</span>
                        )}
                        {testMode === 'practice' && hasAnswered && isSelected && !isCorrect && (
                          <span style={{ marginLeft: 'auto', color: 'var(--accent-red)', fontWeight: 'bold', fontSize: '12px' }}>✗</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {testMode === 'practice' && answers[currentQuestion.id] && (
                  <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border)',
                    animation: 'fadeInUp 0.3s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 'bold',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        color: '#fff',
                        background: answers[currentQuestion.id] === currentQuestion.correctAnswer ? 'var(--accent-green)' : 'var(--accent-red)'
                      }}>
                        {answers[currentQuestion.id] === currentQuestion.correctAnswer ? '✓ Chính xác' : `✗ Sai rồi (Đáp án đúng: ${currentQuestion.correctAnswer})`}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Chuyên đề: {currentQuestion.topic}
                      </span>
                    </div>
                    <div style={{ fontSize: '13.5px', lineHeight: '1.6' }}>
                      <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>💡 Lời giải chi tiết:</strong>
                      <p style={{ whiteSpace: 'pre-line', color: 'var(--text-secondary)' }}>{currentQuestion.explanation}</p>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', gap: '10px' }}>
                <button
                  className="btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(currentIdx - 1)}
                >
                  <HiChevronLeft /> Câu trước
                </button>
                
                <button
                  className="btn-outline"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    borderColor: flagged[currentQuestion.id] ? 'var(--accent-orange)' : 'var(--border)',
                    background: flagged[currentQuestion.id] ? 'rgba(243,156,18,0.1)' : 'transparent',
                    color: flagged[currentQuestion.id] ? 'var(--accent-orange)' : 'var(--text-primary)'
                  }}
                  onClick={() => toggleFlag(currentQuestion.id)}
                >
                  <HiFlag /> {flagged[currentQuestion.id] ? 'Đã đánh dấu' : 'Đánh dấu câu'}
                </button>

                <button
                  className="btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  disabled={currentIdx === questions.length - 1}
                  onClick={() => setCurrentIdx(currentIdx + 1)}
                >
                  Câu sau <HiChevronRight />
                </button>
              </div>
            </div>

            <div className="test-sidebar-panel">
              {testMode === 'exam' ? (
                <div className="card" style={{ padding: '16px', textAlign: 'center', ...criticalTimerStyle }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                    <HiClock style={{ fontSize: '20px' }} />
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatTimer(timeLeft)}</span>
                  </div>
                  <p style={{ fontSize: '11px', fontWeight: isTimeCritical ? 'bold' : 'normal' }}>
                    {isTimeCritical ? '⏳ SẮP HẾT GIỜ! NỘP BÀI NGAY' : 'Thời gian làm bài còn lại'}
                  </p>
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    style={{
                      marginTop: '10px',
                      width: '100%',
                      padding: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: isPaused ? 'var(--primary)' : 'var(--bg-card)',
                      color: isPaused ? '#fff' : 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isPaused ? '▶️ Tiếp tục làm bài' : '⏸️ Tạm dừng làm bài'}
                  </button>
                </div>
              ) : (
                <div className="card" style={{ padding: '16px', textAlign: 'center', border: '1.5px dashed var(--accent-green)', background: 'rgba(0,184,148,0.05)', color: 'var(--accent-green)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                    <HiCheckCircle style={{ fontSize: '20px' }} />
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Luyện tập tự do</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Chế độ tự luyện, không tính giờ.</p>
                </div>
              )}

              {/* Progress & Statistics Card */}
              <div className="card" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--text-primary)' }}>Tiến trình làm bài</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>Hoàn thành {progressPercent}%</span>
                  <span>{answeredCount}/{totalCount} câu</span>
                </div>
                <div style={{ background: 'var(--bg-main)', height: '8px', borderRadius: '10px', overflow: 'hidden', marginBottom: '14px', border: '1px solid var(--border)' }}>
                  <div style={{
                    height: '100%',
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
                    borderRadius: '10px',
                    transition: 'width 0.3s ease-in-out'
                  }}></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                  <div style={{ background: 'var(--bg-main)', padding: '8px 4px', borderRadius: 'var(--radius-sm)' }}>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--primary)' }}>{answeredCount}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Đã làm</span>
                  </div>
                  <div style={{ background: 'var(--bg-main)', padding: '8px 4px', borderRadius: 'var(--radius-sm)' }}>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)' }}>{blankCount}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Chưa làm</span>
                  </div>
                  <div style={{ background: 'var(--bg-main)', padding: '8px 4px', borderRadius: 'var(--radius-sm)' }}>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--accent-orange)' }}>{flaggedCount}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Đã đánh dấu</span>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>BẢN ĐỒ CÂU HỎI</h4>
                <div className="test-grid-bubble" style={{ marginBottom: '16px' }}>
                  {questions.map((q, idx) => {
                    const isAnswered = !!answers[q.id];
                    const isFlagged = !!flagged[q.id];
                    const isCurrent = currentIdx === idx;
                    
                    let bg = 'var(--bg-main)';
                    let color = 'var(--text-primary)';
                    let border = '1px solid var(--border)';
                    
                    if (isCurrent) {
                      border = '2.5px solid var(--primary)';
                      bg = 'var(--primary-bg)';
                      color = 'var(--primary)';
                    } else if (isFlagged) {
                      bg = 'var(--accent-orange)';
                      color = '#fff';
                      border = '1px solid var(--accent-orange)';
                    } else if (isAnswered) {
                      bg = 'var(--primary)';
                      color = '#fff';
                      border = '1px solid var(--primary)';
                    }
                    
                    return (
                      <button
                        key={q.id}
                        className="bubble-num"
                        style={{
                          background: bg,
                          color: color,
                          border: border,
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                        onClick={() => setCurrentIdx(idx)}
                      >
                        {idx + 1}
                        {isFlagged && (
                          <span style={{
                            position: 'absolute',
                            top: '-3px',
                            right: '-3px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--accent-red)',
                            border: '1px solid #fff'
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>
                <button className="btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', border: 'none', color: '#fff', fontWeight: '600', padding: '12px', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(108,92,231,0.2)', cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={handleSubmitTest}>
                  Nộp bài thi
                </button>
              </div>
            </div>
          </div>
        )
      ) : (
        // POST SUBMISSION GRADE REPORT AND AI DIAGNOSIS
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card animate-in" style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--primary-bg))', border: '1px solid var(--border)', textAlign: 'center', padding: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>KẾT QUẢ BÀI LÀM</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Đề thi thử THPT Quốc gia: <strong>{testName}</strong>
            </p>

            {/* Circular Progress SVG */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '24px 0' }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke="var(--border)"
                  strokeWidth="10"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="transparent"
                  stroke={(scoreResult?.score || 0) >= 8 ? 'var(--accent-green)' : ((scoreResult?.score || 0) >= 5 ? 'var(--accent-orange)' : 'var(--accent-red)')}
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={(2 * Math.PI * 60) - ((scoreResult?.score || 0) / 10) * (2 * Math.PI * 60)}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                  style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                />
                <text
                  x="80"
                  y="82"
                  textAnchor="middle"
                  fontSize="28"
                  fontWeight="900"
                  fill="var(--text-primary)"
                >
                  {(scoreResult?.score || 0).toFixed(1)}
                </text>
                <text
                  x="80"
                  y="108"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="var(--text-muted)"
                >
                  ĐIỂM SỐ
                </text>
              </svg>
            </div>

            <p style={{ fontSize: '14.5px', color: 'var(--text-primary)', marginBottom: '20px' }}>
              Chính xác <strong>{scoreResult?.correct || 0}</strong> / <strong>{scoreResult?.total || questions.length}</strong> câu hỏi. 
              {(scoreResult?.score || 0) >= 8 ? ' 🎉 Hoàn thành xuất sắc!' : ((scoreResult?.score || 0) >= 5 ? ' 👍 Khá tốt!' : ' ✍️ Cần cố gắng thêm!')}
            </p>

            {/* Topic & Difficulty Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '10px', textAlign: 'left' }}>
              {/* Difficulty breakdown */}
              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  📊 ĐÁNH GIÁ THEO ĐỘ KHÓ
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(statsByDifficulty).map(([diff, val]) => {
                    if (val.total === 0) return null;
                    const pct = Math.round((val.correct / val.total) * 100);
                    let color = 'var(--accent-green)';
                    if (diff === 'Trung bình') color = 'var(--accent-orange)';
                    if (diff === 'Khó') color = 'var(--accent-red)';
                    return (
                      <div key={diff} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ fontWeight: '600' }}>{diff}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{val.correct}/{val.total} câu ({pct}%)</span>
                        </div>
                        <div style={{ background: 'var(--bg-card)', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '10px' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Topic breakdown */}
              <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  📚 PHÂN TÍCH THEO CHUYÊN ĐỀ
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '180px', overflowY: 'auto' }}>
                  {Object.entries(statsByTopic).map(([topic, val]) => {
                    const pct = Math.round((val.correct / val.total) * 100);
                    return (
                      <div key={topic} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ fontWeight: '500', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }} title={topic}>
                            {topic}
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>{val.correct}/{val.total} ({pct}%)</span>
                        </div>
                        <div style={{ background: 'var(--bg-card)', height: '6px', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: '10px' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '28px' }}>
              <button className="btn-primary" onClick={() => setReviewing(true)} style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))', border: 'none', padding: '10px 24px', fontWeight: '600', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(108,92,231,0.2)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                🔎 Xem đáp án chi tiết
              </button>
              <button className="btn-outline" onClick={() => onFinished(scoreResult)} style={{ padding: '10px 24px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)' }}>
                Hoàn thành đề thi
              </button>
            </div>
          </div>

          {/* AI ADAPTIVE DIAGNOSIS AND ROADMAP UPDATER PANEL */}
          <div className="card" style={{ borderLeft: '5px solid var(--primary)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <HiSparkles style={{ color: 'var(--primary)', fontSize: '22px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>CHẨN ĐOÁN & GỢI Ý LỘ TRÌNH TỪ ADAPTIVE AI</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-red)', marginBottom: '8px' }}>
                  ⚠️ Lỗ hổng kiến thức cần khắc phục:
                </p>
                <ul style={{ paddingLeft: '16px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  {(scoreResult?.failedTopics || []).length > 0 ? (
                    (scoreResult.failedTopics).map((topic, i) => (
                      <li key={i}>{topic} (Tỷ lệ trả lời sai: 100%)</li>
                    ))
                  ) : (
                    <li style={{ color: 'var(--accent-green)', listStyleType: 'none', paddingLeft: 0, marginLeft: '-16px' }}>
                      🎉 Tuyệt vời! AI không phát hiện lỗ hổng lớn nào. Bạn đã nắm chắc kiến thức thuộc đề thi này!
                    </li>
                  )}
                </ul>

                <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary)' }}>
                  💡 Nhận xét chi tiết từ Trợ lý AI:
                </p>
                <div style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6', border: '1px solid var(--border)' }}>
                  <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {scoreResult?.aiEncouragement || (
                      (scoreResult?.score || 0) >= 8
                        ? "Rất xuất sắc! Bạn đang nắm vững kiến thức trọng tâm. Hãy duy trì phong độ và luyện thêm các bài tập nâng cao."
                        : (scoreResult?.score || 0) >= 5
                          ? "Làm tốt lắm! Nhưng vẫn còn một số lỗ hổng kiến thức cần bù đắp. Hãy xem kỹ lời giải chi tiết và làm thêm bài tập ôn tập."
                          : "Đừng nản chí! Kết quả này cho thấy bạn cần củng cố lại lý thuyết nền tảng. Hãy kiên trì học theo lộ trình gợi ý nhé."
                    )}
                  </p>
                  <ul style={{ paddingLeft: '14px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(scoreResult?.aiAdvice || [
                      "Cần dành thêm thời gian ôn luyện lại các định nghĩa cơ bản và phương pháp giải nhanh.",
                      "Luyện tập thêm các bài tập có độ khó Trung bình và Khó thuộc chuyên đề đã bị sai.",
                      "Tham khảo video bài giảng chi tiết trên hệ thống để vá lỗ hổng kiến thức bị hổng."
                    ]).map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '24px' }}>
                <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  ⚡ Sinh đề luyện tập sửa sai (Adaptive AI Practice):
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.5' }}>
                  Dựa trên các câu trả lời sai, AI tự động chọn lọc từ ngân hàng câu hỏi để thiết kế bài ôn tập tức thì nhằm củng cố các kỹ năng còn yếu.
                </p>
                
                {!aiGeneratedPractice ? (
                  <button
                    className="btn-primary"
                    style={{ fontSize: '12.5px', padding: '10px 22px', display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, var(--accent-orange), #e67e22)', border: 'none', color: '#fff', fontWeight: '600', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(243,156,18,0.2)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    disabled={generatingPractice}
                    onClick={handleGenerateAIPractice}
                  >
                    {generatingPractice ? (
                      <>
                        <div className="progress-spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block' }}></div>
                        &nbsp;Đang tổng hợp...
                      </>
                    ) : (
                      <>✨ Tự động tạo bài tập sửa sai</>
                    )}
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeInUp 0.3s ease' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: 'var(--accent-green)' }}>
                      ✓ Đã tạo bài luyện tập sửa sai (2 câu):
                    </div>
                    {aiGeneratedPractice.map((pq) => (
                      <div key={pq.id} style={{ background: 'var(--bg-main)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>{pq.question}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                          {pq.options.map(o => (
                            <div key={o.key} style={{ background: 'var(--bg-card)', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                              <strong>{o.key}.</strong> {o.value}
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize: '12px', background: 'var(--primary-bg)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)', color: 'var(--text-secondary)' }}>
                          🔑 <strong>Đáp án {pq.correctAnswer}:</strong> <span style={{ whiteSpace: 'pre-line' }}>{pq.explanation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DETAILED QUESTIONS REVIEW PANEL */}
          {reviewing && (
            <div className="card animate-in" style={{ marginTop: '10px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>XEM ĐÁP ÁN CHI TIẾT TỪNG CÂU</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div style={{ borderRight: '1px solid var(--border)', paddingRight: '16px' }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {['all', 'correct', 'incorrect', 'unanswered'].map(f => (
                      <button
                        key={f}
                        onClick={() => {
                          setReviewFilter(f);
                          const filteredIdxs = questions.map((q, idx) => ({ q, idx })).filter(item => {
                            const isCorrect = answers[item.q.id] === item.q.correctAnswer;
                            const hasAnswered = !!answers[item.q.id];
                            if (f === 'correct') return isCorrect;
                            if (f === 'incorrect') return hasAnswered && !isCorrect;
                            if (f === 'unanswered') return !hasAnswered;
                            return true;
                          }).map(item => item.idx);
                          if (filteredIdxs.length > 0 && !filteredIdxs.includes(currentIdx)) {
                            setCurrentIdx(filteredIdxs[0]);
                          }
                        }}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          background: reviewFilter === f ? 'var(--primary)' : 'var(--bg-card)',
                          color: reviewFilter === f ? '#fff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        {f === 'all' ? 'Tất cả' : (f === 'correct' ? 'Đúng' : (f === 'incorrect' ? 'Sai' : 'Chưa làm'))}
                      </button>
                    ))}
                  </div>
                  <div className="test-grid-bubble">
                    {questions.map((q, idx) => {
                      const isCorrect = answers[q.id] === q.correctAnswer;
                      const hasAnswered = !!answers[q.id];
                      if (reviewFilter === 'correct' && !isCorrect) return null;
                      if (reviewFilter === 'incorrect' && (!hasAnswered || isCorrect)) return null;
                      if (reviewFilter === 'unanswered' && hasAnswered) return null;
                      return (
                        <button
                          key={q.id}
                          className="bubble-num"
                          style={{
                            background: isCorrect ? 'var(--accent-green)' : 'var(--accent-red)',
                            color: '#fff',
                            borderColor: isCorrect ? 'var(--accent-green)' : 'var(--accent-red)',
                            opacity: currentIdx === idx ? 1 : 0.7,
                            transform: currentIdx === idx ? 'scale(1.1)' : 'scale(1)'
                          }}
                          onClick={() => setCurrentIdx(idx)}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', background: 'var(--accent-green)', borderRadius: '2px' }}></span>
                      <span>Câu đúng</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', background: 'var(--accent-red)', borderRadius: '2px' }}></span>
                      <span>Câu sai</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>Câu hỏi {currentIdx + 1}:</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chuyên đề: {currentQuestion.topic}</span>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>{currentQuestion.question}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      {currentQuestion.options.map(o => {
                        const isChosen = answers[currentQuestion.id] === o.key;
                        const isCorrect = currentQuestion.correctAnswer === o.key;
                        let btnStyle = { border: '1px solid var(--border)', background: 'var(--bg-card)' };
                        if (isCorrect) {
                          btnStyle = { border: '1px solid var(--accent-green)', background: 'rgba(0,184,148,0.1)' };
                        } else if (isChosen) {
                          btnStyle = { border: '1px solid var(--accent-red)', background: 'rgba(231,76,60,0.1)' };
                        }
                        return (
                          <div key={o.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '4px', ...btnStyle, fontSize: '12.5px' }}>
                            <strong style={{
                              width: '20px', height: '20px', borderRadius: '50%',
                              background: isCorrect ? 'var(--accent-green)' : (isChosen ? 'var(--accent-red)' : 'var(--bg-main)'),
                              color: (isCorrect || isChosen) ? '#fff' : 'var(--text-primary)',
                              display: 'flex', alignItems: 'center', justifycontent: 'center', fontSize: '11px'
                            }}>{o.key}</strong>
                            <span>{o.value}</span>
                            {isCorrect && <span style={{ color: 'var(--accent-green)', fontSize: '11px', marginLeft: 'auto', fontWeight: 'bold' }}>✓ Đáp án đúng</span>}
                            {isChosen && !isCorrect && <span style={{ color: 'var(--accent-red)', fontSize: '11px', marginLeft: 'auto', fontWeight: 'bold' }}>✗ Bạn đã chọn</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', lineHeight: '1.5' }}>
                      <strong>💡 Lời giải chi tiết:</strong>
                      <p style={{ whiteSpace: 'pre-line', marginTop: '6px', color: 'var(--text-secondary)' }}>{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
