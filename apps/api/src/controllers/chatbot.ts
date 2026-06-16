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
      content: 'Bạn là EduBot. Trả lời cực ngắn (dưới 10 từ) bằng tiếng Việt.'
    };

    // Format chat history for OpenRouter (limit to last 1 message sliced)
    const formattedMessages = [systemPrompt];

    if (history && Array.isArray(history) && history.length > 0) {
      const lastMsg = history[history.length - 1];
      if (lastMsg && lastMsg.text) {
        formattedMessages.push({
          role: lastMsg.sender === 'user' ? 'user' : 'assistant',
          content: String(lastMsg.text).substring(0, 40)
        });
      }
    }

    // Push the current user message
    formattedMessages.push({
      role: 'user',
      content: String(message).substring(0, 50)
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
        max_tokens: 40
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
