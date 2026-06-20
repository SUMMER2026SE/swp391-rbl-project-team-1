import React from 'react';

const TABS = [
  { id: 'All', label: 'Tất cả' },
  { id: 'BÁN CHẠY', label: 'Bán chạy' },
  { id: 'MỚI', label: 'Mới ra mắt' },
  { id: 'ĐỀ XUẤT', label: 'Đề xuất' },
  { id: 'MIỄN PHÍ', label: 'Miễn phí' }
];

export default function CourseTabBar({ activeTab, onSelectTab }) {
  return (
    <div className="course-tab-bar-container">
      <div className="course-tab-bar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`course-tab-btn ${isActive ? 'course-tab-btn--active' : ''}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
