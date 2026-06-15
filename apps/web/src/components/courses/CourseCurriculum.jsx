import { HiLockClosed, HiPlay, HiCheckCircle } from 'react-icons/hi';

export default function CourseCurriculum({ chapters = [], lessons = [], isOwned, onSelectLesson }) {
  // If chapters list is empty, treat as a single default chapter
  const displayChapters = chapters.length > 0 
    ? [...chapters].sort((a, b) => a.order - b.order) 
    : [{ id: 0, title: "Nội dung giáo trình khóa học", order: 1 }];

  return (
    <div className="card animate-in" style={{ padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
        📋 GIÁO TRÌNH HỌC TẬP CHUYÊN SÂU
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {displayChapters.map(chapter => {
          const chapterLessons = displayChapters.length === 1 && displayChapters[0].id === 0
            ? lessons
            : lessons.filter(l => l.chapter_id === chapter.id);

          if (chapterLessons.length === 0) return null;

          return (
            <div key={chapter.id}>
              {/* Chapter Header */}
              <h4 style={{ 
                fontSize: '13.5px', 
                fontWeight: 'bold', 
                color: 'var(--text-primary)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                margin: '0 0 12px 0',
                background: 'var(--bg-main)',
                padding: '8px 12px',
                borderRadius: '8px',
                borderLeft: '4px solid var(--primary)'
              }}>
                📂 {chapter.title}
              </h4>

              {/* Lessons List in Chapter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '8px' }}>
                {chapterLessons.sort((a, b) => a.order - b.order).map((lesson) => {
                  // Lock lesson if student does not own the course and lesson is not previewable
                  const isLocked = !isOwned && !lesson.is_preview;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => !isLocked && onSelectLesson(lesson)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        background: isLocked ? 'var(--bg-main)' : 'var(--bg-card)',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.75 : 1,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        if (!isLocked) {
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.background = 'var(--primary-bg)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isLocked) {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.background = 'var(--bg-card)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isLocked ? (
                          <HiLockClosed style={{ color: 'var(--text-muted)', fontSize: '16px' }} />
                        ) : isOwned ? (
                          <HiCheckCircle style={{ color: 'var(--accent-green)', fontSize: '18px' }} />
                        ) : (
                          <HiPlay style={{ color: 'var(--primary)', fontSize: '16px' }} />
                        )}

                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block' }}>
                            BÀI {lesson.order}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {lesson.title}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          ⏱ {lesson.duration}
                        </span>

                        {lesson.is_preview && !isOwned && (
                          <span 
                            style={{
                              fontSize: '9px',
                              fontWeight: 'bold',
                              background: 'rgba(16, 185, 129, 0.12)',
                              color: 'var(--accent-green)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase'
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
