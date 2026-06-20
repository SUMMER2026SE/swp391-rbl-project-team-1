import React, { useState } from 'react';
import { HiCheckCircle, HiXCircle, HiArrowRight, HiRefresh, HiClipboardList } from 'react-icons/hi';

export default function ExerciseTab({
  exercises = [],
  onCompleteExercise
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIndex: selectedOptionIndex }
  const [submittedAnswers, setSubmittedAnswers] = useState({}); // { questionIndex: boolean } (true if checked)
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!exercises || exercises.length === 0) {
    return (
      <div className="exercise-tab__empty">
        <HiClipboardList className="empty-icon" />
        <p>Không có bài tập trắc nghiệm nào cho bài học này.</p>
      </div>
    );
  }

  const currentQuestion = exercises[currentQuestionIndex];
  const totalQuestions = exercises.length;
  
  const handleSelectOption = (optIdx) => {
    if (submittedAnswers[currentQuestionIndex] !== undefined) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optIdx
    }));
  };

  const handleSubmitAnswer = () => {
    const selected = selectedAnswers[currentQuestionIndex];
    if (selected === undefined) return;

    const isCorrect = selected === currentQuestion.correctOptionIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setSubmittedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: true
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
      if (onCompleteExercise) {
        // Report final percentage score
        onCompleteExercise(Math.round((score / totalQuestions) * 100));
      }
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setScore(0);
    setQuizFinished(false);
  };

  if (quizFinished) {
    const percent = Math.round((score / totalQuestions) * 100);
    const passThreshold = 80;
    const isPassed = percent >= passThreshold;

    return (
      <div className="quiz-result-container animate-in">
        <div className="quiz-result-card">
          <div className={`quiz-result-badge ${isPassed ? 'passed' : 'failed'}`}>
            {isPassed ? <HiCheckCircle className="badge-icon" /> : <HiXCircle className="badge-icon" />}
            <h3>{isPassed ? 'Hoàn thành Xuất sắc!' : 'Hãy Thử Lại nhé!'}</h3>
          </div>

          <div className="score-display">
            <span className="score-number">{score}</span>
            <span className="score-divider">/</span>
            <span className="score-total">{totalQuestions}</span>
          </div>
          
          <p className="score-percent">Tỷ lệ chính xác: {percent}%</p>
          <p className="score-message">
            {isPassed 
              ? 'Tuyệt vời! Em đã nắm rất vững kiến thức của bài học này.' 
              : `Yêu cầu đạt tối thiểu ${passThreshold}% để vượt qua bài kiểm tra.`}
          </p>

          <div className="quiz-result-actions">
            <button type="button" onClick={handleReset} className="btn-retry">
              <HiRefresh /> Làm lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedOpt = selectedAnswers[currentQuestionIndex];
  const isSubmitted = submittedAnswers[currentQuestionIndex] !== undefined;
  const correctOpt = currentQuestion.correctOptionIndex;

  return (
    <div className="exercise-tab animate-in">
      <div className="quiz-header">
        <span className="quiz-progress-text">Câu hỏi {currentQuestionIndex + 1} / {totalQuestions}</span>
        <div className="quiz-progress-bar-wrapper">
          <div 
            className="quiz-progress-bar-fill" 
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="quiz-question-card">
        <h4 className="question-text">{currentQuestion.question}</h4>
        
        <div className="quiz-options-list">
          {currentQuestion.options.map((opt, idx) => {
            let stateClass = '';
            if (isSubmitted) {
              if (idx === correctOpt) {
                stateClass = 'option--correct';
              } else if (idx === selectedOpt) {
                stateClass = 'option--incorrect';
              } else {
                stateClass = 'option--disabled';
              }
            } else if (selectedOpt === idx) {
              stateClass = 'option--selected';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(idx)}
                className={`quiz-option-btn ${stateClass}`}
                disabled={isSubmitted}
              >
                <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                <span className="option-content">{opt}</span>
                {isSubmitted && idx === correctOpt && <HiCheckCircle className="option-feedback-icon correct" />}
                {isSubmitted && idx === selectedOpt && idx !== correctOpt && <HiXCircle className="option-feedback-icon incorrect" />}
              </button>
            );
          })}
        </div>

        {isSubmitted && currentQuestion.explanation && (
          <div className="quiz-explanation-panel animate-in">
            <span className="explanation-title">Giải thích đáp án:</span>
            <p className="explanation-content">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="quiz-actions">
          {!isSubmitted ? (
            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={selectedOpt === undefined}
              className="btn-submit-answer"
            >
              Kiểm tra đáp án
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="btn-next-question"
            >
              {currentQuestionIndex === totalQuestions - 1 ? 'Hoàn thành' : 'Câu tiếp theo'} <HiArrowRight />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
