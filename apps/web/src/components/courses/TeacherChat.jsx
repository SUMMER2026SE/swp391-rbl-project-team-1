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
    <div className="card animate-in" style={{ padding: 0, borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '420px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px' }}>
          TA
        </div>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
            Học nhóm với {teacherName}
          </h4>
          <span style={{ fontSize: '9.5px', color: 'var(--accent-green)', fontWeight: 'bold' }}>● Đang trực tuyến (Phản hồi nhanh)</span>
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-card)' }}>
        {messages.length > 0 ? (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === studentId;
            return (
              <div 
                key={idx} 
                style={{ 
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div 
                  style={{
                    background: isMe ? 'var(--primary)' : 'var(--bg-main)',
                    color: isMe ? '#fff' : 'var(--text-primary)',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    borderTopRightRadius: isMe ? '2px' : '14px',
                    borderTopLeftRadius: isMe ? '14px' : '2px',
                    fontSize: '12.5px',
                    lineHeight: '1.4',
                    border: isMe ? 'none' : '1px solid var(--border)'
                  }}
                >
                  {msg.content}
                </div>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        ) : (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '24px 0', margin: 'auto' }}>
            Nhắn tin trực tiếp với giáo viên để được hỗ trợ chuyên sâu các lỗi sai bài tập.
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid var(--border)', background: 'var(--bg-main)' }}>
        <input 
          type="text"
          placeholder={`Hỏi thầy/cô về bài học...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          required
          style={{
            flex: 1,
            padding: '8px 14px',
            fontSize: '12.5px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            outline: 'none',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)'
          }}
        />
        <button 
          type="submit" 
          disabled={sending}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <HiPaperAirplane style={{ fontSize: '14px', transform: 'rotate(90deg)' }} />
        </button>
      </form>
    </div>
  );
}
