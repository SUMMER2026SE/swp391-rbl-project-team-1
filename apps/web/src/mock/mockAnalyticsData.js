export const MOCK_ANALYTICS_DATA = {
  overview: {
    predictedScore: 8.75,
    scoreChange: '+0.45',
    accuracy: 84.2,
    accuracyChange: '+2.1%',
    solvedQuestions: 1280,
    solvedChange: '+140 tuần này',
    avgTimePerQuestion: '1 phút 12 giây',
    timeChange: '-8s / câu',
    streakDays: 14,
    totalStudyHours: 48.5,
    weeklyStudyHours: '6.2h tuần này'
  },

  subjects: [
    {
      id: 'math',
      name: 'Toán học',
      icon: '📐',
      accuracy: 86.5,
      solvedQuestions: 420,
      avgScore: 8.6,
      color: '#6c5ce7',
      topics: [
        { id: 'm1', name: 'Hàm số & Đồ thị', correctPct: 92, solved: 120, status: 'safe', mistakes: 10 },
        { id: 'm2', name: 'Mũ & Logarit', correctPct: 84, solved: 85, status: 'safe', mistakes: 14 },
        { id: 'm3', name: 'Hình học không gian Oxyz', correctPct: 62, solved: 75, status: 'warning', mistakes: 28 },
        { id: 'm4', name: 'Xác suất & Thống kê', correctPct: 41, solved: 60, status: 'weak', mistakes: 35 },
        { id: 'm5', name: 'Tích phân & Nguyên hàm', correctPct: 78, solved: 80, status: 'safe', mistakes: 18 }
      ]
    },
    {
      id: 'physics',
      name: 'Vật lý',
      icon: '⚡',
      accuracy: 88.0,
      solvedQuestions: 350,
      avgScore: 8.8,
      color: '#0984e3',
      topics: [
        { id: 'p1', name: 'Vật lý Nhiệt & Khí', correctPct: 91, solved: 110, status: 'safe', mistakes: 10 },
        { id: 'p2', name: 'Từ trường & Cảm ứng điện từ', correctPct: 89, solved: 95, status: 'safe', mistakes: 11 },
        { id: 'p3', name: 'Vật lý Hạt nhân', correctPct: 72, solved: 80, status: 'warning', mistakes: 22 },
        { id: 'p4', name: 'Giao thoa ánh sáng', correctPct: 82, solved: 65, status: 'safe', mistakes: 12 }
      ]
    },
    {
      id: 'chemistry',
      name: 'Hóa học',
      icon: '🧪',
      accuracy: 79.4,
      solvedQuestions: 210,
      avgScore: 7.9,
      color: '#00b894',
      topics: [
        { id: 'c1', name: 'Este & Lipit', correctPct: 85, solved: 70, status: 'safe', mistakes: 11 },
        { id: 'c2', name: 'Cacbohiđrat & Polime', correctPct: 80, solved: 55, status: 'safe', mistakes: 11 },
        { id: 'c3', name: 'Kim loại & Dung dịch', correctPct: 58, solved: 85, status: 'weak', mistakes: 36 }
      ]
    },
    {
      id: 'biology',
      name: 'Sinh học',
      icon: '🧬',
      accuracy: 81.2,
      solvedQuestions: 110,
      avgScore: 8.1,
      color: '#fdcb6e',
      topics: [
        { id: 'b1', name: 'Cơ chế di truyền & Biến dị', correctPct: 88, solved: 60, status: 'safe', mistakes: 7 },
        { id: 'b2', name: 'Quy luật di truyền Mendơ', correctPct: 74, solved: 50, status: 'warning', mistakes: 13 }
      ]
    },
    {
      id: 'english',
      name: 'Tiếng Anh',
      icon: '🇬🇧',
      accuracy: 85.0,
      solvedQuestions: 130,
      avgScore: 8.5,
      color: '#e17055',
      topics: [
        { id: 'e1', name: 'Ngữ pháp & Trọng âm', correctPct: 90, solved: 70, status: 'safe', mistakes: 7 },
        { id: 'e2', name: 'Đọc hiểu & Từ vựng', correctPct: 80, solved: 60, status: 'safe', mistakes: 12 }
      ]
    },
    {
      id: 'literature',
      name: 'Ngữ văn',
      icon: '📚',
      accuracy: 76.0,
      solvedQuestions: 60,
      avgScore: 7.6,
      color: '#a29bfe',
      topics: [
        { id: 'l1', name: 'Nghị luận xã hội', correctPct: 82, solved: 30, status: 'safe', mistakes: 5 },
        { id: 'l2', name: 'Nghị luận văn học', correctPct: 70, solved: 30, status: 'warning', mistakes: 9 }
      ]
    }
  ],

  weakKnowledgeList: [
    {
      id: 'wk1',
      subject: 'Toán học',
      topic: 'Xác suất & Thống kê',
      subTopic: 'Xác suất có điều kiện',
      mistakes: 23,
      accuracy: 41,
      recommendation: 'Luyện tập thêm 20 câu hỏi dạng Xác suất có điều kiện để nắm chắc công thức Bayes.'
    },
    {
      id: 'wk2',
      subject: 'Hóa học',
      topic: 'Kim loại & Dung dịch',
      subTopic: 'Bài toán điện phân dung dịch',
      mistakes: 36,
      accuracy: 58,
      recommendation: 'Cần ôn lại phương trình Faraday và thứ tự điện phân tại các điện cực.'
    },
    {
      id: 'wk3',
      subject: 'Toán học',
      topic: 'Hình học không gian Oxyz',
      subTopic: 'Khoảng cách giữa hai đường thẳng chéo nhau',
      mistakes: 28,
      accuracy: 62,
      recommendation: 'Tập trung luyện các bài toán dựng mặt phẳng song song chứa một đường thẳng.'
    }
  ],

  aiCoachInsights: [
    {
      id: 'ac1',
      type: 'positive',
      icon: '🚀',
      title: 'Tiến độ cải thiện ấn tượng',
      description: 'Bạn đang có độ chính xác cải thiện rất tốt ở môn Vật lý (+0.8 điểm trong 14 ngày vừa qua).'
    },
    {
      id: 'ac2',
      type: 'warning',
      icon: '🎯',
      title: 'Tập trung ôn luyện trọng điểm',
      description: 'Bạn nên luyện tập thêm Hình học không gian Oxyz vì đây là vùng kiến thức bạn hay mất điểm nhất.'
    },
    {
      id: 'ac3',
      type: 'info',
      icon: '⚡',
      title: 'Tối ưu tốc độ làm bài',
      description: 'Tốc độ làm bài phần Trắc nghiệm Đúng/Sai của bạn đang chậm hơn trung bình 18%. Hãy phân bổ thời gian hợp lý hơn.'
    },
    {
      id: 'ac4',
      type: 'alert',
      icon: '🧩',
      title: 'Thử thách câu hỏi Vận dụng cao',
      description: 'Bạn thường mất điểm ở những câu hỏi vận dụng cao (độ khó Khó). Hãy ưu tiên rèn luyện kỹ năng phân tích đề.'
    },
    {
      id: 'ac5',
      type: 'target',
      icon: '🏆',
      title: 'Mục tiêu điểm số THPT Quốc Gia',
      description: 'Dự đoán AI: Bạn có khả năng chạm mốc 8.8+ điểm THPT QG nếu duy trì phong độ ôn tập hiện tại trong 2 tuần tới!'
    }
  ],

  learningTrend: [
    { date: '01/07', accuracy: 72, score: 7.2, questions: 25 },
    { date: '04/07', accuracy: 75, score: 7.5, questions: 30 },
    { date: '07/07', accuracy: 74, score: 7.4, questions: 20 },
    { date: '10/07', accuracy: 78, score: 7.8, questions: 45 },
    { date: '13/07', accuracy: 80, score: 8.0, questions: 50 },
    { date: '16/07', accuracy: 82, score: 8.2, questions: 40 },
    { date: '19/07', accuracy: 83, score: 8.4, questions: 60 },
    { date: '22/07', accuracy: 85, score: 8.75, questions: 55 }
  ],

  heatmapData: Array.from({ length: 60 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (59 - i));
    const count = [0, 5, 12, 0, 25, 30, 45, 15, 0, 20, 35, 50][i % 12];
    return {
      date: d.toISOString().split('T')[0],
      count,
      level: count === 0 ? 0 : count < 15 ? 1 : count < 30 ? 2 : count < 40 ? 3 : 4
    };
  }),

  radarSkills: [
    { skill: 'Giải quyết vấn đề', score: 88, fullMark: 100 },
    { skill: 'Tính toán', score: 92, fullMark: 100 },
    { skill: 'Tư duy logic', score: 85, fullMark: 100 },
    { skill: 'Đọc hiểu đề', score: 78, fullMark: 100 },
    { skill: 'Tốc độ làm bài', score: 75, fullMark: 100 },
    { skill: 'Độ chính xác', score: 84, fullMark: 100 }
  ],

  recentInsights: [
    {
      id: 'i1',
      timestamp: 'Hôm nay, 14:30',
      icon: '🎉',
      badge: 'CẢI THIỆN AI',
      badgeColor: '#00b894',
      title: 'Tăng 12% độ chính xác chủ đề Hàm số',
      desc: 'Hệ thống ghi nhận bạn đã hoàn thành 40 câu hỏi Hàm số với tỷ lệ đúng đạt 92%.'
    },
    {
      id: 'i2',
      timestamp: 'Hôm qua, 20:15',
      icon: '📜',
      badge: 'HOÀN THÀNH ĐỀ',
      badgeColor: '#6c5ce7',
      title: 'Hoàn thành Đề thi THPT môn Vật Lý (Đề 211)',
      desc: 'Đạt điểm số 8.57 / 10 với thời gian làm 3 phút 4 giây.'
    },
    {
      id: 'i3',
      timestamp: '20/07/2026',
      icon: '⚠️',
      badge: 'CẢNH BÁO YẾU',
      badgeColor: '#e17055',
      title: 'Phát hiện điểm yếu ở Xác suất có điều kiện',
      desc: 'Tỷ lệ làm đúng giảm xuống 41% qua 3 lần thi gần nhất.'
    },
    {
      id: 'i4',
      timestamp: '18/07/2026',
      icon: '🔥',
      badge: 'STREAK MỚI',
      badgeColor: '#fdcb6e',
      title: 'Đạt mốc Streak 14 ngày học liên tiếp',
      desc: 'Chúc mừng bạn đã duy trì chuỗi học tập chăm chỉ trong hai tuần qua!'
    }
  ]
};
