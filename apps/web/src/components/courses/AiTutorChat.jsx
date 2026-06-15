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
    <div className="chat-card animate-in">
      {/* Header */}
      <div className="chat-header chat-header--ai">
        <div className="chat-avatar chat-avatar--ai">
          <HiSparkles style={{ fontSize: '18px', color: '#F59E0B' }} />
        </div>
        <div className="chat-header-info">
          <h4 className="chat-header-title">
            Gia sư AI EduBot ⚡
          </h4>
          <span className="chat-status chat-status--ai">Bám sát bài: {lessonTitle}</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="chat-messages">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`chat-bubble-wrapper ${isUser ? 'chat-bubble-wrapper--me' : 'chat-bubble-wrapper--other'}`}
            >
              <div className={`chat-bubble ${isUser ? 'chat-bubble--me' : 'chat-bubble--other'}`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="chat-typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="chat-form">
        <input
          type="text"
          placeholder="Hỏi AI công thức, mẹo giải nhanh..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          required
          className="chat-input"
        />
        <button
          type="submit"
          disabled={typing}
          className="chat-send-btn"
        >
          <HiPaperAirplaneIcon style={{ fontSize: '14px', transform: 'rotate(90deg)' }} />
        </button>
      </form>
    </div>
  );
}
