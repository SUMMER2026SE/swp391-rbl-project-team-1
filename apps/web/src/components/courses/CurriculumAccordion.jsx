import { useState } from 'react';
import { HiLockClosed, HiPlay, HiCheckCircle, HiVideoCamera, HiChevronDown, HiDocumentText, HiAcademicCap, HiFolderOpen } from 'react-icons/hi';

export default function CurriculumAccordion({ curriculum = [], isOwned, onSelectLesson, completedLessons = [] }) {
  const [openChapters, setOpenChapters] = useState({ 0: true }); // Chapter index 0 is open by default

  const toggleChapter = (index) => {
    setOpenChapters(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <HiVideoCamera />;
      case 'quiz': return <HiAcademicCap />;
      case 'document': return <HiDocumentText />;
      default: return <HiPlay />;
    }
  };

  if (!curriculum || curriculum.length === 0) {
    return (
      <div style={{ padding: '16px', color: 'var(--stone-text-secondary)', fontSize: '13px', textAlign: 'center' }}>
        Chưa có chương trình giảng dạy chi tiết cho khóa học này.
      </div>
    );
  }

  return (
    <div className="curric-accordion">
      {curriculum.map((chapter, chapIdx) => {
        const isOpen = !!openChapters[chapIdx];
        return (
          <div key={chapIdx} className={`curric-chapter ${isOpen ? 'curric-chapter--open' : ''}`} style={{ marginBottom: '12px' }}>
            <div className="curric-chapter__header" onClick={() => toggleChapter(chapIdx)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HiFolderOpen style={{ color: 'var(--emerald-primary)', fontSize: '18px' }} />
                <strong>{chapter.title}</strong>
              </span>
              <span className="curric-chapter__toggle-icon">
                <HiChevronDown />
              </span>
            </div>

            {isOpen && (
              <div className="curric-chapter__lessons animate-in">
                {chapter.lessons.map((lesson) => {
                  const isLocked = !isOwned && !lesson.isPreview;
                  const isCompleted = completedLessons.includes(Number(lesson.id)) || completedLessons.includes(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      className={`curric-lesson ${isLocked ? 'curric-lesson--locked' : ''}`}
                      onClick={() => !isLocked && onSelectLesson && onSelectLesson(lesson)}
                    >
                      <div className="curric-lesson__left">
                        <span className="curric-lesson__icon" style={{ color: isLocked ? 'var(--stone-text-muted)' : 'var(--emerald-primary)' }}>
                          {isLocked ? <HiLockClosed /> : isCompleted ? <HiCheckCircle style={{ color: 'var(--emerald-primary)' }} /> : getLessonIcon(lesson.type)}
                        </span>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: isLocked ? 'var(--stone-text-secondary)' : 'var(--stone-text-main)' }}>
                            {lesson.title}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--stone-text-muted)', display: 'block', textTransform: 'capitalize' }}>
                            Loại: {lesson.type === 'video' ? 'Video' : lesson.type === 'quiz' ? 'Trắc nghiệm' : 'Tài liệu'}
                          </span>
                        </div>
                      </div>

                      <div className="curric-lesson__meta">
                        <span style={{ fontSize: '12px', color: 'var(--stone-text-muted)' }}>
                          ⏱ {lesson.durationMin} phút
                        </span>

                        {lesson.isPreview && !isOwned && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: '800',
                              backgroundColor: 'var(--emerald-light)',
                              color: 'var(--emerald-primary)',
                              padding: '2px 8px',
                              borderRadius: '99px',
                              textTransform: 'uppercase',
                              border: '1px solid rgba(5, 150, 105, 0.1)'
                            }}
                          >
                            Học thử
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
