import { useState, useEffect, useMemo } from 'react';
import CourseCard from '../components/courses/CourseCard';
import CourseFilter from '../components/courses/CourseFilter';
import useCourseFilters from '../hooks/useCourseFilters';
import { MOCK_COURSES } from '../data/courses';

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

export default function CoursesPage({ currentUser, onSelectCourse, onCheckoutCourse }) {
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
    sortBy,
    setSortBy,
    clearFilters,
  } = useCourseFilters();

  const [loading, setLoading] = useState(true);

  // Simulate shimmer loading on filter/page transitions
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [debouncedSearch, subject, block, level, sortBy]);

  // Combine filters in memory from standard database courses list
  const filteredCourses = useMemo(() => {
    let result = [...MOCK_COURSES];
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
      result = result.filter(c => c.block === block);
    }

    if (level !== 'All') {
      result = result.filter(c => c.level === level);
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
  }, [debouncedSearch, subject, block, level, sortBy]);

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
          {(search || subject !== 'All' || block !== 'All' || level !== 'All') && (
            <button
              onClick={clearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--emerald-primary)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '13.5px',
                textDecoration: 'underline'
              }}
            >
              Đặt lại tất cả bộ lọc
            </button>
          )}
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
