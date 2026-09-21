import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Сообщение не может быть пустым' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ reply: 'API ключ не настроен.' });
    }

    // Запрос к модели gemini-1.5-flash с поддержкой ключей через параметр key=
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
                  text: `Ты — ИИ-ассистент новостного портала AQPARAT.COM, разработанного Torivideft. Отвечай на языке вопроса.\n\nВопрос: ${message}`
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
      console.error('Gemini Error:', JSON.stringify(data));
      return NextResponse.json({ reply: 'Ошибка ответа от ИИ. Проверьте ключ.' });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Critical Error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}