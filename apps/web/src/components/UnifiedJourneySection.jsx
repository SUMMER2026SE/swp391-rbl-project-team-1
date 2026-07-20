import { useState } from 'react';
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

  const handlePlayVideo = (type) => {
    const url = type === 'teacher' ? teacherVideoUrl : studentVideoUrl;
    if (url) {
      setActiveVideoModal({ type, url });
    } else {
      // Friendly feedback if video is not ready yet
      alert(`Video demo ${type === 'teacher' ? 'Giáo viên' : 'Học sinh'} đang được chuẩn bị! Link video sẽ sớm được cập nhật.`);
    }
  };

  return (
    <section className="ujs-root" style={{
      background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 50%, #F1F5F9 100%)',
      padding: '80px 0 100px 0',
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
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="lp-container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* ── SECTION HEADER ── */}
        <div style={{ textAlign: 'center', marginBottom: '70px' }}>
          {/* Top Plant/Laptop Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#EEF2FF',
            border: '1.5px solid #C7D2FE',
            padding: '8px 18px',
            borderRadius: '30px',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.08)'
          }}>
            <span style={{ fontSize: '18px' }}>🌱</span>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#4338CA', letterSpacing: '0.3px' }}>
              HỆ THỐNG KẾT NỐI TOÀN DIỆN
            </span>
            <span style={{ fontSize: '16px' }}>💻</span>
          </div>

          <h2 style={{
            fontSize: '36px',
            fontWeight: '900',
            color: '#1E1B4B',
            lineHeight: '1.3',
            maxWidth: '850px',
            margin: '0 auto 16px auto',
            letterSpacing: '-0.8px'
          }}>
            Tất cả được kết nối trong <br />
            <span style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #4338CA 50%, #6D28D9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              một hành trình học tập thống nhất.
            </span>
          </h2>

          <p style={{
            fontSize: '15px',
            color: '#64748B',
            maxWidth: '650px',
            margin: '0 auto',
            lineHeight: '1.6',
            fontWeight: '500'
          }}>
            EduPath AI kết nối chặt chẽ giữa hoạt động giảng dạy của Giáo viên và lộ trình tiếp thu của Học sinh, giúp tăng hiệu quả học tập gấp 3 lần.
          </p>
        </div>


        {/* ── BLOCK 1: TEACHER EXPERIENCE ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '50px',
          alignItems: 'center',
          marginBottom: '90px'
        }}>

          {/* Left: Content Info */}
          <div>
            {/* Pill Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
              color: '#FFFFFF',
              padding: '8px 20px',
              borderRadius: '25px',
              fontSize: '13.5px',
              fontWeight: '800',
              marginBottom: '20px',
              boxShadow: '0 6px 16px rgba(2, 132, 199, 0.25)',
              letterSpacing: '0.2px'
            }}>
              <span>Trải nghiệm giáo viên</span>
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: '32px',
              fontWeight: '900',
              color: '#1E1B4B',
              lineHeight: '1.35',
              marginBottom: '24px',
              letterSpacing: '-0.5px'
            }}>
              Quản lý lớp học <span style={{ color: '#F59E0B' }}>✨</span> <br />
              đơn giản hơn bạn nghĩ.
            </h3>

            {/* Bullet Points */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'Tạo lớp học chỉ trong 1 phút',
                'Soạn & giao bài tập theo kỹ năng',
                'Theo dõi tiến độ từng học sinh theo thời gian thực',
                'Xem điểm chi tiết cho từng kỹ năng'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#D1FAE5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)'
                  }}>
                    <CheckIcon />
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#334155' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Laptop Mockup Frame */}
          <div style={{ position: 'relative' }}>
            {/* Device Container */}
            <div style={{
              background: '#0F172A',
              borderRadius: '24px',
              border: '6px solid #F59E0B',
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(245, 158, 11, 0.3)',
              overflow: 'hidden',
              position: 'relative',
              transition: 'transform 0.3s ease, boxShadow 0.3s ease'
            }}>

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

              {/* Display Area (Video or Mockup) */}
              <div style={{
                position: 'relative',
                aspectRatio: '16 / 10',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {teacherVideoUrl ? (
                  <iframe
                    src={teacherVideoUrl}
                    title="Teacher Experience Video"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    {/* Background Preview Snapshot */}
                    <img
                      src={educatorsTeamImg || teacherMathImg}
                      alt="Teacher Dashboard Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.75,
                        filter: 'brightness(0.95)'
                      }}
                    />

                    {/* Dashboard Mockup UI Overlay Cards */}
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      right: '16px',
                      display: 'flex',
                      gap: '12px',
                      zIndex: 2
                    }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(8px)',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        <span style={{ fontSize: '20px' }}>🏫</span>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>3 Lớp học</div>
                          <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '600' }}>Đang hoạt động</div>
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(8px)',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        <span style={{ fontSize: '20px' }}>👨‍🎓</span>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>120 Học sinh</div>
                          <div style={{ fontSize: '10px', color: '#10B981', fontWeight: '700' }}>+12 tuần này</div>
                        </div>
                      </div>
                    </div>

                    {/* Center Pulsing Play Button */}
                    <div
                      onClick={() => handlePlayVideo('teacher')}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(15, 23, 42, 0.35)',
                        backdropFilter: 'blur(3px)',
                        cursor: 'pointer',
                        zIndex: 3,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.35)'}
                    >
                      <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        boxShadow: '0 0 0 12px rgba(37, 99, 235, 0.3), 0 12px 28px rgba(0, 0, 0, 0.3)',
                        transition: 'transform 0.2s ease',
                        paddingLeft: '4px'
                      }}>
                        <PlayIcon />
                      </div>
                      <span style={{
                        marginTop: '16px',
                        background: '#FFFFFF',
                        color: '#0F172A',
                        padding: '6px 18px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '800',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                        ▶ Bấm xem Demo Giáo Viên
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Decorative Floating Star */}
            <div style={{
              position: 'absolute',
              top: '-25px',
              right: '-25px',
              fontSize: '44px',
              filter: 'drop-shadow(0 4px 8px rgba(245, 158, 11, 0.4))',
              transform: 'rotate(15deg)',
              pointerEvents: 'none'
            }}>
              ⭐
            </div>
          </div>

        </div>


        {/* ── INTERMEDIATE FLOATING MASCOT & STAR DECORATION ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          margin: '20px 0 60px 0'
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: '#FFF',
            border: '2px dashed #CBD5E1',
            padding: '12px 28px',
            borderRadius: '40px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)'
          }}>
            <img src={sunMascotImg} alt="EduPath Mascot" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#334155' }}>
              Đồng bộ thời gian thực giữa Thầy & Trò ⚡
            </span>
          </div>

          <div style={{ position: 'absolute', left: '15%', fontSize: '36px', transform: 'rotate(-20deg)', opacity: 0.8 }}>⭐</div>
          <div style={{ position: 'absolute', right: '15%', fontSize: '32px', transform: 'rotate(25deg)', opacity: 0.8 }}>⭐</div>
        </div>


        {/* ── BLOCK 2: STUDENT EXPERIENCE ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '50px',
          alignItems: 'center'
        }}>

          {/* Left: Laptop Mockup Frame for Student */}
          <div style={{ position: 'relative', order: 1 }}>

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
            <div style={{
              background: '#0F172A',
              borderRadius: '24px',
              border: '6px solid #F59E0B',
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(245, 158, 11, 0.3)',
              overflow: 'hidden',
              position: 'relative'
            }}>

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

              {/* Display Area (Video or Mockup) */}
              <div style={{
                position: 'relative',
                aspectRatio: '16 / 10',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {studentVideoUrl ? (
                  <iframe
                    src={studentVideoUrl}
                    title="Student Experience Video"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    {/* Background Preview Snapshot */}
                    <img
                      src={studentLearningImg || student3dStudyImg}
                      alt="Student Dashboard Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.75,
                        filter: 'brightness(0.95)'
                      }}
                    />

                    {/* Dashboard Mockup UI Overlay Cards */}
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      right: '16px',
                      display: 'flex',
                      gap: '12px',
                      zIndex: 2
                    }}>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(8px)',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        flex: 1
                      }}>
                        <span style={{ fontSize: '20px' }}>🌱</span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>Vườn Tri Thức</div>
                          <div style={{ fontSize: '10px', color: '#2563EB', fontWeight: '700' }}>200 Hạt Giống</div>
                        </div>
                      </div>

                      <div style={{
                        background: 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(8px)',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        flex: 1
                      }}>
                        <span style={{ fontSize: '20px' }}>🏆</span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>BXH Lớp Học</div>
                          <div style={{ fontSize: '10px', color: '#D97706', fontWeight: '700' }}>Hạng #1</div>
                        </div>
                      </div>
                    </div>

                    {/* Center Pulsing Play Button */}
                    <div
                      onClick={() => handlePlayVideo('student')}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(15, 23, 42, 0.35)',
                        backdropFilter: 'blur(3px)',
                        cursor: 'pointer',
                        zIndex: 3,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.35)'}
                    >
                      <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0284C7, #2563EB)',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        boxShadow: '0 0 0 12px rgba(2, 132, 199, 0.3), 0 12px 28px rgba(0, 0, 0, 0.3)',
                        transition: 'transform 0.2s ease',
                        paddingLeft: '4px'
                      }}>
                        <PlayIcon />
                      </div>
                      <span style={{
                        marginTop: '16px',
                        background: '#FFFFFF',
                        color: '#0F172A',
                        padding: '6px 18px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '800',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                        ▶ Bấm xem Demo Học Sinh
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Right: Content Info */}
          <div style={{ order: 2 }}>
            {/* Pill Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              padding: '8px 20px',
              borderRadius: '25px',
              fontSize: '13.5px',
              fontWeight: '800',
              marginBottom: '20px',
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.25)',
              letterSpacing: '0.2px'
            }}>
              <span>Trải nghiệm học sinh</span>
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: '32px',
              fontWeight: '900',
              color: '#1E1B4B',
              lineHeight: '1.35',
              marginBottom: '24px',
              letterSpacing: '-0.5px'
            }}>
              Học mỗi ngày, <br />
              <span style={{ color: '#0284C7' }}>vui như chơi game.</span>
            </h3>

            {/* Bullet Points Grid (3 columns) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px 16px'
            }}>
              {[
                'Đăng nhập nhanh',
                'Tham gia lớp học',
                'Làm bài tập tương tác',
                'Xem điểm tức thì',
                'Bảng xếp hạng trong lớp',
                'Chuỗi học tập (Streak)'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10B981',
                    marginTop: '8px',
                    flexShrink: 0
                  }} />
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', lineHeight: '1.4' }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ── VIDEO MODAL (If Play button clicked) ── */}
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
