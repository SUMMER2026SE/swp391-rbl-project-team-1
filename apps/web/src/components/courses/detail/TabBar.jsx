import React from 'react';
import { 
  HiInformationCircle, 
  HiBookOpen, 
  HiAcademicCap, 
  HiStar, 
  HiQuestionMarkCircle 
} from 'react-icons/hi';

export default function TabBar({ activeTab, setActiveTab, lessonCount, reviewCount }) {
  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: HiInformationCircle },
    { id: 'curriculum', label: 'Giáo trình', icon: HiBookOpen, badge: lessonCount },
    { id: 'instructor', label: 'Giảng viên', icon: HiAcademicCap },
    { id: 'reviews', label: 'Đánh giá', icon: HiStar, badge: reviewCount },
    { id: 'faq', label: 'FAQ', icon: HiQuestionMarkCircle },
  ];

  return (
    <div className="detail-tabs-header" role="tablist">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            className={`detail-tab-btn ${isActive ? 'detail-tab-btn--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <IconComponent size={18} className="tab-icon" />
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="tab-badge" style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '10px',
                background: isActive ? 'var(--primary-bg, #F0EDFF)' : '#F4F6FA',
                color: isActive ? 'var(--primary, #6C5CE7)' : 'var(--text-secondary, #636E72)',
                fontWeight: '800',
                marginLeft: '2px'
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
