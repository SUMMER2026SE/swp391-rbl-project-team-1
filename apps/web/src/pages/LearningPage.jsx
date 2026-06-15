import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from '../utils/toast';
import VideoPlayer from '../components/courses/VideoPlayer';
import ProgressSidebar from '../components/courses/ProgressSidebar';
import CourseMaterials from '../components/courses/CourseMaterials';
import CourseDiscussion from '../components/courses/CourseDiscussion';
import TeacherChat from '../components/courses/TeacherChat';
import AiTutorChat from '../components/courses/AiTutorChat';
import useCourseProgress from '../hooks/useCourseProgress';
import { MOCK_COURSES } from '../data/courses';
import { discussionService } from '../services/discussionService';

export default function LearningPage({ courseId, lessonId, currentUser, onSelectLesson, onBackToCourse }) {
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [activeTab, setActiveTab] = useState('materials'); // materials, discussion, teacher, ai
  const [loading, setLoading] = useState(true);

  // 1. Locate Course
  useEffect(() => {
    const found = MOCK_COURSES.find(c => c.id.toString() === courseId?.toString());
    setCourse(found || null);
  }, [courseId]);

  // Flattened list of lessons for linear navigation
  const allLessons = useMemo(() => {
    if (!course) return [];
    return course.curriculum.flatMap(chapter => chapter.lessons) || [];
  }, [course]);

  // Determine current lesson
  useEffect(() => {
    if (allLessons.length === 0) return;
    const activeId = lessonId ? lessonId.toString() : allLessons[0].id.toString();
    const active = allLessons.find(l => l.id.toString() === activeId) || allLessons[0];
    setCurrentLesson(active);
  }, [lessonId, allLessons]);

  const totalLessonsCount = allLessons.length;

  // 2. Load Progress Hook
  const { completedLessons, toggleCompleted, progressPercent } = useCourseProgress(
    courseId,
    currentUser,
    totalLessonsCount
  );

  // Check enrollment
  const isOwned = useMemo(() => {
    if (!courseId) return false;
    return !!(currentUser?.unlockedCourses?.includes(Number(courseId)) || currentUser?.unlockedCourses?.includes(courseId.toString()));
  }, [currentUser, courseId]);

  // Load materials & discussions for current lesson
  useEffect(() => {
    if (!currentLesson) return;
    setLoading(true);

    // Mock materials specifically tailored for the lesson
    const fallbackMaterials = [
      { id: `${currentLesson.id}_m1`, title: `Sổ tay lý thuyết trọng tâm - ${currentLesson.title}`, file_type: 'PDF' },
      { id: `${currentLesson.id}_m2`, title: `Bài tập trắc nghiệm tự luyện kèm giải chi tiết - ${currentLesson.title}`, file_type: 'PDF' },
      { id: `${currentLesson.id}_m3`, title: `Slide bài giảng sơ đồ tư duy - ${currentLesson.title}`, file_type: 'Slide' }
    ];
    setMaterials(fallbackMaterials);

    // Fetch mock discussions
    const discData = discussionService.getDiscussionsByLessonId(Number(currentLesson.id)) || [];
    setDiscussions(discData);
    setLoading(false);
  }, [currentLesson]);

  const handleAddComment = async (text, parentId = null) => {
    if (!currentLesson || !currentUser) return;
    try {
      const newComment = await discussionService.createDiscussion(
        Number(currentLesson.id),
        currentUser.id,
        currentUser.name,
        currentUser.avatar || 'U',
        text,
        parentId
      );
      setDiscussions(prev => [...prev, newComment]);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrevLesson = useCallback(() => {
    if (!currentLesson || allLessons.length === 0) return;
    const idx = allLessons.findIndex(l => l.id.toString() === currentLesson.id.toString());
    if (idx > 0) {
      // Find the first preceding lesson that is unlocked or owned
      const prevLesson = allLessons[idx - 1];
      onSelectLesson(courseId, prevLesson.id);
    }
  }, [currentLesson, allLessons, courseId, onSelectLesson]);

  const handleNextLesson = useCallback(() => {
    if (!currentLesson || allLessons.length === 0) return;
    const idx = allLessons.findIndex(l => l.id.toString() === currentLesson.id.toString());
    if (idx < allLessons.length - 1) {
      const nextLesson = allLessons[idx + 1];
      onSelectLesson(courseId, nextLesson.id);
    }
  }, [currentLesson, allLessons, courseId, onSelectLesson]);

  const isDemoMode = window.location.search.includes('demo=true');
  const isLocked = !isDemoMode && !isOwned && currentLesson && !currentLesson.isPreview;

  const currentIdx = allLessons.findIndex(l => currentLesson && l.id.toString() === currentLesson.id.toString());
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < allLessons.length - 1;

  if (!course || !currentLesson) {
    return (
      <div className="cp-page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--stone-text-secondary)' }}>
          <div style={{ fontSize: '32px', animation: 'spin 2s linear infinite' }}>⏳</div>
          <div style={{ fontSize: '14px', marginTop: '12px', fontWeight: 'bold' }}>Đang chuẩn bị lớp học...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-page-container">
      <div className="cp-page animate-in" style={{ gap: '24px' }}>
        
        {isDemoMode && (
          <div 
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              padding: '14px 24px',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-warm-sm)',
              flexWrap: 'wrap',
              gap: '12px'
            }}
            className="animate-in"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>✨</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                Bạn đang ở lớp học thử nghiệm (DEMO). Đăng ký khóa học ngay để mở khóa toàn bộ giáo trình VIP và được AI phân tích lộ trình!
              </span>
            </div>
            <button 
              onClick={onBackToCourse}
              style={{
                backgroundColor: '#ffffff',
                color: 'var(--emerald-primary)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              ĐĂNG KÝ HỌC NGAY
            </button>
          </div>
        )}
        
        {/* ── TOP CONTROL BAR ── */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            background: '#ffffff', 
            padding: '16px 24px', 
            borderRadius: 'var(--radius-lg)', 
            border: '1.5px solid var(--border-warm)',
            boxShadow: 'var(--shadow-warm-sm)',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="cc-btn cc-btn--owned"
              style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '800' }}
              onClick={onBackToCourse}
            >
              ◀ Quay lại Chi tiết khóa
            </button>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--stone-text-muted)', display: 'block', fontWeight: '600' }}>
                Học phần: {course.title}
              </span>
              <strong style={{ fontSize: '14px', color: 'var(--stone-text-main)' }}>
                Bài {currentIdx + 1}: {currentLesson.title}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Mark complete checkbox */}
            {!isLocked && currentUser && (
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  fontSize: '12.5px', 
                  color: completedLessons.includes(Number(currentLesson.id)) || completedLessons.includes(currentLesson.id.toString()) ? 'var(--emerald-primary)' : 'var(--stone-text-secondary)', 
                  cursor: 'pointer', 
                  background: completedLessons.includes(Number(currentLesson.id)) || completedLessons.includes(currentLesson.id.toString()) ? 'var(--emerald-light)' : '#ffffff', 
                  border: '1.5px solid var(--border-warm)', 
                  padding: '8px 16px', 
                  borderRadius: '10px',
                  fontWeight: '700',
                  transition: 'all 0.2s'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={completedLessons.includes(Number(currentLesson.id)) || completedLessons.includes(currentLesson.id.toString())}
                  onChange={() => toggleCompleted(currentLesson.id)}
                  style={{ accentColor: 'var(--emerald-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                {completedLessons.includes(Number(currentLesson.id)) || completedLessons.includes(currentLesson.id.toString()) ? '✓ Đã hoàn thành' : 'Đánh dấu hoàn thành'}
              </label>
            )}

            <button 
              className="cc-btn cc-btn--owned" 
              style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: '700' }}
              onClick={handlePrevLesson}
              disabled={!hasPrev}
            >
              Bài trước
            </button>
            
            <button 
              className="cc-btn cc-btn--enroll" 
              style={{ padding: '8px 18px', fontSize: '12.5px', fontWeight: '800' }}
              onClick={handleNextLesson}
              disabled={!hasNext}
            >
              Bài tiếp theo
            </button>
          </div>
        </div>

        {/* ── MAIN LAYOUT GRID ── */}
        <div className="cp-learn-grid">
          
          {/* CỘT TRÁI (Video Player / Locks & Tab details) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {isLocked ? (
              <div 
                style={{
                  height: '420px',
                  background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  padding: '32px',
                  textAlign: 'center',
                  border: '1.5px solid var(--border-warm)',
                  boxShadow: 'var(--shadow-warm-md)'
                }}
              >
                <span style={{ fontSize: '56px', marginBottom: '20px' }}>🔒</span>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '0 0 10px 0' }}>
                  Bài giảng này thuộc phạm vi VIP
                </h3>
                <p style={{ fontSize: '14px', color: '#d6d3d1', maxWidth: '440px', margin: '0 0 24px 0', lineHeight: 1.6 }}>
                  Vui lòng đăng ký sở hữu trọn bộ khóa học để xem các bài giảng chuyên sâu nâng cao và truy cập tài liệu tự luyện trắc nghiệm.
                </p>
                <button 
                  className="cc-btn cc-btn--enroll" 
                  style={{ padding: '12px 28px', fontSize: '14px', fontWeight: '800', borderRadius: '10px' }}
                  onClick={onBackToCourse}
                >
                  Đăng ký khóa học ngay
                </button>
              </div>
            ) : (
              <VideoPlayer 
                videoUrl={currentLesson.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                title={currentLesson.title}
                onEnded={handleNextLesson} // Auto play next lesson when finished!
              />
            )}

            {/* TABBED PANELS */}
            {!isLocked && (
              <>
                <div style={{ display: 'flex', borderBottom: '2px solid var(--border-warm)', gap: '8px' }}>
                  {[
                    { id: 'materials', label: '📥 Tài liệu' },
                    { id: 'discussion', label: '💬 Thảo luận lớp học' },
                    { id: 'teacher', label: '👨‍🏫 Hỏi Giáo viên' },
                    { id: 'ai', label: '🤖 AI Gia sư 24/7' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`detail-tab-btn ${activeTab === tab.id ? 'detail-tab-btn--active' : ''}`}
                      style={{ padding: '10px 18px', fontSize: '13.5px' }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div>
                  {activeTab === 'materials' && (
                    <CourseMaterials 
                      materials={materials}
                      onDownload={(mat) => toast(`Bắt đầu tải tài liệu: ${mat.title}`, 'success')}
                    />
                  )}
                  {activeTab === 'discussion' && (
                    <CourseDiscussion 
                      discussions={discussions}
                      onAddComment={handleAddComment}
                      currentUser={currentUser}
                    />
                  )}
                  {activeTab === 'teacher' && (
                    <TeacherChat 
                      currentUser={currentUser}
                      teacherName={course.instructor.name}
                    />
                  )}
                  {activeTab === 'ai' && (
                    <AiTutorChat 
                      lesson={currentLesson}
                    />
                  )}
                </div>
              </>
            )}

          </div>

          {/* CỘT PHẢI (Sidebar tiến độ học tập) */}
          <div style={{ height: '580px', position: 'sticky', top: '24px' }}>
            <ProgressSidebar 
              curriculum={course.curriculum}
              currentLessonId={currentLesson.id}
              onSelectLesson={(lesson) => onSelectLesson(course.id, lesson.id)}
              completedLessons={completedLessons}
              isOwned={isOwned}
            />
          </div>

        </div>

      </div>
    </div>
  );
}
