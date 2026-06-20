import React from 'react';
import { HiSparkles, HiArrowRight } from 'react-icons/hi';

export default function LearningPathEntry({ onNavigate }) {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate('/roadmap');
    } else {
      window.dispatchEvent(new CustomEvent('edupath-navigate', { detail: { path: '/roadmap' } }));
    }
  };

  return (
    <div className="learning-path-banner">
      <div className="learning-path-banner__left">
        <div className="learning-path-banner__badge">
          <HiSparkles className="learning-path-banner__badge-icon" /> Trải nghiệm Adaptive AI
        </div>
        <h2 className="learning-path-banner__title">
          Chưa biết bắt đầu học từ đâu?
        </h2>
        <p className="learning-path-banner__desc">
          Hãy để Cố vấn Học tập AI khảo sát năng lực đầu vào và tự động xây dựng lộ trình học tập cá nhân hóa phù hợp mục tiêu điểm số của em.
        </p>
        <button
          onClick={handleClick}
          className="learning-path-banner__btn"
        >
          Khám phá lộ trình học <HiArrowRight style={{ marginLeft: 4 }} />
        </button>
      </div>
      <div className="learning-path-banner__right">
        <div className="learning-path-banner__visual">
          <div className="learning-path-banner__floating-dot learning-path-banner__floating-dot--1" />
          <div className="learning-path-banner__floating-dot learning-path-banner__floating-dot--2" />
          <div className="learning-path-banner__visual-card">
            <strong>Lộ Trình Tối Ưu</strong>
            <span className="visual-tag math">Môn Toán</span>
            <div className="visual-chart">
              <div className="visual-chart__bar visual-chart__bar--1" />
              <div className="visual-chart__bar visual-chart__bar--2" />
              <div className="visual-chart__bar visual-chart__bar--3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
