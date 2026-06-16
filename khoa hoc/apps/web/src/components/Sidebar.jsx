import { useState, useEffect } from 'react';
import {
  HiHome, HiAcademicCap, HiBookOpen, HiClipboardCheck,
  HiLightBulb, HiChartBar, HiCollection,
  HiChat, HiCog, HiDatabase, HiTerminal, HiUsers, HiTrendingUp,
  HiMap, HiPlay, HiArrowRight
} from 'react-icons/hi';
import { getLocalData } from '../services/mockDb';
import { supabase } from '../lib/supabaseClient';

const navGroups = {
  student: [
    {
      groupLabel: '📚 HỌC TẬP',
      items: [
        { label: 'Trang chủ',   id: 'home',    icon: HiHome },
        { label: 'Khóa học',    id: 'courses', icon: HiAcademicCap },
        { label: 'Lộ trình AI', id: 'path',    icon: HiMap },
      ],
    },
    {
      groupLabel: '🎯 LUYỆN TẬP',
      items: [
        { label: 'Thi thử THPTQG', id: 'tests',   icon: HiClipboardCheck },
        { label: 'Ngân hàng đề',   id: 'library', icon: HiBookOpen },
      ],
    },
    {
      groupLabel: '👥 CỘNG ĐỒNG',
      items: [
        { label: 'AI Gia sư', id: 'ai-qa', icon: HiLightBulb },
        { label: 'Cộng đồng', id: 'forum', icon: HiChat },
      ],
    },
    {
      groupLabel: '🏆 THÀNH TÍCH',
      items: [
        { label: 'Bảng xếp hạng', id: 'leaderboard', icon: HiChartBar },
      ],
    },
  ],
  teacher: [
    {
      groupLabel: '💼 QUẢN LÝ',
      items: [
        { icon: HiHome,         label: 'Quản lý khóa học',   id: 'home' },
        { icon: HiChat,         label: 'Diễn đàn học tập',   id: 'forum' },
        { icon: HiDatabase,     label: 'Ngân hàng câu hỏi',  id: 'questions' },
        { icon: HiChartBar,     label: 'Thống kê lớp học',   id: 'stats' },
      ],
    },
  ],
  admin: [
    {
      groupLabel: '⚙️ HỆ THỐNG',
      items: [
        { icon: HiTerminal,     label: 'Live Logs',           id: 'home' },
        { icon: HiUsers,        label: 'Quản lý tài khoản',  id: 'users' },
        { icon: HiClipboardCheck, label: 'Phê duyệt khóa học', id: 'courses' },
        { icon: HiChat,         label: 'Diễn đàn',           id: 'forum' },
        { icon: HiCollection,   label: 'Gửi thông báo',      id: 'announcements' },
        { icon: HiTrendingUp,   label: 'Thống kê tài chính', id: 'finance' },
        { icon: HiCog,          label: 'Cấu hình AI',        id: 'ai-config' },
      ],
    },
  ],
};

// Subject icon mapping
const SUBJECT_ICONS = {
  'Toán học': '📐',
  'Vật lý': '⚛️',
  'Hóa học': '🧪',
  'Tiếng Anh': '🌏',
  'Ngữ văn': '📖',
  'Sinh học': '🌱',
  'Lịch sử': '🏛️',
  'Địa lý': '🗺️',
  'GDCD': '⚖️',
};

/** Load recent courses with progress for a given userId */
async function loadRecentCourses(userId) {
  if (!userId) return [];

  const uId = parseInt(userId, 10);

  try {
    let enrollments = [];
    let courses = [];
    let progressList = [];

    if (supabase) {
      // Try fetching from Supabase
      const [enrRes, progRes] = await Promise.all([
        supabase
          .from('course_enrollments')
          .select('course_id, enrolled_at')
          .eq('student_id', uId)
          .eq('status', 'active')
          .order('enrolled_at', { ascending: false })
          .limit(10),
        supabase
          .from('lesson_progress')
          .select('lesson_id, is_completed')
          .eq('student_id', uId)
          .eq('is_completed', true),
      ]);

      if (!enrRes.error && enrRes.data?.length > 0) {
        enrollments = enrRes.data;
      }
      if (!progRes.error) {
        progressList = (progRes.data || []).map(p => p.lesson_id);
      }

      if (enrollments.length > 0) {
        const courseIds = enrollments.map(e => e.course_id);
        const courseRes = await supabase
          .from('courses')
          .select('id, title, subject, lesson_count')
          .in('id', courseIds);
        if (!courseRes.error) courses = courseRes.data || [];
      }
    }

    // Fallback to local mock db
    if (enrollments.length === 0) {
      const allEnrollments = getLocalData('supabase_mock_course_enrollments') || [];
      enrollments = allEnrollments
        .filter(e => e.student_id === uId && e.status === 'active')
        .sort((a, b) => new Date(b.enrolled_at) - new Date(a.enrolled_at));
    }
    if (courses.length === 0) {
      const allCourses = getLocalData('supabase_mock_courses') || [];
      const courseIds = enrollments.map(e => e.course_id);
      courses = allCourses.filter(c => courseIds.includes(c.id));
    }
    if (progressList.length === 0) {
      const allProgress = getLocalData('supabase_mock_lesson_progress') || [];
      progressList = allProgress
        .filter(p => p.student_id === uId && p.is_completed)
        .map(p => p.lesson_id);
    }

    // Calculate progress for each course
    const allLessons = getLocalData('supabase_mock_lessons') || [];

    return enrollments.slice(0, 6).map(enrollment => {
      const course = courses.find(c => c.id === enrollment.course_id);
      if (!course) return null;

      const courseLessons = allLessons.filter(l => l.course_id === course.id);
      const totalLessons = course.lesson_count || courseLessons.length || 5;
      const completedLessons = courseLessons.filter(l => progressList.includes(l.id)).length;
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        id: course.id,
        title: course.title,
        subject: course.subject,
        progress,
        icon: SUBJECT_ICONS[course.subject] || '📚',
      };
    }).filter(Boolean);
  } catch (err) {
    console.warn('[Sidebar] Failed to load recent courses:', err);
    return [];
  }
}

export default function Sidebar({ role, active, setActive, userProfile, onLogout, onUpgradePRO, onNavigateToCourse }) {
  if (role === 'guest') return null;

  const groups = navGroups[role] || [];
  const isPro = userProfile?.isPro;

  const [recentCourses, setRecentCourses] = useState([]);
  const [showAllCourses, setShowAllCourses] = useState(false);

  useEffect(() => {
    if (role === 'student' && userProfile?.id) {
      loadRecentCourses(userProfile.id).then(setRecentCourses);
    }
  }, [role, userProfile?.id]);

  const displayedCourses = showAllCourses ? recentCourses : recentCourses.slice(0, 3);

  return (
    <aside className="sidebar sidebar--v2">
      {/* Logo */}
      <div
        className="sidebar-logo sidebar-logo--v2"
        onClick={() => setActive('landing')}
        style={{ cursor: 'pointer' }}
        title="Quay lại Trang chủ"
      >
        <div className="logo-icon logo-icon--v2">E</div>
        <div className="logo-text">
          <h1>EduPath AI</h1>
          <p>Học đúng hướng · Thi đúng đích</p>
        </div>
      </div>

      {/* "Tiếp tục học" section – student only, always shown */}
      {role === 'student' && (
        <div className="sidebar-recent">
          <div className="sidebar-recent__header">
            <span className="sidebar-recent__title">⚡ Tiếp tục học</span>
            {recentCourses.length > 3 && (
              <button
                className="sidebar-recent__view-all"
                onClick={() => setShowAllCourses(v => !v)}
                title={showAllCourses ? 'Thu gọn' : 'Xem tất cả'}
              >
                {showAllCourses ? 'Thu gọn' : 'Xem tất cả'} <HiArrowRight />
              </button>
            )}
          </div>

          {recentCourses.length === 0 ? (
            <div className="sidebar-recent__empty">
              <span>📭</span>
              <p>Chưa có khóa học gần đây</p>
            </div>
          ) : (
            <div className="sidebar-recent__list">
              {displayedCourses.map(course => (
                <button
                  key={course.id}
                  className="sidebar-recent__item"
                  onClick={() => {
                    if (onNavigateToCourse) {
                      onNavigateToCourse(course.id);
                    } else {
                      setActive('courses');
                    }
                  }}
                  title={course.title}
                >
                  <span className="sidebar-recent__icon">{course.icon}</span>
                  <div className="sidebar-recent__info">
                    <span className="sidebar-recent__name">{course.title}</span>
                    <div className="sidebar-recent__progress-wrap">
                      <div className="sidebar-recent__progress-bar">
                        <div
                          className="sidebar-recent__progress-fill"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="sidebar-recent__pct">{course.progress}%</span>
                    </div>
                  </div>
                  <span className="sidebar-recent__play"><HiPlay /></span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav groups */}
      <nav className="sidebar-nav sidebar-nav--v2">
        {groups.map((group, gi) => (
          <div key={gi} className="sidebar-nav-group">
            <span className="sidebar-nav-group__label">{group.groupLabel}</span>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item nav-item--v2 ${isActive ? 'nav-item--active' : ''}`}
                  onClick={() => setActive(item.id)}
                  id={`sidebar-nav-${item.id}`}
                >
                  {Icon && (
                    <span className="nav-item__icon">
                      <Icon />
                    </span>
                  )}
                  <span className="nav-item__label">{item.label}</span>
                  {isActive && <span className="nav-item__indicator" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* PRO upgrade banner – collapsed pill by default, expands on hover */}
      {role === 'student' && !isPro && (
        <div className="sidebar-upgrade--v2" onClick={onUpgradePRO} id="sidebar-upgrade-pro-btn">
          {/* Collapsed row: always visible */}
          <div className="sidebar-upgrade__pill">
            <span className="sidebar-upgrade__pill-icon">⭐</span>
            <span className="sidebar-upgrade__pill-text">Nâng cấp PRO</span>
            <span className="sidebar-upgrade__pill-arrow">›</span>
          </div>
          {/* Expanded content: shown on hover */}
          <div className="sidebar-upgrade__expanded">
            <p>Mở toàn bộ AI nâng cao &amp; lộ trình cá nhân hóa</p>
            <button className="sidebar-upgrade__btn" onClick={(e) => { e.stopPropagation(); onUpgradePRO(); }}>
              Nâng cấp ngay →
            </button>
          </div>
        </div>
      )}

      {/* User footer */}
      <div className="sidebar-user sidebar-user--v2">
        <div className="sidebar-user__avatar-wrap">
          {userProfile?.avatar && (userProfile.avatar.startsWith('data:') || userProfile.avatar.startsWith('http') || userProfile.avatar.length > 10) ? (
            <img
              src={userProfile.avatar.startsWith('data:') || userProfile.avatar.startsWith('http') ? userProfile.avatar : `data:image/png;base64,${userProfile.avatar}`}
              alt="Avatar"
              className="sidebar-user__avatar-img"
            />
          ) : (
            <div
              className="sidebar-user__avatar-text"
              style={{
                background: isPro
                  ? 'linear-gradient(135deg, #FFE259, #FFA751)'
                  : role === 'admin' ? '#E74C3C' : role === 'teacher' ? '#0984E3' : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
              }}
            >
              {userProfile?.avatar && userProfile.avatar.length <= 10
                ? userProfile.avatar
                : (userProfile?.name ? userProfile.name.slice(0, 2).toUpperCase() : 'U')}
            </div>
          )}
          {isPro && <span className="sidebar-user__pro-badge">PRO</span>}
        </div>

        <div className="sidebar-user__info">
          <h4
            className="sidebar-user__name"
            style={{ color: isPro ? '#FFA751' : 'var(--text-main)' }}
          >
            {userProfile?.name || 'Tài khoản'}
          </h4>
          <p className="sidebar-user__role">
            {role === 'student'
              ? (isPro ? '⭐ HỌC VIÊN PRO' : `Lớp ${userProfile?.grade || 12} · ${userProfile?.combo || 'A01'}`)
              : role.toUpperCase()}
          </p>
        </div>

        <button
          className="sidebar-user__logout"
          onClick={onLogout}
          title="Đăng xuất"
          id="sidebar-logout-btn"
        >
          ⏻
        </button>
      </div>
    </aside>
  );
}
