import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Сообщение не может быть пустым' }, { status: 400 });
    }

    const text = message.toLowerCase().trim();

    // Быстрый ответ про автора
    if (text.includes('автор') || text.includes('создатель') || text.includes('разработчик') || text.includes('кто сделал') || text.includes('ким жасады')) {
      return NextResponse.json({
        reply: 'Бұл порталды Torivideft әзірлеген. / Этот портал был разработан Torivideft.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        reply: 'Қате: `.env` файлында GEMINI_API_KEY орнатылмаған.'
      });
    }

    const systemPrompt = `
Ты — умный, вежливый и продвинутый ИИ-ассистент новостного портала AQPARAT.COM.
Сайт и портал разработал Torivideft.

Правила ответа:
1. Отвечай на любые вопросы пользователя (новости, наука, технологии, общие знания, помощь и т.д.).
2. Отвечай строго на том языке, на котором обратился пользователь (Казахский, Русский или Английский).
3. Будь вежливым, пиши четко и по делу, без лишней воды.
    `;

    // Актуальный адрес для модели gemini-3.6-flash
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
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nПользователь спрашивает: ${message}` }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return NextResponse.json({
        reply: `Қате орын алды: ${data.error?.message || 'API error'}`
      });
    }

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Кешіріңіз, жауап дайындау мүмкін болмады.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI Route Error:', error);
    return NextResponse.json({ error: 'Ошибка ИИ сервиса' }, { status: 500 });
  }
}