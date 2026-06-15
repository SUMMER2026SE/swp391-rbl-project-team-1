import { useState } from 'react';
import { HiChat, HiHeart, HiSearch, HiPlus, HiArrowLeft, HiTag, HiStar, HiCheckCircle, HiChevronDown, HiDownload, HiFire, HiShieldCheck } from 'react-icons/hi';

export default function Forum({ forumPosts, onAddPost, onLikePost, onAddComment, onAcceptCommentSolution, currentUser }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'popular', 'unanswered'
  const [showCreateModal, setShowCreateModal] = useState(false);

  // AI Assistant simulated state
  const [aiResponse, setAiResponse] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Form states for new post
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSubject, setNewSubject] = useState('Toán học');
  const [newTags, setNewTags] = useState('Lớp 12');
  const [newDifficulty, setNewDifficulty] = useState('Trung bình');

  // Comment input state
  const [commentText, setCommentText] = useState('');

  const subjects = ['All', 'Toán học', 'Vật lý', 'Hóa học', 'Tiếng Anh', 'Sinh học', 'Khác'];
  const availableTags = ['Lớp 12', 'Lớp 11', 'Lớp 10', 'Casio nhanh', 'Mẹo giải đề', 'Đề minh họa', 'Học lý thuyết'];

  // Handle post selection with AI state resetting
  const handleSelectPost = (post) => {
    setSelectedPost(post);
    setAiResponse(post.aiExplanation || null);
    setIsAiLoading(false);
  };

  // Filter posts - Pinned Admin posts always bypass the subject filter
  const filteredPosts = forumPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || post.subject === selectedSubject || post.authorRole === 'admin';
    return matchesSearch && matchesSubject;
  });

  // Sort posts - Admin posts always go to the top, then sort by selected criteria
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const aIsAdmin = a.authorRole === 'admin';
    const bIsAdmin = b.authorRole === 'admin';
    if (aIsAdmin && !bIsAdmin) return -1;
    if (!aIsAdmin && bIsAdmin) return 1;

    if (sortBy === 'popular') {
      return b.likes - a.likes;
    } else if (sortBy === 'unanswered') {
      return (a.comments?.length || 0) - (b.comments?.length || 0);
    } else {
      // newest
      return b.id - a.id;
    }
  });

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost = {
      id: Date.now(),
      title: newTitle,
      content: newContent,
      subject: newSubject,
      tags: newTags,
      difficulty: newDifficulty,
      author: currentUser?.name || 'Ẩn danh',
      authorAvatar: currentUser?.avatar || 'AD',
      authorRole: currentUser?.role || 'student',
      date: 'Vừa xong',
      likes: 0,
      likedBy: [],
      comments: [],
      aiExplanation: null
    };

    onAddPost(newPost);
    setNewTitle('');
    setNewContent('');
    setShowCreateModal(false);
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      author: currentUser?.name || 'Học sinh',
      avatar: currentUser?.avatar || 'HS',
      content: commentText,
      date: 'Vừa xong',
      isAccepted: false
    };

    onAddComment(selectedPost.id, newComment);
    
    // Update local detailed view state
    setSelectedPost(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newComment]
    }));
    setCommentText('');
  };

  const handleTriggerAI = () => {
    setIsAiLoading(true);
    setAiResponse(null);
    setTimeout(() => {
      setIsAiLoading(false);
      let answer = "";
      if (selectedPost.title.toLowerCase().includes("casio")) {
        answer = `🤖 [HƯỚNG DẪN GIẢI NHANH CASIO - EDUBOT AI]\n\nChào bạn ${selectedPost.author},\n\nĐối với bài toán liên quan đến Casio khảo sát cực trị/đồ thị, EduBot xin đề xuất các bước bấm máy tính cầm tay cực nhanh như sau:\n\n1. Sử dụng ứng dụng Bảng Giá Trị (Table):\n   - Bấm HOME -> chọn Table (Bảng giá trị).\n   - Nhập hàm số f(x) từ biểu thức đề bài cung cấp.\n   - Nhập phạm vi quét (Range): Start = -5, End = 5, Step = 0.2 (hoặc 0.1 để tăng độ phân giải).\n\n2. Đánh giá tính chất cực trị:\n   - Nhìn vào cột kết quả f(x): Điểm cực đại là nơi f(x) đổi chiều từ tăng sang giảm. Điểm cực tiểu là nơi f(x) đổi chiều từ giảm sang tăng.\n\n3. Sử dụng công cụ Solver hoặc Đạo hàm để tinh chỉnh:\n   - Bấm tính đạo hàm d/dx tại x để kiểm tra f'(x) = 0 chính xác.\n\nChúc bạn đạt điểm tuyệt đối môn Toán!`;
      } else if (selectedPost.title.toLowerCase().includes("dao động") || selectedPost.title.toLowerCase().includes("vật lý")) {
        answer = `🤖 [TỔNG HỢP CÔNG THỨC DAO ĐỘNG CƠ - EDUBOT AI]\n\nChào bạn ${selectedPost.author},\n\nDưới đây là hệ thống công thức then chốt của chương Dao Động Cơ Học (Vật lý 12) giúp bạn ghi nhớ giải nhanh đề thi đại học:\n\n1. Phương trình li độ: x = A*cos(ωt + φ)\n2. Phương trình vận tốc: v = x' = -ωA*sin(ωt + φ)\n   - Vận tốc max ở vị trí cân bằng: v_max = ωA\n3. Phương trình gia tốc: a = v' = -ω²x\n   - Gia tốc max ở biên: a_max = ω²A\n4. Công thức độc lập thời gian:\n   A² = x² + (v/ω)² = (a/ω²)² + (v/ω)²\n5. Con lắc lò xo:\n   - Chu kỳ: T = 2π * √(m/k)\n   - Tần số góc: ω = √(k/m)\n\nLưu ý: Luôn đổi đơn vị m sang kg và x sang mét để tính cơ năng chuẩn xác!`;
      } else {
        answer = `🤖 [HƯỚNG DẪN GIẢI QUYẾT CHỦ ĐỀ: ${selectedPost.subject} - EDUBOT AI]\n\nChào bạn,\n\nDưới đây là các gợi ý tư duy và giải pháp giáo dục cho câu hỏi thảo luận này:\n\n1. Xác định trọng tâm lý thuyết:\n   - Hệ thống lại định nghĩa, định lý cốt lõi của chủ đề "${selectedPost.subject}".\n   - Đọc kỹ yêu cầu đề thi để loại trừ các đáp án nhiễu thường gặp.\n\n2. Phương pháp giải chi tiết:\n   - Bước 1: Thiết lập điều kiện bài toán và biến đổi đại lượng.\n   - Bước 2: Sử dụng các sơ đồ, hình vẽ hoặc công cụ hỗ trợ giải toán để cụ thể hóa bài học.\n   - Bước 3: Giải toán từng bước rõ ràng, viết công thức gốc trước khi thế số.\n\nHy vọng hướng đi này giúp ích cho bạn trong thảo luận!`;
      }
      setAiResponse(answer);
      // Persist to local post object
      selectedPost.aiExplanation = answer;
    }, 2000);
  };

  return (
    <div className="forum-container animate-in" style={{ padding: '4px' }}>
      {selectedPost ? (
        /* ── DETAILED POST VIEW ── */
        <div className="card detailed-post-card" style={{ padding: '24px', border: '1px solid var(--border)' }}>
          <button className="btn-outline" onClick={() => setSelectedPost(null)} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HiArrowLeft /> Quay lại diễn đàn
          </button>
          
          <div className="post-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="user-avatar" style={{ background: selectedPost.authorRole === 'admin' ? '#f59e0b' : 'var(--primary)', width: '46px', height: '46px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', overflow: 'hidden' }}>
                {selectedPost.authorAvatar && (selectedPost.authorAvatar.startsWith('data:') || selectedPost.authorAvatar.startsWith('http') || selectedPost.authorAvatar.length > 10) ? (
                  <img 
                    src={selectedPost.authorAvatar.startsWith('data:') || selectedPost.authorAvatar.startsWith('http') ? selectedPost.authorAvatar : `data:image/png;base64,${selectedPost.authorAvatar}`} 
                    alt="Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  (selectedPost.authorAvatar && selectedPost.authorAvatar.length <= 10) ? selectedPost.authorAvatar : 'U'
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--text-primary)' }}>{selectedPost.author}</h4>
                  {selectedPost.authorRole === 'admin' && <span className="admin-pill-tag">ADMIN</span>}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Đăng lúc {selectedPost.date} • <span className="badge-pill" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: '10px' }}>{selectedPost.subject}</span></p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {selectedPost.tags && (
                <span className="badge-pill" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '10.5px', fontWeight: 'bold' }}>
                  🏷️ {selectedPost.tags}
                </span>
              )}
              {selectedPost.difficulty && (
                <span className="badge-pill" style={{ 
                  background: selectedPost.difficulty === 'Khó' ? '#fee2e2' : selectedPost.difficulty === 'Dễ' ? '#dcfce7' : '#ffedd5',
                  color: selectedPost.difficulty === 'Khó' ? '#b91c1c' : selectedPost.difficulty === 'Dễ' ? '#15803d' : '#c2410c',
                  fontSize: '10.5px', fontWeight: 'bold'
                }}>
                  ⚡ {selectedPost.difficulty}
                </span>
              )}
            </div>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '14px', color: 'var(--text-primary)' }}>{selectedPost.title}</h2>
          <div style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--text-secondary)', whiteSpace: 'pre-line', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
            {selectedPost.content}
          </div>

          {/* ── EDUBOT AI AUTO-ANSWER WIDGET ── */}
          <div className="ai-answer-box animate-in" style={{
            background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
            border: '1.5px dashed #8b5cf6',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6d28d9', fontWeight: '800', fontSize: '14.5px' }}>
                <span style={{ fontSize: '20px' }}>🤖</span>
                <span>EduBot AI - Trợ lý học tập thông minh</span>
                <span className="badge-pill" style={{ background: '#8b5cf6', color: '#fff', fontSize: '9px', padding: '2px 8px', fontWeight: 'bold' }}>TỰ ĐỘNG</span>
              </div>
              {!aiResponse && !isAiLoading && (
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleTriggerAI}
                  style={{ padding: '6px 14px', fontSize: '12px', background: '#7c3aed', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Giải nhanh bằng AI
                </button>
              )}
            </div>

            {isAiLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '12px 0' }}>
                <div style={{ fontSize: '13px', color: '#5b21b6', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                  <span className="spinner" style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid #7c3aed', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
                  <span>EduBot đang đọc câu hỏi và soạn lời giải chi tiết...</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#7c3aed', width: '100%', borderRadius: '2px', animation: 'loadProgress 2.0s ease-out forwards' }}></div>
                </div>
              </div>
            )}

            {aiResponse && (
              <div className="animate-in" style={{ fontSize: '13.5px', color: '#1e1b4b', lineHeight: '1.6', whiteSpace: 'pre-line', padding: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #ddd6fe', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                {aiResponse}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', fontSize: '11px', color: '#7c3aed', fontWeight: 'bold', gap: '4px', alignItems: 'center' }}>
                  <HiShieldCheck style={{ fontSize: '14px' }} /> Lời giải tự động từ hệ thống tri thức EduPath AI
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <button 
              onClick={() => {
                onLikePost(selectedPost.id);
                setSelectedPost(prev => ({
                  ...prev,
                  likes: prev.likedBy?.includes(currentUser?.email || 'guest') ? prev.likes - 1 : prev.likes + 1,
                  likedBy: prev.likedBy?.includes(currentUser?.email || 'guest') 
                    ? prev.likedBy.filter(email => email !== (currentUser?.email || 'guest'))
                    : [...(prev.likedBy || []), currentUser?.email || 'guest']
                }));
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', border: 'none', background: 'none', 
                color: selectedPost.likedBy?.includes(currentUser?.email || 'guest') ? 'var(--accent-red)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '14px', fontWeight: '500'
              }}
            >
              <HiHeart style={{ fontSize: '18px' }} /> {selectedPost.likes} Lượt thích
            </button>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              <HiChat style={{ fontSize: '18px' }} /> {selectedPost.comments?.length || 0} Bình luận
            </span>
          </div>

          {/* ── COMMENTS SECTION ── */}
          <div style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-primary)' }}>Ý kiến thảo luận ({selectedPost.comments?.length || 0})</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              {selectedPost.comments && selectedPost.comments.length > 0 ? (
                selectedPost.comments.map(c => (
                  <div 
                    key={c.id} 
                    className={`comment-card ${c.isAccepted ? 'accepted-solution-comment' : ''}`}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      gap: '8px', 
                      padding: '16px', 
                      borderRadius: '12px',
                      border: c.isAccepted ? '2px solid var(--accent-green)' : '1px solid var(--border)',
                      background: c.isAccepted ? 'rgba(0, 184, 148, 0.05)' : 'var(--bg-card)',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    {c.isAccepted && (
                      <div style={{ position: 'absolute', right: '12px', top: '12px', background: 'var(--accent-green)', color: '#fff', fontSize: '9.5px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <HiCheckCircle /> LỜI GIẢI ĐÚNG NHẤT
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div className="user-avatar" style={{ background: 'var(--accent-blue)', width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 'bold', overflow: 'hidden' }}>
                        {c.avatar && (c.avatar.startsWith('data:') || c.avatar.startsWith('http') || c.avatar.length > 10) ? (
                          <img 
                            src={c.avatar.startsWith('data:') || c.avatar.startsWith('http') ? c.avatar : `data:image/png;base64,${c.avatar}`} 
                            alt="Avatar" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        ) : (
                          (c.avatar && c.avatar.length <= 10) ? c.avatar : 'U'
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{c.author}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{c.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px', paddingLeft: '2px', wordBreak: 'break-word', whiteSpace: 'pre-line' }}>{c.content}</p>
                    
                    {/* Mark best solution option */}
                    {(currentUser?.name === selectedPost.author || currentUser?.role === 'admin') && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedComments = selectedPost.comments.map(comm => {
                              if (comm.id === c.id) {
                                return { ...comm, isAccepted: !comm.isAccepted };
                              }
                              return { ...comm, isAccepted: false };
                            });

                            if (onAcceptCommentSolution) {
                              onAcceptCommentSolution(selectedPost.id, c.id);
                            }

                            setSelectedPost(prev => ({
                              ...prev,
                              comments: updatedComments
                            }));
                          }}
                          style={{
                            background: c.isAccepted ? '#e2e8f0' : 'rgba(0, 184, 148, 0.1)',
                            color: c.isAccepted ? '#475569' : 'var(--accent-green)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'scale(1.02)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          {c.isAccepted ? '✕ Hủy xác nhận lời giải' : '✓ Chọn làm lời giải đúng'}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!</p>
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Viết phản hồi hoặc lời giải của bạn..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                style={{ flex: 1 }}
                required
              />
              <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>Gửi bình luận</button>
            </form>
          </div>
        </div>
      ) : (
        /* ── POSTS DIRECTORY VIEW ── */
        <div>
          {/* 🏆 MODERN GRADIENT WELCOMING BANNER 🏆 */}
          <div className="forum-banner" style={{
            background: 'linear-gradient(135deg, #6c5ce7 0%, #8c7ae6 50%, #e056fd 100%)',
            borderRadius: '20px',
            padding: '30px',
            color: '#ffffff',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(108, 92, 231, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'left'
          }}>
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px' }}>
              <span className="badge-pill" style={{ 
                background: 'rgba(255,255,255,0.2)', 
                color: '#fff', 
                fontSize: '11px', 
                fontWeight: 'bold', 
                padding: '5px 12px',
                borderRadius: '20px',
                backdropFilter: 'blur(4px)'
              }}>
                🎓 EDUPATH FORUM ACTIVE
              </span>
              <h1 style={{ fontSize: '26px', fontWeight: '850', color: '#fff', marginTop: '12px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                Diễn đàn thảo luận và Trao đổi kiến thức
              </h1>
              <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.9)', marginTop: '8px', lineHeight: '1.5' }}>
                Cộng đồng học sinh ôn thi THPT Quốc Gia tích cực. Đăng tải bài tập khó để nhận hướng dẫn giải nhanh bằng máy tính Casio từ thầy cô và phân tích lời giải chi tiết tức thì từ trợ lý ảo <strong>EduBot AI</strong>.
              </p>
            </div>
            <div style={{ position: 'absolute', right: '40px', bottom: '-15px', fontSize: '130px', opacity: 0.12, userSelect: 'none', pointerEvents: 'none', fontFamily: 'system-ui' }}>
              💬
            </div>
          </div>

          <div className="forum-directory-layout" style={{ display: 'grid', gridTemplateColumns: '2.3fr 1fr', gap: '24px', alignItems: 'start', textAlign: 'left' }}>
            {/* ── LEFT COLUMN: SEARCH, FILTERS, POSTS LIST ── */}
            <div className="forum-main-col" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Search, Subject and Sort filters */}
              <div className="card" style={{ padding: '20px', display: 'flex', gap: '16px', flexDirection: 'column', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div className="search-bar" style={{ position: 'relative', flex: 1 }}>
                    <HiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '18px' }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm kiếm chủ đề, câu hỏi, bài thảo luận..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: '38px', width: '100%', fontSize: '13.5px' }}
                    />
                  </div>
                  
                  {/* Sorting dropdown */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Sắp xếp:</span>
                    <select
                      className="form-control"
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value)}
                      style={{
                        padding: '8px 30px 8px 12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        background: 'var(--bg-card)',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        appearance: 'none',
                        WebkitAppearance: 'none'
                      }}
                    >
                      <option value="newest">📅 Mới nhất</option>
                      <option value="popular">🔥 Quan tâm nhất</option>
                      <option value="unanswered">💬 Chưa giải quyết</option>
                    </select>
                    <HiChevronDown style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                  </div>

                  <button className="btn-primary" onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontSize: '13px', fontWeight: 'bold', borderRadius: '12px' }}>
                    <HiPlus /> Đăng bài mới
                  </button>
                </div>

                {/* Subject Tabs Selector */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {subjects.map(subj => (
                    <button
                      key={subj}
                      className={`badge-pill ${selectedSubject === subj ? 'active' : ''}`}
                      onClick={() => setSelectedSubject(subj)}
                      style={{
                        border: '1px solid var(--border)',
                        background: selectedSubject === subj ? 'var(--primary)' : 'var(--bg-main)',
                        color: selectedSubject === subj ? '#fff' : 'var(--text-secondary)',
                        padding: '7px 16px',
                        borderRadius: '20px',
                        fontSize: '12.5px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                      }}
                    >
                      {subj === 'All' ? '🌐 Tất cả môn' : subj}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)', padding: '0 4px' }}>
                <span>Tìm thấy <strong>{sortedPosts.length}</strong> bài thảo luận</span>
                <span style={{ fontSize: '12px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                  📌 BÀI GHIM CỦA ADMIN LUÔN HIỂN THỊ TRÊN ĐẦU
                </span>
              </div>

              {/* ── POSTS GRID ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {sortedPosts.length > 0 ? (
                  sortedPosts.map(post => {
                    const isAdmin = post.authorRole === 'admin';
                    return (
                      <div 
                        key={post.id} 
                        className={`card post-card ${isAdmin ? 'pinned-post-card' : ''}`}
                        style={{ 
                          cursor: 'pointer', 
                          transition: 'all 0.2s',
                          position: 'relative',
                          border: isAdmin ? '2.5px solid #f59e0b' : '1px solid var(--border)',
                          boxShadow: isAdmin ? '0 4px 15px rgba(245, 158, 11, 0.15)' : 'var(--shadow-sm)',
                          background: isAdmin ? 'linear-gradient(to right, #fffdf5, #ffffff)' : 'var(--bg-card)',
                          borderRadius: '16px',
                          overflow: 'hidden'
                        }}
                        onClick={() => handleSelectPost(post)}
                      >
                        {isAdmin && (
                          <div className="pinned-post-badge" style={{
                            position: 'absolute',
                            right: '0',
                            top: '0',
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: '#ffffff',
                            fontSize: '9.5px',
                            fontWeight: 'bold',
                            padding: '4px 12px',
                            borderBottomLeftRadius: '12px',
                            letterSpacing: '0.5px'
                          }}>
                            📌 THÔNG BÁO GHIM
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span className="badge-pill" style={{ background: isAdmin ? '#fef3c7' : 'var(--primary-bg)', color: isAdmin ? '#b45309' : 'var(--primary)', fontSize: '11px', fontWeight: '800' }}>
                              {post.subject}
                            </span>
                            {post.tags && (
                              <span className="badge-pill" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px' }}>
                                🏷️ {post.tags}
                              </span>
                            )}
                            {post.difficulty && (
                              <span className="badge-pill" style={{ 
                                background: post.difficulty === 'Khó' ? '#fee2e2' : post.difficulty === 'Dễ' ? '#dcfce7' : '#ffedd5',
                                color: post.difficulty === 'Khó' ? '#b91c1c' : post.difficulty === 'Dễ' ? '#15803d' : '#c2410c',
                                fontSize: '11px'
                              }}>
                                ⚡ {post.difficulty}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginRight: isAdmin ? '135px' : '0' }}>{post.date}</span>
                        </div>

                        <h3 style={{ fontSize: '16.5px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)', lineHeight: '1.4' }}>{post.title}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '14px', lineHeight: '1.5' }}>
                          {post.content}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div className="user-avatar" style={{ background: isAdmin ? '#f59e0b' : 'var(--accent-green)', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10.5px', fontWeight: 'bold', overflow: 'hidden' }}>
                              {post.authorAvatar && (post.authorAvatar.startsWith('data:') || post.authorAvatar.startsWith('http') || post.authorAvatar.length > 10) ? (
                                <img 
                                  src={post.authorAvatar.startsWith('data:') || post.authorAvatar.startsWith('http') ? post.authorAvatar : `data:image/png;base64,${post.authorAvatar}`} 
                                  alt="Avatar" 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                              ) : (
                                (post.authorAvatar && post.authorAvatar.length <= 10) ? post.authorAvatar : 'U'
                              )}
                            </div>
                            <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: isAdmin ? '#b45309' : 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              {post.author}
                              {isAdmin && <span className="admin-pill-tag">ADMIN</span>}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '14px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: post.likedBy?.includes(currentUser?.email || 'guest') ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                              <HiHeart /> {post.likes}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                              <HiChat /> {post.comments?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '50px 20px', border: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Không tìm thấy câu hỏi hoặc bài thảo luận nào phù hợp.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN: SIDEBAR WIDGETS ── */}
            <div className="forum-sidebar-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Forum stats */}
              <div className="card" style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', borderBottom: '2px dashed var(--border)', paddingBottom: '8px', marginBottom: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📊 Số liệu diễn đàn
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                    <span>Thành viên trực tuyến:</span>
                    <strong style={{ color: 'var(--primary)' }}>342 học sinh</strong>
                  </div>
                  <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                    <span>Tổng bài thảo luận:</span>
                    <strong>{forumPosts.length + 1800}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                    <span>Tỷ lệ giải quyết bằng AI:</span>
                    <strong style={{ color: 'var(--accent-green)' }}>100% (Tức thì)</strong>
                  </div>
                </div>
              </div>

              {/* 👑 BẢNG VÀNG THÀNH VIÊN TÍCH CỰC 👑 */}
              <div className="card" style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', borderBottom: '2px dashed var(--border)', paddingBottom: '8px', marginBottom: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  👑 Bảng vàng Tích cực
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f59e0b', color: '#fff', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                    <span style={{ fontSize: '12.5px', fontWeight: 'bold', flex: 1 }}>Nguyễn Minh Anh</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>45 lời giải</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#cbd5e1', color: '#334155', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                    <span style={{ fontSize: '12.5px', fontWeight: 'bold', flex: 1 }}>Lê Minh Tuấn</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>32 lời giải</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#b45309', color: '#fff', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
                    <span style={{ fontSize: '12.5px', fontWeight: 'bold', flex: 1 }}>Trần Thị Lan</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>28 lời giải</span>
                  </div>
                </div>
              </div>

              {/* 📑 LIÊN KẾT TÀI LIỆU ÔN THI HOT 📑 */}
              <div className="card" style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', borderBottom: '2px dashed var(--border)', paddingBottom: '8px', marginBottom: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📑 Tài liệu Ôn thi tiêu biểu
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a href="#/library" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid transparent', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                    <HiDownload style={{ color: 'var(--primary)' }} />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>Sổ tay Casio cực trị hàm số lớp 12</span>
                  </a>
                  <a href="#/library" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '12px', padding: '6px', borderRadius: '6px', border: '1px solid transparent', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                    <HiDownload style={{ color: 'var(--primary)' }} />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>100 Đề thi thử Toán học Đợt 1</span>
                  </a>
                </div>
              </div>

              {/* Forum Guidelines */}
              <div className="card" style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', borderBottom: '2px dashed var(--border)', paddingBottom: '8px', marginBottom: '14px', color: 'var(--text-primary)' }}>📜 Quy chế Diễn đàn</h4>
                <ul style={{ paddingLeft: '16px', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                  <li>Tôn trọng người dùng khác, không dùng từ ngữ thô tục.</li>
                  <li>Đăng câu hỏi đúng chủ đề / danh mục môn học.</li>
                  <li>Khuyến khích chia sẻ lời giải chi tiết và mẹo Casio nhanh.</li>
                  <li>Các bài đăng vi phạm quy chế sẽ bị Admin kiểm duyệt xóa.</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── CREATE NEW POST MODAL ── */}
      {showCreateModal && (
        <div className="modal-backdrop animate-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}>
          <div className="modal-card card" style={{ maxWidth: '600px', width: '90%', padding: '24px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Tạo bài viết thảo luận mới</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Chủ đề / Môn học:</label>
                  <select 
                    className="form-control"
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    style={{ width: '100%', fontSize: '13px' }}
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Khác">Chủ đề khác</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Phân loại Tag:</label>
                  <select
                    className="form-control"
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    style={{ width: '100%', fontSize: '13px' }}
                  >
                    {availableTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Độ khó:</label>
                  <select
                    className="form-control"
                    value={newDifficulty}
                    onChange={e => setNewDifficulty(e.target.value)}
                    style={{ width: '100%', fontSize: '13px' }}
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Tiêu đề câu hỏi / bài thảo luận:</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Ví dụ: Giúp em giải bài toán đạo hàm bậc 3 cực trị này với ạ!"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>Nội dung chi tiết câu hỏi:</label>
                <textarea 
                  className="form-control"
                  placeholder="Nhập nội dung câu hỏi, công thức hoặc các bước bạn đã giải được để mọi người cùng thảo luận..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  style={{ width: '100%', minHeight: '150px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-outline" onClick={() => setShowCreateModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn-primary">Đăng lên diễn đàn</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
