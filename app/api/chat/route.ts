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
      return NextResponse.json({ reply: 'API ключ не найден в переменных окружения.' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      console.error('Gemini API Full Response:', JSON.stringify(data));
      return NextResponse.json({ reply: 'Ошибка ответа от Google API. Проверьте валидность ключа.' });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('API Chat Error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}