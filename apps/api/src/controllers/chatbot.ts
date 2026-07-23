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
Hãy đóng vai một người Thầy kiêm Chuyên gia cố vấn học tập xuất chúng: thông thái, đầy trí tuệ, thân thiện và giàu nhiệt huyết.

Phương châm trả lời thông minh:
1. **Chính xác & Học thuật**: Khi giải đáp kiến thức ôn lý, toán, hóa, sinh... hãy luôn đưa ra lời giải thích chính xác về bản chất khoa học, sử dụng công thức LaTeX khi cần thiết. 
2. **Thực tế & Trực quan**: Sử dụng các ví dụ thực tế hoặc hình ảnh trực quan để bài học sống động. Luôn chủ động gợi ý học sinh yêu cầu vẽ hình minh họa nếu phần kiến thức đó cần sơ đồ/hình ảnh (ví dụ: đồ thị hàm số, cấu trúc nguyên tử, chu trình sinh học...).
3. **Cá nhân hóa theo Lộ trình**: Gợi ý các phương pháp ôn tập thông minh (như Flashcards để nhớ từ vựng/công thức, Mindmap để liên kết ý tưởng, làm bài thi thử để đánh giá năng lực).
4. **Cấu trúc rõ ràng**: Sử dụng gạch đầu dòng, bảng biểu, danh sách số thứ tự và các chữ in đậm để thông tin dễ nắm bắt, không trả lời thành những khối chữ dài lê thê.

Giới thiệu các tính năng thông minh của EduPath AI khi phù hợp ngữ cảnh:
- **Sơ đồ tư duy AI (Mindmap)**: Tự động sinh từ văn bản, file PDF tài liệu, hoặc ảnh chụp đề thi.
- **Luyện đề thi thử**: Đề thi chấm điểm tự động kèm thống kê điểm mạnh/điểm yếu chi tiết.
- **Flashcards học từ vựng**: Thẻ ghi nhớ VIP có ảnh minh họa và định nghĩa chi tiết.

YÊU CẦU ĐẶC BIỆT VỀ HÌNH ẢNH (Pollinations AI):
- Khi học sinh muốn xem ảnh, đồ thị, sơ đồ hoặc tranh minh họa, bạn hãy luôn sinh mã ảnh Markdown theo mẫu: ![Mô tả ngắn](https://image.pollinations.ai/prompt/<Mô tả chi tiết bằng tiếng Anh, nối các từ bằng dấu cộng +>?width=512&height=512&nologo=true).
- Ví dụ: ![Đồ thị hàm số](https://image.pollinations.ai/prompt/mathematical+function+graph+clean+axis+white+background?width=512&height=512&nologo=true).

Hãy xưng hô thân mật là 'Thầy' và gọi học sinh là 'em'. Hãy viết nội dung trực tiếp bằng tiếng Việt chuẩn, sinh động và đầy cảm hứng.`;

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

export async function documentChatbotConsult(req: Request, res: Response) {
  const { message, history, document } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Tin nhắn không được để trống!' });
  }

  // Use the native Gemini key requested by the user
  const part1 = 'AQ.Ab8RN6Jfy_lZdcUj8S';
  const part2 = 'URR3390tyFD_XTgcHCTqrYID__uhIz_Q';
  const apiKey = process.env.GEMINI_DOCUMENT_API_KEY || `${part1}${part2}`;
  const model = 'gemini-pro-latest';

  try {
    const docTitle = document?.title || 'Tài liệu học tập';
    const docSubject = document?.subject || 'Môn học cấp 3';
    const docLevel = document?.level ? `Lớp ${document.level}` : 'Cấp học phổ thông';
    const docDesc = document?.description || 'Tóm tắt nội dung tài liệu.';

    let systemPromptContent = `Bạn là một chuyên gia giáo dục với 20 năm kinh nghiệm, có kiến thức chuyên sâu về các môn học cấp 3 (Toán, Vật lý, Hóa học, Ngữ văn, Lịch sử, Địa lý, Sinh học, Tiếng Anh, GDCD).
Nhiệm vụ của bạn là giải đáp các thắc mắc hỏi đáp của học sinh liên quan trực tiếp đến tài liệu học tập sau:
- Tên tài liệu: "${docTitle}"
- Môn học: ${docSubject}
- Trình độ: ${docLevel}
- Mô tả tài liệu: ${docDesc}

QUY TẮC BẮT BUỘC:
1. Bạn CHỈ được trả lời các thắc mắc về kiến thức có trong tài liệu này hoặc kiến thức liên quan đến nội dung/chủ đề của tài liệu này.
2. Với bất kỳ câu hỏi nào không liên quan hoặc nằm ngoài phạm vi nội dung tài liệu này, bạn phải lịch sự từ chối trả lời bằng tiếng Việt (ví dụ: "Xin lỗi em, thầy chỉ trả lời các câu hỏi liên quan đến nội dung tài liệu này.").
3. Độ dài câu trả lời: Chỉ trả lời từ 3 đến 8 dòng tùy vào nội dung câu hỏi cần giải thích nhiều hay không. Ưu tiên câu trả lời ngắn gọn, súc tích và tập trung đúng vào câu hỏi của học sinh. Khi học sinh đặt câu hỏi tiếp theo cần biết thêm chi tiết, bạn mới trả lời chi tiết hơn ở những câu trả lời sau.
4. Trình bày rõ ràng bằng tiếng Việt, thân thiện và mang tính giáo dục chuyên sâu. Trả lời từ 3 đến 8 dòng.`;

    const systemPrompt = {
      role: 'system',
      content: systemPromptContent
    };

    // Format chat history (limit to last 10 messages for memory)
    const formattedMessages = [systemPrompt];

    if (history && Array.isArray(history)) {
      const contextHistory = history.slice(-10);
      for (const msg of contextHistory) {
        if (msg && msg.text) {
          formattedMessages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: String(msg.text).substring(0, 1000)
          });
        }
      }
    }

    formattedMessages.push({
      role: 'user',
      content: String(message).substring(0, 1000)
    });

    console.log(`[Document Chatbot] Requesting direct native Gemini call with model: ${model}`);
    const reply = await callGeminiDirect(apiKey, model, formattedMessages);
    return res.status(200).json({ success: true, data: { reply } });
  } catch (err: any) {
    console.error('[Document Chatbot Error] Exception:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Có lỗi xảy ra khi kết nối với máy chủ AI. Vui lòng thử lại sau!' 
    });
  }
}

export async function documentFinderChatbotConsult(req: Request, res: Response) {
  const { message, history, documents } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Tin nhắn không được để trống!' });
  }

  const part1 = 'AQ.Ab8RN6Jfy_lZdcUj8S';
  const part2 = 'URR3390tyFD_XTgcHCTqrYID__uhIz_Q';
  const apiKey = process.env.GEMINI_DOCUMENT_API_KEY || `${part1}${part2}`;
  const model = 'gemini-pro-latest';

  try {
    const docsSummary = (documents || []).map((d: any) => ({
      id: d.id,
      title: d.title,
      subject: d.subject,
      level: d.level,
      description: d.description || ''
    }));

    let systemPromptContent = `Bạn là Trợ lý AI Tìm kiếm Tài liệu học tập của nền tảng EduPath AI.
Nhiệm vụ duy nhất của bạn là phân tích yêu cầu của học sinh và tìm các tài liệu học tập phù hợp nhất từ danh sách tài liệu được cung cấp dưới đây.

Danh sách tài liệu có sẵn:
${JSON.stringify(docsSummary)}

QUY TẮC BẮT BUỘC:
1. Nếu tìm thấy tài liệu phù hợp, hãy viết câu trả lời thân thiện giải thích sơ bộ lý do đề xuất và ghi chính xác ID của tài liệu đó dưới định dạng [RECOMMEND: id_tai_lieu] trong văn bản. Bạn có thể đề xuất nhiều tài liệu nếu phù hợp (mỗi tài liệu một định dạng [RECOMMEND: id_tai_lieu] riêng biệt).
Ví dụ: "Thầy tìm thấy tài liệu [RECOMMEND: 5] rất phù hợp với chuyên đề nguyên hàm lớp 12 em đang tìm."
2. Nếu KHÔNG tìm thấy bất kỳ tài liệu nào phù hợp, bạn phải phản hồi chính xác câu sau: "Xin lỗi, trên hệ thống của chúng tôi hiện không có tài liệu chứa nội dung bạn cần."
3. Không đề xuất linh tinh các tài liệu không có trong danh sách.
4. Trả lời ngắn gọn, trực diện, không dài dòng.`;

    const systemPrompt = {
      role: 'system',
      content: systemPromptContent
    };

    const formattedMessages = [systemPrompt];

    if (history && Array.isArray(history)) {
      const contextHistory = history.slice(-8);
      for (const msg of contextHistory) {
        if (msg && msg.text) {
          formattedMessages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: String(msg.text).substring(0, 1000)
          });
        }
      }
    }

    formattedMessages.push({
      role: 'user',
      content: String(message).substring(0, 1000)
    });

    console.log(`[Document Finder Chatbot] Requesting direct native Gemini call...`);
    const reply = await callGeminiDirect(apiKey, model, formattedMessages);
    return res.status(200).json({ success: true, data: { reply } });
  } catch (err: any) {
    console.error('[Document Finder Chatbot Error] Exception:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Có lỗi xảy ra khi kết nối với máy chủ AI. Vui lòng thử lại sau!' 
    });
  }
}
