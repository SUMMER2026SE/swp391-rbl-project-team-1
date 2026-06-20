import React, { useState } from 'react';
import { 
  HiLockClosed, 
  HiPlay, 
  HiCheckCircle, 
  HiChevronDown, 
  HiDocumentText, 
  HiAcademicCap,
  HiX 
} from 'react-icons/hi';

export default function CurriculumAccordion({ 
  curriculum = [], 
  isOwned, 
  onSelectLesson, 
  completedLessons = [] 
}) {
  const [openChapters, setOpenChapters] = useState({ 0: true });
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);

  const toggleChapter = (index) => {
    setOpenChapters(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getLessonIcon = (type, isCompleted) => {
    if (isCompleted) return <HiCheckCircle className="fts-lesson-icon" style={{ color: '#10B981' }} />;
    switch (type) {
      case 'video': return <HiPlay className="fts-lesson-icon" />;
      case 'quiz': return <HiAcademicCap className="fts-lesson-icon" />;
      case 'document': return <HiDocumentText className="fts-lesson-icon" />;
      default: return <HiPlay className="fts-lesson-icon" />;
    }
  };

  if (!curriculum || curriculum.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--fts-text-secondary)' }}>
        Chương trình học đang được biên soạn.
      </div>
    );
  }

  return (
    <div className="fts-curriculum-accordion">
      {curriculum.map((chapter, chapIdx) => {
        const isOpen = !!openChapters[chapIdx];
        const lessonsCount = chapter.lessons?.length || 0;

        return (
          <div key={chapIdx} className="fts-accordion-section">
            {/* Header row */}
            <div 
              className="fts-accordion-header" 
              onClick={() => toggleChapter(chapIdx)}
            >
              <h4 className="fts-accordion-title">
                Phần {chapIdx + 1}: {chapter.title}
              </h4>
              <HiChevronDown 
                className={`fts-accordion-chevron ${isOpen ? 'open' : ''}`} 
              />
            </div>

            {/* Expanded Body */}
            <div className={`fts-accordion-body ${isOpen ? 'open' : ''}`}>
              <div className="fts-accordion-content animate-in">
                {chapter.lessons?.map((lesson) => {
                  const isLocked = !isOwned && !lesson.isPreview;
                  const isCompleted = completedLessons.includes(Number(lesson.id)) || completedLessons.includes(lesson.id?.toString());

                  const handleLessonClick = () => {
                    if (isLocked) return;
                    if (lesson.isPreview && !isOwned) {
                      setPreviewVideoUrl(lesson.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4");
                    } else if (onSelectLesson) {
                      onSelectLesson(lesson);
                    }
                  };

                  return (
                    <div
                      key={lesson.id}
                      className="fts-lesson-row"
                      style={{ 
                        opacity: isLocked ? 0.6 : 1,
                        cursor: isLocked ? 'not-allowed' : 'pointer'
                      }}
                      onClick={handleLessonClick}
                    >
                      {isLocked ? (
                        <HiLockClosed className="fts-lesson-icon" style={{ color: 'var(--fts-text-muted)' }} />
                      ) : (
                        getLessonIcon(lesson.type, isCompleted)
                      )}
                      
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span 
                          className="fts-lesson-title"
                          style={{
                            color: isLocked ? 'var(--fts-text-muted)' : 'var(--fts-purple)',
                            pointerEvents: isLocked ? 'none' : 'auto'
                          }}
                        >
                          📄 {lesson.title}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--fts-text-secondary)' }}>
                            {lesson.durationMin || lesson.duration || 10} phút
                          </span>
                          {lesson.isPreview && !isOwned && (
                            <span 
                              style={{
                                background: 'var(--fts-discount-bg)',
                                color: 'var(--fts-discount-text)',
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '4px'
                              }}
                            >
                              Học thử
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {/* Video Preview Modal */}
      {previewVideoUrl && (
        <div 
          className="trailer-modal-overlay" 
          onClick={() => setPreviewVideoUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div 
            className="trailer-modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '90%',
              maxWidth: '800px',
              aspectRatio: '16/9',
              background: '#000000',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <button 
              className="trailer-modal-close" 
              onClick={() => setPreviewVideoUrl(null)} 
              aria-label="Close preview"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                color: '#fff',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              <HiX size={20} />
            </button>
            <video
              src={previewVideoUrl}
              controls
              autoPlay
              className="trailer-modal-video"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
