import { useState, useEffect, useRef } from 'react';
import { HiX } from 'react-icons/hi';
import chatbotIcon from '../assets/chatbot.png';
import { api } from '../api';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Chào em! Thầy là EduBot, cố vấn học tập AI chuyên biệt ôn thi THPT Quốc gia của EduPath. 🎒✨\n\nEm đang cần tư vấn lộ trình học khối thi nào (A01, B00, D01), hay có câu hỏi kiến thức nào cần giải đáp không? Thầy luôn sẵn sàng hỗ trợ em!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Auto-hide welcome tooltip after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
    setInput('');
    
    // Add user message to history
    const newMessages = [...messages, { sender: 'user', text: userMsgText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Pass the conversation history (excluding the first system greeting for backend brevity)
      const chatHistoryForBackend = newMessages.slice(1);
      
      // Request OpenRouter proxy from backend
      const res = await api.chatbot(userMsgText, chatHistoryForBackend);
      
      // Add bot response
      setMessages(prev => [...prev, { sender: 'bot', text: res.reply }]);
    } catch (err) {
      console.error('[Chatbot Widget Error]', err);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Xin lỗi em, máy chủ kết nối AI đang quá tải hoặc gặp sự cố. Em hãy thử lại sau vài giây nhé! ❤️' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999, fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      {/* ── Floating welcome tooltip bubble ── */}
      {showTooltip && !isOpen && (
        <div 
          onClick={() => { setIsOpen(true); setShowTooltip(false); }}
          style={{
            position: 'absolute', bottom: '70px', right: '0',
            width: '210px', background: 'var(--bg-card, #ffffff)',
            color: 'var(--text-primary, #1e293b)', padding: '10px 14px',
            borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            border: '1px solid var(--border, #e2e8f0)', fontSize: '12px',
            cursor: 'pointer', animation: 'fadeInUp 0.3s ease forwards',
            fontWeight: '500', lineHeight: '1.4'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ color: '#6C5CE7', fontWeight: 'bold' }}>EduBot THPTQG 🤖</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: '#94a3b8' }}
            >
              <HiX size={14} />
            </button>
          </div>
          Cần mẹo làm toán nhanh hay định hướng khối thi? Hỏi thầy ngay!
        </div>
      )}

      {/* ── Circular floating button (slices black outer corners beautifully) ── */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setShowTooltip(false); }}
          style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: '#090d16', border: '3px solid #6C5CE7',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(108,92,231,0.4)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)';
            e.currentTarget.style.borderColor = '#8E2DE2';
            e.currentTarget.style.boxShadow = '0 12px 36px rgba(142,45,226,0.6)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.borderColor = '#6C5CE7';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(108,92,231,0.4)';
          }}
          title="Hỏi trợ lý tư vấn ôn thi THPTQG"
        >
          <img 
            src={chatbotIcon} 
            alt="EduBot" 
            style={{ 
              width: '100%', height: '100%', 
              objectFit: 'cover', transform: 'scale(1.05)',
              display: 'block'
            }} 
          />
        </button>
      )}

      {/* ── The Chat Window ── */}
      {isOpen && (
        <div 
          className="animate-in"
          style={{
            position: 'absolute', bottom: '0', right: '0',
            width: '380px', height: '540px',
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '20px', overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            border: '1px solid var(--border, #e2e8f0)',
            display: 'flex', flexDirection: 'column',
            animation: 'fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Header */}
          <div 
            style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #6C5CE7, #8E2DE2)',
              color: '#ffffff', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div 
                style={{ 
                  width: '36px', height: '36px', borderRadius: '50%',
                  overflow: 'hidden', background: '#090d16',
                  border: '2px solid rgba(255,255,255,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <img src={chatbotIcon} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.05)' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', letterSpacing: '0.3px' }}>EduBot Cố Vấn THPTQG</h4>
                <span style={{ fontSize: '10.5px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
                  Trực tuyến 24/7
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none',
                borderRadius: '50%', width: '28px', height: '28px',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <HiX size={16} />
            </button>
          </div>

          {/* Messages List Area */}
          <div 
            style={{
              flex: 1, padding: '16px', overflowY: 'auto',
              background: 'var(--bg-main, #f8fafc)',
              display: 'flex', flexDirection: 'column', gap: '14px'
            }}
          >
            {messages.map((msg, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                {/* Bot Avatar */}
                {msg.sender === 'bot' && (
                  <div 
                    style={{ 
                      width: '28px', height: '28px', borderRadius: '50%',
                      overflow: 'hidden', background: '#090d16',
                      border: '1.5px solid #6C5CE7', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginTop: '2px'
                    }}
                  >
                    <img src={chatbotIcon} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                
                {/* Text Bubble */}
                <div 
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: msg.sender === 'user' ? '#6C5CE7' : 'var(--bg-card, #ffffff)',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary, #1e293b)',
                    fontSize: '12.5px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border, #e2e8f0)',
                    fontWeight: '450'
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', background: '#090d16', border: '1.5px solid #6C5CE7', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={chatbotIcon} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border, #e2e8f0)', padding: '12px 16px', borderRadius: '16px 16px 16px 2px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span className="dot" style={{ width: '6px', height: '6px', background: '#6C5CE7', borderRadius: '50%', animation: 'bounce 1.3s infinite ease-in-out' }}></span>
                  <span className="dot" style={{ width: '6px', height: '6px', background: '#6C5CE7', borderRadius: '50%', animation: 'bounce 1.3s infinite ease-in-out', animationDelay: '0.2s' }}></span>
                  <span className="dot" style={{ width: '6px', height: '6px', background: '#6C5CE7', borderRadius: '50%', animation: 'bounce 1.3s infinite ease-in-out', animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <form 
            onSubmit={handleSend}
            style={{
              padding: '12px 16px',
              background: 'var(--bg-card, #ffffff)',
              borderTop: '1px solid var(--border, #e2e8f0)',
              display: 'flex', gap: '10px', alignItems: 'center'
            }}
          >
            <input 
              type="text"
              placeholder="Hỏi EduBot về kiến thức, lộ trình thi..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              style={{
                flex: 1, padding: '10px 14px',
                borderRadius: '24px', border: '1px solid var(--border, #e2e8f0)',
                background: 'var(--bg-main, #f8fafc)',
                color: 'var(--text-primary, #1e293b)',
                fontSize: '12.5px', outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#6C5CE7'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? '#6C5CE7' : 'var(--border, #cbd5e1)',
                color: '#ffffff', border: 'none',
                borderRadius: '50%', width: '36px', height: '36px',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s', flexShrink: 0
              }}
              title="Gửi câu hỏi"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', transform: 'rotate(45deg) translate(-1px, 1px)' }}>
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
