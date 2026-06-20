import React from 'react';
import { HiX, HiInformationCircle } from 'react-icons/hi';

export default function KeyboardShortcutsOverlay({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Space', 'Phím cách'], description: 'Phát / Tạm dừng video' },
    { keys: ['→', 'ArrowRight'], description: 'Tua tới 10 giây' },
    { keys: ['←', 'ArrowLeft'], description: 'Tua lùi 10 giây' },
    { keys: ['↑', 'ArrowUp'], description: 'Tăng âm lượng 10%' },
    { keys: ['↓', 'ArrowDown'], description: 'Giảm âm lượng 10%' },
    { keys: ['F'], description: 'Bật / Tắt chế độ toàn màn hình' },
    { keys: ['T'], description: 'Bật / Tắt chế độ rạp phim (Theater mode)' },
    { keys: ['M'], description: 'Tắt / Bật tiếng nhanh' },
  ];

  return (
    <div className="shortcuts-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="shortcuts-modal animate-scale-in" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shortcuts-modal-header">
          <div className="title-group">
            <HiInformationCircle className="keyboard-icon" />
            <h3>Phím tắt trình phát video</h3>
          </div>
          <button type="button" onClick={onClose} className="btn-close-shortcuts">
            <HiX />
          </button>
        </div>

        <div className="shortcuts-modal-body">
          <p className="shortcuts-intro-text">
            Sử dụng phím tắt giúp việc học tập và điều khiển trình phát video nhanh chóng, thuận tiện hơn.
          </p>

          <div className="shortcuts-grid">
            {shortcuts.map((shortcut, idx) => (
              <div key={idx} className="shortcut-row">
                <div className="keys-container">
                  {shortcut.keys.map((k, kIdx) => (
                    <span key={kIdx} className="kbd-key">
                      {k}
                    </span>
                  ))}
                </div>
                <div className="shortcut-description">
                  {shortcut.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="shortcuts-modal-footer">
          <button type="button" onClick={onClose} className="btn-confirm-close">
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
