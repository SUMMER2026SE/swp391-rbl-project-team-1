// Mock Exam Service for Supabase Database and LocalStorage Fallback
import { api } from '../api';
import { getLocalData, setLocalData } from './mockDb';
import { mockExamAiService } from './mockExamAiService';
import { resolveUploadUrl } from '../utils/courseMapper';

import toanDemo from '../data/mockExams/toan-2024-demo.json';
import anhDemo from '../data/mockExams/tienganh-2024-demo.json';
import lyDemo from '../data/mockExams/vatly-2024-demo.json';
import hoaDemo from '../data/mockExams/hoahoc-2024-demo.json';

const getSlug = (subject) => {
  if (!subject) return 'toan';
  const s = subject.toLowerCase();
  if (s.includes('toán') || s.includes('toan')) return 'toan';
  if (s.includes('anh') || s.includes('english')) return 'anh';
  if (s.includes('vật l') || s.includes('vat l') || s.includes('ly')) return 'ly';
  if (s.includes('hóa') || s.includes('hoa')) return 'hoa';
  return 'toan';
};

const getIcon = (subject) => {
  if (!subject) return '📐';
  const s = subject.toLowerCase();
  if (s.includes('toán') || s.includes('toan')) return '📐';
  if (s.includes('anh') || s.includes('english')) return '🗣️';
  if (s.includes('vật l') || s.includes('vat l') || s.includes('ly')) return '⚛️';
  if (s.includes('hóa') || s.includes('hoa')) return '🧪';
  return '🎯';
};

const getSubjectId = (subject) => {
  if (!subject) return 1;
  const s = subject.toLowerCase();
  if (s.includes('toán') || s.includes('toan')) return 1;
  if (s.includes('anh') || s.includes('english')) return 2;
  if (s.includes('vật l') || s.includes('vat l') || s.includes('ly')) return 3;
  if (s.includes('hóa') || s.includes('hoa')) return 4;
  return 1;
};

const inferSubjectName = (e) => {
  const titleLower = (e.title || '').toLowerCase();
  if (titleLower.includes('vật lý') || titleLower.includes('vật lí') || titleLower.includes('vat ly')) return 'Vật lý';
  if (titleLower.includes('tiếng anh') || titleLower.includes('tieng anh')) return 'Tiếng Anh';
  if (titleLower.includes('hóa học') || titleLower.includes('hoa hoc')) return 'Hóa học';
  if (titleLower.includes('toán')) return 'Toán học';
  return e.subject || 'Toán học';
};

const mapExam = (e) => {
  const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
  const matchedYear = years.find(y => e.title.includes(String(y))) || 2024;
  const matchedCode = e.title.match(/Mã đề (\d+)/)?.[1] || '101';
  const titleLower = (e.title || '').toLowerCase();
  const isOfficial = e.source === 'OFFICIAL' || e.source === 'Đề chính thức' || titleLower.includes('mã đề') || titleLower.includes('thpt') || titleLower.includes('chính thức');
  const realSubject = inferSubjectName(e);
  const subjectSlug = getSlug(realSubject);
  const subjectIcon = getIcon(realSubject);
  const subjectId = getSubjectId(realSubject);

  return {
    id: String(e.id),
    subject_id: subjectId,
    title: e.title,
    year: matchedYear,
    exam_code: matchedCode,
    source: isOfficial ? 'OFFICIAL' : 'EDUPATH',
    exam_type: isOfficial ? 'official' : 'mock',
    duration_minutes: e.duration,
    grade: e.grade,
    total_questions: (e.examQuestions && e.examQuestions.length > 0) ? e.examQuestions.length : (e.totalQuestions || 0),
    description: e.description || `Đề thi ôn luyện môn ${realSubject} thi tốt nghiệp THPT Quốc Gia.`,
    status: e.status || 'published',
    exam_subjects: {
      id: subjectId,
      name: realSubject,
      slug: subjectSlug,
      icon: subjectIcon,
      description: `Môn ${realSubject} ôn thi THPT Quốc Gia`
    },
    attempts_count: 0
  };
};

const optionsCache = {};
const examPromiseCache = {};

const detectQuestionTopic = (txt = '', rawTopic = '', subject = '') => {
  if (rawTopic && rawTopic !== 'Kiến thức cốt lõi' && rawTopic !== 'Chung' && rawTopic !== 'Tổng hợp') {
    return rawTopic;
  }

  const text = (txt || '').toLowerCase();

  // Math topics
  if (text.includes('xác suất') || text.includes('tổ hợp') || text.includes('quả cầu') || text.includes('ngẫu nhiên')) return 'Xác suất & Tổ hợp';
  if (text.includes('mũ') || text.includes('lôgarit') || text.includes('logarit') || (text.includes('bất phương trình') && text.includes('2^'))) return 'Hàm số Mũ & Lôgarit';
  if (text.includes('tích phân') || text.includes('nguyên hàm') || text.includes('dx') || text.includes('\\int')) return 'Nguyên hàm & Tích phân';
  if (text.includes('cực trị') || text.includes('đạo hàm') || text.includes('hàm số') || text.includes('đồng biến') || text.includes('tiệm cận')) return 'Hàm số & Đồ thị';
  if (text.includes('oxyz') || text.includes('mặt phẳng') || text.includes('vectơ') || text.includes('tọa độ')) return 'Hình học Tọa độ Oxyz';
  if (text.includes('thể tích') || text.includes('khối chóp') || text.includes('chóp') || text.includes('lăng trụ')) return 'Hình học Không gian';
  if (text.includes('số phức') || text.includes('môđun')) return 'Số phức';
  if (text.includes('cấp số cộng') || text.includes('cấp số nhân')) return 'Cấp số cộng & Cấp số nhân';

  // Physics topics
  if (text.includes('dao động') || text.includes('con lắc') || text.includes('sóng')) return 'Dao động & Sóng cơ';
  if (text.includes('xoay chiều') || text.includes('dòng điện') || text.includes('mạch điện')) return 'Dòng điện Xoay chiều';
  if (text.includes('hạt nhân') || text.includes('phóng xạ') || text.includes('bức xạ')) return 'Vật lý Hạt nhân';
  if (text.includes('quang phổ') || text.includes('ánh sáng')) return 'Sóng ánh sáng';

  // Chemistry topics
  if (text.includes('este') || text.includes('lipit') || text.includes('xà phòng')) return 'Este & Lipit';
  if (text.includes('cacbohidrat') || text.includes('glucozơ') || text.includes('saccarozơ')) return 'Cacbohidrat';
  if (text.includes('amin') || text.includes('amino axit') || text.includes('protein')) return 'Amin & Peptit';
  if (text.includes('kim loại') || text.includes('dung dịch')) return 'Kim loại & Dung dịch';

  // English topics
  if (text.includes('pronunciation') || text.includes('underlined') || text.includes('differs')) return 'Phát âm & Trọng âm';
  if (text.includes('stress') || text.includes('position')) return 'Phát âm & Trọng âm';
  if (text.includes('if') || text.includes('working') || text.includes('written') || text.includes('more study')) return 'Ngữ pháp & Từ vựng';

  return rawTopic || 'Kiến thức cốt lõi';
};

const mapQuestion = (q, idx, examId) => {
  const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
  
  let diffLabel = 'Trung bình';
  if (q.difficulty === 'EASY' || q.difficulty === 'Dễ') diffLabel = 'Dễ';
  else if (q.difficulty === 'HARD' || q.difficulty === 'Khó') diffLabel = 'Khó';

  const rawImg = q.imageUrl || q.question_image_url || null;
  const formattedImg = resolveUploadUrl(rawImg);

  const qId = (q.id !== undefined && q.id !== null) ? String(q.id) : `q_${examId}_${idx + 1}`;
  const qText = q.content || q.question_text || '';
  const detectedTopic = detectQuestionTopic(qText, q.topic, q.subject || q.subject_name);

  // Cache options for separate queries
  const mappedOptions = (options || []).map((opt, optIdx) => ({
    id: `opt-${qId}-${opt.label || opt.option_label || optIdx}`,
    question_id: qId,
    option_label: opt.label || opt.option_label || String.fromCharCode(65 + optIdx),
    option_text: opt.content ?? opt.text ?? opt.option_text ?? opt.value ?? opt.option_content ?? '',
    is_correct: (opt.label || opt.option_label) === q.correctAnswer || opt.is_correct || opt.isCorrect || false
  }));

  optionsCache[qId] = mappedOptions;

  return {
    id: qId,
    exam_id: String(examId),
    question_number: idx + 1,
    question_text: qText,
    imageUrl: formattedImg,
    question_image_url: formattedImg,
    audio_url: q.audioUrl || q.audio_url || null,
    type: q.type || q.question_type || 'MULTIPLE_CHOICE',
    question_type: q.type || q.question_type || 'MULTIPLE_CHOICE',
    difficulty: diffLabel,
    explanation: q.explanation || '',
    topic: detectedTopic,
    options: mappedOptions
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
      const apiFilters = {};
      if (filters.subjectId && filters.subjectId !== 'All') {
        const getSubjectNameById = (id) => {
          const numId = Number(id);
          if (numId === 1) return 'Toán học';
          if (numId === 2) return 'Tiếng Anh';
          if (numId === 3) return 'Vật lý';
          if (numId === 4) return 'Hóa học';
          const subjects = getLocalData('supabase_mock_exam_subjects') || [];
          return subjects.find(s => String(s.id) === String(id))?.name;
        };
        const subjectName = getSubjectNameById(filters.subjectId);
        if (subjectName) apiFilters.subject = subjectName;
      }
      if (filters.year && filters.year !== 'All') {
        apiFilters.year = Number(filters.year);
      }
      if (filters.examType && filters.examType !== 'All') {
        const list = await api.getExams(apiFilters);
        if (list && Array.isArray(list)) {
          setLocalData('supabase_mock_exams', list);
          let result = list.map(mapExam).filter(e => e.total_questions > 0 && e.is_published !== false && e.is_ai_generated !== true);
          if (filters.subjectId && filters.subjectId !== 'All') {
            result = result.filter(e => String(e.subject_id) === String(filters.subjectId));
          }
          if (filters.search) {
            const query = filters.search.trim().toLowerCase();
            result = result.filter(e => {
              const titleMatch = e.title ? e.title.toLowerCase().includes(query) : false;
              const subjectMatch = e.exam_subjects?.name ? e.exam_subjects.name.toLowerCase().includes(query) : false;
              const yearMatch = e.year ? String(e.year).includes(query) : false;
              const codeMatch = e.exam_code ? String(e.exam_code).toLowerCase().includes(query) : false;
              return titleMatch || subjectMatch || yearMatch || codeMatch;
            });
          }
          return result;
        }
      }
    } catch (err) {
      console.warn('[mockExamService] API getMockExams error, using fallback:', err);
    }

    // Fallback Logic
    const exams = getLocalData('supabase_mock_exams') || [];
    const subjects = getLocalData('supabase_mock_exam_subjects') || [];
    const attempts = getLocalData('supabase_mock_exam_attempts') || [];

    let result = exams.filter(e => e.is_published !== false && e.is_ai_generated !== true).map(exam => {
      const subject = subjects.find(s => s.id === exam.subject_id);
      const examAttempts = attempts.filter(a => String(a.exam_id) === String(exam.id));
      const myAttempt = examAttempts[examAttempts.length - 1];

      return {
        ...exam,
        exam_subjects: subject || null,
        userStatus: myAttempt ? (myAttempt.status === 'completed' ? 'completed' : 'in_progress') : 'not_started',
        myScore: myAttempt ? myAttempt.score : null
      };
    });

    if (filters.subjectId && filters.subjectId !== 'All') {
      result = result.filter(e => String(e.subject_id) === String(filters.subjectId));
    }
    if (filters.year && filters.year !== 'All') {
      result = result.filter(e => String(e.year) === String(filters.year));
    }
    if (filters.examType && filters.examType !== 'All') {
      result = result.filter(e => {
        if (filters.examType === 'official') return e.source === 'Bộ GD&ĐT' || e.exam_type === 'official';
        return e.source !== 'Bộ GD&ĐT' && e.exam_type !== 'official';
      });
    }
    if (filters.grade && filters.grade !== 'All') {
      result = result.filter(e => String(e.grade) === String(filters.grade));
    }
    if (filters.search) {
      const query = filters.search.trim().toLowerCase();
      result = result.filter(e => {
        const titleMatch = e.title ? e.title.toLowerCase().includes(query) : false;
        const subjectMatch = e.exam_subjects?.name ? e.exam_subjects.name.toLowerCase().includes(query) : false;
        const yearMatch = e.year ? String(e.year).includes(query) : false;
        const codeMatch = e.exam_code ? String(e.exam_code).toLowerCase().includes(query) : false;
        return titleMatch || subjectMatch || yearMatch || codeMatch;
      });
    }

    return result;
  },

  // ── Create & Persist Private AI-Generated Exam ──
  async createAiGeneratedExam(config, questions, currentUser) {
    const timestamp = Date.now();
    const newExamId = `ai_exam_${timestamp}`;

    const subjectMap = {
      'math': { id: 1, name: 'Toán học' },
      'english': { id: 2, name: 'Tiếng Anh' },
      'physics': { id: 3, name: 'Vật lý' },
      'chemistry': { id: 4, name: 'Hóa học' },
      'biology': { id: 5, name: 'Sinh học' }
    };
    const subjObj = subjectMap[config.subject] || { id: 1, name: 'Toán học' };

    const diffName = config.difficulty === 'easy' ? 'Dễ' : config.difficulty === 'medium' ? 'Trung bình' : config.difficulty === 'hard' ? 'Khá/Khó' : 'Tổng hợp';
    const topicLabel = config.singleTopicName || config.topicTitle || (config.topic !== 'all' ? config.topic : 'Tổng hợp');
    const examTitle = `⚡ Đề AI cá nhân hóa môn ${subjObj.name}: ${topicLabel} (${questions.length} câu - ${diffName})`;

    const formattedQuestions = questions.map((q, idx) => ({
      ...q,
      exam_id: newExamId,
      id: `q_${newExamId}_${idx + 1}`,
      question_number: idx + 1
    }));

    const qCount = questions.length;
    const computedDuration = config.duration || (qCount <= 10 ? 15 : (qCount <= 15 ? 25 : (qCount <= 20 ? 35 : 50)));

    const newExam = {
      id: newExamId,
      title: examTitle,
      subject_id: subjObj.id,
      duration_minutes: computedDuration,
      total_questions: formattedQuestions.length,
      status: 'draft',
      is_published: false,
      is_ai_generated: true,
      created_by: currentUser?.id || 'guest',
      created_at: new Date().toISOString(),
      exam_subjects: { id: subjObj.id, name: subjObj.name },
      questions: formattedQuestions
    };

    // 1. Attempt DB creation if token exists
    const token = localStorage.getItem('access_token');
    if (token && token !== 'demo_bypass_token') {
      try {
        const payload = {
          title: examTitle,
          subjectId: subjObj.id,
          duration: computedDuration,
          isPublished: false,
          questions: formattedQuestions.map(q => ({
            content: q.question_text || q.content,
            difficulty: q.difficulty,
            type: q.type || 'MULTIPLE_CHOICE',
            options: (q.options || []).map(o => ({
              label: o.option_label || o.label,
              content: o.option_text || o.content,
              isCorrect: o.is_correct || false
            }))
          }))
        };
        const dbRes = await api.createTeacherExam(payload);
        if (dbRes && dbRes.data && dbRes.data.id) {
          newExam.id = `ai_exam_${dbRes.data.id}`;
          newExam.dbExamId = dbRes.data.id;
        }
      } catch (err) {
        console.warn('[mockExamService] Backend API createTeacherExam fallback to local storage:', err.message);
      }
    }

    // 2. Persist private exam locally
    const storedExams = getLocalData('app_ai_private_exams') || [];
    storedExams.push(newExam);
    setLocalData('app_ai_private_exams', storedExams);

    return {
      exam: newExam,
      questions: formattedQuestions
    };
  },

  // ── Retrieve a single mock exam by ID ──
  async getMockExamById(examId) {
    const privateExams = getLocalData('app_ai_private_exams') || [];
    const foundPrivate = privateExams.find(e => String(e.id) === String(examId) || String(e.dbExamId) === String(examId));
    if (foundPrivate) {
      return foundPrivate;
    }

    try {
      let realExamId = examId;
      if (parseInt(examId, 10) > 1000) {
        const generatedList = getLocalData('supabase_mock_exams') || [];
        const found = generatedList.find(e => String(e.id) === String(examId));
        if (found && found.dbExamId) {
          realExamId = found.dbExamId;
        }
      }

      let examPromise = examPromiseCache[realExamId];
      if (!examPromise) {
        examPromise = api.getExamById(realExamId);
        examPromiseCache[realExamId] = examPromise;
      }
      const exam = await examPromise;

      if (exam) {
        const mapped = mapExam(exam);
        mapped.id = String(examId); // Preserve synthetic ID
        return mapped;
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

    // Default fallback exam for synthetic practice IDs (711, 211, 212, 213, 214, etc.)
    const subjectMap = {
      '1': { id: 1, name: 'Toán học', slug: 'toan', icon: '📐' },
      '2': { id: 2, name: 'Tiếng Anh', slug: 'anh', icon: '🗣️' },
      '3': { id: 3, name: 'Vật lý', slug: 'ly', icon: '⚛️' },
      '4': { id: 4, name: 'Hóa học', slug: 'hoa', icon: '🧪' },
      '211': { id: 1, name: 'Toán học', slug: 'toan', icon: '📐' },
      '212': { id: 2, name: 'Tiếng Anh', slug: 'anh', icon: '🗣️' },
      '213': { id: 4, name: 'Hóa học', slug: 'hoa', icon: '🧪' },
      '214': { id: 3, name: 'Vật lý', slug: 'ly', icon: '⚛️' },
      '711': { id: 1, name: 'Toán học', slug: 'toan', icon: '📐' }
    };
    const targetSubj = subjectMap[String(examId)] || { id: 1, name: 'Toán học', slug: 'toan', icon: '📐' };

    return {
      id: String(examId),
      title: `Đề thi thử THPT Quốc Gia môn ${targetSubj.name}`,
      subject_id: targetSubj.id,
      duration_minutes: 50,
      total_questions: 40,
      status: 'published',
      exam_subjects: targetSubj
    };
  },

  // ── Retrieve all questions of an exam ──
  async getExamQuestions(examId) {
    const privateExams = getLocalData('app_ai_private_exams') || [];
    const foundPrivate = privateExams.find(e => String(e.id) === String(examId) || String(e.dbExamId) === String(examId));
    if (foundPrivate && foundPrivate.questions && foundPrivate.questions.length > 0) {
      return foundPrivate.questions;
    }

    try {
      let realExamId = examId;
      if (parseInt(examId, 10) > 1000) {
        const generatedList = getLocalData('supabase_mock_exams') || [];
        const found = generatedList.find(e => String(e.id) === String(examId));
        if (found && found.dbExamId) {
          realExamId = found.dbExamId;
        }
      }

      let examPromise = examPromiseCache[realExamId];
      if (!examPromise) {
        examPromise = api.getExamById(realExamId);
        examPromiseCache[realExamId] = examPromise;
      }
      const exam = await examPromise;

      if (exam && exam.questions && exam.questions.length > 0) {
        return exam.questions.map((q, idx) => {
          const mq = mapQuestion(q, idx, examId);
          mq.options = optionsCache[mq.id] || [];
          return mq;
        });
      }
    } catch (err) {
      console.warn('[mockExamService] API getExamQuestions error, using fallback:', err);
    }

    const questions = getLocalData('supabase_mock_exam_questions') || [];
    const filteredQs = questions
      .filter(q => String(q.exam_id) === String(examId))
      .sort((a, b) => a.question_number - b.question_number);

    if (filteredQs.length > 0) {
      const options = getLocalData('supabase_mock_exam_options') || [];
      return filteredQs.map(q => {
        const qOptions = options
          .filter(o => String(o.question_id) === String(q.id))
          .sort((a, b) => a.option_label.localeCompare(b.option_label));
        return { ...q, options: qOptions };
      });
    }

    // Fallback to demo question files (toanDemo, anhDemo, lyDemo, hoaDemo)
    const demoMap = {
      '1': toanDemo,
      '2': anhDemo,
      '3': lyDemo,
      '4': hoaDemo,
      '211': toanDemo,
      '212': anhDemo,
      '213': hoaDemo,
      '214': lyDemo,
      '711': toanDemo
    };
    const demoObj = demoMap[String(examId)] || toanDemo;
    if (demoObj && demoObj.questions) {
      return demoObj.questions.map((q, idx) => mapQuestion(q, idx, examId));
    }

    return [];
  },

  // ── Unified Question Bank Direct Query ──
  async getQuestionBankQuestions(subjectName, topicName, difficultyLevel, limit = 20) {
    let pool = [];

    // 1. Try fetching from Backend API Question Bank
    const token = localStorage.getItem('access_token');
    if (token && token !== 'demo_bypass_token') {
      try {
        const res = await api.getTeacherQuestions({
          subject: subjectName,
          topic: topicName !== 'all' && topicName !== 'single_topic' ? topicName : undefined,
          difficulty: difficultyLevel !== 'mixed' ? difficultyLevel : undefined,
          limit: 100
        });
        if (res && res.data && Array.isArray(res.data.questions) && res.data.questions.length > 0) {
          pool = res.data.questions.map((q, idx) => mapQuestion(q, idx, 'question_bank'));
        }
      } catch (err) {
        console.warn('[mockExamService] Question Bank API query warning:', err.message);
      }
    }

    // 2. If API pool has 0 items, aggregate all questions from Local Question Bank & Demo Sets
    if (pool.length === 0) {
      const localBank = getLocalData('app_questions') || [];
      const supabaseQs = getLocalData('supabase_mock_exam_questions') || [];
      const supabaseOpts = getLocalData('supabase_mock_exam_options') || [];

      const formattedDemo = [
        ...(toanDemo?.questions || []).map((q, idx) => mapQuestion({ ...q, subject_name: 'Toán học', subject_slug: 'toan' }, idx, 'demo_toan')),
        ...(anhDemo?.questions || []).map((q, idx) => mapQuestion({ ...q, subject_name: 'Tiếng Anh', subject_slug: 'anh' }, idx, 'demo_anh')),
        ...(lyDemo?.questions || []).map((q, idx) => mapQuestion({ ...q, subject_name: 'Vật lý', subject_slug: 'ly' }, idx, 'demo_ly')),
        ...(hoaDemo?.questions || []).map((q, idx) => mapQuestion({ ...q, subject_name: 'Hóa học', subject_slug: 'hoa' }, idx, 'demo_hoa'))
      ];

      const formattedLocal = localBank.map((q, idx) => mapQuestion(q, idx, 'local_bank'));
      const formattedSupabase = supabaseQs.map(q => {
        const qOpts = supabaseOpts.filter(o => String(o.question_id) === String(q.id));
        return { ...q, options: qOpts };
      });

      pool = [...formattedDemo, ...formattedLocal, ...formattedSupabase];
    }

    // Filter pool strictly by target subject
    const targetSubjName = subjectName || 'Toán học';

    const subjectPool = pool.filter(q => {
      const s = (q.subject || q.subject_name || q.subject_slug || q.exam_subjects?.name || '').toLowerCase();
      const target = targetSubjName.toLowerCase();
      const qExamId = String(q.exam_id || '');

      if (target.includes('toán') || target.includes('math')) {
        return s.includes('toán') || s.includes('math') || s.includes('toan') || qExamId.includes('toan') || qExamId === '1' || qExamId === '711' || qExamId === '211';
      }
      if (target.includes('vật') || target.includes('lý') || target.includes('phys')) {
        return s.includes('vật') || s.includes('lý') || s.includes('ly') || s.includes('phys') || qExamId.includes('ly') || qExamId === '3' || qExamId === '214';
      }
      if (target.includes('hóa') || target.includes('chem')) {
        return s.includes('hóa') || s.includes('hoa') || s.includes('chem') || qExamId.includes('hoa') || qExamId === '4' || qExamId === '213';
      }
      if (target.includes('anh') || target.includes('eng')) {
        return s.includes('anh') || s.includes('eng') || qExamId.includes('anh') || qExamId === '2' || qExamId === '212';
      }
      if (target.includes('sinh') || target.includes('bio')) {
        return s.includes('sinh') || s.includes('bio');
      }
      return false;
    });

    const isDifficultyMatch = (qDiff, targetDiff) => {
      if (!targetDiff || targetDiff === 'mixed' || targetDiff === 'All') return true;
      if (!qDiff) return true;
      const d = qDiff.toString().toLowerCase();
      const target = targetDiff.toLowerCase();

      if (target === 'easy') return d.includes('easy') || d.includes('nhận biết') || d.includes('dễ') || d === '1';
      if (target === 'medium') return d.includes('medium') || d.includes('thông hiểu') || d.includes('trung bình') || d === '2';
      if (target === 'hard') return d.includes('hard') || d.includes('vận dụng') || d.includes('khó') || d === '3';
      return true;
    };

    const isTopicMatch = (qTopic = '', qText = '', searchTopic = '') => {
      if (!searchTopic || searchTopic === 'all' || searchTopic === 'All' || searchTopic === 'single_topic') return true;
      const s = searchTopic.toLowerCase().trim();
      const t = (qTopic || '').toLowerCase().trim();
      const txt = (qText || '').toLowerCase().trim();

      if (s.includes('mũ') || s.includes('lôgarit') || s.includes('logarit') || s.includes('logarithm')) {
        return t.includes('mũ') || t.includes('lôgarit') || t.includes('logarit') || txt.includes('lôgarit') || txt.includes('logarit') || txt.includes('log') || (txt.includes('bất phương trình') && txt.includes('2^'));
      }
      if (s.includes('hình học không gian') || s.includes('không gian') || s.includes('khối chóp') || s.includes('lăng trụ')) {
        return t.includes('không gian') || t.includes('khối chóp') || t.includes('lăng trụ') || txt.includes('khối chóp') || txt.includes('thể tích') || txt.includes('lăng trụ');
      }
      if (s.includes('oxyz') || s.includes('tọa độ')) {
        return t.includes('oxyz') || t.includes('tọa độ') || txt.includes('oxyz') || txt.includes('mặt phẳng (p)');
      }
      if (s.includes('tích phân') || s.includes('nguyên hàm')) {
        return t.includes('tích phân') || t.includes('nguyên hàm') || txt.includes('tích phân') || txt.includes('nguyên hàm') || txt.includes('\\int');
      }
      if (s.includes('hàm số') || s.includes('đồ thị') || s.includes('cực trị')) {
        return t.includes('hàm số') || t.includes('đồ thị') || t.includes('cực trị') || txt.includes('hàm số') || txt.includes('cực trị') || txt.includes('tiệm cận');
      }
      if (s.includes('xác suất') || s.includes('tổ hợp')) {
        return t.includes('xác suất') || t.includes('tổ hợp') || txt.includes('xác suất') || txt.includes('tổ hợp') || txt.includes('quả cầu');
      }
      if (s.includes('số phức')) {
        return t.includes('số phức') || txt.includes('số phức') || txt.includes('môđun');
      }
      if (s.includes('cấp số')) {
        return t.includes('cấp số') || txt.includes('cấp số');
      }

      // Physics
      if (s.includes('dao động') || s.includes('sóng')) return t.includes('dao động') || t.includes('sóng') || txt.includes('dao động');
      if (s.includes('xoay chiều') || s.includes('dòng điện')) return t.includes('xoay chiều') || t.includes('dòng điện') || txt.includes('xoay chiều');
      if (s.includes('hạt nhân')) return t.includes('hạt nhân') || txt.includes('hạt nhân');

      // Chemistry
      if (s.includes('este') || s.includes('lipit')) return t.includes('este') || t.includes('lipit') || txt.includes('este');
      if (s.includes('cacbohidrat') || s.includes('glucozơ')) return t.includes('cacbohidrat') || txt.includes('glucozơ');
      if (s.includes('amin') || s.includes('amino')) return t.includes('amin') || txt.includes('amin');

      // English
      if (s.includes('phát âm') || s.includes('trọng âm') || s.includes('pronunciation')) return t.includes('phát âm') || txt.includes('pronunciation') || txt.includes('differs');
      if (s.includes('ngữ pháp') || s.includes('từ vựng') || s.includes('grammar')) return t.includes('ngữ pháp') || txt.includes('working') || txt.includes('written');

      return t.includes(s) || s.includes(t) || txt.includes(s);
    };

    let matching = subjectPool.filter(q => {
      const topicOk = isTopicMatch(q.topic, q.question_text || q.content, topicName);
      const diffOk = isDifficultyMatch(q.difficulty, difficultyLevel);
      return topicOk && diffOk;
    });

    const isAllTopics = !topicName || topicName === 'all' || topicName === 'All' || topicName === 'single_topic';

    // If strict difficulty filter returns < 5 questions:
    if (matching.length < 5) {
      if (isAllTopics) {
        // For All Topics: fall back to all questions of target subject across all difficulty levels
        matching = subjectPool;
      } else {
        // For Specific Topic: fall back to all questions of THAT topic across all difficulty levels
        const topicPool = subjectPool.filter(q => isTopicMatch(q.topic, q.question_text || q.content, topicName));
        matching = topicPool;
      }
    }

    // Expand matching pool up to requested limit (15, 20, 40) using authentic subject question patterns
    if (matching.length > 0 && matching.length < limit) {
      const baseCount = matching.length;
      let idx = 0;
      while (matching.length < limit) {
        const baseQ = matching[idx % baseCount];
        const newIndex = matching.length + 1;
        const clonedId = `q_generated_${newIndex}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
        
        matching.push({
          ...baseQ,
          id: clonedId,
          question_number: newIndex,
          options: (baseQ.options || []).map((opt, oIdx) => ({
            ...opt,
            id: `opt-${clonedId}-${opt.option_label || oIdx}`,
            question_id: clonedId
          }))
        });
        idx++;
      }
    }

    // Return matching authentic questions up to limit
    return matching.slice(0, limit);
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
  async startMockExam(userId, examId, retakeMode = null, questionIds = []) {
    const token = localStorage.getItem('access_token');
    if (token && token !== 'demo_bypass_token') {
      try {
        let realExamId = examId;
        if (parseInt(examId, 10) > 1000) {
          const generatedList = getLocalData('supabase_mock_exams') || [];
          const found = generatedList.find(e => String(e.id) === String(examId));
          if (found && found.dbExamId) {
            realExamId = found.dbExamId;
          }
        }

        const res = await api.startAttempt(realExamId, retakeMode, questionIds);
        if (res && res.attempt) {
          return {
            id: String(res.attempt.id),
            user_id: String(res.attempt.studentId),
            exam_id: String(examId),
            started_at: res.attempt.startedAt,
            status: 'in_progress',
            score: 0
          };
        }
      } catch (err) {
        console.warn('[mockExamService] API startMockExam error, using fallback:', err);
      }
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

  // ── Auto-save selected answer on the fly ──
  async saveAttemptAnswer(attemptId, questionId, selectedAnswer) {
    const token = localStorage.getItem('access_token');
    const isLocal = !attemptId || attemptId.toString().startsWith('guest') || attemptId.toString().startsWith('attempt-') || Number(attemptId) > 1_000_000_000_000;
    if (!token || token === 'demo_bypass_token' || isLocal) {
      return false;
    }
    try {
      await api.saveAttemptAnswer(attemptId, questionId, selectedAnswer);
      return true;
    } catch (err) {
      console.warn('[mockExamService] API saveAttemptAnswer error:', err);
      return false;
    }
  },

  // ── Grade and submit exam paper ──
  async submitMockExam(userId, examId, attemptId, answers, durationSeconds, retakeMode = null, questionIds = [], activeQuestions = []) {
    const token = localStorage.getItem('access_token');
    const isLocal = !attemptId || attemptId.toString().startsWith('guest') || attemptId.toString().startsWith('attempt-') || Number(attemptId) > 1_000_000_000_000;
    if (token && token !== 'demo_bypass_token' && !isLocal) {
      try {
        const answersArray = Object.entries(answers).map(([qId, val]) => ({
          questionId: parseInt(qId, 10) || qId,
          selectedAnswer: val
        }));
        const attempt = await api.submitAttempt(attemptId, answersArray, retakeMode, questionIds);
        if (attempt) {
          const correctCount = attempt.correctCount || 0;
          const wrongCount = attempt.wrongCount || 0;
          const blankCount = attempt.skippedCount || 0;
          const totalQuestions = (correctCount + wrongCount + blankCount) || 1;
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
            wrong_count: wrongCount,
            blank_count: blankCount,
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
    }

    // Local Storage fallback
    const exam = await this.getMockExamById(examId);
    let questions = (activeQuestions && activeQuestions.length > 0) ? activeQuestions : await this.getExamQuestions(examId);
    if (!questions || questions.length === 0) {
      const privateExams = getLocalData('app_ai_private_exams') || [];
      const foundPriv = privateExams.find(e => String(e.id) === String(examId) || String(e.dbExamId) === String(examId));
      if (foundPriv && foundPriv.questions) {
        questions = foundPriv.questions;
      }
    }
    
    let correctCount = 0;
    let wrongCount = 0;
    let blankCount = 0;
    const gradedAnswers = [];
    const incorrectQuestions = [];

    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      const qOptions = (q.options && q.options.length > 0) ? q.options : await this.getExamOptions(q.id);
      const correctAnswer = qOptions.find(o => o.is_correct || o.isCorrect);
      const studentAnswerLabel = answers[q.id] || answers[q.question_number] || answers[String(idx + 1)] || answers[String(q.id)];
      const studentSelectedOption = qOptions.find(o => (o.option_label || o.label) === studentAnswerLabel);

      let isCorrect = false;
      if (!studentAnswerLabel) {
        blankCount++;
      } else {
        const correctLabel = correctAnswer ? (correctAnswer.option_label || correctAnswer.label) : null;
        isCorrect = correctLabel ? (correctLabel.toUpperCase() === studentAnswerLabel.toUpperCase()) : false;
        if (isCorrect) {
          correctCount++;
        } else {
          wrongCount++;
          incorrectQuestions.push({
            id: q.id,
            topic: q.topic || 'Kiến thức chung',
            question_number: q.question_number || (idx + 1)
          });
        }
      }

      gradedAnswers.push({
        question_id: q.id,
        question_number: q.question_number || (idx + 1),
        selected_option_id: studentSelectedOption ? studentSelectedOption.id : null,
        selected_option_label: studentAnswerLabel || null,
        is_correct: isCorrect,
        // Store full question data for localStorage fallback (Xem lại bài tab)
        question_text: q.question_text || q.content || '',
        question_image_url: q.question_image_url || q.imageUrl || null,
        audio_url: q.audio_url || q.audioUrl || null,
        difficulty: q.difficulty || 'Trung bình',
        explanation: q.explanation || '',
        topic: q.topic || 'Kiến thức cốt lõi',
        options: qOptions.map(o => ({
          id: o.id || `opt-${q.id}-${o.option_label || o.label}`,
          question_id: String(q.id),
          option_label: o.option_label || o.label || '',
          option_text: o.option_text || o.text || o.content || '',
          is_correct: o.is_correct || o.isCorrect || false
        }))
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

    // Derive subject label from exam object for display in history
    const examSubjectLabel = exam?.subject_name
      || exam?.subject?.name
      || exam?.exam_subjects?.name
      || (() => {
          const t = (exam?.title || '').toLowerCase();
          if (t.includes('vật lý') || t.includes('vật lí') || t.includes('physics') || t.includes('ly')) return 'Vật lý';
          if (t.includes('hóa') || t.includes('chemistry') || t.includes('hoa')) return 'Hóa học';
          if (t.includes('tiếng anh') || t.includes('english') || t.includes('anh')) return 'Tiếng Anh';
          if (t.includes('toán') || t.includes('math') || t.includes('toan')) return 'Toán học';
          return null;
        })();

    const submissionData = {
      submitted_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      score,
      correct_count: correctCount,
      wrong_count: wrongCount,
      blank_count: blankCount,
      status: 'completed',
      subject: examSubjectLabel || undefined,
      exam_title: exam?.title || undefined
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
    const attIdx = attempts.findIndex(att => String(att.id) === String(attemptId));
    if (attIdx !== -1) {
      attempts[attIdx] = { ...attempts[attIdx], ...submissionData };
    } else {
      attempts.push({
        id: attemptId || `attempt-${Date.now()}`,
        user_id: userId || 'user',
        exam_id: examId,
        started_at: new Date().toISOString(),
        ...submissionData
      });
    }
    setLocalData('supabase_mock_exam_attempts', attempts);

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
      let realExamId = examId;
      if (parseInt(examId, 10) > 1000) {
        const generatedList = getLocalData('supabase_mock_exams') || [];
        const found = generatedList.find(e => String(e.id) === String(examId));
        if (found && found.dbExamId) {
          realExamId = found.dbExamId;
        }
      }

      const list = await api.getAttempts();
      if (list && list.length > 0) {
        const filtered = list.filter(a => {
          if (String(a.examId) !== String(realExamId) || a.status !== 'SUBMITTED') return false;
          const fb = a.aiFeedback || {};
          const mode = fb.retakeMode || a.retakeMode;
          if (mode && mode !== 'full') return false;
          return true;
        });
        return filtered.map(a => ({
          id: String(a.id),
          user_id: String(a.studentId),
          exam_id: String(examId),
          started_at: a.startedAt,
          submitted_at: a.submittedAt,
          duration_seconds: a.durationUsed || 0,
          score: a.score,
          correct_count: a.correctCount || 0,
          wrong_count: a.wrongCount || 0,
          blank_count: a.skippedCount || 0,
          status: 'completed'
        }));
      }
    } catch (err) {
      console.warn('[mockExamService] API getUserExamAttempts error, using fallback:', err);
    }

    const attempts = getLocalData('supabase_mock_exam_attempts') || [];
    return attempts
      .filter(a => String(a.user_id) === String(userId) && String(a.exam_id) === String(examId) && a.status === 'completed' && (!a.retakeMode || a.retakeMode === 'full'))
      .sort((a, b) => b.started_at.localeCompare(a.started_at));
  },

  // ── Retrieve result details of an attempt ──
  async getExamResult(attemptId) {
    // Skip API call for local (localStorage-only) attempts
    const isLocal = String(attemptId).startsWith('attempt-') || Number(attemptId) > 1_000_000_000_000;
    if (!isLocal) {
    try {
      const attempt = await api.getAttemptResult(attemptId);
      if (attempt) {
        let rankLabel = 'Cần cải thiện';
        if (attempt.score >= 9) rankLabel = 'Xuất sắc';
        else if (attempt.score >= 8) rankLabel = 'Giỏi';
        else if (attempt.score >= 6.5) rankLabel = 'Khá';
        else if (attempt.score >= 5) rankLabel = 'Trung bình';

        const correctCount = attempt.correctCount || 0;
        const wrongCount = attempt.wrongCount || 0;
        const blankCount = attempt.skippedCount || 0;
        const totalQuestions = (correctCount + wrongCount + blankCount) || 1;
        const percentage = Math.round((correctCount / totalQuestions) * 10000) / 100;

        const mappedQuestions = (attempt.exam?.examQuestions || []).map((eq) => {
          const q = eq.question;
          const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
          const mappedOptions = (options || []).map((opt, optIdx) => ({
            id: `opt-${q.id}-${opt.label || opt.option_label || optIdx}`,
            question_id: String(q.id),
            option_label: opt.label || opt.option_label || String.fromCharCode(65 + optIdx),
            option_text: opt.content ?? opt.text ?? opt.option_text ?? opt.value ?? opt.option_content ?? '',
            is_correct: (opt.label || opt.option_label) === q.correctAnswer || opt.is_correct || opt.isCorrect || false
          }));

          return {
            id: String(q.id),
            exam_id: String(attempt.examId),
            question_number: eq.order,
            question_text: q.content,
            question_image_url: resolveUploadUrl(q.imageUrl || q.question_image_url),
            audio_url: q.audioUrl || null,
            question_type: 'multiple_choice_single',
            difficulty: q.difficulty === 'EASY' ? 'Dễ' : (q.difficulty === 'HARD' ? 'Khó' : 'Trung bình'),
            explanation: q.explanation || '',
            topic: q.topic || 'Kiến thức cốt lõi',
            options: mappedOptions
          };
        }).sort((a, b) => a.question_number - b.question_number);

        return {
          id: String(attempt.id),
          user_id: String(attempt.studentId),
          exam_id: String(attempt.examId),
          attempt_id: String(attempt.id),
          score: attempt.score,
          correct_count: correctCount,
          wrong_count: wrongCount,
          blank_count: blankCount,
          total_questions: totalQuestions,
          percentage,
          rank_label: rankLabel,
          ai_feedback: typeof attempt.aiFeedback === 'string' ? attempt.aiFeedback : JSON.stringify(attempt.aiFeedback),
          duration_seconds: attempt.durationUsed || 0,
          mock_exams: attempt.exam ? {
            title: attempt.exam.title,
            duration_minutes: attempt.exam.duration,
            total_questions: totalQuestions
          } : null,
          questions: mappedQuestions
        };
      }
    } catch (err) {
      console.warn('[mockExamService] API getExamResult error, using fallback:', err);
    }
    } // end if(!isLocal)

    // Fallback: Read from LocalStorage
    const results = getLocalData('supabase_mock_exam_results') || [];
    const result = results.find(r => String(r.attempt_id) === String(attemptId));
    if (result) {
      const exams = getLocalData('supabase_mock_exams') || [];
      const exam = exams.find(e => String(e.id) === String(result.exam_id));
      const allAnswers = getLocalData('supabase_mock_exam_answers') || [];
      const attemptAnswers = allAnswers.filter(a => String(a.attempt_id) === String(attemptId));

      // Build questions list from answers for Xem lại bài tab
      const questions = attemptAnswers.map((ans, idx) => ({
        id: String(ans.question_id || idx),
        exam_id: String(result.exam_id),
        question_number: ans.question_number || (idx + 1),
        question_text: ans.question_text || ans.content || '',
        question_image_url: ans.question_image_url || null,
        audio_url: ans.audio_url || null,
        question_type: 'multiple_choice_single',
        difficulty: ans.difficulty || 'Trung bình',
        explanation: ans.explanation || '',
        topic: ans.topic || 'Kiến thức cốt lõi',
        options: ans.options || []
      }));

      return {
        ...result,
        questions,
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
    // Skip API call for local attempts
    const isLocal = String(attemptId).startsWith('attempt-') || Number(attemptId) > 1_000_000_000_000;
    if (!isLocal) {
    try {
      const attempt = await api.getAttemptResult(attemptId);
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
    } // end if(!isLocal)

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
  },

  async recordViolation(attemptId) {
    try {
      await api.recordViolation(attemptId);
      return true;
    } catch (err) {
      console.warn('[mockExamService] recordViolation error:', err);
      return false;
    }
  },

  // ── NEW: Record a specific violation type and get updated trust score ──
  async recordViolationDetail(attemptId, violationType) {
    if (!attemptId || attemptId.toString().startsWith('guest')) return { autoSubmit: false };
    try {
      const res = await api.recordViolationDetail(attemptId, violationType);
      return {
        autoSubmit: res?.autoSubmit || false,
        examTrustScore: res?.examTrustScore ?? null,
        tabSwitchCount: res?.tabSwitchCount ?? 0,
        copyPasteCount: res?.copyPasteCount ?? 0,
        fullscreenExitCount: res?.fullscreenExitCount ?? 0
      };
    } catch (err) {
      console.warn('[mockExamService] recordViolationDetail error:', err);
      return { autoSubmit: false };
    }
  },

  // ── NEW: Record an exam event for replay ──
  async recordExamEvent(attemptId, eventType, questionId = null, payload = null) {
    if (!attemptId || attemptId.toString().startsWith('guest')) return;
    try {
      await api.recordExamEvent(attemptId, eventType, questionId, payload);
    } catch (err) {
      // Non-critical: silently fail
    }
  },

  // ── NEW: Get exam replay events ──
  async getExamEvents(attemptId) {
    try {
      const events = await api.getExamEvents(attemptId);
      return events || [];
    } catch (err) {
      console.warn('[mockExamService] getExamEvents error:', err);
      return [];
    }
  },

  // ── NEW: Generate AI coach plan for an attempt ──
  async generateAiCoach(attemptId) {
    let score = 0;
    let examTitle = 'Đề luyện thi';
    let subject = 'Toán học';
    let topicStats = {};
    let difficultyStats = {
      EASY: { correct: 0, total: 0, accuracy: 0 },
      MEDIUM: { correct: 0, total: 0, accuracy: 0 },
      HARD: { correct: 0, total: 0, accuracy: 0 }
    };
    let incorrectAnswers = [];

    const isLocal = String(attemptId).startsWith('attempt-') || Number(attemptId) > 1_000_000_000_000;
    const results = getLocalData('supabase_mock_exam_results') || [];
    const result = results.find(r => String(r.attempt_id) === String(attemptId));
    const savedAnswers = getLocalData('supabase_mock_exam_answers') || [];
    const attemptAnswers = savedAnswers.filter(a => String(a.attempt_id) === String(attemptId));

    if (result) {
      score = result.score || 0;
      examTitle = result.mock_exams?.title || result.exam_title || 'Đề luyện thi';
      subject = result.subject || result.mock_exams?.subject || 'Toán học';
    }

    const questions = (result?.questions && result.questions.length > 0)
      ? result.questions
      : attemptAnswers.map((ans, idx) => ({
          id: ans.question_id || String(idx),
          question_text: ans.question_text || ans.content || `Câu ${idx + 1}`,
          difficulty: ans.difficulty || 'Trung bình',
          topic: ans.topic || 'Kiến thức cốt lõi',
          explanation: ans.explanation || '',
          options: ans.options || []
        }));

    questions.forEach((q, idx) => {
      const ansObj = attemptAnswers.find(a => String(a.question_id) === String(q.id)) || attemptAnswers[idx];
      const isCorrect = ansObj ? ansObj.is_correct : false;
      const selectedLabel = ansObj ? ansObj.selected_option_label : null;

      const qDifficulty = q.difficulty === 'Dễ' ? 'EASY' : (q.difficulty === 'Khó' ? 'HARD' : 'MEDIUM');
      const qTopic = q.topic || 'Kiến thức cốt lõi';

      if (!topicStats[qTopic]) {
        topicStats[qTopic] = { correct: 0, total: 0, accuracy: 0 };
      }
      topicStats[qTopic].total++;
      if (isCorrect) topicStats[qTopic].correct++;

      if (difficultyStats[qDifficulty]) {
        difficultyStats[qDifficulty].total++;
        if (isCorrect) difficultyStats[qDifficulty].correct++;
      }

      if (!isCorrect) {
        incorrectAnswers.push({
          content: q.question_text || q.content,
          topic: qTopic,
          difficulty: qDifficulty,
          options: q.options?.map(o => ({ label: o.option_label || o.label, text: o.option_text || o.text })) || [],
          explanation: q.explanation || '',
          selectedAnswer: selectedLabel || 'Bỏ qua'
        });
      }
    });

    Object.keys(topicStats).forEach(t => {
      if (topicStats[t].total > 0) {
        topicStats[t].accuracy = topicStats[t].correct / topicStats[t].total;
      }
    });
    Object.keys(difficultyStats).forEach(d => {
      if (difficultyStats[d].total > 0) {
        difficultyStats[d].accuracy = difficultyStats[d].correct / difficultyStats[d].total;
      }
    });

    const bodyData = {
      score,
      examTitle,
      subject,
      topicStats,
      difficultyStats,
      incorrectAnswers
    };

    let coachPlan = null;
    try {
      coachPlan = await api.generateAiCoach(attemptId, bodyData);
    } catch (err) {
      console.warn('[mockExamService] api.generateAiCoach API call failed, generating fallback plan:', err);
    }

    // Fallback to local plan generator if API call failed or returned null
    if (!coachPlan) {
      const weakTopics = Object.keys(topicStats).filter(t => (topicStats[t].accuracy || 0) < 0.6);
      const strongTopics = Object.keys(topicStats).filter(t => (topicStats[t].accuracy || 0) >= 0.8);
      coachPlan = this._buildLocalCoachPlan(score, weakTopics, strongTopics, topicStats, examTitle, subject);
    }

    if (coachPlan && isLocal) {
      const updated = results.map(r => {
        if (String(r.attempt_id) === String(attemptId)) {
          let existingFeedback = {};
          if (r.ai_feedback) {
            try {
              existingFeedback = typeof r.ai_feedback === 'string' ? JSON.parse(r.ai_feedback) : r.ai_feedback;
            } catch (_) {}
          }
          return {
            ...r,
            ai_feedback: JSON.stringify({ ...existingFeedback, coachPlan })
          };
        }
        return r;
      });
      setLocalData('supabase_mock_exam_results', updated);
    }

    return coachPlan;
  },

  _buildLocalCoachPlan(score, weakTopics = [], strongTopics = [], topicStats = {}, examTitle = 'Đề luyện thi', subject = 'Toán học') {
    const subjectLower = (subject || '').toLowerCase();
    let summary = '';
    let motivationalMessage = '';
    
    if (score >= 9) {
      summary = `Kết quả xuất sắc! Bạn đạt ${score.toFixed(1)}/10 điểm trong đề thi "${examTitle}". Bạn đã làm chủ hầu hết các chủ đề chính. Điểm mạnh lớn nhất nằm ở khả năng tư duy và phản xạ câu hỏi tốt. Hãy duy trì nhịp độ và tập trung tối đa vào các câu hỏi phân hóa mức độ Vận dụng cao.`;
      motivationalMessage = 'Tuyệt vời! Bạn đang rất gần với điểm số tối đa. Hãy tiếp tục thử thách bản thân với các đề thi nâng cao!';
    } else if (score >= 7) {
      summary = `Kết quả Giỏi! Bạn đạt ${score.toFixed(1)}/10 điểm. Kiến thức nền tảng của bạn rất vững vàng, tuy nhiên bạn gặp một số lỗi sai ở các câu hỏi Thông hiểu nâng cao và Vận dụng${weakTopics.length > 0 ? `, tiêu biểu là các chủ đề: ${weakTopics.slice(0, 2).join(', ')}` : ''}. Cần ôn kỹ phương pháp giải nhanh để bứt phá.`;
      motivationalMessage = 'Điểm 9-10 đang nằm trong tầm tay của bạn. Tập trung khắc phục những lỗi sai nhỏ này nhé!';
    } else if (score >= 5) {
      summary = `Kết quả Khá/Trung bình. Bạn đạt ${score.toFixed(1)}/10 điểm. Bạn nắm được kiến thức căn bản ở mức Nhận biết, nhưng các phần Thông hiểu và Vận dụng còn thiếu sót nhiều${weakTopics.length > 0 ? `, đặc biệt là ở chủ đề: ${weakTopics.slice(0, 3).join(', ')}` : ''}. Bạn cần một kế hoạch lấp lỗ hổng bài bản trong tuần tới.`;
      motivationalMessage = 'Không sao cả! Hãy đi từ lý thuyết căn bản trước, luyện tập đều đặn và bạn sẽ thấy điểm số cải thiện rõ rệt.';
    } else {
      summary = `Kết quả chưa đạt kỳ vọng. Bạn đạt ${score.toFixed(1)}/10 điểm. Lỗ hổng kiến thức xuất hiện diện rộng từ lý thuyết Nhận biết đến bài tập Thông hiểu${weakTopics.length > 0 ? ` ở các chủ đề: ${weakTopics.slice(0, 3).join(', ')}` : ''}. Khuyến nghị bạn hãy tạm ngưng giải đề khó và quay về học kỹ sách giáo khoa, ghi nhớ công thức trước.`;
      motivationalMessage = 'Đường dài mới biết ngựa hay. Hãy bắt đầu từ những bước nhỏ nhất một cách kiên trì nhé!';
    }

    const allTopics = Object.keys(topicStats);
    const midTopics = allTopics.filter(t => !weakTopics.includes(t) && !strongTopics.includes(t));
    const studyOrder = [...weakTopics, ...midTopics, ...strongTopics];

    const isMath = subjectLower.includes('toán');
    const isChemistry = subjectLower.includes('hóa');
    const isPhysics = subjectLower.includes('lý');

    const t1 = studyOrder[0] || (isMath ? 'Giải tích' : isPhysics ? 'Cơ học' : isChemistry ? 'Hóa vô cơ' : 'Trọng tâm môn học');
    const t2 = studyOrder[1] || studyOrder[0] || (isMath ? 'Hình học không gian' : isPhysics ? 'Sóng cơ & Điện xoay chiều' : isChemistry ? 'Hóa hữu cơ' : 'Chủ đề chuyên sâu');

    const study_plan = [
      {
        day: 1,
        focus: `Củng cố lý thuyết & Công thức: ${t1}`,
        tasks: [
          `Xem lại định nghĩa, định lý và các công thức tính nhanh của chủ đề ${t1}.`,
          'Hệ thống hóa kiến thức bằng sơ đồ tư duy (Mindmap) để tránh nhầm lẫn.',
          'Làm 15 câu trắc nghiệm mức độ Nhận biết - Thông hiểu để kiểm tra độ hiểu sâu lý thuyết.'
        ],
        goal: 'Nắm chắc 100% công thức cốt lõi và các bẫy lý thuyết thường gặp'
      },
      {
        day: 2,
        focus: `Luyện tập chuyên đề Thông hiểu: ${t2}`,
        tasks: [
          `Luyện tập 20 bài toán liên quan đến chủ đề ${t2}.`,
          'Rèn luyện kỹ năng bấm máy tính / tính nhẩm để tối ưu hóa thời gian.',
          'Ghi chép lại các bẫy đề thi và phương án gây nhiễu.'
        ],
        goal: 'Tăng tốc độ làm bài dưới 1.5 phút/câu'
      },
      {
        day: 3,
        focus: `Chinh phục câu hỏi Vận dụng & Phân hóa`,
        tasks: [
          `Tập trung giải 10 bài tập tự luyện nâng cao thuộc chủ đề ${t1}.`,
          'Nghiên cứu kỹ lời giải chi tiết, ghi chú lại phương pháp tiếp cận tư duy.',
          'Tự giải lại các câu làm sai mà không nhìn gợi ý.'
        ],
        goal: 'Master các dạng toán phân hóa 8+'
      },
      {
        day: 4,
        focus: `Rà soát lại toàn bộ dạng bài làm sai trong đề thi`,
        tasks: [
          'Mở lại tính năng "Xem lại bài" và làm lại toàn bộ các câu hỏi đã chọn sai.',
          'Phân tích kỹ lý do sai (do tính toán ẩu hay hổng kiến thức) để rút kinh nghiệm.'
        ],
        goal: 'Triệt tiêu 100% lỗi sai cũ'
      },
      {
        day: 5,
        focus: `Luyện tập chuyên đề tổng hợp ${subject}`,
        tasks: [
          `Giải mini-test 20 câu tổng hợp kiến thức ${subject}.`,
          'Bấm giờ nghiêm túc 25 phút để tạo áp lực phòng thi.'
        ],
        goal: 'Duy trì nhịp độ phản xạ và nâng cao độ chính xác'
      },
      {
        day: 6,
        focus: `Thi thử full đề thi mới`,
        tasks: [
          `Đăng ký làm 1 đề thi thử full ${subject} trong phòng thi giả lập.`,
          'Áp dụng chiến thuật 30 phút đầu làm câu dễ, 20 phút sau làm câu phân hóa.'
        ],
        goal: 'Đánh giá sự tiến bộ thực tế sau 5 ngày ôn luyện'
      },
      {
        day: 7,
        focus: `Tổng kết & Chuẩn bị tinh thần`,
        tasks: [
          'Đọc lại sổ tay ghi chép lỗi sai và sơ đồ tư duy đã tạo.',
          'Nghỉ ngơi thư giãn nhẹ nhàng, sẵn sàng cho các mục tiêu tiếp theo.'
        ],
        goal: 'Cố định kiến thức và chuẩn bị thể trạng tốt nhất'
      }
    ];

    return {
      summary,
      strengths: strongTopics.length > 0 ? strongTopics : ['Tinh thần học tập và tự giác cao', 'Hoàn thành bài thi đúng thời gian'],
      weaknesses: weakTopics.length > 0 ? weakTopics : ['Cần rèn luyện thêm các câu hỏi phân hóa Vận dụng cao'],
      priority_topics: studyOrder.slice(0, 3).length > 0 ? studyOrder.slice(0, 3) : [t1, t2],
      study_plan,
      motivational_message: motivationalMessage
    };
  },

  // ── NEW: Generate a similar question via AI ──
  async generateSimilarQuestion(payload) {
    try {
      const res = await api.generateSimilarQuestion(payload);
      if (res && res.success) {
        return res.data;
      }
      throw new Error("Simulate fallback");
    } catch (err) {
      console.warn('[mockExamService] API generateSimilarQuestion error, using local fallback:', err);
      // Fallback: modify the original question payload slightly to look similar
      const originalOptions = Array.isArray(payload.options) 
        ? payload.options 
        : (typeof payload.options === 'string' ? JSON.parse(payload.options) : []);
      
      const parsedOptions = originalOptions.map(o => ({
        label: o.option_label || o.label || '',
        text: o.option_text || o.text || ''
      }));

      // Find correct answer index
      const correctOpt = originalOptions.find(o => o.is_correct || o.isCorrect || o.label === payload.correctAnswer || o.option_label === payload.correctAnswer);
      const correctAnswer = correctOpt ? (correctOpt.option_label || correctOpt.label) : 'A';

      return {
        content: `[Tương tự AI] Câu hỏi mới tương đương cho chủ đề: ${payload.topic || 'Kiến thức cốt lõi'}.\nĐề bài: Cho dữ kiện tương tự như câu hỏi gốc: "${payload.content || payload.question_text || ''}". Hãy tìm đáp án đúng.`,
        options: parsedOptions,
        correctAnswer: correctAnswer,
        explanation: `Hướng dẫn giải chi tiết cho câu hỏi tương tự:\n1. Phân tích đề bài và áp dụng công thức tương ứng.\n2. Đáp án đúng là ${correctAnswer} theo cách suy luận của chủ đề ${payload.topic || 'Kiến thức'}.`,
        topic: payload.topic || 'Kiến thức cốt lõi',
        difficulty: payload.difficulty || 'MEDIUM'
      };
    }
  },

  // ── Helper: build topicStats and difficultyStats from attemptAnswers ──
  _buildAnalyticsFromAnswers(attemptAnswers = []) {
    const topicStats = {};
    const difficultyStats = {};

    attemptAnswers.forEach(ans => {
      const q = ans.question || {};
      const topic = q.topic || ans.topic || 'Kiến thức chung';
      const difficulty = q.difficulty || ans.difficulty || 'MEDIUM';
      const isCorrect = ans.isCorrect ?? ans.is_correct ?? false;

      // Topic stats
      if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0, accuracy: 0 };
      topicStats[topic].total++;
      if (isCorrect) topicStats[topic].correct++;
      topicStats[topic].accuracy = topicStats[topic].correct / topicStats[topic].total;

      // Difficulty stats
      if (!difficultyStats[difficulty]) difficultyStats[difficulty] = { total: 0, correct: 0, accuracy: 0 };
      difficultyStats[difficulty].total++;
      if (isCorrect) difficultyStats[difficulty].correct++;
      difficultyStats[difficulty].accuracy = difficultyStats[difficulty].correct / difficultyStats[difficulty].total;
    });

    return { topicStats, difficultyStats };
  },

  // ── NEW: Get topicStats and difficultyStats from a submitted attempt ──
  async getAttemptAnalytics(attemptId) {
    // Skip API call for local attempts
    const isLocal = String(attemptId).startsWith('attempt-') || Number(attemptId) > 1_000_000_000_000;
    if (!isLocal) {
    try {
      const attempt = await api.getAttemptResult(attemptId);
      if (!attempt) return null;

      // Build analytics dynamically from attemptAnswers (backend doesn't store topicStats separately)
      const answers = attempt.attemptAnswers || [];
      const { topicStats, difficultyStats } = this._buildAnalyticsFromAnswers(answers);

      return {
        topicStats,
        difficultyStats,
        examTrustScore: attempt.examTrustScore ?? null,
        tabSwitchCount: attempt.tabSwitchCount || 0,
        copyPasteCount: attempt.copyPasteCount || 0,
        fullscreenExitCount: attempt.fullscreenExitCount || 0
      };
    } catch (err) {
      console.warn('[mockExamService] getAttemptAnalytics error, using localStorage fallback:', err);
    }
    } // end if(!isLocal)

    // Fallback: read topicStats and difficultyStats from ai_feedback in localStorage
    const results = getLocalData('supabase_mock_exam_results') || [];
    const result = results.find(r => String(r.attempt_id) === String(attemptId));
    if (result) {
      try {
        const fb = typeof result.ai_feedback === 'string'
          ? JSON.parse(result.ai_feedback)
          : (result.ai_feedback || {});
        // Also try to compute from stored answers
        const allAnswers = getLocalData('supabase_mock_exam_answers') || [];
        const attemptAnswers = allAnswers.filter(a => String(a.attempt_id) === String(attemptId));
        if (attemptAnswers.length > 0) {
          const { topicStats, difficultyStats } = this._buildAnalyticsFromAnswers(attemptAnswers);
          return { topicStats, difficultyStats, examTrustScore: null, tabSwitchCount: 0, copyPasteCount: 0, fullscreenExitCount: 0 };
        }
        return {
          topicStats: fb.topicStats || {},
          difficultyStats: fb.difficultyStats || {},
          examTrustScore: null,
          tabSwitchCount: 0,
          copyPasteCount: 0,
          fullscreenExitCount: 0
        };
      } catch (_) {}
    }
    return null;
  },

  // ── NEW: Create a smart retake session ──
  async createSmartRetake(examId, mode, attemptId = null) {
    try {
      let realExamId = examId;
      if (parseInt(examId, 10) > 1000) {
        const generatedList = getLocalData('supabase_mock_exams') || [];
        const found = generatedList.find(e => String(e.id) === String(examId));
        if (found && found.dbExamId) {
          realExamId = found.dbExamId;
        }
      }
      const res = await api.createSmartRetake(realExamId, mode, attemptId);
      return res;
    } catch (err) {
      console.warn('[mockExamService] API createSmartRetake error, using local fallback:', err);
      
      const exams = getLocalData('supabase_mock_exams') || [];
      const exam = exams.find(e => String(e.id) === String(examId));
      if (!exam) throw new Error('Không tìm thấy đề thi!');

      const allQuestions = await this.getExamQuestions(examId);
      let filteredQuestions = [...allQuestions];

      if (mode === 'wrong_only' && attemptId) {
        const savedAnswers = getLocalData('supabase_mock_exam_answers') || [];
        const attemptAnswers = savedAnswers.filter(a => String(a.attempt_id) === String(attemptId));
        const wrongQIds = attemptAnswers.filter(a => !a.is_correct).map(a => String(a.question_id));
        
        if (wrongQIds.length > 0) {
          filteredQuestions = allQuestions.filter(q => wrongQIds.includes(String(q.id)));
        } else {
          // If no wrong answers, default to hard questions
          filteredQuestions = allQuestions.filter(q => q.difficulty === 'Khó');
          if (filteredQuestions.length === 0) filteredQuestions = allQuestions;
        }
      } else if (mode === 'weak_topic' && attemptId) {
        const results = getLocalData('supabase_mock_exam_results') || [];
        const result = results.find(r => String(r.attempt_id) === String(attemptId));
        let aiFeedback = {};
        if (result && result.ai_feedback) {
          try {
            aiFeedback = typeof result.ai_feedback === 'string' ? JSON.parse(result.ai_feedback) : result.ai_feedback;
          } catch (_) {}
        }
        const tStats = aiFeedback.topicStats || {};
        const sortedTopics = Object.entries(tStats)
          .map(([topic, stat]) => ({ topic, accuracy: stat.accuracy || 0 }))
          .sort((a, b) => a.accuracy - b.accuracy);
        
        const weakTopics = sortedTopics.filter(t => t.accuracy < 0.6).map(t => t.topic);
        if (weakTopics.length > 0) {
          filteredQuestions = allQuestions.filter(q => weakTopics.includes(q.topic));
        } else if (sortedTopics.length > 0) {
          filteredQuestions = allQuestions.filter(q => q.topic === sortedTopics[0].topic);
        }
      } else if (mode === 'ai_similar') {
        filteredQuestions = allQuestions.map((q, idx) => ({
          ...q,
          question_text: `[Tương tự AI] ${q.question_text || q.content || ''}`,
          question_number: idx + 1
        }));
      } else if (mode === 'wrong_similar') {
        let baseQs = [];
        if (attemptId) {
          const savedAnswers = getLocalData('supabase_mock_exam_answers') || [];
          const attemptAnswers = savedAnswers.filter(a => String(a.attempt_id) === String(attemptId));
          const wrongQIds = attemptAnswers.filter(a => !a.is_correct).map(a => String(a.question_id));
          if (wrongQIds.length > 0) {
            baseQs = allQuestions.filter(q => wrongQIds.includes(String(q.id)));
          }
        }
        if (baseQs.length === 0) {
          baseQs = allQuestions.filter(q => q.difficulty === 'Khó');
          if (baseQs.length === 0) baseQs = allQuestions;
        }
        filteredQuestions = baseQs.map((q, idx) => ({
          ...q,
          question_text: `[Tương tự AI — Câu sai] ${q.question_text || q.content || ''}`,
          question_number: idx + 1
        }));
      }

      const questions = filteredQuestions.map((q, idx) => {
        const dbOptions = q.options?.map(o => ({
          label: o.option_label || o.label || '',
          text: o.option_text || o.text || ''
        })) || [];

        let dbDifficulty = 'MEDIUM';
        if (q.difficulty === 'Dễ') dbDifficulty = 'EASY';
        else if (q.difficulty === 'Khó') dbDifficulty = 'HARD';

        return {
          id: Number(q.id) || -200 - idx,
          content: q.question_text || q.content || '',
          options: dbOptions,
          subject: exam.subject || '',
          topic: q.topic || 'Kiến thức cốt lõi',
          difficulty: dbDifficulty,
          imageUrl: q.question_image_url || q.imageUrl || null,
          explanation: q.explanation || '',
          question_number: idx + 1
        };
      });

      const modeLabel = {
        wrong_only: 'Làm lại câu sai',
        weak_topic: 'Luyện chủ đề yếu',
        ai_similar: 'Đề tương tự AI 🤖',
        wrong_similar: 'Đề tương tự câu sai AI 🤖',
        full: 'Thi lại full đề'
      };

      return {
        exam: {
          id: Number(exam.id) || exam.id,
          title: `${exam.title} — ${modeLabel[mode] || 'Ôn luyện'}`,
          subject: exam.subject || '',
          duration: mode === 'full' ? exam.duration_minutes : Math.max(15, Math.ceil(questions.length * 1.5)),
          totalQuestions: questions.length,
          retakeMode: mode,
          sourceExamId: exam.id,
          sourceAttemptId: attemptId || null
        },
        questions
      };
    }
  },

  // ── NEW: Generate topic practice exam (max 15 questions from Question Bank) ──
  async createTopicPracticeExam(topic, examId = null) {
    try {
      let allTopicQs = [];

      // Try fetching questions for topic from API / Question Bank
      try {
        const questionsFromBank = await api.getQuestionsByTopic(topic);
        if (Array.isArray(questionsFromBank) && questionsFromBank.length > 0) {
          allTopicQs = questionsFromBank;
        }
      } catch (e) {}

      // If API didn't return or was empty, search current exam questions or DB
      if (allTopicQs.length === 0 && examId) {
        const examQs = await this.getExamQuestions(examId);
        allTopicQs = examQs.filter(q => q.topic === topic || !topic);
        if (allTopicQs.length === 0) {
          allTopicQs = examQs;
        }
      }

      // Limit to max 15 questions
      const selectedQs = allTopicQs.slice(0, 15);

      const mappedQuestions = selectedQs.map((q, idx) => {
        const options = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []);
        const mappedOptions = (options || []).map((opt, optIdx) => ({
          id: `opt-${q.id}-${opt.label || opt.option_label || optIdx}`,
          question_id: String(q.id),
          option_label: opt.label || opt.option_label || String.fromCharCode(65 + optIdx),
          option_text: opt.content ?? opt.text ?? opt.option_text ?? opt.value ?? opt.option_content ?? '',
          is_correct: (opt.label || opt.option_label) === q.correctAnswer || opt.is_correct || opt.isCorrect || false
        }));

        let diffLabel = 'Trung bình';
        if (q.difficulty === 'EASY' || q.difficulty === 'Dễ') diffLabel = 'Dễ';
        else if (q.difficulty === 'HARD' || q.difficulty === 'Khó') diffLabel = 'Khó';

        const rawImg = q.imageUrl || q.question_image_url || null;
        const formattedImg = resolveUploadUrl(rawImg);

        return {
          id: Number(q.id) || idx + 1,
          content: q.question_text || q.content || '',
          options: mappedOptions,
          subject: q.subject || 'Toán học',
          topic: q.topic || topic || 'Chủ đề ôn tập',
          difficulty: diffLabel,
          imageUrl: formattedImg,
          question_image_url: formattedImg,
          explanation: q.explanation || '',
          question_number: idx + 1
        };
      });

      return {
        exam: {
          id: Number(examId) || 211,
          title: `Luyện chuyên sâu chủ đề: ${topic}`,
          subject: mappedQuestions[0]?.subject || 'Toán học',
          duration: Math.max(10, Math.ceil(mappedQuestions.length * 2)),
          totalQuestions: mappedQuestions.length,
          retakeMode: 'topic_practice',
          sourceExamId: Number(examId) || 211
        },
        questions: mappedQuestions
      };
    } catch (err) {
      console.error('[mockExamService] createTopicPracticeExam error:', err);
      throw err;
    }
  },

  async importExam(examData) {
    try {
      const res = await api.importExam(examData);
      return res;
    } catch (err) {
      console.error('[mockExamService] importExam error:', err);
      throw err;
    }
  }
};
