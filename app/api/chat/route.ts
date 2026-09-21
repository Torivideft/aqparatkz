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
      return NextResponse.json({ reply: 'Ошибка: API ключ не задан в переменных окружения Vercel.' });
    }

    let response;
    let data;
    let attempts = 3;

    // Цикл автоповтора при перегрузке серверов Google (ошибка 503)
    while (attempts > 0) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey.trim()}`,
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

      data = await response.json();

      if (response.ok) {
        break; // Успех, выходим из цикла
      }

      // Если ошибка 503 (перегрузка), ждем секунду и пробуем снова
      if (response.status === 503) {
        attempts--;
        await new Promise((resolve) => setTimeout(resolve, 1500));
        continue;
      }

      break; // Другая ошибка, прекращаем попытки
    }

    if (!response || !response.ok) {
      console.error('Google API Error Response:', JSON.stringify(data));
      return NextResponse.json({ 
        reply: `Серверы Google перегружены. Попробуйте отправить сообщение еще раз через пару секунд.` 
      });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return NextResponse.json({ reply: 'Пустой ответ от модели ИИ.' });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Server Catch Error:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}