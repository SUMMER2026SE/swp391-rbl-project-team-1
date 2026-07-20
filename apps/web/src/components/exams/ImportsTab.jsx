import React, { useState, useEffect } from 'react';
import { 
  HiCheckCircle, 
  HiExclamationCircle, 
  HiPlus, 
  HiTrash,
  HiChevronUp,
  HiChevronDown,
  HiDocumentDuplicate,
  HiScissors,
  HiPencilAlt,
  HiSparkles,
  HiRefresh
} from 'react-icons/hi';
import QuestionCard from '../mock-exams/QuestionCard';

const API_BASE = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : '');

export function ImportsTab({
  sessions = [],
  activeSession,
  onUpload,
  onConfirm,
  onUpdateQuestion,
  onDeleteSession,
  onViewDetail,
  onCloseDetail,
  loading = false
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeQuestionId, setActiveQuestionId] = useState(null);

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Auto-refresh sessions when processing
  useEffect(() => {
    let timer;
    const hasProcessing = sessions.some((s) => s.status === 'PROCESSING');
    if (hasProcessing) {
      timer = setInterval(() => {
        const refreshEvent = new CustomEvent('refresh-import-sessions');
        window.dispatchEvent(refreshEvent);
        
        if (activeSession && activeSession.status === 'PROCESSING') {
          onViewDetail(activeSession.id);
        }
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [sessions, activeSession]);

  const questions = activeSession?.questions || [];
  const activeQuestion = questions.find(q => q.id === activeQuestionId) || questions[0];

  useEffect(() => {
    if (activeQuestion) {
      setActiveQuestionId(activeQuestion.id);
    }
  }, [activeQuestion]);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile);
    setSelectedFile(null);
  };

  // Validation Warnings Check
  const getQuestionWarnings = (q) => {
    const warnings = [];
    if (!q.content?.trim()) {
      warnings.push('Nội dung câu hỏi đang để trống.');
    }
    if (!q.correctAnswer?.trim()) warnings.push('Chưa chọn đáp án đúng.');
    if (q.type === 'MULTIPLE_CHOICE') {
      if (!q.options || q.options.length < 2) warnings.push('Số lượng phương án tối thiểu là 2.');
      if (q.options?.some((o) => !o.text?.trim())) warnings.push('Nội dung phương án không được để trống.');
    }
    return warnings;
  };

  const allWarnings = questions.reduce((acc, q) => {
    const w = getQuestionWarnings(q);
    if (w.length > 0) acc[q.id] = w;
    return acc;
  }, {});

  const totalWarningsCount = Object.values(allWarnings).reduce((sum, list) => sum + (list ? list.length : 0), 0);
  const isValidToPublish = totalWarningsCount === 0;

  const sections = Array.from(new Set(questions.map((q) => q.section || 'PHẦN I')));

  // Adapt activeQuestion into Student QuestionCard format
  const mappedStudentQuestion = activeQuestion ? {
    id: String(activeQuestion.id),
    question_number: activeQuestion.questionOrder,
    question_text: activeQuestion.content,
    question_image_url: getFullUrl(activeQuestion.imageUrl || activeQuestion.media?.imageUrl),
    question_type: activeQuestion.type === 'ESSAY' ? 'essay' : 'multiple_choice_single',
    difficulty: activeQuestion.difficulty === 'EASY' ? 'Dễ' : activeQuestion.difficulty === 'HARD' ? 'Khó' : 'Trung bình',
    explanation: activeQuestion.explanation || '',
    topic: activeQuestion.regions?.topic || 'Kiến thức cốt lõi'
  } : null;

  const mappedStudentOptions = (activeQuestion?.options || []).map((opt) => ({
    id: `opt-${activeQuestion?.id}-${opt.label}`,
    question_id: String(activeQuestion?.id),
    option_label: opt.label,
    option_text: opt.text,
    is_correct: opt.label === activeQuestion?.correctAnswer
  }));

  const aiConfidence = activeQuestion?.media?.confidence || activeQuestion?.regions?.confidence || 0.95;

  return (
    <div className="review-studio-container">
      <style>{`
        .review-studio-container {
          display: flex;
          flex-direction: column;
          min-height: calc(100vh - 140px);
          font-family: 'Outfit', 'Inter', sans-serif;
          color: #0f172a;
          background: #f8fafc;
        }
        .studio-topbar {
          height: 64px;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
          z-index: 10;
        }
        .studio-main-3col {
          flex: 1;
          display: grid;
          grid-template-columns: 280px 1fr 440px;
          overflow: hidden;
          background: #f8fafc;
        }
        .studio-sidebar {
          border-right: 1px solid #e2e8f0;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .studio-preview-area {
          background: #f1f5f9;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          padding: 24px;
        }
        .studio-editor-area {
          border-left: 1px solid #e2e8f0;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          padding: 20px;
          gap: 16px;
        }
        .section-header {
          padding: 8px 14px;
          background: #f8fafc;
          font-size: 11px;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
          letter-spacing: 0.5px;
        }
        .q-item-clean {
          padding: 12px 14px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          background: #ffffff;
        }
        .q-item-clean:hover {
          background: #f8fafc;
        }
        .q-item-clean.active {
          background: #eef2ff;
          border-left: 4px solid #6366f1;
        }
        .studio-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .studio-btn-primary {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }
        .studio-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .studio-btn-secondary {
          background: #ffffff;
          color: #475569;
          border: 1px solid #cbd5e1;
        }
        .studio-btn-secondary:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          color: #0f172a;
        }
        .studio-btn-danger {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        .minimal-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
      `}</style>

      {activeSession ? (
        /* ==================== 3-COLUMN DATALAB + GEMINI 2.5 FLASH REVIEW STUDIO ==================== */
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Top Header */}
          <div className="studio-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={onCloseDetail} 
                className="studio-btn studio-btn-secondary"
                style={{ padding: '6px 14px', fontSize: '13px' }}
              >
                ← Danh sách đề
              </button>
              <div>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  Review Studio: {activeSession.fileName}
                </h2>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HiSparkles style={{ color: '#6366f1' }} /> Datalab API + Gemini 2.5 Flash đã trích xuất {questions.length} câu hỏi.
                </span>
              </div>
            </div>

            {/* Confirmation & Publish Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                {totalWarningsCount > 0 ? (
                  <span style={{ color: '#dc2626', fontWeight: 700, background: '#fef2f2', padding: '4px 12px', borderRadius: '20px', border: '1px solid #fecaca' }}>
                    ⚠️ {totalWarningsCount} cảnh báo cần xử lý
                  </span>
                ) : (
                  <span style={{ color: '#166534', fontWeight: 700, background: '#f0fdf4', padding: '4px 12px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
                    ✨ Bản nháp hợp lệ 100%
                  </span>
                )}
              </div>

              <button
                disabled={!isValidToPublish || loading}
                onClick={() => onConfirm(activeSession.id)}
                className="studio-btn studio-btn-primary"
                style={{ padding: '10px 24px', fontSize: '14px' }}
              >
                ✓ Xuất bản vào Ngân hàng Đề
              </button>
            </div>
          </div>

          {/* 3-Column Main Workspace */}
          <div className="studio-main-3col">
            
            {/* 1. LEFT PANEL: Exam Outline & Question Navigator & Warnings */}
            <div className="studio-sidebar">
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                    CẤU TRÚC ĐỀ THI ({questions.length})
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#4f46e5', background: '#e0e7ff', padding: '2px 8px', borderRadius: '10px' }}>
                    Gemini 2.5 Flash
                  </span>
                </div>
                <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '5px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      background: '#6366f1', 
                      width: `${Math.round(((questions.length - Object.keys(allWarnings).length) / Math.max(1, questions.length)) * 100)}%`, 
                      height: '100%'
                    }} 
                  />
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {sections.map(secName => (
                  <div key={secName}>
                    <div className="section-header">{secName}</div>
                    {questions
                      .filter((q) => (q.section || 'PHẦN I') === secName)
                      .map((q) => {
                        const isActive = q.id === activeQuestionId;
                        const warnings = allWarnings[q.id] || [];
                        return (
                          <div 
                            key={q.id}
                            className={`q-item-clean ${isActive ? 'active' : ''}`}
                            onClick={() => setActiveQuestionId(q.id)}
                          >
                            <div style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '6px', 
                              background: isActive ? '#6366f1' : '#f1f5f9',
                              color: isActive ? '#ffffff' : '#475569',
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '11px', 
                              fontWeight: 800 
                            }}>
                              {q.questionOrder}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ 
                                fontSize: '12px', 
                                fontWeight: isActive ? 700 : 500, 
                                color: '#0f172a',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {q.content ? q.content.replace(/<[^>]*>/g, '') : `Câu ${q.questionOrder}`}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span>{q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : q.type === 'TRUE_FALSE' ? 'Đúng/Sai' : 'Tự luận'}</span>
                                {warnings.length > 0 ? (
                                  <span style={{ color: '#dc2626', fontWeight: 700 }}>⚠️ {warnings.length} lỗi</span>
                                ) : (
                                  <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Chuẩn</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. CENTER PANEL: Student Preview (Identical to Real Student Exam) */}
            <div className="studio-preview-area">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>👁️ CHẾ ĐỘ XEM TRƯỚC CỦA HỌC SINH (STUDENT PREVIEW)</span>
                </span>
                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
                  Hiển thị khớp 100% phòng thi học sinh
                </span>
              </div>

              {mappedStudentQuestion ? (
                <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
                  <QuestionCard 
                    question={mappedStudentQuestion}
                    options={mappedStudentOptions}
                    selectedOptionLabel={activeQuestion?.correctAnswer}
                    onSelectOption={() => {}}
                    isBookmarked={false}
                    onBookmarkToggle={() => {}}
                    essayAnswer=""
                    onChangeEssayAnswer={() => {}}
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '64px', color: '#94a3b8' }}>
                  Chọn một câu hỏi từ danh sách bên trái để xem trước.
                </div>
              )}
            </div>

            {/* 3. RIGHT PANEL: Question Editor & Operations */}
            <div className="studio-editor-area">
              {activeQuestion ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                        Biên soạn Câu {activeQuestion.questionOrder}
                      </span>
                      <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <HiSparkles /> AI Confidence: {Math.round(aiConfidence * 100)}%
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select 
                        value={activeQuestion.difficulty || 'MEDIUM'}
                        onChange={(e) => onUpdateQuestion(activeQuestion.id, { difficulty: e.target.value })}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px', fontWeight: 600 }}
                      >
                        <option value="EASY">Dễ</option>
                        <option value="MEDIUM">Trung bình</option>
                        <option value="HARD">Khó</option>
                      </select>

                      <select 
                        value={activeQuestion.type || 'MULTIPLE_CHOICE'}
                        onChange={(e) => onUpdateQuestion(activeQuestion.id, { type: e.target.value })}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11.5px', fontWeight: 600 }}
                      >
                        <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                        <option value="TRUE_FALSE">Đúng / Sai</option>
                        <option value="ESSAY">Tự luận</option>
                      </select>
                    </div>
                  </div>

                  {/* QUESTION CONTENT EDITOR */}
                  <div className="minimal-card">
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                      NỘI DUNG CÂU HỎI
                    </label>
                    <textarea 
                      value={activeQuestion.content || ''}
                      onChange={(e) => onUpdateQuestion(activeQuestion.id, { content: e.target.value })}
                      rows={4}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* OPTIONS EDITOR CARD */}
                  {activeQuestion.type === 'MULTIPLE_CHOICE' && (
                    <div className="minimal-card">
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '10px' }}>
                        CÁC PHƯƠNG ÁN LỰA CHỌN (Tích chọn đáp án đúng)
                      </label>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(activeQuestion.options || []).map((opt, idx) => {
                          const isCorrect = (activeQuestion.correctAnswer || '').toUpperCase() === (opt.label || '').toUpperCase();
                          return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input 
                                type="radio" 
                                name={`correct_${activeQuestion.id}`}
                                checked={isCorrect}
                                onChange={() => onUpdateQuestion(activeQuestion.id, { correctAnswer: opt.label })}
                                style={{ accentColor: '#22c55e' }}
                              />
                              <span style={{ fontWeight: 800, fontSize: '12.5px', width: '20px' }}>{opt.label}.</span>
                              <input 
                                type="text"
                                value={opt.text || ''}
                                onChange={(e) => {
                                  const newOpts = [...(activeQuestion.options || [])];
                                  newOpts[idx] = { ...opt, text: e.target.value };
                                  onUpdateQuestion(activeQuestion.id, { options: newOpts });
                                }}
                                style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* EXPLANATION & METADATA CARD */}
                  <div className="minimal-card">
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                      LỜI GIẢI CHI TIẾT
                    </label>
                    <textarea 
                      value={activeQuestion.explanation || ''} 
                      onChange={(e) => onUpdateQuestion(activeQuestion.id, { explanation: e.target.value })} 
                      rows={3}
                      placeholder="Lời giải hoặc hướng dẫn giải chi tiết..."
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Chủ đề (Topic):</label>
                        <input 
                          type="text" 
                          value={activeQuestion.regions?.topic || 'Kiến thức cốt lõi'} 
                          onChange={(e) => onUpdateQuestion(activeQuestion.id, { regions: { ...activeQuestion.regions, topic: e.target.value } })}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Mạch kiến thức:</label>
                        <input 
                          type="text" 
                          value={activeQuestion.regions?.knowledge || ''} 
                          onChange={(e) => onUpdateQuestion(activeQuestion.id, { regions: { ...activeQuestion.regions, knowledge: e.target.value } })}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  </div>

                </>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
                  Chọn một câu hỏi để chỉnh sửa.
                </div>
              )}
            </div>

          </div>
        </div>
      ) : (
        /* ==================== DATALAB + GEMINI 2.5 FLASH UPLOAD DASHBOARD ==================== */
        <div style={{ padding: '32px 24px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.04)' }}>
            <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <span style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(79,70,229,0.1) 100%)', color: '#6366f1', fontWeight: 800, fontSize: '12px', padding: '6px 16px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <HiSparkles /> DATALAB API + GEMINI 2.5 FLASH ARCHITECTURE
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '12px 0 8px 0' }}>
                Tải đề thi PDF / DOC / DOCX qua Datalab & Gemini AI
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                Hệ thống gửi tài liệu tới Datalab API để phân tích cấu trúc chuẩn, sau đó dùng AI Gemini 2.5 Flash chuyển đổi thành Bản nháp Đề thi hoàn chỉnh.
              </p>
            </div>

            <div style={{ border: '2px dashed #c7d2fe', borderRadius: '20px', padding: '36px 20px', textAlign: 'center', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '32px' }}>
                📑
              </div>

              <div>
                <input 
                  type="file" 
                  id="v2-file-input" 
                  onChange={onFileChange} 
                  accept=".pdf,.docx,.doc" 
                  style={{ display: 'none' }} 
                />
                <label 
                  htmlFor="v2-file-input" 
                  className="studio-btn studio-btn-secondary" 
                  style={{ padding: '10px 28px', cursor: 'pointer', borderRadius: '12px' }}
                >
                  {selectedFile ? '📁 Chọn tệp tài liệu khác' : '☁️ Chọn tệp đề thi từ máy tính (.pdf, .docx, .doc)'}
                </label>
              </div>

              {selectedFile ? (
                <div style={{ background: '#e0e7ff', color: '#3730a3', padding: '8px 20px', borderRadius: '20px', fontSize: '13.5px', fontWeight: '700' }}>
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              ) : (
                <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>Hỗ trợ tệp định dạng .PDF, .DOCX hoặc .DOC</span>
              )}
            </div>

            <button 
              onClick={handleStartUpload} 
              disabled={!selectedFile || loading} 
              className="studio-btn studio-btn-primary" 
              style={{ alignSelf: 'center', padding: '12px 40px', borderRadius: '30px', fontSize: '14.5px' }}
            >
              🚀 {loading ? 'Đang phân tích bởi Datalab & Gemini...' : 'Bắt đầu Phân Tách Bằng Datalab & Gemini AI'}
            </button>
          </div>

          <div style={{ marginTop: '36px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
              Lịch sử nhập đề thi
            </h3>
            
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '14px 20px', fontWeight: '700' }}>Tên tệp</th>
                    <th style={{ padding: '14px 20px', fontWeight: '700' }}>Trạng thái</th>
                    <th style={{ padding: '14px 20px', fontWeight: '700' }}>Thời gian</th>
                    <th style={{ padding: '14px 20px', fontWeight: '700', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                        Chưa có đề thi nào trong lịch sử. Hãy tải tệp đề thi đầu tiên ở trên!
                      </td>
                    </tr>
                  ) : (
                    sessions.map((session) => (
                      <tr key={session.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 20px', fontWeight: '700', color: '#0f172a' }}>{session.fileName}</td>
                        <td style={{ padding: '14px 20px' }}>
                          {session.status === 'PROCESSING' && (
                            <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '12px', fontWeight: '700', fontSize: '12px' }}>
                              ⏳ Datalab & Gemini đang xử lý...
                            </span>
                          )}
                          {session.status === 'REVIEWING' && (
                            <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 12px', borderRadius: '12px', fontWeight: '700', fontSize: '12px' }}>
                              ✨ Chờ kiểm duyệt
                            </span>
                          )}
                          {session.status === 'COMPLETED' && (
                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '12px', fontWeight: '700', fontSize: '12px' }}>
                              ✓ Đã xuất bản
                            </span>
                          )}
                          {session.status === 'FAILED' && (
                            <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 12px', borderRadius: '12px', fontWeight: '700', fontSize: '12px' }}>
                              ❌ Thất bại
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 20px', color: '#64748b' }}>{new Date(session.createdAt).toLocaleString('vi-VN')}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          {(session.status === 'REVIEWING' || session.status === 'COMPLETED') && (
                            <button
                              onClick={() => onViewDetail(session.id)}
                              className="studio-btn studio-btn-primary"
                              style={{ marginRight: '8px', padding: '6px 14px', fontSize: '12px' }}
                            >
                              {session.status === 'COMPLETED' ? '🔍 Xem đề' : '✏️ Review Studio'}
                            </button>
                          )}
                          <button
                            onClick={() => onDeleteSession(session.id)}
                            className="studio-btn studio-btn-danger"
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImportsTab;
