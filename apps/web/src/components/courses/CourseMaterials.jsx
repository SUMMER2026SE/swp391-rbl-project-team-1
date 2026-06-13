import { HiDocumentDownload, HiDocumentText, HiPresentationChartBar } from 'react-icons/hi';

export default function CourseMaterials({ materials, onDownload }) {
  const getIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <HiDocumentText style={{ color: '#EF4444', fontSize: '20px' }} />;
      case 'slide':
      case 'ppt': return <HiPresentationChartBar style={{ color: '#F59E0B', fontSize: '20px' }} />;
      default: return <HiDocumentText style={{ color: '#3B82F6', fontSize: '20px' }} />;
    }
  };

  return (
    <div className="card animate-in" style={{ padding: '20px', borderRadius: '16px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        📥 TÀI LIỆU HỌC TẬP TẢI VỀ
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {materials.length > 0 ? (
          materials.map(mat => (
            <div 
              key={mat.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: 'var(--bg-main)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {getIcon(mat.file_type)}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                    {mat.title}
                  </h4>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Định dạng: {mat.file_type} • File Đính Kèm Học Liệu
                  </span>
                </div>
              </div>

              <button
                className="btn-outline"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  borderColor: 'var(--border)',
                  color: 'var(--primary)',
                  background: '#fff',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => onDownload(mat)}
              >
                <HiDocumentDownload />
                Tải xuống
              </button>
            </div>
          ))
        ) : (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '12px 0' }}>Bài giảng này chưa đính kèm tài liệu tải về.</p>
        )}
      </div>
    </div>
  );
}
