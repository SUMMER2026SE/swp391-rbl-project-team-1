import { useState, useEffect, useMemo } from 'react';
import CourseCard from '../components/courses/CourseCard';
import CourseFilter, { BLOCK_SUBJECTS_MAP } from '../components/courses/CourseFilter';
import useCourseFilters from '../hooks/useCourseFilters';
import { api } from '../api';
import { mapDatabaseCourseToMockFormat } from '../utils/courseMapper';

const STATS = [
  { value: '50.000+', label: 'Học viên tin tưởng', icon: '👨‍🎓' },
  { value: '100+',    label: 'Bài giảng chuyên sâu', icon: '📚' },
  { value: '20+',     label: 'Giảng viên chuyên môn', icon: '👩‍🏫' },
  { value: '98%',     label: 'Tỷ lệ đạt mục tiêu', icon: '🎯' },
];

function SkeletonCard() {
  return (
    <div className="cc-skeleton">
      <div className="cc-skeleton__thumb" />
      <div className="cc-skeleton__body">
        <div className="cc-skeleton__line cc-skeleton__line--short" />
        <div className="cc-skeleton__line" />
        <div className="cc-skeleton__line cc-skeleton__line--mid" />
        <div className="cc-skeleton__line cc-skeleton__line--short" />
      </div>
    </div>
  );
}

export default function CoursesPage({ currentUser, onSelectCourse, onCheckoutCourse, isDashboard = false }) {
  const {
    search,
    setSearch,
    debouncedSearch,
    subject,
    setSubject,
    block,
    setBlock,
    level,
    setLevel,
    priceType,
    setPriceType,
    sortBy,
    setSortBy,
    clearFilters,
  } = useCourseFilters();

  const [courses, setCourses] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [transitionLoading, setTransitionLoading] = useState(false);

  // Load courses from backend API on mount
  useEffect(() => {
    let active = true;
    setInitialLoading(true);
    api.getCourses()
      .then(res => {
        if (active && res) {
          const mapped = res.map(mapDatabaseCourseToMockFormat);
          
          // Compute progress if logged in
          if (currentUser) {
            const uId = parseInt(currentUser.id, 10);
            const allProgress = JSON.parse(localStorage.getItem('supabase_mock_lesson_progress')) || [];
            const progressList = allProgress
              .filter(p => p.student_id === uId && p.is_completed)
              .map(p => p.lesson_id);
            const allLessons = JSON.parse(localStorage.getItem('supabase_mock_lessons')) || [];
            
            mapped.forEach(c => {
              const courseLessons = allLessons.filter(l => l.course_id === c.id);
              const totalLessons = c.lesson_count || courseLessons.length || 5;
              const completedLessons = courseLessons.filter(l => progressList.includes(l.id)).length;
              c.progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            });
          }
          
          setCourses(mapped);
        }
        if (active) setInitialLoading(false);
      })
      .catch(err => {
        console.error('Failed to load courses from database API:', err);
        if (active) setInitialLoading(false);
      });
    return () => { active = false; };
  }, [currentUser]);

  // Simulate shimmer loading on filter/page transitions
  useEffect(() => {
    if (initialLoading) return;
    setTransitionLoading(true);
    const timer = setTimeout(() => {
      setTransitionLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedSearch, subject, block, level, priceType, sortBy, initialLoading]);

  const loading = initialLoading || transitionLoading;

  // Combine filters in memory from standard database courses list
  const filteredCourses = useMemo(() => {
    let result = [...courses];
    const q = debouncedSearch.trim().toLowerCase();

    if (q) {
      result = result.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.instructor?.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }

    if (subject !== 'All') {
      result = result.filter(c => c.subject === subject);
    }

    if (block !== 'All') {
      const allowedSubjects = BLOCK_SUBJECTS_MAP[block] || [];
      result = result.filter(c => allowedSubjects.includes(c.subject));
    }

    if (level !== 'All') {
      result = result.filter(c => c.level === level);
    }

    if (priceType !== 'All') {
      if (priceType === 'registered') {
        result = result.filter(c => {
          const isOwned = currentUser?.unlockedCourses?.includes(Number(c.id)) || currentUser?.unlockedCourses?.includes(c.id) || currentUser?.unlockedCourses?.includes(String(c.id));
          return isOwned;
        });
      } else if (priceType === 'free') {
        result = result.filter(c => c.priceSale === 0);
      } else if (priceType === 'paid') {
        result = result.filter(c => c.priceSale > 0);
      }
    }

    // Sort operations
    if (sortBy === 'popular') {
      result.sort((a, b) => b.studentCount - a.studentCount);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => a.priceSale - b.priceSale);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.priceSale - a.priceSale);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => Number(b.id) - Number(a.id));
    }

    return result;
  }, [courses, debouncedSearch, subject, block, level, priceType, sortBy, currentUser]);

  if (isDashboard) {
    const myCourses = courses.filter(c => {
      const cId = Number(c.id);
      return currentUser?.unlockedCourses?.includes(cId) ||
             currentUser?.unlockedCourses?.includes(c.id) ||
             currentUser?.unlockedCourses?.includes(String(cId));
    });

    const getSubjectColorClass = (subj) => {
      const s = (subj || '').toLowerCase().trim();
      if (s === 'toán học') return 'var(--subject-toan)';
      if (s === 'vật lý') return 'var(--subject-ly)';
      if (s === 'hóa học') return 'var(--subject-hoa)';
      if (s === 'ngữ văn') return 'var(--subject-van)';
      if (s === 'tiếng anh') return 'var(--subject-anh)';
      if (s === 'sinh học') return 'var(--subject-sinh)';
      if (s === 'lịch sử') return 'var(--subject-su)';
      if (s === 'địa lý') return 'var(--subject-dia)';
      return 'var(--subject-gdcd)';
    };

    return (
      <div className="cp-page-container cp-page-container--dashboard">
        <div className="cp-page animate-in">
          
          {/* ── SECTION 1: MY COURSES ── */}
          <div className="cp-section db-my-courses-section">
            <div className="db-section-header">
              <h2 className="db-section-title">📚 Khóa học của em</h2>
              <span className="db-section-subtitle">Tiếp tục học tập để hoàn thành mục tiêu</span>
            </div>
            
            {myCourses.length > 0 ? (
              <div className="db-my-courses-grid">
                {myCourses.map(course => (
                  <div key={course.id} className="db-my-course-card" onClick={() => onSelectCourse(course)}>
                    <div className="db-my-course-card__header">
                      <div className="db-my-course-card__badge" style={{ backgroundColor: getSubjectColorClass(course.subject) }}>
                        {course.subject}
                      </div>
                      <span className="db-my-course-card__level">{course.level}</span>
                    </div>
                    
                    <h3 className="db-my-course-card__title">{course.title}</h3>
                    <p className="db-my-course-card__instructor">Giảng viên: {course.instructor?.name || course.teacherName}</p>
                    
                    <div className="db-my-course-card__progress-section">
                      <div className="db-my-course-card__progress-label">
                        <span>Tiến độ học</span>
                        <strong>{course.progressPercent || 0}%</strong>
                      </div>
                      <div className="db-my-course-card__progress-bar-bg">
                        <div className="db-my-course-card__progress-bar-fill" style={{ width: `${course.progressPercent || 0}%` }} />
                      </div>
                    </div>
                    
                    <button className="db-my-course-card__btn">
                      Học tiếp →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="db-my-courses-empty">
                <span className="db-my-courses-empty__icon">📚</span>
                <h4>Em chưa tham gia khóa học nào!</h4>
                <p>Khám phá các khóa học đầy đủ kiến thức bên dưới để bắt đầu học nhé.</p>
              </div>
            )}
          </div>
          
          <hr className="db-divider" />
          
          {/* ── SECTION 2: EXPLORE COURSES ── */}
          <div className="cp-section db-explore-section">
            <div className="db-section-header">
              <h2 className="db-section-title">🔍 Khám phá khóa học mới</h2>
              <span className="db-section-subtitle">Tìm kiếm khóa học phù hợp với khối thi và trình độ của em</span>
            </div>
            
            <CourseFilter
              search={search}
              setSearch={setSearch}
              subject={subject}
              setSubject={setSubject}
              block={block}
              setBlock={setBlock}
              level={level}
              setLevel={setLevel}
              priceType={priceType}
              setPriceType={setPriceType}
              sortBy={sortBy}
              setSortBy={setSortBy}
              clearFilters={clearFilters}
            />
            
            <div className="cp-results-header" style={{ marginTop: '24px' }}>
              <span className="cp-results-count">
                Tìm thấy {filteredCourses.length} khóa học phù hợp
                {subject !== 'All' ? ` môn ${subject}` : ''}
                {block !== 'All' ? ` · ${block}` : ''}
              </span>
            </div>
            
            {loading ? (
              <div className="cp-grid">
                {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="cp-grid">
                {filteredCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isOwned={currentUser?.unlockedCourses?.includes(Number(course.id)) || currentUser?.unlockedCourses?.includes(course.id)}
                    onSelect={onSelectCourse}
                    onPurchase={onCheckoutCourse}
                  />
                ))}
              </div>
            ) : (
              <div className="cp-empty">
                <div className="cp-empty__icon">🔍</div>
                <h3 className="cp-empty__title">Không tìm thấy khóa học phù hợp</h3>
                <p className="cp-empty__desc">
                  Rất tiếc, các bộ lọc hiện tại của em không khớp với bất kỳ khóa học nào. Hãy thử thay đổi từ khóa hoặc bộ lọc nhé.
                </p>
                <button className="cp-empty__btn" onClick={clearFilters}>
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    );
  }

  return (
    <div className="cp-page-container">
      <div className="cp-page animate-in">
        {/* ── HERO BANNER ── */}
        <div className="cp-hero">
          <div className="cp-hero__left">
            <span className="cp-hero__eyebrow">Nền tảng học trực tuyến thích ứng AI hàng đầu</span>
            <h1 className="cp-hero__title">
              Khóa học luyện thi<br />
              <span className="cp-hero__title-accent">THPT Quốc Gia 2026</span>
            </h1>
            <p className="cp-hero__desc">
              Hệ thống bài giảng chuyên sâu bám sát cấu trúc Bộ Giáo dục, kết hợp ngân hàng đề phong phú và Trợ lý ảo AI chấm điểm chẩn đoán học thuật 24/7.
            </p>

            {/* Stats */}
            <div className="cp-stats">
              {STATS.map((s) => (
                <div key={s.label} className="cp-stat">
                  <div className="cp-stat__value">{s.value}</div>
                  <div className="cp-stat__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="cp-hero__right">
            <div className="cp-hero__img-wrap">
              <img
                src="/course_hero_students.png"
                alt="Học sinh ôn tập thi cử cùng EduPath"
                className="cp-hero__img"
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop';
                }}
              />
              {/* Floating trust badge */}
              <div className="cp-hero__trust-badge">
                <span className="cp-hero__trust-stars">★★★★★</span>
                <div>
                  <strong>4.95/5 Điểm Đánh giá</strong>
                  <span>từ 15,200+ học viên ôn thi</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FILTER TOOLBAR ── */}
        <div className="cp-section">
          <CourseFilter
            search={search}
            setSearch={setSearch}
            subject={subject}
            setSubject={setSubject}
            block={block}
            setBlock={setBlock}
            level={level}
            setLevel={setLevel}
            priceType={priceType}
            setPriceType={setPriceType}
            sortBy={sortBy}
            setSortBy={setSortBy}
            clearFilters={clearFilters}
          />
        </div>

        {/* ── RESULTS HEADER ── */}
        <div className="cp-results-header">
          <span className="cp-results-count">
            Tìm thấy {filteredCourses.length} khóa học phù hợp
            {subject !== 'All' ? ` môn ${subject}` : ''}
            {block !== 'All' ? ` · ${block}` : ''}
          </span>
        </div>

        {/* ── COURSE GRID ── */}
        <div className="cp-section">
          {loading ? (
            <div className="cp-grid">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="cp-grid">
              {filteredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isOwned={currentUser?.unlockedCourses?.includes(Number(course.id)) || currentUser?.unlockedCourses?.includes(course.id)}
                  onSelect={onSelectCourse}
                  onPurchase={onCheckoutCourse}
                />
              ))}
            </div>
          ) : (
            <div className="cp-empty">
              <div className="cp-empty__icon">🔍</div>
              <h3 className="cp-empty__title">Không tìm thấy khóa học phù hợp</h3>
              <p className="cp-empty__desc">
                Rất tiếc, các bộ lọc hiện tại của em không khớp với bất kỳ khóa học nào. Hãy thử thay đổi từ khóa hoặc bộ lọc nhé.
              </p>
              <button className="cp-empty__btn" onClick={clearFilters}>
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
