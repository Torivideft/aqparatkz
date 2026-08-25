import { NextResponse } from 'next/server';

function detectLanguage(text: string): 'kk' | 'ru' | 'en' {
  if (/[әғқңөұүһіӘҒҚҢӨҰҮҺІ]/.test(text)) return 'kk';
  if (/[а-яА-ЯёЁ]/.test(text)) return 'ru';
  return 'en';
}

export async function POST(req: Request) {
  let textToTranslate = '';

  try {
    const { text, targetLang } = await req.json();
    textToTranslate = text || '';

    if (!textToTranslate || !targetLang) {
      return NextResponse.json({ translatedText: textToTranslate });
    }

    const sourceLang = detectLanguage(textToTranslate);

    // Если исходный язык совпадает с целевым — отдаем без изменений
    if (sourceLang === targetLang) {
      return NextResponse.json({ translatedText: textToTranslate });
    }

    // Используем эндпоинт Google Translate с автоопределением
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      textToTranslate
    )}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedText = data[0].map((item: any) => item[0]).join('');
        if (translatedText) {
          return NextResponse.json({ translatedText });
        }
      }
    }

    // Резервный вызов MyMemory, если Google не ответил
    const fallbackUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      textToTranslate
    )}&langpair=${sourceLang}|${targetLang}`;
    
    const fallbackRes = await fetch(fallbackUrl);
    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      if (fallbackData?.responseData?.translatedText) {
        return NextResponse.json({ translatedText: fallbackData.responseData.translatedText });
      }
    }

    return NextResponse.json({ translatedText: textToTranslate });
  } catch (error) {
    console.error('Ошибка перевода:', error);
    return NextResponse.json({ translatedText: textToTranslate });
  }
}