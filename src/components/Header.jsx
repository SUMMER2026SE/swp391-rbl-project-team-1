import { HiSearch, HiBell } from 'react-icons/hi';

export default function Header() {
  return (
    <div className="main-header animate-in">
      <div>
        <h2>Chào lại, Minh Anh! 👋</h2>
        <p>Hôm nay bạn muốn chinh phục kiến thức nào?</p>
      </div>
      <div className="header-actions">
        <div className="search-box">
          <HiSearch className="search-icon" />
          <input type="text" placeholder="Tìm kiếm bài học, bài tập..." />
        </div>
        <button className="header-icon-btn" id="notifications-btn">
          <HiBell />
          <span className="badge">3</span>
        </button>
        <div className="header-avatar" id="user-menu">MA</div>
      </div>
    </div>
  );
}
