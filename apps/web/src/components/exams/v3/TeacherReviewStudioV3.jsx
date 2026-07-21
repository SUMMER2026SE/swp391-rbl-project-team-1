import React, { useState, useEffect } from 'react';
import { 
  HiPhotograph, 
  HiDocumentText, 
  HiCheckCircle, 
  HiSparkles, 
  HiRefresh, 
  HiEye 
} from 'react-icons/hi';
import { api } from '../../../api';

const API_BASE = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : '');
const fallbackSubjects = [
  {
    name: 'Toán học',
    topics: [
      { name: 'Hàm số & Đồ thị' },
      { name: 'Mũ & Lôgarit' },
      { name: 'Nguyên hàm & Tích phân' },
      { name: 'Số phức' },
      { name: 'Thể tích khối đa diện' },
      { name: 'Hình học tọa độ Oxyz' },
      { name: 'Tổ hợp & Xác suất' },
      { name: 'Cấp số cộng & Cấp số nhân' }
    ]
  },
  {
    name: 'Vật lý',
    topics: [
      { name: 'Dao động cơ' },
      { name: 'Sóng cơ & Sóng âm' },
      { name: 'Dòng điện xoay chiều' },
      { name: 'Dao động & Sóng điện từ' },
      { name: 'Sóng ánh sáng' },
      { name: 'Lượng tử ánh sáng' },
      { name: 'Vật lý hạt nhân' }
    ]
  },
  {
    name: 'Hóa học',
    topics: [
      { name: 'Este & Lipit' },
      { name: 'Cacbohiđrat' },
      { name: 'Amin, Amino Axit & Peptit' },
      { name: 'Polime & Vật liệu polime' },
      { name: 'Đại cương về kim loại' },
      { name: 'Kim loại kiềm, kiềm thổ & Nhôm' },
      { name: 'Sắt & Một số kim loại quan trọng' },
      { name: 'Hóa học & Vấn đề môi trường' }
    ]
  },
  {
    name: 'Tiếng Anh',
    topics: [
      { name: 'Phát âm (Pronunciation)' },
      { name: 'Trọng âm (Stress)' },
      { name: 'Ngữ pháp & Từ vựng (Grammar & Vocabulary)' },
      { name: 'Chức năng giao tiếp (Communication)' },
      { name: 'Tìm lỗi sai (Error Identification)' },
      { name: 'Từ đồng nghĩa & Trái nghĩa (Synonyms & Antonyms)' },
      { name: 'Đọc điền từ (Cloze Test)' },
      { name: 'Đọc hiểu (Reading Comprehension)' }
    ]
  }
];

export default function TeacherReviewStudioV3({
  activeSession,
  onCloseDetail,
  onConfirmPublish
}) {
  const [questions, setQuestions] = useState(activeSession?.questions || []);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isStudentPreview, setIsStudentPreview] = useState(false);
  const [isUploadingExpImage, setIsUploadingExpImage] = useState(false);
  const [subjectsMetadata, setSubjectsMetadata] = useState([]);

  useEffect(() => {
    api.getSubjectsAndTopics().then(res => {
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setSubjectsMetadata(res.data);
      } else {
        setSubjectsMetadata(fallbackSubjects);
      }
    }).catch(err => {
      console.warn('[TeacherReviewStudioV3] Failed to load subjects/topics metadata:', err);
      setSubjectsMetadata(fallbackSubjects);
    });
  }, []);

  const media = activeSession?.media || {};
  const artifactsV3 = media.pipelineArtifactsV3 || {};
  const visionOutputs = artifactsV3.visionOutputs || [];
  const crops = artifactsV3.crops || [];

  const currentQuestion = questions[activeQuestionIndex] || questions[0] || {};
  const currentCrop = crops[activeQuestionIndex] || {};
  const currentVision = visionOutputs[activeQuestionIndex] || {};

  // State to track cached boundaries list and recrop adjustments
  const [boundariesState, setBoundariesState] = useState(artifactsV3.boundaries || []);
  const activeBoundary = boundariesState.find(b => b.questionIndex === activeQuestionIndex + 1) || {};
  const isMultiPage = activeBoundary.pageStart !== activeBoundary.pageEnd;

  const [localTopY, setLocalTopY] = useState(activeBoundary.topYRatio || 0);
  const [localBottomY, setLocalBottomY] = useState(activeBoundary.bottomYRatio || 1.0);
  const [localPageStartBottomY, setLocalPageStartBottomY] = useState(activeBoundary.pageStartBottomYRatio || 1.0);
  const [localPageEndTopY, setLocalPageEndTopY] = useState(activeBoundary.pageEndTopYRatio || 0.0);
  
  const [recropCacheBuster, setRecropCacheBuster] = useState(Date.now());
  const [isRecropping, setIsRecropping] = useState(false);

  // Sync sliders when active question changes
  useEffect(() => {
    const boundary = boundariesState.find(b => b.questionIndex === activeQuestionIndex + 1) || {};
    setLocalTopY(boundary.topYRatio !== undefined ? boundary.topYRatio : 0);
    setLocalBottomY(boundary.bottomYRatio !== undefined ? boundary.bottomYRatio : 1.0);
    setLocalPageStartBottomY(boundary.pageStartBottomYRatio !== undefined ? boundary.pageStartBottomYRatio : 1.0);
    setLocalPageEndTopY(boundary.pageEndTopYRatio !== undefined ? boundary.pageEndTopYRatio : 0.0);
  }, [activeQuestionIndex, boundariesState]);

  const handleSelectQuestion = (idx) => {
    setActiveQuestionIndex(idx);
    const targetCrop = crops[idx];
    if (targetCrop && targetCrop.pageStart) {
      setCurrentPage(targetCrop.pageStart);
    }
  };

  const handleUpdateQuestion = (idx, patch) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, ...patch } : q));
    const targetQ = questions[idx];
    if (targetQ && targetQ.id) {
      api.updateImportQuestion(targetQ.id, patch).catch(err => {
        console.warn('[handleUpdateQuestion] Failed to save draft question:', err);
      });
    }
  };

  const handleRecrop = async () => {
    try {
      setIsRecropping(true);
      const res = await api.recropImportQuestionV3(activeSession.id, activeQuestionIndex + 1, {
        topYRatio: localTopY,
        bottomYRatio: localBottomY,
        pageStart: activeBoundary.pageStart,
        pageEnd: activeBoundary.pageEnd,
        pageStartBottomYRatio: isMultiPage ? localPageStartBottomY : undefined,
        pageEndTopYRatio: isMultiPage ? localPageEndTopY : undefined
      });

      if (res && res.success) {
        setBoundariesState(prev => prev.map(b => 
          b.questionIndex === activeQuestionIndex + 1 
            ? { 
                ...b, 
                topYRatio: localTopY, 
                bottomYRatio: localBottomY,
                pageStartBottomYRatio: isMultiPage ? localPageStartBottomY : b.pageStartBottomYRatio,
                pageEndTopYRatio: isMultiPage ? localPageEndTopY : b.pageEndTopYRatio
              } 
            : b
        ));
        setRecropCacheBuster(Date.now());
      } else {
        alert('Cắt lại thất bại. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi cắt lại!');
    } finally {
      setIsRecropping(false);
    }
  };

  const handleUploadExplanationImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingExpImage(true);
      const res = await api.uploadExplanationImageV3(activeSession.id, activeQuestionIndex + 1, file);
      if (res && res.success) {
        const updatedMedia = { 
          ...(currentQuestion.media || {}), 
          explanationImagePath: res.explanationImagePath 
        };
        handleUpdateQuestion(activeQuestionIndex, { media: updatedMedia });
      } else {
        alert('Tải ảnh lên thất bại!');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi tải ảnh lên!');
    } finally {
      setIsUploadingExpImage(false);
    }
  };

  const handleRemoveExplanationImage = () => {
    const updatedMedia = { ...(currentQuestion.media || {}) };
    delete updatedMedia.explanationImagePath;
    handleUpdateQuestion(activeQuestionIndex, { media: updatedMedia });
  };

  const handlePasteExplanation = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (!file) continue;

        e.preventDefault();

        try {
          setIsUploadingExpImage(true);
          const res = await api.uploadExplanationImageV3(activeSession.id, activeQuestionIndex + 1, file);
          if (res && res.success) {
            const updatedMedia = { 
              ...(currentQuestion.media || {}), 
              explanationImagePath: res.explanationImagePath 
            };
            handleUpdateQuestion(activeQuestionIndex, { media: updatedMedia });
          } else {
            alert('Tải ảnh dán từ clipboard thất bại!');
          }
        } catch (err) {
          console.error(err);
          alert('Đã xảy ra lỗi khi tải ảnh từ clipboard!');
        } finally {
          setIsUploadingExpImage(false);
        }
        break;
      }
    }
  };

  const formatRichText = (txt) => {
    if (!txt) return '';
    let cleaned = String(txt);
    // Replace Datalab/Markdown image tags ![Alt](image.jpg) with formatted inline image elements
    cleaned = cleaned.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      const fullSrc = src.startsWith('http') || src.startsWith('data:') 
        ? src 
        : `${API_BASE}/${src.replace(/\\/g, '/').replace(/^\/+/, '')}`;
      return `<div style="text-align:center;margin:8px 0;"><img src="${fullSrc}" alt="${alt}" style="max-width:100%;max-height:280px;border-radius:8px;border:1px solid #cbd5e1;display:inline-block;" /></div>`;
    });
    return cleaned;
  };

  // Re-render MathJax typesetting whenever active question or content changes
  useEffect(() => {
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      const timer = setTimeout(() => {
        window.MathJax.typesetPromise().catch((err) => console.warn('MathJax error:', err));
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [activeQuestionIndex, currentQuestion?.explanation, currentQuestion?.content, currentQuestion?.options]);

  const handleAddOption = () => {
    const isTF = currentQuestion.type === 'TRUE_FALSE';
    const currentOpts = Array.isArray(currentQuestion.options) 
      ? [...currentQuestion.options] 
      : (isTF 
          ? [ { label: 'a', content: '' }, { label: 'b', content: '' }, { label: 'c', content: '' }, { label: 'd', content: '' } ]
          : [ { label: 'A', content: '' }, { label: 'B', content: '' }, { label: 'C', content: '' }, { label: 'D', content: '' } ]
        );
    
    let nextLabel = 'A';
    if (isTF) {
      const charCode = currentOpts.length > 0 ? currentOpts[currentOpts.length - 1].label.charCodeAt(0) + 1 : 97;
      nextLabel = String.fromCharCode(charCode);
    } else {
      const charCode = currentOpts.length > 0 ? currentOpts[currentOpts.length - 1].label.charCodeAt(0) + 1 : 65;
      nextLabel = String.fromCharCode(charCode);
    }
    
    const newOpts = [...currentOpts, { label: nextLabel, content: '' }];
    let nextCorrect = currentQuestion.correctAnswer;
    if (isTF) {
      nextCorrect = nextCorrect ? `${nextCorrect},Đ` : 'Đ';
    }

    handleUpdateQuestion(activeQuestionIndex, { 
      options: newOpts,
      correctAnswer: nextCorrect
    });
  };

  const handleRemoveOption = (indexToRemove) => {
    const isTF = currentQuestion.type === 'TRUE_FALSE';
    const currentOpts = Array.isArray(currentQuestion.options) 
      ? [...currentQuestion.options] 
      : (isTF 
          ? [ { label: 'a', content: '' }, { label: 'b', content: '' }, { label: 'c', content: '' }, { label: 'd', content: '' } ]
          : [ { label: 'A', content: '' }, { label: 'B', content: '' }, { label: 'C', content: '' }, { label: 'D', content: '' } ]
        );
    
    if (currentOpts.length <= 1) return;

    const removedOpt = currentOpts[indexToRemove];
    const newOpts = currentOpts.filter((_, idx) => idx !== indexToRemove);

    let nextCorrect = currentQuestion.correctAnswer;
    if (isTF) {
      const parts = (nextCorrect || 'Đ,Đ,Đ,Đ').split(',');
      const newParts = parts.filter((_, idx) => idx !== indexToRemove);
      nextCorrect = newParts.join(',');
    } else if (currentQuestion.type === 'MULTIPLE_SELECT') {
      const parts = (nextCorrect || '').split(',').filter(Boolean);
      const newParts = parts.filter(p => p !== removedOpt.label);
      nextCorrect = newParts.join(',');
    } else {
      if (nextCorrect === removedOpt.label) {
        nextCorrect = newOpts[0]?.label || '';
      }
    }

    handleUpdateQuestion(activeQuestionIndex, { 
      options: newOpts,
      correctAnswer: nextCorrect
    });
  };

  const handleUpdateOptionField = (idxToUpdate, fieldPatch) => {
    const isTF = currentQuestion.type === 'TRUE_FALSE';
    const currentOpts = Array.isArray(currentQuestion.options) 
      ? [...currentQuestion.options] 
      : (isTF 
          ? [ { label: 'a', content: '' }, { label: 'b', content: '' }, { label: 'c', content: '' }, { label: 'd', content: '' } ]
          : [ { label: 'A', content: '' }, { label: 'B', content: '' }, { label: 'C', content: '' }, { label: 'D', content: '' } ]
        );
        
    const newOpts = currentOpts.map((opt, i) => i === idxToUpdate ? { ...opt, ...fieldPatch } : opt);
    handleUpdateQuestion(activeQuestionIndex, { options: newOpts });
  };

  const rawCropPath = currentCrop?.relativeCropPath || currentCrop?.cropPath || currentQuestion?.media?.cropImagePath || `scratch/crops/session_${activeSession?.id}/q_${activeQuestionIndex + 1}.png`;
  let normalizedPath = rawCropPath.replace(/\\/g, '/');
  if (normalizedPath.includes('scratch/')) {
    normalizedPath = normalizedPath.replace(/^.*?(scratch\/.*)$/, '$1');
  } else if (normalizedPath.includes('uploads/')) {
    normalizedPath = normalizedPath.replace(/^.*?(uploads\/.*)$/, '$1');
  } else {
    normalizedPath = normalizedPath.replace(/^\/+/, '');
  }

  const cropImageUrl = rawCropPath.startsWith('http')
    ? `${rawCropPath}?t=${recropCacheBuster}`
    : `${API_BASE}/${normalizedPath}?t=${recropCacheBuster}`;

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      display: 'flex', 
      flexDirection: 'column', 
      background: '#f8fafc', 
      color: '#0f172a', 
      overflow: 'hidden', 
      fontFamily: "'Outfit', 'Inter', sans-serif" 
    }}>
      {/* Header Bar (Light Theme) */}
      <div style={{ height: '56px', padding: '0 24px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onCloseDetail}
            style={{ padding: '6px 14px', background: '#f1f5f9', color: '#334155', fontSize: '12px', fontWeight: 700, borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
          >
            ← Danh sách đề
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Duyệt &amp; Kiểm Tra Đề Thi: {activeSession?.fileName || 'Đề Thi Thử'}
            </h1>
            <span style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 700 }}>
              Tự động bóc tách bằng AI ({questions.length} câu hỏi)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsStudentPreview(!isStudentPreview)}
            style={{ padding: '6px 14px', background: isStudentPreview ? '#4f46e5' : '#f1f5f9', color: isStudentPreview ? '#ffffff' : '#334155', fontSize: '12px', fontWeight: 700, borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <HiEye /> {isStudentPreview ? 'Bật Editor Mode' : 'Xem trước Học Sinh (Student Preview)'}
          </button>

          <button
            onClick={() => onConfirmPublish && activeSession && onConfirmPublish(activeSession.id)}
            style={{ padding: '6px 18px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', fontSize: '12px', fontWeight: 800, borderRadius: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)' }}
          >
            ✓ Xuất bản vào Ngân hàng Đề
          </button>
        </div>
      </div>

      {/* Main 2-Panel Workspace */}
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* PANEL 1: Original High-Res PDF Page Image Viewer (30% - Light Theme) */}
        <div style={{ width: '30%', height: '100%', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
          <div style={{ height: '40px', padding: '0 16px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><HiDocumentText style={{ color: '#4f46e5' }} /> Trang PDF Gốc</span>
            <span>Trang {currentPage} / {artifactsV3.mineruJson?.pages?.length || 1}</span>
          </div>
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', maxWidth: '100%', display: 'inline-block' }}>
              <img 
                src={`${API_BASE}/extracted_images/pdf_page_${currentPage}.png?v=${activeSession?.id || 1}`}
                alt={`Page ${currentPage}`}
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', display: 'block' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/600x800?text=Original+PDF+Page+Image';
                }}
              />
              {activeBoundary && activeBoundary.pageStart === currentPage && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${localTopY * 100}%`,
                  height: `${Math.max(0.02, (isMultiPage ? localPageStartBottomY : localBottomY) - localTopY) * 100}%`,
                  backgroundColor: 'rgba(99, 102, 241, 0.25)',
                  borderTop: '2px solid #6366f1',
                  borderBottom: '2px solid #6366f1',
                  boxShadow: '0 0 15px rgba(99,102,241,0.4)',
                  pointerEvents: 'none',
                  transition: 'top 0.1s ease, height 0.1s ease',
                  zIndex: 10
                }}>
                  <span style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '6px',
                    background: '#6366f1',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    {isMultiPage ? `Khung Trang Bắt Đầu - Câu ${activeQuestionIndex + 1}` : `Khung cắt Câu ${activeQuestionIndex + 1}`}
                  </span>
                </div>
              )}
              {activeBoundary && isMultiPage && activeBoundary.pageEnd === currentPage && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${localPageEndTopY * 100}%`,
                  height: `${Math.max(0.02, localBottomY - localPageEndTopY) * 100}%`,
                  backgroundColor: 'rgba(236, 72, 153, 0.25)',
                  borderTop: '2px solid #ec4899',
                  borderBottom: '2px solid #ec4899',
                  boxShadow: '0 0 15px rgba(236,72,153,0.4)',
                  pointerEvents: 'none',
                  transition: 'top 0.1s ease, height 0.1s ease',
                  zIndex: 10
                }}>
                  <span style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '6px',
                    background: '#ec4899',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    Khung Trang Kết Thúc - Câu {activeQuestionIndex + 1}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL 2: Cropped Question Image Viewer & Answer Editor (70% - Light Theme) */}
        <div style={{ width: '70%', height: '100%', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
          <div style={{ height: '40px', padding: '0 16px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><HiPhotograph style={{ color: '#ea580c' }} /> Ảnh Cắt Câu Hỏi #{activeQuestionIndex + 1} (Hiển thị cho học sinh)</span>
            <span style={{ color: '#059669', fontWeight: 800 }}>{currentQuestion.type || 'MULTIPLE_CHOICE'}</span>
          </div>
          
          {/* Top Section: Student Question Image Card (55% Height) */}
          <div style={{ height: '55%', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0, overflow: 'hidden', borderBottom: '1px solid #e2e8f0' }}>
            {/* Question Selector Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', width: '100%', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px' }}>
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectQuestion(idx)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    border: activeQuestionIndex === idx ? 'none' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    background: activeQuestionIndex === idx ? '#4f46e5' : '#f1f5f9',
                    color: activeQuestionIndex === idx ? '#ffffff' : '#475569'
                  }}
                >
                  Câu {idx + 1}
                </button>
              ))}
            </div>

            {/* Simulated Student Question Card (Light Style) */}
            <div style={{ 
              flex: 1, 
              background: '#ffffff', 
              borderRadius: '16px', 
              border: '1px solid #cbd5e1',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)', 
              display: 'flex', 
              flexDirection: 'column',
              padding: '20px', 
              color: '#0f172a',
              overflowY: 'auto',
              minHeight: 0
            }}>
              {/* Simulated Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#4f46e5' }}>
                  Câu {activeQuestionIndex + 1}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                    {currentQuestion.type || 'Trắc nghiệm'}
                  </span>
                  <button style={{ background: '#f1f5f9', color: '#64748b', fontSize: '11px', fontWeight: 700, border: 'none', padding: '3px 8px', borderRadius: '6px', cursor: 'default', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🔖 Lưu câu hỏi
                  </button>
                </div>
              </div>

              {/* Simulated Question Body (The cropped question image!) */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', width: '100%' }}>
                <img 
                  src={cropImageUrl}
                  alt={`Crop Question ${activeQuestionIndex + 1}`}
                  style={{ maxWidth: '100%', maxHeight: '240px', objectFit: 'contain', borderRadius: '6px' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/500x200?text=Question+Crop+Image+Preview';
                  }}
                />
              </div>

              {/* Simulated Option List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                {(!currentQuestion.type || currentQuestion.type === 'MULTIPLE_CHOICE') && (
                  (() => {
                    const activeOpts = Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0
                      ? currentQuestion.options
                      : [ { label: 'A', content: '' }, { label: 'B', content: '' }, { label: 'C', content: '' }, { label: 'D', content: '' } ];
                    return activeOpts.map((opt) => {
                      const isSelected = currentQuestion.correctAnswer === opt.label;
                      return (
                        <div 
                          key={opt.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: isSelected ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                            background: isSelected ? '#ecfdf5' : '#ffffff',
                            transition: 'all 0.2s',
                            cursor: 'default'
                          }}
                        >
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: isSelected ? '#10b981' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 800,
                            border: isSelected ? 'none' : '1px solid #cbd5e1'
                          }}>
                            {opt.label}
                          </div>
                          <span 
                            style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#047857' : '#475569' }}
                            dangerouslySetInnerHTML={{ __html: formatRichText(opt.content || '') }}
                          />
                        </div>
                      );
                    });
                  })()
                )}

                {currentQuestion.type === 'MULTIPLE_SELECT' && (
                  (() => {
                    const activeOpts = Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0
                      ? currentQuestion.options
                      : [ { label: 'A', content: '' }, { label: 'B', content: '' }, { label: 'C', content: '' }, { label: 'D', content: '' } ];
                    return activeOpts.map((opt) => {
                      const currentAnswers = (currentQuestion.correctAnswer || '').split(',').filter(Boolean);
                      const isSelected = currentAnswers.includes(opt.label);
                      return (
                        <div 
                          key={opt.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: isSelected ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                            background: isSelected ? '#ecfdf5' : '#ffffff',
                            transition: 'all 0.2s',
                            cursor: 'default'
                          }}
                        >
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            background: isSelected ? '#10b981' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 800,
                            border: isSelected ? 'none' : '1px solid #cbd5e1'
                          }}>
                            {opt.label}
                          </div>
                          <span 
                            style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#047857' : '#475569' }}
                            dangerouslySetInnerHTML={{ __html: formatRichText(opt.content ? `${opt.content} (Chọn nhiều)` : '') }}
                          />
                        </div>
                      );
                    });
                  })()
                )}

                {currentQuestion.type === 'TRUE_FALSE' && (
                  (() => {
                    const activeOpts = Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0
                      ? currentQuestion.options
                      : [ { label: 'a', content: '' }, { label: 'b', content: '' }, { label: 'c', content: '' }, { label: 'd', content: '' } ];
                    return activeOpts.map((opt, idx) => {
                      const currentAnswers = (currentQuestion.correctAnswer || 'Đ,Đ,Đ,Đ').split(',');
                      const value = currentAnswers[idx] || 'Đ';
                      return (
                        <div 
                          key={opt.label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            background: '#ffffff'
                          }}
                        >
                          <span 
                            style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}
                            dangerouslySetInnerHTML={{ __html: `${opt.label}) ${formatRichText(opt.content || '')}` }}
                          />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...currentAnswers];
                                while (next.length < 4) next.push('Đ');
                                next[idx] = 'Đ';
                                handleUpdateQuestion(activeQuestionIndex, { correctAnswer: next.join(',') });
                              }}
                              style={{
                                padding: '5px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 800,
                                background: value === 'Đ' ? '#10b981' : '#f1f5f9',
                                color: value === 'Đ' ? '#ffffff' : '#64748b',
                                border: value === 'Đ' ? 'none' : '1px solid #cbd5e1',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              Đúng
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...currentAnswers];
                                while (next.length < 4) next.push('Đ');
                                next[idx] = 'S';
                                handleUpdateQuestion(activeQuestionIndex, { correctAnswer: next.join(',') });
                              }}
                              style={{
                                padding: '5px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 800,
                                background: value === 'S' ? '#ef4444' : '#f1f5f9',
                                color: value === 'S' ? '#ffffff' : '#64748b',
                                border: value === 'S' ? 'none' : '1px solid #cbd5e1',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              Sai
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}

                {currentQuestion.type === 'SHORT_ANSWER' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: 800, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ✍️ ĐÁP ÁN ĐÚNG CỦA CÂU HỎI TRẢ LỜI NGẮN:
                    </label>
                    <input 
                      type="text" 
                      value={currentQuestion.correctAnswer || ''} 
                      onChange={(e) => handleUpdateQuestion(activeQuestionIndex, { correctAnswer: e.target.value })}
                      placeholder="Nhập đáp án đúng (Ví dụ: 15, -2.5, 0.5)..." 
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '2px solid #6366f1',
                        background: '#f5f3ff',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#1e1b4b',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}

                {currentQuestion.type === 'ESSAY' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b' }}>BÀI LÀM CỦA HỌC SINH (MÔ PHỎNG):</label>
                    <textarea 
                      disabled 
                      rows={4}
                      placeholder="Học sinh viết bài giải tự luận trực tiếp tại đây..." 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '12px', resize: 'none' }}
                    />
                    <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                      * Lưu ý: Tự luận dài không yêu cầu đáp án cụ thể. Học sinh sẽ làm trực tiếp trên hệ thống, giáo viên chấm thủ công.
                    </div>
                  </div>
                )}
              </div>

              {/* Simulated Explanation Preview */}
              {(currentQuestion.explanation || currentQuestion.media?.explanationImagePath) && (
                <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, color: '#4f46e5', marginBottom: '8px' }}>
                    💡 HƯỚNG DẪN GIẢI CHI TIẾT
                  </div>
                  {currentQuestion.explanation && (
                    <div 
                      style={{ fontSize: '13px', color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-line', marginBottom: currentQuestion.media?.explanationImagePath ? '12px' : 0 }}
                      dangerouslySetInnerHTML={{ __html: formatRichText(currentQuestion.explanation) }}
                    />
                  )}
                  {currentQuestion.media?.explanationImagePath && (
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      <img 
                        src={currentQuestion.media.explanationImagePath.startsWith('http') 
                          ? currentQuestion.media.explanationImagePath 
                          : `${API_BASE}/${currentQuestion.media.explanationImagePath.replace(/\\/g, '/').replace(/^\/+/, '')}`}
                        alt="Explanation Diagram"
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Question Configurations (45% Height - Light Theme) */}
          <div style={{ height: '45%', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
            
            {/* Top Row: Căn chỉnh biên cắt (Compact Light Layout) */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '16px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <h4 style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                <HiRefresh style={{ color: '#4f46e5', fontSize: '14px' }} /> Căn biên cắt
              </h4>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'row', gap: '20px', alignItems: 'center', minWidth: 0 }}>
                {isMultiPage ? (
                  <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', flex: 1, alignItems: 'center', minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '4px', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => setCurrentPage(activeBoundary.pageStart)}
                        style={{
                          padding: '3px 8px', fontSize: '9px', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: 'pointer',
                          background: currentPage === activeBoundary.pageStart ? '#4f46e5' : '#e2e8f0', color: currentPage === activeBoundary.pageStart ? '#ffffff' : '#475569'
                        }}
                      >
                        Trang đầu ({activeBoundary.pageStart})
                      </button>
                      <button
                        onClick={() => setCurrentPage(activeBoundary.pageEnd)}
                        style={{
                          padding: '3px 8px', fontSize: '9px', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: 'pointer',
                          background: currentPage === activeBoundary.pageEnd ? '#ec4899' : '#e2e8f0', color: currentPage === activeBoundary.pageEnd ? '#ffffff' : '#475569'
                        }}
                      >
                        Trang cuối ({activeBoundary.pageEnd})
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: 0 }}>
                      {currentPage === activeBoundary.pageStart ? (
                        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', color: '#475569', whiteSpace: 'nowrap' }}>Biên trên: {Math.round(localTopY * 100)}%</span>
                            <input 
                              type="range" min="0" max={Math.min(1.0, localPageStartBottomY - 0.01).toString()} step="0.005" value={localTopY} 
                              onChange={(e) => setLocalTopY(parseFloat(e.target.value))}
                              style={{ flex: 1, accentColor: '#4f46e5', height: '4px', cursor: 'pointer' }}
                            />
                          </div>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', color: '#475569', whiteSpace: 'nowrap' }}>Biên dưới: {Math.round(localPageStartBottomY * 100)}%</span>
                            <input 
                              type="range" min={(localTopY + 0.01).toString()} max="1" step="0.005" value={localPageStartBottomY} 
                              onChange={(e) => setLocalPageStartBottomY(parseFloat(e.target.value))}
                              style={{ flex: 1, accentColor: '#4f46e5', height: '4px', cursor: 'pointer' }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', color: '#475569', whiteSpace: 'nowrap' }}>Biên trên: {Math.round(localPageEndTopY * 100)}%</span>
                            <input 
                              type="range" min="0" max={Math.min(1.0, localBottomY - 0.01).toString()} step="0.005" value={localPageEndTopY} 
                              onChange={(e) => setLocalPageEndTopY(parseFloat(e.target.value))}
                              style={{ flex: 1, accentColor: '#ec4899', height: '4px', cursor: 'pointer' }}
                            />
                          </div>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '10px', color: '#475569', whiteSpace: 'nowrap' }}>Biên dưới: {Math.round(localBottomY * 100)}%</span>
                            <input 
                              type="range" min={(localPageEndTopY + 0.01).toString()} max="1" step="0.005" value={localBottomY} 
                              onChange={(e) => setLocalBottomY(parseFloat(e.target.value))}
                              style={{ flex: 1, accentColor: '#ec4899', height: '4px', cursor: 'pointer' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', flex: 1, alignItems: 'center', minWidth: 0 }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#475569', whiteSpace: 'nowrap' }}>Biên trên: {Math.round(localTopY * 100)}%</span>
                      <input 
                        type="range" min="0" max={Math.min(1.0, localBottomY - 0.01).toString()} step="0.005" value={localTopY} 
                        onChange={(e) => setLocalTopY(parseFloat(e.target.value))}
                        style={{ flex: 1, accentColor: '#4f46e5', height: '4px', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#475569', whiteSpace: 'nowrap' }}>Biên dưới: {Math.round(localBottomY * 100)}%</span>
                      <input 
                        type="range" min={(localTopY + 0.01).toString()} max="1" step="0.005" value={localBottomY} 
                        onChange={(e) => setLocalBottomY(parseFloat(e.target.value))}
                        style={{ flex: 1, accentColor: '#4f46e5', height: '4px', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleRecrop}
                disabled={isRecropping}
                style={{
                  padding: '6px 14px',
                  background: isRecropping ? '#cbd5e1' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isRecropping ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)'
                }}
              >
                {isRecropping ? 'Đang thực hiện...' : 'Cắt lại & Cập nhật ảnh'}
              </button>
            </div>

            {/* Bottom Row: Answer & Explanation Panel (Expanded Light Layout) */}
            <div style={{
              flex: 1,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                <HiCheckCircle style={{ color: '#10b981' }} /> Đáp Án & Hướng Dẫn Giải
              </h4>

              <div style={{ display: 'flex', flexDirection: 'row', gap: '20px', flex: 1, minHeight: 0 }}>
                {/* Left Column: Type selection + Answer key selector (35% Width) */}
                <div style={{ width: '35%', display: 'flex', flexDirection: 'column', gap: '10px', borderRight: '1px solid #e2e8f0', paddingRight: '20px', overflowY: 'auto' }}>
                  {/* Question Type Selection */}
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Loại câu hỏi</label>
                    <select
                      value={currentQuestion.type || 'MULTIPLE_CHOICE'}
                      onChange={(e) => {
                        const newType = e.target.value;
                        let defaultAns = 'A';
                        let defaultOpts = [];
                        if (newType === 'TRUE_FALSE') {
                          defaultAns = 'Đ,Đ,Đ,Đ';
                          defaultOpts = [ { label: 'a', content: '' }, { label: 'b', content: '' }, { label: 'c', content: '' }, { label: 'd', content: '' } ];
                        } else if (newType === 'MULTIPLE_CHOICE' || newType === 'MULTIPLE_SELECT') {
                          defaultOpts = [ { label: 'A', content: '' }, { label: 'B', content: '' }, { label: 'C', content: '' }, { label: 'D', content: '' } ];
                        }
                        handleUpdateQuestion(activeQuestionIndex, { type: newType, correctAnswer: defaultAns, options: defaultOpts });
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        background: '#f8fafc',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontFamily: 'inherit',
                        outline: 'none'
                      }}
                    >
                      <option value="MULTIPLE_CHOICE">Trắc nghiệm (1 đáp án)</option>
                      <option value="MULTIPLE_SELECT">Chọn nhiều đáp án</option>
                      <option value="TRUE_FALSE">Đúng / Sai</option>
                      <option value="SHORT_ANSWER">Tự luận ngắn / Điền khuyết</option>
                      <option value="ESSAY">Tự luận dài</option>
                    </select>
                  </div>

                  {/* Answer Configuration UI */}
                  {(!currentQuestion.type || currentQuestion.type === 'MULTIPLE_CHOICE' || currentQuestion.type === 'MULTIPLE_SELECT') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Các phương án & Đáp án đúng</label>
                        <button 
                          onClick={handleAddOption}
                          style={{ background: '#4f46e5', color: '#ffffff', border: 'none', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 800, cursor: 'pointer' }}
                        >
                          + Thêm ý
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                        {(() => {
                          const activeOpts = Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0
                            ? currentQuestion.options
                            : [ { label: 'A', content: '' }, { label: 'B', content: '' }, { label: 'C', content: '' }, { label: 'D', content: '' } ];
                          const isMulti = currentQuestion.type === 'MULTIPLE_SELECT';
                          const currentAnswers = (currentQuestion.correctAnswer || '').split(',').filter(Boolean);

                          return activeOpts.map((opt, oIdx) => {
                            const isCorrect = isMulti ? currentAnswers.includes(opt.label) : currentQuestion.correctAnswer === opt.label;
                            return (
                              <div key={opt.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  onClick={() => {
                                    if (isMulti) {
                                      let nextAnswers;
                                      if (isCorrect) {
                                        nextAnswers = currentAnswers.filter(a => a !== opt.label);
                                      } else {
                                        nextAnswers = [...currentAnswers, opt.label].sort();
                                      }
                                      handleUpdateQuestion(activeQuestionIndex, { correctAnswer: nextAnswers.join(',') });
                                    } else {
                                      handleUpdateQuestion(activeQuestionIndex, { correctAnswer: opt.label });
                                    }
                                  }}
                                  style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: isMulti ? '4px' : '50%',
                                    background: isCorrect ? '#10b981' : '#f1f5f9',
                                    color: isCorrect ? '#ffffff' : '#64748b',
                                    border: isCorrect ? 'none' : '1px solid #cbd5e1',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}
                                  title={isCorrect ? "Hủy làm đáp án đúng" : "Chọn làm đáp án đúng"}
                                >
                                  {opt.label}
                                </button>

                                <input 
                                  type="text"
                                  value={opt.content || ''}
                                  onChange={(e) => handleUpdateOptionField(oIdx, { content: e.target.value })}
                                  placeholder={`Nhập đáp án ${opt.label}...`}
                                  style={{
                                    flex: 1,
                                    padding: '5px 8px',
                                    background: '#f8fafc',
                                    color: '#0f172a',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    outline: 'none'
                                  }}
                                />

                                {activeOpts.length > 1 && (
                                  <button 
                                    onClick={() => handleRemoveOption(oIdx)}
                                    style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 4px', flexShrink: 0 }}
                                    title="Xóa"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {currentQuestion.type === 'TRUE_FALSE' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Cấu hình ý Đúng/Sai</label>
                        <button 
                          onClick={handleAddOption}
                          style={{ background: '#4f46e5', color: '#ffffff', border: 'none', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 800, cursor: 'pointer' }}
                        >
                          + Thêm ý
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                        {(() => {
                          const activeOpts = Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0
                            ? currentQuestion.options
                            : [ { label: 'a', content: '' }, { label: 'b', content: '' }, { label: 'c', content: '' }, { label: 'd', content: '' } ];
                          const currentAnswers = (currentQuestion.correctAnswer || 'Đ,Đ,Đ,Đ').split(',');

                          return activeOpts.map((opt, oIdx) => {
                            const value = currentAnswers[oIdx] || 'Đ';
                            return (
                              <div key={opt.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#4f46e5', width: '18px', flexShrink: 0 }}>{opt.label})</span>
                                
                                <input 
                                  type="text"
                                  value={opt.content || ''}
                                  onChange={(e) => handleUpdateOptionField(oIdx, { content: e.target.value })}
                                  placeholder={`Nhập khẳng định ${opt.label}...`}
                                  style={{
                                    flex: 1,
                                    padding: '5px 8px',
                                    background: '#f8fafc',
                                    color: '#0f172a',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    outline: 'none'
                                  }}
                                />

                                <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                                  <button
                                    onClick={() => {
                                      const next = [...currentAnswers];
                                      next[oIdx] = 'Đ';
                                      handleUpdateQuestion(activeQuestionIndex, { correctAnswer: next.join(',') });
                                    }}
                                    style={{
                                      padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                                      background: value === 'Đ' ? '#10b981' : '#e2e8f0', color: value === 'Đ' ? '#ffffff' : '#64748b'
                                    }}
                                  >
                                    Đúng
                                  </button>
                                  <button
                                    onClick={() => {
                                      const next = [...currentAnswers];
                                      next[oIdx] = 'S';
                                      handleUpdateQuestion(activeQuestionIndex, { correctAnswer: next.join(',') });
                                    }}
                                    style={{
                                      padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
                                      background: value === 'S' ? '#ef4444' : '#e2e8f0', color: value === 'S' ? '#ffffff' : '#64748b'
                                    }}
                                  >
                                    Sai
                                  </button>
                                </div>

                                {activeOpts.length > 1 && (
                                  <button 
                                    onClick={() => handleRemoveOption(oIdx)}
                                    style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '0 4px', flexShrink: 0 }}
                                    title="Xóa"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {currentQuestion.type === 'SHORT_ANSWER' && (
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Đáp án tự luận ngắn</label>
                      <input
                        type="text"
                        value={currentQuestion.correctAnswer || ''}
                        onChange={(e) => handleUpdateQuestion(activeQuestionIndex, { correctAnswer: e.target.value })}
                        placeholder="Nhập đáp án (Ví dụ: 15 hoặc x = 2)"
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          background: '#f8fafc',
                          color: '#0f172a',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontFamily: 'inherit',
                          outline: 'none'
                        }}
                      />
                    </div>
                  )}

                  {currentQuestion.type === 'ESSAY' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                      <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 600, textAlign: 'center' }}>Tự luận dài không yêu cầu đáp án cụ thể</span>
                    </div>
                  )}
                </div>

                {/* Right Column: Detailed Explanation Textarea + Image Uploader (65% Width) */}
                <div style={{ width: '65%', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Lời giải chi tiết</label>
                  <textarea
                    style={{ 
                      width: '100%', 
                      flex: 1,
                      padding: '8px', 
                      background: '#f8fafc', 
                      color: '#0f172a', 
                      border: '1px solid #cbd5e1', 
                      borderRadius: '6px', 
                      fontSize: '11px', 
                      resize: 'none',
                      fontFamily: 'inherit',
                      marginBottom: '8px',
                      minHeight: 0
                    }}
                    value={currentQuestion.explanation || ''}
                    onChange={(e) => handleUpdateQuestion(activeQuestionIndex, { explanation: e.target.value })}
                    onPaste={handlePasteExplanation}
                    placeholder="Nhập hướng dẫn giải tại đây... (Có thể dán trực tiếp ảnh từ clipboard bằng Ctrl+V)"
                  />

                  {/* Explanation Image Handler */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {currentQuestion.media?.explanationImagePath ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%' }}>
                        <img 
                          src={currentQuestion.media.explanationImagePath.startsWith('http') 
                            ? currentQuestion.media.explanationImagePath 
                            : `${API_BASE}/${currentQuestion.media.explanationImagePath.replace(/\\/g, '/').replace(/^\/+/, '')}`}
                          alt="Explanation" 
                          style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '4px', background: '#ffffff' }}
                        />
                        <span style={{ fontSize: '10px', color: '#475569', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Ảnh lời giải đã thêm</span>
                        <button 
                          onClick={handleRemoveExplanationImage}
                          style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 800, cursor: 'pointer' }}
                        >
                          Xóa
                        </button>
                      </div>
                    ) : (
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: '#f1f5f9', border: '1px dashed #4f46e5', borderRadius: '6px', color: '#4f46e5', fontSize: '10px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
                        📷 {isUploadingExpImage ? 'Đang tải...' : 'Thêm ảnh lời giải'}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleUploadExplanationImage}
                          disabled={isUploadingExpImage}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Metadata Row: Subject, Topic, Difficulty */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    marginTop: '12px', 
                    borderTop: '1px solid #e2e8f0', 
                    paddingTop: '12px',
                    alignItems: 'flex-end'
                  }}>
                    {/* Subject field */}
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '9px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Môn học</label>
                      <select
                        value={currentQuestion.media?.subject || currentQuestion.subject || ''}
                        onChange={(e) => {
                          const selectedSubjName = e.target.value;
                          const subjObj = subjectsMetadata.find(s => s.name === selectedSubjName);
                          const defaultTopic = subjObj?.topics?.[0]?.name || '';
                          const updatedMedia = { 
                            ...(currentQuestion.media || {}), 
                            subject: selectedSubjName,
                            topic: defaultTopic
                          };
                          handleUpdateQuestion(activeQuestionIndex, { subject: selectedSubjName, topic: defaultTopic, media: updatedMedia });
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          background: '#f8fafc',
                          color: '#0f172a',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontSize: '11px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="" disabled>-- Chọn môn học --</option>
                        {subjectsMetadata.map(s => (
                          <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Topic field */}
                    <div style={{ flex: 1.5 }}>
                      <label style={{ fontSize: '9px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Chủ đề / Chương bài</label>
                      <select
                        value={currentQuestion.media?.topic || currentQuestion.topic || ''}
                        onChange={(e) => {
                          const updatedMedia = { 
                            ...(currentQuestion.media || {}), 
                            topic: e.target.value 
                          };
                          handleUpdateQuestion(activeQuestionIndex, { topic: e.target.value, media: updatedMedia });
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          background: '#f8fafc',
                          color: '#0f172a',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontSize: '11px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="" disabled>-- Chọn chủ đề --</option>
                        {(() => {
                          const activeSubjName = currentQuestion.media?.subject || '';
                          const subjObj = subjectsMetadata.find(s => s.name === activeSubjName);
                          const topicsList = subjObj?.topics || [];
                          return topicsList.map(t => (
                            <option key={t.name} value={t.name}>{t.name}</option>
                          ));
                        })()}
                      </select>
                    </div>

                    {/* Difficulty select field */}
                    <div style={{ width: '120px' }}>
                      <label style={{ fontSize: '9px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>Độ khó</label>
                      <select
                        value={currentQuestion.difficulty || 'MEDIUM'}
                        onChange={(e) => {
                          handleUpdateQuestion(activeQuestionIndex, { difficulty: e.target.value });
                        }}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          background: '#f8fafc',
                          color: '#0f172a',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          fontSize: '11px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="EASY">Dễ (Nhận biết)</option>
                        <option value="MEDIUM">Trung bình (Thông hiểu)</option>
                        <option value="HARD">Khó (Vận dụng)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// HMR Trigger Comment
