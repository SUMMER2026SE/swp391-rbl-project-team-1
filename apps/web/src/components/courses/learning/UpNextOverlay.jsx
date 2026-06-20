import React, { useState, useEffect } from 'react';
import { HiPlay, HiX } from 'react-icons/hi';

export default function UpNextOverlay({ nextLessonName, onCountdownFinished, onCancel }) {
  const [seconds, setSeconds] = useState(10);

  useEffect(() => {
    if (seconds <= 0) {
      onCountdownFinished();
      return;
    }
    const timer = setTimeout(() => {
      setSeconds(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [seconds, onCountdownFinished]);

  return (
    <div className="up-next-overlay animate-in">
      <div className="up-next-overlay__content">
        <span className="up-next-overlay__subtitle">Bài học tiếp theo sẽ tự động phát sau</span>
        <div className="up-next-overlay__timer">{seconds}</div>
        <h3 className="up-next-overlay__title">{nextLessonName}</h3>
        
        <div className="up-next-overlay__buttons">
          <button type="button" onClick={onCountdownFinished} className="up-next-btn up-next-btn--play">
            <HiPlay /> Phát ngay
          </button>
          <button type="button" onClick={onCancel} className="up-next-btn up-next-btn--cancel">
            <HiX /> Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
