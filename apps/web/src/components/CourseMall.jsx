import { useState } from 'react';
import { toast } from '../utils/toast';
import { HiSearch, HiAcademicCap, HiStar, HiUsers, HiBookOpen, HiCurrencyDollar, HiCheckCircle } from 'react-icons/hi';
import teacherMathImg from '../assets/teacher_math.png';
import studentLearningImg from '../assets/student_learning.png';
import studentSuccessImg from '../assets/student_success.png';
import educatorsTeamImg from '../assets/educators_team.png';

const getCourseImage = (courseId) => {
  if (courseId === 1) return teacherMathImg;
  if (courseId === 2) return studentLearningImg;
  if (courseId === 3) return studentSuccessImg;
  return educatorsTeamImg;
};

export default function CourseMall({ courses, currentUser, onSelectCourse, onCheckoutCourse }) {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const subjects = ['All', 'Toán học', 'Vật lý', 'Hóa học', 'Tiếng Anh'];

  // Add rich visual mockup info to initial courses
  const decoratedCourses = courses.map(c => {
    const isUnlocked = c.id === 1 || currentUser?.unlockedCourses?.includes(c.id);
    
    // Add realistic visual highlights
    let rating = '4.9';
    let students = '1,240';
    let duration = '45 giờ học';
    let imageBg = 'linear-gradient(135deg, #6C5CE7, #a29bfe)';

    if (c.id === 1) {
      rating = '4.8';
      students = '2,150';
      duration = '32 giờ học';
      imageBg = 'linear-gradient(135deg, #0984E3, #74b9ff)';
    } else if (c.id === 2) {
      rating = '4.9';
      students = '1,890';
      duration = '40 giờ học';
      imageBg = 'linear-gradient(135deg, #e17055, #fab1a0)';
    } else if (c.id === 3) {
      rating = '4.7';
      students = '950';
      duration = '28 giờ học';
      imageBg = 'linear-gradient(135deg, #00b894, #55efc4)';
    }

    return {
      ...c,
      isUnlocked,
      rating,
      students,
      duration,
      imageBg
    };
  });

  const filteredCourses = decoratedCourses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || c.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const unlockedCourses = filteredCourses.filter(c => c.isUnlocked);
  const lockedCourses = filteredCourses.filter(c => !c.isUnlocked);

  return (
    <div className="course-mall-container animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Premium Hero Banner */}
      <div 
        className="premium-hero-banner" 
        style={{ 
          background: 'linear-gradient(135deg, #6C5CE7 0%, #FD79A8 100%)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '36px', 
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(108,92,231,0.25)'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Combo Tiết Kiệm THPTQG 2026
          </span>
          <h1 style={{ fontSize: '26px', fontWeight: '800', marginTop: '14px', marginBottom: '10px', lineHeight: '1.3' }}>
            Chinh Phục Điểm Số Ước Mơ Cùng Đội Ngũ Thủ Khoa & Chuyên Gia
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.5', marginBottom: '24px' }}>
            Học tập thông minh hơn với lộ trình tự động điều chỉnh theo năng lực thực tế. Đăng ký combo học liệu để nhận ưu đãi lên đến 40% học phí.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn-primary" 
              style={{ background: '#fff', color: 'var(--primary)', fontWeight: 'bold', border: 'none', padding: '10px 20px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
              onClick={() => toast('Đăng ký tư vấn combo thành công! EduPath sẽ liên hệ với bạn ngay.', 'success')}
            >
              Tư vấn Combo Pro
            </button>
            <button 
              className="btn-outline" 
              style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff', padding: '10px 20px', borderRadius: 'var(--radius-md)' }}
              onClick={() => setSelectedSubject('All')}
            >
              Khám phá khóa học
            </button>
          </div>
        </div>
        
        {/* Floating gradient circles */}
        <div style={{ position: 'absolute', right: '-50px', bottom: '-50px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', filter: 'blur(30px)' }}></div>
        <div style={{ position: 'absolute', right: '150px', top: '-50px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', filter: 'blur(20px)' }}></div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '18px', display: 'flex', gap: '16px', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Navigation filters */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {subjects.map(subj => (
              <button
                key={subj}
                className={`badge-pill ${selectedSubject === subj ? 'active' : ''}`}
                onClick={() => setSelectedSubject(subj)}
                style={{
                  border: '1px solid var(--border)',
                  background: selectedSubject === subj ? 'var(--primary)' : 'var(--bg-main)',
                  color: selectedSubject === subj ? '#fff' : 'var(--text-secondary)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {subj === 'All' ? 'Tất cả các môn' : subj}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="search-bar" style={{ position: 'relative', width: '300px' }}>
            <HiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '18px' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Tìm tên khóa học, thầy cô..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '38px', width: '100%', fontSize: '13px' }}
            />
          </div>

        </div>
      </div>

      {/* Section 1: My Enrolled Courses */}
      {unlockedCourses.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <HiBookOpen style={{ color: 'var(--primary)', fontSize: '20px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>Khóa học bạn đã tham gia ({unlockedCourses.length})</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {unlockedCourses.map(c => (
              <div 
                key={c.id} 
                className="card landing-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  padding: 0,
                  height: '100%'
                }}
              >
                {/* Course Visual Banner Header */}
                <div style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${getCourseImage(c.id)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: '120px',
                  padding: '16px',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>
                      {c.subject}
                    </span>
                    <span style={{ fontSize: '10.5px', background: 'rgba(34, 197, 94, 0.9)', color: '#fff', fontWeight: 'bold', padding: '3px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      ✓ Đã sở hữu
                    </span>
                  </div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.4)', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>{c.title}</h4>
                </div>

                <div style={{ padding: '16px 20px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>Giảng viên: <strong>{c.teacherName}</strong></p>
                    
                    <div style={{ display: 'flex', gap: '14px', marginTop: '10px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><HiStar style={{ color: '#f1c40f' }} /> {c.rating}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><HiUsers /> {c.students} học viên</span>
                    </div>
                  </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.duration}</span>
                  <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={() => onSelectCourse(c)}>
                    Vào học ngay
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Premium Store Catalog */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <HiAcademicCap style={{ color: 'var(--accent-orange)', fontSize: '20px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>Kho khóa học Premium khuyên học ({lockedCourses.length})</h3>
        </div>

        {lockedCourses.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {lockedCourses.map(c => (
              <div 
                key={c.id} 
                className="card landing-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  position: 'relative',
                  padding: 0,
                  height: '100%'
                }}
              >
                {/* Course Visual Banner Header */}
                <div style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${getCourseImage(c.id)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  height: '140px',
                  padding: '16px',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', width: 'fit-content', padding: '4px 10px', borderRadius: '12px', fontSize: '10.5px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {c.subject}
                  </span>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', textShadow: '0 2px 6px rgba(0,0,0,0.4)', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>{c.title}</h4>
                </div>

                {/* Course Information Details */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Giảng dạy bởi: <strong>{c.teacherName}</strong></p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Số lượng bài giảng: {c.lessons?.length || 0} bài học cao cấp THPTQG</p>
                    
                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><HiStar style={{ color: '#f1c40f' }} /> {c.rating} (Đánh giá cao)</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><HiUsers /> {c.students} học viên</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-line-through', display: 'block' }}>799.000đ</span>
                      <span style={{ fontSize: '17px', color: 'var(--accent-orange)', fontWeight: '800' }}>{c.price}đ</span>
                    </div>
                    
                    <button className="btn-primary" style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #e17055, #fab1a0)', border: 'none', fontSize: '12px' }} onClick={() => onCheckoutCourse(c)}>
                      Mua khóa học
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '30px 20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Không có khóa học Premium nào khác phù hợp với bộ lọc tìm kiếm.</p>
          </div>
        )}
      </div>

      {/* Comprehensive Tuition & Banking Panel */}
      <div 
        className="card animate-in" 
        style={{ 
          marginTop: '24px', 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
          <span style={{ fontSize: '20px' }}>🛡️</span>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
            HƯỚNG DẪN THANH TOÁN & ĐĂNG KÝ HỌC PHÍ (SEPAY SECURED)
          </h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '10px' }}>
              1. Thông tin Tài khoản Ngân hàng
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-main)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Ngân hàng:</span>
                <strong style={{ color: 'var(--text-primary)' }}>ACB (Ngân hàng Á Châu)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Số tài khoản:</span>
                <strong style={{ color: 'var(--text-primary)' }}>18657431</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Chủ tài khoản:</span>
                <strong style={{ color: 'var(--text-primary)' }}>THUAN VAN TRAN</strong>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', marginTop: '4px', borderTop: '1px dashed var(--border)', paddingTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Cú pháp chuyển khoản:</span>
                  <strong style={{ color: 'var(--accent-red)' }}>EP{currentUser?.id || '101'}C[Mã_Khóa_Học]</strong>
                </div>
                <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                  <em>Ví dụ:</em> Nếu mua khóa học mã số <strong>2</strong>, em ghi nội dung chuyển khoản là: <strong style={{ color: 'var(--text-primary)' }}>EP{currentUser?.id || '101'}C2</strong>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-orange)', marginBottom: '10px' }}>
              2. Quy trình Kích hoạt Tự động
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ background: 'var(--primary-bg)', color: 'var(--primary)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</span>
                <span>Học sinh nhấn nút <strong>"Mua khóa học"</strong> để lấy mã QR tự động.</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ background: 'var(--primary-bg)', color: 'var(--primary)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</span>
                <span>Quét QR chuyển khoản qua ngân hàng (chờ Cổng SePay kiểm tra sao kê).</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ background: 'var(--primary-bg)', color: 'var(--primary)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</span>
                <span>Hệ thống tự động kích hoạt quyền sở hữu khóa học ngay sau 3 - 5 giây.</span>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-green)', marginBottom: '10px' }}>
              3. Cam kết An toàn & Hỗ trợ
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              🛡️ **Bảo mật giao dịch:** Mọi khoản thanh toán đều được mã hóa và đối soát hai chiều tự động qua cổng SePay.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '10px', margin: 0 }}>
              📞 **Hỗ trợ khẩn cấp:** Nếu giao dịch gặp sự cố hoặc kích hoạt chậm, vui lòng liên hệ Zalo Hotline: **0901 234 567** để thầy cô hỗ trợ ngay lập tức.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
