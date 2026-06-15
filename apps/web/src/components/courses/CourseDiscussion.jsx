import { useState } from 'react';

export default function CourseDiscussion({ discussions, onAddComment, currentUser }) {
  const [newCommentText, setNewCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(newCommentText, null);
    setNewCommentText('');
  };

  const handlePostReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyTarget) return;
    onAddComment(replyText, replyTarget.id);
    setReplyText('');
    setReplyTarget(null);
  };

  // Build threaded tree
  const rootComments = discussions.filter(d => !d.parent_id);
  const getReplies = (parentId) => discussions.filter(d => d.parent_id === parentId);

  const renderComment = (comment, isReply = false) => {
    const replies = getReplies(comment.id);

    return (
      <div 
        key={comment.id} 
        style={{ 
          display: 'flex', 
          gap: '12px', 
          borderLeft: isReply ? '2px solid var(--border)' : 'none', 
          paddingLeft: isReply ? '14px' : '0',
          marginTop: '12px',
          animation: 'fadeInUp 0.15s ease'
        }}
      >
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '11px', flexShrink: 0 }}>
          {comment.user_avatar && comment.user_avatar.length <= 10 ? comment.user_avatar : 'U'}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ background: 'var(--bg-main)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <strong style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>{comment.user_name}</strong>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {new Date(comment.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {new Date(comment.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4, whiteSpace: 'pre-line' }}>
              {comment.content}
            </p>
          </div>

          {!isReply && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11px' }}>
              <button 
                onClick={() => setReplyTarget(replyTarget?.id === comment.id ? null : comment)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Phản hồi 💬
              </button>
            </div>
          )}

          {/* Reply Form */}
          {replyTarget?.id === comment.id && (
            <form onSubmit={handlePostReply} style={{ display: 'flex', gap: '8px', marginTop: '10px', animation: 'fadeInUp 0.15s ease' }}>
              <input 
                type="text"
                placeholder={`Trả lời ${comment.user_name}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="form-control"
                required
                style={{ flex: 1, fontSize: '12px', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '8px' }}>
                Gửi
              </button>
              <button type="button" onClick={() => setReplyTarget(null)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '8px' }}>
                Hủy
              </button>
            </form>
          )}

          {/* Render nested replies recursively */}
          {replies.map(reply => renderComment(reply, true))}
        </div>
      </div>
    );
  };

  return (
    <div className="card animate-in" style={{ padding: '20px', borderRadius: '16px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--text-primary)' }}>
        💬 THẢO LUẬN BÀI HỌC ({discussions.length})
      </h3>

      {/* Main Comment Input */}
      {currentUser ? (
        <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', flexShrink: 0 }}>
            {currentUser.avatar && currentUser.avatar.length <= 10 ? currentUser.avatar : 'U'}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <textarea
              placeholder="Đặt câu hỏi hoặc thảo luận về bài học này..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="form-control"
              required
              rows={2}
              style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '10px', outline: 'none', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-primary)' }}
            />
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ alignSelf: 'flex-end', padding: '6px 16px', fontSize: '12px', borderRadius: '8px' }}
            >
              Gửi bình luận
            </button>
          </div>
        </form>
      ) : (
        <div style={{ padding: '14px', background: 'var(--emerald-light)', color: 'var(--emerald-primary)', borderRadius: '10px', fontSize: '12.5px', textAlign: 'center', marginBottom: '20px', border: '1px solid rgba(5, 150, 105, 0.1)', fontWeight: 'bold' }}>
          🔑 Bạn cần <a href="#" style={{ textDecoration: 'underline', color: 'var(--emerald-primary)', fontWeight: '800' }} onClick={(e) => { e.preventDefault(); alert("Vui lòng đăng ký tài khoản Học viên hoặc đăng nhập để tham gia thảo luận cùng cả lớp nhé!"); }}>đăng nhập hoặc đăng ký</a> để tham gia bình luận học tập.
        </div>
      )}

      {/* Discussion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {rootComments.length > 0 ? (
          rootComments.map(c => renderComment(c, false))
        ) : (
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px 0', margin: 0 }}>Hãy là người đầu tiên đặt câu hỏi cho bài giảng này!</p>
        )}
      </div>
    </div>
  );
}
