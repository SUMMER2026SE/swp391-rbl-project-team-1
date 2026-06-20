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
    <div className="cm-card animate-in">
      <h3 className="cm-title">
        📥 Tài liệu học tập tải về
      </h3>

      <div className="cm-list">
        {materials.length > 0 ? (
          materials.map(mat => (
            <div key={mat.id} className="cm-item">
              <div className="cm-left">
                <span className="cm-icon">
                  {getIcon(mat.file_type)}
                </span>
                <div className="cm-info">
                  <h4 className="cm-item-title">
                    {mat.title}
                  </h4>
                  <span className="cm-meta">
                    Định dạng: {mat.file_type} • File Đính Kèm Học Liệu
                  </span>
                </div>
              </div>

              <button
                className="cm-btn"
                onClick={() => onDownload(mat)}
              >
                <HiDocumentDownload />
                Tải xuống
              </button>
            </div>
          ))
        ) : (
          <p style={{ fontSize: '12.5px', color: 'var(--stone-text-secondary)', textAlign: 'center', padding: '12px 0', margin: 0 }}>
            Bài giảng này chưa đính kèm tài liệu tải về.
          </p>
        )}
      </div>
    </div>
  );
}
