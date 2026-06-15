import { useState, useEffect, useRef } from 'react';
import { toast } from '../utils/toast';
import { createWorker } from 'tesseract.js';
import { 
  HiUpload, HiSparkles, HiCheckCircle, HiRefresh, 
  HiExclamationCircle, HiChevronLeft, HiTrash, HiCheck, HiArrowRight 
} from 'react-icons/hi';
import { api } from '../api';

export default function OCRScanner({ examsList, onBack, addLog }) {
  const [selectedExamId, setSelectedExamId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  
  // OCR results: { [questionOrder]: 'A'|'B'|'C'|'D' }
  const [detectedAnswers, setDetectedAnswers] = useState({});
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentExam, setCurrentExam] = useState(null);
  
  // Scoring results
  const [grading, setGrading] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [viewingExplanationQId, setViewingExplanationQId] = useState(null);
  
  const fileInputRef = useRef(null);

  // Filter exams that are official past papers (or show all public exams)
  const availableExams = examsList.filter(e => e.isPublic) || [];

  // Update selected exam details
  useEffect(() => {
    if (selectedExamId) {
      const exam = availableExams.find(e => e.id === Number(selectedExamId));
      setCurrentExam(exam);
      // Clean previous steps
      setImageFile(null);
      setImagePreview(null);
      setDetectedAnswers({});
      setScoreResult(null);
      
      // Load questions for the selected exam
      const fetchQuestions = async () => {
        try {
          const res = await api.startAttempt(exam.dbExamId || exam.id);
          if (res && res.questions) {
            setExamQuestions(res.questions);
          }
        } catch (err) {
          console.error("Lỗi khi tải câu hỏi của đề thi:", err);
          // Mock some questions if api fails
          const mockQCount = exam.title.includes("Toán") || exam.title.includes("Tiếng Anh") ? 50 : 40;
          const mockQs = Array.from({ length: mockQCount }, (_, i) => ({
            id: i + 1,
            order: i + 1,
            content: `Câu hỏi thứ ${i + 1}`,
            correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
            topic: 'Tổng hợp kiến thức',
            explanation: `Lời giải chi tiết câu ${i + 1}`
          }));
          setExamQuestions(mockQs);
        }
      };
      fetchQuestions();
    } else {
      setCurrentExam(null);
      setExamQuestions([]);
    }
  }, [selectedExamId]);

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setDetectedAnswers({});
      setScoreResult(null);
    } else {
      toast('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, JPEG).', 'warning');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  // Perform client-side OCR using Tesseract.js
  const runOCR = async () => {
    if (!imagePreview) return;
    setScanning(true);
    setScanProgress(0);
    setScanStatus('Khởi tạo công cụ nhận diện OCR...');
    addLog(`[OCR] Bắt đầu nhận diện đáp án từ ảnh tự luận/điền khuyết`, 'sys');

    try {
      const worker = await createWorker('vie+eng'); // load both Vietnamese and English
      
      // Progress logger
      worker.logger = (m) => {
        if (m.status === 'recognizing text') {
          setScanProgress(Math.round(m.progress * 100));
          setScanStatus(`Đang đọc văn bản: ${Math.round(m.progress * 100)}%`);
        } else {
          setScanStatus(m.status);
        }
      };

      const { data: { text } } = await worker.recognize(imagePreview);
      await worker.terminate();

      console.log("[OCR Raw Text Output]:", text);
      setScanStatus('Đang xử lý kết quả nhận dạng...');

      // Parse detected answers from OCR text
      const parsed = {};
      const lines = text.split(/[\r\n]+/);
      
      // Match patterns like: "1A", "2. B", "Câu 3 - C", "Câu 4: D", "5/ A", "6D"
      lines.forEach(line => {
        const cleaned = line.trim();
        // Regex looks for optional word like 'Câu' or 'Cau', then numbers, then separator, then A/B/C/D
        const match = cleaned.match(/(?:câu|cau|q)?\s*(\d+)\s*[\.\-\:\/]?\s*([a-d])\b/i);
        if (match) {
          const qNum = parseInt(match[1], 10);
          const choice = match[2].toUpperCase();
          if (qNum >= 1 && qNum <= examQuestions.length) {
            parsed[qNum] = choice;
          }
        }
      });

      setDetectedAnswers(parsed);
      setScanStatus('Nhận diện hoàn thành!');
      addLog(`[OCR] Hoàn thành nhận dạng. Đã giải mã thành công ${Object.keys(parsed).length}/${examQuestions.length} câu.`, 'ai');
    } catch (err) {
      console.error("OCR Error:", err);
      toast("Lỗi nhận dạng hình ảnh. Hãy điền câu trả lời thủ công vào bảng bên dưới.", 'warning');
      // Initialize empty/empty answers
      setDetectedAnswers({});
    } finally {
      setScanning(false);
    }
  };

  // Run a high-quality simulated OCR if the user wants to test quickly without real handwriting photo
  const runSimulatedOCR = () => {
    setScanning(true);
    setScanProgress(0);
    setScanStatus('Khởi chạy trình giả lập quét camera...');
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      setScanStatus(`Đang quét ảnh bài thi tốt nghiệp THPT... ${progress}%`);
      
      if (progress >= 100) {
        clearInterval(interval);
        setScanning(false);
        
        // Generate simulated answers with some mistakes (e.g. 85% correct matching)
        const sim = {};
        examQuestions.forEach((q, idx) => {
          const order = idx + 1;
          // 85% chance of picking correct answer, 15% random error
          if (Math.random() < 0.85) {
            sim[order] = q.correctAnswer || 'A';
          } else {
            sim[order] = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
          }
        });
        
        setDetectedAnswers(sim);
        setScanStatus('Quét giả lập hoàn thành!');
        addLog(`[OCR Sim] Đã nhận diện giả lập thành công ${examQuestions.length}/${examQuestions.length} câu.`, 'ai');
      }
    }, 150);
  };

  const handleSelectAnswer = (qOrder, letter) => {
    setDetectedAnswers(prev => ({
      ...prev,
      [qOrder]: letter
    }));
  };

  const handleClearAnswer = (qOrder) => {
    setDetectedAnswers(prev => {
      const next = { ...prev };
      delete next[qOrder];
      return next;
    });
  };

  // Submit parsed answers for scoring
  const handleGradeExam = async () => {
    if (!currentExam) return;
    setGrading(true);
    addLog(`Bắt đầu chấm điểm bài thi tự động qua OCR cho đề: "${currentExam.title}"`, 'sys');

    try {
      // 1. Create attempt
      const attemptRes = await api.startAttempt(currentExam.id);
      if (!attemptRes || !attemptRes.attempt) {
        throw new Error("Không thể khởi tạo phiên chấm bài.");
      }

      const attemptId = attemptRes.attempt.id;

      // 2. Map frontend detected answers { [order]: 'A' } to database format
      // Database needs questionId and selectedAnswer. We must match the question ID via order.
      const formattedAnswers = examQuestions.map((q, idx) => {
        const order = idx + 1;
        const selectedLetter = detectedAnswers[order] || ''; // empty if unanswered
        return {
          questionId: q.id,
          selectedAnswer: selectedLetter
        };
      });

      // 3. Submit attempt
      const submitRes = await api.submitAttempt(currentExam.id, attemptId, formattedAnswers);
      if (submitRes && submitRes.attemptAnswers) {
        const correctCount = submitRes.attemptAnswers.filter((ans) => ans.isCorrect).length;
        const score = submitRes.score;
        const aiFeedback = submitRes.aiFeedback || {};

        setScoreResult({
          score,
          correct: correctCount,
          total: examQuestions.length,
          attemptAnswers: submitRes.attemptAnswers,
          aiFeedback
        });

        addLog(`[Chấm điểm] Đã chấm bài thi OCR thành công. Kết quả: ${score.toFixed(1)}/10 điểm.`, 'sys');
      }
    } catch (err) {
      console.error("Lỗi khi chấm điểm OCR:", err);
      // Fallback grade logic on client side if API fails
      let correct = 0;
      const results = examQuestions.map((q, idx) => {
        const order = idx + 1;
        const ans = detectedAnswers[order] || '';
        const isCorrect = ans === q.correctAnswer;
        if (isCorrect) correct++;
        return {
          questionId: q.id,
          selectedAnswer: ans,
          isCorrect,
          question: q
        };
      });
      const score = (correct / examQuestions.length) * 10;
      setScoreResult({
        score,
        correct,
        total: examQuestions.length,
        attemptAnswers: results,
        aiFeedback: {
          assessment: `Bạn đạt ${score.toFixed(1)}/10 điểm trong bài chấm OCR tự động.`,
          knowledgeGaps: [],
          advice: ["Tập trung ôn tập các câu sai để chuẩn bị tốt nhất."],
          encouragement: "Tuyệt vời! Hãy tiếp tục duy trì phong độ ôn tập này!"
        }
      });
      addLog(`[Chấm điểm] Đã tính điểm offline thành công. Kết quả: ${score.toFixed(1)}/10 điểm.`, 'sys');
    } finally {
      setGrading(false);
    }
  };

  return (
    <div className="exams-lobby-layout" style={{ gridTemplateColumns: '1fr' }}>
      <div className="exams-main-content">
        
        {/* Header navigation bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '8px' }}>
          <div>
            <button className="btn-outline" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12.5px', marginBottom: '8px', border: '1px solid var(--border)', background: '#fff', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}>
              <HiChevronLeft /> Quay lại Danh sách đề thi
            </button>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              📸 Tự động Chấm điểm bằng OCR (AI Camera)
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Chụp ảnh bảng trả lời đáp án (viết tay hoặc tô bóng) để hệ thống tự động nhận diện và chấm điểm theo đáp án chính thức.
            </p>
          </div>
          <span style={{ fontSize: '32px' }}>📸</span>
        </div>

        {/* Step 1: Select Exam and Upload Picture */}
        {!scoreResult && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px', alignItems: 'start' }}>
            
            {/* Left panel: Upload and Select */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="form-group">
                <label style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  1. Chọn Đề thi Quốc Gia cần đối soát chấm điểm:
                </label>
                <select 
                  className="form-control" 
                  value={selectedExamId}
                  onChange={e => setSelectedExamId(e.target.value)}
                  style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: '600' }}
                >
                  <option value="">-- Chọn đề thi chính thức --</option>
                  {availableExams.map(exam => (
                    <option key={exam.id} value={exam.id}>
                      {exam.title} ({exam.subject} - {exam.duration} phút)
                    </option>
                  ))}
                </select>
              </div>

              {currentExam && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <label style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                    2. Tải lên ảnh bảng đáp án của em:
                  </label>
                  
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: '16px',
                      padding: '36px 20px',
                      textAlign: 'center',
                      background: 'var(--bg-main)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-bg)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-main)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={e => handleFileChange(e.target.files?.[0])}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    
                    {imagePreview ? (
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={imagePreview} 
                          alt="Ảnh đáp án" 
                          style={{ maxWidth: '100%', maxHeight: '280px', objectFit: 'contain', borderRadius: '8px', border: '1.5px solid var(--border)' }} 
                        />
                        <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                          Thay thế ảnh
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '40px', color: 'var(--primary)' }}><HiUpload /></div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                          Kéo thả ảnh hoặc Nhấp để chọn file ảnh
                        </h4>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                          Chấp nhận ảnh chụp phiếu trả lời hoặc danh sách đáp án viết tay.<br />
                          Định dạng hỗ trợ: JPG, JPEG, PNG (Tối đa 5MB).
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {currentExam && imagePreview && !scanning && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button 
                    className="btn-primary" 
                    onClick={runOCR}
                    style={{ flex: 1, padding: '12px', fontWeight: '600', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(108,92,231,0.2)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <HiSparkles /> Nhận diện OCR thực tế
                  </button>
                  <button 
                    className="btn-outline" 
                    onClick={runSimulatedOCR}
                    style={{ flex: 1, padding: '12px', fontWeight: '600', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: 'var(--shadow-sm)', background: '#fff', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    ⚡ Quét thử nghiệm nhanh (Simulator)
                  </button>
                </div>
              )}

              {scanning && (
                <div 
                  className="scanner-processing-card"
                  style={{
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '14px',
                    textAlign: 'center',
                    marginTop: '10px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Neon laser animation scanning line */}
                  <div 
                    style={{
                      position: 'absolute',
                      left: 0,
                      width: '100%',
                      height: '4px',
                      background: 'rgba(59, 130, 246, 0.8)',
                      boxShadow: '0 0 12px #3b82f6, 0 0 4px #3b82f6',
                      top: 0,
                      animation: 'ocrLaserScan 2s linear infinite'
                    }}
                  />
                  <style>{`
                    @keyframes ocrLaserScan {
                      0% { top: 0%; }
                      50% { top: 100%; }
                      100% { top: 0%; }
                    }
                  `}</style>
                  
                  <div className="progress-spinner" style={{ width: '36px', height: '36px', border: '3.5px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1e3a8a', margin: '0 0 4px 0' }}>{scanStatus}</h4>
                    <p style={{ fontSize: '11.5px', color: '#1d4ed8', margin: 0 }}>Tiến độ xử lý ảnh: {scanProgress}%</p>
                  </div>
                  <div style={{ width: '100%', background: '#dbeafe', height: '8px', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#3b82f6', width: `${scanProgress}%`, transition: 'width 0.2s' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Right panel: Instruction tips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 12px 0', textTransform: 'uppercase', borderBottom: '1px dashed var(--border)', paddingBottom: '6px' }}>
                  💡 HƯỚNG DẪN CHỤP ẢNH ĐỂ ĐẠT ĐỘ CHÍNH XÁC CAO
                </h4>
                <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.5 }}>
                  <li><strong>Viết đáp án thẳng hàng:</strong> Nên viết danh sách đáp án dạng cột dọc hoặc hàng ngang rõ ràng. Ví dụ:
                    <pre style={{ margin: '6px 0', padding: '6px 10px', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-primary)' }}>
                      1. A<br />
                      2. C<br />
                      3 - B<br />
                      4: D
                    </pre>
                  </li>
                  <li><strong>Góc chụp thẳng & đủ sáng:</strong> Chụp vuông góc với mặt giấy, tránh bị bóng mờ che khuất chữ viết.</li>
                  <li><strong>Nét chữ rõ ràng:</strong> Viết in hoa ký tự đáp án (A, B, C, D) để AI nhận diện chuẩn xác nhất.</li>
                  <li><strong>Kiểm tra lại sau khi quét:</strong> Hệ thống cung cấp bảng đối soát để chỉnh sửa lỗi chính tả trước khi tính điểm chính thức.</li>
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* Step 2: Verification Workspace (Detected Answers & Interactive Grid) */}
        {!scoreResult && currentExam && Object.keys(detectedAnswers).length > 0 && !scanning && (
          <div className="card animate-in" style={{ padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(59, 130, 246, 0.08)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div>
                <span className="badge-pill" style={{ background: '#3b82f6', color: '#fff', fontWeight: 'bold', fontSize: '10px' }}>ĐỐI SOÁT ĐÁP ÁN</span>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e3a8a', margin: '4px 0 0 0' }}>
                  Xác nhận danh sách câu trả lời của em
                </h3>
                <p style={{ fontSize: '11.5px', color: '#1d4ed8', margin: '2px 0 0 0' }}>
                  Hãy so khớp với ảnh bài thi bên trái. Bấm trực tiếp vào các ô đáp án để sửa nếu phát hiện nhận diện sai.
                </p>
              </div>
              <button 
                className="btn-outline" 
                onClick={() => setDetectedAnswers({})} 
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '6px 12px', color: '#ef4444', borderColor: '#ef4444', background: '#fff', cursor: 'pointer' }}
              >
                <HiTrash /> Hủy kết quả quét
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', alignItems: 'start' }}>
              
              {/* Left pane: Sticky preview of the answer sheet photo */}
              <div style={{ position: 'sticky', top: '20px' }}>
                <h4 style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>📸 Ảnh gốc bài thi:</h4>
                <div style={{ border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', maxHeight: '420px', display: 'flex', background: '#000', justifyContent: 'center' }}>
                  <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }} />
                </div>
              </div>

              {/* Right pane: Responsive grid matching all questions */}
              <div>
                <h4 style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  📝 Bảng câu trả lời ({Object.keys(detectedAnswers).length}/{examQuestions.length} câu đã nhận diện):
                </h4>
                
                <div 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                    gap: '12px', 
                    maxHeight: '400px', 
                    overflowY: 'auto', 
                    padding: '8px',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    background: 'var(--bg-main)'
                  }}
                >
                  {examQuestions.map((q, idx) => {
                    const order = idx + 1;
                    const val = detectedAnswers[order] || '';
                    
                    return (
                      <div 
                        key={q.id} 
                        style={{ 
                          padding: '10px', 
                          background: 'var(--bg-card)', 
                          border: '1px solid var(--border)', 
                          borderRadius: '10px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '6px', 
                          alignItems: 'center' 
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Câu {order}</span>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          {['A', 'B', 'C', 'D'].map(letter => {
                            const isSelected = val === letter;
                            return (
                              <button
                                key={letter}
                                onClick={() => handleSelectAnswer(order, letter)}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  border: '1px solid var(--border)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                                  color: isSelected ? '#fff' : 'var(--text-primary)',
                                  transition: 'all 0.1s'
                                }}
                              >
                                {letter}
                              </button>
                            );
                          })}
                        </div>
                        {val && (
                          <button 
                            onClick={() => handleClearAnswer(order)}
                            style={{ border: 'none', background: 'none', color: '#ef4444', fontSize: '10px', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Xóa chọn
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button 
                  className="btn-primary" 
                  onClick={handleGradeExam}
                  disabled={grading}
                  style={{ width: '100%', padding: '14px', fontSize: '14px', fontWeight: '600', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '12px', marginTop: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                  {grading ? 'Đang chấm điểm...' : '🚀 XÁC NHẬN & BẮT ĐẦU CHẤM ĐIỂM'}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* Step 3: Grade Report Panel (After Chấm điểm) */}
        {scoreResult && currentExam && (
          <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-card), var(--primary-bg))', border: '1px solid var(--border)', textAlign: 'center', padding: '36px', boxShadow: 'var(--shadow-md)' }}>
              <span className="badge-pill" style={{ background: 'var(--primary)', color: '#fff', fontWeight: 'bold', fontSize: '10.5px' }}>BÁO CÁO KẾT QUẢ OCR</span>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '8px', marginBottom: '4px' }}>KẾT QUẢ BÀI CHẤM TỰ ĐỘNG</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Đề thi chính thức: <strong>{currentExam.title}</strong>
              </p>

              {/* Score Circular Gauge */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '24px 0' }}>
                <svg width="150" height="150" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="60" fill="transparent" stroke="var(--border)" strokeWidth="10" />
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke={scoreResult.score >= 8 ? 'var(--accent-green)' : (scoreResult.score >= 5 ? 'var(--accent-orange)' : 'var(--accent-red)')}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={(2 * Math.PI * 60) - (scoreResult.score / 10) * (2 * Math.PI * 60)}
                    strokeLinecap="round"
                    transform="rotate(-90 80 80)"
                  />
                  <text x="80" y="84" textAnchor="middle" fontSize="30" fontWeight="800" fill="var(--text-primary)">
                    {scoreResult.score.toFixed(1)}
                  </text>
                  <text x="80" y="108" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-muted)">
                    ĐIỂM SỐ
                  </text>
                </svg>
              </div>

              <p style={{ fontSize: '14.5px', color: 'var(--text-primary)', fontWeight: '700', marginBottom: '20px' }}>
                Chính xác <span style={{ color: 'var(--accent-green)' }}>{scoreResult.correct}</span> / {scoreResult.total} câu hỏi. Tỷ lệ chính xác: {Math.round((scoreResult.correct / scoreResult.total) * 100)}%
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn-outline" onClick={() => { setScoreResult(null); setDetectedAnswers({}); }} style={{ padding: '8px 20px', border: '1px solid var(--border)', fontWeight: '600', borderRadius: 'var(--radius-md)', background: '#fff', color: 'var(--text-secondary)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                  <HiRefresh /> Quét ảnh khác
                </button>
                <button className="btn-primary" onClick={onBack} style={{ padding: '8px 24px', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '600', background: 'var(--primary)', color: '#fff', boxShadow: '0 4px 12px rgba(108,92,231,0.2)', cursor: 'pointer' }}>
                  Hoàn thành
                </button>
              </div>
            </div>

            {/* Side-by-side answer key comparison */}
            <div className="card" style={{ padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                📊 BẢNG TRA CỨU ĐÁP ÁN CHI TIẾT
              </h3>

              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', 
                  gap: '12px',
                  maxHeight: '440px',
                  overflowY: 'auto',
                  paddingRight: '6px'
                }}
              >
                {scoreResult.attemptAnswers.map((ans, idx) => {
                  const order = idx + 1;
                  const q = examQuestions[idx];
                  const userAns = ans.selectedAnswer || 'Bỏ trống';
                  const dbCorrect = q?.correctAnswer || ans.correctAnswer;
                  const isCorrect = ans.isCorrect;
                  const isViewingEx = viewingExplanationQId === q?.id;

                  return (
                    <div 
                      key={ans.questionId || idx}
                      style={{ 
                        border: '1px solid var(--border)', 
                        borderRadius: '12px', 
                        padding: '10px 14px', 
                        background: isCorrect ? 'rgba(0,184,148,0.05)' : 'rgba(231,76,60,0.05)',
                        borderColor: isCorrect ? 'var(--accent-green)' : 'var(--accent-red)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)' }}>Câu {order}</span>
                        <span 
                          style={{ 
                            fontSize: '10px', 
                            fontWeight: '700', 
                            color: isCorrect ? 'var(--accent-green)' : 'var(--accent-red)',
                            background: isCorrect ? 'rgba(0,184,148,0.1)' : 'rgba(231,76,60,0.1)',
                            padding: '2px 8px',
                            borderRadius: '20px'
                          }}
                        >
                          {isCorrect ? 'Đúng' : 'Sai'}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <span>Lựa chọn của em: <strong style={{ color: isCorrect ? 'var(--accent-green)' : 'var(--accent-red)' }}>{userAns}</strong></span><br />
                        <span>Đáp án chính xác: <strong style={{ color: 'var(--accent-green)' }}>{dbCorrect}</strong></span>
                      </div>

                      {q?.explanation && (
                        <div style={{ marginTop: '4px' }}>
                          <button 
                            onClick={() => setViewingExplanationQId(isViewingEx ? null : q.id)}
                            style={{ 
                              border: 'none', 
                              background: 'none', 
                              color: 'var(--primary)', 
                              fontSize: '11px', 
                              fontWeight: '600', 
                              cursor: 'pointer', 
                              textDecoration: 'underline',
                              padding: 0
                            }}
                          >
                            {isViewingEx ? 'Ẩn lời giải' : 'Xem lời giải chi tiết'}
                          </button>

                          {isViewingEx && (
                            <div style={{ 
                              marginTop: '8px', 
                              padding: '10px', 
                              background: 'var(--bg-card)', 
                              border: '1px solid var(--border)', 
                              borderRadius: '8px', 
                              fontSize: '11.5px', 
                              color: 'var(--text-secondary)',
                              lineHeight: 1.5,
                              whiteSpace: 'pre-line'
                            }}>
                              <strong style={{ color: 'var(--text-primary)' }}>Chủ đề: {q.topic || 'Tổng ôn'}</strong>
                              <p style={{ margin: '4px 0 0 0' }}>{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Diagnosis and adaptive study tips */}
            <div className="card" style={{ padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', background: 'linear-gradient(135deg, var(--bg-card), var(--primary-bg))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1.5px solid var(--primary)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>🤖</span>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  CHẨN ĐOÁN LỖ HỔNG HỌC TẬP TỪ ADAPTIVE AI
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', margin: '0 0 6px 0' }}>
                    🔍 Nhận xét tổng quan của AI:
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                    {scoreResult.aiFeedback?.assessment || `Hệ thống ghi nhận bạn đã hoàn thành bài thi với điểm số ${scoreResult.score.toFixed(1)}/10.`}
                  </p>
                </div>

                {scoreResult.aiFeedback?.knowledgeGaps && scoreResult.aiFeedback.knowledgeGaps.length > 0 && (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-red)', margin: '0 0 8px 0' }}>
                      ⚠️ Chuyên đề kiến thức bị hổng (tỷ lệ sai trên 40%):
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {scoreResult.aiFeedback.knowledgeGaps.map((topic, i) => (
                        <span key={i} style={{ background: 'rgba(231,76,60,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(231,76,60,0.2)', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' }}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-green)', margin: '0 0 8px 0' }}>
                    💡 Gợi ý cải thiện lộ trình:
                  </h4>
                  <ul style={{ fontSize: '12.5px', color: 'var(--accent-green)', paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(scoreResult.aiFeedback?.advice || [
                      "Xem lại lời giải chi tiết cho các câu trả lời sai.",
                      "Tăng cường làm bài tập mini-test của phần Lộ trình học thích ứng.",
                      "Hỏi AI Tutor trong box hỏi đáp để được giải thích thêm."
                    ]).map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
