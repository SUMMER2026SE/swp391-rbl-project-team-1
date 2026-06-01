import type { Request, Response } from 'express';

export async function chatbotConsult(req: Request, res: Response) {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Tin nhắn không được để trống!' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';

  if (!apiKey) {
    console.error('[Chatbot Error] OPENROUTER_API_KEY is not configured in .env file!');
    return res.status(500).json({ 
      success: false, 
      error: 'Hệ thống AI Chatbot đang bảo trì. Vui lòng quay lại sau!' 
    });
  }

  try {
    const systemPrompt = {
      role: 'system',
      content: 'Bạn là "EduBot" - Trợ lý AI tư vấn và hướng dẫn ôn thi THPT Quốc gia thuộc hệ thống giáo dục trực tuyến EduPath AI. ' +
        'Nhiệm vụ của bạn là tư vấn lộ trình học tập tối ưu, định hướng ôn luyện kiến thức các môn thi (Toán, Vật lý, Hóa học, Sinh học, Tiếng Anh, Ngữ văn), ' +
        'chia sẻ mẹo và phương pháp làm bài trắc nghiệm/tự luận, đồng thời giải đáp các câu hỏi tuyển sinh đại học. ' +
        'Hãy phản hồi bằng tiếng Việt một cách thân thiện, cởi mở, chuyên nghiệp, luôn dùng các từ truyền cảm hứng động lực học tập cho học sinh lớp 12. ' +
        'Hãy trình bày câu trả lời rõ ràng, có phân đoạn, sử dụng các ký tự bullet point hoặc in đậm khi cần thiết để học sinh dễ đọc.'
    };

    // Format chat history for OpenRouter
    const formattedMessages = [systemPrompt];

    if (history && Array.isArray(history)) {
      history.forEach((msg: { sender: 'user' | 'bot'; text: string }) => {
        formattedMessages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        });
      });
    }

    // Push the current user message
    formattedMessages.push({
      role: 'user',
      content: message
    });

    console.log(`[Chatbot] Sending request to OpenRouter with model: ${model}`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://edupath.vn', // Required by OpenRouter
        'X-Title': 'EduPath AI Chatbot'       // Required by OpenRouter
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1500
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
