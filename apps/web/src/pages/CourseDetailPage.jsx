import { useState, useEffect } from 'react';
import CourseHero from '../components/courses/CourseHero';
import CourseCurriculum from '../components/courses/CourseCurriculum';
import CourseReviews from '../components/courses/CourseReviews';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';

export default function CourseDetailPage({ courseId, currentUser, onNavigateToLearn, onUpdateUser }) {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isOwned, setIsOwned] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCourseDetails = async () => {
    setLoading(true);
    try {
      const cData = await courseService.getCourseById(courseId);
      const lData = await courseService.getLessonsByCourseId(courseId);
      const chData = await courseService.getChaptersByCourseId(courseId);
      
      // Load mock reviews or Supabase reviews
      const allReviews = JSON.parse(localStorage.getItem('supabase_mock_reviews')) || [];
      const courseReviews = allReviews.filter(r => r.course_id === Number(courseId));
      
      setCourse(cData);
      setLessons(lData || []);
      setChapters(chData || []);
      setReviews(courseReviews);

      if (currentUser) {
        const enrolled = await enrollmentService.checkEnrollment(currentUser.id, courseId);
        setIsOwned(enrolled);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseDetails();
  }, [courseId, currentUser]);

  const handleEnroll = async (action) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để bắt đầu học tập!');
      return;
    }

    if (action === 'learn') {
      // Direct jump to learning page
      onNavigateToLearn(courseId, lessons[0]?.id);
      return;
    }

    // Purchase / Enroll Demo flow
    try {
      await enrollmentService.enrollCourse(currentUser.id, courseId);
      setIsOwned(true);
      
      // Update global current_user state in App.jsx so that Navbar/sidebar updates immediately
      if (onUpdateUser) {
        const activeUnlocked = currentUser.unlockedCourses || [];
        onUpdateUser({
          ...currentUser,
          unlockedCourses: [...activeUnlocked, Number(courseId)]
        });
      }
      
      alert('Kích hoạt học thử Demo thành công! Tất cả bài giảng đã được mở khóa.');
    } catch (err) {
      console.error(err);
      alert('Không thể kích hoạt khóa học, em vui lòng thử lại nhé.');
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
    const updated = [...allReviews, createdReview];
    localStorage.setItem('supabase_mock_reviews', JSON.stringify(updated));
    setReviews(prev => [createdReview, ...prev]);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '30px', animation: 'spin 2s linear infinite' }}>⏳</div>
        <div style={{ fontSize: '13px', marginTop: '12px' }}>Đang tải thông tin chi tiết khóa học...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: '48px' }}>📂</span>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '14px 0 6px 0' }}>Khóa học không tồn tại</h3>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Khóa học này có thể đã bị gỡ hoặc ID không chính xác.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto', padding: '0 16px', marginBottom: '60px' }} className="animate-in">
      {/* Course Hero Banner */}
      <CourseHero 
        course={course}
        isOwned={isOwned}
        onEnroll={handleEnroll}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: overview, curriculum, reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Overview */}
          <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '14px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              💡 GIỚI THIỆU KHÓA HỌC
            </h3>
            <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
              {course.description}
            </p>

            <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px', color: 'var(--text-primary)' }}>
              Em sẽ học được gì sau khóa học:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              <div>✅ Nắm vững trọn bộ lý thuyết trọng tâm phục vụ thi THPT Quốc Gia.</div>
              <div>✅ Thành thạo 15+ kỹ năng Casio giải nhanh trắc nghiệm trong phòng thi.</div>
              <div>✅ Tránh bẫy các câu hỏi nhận biết - thông hiểu kinh điển.</div>
              <div>✅ Tiếp cận kho đề thi thử từ các trường chuyên danh tiếng trên cả nước.</div>
            </div>
          </div>

          {/* Curriculum */}
          <CourseCurriculum 
            chapters={chapters}
            lessons={lessons}
            isOwned={isOwned}
            onSelectLesson={(lesson) => onNavigateToLearn(courseId, lesson.id)}
          />

          {/* Reviews */}
          <CourseReviews 
            reviews={reviews}
            currentUser={currentUser}
            onAddReview={handleAddReview}
          />
        </div>

        {/* Right Column: Teacher profiles & FAQ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Teacher box */}
          <div className="card" style={{ padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-primary)' }}>
              👨‍🏫 GIÁO VIÊN HƯỚNG DẪN
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#6c5ce7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                {course.teacher_avatar || course.teacher_name.slice(0,2).toUpperCase()}
              </div>
              <div>
                <h4 style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>{course.teacher_name}</h4>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Cố vấn học thuật EduPath AI</span>
              </div>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Giảng viên có nhiều năm kinh nghiệm bồi dưỡng học sinh giỏi và luyện đề THPT Quốc Gia. Phương pháp giảng dạy khoa học, bám sát cấu trúc mới nhất của Bộ GD&ĐT.
            </p>
          </div>

          {/* FAQ */}
          <div className="card" style={{ padding: '20px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-primary)' }}>
              ❓ CÂU HỎI THƯỜNG GẶP
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-primary)' }}>1. Khóa học có thời hạn bao lâu?</strong>
                <span style={{ color: 'var(--text-secondary)' }}>Khóa học có thời hạn sử dụng vĩnh viễn tính từ ngày mua.</span>
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-primary)' }}>2. Tôi có được hỗ trợ khi học không?</strong>
                <span style={{ color: 'var(--text-secondary)' }}>Có, em được hỏi đáp 24/7 trực tiếp với Trợ lý AI và giáo viên trong bài học.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
