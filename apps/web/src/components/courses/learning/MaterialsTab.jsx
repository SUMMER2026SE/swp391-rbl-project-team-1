import React, { useState } from 'react';
import { HiDocumentText, HiDownload, HiCheckCircle } from 'react-icons/hi';
import { FiZoomIn, FiZoomOut, FiMoon, FiSun } from 'react-icons/fi';

export default function MaterialsTab({ materials = [] }) {
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0] || null);
  const [zoom, setZoom] = useState(100);
  const [darkMode, setDarkMode] = useState(false);
  const [completedMats, setCompletedMats] = useState(new Set());

  const handleToggleCompleted = (id) => {
    setCompletedMats(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
      }
      return copy;
    });
  };

  const handleZoomIn = () => setZoom(prev => Math.min(200, prev + 10));
  const handleZoomOut = () => setZoom(prev => Math.max(50, prev - 10));
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const activeMat = selectedMaterial || materials[0];

  return (
    <div className="materials-tab">
      <div className="materials-tab__list-col">
        <h4 className="materials-title">Tài liệu ôn tập</h4>
        <div className="materials-items">
          {materials.map((mat) => {
            const isSelected = activeMat?.id === mat.id;
            const isCompleted = completedMats.has(mat.id);

            return (
              <div
                key={mat.id}
                onClick={() => setSelectedMaterial(mat)}
                className={`material-item ${isSelected ? 'material-item--selected' : ''}`}
              >
                <div className="material-item__left">
                  <HiDocumentText className="material-icon" />
                  <div className="material-item__info">
                    <span className="material-name" title={mat.title}>{mat.title}</span>
                    <span className="material-type">{mat.file_type || 'PDF'}</span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCompleted(mat.id);
                  }}
                  className={`material-complete-btn ${isCompleted ? 'material-complete-btn--active' : ''}`}
                  title="Đánh dấu đã đọc"
                >
                  <HiCheckCircle />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="materials-tab__viewer-col">
        {activeMat ? (
          <div className={`material-viewer ${darkMode ? 'material-viewer--dark' : ''}`}>
            <div className="material-viewer__toolbar">
              <div className="toolbar-left">
                <span className="viewer-filename">{activeMat.title}</span>
              </div>
              <div className="toolbar-right">
                <button type="button" onClick={handleZoomOut} className="toolbar-btn" title="Thu nhỏ">
                  <FiZoomOut />
                </button>
                <span className="zoom-level">{zoom}%</span>
                <button type="button" onClick={handleZoomIn} className="toolbar-btn" title="Phóng to">
                  <FiZoomIn />
                </button>
                <button type="button" onClick={toggleDarkMode} className="toolbar-btn" title="Chế độ tối">
                  {darkMode ? <FiSun /> : <FiMoon />}
                </button>
                <a
                  href={activeMat.file_url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="toolbar-btn"
                  title="Tải xuống tài liệu"
                >
                  <HiDownload />
                </a>
              </div>
            </div>

            <div className="material-viewer__viewport-container">
              <div className="material-viewer__viewport" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                <iframe
                  src={activeMat.file_url || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#toolbar=0"}
                  title={activeMat.title}
                  className="viewer-iframe"
                  style={{ filter: darkMode ? 'invert(0.9) hue-rotate(180deg)' : 'none' }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="material-viewer__empty">
            <HiDocumentText className="empty-icon" />
            <p>Vui lòng chọn một tài liệu ở cột bên trái để hiển thị</p>
          </div>
        )}
      </div>
    </div>
  );
}
