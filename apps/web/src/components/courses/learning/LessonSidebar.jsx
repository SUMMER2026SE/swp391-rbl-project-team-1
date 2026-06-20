import React, { useState, useMemo } from 'react';
import { HiCheckCircle, HiPlay, HiLockClosed, HiChevronDown, HiChevronUp } from 'react-icons/hi';

export default function LessonSidebar({
  curriculum = [],
  currentLessonId,
  onSelectLesson,
  completedLessons = [],
  isOwned,
  courseTitle = 'Khóa học'
}) {
  const [filterMode, setFilterMode] = useState('ALL');
  const [openChapters, setOpenChapters] = useState({ 0: true });

  const toggleChapter = (idx) => {
    setOpenChapters(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const allLessons = useMemo(() => {
    return curriculum.flatMap(chapter => chapter.lessons) || [];
  }, [curriculum]);

  const totalCount = allLessons.length;
  const completedCount = useMemo(() => {
    return allLessons.filter(lesson => 
      completedLessons.includes(Number(lesson.id)) || completedLessons.includes(lesson.id.toString())
    ).length;
  }, [allLessons, completedLessons]);

  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleDownloadMaterials = () => {
    window.dispatchEvent(new CustomEvent('edupath-download-materials'));
  };

  return (
    <div className="lesson-sidebar">
      <div className="lesson-sidebar__header">
        <h4 className="lesson-sidebar__course-title" title={courseTitle}>
          {courseTitle}
        </h4>
        <div className="lesson-sidebar__progress-info">
          <span>Đã hoàn thành {completedCount}/{totalCount} bài học</span>
          <strong>{Math.round(progressPct)}%</strong>
        </div>
        <div className="lesson-sidebar__progress-bar-bg">
          <div
            className="lesson-sidebar__progress-bar-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="lesson-sidebar__filters">
        <button
          type="button"
          onClick={() => setFilterMode('ALL')}
          className={`filter-btn ${filterMode === 'ALL' ? 'filter-btn--active' : ''}`}
        >
          Tất cả
        </button>
        <button
          type="button"
          onClick={() => setFilterMode('INCOMPLETE')}
          className={`filter-btn ${filterMode === 'INCOMPLETE' ? 'filter-btn--active' : ''}`}
        >
          Chưa xong
        </button>
      </div>

      <div className="lesson-sidebar__chapters-list">
        {curriculum.map((chapter, chapIdx) => {
          const isOpen = !!openChapters[chapIdx];
          const filteredLessons = (chapter.lessons || []).filter(l => {
            if (filterMode === 'INCOMPLETE') {
              return !completedLessons.includes(Number(l.id)) && !completedLessons.includes(l.id.toString());
            }
            return true;
          });

          if (filteredLessons.length === 0 && filterMode !== 'ALL') return null;

          return (
            <div key={chapIdx} className="sidebar-chapter">
              <div className="sidebar-chapter__header" onClick={() => toggleChapter(chapIdx)}>
                <span className="sidebar-chapter__title" title={chapter.title}>
                  Chương {chapIdx + 1}: {chapter.title}
                </span>
                {isOpen ? <HiChevronUp /> : <HiChevronDown />}
              </div>

              {isOpen && (
                <div className="sidebar-chapter__lessons animate-in">
                  {filteredLessons.map((lesson) => {
                    const isCurrent = currentLessonId?.toString() === lesson.id.toString();
                    const isCompleted = completedLessons.includes(Number(lesson.id)) || completedLessons.includes(lesson.id.toString());
                    const isLocked = !isOwned && !lesson.isPreview;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => !isLocked && onSelectLesson && onSelectLesson(lesson)}
                        className={`sidebar-lesson-row ${isCurrent ? 'sidebar-lesson-row--current' : ''} ${isLocked ? 'sidebar-lesson-row--locked' : ''}`}
                      >
                        <div className="sidebar-lesson-row__left">
                          <span className="sidebar-lesson-row__icon-box">
                            {isLocked ? (
                              <HiLockClosed className="sidebar-lesson-icon sidebar-lesson-icon--locked" />
                            ) : isCompleted ? (
                              <HiCheckCircle className="sidebar-lesson-icon sidebar-lesson-icon--completed" />
                            ) : (
                              <HiPlay className="sidebar-lesson-icon" />
                            )}
                          </span>
                          <span className="sidebar-lesson-row__title" title={lesson.title}>
                            {lesson.title}
                          </span>
                        </div>
                        <span className="sidebar-lesson-row__duration">
                          {lesson.durationMin || lesson.duration || 10}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="lesson-sidebar__footer">
        <button
          type="button"
          onClick={handleDownloadMaterials}
          className="sidebar-download-btn"
        >
          Tải xuống tài liệu khóa học
        </button>
      </div>
    </div>
  );
}
