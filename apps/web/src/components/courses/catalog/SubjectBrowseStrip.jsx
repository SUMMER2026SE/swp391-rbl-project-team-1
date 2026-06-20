import React from 'react';
import { HiBookOpen, HiTranslate, HiCalculator, HiLightBulb, HiBeaker, HiGlobeAlt } from 'react-icons/hi';

const SUBJECT_ITEMS = [
  { name: 'Toán', label: 'Toán học', icon: HiCalculator, count: '12 khóa học', color: 'math' },
  { name: 'Vật lý', label: 'Vật lý', icon: HiLightBulb, count: '8 khóa học', color: 'physics' },
  { name: 'Hóa học', label: 'Hóa học', icon: HiBeaker, count: '6 khóa học', color: 'chemistry' },
  { name: 'Sinh học', label: 'Sinh học', icon: HiGlobeAlt, count: '4 khóa học', color: 'biology' },
  { name: 'Tiếng Anh', label: 'Tiếng Anh', icon: HiTranslate, count: '10 khóa học', color: 'english' },
  { name: 'Ngữ văn', label: 'Ngữ văn', icon: HiBookOpen, count: '5 khóa học', color: 'literature' }
];

export default function SubjectBrowseStrip({ activeSubject, onSelectSubject }) {
  return (
    <div className="subject-browse-section">
      <h2 className="catalog-section-title">Khám phá theo môn học</h2>
      <div className="subject-strip">
        {SUBJECT_ITEMS.map((sub, idx) => {
          const Icon = sub.icon;
          const isActive = activeSubject === sub.name;
          return (
            <div
              key={idx}
              className={`subject-card subject-card--${sub.color} ${isActive ? 'subject-card--active' : ''}`}
              onClick={() => onSelectSubject(isActive ? 'All' : sub.name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectSubject(isActive ? 'All' : sub.name);
                }
              }}
            >
              <div className="subject-card__icon-wrapper">
                <Icon className="subject-card__icon" />
              </div>
              <div className="subject-card__info">
                <h3 className="subject-card__name">{sub.label}</h3>
                <span className="subject-card__count">{sub.count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
