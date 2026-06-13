import { useState, useEffect } from 'react';
import CourseCard from '../components/courses/CourseCard';
import CourseFilter from '../components/courses/CourseFilter';
import { courseService } from '../services/courseService';

const STATS = [
  { value: '50,000+', label: 'Học sinh', icon: '👨‍🎓' },
  { value: '500+',    label: 'Khóa học',  icon: '📚' },
  { value: '200+',    label: 'Giáo viên', icon: '👩‍🏫' },
  { value: '95%',     label: 'Đạt mục tiêu', icon: '🎯' },
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
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    subject: 'All',
    priceRange: 'All',
    level: 'All',
    sortBy: 'popular',
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await courseService.getCourses();
        setCourses(data || []);
        setFilteredCourses(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let result = [...courses];
    const q = filters.search.trim().toLowerCase();

    if (q) {
      result = result.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.teacher_name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }

    if (filters.subject !== 'All') result = result.filter(c => c.subject === filters.subject);

    if (filters.level !== 'All') {
      if (filters.level === 'Beginner')     result = result.filter(c => c.price < 400000 || c.badge === 'New');
      if (filters.level === 'Intermediate') result = result.filter(c => c.badge === 'Recommended' || c.rating >= 4.8);
      if (filters.level === 'Advanced')     result = result.filter(c => c.badge === 'Best seller' || c.price >= 490000);
      if (filters.level === 'Sprint')       result = result.filter(c => c.badge === 'Hot' || c.title?.includes('tốc') || c.title?.includes('đề'));
    }

    if (filters.priceRange !== 'All') {
      if (filters.priceRange === 'Free')     result = result.filter(c => c.price === 0);
      if (filters.priceRange === 'Paid')     result = result.filter(c => c.price > 0);
      if (filters.priceRange === 'Under500') result = result.filter(c => c.price < 500000);
      if (filters.priceRange === '500to1M')  result = result.filter(c => c.price >= 500000 && c.price <= 1000000);
      if (filters.priceRange === 'Above1M')  result = result.filter(c => c.price > 1000000);
    }

    if (filters.sortBy === 'popular')   result.sort((a, b) => b.student_count - a.student_count);
    if (filters.sortBy === 'newest')    result.sort((a, b) => b.id - a.id);
    if (filters.sortBy === 'rating')    result.sort((a, b) => b.rating - a.rating);
    if (filters.sortBy === 'price_asc') result.sort((a, b) => a.price - b.price);
    if (filters.sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);

    setFilteredCourses(result);
  }, [filters, courses]);

  return (
    <div className="cp-page">

      {/* ── HERO ── */}
      <div className="cp-hero">
        <div className="cp-hero__left">
          <span className="cp-hero__eyebrow">Nền tảng học trực tuyến hàng đầu Việt Nam</span>
          <h1 className="cp-hero__title">
            Khóa học luyện thi<br />
            <span className="cp-hero__title-accent">THPT Quốc Gia</span>
          </h1>
          <p className="cp-hero__desc">
            Học cùng đội ngũ giáo viên chuyên môn cao, hệ thống bài tập chuẩn cấu trúc Bộ GD&ĐT và AI Gia sư 24/7.
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
              alt="Học sinh học cùng EduPath AI"
              className="cp-hero__img"
              onError={e => { e.target.style.display = 'none'; }}
            />
            {/* Floating trust badge */}
            <div className="cp-hero__trust-badge">
              <span className="cp-hero__trust-stars">★★★★★</span>
              <div>
                <strong>4.9/5</strong>
                <span>từ 12,400+ đánh giá</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER ── */}
      <div className="cp-section">
        <CourseFilter onFilterChange={setFilters} />
      </div>

      {/* ── RESULTS HEADER ── */}
      {!loading && (
        <div className="cp-results-header">
          <span className="cp-results-count">
            {filteredCourses.length} khóa học
            {filters.subject !== 'All' ? ` · ${filters.subject}` : ''}
          </span>
        </div>
      )}

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
                isOwned={currentUser?.unlockedCourses?.includes(course.id)}
                onSelect={onSelectCourse}
                onPurchase={onCheckoutCourse}
              />
            ))}
          </div>
        ) : (
          <div className="cp-empty">
            <div className="cp-empty__icon">
              <svg viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="28" r="18" stroke="#D1D5DB" strokeWidth="3" />
                <path d="M44 44l12 12" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="cp-empty__title">Không tìm thấy khóa học</h3>
            <p className="cp-empty__desc">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>

    </div>
  );
}
