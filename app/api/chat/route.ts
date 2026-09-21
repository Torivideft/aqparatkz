import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function callGemini(apiKey: string, model: string, message: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                // Исправлено: теперь ИИ знает, что автор ты один
                text: `Ты — умный, вежливый и продвинутый ИИ-ассистент новостного портала AQPARAT.COM. Сайт разработан разработчиком Torivideft. Отвечай строго на языке пользователя (каз/рус/англ).\n\nВопрос: ${message}`
              }
            ]
          }
        ]
      }),
    }
  );
  return { response, data: await response.json() };
}

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

    const modelsToTry = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
    let reply = '';

    for (const model of modelsToTry) {
      const { response, data } = await callGemini(apiKey, model, message);
      
      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        reply = data.candidates[0].content.parts[0].text;
        break;
      }
    }

    if (!reply) {
      reply = 'Кешіріңіз, қазір ИИ серверлері шамадан тыс жүктелген. Бірнеше минуттан кейін қайталап көріңіз.';
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI Route Error:', error);
    return NextResponse.json({ error: 'Ошибка ИИ сервиса' }, { status: 500 });
  }
}