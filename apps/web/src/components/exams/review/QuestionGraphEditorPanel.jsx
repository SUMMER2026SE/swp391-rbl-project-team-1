import React, { useState } from 'react';
import { 
  HiSparkles, 
  HiScissors, 
  HiDocumentDuplicate, 
  HiTrash, 
  HiExclamationCircle, 
  HiCheckCircle,
  HiSearch,
  HiEye,
  HiPencilAlt
} from 'react-icons/hi';
import QuestionCard from '../../mock-exams/QuestionCard';

export default function QuestionGraphEditorPanel({
  questions = [],
  activeQuestion,
  onSelectQuestion,
  onUpdateQuestion,
  onMergeQuestions,
  onSplitQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  onConfirmPublish,
  validationErrors = [],
  blockMap = {},
  isStudentPreview,
  onTogglePreview
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return url;
  };

  // Filtered Questions
  const filteredQuestions = questions.filter(q => {
    const textMatch = !searchTerm || 
      String(q.questionOrder).includes(searchTerm) || 
      q.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = filterType === 'ALL' || q.type === filterType;
    const diffMatch = filterDifficulty === 'ALL' || q.difficulty === filterDifficulty;
    return textMatch && typeMatch && diffMatch;
  });

  const sections = Array.from(new Set(questions.map(q => q.section || 'PHẦN I')));

  // Adapt activeQuestion into Student QuestionCard format for 100% Student Preview
  const mappedStudentQuestion = activeQuestion ? {
    id: String(activeQuestion.id),
    question_number: activeQuestion.questionOrder,
    question_text: activeQuestion.content,
    question_image_url: getFullUrl(activeQuestion.imageUrl || activeQuestion.media?.imageUrl),
    question_type: activeQuestion.type === 'ESSAY' ? 'essay' : 'multiple_choice_single',
    difficulty: activeQuestion.difficulty === 'EASY' ? 'Dễ' : activeQuestion.difficulty === 'HARD' ? 'Khó' : 'Trung bình',
    explanation: activeQuestion.explanation || '',
    topic: activeQuestion.regions?.topic || 'Kiến thức cốt lõi'
  } : null;

  const mappedStudentOptions = (activeQuestion?.options || []).map((opt) => ({
    id: `opt-${activeQuestion?.id}-${opt.label}`,
    question_id: String(activeQuestion?.id),
    option_label: opt.label,
    option_text: opt.text || opt.content,
    is_correct: opt.label === activeQuestion?.correctAnswer
  }));

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 text-slate-800">
      {/* Panel Top Header Bar */}
      <div className="h-12 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
            Question Graph Editor
          </h3>
        </div>

        {/* Mode Toggle Button: Edit <-> Preview */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePreview}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              isStudentPreview 
                ? 'bg-emerald-600 text-white shadow' 
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            {isStudentPreview ? <HiEye className="w-3.5 h-3.5" /> : <HiPencilAlt className="w-3.5 h-3.5" />}
            {isStudentPreview ? 'Student Preview Mode' : 'Edit Mode'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Search & Filtering Bar */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <div className="relative">
            <HiSearch className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm câu hỏi, từ khóa, Block ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-300 rounded-lg font-medium"
            >
              <option value="ALL">Tất cả dạng bài</option>
              <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
              <option value="TRUE_FALSE">Đúng / Sai</option>
              <option value="SHORT_ANSWER">Trả lời ngắn</option>
              <option value="ESSAY">Tự luận</option>
            </select>

            <select 
              value={filterDifficulty} 
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-300 rounded-lg font-medium"
            >
              <option value="ALL">Tất cả độ khó</option>
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option>
            </select>
          </div>
        </div>

        {/* Validation Panel Alerts */}
        {validationErrors.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs space-y-1">
            <div className="font-bold text-amber-800 flex items-center gap-1.5">
              <HiExclamationCircle className="w-4 h-4 text-amber-600" />
              <span>BẢNG CẢNH BÁO KIỂM DUYỆT ({validationErrors.length})</span>
            </div>
            <ul className="list-disc list-inside text-amber-700 space-y-0.5 pl-1">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Mode 1: Student Preview Mode */}
        {isStudentPreview ? (
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Hiển thị Khớp 100% Giao Diện Học Sinh</span>
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono">Live Student Renderer</span>
            </div>
            {mappedStudentQuestion ? (
              <QuestionCard 
                question={mappedStudentQuestion}
                options={mappedStudentOptions}
                selectedOptionLabel={activeQuestion?.correctAnswer}
                onSelectOption={() => {}}
                isBookmarked={false}
                onBookmarkToggle={() => {}}
                essayAnswer=""
                onChangeEssayAnswer={() => {}}
              />
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Chọn một câu hỏi để xem trước giao diện học sinh.
              </div>
            )}
          </div>
        ) : (
          /* Mode 2: Question Editor Mode */
          <div className="space-y-4">
            {sections.map(secName => {
              const secQuestions = filteredQuestions.filter(q => (q.section || 'PHẦN I') === secName);
              if (secQuestions.length === 0) return null;

              return (
                <div key={secName} className="space-y-2">
                  <div className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold uppercase rounded-lg border border-slate-200">
                    {secName} ({secQuestions.length} câu)
                  </div>

                  {secQuestions.map((q) => {
                    const isSelected = activeQuestion?.id === q.id;
                    const regions = q.regions || {};

                    return (
                      <div 
                        key={q.id}
                        onClick={() => onSelectQuestion(q.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-1 ring-indigo-500' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {/* Question Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                              {q.questionOrder}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              Câu {q.questionOrder}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px]">
                            <select 
                              value={q.difficulty || 'MEDIUM'}
                              onChange={(e) => onUpdateQuestion(q.id, { difficulty: e.target.value })}
                              className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-semibold text-slate-700"
                            >
                              <option value="EASY">Dễ</option>
                              <option value="MEDIUM">Trung bình</option>
                              <option value="HARD">Khó</option>
                            </select>

                            <select 
                              value={q.type || 'MULTIPLE_CHOICE'}
                              onChange={(e) => onUpdateQuestion(q.id, { type: e.target.value })}
                              className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-semibold text-slate-700"
                            >
                              <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                              <option value="TRUE_FALSE">Đúng/Sai</option>
                              <option value="SHORT_ANSWER">Trả lời ngắn</option>
                              <option value="ESSAY">Tự luận</option>
                            </select>
                          </div>
                        </div>

                        {/* Question Text Editor */}
                        <textarea
                          value={q.content || ''}
                          onChange={(e) => onUpdateQuestion(q.id, { content: e.target.value })}
                          rows={3}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-sans outline-none focus:border-indigo-500"
                        />

                        {/* Options Editor for Multiple Choice */}
                        {q.type === 'MULTIPLE_CHOICE' && (
                          <div className="mt-2.5 space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            <span className="text-[11px] font-bold text-slate-600 block mb-1">Phương án lựa chọn:</span>
                            {(q.options || []).map((opt, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                <input 
                                  type="radio" 
                                  name={`correct_${q.id}`}
                                  checked={(q.correctAnswer || '').toUpperCase() === (opt.label || '').toUpperCase()}
                                  onChange={() => onUpdateQuestion(q.id, { correctAnswer: opt.label })}
                                  className="accent-emerald-600"
                                />
                                <span className="font-bold w-4 text-slate-700">{opt.label}.</span>
                                <input 
                                  type="text"
                                  value={opt.text || opt.content || ''}
                                  onChange={(e) => {
                                    const newOpts = [...(q.options || [])];
                                    newOpts[idx] = { ...opt, text: e.target.value };
                                    onUpdateQuestion(q.id, { options: newOpts });
                                  }}
                                  className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Mapped Block IDs Display */}
                        <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-1 text-[10px]">
                          <span className="font-bold text-slate-500 mr-1">Block IDs:</span>
                          {(regions.questionBlocks || []).map((id) => (
                            <span key={id} className="bg-blue-100 text-blue-800 font-mono font-bold px-1.5 py-0.5 rounded">
                              {id}
                            </span>
                          ))}
                          {(regions.imageBlocks || []).map((id) => (
                            <span key={id} className="bg-orange-100 text-orange-800 font-mono font-bold px-1.5 py-0.5 rounded">
                              📷 {id}
                            </span>
                          ))}
                          {(regions.formulaBlocks || []).map((id) => (
                            <span key={id} className="bg-purple-100 text-purple-800 font-mono font-bold px-1.5 py-0.5 rounded">
                              ∑ {id}
                            </span>
                          ))}
                        </div>

                        {/* Operations Toolbar */}
                        {isSelected && (
                          <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); onDuplicateQuestion(q.id); }}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1 font-semibold"
                                title="Nhân bản câu hỏi"
                              >
                                <HiDocumentDuplicate className="w-3.5 h-3.5" /> Bản sao
                              </button>

                              <button
                                onClick={(e) => { e.stopPropagation(); onSplitQuestion(q.id); }}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded flex items-center gap-1 font-semibold"
                                title="Tách câu hỏi"
                              >
                                <HiScissors className="w-3.5 h-3.5" /> Tách câu
                              </button>
                            </div>

                            <button
                              onClick={(e) => { e.stopPropagation(); onDeleteQuestion(q.id); }}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded flex items-center gap-1 font-semibold border border-red-200"
                              title="Xóa câu hỏi"
                            >
                              <HiTrash className="w-3.5 h-3.5" /> Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Publish Footer Bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-600">
          Tổng số: <strong className="text-slate-900">{questions.length} câu hỏi</strong>
        </span>

        <button
          onClick={onConfirmPublish}
          disabled={validationErrors.length > 0}
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-md disabled:opacity-40 transition-all"
        >
          ✓ Xuất bản vào Ngân hàng Cấu hỏi
        </button>
      </div>
    </div>
  );
}
