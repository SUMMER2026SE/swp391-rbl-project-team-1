import React, { useState, useEffect, useRef } from 'react';
import { HiX } from 'react-icons/hi';

export default function DraggableFloatingWidget({
  title,
  icon: Icon,
  onClose,
  defaultPosition = { x: 100, y: 150 },
  width = '320px',
  children
}) {
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const widgetRef = useRef(null);

  // Load saved position from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem(`widget_pos_${title}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Verify loaded position is within current window bounds
        const x = Math.max(10, Math.min(window.innerWidth - 150, parsed.x));
        const y = Math.max(10, Math.min(window.innerHeight - 150, parsed.y));
        setPosition({ x, y });
      } catch (e) {
        // Fallback to default
      }
    }
  }, [title]);

  const handlePointerDown = (e) => {
    // Only start drag if clicking the header itself, not the close button or inputs
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) {
      return;
    }
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    
    // Set pointer capture to lock mouse movements to this element even if they drag outside
    e.target.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;

    let newX = e.clientX - dragStart.current.x;
    let newY = e.clientY - dragStart.current.y;

    // Boundary restriction to prevent dragging widget fully out of window
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      newX = Math.max(0, Math.min(window.innerWidth - rect.width, newX));
      newY = Math.max(0, Math.min(window.innerHeight - rect.height, newY));
    } else {
      newX = Math.max(0, Math.min(window.innerWidth - 100, newX));
      newY = Math.max(0, Math.min(window.innerHeight - 100, newY));
    }

    const nextPos = { x: newX, y: newY };
    setPosition(nextPos);
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      // Save last position to localStorage for convenience
      localStorage.setItem(`widget_pos_${title}`, JSON.stringify(position));
    }
  };

  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: width,
        zIndex: 2000,
      }}
      className="draggable-widget-container animate-in"
    >
      {/* Draggable Header */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`draggable-widget-header ${isDragging ? 'dragging' : ''}`}
      >
        <span className="draggable-widget-title">
          {Icon && <Icon className="draggable-widget-icon" />}
          {title}
        </span>
        <button 
          type="button" 
          onClick={onClose} 
          className="draggable-widget-close-btn"
          title="Đóng công cụ"
        >
          <HiX />
        </button>
      </div>

      {/* Widget Body Content */}
      <div className="draggable-widget-content">
        {children}
      </div>
    </div>
  );
}
