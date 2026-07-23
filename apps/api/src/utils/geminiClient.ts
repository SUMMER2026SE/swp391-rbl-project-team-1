import type { Response } from 'express';

// Check if a key is a native Google Gemini API Key
export function isGeminiKey(key: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  // Native Gemini keys usually start with AIzaSy or AQ.
  return trimmed.startsWith('AIzaSy') || trimmed.startsWith('AQ.');
}

// Convert OpenRouter / OpenAI message format to Gemini format
export function convertMessagesToGemini(messages: any[]) {
  let systemInstructionText = '';
  const contents: any[] = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemInstructionText += (systemInstructionText ? '\n' : '') + msg.content;
      continue;
    }

    const role = msg.role === 'assistant' ? 'model' : 'user';
    const parts: any[] = [];

    if (typeof msg.content === 'string') {
      parts.push({ text: msg.content });
    } else if (Array.isArray(msg.content)) {
      for (const part of msg.content) {
        if (part.type === 'text') {
          parts.push({ text: part.text });
        } else if (part.type === 'image_url') {
          const dataUrl = part.image_url?.url || '';
          const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            parts.push({
              inlineData: {
                mimeType: matches[1],
                data: matches[2]
              }
            });
          }
        }
      }
    }

    if (parts.length > 0) {
      contents.push({ role, parts });
    }
  }

  const body: any = { contents };
  if (systemInstructionText) {
    body.systemInstruction = {
      parts: [{ text: systemInstructionText }]
    };
  }

  return body;
}

export function mapModelToGemini(modelName: string): string {
  // Always return gemini-3.1-flash-lite as the highly available stable model
  return 'gemini-3.1-flash-lite';
}

// Call Gemini API directly (non-streaming)
export async function callGeminiDirect(apiKey: string, rawModel: string, messages: any[]): Promise<string> {
  const model = mapModelToGemini(rawModel);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const requestBody = convertMessagesToGemini(messages);

  console.log(`[Gemini Client] Direct call to model ${model}...`);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[Gemini Client Error] Direct call failed with status ${response.status}: ${errText}`);
    throw new Error(`Gemini direct call failed: ${response.status} - ${errText}`);
  }

  const data = (await response.json()) as any;
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return reply;
}

// Call Gemini API directly (streaming content using SSE)
export async function streamGeminiDirect(
  apiKey: string,
  rawModel: string,
  messages: any[],
  res: Response,
  abortSignal?: AbortSignal
): Promise<void> {
  const model = mapModelToGemini(rawModel);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const requestBody = convertMessagesToGemini(messages);

  console.log(`[Gemini Client] Streaming direct call to model ${model}...`);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
    signal: abortSignal
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[Gemini Client Error] Streaming failed with status ${response.status}: ${errText}`);
    throw new Error(`Gemini streaming failed: ${response.status} - ${errText}`);
  }

  if (!response.body) {
    throw new Error('Gemini streaming response body is empty');
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  const processDirectSSELines = (textBuffer: string): string => {
    const lines = textBuffer.split('\n');
    const lastLine = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('data: ')) {
        try {
          const jsonStr = trimmed.slice(6);
          const parsed = JSON.parse(jsonStr);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
            if (typeof (res as any).flush === 'function') {
              (res as any).flush();
            }
          }
        } catch (e) {
          // Incomplete chunk, skip
        }
      }
    }
    return lastLine;
  };

  if (typeof (response.body as any).getReader === 'function') {
    const reader = (response.body as any).getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = processDirectSSELines(buffer);
    }
  } else {
    for await (const chunk of response.body as any) {
      buffer += decoder.decode(chunk, { stream: true });
      buffer = processDirectSSELines(buffer);
    }
  }

  if (buffer.trim()) {
    processDirectSSELines(buffer + '\n');
  }
}
