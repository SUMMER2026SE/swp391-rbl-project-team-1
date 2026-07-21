import React from 'react';
import { 
  HiCheckCircle, 
  HiExclamationCircle, 
  HiSparkles, 
  HiRefresh,
  HiX
} from 'react-icons/hi';

export default function ImportProgressTracker({
  sessionLogs = [],
  sessionStatus = 'PROCESSING',
  fileName = '',
  onRetryPipeline,
  onOpenReviewStudio,
  onClose
}) {
  const steps = [
    { id: 'upload', name: '1. Khởi tạo phiên Import V3', key: 'Step 1' },
    { id: 'mineru', name: '2. Render ảnh trang PDF (MinerU)', key: 'Step 2' },
    { id: 'boundary', name: '3. Nhận diện ranh giới câu hỏi (Boundary Detector)', key: 'Step 3' },
    { id: 'crop', name: '4. Cắt ảnh câu hỏi & ghép trang (Crop Generator)', key: 'Step 4' },
    { id: 'vision', name: '5. Bóc tách Văn bản & LaTeX (Gemini Vision)', key: 'Step 5' },
    { id: 'graph', name: '6. Xây dựng sơ đồ câu hỏi', key: 'Step 6' },
    { id: 'studio', name: '7. Chuẩn bị Review Studio V3', key: 'Step 7' }
  ];

  // Helper to deduce step status from live server logs
  const getStepState = (stepKey) => {
    const matchedLog = sessionLogs.find(l => 
      l.message?.toLowerCase().includes(stepKey.toLowerCase()) || 
      l.details?.toLowerCase().includes(stepKey.toLowerCase())
    );

    if (sessionStatus === 'FAILED' && matchedLog?.level === 'ERROR') {
      return { status: 'FAILED', time: 'Lỗi', message: matchedLog.message };
    }

    if (matchedLog) {
      return { status: 'SUCCESS', time: 'Đã xong', message: matchedLog.message };
    }

    if (sessionStatus === 'PROCESSING') {
      const lastLog = sessionLogs[sessionLogs.length - 1];
      if (lastLog && (lastLog.message?.toLowerCase().includes(stepKey.toLowerCase()))) {
        return { status: 'RUNNING', time: 'Đang xử lý...', message: lastLog.message };
      }
    }

    if (sessionStatus === 'REVIEWING' || sessionStatus === 'COMPLETED') {
      return { status: 'SUCCESS', time: 'Hoàn tất' };
    }

    return { status: 'PENDING', time: 'Chờ xử lý' };
  };

  const completedCount = steps.filter(s => getStepState(s.key).status === 'SUCCESS').length;
  const currentStepIndex = Math.min(completedCount + 1, steps.length);
  const activeStepObj = steps[currentStepIndex - 1] || steps[0];
  const progressPercent = sessionStatus === 'REVIEWING' || sessionStatus === 'COMPLETED'
    ? 100 
    : Math.round((completedCount / steps.length) * 100);

  const failedLog = sessionLogs.find(l => l.level === 'ERROR');

  return (
    /* Fixed Modal Overlay Backdrop */
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      {/* Floating Popup Modal Window */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '24px',
          padding: '28px 24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(99, 102, 241, 0.15)',
          color: '#f8fafc',
          textAlign: 'center'
        }}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px'
            }}
            title="Đóng cửa sổ"
          >
            ✕
          </button>
        )}

        {/* Modal Badge Icon */}
        <div 
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            background: sessionStatus === 'FAILED' ? '#450a0a' : '#1e1b4b',
            border: `1px solid ${sessionStatus === 'FAILED' ? '#991b1b' : '#4338ca'}`,
            color: sessionStatus === 'FAILED' ? '#fca5a5' : '#818cf8',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.3)'
          }}
        >
          {sessionStatus === 'PROCESSING' ? (
            <div style={{
              width: '26px',
              height: '26px',
              border: '3px solid #818cf8',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : sessionStatus === 'FAILED' ? (
            <HiExclamationCircle style={{ width: '32px', height: '32px' }} />
          ) : (
            <HiSparkles style={{ width: '32px', height: '32px' }} />
          )}
        </div>

        {/* Modal Title */}
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
          {sessionStatus === 'FAILED' ? 'CẢNH BÁO LỖI TIẾN TRÌNH V3' : 'TIẾN TRÌNH PHÂN TÁCH ĐỀ THI V3'}
        </h3>

        {fileName && (
          <p style={{ fontSize: '12px', color: '#818cf8', fontWeight: 700, margin: '6px 0 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            📄 {fileName}
          </p>
        )}

        {/* Current Active Step Box */}
        <div style={{
          background: '#090d16',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '14px 16px',
          margin: '18px 0',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
              {sessionStatus === 'REVIEWING' || sessionStatus === 'COMPLETED' ? 'HOÀN TẤT 100%' : `ĐANG XỬ LÝ: BƯỚC ${currentStepIndex}/${steps.length}`}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#6366f1' }}>
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: sessionStatus === 'FAILED' ? '#ef4444' : 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
              borderRadius: '4px',
              transition: 'width 0.4s ease'
            }} />
          </div>

          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {sessionStatus === 'PROCESSING' && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', display: 'inline-block', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
            )}
            <span>{sessionStatus === 'REVIEWING' || sessionStatus === 'COMPLETED' ? 'Đã hoàn tất phân tách! Đang mở Review Studio...' : activeStepObj.name}</span>
          </div>
        </div>

        {/* Compact Steps List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', marginBottom: '20px', maxHeight: '160px', overflowY: 'auto' }}>
          {steps.map((step) => {
            const state = getStepState(step.key);
            const isSuccess = state.status === 'SUCCESS';
            const isRunning = state.status === 'RUNNING';
            const isFailed = state.status === 'FAILED';

            return (
              <div 
                key={step.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: isRunning ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: isRunning ? '1px solid #4f46e5' : '1px solid transparent',
                  fontSize: '11.5px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isSuccess ? '#34d399' : isRunning ? '#a5b4fc' : isFailed ? '#fca5a5' : '#64748b' }}>
                  <span>{isSuccess ? '✓' : isRunning ? '⏳' : isFailed ? '✕' : '○'}</span>
                  <span style={{ fontWeight: isRunning ? 700 : 500 }}>{step.name}</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>{state.time}</span>
              </div>
            );
          })}
        </div>

        {/* Failure Message */}
        {sessionStatus === 'FAILED' && (
          <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: '12px', padding: '12px', marginBottom: '16px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            <p style={{ fontSize: '11px', color: '#fca5a5', margin: 0, fontFamily: 'monospace' }}>
              {failedLog?.details || failedLog?.message || 'Lỗi bóc tách đề thi!'}
            </p>
            <button
              onClick={onRetryPipeline}
              style={{ marginTop: '10px', width: '100%', padding: '8px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
            >
              🔄 Thử lại Pipeline (Retry)
            </button>
          </div>
        )}

        {/* Action Button Footer */}
        {(sessionStatus === 'REVIEWING' || sessionStatus === 'COMPLETED') ? (
          <button
            onClick={onOpenReviewStudio}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 10px 20px -5px rgba(79, 70, 229, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            ✨ Mở Teacher Review Studio V3 Ngay →
          </button>
        ) : sessionStatus === 'PROCESSING' ? (
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '11px',
              background: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Ẩn tiến trình & quay lại danh sách
          </button>
        ) : null}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}


