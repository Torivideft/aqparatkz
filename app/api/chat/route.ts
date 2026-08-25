import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Сообщение не может быть пустым' }, { status: 400 });
    }

    const text = message.toLowerCase().trim();
    let reply = '';

    // Разбор комбинации "привет как дела"
    if ((text.includes('привет') || text.includes('сәлем') || text.includes('салам')) && 
        (text.includes('как дела') || text.includes('калайсың') || text.includes('қалайсың') || text.includes('как ты'))) {
      reply = 'Сәлем! Жағдайым өте жақсы, рақмет! Сізде қалай? / Привет! У меня всё отлично, спасибо! Как ваши дела?';
    } 
    // Отдельно: "как дела"
    else if (text.includes('как дела') || text.includes('калайсың') || text.includes('қалайсың') || text.includes('как ты') || text.includes('не жаңалық')) {
      reply = 'Барлығы тамаша, рақмет! Жаңалықтарды бақылап отырмын. Сізде қалай? / Всё отлично, спасибо! Слежу за последними новостями. Как вы?';
    }
    // Отдельно: "привет"
    else if (text.includes('привет') || text.includes('салам') || text.includes('сәлем') || text.includes('здравствуй')) {
      reply = 'Сәлеметсіз бе! Мен AQPARAT AI ассистентімін. Сізге қалай көмектесе аламын? / Здравствуйте! Я ИИ-ассистент AQPARAT. Чем могу помочь?';
    } 
    // Кто ты
    else if (text.includes('кто ты') || text.includes('кімсің') || text.includes('кимсин') || text.includes('что ты')) {
      reply = 'Мен AQPARAT.COM порталының виртуалды ИИ-көмекшісімін. / Я виртуальный ИИ-помощник новостного портала AQPARAT.COM.';
    }
    // Новости
    else if (text.includes('новост') || text.includes('жаңалық') || text.includes('жаналык') || text.includes('что нового')) {
      reply = 'Барлық өзекті жаңалықтар басты бетте орналасқан. Сонымен қатар жоғарғы іздеу жолағын қолдана аласыз! / Все актуальные новости отображаются на главной странице. Также вы можете воспользоваться поиском вверху!';
    }
    // Разработчик
    else if (text.includes('автор') || text.includes('создатель') || text.includes('разработчик') || text.includes('кто сделал')) {
      reply = 'Бұл порталды Torivideft әзірлеген. / Этот портал разработан Torivideft.';
    }
    // Любые другие вопросы
    else {
      reply = `Сұрағыңызға рақмет! Мен AQPARAT AI ретінде әлі де үйреніп жатырмын. Порталдағы іздеу жолағы арқылы да қажетті ақпаратты таба аласыз. / Спасибо за вопрос! Я как ИИ-помощник еще обучусь, но вы всегда можете воспользоваться поиском по сайту.`;
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'Ошибка ИИ сервиса' }, { status: 500 });
  }
}