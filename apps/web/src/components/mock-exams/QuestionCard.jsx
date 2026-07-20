import React, { useState, useEffect } from 'react';
import { HiBookmark } from 'react-icons/hi';

export default function QuestionCard({ 
  question, 
  options = [], 
  selectedOptionLabel, 
  onSelectOption, 
  isBookmarked, 
  onBookmarkToggle,
  essayAnswer,
  onChangeEssayAnswer 
}) {
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  // Trigger MathJax typesetting whenever question content or options change
  useEffect(() => {
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      window.MathJax.typesetPromise().catch((err) => console.warn('MathJax error:', err));
    }
  }, [question, options]);

  const handleBookmarkClick = () => {
    if (isBookmarked) {
      onBookmarkToggle(question?.id, null); // Unbookmark
      setShowNoteInput(false);
    } else {
      setShowNoteInput(true);
    }
  };

  const handleSaveBookmark = () => {
    onBookmarkToggle(question?.id, bookmarkNote);
    setShowNoteInput(false);
  };

  const formatText = (txt) => {
    if (!txt) return '';
    let cleaned = txt;
    // Replace Datalab Markdown image tags ![Alt](image.jpg) with formatted images
    cleaned = cleaned.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      return `<div style="text-align:center;margin:8px 0;"><img src="${src}" alt="${alt}" style="max-width:100%;max-height:280px;border-radius:8px;border:1px solid #cbd5e1;" /></div>`;
    });
    // Remove leaked raw English image alt descriptions wrapped in $...$
    cleaned = cleaned.replace(/\$(The [x-z]-axis is along[^\$]+)\$/gi, '');
    return cleaned;
  };

  const cleanOptText = (txt) => {
    if (!txt) return '';
    let cleaned = txt.replace(/\$?The [x-z]-axis is along[^\$]*\$?/gi, '').trim();
    cleaned = cleaned.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '').trim();
    return cleaned || txt;
  };

  const formattedQuestionText = formatText(question?.question_text || '');

  return (
    <div className="taking-question-card animate-in">
      <div className="taking-question-header">
        <span className="taking-question-number">Câu {question?.question_number}</span>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="badge-pill" style={{ background: 'var(--bg-main)', color: 'var(--text-secondary)', fontSize: '11px' }}>
            {question?.difficulty}
          </span>
          <button 
            className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
            onClick={handleBookmarkClick}
            title={isBookmarked ? "Bỏ lưu câu hỏi" : "Lưu câu hỏi để ôn tập"}
          >
            <HiBookmark />
            <span style={{ fontSize: '12.5px' }}>{isBookmarked ? "Đã lưu" : "Lưu câu hỏi"}</span>
          </button>
        </div>
      </div>

      {showNoteInput && (
        <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Ghi chú học tập (Ví dụ: Công thức đạo hàm nâng cao)..." 
            value={bookmarkNote} 
            onChange={(e) => setBookmarkNote(e.target.value)}
            className="form-control"
            style={{ flex: 1, padding: '6px 12px', fontSize: '12px' }}
          />
          <button className="btn-primary" onClick={handleSaveBookmark} style={{ padding: '6px 12px', fontSize: '12px' }}>
            Lưu
          </button>
          <button className="btn-outline" onClick={() => setShowNoteInput(false)} style={{ padding: '6px 12px', fontSize: '12px' }}>
            Hủy
          </button>
        </div>
      )}

      <div className="taking-question-text">
        {/* Render LaTeX equations cleanly and handle Markdown images */}
        <div 
          style={{ margin: 0, whiteSpace: 'pre-line', fontSize: '14.5px', lineHeight: '1.7' }}
          dangerouslySetInnerHTML={{ __html: formattedQuestionText }}
        />
      </div>

      {question?.audio_url && (
        <div 
          style={{ 
            margin: '16px 0', 
            padding: '12px 16px', 
            background: 'var(--bg-main)', 
            border: '1.5px solid var(--border)', 
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🔊 Học phần Nghe ngoại ngữ:
          </span>
          <audio 
            src={question.audio_url} 
            controls 
            style={{ width: '100%', outline: 'none' }}
          />
        </div>
      )}

      {question?.question_image_url && (
        <div style={{ margin: '16px 0', textAlign: 'center' }}>
          <img 
            src={question.question_image_url} 
            alt={`Ảnh minh họa câu hỏi ${question.question_number}`} 
            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid var(--border)' }} 
          />
        </div>
      )}

      {/* Render based on Question Type */}
      {question?.question_type === 'essay' ? (
        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>
            Nhập bài làm tự luận của bạn:
          </label>
          <textarea
            className="form-control"
            rows="6"
            placeholder="Viết bài phân tích hoặc câu trả lời tự luận tại đây..."
            value={essayAnswer || ''}
            onChange={(e) => onChangeEssayAnswer(question.id, e.target.value)}
            style={{ width: '100%', padding: '12px', fontSize: '13.5px', borderRadius: '8px', outline: 'none' }}
          />
        </div>
      ) : (
        <div className="taking-options-list">
          {options.map((opt) => {
            const isSelected = selectedOptionLabel === opt.option_label;
            const displayText = cleanOptText(opt.option_text || '');

            return (
              <div 
                key={opt.id}
                className={`taking-option-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectOption(question?.id, opt.option_label)}
              >
                <div className="taking-option-label">{opt.option_label}</div>
                <div style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{displayText}</div>
                {opt.option_image_url && (
                  <img 
                    src={opt.option_image_url} 
                    alt={`Option ${opt.option_label}`} 
                    style={{ maxWidth: '80px', maxHeight: '50px', marginLeft: 'auto', borderRadius: '4px' }} 
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
