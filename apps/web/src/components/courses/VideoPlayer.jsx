import { useState, useEffect } from 'react';

export default function VideoPlayer({ videoUrl, title, onEnded }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
  }, [videoUrl]);

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        background: '#000', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        aspectRatio: '16/9'
      }}
      className="animate-in"
    >
      {loading && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, left: 0, right: 0, bottom: 0, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            background: '#111', color: '#fff', zIndex: 1 
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px', animation: 'spin 2s linear infinite' }}>⏳</span>
            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Đang tải bài giảng...</span>
          </div>
        </div>
      )}

      <video
        key={videoUrl}
        src={videoUrl}
        controls
        autoPlay
        onLoadedData={() => setLoading(false)}
        onEnded={onEnded}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
}
