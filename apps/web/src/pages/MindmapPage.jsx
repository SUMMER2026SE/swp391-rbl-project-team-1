import { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../api';
import '../styles/mindmap.css';
import { 
  HiSparkles, 
  HiArrowLeft, 
  HiPlus, 
  HiMinus, 
  HiTrash, 
  HiShare, 
  HiClipboardList, 
  HiRefresh, 
  HiFolderOpen,
  HiLightningBolt,
  HiUpload,
  HiCamera,
  HiAcademicCap,
  HiCheckCircle,
  HiInformationCircle,
  HiX
} from 'react-icons/hi';

// Layout tree recursively and center parent nodes between their children
function layoutTree(node, depth = 0, yOffset = { val: 50 }) {
  if (!node) return null;
  
  const layoutNode = {
    key: node.key,
    name: node.name,
    description: node.description,
    depth,
    children: []
  };
  
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      const childLayout = layoutTree(child, depth + 1, yOffset);
      if (childLayout) {
        layoutNode.children.push(childLayout);
      }
    }
    // Parent Y is average of children Y
    if (layoutNode.children.length > 0) {
      const firstY = layoutNode.children[0].y;
      const lastY = layoutNode.children[layoutNode.children.length - 1].y;
      layoutNode.y = (firstY + lastY) / 2;
    } else {
      layoutNode.y = yOffset.val;
      yOffset.val += 150;
    }
  } else {
    layoutNode.y = yOffset.val;
    yOffset.val += 150; // vertical spacing between leaf nodes
  }
  
  layoutNode.x = depth * 260;
  return layoutNode;
}

// Flatten positioned nodes into list
function flattenNodes(layoutNode, nodesList = []) {
  if (!layoutNode) return nodesList;
  nodesList.push(layoutNode);
  if (layoutNode.children) {
    for (const child of layoutNode.children) {
      flattenNodes(child, nodesList);
    }
  }
  return nodesList;
}

export default function MindmapPage({ currentUser, navigateTo }) {
  // Guard against unauthenticated visitors
  if (!currentUser) {
    return (
      <div className="mindmap-page animate-in" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '40px auto', padding: '32px', border: '2px solid var(--border)', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', background: 'var(--bg-card)' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔒</span>
          <h2 style={{ fontSize: '20px', fontWeight: '950', marginBottom: '10px', color: 'var(--text-main)' }}>YÊU CẦU ĐĂNG NHẬP</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
            Vui lòng đăng nhập tài khoản học sinh EduPath để sử dụng tính năng Sơ đồ tư duy AI thông minh và luyện tập trắc nghiệm.
          </p>
          <button onClick={() => navigateTo('/login')} className="btn-primary" style={{ padding: '10px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>
            Đăng nhập ngay ➔
          </button>
        </div>
      </div>
    );
  }

  // Navigation & Workspace states
  const [mindmaps, setMindmaps] = useState([]);
  const [activeMindmap, setActiveMindmap] = useState(null); // loaded mindmap
  const [nodeProgresses, setNodeProgresses] = useState({}); // nodeKey -> progress object
  
  // Creation Flow states
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'create', 'ocr', 'weakness'
  const [textPrompt, setTextPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftMindmap, setDraftMindmap] = useState(null); // generated but unsaved
  
  // File upload state for OCR
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Interactive Canvas zoom state
  const [zoom, setZoom] = useState(1.0);
  
  // Node Detail Drawer state
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Quiz states
  const [activeQuiz, setActiveQuiz] = useState(null); // holds 5 questions
  const [quizAnswers, setQuizAnswers] = useState({}); // questionId -> selectedIndex
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(null); // quiz score & explanations
  const [quizTimer, setQuizTimer] = useState(0);
  const [quizIntervalId, setQuizIntervalId] = useState(null);

  const canvasContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Drag-to-pan state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Load User Mindmaps on load
  const fetchMindmaps = async () => {
    try {
      const data = await api.getMindmaps();
      setMindmaps(data || []);
    } catch (err) {
      console.error("fetchMindmaps error:", err);
    }
  };

  useEffect(() => {
    fetchMindmaps();
  }, []);

  // Fetch node mastery progress when active mindmap changes
  useEffect(() => {
    if (activeMindmap) {
      const fetchProgress = async () => {
        try {
          const progress = await api.getNodeProgress(activeMindmap.id);
          const mapped = {};
          if (progress) {
            progress.forEach(p => {
              if (p.node?.nodeKey) {
                mapped[p.node.nodeKey] = p;
              }
            });
          }
          setNodeProgresses(mapped);
        } catch (err) {
          console.error("fetch progress error:", err);
        }
      };
      fetchProgress();
    } else {
      setNodeProgresses({});
    }
  }, [activeMindmap]);

  // Layout calculations for current active tree
  const activeTreeLayout = useMemo(() => {
    const mindmap = activeMindmap || draftMindmap;
    if (!mindmap || !mindmap.content) return null;
    
    let parsedContent = mindmap.content;
    if (typeof parsedContent === 'string') {
      try {
        parsedContent = JSON.parse(parsedContent);
      } catch (err) {
        console.error("Error parsing mindmap content string:", err);
        return null;
      }
    }
    
    if (!parsedContent.rootNode) return null;
    
    const root = parsedContent.rootNode;
    const yOffset = { val: 50 };
    return layoutTree(root, 0, yOffset);
  }, [activeMindmap, draftMindmap]);

  const flatNodesList = useMemo(() => {
    return activeTreeLayout ? flattenNodes(activeTreeLayout) : [];
  }, [activeTreeLayout]);

  // Subject categorization styling helper
  const getSubjectClass = (title) => {
    const t = String(title).toLowerCase();
    if (t.includes('toán') || t.includes('hàm số') || t.includes('tích phân')) return 'node-math';
    if (t.includes('lý') || t.includes('sóng') || t.includes('dao động')) return 'node-physics';
    if (t.includes('hóa') || t.includes('este') || t.includes('polime')) return 'node-chemistry';
    if (t.includes('anh') || t.includes('english') || t.includes('grammar')) return 'node-english';
    return 'node-root';
  };

  // SVG Line Renderer
  const renderSVGConnections = () => {
    const paths = [];
    flatNodesList.forEach(node => {
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => {
          const startX = node.x + 200;
          const startY = node.y + 30;
          const endX = child.x;
          const endY = child.y + 30;
          const pathD = `M ${startX} ${startY} C ${(startX + endX)/2} ${startY}, ${(startX + endX)/2} ${endY}, ${endX} ${endY}`;
          const isSelectedPath = selectedNode && (selectedNode.key === node.key || selectedNode.key === child.key);
          
          paths.push(
            <path
              key={`${node.key}-${child.key}`}
              d={pathD}
              className={`mindmap-connection-line ${isSelectedPath ? 'active' : ''}`}
            />
          );
        });
      }
    });
    return paths;
  };

  // Canvas Drag to Pan logic
  const handleMouseDown = (e) => {
    if (e.target.closest('.mindmap-node-card')) return; // ignore clicks on nodes
    setIsDragging(true);
    setStartX(e.pageX - canvasContainerRef.current.offsetLeft);
    setStartY(e.pageY - canvasContainerRef.current.offsetTop);
    setScrollLeft(canvasContainerRef.current.scrollLeft);
    setScrollTop(canvasContainerRef.current.scrollTop);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - canvasContainerRef.current.offsetLeft;
    const y = e.pageY - canvasContainerRef.current.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    canvasContainerRef.current.scrollLeft = scrollLeft - walkX;
    canvasContainerRef.current.scrollTop = scrollTop - walkY;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // 1. AI Prompt generation
  const handleGenerateMindmap = async () => {
    if (!textPrompt.trim()) return;
    setIsGenerating(true);
    setDraftMindmap(null);
    try {
      const generated = await api.generateMindmap(textPrompt);
      setDraftMindmap({
        title: generated.title || 'Sơ đồ tư duy AI',
        content: generated
      });
    } catch (err) {
      alert(err.message || 'Lỗi không thể sinh sơ đồ tư duy.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save generated draft mindmap to user's collection
  const handleSaveDraft = async () => {
    if (!draftMindmap) return;
    try {
      const saved = await api.saveMindmap(draftMindmap.title, draftMindmap.content);
      alert('Đã lưu sơ đồ tư duy thành công!');
      fetchMindmaps();
      setDraftMindmap(null);
      setActiveMindmap(saved);
      setActiveTab('list');
    } catch (err) {
      alert(err.message || 'Lỗi không thể lưu sơ đồ.');
    }
  };

  // Delete Mindmap
  const handleDeleteMindmap = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa sơ đồ tư duy này?')) return;
    try {
      await api.deleteMindmap(id);
      fetchMindmaps();
      if (activeMindmap && activeMindmap.id === id) {
        setActiveMindmap(null);
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa sơ đồ.');
    }
  };

  // AI Weakness Scanner
  const handleScanWeaknesses = async () => {
    setIsGenerating(true);
    try {
      const saved = await api.generateWeaknessMindmap();
      alert('AI đã quét lịch sử làm bài và lập sơ đồ khắc phục điểm yếu thành công!');
      fetchMindmaps();
      setActiveMindmap(saved);
      setActiveTab('list');
    } catch (err) {
      alert(err.message || 'Không có đủ dữ liệu lỗi sai đề thi để quét điểm yếu.');
    } finally {
      setIsGenerating(false);
    }
  };

  // OCR Upload Handlers
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleOcrUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const uploadRes = await api.uploadExamFile(formData);
      const generated = await api.generateExamMindmap({ fileId: uploadRes.id });
      
      alert('AI đã hoàn thành phân tích đề thi và tạo sơ đồ tư duy!');
      fetchMindmaps();
      setActiveMindmap(generated);
      setSelectedFile(null);
      setActiveTab('list');
    } catch (err) {
      alert(err.message || 'Lỗi phân tích đề thi.');
    } finally {
      setIsUploading(false);
    }
  };

  // Quiz Handling Logics
  const handleStartNodeQuiz = async () => {
    if (!activeMindmap || !selectedNode) return;
    // Set loading
    setActiveQuiz([]);
    try {
      const questions = await api.generateNodeQuiz(activeMindmap.id, selectedNode.key);
      setActiveQuiz(questions);
      setQuizAnswers({});
      setCurrentQuizIdx(0);
      setQuizResult(null);
      setQuizTimer(0);
      
      // Start Timer
      if (quizIntervalId) clearInterval(quizIntervalId);
      const interval = setInterval(() => {
        setQuizTimer(prev => prev + 1);
      }, 1000);
      setQuizIntervalId(interval);
    } catch (err) {
      alert(err.message || 'Lỗi sinh câu hỏi.');
      setActiveQuiz(null);
    }
  };

  const selectQuizOption = (optionIdx) => {
    const curQ = activeQuiz[currentQuizIdx];
    setQuizAnswers(prev => ({
      ...prev,
      [curQ.id]: optionIdx
    }));
  };

  const handleNextQuiz = () => {
    if (currentQuizIdx < activeQuiz.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (quizIntervalId) clearInterval(quizIntervalId);
    setIsSubmittingQuiz(true);
    try {
      // Map answers to backend expected format
      const formattedAnswers = Object.entries(quizAnswers).map(([qId, val]) => ({
        questionId: Number(qId),
        selectedOption: val
      }));

      // If they missed some, set default -1
      activeQuiz.forEach(q => {
        if (quizAnswers[q.id] === undefined) {
          formattedAnswers.push({
            questionId: q.id,
            selectedOption: -1
          });
        }
      });

      const res = await api.submitNodeQuiz(activeMindmap.id, selectedNode.key, formattedAnswers, quizTimer);
      setQuizResult(res);
      
      // Update mastery node progress in real time locally
      setNodeProgresses(prev => ({
        ...prev,
        [selectedNode.key]: {
          mastery: res.mastery,
          bestScore: res.score
        }
      }));
    } catch (err) {
      alert(err.message || 'Lỗi nộp bài trắc nghiệm.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleCloseQuiz = () => {
    if (quizIntervalId) clearInterval(quizIntervalId);
    setActiveQuiz(null);
    setQuizResult(null);
    setQuizAnswers({});
    setCurrentQuizIdx(0);
  };

  return (
    <div className="mindmap-page animate-in">
      
      {/* Quiz Overlay Modal */}
      {activeQuiz && (
        <div className="quiz-overlay">
          <div className="quiz-modal">
            
            <div className="quiz-header">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '950', color: '#1c1917', margin: 0 }}>
                  📝 LUYỆN TẬP CHỦ ĐỀ: {selectedNode?.name}
                </h3>
                <span style={{ fontSize: '11px', color: '#685ce7', fontWeight: 'bold' }}>
                  Thời gian làm bài: {Math.floor(quizTimer / 60)}p {quizTimer % 60}s
                </span>
              </div>
              <button onClick={handleCloseQuiz} className="header-icon-btn" style={{ background: '#f5f5f4' }}>
                <HiX />
              </button>
            </div>

            <div className="quiz-body">
              {activeQuiz.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="progress-spinner" style={{ width: '40px', height: '40px', border: '3px solid #e7e5e4', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px auto' }}></div>
                  <strong style={{ display: 'block', color: 'var(--text-main)' }}>AI đang thiết kế câu hỏi trắc nghiệm riêng cho chủ đề này...</strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Vui lòng đợi trong giây lát.</span>
                </div>
              ) : quizResult ? (
                // QUIZ RESULT REPORT VIEW
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Score box */}
                  <div style={{
                    background: quizResult.score >= 4 ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                    padding: '24px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    border: '1.5px solid #000',
                    boxShadow: '3px 3px 0px #000'
                  }}>
                    <span style={{ fontSize: '32px' }}>{quizResult.score >= 4 ? '🎉' : '✍️'}</span>
                    <h4 style={{ fontSize: '20px', fontWeight: '900', margin: '10px 0 4px 0', color: '#000' }}>
                      Kết quả: {quizResult.score} / {quizResult.totalQuestions} câu đúng
                    </h4>
                    <p style={{ fontSize: '13px', color: '#444', margin: 0 }}>
                      Mức độ làm chủ (Mastery) hiện tại: <strong>{Math.round(quizResult.mastery * 100)}%</strong>
                    </p>
                  </div>

                  <h5 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '10px 0 0 0' }}>
                    Chi tiết lời giải các câu hỏi:
                  </h5>

                  {/* List of questions with answers and explanations */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {quizResult.questions.map((q, idx) => {
                      const userSelection = quizAnswers[q.id];
                      const isCorrect = userSelection === q.correctOption;
                      
                      return (
                        <div key={q.id} style={{
                          border: `1.5px solid ${isCorrect ? '#10b981' : '#ef4444'}`,
                          borderRadius: '16px',
                          padding: '16px',
                          backgroundColor: isCorrect ? '#f0fdf4' : '#fdf2f2'
                        }}>
                          <strong style={{ fontSize: '13.5px', color: '#1c1917', display: 'block', marginBottom: '12px' }}>
                            Câu {idx + 1}: {q.questionText}
                          </strong>
                          
                          {/* Option rendering */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {q.options.map((opt, optIdx) => {
                              let optionClass = 'quiz-option-btn';
                              if (optIdx === q.correctOption) optionClass += ' correct';
                              else if (optIdx === userSelection) optionClass += ' incorrect';
                              
                              return (
                                <div key={optIdx} className={optionClass} style={{ pointerEvents: 'none', margin: 0, padding: '10px 14px' }}>
                                  <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                  {optIdx === q.correctOption && <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>✓ Đáp án đúng</span>}
                                  {optIdx === userSelection && optIdx !== q.correctOption && <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>✗ Câu trả lời của bạn</span>}
                                </div>
                              );
                            })}
                          </div>

                          {/* AI Explanation block */}
                          <div style={{
                            marginTop: '12px',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.6)',
                            border: '1px dashed #d6d3d1',
                            fontSize: '12px',
                            color: '#44403c',
                            lineHeight: '1.5'
                          }}>
                            <strong>💡 Giải thích từ AI Coach:</strong> {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              ) : (
                // ACTIVE QUIZ RUNNING VIEW
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', background: '#e0e7ff', color: '#4338ca', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                      Câu hỏi {currentQuizIdx + 1} / {activeQuiz.length}
                    </span>
                    <div style={{ flex: 1, height: '6px', background: '#e7e5e4', borderRadius: '4px', margin: '0 16px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#6366f1', width: `${((currentQuizIdx + 1) / activeQuiz.length) * 100}%`, transition: 'width 0.2s' }}></div>
                    </div>
                  </div>

                  <strong style={{ fontSize: '16px', color: 'var(--text-main)', display: 'block', marginBottom: '20px', lineHeight: 1.4 }}>
                    {activeQuiz[currentQuizIdx]?.questionText}
                  </strong>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeQuiz[currentQuizIdx]?.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[activeQuiz[currentQuizIdx].id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => selectQuizOption(optIdx)}
                          className={`quiz-option-btn ${isSelected ? 'selected' : ''}`}
                        >
                          <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '6px',
                            background: isSelected ? '#6366f1' : '#f5f5f4',
                            color: isSelected ? '#fff' : '#57534e',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="quiz-footer">
              {quizResult ? (
                <button onClick={handleCloseQuiz} className="btn-primary" style={{ width: '100%', padding: '12px 0', borderRadius: '12px', background: '#6366f1', fontWeight: 'bold' }}>
                  Hoàn thành và Quay lại
                </button>
              ) : (
                <>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Hãy chọn đáp án đúng nhất để hoàn tất.
                  </span>
                  
                  {currentQuizIdx < activeQuiz.length - 1 ? (
                    <button
                      onClick={handleNextQuiz}
                      disabled={quizAnswers[activeQuiz[currentQuizIdx].id] === undefined}
                      className="btn-primary"
                      style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px' }}
                    >
                      Tiếp theo
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={quizAnswers[activeQuiz[currentQuizIdx].id] === undefined || isSubmittingQuiz}
                      className="btn-primary"
                      style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    >
                      {isSubmittingQuiz ? 'Đang chấm điểm...' : 'Nộp bài ➔'}
                    </button>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Slide Drawer Node Detail Panel */}
      <div className={`mindmap-drawer ${selectedNode ? 'open' : ''}`}>
        <div className="mindmap-drawer-header">
          <h3 style={{ fontSize: '15px', fontWeight: '950', color: '#1c1917', margin: 0 }}>
            📌 CHI TIẾT CHỦ ĐỀ
          </h3>
          <button onClick={() => setSelectedNode(null)} className="header-icon-btn">
            <HiX />
          </button>
        </div>
        
        {selectedNode && (
          <>
            <div className="mindmap-drawer-body">
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#6366f1', margin: '0 0 8px 0' }}>
                  {selectedNode.name}
                </h4>
                <p style={{ fontSize: '13px', color: '#57534e', lineHeight: '1.6', margin: 0 }}>
                  {selectedNode.description || 'Chưa có mô tả chi tiết cho chủ đề này.'}
                </p>
              </div>

              {/* Progress Mastery Stats */}
              <div style={{
                background: '#fafaf9',
                border: '1px solid #e7e5e4',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#78716c', textTransform: 'uppercase' }}>
                  📊 TIẾN TRÌNH LÀM CHỦ KIẾN THỨC
                </span>
                
                {nodeProgresses[selectedNode.key] ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 'bold' }}>Mức độ Mastery:</span>
                      <strong style={{ fontSize: '14px', color: '#10b981' }}>
                        {Math.round(nodeProgresses[selectedNode.key].mastery * 100)}%
                      </strong>
                    </div>
                    
                    {/* Mastery progress bar */}
                    <div style={{ height: '8px', background: '#e7e5e4', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                      <div style={{
                        height: '100%',
                        background: '#10b981',
                        width: `${nodeProgresses[selectedNode.key].mastery * 100}%`
                      }}></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11.5px', color: '#57534e' }}>
                      <div>Số lần luyện tập: <strong>{nodeProgresses[selectedNode.key].attempts || 1}</strong></div>
                      <div>Điểm cao nhất: <strong>{nodeProgresses[selectedNode.key].bestScore || 0}/5</strong></div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '12.5px', color: '#78716c', margin: '0 0 10px 0' }}>
                      Bạn chưa luyện tập chủ đề này trên sơ đồ tư duy.
                    </p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#eab308', fontWeight: 'bold' }}>
                      ⚠️ Mức độ làm chủ: 0%
                    </div>
                  </div>
                )}
              </div>

              {/* Info Tips */}
              <div style={{ display: 'flex', gap: '8px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px' }}>
                <HiInformationCircle style={{ color: '#3b82f6', flexShrink: 0, fontSize: '16px', marginTop: '1px' }} />
                <p style={{ fontSize: '11.5px', color: '#1e3a8a', margin: 0, lineHeight: 1.4 }}>
                  Hãy nhấp nút Luyện tập trắc nghiệm bên dưới. AI Coach sẽ sinh đề thi 5 câu hỏi ngẫu nhiên và giải thích chi tiết giúp em nhớ lâu hơn!
                </p>
              </div>

            </div>

            <div className="mindmap-drawer-footer">
              <button
                onClick={handleStartNodeQuiz}
                className="btn-primary"
                style={{ width: '100%', padding: '12px 0', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <HiLightningBolt /> Luyện tập trắc nghiệm AI
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Page Layout */}
      {activeMindmap || draftMindmap ? (
        // ================= INTERACTIVE CANVAS WORKSPACE =================
        <div>
          <div className="mindmap-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => {
                  setActiveMindmap(null);
                  setDraftMindmap(null);
                  setSelectedNode(null);
                }} 
                className="header-icon-btn"
                style={{ background: 'var(--bg-card)' }}
              >
                <HiArrowLeft />
              </button>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '950', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {activeMindmap ? activeMindmap.title : draftMindmap.title}
                  {draftMindmap && (
                    <span style={{ fontSize: '10.5px', background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                      Bản nháp AI
                    </span>
                  )}
                </h2>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                  Workspace Sơ đồ tư duy tương tác học tập
                </p>
              </div>
            </div>

            <div className="mindmap-actions">
              {draftMindmap ? (
                <button
                  onClick={handleSaveDraft}
                  className="btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    padding: '8px 18px',
                    borderRadius: '10px',
                    fontSize: '12.5px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <HiCheckCircle /> Lưu vào tài khoản
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      alert(`Đã copy link chia sẻ sơ đồ tư duy: ${window.location.origin}/mindmaps/public/${activeMindmap.id}`);
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #d6d3d1',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <HiShare /> Chia sẻ
                  </button>
                  
                  <button
                    onClick={async () => {
                      if (!confirm('Bạn có chắc chắn muốn tải lại sơ đồ?')) return;
                      // Refetch list & reload
                      const id = activeMindmap.id;
                      setActiveMindmap(null);
                      await fetchMindmaps();
                      const found = mindmaps.find(m => m.id === id);
                      if (found) {
                        setActiveMindmap(found);
                      } else {
                        // fallback reload by id
                        const fresh = await api.getMindmapById(id);
                        setActiveMindmap(fresh);
                      }
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #d6d3d1',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <HiRefresh /> Làm tươi
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Interactive tree canvas container */}
          <div className="mindmap-canvas-container"
            ref={canvasContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            
            <div className="mindmap-canvas-viewport" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
              
              {/* SVG lines overlay */}
              <svg className="mindmap-svg-overlay">
                {renderSVGConnections()}
              </svg>

              {/* Absolute HTML node cards */}
              {flatNodesList.map(node => {
                const isActive = selectedNode && selectedNode.key === node.key;
                const subjClass = getSubjectClass(node.name);
                const progressObj = nodeProgresses[node.key];
                
                return (
                  <div
                    key={node.key}
                    className="mindmap-node-wrapper"
                    style={{ top: `${node.y}px`, left: `${node.x}px` }}
                  >
                    <div
                      onClick={() => setSelectedNode(node)}
                      className={`mindmap-node-card ${isActive ? 'active' : ''} ${subjClass}`}
                    >
                      <h4 className="mindmap-node-title">{node.name}</h4>
                      
                      {/* Node Mastery badge */}
                      <div className="mindmap-node-mastery-wrap">
                        <span className="mindmap-node-mastery-dot" style={{
                          backgroundColor: progressObj && progressObj.mastery >= 0.8 
                            ? '#10b981' 
                            : (progressObj && progressObj.mastery >= 0.5 ? '#f59e0b' : '#a8a29e')
                        }}></span>
                        <span className="mindmap-node-mastery-text">
                          {progressObj 
                            ? `Mastery: ${Math.round(progressObj.mastery * 100)}%` 
                            : 'Chưa luyện'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Canvas Panning Zooming controls */}
            <div className="canvas-controls">
              <button onClick={() => setZoom(prev => Math.min(prev + 0.1, 1.5))} className="canvas-control-btn" title="Thu phóng lớn">
                <HiPlus />
              </button>
              <button onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))} className="canvas-control-btn" title="Thu phóng nhỏ">
                <HiMinus />
              </button>
              <button onClick={() => setZoom(1.0)} className="canvas-control-btn" style={{ fontSize: '11px', width: 'auto', padding: '0 8px' }} title="Reset thu phóng">
                100%
              </button>
            </div>

            {/* Legend guide */}
            <div className="canvas-legend">
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#78716c', textTransform: 'uppercase', marginBottom: '2px' }}>Chú thích chủ đề</span>
              <div className="legend-item"><span className="legend-color" style={{ background: '#8b5cf6' }}></span>Toán học</div>
              <div className="legend-item"><span className="legend-color" style={{ background: '#3b82f6' }}></span>Vật lý</div>
              <div className="legend-item"><span className="legend-color" style={{ background: '#f59e0b' }}></span>Hóa học</div>
              <div className="legend-item"><span className="legend-color" style={{ background: '#10b981' }}></span>Tiếng Anh</div>
              <div className="legend-item"><span className="legend-color" style={{ background: '#6366f1' }}></span>Gốc/Chung</div>
            </div>

          </div>
        </div>
      ) : (
        // ================= MAIN MINDMAP DASHBOARD / LIST VIEW =================
        <div>
          <div className="mindmap-header">
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '950', margin: 0, color: 'var(--text-main)' }}>
                🧠 SƠ ĐỒ TƯ DUY THÔNG MINH AI
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Hệ thống hóa bài học, phân tích cấu trúc đề thi và tự động chẩn đoán lấp đầy lỗ hổng bằng AI.
              </p>
            </div>

            <div className="mindmap-actions">
              <button
                onClick={() => setActiveTab('create')}
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <HiSparkles /> Sinh sơ đồ bằng AI
              </button>

              <button
                onClick={() => setActiveTab('ocr')}
                style={{
                  background: '#ffffff',
                  color: '#44403c',
                  border: '1px solid #d6d3d1',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <HiUpload /> Phân tích đề thi (OCR)
              </button>

              <button
                onClick={() => setActiveTab('weakness')}
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(244, 63, 94, 0.08))',
                  color: '#ef4444',
                  border: '1.5px solid rgba(239, 68, 68, 0.3)',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <HiLightningBolt /> Quét điểm yếu ôn tập
              </button>
            </div>
          </div>

          {/* CREATION BOX PANEL VIEW */}
          {activeTab === 'create' && (
            <div className="card animate-in" style={{ padding: '24px', border: '2px solid #6366f1', background: '#f5f3ff', borderRadius: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#4f46e5', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HiSparkles /> SINH SƠ ĐỒ KIẾN THỨC CÁ NHÂN BẰNG AI
                </h3>
                <button onClick={() => setActiveTab('list')} className="header-icon-btn" style={{ background: '#fff' }}>
                  <HiX />
                </button>
              </div>

              <p style={{ fontSize: '13px', color: '#5b21b6', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Em muốn hệ thống hóa phần nào? Hãy nhập chủ đề cụ thể (Ví dụ: <i>"Phương trình mũ bậc hai chứa tham số m"</i> hoặc <i>"Học thuyết di truyền Men-đen"</i>) để AI phân tích cấu trúc, chia nhánh chủ đề và sinh đề trắc nghiệm giúp em!
              </p>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập tên chủ đề hoặc nội dung cần sinh sơ đồ..."
                  value={textPrompt}
                  onChange={e => setTextPrompt(e.target.value)}
                  style={{ flex: 1, padding: '12px 16px', fontSize: '13.5px', borderRadius: '12px', border: '1.5px solid #c084fc', background: '#fff', outline: 'none' }}
                  disabled={isGenerating}
                />
                <button
                  onClick={handleGenerateMindmap}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', padding: '0 24px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Đang tạo sơ đồ...' : 'Bắt đầu tạo 🚀'}
                </button>
              </div>
              
              {isGenerating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', fontSize: '12.5px', color: '#4f46e5' }}>
                  <div className="progress-spinner" style={{ width: '14px', height: '14px', border: '2px solid #e0e7ff', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <span>AI đang quét cấu trúc nội dung lớp 12 và phân chia nhánh sơ đồ tư duy... Khoảng 10-15 giây.</span>
                </div>
              )}
            </div>
          )}

          {/* OCR ANALYSIS BOX PANEL VIEW */}
          {activeTab === 'ocr' && (
            <div className="card animate-in" style={{ padding: '24px', border: '2px solid #10b981', background: '#ecfdf5', borderRadius: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#065f46', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HiCamera /> TẢI LÊN ĐỀ THI ĐỂ PHÂN TÍCH MA TRẬN ĐỀ (OCR)
                </h3>
                <button onClick={() => setActiveTab('list')} className="header-icon-btn" style={{ background: '#fff' }}>
                  <HiX />
                </button>
              </div>

              <p style={{ fontSize: '13px', color: '#047857', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Tải lên ảnh chụp đề thi thử hoặc file đề PDF. AI sẽ quét và trích xuất cấu trúc kiến thức xuất hiện trong đề, lập sơ đồ tư duy phân bổ giúp em theo dõi ma trận đề thi nhanh chóng!
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="file"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  accept=".pdf,.png,.jpg,.jpeg"
                  style={{ display: 'none' }}
                />
                
                <button
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    background: '#ffffff',
                    border: '1.5px dashed #059669',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#059669',
                    cursor: 'pointer'
                  }}
                >
                  {selectedFile ? `📂 Đã chọn: ${selectedFile.name}` : '📁 Chọn ảnh/file đề thi'}
                </button>

                {selectedFile && (
                  <button
                    onClick={handleOcrUpload}
                    className="btn-primary"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '12px 24px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}
                    disabled={isUploading}
                  >
                    {isUploading ? 'AI đang phân tích cấu trúc đề...' : 'Nạp đề và Phân tích 🚀'}
                  </button>
                )}
              </div>
              
              {isUploading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', fontSize: '12.5px', color: '#047857' }}>
                  <div className="progress-spinner" style={{ width: '14px', height: '14px', border: '2px solid #d1fae5', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <span>AI đang tiến hành phân tích nhận diện nội dung... Vui lòng đợi.</span>
                </div>
              )}
            </div>
          )}

          {/* WEAKNESS BOX PANEL VIEW */}
          {activeTab === 'weakness' && (
            <div className="card animate-in" style={{ padding: '24px', border: '2px solid #ef4444', background: '#fef2f2', borderRadius: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#991b1b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HiLightningBolt /> CHẨN ĐOÁN LỖ HỔNG & TẠO SƠ ĐỒ PHỤC HỒI ĐIỂM YẾU
                </h3>
                <button onClick={() => setActiveTab('list')} className="header-icon-btn" style={{ background: '#fff' }}>
                  <HiX />
                </button>
              </div>

              <p style={{ fontSize: '13px', color: '#991b1b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Hệ thống AI sẽ rà soát lại tất cả các lượt thi thử THPTQG gần nhất của em, lọc các chủ đề có tỉ lệ trả lời sai trên 40%. Sau đó, AI Coach thiết lập sơ đồ củng cố kiến thức riêng biệt cho em tập trung luyện tập phục hồi!
              </p>

              <button
                onClick={handleScanWeaknesses}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', padding: '12px 24px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}
                disabled={isGenerating}
              >
                {isGenerating ? 'AI đang rà soát điểm số và sinh lộ trình...' : 'Bắt đầu quét điểm yếu cá nhân 🎯'}
              </button>
              
              {isGenerating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', fontSize: '12.5px', color: '#991b1b' }}>
                  <div className="progress-spinner" style={{ width: '14px', height: '14px', border: '2px solid #fee2e2', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <span>AI đang tiến hành rà soát... Vui lòng đợi trong giây lát.</span>
                </div>
              )}
            </div>
          )}

          {/* LIST OF SAVED MINDMAPS */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HiFolderOpen /> Thư mục sơ đồ của tôi ({mindmaps.length})
            </h3>
            
            {mindmaps.length === 0 ? (
              <div style={{
                background: '#ffffff',
                border: '1.5px dashed var(--border)',
                borderRadius: '20px',
                padding: '50px 20px',
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                <span style={{ fontSize: '42px', display: 'block', marginBottom: '12px' }}>🧠</span>
                <strong style={{ display: 'block', fontSize: '15px', color: 'var(--text-main)' }}>Em chưa có sơ đồ tư duy nào!</strong>
                <p style={{ fontSize: '13px', maxWidth: '400px', margin: '6px auto 16px auto', lineHeight: 1.4 }}>
                  Hãy nhấp nút "Sinh sơ đồ bằng AI" ở góc trên bên phải để bắt đầu thiết kế hệ thống ôn tập bài học của riêng mình!
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', padding: '8px 18px', borderRadius: '10px', fontSize: '12.5px' }}
                >
                  Tạo Sơ Đồ Đầu Tiên ➔
                </button>
              </div>
            ) : (
              <div className="mindmap-grid">
                {mindmaps.map(map => {
                  let parsedContent = map.content;
                  if (typeof parsedContent === 'string') {
                    try {
                      parsedContent = JSON.parse(parsedContent);
                    } catch (e) {
                      parsedContent = null;
                    }
                  }
                  const nodeCount = parsedContent?.rootNode ? flattenNodes(layoutTree(parsedContent.rootNode, 0)).length : 0;
                  const dateStr = new Date(map.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div
                      key={map.id}
                      onClick={() => {
                        setSelectedNode(null);
                        setActiveMindmap(map);
                      }}
                      className="mindmap-card"
                      style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                          <h4 style={{ fontSize: '15px', fontWeight: '850', color: 'var(--text-main)', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                            {map.title}
                          </h4>
                          
                          <button
                            onClick={(e) => handleDeleteMindmap(map.id, e)}
                            className="header-icon-btn"
                            style={{ color: '#ef4444', flexShrink: 0, width: '28px', height: '28px' }}
                            title="Xóa sơ đồ"
                          >
                            <HiTrash />
                          </button>
                        </div>

                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
                          Ngày tạo: {dateStr}
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '11px', background: '#f5f5f4', color: '#78716c', padding: '3px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                          📊 {nodeCount} chủ điểm
                        </span>
                        
                        <span style={{ fontSize: '12px', color: '#6366f1', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          Vào học ➔
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
