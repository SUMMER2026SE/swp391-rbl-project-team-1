import { useState } from 'react';
import {
  HiHome, HiAcademicCap, HiBookOpen, HiClipboardCheck,
  HiLightBulb, HiClock, HiChartBar, HiCollection,
  HiChat, HiCog, HiStar, HiArrowUp
} from 'react-icons/hi';

const navItems = [
  { icon: HiHome, label: 'Trang chủ', id: 'home' },
  { icon: HiAcademicCap, label: 'Lộ trình học', id: 'path' },
  { icon: HiBookOpen, label: 'Bài tập', id: 'exercises' },
  { icon: HiClipboardCheck, label: 'Kiểm tra', id: 'tests' },
  { icon: HiLightBulb, label: 'AI Feedback', id: 'ai-feedback' },
  { icon: HiClock, label: 'Lịch sử học tập', id: 'history' },
  { icon: HiChartBar, label: 'Thống kê', id: 'stats' },
  { icon: HiCollection, label: 'Thư viện', id: 'library' },
  { icon: HiChat, label: 'Hỏi đáp AI', id: 'ai-qa' },
  { icon: HiCog, label: 'Cài đặt', id: 'settings' },
];

export default function Sidebar() {
  const [active, setActive] = useState('home');

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">E</div>
        <div className="logo-text">
          <h1>EduPath</h1>
          <p>Học đúng hướng · Thi đúng đích</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => setActive(item.id)}
          >
            <span className="nav-icon"><item.icon /></span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-upgrade">
        <div className="upgrade-badge">
          <HiStar /> Nâng cấp PRO
        </div>
        <p>Trải nghiệm toàn bộ tính năng AI và lộ trình cá nhân hóa nâng cao.</p>
        <button className="upgrade-btn">
          <HiArrowUp style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Nâng cấp ngay
        </button>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">MA</div>
        <div className="user-info">
          <h4>Nguyễn Minh Anh</h4>
          <p>Lớp 12 – A01</p>
        </div>
      </div>
    </aside>
  );
}
