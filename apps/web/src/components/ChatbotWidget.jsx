import { useState, useEffect, useRef } from 'react';
import { HiX, HiTrash } from 'react-icons/hi';
import chatbotIcon from '../assets/chatbot.png';
import { api } from '../api';

export default function ChatbotWidget({ currentPath, currentUser }) {
  const pathLower = (currentPath || '').toLowerCase();
  const isHome = pathLower === '/' || pathLower === '/landing' || pathLower === '/dashboard/home';

  if (!isHome || pathLower.includes('/learn/') || pathLower.includes('/mock-exams/')) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Helper to get human-readable page name from path
  const getPageName = (path) => {
    if (!path) return 'Trang chủ';
    const lowerPath = path.toLowerCase();
    if (lowerPath === '/' || lowerPath === '/landing') return 'Trang chủ';
    if (lowerPath.includes('/dashboard/home')) return 'Bảng điều khiển học tập';
    if (lowerPath.includes('/dashboard/courses')) return 'Khóa học của tôi';
    if (lowerPath.includes('/dashboard/mock-exams')) return 'Luyện thi thử THPTQG';
    if (lowerPath.includes('/dashboard/exam-bank')) return 'Ngân hàng đề thi';
    if (lowerPath.includes('/dashboard/flashcards')) return 'Ôn tập Thẻ ghi nhớ (Flashcards)';
    if (lowerPath.includes('/dashboard/ai-tutor')) return 'Gia sư AI Q&A';
    if (lowerPath.includes('/dashboard/forum')) return 'Diễn đàn học tập';
    if (lowerPath.includes('/dashboard/leaderboard')) return 'Bảng xếp hạng';
    if (lowerPath.includes('/dashboard/settings')) return 'Trang cá nhân & Cấu hình';
    if (lowerPath.includes('/learn/')) return 'Trang học bài giảng trực tuyến';
    if (lowerPath.includes('/mock-exams/')) return 'Trang làm đề thi & Xem kết quả';
    return 'Học tập & Ôn thi';
  };

  const initialGreeting = {
    sender: 'bot',
    text: `Chào em${currentUser ? ` ${currentUser.name}` : ''}! Thầy là EduBot, cố vấn học tập AI chuyên biệt ôn thi THPT Quốc gia của EduPath. 🎒✨\n\nEm đang cần tư vấn lộ trình học khối thi nào (A01, B00, D01), hay có câu hỏi kiến thức nào cần giải đáp không? Thầy luôn sẵn sàng hỗ trợ em!`
  };

  // User-specific storage key to persist chat history
  const storageKey = `edubot_chat_history_${currentUser?.id || 'guest'}`;

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [initialGreeting];
    } catch (e) {
      return [initialGreeting];
    }
  });

  const messagesEndRef = useRef(null);

  // Persist messages in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      console.error('[Chatbot Widget Storage Error]', e);
    }
  }, [messages, storageKey]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Auto-hide welcome tooltip after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const userMsgText = textOverride ? textOverride.trim() : input.trim();
    if (!userMsgText || loading) return;

    if (!textOverride) setInput('');

    // Augment message with page context under the hood
    const pageName = getPageName(currentPath);
    const messageWithContext = `[Context: User is currently on page "${pageName}"] ${userMsgText}`;

    // Add user message to history
    const newMessages = [...messages, { sender: 'user', text: userMsgText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Pass the conversation history (excluding the first system greeting for backend brevity)
      const chatHistoryForBackend = newMessages.slice(1);
      
      const res = await api.chatbot(messageWithContext, chatHistoryForBackend);
      
      setMessages(prev => [...prev, { sender: 'bot', text: res.reply }]);
    } catch (err) {
      console.error('[Chatbot Widget Error]', err);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Xin lỗi em, máy chủ kết nối AI đang gặp sự cố. Em hãy thử lại sau vài giây nhé! ❤️' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch sử cuộc trò chuyện này không?')) {
      setMessages([initialGreeting]);
    }
  };

  const suggestionChips = [
    { text: "Lộ trình ôn thi khối A1/D1 📈" },
    { text: "Cách sinh Mindmap tự động 🧠" },
    { text: "Tư vấn phương pháp học tốt 🎒" },
    { text: "Lịch thi & cấu trúc đề thi ✍️" }
  ];

  // Zero-dependency rich Markdown message formatter
  const renderMessageText = (text) => {
    if (!text) return null;

    const segments = text.split(/```/);

    return segments.map((segment, idx) => {
      // Inside code block segment
      if (idx % 2 === 1) {
        const lines = segment.split('\n');
        const firstLine = lines[0].trim();
        const isLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
        const codeText = isLang ? lines.slice(1).join('\n') : lines.join('\n');
        const langName = isLang ? firstLine : 'code';

        return (
          <div key={idx} style={{
            background: 'rgba(9, 13, 22, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            margin: '12px 0',
            overflow: 'hidden',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '11.5px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '6px 12px',
              fontSize: '10.5px',
              color: '#94a3b8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>{langName}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigator.clipboard.writeText(codeText.trim());
                  const btn = e.currentTarget;
                  btn.innerText = 'Copied!';
                  btn.style.color = '#10b981';
                  setTimeout(() => { 
                    btn.innerText = 'Copy'; 
                    btn.style.color = '#8E2DE2';
                  }, 2000);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8E2DE2',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  transition: 'color 0.2s'
                }}
              >
                Copy
              </button>
            </div>
            <pre style={{
              padding: '12px',
              margin: 0,
              overflowX: 'auto',
              color: '#a5b4fc',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.5'
            }}>{codeText.trim()}</pre>
          </div>
        );
      }

      // Normal text segment
      const lines = segment.split('\n');
      let listItems = [];
      let listType = null; // 'ul' or 'ol'
      const elements = [];

      const flushList = (key) => {
        if (listItems.length > 0) {
          if (listType === 'ul') {
            elements.push(
              <ul key={`ul-${key}`} style={{ margin: '0 0 10px 0', paddingLeft: '20px', listStyleType: 'disc' }}>
                {listItems}
              </ul>
            );
          } else if (listType === 'ol') {
            elements.push(
              <ol key={`ol-${key}`} style={{ margin: '0 0 10px 0', paddingLeft: '20px', listStyleType: 'decimal' }}>
                {listItems}
              </ol>
            );
          }
          listItems = [];
          listType = null;
        }
      };

      const parseInline = (str) => {
        // Safe characters escape
        let parsed = str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        // replace markdown images: ![alt](url)
        parsed = parsed.replace(/!\[(.*?)\]\((.*?)\)/g, '<div style="margin: 8px 0; overflow: hidden; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.3);"><img src="$2" alt="$1" style="max-width: 100%; height: auto; display: block; object-fit: cover;" /></div>');
        // replace markdown links: [text](url)
        parsed = parsed.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #a5b4fc; text-decoration: underline; font-weight: 600; transition: color 0.2s;">$1</a>');
        // replace **bold**
        parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ffffff; font-weight: 700;">$1</strong>');
        // replace *italic*
        parsed = parsed.replace(/\*(.*?)\*/g, '<em style="color: #e2e8f0;">$1</em>');
        // replace `inline code`
        parsed = parsed.replace(/`(.*?)`/g, '<code style="background: rgba(255,255,255,0.12); padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #f43f5e; font-size: 0.9em;">$1</code>');
        return parsed;
      };

      lines.forEach((line, lineIdx) => {
        const cleanLine = line.trim();

        if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
          if (listType !== 'ul') {
            flushList(lineIdx);
            listType = 'ul';
          }
          listItems.push(
            <li key={`li-${lineIdx}`} style={{ marginBottom: '6px', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: parseInline(cleanLine.substring(2)) }} />
          );
        } else if (/^\d+\.\s/.test(cleanLine)) {
          if (listType !== 'ol') {
            flushList(lineIdx);
            listType = 'ol';
          }
          const content = cleanLine.replace(/^\d+\.\s/, '');
          listItems.push(
            <li key={`li-${lineIdx}`} style={{ marginBottom: '6px', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: parseInline(content) }} />
          );
        } else {
          flushList(lineIdx);
          if (cleanLine === '') {
            elements.push(<div key={`br-${lineIdx}`} style={{ height: '8px' }} />);
          } else {
            elements.push(
              <p key={`p-${lineIdx}`} style={{ margin: '0 0 10px 0', lineHeight: '1.6' }}
                 dangerouslySetInnerHTML={{ __html: parseInline(line) }} />
            );
          }
        }
      });

      flushList(lines.length);
      return <div key={idx}>{elements}</div>;
    });
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999, fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      {/* ── Internal styles to load keyframes securely ── */}
      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0.5); }
          70% { box-shadow: 0 0 0 15px rgba(108, 92, 231, 0); }
          100% { box-shadow: 0 0 0 0 rgba(108, 92, 231, 0); }
        }
        @keyframes slide-up {
          from { transform: translateY(30px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes message-pop {
          from { transform: scale(0.9) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.12);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>

      {/* ── Floating welcome tooltip bubble ── */}
      {showTooltip && !isOpen && (
        <div 
          onClick={() => { setIsOpen(true); setShowTooltip(false); }}
          style={{
            position: 'absolute', bottom: '72px', right: '0',
            width: '240px', background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            color: '#f8fafc', padding: '12px 16px',
            borderRadius: '16px', 
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            border: '1px solid rgba(108, 92, 231, 0.3)', fontSize: '12.5px',
            cursor: 'pointer', animation: 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            fontWeight: '500', lineHeight: '1.45'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ background: 'linear-gradient(135deg, #a5b4fc, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>EduBot THPTQG 🤖</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', color: '#94a3b8' }}
            >
              <HiX size={14} />
            </button>
          </div>
          Đang xem {getPageName(currentPath)}? Hỏi thầy cách ôn thi hoặc bài tập nhé!
        </div>
      )}

      {/* ── Circular floating button (slices black outer corners beautifully) ── */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setShowTooltip(false); }}
          style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: '#0f172a', border: '3px solid #6C5CE7',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(108,92,231,0.5)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            animation: 'pulse-ring 2.5s infinite'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.08) translateY(-4px)';
            e.currentTarget.style.borderColor = '#8E2DE2';
            e.currentTarget.style.boxShadow = '0 12px 36px rgba(142,45,226,0.7)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.borderColor = '#6C5CE7';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(108,92,231,0.5)';
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
          style={{
            position: 'absolute', bottom: '0', right: '0',
            width: '400px', height: '580px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '24px', overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
            border: '1px solid rgba(108, 92, 231, 0.25)',
            display: 'flex', flexDirection: 'column',
            animation: 'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Header */}
          <div 
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.85), rgba(142, 45, 226, 0.85))',
              color: '#ffffff', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{ 
                  width: '38px', height: '38px', borderRadius: '50%',
                  overflow: 'hidden', background: '#090d16',
                  border: '2px solid rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <img src={chatbotIcon} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.05)' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', letterSpacing: '0.4px' }}>EduBot Cố Vấn THPTQG</h4>
                <span style={{ fontSize: '10px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }}></span>
                  Đang trực tuyến • Context: {getPageName(currentPath)}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Trash/Clear Chat button */}
              <button
                onClick={handleClearChat}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  borderRadius: '50%', width: '30px', height: '30px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#f8fafc', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                title="Xóa lịch sử trò chuyện"
              >
                <HiTrash size={16} />
              </button>

              {/* Close Button */}
              <button 
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  borderRadius: '50%', width: '30px', height: '30px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#f8fafc', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <HiX size={16} />
              </button>
            </div>
          </div>

          {/* Messages List Area */}
          <div 
            className="custom-scrollbar"
            style={{
              flex: 1, padding: '20px 16px', overflowY: 'auto',
              background: 'transparent',
              display: 'flex', flexDirection: 'column', gap: '16px'
            }}
          >
            {messages.map((msg, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                  gap: '10px',
                  animation: 'message-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}
              >
                {/* Bot Avatar */}
                {msg.sender === 'bot' && (
                  <div 
                    style={{ 
                      width: '30px', height: '30px', borderRadius: '50%',
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
                    maxWidth: '82%',
                    padding: '12px 16px',
                    borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    background: msg.sender === 'user' 
                      ? 'linear-gradient(135deg, #6C5CE7, #8E2DE2)' 
                      : 'rgba(255, 255, 255, 0.08)',
                    color: msg.sender === 'user' ? '#ffffff' : '#f1f5f9',
                    fontSize: '13px',
                    lineHeight: '1.65',
                    boxShadow: msg.sender === 'user' 
                      ? '0 4px 12px rgba(108,92,231,0.25)' 
                      : '0 4px 12px rgba(0,0,0,0.1)',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                    fontWeight: '400'
                  }}
                >
                  {msg.sender === 'bot' ? renderMessageText(msg.text) : msg.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', animation: 'message-pop 0.3s forwards' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', background: '#090d16', border: '1.5px solid #6C5CE7', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={chatbotIcon} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '12px 18px', borderRadius: '20px 20px 20px 4px', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <span className="dot" style={{ width: '6px', height: '6px', background: '#a5b4fc', borderRadius: '50%', animation: 'bounce 1.3s infinite ease-in-out' }}></span>
                  <span className="dot" style={{ width: '6px', height: '6px', background: '#a5b4fc', borderRadius: '50%', animation: 'bounce 1.3s infinite ease-in-out', animationDelay: '0.2s' }}></span>
                  <span className="dot" style={{ width: '6px', height: '6px', background: '#a5b4fc', borderRadius: '50%', animation: 'bounce 1.3s infinite ease-in-out', animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div 
            className="custom-scrollbar"
            style={{
              padding: '6px 16px 12px 16px',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              background: 'transparent',
              flexShrink: 0,
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none'  /* IE 10+ */
            }}
          >
            {/* Style injection to hide scrollbars for Chrome/Safari inside the scrolling row */}
            <style>{`
              .custom-scrollbar::-webkit-scrollbar {
                display: none !important;
              }
            `}</style>
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={(e) => handleSend(e, chip.text)}
                disabled={loading}
                style={{
                  background: 'rgba(108, 92, 231, 0.12)',
                  border: '1.5px solid rgba(108, 92, 231, 0.3)',
                  color: '#e2e8f0',
                  padding: '7px 14px',
                  borderRadius: '18px',
                  fontSize: '11.5px',
                  cursor: loading ? 'default' : 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.background = 'rgba(108, 92, 231, 0.25)';
                    e.currentTarget.style.borderColor = '#8E2DE2';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!loading) {
                    e.currentTarget.style.background = 'rgba(108, 92, 231, 0.12)';
                    e.currentTarget.style.borderColor = 'rgba(108, 92, 231, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {chip.text}
              </button>
            ))}
          </div>

          {/* Footer Input Area */}
          <form 
            onSubmit={handleSend}
            style={{
              padding: '16px 20px',
              background: 'rgba(15, 23, 42, 0.9)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex', gap: '12px', alignItems: 'center'
            }}
          >
            <input 
              type="text"
              placeholder={`Hỏi EduBot về ${getPageName(currentPath).toLowerCase()}...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              style={{
                flex: 1, padding: '12px 18px',
                borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '12.5px', outline: 'none',
                transition: 'all 0.25s ease'
              }}
              onFocus={e => {
                e.target.style.borderColor = '#6C5CE7';
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.boxShadow = '0 0 10px rgba(108, 92, 231, 0.25)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading 
                  ? 'linear-gradient(135deg, #6C5CE7, #8E2DE2)' 
                  : 'rgba(255, 255, 255, 0.08)',
                color: input.trim() && !loading ? '#ffffff' : '#94a3b8', 
                border: 'none',
                borderRadius: '50%', width: '40px', height: '40px',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s ease', flexShrink: 0,
                boxShadow: input.trim() && !loading ? '0 4px 12px rgba(108,92,231,0.3)' : 'none'
              }}
              onMouseEnter={e => {
                if (input.trim() && !loading) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={e => {
                if (input.trim() && !loading) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
              title="Gửi câu hỏi"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px', transform: 'rotate(45deg) translate(-1px, 1px)' }}>
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
