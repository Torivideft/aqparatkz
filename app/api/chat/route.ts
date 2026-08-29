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
      return NextResponse.json({
        reply: 'Қате: `.env` файлында GEMINI_API_KEY орнатылмаған.'
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Ты — умный, вежливый и продвинутый ИИ-ассистент новостного портала AQPARAT.COM. Сайт разработан Torivideft. Отвечай строго на языке пользователя (каз/рус/англ).\n\nВопрос: ${message}`
                }
              ]
            }
          ]
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Google API Error:', data);
      return NextResponse.json({ 
        reply: `Қате орын алды: ${data.error?.message || 'Google API қатесі'}` 
      }, { status: 200 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Кешіріңіз, жауап дайындау мүмкін болмады.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI Route Error:', error);
    return NextResponse.json({ error: 'Ошибка ИИ сервиса' }, { status: 500 });
  }
}