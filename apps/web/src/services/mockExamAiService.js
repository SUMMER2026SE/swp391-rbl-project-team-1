// AI Feedback Service for Mock Exams
// Generates study advice, strengths, weaknesses, and a 7-day action plan.
// Ready to be integrated with LLM APIs (Gemini/OpenAI/Claude) in the future.

export const mockExamAiService = {
  /**
   * Generates mock AI analysis feedback based on the user's exam performance.
   * @param {number} score - Score out of 10
   * @param {string} subjectName - Subject name (e.g., 'Toán học')
   * @param {Array} incorrectQuestions - Array of incorrect question objects with their topics
   */
  async generateExamFeedback(score, subjectName, incorrectQuestions = []) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const failedTopics = [...new Set(incorrectQuestions.map(q => q.topic || 'Kiến thức tổng hợp'))];
    
    let strengths = [];
    let weaknesses = [];
    let suggestedTopics = [];
    let studyPlan = [];

    // Customize advice based on subject and score range
    if (score >= 9) {
      strengths = [
        `Nền tảng lý thuyết môn ${subjectName} cực kỳ vững chắc.`,
        "Tư duy vận dụng cao tốt, kỹ năng tính toán và phân tích câu hỏi chính xác.",
        "Quản lý thời gian làm bài tối ưu."
      ];
      weaknesses = failedTopics.length > 0 
        ? [`Còn một vài lỗi nhỏ hoặc sơ suất ở phần: ${failedTopics.join(', ')}.` ]
        : ["Không có điểm yếu đáng kể trong đề thi này."];
      suggestedTopics = failedTopics.length > 0 
        ? failedTopics 
        : ["Tiếp tục luyện đề khó để duy trì phong độ", "Thử thách các đề thi thử trường chuyên"];
      studyPlan = [
        { day: 1, task: "Xem lại các câu làm sai để tìm ra nguyên nhân sơ suất." },
        { day: 2, task: "Luyện tập 5 câu vận dụng cao (9+) liên quan đến phần sai sót." },
        { day: 3, task: "Nghỉ ngơi và xem lại các ghi chú công thức quan trọng." },
        { day: 4, task: "Thử sức với 1 đề thi thử của các trường chuyên (Lam Sơn, Amsterdam)." },
        { day: 5, task: "Xem video bài giảng giải nhanh bằng Casio hoặc mẹo tư duy." },
        { day: 6, task: "Làm đề tổng hợp dưới áp lực thời gian rút ngắn (80 phút)." },
        { day: 7, task: "Đánh giá lại tiến trình cùng EduBot AI." }
      ];
    } else if (score >= 7) {
      strengths = [
        "Nắm chắc các câu hỏi nhận biết và thông hiểu (mức độ 1 và 2).",
        "Có tư duy tốt ở các câu hỏi mức độ vận dụng."
      ];
      weaknesses = [
        `Tốc độ làm bài chưa tối ưu, dễ bị rối ở các câu hỏi bẫy.`,
        failedTopics.length > 0 
          ? `Gặp khó khăn ở các chủ đề: ${failedTopics.join(', ')}.`
          : "Còn lúng túng ở các câu vận dụng cao."
      ];
      suggestedTopics = failedTopics.length > 0 
        ? failedTopics 
        : ["Ứng dụng thực tế lý thuyết", "Các bài toán tích hợp cao"];
      studyPlan = [
        { day: 1, task: `Ôn tập lại lý thuyết chuyên sâu của phần: ${suggestedTopics[0] || 'Kiến thức cốt lõi'}.` },
        { day: 2, task: "Làm các bài tập tự luyện mức độ thông hiểu - vận dụng." },
        { day: 3, task: `Hỏi trợ lý EduBot AI về phương pháp giải nhanh chủ đề: ${suggestedTopics[1] || 'Bài tập nâng cao'}.` },
        { day: 4, task: "Tự bấm giờ làm lại 10 câu khó nhất trong đề thi vừa làm." },
        { day: 5, task: "Luyện tập một đề thi thử mới ở mức độ vừa sức." },
        { day: 6, task: "Hệ thống lại công thức bằng sơ đồ tư duy (Mindmap)." },
        { day: 7, task: "Tổng kết lỗi sai thường gặp để chuẩn bị cho đợt thi thử tiếp theo." }
      ];
    } else if (score >= 5) {
      strengths = [
        "Có làm đúng được đa số các câu hỏi nhận biết cơ bản.",
        "Tinh thần làm bài nghiêm túc, hoàn thành bài thi đầy đủ."
      ];
      weaknesses = [
        "Hổng kiến thức nền tảng ở nhiều chương.",
        `Làm sai nhiều câu dễ do vội vàng hoặc hiểu sai bản chất.`,
        failedTopics.length > 0 ? `Các chuyên đề yếu cần khắc phục gấp: ${failedTopics.join(', ')}.` : "Cần củng cố toàn bộ chương trình."
      ];
      suggestedTopics = failedTopics.length > 0 
        ? failedTopics.slice(0, 3) 
        : ["Định nghĩa cơ bản", "Phương pháp giải toán cơ bản", "Hệ thống công thức cốt lõi"];
      studyPlan = [
        { day: 1, task: `Mở khóa bài giảng cơ bản về chủ đề: ${suggestedTopics[0]}.` },
        { day: 2, task: `Giải 20 câu bài tập cơ bản có hướng dẫn của chủ đề: ${suggestedTopics[0]}.` },
        { day: 3, task: `Xem lại lý thuyết và công thức của chủ đề: ${suggestedTopics[1] || 'Kiến thức nền tảng'}.` },
        { day: 4, task: `Nhờ EduBot AI tóm tắt sơ đồ tư duy cho phần: ${suggestedTopics[1] || 'Kiến thức cơ bản'}.` },
        { day: 5, task: "Làm bài kiểm tra nhỏ 15 phút để test lại mức độ ghi nhớ." },
        { day: 6, task: "Thực hành giải chậm các câu mức độ thông hiểu trong đề thi." },
        { day: 7, task: "Hỏi giáo viên hoặc thảo luận trên diễn đàn về các câu chưa hiểu." }
      ];
    } else {
      strengths = [
        "Nhận diện được một số kiến thức cơ bản nhất.",
        "Có cố gắng đọc đề và chọn đáp án."
      ];
      weaknesses = [
        "Bị mất gốc kiến thức nghiêm trọng.",
        "Kỹ năng làm bài trắc nghiệm và quản lý thời gian yếu.",
        failedTopics.length > 0 ? `Thiếu hụt kiến thức toàn diện ở: ${failedTopics.join(', ')}.` : "Yếu toàn bộ các chủ đề."
      ];
      suggestedTopics = failedTopics.length > 0 
        ? failedTopics.slice(0, 3) 
        : ["Kiến thức sách giáo khoa lớp 12", "Học lại từ đầu các định lý", "Công thức nhận biết cơ bản"];
      studyPlan = [
        { day: 1, task: "Bắt đầu học lại SGK chương 1 từ các khái niệm cơ bản nhất." },
        { day: 2, task: "Xem các bài giảng mất gốc trên hệ thống EduPath." },
        { day: 3, task: `Luyện tập nhận biết 10 câu cực kỳ cơ bản của chủ đề: ${suggestedTopics[0] || 'Lý thuyết'}.` },
        { day: 4, task: "Dùng tính năng AI chat để hỏi mọi câu hỏi thắc mắc không sợ giấu dốt." },
        { day: 5, task: `Ghi chép cẩn thận công thức của phần: ${suggestedTopics[1] || 'Chương 1'} vào sổ tay.` },
        { day: 6, task: "Làm bài tập trắc nghiệm mức độ nhận biết (dễ nhất) để lấy lại tự tin." },
        { day: 7, task: "Đặt mục tiêu học tập nhỏ cùng gia sư AI." }
      ];
    }

    return {
      score,
      subjectName,
      strengths,
      weaknesses,
      suggestedTopics,
      studyPlan,
      aiAdvice: `Kết quả thi thử đạt ${score}/10 điểm môn ${subjectName}. Hệ thống AI khuyến nghị bạn nên tập trung củng cố lại chủ đề ${suggestedTopics[0] || 'kiến thức chưa nắm vững'} trong tuần tới. Hãy bám sát kế hoạch ôn tập 7 ngày dưới đây để khắc phục lỗ hổng kiến thức kịp thời.`
    };
  }
};
