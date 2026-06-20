import React, { useMemo } from 'react';
import CourseCard from '../shared/CourseCard';

export default function RecommendationRail({ currentUser, courses, onSelectCourse, onCheckoutCourse }) {
  const recommendedCourses = useMemo(() => {
    if (!courses) return [];
    const unlocked = currentUser?.unlockedCourses || [];
    const notEnrolled = courses.filter(c => !unlocked.includes(Number(c.id)) && !unlocked.includes(c.id.toString()));
    
    // Filter by subjectGroup or custom attributes
    const matched = notEnrolled.filter(c => {
      if (currentUser?.subjectGroup) {
        return c.block?.includes(currentUser.subjectGroup) || c.subjectGroup === currentUser.subjectGroup;
      }
      return true;
    });

    return (matched.length > 0 ? matched : notEnrolled).slice(0, 4);
  }, [currentUser, courses]);

  if (!currentUser || recommendedCourses.length === 0) return null;

  return (
    <div className="recommendation-section">
      <div className="recommendation-header">
        <h2 className="catalog-section-title">Gợi ý dành riêng cho bạn</h2>
        <span className="recommendation-subtitle">
          Cố vấn AI đề xuất dựa trên sở thích và khối thi <strong>{currentUser.subjectGroup || 'THPTQG'}</strong> của em
        </span>
      </div>
      <div className="recommendation-grid">
        {recommendedCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            isOwned={false}
            onSelect={onSelectCourse}
            onPurchase={onCheckoutCourse}
          />
        ))}
      </div>
    </div>
  );
}
