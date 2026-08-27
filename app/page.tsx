'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getArticlesPaginated, getCurrentUser, getCommentsByArticle, addCommentAction, deleteComment } from './admin/actions';

export interface Article {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  isImportant?: boolean | null;
  category?: string | null;
  createdAt?: string | Date | null;
  created_at?: string | Date | null;
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = 6;

  const [user, setUser] = useState<{ id: number; username: string; role: string; fullName?: string | null } | null>(null);
  const [lang, setLang] = useState<'kk' | 'ru' | 'en'>('kk');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [rawArticles, setRawArticles] = useState<Article[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);

  const initialChatMessage = { 
    sender: 'ai' as const, 
    text: 'Сәлеметсіз бе! Мен AQPARAT AI ассистентімін. Жаңалықтар бойынша қандай сұрағыңыз бар?' 
  };
  
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    initialChatMessage,
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState('');

  const [reactions, setReactions] = useState({ fire: 142, like: 89, wow: 12 });
  const [hasVoted, setHasVoted] = useState(false);

  const t = {
    ru: { title: 'Главные новости', nav: ['Главное', 'Новости', 'Life'], search: 'Поиск новостей...', aiTitle: '🤖 ИИ-Помощник', aiPlaceholder: 'Задайте вопрос ИИ...', aiClear: 'Очистить' },
    kk: { title: 'Соңғы жаңалықтар', nav: ['Басты', 'Жаңалықтар', 'Life'], search: 'Жаңалықтарды іздеу...', aiTitle: '🤖 ИИ-Көмекші', aiPlaceholder: 'ИИ-ге сұрақ қойыңыз...', aiClear: 'Тазалау' },
    en: { title: 'Top Stories', nav: ['Home', 'News', 'Life'], search: 'Search news...', aiTitle: '🤖 AI Assistant', aiPlaceholder: 'Ask AI...', aiClear: 'Clear' },
  }[lang];

  useEffect(() => {
    async function checkUserSession() {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (e) {
        console.error('Ошибка проверки сессии:', e);
      }
    }
    checkUserSession();
  }, []);

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        const data = await getArticlesPaginated(currentPage, pageSize);
        setRawArticles(data.articles as Article[]);
        setArticles(data.articles as Article[]);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [currentPage]);

  const filteredArticles = articles.filter((article) => {
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.description.toLowerCase().includes(query)
    );
  });

  const mainArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const secondaryArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : [];

  useEffect(() => {
    async function loadComments() {
      if (mainArticle?.id) {
        try {
          const data = await getCommentsByArticle(mainArticle.id);
          setComments(data);
        } catch (e) {
          console.error('Ошибка загрузки комментариев:', e);
        }
      }
    }
    loadComments();
  }, [mainArticle?.id]);

  const formatDate = (dateInput?: string | Date | null) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';

    const localeMap = { kk: 'kk-KZ', ru: 'ru-RU', en: 'en-US' };
    return d.toLocaleDateString(localeMap[lang], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const translateText = async (text: string, targetLang: string) => {
    if (!text) return text;
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang }),
      });
      const data = await res.json();
      return data.translatedText || text;
    } catch {
      return text;
    }
  };

  const changeLanguage = async (targetLang: 'kk' | 'ru' | 'en') => {
    setLang(targetLang);
    setTranslating(true);

    try {
      const translated = await Promise.all(
        rawArticles.map(async (article) => {
          const [translatedTitle, translatedDesc, translatedCategory] = await Promise.all([
            translateText(article.title, targetLang),
            translateText(article.description, targetLang),
            article.category ? translateText(article.category, targetLang) : Promise.resolve(article.category),
          ]);

          return {
            ...article,
            title: translatedTitle,
            description: translatedDesc,
            category: translatedCategory,
          };
        })
      );
      setArticles(translated);
    } catch (e) {
      console.error('Ошибка перевода:', e);
    } finally {
      setTranslating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [chatMessages, aiLoading]);

  const withAuth = (action: () => void) => {
    if (user) {
      action();
    } else {
      router.push('/admin/login');
    }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim() || !mainArticle) return;

    if (!user) {
      router.push('/admin/login');
      return;
    }

    const res = await addCommentAction(mainArticle.id, commentInput);
    if (res.success && res.comment) {
      setComments([res.comment, ...comments]);
      setCommentInput('');
    } else {
      alert(res.error || 'Ошибка при отправке');
    }
  };

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

  const clearChat = () => {
    setChatMessages([initialChatMessage]);
    setAiInput('');
  };

  const handleShare = async (e: React.MouseEvent, articleId: number, title: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/article/${articleId}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(articleId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="bg-slate-950 font-sans text-slate-200 min-h-screen flex flex-col text-sm">
      <header className="bg-[#0B132B] border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xl font-black text-white uppercase shrink-0 cursor-pointer" onClick={() => router.push('/')}>
            <img src="/logo.svg" alt="Logo" className="w-8 h-8 object-contain" />
            <span>AQPARAT<span className="text-[#00F5D4]">.COM</span></span>
          </div>

          <div className="flex-1 max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 pl-9 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00F5D4] transition-colors"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs">✕</button>
            )}
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex border rounded-lg p-0.5 bg-slate-900 border-slate-800 text-xs">
              {(['kk', 'ru', 'en'] as const).map((l) => (
                <button
                  key={l}
                  disabled={translating}
                  onClick={() => changeLanguage(l)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    lang === l ? 'bg-[#00F5D4] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {user ? (
              <div 
                onClick={() => router.push('/profile')}
                className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-cyan-500/30 text-xs cursor-pointer hover:border-[#00F5D4] transition-all"
                title="Личный кабинет"
              >
                <span>👤</span>
                <span className="font-bold text-[#00F5D4]">{user.fullName || user.username}</span>
              </div>
            ) : (
              <button 
                onClick={() => router.push('/admin/login')} 
                className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:text-[#00F5D4] transition-colors"
              >
                👤 Кіру
              </button>
            )}
          </div>
        </div>

        <nav className="bg-slate-900/90 border-t border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 flex space-x-6 overflow-x-auto py-2.5 text-xs font-medium text-slate-300">
            {t.nav.map((item) => (
              <a key={item} href="#" className="hover:text-[#00F5D4] whitespace-nowrap">{item}</a>
            ))}
          </div>
        </nav>
      </header>

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

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 w-full">
        <section className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b-2 border-[#00F5D4] pb-1">
            <h2 className="text-lg font-bold text-white">
              {searchQuery ? `Іздеу нәтижелері: "${searchQuery}"` : t.title}
            </h2>
            {translating && (
              <span className="text-xs text-[#00F5D4] animate-pulse">Аударылуда...</span>
            )}
          </div>

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
              <article 
                onClick={() => router.push(`/article/${mainArticle.id}`)}
                className="bg-[#1C2541] rounded-2xl border border-slate-800 overflow-hidden cursor-pointer hover:border-[#00F5D4]/50 transition-all group"
              >
                <div className="h-64 md:h-80 bg-slate-800 relative">
                  <img 
                    src={mainArticle.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800'} 
                    alt={mainArticle.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
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
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-[#00F5D4] font-medium flex items-center gap-1.5 mb-1">
                        <span>📅</span>
                        <span>
                          {formatDate(mainArticle.createdAt || mainArticle.created_at) || 'Қазір жарияланды'}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-[#00F5D4] transition-colors">
                        {mainArticle.title}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => handleShare(e, mainArticle.id, mainArticle.title)}
                      className="bg-slate-900 border border-slate-700 hover:border-[#00F5D4] text-xs px-3 py-1.5 rounded-lg shrink-0"
                    >
                      🔗 {copiedId === mainArticle.id ? 'Көшірілді!' : 'Бөлісу'}
                    </button>
                  </div>

                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{mainArticle.description}</p>

                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80 text-xs" onClick={(e) => e.stopPropagation()}>
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

                  <div className="pt-4 border-t border-slate-800 space-y-3" onClick={(e) => e.stopPropagation()}>
                    <h4 className="font-bold text-white text-xs">💬 Пікірлер ({comments.length})</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        placeholder="Пікір қалдыру..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
                      />
                      <button 
                        onClick={handleAddComment} 
                        className="bg-[#00F5D4] hover:bg-[#00f5d4]/85 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-all"
                      >
                        Жіберу
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {comments.length === 0 ? (
                        <p className="text-slate-500 text-xs text-center py-2">Әзірге пікірлер жоқ. Бірінші болып жазыңыз!</p>
                      ) : (
                        comments.map((c) => {
                          const currentUserName = user?.fullName || user?.username;
                          const canDelete = user && (user.role === 'admin' || c.author === currentUserName);
                          const timeFormatted = c.createdAt 
                            ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : 'Қазір';

                          return (
                            <div key={c.id} className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60 text-xs">
                              <div className="flex justify-between items-center font-bold text-slate-300 mb-1">
                                <span>{c.author}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-slate-500">{timeFormatted}</span>
                                  {canDelete && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const res = await deleteComment(c.id);
                                          if (res.success) {
                                            setComments(comments.filter((item) => item.id !== c.id));
                                          } else {
                                            alert(res.error || 'Ошибка удаления');
                                          }
                                        } catch (err) {
                                          console.error('Ошибка при удалении комментария:', err);
                                        }
                                      }}
                                      className="text-slate-500 hover:text-rose-400 transition-colors"
                                      title="Удалить комментарий"
                                    >
                                      🗑️
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-slate-400 break-words">{c.text}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </article>

              {secondaryArticles.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-base font-bold text-white">Басқа жаңалықтар</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {secondaryArticles.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => router.push(`/article/${item.id}`)}
                        className="bg-[#1C2541] rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between cursor-pointer hover:border-[#00F5D4]/50 transition-all group"
                      >
                        {item.imageUrl && (
                          <div className="h-40 bg-slate-800 relative">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            {item.isImportant && (
                              <span className="absolute top-2 left-2 bg-slate-950/80 text-[#00F5D4] text-[10px] font-bold px-2 py-0.5 rounded">
                                МАҢЫЗДЫ
                              </span>
                            )}
                          </div>
                        )}
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1">
                              <div className="text-[10px] text-[#00F5D4] font-medium flex items-center gap-1">
                                <span>📅</span>
                                <span>
                                  {formatDate(item.createdAt || item.created_at) || 'Қазір'}
                                </span>
                              </div>
                              <h4 className="font-bold text-white line-clamp-2 group-hover:text-[#00F5D4] transition-colors">{item.title}</h4>
                            </div>
                            <button
                              onClick={(e) => handleShare(e, item.id, item.title)}
                              className="text-[10px] bg-slate-900 border border-slate-700 px-2 py-1 rounded shrink-0"
                            >
                              🔗 {copiedId === item.id ? 'Көшірілді!' : 'Бөлісу'}
                            </button>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-3">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              {currentPage > 1 ? (
                <button 
                  onClick={() => router.push(`/?page=${currentPage - 1}`)}
                  className="px-3 py-1.5 bg-[#1C2541] border border-slate-800 hover:border-[#00F5D4] rounded-lg text-xs transition-all"
                >
                  ← Назад
                </button>
              ) : (
                <span className="px-3 py-1.5 bg-[#1C2541]/50 border border-slate-800/50 rounded-lg text-xs text-slate-600 cursor-not-allowed">
                  ← Назад
                </span>
              )}

              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => router.push(`/?page=${p}`)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      p === currentPage
                        ? 'bg-[#00F5D4] text-slate-950'
                        : 'bg-[#1C2541] border border-slate-800 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {currentPage < totalPages ? (
                <button 
                  onClick={() => router.push(`/?page=${currentPage + 1}`)}
                  className="px-3 py-1.5 bg-[#1C2541] border border-slate-800 hover:border-[#00F5D4] rounded-lg text-xs transition-all"
                >
                  Вперед →
                </button>
              ) : (
                <span className="px-3 py-1.5 bg-[#1C2541]/50 border border-slate-800/50 rounded-lg text-xs text-slate-600 cursor-not-allowed">
                  Вперед →
                </span>
              )}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="bg-[#1C2541] rounded-2xl border border-[#00F5D4]/30 p-4 flex flex-col h-80 shadow-lg shadow-[#00F5D4]/5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <h3 className="font-bold text-[#00F5D4] text-xs flex items-center gap-1.5">{t.aiTitle}</h3>
              <div className="flex items-center gap-2">
                <button onClick={clearChat} title={t.aiClear} className="text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-2 py-0.5 rounded text-[10px]">
                  🧹 {t.aiClear}
                </button>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Online</span>
              </div>
            </div>

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-2.5 pr-1 mb-3 text-xs scrollbar-thin">
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

            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendAiMessage()}
                placeholder={t.aiPlaceholder}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F5D4]"
              />
              <button onClick={sendAiMessage} disabled={aiLoading} className="bg-[#00F5D4] hover:bg-[#00f5d4]/80 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs disabled:opacity-50">➔</button>
            </div>
          </div>

          <div className="bg-[#1C2541] rounded-2xl border border-slate-800 p-5">
            <h3 className="font-bold text-white border-b border-slate-800 pb-2 mb-3 text-xs">📊 Күн сұрағы</h3>
            <p className="text-xs text-slate-300 mb-3">Сіз цифрлық теңге қолданысқа енгізілуін қолдайсыз ба?</p>
            {!hasVoted ? (
              <div className="space-y-2 text-xs">
                <button onClick={() => withAuth(() => setHasVoted(true))} className="w-full text-left p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#00F5D4]">Иә, бұл заманауи шешім</button>
                <button onClick={() => withAuth(() => setHasVoted(true))} className="w-full text-left p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#00F5D4]">Жоқ, қолма-қол ақша сенімді</button>
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

      <footer className="bg-slate-950 text-slate-500 text-xs py-6 border-t border-slate-900 text-center space-y-2">
        <a href="https://www.instagram.com/akberdiyev_aktore" target="_blank" rel="noreferrer" className="hover:text-pink-500 transition-colors">
          Instagram
        </a>
        <p>© 2026 Aqparat.com. Все права защищены.<br />Powered and Designed by Torivideft.</p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="bg-slate-950 text-white min-h-screen flex items-center justify-center">Жүктелуде...</div>}>
      <HomeContent />
    </Suspense>
  );
}