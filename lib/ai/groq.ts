import Groq from 'groq-sdk';

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GROQ_API_KEY is not set');
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

interface GroqOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  retries?: number;
}

export async function callGroq(
  systemPrompt: string,
  userMessage: string,
  options: GroqOptions = {}
): Promise<string> {
  const {
    model = 'llama-3.3-70b-versatile',
    maxTokens = 1024,
    temperature = 0.1,
    retries = 2,
  } = options;

  const client = getGroqClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      });

      return completion.choices[0]?.message?.content ?? '';
    } catch (err) {
      lastError = err as Error;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error('Groq API call failed');
}

export async function callGroqJSON<T>(
  systemPrompt: string,
  userMessage: string,
  options: GroqOptions = {}
): Promise<T> {
  const raw = await callGroq(
    systemPrompt + '\n\nYou MUST respond with valid JSON only. No explanation, no markdown, no code blocks.',
    userMessage,
    { ...options, temperature: 0.05 }
  );

  const cleaned = raw.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`Failed to parse Groq JSON response: ${cleaned.slice(0, 200)}`);
  }
}
