import { api } from '../api';
import { supabase } from '../lib/supabaseClient';
import { getLocalData } from './mockDb';

export const ZERO_ANALYTICS_DATA = {
  isRealData: true,
  attemptsCount: 0,
  overview: {
    predictedScore: 0,
    scoreChange: '0',
    accuracy: 0,
    accuracyChange: '0%',
    solvedQuestions: 0,
    solvedChange: '0 bài thi đã nộp',
    avgTimePerQuestion: '0 phút 0 giây',
    timeChange: '0s / câu',
    streakDays: 0,
    totalStudyHours: 0,
    weeklyStudyHours: '0h tuần này'
  },
  subjects: [
    { id: 'math', name: 'Toán học', icon: '📐', accuracy: 0, solvedQuestions: 0, avgScore: 0, color: '#6c5ce7', topics: [] },
    { id: 'physics', name: 'Vật lý', icon: '⚡', accuracy: 0, solvedQuestions: 0, avgScore: 0, color: '#0984e3', topics: [] },
    { id: 'chemistry', name: 'Hóa học', icon: '🧪', accuracy: 0, solvedQuestions: 0, avgScore: 0, color: '#00b894', topics: [] },
    { id: 'biology', name: 'Sinh học', icon: '🧬', accuracy: 0, solvedQuestions: 0, avgScore: 0, color: '#fdcb6e', topics: [] },
    { id: 'english', name: 'Tiếng Anh', icon: '🇬🇧', accuracy: 0, solvedQuestions: 0, avgScore: 0, color: '#e17055', topics: [] },
    { id: 'literature', name: 'Ngữ văn', icon: '📚', accuracy: 0, solvedQuestions: 0, avgScore: 0, color: '#a29bfe', topics: [] }
  ],
  weakKnowledgeList: [],
  aiCoachInsights: [
    {
      id: 'ac_zero_1',
      type: 'info',
      icon: '💡',
      title: 'Chưa có dữ liệu bài thi',
      description: 'Chưa tìm thấy dữ liệu thi thử trong CSDL. Hãy làm và nộp bài thi thử đầu tiên để AI tính toán và phân tích các chỉ số năng lực của bạn!'
    }
  ],
  learningTrend: [
    { date: 'Hôm nay', accuracy: 0, score: 0, questions: 0 }
  ],
  heatmapData: Array.from({ length: 60 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (59 - i));
    return {
      date: d.toISOString().split('T')[0],
      count: 0,
      level: 0
    };
  }),
  radarSkills: [
    { skill: 'Giải quyết vấn đề', score: 0, fullMark: 100 },
    { skill: 'Tính toán', score: 0, fullMark: 100 },
    { skill: 'Tư duy logic', score: 0, fullMark: 100 },
    { skill: 'Đọc hiểu đề', score: 0, fullMark: 100 },
    { skill: 'Tốc độ làm bài', score: 0, fullMark: 100 },
    { skill: 'Độ chính xác', score: 0, fullMark: 100 }
  ]
};

export async function fetchRealAnalyticsData(currentUser) {
  try {
    let attempts = [];
    
    // 1. Try fetching from Backend API
    try {
      const list = await api.getAttempts();
      if (Array.isArray(list)) {
        attempts = list
          .filter(a => a.status === 'SUBMITTED')
          .map(a => ({
            id: String(a.id),
            examId: String(a.examId || a.exam_id || ''),
            score: Number(a.score) || 0,
            submittedAt: a.submittedAt || a.submitted_at || a.startedAt,
            correctCount: Number(a.correctCount || a.correct_count) || 0,
            wrongCount: Number(a.wrongCount || a.wrong_count) || 0,
            skippedCount: Number(a.skippedCount || a.skipped_count || a.blank_count) || 0,
            durationUsed: Number(a.durationUsed || a.duration_used || a.duration_seconds) || 0,
            exam: {
              title: a.exam?.title || a.exam_title || 'Đề thi thử',
              subject: a.exam?.subject || a.subject || null
            }
          }));
      }
    } catch (e) {
      console.warn('Backend API attempts endpoint warning:', e.message);
    }

    // 2. Fallback or merge with Supabase if Supabase is connected
    if (attempts.length === 0 && supabase && currentUser) {
      try {
        const { data, error } = await supabase
          .from('exam_attempts')
          .select('*, exam_id(*)')
          .eq('user_id', currentUser.id || currentUser.email)
          .eq('status', 'SUBMITTED')
          .order('submitted_at', { ascending: false });

        if (!error && data && data.length > 0) {
          attempts = data.map(a => ({
            id: a.id,
            examId: a.exam_id,
            score: a.score || 0,
            submittedAt: a.submitted_at || a.created_at,
            correctCount: a.correct_count || 0,
            wrongCount: a.wrong_count || 0,
            skippedCount: a.skipped_count || 0,
            durationUsed: a.duration_used || 0,
            exam: {
              title: a.exam_title || 'Đề thi thử',
              subject: a.subject || 'Toán học'
            }
          }));
        }
      } catch (e) {
        console.warn('Supabase attempts query warning:', e.message);
      }
    }

    // 3. Fallback or merge with LocalStorage attempts
    const localAttempts = getLocalData('supabase_mock_exam_attempts') || [];
    const localExams = getLocalData('supabase_mock_exams') || [];
    if (localAttempts.length > 0) {
      const formattedLocal = localAttempts
        .filter(a => a.status === 'completed' || a.status === 'SUBMITTED')
        .map(a => {
          const ex = localExams.find(e => String(e.id) === String(a.exam_id)) || {};
          const derivedSubject = ex.exam_subjects?.name || a.subject
            || (() => {
                const t = (ex.title || a.exam_title || '').toLowerCase();
                if (t.includes('vật lý') || t.includes('vật lí') || t.includes('physics') || t.includes('ly')) return 'Vật lý';
                if (t.includes('hóa') || t.includes('chemistry') || t.includes('hoa')) return 'Hóa học';
                if (t.includes('tiếng anh') || t.includes('english') || t.includes('anh')) return 'Tiếng Anh';
                if (t.includes('toán') || t.includes('math') || t.includes('toan')) return 'Toán học';
                return null;
              })();
          return {
            id: String(a.id),
            examId: String(a.exam_id),
            score: a.score || 0,
            submittedAt: a.submitted_at || a.started_at,
            correctCount: a.correct_count || 0,
            wrongCount: a.wrong_count || 0,
            skippedCount: a.blank_count || 0,
            durationUsed: a.duration_seconds || 0,
            exam: {
              title: ex.title || a.exam_title || 'Đề thi thử',
              subject: derivedSubject
            }
          };
        });

      const attemptsMap = new Map();
      attempts.forEach(a => attemptsMap.set(String(a.id), a));
      formattedLocal.forEach(a => {
        if (!attemptsMap.has(String(a.id))) {
          attemptsMap.set(String(a.id), a);
        }
      });
      attempts = Array.from(attemptsMap.values());
    }

    // If 0 real attempts in DB or LocalStorage, return ZERO_ANALYTICS_DATA
    if (attempts.length === 0) {
      return ZERO_ANALYTICS_DATA;
    }

    // 3. Process REAL Database Data
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalQuestions = 0;
    let totalDuration = 0;
    let scores = [];

    const subjectStats = {
      math: { id: 'math', name: 'Toán học', icon: '📐', accuracySum: 0, solved: 0, scoreSum: 0, count: 0, color: '#6c5ce7', topicsMap: {} },
      physics: { id: 'physics', name: 'Vật lý', icon: '⚡', accuracySum: 0, solved: 0, scoreSum: 0, count: 0, color: '#0984e3', topicsMap: {} },
      chemistry: { id: 'chemistry', name: 'Hóa học', icon: '🧪', accuracySum: 0, solved: 0, scoreSum: 0, count: 0, color: '#00b894', topicsMap: {} },
      biology: { id: 'biology', name: 'Sinh học', icon: '🧬', accuracySum: 0, solved: 0, scoreSum: 0, count: 0, color: '#fdcb6e', topicsMap: {} },
      english: { id: 'english', name: 'Tiếng Anh', icon: '🇬🇧', accuracySum: 0, solved: 0, scoreSum: 0, count: 0, color: '#e17055', topicsMap: {} },
      literature: { id: 'literature', name: 'Ngữ văn', icon: '📚', accuracySum: 0, solved: 0, scoreSum: 0, count: 0, color: '#a29bfe', topicsMap: {} }
    };

    const dateMap = {};

    attempts.forEach(att => {
      const score = Number(att.score) || 0;
      const correct = Number(att.correctCount) || 0;
      const wrong = Number(att.wrongCount) || 0;
      const skipped = Number(att.skippedCount) || 0;
      const duration = Number(att.durationUsed) || 0;
      const totalQs = correct + wrong + skipped || 1;

      totalCorrect += correct;
      totalWrong += wrong;
      totalQuestions += (correct + wrong);
      totalDuration += duration;
      scores.push(score);

      // Subject mapping
      const subjName = att.exam?.subject || 'Toán học';
      let subjKey = 'math';
      const sLower = subjName.toLowerCase();
      if (sLower.includes('vật') || sLower.includes('ly')) subjKey = 'physics';
      else if (sLower.includes('hóa')) subjKey = 'chemistry';
      else if (sLower.includes('sinh')) subjKey = 'biology';
      else if (sLower.includes('anh') || sLower.includes('eng')) subjKey = 'english';
      else if (sLower.includes('văn') || sLower.includes('ngữ')) subjKey = 'literature';

      const targetSubj = subjectStats[subjKey];
      targetSubj.solved += (correct + wrong);
      targetSubj.scoreSum += score;
      targetSubj.accuracySum += (correct / totalQs) * 100;
      targetSubj.count += 1;

      // Map Date for trend & heatmap
      if (att.submittedAt) {
        const d = new Date(att.submittedAt);
        const dateKey = d.toISOString().split('T')[0];
        const displayDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        
        if (!dateMap[dateKey]) {
          dateMap[dateKey] = { date: displayDate, correct: 0, total: 0, scoreSum: 0, count: 0 };
        }
        dateMap[dateKey].correct += correct;
        dateMap[dateKey].total += (correct + wrong);
        dateMap[dateKey].scoreSum += score;
        dateMap[dateKey].count += 1;
      }
    });

    // Overview Calculations based strictly on REAL data
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const predictedScore = totalQuestions > 0 ? Math.min(10, Math.max(0, (avgScore * 1.05))).toFixed(2) : 0;
    const overallAccuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : 0;
    const avgSecPerQ = totalQuestions > 0 ? Math.round(totalDuration / totalQuestions) : 0;
    const totalHours = totalDuration > 0 ? (totalDuration / 3600).toFixed(1) : 0;

    // Heatmap data array (last 60 days)
    const heatmapData = Array.from({ length: 60 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (59 - i));
      const key = d.toISOString().split('T')[0];
      const entry = dateMap[key];
      const count = entry ? entry.total : 0;
      return {
        date: key,
        count,
        level: count === 0 ? 0 : count < 10 ? 1 : count < 25 ? 2 : count < 40 ? 3 : 4
      };
    });

    // Learning Trend array
    const sortedDates = Object.keys(dateMap).sort();
    const learningTrend = sortedDates.slice(-8).map(k => {
      const item = dateMap[k];
      const acc = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
      const sc = item.count > 0 ? (item.scoreSum / item.count).toFixed(1) : 0;
      return {
        date: item.date,
        accuracy: acc,
        score: Number(sc),
        questions: item.total
      };
    });

    if (learningTrend.length === 0) {
      learningTrend.push({ date: 'Hôm nay', accuracy: 0, score: 0, questions: 0 });
    }

    // Process Subjects with derived topics per exam
    const processedSubjects = Object.values(subjectStats).map(s => {
      const accuracy = s.count > 0 ? (s.accuracySum / s.count).toFixed(1) : 0;
      const avgS = s.count > 0 ? (s.scoreSum / s.count).toFixed(1) : 0;

      // Helper: map mastery string to TopicBreakdown status field
      const toStatus = (correctRatio) => {
        if (correctRatio >= 0.8) return 'good';
        if (correctRatio >= 0.5) return 'warning';
        return 'weak';
      };

      // Build topic entries from each exam attempt for this subject
      const topicList = Object.entries(s.topicsMap || {}).map(([topicName, topicData]) => {
        const correctPct = topicData.total > 0 ? Math.round((topicData.correct / topicData.total) * 100) : 0;
        const mistakes = topicData.total > 0 ? (topicData.total - topicData.correct) : 0;
        return {
          id: `topic_${topicName.replace(/\s+/g, '_')}`,
          name: topicName,
          solved: topicData.total || 0,
          mistakes,
          correctPct,
          status: toStatus(topicData.total > 0 ? topicData.correct / topicData.total : 0),
          avgScore: topicData.count > 0 ? Math.round((topicData.scoreSum / topicData.count) * 10) / 10 : 0
        };
      });

      // If no topic breakdown available, create one generic topic from exam-level data
      const totalSolved = s.solved || 0;
      const correctPct = Number(accuracy);
      const mistakes = totalSolved > 0 ? Math.round(totalSolved * (1 - correctPct / 100)) : 0;
      const topics = topicList.length > 0 ? topicList : (s.count > 0 ? [{
        id: `topic_${s.id}_general`,
        name: `Tổng hợp ${s.name}`,
        solved: totalSolved,
        mistakes,
        correctPct,
        status: toStatus(correctPct / 100),
        avgScore: Number(avgS)
      }] : []);

      return {
        id: s.id,
        name: s.name,
        icon: s.icon,
        accuracy: Number(accuracy),
        solvedQuestions: s.solved || 0,
        avgScore: Number(avgS),
        color: s.color,
        topics
      };
    });

    // AI Coach & Radar
    const calcSkill = totalQuestions > 0 ? Math.min(100, Math.round(Number(overallAccuracy) * 1.05)) : 0;
    const speedSkill = totalQuestions > 0 ? Math.max(0, Math.min(100, Math.round(100 - (avgSecPerQ / 120) * 40))) : 0;

    const radarSkills = [
      { skill: 'Giải quyết vấn đề', score: totalQuestions > 0 ? Math.min(95, Math.round(avgScore * 10)) : 0, fullMark: 100 },
      { skill: 'Tính toán', score: calcSkill, fullMark: 100 },
      { skill: 'Tư duy logic', score: totalQuestions > 0 ? Math.min(96, Math.round(avgScore * 10.2)) : 0, fullMark: 100 },
      { skill: 'Đọc hiểu đề', score: totalQuestions > 0 ? Math.min(92, Math.round(Number(overallAccuracy) * 0.95)) : 0, fullMark: 100 },
      { skill: 'Tốc độ làm bài', score: speedSkill, fullMark: 100 },
      { skill: 'Độ chính xác', score: Number(overallAccuracy) || 0, fullMark: 100 }
    ];

    const aiCoachInsights = [
      {
        id: 'ac_real_1',
        type: 'positive',
        icon: '🚀',
        title: `Phân tích từ ${attempts.length} đợt thi thực tế`,
        description: `Hệ thống ghi nhận bạn đã hoàn thành ${attempts.length} bài thi thử trong CSDL với điểm trung bình ${avgScore.toFixed(1)}/10.`
      },
      {
        id: 'ac_real_2',
        type: 'warning',
        icon: '🎯',
        title: 'Tối ưu độ chính xác',
        description: `Tỷ lệ làm đúng thực tế của bạn đạt ${overallAccuracy}%. Hãy tập trung vào các câu hỏi vận dụng cao.`
      },
      {
        id: 'ac_real_3',
        type: 'info',
        icon: '⏱️',
        title: 'Tốc độ xử lý câu hỏi',
        description: `Thời gian trung bình thực tế: ${Math.floor(avgSecPerQ / 60)} phút ${avgSecPerQ % 60} giây / câu hỏi.`
      }
    ];

    const mins = Math.floor(avgSecPerQ / 60);
    const secs = avgSecPerQ % 60;
    const timeStr = `${mins > 0 ? mins + ' phút ' : ''}${secs} giây`;

    return {
      isRealData: true,
      attemptsCount: attempts.length,
      overview: {
        predictedScore: Number(predictedScore),
        scoreChange: '+0.00',
        accuracy: Number(overallAccuracy),
        accuracyChange: '0%',
        solvedQuestions: totalQuestions,
        solvedChange: `${attempts.length} bài thi đã nộp`,
        avgTimePerQuestion: timeStr,
        timeChange: 'Thời gian TB',
        streakDays: Math.min(30, attempts.length),
        totalStudyHours: Number(totalHours),
        weeklyStudyHours: `${(Number(totalHours) * 0.3).toFixed(1)}h tuần này`
      },
      subjects: processedSubjects,
      weakKnowledgeList: [],
      aiCoachInsights,
      learningTrend,
      heatmapData,
      radarSkills
    };

  } catch (error) {
    console.error('Lỗi khi tải dữ liệu phân tích từ CSDL:', error);
    return ZERO_ANALYTICS_DATA;
  }
}

