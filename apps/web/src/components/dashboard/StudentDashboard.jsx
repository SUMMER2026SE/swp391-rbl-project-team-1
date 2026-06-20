import { useState, useEffect, useRef } from 'react';
import { 
  HiCalendar, 
  HiBookOpen, 
  HiPlus,
  HiFire,
  HiAcademicCap,
  HiUser,
  HiStar,
  HiDownload,
  HiSearch,
  HiBell,
  HiOutlineClock,
  HiCheck,
  HiUpload,
  HiChevronRight,
  HiHome,
  HiChatAlt2,
  HiSparkles,
  HiLightningBolt,
  HiFolderOpen,
  HiClipboardList
} from 'react-icons/hi';
import { HiTrophy } from 'react-icons/hi2';
import { api } from '../../api';
import { toast } from '../../utils/toast';
import '../../styles/studentDashboard.css';

export default function StudentDashboard({ currentUser, setActiveTab, navigateTo, onUpdateUser, activeTab, children }) {
  // --- STATES & STORES ---
  const currentTab = activeTab || 'home';
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingData, setOnboardingData] = useState(() => {
    const saved = localStorage.getItem('student_onboarding_data');
    return saved ? JSON.parse(saved) : {
      subjectGroup: 'A01 (Toán - Lý - Anh)',
      targetSchool: 'Đại học Bách Khoa Hà Nội',
      targetScore: '26.5',
      grade: '12',
      subjects: ['Toán học', 'Vật lý', 'Tiếng Anh']
    };
  });

  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    return localStorage.getItem('student_onboarding_completed') === 'true';
  });

  // Calendar study slots check-ins
  const [calendarSlots, setCalendarSlots] = useState(() => {
    const saved = localStorage.getItem('student_calendar_slots');
    return saved ? JSON.parse(saved) : {
      'T2-morning': { subject: 'Toán học', done: true },
      'T2-evening': { subject: 'Vật lý', done: false },
      'T3-evening': { subject: 'Tiếng Anh', done: true },
      'T4-afternoon': { subject: 'Toán học', done: false },
      'T5-morning': { subject: 'Vật lý', done: false },
      'T5-evening': { subject: 'Tiếng Anh', done: false },
      'T6-evening': { subject: 'Đề thi thử Toán', done: false },
      'T7-morning': { subject: 'Luyện Flashcard', done: true },
      'CN-evening': { subject: 'Hỏi AI Tutor', done: false },
    };
  });

  // Data states loaded from APIs
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    courses: [],
    attempts: [],
    gamification: { level: 4, xp: 1450, streakDays: 7, badges: [] },
    forumPosts: [],
    recentActivities: []
  });

  const [documents, setDocuments] = useState([]);
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [progresses, setProgresses] = useState({});

  // Form edit states (initialized when activeTabLocal changes to 'profile')
  const [profileName, setProfileName] = useState(currentUser?.fullName || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileSchool, setProfileSchool] = useState(currentUser?.school || onboardingData.targetSchool);
  const [profileGrade, setProfileGrade] = useState(currentUser?.grade || onboardingData.grade);
  const [profileCombo, setProfileCombo] = useState(currentUser?.combo || onboardingData.subjectGroup);
  const [profileTargetScore, setProfileTargetScore] = useState(currentUser?.targetScore || parseFloat(onboardingData.targetScore) || 25.0);
  const [profileTargetUniversity, setProfileTargetUniversity] = useState(currentUser?.targetUniversity || onboardingData.targetSchool);

  // Load API resources
  useEffect(() => {
    async function loadDashboardResources() {
      setLoading(true);
      try {
        const [coursesRes, attemptsRes, gamiRes, docsRes] = await Promise.allSettled([
          api.getCourses(), // Fetch all courses to correctly filter owned ones
          api.getExamHistory().catch(() => api.getAttempts()),
          api.getUserGamificationProfile(),
          api.getDocumentResources()
        ]);

        const courses = coursesRes.status === 'fulfilled' ? coursesRes.value : [];
        const attempts = attemptsRes.status === 'fulfilled' ? attemptsRes.value : [];
        const gamification = gamiRes.status === 'fulfilled' && gamiRes.value ? gamiRes.value : {
          level: 4,
          xp: 1450,
          streakDays: 7,
          badges: [
            { id: 1, name: 'Siêu Chiến Binh', icon: '🏅', desc: 'Đã hoàn thành 5 đề thi thử' },
            { id: 2, name: 'Kẻ Diệt Đề', icon: '🔥', desc: 'Đạt điểm >8.0 trong 3 đề liên tục' },
            { id: 3, name: 'Thiên Tài AI', icon: '🧠', desc: 'Hỏi AI Tutor trên 10 câu hỏi' },
            { id: 4, name: 'Học Giả Chăm Chỉ', icon: '📚', desc: 'Duy trì học tập 7 ngày liên tục' }
          ]
        };
        const docs = docsRes.status === 'fulfilled' ? docsRes.value : [];

        // Calculate progress for courses
        const progressMap = {};
        try {
          const { enrollmentService } = await import('../../services/enrollmentService');
          for (const course of courses) {
            let calculated = 0;
            if (currentUser) {
              const completed = await enrollmentService.getEnrolledCourseProgress(currentUser.id, course.id);
              const totalLessons = course.lessons?.length || 5;
              const completedInCourse = completed.filter(id => {
                return course.lessons?.some(l => l.id.toString() === id.toString());
              }).length;
              calculated = totalLessons > 0 ? Math.round((completedInCourse / totalLessons) * 100) : 0;
            }
            const isOwned = currentUser?.unlockedCourses?.includes(course.id) || 
                            currentUser?.unlockedCourses?.includes(course.id.toString()) ||
                            currentUser?.unlockedCourses?.includes(Number(course.id));
            progressMap[course.id] = isOwned ? calculated : (course.id === 1 ? 60 : (course.id === 2 ? 40 : 25));
          }
        } catch (err) {
          console.warn('[StudentDashboard] Lỗi tính tiến trình học:', err);
        }
        setProgresses(progressMap);

        // Build recent activities timeline list
        const recentActivities = [];
        if (attempts && attempts.length > 0) {
          attempts.slice(0, 4).forEach(att => {
            recentActivities.push({
              id: `attempt-${att.id}`,
              type: 'exam',
              title: `Đã làm ${att.exam?.title || 'Đề thi thử'}`,
              detail: `Điểm số: ${att.score}đ • Đúng: ${att.correctCount || 0}/${(att.correctCount || 0) + (att.wrongCount || 0)} câu`,
              time: new Date(att.submittedAt || att.startedAt).toLocaleDateString('vi-VN')
            });
          });
        } else {
          recentActivities.push(
            { id: 'act-1', type: 'exam', title: 'Đã hoàn thành Đề thi thử Toán học số 15', detail: 'Điểm số: 8.4/10đ • Thời gian: 45 phút', time: 'Hôm nay' },
            { id: 'act-2', type: 'ai', title: 'Hỏi đáp với AI Tutor thành công', detail: 'Hỏi về phương pháp tính tích phân hàm ẩn', time: 'Hôm qua' },
            { id: 'act-3', type: 'flashcard', title: 'Ôn tập bộ Flashcard Hóa Hữu Cơ', detail: 'Ghi nhớ thành công 18/20 từ khóa', time: '2 ngày trước' },
            { id: 'act-4', type: 'system', title: 'Đăng nhập điểm danh hàng ngày', detail: 'Nhận 10 XP chuỗi học tập', time: '3 ngày trước' }
          );
        }

        setDashboardData({
          courses: courses, // Keep all courses so we can filter owned ones
          attempts,
          gamification,
          recentActivities
        });
        setDocuments(docs);
      } catch (err) {
        console.error('Lỗi khi tải tài nguyên dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardResources();
  }, [currentUser]);

  // Sync profile editing inputs if currentUser updates
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.fullName || currentUser.name || '');
      setProfilePhone(currentUser.phone || '');
      setProfileSchool(currentUser.school || onboardingData.targetSchool);
      setProfileGrade(currentUser.grade || onboardingData.grade);
      setProfileCombo(currentUser.combo || onboardingData.subjectGroup);
      setProfileTargetScore(currentUser.targetScore || parseFloat(onboardingData.targetScore) || 25.0);
      setProfileTargetUniversity(currentUser.targetUniversity || onboardingData.targetSchool);
    }
  }, [currentUser, currentTab]);

  // Show onboarding automatically if not completed
  useEffect(() => {
    if (!onboardingCompleted) {
      setOnboardingOpen(true);
    }
  }, [onboardingCompleted]);

  // Toggle study schedules
  const toggleCalendarSlot = (key) => {
    const updated = {
      ...calendarSlots,
      [key]: {
        ...calendarSlots[key],
        done: !calendarSlots[key]?.done
      }
    };
    setCalendarSlots(updated);
    localStorage.setItem('student_calendar_slots', JSON.stringify(updated));
    toast('Cập nhật trạng thái lịch học!', 'success');
  };

  const handleSaveOnboarding = (e) => {
    e.preventDefault();
    localStorage.setItem('student_onboarding_data', JSON.stringify(onboardingData));
    localStorage.setItem('student_onboarding_completed', 'true');
    setOnboardingCompleted(true);
    setOnboardingOpen(false);

    // Save profile configurations
    const updatedUser = {
      ...currentUser,
      name: currentUser?.fullName || currentUser?.name || 'Học viên',
      fullName: currentUser?.fullName || currentUser?.name || 'Học viên',
      grade: onboardingData.grade,
      combo: onboardingData.subjectGroup,
      targetScore: parseFloat(onboardingData.targetScore),
      targetUniversity: onboardingData.targetSchool
    };
    if (onUpdateUser) onUpdateUser(updatedUser);

    toast('Thiết lập mục tiêu học tập thành công! 🎯', 'success');
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      fullName: profileName,
      name: profileName,
      phone: profilePhone,
      school: profileSchool,
      grade: profileGrade,
      combo: profileCombo,
      targetScore: parseFloat(profileTargetScore),
      targetUniversity: profileTargetUniversity
    };

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
      toast('Cập nhật thông tin cá nhân thành công!', 'success');
    } else {
      toast('Không tìm thấy hàm cập nhật thông tin. Vui lòng liên hệ quản trị viên!', 'warning');
    }
  };

  // Get first name for greeting
  const getFirstName = () => {
    const fullName = currentUser?.fullName || currentUser?.name || 'Học viên';
    const parts = fullName.trim().split(/\s+/);
    return parts[parts.length - 1] || 'bạn';
  };

  // Get Vietnamese formatted current date
  const getVietnameseDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('vi-VN', options);
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  };

  // Mock list of redeemable rewards
  const rewardItems = [
    { id: 1, name: 'Sách ôn thi Casio Toán học (PDF)', cost: 50, icon: '📚' },
    { id: 2, name: 'Cẩm nang sơ đồ lý thuyết Vật Lý 12', cost: 80, icon: '🗺️' },
    { id: 3, name: 'Tài liệu VIP: 10 đề thi thử nâng cao Toán 12', cost: 120, icon: '📝' },
    { id: 4, name: '100 lượt tương tác AI Tutor Premium', cost: 200, icon: '🤖' },
    { id: 5, name: 'Nâng cấp tài khoản PRO 7 ngày miễn phí', cost: 500, icon: '⭐' }
  ];

  const handleRedeemReward = (reward) => {
    const userPoints = currentUser?.rewardPoints ?? 0;
    if (userPoints < reward.cost) {
      toast(`Bạn không đủ điểm thưởng! Cần thêm ${reward.cost - userPoints} điểm nữa.`, 'warning');
      return;
    }

    const updatedUser = {
      ...currentUser,
      rewardPoints: userPoints - reward.cost
    };

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
      toast(`Đổi quà thành công: ${reward.name}! File tài liệu đã được gửi đến hòm thư của bạn.`, 'success');
    }
  };

  // Check-in study day to grow streak
  const handleCheckinDay = (dayKey) => {
    if (calendarSlots[dayKey]?.done) {
      toast('Bạn đã hoàn thành lịch học ngày này rồi!', 'info');
      return;
    }

    const updatedSlots = {
      ...calendarSlots,
      [dayKey]: {
        ...calendarSlots[dayKey],
        done: true
      }
    };
    setCalendarSlots(updatedSlots);
    localStorage.setItem('student_calendar_slots', JSON.stringify(updatedSlots));

    // Increase points and streak
    const currentPoints = currentUser?.rewardPoints ?? 0;
    const currentStreak = dashboardData.gamification?.streakDays ?? 7;
    const updatedUser = {
      ...currentUser,
      rewardPoints: currentPoints + 15 // Gift 15 points
    };

    setDashboardData({
      ...dashboardData,
      gamification: {
        ...dashboardData.gamification,
        streakDays: currentStreak + 1
      }
    });

    if (onUpdateUser) onUpdateUser(updatedUser);
    toast('Học tập tích cực! +15 điểm thưởng và tăng chuỗi liên tục! 🌟', 'success');
  };

  // Filter courses to show only the student's owned/purchased courses
  const ownedCourses = (dashboardData.courses || []).filter(c => {
    return c.priceSale === 0 || 
           currentUser?.unlockedCourses?.includes(c.id) || 
           currentUser?.unlockedCourses?.includes(c.id.toString()) ||
           currentUser?.unlockedCourses?.includes(Number(c.id));
  });

  const coursesToRender = ownedCourses.map((c, idx) => {
    // Choose dynamic gradient background colorClass
    let colorClass = 'purple';
    if (c.subject === 'Toán' || c.subject === 'Toán học') {
      colorClass = 'purple';
    } else if (c.subject === 'Vật lý') {
      colorClass = 'teal';
    } else if (c.subject === 'Hóa học') {
      colorClass = 'blue';
    } else if (c.subject === 'Tiếng Anh') {
      colorClass = 'orange';
    }
    return {
      ...c,
      progress: progresses[c.id] || 0,
      colorClass
    };
  });

  // Fallback documents if database documents are empty
  const defaultDocs = [
    { id: 'doc-1', title: 'Tóm tắt công thức Hình học Oxyz 12', desc: 'Toán học • File PDF tóm gọn công thức giải nhanh', tagClass: 'purple-tag' },
    { id: 'doc-2', title: 'Dao động điều hòa lí thuyết chuyên sâu', desc: 'Vật lý • 20 câu hỏi lý thuyết kèm lời giải', tagClass: 'teal-tag' },
    { id: 'doc-3', title: 'Từ vựng tiếng Anh chủ đề học đường nâng cao', desc: 'Tiếng Anh • Bộ flashcard 50 từ vựng', tagClass: 'orange-tag' },
    { id: 'doc-4', title: 'Sơ đồ tư duy Hóa Hữu cơ kì I lớp 12', desc: 'Hóa học • AI generated mindmap chất lượng cao', tagClass: 'blue-tag' }
  ];

  const docsToRender = documents.length > 0
    ? documents.map((d, idx) => ({
        id: d.id,
        title: d.title,
        desc: `${d.subject || 'Tài liệu'} • ${d.description || 'Không có mô tả'}`,
        tagClass: idx % 4 === 0 ? 'purple-tag' : idx % 4 === 1 ? 'teal-tag' : idx % 4 === 2 ? 'orange-tag' : 'blue-tag'
      }))
    : defaultDocs;

  const filteredDocs = docsToRender.filter(doc => 
    doc.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
    doc.desc.toLowerCase().includes(docSearchQuery.toLowerCase())
  );

  const hasRightSidebar = currentTab === 'home';

  return (
    <div 
      className="student-dashboard-layout" 
      style={{ 
        gridTemplateColumns: hasRightSidebar ? '260px 1fr 320px' : '260px 1fr' 
      }}
    >
      {/* ==========================================================================
         LEFT SIDEBAR
         ========================================================================== */}
      <aside className="sdb-left-sidebar">
        <div className="sdb-logo-section">
          <div className="sdb-logo-icon">E</div>
          <span>EduPath AI</span>
        </div>

        {/* Profile Card */}
        <div className="sdb-profile-widget">
          <div className="sdb-avatar-container">
            {currentUser?.avatarUrl || currentUser?.avatar ? (
              <img 
                src={currentUser.avatarUrl || (currentUser.avatar.startsWith('data:') ? currentUser.avatar : `data:image/png;base64,${currentUser.avatar}`)} 
                alt="Avatar" 
                className="sdb-avatar-img"
              />
            ) : (
              <div 
                className="sdb-avatar-fallback"
                style={{
                  background: currentUser?.isPro 
                    ? 'linear-gradient(135deg, #FFE259, #FFA751)' 
                    : 'linear-gradient(135deg, #7C3AED, #4F46E5)'
                }}
              >
                {currentUser?.fullName ? currentUser.fullName.slice(0, 2).toUpperCase() : 'U'}
              </div>
            )}
            <span className="sdb-status-badge">🟢 Lớp {profileGrade}</span>
          </div>

          <h4 className="sdb-profile-name">{currentUser?.fullName || 'Học viên'}</h4>
          <p className="sdb-profile-email">{currentUser?.email || 'student@gmail.com'}</p>
        </div>

        {/* Sidebar Tabs Menu */}
        <ul className="sdb-menu-list">
          <button 
            className={`sdb-menu-item ${currentTab === 'home' ? 'active' : ''}`}
            onClick={() => navigateTo('/dashboard/home')}
          >
            <span className="sdb-menu-icon"><HiHome /></span>
            <span>Tổng quan</span>
          </button>

          <button 
            className={`sdb-menu-item ${currentTab === 'courses' ? 'active' : ''}`}
            onClick={() => navigateTo('/dashboard/courses')}
          >
            <span className="sdb-menu-icon"><HiAcademicCap /></span>
            <span>Kho khóa học</span>
          </button>

          <button 
            className={`sdb-menu-item ${currentTab === 'tests' ? 'active' : ''}`}
            onClick={() => navigateTo('/dashboard/mock-exams')}
          >
            <span className="sdb-menu-icon"><HiClipboardList /></span>
            <span>Luyện thi thử</span>
          </button>

          <button 
            className={`sdb-menu-item ${currentTab === 'ai-qa' ? 'active' : ''}`}
            onClick={() => navigateTo('/dashboard/ai-tutor')}
          >
            <span className="sdb-menu-icon"><HiSparkles /></span>
            <span>Hỏi đáp AI</span>
          </button>

          <button 
            className={`sdb-menu-item ${currentTab === 'path' ? 'active' : ''}`}
            onClick={() => navigateTo('/dashboard/flashcards')}
          >
            <span className="sdb-menu-icon"><HiLightningBolt /></span>
            <span>Flashcard</span>
          </button>

          <button 
            className={`sdb-menu-item ${currentTab === 'library' ? 'active' : ''}`}
            onClick={() => navigateTo('/dashboard/exam-bank')}
          >
            <span className="sdb-menu-icon"><HiFolderOpen /></span>
            <span>Ngân hàng tài liệu</span>
          </button>

          <button 
            className={`sdb-menu-item ${currentTab === 'documents' ? 'active' : ''}`}
            onClick={() => navigateTo('/dashboard/documents')}
          >
            <span className="sdb-menu-icon"><HiBookOpen /></span>
            <span>Tài liệu của tôi</span>
          </button>

          <button 
            className={`sdb-menu-item ${currentTab === 'forum' ? 'active' : ''}`}
            onClick={() => navigateTo('/dashboard/forum')}
          >
            <span className="sdb-menu-icon"><HiChatAlt2 /></span>
            <span>Cộng đồng</span>
          </button>

          <button 
            className={`sdb-menu-item ${currentTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => navigateTo('/dashboard/leaderboard')}
          >
            <span className="sdb-menu-icon"><HiTrophy /></span>
            <span>Bảng xếp hạng</span>
          </button>

          <button 
            className={`sdb-menu-item ${currentTab === 'rewards' ? 'active' : ''}`}
            onClick={() => navigateTo('/dashboard/rewards')}
          >
            <span className="sdb-menu-icon"><HiStar /></span>
            <span>Điểm thưởng</span>
          </button>

          <button 
            className={`sdb-menu-item ${currentTab === 'streak' ? 'active' : ''}`}
            onClick={() => navigateTo('/dashboard/streak')}
          >
            <span className="sdb-menu-icon"><HiFire /></span>
            <span>Chuỗi học tập</span>
          </button>

          <button 
            className={`sdb-menu-item ${currentTab === 'settings' || currentTab === 'profile' ? 'active' : ''}`}
            onClick={() => navigateTo('/dashboard/settings')}
          >
            <span className="sdb-menu-icon"><HiUser /></span>
            <span>Thông tin cá nhân</span>
          </button>
        </ul>
      </aside>

      {/* ==========================================================================
         CENTER MAIN PANE
         ========================================================================== */}
      <main className="sdb-center-pane">
        {/* TAB 1: OVERVIEW VIEW */}
        {currentTab === 'home' && (
          <>
            {/* Header section */}
            <div className="sdb-header-bar">
              <div style={{ textAlign: 'left' }}>
                <h1 className="sdb-greeting-title">Chào bạn, {getFirstName()}!</h1>
                <p className="sdb-greeting-subtitle">Hôm nay là {getVietnameseDate()}</p>
              </div>

              <div className="sdb-actions-wrapper">
                <button 
                  className="sdb-search-btn" 
                  title="Tìm kiếm"
                  onClick={() => {
                    navigateTo('/dashboard/documents');
                  }}
                >
                  <HiSearch />
                </button>
                <button 
                  className="sdb-action-btn"
                  onClick={() => navigateTo('/dashboard/mock-exams')}
                >
                  Làm đề thi mới
                </button>
              </div>
            </div>

            {/* Courses list cards */}
            {coursesToRender.length > 0 ? (
              <div className="sdb-courses-grid animate-in">
                {coursesToRender.map((course) => (
                  <div 
                    key={course.id} 
                    className={`sdb-course-card ${course.colorClass}`}
                    onClick={() => {
                      if (course.id && !String(course.id).startsWith('def')) {
                        navigateTo(`/courses/${course.id}`);
                      } else {
                        navigateTo('/dashboard/courses');
                      }
                    }}
                  >
                    <button className="sdb-course-menu-btn">⋮</button>
                    
                    <div className="sdb-course-avatars">
                      <div className="sdb-course-avatar-bubble">AI</div>
                      <div className="sdb-course-avatar-bubble" style={{ backgroundColor: '#10b981' }}>+7</div>
                    </div>

                    <h3 className="sdb-course-title">{course.title}</h3>

                    <div className="sdb-course-info">
                      <span>{course.lessons?.length || course.lessonsCount || 10} bài học</span>
                      <span>{course.progress}%</span>
                    </div>

                    <div className="sdb-course-progress-track">
                      <div className="sdb-course-progress-bar" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                background: '#fff',
                border: '3px solid #000',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '4px 4px 0px #000',
                marginBottom: '24px'
              }} className="animate-in">
                <span style={{ fontSize: '36px' }}>📚</span>
                <h3 style={{ fontSize: '16px', fontWeight: '950', margin: '12px 0 6px 0', color: '#000' }}>Em chưa đăng ký khóa học nào</h3>
                <p style={{ fontSize: '12.5px', color: '#555', margin: '0 0 16px 0', fontWeight: 'bold' }}>
                  Hãy đăng ký khóa học Premium để mở khóa bài học và bắt đầu lộ trình học cá nhân hóa ngay nhé!
                </p>
                <button
                  onClick={() => navigateTo('/dashboard/courses')}
                  style={{
                    background: '#FFE259',
                    color: '#000',
                    border: '2.5px solid #000',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontWeight: '900',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '2.5px 2.5px 0px #000',
                    transition: 'all 0.1s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-1px, -1px)';
                    e.currentTarget.style.boxShadow = '3.5px 3.5px 0px #000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '2.5px 2.5px 0px #000';
                  }}
                >
                  Khám phá kho khóa học
                </button>
              </div>
            )}

            {/* Bottom split: Checklist documents & Stats widgets */}
            <div className="sdb-bottom-split">
              {/* Documents card */}
              <div className="sdb-documents-card">
                <div className="sdb-card-title-row">
                  <h3 className="sdb-card-title">Tài liệu học tập gần đây</h3>
                  <button 
                    onClick={() => navigateTo('/dashboard/documents')} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '900', color: '#8b5cf6' }}
                  >
                    Xem tất cả
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {docsToRender.slice(0, 3).map((doc) => (
                    <div key={doc.id} className={`sdb-doc-item ${doc.tagClass}`}>
                      <div className="sdb-doc-info">
                        <h4 className="sdb-doc-title">{doc.title}</h4>
                        <p className="sdb-doc-desc">{doc.desc}</p>
                      </div>
                      <button 
                        className="sdb-doc-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast(`Đang mở tải tài liệu: ${doc.title}...`, 'info');
                        }}
                      >
                        <HiDownload />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats column with widgets and Pro banner */}
              <div className="sdb-stats-column">
                <div className="sdb-stats-row">
                  <div className="sdb-stat-box">
                    <span className="sdb-stat-label">Thời gian học</span>
                    <h3 className="sdb-stat-value">28 h</h3>
                  </div>

                  <div className="sdb-stat-box">
                    <span className="sdb-stat-label">Chuỗi học tập</span>
                    <h3 className="sdb-stat-value">{dashboardData.gamification?.streakDays ?? 7} ngày</h3>
                  </div>

                  <div className="sdb-stat-box">
                    <span className="sdb-stat-label">Điểm tích lũy</span>
                    <h3 className="sdb-stat-value">{currentUser?.rewardPoints ?? 0} đ</h3>
                  </div>

                  <div 
                    className="sdb-stat-box dashed"
                    onClick={() => navigateTo('/dashboard/ai-tutor')}
                  >
                    <div className="sdb-stat-add-icon"><HiPlus /></div>
                    <span className="sdb-stat-label" style={{ color: '#000000', fontWeight: '900' }}>Hỏi AI Tutor</span>
                  </div>
                </div>

                {/* Upgrade to Pro Banner */}
                <div className="sdb-promo-banner">
                  <div className="sdb-promo-info">
                    <span className="sdb-promo-tag">Gói Tài Khoản</span>
                    <h4 className="sdb-promo-title">Nâng cấp PRO</h4>
                    <p className="sdb-promo-subtitle">Mở khóa AI phân tích lỗi sai & thi thử không giới hạn.</p>
                  </div>
                  <button 
                    className="sdb-promo-btn"
                    onClick={() => {
                      const upgradeBtn = document.getElementById('sidebar-upgrade-pro-btn') || document.querySelector('.sidebar-upgrade__btn');
                      if (upgradeBtn) {
                        upgradeBtn.click();
                      } else {
                        toast('Vui lòng click vào nút Nâng cấp PRO ở menu tài khoản.', 'info');
                      }
                    }}
                  >
                    Nâng cấp
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: THÔNG TIN CÁ NHÂN */}
        {(currentTab === 'profile' || currentTab === 'settings') && (
          <div className="sdb-form-view">
            <div className="sdb-card-title-row" style={{ marginBottom: '24px' }}>
              <h3 className="sdb-card-title">Hồ sơ & Mục tiêu học tập</h3>
              <span className="badge-pill" style={{ background: '#ffc229', color: '#000000', padding: '4px 12px', borderRadius: '20px', fontWeight: '900', fontSize: '11px' }}>
                Học viên {currentUser?.isPro ? 'PRO' : 'Thường'}
              </span>
            </div>

            <form onSubmit={handleProfileSave} className="sdb-form-section">
              <div className="sdb-form-grid">
                <div className="sdb-form-group">
                  <label className="sdb-form-label">1. Họ và tên học sinh:</label>
                  <input 
                    type="text" 
                    className="sdb-form-input"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                  />
                </div>

                <div className="sdb-form-group">
                  <label className="sdb-form-label">2. Số điện thoại liên lạc:</label>
                  <input 
                    type="tel" 
                    className="sdb-form-input"
                    placeholder="Nhập số điện thoại"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                  />
                </div>

                <div className="sdb-form-group">
                  <label className="sdb-form-label">3. Lớp học:</label>
                  <select 
                    className="sdb-form-select"
                    value={profileGrade}
                    onChange={(e) => setProfileGrade(e.target.value)}
                  >
                    <option value="10">Lớp 10</option>
                    <option value="11">Lớp 11</option>
                    <option value="12">Lớp 12</option>
                  </select>
                </div>

                <div className="sdb-form-group">
                  <label className="sdb-form-label">4. Khối thi & Tổ hợp:</label>
                  <select 
                    className="sdb-form-select"
                    value={profileCombo}
                    onChange={(e) => setProfileCombo(e.target.value)}
                  >
                    <option value="A00 (Toán – Lý – Hóa)">Khối A00 (Toán – Vật lý – Hóa học)</option>
                    <option value="A01 (Toán – Lý – Anh)">Khối A01 (Toán – Vật lý – Tiếng Anh)</option>
                    <option value="B00 (Toán – Hóa – Sinh)">Khối B00 (Toán – Hóa học – Sinh học)</option>
                    <option value="C00 (Văn – Sử – Địa)">Khối C00 (Ngữ văn – Lịch sử – Địa lý)</option>
                    <option value="D01 (Toán – Văn – Anh)">Khối D01 (Toán – Ngữ văn – Tiếng Anh)</option>
                  </select>
                </div>

                <div className="sdb-form-group">
                  <label className="sdb-form-label">5. Trường THPT đang theo học:</label>
                  <input 
                    type="text" 
                    className="sdb-form-input"
                    value={profileSchool}
                    onChange={(e) => setProfileSchool(e.target.value)}
                  />
                </div>

                <div className="sdb-form-group">
                  <label className="sdb-form-label">6. Trường Đại học mục tiêu:</label>
                  <input 
                    type="text" 
                    className="sdb-form-input"
                    value={profileTargetUniversity}
                    onChange={(e) => setProfileTargetUniversity(e.target.value)}
                  />
                </div>

                <div className="sdb-form-group full-width" style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="sdb-form-label">Mục tiêu điểm số THPT Quốc gia (khối thi):</label>
                    <strong style={{ fontSize: '16px', color: '#ea580c', background: '#fef3c7', padding: '2px 10px', borderRadius: '8px', border: '1.5px solid #000' }}>
                      {profileTargetScore.toFixed(1)} Điểm
                    </strong>
                  </div>
                  <input 
                    type="range"
                    min="15.0"
                    max="30.0"
                    step="0.5"
                    value={profileTargetScore}
                    onChange={(e) => setProfileTargetScore(parseFloat(e.target.value))}
                    style={{ width: '100%', height: '8px', cursor: 'pointer', accentColor: '#ffc229' }}
                  />
                </div>
              </div>

              <button type="submit" className="sdb-form-submit-btn">
                💾 Lưu thông tin & Cập nhật lộ trình AI
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: TÀI LIỆU CỦA TÔI */}
        {currentTab === 'documents' && (
          <div className="sdb-docs-view">
            <div className="sdb-docs-header">
              <div style={{ textAlign: 'left' }}>
                <h3 className="sdb-card-title" style={{ fontSize: '20px' }}>Kho tài liệu & Tóm tắt bài học</h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0', fontWeight: '700' }}>Tìm kiếm bài giảng, sơ đồ tư duy AI đã lưu, đề cương tự luyện.</p>
              </div>

              <button 
                className="sdb-action-btn"
                style={{ background: '#ffffff', color: '#000000' }}
                onClick={() => {
                  const fileInput = document.createElement('input');
                  fileInput.type = 'file';
                  fileInput.accept = '.pdf,.png,.jpg,.jpeg';
                  fileInput.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      toast(`Tải lên tài liệu "${file.name}" thành công!`, 'success');
                    }
                  };
                  fileInput.click();
                }}
              >
                <HiUpload /> Tải tài liệu lên
              </button>
            </div>

            <div className="sdb-search-input-wrap">
              <span className="sdb-search-input-icon"><HiSearch /></span>
              <input 
                type="text" 
                placeholder="Tìm tài liệu, sơ đồ tư duy..." 
                className="sdb-search-input"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
              />
            </div>

            <div className="sdb-docs-grid">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <div key={doc.id} className={`sdb-doc-item ${doc.tagClass}`} style={{ cursor: 'pointer' }}>
                    <div className="sdb-doc-info">
                      <h4 className="sdb-doc-title" style={{ fontSize: '15px' }}>{doc.title}</h4>
                      <p className="sdb-doc-desc" style={{ fontSize: '12px', marginTop: '4px' }}>{doc.desc}</p>
                    </div>
                    <button 
                      className="sdb-doc-action-btn"
                      style={{ fontSize: '20px', padding: '6px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toast(`Tải tài liệu "${doc.title}" xuống thiết bị của bạn...`, 'success');
                      }}
                    >
                      <HiDownload />
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', border: '2px dashed #cbd5e1', borderRadius: '12px' }}>
                  <span style={{ fontSize: '32px' }}>📂</span>
                  <p style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', marginTop: '12px' }}>Không tìm thấy tài liệu phù hợp!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ĐIỂM THƯỞNG */}
        {currentTab === 'rewards' && (
          <div className="sdb-rewards-view">
            {/* Balance Widget */}
            <div className="sdb-points-hero">
              <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', tracking: '1px' }}>Điểm tích lũy hiện tại</span>
              <div className="sdb-points-badge">
                <span>{currentUser?.rewardPoints ?? 0}</span>
                <span style={{ fontSize: '28px' }}>đ</span>
              </div>
              <p className="sdb-points-desc">Hãy luyện đề chăm chỉ, hoàn thành chuỗi học tập hàng ngày để đổi lấy các tài liệu ôn thi VIP và lượt hỏi AI Tutor Premium miễn phí.</p>
            </div>

            {/* Shop layout */}
            <div style={{ textAlign: 'left' }}>
              <h3 className="sdb-card-title" style={{ fontSize: '18px', marginBottom: '16px' }}>Cửa hàng đổi quà tặng</h3>
              
              <div className="sdb-rewards-shop-grid">
                {rewardItems.map((item) => {
                  const points = currentUser?.rewardPoints ?? 0;
                  const canAfford = points >= item.cost;
                  return (
                    <div key={item.id} className="sdb-reward-card">
                      <span className="sdb-reward-icon">{item.icon}</span>
                      <h4 className="sdb-reward-name">{item.name}</h4>
                      <div className="sdb-reward-cost">{item.cost} Điểm thưởng</div>
                      <button 
                        className="sdb-reward-btn"
                        disabled={!canAfford}
                        onClick={() => handleRedeemReward(item)}
                      >
                        {canAfford ? 'Đổi ngay' : 'Không đủ điểm'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STEACK */}
        {currentTab === 'streak' && (
          <div className="sdb-streak-view">
            <div className="sdb-streak-header-row">
              {/* Flame count */}
              <div className="sdb-streak-hero">
                <div className="sdb-streak-hero-info">
                  <span style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', opacity: 0.9 }}>Chuỗi học tập liên tục</span>
                  <div className="sdb-streak-hero-count">
                    <span>{dashboardData.gamification?.streakDays ?? 7} ngày</span>
                  </div>
                  <p style={{ fontSize: '11px', fontWeight: '700', margin: 0, opacity: 0.9 }}>Duy trì học tập mỗi ngày để giữ lửa và nhận thêm 15 điểm thưởng!</p>
                </div>
                <span className="sdb-streak-hero-icon">🔥</span>
              </div>

              {/* General XP/LV progress */}
              <div className="sdb-streak-stat-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="sdb-stat-label">Cấp độ Level</span>
                  <span style={{ fontSize: '14px', fontWeight: '950', color: '#8b5cf6' }}>Lv.{dashboardData.gamification?.level ?? 4}</span>
                </div>
                <div style={{ height: '12px', background: '#f1f5f9', border: '2px solid #000000', borderRadius: '6px', overflow: 'hidden', margin: '8px 0' }}>
                  <div 
                    style={{ 
                      width: `${((dashboardData.gamification?.xp ?? 1450) / 2000) * 100}%`, 
                      height: '100%', 
                      backgroundColor: '#f59e0b' 
                    }}
                  ></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: '#64748b' }}>
                  <span>{dashboardData.gamification?.xp ?? 1450} XP</span>
                  <span>2000 XP để Lên cấp</span>
                </div>
              </div>
            </div>

            {/* Checkin study heatmap */}
            <div className="sdb-heatmap-section">
              <h3 className="sdb-heatmap-title">Điểm danh học tập tuần này</h3>
              <div className="sdb-heatmap-grid">
                {[
                  { key: 'T2-morning', label: 'Thứ Hai', day: 'T2' },
                  { key: 'T3-evening', label: 'Thứ Ba', day: 'T3' },
                  { key: 'T4-afternoon', label: 'Thứ Tư', day: 'T4' },
                  { key: 'T5-morning', label: 'Thứ Năm', day: 'T5' },
                  { key: 'T6-evening', label: 'Thứ Sáu', day: 'T6' },
                  { key: 'T7-morning', label: 'Thứ Bảy', day: 'T7' },
                  { key: 'CN-evening', label: 'Chủ Nhật', day: 'CN' }
                ].map((item) => {
                  const slot = calendarSlots[item.key];
                  const isDone = slot?.done;
                  return (
                    <div 
                      key={item.key} 
                      className={`sdb-heatmap-day ${isDone ? 'completed' : 'missed'}`}
                      onClick={() => handleCheckinDay(item.key)}
                      title={`${item.label}: ${isDone ? 'Đã học tập' : 'Chưa điểm danh (Nhấp để học ngay)'}`}
                    >
                      <span style={{ fontSize: '12px', fontWeight: '950' }}>{item.day}</span>
                      <span style={{ position: 'absolute', bottom: '4px', fontSize: '8px' }}>
                        {isDone ? '🔥' : '⏳'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badges row */}
            <div style={{ textAlign: 'left' }}>
              <h3 className="sdb-card-title" style={{ fontSize: '16px', marginBottom: '14px' }}>Huy hiệu học tập đạt được</h3>
              <div className="sdb-badges-grid">
                {(dashboardData.gamification?.badges || []).map((badge) => (
                  <div key={badge.id} className="sdb-badge-card" title={badge.desc}>
                    <span className="sdb-badge-icon">{badge.icon}</span>
                    <h5 className="sdb-badge-name">{badge.name}</h5>
                    <p className="sdb-badge-desc">{badge.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Render children passed from App.jsx for other subpages */}
        {children}
      </main>

      {/* ==========================================================================
         RIGHT SIDEBAR (ONLY VISIBLE ON COURSES OVERVIEW)
         ========================================================================== */}
      {currentTab === 'home' && (
        <aside className="sdb-right-sidebar">
          <div className="sdb-right-title-row">
            <h3 className="sdb-right-title">Lịch học & Sự kiện</h3>
            <button className="sdb-bell-btn" onClick={() => toast('Hệ thống chưa có thông báo mới!', 'info')}>
              <HiBell />
            </button>
          </div>

          {/* Timeline widgets */}
          <div className="sdb-timeline-wrapper">
            {/* Group 1 */}
            <div className="sdb-date-group">
              <div className="sdb-date-header-row">
                <span className="sdb-date-title">Hôm nay, {new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })}</span>
                <span className="sdb-date-dots">•••</span>
              </div>

              <div className="sdb-timeline-list">
                <div className="sdb-timeline-item">
                  <div className="sdb-timeline-bullet active-bullet"></div>
                  <span className="sdb-time-tag">10:00</span>
                  <div className="sdb-timeline-info">
                    <h5 className="sdb-timeline-title">Luyện tập trắc nghiệm</h5>
                    <p className="sdb-timeline-desc">Chuyên đề Hàm số & Cực trị</p>
                  </div>
                </div>

                <div className="sdb-timeline-item">
                  <div className="sdb-timeline-bullet"></div>
                  <span className="sdb-time-tag">13:20</span>
                  <div className="sdb-timeline-info">
                    <h5 className="sdb-timeline-title">Học bài cùng AI Tutor</h5>
                    <p className="sdb-timeline-desc">Lý thuyết Dao động điều hòa 12</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Group 2 */}
            <div className="sdb-date-group">
              <div className="sdb-date-header-row">
                <span className="sdb-date-title">Hoạt động gần đây</span>
                <span className="sdb-date-dots">•••</span>
              </div>

              <div className="sdb-timeline-list" style={{ borderLeft: '2px solid #e2e8f0' }}>
                {dashboardData.recentActivities.slice(0, 3).map((act, index) => (
                  <div key={act.id} className="sdb-timeline-item">
                    <div className="sdb-timeline-bullet" style={{ backgroundColor: index === 0 ? '#10b981' : '#cbd5e1' }}></div>
                    <span className="sdb-time-tag" style={{ fontSize: '10.5px', color: '#64748b' }}>{act.time}</span>
                    <div className="sdb-timeline-info">
                      <h5 className="sdb-timeline-title" style={{ fontSize: '12px' }}>{act.title}</h5>
                      <p className="sdb-timeline-desc" style={{ fontSize: '10px' }}>{act.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ==========================================================================
         ONBOARDING WIZARD MODAL
         ========================================================================== */}
      {onboardingOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 5000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="lp-modal-neo" style={{
            maxWidth: '520px',
            width: '100%',
            position: 'relative'
          }}>
            {onboardingCompleted && (
              <button 
                onClick={() => setOnboardingOpen(false)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  border: '2px solid #000',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  background: '#fff',
                  fontWeight: '900',
                  cursor: 'pointer',
                  boxShadow: '1.5px 1.5px 0 #000'
                }}
              >
                ✕
              </button>
            )}

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '42px' }}>🎯</span>
              <h2 style={{ fontSize: '24px', fontWeight: '950', margin: '12px 0 6px 0' }}>
                Thiết lập lộ trình học tập
              </h2>
              <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: '700' }}>
                Hãy cấu hình khối thi và mục tiêu điểm số để AI thiết lập lộ trình luyện đề tốt nhất cho bạn.
              </p>
            </div>

            <form onSubmit={handleSaveOnboarding} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  1. Chọn Lớp học:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {['10', '11', '12'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setOnboardingData({ ...onboardingData, grade: g })}
                      style={{
                        padding: '10px',
                        border: '2.5px solid #000',
                        borderRadius: '10px',
                        fontWeight: '900',
                        background: onboardingData.grade === g ? '#FFC229' : '#fff',
                        boxShadow: onboardingData.grade === g ? '2.5px 2.5px 0 #000' : '1px 1px 0 #000',
                        cursor: 'pointer'
                      }}
                    >
                      Lớp {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  2. Chọn Tổ hợp / Khối thi mục tiêu:
                </label>
                <select 
                  className="form-control"
                  style={{ width: '100%', padding: '10px', border: '2.5px solid #000', borderRadius: '10px', fontWeight: '800' }}
                  value={onboardingData.subjectGroup}
                  onChange={(e) => {
                    const group = e.target.value;
                    let subjects = ['Toán học'];
                    if (group.startsWith('A00')) subjects = ['Toán học', 'Vật lý', 'Hóa học'];
                    else if (group.startsWith('A01')) subjects = ['Toán học', 'Vật lý', 'Tiếng Anh'];
                    else if (group.startsWith('B00')) subjects = ['Toán học', 'Hóa học', 'Sinh học'];
                    else if (group.startsWith('C00')) subjects = ['Ngữ văn', 'Lịch sử', 'Địa lý'];
                    else if (group.startsWith('D01')) subjects = ['Toán học', 'Ngữ văn', 'Tiếng Anh'];
                    setOnboardingData({ ...onboardingData, subjectGroup: group, subjects });
                  }}
                >
                  <option value="A00 (Toán – Lý – Hóa)">Khối A00 (Toán – Vật lý – Hóa học)</option>
                  <option value="A01 (Toán – Lý – Anh)">Khối A01 (Toán – Vật lý – Tiếng Anh)</option>
                  <option value="B00 (Toán – Hóa – Sinh)">Khối B00 (Toán – Hóa học – Sinh học)</option>
                  <option value="C00 (Văn – Sử – Địa)">Khối C00 (Ngữ văn – Lịch sử – Địa lý)</option>
                  <option value="D01 (Toán – Văn – Anh)">Khối D01 (Toán – Ngữ văn – Tiếng Anh)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  3. Trường Đại học mong muốn đỗ:
                </label>
                <input 
                  type="text"
                  className="form-control"
                  style={{ width: '100%', padding: '10px', border: '2.5px solid #000', borderRadius: '10px', fontWeight: '800' }}
                  placeholder="Ví dụ: Đại học Bách Khoa Hà Nội"
                  value={onboardingData.targetSchool}
                  onChange={(e) => setOnboardingData({ ...onboardingData, targetSchool: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  4. Mục tiêu điểm số khối thi (trên thang điểm 30):
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="range"
                    min="15" max="30" step="0.5"
                    style={{ flex: 1 }}
                    value={onboardingData.targetScore}
                    onChange={(e) => setOnboardingData({ ...onboardingData, targetScore: e.target.value })}
                  />
                  <strong style={{ fontSize: '20px', fontWeight: '950', border: '2.5px solid #000', padding: '6px 12px', borderRadius: '8px', background: '#FFC229' }}>
                    {onboardingData.targetScore}đ
                  </strong>
                </div>
              </div>

              <button 
                type="submit" 
                className="lp-btn--accent" 
                style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '12px', fontWeight: '900', border: '2.5px solid #000', marginTop: '10px' }}
              >
                🏁 Hoàn tất thiết lập & Khởi tạo lộ trình AI
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
