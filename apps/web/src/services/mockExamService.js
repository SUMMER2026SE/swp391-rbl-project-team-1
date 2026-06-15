// Mock Exam Service for Supabase Database and LocalStorage Fallback
import { api } from '../api';
import { getLocalData, setLocalData } from './mockDb';
import { mockExamAiService } from './mockExamAiService';

import toanDemo from '../data/mockExams/toan-2024-demo.json';
import anhDemo from '../data/mockExams/tienganh-2024-demo.json';
import lyDemo from '../data/mockExams/vatly-2024-demo.json';
import hoaDemo from '../data/mockExams/hoahoc-2024-demo.json';

const getSlug = (subject) => {
  if (subject === 'Toán học') return 'toan';
  if (subject === 'Tiếng Anh') return 'anh';
  if (subject === 'Vật lý') return 'ly';
  if (subject === 'Hóa học') return 'hoa';
  return 'toan';
};

const getIcon = (subject) => {
  if (subject === 'Toán học') return '📐';
  if (subject === 'Tiếng Anh') return '🗣️';
  if (subject === 'Vật lý') return '⚛️';
  if (subject === 'Hóa học') return '🧪';
  return '🎯';
};

const getSubjectId = (subject) => {
  if (subject === 'Toán học') return 1;
  if (subject === 'Tiếng Anh') return 2;
  if (subject === 'Vật lý') return 3;
  if (subject === 'Hóa học') return 4;
  return 1;
};

const mapExam = (e) => {
  const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
  const matchedYear = years.find(y => e.title.includes(String(y))) || 2024;
  const matchedCode = e.title.match(/Mã đề (\d+)/)?.[1] || '101';
  const isOfficial = e.title.toLowerCase().includes('chính thức');
  const subjectSlug = getSlug(e.subject);
  const subjectIcon = getIcon(e.subject);
  const subjectId = getSubjectId(e.subject);

  return {
    id: String(e.id),
    subject_id: subjectId,
    title: e.title,
    year: matchedYear,
    exam_code: matchedCode,
    exam_type: isOfficial ? 'official' : 'mock',
    source: isOfficial ? 'Bộ GD&ĐT' : 'Trường chuyên',
    duration_minutes: e.duration,
    total_questions: e.examQuestions?.length || 50,
    description: e.description || `Đề thi ôn luyện môn ${e.subject} thi tốt nghiệp THPT Quốc Gia.`,
    status: 'published',
    exam_subjects: {
      id: subjectId,
      name: e.subject,
      slug: subjectSlug,
      icon: subjectIcon,
      description: `Môn ${e.subject} ôn thi THPT Quốc Gia`
    },
    attempts_count: 0
  };
};

const optionsCache = {};

const mapQuestion = (q, idx, examId) => {
  const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
  
  let diffLabel = 'Trung bình';
  if (q.difficulty === 'EASY') diffLabel = 'Dễ';
  else if (q.difficulty === 'HARD') diffLabel = 'Khó';

  // Cache options for separate queries
  const mappedOptions = (options || []).map((opt, optIdx) => ({
    id: `opt-${q.id}-${opt.label}`,
    question_id: String(q.id),
    option_label: opt.label,
    option_text: opt.text,
    is_correct: opt.label === q.correctAnswer
  }));

  optionsCache[String(q.id)] = mappedOptions;

  return {
    id: String(q.id),
    exam_id: String(examId),
    question_number: idx + 1,
    question_text: q.content,
    question_image_url: null,
    question_type: 'multiple_choice_single',
    difficulty: diffLabel,
    explanation: q.explanation || '',
    topic: q.topic || 'Kiến thức cốt lõi'
  };
};

// ── Local Storage Database Initialization (Fallback Mode) ──
function mutateQuestionForYear(question, slug, year) {
  const q = JSON.parse(JSON.stringify(question));
  if (year === 2024) return q;

  const offset = year % 10;
  
  if (slug === 'toan') {
    if (q.question_number === 2) {
      const B = (3 * (offset + 1));
      const h = (offset + 2);
      const vol = (B * h) / 3;
      q.question_text = `Cho khối chóp có diện tích đáy $B = ${B}a^2$ và chiều cao $h = ${h}a$. Thể tích của khối chóp đã cho bằng:`;
      q.options[0].option_text = `${vol}a^3`;
      q.options[1].option_text = `${vol * 2}a^3`;
      q.options[2].option_text = `${vol / 2}a^3`;
      q.options[3].option_text = `${vol * 1.5}a^3`;
      q.options[0].is_correct = true;
    }
  }
  return q;
}

const initMockExamDb = () => {
  if (!localStorage.getItem('supabase_mock_exam_subjects')) {
    const subjects = [
      { id: 1, name: 'Toán học', slug: 'toan', icon: '📐', description: 'Môn Toán học ôn thi THPT Quốc Gia' },
      { id: 2, name: 'Tiếng Anh', slug: 'anh', icon: '🗣️', description: 'Môn Tiếng Anh ôn thi THPT Quốc Gia' },
      { id: 3, name: 'Vật lý', slug: 'ly', icon: '⚛️', description: 'Môn Vật lý ôn thi THPT Quốc Gia' },
      { id: 4, name: 'Hóa học', slug: 'hoa', icon: '🧪', description: 'Môn Hóa học ôn thi THPT Quốc Gia' }
    ];
    localStorage.setItem('supabase_mock_exam_subjects', JSON.stringify(subjects));
  }
};

initMockExamDb();

export const mockExamService = {
  // ── Retrieve list of mock exams ──
  async getMockExams(filters = {}) {
    try {
      const list = await api.getExams();
      if (list && list.length > 0) {
        let result = list.map(mapExam);

        if (filters.subjectId && filters.subjectId !== 'All') {
          result = result.filter(e => String(e.subject_id) === String(filters.subjectId));
        }
        if (filters.year && filters.year !== 'All') {
          result = result.filter(e => String(e.year) === String(filters.year));
        }
        if (filters.examType && filters.examType !== 'All') {
          result = result.filter(e => e.exam_type === filters.examType);
        }
        if (filters.search) {
          const query = filters.search.toLowerCase();
          result = result.filter(e => e.title.toLowerCase().includes(query) || e.description?.toLowerCase().includes(query));
        }
        return result;
      }
    } catch (err) {
      console.warn('[mockExamService] API getMockExams error, using fallback:', err);
    }

    // Fallback Logic
    const exams = getLocalData('supabase_mock_exams') || [];
    const subjects = getLocalData('supabase_mock_exam_subjects') || [];
    const attempts = getLocalData('supabase_mock_exam_attempts') || [];

    let result = exams.map(exam => {
      const subject = subjects.find(s => s.id === exam.subject_id);
      const examAttempts = attempts.filter(att => att.exam_id === exam.id && att.status === 'completed');
      return {
        ...exam,
        exam_subjects: subject || null,
        attempts_count: examAttempts.length
      };
    });

    if (filters.subjectId && filters.subjectId !== 'All') {
      result = result.filter(e => String(e.subject_id) === String(filters.subjectId));
    }
    if (filters.year && filters.year !== 'All') {
      result = result.filter(e => String(e.year) === String(filters.year));
    }
    if (filters.examType && filters.examType !== 'All') {
      result = result.filter(e => e.exam_type === filters.examType);
    }
    if (filters.search) {
      const query = filters.search.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(query) || e.description?.toLowerCase().includes(query));
    }

    return result;
  },

  // ── Retrieve a single mock exam by ID ──
  async getMockExamById(examId) {
    try {
      const list = await api.getExams();
      if (list && list.length > 0) {
        const exam = list.find(e => String(e.id) === String(examId));
        if (exam) return mapExam(exam);
      }
    } catch (err) {
      console.warn('[mockExamService] API getMockExamById error, using fallback:', err);
    }

    const exams = getLocalData('supabase_mock_exams') || [];
    const subjects = getLocalData('supabase_mock_exam_subjects') || [];
    const exam = exams.find(e => String(e.id) === String(examId));
    if (exam) {
      const subject = subjects.find(s => s.id === exam.subject_id);
      return {
        ...exam,
        exam_subjects: subject || null
      };
    }
    return null;
  },

  // ── Retrieve all questions of an exam ──
  async getExamQuestions(examId) {
    try {
      const qs = await api.getExamQuestionsPublic(examId);
      if (qs && qs.length > 0) {
        return qs.map((q, idx) => mapQuestion(q, idx, examId));
      }
    } catch (err) {
      console.warn('[mockExamService] API getExamQuestions error, using fallback:', err);
    }

    const questions = getLocalData('supabase_mock_exam_questions') || [];
    return questions
      .filter(q => String(q.exam_id) === String(examId))
      .sort((a, b) => a.question_number - b.question_number);
  },

  // ── Retrieve all options of a question ──
  async getExamOptions(questionId) {
    if (optionsCache[String(questionId)]) {
      return optionsCache[String(questionId)];
    }

    const options = getLocalData('supabase_mock_exam_options') || [];
    return options
      .filter(o => String(o.question_id) === String(questionId))
      .sort((a, b) => a.option_label.localeCompare(b.option_label));
  },

  // ── Initialize exam attempt log ──
  async startMockExam(userId, examId) {
    try {
      const res = await api.startAttempt(examId);
      if (res && res.attempt) {
        return {
          id: String(res.attempt.id),
          user_id: String(res.attempt.studentId),
          exam_id: String(res.attempt.examId),
          started_at: res.attempt.startedAt,
          status: 'in_progress',
          score: 0
        };
      }
    } catch (err) {
      console.warn('[mockExamService] API startMockExam error, using fallback:', err);
    }

    // Local Storage fallback
    const attemptData = {
      user_id: userId,
      exam_id: examId,
      started_at: new Date().toISOString(),
      status: 'in_progress',
      score: 0,
      correct_count: 0,
      wrong_count: 0,
      blank_count: 0
    };
    const attempts = getLocalData('supabase_mock_exam_attempts') || [];
    const localAttemptId = `attempt-${Date.now()}`;
    const newAttempt = { id: localAttemptId, ...attemptData };
    attempts.push(newAttempt);
    setLocalData('supabase_mock_exam_attempts', attempts);
    return newAttempt;
  },

  // ── Grade and submit exam paper ──
  async submitMockExam(userId, examId, attemptId, answers, durationSeconds) {
    try {
      const answersArray = Object.entries(answers).map(([qId, val]) => ({
        questionId: parseInt(qId, 10) || qId,
        selectedAnswer: val
      }));
      const attempt = await api.submitAttempt(examId, attemptId, answersArray);
      if (attempt) {
        const correctCount = attempt.attemptAnswers?.filter(a => a.isCorrect).length || 0;
        const totalQuestions = attempt.attemptAnswers?.length || 1;
        const percentage = Math.round((correctCount / totalQuestions) * 10000) / 100;
        
        let rankLabel = 'Cần cải thiện';
        if (attempt.score >= 9) rankLabel = 'Xuất sắc';
        else if (attempt.score >= 8) rankLabel = 'Giỏi';
        else if (attempt.score >= 6.5) rankLabel = 'Khá';
        else if (attempt.score >= 5) rankLabel = 'Trung bình';

        const resultData = {
          user_id: String(userId),
          exam_id: String(examId),
          attempt_id: String(attempt.id),
          score: attempt.score,
          correct_count: correctCount,
          wrong_count: totalQuestions - correctCount - (attempt.attemptAnswers?.filter(a => !a.selectedAnswer).length || 0),
          blank_count: attempt.attemptAnswers?.filter(a => !a.selectedAnswer).length || 0,
          total_questions: totalQuestions,
          percentage,
          rank_label: rankLabel,
          ai_feedback: typeof attempt.aiFeedback === 'string' ? attempt.aiFeedback : JSON.stringify(attempt.aiFeedback)
        };
        return { score: attempt.score, attemptId: String(attempt.id), result: resultData };
      }
    } catch (err) {
      console.warn('[mockExamService] API submitMockExam error, using local fallback:', err);
    }

    // Local Storage fallback
    const exam = await this.getMockExamById(examId);
    const questions = await this.getExamQuestions(examId);
    
    let correctCount = 0;
    let wrongCount = 0;
    let blankCount = 0;
    const gradedAnswers = [];
    const incorrectQuestions = [];

    for (let q of questions) {
      const qOptions = await this.getExamOptions(q.id);
      const correctAnswer = qOptions.find(o => o.is_correct);
      const studentAnswerLabel = answers[q.id];
      const studentSelectedOption = qOptions.find(o => o.option_label === studentAnswerLabel);

      let isCorrect = false;
      if (!studentAnswerLabel) {
        blankCount++;
      } else {
        isCorrect = correctAnswer && correctAnswer.option_label === studentAnswerLabel;
        if (isCorrect) {
          correctCount++;
        } else {
          wrongCount++;
          incorrectQuestions.push({
            id: q.id,
            topic: q.topic || 'Kiến thức chung',
            question_number: q.question_number
          });
        }
      }

      gradedAnswers.push({
        question_id: q.id,
        selected_option_id: studentSelectedOption ? studentSelectedOption.id : null,
        selected_option_label: studentAnswerLabel || null,
        is_correct: isCorrect
      });
    }

    const totalQuestions = questions.length || 10;
    const rawScore = (correctCount / totalQuestions) * 10;
    const score = Math.round(rawScore * 100) / 100;
    const percentage = Math.round((correctCount / totalQuestions) * 10000) / 100;

    let rankLabel = 'Cần cải thiện';
    if (score >= 9) rankLabel = 'Xuất sắc';
    else if (score >= 8) rankLabel = 'Giỏi';
    else if (score >= 6.5) rankLabel = 'Khá';
    else if (score >= 5) rankLabel = 'Trung bình';

    const subjectName = exam ? exam.title : 'Đề luyện thi';
    const feedbackObj = await mockExamAiService.generateExamFeedback(score, subjectName, incorrectQuestions);

    const submissionData = {
      submitted_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      score,
      correct_count: correctCount,
      wrong_count: wrongCount,
      blank_count: blankCount,
      status: 'completed'
    };

    const resultData = {
      user_id: userId,
      exam_id: examId,
      attempt_id: attemptId,
      score,
      correct_count: correctCount,
      wrong_count: wrongCount,
      blank_count: blankCount,
      total_questions: totalQuestions,
      percentage,
      rank_label: rankLabel,
      ai_feedback: JSON.stringify(feedbackObj)
    };

    const attempts = getLocalData('supabase_mock_exam_attempts') || [];
    const updatedAttempts = attempts.map(att => {
      if (String(att.id) === String(attemptId)) {
        return { ...att, ...submissionData };
      }
      return att;
    });
    setLocalData('supabase_mock_exam_attempts', updatedAttempts);

    const savedAnswers = getLocalData('supabase_mock_exam_answers') || [];
    gradedAnswers.forEach(ans => {
      savedAnswers.push({
        id: `ans-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        attempt_id: attemptId,
        ...ans,
        created_at: new Date().toISOString()
      });
    });
    setLocalData('supabase_mock_exam_answers', savedAnswers);

    const results = getLocalData('supabase_mock_exam_results') || [];
    const resultId = `result-${Date.now()}`;
    const newResult = { id: resultId, ...resultData, created_at: new Date().toISOString() };
    results.push(newResult);
    setLocalData('supabase_mock_exam_results', results);

    return { score, attemptId, result: newResult };
  },

  // ── Retrieve all attempts by a user for an exam ──
  async getUserExamAttempts(userId, examId) {
    try {
      const list = await api.getAttempts();
      if (list && list.length > 0) {
        const filtered = list.filter(a => String(a.examId) === String(examId) && a.submittedAt);
        return filtered.map(a => ({
          id: String(a.id),
          user_id: String(a.studentId),
          exam_id: String(a.examId),
          started_at: a.startedAt,
          submitted_at: a.submittedAt,
          duration_seconds: a.durationSeconds || 0,
          score: a.score,
          correct_count: a.correctCount || 0,
          wrong_count: a.wrongCount || 0,
          blank_count: a.blankCount || 0,
          status: 'completed'
        }));
      }
    } catch (err) {
      console.warn('[mockExamService] API getUserExamAttempts error, using fallback:', err);
    }

    const attempts = getLocalData('supabase_mock_exam_attempts') || [];
    return attempts
      .filter(a => String(a.user_id) === String(userId) && String(a.exam_id) === String(examId) && a.status === 'completed')
      .sort((a, b) => b.started_at.localeCompare(a.started_at));
  },

  // ── Retrieve result details of an attempt ──
  async getExamResult(attemptId) {
    try {
      const attempt = await api.getAttemptById(attemptId);
      if (attempt) {
        let rankLabel = 'Cần cải thiện';
        if (attempt.score >= 9) rankLabel = 'Xuất sắc';
        else if (attempt.score >= 8) rankLabel = 'Giỏi';
        else if (attempt.score >= 6.5) rankLabel = 'Khá';
        else if (attempt.score >= 5) rankLabel = 'Trung bình';

        const correctCount = attempt.attemptAnswers?.filter(a => a.isCorrect).length || 0;
        const totalQuestions = attempt.attemptAnswers?.length || 1;
        const percentage = Math.round((correctCount / totalQuestions) * 10000) / 100;

        return {
          id: String(attempt.id),
          user_id: String(attempt.studentId),
          exam_id: String(attempt.examId),
          attempt_id: String(attempt.id),
          score: attempt.score,
          correct_count: correctCount,
          wrong_count: totalQuestions - correctCount - (attempt.attemptAnswers?.filter(a => !a.selectedAnswer).length || 0),
          blank_count: attempt.attemptAnswers?.filter(a => !a.selectedAnswer).length || 0,
          total_questions: totalQuestions,
          percentage,
          rank_label: rankLabel,
          ai_feedback: typeof attempt.aiFeedback === 'string' ? attempt.aiFeedback : JSON.stringify(attempt.aiFeedback),
          mock_exams: attempt.exam ? {
            title: attempt.exam.title,
            duration_minutes: attempt.exam.duration,
            total_questions: totalQuestions
          } : null
        };
      }
    } catch (err) {
      console.warn('[mockExamService] API getExamResult error, using fallback:', err);
    }

    const results = getLocalData('supabase_mock_exam_results') || [];
    const result = results.find(r => String(r.attempt_id) === String(attemptId));
    if (result) {
      const exams = getLocalData('supabase_mock_exams') || [];
      const exam = exams.find(e => String(e.id) === String(result.exam_id));
      return {
        ...result,
        mock_exams: exam ? {
          title: exam.title,
          duration_minutes: exam.duration_minutes,
          total_questions: exam.total_questions
        } : null
      };
    }
    return null;
  },

  // ── Retrieve answers selected during an attempt ──
  async getAttemptAnswers(attemptId) {
    try {
      const attempt = await api.getAttemptById(attemptId);
      if (attempt && attempt.attemptAnswers) {
        return attempt.attemptAnswers.map(ans => ({
          question_id: String(ans.questionId),
          selected_option_id: `opt-${ans.questionId}-${ans.selectedAnswer}`,
          selected_option_label: ans.selectedAnswer || null,
          is_correct: ans.isCorrect
        }));
      }
    } catch (err) {
      console.warn('[mockExamService] API getAttemptAnswers error, using fallback:', err);
    }

    const answers = getLocalData('supabase_mock_exam_answers') || [];
    return answers.filter(a => String(a.attempt_id) === String(attemptId));
  },

  // ── Bookmark a question ──
  async bookmarkQuestion(userId, questionId, note = '') {
    const bookmarkData = {
      user_id: userId,
      question_id: questionId,
      note,
      created_at: new Date().toISOString()
    };

    const bookmarks = getLocalData('supabase_mock_exam_bookmarks') || [];
    const idx = bookmarks.findIndex(b => String(b.user_id) === String(userId) && String(b.question_id) === String(questionId));
    if (idx !== -1) {
      if (note === null || note === undefined) {
        bookmarks.splice(idx, 1);
      } else {
        bookmarks[idx].note = note;
      }
    } else {
      bookmarks.push({
        id: `bm-${Date.now()}`,
        ...bookmarkData
      });
    }
    setLocalData('supabase_mock_exam_bookmarks', bookmarks);
    return true;
  },

  // ── Retrieve bookmarks for a user ──
  async getUserBookmarks(userId) {
    const bookmarks = getLocalData('supabase_mock_exam_bookmarks') || [];
    const questions = getLocalData('supabase_mock_exam_questions') || [];
    return bookmarks
      .filter(b => String(b.user_id) === String(userId))
      .map(b => {
        const q = questions.find(question => String(question.id) === String(b.question_id));
        return {
          ...b,
          mock_exam_questions: q || null
        };
      });
  }
};
