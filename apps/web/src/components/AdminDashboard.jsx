import { useState, useEffect } from 'react';
import { toast } from '../utils/toast';
import { 
  HiChartBar, 
  HiBookOpen, 
  HiClipboardCheck, 
  HiUsers, 
  HiCollection, 
  HiTrendingUp, 
  HiTerminal, 
  HiGlobeAlt, 
  HiAdjustments,
  HiPlus,
  HiTrash,
  HiPencil,
  HiSearch,
  HiArrowLeft
} from 'react-icons/hi';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../api';
import { mockExamService } from '../services/mockExamService';
import Header from './Header';

const financeData = [
  { name: 'Tháng 1', revenue: 15.4 },
  { name: 'Tháng 2', revenue: 22.8 },
  { name: 'Tháng 3', revenue: 35.1 },
  { name: 'Tháng 4', revenue: 48.6 },
  { name: 'Tháng 5', revenue: 64.2 }
];

// Default seeded books recommendations
const initialBooks = [
  {
    id: 1,
    title: "Bộ đề ôn luyện THPTQG môn Toán 2026",
    author: "Thầy Thế Anh",
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200",
    description: "Tổng hợp 20 đề thi thử bám sát cấu trúc mới nhất của Bộ GD&ĐT kèm giải chi tiết và kỹ thuật bấm máy nhanh.",
    price: "129.000đ",
    link: "https://shopee.vn"
  },
  {
    id: 2,
    title: "Chinh phục Ngữ pháp Tiếng Anh THPTQG",
    author: "Cô Quỳnh Chi",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200",
    description: "Hệ thống hóa toàn bộ kiến thức ngữ pháp trọng tâm và các phương pháp giải nhanh điểm 9+.",
    price: "99.000đ",
    link: "https://tiki.vn"
  },
  {
    id: 3,
    title: "Sổ tay công thức nhanh Vật Lý 12",
    author: "Cô Thu Hương",
    coverUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=200",
    description: "Tóm gọn toàn bộ công thức cốt lõi và các dạng bài tập chuyên đề dao động, sóng cơ, sóng điện từ.",
    price: "79.000đ",
    link: "https://shopee.vn"
  }
];

// Default seeded leads
const initialLeads = [
  {
    id: 1,
    name: "Lê Tuấn Tú",
    phone: "0912345678",
    email: "tuantu@gmail.com",
    target: "Toán - Lý - Hóa (A00) • Mục tiêu 27 điểm",
    registeredDate: "2026-06-15",
    status: "Chờ tư vấn"
  },
  {
    id: 2,
    name: "Nguyễn Hương Giang",
    phone: "0987654321",
    email: "giangnguyen@gmail.com",
    target: "Toán - Lý - Anh (A01) • Mục tiêu 26.5 điểm",
    registeredDate: "2026-06-14",
    status: "Đã liên hệ"
  },
  {
    id: 3,
    name: "Trần Minh Anh",
    phone: "0905678912",
    email: "minhanh@gmail.com",
    target: "Toán - Văn - Anh (D01) • Mục tiêu 28 điểm",
    registeredDate: "2026-06-13",
    status: "Thành công"
  },
  {
    id: 4,
    name: "Phạm Quốc Bảo",
    phone: "0971223344",
    email: "baopq@gmail.com",
    target: "Toán - Hóa - Sinh (B00) • Mục tiêu Y Hà Nội",
    registeredDate: "2026-06-12",
    status: "Chờ tư vấn"
  }
];

export default function AdminDashboard({
  users,
  onToggleUserBan,
  onApproveTeacher,
  courseApprovals = [],
  onApproveCourse,
  onRejectCourse,
  onSendAnnouncement,
  systemLogs = [],
  addLog,
  navigateTo,
  submissions = [],
  leadsList = [],
  setLeadsList,
  booksList = [],
  setBooksList,
  featureFlags = [],
  setFeatureFlags,
  
  // Header Props
  currentUser,
  theme,
  onToggleTheme,
  notifications,
  onClearNotifications,
  onLogout,
  onChangePassword,
  onNavigateSettings,
  cartCourse,
  onCheckoutCourse
}) {
  // Sidebar tabs state
  const [activeTab, setActiveTab] = useState('stats'); // stats, exams, content, books, users, leads, features
  
  // Sub-tabs for Content ('content')
  const [contentSubTab, setContentSubTab] = useState('approvals'); // approvals, logs, announcements, ai-config
  
  // Dynamic stats state from Supabase
  const [stats, setStats] = useState({
    kpi: {
      totalUsers: { value: 0, prevValue: 0, change: 0, description: 'Tài khoản đã đăng ký' },
      newUsersThisWeek: { value: 0, prevValue: 0, change: 0, description: 'Đăng ký trong 7 ngày qua' },
      totalAttempts: { value: 0, prevValue: 0, change: 0, description: 'Lượt thi thử THPTQG' },
      totalAiQuestions: { value: 0, prevValue: 0, change: 0, description: 'Câu hỏi gửi tới AI Coach' },
      revenue: { value: 0, prevValue: 0, change: 0, description: 'Doanh thu học phí kì này' }
    },
    attemptsChart: [],
    aiQuestionsChart: [],
    revenueChart: [],
    topStudents: []
  });
  
  const [timeFilter, setTimeFilter] = useState('this-month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [loadingStats, setLoadingStats] = useState(false);

  const loadStats = async () => {
    if (activeTab === 'stats') {
      setLoadingStats(true);
      try {
        const { api } = await import('../api');
        const params = { filter: timeFilter };
        if (timeFilter === 'custom') {
          if (customStartDate) params.startDate = customStartDate;
          if (customEndDate) params.endDate = customEndDate;
        }
        const dbStats = await api.getAdminStats(params);
        if (dbStats) {
          setStats(dbStats);
        }
      } catch (err) {
        console.error('[AdminDashboard] Lỗi tải thống kê từ Supabase:', err);
      } finally {
        setLoadingStats(false);
      }
    }
  };

  useEffect(() => {
    loadStats();
  }, [activeTab, submissions, leadsList, users, timeFilter]);

  // ────────────────────────────────────────────────────────────
  // New States and Handlers for User Management
  // ────────────────────────────────────────────────────────────
  const [adminUsers, setAdminUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [userStats, setUserStats] = useState({ totalUsers: 0, totalStudents: 0, totalTeachers: 0, totalBlocked: 0 });
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userStartDate, setUserStartDate] = useState('');
  const [userEndDate, setUserEndDate] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [userToBlock, setUserToBlock] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);

  const [userToUnblock, setUserToUnblock] = useState(null);
  const [showUnblockModal, setShowUnblockModal] = useState(false);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await api.getAdminUsers({
        search: userSearch,
        role: userRoleFilter,
        status: userStatusFilter,
        startDate: userStartDate,
        endDate: userEndDate,
        page: userPage,
        limit: 10
      });
      if (res) {
        setAdminUsers(res.users);
        setUserPagination(res.pagination);
        setUserStats(res.stats);
      }
    } catch (err) {
      toast(err.message || 'Lỗi tải danh sách người dùng', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, userSearch, userRoleFilter, userStatusFilter, userStartDate, userEndDate, userPage]);

  const handleViewUserDetail = async (userId) => {
    try {
      setUserDetailLoading(true);
      setShowDetailModal(true);
      setSelectedUser(null);
      const res = await api.getUserDetail(userId);
      if (res) {
        setSelectedUser(res);
      }
    } catch (err) {
      toast(err.message || 'Không thể lấy thông tin chi tiết', 'error');
      setShowDetailModal(false);
    } finally {
      setUserDetailLoading(false);
    }
  };

  const handleBlockUserSubmit = async () => {
    if (!blockReason.trim()) {
      toast('Vui lòng nhập lý do khóa!', 'warning');
      return;
    }
    try {
      await api.blockUser(userToBlock.id, blockReason);
      toast(`Đã khóa tài khoản "${userToBlock.name}"`, 'success');
      setShowBlockModal(false);
      setBlockReason('');
      fetchUsers();
      if (addLog) {
        addLog(`Khóa tài khoản ${userToBlock.email} lý do: ${blockReason}`, 'sys');
      }
    } catch (err) {
      toast(err.message || 'Lỗi khóa tài khoản', 'error');
    }
  };

  const handleUnblockUserSubmit = async () => {
    try {
      await api.unblockUser(userToUnblock.id);
      toast(`Đã mở khóa tài khoản "${userToUnblock.name}"`, 'success');
      setShowUnblockModal(false);
      fetchUsers();
      if (addLog) {
        addLog(`Mở khóa tài khoản ${userToUnblock.email}`, 'sys');
      }
    } catch (err) {
      toast(err.message || 'Lỗi mở khóa tài khoản', 'error');
    }
  };

  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({ title: '', author: '', coverUrl: '', price: '', description: '', link: '' });
  const [leadSearch, setLeadSearch] = useState('');

  const getCurrentDateVietnamese = () => {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const dateStr = String(now.getDate()).padStart(2, '0');
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const yearStr = now.getFullYear();
    return `${dayName}, ngày ${dateStr} tháng ${monthStr}, ${yearStr}`;
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0).replace('₫', 'đ');
  };

  const getFilterText = (filter) => {
    switch (filter) {
      case 'this-month':
        return 'tháng này';
      case 'last-month':
        return 'tháng trước';
      case '3-months':
        return '3 tháng qua';
      case '6-months':
        return '6 tháng qua';
      case 'this-year':
        return 'năm nay';
      case 'custom':
        return 'trong kỳ';
      default:
        return 'trong kỳ';
    }
  };

  const renderKpiCard = (title, icon, data, colorKey = 'blue') => {
    const value = data?.value ?? 0;
    const isRevenue = title.toLowerCase().includes('doanh thu');
    const displayVal = isRevenue ? formatCurrency(value) : value;
    const change = data?.change ?? 0;
    const isPositive = change >= 0;
    
    return (
      <div className="kpi-card" key={title}>
        <div className="kpi-card-header">
          <div className={`kpi-card-icon ${colorKey}`}>{icon}</div>
          <span className={`kpi-change-badge ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}{change}%
          </span>
        </div>
        <div className="kpi-card-body">
          <h4 className="kpi-value">{displayVal}</h4>
          <span className="kpi-title">{title}</span>
          <p className="kpi-desc">{data?.description}</p>
        </div>
      </div>
    );
  };

  // Announcement & AI variables
  const [annText, setAnnText] = useState('');
  // Moderation Reports states
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [aiWeightDifficulty, setAiWeightDifficulty] = useState(70);
  const [aiWeightWeakness, setAiWeightWeakness] = useState(85);
  const [aiWeightRoadmap, setAiWeightRoadmap] = useState(90);

  useEffect(() => {
    if (activeTab === 'moderation') {
      fetchReports();
    }
  }, [activeTab]);

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const data = await api.getForumReports();
      setReports(data || []);
    } catch (err) {
      console.error('Lỗi tải báo cáo kiểm duyệt:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleResolveReport = async (reportId, action) => {
    const status = action === 'approve' ? 'RESOLVED' : 'DISMISSED';
    const notes = action === 'approve' 
      ? 'Quản trị viên phê duyệt báo cáo, nội dung vi phạm bị xử lý.' 
      : 'Quản trị viên từ chối báo cáo vi phạm.';
    
    try {
      await api.resolveForumReport(reportId, status, notes);
      toast('Đã xử lý báo cáo thành công!', 'success');
      fetchReports();
    } catch (err) {
      toast(err.message || 'Lỗi xử lý báo cáo!', 'error');
    }
  };

  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    if (!annText.trim()) return;
    onSendAnnouncement(annText);
    setAnnText('');
    addLog(`Quản trị viên phát hành thông báo hệ thống: "${annText}"`, 'sys');
    toast('Đã gửi thông báo hệ thống đến tất cả người dùng!', 'success');
  };

  const handleUpdateAIWeights = () => {
    addLog(`[AI Config] Cập nhật trọng số thuật toán thích ứng (Khó: ${aiWeightDifficulty}%, Điểm yếu: ${aiWeightWeakness}%, Lộ trình: ${aiWeightRoadmap}%)`, 'sys');
    toast('Cập nhật cấu hình thuật toán AI thành công!', 'success');
  };

  // Books CRUD logic
  const handleOpenBookModal = (book = null) => {
    if (book) {
      setEditingBook(book);
      setBookForm({ ...book });
    } else {
      setEditingBook(null);
      setBookForm({ title: '', author: '', coverUrl: '', price: '', description: '', link: '' });
    }
    setShowBookModal(true);
  };

  const handleSaveBook = (e) => {
    e.preventDefault();
    if (editingBook) {
      setBooksList(prev => prev.map(b => b.id === editingBook.id ? { ...b, ...bookForm } : b));
      addLog(`[Admin] Đã chỉnh sửa cuốn sách đề xuất: "${bookForm.title}"`, 'sys');
      toast('Cập nhật sách đề xuất thành công!', 'success');
    } else {
      const newBook = {
        id: Date.now(),
        ...bookForm
      };
      setBooksList(prev => [...prev, newBook]);
      addLog(`[Admin] Đã thêm cuốn sách đề xuất mới: "${bookForm.title}"`, 'sys');
      toast('Thêm sách đề xuất mới thành công!', 'success');
    }
    setShowBookModal(false);
  };

  const handleDeleteBook = (id, title) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sách đề xuất "${title}"?`)) {
      setBooksList(prev => prev.filter(b => b.id !== id));
      addLog(`[Admin] Đã xóa cuốn sách đề xuất: "${title}"`, 'sys');
      toast('Xóa sách thành công!', 'success');
    }
  };

  // Leads logic with DB sync
  const handleToggleLeadStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Chờ tư vấn' ? 'Đã liên hệ' : (currentStatus === 'Đã liên hệ' ? 'Thành công' : 'Chờ tư vấn');
    try {
      const { api } = await import('../api');
      const updated = await api.updateAdminLeadStatus(id, nextStatus);
      if (updated) {
        setLeadsList(prev => prev.map(l => l.id === id ? { ...l, status: updated.status } : l));
        addLog(`[Admin] Cập nhật trạng thái Lead ID ${id} sang "${nextStatus}"`, 'sys');
        toast(`Cập nhật trạng thái sang "${nextStatus}"!`, 'success');
      }
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái lead:', err);
      toast('Không thể cập nhật trạng thái lead', 'error');
    }
  };

  const filteredLeads = leadsList.filter(l => 
    l.name?.toLowerCase().includes(leadSearch.toLowerCase()) || 
    l.phone?.includes(leadSearch) ||
    l.email?.toLowerCase().includes(leadSearch.toLowerCase())
  );

  return (
    <div className="admin-root-container">
      {/* Dynamic CSS Stylesheet block for neobrutalism custom dashboard rendering */}
      <style dangerouslySetInnerHTML={{__html: `
        .admin-root-container {
          display: flex;
          height: 100vh;
          overflow: hidden;
          font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
          background-color: #FCFBFA;
          color: #0E100D;
        }

        /* ── SIDEBAR ── */
        .admin-sidebar {
          width: 260px;
          height: 100vh;
          position: sticky;
          top: 0;
          background-color: #0E100D;
          border-right: 1.5px solid #1C2B17;
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          box-sizing: border-box;
          color: #FFFFFF;
          flex-shrink: 0;
          overflow-y: auto;
        }

        .admin-sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .admin-sidebar::-webkit-scrollbar-thumb {
          background-color: #2E332A;
          border-radius: 4px;
        }

        .admin-sidebar-header {
          padding-bottom: 24px;
          border-bottom: 2px dashed #2E332A;
          margin-bottom: 24px;
        }

        .admin-sidebar-title {
          font-size: 20px;
          font-weight: 950;
          letter-spacing: 1px;
          margin: 0;
          color: #FFFFFF;
        }

        .admin-sidebar-subtitle {
          font-size: 11px;
          color: #8C9985;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-top: 4px;
          font-weight: 700;
        }

        .admin-sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .admin-menu-item {
          width: 100%;
          background: none;
          border: none;
          padding: 12px 16px;
          border-radius: 12px;
          color: #A3B899;
          font-size: 14.5px;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .admin-menu-item:hover {
          color: #FFFFFF;
          background-color: rgba(255, 255, 255, 0.04);
        }

        .admin-menu-item.active {
          background-color: #1C2B17;
          color: #FFFFFF;
        }

        .admin-menu-badge {
          background-color: #EF4444;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 100px;
          margin-left: auto;
        }

        .admin-sidebar-footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 2px dashed #2E332A;
        }

        .admin-back-btn {
          width: 100%;
          background-color: #FFFFFF;
          border: 1.5px solid #2D3229;
          color: #2D3229;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.15s;
          box-shadow: 2px 2px 0px #2D3229;
        }

        .admin-back-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px #2D3229;
          background-color: #FCFBFA;
        }

        /* ── MAIN WORKSPACE ── */
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          box-sizing: border-box;
        }

        /* ── STICKY TOP WRAPPER (Header chào mừng + admin-header) ── */
        .admin-sticky-top {
          position: sticky;
          top: 0;
          z-index: 100;
          background-color: #FCFBFA;
          border-bottom: 1.5px solid #E8E7E3;
        }

        .dark-theme .admin-sticky-top {
          background-color: #151A22 !important;
          border-bottom-color: #2D3748 !important;
        }

        .admin-header {
          background-color: transparent;
          border-bottom: none;
          padding: 10px 32px 14px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .admin-header-title {
          font-size: 22px;
          font-weight: 950;
          letter-spacing: -0.5px;
          text-transform: uppercase;
          margin: 0;
          color: #0E100D;
        }

        .admin-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .admin-header-subtitle-date {
          margin: 0;
          font-size: 13px;
          font-weight: 800;
          color: #7A7A7A;
        }

        .admin-header-filters {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .admin-filter-select {
          padding: 8px 16px;
          border: 1.5px solid #2D3229;
          border-radius: 8px;
          background-color: #FFFFFF;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          color: #2D3229;
          cursor: pointer;
          outline: none;
          box-shadow: 2px 2px 0px #2D3229;
          transition: all 0.15s;
        }

        .admin-filter-select:hover {
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px #2D3229;
        }

        .admin-custom-date-range {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #FFFFFF;
          border: 1.5px solid #2D3229;
          border-radius: 8px;
          padding: 4px 8px;
          box-shadow: 2px 2px 0px #2D3229;
        }

        .admin-date-input {
          border: none;
          outline: none;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          color: #2D3229;
          padding: 4px;
        }

        .admin-date-separator {
          font-size: 11px;
          font-weight: 800;
          color: #7A7A7A;
          text-transform: uppercase;
        }

        .admin-date-apply-btn {
          border: none;
          background-color: #1C2B17;
          color: #FFFFFF;
          font-family: inherit;
          font-size: 11px;
          font-weight: 800;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.15s;
        }

        .admin-date-apply-btn:hover {
          background-color: #2F4D25;
        }

        .admin-body {
          padding: 32px;
          max-width: 1360px;
          width: 100%;
          margin: 0 auto;
          box-sizing: border-box;
        }

        /* ── MODERN SaaS CARDS ── */
        .admin-card {
          background-color: #FFFFFF;
          border: 1.5px solid #E8E7E3;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(45, 50, 41, 0.03);
          margin-bottom: 24px;
          box-sizing: border-box;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(45, 50, 41, 0.06);
          border-color: #A3B899;
        }

        /* ── KPI CARD STYLES ── */
        .stats-row-5col {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 1200px) {
          .stats-row-5col {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-row-5col {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .stats-row-5col {
            grid-template-columns: 1fr;
          }
        }

        .kpi-card {
          background-color: #FFFFFF;
          border: 1.5px solid #E8E7E3;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(45, 50, 41, 0.03);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(45, 50, 41, 0.06);
          border-color: #A3B899;
        }

        .kpi-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .kpi-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background-color: #FCFBFA;
          border: 1px solid #E8E7E3;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1C2B17;
          font-size: 20px;
          transition: all 0.2s;
        }

        .kpi-card-icon.blue { background-color: #E0F2FE; color: #0284C7; border-color: #BAE6FD; }
        .kpi-card-icon.green { background-color: #D1FAE5; color: #059669; border-color: #A7F3D0; }
        .kpi-card-icon.indigo { background-color: #E0E7FF; color: #4F46E5; border-color: #C7D2FE; }
        .kpi-card-icon.purple { background-color: #F3E8FF; color: #7C3AED; border-color: #E9D5FF; }
        .kpi-card-icon.amber { background-color: #FEF3C7; color: #D97706; border-color: #FDE68A; }

        .kpi-change-badge {
          font-size: 11px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid currentColor;
        }

        .kpi-change-badge.positive {
          background-color: #D1FAE5;
          color: #065F46;
          border-color: #A7F3D0;
        }

        .kpi-change-badge.negative {
          background-color: #FEE2E2;
          color: #991B1B;
          border-color: #FCA5A5;
        }

        .kpi-value {
          font-size: 24px;
          font-weight: 950;
          color: #0E100D;
          margin: 0 0 2px 0;
          letter-spacing: -0.5px;
        }

        .kpi-title {
          font-size: 12px;
          font-weight: 850;
          color: #1C2B17;
          text-transform: uppercase;
        }

        .kpi-desc {
          font-size: 11px;
          color: #7A7A7A;
          margin: 4px 0 0 0;
          font-weight: 600;
        }

        /* ── CHARTS SECTION ── */
        .charts-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        @media (max-width: 1024px) {
          .charts-grid-2col {
            grid-template-columns: 1fr;
          }
        }

        .chart-card-title {
          font-size: 14px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 24px 0;
          color: #1C2B17;
        }

        .revenue-total-amount {
          color: #3B82F6;
          margin-left: 8px;
          text-transform: none;
          font-weight: 800;
        }

        .chart-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .chart-active-filter-badge {
          font-size: 11px;
          font-weight: 800;
          color: #1C2B17;
          background-color: #E8F4E5;
          border: 1px solid #C2E2BC;
          padding: 3px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        /* ── PROGRESS & SKILLS ── */
        .skills-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .skills-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .skill-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .skill-header {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 800;
          color: #0E100D;
        }

        .skill-title-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .skill-val {
          font-weight: 900;
        }

        .skill-progress-bar-bg {
          width: 100%;
          background-color: #F0EDEB;
          height: 14px;
          border: 1.5px solid #2D3229;
          border-radius: 20px;
          overflow: hidden;
        }

        .skill-progress-bar-fill {
          height: 100%;
          border-radius: 20px;
          transition: width 0.6s ease;
        }

        /* ── ADMIN SUB TABS FOR CONTENT ── */
        .admin-sub-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1.5px solid #E8E7E3;
          padding-bottom: 12px;
          overflow-x: auto;
        }

        .admin-sub-tab-btn {
          background: none;
          border: 1.5px solid transparent;
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          color: #7A7A7A;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .admin-sub-tab-btn:hover {
          color: #1C2B17;
          background-color: #F0EDEB;
        }

        .admin-sub-tab-btn.active {
          border-color: #2D3229;
          background-color: #FFFFFF;
          color: #1C2B17;
          box-shadow: 2px 2px 0px #2D3229;
        }

        /* ── LEADS TABLE ── */
        .leads-table-container {
          width: 100%;
          overflow-x: auto;
          border: 1.5px solid #E8E7E3;
          border-radius: 12px;
          background-color: #FFFFFF;
          box-shadow: 0 2px 8px rgba(45, 50, 41, 0.02);
        }

        .leads-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
        }

        .leads-table th {
          background-color: #FCFBFA;
          border-bottom: 1.5px solid #E8E7E3;
          padding: 14px 16px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #1C2B17;
        }

        .leads-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #F0EDEB;
          font-weight: 700;
          color: #333333;
        }

        .leads-table tr:last-child td {
          border-bottom: none;
        }

        .lead-status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid currentColor;
          cursor: pointer;
          text-align: center;
          transition: all 0.15s;
        }

        .lead-status-badge:hover {
          transform: scale(1.05);
        }

        .lead-status-badge.pending {
          background-color: #FEF3C7;
          color: #D97706;
          border-color: #FDE68A;
        }

        .lead-status-badge.contacted {
          background-color: #DBEAFE;
          color: #2563EB;
          border-color: #BFDBFE;
        }

        .lead-status-badge.success {
          background-color: #D1FAE5;
          color: #059669;
          border-color: #A7F3D0;
        }

        .student-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          flex-shrink: 0;
        }

        /* ── BOOKS GRID ── */
        .books-actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }

        .book-card {
          background-color: #FFFFFF;
          border: 1.5px solid #E8E7E3;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 4px 12px rgba(45, 50, 41, 0.03);
          display: flex;
          gap: 16px;
          position: relative;
          transition: all 0.2s;
        }

        .book-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(45, 50, 41, 0.06);
          border-color: #A3B899;
        }

        .book-cover {
          width: 90px;
          height: 120px;
          border: 1.5px solid #2D3229;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .book-info {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
        }

        .book-title {
          font-size: 14.5px;
          font-weight: 900;
          margin: 0 0 4px 0;
          line-height: 1.3;
          color: #0E100D;
        }

        .book-author {
          font-size: 11.5px;
          font-weight: 850;
          color: #7A7A7A;
          margin-bottom: 6px;
        }

        .book-desc {
          font-size: 11px;
          color: #64748B;
          line-height: 1.4;
          margin: 0 0 10px 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .book-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }

        .book-price {
          font-weight: 900;
          color: #EF4444;
          font-size: 13.5px;
        }

        .book-btn-buy {
          background-color: #FFFFFF;
          border: 1.5px solid #2D3229;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
          color: #2D3229;
          transition: all 0.15s;
          box-shadow: 1px 1px 0px #2D3229;
        }

        .book-btn-buy:hover {
          background-color: #2D3229;
          color: #FFFFFF;
          transform: translate(-0.5px, -0.5px);
          box-shadow: 1.5px 1.5px 0px #2D3229;
        }

        .book-actions-overlay {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          gap: 6px;
        }

        .book-act-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1.5px solid #2D3229;
          background-color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.15s;
        }

        .book-act-btn:hover {
          transform: translateY(-1px);
        }

        .book-act-btn.edit:hover { background-color: #DBEAFE; }
        .book-act-btn.delete:hover { background-color: #FEE2E2; color: #EF4444; }

        /* ── MODAL ── */
        .admin-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .admin-modal {
          background-color: #FFFFFF;
          border: 1.5px solid #2D3229;
          border-radius: 20px;
          width: 100%;
          max-width: 500px;
          box-shadow: 6px 6px 0px rgba(45, 50, 41, 0.15);
          overflow: hidden;
          animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .admin-modal-header {
          background-color: #F0EDEB;
          border-bottom: 2.5px solid #2D3229;
          padding: 16px 24px;
          font-weight: 950;
          font-size: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .admin-modal-body {
          padding: 24px;
        }

        .admin-modal-footer {
          padding: 16px 24px;
          border-top: 2px dashed #E5E5E5;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .admin-form-group {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .admin-form-group label {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .admin-form-input, .admin-form-textarea {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #2D3229;
          border-radius: 8px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          box-sizing: border-box;
          outline: none;
        }

        .admin-form-input:focus, .admin-form-textarea:focus {
          box-shadow: 2px 2px 0px #2D3229;
        }

        /* ── TERMINAL LOGS ── */
        .admin-terminal {
          background-color: #0E100D !important;
          border: 1.5px solid #2D3229;
          border-radius: 12px;
          padding: 16px;
          height: 320px;
          overflow-y: auto;
          font-family: 'SF Mono', Fira Code, Monaco, monospace;
          font-size: 11.5px;
          color: #4AF626 !important;
          line-height: 1.6;
          box-sizing: border-box;
        }

        .terminal-line {
          margin-bottom: 4px;
        }

        .terminal-time {
          color: #7A7A7A;
          margin-right: 8px;
        }

        .terminal-tag-ai {
          color: #38BDF8;
          font-weight: bold;
        }

        .terminal-tag-sys {
          color: #A855F7;
          font-weight: bold;
        }

        /* ── LOADING STATS OVERLAY ── */
        .stats-spinner {
          width: 44px;
          height: 44px;
          border: 4px solid #E8E7E3;
          border-top-color: #059669;
          border-radius: 50%;
          animation: spin-stats 0.8s linear infinite;
        }

        @keyframes spin-stats {
          to { transform: rotate(360deg); }
        }

        .dark-theme .stats-spinner {
          border-color: #2D3748;
          border-top-color: #A3B899;
        }

        .dark-theme .stats-loading-overlay {
          background: rgba(21, 26, 34, 0.75) !important;
        }
        
        .dark-theme .stats-loading-text {
          color: #A3B899 !important;
        }
      `}} />

      {/* ── LEFT SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h1 className="admin-sidebar-title">ADMIN PANEL</h1>
          <div className="admin-sidebar-subtitle">SUPER ADMIN</div>
        </div>

        <nav className="admin-sidebar-menu">
          <button 
            className={`admin-menu-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <HiChartBar style={{ fontSize: '18px' }} /> Thống kê
          </button>
          <button 
            className={`admin-menu-item ${activeTab === 'exams' ? 'active' : ''}`}
            onClick={() => setActiveTab('exams')}
          >
            <HiBookOpen style={{ fontSize: '18px' }} /> Quản lý đề
          </button>
          <button 
            className={`admin-menu-item ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <HiClipboardCheck style={{ fontSize: '18px' }} /> Nội dung
            {courseApprovals.length > 0 && (
              <span className="admin-menu-badge">{courseApprovals.length}</span>
            )}
          </button>
          <button 
            className={`admin-menu-item ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            <HiCollection style={{ fontSize: '18px' }} /> Đề xuất Sách
          </button>
          <button 
            className={`admin-menu-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <HiUsers style={{ fontSize: '18px' }} /> Người dùng
          </button>
          <button 
            className={`admin-menu-item ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            <HiTrendingUp style={{ fontSize: '18px' }} /> Leads
          </button>
          <button 
            className={`admin-menu-item ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            <HiAdjustments style={{ fontSize: '18px' }} /> Quản lý chức năng
          </button>
          <button 
            className={`admin-menu-item ${activeTab === 'moderation' ? 'active' : ''}`}
            onClick={() => setActiveTab('moderation')}
          >
            <span style={{ fontSize: '18px' }}>🛡️</span> Kiểm duyệt báo cáo
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button 
            className="admin-back-btn" 
            onClick={() => {
              if (navigateTo) {
                navigateTo('/');
              }
            }}
          >
            <HiArrowLeft /> Quay lại trang chủ
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE ── */}
      <main className="admin-main">
        {/* ── STICKY TOP: Header chào mừng + Admin page header ── */}
        <div className="admin-sticky-top">
          <div style={{ padding: '8px 32px 0 32px' }}>
            <Header
              role="admin"
              userProfile={currentUser}
              theme={theme}
              onToggleTheme={onToggleTheme}
              notifications={notifications || []}
              onClearNotifications={onClearNotifications}
              onLogout={onLogout}
              onChangePassword={onChangePassword}
              onNavigateSettings={onNavigateSettings}
              addLog={addLog}
              cartCourse={cartCourse}
              onCheckoutCourse={onCheckoutCourse}
            />
          </div>
          <header className="admin-header">
            <div className="admin-header-left">
              <h2 className="admin-header-title">
                {activeTab === 'stats' && 'Dashboard Thống kê'}
                {activeTab === 'exams' && 'QUẢN LÝ ĐỀ THI'}
                {activeTab === 'content' && 'QUẢN TRỊ NỘI DUNG'}
                {activeTab === 'books' && 'ĐỀ XUẤT SÁCH ÔN THI'}
                {activeTab === 'users' && 'QUẢN LÝ NGƯỜI DÙNG'}
                {activeTab === 'leads' && 'QUẢN LÝ ĐĂNG KÝ HỌC VIÊN (LEADS)'}
                {activeTab === 'features' && 'QUẢN LÝ CÁC CHỨC NĂNG HỆ THỐNG'}
                {activeTab === 'moderation' && 'KIỂM DUYỆT BÁO CÁO VI PHẠM'}
              </h2>
              {activeTab === 'stats' && (
                <p className="admin-header-subtitle-date">{getCurrentDateVietnamese()}</p>
              )}
            </div>
            {activeTab === 'stats' && (
              <div className="admin-header-filters">
                <select 
                  value={timeFilter} 
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="admin-filter-select"
                >
                  <option value="this-month">Tháng này</option>
                  <option value="last-month">Tháng trước</option>
                  <option value="3-months">3 tháng gần nhất</option>
                  <option value="6-months">6 tháng gần nhất</option>
                  <option value="this-year">Năm nay</option>
                </select>
              </div>
            )}
          </header>
        </div>

        <div className="admin-body">
          {/* ==========================================
              TAB: THỐNG KÊ (DASHBOARD)
              ========================================== */}
          {activeTab === 'stats' && (
            <div style={{ position: 'relative', minHeight: '400px' }}>
              {loadingStats && (
                <div className="stats-loading-overlay animate-in" style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(252, 251, 250, 0.75)',
                  backdropFilter: 'blur(6px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 50,
                  borderRadius: '16px',
                  gap: '16px',
                  transition: 'all 0.3s ease'
                }}>
                  <div className="stats-spinner" />
                  <p className="stats-loading-text" style={{
                    fontSize: '14px',
                    fontWeight: '800',
                    color: '#1C2B17',
                    letterSpacing: '-0.3px',
                    margin: 0
                  }}>
                    Đang tải dữ liệu thống kê...
                  </p>
                </div>
              )}

              <div style={{ opacity: loadingStats ? 0.35 : 1, transition: 'opacity 0.3s ease', pointerEvents: loadingStats ? 'none' : 'auto' }}>
                {/* Row 1: 5 Column KPI Cards */}
                <div className="stats-row-5col">
                {renderKpiCard('Tổng User', <HiUsers />, stats.kpi?.totalUsers, 'blue')}
                {renderKpiCard(`User mới ${getFilterText(timeFilter)}`, <HiPlus />, stats.kpi?.newUsersThisWeek, 'green')}
                {renderKpiCard(`Tổng bài làm ${getFilterText(timeFilter)}`, <HiClipboardCheck />, stats.kpi?.totalAttempts, 'indigo')}
                {renderKpiCard(`Tổng câu hỏi AI ${getFilterText(timeFilter)}`, <HiTerminal />, stats.kpi?.totalAiQuestions, 'purple')}
                {renderKpiCard(`Doanh thu ${getFilterText(timeFilter)}`, <HiTrendingUp />, stats.kpi?.revenue, 'amber')}
              </div>

              {/* Row 2: 2 Column Charts (Lượt làm bài & Câu hỏi AI) */}
              <div className="charts-grid-2col">
                {/* Bar Chart: Lượt làm bài */}
                <div className="admin-card">
                  <h3 className="chart-card-title">
                    Lượt làm bài: <span className="revenue-total-amount" style={{ color: '#059669' }}>{stats.kpi?.totalAttempts?.value}</span>
                  </h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={stats.attemptsChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E7E3" vertical={false} />
                        <XAxis dataKey="date" stroke="#7A7A7A" fontSize={11} fontWeight={700} tickLine={false} />
                        <YAxis stroke="#7A7A7A" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#FFFFFF', 
                            border: '1.5px solid #2D3229', 
                            borderRadius: '8px',
                            fontFamily: 'inherit',
                            fontSize: '12px',
                            fontWeight: '700',
                            boxShadow: '2px 2px 0px rgba(45, 50, 41, 0.15)'
                          }} 
                        />
                        <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} barSize={28} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Line Chart: Câu hỏi AI */}
                <div className="admin-card">
                  <h3 className="chart-card-title">
                    Câu hỏi AI: <span className="revenue-total-amount" style={{ color: '#8B5CF6' }}>{stats.kpi?.totalAiQuestions?.value}</span>
                  </h3>
                  <div style={{ width: '100%', height: 260 }}>
                    <ResponsiveContainer>
                      <LineChart data={stats.aiQuestionsChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E7E3" vertical={false} />
                        <XAxis dataKey="date" stroke="#7A7A7A" fontSize={11} fontWeight={700} tickLine={false} />
                        <YAxis stroke="#7A7A7A" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#FFFFFF', 
                            border: '1.5px solid #2D3229', 
                            borderRadius: '8px',
                            fontFamily: 'inherit',
                            fontSize: '12px',
                            fontWeight: '700',
                            boxShadow: '2px 2px 0px rgba(45, 50, 41, 0.15)'
                          }} 
                        />
                        <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls={true} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Row 3: Revenue Trend Area Chart */}
              <div className="admin-card">
                <div className="chart-header-row">
                  <h3 className="chart-card-title">
                    Doanh thu: <span className="revenue-total-amount">{formatCurrency(stats.kpi?.revenue?.value)}</span>
                  </h3>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <AreaChart data={stats.revenueChart || []} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E7E3" vertical={false} />
                      <XAxis dataKey="label" stroke="#7A7A7A" fontSize={11} fontWeight={700} tickLine={false} />
                      <YAxis 
                        stroke="#7A7A7A" 
                        fontSize={11} 
                        fontWeight={700} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1).replace('.0', '')}tr` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          border: '1.5px solid #2D3229', 
                          borderRadius: '8px',
                          fontFamily: 'inherit',
                          fontSize: '12px',
                          fontWeight: '700',
                          boxShadow: '2px 2px 0px rgba(45, 50, 41, 0.15)'
                        }} 
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" dot={{ r: 3 }} connectNulls={true} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB: QUẢN LÝ ĐỀ
              ========================================== */}
          {activeTab === 'exams' && (
            <AdminExamManager addLog={addLog} />
          )}

          {/* ==========================================
              TAB: NỘI DUNG & SYSTEM ADMIN (SUB-TABS)
              ========================================== */}
          {activeTab === 'content' && (
            <div>
              {/* Sub navigation bar inside Content */}
              <div className="admin-sub-tabs">
                <button 
                  className={`admin-sub-tab-btn ${contentSubTab === 'approvals' ? 'active' : ''}`}
                  onClick={() => setContentSubTab('approvals')}
                >
                  Phê duyệt khóa học ({courseApprovals.length})
                </button>
                <button 
                  className={`admin-sub-tab-btn ${contentSubTab === 'logs' ? 'active' : ''}`}
                  onClick={() => setContentSubTab('logs')}
                >
                  <HiTerminal /> Nhật ký hệ thống (Logs)
                </button>
                <button 
                  className={`admin-sub-tab-btn ${contentSubTab === 'announcements' ? 'active' : ''}`}
                  onClick={() => setContentSubTab('announcements')}
                >
                  <HiGlobeAlt /> Gửi thông báo hệ thống
                </button>
                <button 
                  className={`admin-sub-tab-btn ${contentSubTab === 'ai-config' ? 'active' : ''}`}
                  onClick={() => setContentSubTab('ai-config')}
                >
                  <HiAdjustments /> Cấu hình thuật toán AI
                </button>
              </div>

              {/* Sub-tab: Phê duyệt khóa học */}
              {contentSubTab === 'approvals' && (
                <div className="admin-card">
                  <h3 className="chart-card-title">KIỂM DUYỆT KHÓA HỌC MỚI</h3>
                  {courseApprovals.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {courseApprovals.map(c => (
                        <div key={c.id} style={{ padding: '16px', border: '2px solid #000000', borderRadius: '12px', background: '#FCFBFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ background: '#E8ECF1', border: '1.5px solid #000000', color: '#000000', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                              {c.subject}
                            </span>
                            <h4 style={{ fontSize: '15px', fontWeight: '900', marginTop: '8px', marginBottom: '4px' }}>{c.title}</h4>
                            <p style={{ fontSize: '12px', color: '#7A7A7A', fontWeight: '700' }}>Giảng viên: {c.teacherName} • Giá bán học phí: {c.price} VNĐ</p>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="admin-back-btn"
                              style={{ background: '#10B981', color: '#FFFFFF', borderColor: '#000000', padding: '8px 16px', boxShadow: 'none' }}
                              onClick={() => {
                                onApproveCourse(c.id);
                                addLog(`Quản trị viên KIỂM DUYỆT PHÊ DUYỆT khóa học "${c.title}" lên trang Landing chính`, 'sys');
                              }}
                            >
                              Phê duyệt phát hành
                            </button>
                            <button
                              className="admin-back-btn"
                              style={{ background: '#EF4444', color: '#FFFFFF', borderColor: '#000000', padding: '8px 16px', boxShadow: 'none' }}
                              onClick={() => {
                                onRejectCourse(c.id);
                                addLog(`Quản trị viên TỪ CHỐI phê duyệt khóa học "${c.title}"`, 'sys');
                              }}
                            >
                              Từ chối kiểm duyệt
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '32px', background: '#FCFBFA', border: '2px dashed #000000', borderRadius: '12px' }}>
                      <span style={{ fontSize: '28px' }}>📝</span>
                      <p style={{ fontSize: '13px', color: '#7A7A7A', fontWeight: '700', marginTop: '8px', margin: 0 }}>Không có khóa học nào đang chờ phê duyệt duyệt.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab: Logs */}
              {contentSubTab === 'logs' && (
                <div className="admin-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 className="chart-card-title" style={{ margin: 0 }}>Nhật ký Live Logs hệ thống</h3>
                    <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '800' }}>● ĐANG THEO DÕI LIVE MONITOR PORT (8080)</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#7A7A7A', marginBottom: '16px', fontWeight: '700' }}>
                    Nhật ký log hiển thị toàn bộ hoạt động của học sinh, giáo viên, tiến trình phân tích của AI System và giao dịch của Payment System theo thời gian thực.
                  </p>
                  <div className="admin-terminal">
                    {systemLogs.map((log) => (
                      <div key={log.id} className="terminal-line">
                        <span className="terminal-time">[{log.time}]</span>
                        {log.tag === 'ai' ? (
                          <span className="terminal-tag-ai">[AI SYSTEM] </span>
                        ) : (
                          <span className="terminal-tag-sys">[SYSTEM] </span>
                        )}
                        <span>{log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab: Announcements */}
              {contentSubTab === 'announcements' && (
                <div className="admin-card" style={{ maxWidth: '600px' }}>
                  <h3 className="chart-card-title">Gửi thông báo hệ thống</h3>
                  <form onSubmit={handleSendAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="admin-form-group">
                      <label>Nội dung thông báo (Toàn bộ người dùng):</label>
                      <textarea
                        className="admin-form-textarea"
                        rows="5"
                        placeholder="Nhập thông báo gửi đến toàn bộ học sinh và giáo viên trên hệ thống..."
                        value={annText}
                        onChange={e => setAnnText(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="admin-back-btn" style={{ alignSelf: 'flex-start', background: '#6c5ce7', color: '#FFFFFF' }}>
                      Phát thông báo ngay ⚡
                    </button>
                  </form>
                </div>
              )}

              {/* Sub-tab: AI config */}
              {contentSubTab === 'ai-config' && (
                <div className="admin-card" style={{ maxWidth: '600px' }}>
                  <h3 className="chart-card-title">Cấu hình tham số thuật toán AI thích ứng</h3>
                  <p style={{ fontSize: '13px', color: '#7A7A7A', marginBottom: '20px', fontWeight: '700' }}>
                    Điều chỉnh trọng số ưu tiên của hệ thống AI khi quét lỗ hổng kiến thức và đề xuất bài tập tự động cho học viên.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                    <div className="admin-form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '800', marginBottom: '4px' }}>
                        <span>Độ ưu tiên Độ khó câu hỏi sai:</span>
                        <span style={{ color: '#6c5ce7' }}>{aiWeightDifficulty}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={aiWeightDifficulty}
                        onChange={e => setAiWeightDifficulty(e.target.value)}
                        style={{ width: '100%', accentColor: '#6c5ce7' }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '800', marginBottom: '4px' }}>
                        <span>Độ nhạy phân tích Điểm yếu:</span>
                        <span style={{ color: '#6c5ce7' }}>{aiWeightWeakness}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={aiWeightWeakness}
                        onChange={e => setAiWeightWeakness(e.target.value)}
                        style={{ width: '100%', accentColor: '#6c5ce7' }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '800', marginBottom: '4px' }}>
                        <span>Tốc độ thay đổi Lộ trình học (Roadmap Adjust Rate):</span>
                        <span style={{ color: '#6c5ce7' }}>{aiWeightRoadmap}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={aiWeightRoadmap}
                        onChange={e => setAiWeightRoadmap(e.target.value)}
                        style={{ width: '100%', accentColor: '#6c5ce7' }}
                      />
                    </div>
                  </div>

                  <button className="admin-back-btn" onClick={handleUpdateAIWeights} style={{ background: '#1C2B17', color: '#FFFFFF' }}>
                    Lưu cấu hình tham số AI
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              TAB: ĐỀ XUẤT SÁCH (CRUD BOOKS)
              ========================================== */}
          {activeTab === 'books' && (
            <div>
              <div className="books-actions-bar">
                <span style={{ fontSize: '13.5px', color: '#7A7A7A', fontWeight: '800' }}>
                  Hiển thị đề xuất sách ôn luyện chất lượng cho học viên
                </span>
                <button 
                  className="admin-back-btn" 
                  style={{ background: '#1C2B17', color: '#FFFFFF', width: 'auto' }}
                  onClick={() => handleOpenBookModal()}
                >
                  <HiPlus /> Thêm sách đề xuất mới
                </button>
              </div>

              <div className="books-grid">
                {booksList.map(book => (
                  <div key={book.id} className="book-card">
                    <img src={book.coverUrl} alt={book.title} className="book-cover" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200"; }} />
                    <div className="book-info">
                      <div>
                        <h4 className="book-title">{book.title}</h4>
                        <div className="book-author">Tác giả: {book.author}</div>
                        <p className="book-desc">{book.description}</p>
                      </div>
                      <div className="book-footer">
                        <span className="book-price">{book.price}</span>
                        <a href={book.link} target="_blank" rel="noopener noreferrer" className="book-btn-buy">
                          Mua ngay →
                        </a>
                      </div>
                    </div>

                    <div className="book-actions-overlay">
                      <button className="book-act-btn edit" onClick={() => handleOpenBookModal(book)} title="Chỉnh sửa">
                        <HiPencil />
                      </button>
                      <button className="book-act-btn delete" onClick={() => handleDeleteBook(book.id, book.title)} title="Xóa">
                        <HiTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB: USERS LIST & VERIFY
              ========================================== */}
          {activeTab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Thống kê Người dùng */}
              <div className="stats-row-5col" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '0' }}>
                {renderKpiCard('Tổng Người dùng', <HiUsers />, { value: userStats.totalUsers, change: 0, description: 'Tài khoản hệ thống' }, 'blue')}
                {renderKpiCard('Tổng Học sinh', <HiUsers />, { value: userStats.totalStudents, change: 0, description: 'Vai trò STUDENT' }, 'green')}
                {renderKpiCard('Tổng Giáo viên', <HiUsers />, { value: userStats.totalTeachers, change: 0, description: 'Vai trò TEACHER' }, 'purple')}
                {renderKpiCard('Bị khóa', <HiUsers />, { value: userStats.totalBlocked, change: 0, description: 'Trạng thái BLOCKED' }, 'amber')}
              </div>

              {/* Bộ lọc & Tìm kiếm */}
              <div className="admin-card" style={{ marginBottom: '0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr', gap: '16px', alignItems: 'center' }}>
                  {/* Search */}
                  <div style={{ position: 'relative' }}>
                    <HiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#7A7A7A' }} />
                    <input
                      type="text"
                      className="admin-form-input"
                      placeholder="Tìm theo tên hoặc email..."
                      value={userSearch}
                      onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                      style={{ paddingLeft: '32px' }}
                    />
                  </div>

                  {/* Role filter */}
                  <select
                    className="admin-form-input"
                    value={userRoleFilter}
                    onChange={(e) => { setUserRoleFilter(e.target.value); setUserPage(1); }}
                    style={{ height: '40px', padding: '0 10px' }}
                  >
                    <option value="all">Tất cả vai trò</option>
                    <option value="STUDENT">Học sinh (STUDENT)</option>
                    <option value="TEACHER">Giáo viên (TEACHER)</option>
                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  </select>

                  {/* Status filter */}
                  <select
                    className="admin-form-input"
                    value={userStatusFilter}
                    onChange={(e) => { setUserStatusFilter(e.target.value); setUserPage(1); }}
                    style={{ height: '40px', padding: '0 10px' }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                    <option value="BLOCKED">Bị khóa (BLOCKED)</option>
                  </select>

                  {/* Date range filter */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="date"
                      className="admin-form-input"
                      value={userStartDate}
                      onChange={(e) => { setUserStartDate(e.target.value); setUserPage(1); }}
                      style={{ fontSize: '11px', height: '40px' }}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>-</span>
                    <input
                      type="date"
                      className="admin-form-input"
                      value={userEndDate}
                      onChange={(e) => { setUserEndDate(e.target.value); setUserPage(1); }}
                      style={{ fontSize: '11px', height: '40px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Bảng danh sách người dùng */}
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className="chart-card-title" style={{ margin: 0 }}>DANH SÁCH TÀI KHOẢN NGƯỜI DÙNG</h3>
                  {usersLoading && <div className="stats-spinner" style={{ width: '20px', height: '20px' }} />}
                </div>

                <div className="leads-table-container">
                  <table className="leads-table">
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>Avatar</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th style={{ textAlign: 'center' }}>Vai trò</th>
                        <th style={{ textAlign: 'center' }}>Trạng thái</th>
                        <th>Ngày đăng ký</th>
                        <th>Lần đăng nhập cuối</th>
                        <th style={{ textAlign: 'center', width: '200px' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map(user => {
                        const isSelf = user.id === currentUser?.id;
                        return (
                          <tr key={user.id} style={{ opacity: usersLoading ? 0.5 : 1 }}>
                            <td style={{ textAlign: 'center' }}>
                              {user.avatarUrl && (user.avatarUrl.startsWith('http') || user.avatarUrl.startsWith('data:')) ? (
                                <img
                                  src={user.avatarUrl}
                                  alt="Avatar"
                                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #000' }}
                                />
                              ) : (
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  background: user.role === 'ADMIN' ? '#EF4444' : user.role === 'TEACHER' ? '#3B82F6' : '#10B981',
                                  color: '#FFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: '800',
                                  margin: '0 auto',
                                  border: '1.5px solid #000'
                                }}>
                                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                                </div>
                              )}
                            </td>
                            <td style={{ fontWeight: '800' }}>{user.name}</td>
                            <td>{user.email}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: '800',
                                border: '1.5px solid #000',
                                background: user.role === 'ADMIN' ? '#FEE2E2' : user.role === 'TEACHER' ? '#DBEAFE' : '#D1FAE5',
                                color: user.role === 'ADMIN' ? '#991B1B' : user.role === 'TEACHER' ? '#1E40AF' : '#065F46'
                              }}>
                                {user.role}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: '800',
                                border: '1.5px solid #000',
                                background: user.status === 'BLOCKED' ? '#F3F4F6' : '#D1FAE5',
                                color: user.status === 'BLOCKED' ? '#374151' : '#065F46'
                              }}>
                                {user.status === 'BLOCKED' ? 'BỊ KHÓA' : 'HOẠT ĐỘNG'}
                              </span>
                            </td>
                            <td>{user.registeredDate}</td>
                            <td>
                              {user.lastLoginAt ? (
                                new Date(user.lastLoginAt).toLocaleString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })
                              ) : (
                                <span style={{ color: '#7A7A7A', fontStyle: 'italic' }}>Chưa đăng nhập</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button
                                  className="admin-back-btn"
                                  style={{ padding: '4px 8px', fontSize: '11px', width: 'auto', boxShadow: 'none', background: '#3B82F6', color: '#FFF', borderColor: '#000' }}
                                  onClick={() => handleViewUserDetail(user.id)}
                                >
                                  Chi tiết
                                </button>
                                {user.status === 'BLOCKED' ? (
                                  <button
                                    className="admin-back-btn"
                                    style={{ padding: '4px 8px', fontSize: '11px', width: 'auto', boxShadow: 'none', background: '#10B981', color: '#FFF', borderColor: '#000' }}
                                    onClick={() => { setUserToUnblock(user); setShowUnblockModal(true); }}
                                  >
                                    Mở khóa
                                  </button>
                                ) : (
                                  <button
                                    className="admin-back-btn"
                                    style={{ padding: '4px 8px', fontSize: '11px', width: 'auto', boxShadow: 'none', background: '#EF4444', color: '#FFF', borderColor: '#000', opacity: isSelf ? 0.5 : 1 }}
                                    disabled={isSelf}
                                    title={isSelf ? 'Bạn không thể tự khóa chính mình' : ''}
                                    onClick={() => { setUserToBlock(user); setShowBlockModal(true); }}
                                  >
                                    Khóa
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {adminUsers.length === 0 && (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#7A7A7A', fontWeight: 'bold' }}>
                            Không tìm thấy tài khoản người dùng nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Phân trang */}
                {userPagination.totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                    <button
                      className="admin-back-btn"
                      style={{ padding: '4px 12px', fontSize: '11px', width: 'auto', boxShadow: 'none', opacity: userPage === 1 ? 0.5 : 1 }}
                      disabled={userPage === 1}
                      onClick={() => setUserPage(prev => Math.max(1, prev - 1))}
                    >
                      Trước
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 'bold', padding: '0 8px' }}>
                      Trang {userPage} / {userPagination.totalPages} (Tổng: {userPagination.total})
                    </span>
                    <button
                      className="admin-back-btn"
                      style={{ padding: '4px 12px', fontSize: '11px', width: 'auto', boxShadow: 'none', opacity: userPage === userPagination.totalPages ? 0.5 : 1 }}
                      disabled={userPage === userPagination.totalPages}
                      onClick={() => setUserPage(prev => Math.min(userPagination.totalPages, prev + 1))}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB: LEADS REGISTRY
              ========================================== */}
          {activeTab === 'leads' && (
            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '13.5px', color: '#7A7A7A', fontWeight: '800' }}>
                  Danh sách Leads đăng ký form tư vấn lộ trình thích ứng
                </span>
                
                {/* Search Bar */}
                <div style={{ position: 'relative', width: '260px' }}>
                  <HiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#7A7A7A' }} />
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="Tìm leads..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                    style={{ paddingLeft: '32px', height: '36px', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div className="leads-table-container">
                <table className="leads-table">
                  <thead>
                    <tr>
                      <th>Họ tên</th>
                      <th>Điện thoại</th>
                      <th>Email</th>
                      <th>Combo đăng ký</th>
                      <th>Ngày đăng ký</th>
                      <th style={{ textAlign: 'center' }}>Trạng thái (Click đổi)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => (
                      <tr key={lead.id}>
                        <td>{lead.name}</td>
                        <td>{lead.phone}</td>
                        <td>{lead.email}</td>
                        <td>{lead.target}</td>
                        <td>{lead.registeredDate}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span 
                            onClick={() => handleToggleLeadStatus(lead.id, lead.status)}
                            className={`lead-status-badge ${
                              lead.status === 'Chờ tư vấn' ? 'pending' : (lead.status === 'Đã liên hệ' ? 'contacted' : 'success')
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#7A7A7A' }}>
                          Không tìm thấy leads nào phù hợp.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB: FEATURE FLAGS MANAGER
              ========================================== */}
          {activeTab === 'features' && (
            <div className="admin-card">
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
                  ⚙️ QUẢN LÝ CÁC CHỨC NĂNG HỆ THỐNG (FEATURE FLAGS)
                </h2>
                <p style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>
                  Bật hoặc tắt các module chức năng chính hiển thị cho học viên trên hệ thống. 
                  Các thay đổi sẽ có hiệu lực ngay lập tức đối với người dùng cuối.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {(featureFlags || []).map(flag => (
                  <div 
                    key={flag.id} 
                    className="admin-card" 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between', 
                      padding: '20px',
                      border: '3px solid #000000',
                      boxShadow: '4px 4px 0px #000000',
                      borderRadius: '12px',
                      background: '#FFFFFF',
                      marginBottom: 0
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '800' }}>
                          {flag.name}
                        </span>
                        <span 
                          style={{
                            padding: '4px 10px',
                            border: '2px solid #000000',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '800',
                            background: flag.isEnabled ? '#D1FAE5' : '#FEE2E2',
                            color: '#000000',
                            boxShadow: '1px 1px 0px #000000'
                          }}
                        >
                          {flag.isEnabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#777', fontWeight: '600', marginBottom: '16px' }}>
                        Mã định danh: <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: '4px', border: '1px solid #E5E7EB' }}>{flag.id}</code>
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          const { api } = await import('../api');
                          const updated = await api.toggleFeatureFlag(flag.id, !flag.isEnabled);
                          if (updated) {
                            setFeatureFlags(prev => prev.map(f => f.id === flag.id ? { ...f, isEnabled: updated.isEnabled } : f));
                            toast(`Đã ${updated.isEnabled ? 'bật' : 'tắt'} chức năng "${flag.name}" thành công!`, 'success');
                            if (addLog) addLog(`[ADMIN] Đã ${updated.isEnabled ? 'bật' : 'tắt'} chức năng ${flag.id}`, 'info');
                          }
                        } catch (err) {
                          toast(`Lỗi khi cập nhật trạng thái chức năng: ${err.message}`, 'error');
                        }
                      }}
                      className="admin-back-btn"
                      style={{
                        width: '100%',
                        background: flag.isEnabled ? '#EF4444' : '#10B981',
                        color: '#FFFFFF',
                        border: '3px solid #000000',
                        boxShadow: '3px 3px 0px #000000',
                        fontWeight: '800',
                        cursor: 'pointer',
                        padding: '10px',
                        borderRadius: '8px'
                      }}
                    >
                      {flag.isEnabled ? 'Tắt chức năng' : 'Bật chức năng'}
                    </button>
                  </div>
                ))}
                {(featureFlags || []).length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: '#FCFBFA', border: '2px dashed #000000', borderRadius: '12px' }}>
                    <span style={{ fontSize: '28px' }}>⚙️</span>
                    <p style={{ fontWeight: '800', marginTop: '10px' }}>Không có chức năng nào để thiết lập.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>
                    🛡️ KIỂM DUYỆT BÁO CÁO NỘI DUNG VI PHẠM
                  </h2>
                  <p style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>
                    Dưới đây là danh sách các báo cáo từ học viên gửi về các bài viết hoặc bình luận vi phạm quy chuẩn cộng đồng.
                  </p>
                </div>
                <button 
                  className="admin-back-btn" 
                  onClick={fetchReports} 
                  style={{ padding: '8px 16px', width: 'auto', boxShadow: 'none' }}
                >
                  Tải lại
                </button>
              </div>

              {loadingReports ? (
                <div style={{ textAlign: 'center', padding: '30px', fontWeight: '700' }}>Đang tải báo cáo vi phạm...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reports.length > 0 ? (
                    reports.map(rep => (
                      <div 
                        key={rep.id} 
                        style={{ 
                          padding: '20px', 
                          border: '3px solid #000000', 
                          borderRadius: '12px', 
                          background: '#FCFBFA', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '12px',
                          boxShadow: '4px 4px 0px #000000'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2.5px dashed #000000', paddingBottom: '12px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '900', color: '#000000' }}>
                            Báo cáo #{rep.id} bởi: <strong style={{ color: '#6c5ce7' }}>{rep.reporter?.fullName}</strong>
                          </span>
                          <span style={{ fontSize: '12px', color: '#7A7A7A', fontWeight: '700' }}>
                            Gửi lúc: {new Date(rep.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div style={{ fontSize: '14px', color: '#000000', margin: '4px 0', fontWeight: '700' }}>
                          <strong>Lý do tố cáo: </strong>
                          <span style={{ color: '#EF4444', fontWeight: '900' }}>{rep.reason}</span>
                        </div>

                        {rep.post && (
                          <div style={{ padding: '12px 16px', background: '#FFFFFF', border: '2px solid #000000', borderLeft: '8px solid #6c5ce7', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                            <strong>Bài viết bị tố cáo:</strong> "{rep.post.title}" (ID: {rep.post.id})
                          </div>
                        )}

                        {rep.comment && (
                          <div style={{ padding: '12px 16px', background: '#FFFFFF', border: '2px solid #000000', borderLeft: '8px solid #00D2FC', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                            <strong>Bình luận bị tố cáo:</strong> "{rep.comment.content}" (ID: {rep.comment.id})
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                          <button
                            className="admin-back-btn"
                            style={{ padding: '8px 16px', width: 'auto', background: '#EF4444', color: '#FFFFFF', borderColor: '#000000', boxShadow: 'none' }}
                            onClick={() => {
                              if (window.confirm('Bạn có chắc chắn muốn xử lý nội dung bị tố cáo này? (Bài viết/Bình luận liên quan sẽ bị ẩn)')) {
                                handleResolveReport(rep.id, 'approve');
                              }
                            }}
                          >
                            ✓ Duyệt & Ẩn nội dung vi phạm
                          </button>
                          <button
                            className="admin-back-btn"
                            style={{ padding: '8px 16px', width: 'auto', background: '#FFFFFF', color: '#000000', borderColor: '#000000', boxShadow: 'none' }}
                            onClick={() => handleResolveReport(rep.id, 'reject')}
                          >
                            ✕ Bác bỏ báo cáo
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#FCFBFA', border: '2px dashed #000000', borderRadius: '12px' }}>
                      <span style={{ fontSize: '28px' }}>🎉</span>
                      <p style={{ fontWeight: '800', marginTop: '10px', margin: 0 }}>Không có báo cáo vi phạm nào chưa xử lý!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ==========================================
          BOOK DIALOG MODAL (ADD / EDIT)
          ========================================== */}
      {showBookModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowBookModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <header className="admin-modal-header">
              <span>{editingBook ? 'CHỈNH SỬA SÁCH ĐỀ XUẤT' : 'THÊM SÁCH ĐỀ XUẤT MỚI'}</span>
              <button 
                onClick={() => setShowBookModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
              >
                ×
              </button>
            </header>

            <form onSubmit={handleSaveBook}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label>Tiêu đề sách:</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={bookForm.title}
                    onChange={e => setBookForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Tác giả / Nguồn biên soạn:</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={bookForm.author}
                    onChange={e => setBookForm(prev => ({ ...prev, author: e.target.value }))}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Đường dẫn hình ảnh bìa (Cover URL):</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="https://example.com/cover.jpg"
                    value={bookForm.coverUrl}
                    onChange={e => setBookForm(prev => ({ ...prev, coverUrl: e.target.value }))}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Giá bán:</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="129.000đ"
                    value={bookForm.price}
                    onChange={e => setBookForm(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Đường dẫn mua hàng (Shopee/Tiki):</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder="https://shopee.vn/..."
                    value={bookForm.link}
                    onChange={e => setBookForm(prev => ({ ...prev, link: e.target.value }))}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Mô tả ngắn gọn:</label>
                  <textarea
                    className="admin-form-textarea"
                    rows="3"
                    value={bookForm.description}
                    onChange={e => setBookForm(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <footer className="admin-modal-footer">
                <button 
                  type="button" 
                  className="admin-back-btn" 
                  style={{ background: 'none', boxShadow: 'none' }}
                  onClick={() => setShowBookModal(false)}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="admin-back-btn"
                  style={{ background: '#1C2B17', color: '#FFFFFF' }}
                >
                  Lưu thông tin
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          USER DETAIL MODAL
          ========================================== */}
      {showDetailModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="admin-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <header className="admin-modal-header">
              <span>CHI TIẾT TÀI KHOẢN NGƯỜI DÙNG</span>
              <button 
                onClick={() => setShowDetailModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
              >
                ×
              </button>
            </header>

            <div className="admin-modal-body">
              {userDetailLoading || !selectedUser ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="stats-spinner" style={{ margin: '0 auto 12px auto' }} />
                  <p style={{ fontWeight: 'bold' }}>Đang tải thông tin chi tiết...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#FCFBFA', padding: '16px', border: '2px solid #000', borderRadius: '12px' }}>
                    {selectedUser.user.avatarUrl && (selectedUser.user.avatarUrl.startsWith('http') || selectedUser.user.avatarUrl.startsWith('data:')) ? (
                      <img
                        src={selectedUser.user.avatarUrl}
                        alt="Avatar"
                        style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #000' }}
                      />
                    ) : (
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: selectedUser.user.role === 'ADMIN' ? '#EF4444' : selectedUser.user.role === 'TEACHER' ? '#3B82F6' : '#10B981',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: '800',
                        border: '2px solid #000'
                      }}>
                        {selectedUser.user.name ? selectedUser.user.name.slice(0, 2).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '950' }}>{selectedUser.user.name}</h3>
                      <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#666', fontWeight: '600' }}>Email: {selectedUser.user.email}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#666', fontWeight: '600' }}>Điện thoại: {selectedUser.user.phone || 'Chưa cung cấp'}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="admin-form-group" style={{ margin: 0 }}>
                      <label>Vai trò:</label>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '800',
                        border: '1.5px solid #000',
                        background: selectedUser.user.role === 'ADMIN' ? '#FEE2E2' : selectedUser.user.role === 'TEACHER' ? '#DBEAFE' : '#D1FAE5',
                        color: selectedUser.user.role === 'ADMIN' ? '#991B1B' : selectedUser.user.role === 'TEACHER' ? '#1E40AF' : '#065F46'
                      }}>{selectedUser.user.role}</span>
                    </div>

                    <div className="admin-form-group" style={{ margin: 0 }}>
                      <label>Trạng thái:</label>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '800',
                        border: '1.5px solid #000',
                        background: selectedUser.user.status === 'BLOCKED' ? '#F3F4F6' : '#D1FAE5',
                        color: selectedUser.user.status === 'BLOCKED' ? '#374151' : '#065F46'
                      }}>{selectedUser.user.status === 'BLOCKED' ? 'BỊ KHÓA' : 'HOẠT ĐỘNG'}</span>
                    </div>

                    <div className="admin-form-group" style={{ margin: 0 }}>
                      <label>Ngày tạo tài khoản:</label>
                      <span style={{ fontWeight: '700' }}>{new Date(selectedUser.user.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <div className="admin-form-group" style={{ margin: 0 }}>
                      <label>Đăng nhập cuối:</label>
                      <span style={{ fontWeight: '700' }}>
                        {selectedUser.user.lastLoginAt ? new Date(selectedUser.user.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                      </span>
                    </div>
                  </div>

                  {selectedUser.user.status === 'BLOCKED' && (
                    <div style={{ background: '#FFFBEB', border: '2px solid #F59E0B', borderRadius: '12px', padding: '14px' }}>
                      <h4 style={{ margin: '0 0 6px 0', color: '#B45309', fontWeight: '900', fontSize: '13px' }}>THÔNG TIN KHÓA TÀI KHOẢN</h4>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12.5px', fontWeight: '700' }}>Lý do: <span style={{ color: '#D97706' }}>{selectedUser.user.blockedReason}</span></p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12.5px', fontWeight: '700' }}>Khóa bởi: {selectedUser.user.blockedBy}</p>
                      <p style={{ margin: 0, fontSize: '12.5px', fontWeight: '700' }}>Thời gian khóa: {selectedUser.user.blockedAt ? new Date(selectedUser.user.blockedAt).toLocaleString('vi-VN') : ''}</p>
                    </div>
                  )}

                  {selectedUser.user.role === 'STUDENT' && (
                    <div style={{ borderTop: '2px solid #000', paddingTop: '16px' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontWeight: '950', fontSize: '14px' }}>📊 THỐNG KÊ HỌC TẬP (STUDENT)</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                          <span style={{ display: 'block', fontSize: '11px', color: '#6B7280', fontWeight: '700' }}>Tổng số bài làm</span>
                          <span style={{ fontSize: '20px', fontWeight: '900', color: '#111827' }}>{selectedUser.stats?.totalAttempts || 0}</span>
                        </div>
                        <div style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                          <span style={{ display: 'block', fontSize: '11px', color: '#6B7280', fontWeight: '700' }}>Điểm trung bình</span>
                          <span style={{ fontSize: '20px', fontWeight: '900', color: '#111827' }}>{selectedUser.stats?.averageScore || 0}/10</span>
                        </div>
                        <div style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                          <span style={{ display: 'block', fontSize: '11px', color: '#6B7280', fontWeight: '700' }}>Tổng câu hỏi AI</span>
                          <span style={{ fontSize: '20px', fontWeight: '900', color: '#111827' }}>{selectedUser.stats?.totalAiQuestions || 0}</span>
                        </div>
                        <div style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                          <span style={{ display: 'block', fontSize: '11px', color: '#6B7280', fontWeight: '700' }}>Khóa học đã tham gia</span>
                          <span style={{ fontSize: '20px', fontWeight: '900', color: '#111827' }}>{selectedUser.stats?.enrolledCourses || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedUser.user.role === 'TEACHER' && (
                    <div style={{ borderTop: '2px solid #000', paddingTop: '16px' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontWeight: '950', fontSize: '14px' }}>📊 THỐNG KÊ GIẢNG DẠY (TEACHER)</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        <div style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                          <span style={{ display: 'block', fontSize: '10px', color: '#6B7280', fontWeight: '700' }}>Khóa học đã tạo</span>
                          <span style={{ fontSize: '18px', fontWeight: '900', color: '#111827' }}>{selectedUser.stats?.createdCourses || 0}</span>
                        </div>
                        <div style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                          <span style={{ display: 'block', fontSize: '10px', color: '#6B7280', fontWeight: '700' }}>Khóa học đã duyệt</span>
                          <span style={{ fontSize: '18px', fontWeight: '900', color: '#111827' }}>{selectedUser.stats?.approvedCourses || 0}</span>
                        </div>
                        <div style={{ background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                          <span style={{ display: 'block', fontSize: '10px', color: '#6B7280', fontWeight: '700' }}>Tổng số học viên</span>
                          <span style={{ fontSize: '18px', fontWeight: '900', color: '#111827' }}>{selectedUser.stats?.studentCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <footer className="admin-modal-footer">
              <button 
                type="button" 
                className="admin-back-btn" 
                style={{ background: '#1C2B17', color: '#FFFFFF', boxShadow: 'none' }}
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* ==========================================
          CONFIRM BLOCK MODAL
          ========================================== */}
      {showBlockModal && userToBlock && (
        <div className="admin-modal-backdrop" onClick={() => setShowBlockModal(false)}>
          <div className="admin-modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <header className="admin-modal-header" style={{ borderBottom: '2px solid #EF4444' }}>
              <span style={{ color: '#EF4444', fontWeight: '900' }}>⚠️ XÁC NHẬN KHÓA TÀI KHOẢN</span>
              <button 
                onClick={() => setShowBlockModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
              >
                ×
              </button>
            </header>

            <div className="admin-modal-body">
              <p style={{ fontWeight: 'bold', marginBottom: '16px' }}>
                Bạn có chắc chắn muốn khóa tài khoản của người dùng:
                <br />
                <span style={{ color: '#EF4444', fontSize: '16px', fontWeight: '950' }}>{userToBlock.name}</span> ({userToBlock.email})?
              </p>
              
              <div className="admin-form-group">
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Lý do khóa tài khoản (Bắt buộc):</label>
                <textarea
                  className="admin-form-textarea"
                  placeholder="Nhập lý do khóa tài khoản..."
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  rows="3"
                  required
                />
              </div>
            </div>

            <footer className="admin-modal-footer">
              <button 
                type="button" 
                className="admin-back-btn" 
                style={{ background: 'none', boxShadow: 'none' }}
                onClick={() => setShowBlockModal(false)}
              >
                Hủy bỏ
              </button>
              <button 
                type="button" 
                className="admin-back-btn"
                style={{ background: '#EF4444', color: '#FFFFFF', borderColor: '#000' }}
                onClick={handleBlockUserSubmit}
              >
                Khóa tài khoản
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* ==========================================
          CONFIRM UNBLOCK MODAL
          ========================================== */}
      {showUnblockModal && userToUnblock && (
        <div className="admin-modal-backdrop" onClick={() => setShowUnblockModal(false)}>
          <div className="admin-modal" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
            <header className="admin-modal-header" style={{ borderBottom: '2px solid #10B981' }}>
              <span style={{ color: '#10B981', fontWeight: '900' }}>✅ XÁC NHẬN MỞ KHÓA TÀI KHOẢN</span>
              <button 
                onClick={() => setShowUnblockModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
              >
                ×
              </button>
            </header>

            <div className="admin-modal-body">
              <p style={{ fontWeight: 'bold', margin: 0 }}>
                Bạn muốn mở khóa hoạt động lại cho tài khoản người dùng:
                <br />
                <span style={{ color: '#10B981', fontSize: '16px', fontWeight: '950' }}>{userToUnblock.name}</span> ({userToUnblock.email})?
              </p>
            </div>

            <footer className="admin-modal-footer">
              <button 
                type="button" 
                className="admin-back-btn" 
                style={{ background: 'none', boxShadow: 'none' }}
                onClick={() => setShowUnblockModal(false)}
              >
                Hủy bỏ
              </button>
              <button 
                type="button" 
                className="admin-back-btn"
                style={{ background: '#10B981', color: '#FFFFFF', borderColor: '#000' }}
                onClick={handleUnblockUserSubmit}
              >
                Mở khóa tài khoản
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── SUB-COMPONENT: EXAMS MANAGER (JSON UPLOAD) ── */
function AdminExamManager({ addLog }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [importLogs, setImportLogs] = useState('');

  const loadExams = async () => {
    setLoading(true);
    try {
      const list = await mockExamService.getMockExams();
      setExams(list || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!jsonText.trim()) return;

    setImportLogs(prev => prev + `[${new Date().toLocaleTimeString()}] Bắt đầu kiểm tra cấu trúc JSON...\n`);
    try {
      const examData = JSON.parse(jsonText);
      
      setImportLogs(prev => prev + `[${new Date().toLocaleTimeString()}] Cấu trúc JSON hợp lệ. Đang gửi dữ liệu lên máy chủ...\n`);
      const res = await mockExamService.importExam(examData);
      
      setImportLogs(prev => prev + `[${new Date().toLocaleTimeString()}] Nhập đề thi thành công! ID đề thi mới: ${res.examId}\n`);
      addLog(`[Admin] Đã nhập đề thi mới: "${examData.title}" qua JSON Upload`, 'sys');
      toast('Nhập đề thi mới thành công!', 'success');
      setJsonText('');
      loadExams();
    } catch (err) {
      setImportLogs(prev => prev + `[${new Date().toLocaleTimeString()}] LỖI: ${err.message}\n`);
      toast('Nhập đề thi thất bại. Vui lòng kiểm tra định dạng JSON!', 'error');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }} className="animate-in">
      {/* Left Column: Exams List */}
      <div className="admin-card" style={{ marginBottom: 0 }}>
        <h3 className="chart-card-title">📚 DANH SÁCH ĐỀ THI ĐÃ CÓ ({exams.length})</h3>
        
        {loading ? (
          <p style={{ fontSize: '13px', color: '#7A7A7A' }}>Đang tải danh sách đề thi...</p>
        ) : exams.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto', paddingRight: '6px' }}>
            {exams.map(e => (
              <div key={e.id} style={{ padding: '14px', border: '2px solid #000000', borderRadius: '10px', background: '#FCFBFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ background: '#E0F2FE', border: '1.5px solid #000000', color: '#0369A1', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px' }}>
                    {e.exam_subjects?.name || 'Môn học'} · {e.year}
                  </span>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '900', marginTop: '8px', color: '#000000' }}>{e.title}</h4>
                  <span style={{ fontSize: '11px', color: '#7A7A7A', fontWeight: '700' }}>Mã đề: {e.exam_code} · {e.total_questions} câu · {e.duration_minutes} phút</span>
                </div>
                <span style={{ fontSize: '12.5px', color: '#7A7A7A', fontWeight: '850' }}>{e.source}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: '#7A7A7A', fontWeight: '750' }}>Chưa có đề thi nào trong hệ thống.</p>
        )}
      </div>

      {/* Right Column: Paste JSON Form */}
      <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: 0 }}>
        <h3 className="chart-card-title">📤 NHẬP ĐỀ THI MỚI (JSON UPLOAD)</h3>
        <p style={{ fontSize: '12.5px', color: '#7A7A7A', lineHeight: '1.4', fontWeight: '700' }}>
          Dán cấu trúc JSON chuẩn của đề thi tốt nghiệp THPT Quốc Gia (bao gồm các câu hỏi, các lựa chọn, đáp án đúng và hướng dẫn giải chi tiết).
        </p>

        <form onSubmit={handleImport} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="admin-form-group" style={{ marginBottom: 0 }}>
            <textarea
              className="admin-form-textarea"
              rows="15"
              placeholder='Cấu trúc JSON mẫu:
{
  "title": "Đề thi thử Toán THPTQG 2026",
  "subject_slug": "toan",
  "subject_name": "Toán học",
  "year": 2026,
  "exam_code": "101",
  "source": "Trường chuyên Hùng Vương",
  "duration_minutes": 90,
  "total_questions": 1,
  "questions": [
    {
      "question_number": 1,
      "question_text": "Tìm tập nghiệm của phương trình...",
      "difficulty": "Trung bình",
      "topic": "Hàm số mũ",
      "explanation": "Lời giải chi tiết...",
      "options": [
        {"option_label": "A", "option_text": "S = (0; 1)", "is_correct": false},
        {"option_label": "B", "option_text": "S = [0; 1]", "is_correct": true}
      ]
    }
  ]
}'
              value={jsonText}
              onChange={e => setJsonText(e.target.value)}
              required
              style={{ fontFamily: 'monospace', fontSize: '11px', background: '#FCFBFA', padding: '10px' }}
            />
          </div>
          
          <button type="submit" className="admin-back-btn" style={{ alignSelf: 'flex-start', background: '#6c5ce7', color: '#FFFFFF' }}>
            Bắt đầu Nhập đề thi ⚡
          </button>
        </form>

        {importLogs && (
          <div style={{ marginTop: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: '900', color: '#7A7A7A' }}>LOG TIẾN TRÌNH IMPORT:</span>
            <pre style={{ margin: '6px 0 0 0', padding: '12px', background: '#0E100D', color: '#38bdf8', border: '2px solid #000000', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace', maxHeight: '120px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
              {importLogs}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
