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

function fixFileNameEncoding(fileName) {
  if (!fileName) return '';
  try {
    if (/[\u00C0-\u00FF]/.test(fileName)) {
      const bytes = Uint8Array.from([...fileName].map(c => c.charCodeAt(0) & 0xff));
      const decoded = new TextDecoder('utf-8').decode(bytes);
      if (decoded && !decoded.includes('\uFFFD')) {
        return decoded;
      }
    }
  } catch (e) {}
  return fileName;
}

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
  const [loadingSessionId, setLoadingSessionId] = useState(null);

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
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'pdf') {
        alert('Hệ thống hiện tại chỉ hỗ trợ định dạng tệp .PDF! Vui lòng chọn tệp .PDF.');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
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
      if (err.status === 401 || (err.message && (err.message.includes('JWT') || err.message.includes('xác thực')))) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại tài khoản Giáo viên!');
        window.dispatchEvent(new CustomEvent('edupath-auth-logout'));
      } else {
        alert(err.message || 'Lỗi tải tệp đề thi!');
      }
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
        /* ==================== 2-COLUMN SPLIT DASHBOARD LAYOUT ==================== */
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)', gap: '24px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: HISTORY SESSIONS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📋 Lịch sử các phiên nhập đề thi</span>
              </h3>
              <span style={{ background: '#e0e7ff', color: '#4338ca', fontWeight: 800, fontSize: '12px', padding: '3px 10px', borderRadius: '12px' }}>
                {sessions.length} phiên
              </span>
            </div>
            
            {sessions.length === 0 ? (
              <div style={{ 
                background: '#ffffff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '20px', 
                padding: '48px 24px', 
                textAlign: 'center', 
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)' 
              }}>
                <div style={{ fontSize: '42px', marginBottom: '12px' }}>📋</div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 750, color: '#1e293b' }}>Chưa có đề thi nào trong lịch sử</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                  Hãy tải tệp đề thi đầu tiên ở khung bên phải để hệ thống tự động bóc tách!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sessions.map((session) => {
                  const liveInfo = getLiveProgressInfo(session.logs || []);

                  return (
                    <div 
                      key={session.id} 
                      style={{ 
                        background: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '16px', 
                        padding: '18px 20px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Card Header: File Name & Time */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0 }}>
                          <span style={{ fontSize: '22px', lineHeight: 1 }}>📄</span>
                          <div style={{ minWidth: 0 }}>
                            <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {fixFileNameEncoding(session.fileName)}
                            </h4>
                            <span style={{ fontSize: '11.5px', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                              {new Date(session.createdAt).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div style={{ flexShrink: 0 }}>
                          {session.status === 'PROCESSING' && (
                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontWeight: '800', fontSize: '11.5px', border: '1px solid #fde68a' }}>
                              ⏳ Bước {liveInfo.stepNum}/7
                            </span>
                          )}
                          {session.status === 'REVIEWING' && (
                            <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '12px', fontWeight: '800', fontSize: '11.5px', border: '1px solid #c7d2fe' }}>
                              <HiSparkles /> Sẵn sàng duyệt
                            </span>
                          )}
                          {session.status === 'COMPLETED' && (
                            <span style={{ background: '#d1fae5', color: '#047857', padding: '4px 10px', borderRadius: '12px', fontWeight: '800', fontSize: '11.5px', border: '1px solid #a7f3d0' }}>
                              <HiCheckCircle /> Đã xuất bản
                            </span>
                          )}
                          {session.status === 'FAILED' && (
                            <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontWeight: '800', fontSize: '11.5px', border: '1px solid #fca5a5' }}>
                              <HiExclamationCircle /> Lỗi bóc tách
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Processing Progress Bar if Processing */}
                      {session.status === 'PROCESSING' && (
                        <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                            <span>{liveInfo.stepName}</span>
                            <span style={{ color: '#d97706' }}>{liveInfo.percent}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#fef3c7', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${liveInfo.percent}%`, background: '#f59e0b', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                          </div>
                        </div>
                      )}

                      {/* Actions Footer */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                        {(session.status === 'REVIEWING' || session.status === 'COMPLETED') && (
                          <button
                            disabled={loadingSessionId === session.id}
                            onClick={async () => {
                              try {
                                setLoadingSessionId(session.id);
                                await onViewDetail(session.id, true);
                              } finally {
                                setLoadingSessionId(null);
                              }
                            }}
                            style={{
                              padding: '7px 16px',
                              background: loadingSessionId === session.id ? '#818cf8' : '#4f46e5',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '10px',
                              fontSize: '12px',
                              fontWeight: '800',
                              cursor: loadingSessionId === session.id ? 'wait' : 'pointer',
                              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
                              opacity: loadingSessionId === session.id ? 0.7 : 1
                            }}
                          >
                            {loadingSessionId === session.id 
                              ? '⏳ Đang mở...' 
                              : (session.status === 'COMPLETED' ? '🔍 Xem đề thi' : '✏️ Kiểm duyệt & chỉnh sửa')}
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteSession(session.id)}
                          style={{
                            padding: '7px 14px',
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fca5a5',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: UPLOADER CARD */}
          <div style={{ 
            background: '#ffffff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '24px', 
            padding: '30px 24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px', 
            boxShadow: '0 8px 30px -4px rgba(79, 70, 229, 0.06)',
            position: 'sticky',
            top: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ 
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', 
                color: '#4338ca', 
                fontWeight: 800, 
                fontSize: '11.5px', 
                padding: '5px 14px', 
                borderRadius: '20px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                border: '1px solid #c7d2fe',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.08)'
              }}>
                <HiSparkles style={{ fontSize: '14px', color: '#6366f1' }} /> CÔNG NGHỆ AI VISION
              </span>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '14px 0 8px 0', letterSpacing: '-0.02em' }}>
                Tải Đề Thi Lên AI
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                Hệ thống tự động phân tích cấu trúc đề thi, cắt ảnh câu hỏi và nhận diện đáp án, công thức chỉ trong vài giây.
              </p>
            </div>

            {/* Native Label Dropzone */}
            <label 
              htmlFor="v3-file-input"
              style={{ 
                border: selectedFile ? '2px dashed #818cf8' : '2px dashed #cbd5e1', 
                borderRadius: '18px', 
                padding: '32px 16px', 
                textAlign: 'center', 
                background: selectedFile ? 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)' : '#f8fafc', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '14px', 
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            >
              <input 
                type="file" 
                id="v3-file-input" 
                onChange={onFileChange} 
                accept=".pdf,application/pdf" 
                style={{ display: 'none' }} 
              />

              <div style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '18px', 
                background: selectedFile ? '#dbeafe' : '#e0e7ff', 
                color: '#4f46e5', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '28px',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.12)'
              }}>
                📄
              </div>

              <div>
                <span style={{
                  padding: '10px 22px',
                  background: '#4f46e5',
                  color: '#ffffff',
                  borderRadius: '12px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
                  display: 'inline-block'
                }}>
                  {selectedFile ? `📁 Tệp đã chọn: ${selectedFile.name}` : '☁️ Chọn tệp đề thi PDF (.pdf)'}
                </span>
              </div>

              {selectedFile ? (
                <div style={{ background: '#ddd6fe', color: '#4c1d95', padding: '5px 16px', borderRadius: '14px', fontSize: '12px', fontWeight: '700' }}>
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              ) : (
                <span style={{ fontSize: '12px', color: '#64748b' }}>Chỉ hỗ trợ tệp định dạng .PDF (Kéo thả hoặc nhấp vào đây để chọn tệp)</span>
              )}
            </label>

            <button 
              onClick={handleStartUpload} 
              disabled={!selectedFile || uploading || loading} 
              style={{
                width: '100%',
                padding: '13px 24px',
                background: selectedFile && !uploading && !loading 
                  ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' 
                  : '#94a3b8',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '13.5px',
                borderRadius: '14px',
                border: 'none',
                boxShadow: selectedFile && !uploading && !loading ? '0 8px 24px -4px rgba(79, 70, 229, 0.4)' : 'none',
                cursor: selectedFile && !uploading && !loading ? 'pointer' : 'not-allowed',
                opacity: selectedFile && !uploading && !loading ? 1 : 0.6,
                transition: 'all 0.25s ease'
              }}
            >
              🚀 {uploading || loading ? 'Đang tự động bóc tách đề thi...' : 'Bắt đầu Bóc Tách Đề Thi Tự Động'}
            </button>
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

