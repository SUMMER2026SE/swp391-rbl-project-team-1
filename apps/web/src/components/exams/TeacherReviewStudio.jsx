import React, { useState, useEffect, useCallback } from 'react';
import PdfViewerPanel from './review/PdfViewerPanel';
import BoundingBoxOverlayPanel from './review/BoundingBoxOverlayPanel';
import QuestionGraphEditorPanel from './review/QuestionGraphEditorPanel';
import PipelineDebugPanel from './review/PipelineDebugPanel';
import { HiTerminal, HiSparkles, HiInformationCircle } from 'react-icons/hi';

const API_BASE = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4000'
    : '');

export default function TeacherReviewStudio({
  activeSession,
  onCloseDetail,
  onConfirmPublish,
  onAutoSaveDraft
}) {
  const [questions, setQuestions] = useState(activeSession?.questions || []);
  const [activeQuestionId, setActiveQuestionId] = useState(questions[0]?.id || null);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isStudentPreview, setIsStudentPreview] = useState(false);
  const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // History Stacks for Undo / Redo
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const media = activeSession?.media || {};
  const blockMap = media.blockMap || {};
  const artifacts = media.pipelineArtifacts || {};
  const activeQuestion = questions.find(q => q.id === activeQuestionId) || questions[0];

  // Helper to push history state before mutations
  const pushHistoryState = useCallback(() => {
    setUndoStack(prev => [...prev, JSON.stringify(questions)]);
    setRedoStack([]);
  }, [questions]);

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const lastState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, JSON.stringify(questions)]);
    setQuestions(JSON.parse(lastState));
    setUndoStack(prev => prev.slice(0, -1));
  }, [undoStack, questions]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, JSON.stringify(questions)]);
    setQuestions(JSON.parse(nextState));
    setRedoStack(prev => prev.slice(0, -1));
  }, [redoStack, questions]);

  // Keyboard Shortcuts: Ctrl+Z (Undo), Ctrl+Y (Redo), Ctrl+S (Save)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onAutoSaveDraft && activeSession) {
          onAutoSaveDraft(activeSession.id, questions);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, onAutoSaveDraft, activeSession, questions]);

  // 10s Auto-Save Timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (onAutoSaveDraft && activeSession) {
        onAutoSaveDraft(activeSession.id, questions);
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [onAutoSaveDraft, activeSession, questions]);

  // Sync selection: Selecting a question syncs page view
  const handleSelectQuestion = (qId) => {
    setActiveQuestionId(qId);
    const targetQ = questions.find(q => q.id === qId);
    if (targetQ) {
      const firstBlockId = (targetQ.regions?.questionBlocks || [])[0];
      if (firstBlockId && blockMap[firstBlockId]) {
        const pageNum = blockMap[firstBlockId].page || 1;
        setCurrentPage(pageNum);
        setActiveBlockId(firstBlockId);
      }
    }
  };

  // Sync selection: Clicking a block on overlay syncs question
  const handleSelectBlock = (bId) => {
    setActiveBlockId(bId);
    const mappedQ = questions.find(q => {
      const r = q.regions || {};
      const allIds = [
        ...(r.questionBlocks || []),
        ...(r.imageBlocks || []),
        ...(r.formulaBlocks || []),
        ...(r.optionA || []),
        ...(r.optionB || []),
        ...(r.optionC || []),
        ...(r.optionD || [])
      ];
      return allIds.includes(bId);
    });

    if (mappedQ) {
      setActiveQuestionId(mappedQ.id);
    }
  };

  // Re-run Stage Handler
  const handleRerunStage = async (stageName) => {
    if (!activeSession) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/v1/import-v2/session/${activeSession.id}/rerun-stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageName })
      });
      const data = await resp.json();
      if (data.success && data.data) {
        setQuestions(data.data.questions || []);
      }
    } catch (err) {
      console.error('[RerunStage Error]', err);
    } finally {
      setLoading(false);
    }
  };

  // Question Mutations
  const handleUpdateQuestion = (qId, patch) => {
    pushHistoryState();
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, ...patch } : q));
  };

  const handleMergeQuestions = (qId1, qId2) => {
    pushHistoryState();
    const q1 = questions.find(q => q.id === qId1);
    const q2 = questions.find(q => q.id === qId2);
    if (!q1 || !q2) return;

    const mergedContent = `${q1.content}\n${q2.content}`;
    const mergedRegions = {
      questionBlocks: [...(q1.regions?.questionBlocks || []), ...(q2.regions?.questionBlocks || [])],
      imageBlocks: [...(q1.regions?.imageBlocks || []), ...(q2.regions?.imageBlocks || [])],
      formulaBlocks: [...(q1.regions?.formulaBlocks || []), ...(q2.regions?.formulaBlocks || [])]
    };

    setQuestions(prev => prev.filter(q => q.id !== qId2).map(q => q.id === q1Id ? { ...q, content: mergedContent, regions: mergedRegions } : q));
  };

  const handleSplitQuestion = (qId) => {
    pushHistoryState();
    const targetQ = questions.find(q => q.id === qId);
    if (!targetQ) return;

    const newQ = {
      ...JSON.parse(JSON.stringify(targetQ)),
      id: Date.now(),
      questionOrder: targetQ.questionOrder + 1,
      content: `${targetQ.content} (Phần 2)`
    };

    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === qId);
      const next = [...prev];
      next[idx] = { ...targetQ, content: `${targetQ.content} (Phần 1)` };
      next.splice(idx + 1, 0, newQ);
      return next.map((q, i) => ({ ...q, questionOrder: i + 1 }));
    });
  };

  const handleDuplicateQuestion = (qId) => {
    pushHistoryState();
    const targetQ = questions.find(q => q.id === qId);
    if (!targetQ) return;

    const dupQ = {
      ...JSON.parse(JSON.stringify(targetQ)),
      id: Date.now(),
      questionOrder: targetQ.questionOrder + 1,
      content: `${targetQ.content} (Bản sao)`
    };

    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === qId);
      const next = [...prev];
      next.splice(idx + 1, 0, dupQ);
      return next.map((q, i) => ({ ...q, questionOrder: i + 1 }));
    });
  };

  const handleDeleteQuestion = (qId) => {
    pushHistoryState();
    setQuestions(prev => prev.filter(q => q.id !== qId).map((q, i) => ({ ...q, questionOrder: i + 1 })));
  };

  // Processing Metrics Calculation
  const totalPages = artifacts.mineruJson?.pages?.length || 15;
  const totalBlocks = Object.keys(blockMap).length || 645;
  const totalImages = Object.values(blockMap).filter((b) => b.type === 'image' || b.image).length;
  const totalFormulas = Object.values(blockMap).filter((b) => b.type === 'formula' || (typeof b.content === 'string' && b.content.includes('$'))).length;
  const totalSections = artifacts.segments?.length || 11;
  const uncertainCount = questions.filter(q => q.status === 'NEEDS_TEACHER_REVIEW').length;

  // Validation Checks
  const validationErrors = [];
  questions.forEach(q => {
    if (!q.content?.trim()) {
      validationErrors.push(`Câu ${q.questionOrder}: Nội dung câu hỏi đang để trống.`);
    }
    if (q.type === 'MULTIPLE_CHOICE') {
      if (!q.options || q.options.length < 2) {
        validationErrors.push(`Câu ${q.questionOrder}: Cần ít nhất 2 phương án lựa chọn.`);
      }
      if (!q.correctAnswer) {
        validationErrors.push(`Câu ${q.questionOrder}: Chưa chọn đáp án đúng.`);
      }
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#090d16', color: '#f8fafc', overflow: 'hidden', fontFamily: "'Outfit', 'Inter', sans-serif" }}>
      {/* Top Header Workspace Bar */}
      <div style={{ height: '56px', padding: '0 24px', background: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', itemsCenter: 'center', justifyContent: 'space-between', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onCloseDetail}
            style={{ padding: '6px 14px', background: '#1e293b', color: '#e2e8f0', fontSize: '12px', fontWeight: 700, borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer' }}
          >
            ← Danh sách đề
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Teacher Review Studio: {activeSession?.fileName || 'Đề Thi Thử'}
            </h1>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              MinerU Parser + Gemini 2.5 Flash Block Mapping ({questions.length} câu hỏi)
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsDebugPanelOpen(true)}
            style={{ padding: '6px 14px', background: '#1e1b4b', color: '#a5b4fc', fontSize: '12px', fontWeight: 700, borderRadius: '8px', border: '1px solid #3730a3', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <HiTerminal style={{ color: '#818cf8' }} /> Pipeline Debugger (7 Tabs)
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#090d16', padding: '4px', borderRadius: '8px', border: '1px solid #1e293b', fontSize: '12px', fontFamily: 'monospace' }}>
            <button 
              disabled={undoStack.length === 0}
              onClick={handleUndo}
              style={{ padding: '4px 10px', borderRadius: '6px', background: 'transparent', color: undoStack.length === 0 ? '#475569' : '#cbd5e1', fontWeight: 700, border: 'none', cursor: undoStack.length === 0 ? 'not-allowed' : 'pointer' }}
              title="Undo (Ctrl+Z)"
            >
              ↩ Undo
            </button>
            <button 
              disabled={redoStack.length === 0}
              onClick={handleRedo}
              style={{ padding: '4px 10px', borderRadius: '6px', background: 'transparent', color: redoStack.length === 0 ? '#475569' : '#cbd5e1', fontWeight: 700, border: 'none', cursor: redoStack.length === 0 ? 'not-allowed' : 'pointer' }}
              title="Redo (Ctrl+Y)"
            >
              ↪ Redo
            </button>
          </div>

          <button
            onClick={() => onAutoSaveDraft && activeSession && onAutoSaveDraft(activeSession.id, questions)}
            style={{ padding: '6px 14px', background: '#1e293b', color: '#e2e8f0', fontSize: '12px', fontWeight: 700, borderRadius: '8px', border: '1px solid #334155', cursor: 'pointer' }}
          >
            💾 Lưu nháp (Ctrl+S)
          </button>
        </div>
      </div>

      {/* Processing Summary Banner */}
      <div style={{ height: '40px', padding: '0 24px', background: '#090d16', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'monospace' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f8fafc', fontWeight: 700 }}>
            <HiSparkles style={{ color: '#818cf8' }} /> PIPELINE METRICS:
          </span>
          <span>Trang: <strong style={{ color: '#ffffff' }}>{totalPages}</strong></span>
          <span>Tổng Khối: <strong style={{ color: '#ffffff' }}>{totalBlocks}</strong></span>
          <span>Hình ảnh: <strong style={{ color: '#fb923c' }}>{totalImages}</strong></span>
          <span>Công thức: <strong style={{ color: '#c084fc' }}>{totalFormulas}</strong></span>
          <span>Phân đoạn: <strong style={{ color: '#34d399' }}>{totalSections}</strong></span>
          <span>Câu AI: <strong style={{ color: '#818cf8' }}>{questions.length}</strong></span>
        </div>

        {uncertainCount > 0 && (
          <span style={{ background: '#451a03', color: '#fcd34d', border: '1px solid #78350f', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HiInformationCircle /> {uncertainCount} câu cần giáo viên xác nhận (Needs Review)
          </span>
        )}
      </div>

      {/* 3-PANEL MAIN WORKSPACE GRID (Side-by-Side Flex Layout) */}
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, height: 'calc(100vh - 96px)', overflow: 'hidden' }}>
        {/* LEFT PANEL: Original PDF Viewer (33.33% Width) */}
        <div style={{ width: '33.33%', height: '100%', overflow: 'hidden', borderRight: '1px solid #1e293b' }}>
          <PdfViewerPanel 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageImageUrl={activeSession?.filePath ? `/extracted_images/pdf_page_${currentPage}.png` : ''}
          />
        </div>

        {/* CENTER PANEL: Bounding Box Overlay Canvas (33.33% Width) */}
        <div style={{ width: '33.33%', height: '100%', overflow: 'hidden', borderRight: '1px solid #1e293b' }}>
          <BoundingBoxOverlayPanel 
            selectedQuestion={activeQuestion}
            blockMap={blockMap}
            activeBlockId={activeBlockId}
            onSelectBlock={handleSelectBlock}
            currentPage={currentPage}
          />
        </div>

        {/* RIGHT PANEL: Question Graph Editor (33.33% Width) */}
        <div style={{ width: '33.33%', height: '100%', overflow: 'hidden' }}>
          <QuestionGraphEditorPanel 
            questions={questions}
            activeQuestion={activeQuestion}
            onSelectQuestion={handleSelectQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onMergeQuestions={handleMergeQuestions}
            onSplitQuestion={handleSplitQuestion}
            onDuplicateQuestion={handleDuplicateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onConfirmPublish={() => onConfirmPublish && activeSession && onConfirmPublish(activeSession.id)}
            validationErrors={validationErrors}
            blockMap={blockMap}
            isStudentPreview={isStudentPreview}
            onTogglePreview={() => setIsStudentPreview(!isStudentPreview)}
          />
        </div>
      </div>

      {/* Pipeline Debugger Panel Modal */}
      <PipelineDebugPanel 
        isOpen={isDebugPanelOpen}
        onClose={() => setIsDebugPanelOpen(false)}
        sessionData={activeSession}
        onRerunStage={handleRerunStage}
        loading={loading}
      />
    </div>
  );
}
