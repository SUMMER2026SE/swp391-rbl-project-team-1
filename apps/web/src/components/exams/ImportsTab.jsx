import React, { useState, useEffect } from 'react';
import { 
  HiSparkles, 
  HiPhotograph,
  HiCheckCircle,
  HiExclamationCircle,
  HiRefresh
} from 'react-icons/hi';
import { api } from '../../api';
import TeacherReviewStudio from './TeacherReviewStudio';
import TeacherReviewStudioV3 from './v3/TeacherReviewStudioV3';

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
  const [uploading, setUploading] = useState(false);
  const [isV3Pipeline, setIsV3Pipeline] = useState(true);

  // Auto-refresh sessions when processing silently in background
  useEffect(() => {
    let timer;
    const hasProcessing = sessions.some((s) => s.status === 'PROCESSING');
    if (hasProcessing) {
      timer = setInterval(() => {
        const refreshEvent = new CustomEvent('refresh-import-sessions', { detail: { showLoading: false } });
        window.dispatchEvent(refreshEvent);
        
        if (activeSession && activeSession.status === 'PROCESSING') {
          onViewDetail(activeSession.id, false);
        }
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [sessions, activeSession]);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      if (isV3Pipeline) {
        const session = await api.uploadImportDocumentV3(selectedFile);
        window.dispatchEvent(new CustomEvent('refresh-import-sessions', { detail: { showLoading: false } }));
        if (session && session.id) {
          onViewDetail(session.id, false);
        }
      } else {
        await onUpload(selectedFile);
        window.dispatchEvent(new CustomEvent('refresh-import-sessions', { detail: { showLoading: false } }));
      }
    } catch (err) {
      console.error('[Import Upload Error]', err);
      alert(err.message || 'Lỗi tải tệp đề thi!');
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleAutoSaveDraft = async (sessionId, questions) => {
    try {
      await fetch(`${API_BASE}/api/v1/import-v2/session/${sessionId}/auto-save`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions })
      });
    } catch (e) {
      console.warn('[AutoSave] Failed to auto save draft:', e);
    }
  };

  const isV3Session = Boolean(activeSession?.media?.pipelineArtifactsV3);

  // Deduces step number and description for real-time table badge
  const getLiveProgressInfo = (logs = []) => {
    const steps = [
      { name: 'Khởi tạo phiên V3', key: 'Step 1' },
      { name: 'Render ảnh PDF', key: 'Step 2' },
      { name: 'Nhận diện ranh giới câu hỏi', key: 'Step 3' },
      { name: 'Cắt ảnh câu hỏi & ghép trang', key: 'Step 4' },
      { name: 'Bóc tách LaTeX (Gemini Vision)', key: 'Step 5' },
      { name: 'Xây dựng sơ đồ câu hỏi', key: 'Step 6' },
      { name: 'Chuẩn bị Review Studio', key: 'Step 7' }
    ];
    let completed = 0;
    steps.forEach((s) => {
      if (logs.some(l => l.message?.toLowerCase().includes(s.key.toLowerCase()) || l.details?.toLowerCase().includes(s.key.toLowerCase()))) {
        completed++;
      }
    });
    const currentStepIdx = Math.min(completed + 1, steps.length);
    const activeStep = steps[currentStepIdx - 1] || steps[0];
    const percent = Math.round((completed / steps.length) * 100);
    return { stepNum: currentStepIdx, totalSteps: steps.length, stepName: activeStep.name, percent };
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', width: '100%', color: '#0f172a', padding: '32px 24px' }}>
      {/* Render active review studio if reviewing/completed */}
      {activeSession && activeSession.status !== 'PROCESSING' && activeSession.status !== 'FAILED' ? (
        isV3Session ? (
          /* ==================== TEACHER REVIEW STUDIO V3 (IMAGE FIRST) ==================== */
          <TeacherReviewStudioV3
            activeSession={activeSession}
            onCloseDetail={onCloseDetail}
            onConfirmPublish={onConfirm}
          />
        ) : (
          /* ==================== TEACHER REVIEW STUDIO V2 ==================== */
          <TeacherReviewStudio 
            activeSession={activeSession}
            onCloseDetail={onCloseDetail}
            onConfirmPublish={onConfirm}
            onAutoSaveDraft={handleAutoSaveDraft}
          />
        )
      ) : (
        /* ==================== IMPORT V3 DASHBOARD UPLOADER (LIGHT THEME) ==================== */
        <div style={{ maxWidth: '1050px', margin: '0 auto', width: '100%' }}>
          {/* Uploader Card */}
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '24px', 
            padding: '36px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px', 
            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' 
          }}>
            <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
              <span style={{ 
                background: '#eef2ff', 
                color: '#4f46e5', 
                fontWeight: 800, 
                fontSize: '12px', 
                padding: '6px 16px', 
                borderRadius: '20px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                border: '1px solid #c7d2fe' 
              }}>
                <HiPhotograph /> IMPORT V3 - IMAGE FIRST PIPELINE (GEMINI 2.5 FLASH VISION)
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '14px 0 8px 0', letterSpacing: '-0.02em' }}>
                Tải Đề Thi PDF / DOCX - Cắt Ảnh & Bóc Tách Tự Động
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                Quy trình Import V3: Render ảnh trang PDF $\rightarrow$ Nhận diện ranh giới $\rightarrow$ Cắt ảnh từng câu hỏi $\rightarrow$ Gemini Vision API bóc tách công thức LaTeX & JSON tự động.
              </p>
            </div>

            {/* Native Label Dropzone */}
            <label 
              htmlFor="v3-file-input"
              style={{ 
                border: '2px dashed #cbd5e1', 
                borderRadius: '20px', 
                padding: '36px 20px', 
                textAlign: 'center', 
                background: selectedFile ? '#f5f3ff' : '#f8fafc', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '16px', 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <input 
                type="file" 
                id="v3-file-input" 
                onChange={onFileChange} 
                accept=".pdf,.docx,.doc" 
                style={{ display: 'none' }} 
              />

              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '16px', 
                background: '#e0e7ff', 
                color: '#4f46e5', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '32px' 
              }}>
                📸
              </div>

              <div>
                <span style={{
                  padding: '10px 24px',
                  background: '#4f46e5',
                  color: '#ffffff',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '800',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
                  display: 'inline-block'
                }}>
                  {selectedFile ? `📁 Tệp đã chọn: ${selectedFile.name}` : '☁️ Chọn tệp đề thi từ máy tính (.pdf, .docx, .doc)'}
                </span>
              </div>

              {selectedFile ? (
                <div style={{ background: '#ddd6fe', color: '#4c1d95', padding: '6px 18px', borderRadius: '16px', fontSize: '13px', fontWeight: '700' }}>
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              ) : (
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>Hỗ trợ tệp định dạng .PDF, .DOCX hoặc .DOC (Nhấp vào khung để chọn tệp)</span>
              )}
            </label>

            <button 
              onClick={handleStartUpload} 
              disabled={!selectedFile || uploading || loading} 
              style={{
                alignSelf: 'center',
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13px',
                borderRadius: '30px',
                border: 'none',
                boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.4)',
                cursor: selectedFile && !uploading && !loading ? 'pointer' : 'not-allowed',
                opacity: selectedFile && !uploading && !loading ? 1 : 0.5,
                transition: 'all 0.2s ease'
              }}
            >
              🚀 {uploading || loading ? 'Đang xử lý qua Import V3 Image-First Pipeline...' : 'Bắt đầu Cắt Ảnh & Phân Tách Với Gemini Vision V3'}
            </button>
          </div>

          {/* History Table Container */}
          <div style={{ marginTop: '36px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📑 Lịch sử nhập đề thi (Import V3 & V2)</span>
            </h3>
            
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569' }}>
                    <th style={{ padding: '14px 20px', fontWeight: '700' }}>Tên tệp đề thi</th>
                    <th style={{ padding: '14px 20px', fontWeight: '700', width: '42%' }}>Trạng thái tiến trình</th>
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
                    sessions.map((session) => {
                      const liveInfo = getLiveProgressInfo(session.logs || []);

                      return (
                        <tr key={session.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          {/* File Name */}
                          <td style={{ padding: '16px 20px', fontWeight: '700', color: '#0f172a' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>📄</span>
                              <span>{session.fileName}</span>
                            </div>
                          </td>

                          {/* Live Status Column */}
                          <td style={{ padding: '16px 20px' }}>
                            {session.status === 'PROCESSING' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span style={{ 
                                    background: '#fef3c7', 
                                    color: '#b45309', 
                                    padding: '4px 12px', 
                                    borderRadius: '12px', 
                                    fontWeight: '700', 
                                    fontSize: '12px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    border: '1px solid #fde68a'
                                  }}>
                                    <span style={{ animation: 'spin 1.5s linear infinite', display: 'inline-block' }}>⏳</span>
                                    <span>Bước {liveInfo.stepNum}/{liveInfo.totalSteps}: {liveInfo.stepName}</span>
                                  </span>
                                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#d97706' }}>
                                    {liveInfo.percent}%
                                  </span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: '#fef3c7', borderRadius: '3px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${liveInfo.percent}%`, background: '#f59e0b', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                                </div>
                              </div>
                            )}

                            {session.status === 'REVIEWING' && (
                              <span style={{ 
                                background: '#e0e7ff', 
                                color: '#4338ca', 
                                padding: '4px 12px', 
                                borderRadius: '12px', 
                                fontWeight: '700', 
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                border: '1px solid #c7d2fe'
                              }}>
                                <HiSparkles /> Chờ kiểm duyệt V3
                              </span>
                            )}

                            {session.status === 'COMPLETED' && (
                              <span style={{ 
                                background: '#d1fae5', 
                                color: '#047857', 
                                padding: '4px 12px', 
                                borderRadius: '12px', 
                                fontWeight: '700', 
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                border: '1px solid #a7f3d0'
                              }}>
                                <HiCheckCircle /> Đã xuất bản vào Ngân hàng Đề
                              </span>
                            )}

                            {session.status === 'FAILED' && (
                              <span style={{ 
                                background: '#fee2e2', 
                                color: '#b91c1c', 
                                padding: '4px 12px', 
                                borderRadius: '12px', 
                                fontWeight: '700', 
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                border: '1px solid #fca5a5'
                              }}>
                                <HiExclamationCircle /> Thất bại (Lỗi bóc tách)
                              </span>
                            )}
                          </td>

                          {/* Time */}
                          <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '12.5px' }}>
                            {new Date(session.createdAt).toLocaleString('vi-VN')}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            {(session.status === 'REVIEWING' || session.status === 'COMPLETED') && (
                              <button
                                onClick={() => onViewDetail(session.id)}
                                style={{
                                  padding: '6px 14px',
                                  background: '#4f46e5',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  marginRight: '8px',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)'
                                }}
                              >
                                {session.status === 'COMPLETED' ? '🔍 Xem đề' : '✏️ Teacher Review Studio V3'}
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteSession(session.id)}
                              style={{
                                padding: '6px 12px',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fca5a5',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ImportsTab;

