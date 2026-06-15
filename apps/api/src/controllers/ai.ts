import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

// Server-Sent Events (SSE) AI Streaming Chat
export async function streamAIChat(req: AuthRequest, res: Response) {
  const { message } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const responseChunks = [
    "Chào em! Thầy đã nhận được câu hỏi ôn luyện kỳ thi THPTQG.\n\n",
    "Để giải bài toán này một cách chính xác, chúng ta thực hiện theo các bước cụ thể như sau:\n\n",
    "**Bước 1**: Xác định các hệ số của bài toán và tập xác định.\n",
    "**Bước 2**: Áp dụng định lý đạo hàm liên hợp hoặc công thức giải nhanh lý thuyết.\n",
    "**Bước 3**: Thay số và kết luận kết quả cuối cùng.\n\n",
    "Em hãy thử áp dụng tương tự với các dạng bài tập tự luyện trong chương này. Có phần nào chưa hiểu rõ, cứ nhắn thầy hỗ trợ tiếp nhé! Chúc em ôn luyện thật tốt! ✨"
  ];

  let idx = 0;
  const interval = setInterval(() => {
    if (idx < responseChunks.length) {
      res.write(`data: ${JSON.stringify({ text: responseChunks[idx] })}\n\n`);
      idx++;
    } else {
      res.write('data: [DONE]\n\n');
      clearInterval(interval);
      res.end();
    }
  }, 400);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
}

// Refresh Adaptive Study Roadmap based on recent performance
export async function refreshRoadmap(req: AuthRequest, res: Response) {
  const studentId = req.user?.id;
  if (!studentId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

  try {
    // Scan attempts
    const attempts = await prisma.testAttempt.findMany({
      where: { studentId },
      include: {
        exam: true,
        attemptAnswers: {
          include: {
            question: true
          }
        }
      }
    });

    // 1. Group performance by subject
    const subjectStats: Record<string, { total: number; correct: number; topics: Record<string, { total: number; correct: number }> }> = {
      'Toán học': { total: 0, correct: 0, topics: {} },
      'Vật lý': { total: 0, correct: 0, topics: {} },
      'Hóa học': { total: 0, correct: 0, topics: {} },
      'Tiếng Anh': { total: 0, correct: 0, topics: {} },
    };

    attempts.forEach(attempt => {
      const subject = attempt.exam.subject;
      if (!subjectStats[subject]) {
        subjectStats[subject] = { total: 0, correct: 0, topics: {} };
      }

      attempt.attemptAnswers.forEach(ans => {
        const q = ans.question;
        const topic = q.topic || 'Chung';

        // Overall subject stats
        subjectStats[subject].total++;
        if (ans.isCorrect) {
          subjectStats[subject].correct++;
        }

        // Topic specific stats
        if (!subjectStats[subject].topics[topic]) {
          subjectStats[subject].topics[topic] = { total: 0, correct: 0 };
        }
        subjectStats[subject].topics[topic].total++;
        if (ans.isCorrect) {
          subjectStats[subject].topics[topic].correct++;
        }
      });
    });

    // 2. Generate roadmap content for each key subject
    const subjectsList = ['Toán học', 'Vật lý', 'Hóa học', 'Tiếng Anh'];
    const roadmapSubjects: Record<string, any> = {};

    subjectsList.forEach(subject => {
      const stats = subjectStats[subject];
      let confidence = 60; // default baseline when no attempts
      const weakTopics: string[] = [];
      const strongTopics: string[] = [];

      if (stats && stats.total > 0) {
        confidence = Math.round((stats.correct / stats.total) * 100);
        
        Object.keys(stats.topics).forEach(topic => {
          const tStats = stats.topics[topic];
          const acc = tStats.correct / tStats.total;
          if (acc < 0.6) {
            weakTopics.push(topic);
          } else if (acc > 0.8) {
            strongTopics.push(topic);
          }
        });
      }

      // Populate default priority topics if none found
      if (weakTopics.length === 0) {
        if (subject === 'Toán học') weakTopics.push('Khảo sát & cực trị hàm số');
        else if (subject === 'Vật lý') weakTopics.push('Dao động điều hòa & con lắc lò xo');
        else if (subject === 'Hóa học') weakTopics.push('Lý thuyết Este & phản ứng thủy phân');
        else if (subject === 'Tiếng Anh') weakTopics.push('Chia thì & câu hỏi đuôi');
      }

      // Build personalized weekly plans per subject
      let weeklyPlan = [];
      if (subject === 'Toán học') {
        weeklyPlan = [
          {
            week: "Tuần 1",
            focus: "Vá lỗ hổng: Khảo sát hàm số & Cực đại cực tiểu",
            status: "active",
            targetScore: "Bứt phá điểm 8+",
            concepts: [
              "Quy tắc xét tính đơn điệu bằng đạo hàm y'",
              "Cách xác định điểm cực trị qua bảng biến thiên",
              "Giải nhanh tiệm cận đứng và tiệm cận ngang"
            ],
            dailyTasks: [
              { day: "Thứ 2", task: "Học lý thuyết tính đơn điệu hàm số", estimatedMinutes: 30, courseId: 1, lessonId: 1 },
              { day: "Thứ 4", task: "Luyện 15 câu trắc nghiệm cực trị nâng cao", estimatedMinutes: 45, courseId: 1, lessonId: 2 },
              { day: "Thứ 6", task: "Giải đề mini khảo sát hàm số, xem AI giải thích lỗi sai", estimatedMinutes: 25 }
            ]
          },
          {
            week: "Tuần 2",
            focus: "Chuyên đề Hàm số mũ & Lôgarit có chứa tham số m",
            status: "locked",
            targetScore: "Vươn tới điểm 9.0+",
            concepts: [
              "Công thức đổi cơ số logarit và biến đổi mũ",
              "Đặt ẩn phụ giải phương trình mũ bậc hai",
              "Biện luận nghiệm logarit bằng phương pháp cô lập m"
            ],
            dailyTasks: [
              { day: "Thứ 3", task: "Xem lý thuyết Hàm số mũ và lôgarit", estimatedMinutes: 40 },
              { day: "Thứ 5", task: "Hoàn thành bài tập tự luyện trắc nghiệm mức 8+", estimatedMinutes: 50 }
            ]
          },
          {
            week: "Tuần 3",
            focus: "Tổng ôn Nguyên hàm & Tích phân và Ứng dụng hình học",
            status: "locked",
            targetScore: "Giữ vững điểm 9.2+",
            concepts: [
              "Phương pháp nguyên hàm từng phần và đổi biến số",
              "Tính diện tích hình phẳng giới hạn bởi đồ thị",
              "Tính thể tích vật thể tròn xoay"
            ],
            dailyTasks: [
              { day: "Thứ 2", task: "Học công thức tích phân cơ bản", estimatedMinutes: 35 },
              { day: "Thứ 4", task: "Ứng dụng hình học của tích phân để giải đề THPTQG", estimatedMinutes: 45 }
            ]
          }
        ];
      } else if (subject === 'Vật lý') {
        weeklyPlan = [
          {
            week: "Tuần 1",
            focus: "Tổng ôn Dao động cơ học và Con lắc lò xo",
            status: "active",
            targetScore: "Bứt phá điểm 8.0+",
            concepts: [
              "Phương trình dao động điều hòa li độ x, vận tốc v, gia tốc a",
              "Tính chu kỳ, tần số góc của con lắc lò xo nằm ngang và treo đứng",
              "Biểu thức năng lượng: Động năng, Thế năng và Cơ năng bảo toàn"
            ],
            dailyTasks: [
              { day: "Thứ 2", task: "Xem video bài giảng Dao động điều hòa căn bản", estimatedMinutes: 30, courseId: 3, lessonId: 11 },
              { day: "Thứ 4", task: "Giải đề trắc nghiệm con lắc lò xo và con lắc đơn", estimatedMinutes: 40, courseId: 3, lessonId: 12 },
              { day: "Thứ 6", task: "Thi thử mini-test kiểm tra mức độ ghi nhớ công thức", estimatedMinutes: 20 }
            ]
          },
          {
            week: "Tuần 2",
            focus: "Chuyên đề Sóng cơ học & Giao thoa sóng",
            status: "locked",
            targetScore: "Đạt 8.5+",
            concepts: [
              "Định nghĩa bước sóng, độ lệch pha giữa hai điểm trên phương truyền",
              "Điều kiện cực đại, cực tiểu giao thoa của hai nguồn cùng pha",
              "Đặc trưng sinh lí và vật lí của sóng âm"
            ],
            dailyTasks: [
              { day: "Thứ 3", task: "Học lý thuyết sự truyền sóng cơ", estimatedMinutes: 35 },
              { day: "Thứ 5", task: "Bài tập tìm số điểm dao động cực đại trên đoạn thẳng nối 2 nguồn", estimatedMinutes: 45 }
            ]
          },
          {
            week: "Tuần 3",
            focus: "Dòng điện xoay chiều RLC nối tiếp và cực trị điện xoay chiều",
            status: "locked",
            targetScore: "Chinh phục điểm 9.0+",
            concepts: [
              "Vẽ giản đồ vectơ trượt để giải mạch điện xoay chiều",
              "Hiện tượng cộng hưởng điện và điều kiện cộng hưởng",
              "Hệ số công suất tiêu thụ của đoạn mạch RLC"
            ],
            dailyTasks: [
              { day: "Thứ 2", task: "Nắm vững công thức cảm kháng, dung kháng và tổng trở Z", estimatedMinutes: 40 },
              { day: "Thứ 4", task: "Bài tập hệ số công suất và công suất cực đại", estimatedMinutes: 50 }
            ]
          }
        ];
      } else if (subject === 'Hóa học') {
        weeklyPlan = [
          {
            week: "Tuần 1",
            focus: "Vá lý thuyết trọng tâm Este - Lipit & Phản ứng xà phòng hóa",
            status: "active",
            targetScore: "Bứt phá điểm 8.5+",
            concepts: [
              "Khái niệm, danh pháp và tính chất vật lý của Este",
              "Phản ứng thủy phân este trong môi trường axit và kiềm",
              "Cấu tạo chất béo, công thức tính nhanh muối khi xà phòng hóa"
            ],
            dailyTasks: [
              { day: "Thứ 2", task: "Xem bài giảng lý thuyết Este căn bản", estimatedMinutes: 25, courseId: 2, lessonId: 6 },
              { day: "Thứ 4", task: "Luyện bài tập xà phòng hóa và hiệu suất phản ứng", estimatedMinutes: 45, courseId: 2, lessonId: 8 },
              { day: "Thứ 6", task: "Làm 20 câu hỏi lý thuyết Este đếm mệnh đề đúng sai", estimatedMinutes: 30 }
            ]
          },
          {
            week: "Tuần 2",
            focus: "Chuyên đề Cacbohiđrat & Polime",
            status: "locked",
            targetScore: "Đạt 9.0+",
            concepts: [
              "Phân biệt Glucozơ, Fructozơ, Saccarozơ, Tinh bột và Xenlulozơ",
              "Phản ứng tráng gương của Glucozơ và thủy phân Saccarozơ",
              "Phân loại tơ thiên nhiên, tơ nhân tạo và polime trùng hợp/trùng ngưng"
            ],
            dailyTasks: [
              { day: "Thứ 3", task: "Học sơ đồ tư duy Cacbohiđrat", estimatedMinutes: 30 },
              { day: "Thứ 5", task: "Hoàn thành 30 câu trắc nghiệm tổng ôn Polime lý thuyết", estimatedMinutes: 35 }
            ]
          },
          {
            week: "Tuần 3",
            focus: "Tổng ôn Amin, Amino Axit, Protein & Chuỗi phản ứng hữu cơ",
            status: "locked",
            targetScore: "Đạt 9.5+",
            concepts: [
              "Tính bazơ của các amin và ảnh hưởng của gốc hiđrocacbon",
              "Tính lưỡng tính của amino axit (tác dụng axit và kiềm)",
              "Phản ứng màu biure đặc trưng của peptit và protein"
            ],
            dailyTasks: [
              { day: "Thứ 2", task: "Học tính chất amino axit và phương pháp peptit hóa", estimatedMinutes: 45 },
              { day: "Thứ 4", task: "Giải bài toán đốt cháy amin, amino axit", estimatedMinutes: 50 }
            ]
          }
        ];
      } else {
        // Tiếng Anh
        weeklyPlan = [
          {
            week: "Tuần 1",
            focus: "Hệ thống Ngữ pháp trọng tâm & Câu hỏi đuôi (Tag Questions)",
            status: "active",
            targetScore: "Bứt phá điểm 8.0+",
            concepts: [
              "Quy tắc cấu tạo câu hỏi đuôi theo các thì trong tiếng Anh",
              "Các trường hợp đặc biệt của câu hỏi đuôi (Let's, I am, Wish...)",
              "Phân biệt cách chia các thì hoàn thành và thì tiếp diễn"
            ],
            dailyTasks: [
              { day: "Thứ 2", task: "Xem lý thuyết và các ví dụ câu hỏi đuôi đặc biệt", estimatedMinutes: 20 },
              { day: "Thứ 4", task: "Giải 50 câu trắc nghiệm ngữ pháp chọn lọc đề THPTQG", estimatedMinutes: 35 },
              { day: "Thứ 6", task: "Luyện bài tập điền từ và sửa lỗi sai ngữ pháp", estimatedMinutes: 25 }
            ]
          },
          {
            week: "Tuần 2",
            focus: "Phương pháp giải bài đọc điền từ & Đọc hiểu (Reading Comprehension)",
            status: "locked",
            targetScore: "Đạt 8.5+",
            concepts: [
              "Kỹ thuật đọc lướt (Skimming) để tìm ý chính toàn đoạn",
              "Kỹ thuật đọc quét (Scanning) tìm từ khóa và chi tiết số liệu",
              "Phân tích ngữ cảnh tìm từ đồng nghĩa/trái nghĩa trong văn bản"
            ],
            dailyTasks: [
              { day: "Thứ 3", task: "Luyện 3 bài đọc hiểu mức độ Thông hiểu", estimatedMinutes: 35 },
              { day: "Thứ 5", task: "Phân tích chiến thuật làm bài đọc điền từ vào đoạn văn", estimatedMinutes: 40 }
            ]
          },
          {
            week: "Tuần 3",
            focus: "Ngữ âm & Trọng âm cùng Chuyên đề Từ vựng (Vocabulary)",
            status: "locked",
            targetScore: "Chinh phục điểm 9.0+",
            concepts: [
              "Quy tắc phát âm đuôi -s/-es và phát âm đuôi -ed chuẩn xác",
              "Quy tắc nhấn trọng âm của từ có 2 âm tiết và từ có 3 âm tiết trở lên",
              "Học các cụm từ cố định (Collocations) phổ biến trong đề thi"
            ],
            dailyTasks: [
              { day: "Thứ 2", task: "Học quy tắc phát âm và trọng âm cơ bản", estimatedMinutes: 30 },
              { day: "Thứ 4", task: "Luyện tập 100 từ collocations thông dụng nhất", estimatedMinutes: 45 }
            ]
          }
        ];
      }

      roadmapSubjects[subject] = {
        confidence,
        priorityTopics: weakTopics,
        weeklyPlan,
        motivationalMessage: getMotivationalMessage(subject, confidence)
      };
    });

    const adaptiveRoadmapContent = {
      subjects: roadmapSubjects,
      overallWeaknesses: getOverallWeaknesses(roadmapSubjects),
      generatedAt: new Date().toISOString()
    };

    const roadmap = await prisma.roadmap.upsert({
      where: { studentId },
      update: {
        content: adaptiveRoadmapContent,
        generatedAt: new Date()
      },
      create: {
        studentId,
        content: adaptiveRoadmapContent,
        generatedAt: new Date()
      }
    });

    return res.status(200).json({ success: true, data: roadmap });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Helpers
function getMotivationalMessage(subject: string, confidence: number): string {
  if (confidence >= 80) {
    return `Phong độ môn ${subject} của em cực kỳ xuất sắc! Hãy tiếp tục duy trì và bứt phá các chủ đề nâng cao để đạt điểm số tuyệt đối nhé.`;
  }
  if (confidence >= 60) {
    return `Nền tảng môn ${subject} của em khá vững vàng. Cố gắng củng cố thêm các phần lý thuyết còn yếu để nâng cao điểm số lên mức giỏi nhé!`;
  }
  return `Môn ${subject} cần được chú trọng ôn luyện nhiều hơn em nhé. Hãy làm theo đúng lộ trình gợi ý của thầy cô để vá các lỗ hổng kiến thức kịp thời!`;
}

function getOverallWeaknesses(subjects: Record<string, any>): string[] {
  const list: string[] = [];
  Object.keys(subjects).forEach(subj => {
    const sObj = subjects[subj];
    if (sObj.confidence < 70 && sObj.priorityTopics) {
      sObj.priorityTopics.forEach((t: string) => {
        if (!list.includes(t)) list.push(`${subj}: ${t}`);
      });
    }
  });
  if (list.length === 0) {
    list.push("Chưa phát hiện điểm yếu lớn. Phong độ rất ổn định!");
  }
  return list;
}


// AI Question Generator for target study topics
export async function generateAIQuestions(req: AuthRequest, res: Response) {
  const { subject, topic, difficulty, count } = req.body;

  try {
    // Return sample AI questions mock (acting as Claude Sonnet output)
    const mockQuestions = [
      {
        content: `[AI generated question] Tìm tập xác định D của hàm số y = (x^2 - 1)^(-3)?`,
        options: [
          { label: 'A', text: "D = R" },
          { label: 'B', text: "D = R \\ { -1; 1 }" },
          { label: 'C', text: "D = (-1; 1)" },
          { label: 'D', text: "D = (-oo; -1) U (1; +oo)" }
        ],
        correctAnswer: 'B',
        explanation: "Hàm số mũ với số mũ nguyên âm xác định khi cơ số khác 0. Do đó x^2 - 1 != 0 <=> x != 1 và x != -1.",
        topic: topic || "Hàm số",
        difficulty: difficulty || "EASY"
      }
    ];

    return res.status(200).json({ success: true, data: mockQuestions });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
