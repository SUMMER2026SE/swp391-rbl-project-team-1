import React, { useState } from 'react';
import { 
  HiSearch, 
  HiCheck, 
  HiX, 
  HiCheckCircle, 
  HiOutlineExclamation, 
  HiLightBulb,
  HiSparkles,
  HiChevronDown,
  HiChevronUp,
  HiRefresh
} from 'react-icons/hi';
import { renderLatexToHtml } from './QuestionCard';
import { mockExamService } from '../../services/mockExamService';
import { toast } from '../../utils/toast';
import { resolveUploadUrl } from '../../utils/courseMapper';

export default function ExamReviewList({ questions = [], userAnswers = {}, subject = 'Toán học', navigateTo }) {
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);
  const [loadingTopicId, setLoadingTopicId] = useState(null);

  const getQuestionStatus = (q) => {
    const qType = (q.type || 'MULTIPLE_CHOICE').toUpperCase();
    const qOptions = q.options || [];

    const rawSelected = userAnswers[q.id] !== undefined 
      ? userAnswers[q.id] 
      : (userAnswers[q.question_id] !== undefined 
          ? userAnswers[q.question_id] 
          : (userAnswers[q.questionId] !== undefined ? userAnswers[q.questionId] : (q.selectedAnswer || q.userAnswer)));

    let rawCorrect = q.correct_answer || q.correctAnswer;
    if (!rawCorrect && qOptions.length > 0) {
      const correctOpt = qOptions.find(o => o.is_correct === true || o.isCorrect === true);
      if (correctOpt) {
        rawCorrect = correctOpt.option_label || correctOpt.optionLabel || correctOpt.label || correctOpt.option_text || correctOpt.text;
      }
    }

    let selectedValue = rawSelected;
    let selectedTfMap = {};
    if (typeof rawSelected === 'object' && rawSelected !== null) {
      selectedTfMap = rawSelected;
      selectedValue = JSON.stringify(rawSelected);
    } else if (typeof rawSelected === 'string' && rawSelected.startsWith('{')) {
      try {
        selectedTfMap = JSON.parse(rawSelected);
      } catch (_) {}
    } else if (typeof rawSelected === 'string' && rawSelected.includes(':')) {
      rawSelected.split(',').forEach(part => {
        const [k, v] = part.split(':').map(s => s.trim());
        if (k && v) selectedTfMap[k.toLowerCase()] = v;
      });
    }

    const selectedLabel = typeof selectedValue === 'string' ? selectedValue.trim() : String(selectedValue || '').trim();
    const correctLabel = typeof rawCorrect === 'string' ? rawCorrect.trim() : String(rawCorrect || '').trim();

    const isBlank = !selectedLabel || (Object.keys(selectedTfMap).length === 0 && (qType === 'TRUE_FALSE' || qType === 'TF'));

    let isCorrect = false;

    if (!isBlank) {
      if (qType === 'SHORT_ANSWER' || qType === 'FILL_IN' || qType === 'ESSAY' || qType === 'SHORT') {
        const normUser = selectedLabel.toLowerCase().replace(/\s+/g, ' ').replace(',', '.');
        const normCorrect = correctLabel.toLowerCase().replace(/\s+/g, ' ').replace(',', '.');
        isCorrect = Boolean(normCorrect) && normUser === normCorrect;
      } else if (qType === 'TRUE_FALSE' || qType === 'TF') {
        let allSubCorrect = true;
        let checkedCount = 0;
        for (const opt of qOptions) {
          const label = (opt.option_label || opt.optionLabel || opt.label || '').toLowerCase();
          const userChoice = (selectedTfMap[label] || selectedTfMap[label.toUpperCase()] || '').trim().toLowerCase();
          
          const optText = (opt.option_text || opt.text || '').trim().toLowerCase();
          let expectedBool = opt.is_correct === true || opt.isCorrect === true;
          if (optText.includes('đúng') || optText === 'true') expectedBool = true;
          if (optText.includes('sai') || optText === 'false') expectedBool = false;

          const userBool = userChoice.includes('đúng') || userChoice === 'true';

          if (!userChoice || userBool !== expectedBool) {
            allSubCorrect = false;
            break;
          }
          checkedCount++;
        }
        isCorrect = allSubCorrect && checkedCount > 0;
      } else {
        isCorrect = selectedLabel.toUpperCase() === correctLabel.toUpperCase();
      }
    }

    const isIncorrect = !isBlank && !isCorrect;

    return { qType, isCorrect, isIncorrect, isBlank, correctLabel, selectedLabel, selectedTfMap };
  };

  const displayedQuestions = questions.filter(q => {
    if (!showIncorrectOnly) return true;
    return getQuestionStatus(q).isIncorrect;
  });

  const handleLuyenChuDe = async (q) => {
    const topicName = q.topic || 'Chủ đề ôn tập';
    setLoadingTopicId(q.id);
    try {
      toast(`Đang lấy bộ đề dưới 15 câu cho chủ đề "${topicName}"...`, 'info');
      const retakeData = await mockExamService.createTopicPracticeExam(topicName, q.exam_id);
      if (retakeData && retakeData.questions && retakeData.questions.length > 0) {
        if (navigateTo) {
          navigateTo(`/mock-exams/${q.exam_id || 211}/start`, {
            retakeMode: 'topic_practice',
            retakeData
          });
        }
      } else {
        toast('Không tìm thấy câu hỏi ôn tập cho chủ đề này trong ngân hàng đề!', 'warning');
      }
    } catch (err) {
      console.error('Lỗi tạo đề luyện chủ đề:', err);
      toast('Không thể khởi tạo bộ đề luyện chủ đề. Vui lòng thử lại!', 'error');
    } finally {
      setLoadingTopicId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HiSearch style={{ color: 'var(--exams-purple)' }} /> XEM LẠI BÀI LÀM CHI TIẾT
        </h3>
        
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: showIncorrectOnly ? 'var(--exams-red)' : 'var(--text-secondary)', background: showIncorrectOnly ? 'rgba(214, 48, 49, 0.08)' : 'var(--bg-main)', border: showIncorrectOnly ? '1.5px solid var(--exams-red)' : '1.5px solid var(--border)', padding: '6px 12px', borderRadius: '10px', transition: 'all 0.2s' }}>
          <input 
            type="checkbox" 
            checked={showIncorrectOnly}
            onChange={(e) => setShowIncorrectOnly(e.target.checked)}
            style={{ accentColor: 'var(--exams-red)', width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <span>⚠️ Chỉ hiển thị câu làm sai</span>
        </label>
      </div>

      {displayedQuestions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
          <span style={{ fontSize: '32px' }}>🎉</span>
          <p style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 'bold' }}>
            Không có câu hỏi làm sai nào! Tất cả các câu đều đạt kết quả chính xác.
          </p>
        </div>
      ) : (
        displayedQuestions.map((q) => {
          const { qType, isCorrect, isIncorrect, isBlank, correctLabel, selectedLabel, selectedTfMap } = getQuestionStatus(q);

          return (
            <div 
              key={q.id}
              style={{
                background: 'var(--bg-card, #ffffff)',
                border: `1.5px solid ${isCorrect ? 'rgba(0, 184, 148, 0.3)' : (isBlank ? 'var(--border)' : 'rgba(214, 48, 49, 0.3)')}`,
                borderRadius: '12px',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--exams-purple)' }}>
                  Câu {q.question_number}
                </strong>
                <span 
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 'bold',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: isCorrect ? 'rgba(0, 184, 148, 0.12)' : (isBlank ? 'var(--bg-main)' : 'rgba(214, 48, 49, 0.12)'),
                    color: isCorrect ? 'var(--exams-green)' : (isBlank ? 'var(--text-secondary)' : 'var(--exams-red)'),
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isCorrect ? <><HiCheck /> ĐÚNG</> : (isBlank ? 'CHƯA TRẢ LỜI' : <><HiX /> SAI</>)}
                </span>
              </div>

              {q.question_text && (
                <div 
                  style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: q.imageUrl || q.question_image_url ? '12px' : '16px', lineHeight: 1.6, fontWeight: '500' }}
                  dangerouslySetInnerHTML={{ __html: renderLatexToHtml(q.question_text) }}
                />
              )}

              {(q.imageUrl || q.question_image_url) && (
                <div style={{ margin: '12px 0 16px', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                  <img 
                    src={resolveUploadUrl(q.imageUrl || q.question_image_url)} 
                    alt={`Crop câu hỏi ${q.question_number}`} 
                    style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} 
                  />
                </div>
              )}

              {q.audio_url && (
                <div 
                  style={{ 
                    marginBottom: '16px', 
                    padding: '10px 14px', 
                    background: 'var(--bg-main)', 
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🔊 Nghe học phần:
                  </span>
                  <audio src={q.audio_url} controls style={{ width: '100%', outline: 'none' }} />
                </div>
              )}

              {/* 1. SHORT_ANSWER / FILL_IN / ESSAY UI */}
              {(qType === 'SHORT_ANSWER' || qType === 'FILL_IN' || qType === 'ESSAY' || qType === 'SHORT') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px 16px', borderRadius: '10px', background: isCorrect ? 'rgba(0, 184, 148, 0.08)' : (isBlank ? 'var(--bg-main)' : 'rgba(214, 48, 49, 0.08)'), border: `1.5px solid ${isCorrect ? 'var(--exams-green)' : (isBlank ? 'var(--border)' : 'var(--exams-red)')}` }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      ✍️ Câu trả lời của bạn:
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: isCorrect ? 'var(--exams-green)' : (isBlank ? 'var(--text-secondary)' : 'var(--exams-red)') }}>
                      {isBlank ? '(Chưa nhập câu trả lời)' : selectedLabel}
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(0, 184, 148, 0.08)', border: '1.5px solid var(--exams-green)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--exams-green)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HiCheckCircle /> Đáp án đúng chuẩn của đề thi:
                    </div>
                    <div 
                      style={{ fontSize: '14px', fontWeight: '900', color: 'var(--exams-green)' }}
                      dangerouslySetInnerHTML={{ __html: renderLatexToHtml(correctLabel || 'Chưa cập nhật') }}
                    />
                  </div>
                </div>
              )}

              {/* 2. TRUE_FALSE UI */}
              {(qType === 'TRUE_FALSE' || qType === 'TF') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {(q.options || []).map((opt) => {
                    const label = String(opt.option_label || opt.optionLabel || opt.label || '').trim().toLowerCase();
                    const userChoice = (selectedTfMap[label] || selectedTfMap[label.toUpperCase()] || '').trim();
                    
                    const optText = (opt.option_text || opt.text || '').trim().toLowerCase();
                    let expectedStr = 'Đúng';
                    if (opt.is_correct === false || opt.isCorrect === false || optText.includes('sai') || optText === 'false') {
                      expectedStr = 'Sai';
                    }

                    const isSubCorrect = userChoice && userChoice.toLowerCase() === expectedStr.toLowerCase();

                    return (
                      <div key={opt.id || label} style={{ padding: '10px 14px', borderRadius: '10px', border: `1px solid ${isSubCorrect ? 'var(--exams-green)' : (userChoice ? 'var(--exams-red)' : 'var(--border)')}`, background: isSubCorrect ? 'rgba(0, 184, 148, 0.06)' : (userChoice ? 'rgba(214, 48, 49, 0.06)' : 'transparent'), display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ flex: 1, minWidth: '200px', fontSize: '13px' }}>
                          <strong style={{ color: 'var(--exams-purple)', marginRight: '6px' }}>{opt.option_label || opt.label})</strong>
                          <span dangerouslySetInnerHTML={{ __html: renderLatexToHtml(opt.option_text || opt.text || '') }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                          <span>Lựa chọn của bạn: <strong style={{ color: isSubCorrect ? 'var(--exams-green)' : (userChoice ? 'var(--exams-red)' : 'var(--text-secondary)') }}>{userChoice || '(Bỏ trống)'}</strong></span>
                          <span style={{ color: 'var(--exams-green)', background: 'rgba(0, 184, 148, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>✓ Đáp án đúng: {expectedStr}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. MULTIPLE_CHOICE UI */}
              {qType !== 'SHORT_ANSWER' && qType !== 'FILL_IN' && qType !== 'ESSAY' && qType !== 'SHORT' && qType !== 'TRUE_FALSE' && qType !== 'TF' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {(q.options || []).map((opt) => {
                    const optLabel = String(opt.option_label || opt.optionLabel || opt.label || '').trim().toUpperCase();
                    const isCorrectOpt = opt.is_correct === true || opt.isCorrect === true || (Boolean(correctLabel) && optLabel === correctLabel);
                    const isSelectedOpt = Boolean(selectedLabel && optLabel === selectedLabel);

                    let optionBg = 'transparent';
                    let optionBorder = 'var(--border)';
                    let showStatus = false;
                    let isOptCorrect = false;

                    if (isCorrectOpt) {
                      optionBg = 'rgba(0, 184, 148, 0.08)';
                      optionBorder = 'var(--exams-green)';
                      showStatus = true;
                      isOptCorrect = true;
                    } else if (isSelectedOpt && !isCorrectOpt) {
                      optionBg = 'rgba(214, 48, 49, 0.08)';
                      optionBorder = 'var(--exams-red)';
                      showStatus = true;
                      isOptCorrect = false;
                    }

                    return (
                      <div 
                        key={opt.id || optLabel}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: `1px solid ${optionBorder}`,
                          background: optionBg,
                          fontSize: '13px'
                        }}
                      >
                        <span 
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: isCorrectOpt ? 'var(--exams-green)' : (isSelectedOpt ? 'var(--exams-red)' : 'var(--bg-main)'),
                            color: (isCorrectOpt || isSelectedOpt) ? '#fff' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '11px',
                            flexShrink: 0
                          }}
                        >
                          {opt.option_label || opt.label || optLabel}
                        </span>
                        <span 
                          style={{ color: 'var(--text-primary)', flex: 1 }}
                          dangerouslySetInnerHTML={{ __html: renderLatexToHtml(opt.option_text ?? opt.content ?? opt.text ?? opt.value ?? '') }}
                        />
                        {showStatus && (
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: 'bold', 
                            color: isOptCorrect ? 'var(--exams-green)' : 'var(--exams-red)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}>
                            {isOptCorrect ? (
                              <><HiCheckCircle /> (Đáp án đúng)</>
                            ) : (
                              <><HiOutlineExclamation /> (Lựa chọn của bạn)</>
                            )}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {(q.explanation || q.topic) && (
                <div style={{ background: 'var(--bg-main)', borderRadius: '8px', padding: '12px 14px', borderLeft: '3px solid var(--exams-purple)', fontSize: '12.5px' }}>
                  {q.explanation && (
                    <div>
                      <span style={{ fontWeight: 'bold', color: 'var(--exams-purple)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <HiLightBulb /> Hướng dẫn giải chi tiết:
                      </span>
                      <p 
                        style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}
                        dangerouslySetInnerHTML={{ __html: renderLatexToHtml(q.explanation) }}
                      />
                    </div>
                  )}
                  {q.topic && (
                    <span style={{ display: 'inline-block', marginTop: '8px', fontSize: '11px', background: 'var(--exams-purple-bg)', color: 'var(--exams-purple)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      Chủ đề: {q.topic}
                    </span>
                  )}
                </div>
              )}

              <div style={{ marginTop: '14px' }}>
                <button
                  onClick={() => handleLuyenChuDe(q)}
                  disabled={loadingTopicId === q.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #6c5ce7 0%, #4f46e5 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px 18px',
                    fontSize: '12.5px',
                    fontWeight: 'bold',
                    cursor: loadingTopicId === q.id ? 'wait' : 'pointer',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                    opacity: loadingTopicId === q.id ? 0.7 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; }}
                >
                  <HiSparkles /> 🎯 {loadingTopicId === q.id ? 'Đang tạo bộ đề luyện...' : `Luyện chủ đề tương tự (${q.topic || 'Chủ đề này'})`} ⚡
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
