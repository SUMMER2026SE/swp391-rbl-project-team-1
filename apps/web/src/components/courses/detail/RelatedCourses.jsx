import React, { useMemo } from 'react';
import CourseCard from '../shared/CourseCard';

export default function RelatedCourses({ currentCourse, courses = [], onSelectCourse, onCheckoutCourse }) {
  const related = useMemo(() => {
    if (!courses || !currentCourse) return [];
    return courses
      .filter(c => c.id !== currentCourse.id && c.subject === currentCourse.subject)
      .slice(0, 4);
  }, [courses, currentCourse]);

  if (related.length === 0) return null;

  return (
    <div className="related-courses-section">
      <h3 className="detail-section-title">Khóa học liên quan</h3>
      <div className="related-courses-grid">
        {related.map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            isOwned={false}
            onSelect={onSelectCourse}
            onPurchase={onCheckoutCourse}
          />
        ))}
      </div>
    </div>
  );
}
