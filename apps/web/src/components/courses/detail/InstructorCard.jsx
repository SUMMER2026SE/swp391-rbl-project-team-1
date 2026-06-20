import React, { useMemo } from 'react';
import { HiStar, HiUserGroup, HiBookOpen, HiCheckCircle } from 'react-icons/hi';
import InstructorAvatar from '../shared/InstructorAvatar';
import CourseCard from '../shared/CourseCard';

export default function InstructorCard({ instructor, courses = [], onSelectCourse, onCheckoutCourse }) {
  const otherCourses = useMemo(() => {
    if (!courses || !instructor) return [];
    return courses
      .filter(c => c.instructor?.name === instructor.name)
      .slice(0, 3);
  }, [courses, instructor]);

  return (
    <div className="instructor-details-card">
      <h3 className="detail-section-title">Giảng viên đứng lớp</h3>
      
      <div className="instructor-details-card__profile">
        <InstructorAvatar instructor={instructor} size="lg" />
        <div className="instructor-details-card__meta">
          <h4 className="instructor-details-card__name">
            {instructor.name}
            <HiCheckCircle style={{ color: '#2563eb', fontSize: '18px', marginLeft: '4px' }} />
          </h4>
          <span className="instructor-details-card__title">{instructor.title || 'Cố vấn chuyên môn tại EduPath'}</span>
          
          <div className="instructor-details-card__quick-stats">
            <span className="quick-stat">
              <HiStar className="quick-stat-icon" /> <strong>4.9</strong> Đánh giá
            </span>
            <span className="quick-stat">
              <HiUserGroup className="quick-stat-icon" /> <strong>12.000+</strong> Học viên
            </span>
            <span className="quick-stat">
              <HiBookOpen className="quick-stat-icon" /> <strong>{otherCourses.length || 3}</strong> Khóa học
            </span>
          </div>
        </div>
      </div>

      <p className="instructor-details-card__bio">
        Thầy/Cô là chuyên gia nhiều năm kinh nghiệm giảng dạy ôn luyện kỳ thi tốt nghiệp THPT Quốc Gia, chuyên gia cố vấn xây dựng ngân hàng đề thi Adaptive AI. Với phong cách giảng dạy trực quan, thực tế và dễ tiếp thu, Thầy/Cô đã giúp hàng ngàn học sinh lấy lại căn bản kiến thức nhanh chóng và chinh phục mục tiêu điểm số đại học mong muốn.
      </p>

      {otherCourses.length > 0 && (
        <div className="instructor-details-card__other-courses">
          <h4 className="other-courses-title">Các khóa học khác của giảng viên:</h4>
          <div className="other-courses-grid">
            {otherCourses.map((c) => (
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
      )}
    </div>
  );
}
