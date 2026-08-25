'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getArticles } from './admin/actions';

export interface Article {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  isImportant?: boolean | null;
  category?: string | null;
  createdAt?: Date | null;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);
  const [lang, setLang] = useState<'kk' | 'ru' | 'en'>('kk');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Состояния для новостей из БД
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Состояния для ИИ-помощника
  const initialChatMessage = { 
    sender: 'ai' as const, 
    text: 'Сәлеметсіз бе! Мен AQPARAT AI ассистентімін. Жаңалықтар бойынша қандай сұрағыңыз бар?' 
  };
  
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    initialChatMessage,
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    { id: 1, author: 'Арман Қ.', time: '15:02', text: 'Өте дұрыс бастама, қолдаймын!' },
  ]);
  const [reactions, setReactions] = useState({ fire: 142, like: 89, wow: 12 });
  const [hasVoted, setHasVoted] = useState(false);

  const t = {
    ru: { title: 'Главные новости', nav: ['Главное', 'Новости', 'Life'], search: 'Поиск новостей...', aiTitle: '🤖 ИИ-Помощник', aiPlaceholder: 'Задайте вопрос ИИ...', aiClear: 'Очистить' },
    kk: { title: 'Соңғы жаңалықтар', nav: ['Басты', 'Жаңалықтар', 'Life'], search: 'Жаңалықтарды іздеу...', aiTitle: '🤖 ИИ-Көмекші', aiPlaceholder: 'ИИ-ге сұрақ қойыңыз...', aiClear: 'Тазалау' },
    en: { title: 'Top Stories', nav: ['Home', 'News', 'Life'], search: 'Search news...', aiTitle: '🤖 AI Assistant', aiPlaceholder: 'Ask AI...', aiClear: 'Clear' },
  }[lang];

  useEffect(() => {
    async function fetchNews() {
      try {
        const data = await getArticles();
        setArticles(data as Article[]);
      } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const withAuth = (action: () => void) => {
    if (user) {
      action();
    } else {
      router.push('/admin/login');
    }
  };

  const addComment = () => {
    if (!comment.trim()) return;
    withAuth(() => {
      setComments([{ id: Date.now(), author: user!, time: 'Қазір', text: comment.trim() }, ...comments]);
      setComment('');
    });
  };

  // Отправка сообщения ИИ-помощнику
  const sendAiMessage = async () => {
    if (!aiInput.trim() || aiLoading) return;

    const userMsg = aiInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();

      if (data.reply) {
        setChatMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        setChatMessages((prev) => [...prev, { sender: 'ai', text: 'Қате орын алды. Қайталап көріңіз.' }]);
      }
    } catch {
      setChatMessages((prev) => [...prev, { sender: 'ai', text: 'Серверге қосылу мүмкін болмады.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Очистка чата
  const clearChat = () => {
    setChatMessages([initialChatMessage]);
    setAiInput('');
  };

  const filteredArticles = articles.filter((article) => {
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.description.toLowerCase().includes(query)
    );
  });

  const mainArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const secondaryArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : [];

  return (
    <div className="bg-slate-950 font-sans text-slate-200 min-h-screen flex flex-col text-sm">
      
      {/* ШАПКА */}
      <header className="bg-[#0B132B] border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="text-xl font-black text-white uppercase shrink-0">
            AQPARAT<span className="text-[#00F5D4]">.COM</span>
          </div>

          {/* ПОИСКОВИК */}
          <div className="flex-1 max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 pl-9 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00F5D4] transition-colors"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* Языки */}
            <div className="flex border rounded-lg p-0.5 bg-slate-900 border-slate-800 text-xs">
              {(['kk', 'ru', 'en'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-0.5 rounded ${lang === l ? 'bg-[#00F5D4] text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Профиль / Вход */}
            {user ? (
              <div className="flex items-center space-x-2 bg-slate-900 px-2.5 py-1 rounded-lg border border-cyan-500/30 text-xs">
                <span className="font-bold text-[#00F5D4]">{user}</span>
                <button onClick={() => setUser(null)} className="text-slate-500 hover:text-rose-400">✕</button>
              </div>
            ) : (
              <button 
                onClick={() => router.push('/admin/login')} 
                className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1 rounded-lg text-xs font-semibold hover:text-[#00F5D4] transition-colors"
              >
                👤 Кіру
              </button>
            )}
          </div>
        </div>

        {/* Навигация */}
        <nav className="bg-slate-900/90 border-t border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 flex space-x-6 overflow-x-auto py-2.5 text-xs font-medium text-slate-300">
            {t.nav.map((item) => (
              <a key={item} href="#" className="hover:text-[#00F5D4] whitespace-nowrap">{item}</a>
            ))}
          </div>
        </nav>
      </header>

      {/* ОПЕРАТИВНАЯ НОВОСТЬ С ПРОКРУТКОЙ */}
      <div className="bg-cyan-950/40 border-b border-cyan-500/20 py-2 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center text-xs">
          <span className="bg-[#00F5D4] text-slate-950 font-black px-2 py-0.5 rounded mr-3 shrink-0 z-10 animate-pulse">
            ОПЕРАТИВНО
          </span>
          <div className="overflow-hidden whitespace-nowrap w-full relative">
            <div className="inline-block animate-marquee text-slate-300">
              {articles.length > 0
                ? articles.map((a) => a.title).join('   •   ')
                : 'Жаңалықтар жүктелуде...'}
            </div>
          </div>
        </div>
      </div>

      {/* КОНТЕНТ */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 w-full">
        <section className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold border-b-2 border-[#00F5D4] pb-1 text-white">
            {searchQuery ? `Іздеу нәтижелері: "${searchQuery}"` : t.title}
          </h2>

          {loading ? (
            <div className="p-8 text-center text-slate-400 bg-[#1C2541] rounded-2xl border border-slate-800">
              Жаңалықтар жүктелуде...
            </div>
          ) : !mainArticle ? (
            <div className="p-8 text-center text-slate-400 bg-[#1C2541] rounded-2xl border border-slate-800">
              {searchQuery ? 'Іздеу бойынша ештеңе табылмады' : 'Әзірге жаңалықтар жоқ'}
            </div>
          ) : (
            <>
              {/* Главный пост */}
              <article className="bg-[#1C2541] rounded-2xl border border-slate-800 overflow-hidden">
                <div className="h-64 md:h-80 bg-slate-800 relative">
                  <img 
                    src={mainArticle.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800'} 
                    alt={mainArticle.title} 
                    className="w-full h-full object-cover" 
                  />
                  {mainArticle.isImportant && (
                    <span className="absolute top-3 left-3 bg-slate-950/80 text-[#00F5D4] text-xs font-bold px-2.5 py-1 rounded-lg">
                      МАҢЫЗДЫ
                    </span>
                  )}
                  {mainArticle.category && (
                    <span className="absolute top-3 right-3 bg-slate-900/90 text-slate-300 text-xs font-medium px-2 py-1 rounded-md border border-slate-700">
                      {mainArticle.category}
                    </span>
                  )}
                </div>
                
                <div className="p-5 space-y-4">
                  <h3 className="text-xl font-bold text-white">{mainArticle.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-line">{mainArticle.description}</p>

                  {/* Реакции */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400">Реакции:</span>
                    {(['fire', 'like', 'wow'] as const).map((key) => (
                      <button
                        key={key}
                        onClick={() => withAuth(() => setReactions({ ...reactions, [key]: reactions[key] + 1 }))}
                        className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700/80 hover:border-[#00F5D4]"
                      >
                        {key === 'fire' ? '🔥' : key === 'like' ? '👍' : '😮'} {reactions[key]}
                      </button>
                    ))}
                  </div>

                  {/* Комментарии */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <h4 className="font-bold text-white text-xs">💬 Пікірлер ({comments.length})</h4>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Пікір қалдыру..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                      />
                      <button onClick={addComment} className="bg-[#00F5D4] text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs">
                        Жіберу
                      </button>
                    </div>

                    <div className="space-y-2">
                      {comments.map((c) => (
                        <div key={c.id} className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60 text-xs">
                          <div className="flex justify-between font-bold text-slate-300 mb-1">
                            <span>{c.author}</span>
                            <span className="text-[10px] text-slate-500">{c.time}</span>
                          </div>
                          <p className="text-slate-400">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>

              {/* Остальные новости списком */}
              {secondaryArticles.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-base font-bold text-white">Басқа жаңалықтар</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {secondaryArticles.map((item) => (
                      <div key={item.id} className="bg-[#1C2541] rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between">
                        {item.imageUrl && (
                          <div className="h-40 bg-slate-800 relative">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                            {item.isImportant && (
                              <span className="absolute top-2 left-2 bg-slate-950/80 text-[#00F5D4] text-[10px] font-bold px-2 py-0.5 rounded">
                                МАҢЫЗДЫ
                              </span>
                            )}
                          </div>
                        )}
                        <div className="p-4 space-y-2">
                          <h4 className="font-bold text-white line-clamp-2">{item.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-3">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Правая колонка */}
        <aside className="space-y-6">

          {/* ИИ-ПОМОЩНИК */}
          <div className="bg-[#1C2541] rounded-2xl border border-[#00F5D4]/30 p-4 flex flex-col h-80 shadow-lg shadow-[#00F5D4]/5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <h3 className="font-bold text-[#00F5D4] text-xs flex items-center gap-1.5">
                {t.aiTitle}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearChat}
                  title={t.aiClear}
                  className="text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-2 py-0.5 rounded text-[10px] transition-colors"
                >
                  🧹 {t.aiClear}
                </button>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </div>
            </div>

            {/* Окно сообщений */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mb-3 text-xs scrollbar-thin">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#00F5D4] text-slate-950 ml-auto font-medium rounded-br-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 mr-auto rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {aiLoading && (
                <div className="bg-slate-900 border border-slate-800 text-slate-400 p-2.5 rounded-xl rounded-bl-none max-w-[85%] text-xs animate-pulse">
                  ИИ жауап дайындауда...
                </div>
              )}
            </div>

            {/* Инпут отправки */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendAiMessage()}
                placeholder={t.aiPlaceholder}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F5D4]"
              />
              <button
                onClick={sendAiMessage}
                disabled={aiLoading}
                className="bg-[#00F5D4] hover:bg-[#00f5d4]/80 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors disabled:opacity-50"
              >
                ➔
              </button>
            </div>
          </div>

          {/* Опрос */}
          <div className="bg-[#1C2541] rounded-2xl border border-slate-800 p-5">
            <h3 className="font-bold text-white border-b border-slate-800 pb-2 mb-3 text-xs">📊 Күн сұрағы</h3>
            <p className="text-xs text-slate-300 mb-3">Сіз цифрлық теңге қолданысқа енгізілуін қолдайсыз ба?</p>

            {!hasVoted ? (
              <div className="space-y-2 text-xs">
                <button onClick={() => withAuth(() => setHasVoted(true))} className="w-full text-left p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#00F5D4]">
                  Иә, бұл заманауи шешім
                </button>
                <button onClick={() => withAuth(() => setHasVoted(true))} className="w-full text-left p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#00F5D4]">
                  Жоқ, қолма-қол ақша сенімді
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[#00F5D4] mb-1"><span>Иә</span><span>68%</span></div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5"><div className="bg-[#00F5D4] h-1.5 rounded-full w-[68%]"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1"><span>Жоқ</span><span className="text-slate-400">32%</span></div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5"><div className="bg-slate-700 h-1.5 rounded-full w-[32%]"></div></div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Футер */}
      <footer className="bg-slate-950 text-slate-500 text-xs py-6 border-t border-slate-900 text-center space-y-2">
        <a href="https://www.instagram.com/akberdiyev_aktore" target="_blank" rel="noreferrer" className="hover:text-pink-500 transition-colors">
          Instagram
        </a>
        <p>© 2026 Aqparat.com. Все права защищены.
          <br />
          Powered and Designed by Torivideft. 
        </p>
      </footer>
    </div>
  );
}