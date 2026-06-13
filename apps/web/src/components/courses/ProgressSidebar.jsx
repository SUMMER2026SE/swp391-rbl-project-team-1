import { HiCheckCircle, HiPlay, HiLockClosed } from 'react-icons/hi';

export default function ProgressSidebar({ lessons, currentLessonId, onSelectLesson, completedLessons = [], isOwned }) {
  const completedCount = completedLessons.length;
  const progressPct = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }} className="animate-in">
      {/* Header */}
      <div style={{ padding: '18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 10px 0' }}>
          Tiến độ khóa học
        </h3>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
          <span>Đã hoàn thành {completedCount}/{lessons.length} bài</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      {/* Lesson List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {lessons.map((lesson, index) => {
          const isCurrent = lesson.id === currentLessonId;
          const isCompleted = completedLessons.includes(lesson.id);
          const isLocked = !isOwned && !lesson.is_preview;

          return (
            <div
              key={lesson.id}
              onClick={() => !isLocked && onSelectLesson(lesson)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '6px',
                background: isCurrent 
                  ? 'var(--primary-bg)' 
                  : (isLocked ? 'var(--bg-main)' : 'transparent'),
                border: isCurrent ? '1px solid var(--primary)' : '1px solid transparent',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '80%' }}>
                {isLocked ? (
                  <HiLockClosed style={{ color: 'var(--text-muted)', fontSize: '16px', flexShrink: 0 }} />
                ) : isCompleted ? (
                  <HiCheckCircle style={{ color: 'var(--accent-green)', fontSize: '18px', flexShrink: 0 }} />
                ) : (
                  <HiPlay style={{ color: isCurrent ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '16px', flexShrink: 0 }} />
                )}

                <div style={{ overflow: 'hidden' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>
                    Bài {lesson.order}
                  </span>
                  <span 
                    style={{ 
                      fontSize: '12px', 
                      fontWeight: isCurrent ? 'bold' : 'normal', 
                      color: isCurrent ? 'var(--primary)' : 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block'
                    }}
                    title={lesson.title}
                  >
                    {lesson.title}
                  </span>
                </div>
              </div>

              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                {lesson.duration}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
