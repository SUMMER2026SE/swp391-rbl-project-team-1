import React, { useState, useMemo } from 'react';
import { HiClock, HiThumbUp, HiHeart, HiLightBulb } from 'react-icons/hi';

export default function DiscussionTab({
  discussions = [],
  onAddComment,
  currentUser,
  videoTime = 0,
  onSeek
}) {
  const [filterMode, setFilterMode] = useState('ALL');
  const [newComment, setNewComment] = useState('');
  const [attachTimestamp, setAttachTimestamp] = useState(false);
  const [reactions, setReactions] = useState({});
  const [votedReactions, setVotedReactions] = useState(new Set());

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddReaction = (id, type) => {
    const key = `${id}-${type}`;
    if (votedReactions.has(key)) return;
    setReactions(prev => {
      const current = prev[id] || { helpful: 0, love: 0, insight: 0 };
      return {
        ...prev,
        [id]: {
          ...current,
          [type]: current[type] + 1
        }
      };
    });
    setVotedReactions(prev => {
      const copy = new Set(prev);
      copy.add(key);
      return copy;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const timeAttach = attachTimestamp ? Math.floor(videoTime) : null;
    let textToSend = newComment;
    if (timeAttach !== null) {
      textToSend = `[t=${timeAttach}] ${newComment}`;
    }
    
    onAddComment(textToSend);
    setNewComment('');
    setAttachTimestamp(false);
  };

  const parseTimestamp = (content) => {
    if (!content) return null;
    const match = content.match(/^\[t=(\d+)\]/);
    return match ? Number(match[1]) : null;
  };

  const cleanContent = (content) => {
    if (!content) return '';
    return content.replace(/^\[t=(\d+)\]\s*/, '');
  };

  const filteredDiscussions = useMemo(() => {
    let result = [...discussions];

    if (filterMode === 'CURRENT') {
      result = result.filter(d => {
        const t = d.timestampSeconds !== undefined ? d.timestampSeconds : parseTimestamp(d.content);
        if (t === null) return false;
        return Math.abs(t - videoTime) <= 30;
      });
    } else if (filterMode === 'MINE') {
      result = result.filter(d => d.user_name === currentUser?.fullName || d.user_name === currentUser?.name);
    }

    return result;
  }, [discussions, filterMode, videoTime, currentUser]);

  return (
    <div className="discussion-tab animate-in">
      <form onSubmit={handleSubmit} className="discussion-tab__form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Đặt câu hỏi hoặc chia sẻ ý kiến của em về bài học này..."
          className="discussion-tab__textarea"
          required
          rows={3}
        />
        <div className="discussion-tab__form-actions">
          <label className="timestamp-checkbox-label">
            <input
              type="checkbox"
              checked={attachTimestamp}
              onChange={(e) => setAttachTimestamp(e.target.checked)}
              className="timestamp-checkbox"
            />
            <span>Gắn câu hỏi vào giây phát hiện tại ({formatTime(videoTime)})</span>
          </label>
          <button type="submit" className="discussion-tab__submit-btn">
            Gửi câu hỏi
          </button>
        </div>
      </form>

      <div className="discussion-tab__filters">
        <button
          type="button"
          onClick={() => setFilterMode('ALL')}
          className={`filter-btn ${filterMode === 'ALL' ? 'filter-btn--active' : ''}`}
        >
          Tất cả
        </button>
        <button
          type="button"
          onClick={() => setFilterMode('CURRENT')}
          className={`filter-btn ${filterMode === 'CURRENT' ? 'filter-btn--active' : ''}`}
        >
          Quanh giây hiện tại (±30s)
        </button>
        <button
          type="button"
          onClick={() => setFilterMode('MINE')}
          className={`filter-btn ${filterMode === 'MINE' ? 'filter-btn--active' : ''}`}
        >
          Của tôi
        </button>
      </div>

      <div className="discussion-tab__list">
        {filteredDiscussions.length > 0 ? (
          filteredDiscussions.map((d, idx) => {
            const commentId = d.id || `c-${idx}`;
            const t = d.timestampSeconds !== undefined ? d.timestampSeconds : parseTimestamp(d.content);
            const displayContent = cleanContent(d.content);
            const isTeacher = d.user_role === 'TEACHER' || d.user_role === 'ADMIN' || d.user_name?.includes('Thầy') || d.user_name?.includes('Cô');
            const counts = reactions[commentId] || { helpful: 0, love: 0, insight: 0 };

            return (
              <div key={commentId} className={`discussion-post-card ${isTeacher ? 'discussion-post-card--teacher' : ''}`}>
                <div className="discussion-post-card__header">
                  <div className="discussion-post-card__avatar">
                    {d.user_avatar && d.user_avatar.length > 2 ? (
                      <img src={d.user_avatar} alt={d.user_name} className="discussion-avatar-img" />
                    ) : (
                      d.user_name?.slice(0, 2).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="discussion-post-card__meta">
                    <div className="author-row">
                      <span className="author-name">{d.user_name}</span>
                      {isTeacher && <span className="author-role-badge">Giảng viên</span>}
                      {t !== null && (
                        <button
                          type="button"
                          onClick={() => onSeek && onSeek(t)}
                          className="post-time-badge"
                        >
                          <HiClock style={{ marginRight: 2 }} /> {formatTime(t)}
                        </button>
                      )}
                    </div>
                    <span className="post-date">
                      {d.created_at ? new Date(d.created_at).toLocaleDateString('vi-VN') : 'Mới đây'}
                    </span>
                  </div>
                </div>

                <p className="discussion-post-card__content">{displayContent}</p>

                <div className="discussion-post-card__reactions">
                  <button
                    type="button"
                    onClick={() => handleAddReaction(commentId, 'helpful')}
                    className="reaction-btn"
                  >
                    <HiThumbUp /> Hữu ích ({counts.helpful})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddReaction(commentId, 'love')}
                    className="reaction-btn"
                  >
                    <HiHeart /> Thả tim ({counts.love})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddReaction(commentId, 'insight')}
                    className="reaction-btn"
                  >
                    <HiLightBulb /> Khai sáng ({counts.insight})
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="discussion-tab__empty">
            Chưa có câu hỏi thảo luận nào được tìm thấy.
          </div>
        )}
      </div>
    </div>
  );
}
