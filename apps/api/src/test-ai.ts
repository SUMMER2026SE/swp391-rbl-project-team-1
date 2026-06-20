import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
  
  console.log("Using API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');
  console.log("Using Model:", model);
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Say hello in 5 words' }]
      })
    });
    
    console.log("Status Code:", response.status);
    const text = await response.text();
    console.log("Response Text:", text);
  } catch (error) {
    console.error("AI connection failed:", error);
  }
}

main();
