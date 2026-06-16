import { useState, useEffect } from 'react';
import { toast } from '../utils/toast';
import { HiTerminal, HiUsers, HiClipboardCheck, HiGlobeAlt, HiAdjustments, HiTrendingUp, HiBookOpen } from 'react-icons/hi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../api';
import { mockExamService } from '../services/mockExamService';


const financeData = [
  { name: 'Tháng 1', revenue: 15.4 },
  { name: 'Tháng 2', revenue: 22.8 },
  { name: 'Tháng 3', revenue: 35.1 },
  { name: 'Tháng 4', revenue: 48.6 },
  { name: 'Tháng 5', revenue: 64.2 }
];

export default function AdminDashboard({
  users,
  onToggleUserBan,
  onApproveTeacher,
  courseApprovals,
  onApproveCourse,
  onRejectCourse,
  onSendAnnouncement,
  systemLogs,
  addLog,
  activeTab: propActiveTab = 'home',
  setActiveTab
}) {
  const currentTab = propActiveTab === 'home' ? 'logs' : propActiveTab;

  const handleTabChange = (tab) => {
    if (tab === 'logs') {
      setActiveTab('home');
    } else {
      setActiveTab(tab);
    }
  };
  
  // Announcement states
  const [annText, setAnnText] = useState('');

  // Moderation Reports states
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  
  // AI Config states
  const [aiWeightDifficulty, setAiWeightDifficulty] = useState(70);
  const [aiWeightWeakness, setAiWeightWeakness] = useState(85);
  const [aiWeightRoadmap, setAiWeightRoadmap] = useState(90);

  useEffect(() => {
    if (currentTab === 'moderation') {
      fetchReports();
    }
  }, [currentTab]);

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

  return (
    <div className="animate-in">
      {/* Sub navigation tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: 'var(--bg-card)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', overflowX: 'auto' }}>
        <button
          className={`demo-role-btn ${currentTab === 'logs' ? 'active' : ''}`}
          onClick={() => handleTabChange('logs')}
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
        >
          <HiTerminal /> Nhật ký hệ thống (Logs)
        </button>
        <button
          className={`demo-role-btn ${currentTab === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
        >
          <HiUsers /> Quản lý người dùng
        </button>
        <button
          className={`demo-role-btn ${currentTab === 'courses' ? 'active' : ''}`}
          onClick={() => handleTabChange('courses')}
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
        >
          <HiClipboardCheck /> Phê duyệt khóa học ({courseApprovals.length})
        </button>
        <button
          className={`demo-role-btn ${currentTab === 'exams' ? 'active' : ''}`}
          onClick={() => handleTabChange('exams')}
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
        >
          <HiBookOpen /> Quản lý đề thi
        </button>
        <button
          className={`demo-role-btn ${currentTab === 'announcements' ? 'active' : ''}`}
          onClick={() => handleTabChange('announcements')}
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
        >
          <HiGlobeAlt /> Gửi thông báo chung
        </button>
        <button
          className={`demo-role-btn ${currentTab === 'finance' ? 'active' : ''}`}
          onClick={() => handleTabChange('finance')}
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
        >
          <HiTrendingUp /> Thống kê doanh thu
        </button>
        <button
          className={`demo-role-btn ${currentTab === 'ai-config' ? 'active' : ''}`}
          onClick={() => handleTabChange('ai-config')}
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
        >
          <HiAdjustments /> Cấu hình hệ thống AI
        </button>
        <button
          className={`demo-role-btn ${currentTab === 'moderation' ? 'active' : ''}`}
          onClick={() => handleTabChange('moderation')}
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
        >
          🛡️ Kiểm duyệt báo cáo
        </button>
      </div>

      {currentTab === 'logs' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
              <HiTerminal style={{ color: 'var(--primary)' }} /> THEO DÕI HOẠT ĐỘNG HỆ THỐNG TRỰC TIẾP (LIVE MONITOR)
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--accent-green)' }}>● Đang giám sát cổng (Port 8080)</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
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

      {currentTab === 'users' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* User Account Controls */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>QUẢN LÝ TÀI KHOẢN HỌC VIÊN / GIÁO VIÊN</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {users.map(u => (
                <div key={u.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)' }}>
                  <div>
                    <span style={{ fontSize: '12.5px', fontWeight: 'bold' }}>{u.name}</span>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Email: {u.email} • Loại: {u.role.toUpperCase()}</p>
                  </div>
                  <button
                    onClick={() => {
                      onToggleUserBan(u.id);
                      addLog(`Quản trị viên ${u.isBanned ? 'mở khóa' : 'khóa'} tài khoản "${u.name}"`, 'sys');
                    }}
                    className="btn-outline"
                    style={{
                      padding: '4px 12px', fontSize: '11px',
                      borderColor: u.isBanned ? 'var(--accent-green)' : 'var(--accent-red)',
                      color: u.isBanned ? 'var(--accent-green)' : 'var(--accent-red)',
                      background: 'none'
                    }}
                  >
                    {u.isBanned ? 'Mở khóa' : 'Khóa tài khoản'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher verification profile */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>CẤP DUYỆT HỒ SƠ GIÁO VIÊN DÂN SỰ (TEACHER AUDIT)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {users.filter(u => u.role === 'teacher' && u.status === 'pending').length > 0 ? (
                users.filter(u => u.role === 'teacher' && u.status === 'pending').map(u => (
                  <div key={u.id} style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Ứng viên: {u.name}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email: {u.email}</span>
                      </div>
                      <span className="badge-pill" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: '10px', fontWeight: 'bold' }}>
                        {u.combo || 'Chuyên môn THPT'}
                      </span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '4px 0' }}>
                      Kinh nghiệm giảng dạy và ôn tập trực tuyến THPTQG cá nhân hóa lộ trình thích ứng.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        className="btn-primary"
                        style={{ padding: '5px 14px', fontSize: '11px', fontWeight: 'bold' }}
                        onClick={() => {
                          onApproveTeacher(u.name, u.combo || 'Tổng hợp');
                          addLog(`Quản trị viên cấp duyệt tài khoản "${u.name}" thành vai trò GIÁO VIÊN`, 'sys');
                          toast(`Phê duyệt hồ sơ giáo viên "${u.name}" thành công!`, 'success');
                        }}
                      >
                        Phê duyệt Cấp quyền
                      </button>
                      <button
                        className="btn-outline"
                        style={{ padding: '5px 14px', fontSize: '11px', color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}
                        onClick={() => {
                          toast(`Đã từ chối hồ sơ của ứng viên "${u.name}".`, 'warning');
                        }}
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-main)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🎓</span>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Không có hồ sơ đăng ký giáo viên nào đang chờ phê duyệt.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentTab === 'courses' && (
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>KIỂM DUYỆT KHÓA HỌC MỚI</h3>
          {courseApprovals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {courseApprovals.map(c => (
                <div key={c.id} style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg-main)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge-pill" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: '10px' }}>{c.subject}</span>
                      <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>{c.title}</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Giảng dạy bởi: {c.teacherName} • Giá bán: {c.price}đ</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '11.5px' }}
                        onClick={() => {
                          onApproveCourse(c.id);
                          addLog(`Quản trị viên KIỂM DUYỆT PHÊ DUYỆT khóa học "${c.title}" lên trang Landing chính`, 'sys');
                        }}
                      >
                        Phê duyệt phát hành
                      </button>
                      <button
                        className="btn-outline"
                        style={{ padding: '6px 14px', fontSize: '11.5px', color: 'var(--accent-red)' }}
                        onClick={() => {
                          onRejectCourse(c.id);
                          addLog(`Quản trị viên TỪ CHỐI phê duyệt khóa học "${c.title}"`, 'sys');
                        }}
                      >
                        Từ chối kiểm duyệt
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Hiện không có khóa học nào đang chờ kiểm duyệt.</p>
          )}
        </div>
      )}

      {currentTab === 'announcements' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>GỬI THÔNG BÁO TOÀN HỆ THỐNG</h3>
          <form onSubmit={handleSendAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label style={{ fontSize: '12px', fontWeight: '600' }}>Nội dung thông báo:</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Nhập thông báo gửi đến toàn bộ người dùng, ví dụ: Lịch bảo trì hệ thống cập nhật Đề thi THPTQG 2026..."
                value={annText}
                onChange={e => setAnnText(e.target.value)}
                required
                style={{ fontFamily: 'inherit' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
              Phát thông báo ngay
            </button>
          </form>
        </div>
      )}

      {currentTab === 'finance' && (
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>BÁO CÁO THỐNG KÊ DOANH THU HỌC LIỆU</h3>
          <div style={{ height: '300px', width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" unit=" Trđ" />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRevenue)" name="Doanh thu" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
            Tổng doanh thu lũy kế 5 tháng: <strong>186.100.000 VNĐ</strong>
          </p>
        </div>
      )}

      {currentTab === 'ai-config' && (
        <div className="card" style={{ maxWidth: '600px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' }}>CẤU HÌNH THAM SỐ THUẬT TOÁN AI THÍCH ỨNG</h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Điều chỉnh trọng số ưu tiên của hệ thống AI khi quét lỗ hổng kiến thức và đề xuất bài tập tự động cho học viên.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600 }}>
                <span>Độ ưu tiên Độ khó câu hỏi sai:</span>
                <span style={{ color: 'var(--primary)' }}>{aiWeightDifficulty}%</span>
              </div>
              <input
                type="range" min="0" max="100"
                value={aiWeightDifficulty}
                onChange={e => setAiWeightDifficulty(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600 }}>
                <span>Độ nhạy phân tích Điểm yếu:</span>
                <span style={{ color: 'var(--primary)' }}>{aiWeightWeakness}%</span>
              </div>
              <input
                type="range" min="0" max="100"
                value={aiWeightWeakness}
                onChange={e => setAiWeightWeakness(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 600 }}>
                <span>Tốc độ thay đổi Lộ trình học (Roadmap Adjust Rate):</span>
                <span style={{ color: 'var(--primary)' }}>{aiWeightRoadmap}%</span>
              </div>
              <input
                type="range" min="0" max="100"
                value={aiWeightRoadmap}
                onChange={e => setAiWeightRoadmap(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>
          </div>

          <button className="btn-primary" onClick={handleUpdateAIWeights}>
            Lưu cấu hình tham số AI
          </button>
        </div>
      )}

      {currentTab === 'moderation' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
              🛡️ KIỂM DUYỆT BÁO CÁO NỘI DUNG VI PHẠM
            </h3>
            <button className="btn-outline" onClick={fetchReports} style={{ padding: '6px 14px', fontSize: '11.5px' }}>Tải lại</button>
          </div>
          
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Dưới đây là danh sách các báo cáo từ học viên gửi về các bài viết hoặc bình luận vi phạm quy chuẩn cộng đồng.
          </p>

          {loadingReports ? (
            <div style={{ textAlign: 'center', padding: '30px' }}>Đang tải báo cáo vi phạm...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reports.length > 0 ? (
                reports.map(rep => (
                  <div key={rep.id} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        Báo cáo #{rep.id} bởi: <strong style={{ color: 'var(--primary)' }}>{rep.reporter?.fullName}</strong>
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gửi lúc: {new Date(rep.createdAt).toLocaleString()}</span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0' }}>
                      <strong>Lý do tố cáo: </strong>
                      <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>{rep.reason}</span>
                    </div>

                    {rep.post && (
                      <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderLeft: '3px solid var(--primary)', borderRadius: '4px', fontSize: '12.5px', marginBottom: '4px' }}>
                        <strong>Bài viết bị tố cáo:</strong> "{rep.post.title}" (ID: {rep.post.id})
                      </div>
                    )}

                    {rep.comment && (
                      <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderLeft: '3px solid var(--accent-blue)', borderRadius: '4px', fontSize: '12.5px', marginBottom: '4px' }}>
                        <strong>Bình luận bị tố cáo:</strong> "{rep.comment.content}" (ID: {rep.comment.id})
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '11.5px', background: 'var(--accent-red)', border: 'none' }}
                        onClick={() => {
                          if (window.confirm('Bạn có chắc chắn muốn xử lý nội dung bị tố cáo này? (Bài viết/Bình luận liên quan sẽ bị ẩn)')) {
                            handleResolveReport(rep.id, 'approve');
                          }
                        }}
                      >
                        ✓ Duyệt & Ẩn nội dung vi phạm
                      </button>
                      <button
                        className="btn-outline"
                        style={{ padding: '6px 14px', fontSize: '11.5px' }}
                        onClick={() => handleResolveReport(rep.id, 'reject')}
                      >
                        ✕ Bác bỏ báo cáo
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', border: '1px dashed var(--border)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                  🎉 Không có báo cáo vi phạm nào chưa xử lý!
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {currentTab === 'exams' && (
        <AdminExamManager addLog={addLog} />
      )}
    </div>
  );
}

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
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }} className="animate-in">
      {/* Left Column: Exams List */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 6 }}>
          📚 DANH SÁCH ĐỀ THI ĐÃ CÓ ({exams.length})
        </h3>
        
        {loading ? (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Đang tải danh sách đề thi...</p>
        ) : exams.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto', paddingRight: '6px' }}>
            {exams.map(e => (
              <div key={e.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="badge-pill" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: '10px', fontWeight: 'bold' }}>
                    {e.exam_subjects?.name || 'Môn học'} · {e.year}
                  </span>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '4px', color: 'var(--text-primary)' }}>{e.title}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Mã đề: {e.exam_code} · {e.total_questions} câu · {e.duration_minutes} phút</span>
                </div>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: '500' }}>{e.source}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Chưa có đề thi nào trong hệ thống.</p>
        )}
      </div>

      {/* Right Column: Paste JSON Form */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>📤 NHẬP ĐỀ THI MỚI (JSON UPLOAD)</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          Dán cấu trúc JSON chuẩn của đề thi tốt nghiệp THPT Quốc Gia (bao gồm các câu hỏi, các lựa chọn, đáp án đúng và hướng dẫn giải chi tiết).
        </p>

        <form onSubmit={handleImport} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group">
            <textarea
              className="form-control"
              rows="12"
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
              style={{ fontFamily: 'monospace', fontSize: '11px', background: 'var(--bg-main)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px' }}
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', background: 'var(--exams-purple)', color: '#fff', border: 'none' }}>
            Bắt đầu Nhập đề thi ⚡
          </button>
        </form>

        {importLogs && (
          <div>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>LOG TIẾN TRÌNH IMPORT:</span>
            <pre style={{ margin: '6px 0 0 0', padding: '10px', background: '#1e293b', color: '#38bdf8', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', maxHeight: '150px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
              {importLogs}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

