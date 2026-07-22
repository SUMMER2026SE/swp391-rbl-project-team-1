import React, { useState, useEffect, useRef } from 'react';
import { HiBookmark } from 'react-icons/hi';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const getFullImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const cleanPath = url.replace(/^\/+/, '');
  return `http://localhost:4000/${cleanPath}`;
};

export function renderLatexToHtml(text) {
  if (!text) return '';
  let str = String(text).trim();

  // 1. Unwrap dollar-wrapped plain numbers & percentages (e.g. $10000$ -> 10000, $0,9$ -> 0,9)
  str = str.replace(/\$(\d+(?:[.,]\d+)?\%?)\$/g, '$1');

  // 2. Fix accidental double $$
  str = str.replace(/\$\$/g, '$');

  // 3. Auto-wrap unwrapped TeX commands (like \overrightarrow{...}, \frac{...}{...}, \begin{array}, \neq) in $...$
  const hasTexCommand = /\\(overrightarrow|cdot|frac|neq|log|sqrt|vec|int|alpha|beta|gamma|theta|pi|infty|begin|cline|matrix|array|text)/i.test(str);
  if (hasTexCommand && !str.includes('$')) {
    str = `$$${str}$$`;
  }

  // 4. Synchronously replace $...$ and $$...$$ with KaTeX HTML!
  return str.replace(/(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g, (match) => {
    const isDisplay = match.startsWith('$$') && match.endsWith('$$');
    const mathContent = isDisplay ? match.slice(2, -2) : match.slice(1, -1);
    try {
      return katex.renderToString(mathContent, {
        displayMode: isDisplay,
        throwOnError: false
      });
    } catch (e) {
      return match;
    }
  });
}

const MathContent = React.memo(({ html, style, className }) => {
  const renderedHtml = React.useMemo(() => {
    return renderLatexToHtml(html);
  }, [html]);

  return (
    <div 
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
});

function QuestionCard({ 
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

    // 1. Unwrap dollar-wrapped plain numbers & percentages (e.g. $10000$ -> 10000, $0,9$ -> 0,9) to prevent LaTeX flickering
    cleaned = cleaned.replace(/\$(\d+(?:[.,]\d+)?\%?)\$/g, '$1');

    // 2. Replace Datalab Markdown image tags ![Alt](image.jpg) with formatted images using full backend URLs
    cleaned = cleaned.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      const fullSrc = getFullImageUrl(src);
      return `<div style="text-align:center;margin:12px 0;"><img src="${fullSrc}" alt="${alt}" style="max-width:100%;max-height:380px;border-radius:8px;border:1px solid var(--border);box-shadow:0 4px 12px rgba(0,0,0,0.06);" /></div>`;
    });

    // 3. Remove leaked raw English image alt descriptions wrapped in $...$
    cleaned = cleaned.replace(/\$(The [x-z]-axis is along[^\$]+)\$/gi, '');

    return cleaned;
  };

  const cleanOptText = (txt) => {
    if (!txt) return '';
    let cleaned = txt.replace(/\$?The [x-z]-axis is along[^\$]*\$?/gi, '').trim();
    cleaned = cleaned.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '').trim();
    cleaned = cleaned.replace(/\$(\d+(?:[.,]\d+)?\%?)\$/g, '$1').trim();
    return cleaned || txt;
  };

  const formattedQuestionText = formatText(question?.question_text || question?.content || '');
  const mainImgUrl = getFullImageUrl(question?.question_image_url || question?.imageUrl);

  return (
    <div className="taking-question-card animate-in">
      <div className="taking-question-header">
        <span className="taking-question-number">Câu {question?.question_number}</span>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {question?.topic && (
            <span 
              style={{ 
                background: 'rgba(99, 102, 241, 0.08)', 
                color: '#4f46e5', 
                border: '1px solid rgba(99, 102, 241, 0.2)', 
                padding: '3px 10px', 
                borderRadius: '12px', 
                fontSize: '11px', 
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              🎯 {question.topic}
            </span>
          )}
          <span className="badge-pill" style={{ background: 'var(--bg-main)', color: 'var(--text-secondary)', fontSize: '11px' }}>
            {question?.difficulty}
          </span>
        </div>
      </div>

      {/* Question Text (if available) */}
      {formattedQuestionText && (
        <MathContent 
          className="taking-question-text"
          style={{ marginBottom: mainImgUrl ? '16px' : 0, fontSize: '14.5px', lineHeight: '1.7', whiteSpace: 'pre-line' }}
          html={formattedQuestionText}
        />
      )}

      {/* Main question image if available */}
      {mainImgUrl && (
        <div style={{ margin: '16px 0', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
          <img 
            src={mainImgUrl} 
            alt={`Ảnh câu hỏi ${question.question_number}`} 
            style={{ maxWidth: '100%', maxHeight: '480px', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} 
          />
        </div>
      )}

      {/* Render based on Question Type */}
      {(() => {
        const getNormalizedType = (type) => {
          if (!type) return 'MULTIPLE_CHOICE';
          const t = String(type).toUpperCase();
          if (t.includes('TRUE') || t.includes('ĐÚNG')) return 'TRUE_FALSE';
          if (t.includes('SHORT') || t.includes('SHORT_ANSWER') || t.includes('TRẢ LỜI NGẮN') || t.includes('ĐIỀN')) return 'SHORT_ANSWER';
          if (t.includes('ESSAY') || t.includes('TỰ LUẬN')) return 'ESSAY';
          if (t === 'MULTIPLE_SELECT' || t === 'MULTI_SELECT' || t.includes('CHỌN NHIỀU')) return 'MULTIPLE_SELECT';
          return 'MULTIPLE_CHOICE';
        };

        let qType = getNormalizedType(question?.type || question?.question_type);
        if ((qType === 'MULTIPLE_CHOICE' || qType === 'MULTIPLE_SELECT') && (!options || options.length === 0)) {
          qType = 'SHORT_ANSWER';
        }

        if (qType === 'ESSAY') {
          return (
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>
                📝 BÀI LÀM TỰ LUẬN CỦA BẠN:
              </label>
              <textarea
                className="form-control"
                rows="6"
                placeholder="Viết bài phân tích hoặc câu trả lời tự luận trực tiếp tại đây..."
                value={essayAnswer || selectedOptionLabel || ''}
                onChange={(e) => {
                  if (onChangeEssayAnswer) onChangeEssayAnswer(question.id, e.target.value);
                  onSelectOption(question?.id, e.target.value);
                }}
                style={{ width: '100%', padding: '12px', fontSize: '13.5px', borderRadius: '8px', outline: 'none' }}
              />
            </div>
          );
        }

        if (qType === 'SHORT_ANSWER') {
          return (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ✍️ NHẬP ĐÁP ÁN CỦA BẠN (ĐIỀN SỐ HOẶC CHUỖI NGẮN):
              </label>
              <input 
                type="text"
                placeholder="Nhập kết quả (Ví dụ: 15, -2.5, 0.5)..."
                value={selectedOptionLabel || essayAnswer || ''}
                onChange={(e) => {
                  onSelectOption(question?.id, e.target.value);
                  if (onChangeEssayAnswer) onChangeEssayAnswer(question?.id, e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '2px solid #6366f1',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#1e1b4b',
                  background: '#f5f3ff',
                  outline: 'none',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)'
                }}
              />
            </div>
          );
        }

        if (qType === 'TRUE_FALSE') {
          const activeOpts = Array.isArray(options) && options.length > 0
            ? options
            : [ { label: 'a', content: 'Mệnh đề a' }, { label: 'b', content: 'Mệnh đề b' }, { label: 'c', content: 'Mệnh đề c' }, { label: 'd', content: 'Mệnh đề d' } ];

          const currentAnswers = (selectedOptionLabel || ',,,').split(',');

          return (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', marginBottom: '4px' }}>
                📌 CHỌN ĐÚNG HOẶC SAI CHO MỖI MỆNH ĐỀ SAU:
              </div>
              {activeOpts.map((opt, idx) => {
                const labelName = opt.option_label || opt.label || String.fromCharCode(97 + idx);
                const rawTxt = opt.option_text || opt.content || opt.text || '';
                const val = currentAnswers[idx] || '';

                const handleChoice = (choiceVal) => {
                  const updated = [...currentAnswers];
                  while (updated.length < 4) updated.push('');
                  updated[idx] = choiceVal;
                  onSelectOption(question?.id, updated.join(','));
                };

                return (
                  <div 
                    key={labelName}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-main)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
                      <span style={{ fontWeight: 800, color: '#4f46e5', marginRight: '6px' }}>{labelName})</span>
                      <span dangerouslySetInnerHTML={{ __html: formatText(rawTxt) }} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handleChoice('Đ')}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 800,
                          border: val === 'Đ' ? 'none' : '1px solid #cbd5e1',
                          background: val === 'Đ' ? '#10b981' : '#ffffff',
                          color: val === 'Đ' ? '#ffffff' : '#64748b',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Đúng
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChoice('S')}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 800,
                          border: val === 'S' ? 'none' : '1px solid #cbd5e1',
                          background: val === 'S' ? '#ef4444' : '#ffffff',
                          color: val === 'S' ? '#ffffff' : '#64748b',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Sai
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }

        if (qType === 'MULTIPLE_SELECT') {
          const currentAnswers = (selectedOptionLabel || '').split(',').filter(Boolean);

          return (
            <div className="taking-options-list">
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#059669', marginBottom: '6px' }}>
                ☑ CÂU HỎI CHỌN NHIỀU ĐÁP ÁN (ẤN ĐỂ CHỌN HOẶC BỎ CHỌN):
              </div>
              {options.map((opt) => {
                const optLabel = opt.option_label || opt.label;
                const isSelected = currentAnswers.includes(optLabel);
                const rawTxt = opt.option_text || opt.content || opt.text || '';
                const displayText = cleanOptText(rawTxt);

                const handleToggleMulti = () => {
                  let updated = [...currentAnswers];
                  if (isSelected) {
                    updated = updated.filter(l => l !== optLabel);
                  } else {
                    updated.push(optLabel);
                  }
                  updated.sort();
                  onSelectOption(question?.id, updated.join(','));
                };

                return (
                  <div 
                    key={opt.id || optLabel}
                    className={`taking-option-item ${isSelected ? 'selected' : ''}`}
                    onClick={handleToggleMulti}
                  >
                    <div className="taking-option-label" style={{ background: isSelected ? '#10b981' : undefined, color: isSelected ? '#ffffff' : undefined }}>
                      {optLabel}
                    </div>
                    <MathContent html={displayText} style={{ fontSize: '13.5px', color: 'var(--text-primary)' }} />
                  </div>
                );
              })}
            </div>
          );
        }

        // Default: MULTIPLE_CHOICE
        return (
          <div className="taking-options-list">
            {options.map((opt) => {
              const isSelected = selectedOptionLabel === (opt.option_label || opt.label);
              const rawTxt = opt.option_text || opt.content || opt.text || '';
              const displayText = cleanOptText(rawTxt);

              return (
                <div 
                  key={opt.id || opt.option_label || opt.label}
                  className={`taking-option-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectOption(question?.id, opt.option_label || opt.label)}
                >
                  <div className="taking-option-label">{opt.option_label || opt.label}</div>
                  <MathContent html={displayText} style={{ fontSize: '13.5px', color: 'var(--text-primary)' }} />
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
        );
      })()}
    </div>
  );
}

export default React.memo(QuestionCard);
