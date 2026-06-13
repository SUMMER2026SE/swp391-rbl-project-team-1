import { useState, useEffect, useRef } from 'react';
import { HiSparkles, HiPaperAirplane as HiPaperAirplaneIcon } from 'react-icons/hi';
import { aiService } from '../../services/aiService';

export default function AiTutorChat({ lesson }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const lessonTitle = lesson ? lesson.title : 'Bài học';

  useEffect(() => {
    // Welcome message
    setMessages([
      {
        role: 'assistant',
        content: `Xin chào! Tôi là Trợ lý AI EduBot học tập của bạn. Tôi đã nắm được bài học hiện tại: "${lessonTitle}". Hãy đặt bất kỳ câu hỏi nào về lý thuyết hoặc bài tập của bài này, tôi sẽ giải thích tận tình! 🚀`
      }
    ]);
  }, [lesson]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || typing) return;

    const userText = inputText;
    setInputText('');
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setTyping(true);

    try {
      const response = await aiService.sendAiMessage(userText, lesson);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Có lỗi xảy ra khi kết nối máy chủ AI. Em vui lòng kiểm tra lại kết nối mạng nhé.' }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="card animate-in" style={{ padding: 0, borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '420px', overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiSparkles style={{ fontSize: '18px', color: '#fef08a' }} />
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', margin: 0 }}>
              Gia sư AI EduBot ⚡
            </h4>
            <span style={{ fontSize: '9px', color: '#e0e7ff' }}>Bám sát bài: {lessonTitle}</span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-card)' }}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={idx} 
              style={{ 
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              <div 
                style={{
                  background: isUser ? 'var(--primary)' : 'var(--bg-main)',
                  color: isUser ? '#fff' : 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  borderTopRightRadius: isUser ? '2px' : '14px',
                  borderTopLeftRadius: isUser ? '14px' : '2px',
                  fontSize: '12.5px',
                  lineHeight: '1.45',
                  border: isUser ? 'none' : '1px solid var(--border)',
                  whiteSpace: 'pre-line'
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {typing && (
          <div style={{ alignSelf: 'flex-start', background: 'var(--bg-main)', padding: '10px 14px', borderRadius: '14px', borderTopLeftRadius: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block', animation: 'bounce 1s infinite' }}></span>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block', animation: 'bounce 1s infinite 0.2s' }}></span>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block', animation: 'bounce 1s infinite 0.4s' }}></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid var(--border)', background: 'var(--bg-main)' }}>
        <input 
          type="text"
          placeholder="Hỏi AI công thức, mẹo giải nhanh..."
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
          disabled={typing}
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
          <HiPaperAirplaneIcon style={{ fontSize: '14px', transform: 'rotate(90deg)' }} />
        </button>
      </form>
    </div>
  );
}
