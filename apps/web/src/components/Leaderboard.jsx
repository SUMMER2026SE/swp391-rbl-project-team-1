import { useState, useEffect, useCallback } from 'react';
import { HiTrendingUp, HiAcademicCap, HiBookOpen, HiFire, HiStar, HiRefresh } from 'react-icons/hi';
import { api } from '../api';

// ═══════════════════════════════════════════════════════════
// MOCK DATA — Used as fallback when API returns no real data
// ═══════════════════════════════════════════════════════════
const MOCK_SCORE_DATA = [
  { rank: 1, userId: 1, fullName: 'Nguyễn Lâm Vy', avatarUrl: null, subjectGroup: 'A01', avgScore: 28.2, bestScore: 28.5, totalAttempts: 12, badge: 'Thủ khoa Lý 12' },
  { rank: 2, userId: 2, fullName: 'Trần Minh Đức', avatarUrl: null, subjectGroup: 'B00', avgScore: 28.4, bestScore: 29.0, totalAttempts: 10, badge: 'Thần tốc Hóa Học' },
  { rank: 3, userId: 3, fullName: 'Lê Quỳnh Chi', avatarUrl: null, subjectGroup: 'D01', avgScore: 27.1, bestScore: 27.5, totalAttempts: 8, badge: 'Đệ nhất Anh ngữ' },
  { rank: 4, userId: 4, fullName: 'Phạm Minh Hoàng', avatarUrl: null, subjectGroup: 'A01', avgScore: 26.9, bestScore: 28.0, totalAttempts: 15, badge: 'Chiến thần Toán Học' },
  { rank: 5, userId: 5, fullName: 'Đỗ Gia Bảo', avatarUrl: null, subjectGroup: 'B00', avgScore: 26.5, bestScore: 27.8, totalAttempts: 9, badge: 'Chuyên gia Sinh học' },
  { rank: 6, userId: 6, fullName: 'Hoàng Thị Mai', avatarUrl: null, subjectGroup: 'D01', avgScore: 26.2, bestScore: 27.0, totalAttempts: 11, badge: 'Xuất sắc Anh ngữ' },
  { rank: 7, userId: 7, fullName: 'Vũ Đình Khoa', avatarUrl: null, subjectGroup: 'A01', avgScore: 25.8, bestScore: 26.5, totalAttempts: 7, badge: 'Xuất sắc Lý' },
  { rank: 8, userId: 8, fullName: 'Ngô Thanh Hà', avatarUrl: null, subjectGroup: 'B00', avgScore: 25.5, bestScore: 26.2, totalAttempts: 13, badge: 'Xuất sắc Hóa Học' },
  { rank: 9, userId: 9, fullName: 'Bùi Văn Tùng', avatarUrl: null, subjectGroup: 'A01', avgScore: 25.1, bestScore: 25.8, totalAttempts: 6, badge: 'Nỗ lực Lý' },
  { rank: 10, userId: 10, fullName: 'Trịnh Ngọc Anh', avatarUrl: null, subjectGroup: 'D01', avgScore: 24.9, bestScore: 25.5, totalAttempts: 14, badge: 'Nỗ lực Anh ngữ' },
];

const MOCK_STREAK_DATA = [
  { rank: 1, userId: 1, fullName: 'Nguyễn Lâm Vy', avatarUrl: null, subjectGroup: 'A01', currentStreak: 42, longestStreak: 42, badge: '🔥 Chiến binh 30 ngày' },
  { rank: 2, userId: 2, fullName: 'Trần Minh Đức', avatarUrl: null, subjectGroup: 'B00', currentStreak: 35, longestStreak: 35, badge: '🔥 Chiến binh 30 ngày' },
  { rank: 3, userId: 3, fullName: 'Lê Quỳnh Chi', avatarUrl: null, subjectGroup: 'D01', currentStreak: 28, longestStreak: 30, badge: '⚡ Chuỗi ấn tượng' },
  { rank: 4, userId: 4, fullName: 'Phạm Minh Hoàng', avatarUrl: null, subjectGroup: 'A01', currentStreak: 21, longestStreak: 21, badge: '⚡ Chuỗi ấn tượng' },
  { rank: 5, userId: 5, fullName: 'Đỗ Gia Bảo', avatarUrl: null, subjectGroup: 'B00', currentStreak: 17, longestStreak: 22, badge: '⚡ Chuỗi ấn tượng' },
  { rank: 6, userId: 6, fullName: 'Hoàng Thị Mai', avatarUrl: null, subjectGroup: 'D01', currentStreak: 14, longestStreak: 14, badge: '⚡ Chuỗi ấn tượng' },
  { rank: 7, userId: 7, fullName: 'Vũ Đình Khoa', avatarUrl: null, subjectGroup: 'A01', currentStreak: 10, longestStreak: 15, badge: '✨ Khởi đầu vững chắc' },
  { rank: 8, userId: 8, fullName: 'Ngô Thanh Hà', avatarUrl: null, subjectGroup: 'B00', currentStreak: 8, longestStreak: 12, badge: '✨ Khởi đầu vững chắc' },
];

const MOCK_COURSE_DATA = [
  { rank: 1, userId: 1, fullName: 'Nguyễn Lâm Vy', avatarUrl: null, subjectGroup: 'A01', courseCount: 8, badge: '⭐ Học viên tích cực' },
  { rank: 2, userId: 4, fullName: 'Phạm Minh Hoàng', avatarUrl: null, subjectGroup: 'A01', courseCount: 7, badge: '📚 Mọt sách chăm chỉ' },
  { rank: 3, userId: 2, fullName: 'Trần Minh Đức', avatarUrl: null, subjectGroup: 'B00', courseCount: 6, badge: '⭐ Học viên tích cực' },
  { rank: 4, userId: 3, fullName: 'Lê Quỳnh Chi', avatarUrl: null, subjectGroup: 'D01', courseCount: 5, badge: '⭐ Học viên tích cực' },
  { rank: 5, userId: 5, fullName: 'Đỗ Gia Bảo', avatarUrl: null, subjectGroup: 'B00', courseCount: 4, badge: '💪 Chinh phục kiến thức' },
  { rank: 6, userId: 6, fullName: 'Hoàng Thị Mai', avatarUrl: null, subjectGroup: 'D01', courseCount: 3, badge: '💪 Chinh phục kiến thức' },
  { rank: 7, userId: 7, fullName: 'Vũ Đình Khoa', avatarUrl: null, subjectGroup: 'A01', courseCount: 2, badge: '🌟 Khám phá tri thức' },
];

const SUBJECT_GROUP_LABELS = {
  'A01': 'A01 (Toán – Lý – Anh)',
  'B00': 'B00 (Toán – Hóa – Sinh)',
  'D01': 'D01 (Toán – Văn – Anh)',
};

const TAB_CONFIG = [
  { id: 'scores', label: 'Theo điểm thi thử', icon: '🏆', iconComponent: HiAcademicCap },
  { id: 'streaks', label: 'Theo chuỗi học tập (Streak)', icon: '🔥', iconComponent: HiFire },
  { id: 'courses', label: 'Theo khóa học hoàn thành', icon: '⭐', iconComponent: HiBookOpen },
];

// ═══════════════════════════════════════════════
// Helper: Get initials from full name
// ═══════════════════════════════════════════════
function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ═══════════════════════════════════════════════
// Helper: Time ago formatter
// ═══════════════════════════════════════════════
function timeAgo(isoString) {
  if (!isoString) return 'Vừa cập nhật';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Vừa cập nhật';
  if (diffMin < 60) return `Cập nhật ${diffMin} phút trước`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Cập nhật ${diffHours} giờ trước`;
  return `Cập nhật ${Math.floor(diffHours / 24)} ngày trước`;
}

// ═══════════════════════════════════════════════
// RANK COLORS & STYLES
// ═══════════════════════════════════════════════
const RANK_STYLES = {
  1: { bg: 'linear-gradient(135deg, #FFD700, #FFA502)', border: '#FFD700', color: '#5D4E00', shadow: '0 4px 15px rgba(255, 215, 0, 0.4)' },
  2: { bg: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', border: '#C0C0C0', color: '#4A4A4A', shadow: '0 4px 15px rgba(192, 192, 192, 0.4)' },
  3: { bg: 'linear-gradient(135deg, #CD7F32, #B8722D)', border: '#CD7F32', color: '#5A3A10', shadow: '0 4px 15px rgba(205, 127, 50, 0.4)' },
};

const AVATAR_COLORS = [
  '#6C5CE7', '#FD79A8', '#00B894', '#0984E3', '#E17055',
  '#00CEC9', '#FAB1A0', '#74B9FF', '#A29BFE', '#55EFC4'
];

function getAvatarColor(userId) {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
}

// ═══════════════════════════════════════════════════════════
// MAIN LEADERBOARD COMPONENT
// ═══════════════════════════════════════════════════════════
export default function Leaderboard({ currentUser, addLog }) {
  const [activeTab, setActiveTab] = useState('scores');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [entries, setEntries] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(false);

  // ═══════════════════════════════════════════════
  // Fetch leaderboard data from API
  // ═══════════════════════════════════════════════
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (activeTab === 'scores') {
        data = await api.getScoreLeaderboard(subjectFilter);
      } else if (activeTab === 'streaks') {
        data = await api.getStreakLeaderboard();
      } else {
        data = await api.getCourseLeaderboard();
      }

      if (data && data.entries && data.entries.length > 0) {
        setEntries(data.entries);
        setUpdatedAt(data.updatedAt);
        setUseMock(false);
      } else {
        // Fallback to mock data
        loadMockData();
      }
    } catch (err) {
      console.warn('[Leaderboard] API unavailable, using mock data:', err.message);
      loadMockData();
    } finally {
      setLoading(false);
    }
  }, [activeTab, subjectFilter]);

  const loadMockData = useCallback(() => {
    setUseMock(true);
    setUpdatedAt(new Date().toISOString());
    if (activeTab === 'scores') {
      const filtered = subjectFilter === 'ALL'
        ? MOCK_SCORE_DATA
        : MOCK_SCORE_DATA.filter(e => e.subjectGroup === subjectFilter);
      setEntries(filtered.map((e, i) => ({ ...e, rank: i + 1 })));
    } else if (activeTab === 'streaks') {
      setEntries(MOCK_STREAK_DATA);
    } else {
      setEntries(MOCK_COURSE_DATA);
    }
  }, [activeTab, subjectFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ═══════════════════════════════════════════════
  // Render helpers
  // ═══════════════════════════════════════════════
  const renderMetricValue = (entry) => {
    if (activeTab === 'scores') {
      return (
        <div className="lb-metric-wrapper">
          <span className="lb-metric-icon">🏆</span>
          <span className="lb-metric-value">{entry.avgScore}/{entry.bestScore}đ</span>
        </div>
      );
    }
    if (activeTab === 'streaks') {
      return (
        <div className="lb-metric-wrapper">
          <span className="lb-metric-icon">🔥</span>
          <span className="lb-metric-value lb-metric-streak">{entry.currentStreak} ngày</span>
        </div>
      );
    }
    return (
      <div className="lb-metric-wrapper">
        <span className="lb-metric-icon">⭐</span>
        <span className="lb-metric-value">{entry.courseCount} khóa</span>
      </div>
    );
  };

  const renderRankNumber = (rank) => {
    const style = RANK_STYLES[rank];
    if (style) {
      return (
        <div className="lb-rank-circle lb-rank-top" style={{ background: style.bg, boxShadow: style.shadow }}>
          <span style={{ color: style.color }}>{rank}</span>
        </div>
      );
    }
    return (
      <div className="lb-rank-circle">
        <span>{rank}</span>
      </div>
    );
  };

  const renderAvatar = (entry) => {
    if (entry.avatarUrl) {
      return <img src={entry.avatarUrl} alt={entry.fullName} className="lb-avatar-img" />;
    }
    return (
      <div className="lb-avatar-initials" style={{ backgroundColor: getAvatarColor(entry.userId) }}>
        {getInitials(entry.fullName)}
      </div>
    );
  };

  const getCardClass = (rank) => {
    if (rank === 1) return 'lb-entry-card lb-entry-gold';
    if (rank === 2) return 'lb-entry-card lb-entry-silver';
    if (rank === 3) return 'lb-entry-card lb-entry-bronze';
    return 'lb-entry-card';
  };

  // Check if current user is in the leaderboard
  const currentUserRank = entries.find(e => e.userId === currentUser?.id);

  return (
    <div className="leaderboard-wrapper animate-in">
      {/* ─── Header ─── */}
      <div className="lb-header">
        <div className="lb-header-badge">VINH DANH HỌC VIÊN</div>
        <h1 className="lb-header-title">
          Bảng Xếp Hạng Thành Tích Học Tập THPTQG 2026
        </h1>
        <p className="lb-header-subtitle">
          Học tập liên tục, bứt phá giới hạn và vươn lên dẫn đầu bảng xếp hạng cùng EduPath AI.
        </p>
      </div>

      {/* ─── Content Card ─── */}
      <div className="lb-content-card">
        {/* Tabs */}
        <div className="lb-tabs-bar">
          <div className="lb-tabs-group">
            {TAB_CONFIG.map(tab => (
              <button
                key={tab.id}
                className={`lb-tab-btn${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="lb-tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="lb-tabs-meta">
            <span className="lb-updated-label">{timeAgo(updatedAt)}</span>
            <button className="lb-refresh-btn" onClick={fetchData} disabled={loading} title="Làm mới">
              <HiRefresh className={loading ? 'lb-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Subject filter (only for scores tab) */}
        {activeTab === 'scores' && (
          <div className="lb-filter-bar">
            <button
              className={`lb-filter-btn${subjectFilter === 'ALL' ? ' active' : ''}`}
              onClick={() => setSubjectFilter('ALL')}
            >
              Tất cả
            </button>
            {Object.entries(SUBJECT_GROUP_LABELS).map(([key, label]) => (
              <button
                key={key}
                className={`lb-filter-btn${subjectFilter === key ? ' active' : ''}`}
                onClick={() => setSubjectFilter(key)}
              >
                {key}
              </button>
            ))}
          </div>
        )}

        {/* Mock data notice */}
        {useMock && (
          <div className="lb-mock-notice">
            <span>📊</span>
            <span>Đang hiển thị dữ liệu minh họa. Dữ liệu thực sẽ được cập nhật khi có đủ thành viên tham gia.</span>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="lb-loading">
            <div className="lb-loading-spinner"></div>
            <span>Đang tải bảng xếp hạng...</span>
          </div>
        )}

        {/* Entries List */}
        {!loading && entries.length > 0 && (
          <div className="lb-entries-list">
            {entries.map((entry, index) => (
              <div
                key={entry.userId}
                className={getCardClass(entry.rank)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Rank */}
                {renderRankNumber(entry.rank)}

                {/* Avatar */}
                <div className="lb-avatar-container">
                  {renderAvatar(entry)}
                </div>

                {/* Info */}
                <div className="lb-entry-info">
                  <div className="lb-entry-name">{entry.fullName}</div>
                  <div className="lb-entry-badge-row">
                    <span className="lb-entry-title-badge">{entry.badge}</span>
                  </div>
                </div>

                {/* Subject Group */}
                <div className="lb-entry-subject">
                  <span className="lb-subject-label">
                    {SUBJECT_GROUP_LABELS[entry.subjectGroup] || entry.subjectGroup}
                  </span>
                </div>

                {/* Metric */}
                {renderMetricValue(entry)}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && entries.length === 0 && (
          <div className="lb-empty-state">
            <div className="lb-empty-icon">🏆</div>
            <h3>Chưa có dữ liệu xếp hạng</h3>
            <p>Hãy là người đầu tiên tham gia và chinh phục bảng xếp hạng!</p>
          </div>
        )}

        {/* Current user highlight */}
        {currentUserRank && (
          <div className="lb-current-user-highlight">
            <HiStar />
            <span>
              Bạn đang xếp hạng <strong>#{currentUserRank.rank}</strong> trên bảng xếp hạng này. Tuyệt vời!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
