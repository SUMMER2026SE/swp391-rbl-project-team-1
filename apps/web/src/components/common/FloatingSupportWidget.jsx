import React, { useState } from 'react';
import { HiX } from 'react-icons/hi';

export default function FloatingSupportWidget({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: `Chào em! Anh là Trợ lý học tập EduPath AI. Em cần hỗ trợ gì về khóa học hôm nay không?` }
  ]);
  const [inputVal, setInputVal] = useState('');

  const username = currentUser?.fullName || currentUser?.name || 'Guest';
  const email = currentUser?.email || '—';

  // Get initials for Avatar
  const getInitials = () => {
    return username.slice(0, 2).toUpperCase();
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputVal };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    // Trigger mock AI response
    setTimeout(() => {
      const responses = [
        "EduPath AI đã ghi nhận thắc mắc của em. Đội ngũ trợ giảng sẽ liên hệ giải đáp trong vòng 5 phút nhé!",
        "Khóa học này cam kết chuẩn đầu ra. Em có thể bắt đầu làm bài kiểm tra thử ở mục Thi Thử để tự chẩn đoán lộ trình.",
        "Em có thể tải đầy đủ tài liệu PDF ở tab 'Tài liệu' bên trong chương trình học của mình.",
        "Để đăng ký mua học phần đầy đủ, em chỉ cần click vào nút 'Thêm giỏ hàng' bên tay phải."
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: randomReply }]);
    }, 1000);
  };

  return (
    <>
      {/* FLOATING CHIP */}
      <div className="fts-support-widget" onClick={() => setIsOpen(true)}>
        <div className="fts-support-card">
          {currentUser?.avatar ? (
            <img 
              src={currentUser.avatar} 
              alt="User" 
              className="fts-support-avatar" 
            />
          ) : (
            <div className="fts-support-avatar">
              {getInitials()}
            </div>
          )}
          <div className="fts-support-info">
            <span className="fts-support-name">{username}</span>
            <span className="fts-support-email">{email}</span>
          </div>
        </div>
      </div>

      {/* SUPPORT CHAT MODAL */}
      {isOpen && (
        <div className="fts-support-dialog-overlay" onClick={() => setIsOpen(false)}>
          <div className="fts-support-dialog" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="fts-support-dialog-header">
              <h4 className="fts-support-dialog-title">Hỗ trợ EduPath AI 💬</h4>
              <button 
                type="button" 
                className="fts-support-dialog-close"
                onClick={() => setIsOpen(false)}
              >
                <HiX />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="fts-support-dialog-body">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={msg.sender === 'bot' ? 'fts-support-msg-bot' : 'fts-support-msg-bot'}
                  style={msg.sender === 'user' ? {
                    alignSelf: 'flex-end',
                    background: 'var(--fts-purple)',
                    color: '#FFFFFF',
                    borderRadius: '12px 12px 2px 12px'
                  } : {}}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form className="fts-support-input-row" onSubmit={handleSend}>
              <input 
                type="text" 
                placeholder="Nhập câu hỏi của em..." 
                className="fts-support-input"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
              />
              <button type="submit" className="fts-support-send-btn">
                Gửi
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
