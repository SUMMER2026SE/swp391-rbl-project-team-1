import React, { useEffect, useState, useRef } from 'react';

export default function ExamTimer({ durationMinutes, initialSeconds, examId, onTimeUp }) {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (examId) {
      const saved = localStorage.getItem(`exam_taking_seconds_${examId}`);
      if (saved) return parseInt(saved, 10);
    }
    return initialSeconds != null ? initialSeconds : (durationMinutes || 90) * 60;
  });

  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => { onTimeUpRef.current = onTimeUp; }, [onTimeUp]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimeUpRef.current) onTimeUpRef.current();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev - 1;
        if (examId) {
          localStorage.setItem(`exam_taking_seconds_${examId}`, next);
        }
        if (next <= 0) {
          clearInterval(timer);
          if (onTimeUpRef.current) onTimeUpRef.current();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examId]);

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
