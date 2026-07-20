import { isGeminiKey, callGeminiDirect, convertMessagesToGemini, mapModelToGemini } from './geminiClient.js';

const originalFetch = globalThis.fetch;

// Create a patched fetch function
const patchedFetch = async function (
  url: string | URL | any,
  init?: any
): Promise<any> {
  const urlStr = typeof url === 'string' ? url : (url as any).url || url.toString();

  if (urlStr.includes('openrouter.ai/api/v1/chat/completions')) {
    let authHeader = '';
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        authHeader = init.headers.get('Authorization') || '';
      } else if (Array.isArray(init.headers)) {
        const found = init.headers.find((h: any) => h[0].toLowerCase() === 'authorization');
        authHeader = found ? found[1] : '';
      } else {
        authHeader = (init.headers as any)['Authorization'] || (init.headers as any)['authorization'] || '';
      }
    }

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const apiKey = authHeader.substring(7).trim();
      if (isGeminiKey(apiKey)) {
        console.log('[Fetch Patch] Intercepting OpenRouter call with native Gemini Key...');
        try {
          const body = JSON.parse(init?.body as string);
          const messages = body.messages || [];
          const model = body.model || 'google/gemini-2.5-flash';
          const isStream = body.stream === true;

          if (isStream) {
            console.log('[Fetch Patch] Directing to streaming Gemini API...');
            const geminiModel = mapModelToGemini(model);
            const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/${geminiModel}:streamGenerateContent?alt=sse&key=${apiKey}`;
            const geminiBody = convertMessagesToGemini(messages);

            const geminiRes = await originalFetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(geminiBody),
              signal: init?.signal
            });

            if (!geminiRes.ok) {
              return geminiRes;
            }

            // Map Gemini's SSE format to OpenRouter's SSE format using a TransformStream
            const decoder = new TextDecoder('utf-8');
            const encoder = new TextEncoder();
            let buffer = '';

            const transformStream = new TransformStream({
              transform(chunk, controller) {
                buffer += decoder.decode(chunk, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed) continue;
                  if (trimmed.startsWith('data: ')) {
                    try {
                      const jsonStr = trimmed.slice(6);
                      const parsed = JSON.parse(jsonStr);
                      const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                      if (text) {
                        const orChunk = {
                          choices: [
                            {
                              delta: { content: text }
                            }
                          ]
                        };
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(orChunk)}\n\n`));
                      }
                    } catch (e) {
                      // incomplete JSON chunk
                    }
                  }
                }
              },
              flush(controller) {
                if (buffer.trim().startsWith('data: ')) {
                  try {
                    const jsonStr = buffer.trim().slice(6);
                    const parsed = JSON.parse(jsonStr);
                    const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    if (text) {
                      const orChunk = {
                        choices: [
                          {
                            delta: { content: text }
                          }
                        ]
                      };
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(orChunk)}\n\n`));
                    }
                  } catch (e) {}
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              }
            });

            const transformedBody = geminiRes.body!.pipeThrough(transformStream);
            return new Response(transformedBody, {
              status: geminiRes.status,
              statusText: geminiRes.statusText,
              headers: geminiRes.headers
            });

          } else {
            console.log('[Fetch Patch] Directing to non-streaming Gemini API...');
            const reply = await callGeminiDirect(apiKey, model, messages);
            
            const responseData = {
              choices: [
                {
                  message: {
                    role: 'assistant',
                    content: reply
                  }
                }
              ]
            };

            return new Response(JSON.stringify(responseData), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }

        } catch (err: any) {
          console.error('[Fetch Patch Error] Failed to handle Gemini call redirection:', err);
          return new Response(JSON.stringify({ error: err.message || String(err) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
  }

  return originalFetch(url, init);
};

globalThis.fetch = patchedFetch as any;
