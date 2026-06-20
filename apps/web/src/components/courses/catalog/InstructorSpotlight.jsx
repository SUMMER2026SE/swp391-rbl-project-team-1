import React from 'react';
import InstructorAvatar from '../shared/InstructorAvatar';

const TOP_INSTRUCTORS = [
  {
    id: 'inst-1',
    name: 'Thầy Nguyễn Thế Anh',
    title: 'Giảng viên chuyên Toán THPT',
    rating: 4.95,
    students: '18.500',
    courses: 4,
    avatar: 'TA'
  },
  {
    id: 'inst-2',
    name: 'Cô Phạm Kim Chi',
    title: 'Thạc sĩ Ngữ Văn Đại học Sư Phạm',
    rating: 4.92,
    students: '12.200',
    courses: 3,
    avatar: 'KC'
  },
  {
    id: 'inst-3',
    name: 'Thầy David Clark',
    title: 'Chuyên gia luyện thi IELTS 8.5',
    rating: 4.88,
    students: '9.800',
    courses: 2,
    avatar: 'DC'
  }
];

export default function InstructorSpotlight({ onSelectInstructor }) {
  return (
    <div className="instructor-spotlight-section">
      <h2 className="catalog-section-title">Đội ngũ Cố vấn & Giảng viên tiêu biểu</h2>
      <div className="instructor-spotlight-grid">
        {TOP_INSTRUCTORS.map((teacher) => (
          <div key={teacher.id} className="instructor-spotlight-card">
            <div className="instructor-spotlight-card__header">
              <InstructorAvatar
                instructor={{ name: teacher.name, avatar: teacher.avatar }}
                size="lg"
              />
              <div className="instructor-spotlight-card__meta">
                <h3 className="instructor-spotlight-card__name">{teacher.name}</h3>
                <span className="instructor-spotlight-card__title">{teacher.title}</span>
              </div>
            </div>
            <div className="instructor-spotlight-card__stats">
              <div className="instructor-spotlight-card__stat">
                <strong>{teacher.rating} sao</strong>
                <span>Đánh giá học viên</span>
              </div>
              <div className="instructor-spotlight-card__stat">
                <strong>{teacher.students}</strong>
                <span>Học viên đã học</span>
              </div>
              <div className="instructor-spotlight-card__stat">
                <strong>{teacher.courses} khóa</strong>
                <span>Khóa học trên hệ thống</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectInstructor(teacher.name)}
              className="instructor-spotlight-card__btn"
            >
              Xem các khóa học giảng dạy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
