import { useState, useEffect } from 'react';
import CourseCard from '../components/courses/CourseCard';
import CourseFilter from '../components/courses/CourseFilter';
import { courseService } from '../services/courseService';

export default function CoursesPage({ currentUser, onSelectCourse, onCheckoutCourse }) {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    subject: 'All',
    priceRange: 'All',
    level: 'All',
    sortBy: 'popular'
  });

  const loadCourses = async () => {
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
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    let result = [...courses];

    // Search filter
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.teacher_name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
    }

    // Subject filter
    if (filters.subject !== 'All') {
      result = result.filter(c => c.subject === filters.subject);
    }

    // Level filter
    if (filters.level !== 'All') {
      // Map level selections to subject groups or course badges as an approximation
      if (filters.level === 'Beginner') {
        result = result.filter(c => c.price < 400000 || c.badge === 'New');
      } else if (filters.level === 'Intermediate') {
        result = result.filter(c => c.badge === 'Recommended' || c.rating >= 4.8);
      } else if (filters.level === 'Advanced') {
        result = result.filter(c => c.badge === 'Best seller' || c.price >= 490000);
      } else if (filters.level === 'Sprint') {
        result = result.filter(c => c.badge === 'Hot' || c.title.includes('tốc') || c.title.includes('đề'));
      }
    }

    // Price range filter
    if (filters.priceRange !== 'All') {
      if (filters.priceRange === 'Free') {
        result = result.filter(c => c.price === 0);
      } else if (filters.priceRange === 'Paid') {
        result = result.filter(c => c.price > 0);
      } else if (filters.priceRange === 'Under500') {
        result = result.filter(c => c.price < 500000);
      } else if (filters.priceRange === '500to1M') {
        result = result.filter(c => c.price >= 500000 && c.price <= 1000000);
      } else if (filters.priceRange === 'Above1M') {
        result = result.filter(c => c.price > 1000000);
      }
    }

    // Sorting logic
    if (filters.sortBy === 'popular') {
      result.sort((a, b) => b.student_count - a.student_count);
    } else if (filters.sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id);
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (filters.sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredCourses(result);
  }, [filters, courses]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto', padding: '0 16px' }} className="animate-in">
      {/* Header Banner Section */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
          borderRadius: '20px',
          padding: '36px 40px',
          color: '#fff',
          boxShadow: '0 8px 20px rgba(108,92,231,0.15)'
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 'bold', background: 'rgba(255, 255, 255, 0.2)', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '12px' }}>
          Hệ thống đào tạo trực tuyến chuẩn THPT Quốc Gia
        </span>
        <h2 style={{ fontSize: '26px', fontWeight: '950', margin: '0 0 8px 0', color: '#fff' }}>
          KHO KHÓA HỌC CHUYÊN ĐỀ 12
        </h2>
        <p style={{ fontSize: '13.5px', color: '#f3e8ff', margin: 0, maxWidth: '600px', lineHeight: '1.5' }}>
          Được biên soạn bởi đội ngũ giảng viên giàu kinh nghiệm từ FPT và các trường đại học lớn. Học kết hợp Gia sư AI EduBot 24/7 để tối ưu điểm số của bạn.
        </p>
      </div>

      {/* Filter Section */}
      <CourseFilter onFilterChange={setFilters} />

      {/* Course Cards Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} style={{ height: '380px', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '24px', animation: 'spin 2s linear infinite' }}>⏳</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>Đang tải khóa học...</div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {filteredCourses.map(course => {
            const isOwned = currentUser?.unlockedCourses?.includes(course.id);
            return (
              <CourseCard
                key={course.id}
                course={course}
                isOwned={isOwned}
                onSelect={onSelectCourse}
                onPurchase={onCheckoutCourse}
              />
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '48px' }}>📂</span>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '14px 0 6px 0' }}>Không tìm thấy khóa học nào</h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>Vui lòng thay đổi từ khóa tìm kiếm hoặc bỏ bớt các bộ lọc để hiển thị nhiều kết quả hơn.</p>
        </div>
      )}
    </div>
  );
}
