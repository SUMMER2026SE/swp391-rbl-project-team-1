import { useState, useEffect, useRef } from 'react';
import { HiCheck as CheckIcon, HiPlay as PlayIcon, HiX as CloseIcon, HiSparkles as SparkleIcon, HiAcademicCap as AcademicIcon, HiUserGroup as GroupIcon, HiStar as StarIcon } from 'react-icons/hi';
import teacherMathImg from '../assets/teacher_math.png';
import studentLearningImg from '../assets/student_learning.png';
import student3dStudyImg from '../assets/student_3d_study.png';
import sunMascotImg from '../assets/sun_mascot.png';
import educatorsTeamImg from '../assets/educators_team.png';

export default function UnifiedJourneySection({
  teacherVideoUrl = null,
  studentVideoUrl = null,
  onNavigateToAuth,
  navigateTo
}) {
  const [activeVideoModal, setActiveVideoModal] = useState(null); // 'teacher' | 'student' | null

  // Intersection Observer for scroll animation
  const headerRef = useRef(null);
  const block1Ref = useRef(null);
  const block2Ref = useRef(null);

  const [visible, setVisible] = useState({
    header: false,
    block1: false,
    block2: false
  });

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px -10% -10% 0px',
      threshold: 0.1
    };

    const handleIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const targetId = entry.target.getAttribute('data-animate-id');
          if (targetId) {
            setVisible(prev => ({ ...prev, [targetId]: true }));
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    if (headerRef.current) observer.observe(headerRef.current);
    if (block1Ref.current) observer.observe(block1Ref.current);
    if (block2Ref.current) observer.observe(block2Ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="ujs-root" style={{
      background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 50%, #F1F5F9 100%)',
      padding: '48px 0 60px 0',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>

      {/* Decorative Subtle Background Grids / Glows */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '1000px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, rgba(255, 255, 255, 0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="lp-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* ── SECTION HEADER (Fades in from top) ── */}
        <div 
          ref={headerRef}
          data-animate-id="header"
          style={{ 
            textAlign: 'center', 
            marginBottom: '36px',
            opacity: visible.header ? 1 : 0,
            transform: visible.header ? 'translateY(0)' : 'translateY(-20px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Top Plant/Laptop Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#EEF2FF',
            border: '1.5px solid #C7D2FE',
            padding: '6px 14px',
            borderRadius: '30px',
            marginBottom: '12px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)'
          }}>
            <span style={{ fontSize: '16px' }}>🌱</span>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#4338CA', letterSpacing: '0.4px' }}>
              HỆ THỐNG KẾT NỐI TOÀN DIỆN
            </span>
            <span style={{ fontSize: '14px' }}>💻</span>
          </div>

          <h2 style={{
            fontSize: '32px',
            fontWeight: '900',
            color: '#1E1B4B',
            lineHeight: '1.3',
            maxWidth: '850px',
            margin: '0 auto 12px auto',
            letterSpacing: '-0.8px'
          }}>
            Tất cả được kết nối trong <br />
            <span style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #4338CA 50%, #6D28D9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              một hành trình ôn luyện thông minh & thống nhất.
            </span>
          </h2>

          <p style={{
            fontSize: '14.5px',
            color: '#64748B',
            maxWidth: '650px',
            margin: '0 auto',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            EduPath AI đồng bộ trực tuyến giữa giáo án luyện thi của Giáo viên và lộ trình tiếp thu cá nhân hóa của Học sinh, giúp tăng hiệu quả học tập vượt bậc.
          </p>
        </div>


        {/* ── BLOCK 1: TEACHER EXPERIENCE (Slides in from left) ── */}
        <div 
          ref={block1Ref}
          data-animate-id="block1"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
            gap: '40px',
            alignItems: 'center',
            marginBottom: '48px'
          }}
        >
          {/* Left Content Column */}
          <div style={{
            opacity: visible.block1 ? 1 : 0,
            transform: visible.block1 ? 'translateX(0)' : 'translateX(-40px)',
            transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Pill Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
              color: '#FFFFFF',
              padding: '6px 16px',
              borderRadius: '25px',
              fontSize: '12px',
              fontWeight: '800',
              marginBottom: '16px',
              boxShadow: '0 6px 16px rgba(2, 132, 199, 0.2)',
              letterSpacing: '0.2px'
            }}>
              <span>Trải nghiệm Giáo viên & Trợ lý AI</span>
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: '28px',
              fontWeight: '900',
              color: '#1E1B4B',
              lineHeight: '1.35',
              marginBottom: '20px',
              letterSpacing: '-0.5px'
            }}>
              Quản lý dạy học lý thuyết & luyện đề <br />
              <span style={{ color: '#F59E0B' }}>thông thái & tinh giản</span> hơn.
            </h3>

            {/* Bullet Points */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                'Tạo lớp học trực tuyến & đồng bộ lộ trình luyện đề THPTQG chỉ trong 1 phút',
                'Hệ thống AI tự động chấm đề thi trắc nghiệm và gợi ý lời giải chi tiết',
                'Theo dõi chi tiết tiến trình tích lũy điểm và mức độ thông thạo kiến thức',
                'Phát hiện lỗ hổng cốt lõi của từng học sinh để giao bài tập ôn luyện sửa sai'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#D1FAE5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.12)',
                    marginTop: '2px'
                  }}>
                    <CheckIcon />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#334155', lineHeight: '1.5' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Video Column */}
          <div style={{ 
            position: 'relative',
            opacity: visible.block1 ? 1 : 0,
            transform: visible.block1 ? 'translateX(0)' : 'translateX(40px)',
            transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Device Container */}
            <div 
              style={{
                background: '#0F172A',
                borderRadius: '24px',
                border: '6px solid #F59E0B',
                boxShadow: '0 25px 60px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(245, 158, 11, 0.3)',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.025)';
                e.currentTarget.style.boxShadow = '0 30px 70px rgba(245, 158, 11, 0.3)';
                e.currentTarget.style.borderColor = '#FFC229';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 25px 60px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(245, 158, 11, 0.3)';
                e.currentTarget.style.borderColor = '#F59E0B';
              }}
            >
              {/* Browser Window Header */}
              <div style={{
                background: '#1E293B',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                </div>
                <div style={{
                  background: '#0F172A',
                  color: '#94A3B8',
                  padding: '4px 16px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  letterSpacing: '0.3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>🔒</span> edupath.vn/teacher/dashboard
                </div>
                <div style={{ width: '40px' }} />
              </div>

              {/* Display Area (Directly embeds loop video with hidden logo controls overlayed) */}
              <div style={{
                position: 'relative',
                aspectRatio: '16 / 10',
                background: '#090d16',
                overflow: 'hidden'
              }}>
                {/* Masking Overlays to hide YouTube Branding/Title */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '54px', background: '#090d16', zIndex: 10, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '48px', background: '#090d16', zIndex: 10, pointerEvents: 'none' }} />
                
                <iframe
                  src="https://www.youtube.com/embed/_9BxEU6sd8g?autoplay=1&mute=1&controls=0&loop=1&playlist=_9BxEU6sd8g&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0"
                  title="Teacher Dashboard Demo Video"
                  style={{ 
                    width: '100%', 
                    height: 'calc(100% + 102px)', 
                    border: 'none',
                    marginTop: '-54px',
                    pointerEvents: 'none'
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>

            {/* Decorative Floating Star */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              fontSize: '36px',
              filter: 'drop-shadow(0 4px 8px rgba(245, 158, 11, 0.3))',
              transform: 'rotate(15deg)',
              pointerEvents: 'none'
            }}>
              ⭐
            </div>
          </div>
        </div>


        {/* ── INTERMEDIATE FLOATING MASCOT & STAR DECORATION (Less spacing) ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          margin: '10px 0 36px 0'
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: '#FFF',
            border: '2px dashed #CBD5E1',
            padding: '10px 24px',
            borderRadius: '40px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
          }}>
            <img src={sunMascotImg} alt="EduPath Mascot" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Đồng bộ thời gian thực giữa Thầy & Trò ⚡
            </span>
          </div>

          <div style={{ position: 'absolute', left: '18%', fontSize: '28px', transform: 'rotate(-20deg)', opacity: 0.65 }}>⭐</div>
          <div style={{ position: 'absolute', right: '18%', fontSize: '24px', transform: 'rotate(25deg)', opacity: 0.65 }}>⭐</div>
        </div>


        {/* ── BLOCK 2: STUDENT EXPERIENCE (Slides in from right) ── */}
        <div 
          ref={block2Ref}
          data-animate-id="block2"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          {/* Left Video Column */}
          <div style={{ 
            position: 'relative', 
            order: 1,
            opacity: visible.block2 ? 1 : 0,
            transform: visible.block2 ? 'translateX(0)' : 'translateX(-40px)',
            transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Floating Badges around Frame */}
            <div style={{
              position: 'absolute',
              top: '-18px',
              left: '30px',
              background: '#3B82F6',
              color: '#FFF',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '800',
              zIndex: 4,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>🔍</span> Vườn Trí Thức
            </div>

            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '-20px',
              background: '#10B981',
              color: '#FFF',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '800',
              zIndex: 4,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>🔥</span> Streak 14 Ngày
            </div>

            {/* Device Container */}
            <div 
              style={{
                background: '#0F172A',
                borderRadius: '24px',
                border: '6px solid #F59E0B',
                boxShadow: '0 25px 60px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(245, 158, 11, 0.3)',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.025)';
                e.currentTarget.style.boxShadow = '0 30px 70px rgba(245, 158, 11, 0.3)';
                e.currentTarget.style.borderColor = '#FFC229';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 25px 60px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(245, 158, 11, 0.3)';
                e.currentTarget.style.borderColor = '#F59E0B';
              }}
            >
              {/* Browser Window Header */}
              <div style={{
                background: '#1E293B',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                </div>
                <div style={{
                  background: '#0F172A',
                  color: '#94A3B8',
                  padding: '4px 16px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  letterSpacing: '0.3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>🔒</span> edupath.vn/student/dashboard
                </div>
                <div style={{ width: '40px' }} />
              </div>

              {/* Display Area (Directly embeds loop video with hidden logo controls overlayed) */}
              <div style={{
                position: 'relative',
                aspectRatio: '16 / 10',
                background: '#090d16',
                overflow: 'hidden'
              }}>
                {/* Masking Overlays to hide YouTube Branding/Title */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '54px', background: '#090d16', zIndex: 10, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '48px', background: '#090d16', zIndex: 10, pointerEvents: 'none' }} />

                <iframe
                  src="https://www.youtube.com/embed/Mr3ywRC7oF8?autoplay=1&mute=1&controls=0&loop=1&playlist=Mr3ywRC7oF8&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0"
                  title="Student Dashboard Demo Video"
                  style={{ 
                    width: '100%', 
                    height: 'calc(100% + 102px)', 
                    border: 'none',
                    marginTop: '-54px',
                    pointerEvents: 'none'
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </div>
          </div>

          {/* Right Content Column */}
          <div style={{ 
            order: 2,
            opacity: visible.block2 ? 1 : 0,
            transform: visible.block2 ? 'translateX(0)' : 'translateX(40px)',
            transition: 'all 0.9s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Pill Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              padding: '6px 16px',
              borderRadius: '25px',
              fontSize: '12px',
              fontWeight: '800',
              marginBottom: '16px',
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.2)',
              letterSpacing: '0.2px'
            }}>
              <span>Trải nghiệm Học sinh cá nhân hóa</span>
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: '28px',
              fontWeight: '900',
              color: '#1E1B4B',
              lineHeight: '1.35',
              marginBottom: '20px',
              letterSpacing: '-0.5px'
            }}>
              Hành trình học tập thích ứng <br />
              <span style={{ color: '#0284C7' }}>tự động bồi đắp lỗ hổng kiến thức.</span>
            </h3>

            {/* Bullet Points Grid (2 columns for better layout space) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px 14px'
            }}>
              {[
                'Lộ trình học tập thích ứng (Adaptive Learning Path) thông minh',
                'Ôn luyện đề thi thử khổng lồ có chấm điểm & bảng xếp hạng tức thì',
                'Hệ màu độ thông thạo Mastery Progress chỉ rõ phần kiến thức yếu',
                'Sơ đồ khắc phục điểm yếu Mistakes Log định hướng ôn luyện phục hồi',
                'Quick Quiz 10 câu trắc nghiệm nhấp sinh tức thì tại sơ đồ tư duy',
                'Chuỗi Streak duy trì động lực tự học và thi đua ôn luyện hàng ngày'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10B981',
                    marginTop: '7px',
                    flexShrink: 0
                  }} />
                  <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#1E293B', lineHeight: '1.45' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── VIDEO MODAL ── */}
      {activeVideoModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '900px',
            background: '#0F172A',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            border: '1px solid #334155'
          }}>
            {/* Modal Close Button */}
            <button
              onClick={() => setActiveVideoModal(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#1E293B',
                color: '#FFF',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                zIndex: 10
              }}
            >
              <CloseIcon />
            </button>

            {/* Video Iframe Container */}
            <div style={{ aspectRatio: '16 / 9', width: '100%' }}>
              <iframe
                src={activeVideoModal.url}
                title="Demo Video"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
