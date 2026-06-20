import React, { useState, useEffect } from 'react';
import { toast } from '../utils/toast';
import { 
  HiArrowLeft, 
  HiCheck 
} from 'react-icons/hi';
import { mapDbCourseToMockFormat } from '../utils/courseMapper';
import { api } from '../api';
import { enrollmentService } from '../services/enrollmentService';

// Subcomponents
import HeroBanner from '../components/courses/detail/HeroBanner';
import HeroVideoPlayer from '../components/courses/detail/HeroVideoPlayer';
import PricingCard from '../components/courses/detail/PricingCard';
import ContentCard from '../components/courses/detail/ContentCard';
import CurriculumAccordion from '../components/courses/detail/CurriculumAccordion';
import TabBar from '../components/courses/detail/TabBar';
import InstructorCard from '../components/courses/detail/InstructorCard';
import ReviewSection from '../components/courses/detail/ReviewSection';

// Custom CSS
import '../styles/courseDetail.css';

const DEFAULT_OUTCOMES = [
  'Nắm vững toàn bộ kiến thức trọng tâm bám sát cấu trúc của Bộ GD&ĐT.',
  'Thành thạo phương pháp phân tích nhanh, loại trừ trắc nghiệm chuẩn xác.',
  'Học các mẹo giải nhanh bằng máy tính Casio giúp tiết kiệm thời gian làm bài.',
  'Tránh những bẫy nhận biết và thông hiểu kinh điển thường gặp trong đề thi.',
  'Tiếp cận kho đề thi thử phong phú có lời giải chi tiết và video sửa lỗi sai.',
  'Tự đánh giá năng lực qua bài thi kiểm tra đầu vào và định kỳ bằng Adaptive AI.',
  'Tự tin nâng điểm số cấp tốc để đỗ nguyện vọng mong muốn vào trường Đại học.',
  'Gia tăng tư duy phản xạ đề thi thực tế một cách hệ thống và khoa học nhất.'
];

export default function CourseDetailPage({ 
  courseId, 
  currentUser, 
  onNavigateToLearn, 
  onUpdateUser, 
  navigateTo, 
  onAddToCart, 
  onCheckoutCourse 
}) {
  const [course, setCourse] = useState(null);
  const [isOwned, setIsOwned] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Fetch course details
  useEffect(() => {
    setLoading(true);
    const fetchDetails = async () => {
      try {
        const detailData = await api.getCourseById(courseId);
        if (detailData) {
          const foundCourse = mapDbCourseToMockFormat(detailData);
          setCourse(foundCourse);

          // Check ownership
          const userEnrolled = currentUser?.unlockedCourses?.includes(Number(courseId)) || 
                             currentUser?.unlockedCourses?.includes(courseId?.toString());
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
          const courseReviews = detailData.reviews?.map(r => ({
            id: r.id,
            course_id: r.courseId,
            student_id: r.studentId,
            student_name: r.student?.user?.fullName || "Học sinh",
            student_avatar: r.student?.user?.avatarUrl || "HS",
            rating: r.rating,
            comment: r.comment,
            created_at: r.createdAt
          })) || [];
          
          // Merge local reviews if saved in localStorage
          const localSaved = JSON.parse(localStorage.getItem(`supabase_mock_reviews_${courseId}`)) || [];
          setReviews([...localSaved, ...courseReviews]);
        } else {
          setCourse(null);
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [courseId, currentUser]);

  const handleAddReview = (newReview) => {
    const localSaved = JSON.parse(localStorage.getItem(`supabase_mock_reviews_${courseId}`)) || [];
    const createdReview = {
      id: `local-r-${Date.now()}`,
      course_id: Number(courseId),
      student_id: currentUser?.id || 101,
      ...newReview
    };
    const updated = [createdReview, ...localSaved];
    localStorage.setItem(`supabase_mock_reviews_${courseId}`, JSON.stringify(updated));
    setReviews(prev => [createdReview, ...prev]);
    toast('Cảm ơn em đã gửi đánh giá khóa học!', 'success');
  };

  const handleEnroll = async (action) => {
    if (!course) return;

    const firstLessonId = course.curriculum?.[0]?.lessons?.[0]?.id;
    const firstPreviewLesson = course.curriculum
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
      onNavigateToLearn(course.id, firstPreviewLesson);
      return;
    }

    if (action === 'cart') {
      if (onAddToCart) {
        onAddToCart(course);
      } else {
        toast(`Đã thêm khóa học "${course.title}" vào giỏ hàng của bạn!`, 'success');
      }
      return;
    }

    if (!currentUser) {
      toast('Vui lòng đăng nhập hoặc đăng ký tài khoản để bắt đầu học tập!', 'warning');
      return;
    }

    if (action === 'buy') {
      if (onCheckoutCourse) {
        onCheckoutCourse(course);
      } else {
        try {
          if (currentUser) {
            await enrollmentService.enrollCourse(currentUser.id, course.id, course.priceSale);
            setIsOwned(true);

            if (onUpdateUser) {
              const activeUnlocked = currentUser.unlockedCourses || [];
              onUpdateUser({
                ...currentUser,
                unlockedCourses: [...activeUnlocked, Number(course.id), course.id.toString()]
              });
            }
            toast('Đăng ký khóa học thành công! Tất cả bài giảng đã được mở khóa.', 'success');
          }
        } catch (err) {
          console.error(err);
          toast('Không thể đăng ký khóa học vào lúc này, vui lòng thử lại sau.', 'error');
        }
      }
      return;
    }
  };

  if (loading) {
    return (
      <div className="course-detail-page-fts" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--fts-text-secondary)' }}>
          <div style={{ fontSize: '32px', animation: 'spin 2s linear infinite' }}>⏳</div>
          <div style={{ fontSize: '14px', marginTop: '12px', fontWeight: 'bold' }}>Đang tải chi tiết khóa học...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail-page-fts">
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(79,63,203,0.1)', maxWidth: '600px', margin: '40px auto' }}>
          <span style={{ fontSize: '48px' }}>📂</span>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--fts-text-primary)', margin: '14px 0 6px 0' }}>Khóa học không tồn tại</h3>
          <p style={{ fontSize: '14px', color: 'var(--fts-text-secondary)', marginBottom: '20px' }}>Khóa học này có thể đã bị gỡ hoặc đường dẫn không chính xác.</p>
          <button 
            style={{ padding: '10px 20px', background: 'var(--fts-purple)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => navigateTo('/courses')}
          >
            Quay lại trang khóa học
          </button>
        </div>
      </div>
    );
  }

  const outcomesList = course.outcomes && course.outcomes.length > 0 ? course.outcomes : DEFAULT_OUTCOMES;
  const lessonCountVal = course.curriculum?.flatMap(s => s.lessons).length || 0;

  return (
    <div className="course-detail-page-fts animate-in">
      <div className="cd-container">
        {/* Back Link */}
        <a 
          className="cd-back-link" 
          onClick={() => navigateTo('/courses')}
        >
          <HiArrowLeft /> Quay lại danh sách khóa học
        </a>

        {/* 2-Column Grid */}
        <div className="cd-main-grid">
          {/* LEFT COLUMN */}
          <div className="cd-left-col">
            <HeroBanner course={course} reviewsCount={reviews.length} />
            
            {/* Tab Navigation */}
            <TabBar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              lessonCount={lessonCountVal}
              reviewCount={reviews.length}
            />

            {/* Tab Contents */}
            <div className="cd-tab-content">
              {activeTab === 'overview' && (
                <ContentCard title="Nội dung bài học">
                  <p style={{ 
                    fontSize: '15px', 
                    lineHeight: '1.8', 
                    color: 'var(--fts-text-secondary)', 
                    marginBottom: '28px',
                    wordBreak: 'keep-all'
                  }}>
                    {course.description}
                  </p>

                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--fts-text-primary)', marginBottom: '16px' }}>
                    Bạn sẽ học được gì
                  </h4>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px'
                  }}>
                    {outcomesList.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <HiCheck style={{ color: 'var(--fts-purple)', fontSize: '18px', flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '13.5px', lineHeight: '1.5', color: 'var(--fts-text-primary)', wordBreak: 'keep-all' }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </ContentCard>
              )}

              {activeTab === 'curriculum' && (
                <ContentCard title="Danh sách bài học">
                  <CurriculumAccordion 
                    curriculum={course.curriculum}
                    isOwned={isOwned}
                    onSelectLesson={(lesson) => onNavigateToLearn(course.id, lesson.id)}
                    completedLessons={completedLessons}
                  />
                </ContentCard>
              )}

              {activeTab === 'instructor' && (
                <InstructorCard 
                  instructor={course.instructor}
                  onSelectCourse={(c) => navigateTo(`/courses/${c.id}`)}
                  onCheckoutCourse={onCheckoutCourse}
                />
              )}

              {activeTab === 'reviews' && (
                <ReviewSection
                  reviews={reviews}
                  currentUser={currentUser}
                  onAddReview={handleAddReview}
                  isOwned={isOwned}
                />
              )}

              {activeTab === 'faq' && (
                <ContentCard title="Các câu hỏi thường gặp (FAQ)">
                  {[
                    {
                      q: 'Khóa học này kéo dài trong bao lâu?',
                      a: 'Khóa học được thiết kế học tự do. Em có thể truy cập trọn đời và học bất kỳ lúc nào phù hợp với thời gian biểu của bản thân.'
                    },
                    {
                      q: 'Tài liệu học tập đi kèm có mất thêm phí không?',
                      a: 'Không, tất cả tài liệu PDF ôn tập, ngân hàng bài tập, và sơ đồ tư duy đi kèm đều hoàn toàn miễn phí và có thể tải xuống không giới hạn.'
                    },
                    {
                      q: 'Nếu có bài tập không hiểu, em có thể hỏi ai?',
                      a: 'Mỗi khóa học đều có nhóm hỏi đáp hỗ trợ 24/7. Em có thể gửi câu hỏi lên nhóm để các bạn học sinh khác và trợ lý/giảng viên hỗ trợ giải đáp nhanh nhất.'
                    },
                    {
                      q: 'Chính sách hoàn tiền của khóa học như thế nào?',
                      a: 'Nếu không hài lòng, em có thể yêu cầu hoàn tiền 100% trong vòng 7 ngày kể từ ngày đăng ký khóa học, miễn là chưa học quá 20% thời lượng khóa học.'
                    }
                  ].map((faq, idx) => (
                    <div key={idx} style={{
                      borderBottom: '1px solid #E5E7EB',
                      paddingBottom: '16px',
                      marginBottom: '16px'
                    }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--fts-text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ color: 'var(--fts-purple)' }}>Q.</span>
                        <span>{faq.q}</span>
                      </h4>
                      <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--fts-text-secondary)', margin: 0, paddingLeft: '24px', wordBreak: 'keep-all' }}>
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </ContentCard>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="cd-right-col">
            <div className="cd-right-sticky">
              <HeroVideoPlayer 
                videoUrl={course.trailerUrl} 
                courseTitle={course.title}
                instructorName={course.instructor?.name}
              />
              <PricingCard 
                course={course} 
                isOwned={isOwned} 
                onEnroll={handleEnroll} 
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
