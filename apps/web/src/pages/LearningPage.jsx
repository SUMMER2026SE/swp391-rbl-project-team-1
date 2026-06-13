import { useState, useEffect } from 'react';
import VideoPlayer from '../components/courses/VideoPlayer';
import ProgressSidebar from '../components/courses/ProgressSidebar';
import CourseMaterials from '../components/courses/CourseMaterials';
import CourseDiscussion from '../components/courses/CourseDiscussion';
import TeacherChat from '../components/courses/TeacherChat';
import AiTutorChat from '../components/courses/AiTutorChat';
import { courseService } from '../services/courseService';
import { enrollmentService } from '../services/enrollmentService';
import { discussionService } from '../services/discussionService';

export default function LearningPage({ courseId, lessonId, currentUser, onSelectLesson, onBackToCourse }) {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [isOwned, setIsOwned] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [activeTab, setActiveTab] = useState('materials'); // materials, discussion, teacher, ai
  const [loading, setLoading] = useState(true);

  // Initialize checklist state from database / LocalStorage
  const loadProgress = async () => {
    if (currentUser) {
      try {
        const completedIds = await enrollmentService.getEnrolledCourseProgress(currentUser.id, courseId);
        setCompletedLessons(completedIds || []);
      } catch (err) {
        console.warn('Failed to load progress from DB:', err);
      }
    } else {
      const saved = localStorage.getItem(`course_${courseId}_completed_lessons`);
      if (saved) {
        setCompletedLessons(JSON.parse(saved));
      }
    }
  };

  const loadLearningData = async () => {
    setLoading(true);
    try {
      const cData = await courseService.getCourseById(courseId);
      const lData = await courseService.getLessonsByCourseId(courseId);
      const chData = await courseService.getChaptersByCourseId(courseId);
      
      setCourse(cData);
      setLessons(lData || []);
      setChapters(chData || []);

      let enrolled = false;
      if (currentUser) {
        enrolled = await enrollmentService.checkEnrollment(currentUser.id, courseId);
        setIsOwned(enrolled);
      }

      // Determine active lesson
      const activeLessonId = lessonId ? Number(lessonId) : (lData[0]?.id || null);
      const activeLesson = lData.find(l => l.id === activeLessonId) || lData[0] || null;
      setCurrentLesson(activeLesson);

      if (activeLesson) {
        // Load materials
        const matData = await courseService.getMaterialsByLessonId(activeLesson.id);
        setMaterials(matData || []);
        
        // Load discussions
        const discData = await discussionService.getDiscussionsByLessonId(activeLesson.id);
        setDiscussions(discData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLearningData();
    loadProgress();
  }, [courseId, lessonId, currentUser]);

  const handleToggleCompleted = async () => {
    if (!currentLesson || !currentUser) return;
    const isCompleted = !completedLessons.includes(currentLesson.id);
    let nextList = [...completedLessons];
    if (completedLessons.includes(currentLesson.id)) {
      nextList = nextList.filter(id => id !== currentLesson.id);
    } else {
      nextList.push(currentLesson.id);
    }
    setCompletedLessons(nextList);
    localStorage.setItem(`course_${courseId}_completed_lessons`, JSON.stringify(nextList));

    try {
      await enrollmentService.updateLessonProgress(currentUser.id, currentLesson.id, isCompleted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (text, parentId = null) => {
    if (!currentLesson || !currentUser) return;
    try {
      const newComment = await discussionService.createDiscussion(
        currentLesson.id,
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

  const handlePrevLesson = () => {
    if (!currentLesson) return;
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex > 0) {
      onSelectLesson(courseId, lessons[currentIndex - 1].id);
    }
  };

  const handleNextLesson = () => {
    if (!currentLesson) return;
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex >= 0 && currentIndex < lessons.length - 1) {
      onSelectLesson(courseId, lessons[currentIndex + 1].id);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '30px', animation: 'spin 2s linear infinite' }}>⏳</div>
        <div style={{ fontSize: '13px', marginTop: '12px' }}>Đang tải nội dung học tập...</div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: '48px' }}>📂</span>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '14px 0 6px 0' }}>Lớp học trống</h3>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Khóa học này chưa được cấu hình giáo trình hoặc bài học.</p>
        <button className="btn-outline" style={{ marginTop: '12px' }} onClick={onBackToCourse}>Quay lại</button>
      </div>
    );
  }

  const isLocked = !isOwned && !currentLesson.is_preview;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', margin: '0 auto', padding: '0 16px', marginBottom: '60px' }} className="animate-in">
      {/* Header bar of learning panel */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'var(--bg-card)', 
          padding: '14px 20px', 
          borderRadius: '12px', 
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="btn-outline"
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer' }}
            onClick={onBackToCourse}
          >
            ◀ Chi tiết khóa
          </button>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Học phần: {course.title}</span>
            <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>Bài {currentLesson.order}: {currentLesson.title}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Mark completed checklist checkbox */}
          {!isLocked && currentUser && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-primary)', cursor: 'pointer', background: completedLessons.includes(currentLesson.id) ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-main)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px' }}>
              <input 
                type="checkbox" 
                checked={completedLessons.includes(currentLesson.id)}
                onChange={handleToggleCompleted}
                style={{ accentColor: 'var(--accent-green)', width: '15px', height: '15px' }}
              />
              {completedLessons.includes(currentLesson.id) ? '✓ Đã hoàn thành' : 'Đánh dấu hoàn thành'}
            </label>
          )}

          <button 
            className="btn-outline" 
            style={{ padding: '6px 12px', fontSize: '12.5px', borderRadius: '8px' }}
            onClick={handlePrevLesson}
            disabled={lessons.findIndex(l => l.id === currentLesson.id) === 0}
          >
            Bài trước
          </button>
          
          <button 
            className="btn-primary" 
            style={{ padding: '6px 16px', fontSize: '12.5px', borderRadius: '8px' }}
            onClick={handleNextLesson}
            disabled={lessons.findIndex(l => l.id === currentLesson.id) === lessons.length - 1}
          >
            Bài tiếp
          </button>
        </div>
      </div>

      {/* Main Grid: Player on left, Curriculum Progress sidebar on right */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Player & Tabbed details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Video Player / Lock Screen */}
          {isLocked ? (
            <div 
              style={{
                height: '380px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                padding: '24px',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
              }}
            >
              <span style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</span>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: '0 0 8px 0' }}>
                Bài giảng này đã bị khóa
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', maxWidth: '400px', margin: '0 0 20px 0', lineHeight: 1.5 }}>
                Vui lòng đăng ký/mua khóa học để xem toàn bộ bài giảng nâng cao và tải tài liệu đính kèm.
              </p>
              <button 
                className="btn-primary" 
                style={{ padding: '10px 24px', fontSize: '13.5px', fontWeight: 'bold', borderRadius: '8px' }}
                onClick={onBackToCourse}
              >
                Đăng ký khóa học ngay
              </button>
            </div>
          ) : (
            <VideoPlayer 
              videoUrl={currentLesson.video_url}
              title={currentLesson.title}
            />
          )}

          {/* Lesson Content Description */}
          {currentLesson.content && !isLocked && (
            <div className="card" style={{ padding: '16px 20px', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Nội dung bài học:</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{currentLesson.content}</p>
            </div>
          )}

          {/* Tabs & Active Panel */}
          {!isLocked && (
            <>
              {/* Tabs header */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '4px' }}>
                {[
                  { id: 'materials', label: '📥 Tài liệu' },
                  { id: 'discussion', label: '💬 Thảo luận' },
                  { id: 'teacher', label: '👨‍🏫 Hỏi Giáo viên' },
                  { id: 'ai', label: '🤖 AI Gia sư' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '10px 18px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                      color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                      border: 'none',
                      borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Active Tab Panel */}
              <div>
                {activeTab === 'materials' && (
                  <CourseMaterials 
                    materials={materials}
                    onDownload={(mat) => alert(`Bắt đầu tải tài liệu: ${mat.title} (${mat.file_type})`)}
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
                    teacherName={course.teacher_name}
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

        {/* Right Column: Progress Checklist & Sidebar */}
        <div style={{ height: '540px', position: 'sticky', top: '20px' }}>
          <ProgressSidebar 
            lessons={lessons}
            currentLessonId={currentLesson.id}
            onSelectLesson={(lesson) => onSelectLesson(courseId, lesson.id)}
            completedLessons={completedLessons}
            isOwned={isOwned}
          />
        </div>

      </div>
    </div>
  );
}
