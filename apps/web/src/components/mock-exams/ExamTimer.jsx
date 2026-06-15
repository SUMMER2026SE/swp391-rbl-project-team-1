import React, { useEffect, useState } from 'react';

export default function ExamTimer({ durationMinutes, initialSeconds, onTimeUp, onSecondsChange }) {
  const [secondsLeft, setSecondsLeft] = useState(
    initialSeconds != null ? initialSeconds : durationMinutes * 60
  );

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev - 1;
        if (onSecondsChange) {
          onSecondsChange(next);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onTimeUp, onSecondsChange]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isWarning = secondsLeft < 300; // Warning at 5 minutes remaining

  return (
    <div className={`timer-container ${isWarning ? 'warning' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '18px' }}>⏱️</span>
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
      {isWarning && <span style={{ fontSize: '11px', color: 'var(--exams-red)', fontWeight: 'bold', marginLeft: '6px' }}>SẮP HẾT GIỜ!</span>}
    </div>
  );
}
