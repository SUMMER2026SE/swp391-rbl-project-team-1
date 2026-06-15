import React, { useState, useRef, useEffect } from 'react';
import { HiPaperAirplane, HiSparkles, HiCamera, HiX, HiArrowLeft, HiUser, HiChat } from 'react-icons/hi';
import { API_BASE } from '../api';

const channels = [
  { 
    id: 'ai-tutor', 
    name: 'Trợ lý AI EduBot', 
    type: 'ai', 
    subject: 'Hỗ trợ tất cả môn', 
    avatar: '🤖', 
    welcome: 'Chào em! Mình là EduBot, trợ lý học tập AI của em. Hãy gửi đề bài bằng văn bản hoặc bấm nút đính kèm ảnh chụp bài tập 📷, mình sẽ nhận diện OCR và hướng dẫn em cách giải chi tiết từng bước nhé!' 
  },
  { 
    id: 'teacher-math', 
    name: 'Thầy Thế Anh', 
    type: 'teacher', 
    subject: 'Toán học THPT', 
    avatar: '👨‍🏫', 
    welcome: 'Chào em! Thầy Thế Anh đây. Thầy vừa cập nhật ngân hàng đề thi thử Hàm số và Tích phân. Có phần lý thuyết hay câu hỏi thực hành nào làm khó em không? Nhắn cho thầy nhé!' 
  },
  { 
    id: 'teacher-physics', 
    name: 'Cô Thu Hương', 
    type: 'teacher', 
    subject: 'Vật lý THPT', 
    avatar: '👩‍🏫', 
    welcome: 'Chào em! Cô Thu Hương đây. Cô thấy em làm rất tốt phần Dao động điều hòa. Phần Sóng cơ và dòng điện xoay chiều có bài tập nào cần cô phân tích giản đồ vector không?' 
  },
  { 
    id: 'teacher-english', 
    name: 'Cô Quỳnh Chi', 
    type: 'teacher', 
    subject: 'Tiếng Anh THPT', 
    avatar: '👩‍🏫', 
    welcome: 'Hi there! Cô Quỳnh Chi đây. Cấu trúc câu gián tiếp, câu điều kiện hay từ vựng phần Đọc hiểu có chỗ nào cần cô hỗ trợ mẹo ghi nhớ nhanh không?' 
  }
];

const QUICK_PROMPTS = {
  'ai-tutor': [
    'Giải hộ em bài tập Toán phần Tích phân...',
    'Tóm tắt lý thuyết Dao động điều hòa Vật lý 12',
    'Mẹo làm bài đọc hiểu Tiếng Anh nhanh không bị bẫy',
    'Gợi ý lộ trình ôn thi khối A01 đạt điểm 9+'
  ],
  'teacher-math': [
    'Thầy hướng dẫn em bấm Casio cực trị hàm số',
    'Giải chi tiết câu cực trị hình học Oxyz khó',
    'Công thức tính nhanh thể tích khối đa diện'
  ],
  'teacher-physics': [
    'Cô giải thích giúp em hiện tượng cộng hưởng điện',
    'Làm thế nào để nhớ nhanh công thức sóng dừng?',
    'Giải câu đồ thị dao động cơ trong đề minh họa'
  ],
  'teacher-english': [
    'Cô chỉ mẹo phát âm -ed và -s không bao giờ sai',
    'Phân biệt giúp em used to, be used to và get used to',
    'Cách suy luận từ vựng mới trong bài Đọc hiểu'
  ]
};

// OCR Sample Responses
const OCR_RESPONSES = {
  'ai-tutor': `🔍 **[Hệ thống OCR]** Nhận diện đề bài thành công:
  *Đề bài:* Cho hàm số y = x³ - 3x² + 2. Tìm điểm cực đại của đồ thị hàm số.
  
  **EduBot AI hướng dẫn giải:**
  - **Bước 1 (Đạo hàm):** Ta có y' = 3x² - 6x.
  - **Bước 2 (Tìm nghiệm):** y' = 0 <=> 3x(x - 2) = 0 <=> x = 0 hoặc x = 2.
  - **Bước 3 (Bảng biến thiên):**
    - Hệ số a = 1 > 0. y' dương trên khoảng (-∞; 0) và (2; +∞), y' âm trên khoảng (0; 2).
    - Do đó, hàm số đạt cực đại tại x = 0.
  - **Bước 4 (Kết luận):** Giá trị cực đại y_CĐ = y(0) = 2. Vậy điểm cực đại của đồ thị là (0; 2).`,
  
  'teacher-math': `🔍 **[Hệ thống OCR]** Nhận diện đề bài Toán học:
  *Đề bài:* Tính tích phân I = ∫[0 -> 1] (2x + 1) e^x dx.
  
  **Thầy Thế Anh hướng dẫn giải:**
  Chào em, đây là dạng bài tích phân từng phần:
  - Đặt u = 2x + 1 => du = 2 dx.
  - Đặt dv = e^x dx => Chọn v = e^x.
  - Áp dụng công thức ∫ u dv = u.v - ∫ v du:
    I = (2x + 1)e^x |_[0 -> 1] - ∫[0 -> 1] 2 e^x dx
    I = [3e^1 - 1e^0] - [2e^x] |_[0 -> 1]
    I = 3e - 1 - [2e - 2]
    I = e + 1.
  Em ghi nhớ quy tắc đặt u theo thứ tự "Nhất lô, nhì đa, tam lượng, tứ mũ" nhé!`,
  
  'teacher-physics': `🔍 **[Hệ thống OCR]** Nhận diện đề bài Vật lý:
  *Đề bài:* Một vật dao động điều hòa với chu kỳ T = 2s. Biên độ A = 10cm. Tính tốc độ của vật khi đi qua vị trí x = 6cm.
  
  **Cô Thu Hương hướng dẫn giải:**
  Chào em, bài này ta dùng công thức độc lập với thời gian:
  - Tần số góc ω = 2π / T = 2π / 2 = π (rad/s).
  - Áp dụng hệ thức: A² = x² + v²/ω²
  - Thay số: 10² = 6² + v²/π²
    => v²/π² = 100 - 36 = 64
    => v²/π² = 64 => |v|/π = 8
    => |v| = 8π ≈ 25.13 (cm/s).
  Chúc em làm bài tốt, cần hỏi thêm cứ nhắn cô nhé!`,
  
  'teacher-english': `🔍 **[Hệ thống OCR]** Nhận diện đề bài Tiếng Anh:
  *Đề bài:* Choose the word whose underlined part differs from the other three:
  A. determin**ed**  B. sacrific**ed**  C. expir**ed**  D. reserv**ed**
  
  **Cô Quỳnh Chi hướng dẫn giải:**
  Chào em! Đây là câu hỏi kinh điển về cách phát âm đuôi -ed:
  - Quy tắc phát âm /t/: khi từ kết thúc bằng các âm vô thanh /p, k, f, s, ʃ, tʃ/. Ở đây, "sacrifice" kết thúc bằng âm /s/ => sacrific**ed** phát âm là /t/.
  - Quy tắc phát âm /d/: khi từ kết thúc bằng nguyên âm và các âm hữu thanh còn lại:
    - determine kết thúc bằng âm /n/ => determin**ed** phát âm là /d/.
    - expire kết thúc bằng nguyên âm /aɪə/ => expir**ed** phát âm là /d/.
    - reserve kết thúc bằng âm /v/ => reserv**ed** phát âm là /d/.
  Do đó, đáp án đúng là **B**.`
};

export default function AITutorPage({ currentUser, navigateTo, addLog }) {
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [guestCount, setGuestCount] = useState(() => {
    return parseInt(localStorage.getItem('edupath_guest_questions_count') || '0', 10);
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState('');
  const fileInputRef = useRef(null);

  const [chatHistories, setChatHistories] = useState(() => {
    // Attempt to load from localStorage to preserve guest chats or session chats
    const saved = localStorage.getItem('edupath_tutor_chat_histories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback below
      }
    }
    return {
      'ai-tutor': [{ sender: 'bot', text: channels[0].welcome, time: 'Hệ thống' }],
      'teacher-math': [{ sender: 'bot', text: channels[1].welcome, time: 'Giảng viên' }],
      'teacher-physics': [{ sender: 'bot', text: channels[2].welcome, time: 'Giảng viên' }],
      'teacher-english': [{ sender: 'bot', text: channels[3].welcome, time: 'Giảng viên' }]
    };
  });

  const messagesEndRef = useRef(null);

  // Sync URLs query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const channelId = params.get('channel');
    if (channelId) {
      const found = channels.find(c => c.id === channelId);
      if (found) {
        setActiveChannel(found);
      }
    }
  }, []);

  const handleChannelChange = (channel) => {
    setActiveChannel(channel);
    const params = new URLSearchParams(window.location.search);
    params.set('channel', channel.id);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  // Scroll to bottom when messages or typing changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistories, typing, activeChannel]);

  // Persist chat history
  useEffect(() => {
    localStorage.setItem('edupath_tutor_chat_histories', JSON.stringify(chatHistories));
  }, [chatHistories]);

  // Update guest count in localStorage
  useEffect(() => {
    localStorage.setItem('edupath_guest_questions_count', guestCount.toString());
  }, [guestCount]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    // Create preview URL
    const url = URL.createObjectURL(file);
    setSelectedFileUrl(url);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (selectedFileUrl) {
      URL.revokeObjectURL(selectedFileUrl);
      setSelectedFileUrl('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (textToSend = '') => {
    const text = textToSend || inputText;
    
    // Check if input is empty and no file attached
    if (!text.trim() && !selectedFile) return;

    // Check guest limits
    const isGuest = !currentUser;
    if (isGuest && guestCount >= 5) {
      return; // Intercepted by limit banner
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const channelId = activeChannel.id;

    // Construct User Message
    const userMsg = {
      sender: 'user',
      text: text,
      time: timeString,
    };

    if (selectedFileUrl) {
      userMsg.image = selectedFileUrl;
      userMsg.fileName = selectedFile.name;
    }

    // Update state immediately
    const currentChannelHistory = chatHistories[channelId] || [];
    const updatedHistory = [...currentChannelHistory, userMsg];
    
    setChatHistories(prev => ({
      ...prev,
      [channelId]: updatedHistory
    }));

    // Reset input fields
    setInputText('');
    setSelectedFile(null);
    setSelectedFileUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setTyping(true);

    if (isGuest) {
      // Guest local streaming simulation
      setGuestCount(prev => prev + 1);
      
      setTimeout(() => {
        setTyping(false);
        let replyText = '';

        if (userMsg.image) {
          // Send OCR Response
          replyText = OCR_RESPONSES[channelId] || OCR_RESPONSES['ai-tutor'];
        } else {
          // Standard text replies
          if (channelId === 'ai-tutor') {
            replyText = `🤖 **EduBot AI trả lời:**\nChào em! Cảm ơn em đã gửi câu hỏi: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}".\n\nĐây là câu trả lời thử nghiệm của EduBot AI. Để có thể giải nhanh và phân tích sâu sắc các dạng bài Toán/Lý/Hóa/Anh chuẩn đề thi THPTQG 2026, em hãy đăng ký tài khoản Học viên nhé!`;
          } else {
            replyText = `Chào em! Thầy/Cô đã nhận được câu hỏi ôn thi của em. Thầy/Cô sẽ phân tích chi tiết và phản hồi lại em ngay sau khi lớp học kết thúc nhé. Trong lúc chờ đợi, em hãy làm thử các câu hỏi trắc nghiệm cùng chuyên đề để nâng cao kỹ năng nhé! 💪`;
          }
        }

        // Simulating character by character or word by word streaming response
        const botMsgId = Date.now();
        const initialBotMsg = {
          id: botMsgId,
          sender: 'bot',
          text: '',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatHistories(prev => ({
          ...prev,
          [channelId]: [...(prev[channelId] || []), initialBotMsg]
        }));

        let currentIdx = 0;
        const words = replyText.split(' ');
        const streamInterval = setInterval(() => {
          if (currentIdx < words.length) {
            const currentStr = words.slice(0, currentIdx + 1).join(' ');
            setChatHistories(prev => {
              const hist = prev[channelId] || [];
              const updated = hist.map(m => m.id === botMsgId ? { ...m, text: currentStr } : m);
              return { ...prev, [channelId]: updated };
            });
            currentIdx++;
          } else {
            clearInterval(streamInterval);
          }
        }, 80);

        if (addLog) {
          addLog(`Khách vãng lai (Guest) gửi câu hỏi thử nghiệm (${guestCount + 1}/5)`, 'sys');
        }
      }, 1200);

    } else {
      // Logged-in STUDENT: actual API call
      if (addLog) {
        addLog(`Học viên gửi câu hỏi cho AI: "${text.substring(0, 40)}..."`, 'sys');
      }

      if (channelId === 'ai-tutor') {
        const botMessageId = Date.now();
        const initialBotMsg = {
          id: botMessageId,
          sender: 'bot',
          text: '',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatHistories(prev => ({
          ...prev,
          [channelId]: [...(prev[channelId] || []), initialBotMsg]
        }));

        try {
          // Call Backend SSE stream API
          const response = await fetch(`${API_BASE}/ai/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ message: text })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let currentResponse = '';
          setTyping(false);

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim();
                if (dataStr === '[DONE]') {
                  break;
                }
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.text) {
                    currentResponse += parsed.text;
                    setChatHistories(prev => {
                      const hist = prev[channelId] || [];
                      const updated = hist.map(msg => 
                        msg.id === botMessageId ? { ...msg, text: currentResponse } : msg
                      );
                      return {
                        ...prev,
                        [channelId]: updated
                      };
                    });
                  }
                } catch (e) {
                  // ignore incomplete JSON
                }
              }
            }
          }
          if (addLog) addLog(`AI trả lời hoàn tất cho Học viên`, 'ai');
        } catch (err) {
          console.error("SSE Error:", err);
          setTyping(false);
          
          // Local fallback in case of connection issue
          let fallbackText = '';
          if (userMsg.image) {
            fallbackText = OCR_RESPONSES[channelId] || OCR_RESPONSES['ai-tutor'];
          } else {
            fallbackText = `Chào em! EduBot AI đã nhận được câu hỏi. Tuy nhiên, hệ thống kết nối AI đang quá tải hoặc cấu hình server của em chưa hoàn tất. \n\nEm có thể thử lại sau giây lát, hoặc đặt câu hỏi sang các kênh của các Thầy Cô nhé!`;
          }

          setChatHistories(prev => {
            const hist = prev[channelId] || [];
            const updated = hist.map(msg => 
              msg.id === botMessageId ? { ...msg, text: fallbackText } : msg
            );
            return {
              ...prev,
              [channelId]: updated
            };
          });
        }
      } else {
        // Other Teacher Channels (Mock responses)
        setTimeout(() => {
          setTyping(false);
          let replyText = '';
          if (userMsg.image) {
            replyText = OCR_RESPONSES[channelId];
          } else {
            replyText = `Cảm ơn em đã gửi câu hỏi. Thầy/Cô đã nhận được và sẽ sớm phản hồi chi tiết vào tối nay sau khi chấm xong bài thi thử của cả lớp nhé. Trong lúc đó, em hãy xem lại video bài giảng và giải trước bài tập tự luyện của chuyên đề này nhé! Chúc em học tốt! 💪`;
          }

          const botMessage = { 
            sender: 'bot', 
            text: replyText, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          };

          setChatHistories(prev => ({
            ...prev,
            [channelId]: [...(prev[channelId] || []), botMessage]
          }));
        }, 1500);
      }
    }
  };

  const handleQuickPromptClick = (prompt) => {
    handleSendMessage(prompt);
  };

  const handleNavigateToAuth = (mode) => {
    navigateTo('/');
    // Use timeout to let navigation take effect
    setTimeout(() => {
      const event = new CustomEvent('edupath-auth-redirect', { detail: { mode } });
      window.dispatchEvent(event);
    }, 100);
  };

  return (
    <div className="aitutor-page">
      {/* Stand-alone Header for Guests */}
      {!currentUser && (
        <header className="aitutor-guest-header animate-in">
          <a href="/" className="aitutor-guest-logo" onClick={(e) => { e.preventDefault(); navigateTo('/'); }}>
            <span>EduPath <em>AI</em></span>
          </a>
          <div className="aitutor-guest-nav">
            <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('/'); }}>Trang chủ</a>
            <a href="/courses" onClick={(e) => { e.preventDefault(); navigateTo('/courses'); }}>Khóa học</a>
            <a href="/mock-exams" onClick={(e) => { e.preventDefault(); navigateTo('/mock-exams'); }}>Thi thử</a>
            <button className="aitutor-guest-btn-login" onClick={() => handleNavigateToAuth('login')}>Đăng nhập</button>
            <button className="aitutor-guest-btn-signup" onClick={() => handleNavigateToAuth('signup')}>Đăng ký</button>
          </div>
        </header>
      )}

      {/* Main Workspace grid */}
      <div className="aitutor-workspace">
        {/* Left sidebar: channels */}
        <aside className="aitutor-sidebar">
          <div className="aitutor-sidebar-title">Hội thoại gia sư AI</div>
          <div className="aitutor-channels-list">
            {channels.map((ch) => {
              const isActive = activeChannel.id === ch.id;
              return (
                <button
                  key={ch.id}
                  className={`aitutor-channel-item ${isActive ? 'aitutor-channel-item--active' : ''}`}
                  onClick={() => handleChannelChange(ch)}
                >
                  <div className="aitutor-channel-avatar">{ch.avatar}</div>
                  <div className="aitutor-channel-info">
                    <div className="aitutor-channel-name">{ch.name}</div>
                    <div className="aitutor-channel-subject">{ch.subject}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right chat panel */}
        <main className="aitutor-chat-panel">
          {/* Panel Header */}
          <div className="aitutor-chat-header">
            <div className="aitutor-chat-header-left">
              <div className="aitutor-channel-avatar" style={{ width: 38, height: 38, fontSize: 18 }}>
                {activeChannel.avatar}
              </div>
              <div>
                <h4 className="aitutor-active-title">{activeChannel.name}</h4>
                <div className="aitutor-active-status">
                  <span className="aitutor-status-dot" /> Đang trực tuyến
                </div>
              </div>
            </div>
            
            <div className="aitutor-badge-pro">
              <HiSparkles /> {activeChannel.type === 'ai' ? 'Trợ lý AI' : 'Gia sư Chuyên môn'}
            </div>
          </div>

          {/* Messages display */}
          <div className="aitutor-chat-messages">
            {chatHistories[activeChannel.id]?.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div 
                  key={index} 
                  className={`aitutor-msg-wrapper ${isUser ? 'aitutor-msg-wrapper--user' : 'aitutor-msg-wrapper--bot'}`}
                >
                  {/* Photo attachment display if present */}
                  {msg.image && (
                    <div className="aitutor-ocr-image-preview">
                      <img src={msg.image} alt="Bài tập đính kèm" />
                    </div>
                  )}

                  <div className={`aitutor-msg-bubble ${isUser ? 'aitutor-msg-bubble--user' : 'aitutor-msg-bubble--bot'}`}>
                    {msg.text.split('\n').map((line, lIdx) => (
                      <div key={lIdx} style={{ minHeight: '1.2em' }}>
                        {line.startsWith('🔍 **[Hệ thống OCR]**') ? (
                          <div className="aitutor-ocr-pill">
                            <HiCamera /> Nhận diện OCR bài tập thành công
                          </div>
                        ) : null}
                        
                        {/* Render simple bold markings in instructions */}
                        {line.includes('**') ? (
                          line.split('**').map((part, pIdx) => (
                            pIdx % 2 === 1 ? <strong key={pIdx}>{part}</strong> : part
                          ))
                        ) : line}
                      </div>
                    ))}
                  </div>
                  <span className="aitutor-msg-time">{msg.time}</span>
                </div>
              );
            })}

            {/* Typing indicator */}
            {typing && (
              <div className="aitutor-typing-bubble">
                <span className="aitutor-typing-dot" />
                <span className="aitutor-typing-dot" />
                <span className="aitutor-typing-dot" />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Footer actions and typing */}
          <footer className="aitutor-chat-footer">
            {/* Quick Pills */}
            <div className="aitutor-quick-pills">
              {QUICK_PROMPTS[activeChannel.id]?.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  className="aitutor-pill-btn"
                  onClick={() => handleQuickPromptClick(prompt)}
                  disabled={!currentUser && guestCount >= 5}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Pending Upload Preview */}
            {selectedFileUrl && (
              <div className="aitutor-pending-attachment">
                <img src={selectedFileUrl} alt="Thumbnail" className="aitutor-pending-thumb" />
                <span className="aitutor-pending-name">{selectedFile.name}</span>
                <button className="aitutor-pending-clear" onClick={clearSelectedFile}>
                  <HiX />
                </button>
              </div>
            )}

            {/* Main Input Row */}
            <div className="aitutor-input-row">
              {/* Attach camera button */}
              <button 
                className="aitutor-attach-btn" 
                onClick={() => fileInputRef.current?.click()}
                title="Đính kèm ảnh bài tập để OCR nhận diện giải nhanh"
                disabled={!currentUser && guestCount >= 5}
              >
                <HiCamera />
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />

              <input
                type="text"
                className="aitutor-input-field"
                placeholder={
                  !currentUser && guestCount >= 5 
                    ? "Đăng nhập để tiếp tục hỏi..." 
                    : activeChannel.type === 'ai' 
                      ? "Nhập câu hỏi hoặc đính kèm ảnh bài tập cần giải..." 
                      : `Gửi tin nhắn thảo luận cho ${activeChannel.name}...`
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!currentUser && guestCount >= 5}
              />

              <button
                className="aitutor-send-btn"
                onClick={() => handleSendMessage()}
                disabled={(!currentUser && guestCount >= 5) || (!inputText.trim() && !selectedFile)}
              >
                <HiPaperAirplane style={{ transform: 'rotate(90deg)' }} />
              </button>
            </div>

            {/* Guest limit warning banner */}
            {!currentUser && guestCount >= 5 && (
              <div className="aitutor-limit-banner animate-in">
                <div className="aitutor-limit-text">
                  ⚠️ Bạn đã dùng hết 5 lượt đặt câu hỏi thử nghiệm miễn phí dành cho khách. Hãy đăng nhập hoặc đăng ký tài khoản Học viên để tiếp tục học tập không giới hạn cùng EduBot AI nhé!
                </div>
                <div className="aitutor-limit-actions">
                  <button className="aitutor-limit-btn-login" onClick={() => handleNavigateToAuth('login')}>Đăng nhập</button>
                  <button className="aitutor-limit-btn-signup" onClick={() => handleNavigateToAuth('signup')}>Đăng ký</button>
                </div>
              </div>
            )}
          </footer>
        </main>
      </div>
    </div>
  );
}
