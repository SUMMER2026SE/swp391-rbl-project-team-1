import type { Request, Response } from 'express';
import { isGeminiKey, callGeminiDirect } from '../utils/geminiClient.js';

export async function chatbotConsult(req: Request, res: Response) {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Tin nhắn không được để trống!' });
  }

  // Extract context if present in the message
  let pageContext = '';
  let cleanMessage = message;
  const contextMatch = message.match(/^\[Context:\s*User is currently on page\s*["']([^"']+)["']\]\s*(.*)$/i);
  if (contextMatch) {
    pageContext = contextMatch[1];
    cleanMessage = contextMatch[2];
  }

  const userOpenRouterKey = req.headers['x-user-openrouter-key'] as string | undefined;
  const userOpenRouterModel = req.headers['x-user-openrouter-model'] as string | undefined;

  const rawKeys = process.env.OPENROUTER_API_KEYS || process.env.OPENROUTER_API_KEY || '';
  const apiKeys = userOpenRouterKey ? [userOpenRouterKey] : rawKeys.split(',').map(k => k.trim()).filter(Boolean);
  
  // Use user header key, then configured OpenRouter key, and fallback to Gemini API Key
  const apiKey = apiKeys[0] || process.env.GEMINI_API_KEY;
  
  // Choose model: user model, then OpenRouter config, then Gemini config, defaulting to gemini-1.5-flash
  const model = userOpenRouterKey 
    ? (userOpenRouterModel || 'google/gemini-2.5-flash') 
    : (process.env.OPENROUTER_MODEL || process.env.GEMINI_MODEL || 'google/gemini-1.5-flash');

  if (!apiKey) {
    console.error('[Chatbot Error] Neither OPENROUTER_API_KEY nor GEMINI_API_KEY is configured in .env or headers!');
    return res.status(500).json({ 
      success: false, 
      error: 'Hệ thống AI Chatbot đang bảo trì. Vui lòng cấu hình API Key cá nhân để dùng!' 
    });
  }

  try {
    let systemPromptContent = `Bạn là EduBot - Cố vấn học tập AI chuyên biệt ôn thi THPT Quốc gia của nền tảng EduPath AI.
Hãy đóng vai một giáo viên kiêm cố vấn học tập vô cùng tận tâm, thân thiện, thông thái và đầy năng lượng.
Nhiệm vụ của bạn là:
1. Giải đáp các thắc mắc kiến thức ôn thi các môn học (Toán, Lý, Hóa, Anh, Sinh, Văn, Sử, Địa, GDCD).
2. Tư vấn phương pháp ôn thi khoa học, lộ trình học tập tối ưu theo các khối thi (A00, A01, B00, C00, D01,...).
3. Giới thiệu các tính năng thông minh, nổi bật của hệ thống EduPath AI:
   - Sơ đồ tư duy (AI Mindmap): Tạo sơ đồ từ văn bản, tải tài liệu bài giảng (PDF) hoặc chụp ảnh đề thi (OCR) để AI sinh sơ đồ tư duy tức thì.
   - Quick Quiz từng Node: Nhấp vào bất kỳ nút nào trên Sơ đồ tư duy để AI sinh ngay bộ 10 câu hỏi trắc nghiệm kèm giải thích đáp án đúng/sai cực kỳ chi tiết.
   - Hệ màu độ thông thạo (Mastery Progress Color): Các nút tự động đổi màu (Xám, Đỏ, Cam, Vàng, Xanh dương, Xanh lá) tương ứng với điểm số làm quiz để chỉ rõ phần kiến thức yếu cần ôn tập.
   - Sơ đồ khắc phục điểm yếu (Weakness Mindmap): AI phân tích nhật ký câu sai (Mistakes Log) của bạn để phát hiện lỗ hổng cốt lõi và đề xuất tài liệu ôn tập sửa sai.
   - Phân tích Đề thi (Exam Weight Map): Tải đề thi thử lên để AI phân tích cấu trúc, tỉ lệ phần trăm điểm và tạo sơ đồ ôn thi chiến thuật.
Hãy trả lời một cách tự nhiên, khoa học, trình bày rõ ràng có chia ý, sử dụng nhiều ký tự biểu tượng (emojis) để sinh động, luôn khích lệ tinh thần tự học và ôn thi của học sinh.`;

    if (pageContext) {
      systemPromptContent += `\n\n[NGỮ CẢNH HIỆN TẠI]: Học sinh hiện tại đang truy cập trang "${pageContext}". Hãy tham chiếu hoặc lồng ghép nhẹ nhàng, khéo léo các công cụ/tính năng hoặc cách học tương thích với ngữ cảnh trang này khi học sinh hỏi han hoặc cần tư vấn (ví dụ: gợi ý làm trắc nghiệm nhanh khi học sinh đang xem Mindmap, hướng dẫn ôn tập lại từ bảng thống kê điểm sai khi xem Đề thi/Luyện đề...).`;
    }

    const systemPrompt = {
      role: 'system',
      content: systemPromptContent
    };

    // Format chat history (limit to last 8 messages for context memory)
    const formattedMessages = [systemPrompt];

    if (history && Array.isArray(history)) {
      const contextHistory = history.slice(-8);
      for (const msg of contextHistory) {
        if (msg && msg.text) {
          formattedMessages.push({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: String(msg.text).substring(0, 800)
          });
        }
      }
    }

    // Push the current user message (use the clean version without the context tag for model response)
    formattedMessages.push({
      role: 'user',
      content: String(cleanMessage).substring(0, 1000)
    });

    if (isGeminiKey(apiKey)) {
      console.log(`[Chatbot] Route directed to direct Gemini call with model: ${model}`);
      const reply = await callGeminiDirect(apiKey, model, formattedMessages);
      return res.status(200).json({ success: true, data: { reply } });
    }

    console.log(`[Chatbot] Sending request to OpenRouter with model: ${model}`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://edupath.vn',
        'X-Title': 'EduPath AI Chatbot'
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Chatbot Error] OpenRouter API returned status ${response.status}: ${errText}`);
      throw new Error(`OpenRouter returned status ${response.status}`);
    }

    const data = (await response.json()) as any;
    const reply = data.choices?.[0]?.message?.content || 'Xin lỗi em, thầy gặp chút sự cố kết nối AI. Em có thể hỏi lại được không?';

    return res.status(200).json({ success: true, data: { reply } });
  } catch (err: any) {
    console.error('[Chatbot Error] Exception caught:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Có lỗi xảy ra khi kết nối với máy chủ AI. Vui lòng thử lại sau!' 
    });
  }
}
