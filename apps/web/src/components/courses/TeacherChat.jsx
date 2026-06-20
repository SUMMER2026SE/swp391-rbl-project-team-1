import { useState, useEffect, useRef } from 'react';
import { HiPaperAirplane } from 'react-icons/hi';
import { messageService } from '../../services/messageService';

export default function TeacherChat({ currentUser, teacherName }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const teacherId = 102; // Mock teacher ID
  const studentId = currentUser?.id || 101;

  const loadMessages = async () => {
    try {
      const data = await messageService.getTeacherMessages(studentId, teacherId);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [studentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;
    setSending(true);
    try {
      await messageService.sendTeacherMessage(studentId, teacherId, inputText);
      setInputText('');
      await loadMessages();
      
      // Auto response mock from teacher after 2 seconds
      setTimeout(async () => {
        await messageService.sendTeacherMessage(
          teacherId, 
          studentId, 
          `Thầy đã nhận được tin nhắn của em về bài học này. Thầy đang ở lớp dạy offline, tối nay thầy sẽ xem chi tiết và giải đáp kỹ hơn nhé. Em cứ tiếp tục làm các bài tập trắc nghiệm tự luyện đi nhé!`
        );
        await loadMessages();
      }, 2000);

    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-card animate-in">
      {/* Header */}
      <div className="chat-header chat-header--teacher">
        <div className="chat-avatar chat-avatar--teacher">
          {teacherName.slice(0, 2).toUpperCase()}
        </div>
        <div className="chat-header-info">
          <h4 className="chat-header-title">
            Hỏi nhóm với {teacherName}
          </h4>
          <span className="chat-status chat-status--teacher">● Đang trực tuyến (Phản hồi nhanh)</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === studentId;
            return (
              <div 
                key={idx} 
                className={`chat-bubble-wrapper ${isMe ? 'chat-bubble-wrapper--me' : 'chat-bubble-wrapper--other'}`}
              >
                <div className={`chat-bubble ${isMe ? 'chat-bubble--me' : 'chat-bubble--other'}`}>
                  {msg.content}
                </div>
                <span className="chat-time">
                  {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        ) : (
          <p style={{ fontSize: '12.5px', color: 'var(--stone-text-secondary)', textAlign: 'center', padding: '24px 0', margin: 'auto' }}>
            Nhắn tin trực tiếp với giáo viên để được hỗ trợ chuyên sâu các lỗi sai bài tập.
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="chat-form">
        <input 
          type="text"
          placeholder={`Hỏi thầy/cô về bài học...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          required
          className="chat-input"
        />
        <button 
          type="submit" 
          disabled={sending}
          className="chat-send-btn"
        >
          <HiPaperAirplane style={{ fontSize: '14px', transform: 'rotate(90deg)' }} />
        </button>
      </form>
    </div>
  );
}
