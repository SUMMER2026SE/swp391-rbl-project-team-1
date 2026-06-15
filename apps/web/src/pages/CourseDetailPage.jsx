import { useState, useEffect } from 'react';
import { HiStar, HiUserGroup, HiBookOpen, HiClock, HiCheck, HiChevronRight, HiAcademicCap } from 'react-icons/hi';
import CurriculumAccordion from '../components/courses/CurriculumAccordion';
import CourseReviews from '../components/courses/CourseReviews';
import CoursePurchaseCard from '../components/courses/CoursePurchaseCard';
import { MOCK_COURSES } from '../data/courses';
import { enrollmentService } from '../services/enrollmentService';

export default function CourseDetailPage({ courseId, currentUser, onNavigateToLearn, onUpdateUser, navigateTo }) {
  const [course, setCourse] = useState(null);
  const [isOwned, setIsOwned] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, curriculum, instructor, reviews
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Locate course in mock database
    const foundCourse = MOCK_COURSES.find(c => c.id.toString() === courseId?.toString());
    setCourse(foundCourse || null);

    if (foundCourse) {
      // Check ownership
      const userEnrolled = currentUser?.unlockedCourses?.includes(Number(courseId)) || currentUser?.unlockedCourses?.includes(courseId?.toString());
      setIsOwned(userEnrolled || false);

      // Load progress
      if (currentUser) {
        enrollmentService.getEnrolledCourseProgress(currentUser.id, courseId)
          .then(completed => setCompletedLessons(completed || []))
          .catch(err => console.warn('Failed loading progress:', err));
      } else {
        const saved = localStorage.getItem(`course_${courseId}_completed_lessons`);
        if (saved) setCompletedLessons(JSON.parse(saved));
      }

      // Load reviews
      const allReviews = JSON.parse(localStorage.getItem('supabase_mock_reviews')) || [];
      const courseReviews = allReviews.filter(r => r.course_id === Number(foundCourse.id) || r.course_id.toString() === foundCourse.id);
      setReviews(courseReviews);
    }
    setLoading(false);
  }, [courseId, currentUser]);

  const handleEnroll = async (action) => {
    const firstLessonId = course?.curriculum?.[0]?.lessons?.[0]?.id;
    const firstPreviewLesson = course?.curriculum
      ?.flatMap(s => s.lessons)
      ?.find(l => l.isPreview)?.id || firstLessonId;

    if (action === 'demo') {
      onNavigateToLearn(course.id, firstLessonId, true);
      return;
    }

    if (action === 'learn') {
      onNavigateToLearn(course.id, firstLessonId);
      return;
    }

    if (action === 'preview') {
      // Direct jump to first free preview lesson
      onNavigateToLearn(course.id, firstPreviewLesson);
      return;
    }

    if (action === 'cart') {
      alert(`Đã thêm khóa học "${course.title}" vào giỏ hàng của bạn!`);
      return;
    }

    if (!currentUser) {
      alert('Vui lòng đăng nhập hoặc đăng ký tài khoản để bắt đầu học tập!');
      return;
    }

    // Purchase / Enroll flow
    try {
      if (currentUser) {
        await enrollmentService.enrollCourse(currentUser.id, course.id, course.priceSale);
        setIsOwned(true);
        
        // Sync user state in App.jsx
        if (onUpdateUser) {
          const activeUnlocked = currentUser.unlockedCourses || [];
          onUpdateUser({
            ...currentUser,
            unlockedCourses: [...activeUnlocked, Number(course.id), course.id.toString()]
          });
        }
        alert('Đăng ký khóa học thành công! Tất cả bài giảng đã được mở khóa.');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể đăng ký khóa học vào lúc này, vui lòng thử lại sau.');
    }
  };

  const handleAddReview = (newReview) => {
    const allReviews = JSON.parse(localStorage.getItem('supabase_mock_reviews')) || [];
    const createdReview = {
      id: allReviews.length + 1,
      course_id: Number(courseId),
      student_id: currentUser?.id || 101,
      ...newReview
    };
    const updated = [createdReview, ...allReviews];
    localStorage.setItem('supabase_mock_reviews', JSON.stringify(updated));
    setReviews(prev => [createdReview, ...prev]);
  };

  if (loading) {
    return (
      <div className="cp-page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--stone-text-secondary)' }}>
          <div style={{ fontSize: '32px', animation: 'spin 2s linear infinite' }}>⏳</div>
          <div style={{ fontSize: '14px', marginTop: '12px', fontWeight: 'bold' }}>Đang tải chi tiết khóa học...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="cp-page-container">
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-warm)', maxWidth: '600px', margin: '40px auto' }}>
          <span style={{ fontSize: '48px' }}>📂</span>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--stone-text-main)', margin: '14px 0 6px 0' }}>Khóa học không tồn tại</h3>
          <p style={{ fontSize: '14px', color: 'var(--stone-text-secondary)', marginBottom: '20px' }}>Khóa học này có thể đã bị gỡ hoặc đường dẫn không chính xác.</p>
          <button className="cp-empty__btn" onClick={() => navigateTo('/courses')}>Quay lại trang khóa học</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-page-container">
      <div className="cp-page animate-in" style={{ gap: '24px' }}>
        
        {/* ── BREADCRUMB ── */}
        <div className="cp-breadcrumb">
          <a onClick={() => navigateTo('/courses')}>Khóa học</a>
          <span className="cp-breadcrumb__separator"><HiChevronRight /></span>
          <a onClick={() => navigateTo(`/courses?subject=${course.subject}`)}>{course.subject}</a>
          <span className="cp-breadcrumb__separator"><HiChevronRight /></span>
          <span style={{ color: 'var(--stone-text-main)', fontWeight: '700' }}>{course.title}</span>
        </div>

        {/* ── main content header ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ background: 'var(--emerald-light)', color: 'var(--emerald-primary)', fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '99px', border: '1px solid rgba(5, 150, 105, 0.1)' }}>
              Luyện thi THPTQG
            </span>
            <span style={{ background: '#FAF6EE', color: 'var(--stone-text-secondary)', fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '99px', border: '1px solid var(--border-warm)' }}>
              {course.block}
            </span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--stone-text-main)', margin: 0, lineHeight: '1.3' }}>
            {course.title}
          </h1>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--stone-text-secondary)', fontWeight: '500' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HiStar style={{ color: '#fbbf24', fontSize: '16px' }} />
              <strong>{course.rating.toFixed(1)}</strong> ({reviews.length} đánh giá học sinh)
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HiUserGroup />
              <strong>{course.studentCount.toLocaleString('vi-VN')}</strong> học sinh đang học
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HiBookOpen />
              <strong>{course.lessonCount}</strong> bài học
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HiClock />
              <strong>{course.durationHours} giờ</strong> thời lượng
            </div>
          </div>
        </div>

        {/* ── Bố cục 2 cột chính ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }} className="cp-detail-grid">
          
          {/* CỘT TRÁI (Nội dung chính & Tabs) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Video/Ảnh preview ở đầu */}
            <div 
              style={{ 
                position: 'relative', 
                borderRadius: 'var(--radius-lg)', 
                overflow: 'hidden', 
                height: '340px',
                border: '1.5px solid var(--border-warm)',
                boxShadow: 'var(--shadow-warm-sm)'
              }}
            >
              <img
                src={course.thumbnail || '/course_thumb_math.png'}
                alt={course.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div 
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'rgba(0, 0, 0, 0.25)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                <button 
                  onClick={() => handleEnroll('preview')}
                  style={{
                    backgroundColor: 'var(--emerald-primary)',
                    color: '#ffffff',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(5,150,105,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  ▶ HỌC THỬ MIỄN PHÍ BÀI 1
                </button>
              </div>
            </div>

            {/* Hệ thống Tabs */}
            <div>
              <div className="detail-tabs-header">
                {[
                  { id: 'overview', label: '💡 Tổng quan' },
                  { id: 'curriculum', label: `📋 Giáo trình (${course.lessonCount})` },
                  { id: 'instructor', label: '👨‍🏫 Giảng viên' },
                  { id: 'reviews', label: `⭐ Đánh giá (${reviews.length})` }
                ].map(t => (
                  <button
                    key={t.id}
                    className={`detail-tab-btn ${activeTab === t.id ? 'detail-tab-btn--active' : ''}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Từng panel nội dung dựa trên Active Tab */}
              <div style={{ background: '#ffffff', border: '1.5px solid var(--border-warm)', borderRadius: 'var(--radius-lg)', padding: '28px', boxShadow: 'var(--shadow-warm-sm)' }}>
                {activeTab === 'overview' && (
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px', color: 'var(--stone-text-main)' }}>
                      Giới thiệu khóa học
                    </h3>
                    <p style={{ fontSize: '14.5px', lineHeight: '1.7', color: 'var(--stone-text-secondary)', margin: '0 0 24px 0' }}>
                      {course.description}
                    </p>

                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px', color: 'var(--stone-text-main)' }}>
                      Em sẽ học được những gì:
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13.5px', color: 'var(--stone-text-secondary)' }} className="cp-detail-checklist">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <HiCheck style={{ color: 'var(--emerald-primary)', fontSize: '18px', flexShrink: 0 }} />
                        <span>Nắm vững toàn bộ kiến thức trọng tâm bám sát cấu trúc của Bộ GD&ĐT.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <HiCheck style={{ color: 'var(--emerald-primary)', fontSize: '18px', flexShrink: 0 }} />
                        <span>Thành thạo phương pháp phân tích nhanh, loại trừ trắc nghiệm cực chuẩn.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <HiCheck style={{ color: 'var(--emerald-primary)', fontSize: '18px', flexShrink: 0 }} />
                        <span>Tránh những bẫy nhận biết và thông hiểu kinh điển hay gặp nhất.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <HiCheck style={{ color: 'var(--emerald-primary)', fontSize: '18px', flexShrink: 0 }} />
                        <span>Tiếp cận kho bài kiểm tra chẩn đoán năng lực bằng Adaptive AI.</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div>
                    <CurriculumAccordion
                      curriculum={course.curriculum}
                      isOwned={isOwned}
                      onSelectLesson={(lesson) => onNavigateToLearn(course.id, lesson.id)}
                      completedLessons={completedLessons}
                    />
                  </div>
                )}

                {activeTab === 'instructor' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--emerald-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
                        {course.instructor.avatar || course.instructor.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--stone-text-main)', margin: 0 }}>{course.instructor.name}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--stone-text-secondary)', fontWeight: '600' }}>Cố vấn học thuật EduPath AI</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '14.5px', color: 'var(--stone-text-secondary)', margin: 0, lineHeight: '1.6' }}>
                      {course.instructor.title}. Thầy/Cô là chuyên gia uy tín với hàng ngàn học sinh đạt điểm giỏi trong các kỳ thi THPT Quốc Gia trước đây, có phương pháp tiếp cận trực quan, dễ hiểu giúp học sinh lấy lại căn bản và đột phá điểm số cấp tốc.
                    </p>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <CourseReviews
                      reviews={reviews}
                      currentUser={currentUser}
                      onAddReview={handleAddReview}
                    />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* CỘT PHẢI (Sticky Mua hàng) */}
          <div className="purchase-card-sticky">
            <CoursePurchaseCard
              course={course}
              isOwned={isOwned}
              onEnroll={handleEnroll}
            />
          </div>

        </div>

      </div>
    </div>
  );
}
