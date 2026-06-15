import { useState } from 'react';
import { toast } from '../../utils/toast';

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
        className={`cd-item ${isReply ? 'cd-item-reply' : ''}`}
      >
        <div className="cd-avatar" style={{ background: isReply ? 'var(--emerald-light)' : 'var(--emerald-primary)', color: isReply ? 'var(--emerald-primary)' : '#ffffff', border: isReply ? '1px solid rgba(5, 150, 105, 0.15)' : 'none' }}>
          {comment.user_avatar && comment.user_avatar.length <= 10 ? comment.user_avatar : 'U'}
        </div>

        <div className="cd-item-content">
          <div className="cd-bubble">
            <div className="cd-author-row">
              <strong className="cd-author">{comment.user_name}</strong>
              <span className="cd-time">
                {new Date(comment.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {new Date(comment.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <p className="cd-text">
              {comment.content}
            </p>
          </div>

          {!isReply && (
            <div className="cd-actions">
              <button 
                onClick={() => setReplyTarget(replyTarget?.id === comment.id ? null : comment)}
                className="cd-reply-btn"
              >
                Phản hồi 💬
              </button>
            </div>
          )}

          {/* Reply Form */}
          {replyTarget?.id === comment.id && (
            <form onSubmit={handlePostReply} className="cd-reply-form">
              <input 
                type="text"
                placeholder={`Trả lời ${comment.user_name}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
                className="cd-reply-input"
              />
              <button type="submit" className="cd-reply-submit">
                Gửi
              </button>
              <button type="button" onClick={() => setReplyTarget(null)} className="cd-reply-cancel">
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
    <div className="cd-card animate-in">
      <h3 className="cd-title">
        💬 Thảo luận bài học ({discussions.length})
      </h3>

      {/* Main Comment Input */}
      {currentUser ? (
        <form onSubmit={handlePostComment} className="cd-form">
          <div className="cd-avatar">
            {currentUser.avatar && currentUser.avatar.length <= 10 ? currentUser.avatar : 'U'}
          </div>
          <div className="cd-input-row">
            <textarea
              placeholder="Đặt câu hỏi hoặc thảo luận về bài học này..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              required
              rows={2}
              className="cd-textarea"
            />
            <button 
              type="submit" 
              className="cd-submit-btn"
            >
              Gửi bình luận
            </button>
          </div>
        </form>
      ) : (
        <div className="cd-login-prompt">
          🔑 Bạn cần <a href="#" style={{ textDecoration: 'underline', color: 'var(--emerald-primary)', fontWeight: '800' }} onClick={(e) => { e.preventDefault(); toast("Vui lòng đăng ký tài khoản Học viên hoặc đăng nhập để tham gia thảo luận!", 'warning'); }}>đăng nhập hoặc đăng ký</a> để tham gia bình luận học tập.
        </div>
      )}

      {/* Discussion List */}
      <div className="cd-list">
        {rootComments.length > 0 ? (
          rootComments.map(c => renderComment(c, false))
        ) : (
          <p style={{ fontSize: '12.5px', color: 'var(--stone-text-secondary)', textAlign: 'center', padding: '16px 0', margin: 0 }}>
            Hãy là người đầu tiên đặt câu hỏi cho bài giảng này!
          </p>
        )}
      </div>
    </div>
  );
}
