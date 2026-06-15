import { HiCheckCircle, HiPlay, HiLockClosed, HiVideoCamera, HiAcademicCap, HiDocumentText } from 'react-icons/hi';

export default function ProgressSidebar({
  curriculum = [],
  currentLessonId,
  onSelectLesson,
  completedLessons = [],
  isOwned
}) {
  // Flatten all lessons to calculate statistics
  const allLessons = curriculum.flatMap(chapter => chapter.lessons) || [];
  const totalCount = allLessons.length;
  
  // Calculate how many of the course's lessons are marked completed
  const completedCount = allLessons.filter(lesson => 
    completedLessons.includes(Number(lesson.id)) || completedLessons.includes(lesson.id.toString())
  ).length;

  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getLessonIcon = (type, isCurrent, isCompleted, isLocked) => {
    if (isLocked) return <HiLockClosed style={{ color: 'var(--stone-text-muted)', fontSize: '15px' }} />;
    if (isCompleted) return <HiCheckCircle style={{ color: 'var(--emerald-primary)', fontSize: '17px' }} />;
    
    switch (type) {
      case 'video': return <HiVideoCamera style={{ color: isCurrent ? 'var(--emerald-primary)' : 'var(--stone-text-secondary)', fontSize: '15px' }} />;
      case 'quiz': return <HiAcademicCap style={{ color: isCurrent ? 'var(--emerald-primary)' : 'var(--stone-text-secondary)', fontSize: '15px' }} />;
      case 'document': return <HiDocumentText style={{ color: isCurrent ? 'var(--emerald-primary)' : 'var(--stone-text-secondary)', fontSize: '15px' }} />;
      default: return <HiPlay style={{ color: isCurrent ? 'var(--emerald-primary)' : 'var(--stone-text-secondary)', fontSize: '15px' }} />;
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1.5px solid var(--border-warm)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-warm-sm)'
      }}
      className="animate-in"
    >
      {/* Sidebar Header progress bar */}
      <div style={{ padding: '20px', borderBottom: '1.5px solid var(--border-warm)', background: 'var(--cream-card)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--stone-text-main)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Tiến độ học tập
        </h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--stone-text-secondary)', fontWeight: '600', marginBottom: '6px' }}>
          <span>Đã hoàn thành {completedCount}/{totalCount} bài học</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        
        <div style={{ width: '100%', height: '8px', background: 'var(--border-warm)', borderRadius: '99px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background: 'var(--emerald-primary)',
              borderRadius: '99px',
              transition: 'width 0.3s ease'
            }}
          ></div>
        </div>
      </div>

      {/* Curriculum list grouped by chapter/section */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {curriculum.map((chapter, chapIdx) => (
          <div key={chapIdx} style={{ marginBottom: '18px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--stone-text-secondary)', margin: '0 0 8px 4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {chapter.title}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {chapter.lessons.map((lesson) => {
                const isCurrent = currentLessonId?.toString() === lesson.id.toString();
                const isCompleted = completedLessons.includes(Number(lesson.id)) || completedLessons.includes(lesson.id.toString());
                const isLocked = !isOwned && !lesson.isPreview;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => !isLocked && onSelectLesson && onSelectLesson(lesson)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: isCurrent 
                        ? 'var(--emerald-light)' 
                        : (isLocked ? '#fafaf9' : 'transparent'),
                      border: isCurrent ? '1.5px solid rgba(5, 150, 105, 0.25)' : '1.5px solid transparent',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      opacity: isLocked ? 0.6 : 1,
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '82%' }}>
                      {getLessonIcon(lesson.type, isCurrent, isCompleted, isLocked)}

                      <div style={{ overflow: 'hidden', width: '100%' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: isCurrent ? '800' : '600',
                            color: isCurrent ? 'var(--emerald-primary)' : 'var(--stone-text-main)',
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

                    <span style={{ fontSize: '10.5px', color: 'var(--stone-text-muted)', fontWeight: '600' }}>
                      {lesson.durationMin}m
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
