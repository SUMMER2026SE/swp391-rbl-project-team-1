import React, { useState, useEffect, useRef } from 'react';
import { HiPaperAirplane } from 'react-icons/hi';
import { messageService } from '../../../services/messageService';

export default function TeacherQATab({ currentUser, teacherName }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const teacherId = 102;
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
      
      setTimeout(async () => {
        await messageService.sendTeacherMessage(
          teacherId, 
          studentId, 
          `Thầy đã nhận được câu hỏi của em. Thầy đang kiểm tra lại bài tập ôn luyện này và sẽ giải đáp chi tiết cách làm tối nay nhé. Em cứ tiếp tục học bài tiếp theo đi!`
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
      <div className="chat-header chat-header--teacher">
        <div className="chat-avatar chat-avatar--teacher">
          {teacherName ? teacherName.slice(0, 2).toUpperCase() : 'GV'}
        </div>
        <div className="chat-header-info">
          <h4 className="chat-header-title">
            Hỏi đáp trực tiếp với {teacherName}
          </h4>
          <span className="chat-status chat-status--teacher">● Đang trực tuyến (Phản hồi nhanh)</span>
        </div>
      </div>

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
                  {new Date(msg.created_at || msg.createdAt || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--stone-text-secondary)', textAlign: 'center', padding: '24px 0', margin: 'auto' }}>
            Nhập câu hỏi để gửi trực tiếp cho Thầy/Cô. Bạn sẽ nhận được phản hồi sớm nhất.
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

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
          aria-label="Send message"
        >
          <HiPaperAirplane style={{ fontSize: '14px', transform: 'rotate(90deg)' }} />
        </button>
      </form>
    </div>
  );
}
