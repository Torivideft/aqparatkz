import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Пустое сообщение' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('CRITICAL: GEMINI_API_KEY is missing on Vercel!');
      return NextResponse.json({ reply: 'Ошибка: API ключ не задан в переменных окружения Vercel.' });
    }

    console.log('API Key length:', apiKey.length, 'Starts with:', apiKey.substring(0, 4));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Ты — ИИ-ассистент новостного портала AQPARAT.COM, разработанного Torivideft. Отвечай кратко и по делу на языке вопроса.\n\nВопрос: ${message}`
                }
              ]
            }
          ]
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Google API Error Response:', JSON.stringify(data));
      return NextResponse.json({ 
        reply: `Ошибка Google API (${response.status}): ${data?.error?.message || 'Проверьте ключ'}` 
      });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error('Empty candidates in response:', JSON.stringify(data));
      return NextResponse.json({ reply: 'Пустой ответ от модели ИИ.' });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Server Catch Error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}