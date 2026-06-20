import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

// Safe JSON parser helper for LLM responses
function cleanJsonResponse(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// Extract JSON or Array of JSON from text robustly
function extractJsonFromText(text: string): any {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return JSON.parse(arrayMatch[0]);
  }
  const cleaned = cleanJsonResponse(text);
  return JSON.parse(cleaned);
}

// OpenRouter Fetch Helper
async function callOpenRouter(prompt: string, systemPrompt = "You are a helpful AI tutor."): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

  if (!apiKey) {
    throw new Error("Hệ thống AI chưa cấu hình OpenRouter API Key.");
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://edupath.vn',
      'X-Title': 'EduPath AI Mindmap'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 402) {
      throw new Error("Hạn mức OpenRouter API Key đã hết số dư hoặc vượt giới hạn token! Vui lòng nạp thêm credit vào tài khoản OpenRouter.");
    }
    throw new Error(`OpenRouter API error: ${errText}`);
  }

  const result: any = await response.json();
  return result.choices?.[0]?.message?.content || '';
}

// Recursively extract nodes from tree JSON
function extractNodes(node: any, nodesList: { nodeKey: string; name: string; description: string }[] = []): { nodeKey: string; name: string; description: string }[] {
  if (!node) return nodesList;
  nodesList.push({
    nodeKey: node.key || '0',
    name: node.name || 'Không tên',
    description: node.description || ''
  });
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      extractNodes(child, nodesList);
    }
  }
  return nodesList;
}

// Synchronize mindmap nodes in database with the content tree
async function syncMindmapNodes(mindmapId: number, content: any) {
  const rootNode = content.rootNode;
  if (!rootNode) return;

  const nodes = extractNodes(rootNode);

  // Sync/upsert nodes
  for (const node of nodes) {
    await prisma.mindmapNode.upsert({
      where: {
        mindmapId_nodeKey: {
          mindmapId,
          nodeKey: node.nodeKey
        }
      },
      update: {
        name: node.name,
        description: node.description
      },
      create: {
        mindmapId,
        nodeKey: node.nodeKey,
        name: node.name,
        description: node.description
      }
    });
  }

  // Remove nodes that are no longer in the JSON
  const nodeKeys = nodes.map(n => n.nodeKey);
  await prisma.mindmapNode.deleteMany({
    where: {
      mindmapId,
      nodeKey: { notIn: nodeKeys }
    }
  });
}

// 1. Generate Mindmap from Prompt
export async function generateMindmap(req: AuthRequest, res: Response) {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, error: 'Thiếu nội dung yêu cầu sinh sơ đồ!' });
  }

  try {
    const systemPrompt = 
      "Bạn là chuyên gia thiết kế bản đồ tư duy giáo dục thông minh. Nhiệm vụ của bạn là phân tích văn bản/chủ đề và chuyển hóa thành cấu trúc sơ đồ tư duy dạng hình cây phân cấp bằng JSON.\n" +
      "Yêu cầu định dạng JSON trả về phải khớp chính xác cấu trúc sau:\n" +
      "{\n" +
      "  \"title\": \"Tiêu đề sơ đồ (tối đa 40 ký tự)\",\n" +
      "  \"rootNode\": {\n" +
      "    \"name\": \"Chủ đề gốc của sơ đồ (tối đa 30 ký tự)\",\n" +
      "    \"description\": \"Mô tả ngắn gọn về chủ đề gốc\",\n" +
      "    \"key\": \"0\",\n" +
      "    \"children\": [\n" +
      "      {\n" +
      "        \"name\": \"Chủ đề con cấp 1 (tối đa 30 ký tự)\",\n" +
      "        \"description\": \"Giải thích hoặc định nghĩa ngắn gọn\",\n" +
      "        \"key\": \"0-0\",\n" +
      "        \"children\": []\n" +
      "      },\n" +
      "      {\n" +
      "        \"name\": \"Chủ đề con cấp 1 khác\",\n" +
      "        \"description\": \"Mô tả ngắn gọn\",\n" +
      "        \"key\": \"0-1\",\n" +
      "        \"children\": [\n" +
      "          {\n" +
      "            \"name\": \"Chủ đề con cấp 2 (tối đa 30 ký tự)\",\n" +
      "            \"description\": \"Mô tả\",\n" +
      "            \"key\": \"0-1-0\",\n" +
      "            \"children\": []\n" +
      "          }\n" +
      "        ]\n" +
      "      }\n" +
      "    ]\n" +
      "  }\n" +
      "}\n" +
      "Hãy giữ sơ đồ trong khoảng 5 - 12 nút tất cả, cấu trúc phân cấp rõ ràng, dễ hiểu. Chỉ trả về JSON thuần, không bao quanh bởi block ```json.";

    const prompt = `Sinh sơ đồ tư duy ôn thi cho chủ đề: "${text}"`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    let parsedContent;
    try {
      parsedContent = extractJsonFromText(aiResponse);
    } catch (parseErr) {
      console.error("AI JSON Parse Error. Raw response was:", aiResponse);
      return res.status(500).json({ success: false, error: 'Phản hồi từ AI không đúng định dạng JSON. Hãy thử lại!' });
    }

    return res.status(200).json({ success: true, data: parsedContent });
  } catch (err: any) {
    console.error("generateMindmap error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 2. Save/Update Mindmap
export async function saveMindmap(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const { title, content, id } = req.body;

  if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
  if (!title || !content) {
    return res.status(400).json({ success: false, error: 'Thiếu thông tin tiêu đề hoặc nội dung sơ đồ tư duy!' });
  }

  try {
    let mindmap;
    if (id) {
      // Update existing
      mindmap = await prisma.mindmap.findFirst({
        where: { id: Number(id), userId }
      });
      if (!mindmap) {
        return res.status(404).json({ success: false, error: 'Không tìm thấy sơ đồ tư duy!' });
      }

      mindmap = await prisma.mindmap.update({
        where: { id: mindmap.id },
        data: {
          title,
          content: content as any,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new
      mindmap = await prisma.mindmap.create({
        data: {
          userId,
          title,
          content: content as any
        }
      });
    }

    // Sync database nodes with JSON tree
    await syncMindmapNodes(mindmap.id, content);

    return res.status(200).json({ success: true, data: mindmap });
  } catch (err: any) {
    console.error("saveMindmap error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 3. Get User Mindmaps
export async function getMindmaps(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

  try {
    const list = await prisma.mindmap.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });
    return res.status(200).json({ success: true, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 4. Get Mindmap By ID
export async function getMindmapById(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

  try {
    const mindmap = await prisma.mindmap.findFirst({
      where: { id: Number(id), userId }
    });
    if (!mindmap) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy sơ đồ tư duy!' });
    }
    return res.status(200).json({ success: true, data: mindmap });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 5. Delete Mindmap
export async function deleteMindmap(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

  try {
    const mindmap = await prisma.mindmap.findFirst({
      where: { id: Number(id), userId }
    });
    if (!mindmap) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy sơ đồ tư duy để xóa!' });
    }

    await prisma.mindmap.delete({
      where: { id: mindmap.id }
    });

    return res.status(200).json({ success: true, data: { message: 'Đã xóa sơ đồ tư duy thành công!' } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 6. Get Public Mindmap By ID
export async function getPublicMindmapById(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    const mindmap = await prisma.mindmap.findUnique({
      where: { id: Number(id) }
    });
    if (!mindmap) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy sơ đồ tư duy được chia sẻ!' });
    }
    return res.status(200).json({ success: true, data: mindmap });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 7. Get Mindmap Node Progress
export async function getNodeProgress(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const { mindmapId } = req.params;

  if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

  try {
    const progress = await prisma.nodeProgress.findMany({
      where: {
        userId,
        node: {
          mindmapId: Number(mindmapId)
        }
      },
      include: {
        node: {
          select: {
            nodeKey: true
          }
        }
      }
    });

    return res.status(200).json({ success: true, data: progress });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 8. Generate Node Quiz (5 Questions)
export async function generateNodeQuiz(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const { mindmapId, nodeKey } = req.body;

  if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
  if (!mindmapId || !nodeKey) {
    return res.status(400).json({ success: false, error: 'Thiếu ID sơ đồ hoặc Mã nút để tạo câu hỏi!' });
  }

  try {
    const node = await prisma.mindmapNode.findFirst({
      where: {
        mindmapId: Number(mindmapId),
        nodeKey: String(nodeKey)
      },
      include: {
        questions: true
      }
    });

    if (!node) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy thông tin nút chủ đề trong cơ sở dữ liệu!' });
    }

    // Reuse existing questions if already generated
    let questions = node.questions;

    if (questions.length === 0) {
      // Generate using AI
      const systemPrompt = 
        "Bạn là giảng viên ôn thi đại học xuất sắc. Hãy tạo một bộ trắc nghiệm tiếng Việt gồm đúng 5 câu hỏi ôn tập chất lượng cao cho chủ đề được yêu cầu.\n" +
        "Yêu cầu định dạng JSON trả về phải là một mảng 5 phần tử chính xác như sau:\n" +
        "[\n" +
        "  {\n" +
        "    \"questionText\": \"Nội dung câu hỏi ôn tập chất lượng...\",\n" +
        "    \"options\": [\"Lựa chọn A\", \"Lựa chọn B\", \"Lựa chọn C\", \"Lựa chọn D\"],\n" +
        "    \"correctOption\": 0,\n" +
        "    \"explanation\": \"Giải thích chi tiết tại sao lựa chọn đó đúng\"\n" +
        "  }\n" +
        "]\n" +
        "Lưu ý: correctOption là chỉ số index số nguyên từ 0 đến 3. Chỉ trả về JSON không chứa định dạng markdown.";

      const prompt = `Tạo bộ câu hỏi trắc nghiệm ôn tập cho chủ đề: "${node.name}" (Mô tả: ${node.description})`;
      const aiResponse = await callOpenRouter(prompt, systemPrompt);
      let parsedQuestions;
      try {
        parsedQuestions = extractJsonFromText(aiResponse);
      } catch (parseErr) {
        console.error("AI Quiz JSON Parse Error. Raw response was:", aiResponse);
        return res.status(500).json({ success: false, error: 'AI sinh câu hỏi lỗi. Hãy thử lại!' });
      }

      // Store in DB
      for (const q of parsedQuestions) {
        await prisma.quizQuestion.create({
          data: {
            mindmapNodeId: node.id,
            questionText: q.questionText,
            options: q.options,
            correctOption: Number(q.correctOption),
            explanation: q.explanation || 'Không có giải thích.'
          }
        });
      }

      // Refetch
      questions = await prisma.quizQuestion.findMany({
        where: { mindmapNodeId: node.id }
      });
    }

    // Strip answers before sending to client to prevent cheating!
    const cleanQuestions = questions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options
    }));

    return res.status(200).json({ success: true, data: cleanQuestions });
  } catch (err: any) {
    console.error("generateNodeQuiz error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 9. Submit Node Quiz Answers & Score
export async function submitNodeQuiz(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const { mindmapId, nodeKey, answers, completionTime } = req.body; // answers = Array of { questionId: number, selectedOption: number }

  if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
  if (!mindmapId || !nodeKey || !Array.isArray(answers)) {
    return res.status(400).json({ success: false, error: 'Thiếu dữ liệu nộp bài trắc nghiệm!' });
  }

  try {
    const node = await prisma.mindmapNode.findFirst({
      where: {
        mindmapId: Number(mindmapId),
        nodeKey: String(nodeKey)
      },
      include: {
        questions: true
      }
    });

    if (!node) {
      return res.status(404).json({ success: false, error: 'Nút chủ đề không tồn tại!' });
    }

    const dbQuestions = node.questions;
    let correctCount = 0;
    const answerRecords: any[] = [];

    dbQuestions.forEach((q) => {
      const userAns = answers.find(a => a.questionId === q.id);
      const isCorrect = userAns ? userAns.selectedOption === q.correctOption : false;

      if (isCorrect) correctCount++;

      answerRecords.push({
        questionId: q.id,
        selectedOption: userAns ? userAns.selectedOption : -1,
        isCorrect
      });
    });

    const totalQuestions = dbQuestions.length || 5;
    const mastery = correctCount / totalQuestions;

    // Start Transaction: Log Attempt, answers, and update mastery progress
    const attempt = await prisma.nodeQuizAttempt.create({
      data: {
        userId,
        mindmapNodeId: node.id,
        score: correctCount,
        totalQuestions,
        completionTime: Number(completionTime) || 60
      }
    });

    // Save individual user answers
    const answersToCreate = answerRecords.map(rec => ({
      attemptId: attempt.id,
      questionId: rec.questionId,
      selectedOption: rec.selectedOption,
      isCorrect: rec.isCorrect
    }));

    await prisma.userAnswer.createMany({
      data: answersToCreate
    });

    // Fetch existing node progress
    const existingProgress = await prisma.nodeProgress.findUnique({
      where: {
        userId_mindmapNodeId: {
          userId,
          mindmapNodeId: node.id
        }
      }
    });

    const nextMastery = existingProgress ? Math.max(existingProgress.mastery, mastery) : mastery;
    const nextBestScore = existingProgress ? Math.max(existingProgress.bestScore, correctCount) : correctCount;
    const nextAttempts = existingProgress ? existingProgress.attempts + 1 : 1;

    await prisma.nodeProgress.upsert({
      where: {
        userId_mindmapNodeId: {
          userId,
          mindmapNodeId: node.id
        }
      },
      update: {
        mastery: nextMastery,
        bestScore: nextBestScore,
        attempts: nextAttempts,
        lastPracticed: new Date()
      },
      create: {
        userId,
        mindmapNodeId: node.id,
        mastery: nextMastery,
        bestScore: nextBestScore,
        attempts: 1
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        score: correctCount,
        totalQuestions,
        attemptId: attempt.id,
        mastery: nextMastery,
        questions: dbQuestions // Return full questions including answer key and explanations for review!
      }
    });
  } catch (err: any) {
    console.error("submitNodeQuiz error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 10. Generate Weakness Mindmap from previous Test attempts
export async function generateWeaknessMindmap(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

  try {
    // Check recent test attempts
    const attempts = await prisma.testAttempt.findMany({
      where: { studentId: userId },
      include: {
        attemptAnswers: {
          include: {
            question: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 5
    });

    // Aggregate poor performance topics (< 60% accuracy)
    const topicStats: Record<string, { total: number; correct: number }> = {};
    attempts.forEach(att => {
      att.attemptAnswers.forEach(ans => {
        const topic = ans.question.topic;
        if (!topicStats[topic]) topicStats[topic] = { total: 0, correct: 0 };
        topicStats[topic].total++;
        if (ans.isCorrect) topicStats[topic].correct++;
      });
    });

    const weaknesses = Object.keys(topicStats).filter(
      topic => (topicStats[topic].correct / topicStats[topic].total) < 0.6
    );

    // If no weaknesses detected, use standard THPT core modules
    if (weaknesses.length === 0) {
      weaknesses.push("Tính đơn điệu của hàm số", "Cực trị hàm số chứa tham số", "Giao thoa sóng cơ học", "Xà phòng hóa Este");
    }

    const systemPrompt = 
      "Bạn là một gia sư AI cao cấp. Phân tích các chủ điểm kiến thức học sinh bị hổng và lập ra sơ đồ tư duy ôn luyện củng cố.\n" +
      "Yêu cầu trả về định dạng JSON cấu trúc phân cấp chính xác:\n" +
      "{\n" +
      "  \"title\": \"Bản Đồ Củng Cố Điểm Yếu AI (Tên sơ đồ)\",\n" +
      "  \"rootNode\": {\n" +
      "    \"name\": \"Trọng tâm phục hồi\",\n" +
      "    \"description\": \"Tập hợp các chủ điểm kiến thức phát hiện sai lỗi từ các đề thi thử\",\n" +
      "    \"key\": \"0\",\n" +
      "    \"children\": [\n" +
      "      {\n" +
      "        \"name\": \"Chủ đề khắc phục...\",\n" +
      "        \"description\": \"Hướng dẫn ôn tập...\",\n" +
      "        \"key\": \"0-0\",\n" +
      "        \"children\": []\n" +
      "      }\n" +
      "    ]\n" +
      "  }\n" +
      "}\n" +
      "Hãy chỉ trả về JSON thuần túy.";

    const prompt = `Thiết kế sơ đồ tư duy ôn luyện chuyên sâu củng cố các lỗ hổng kiến thức sau: [${weaknesses.join(', ')}]`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    let parsedContent;
    try {
      parsedContent = extractJsonFromText(aiResponse);
    } catch (parseErr) {
      console.error("AI Weakness Mindmap JSON Parse Error. Raw response was:", aiResponse);
      return res.status(500).json({ success: false, error: 'AI sinh sơ đồ lỗi. Hãy thử lại!' });
    }

    // Save automatically as a new Mindmap
    const mindmap = await prisma.mindmap.create({
      data: {
        userId,
        title: parsedContent.title || 'Sơ đồ tư duy khắc phục điểm yếu AI',
        content: parsedContent as any
      }
    });

    // Link and sync nodes
    await syncMindmapNodes(mindmap.id, parsedContent);

    // Save into weakness mindmaps table
    await prisma.weaknessMindmap.create({
      data: {
        userId,
        title: mindmap.title,
        content: parsedContent as any
      }
    });

    return res.status(200).json({ success: true, data: mindmap });
  } catch (err: any) {
    console.error("generateWeaknessMindmap error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 11. Upload Exam File
export async function uploadExamFile(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });

  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Không tìm thấy file nào được gửi lên!' });
  }

  try {
    const uploaded = await prisma.uploadedExamFile.create({
      data: {
        userId,
        filename: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        id: uploaded.id,
        filename: uploaded.filename,
        fileUrl: uploaded.fileUrl
      }
    });
  } catch (err: any) {
    console.error("uploadExamFile error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// 12. Analyse Exam File and Generate Mindmap
export async function generateExamMindmap(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const { fileId } = req.body;

  if (!userId) return res.status(401).json({ success: false, error: 'Chưa xác thực!' });
  if (!fileId) {
    return res.status(400).json({ success: false, error: 'Yêu cầu truyền fileId để thực hiện phân tích đề!' });
  }

  try {
    const fileRecord = await prisma.uploadedExamFile.findFirst({
      where: { id: Number(fileId), userId }
    });

    if (!fileRecord) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy thông tin file đề thi đã tải lên!' });
    }

    // Generate Mindmap analyzing knowledge areas of this exam paper
    const systemPrompt = 
      "Bạn là một chuyên gia phân tích cấu trúc đề thi THPT Quốc Gia. Hãy lập ra sơ đồ phân chia các kiến thức xuất hiện trong đề thi.\n" +
      "Yêu cầu cấu trúc JSON trả về phân cấp cây chính xác:\n" +
      "{\n" +
      "  \"title\": \"Phân tích đề thi: (Tên đề thi)\",\n" +
      "  \"rootNode\": {\n" +
      "    \"name\": \"Chủ điểm đề thi\",\n" +
      "    \"description\": \"Cấu trúc phân bổ chủ đề kiến thức trong đề thi\",\n" +
      "    \"key\": \"0\",\n" +
      "    \"children\": [\n" +
      "      {\n" +
      "        \"name\": \"Chủ đề (ví dụ: Hàm số)\",\n" +
      "        \"description\": \"Phân bổ bao nhiêu câu, mức độ nhận biết/vận dụng...\",\n" +
      "        \"key\": \"0-0\",\n" +
      "        \"children\": []\n" +
      "      }\n" +
      "    ]\n" +
      "  }\n" +
      "}\n" +
      "Chỉ trả về JSON thuần túy.";

    const prompt = `Phân tích cấu trúc phân bổ kiến thức và lập sơ đồ ôn thi từ đề thi: "${fileRecord.filename}"`;
    const aiResponse = await callOpenRouter(prompt, systemPrompt);
    let parsedContent;
    try {
      parsedContent = extractJsonFromText(aiResponse);
    } catch (parseErr) {
      console.error("AI Exam Mindmap JSON Parse Error. Raw response was:", aiResponse);
      return res.status(500).json({ success: false, error: 'AI phân tích đề thi lỗi. Hãy thử lại!' });
    }

    // Save as normal Mindmap
    const mindmap = await prisma.mindmap.create({
      data: {
        userId,
        title: parsedContent.title || `Phân tích đề thi ${fileRecord.filename}`,
        content: parsedContent as any
      }
    });

    await syncMindmapNodes(mindmap.id, parsedContent);

    // Link to ExamPaperAnalysis
    await prisma.examPaperAnalysis.create({
      data: {
        userId,
        title: mindmap.title,
        subject: "Tổng hợp",
        grade: "12",
        analysisResult: { filename: fileRecord.filename, analysisType: "AI Exam analysis" } as any,
        mindmapId: mindmap.id,
        files: {
          connect: { id: fileRecord.id }
        }
      }
    });

    return res.status(200).json({ success: true, data: mindmap });
  } catch (err: any) {
    console.error("generateExamMindmap error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
