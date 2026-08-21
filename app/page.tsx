'use client';

import { useState } from 'react';

export default function Home() {
  // Состояния интерактивности
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userNameInput, setUserNameInput] = useState('');
  const [currentLang, setCurrentLang] = useState<'kk' | 'ru' | 'en'>('kk');

  // Комментарии
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Арман Қасымов',
      time: '15:02',
      text: 'Өте дұрыс бастама, қолдаймын! Сандық инфрақұрылымды дамыту өте маңызды.',
    },
    {
      id: 2,
      author: 'Ерлан С.',
      time: '14:40',
      text: 'Нақты мерзімдері қашан жарияланады екен?',
    },
  ]);

  // Опрос
  const [hasVoted, setHasVoted] = useState(false);

  // Реакции (счетчики)
  const [reactions, setReactions] = useState({ fire: 142, like: 89, wow: 12 });

  // Локализация
  const translations = {
    ru: { main: 'Главное', news: 'Новости', life: 'Aqparat Life', sport: 'Спорт', tech: 'Технологии', incidents: 'Происшествия', sectionTitle: 'Главные новости' },
    kk: { main: 'Басты', news: 'Жаңалықтар', life: 'Aqparat Life', sport: 'Спорт', tech: 'Технологиялар', incidents: 'Оқиғалар', sectionTitle: 'Соңғы жаңалықтар' },
    en: { main: 'Home', news: 'News', life: 'Aqparat Life', sport: 'Sports', tech: 'Tech', incidents: 'Incidents', sectionTitle: 'Top Stories' },
  };

  const t = translations[currentLang];

  // Вспомогательная функция для действий, требующих входа
  const checkAuthAndAction = (action: () => void) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
    } else {
      action();
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser(userNameInput.trim() || 'Қолданушы');
    setIsAuthModalOpen(false);
  };

  const addReaction = (type: 'fire' | 'like' | 'wow') => {
    checkAuthAndAction(() => {
      setReactions((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    });
  };

  const postComment = () => {
    checkAuthAndAction(() => {
      if (!commentInput.trim()) return;
      setComments([
        {
          id: Date.now(),
          author: currentUser || 'Қолданушы',
          time: 'Қазір ғана',
          text: commentInput.trim(),
        },
        ...comments,
      ]);
      setCommentInput('');
    });
  };

  return (
    <div className="bg-slate-950 font-sans text-slate-200 min-h-screen flex flex-col">

      {/* ==================== МОДАЛЬНОЕ ОКНО РЕГИСТРАЦИИ И ВХОДА ==================== */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C2541] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsAuthModalOpen(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl"
            >
              ✕
            </button>
            
            <h3 className="text-xl font-bold text-white mb-2">
              {isRegisterMode ? 'Aqparat-қа тіркелу' : 'Aqparat-қа кіру'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Пікір қалдыру және реакция білдіру үшін жүйеге кіріңіз
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              {isRegisterMode && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Аты-жөніңіз (Имя)</label>
                  <input 
                    type="text" 
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                    placeholder="Асан Әлиев" 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00F5D4]"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs text-slate-400 mb-1">E-mail немесе телефон</label>
                <input 
                  type="text" 
                  required 
                  placeholder="user@example.com" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00F5D4]"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Құпия сөз (Пароль)</label>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00F5D4]"
                />
              </div>

              <button type="submit" className="w-full bg-[#00F5D4] text-slate-950 font-bold py-2.5 rounded-xl hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 text-sm mt-2">
                Растау (Подтвердить)
              </button>
            </form>

            <div className="mt-4 text-center">
              <button 
                onClick={() => setIsRegisterMode(!isRegisterMode)} 
                className="text-xs text-[#00F5D4] hover:underline"
              >
                {isRegisterMode ? 'Аккаунтыңыз бар ма? Кіру' : 'Тіркелмегенсіз бе? Тіркелу'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ШАПКА И МЕНЮ ==================== */}
      <header className="bg-[#0B132B] border-b border-slate-800 sticky top-0 z-40 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Логотип */}
          <div className="text-2xl font-black tracking-wider text-white cursor-pointer uppercase flex items-center">
            AQPARAT<span className="text-[#00F5D4] ml-0.5">.COM</span>
          </div>

          {/* Информеры */}
          <div className="hidden lg:flex items-center space-x-6 text-xs font-medium text-slate-400 bg-slate-900/60 px-4 py-2 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 border-r border-slate-700/60 pr-4 cursor-pointer hover:text-white transition-colors">
              <span>🌤 Астана</span>
              <span className="text-[#00F5D4] font-bold">+18°C</span>
            </div>
            <div className="flex items-center space-x-3">
              <span>USD <strong className="text-slate-200">485.5</strong> <span className="text-emerald-400">↑</span></span>
              <span>EUR <strong className="text-slate-200">520.1</strong> <span className="text-rose-400">↓</span></span>
              <span>RUB <strong className="text-slate-200">5.3</strong> <span className="text-emerald-400">↑</span></span>
            </div>
          </div>

          {/* Поиск, Языки, Авторизация */}
          <div className="flex items-center space-x-3">
            <div className="relative hidden sm:block">
              <input 
                type="text" 
                placeholder="Поиск новостей..." 
                className="bg-slate-900/80 text-slate-200 text-sm rounded-full pl-4 pr-9 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-400 w-36 sm:w-48 transition-all border border-slate-700 placeholder-slate-500"
              />
              <button className="absolute right-3 top-2 text-slate-400 hover:text-[#00F5D4] transition-colors">🔍</button>
            </div>

            {/* Языки */}
            <div className="flex items-center space-x-1 text-sm font-medium border rounded-lg p-1 bg-slate-900/60 border-slate-800">
              {(['kk', 'ru', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCurrentLang(lang)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    currentLang === lang
                      ? 'bg-[#00F5D4] text-slate-950 font-bold shadow-sm shadow-cyan-500/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Авторизация */}
            <div>
              {currentUser ? (
                <div className="flex items-center space-x-2 bg-slate-900 border border-cyan-500/30 px-3 py-1 rounded-lg text-xs text-white">
                  <span className="w-5 h-5 rounded-full bg-[#00F5D4] text-slate-950 font-bold flex items-center justify-center text-[10px]">
                    {currentUser.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium">{currentUser}</span>
                  <button onClick={() => setCurrentUser(null)} className="text-slate-500 hover:text-rose-400 ml-1">✕</button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)} 
                  className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700 text-slate-200 hover:text-[#00F5D4] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  <span>👤</span>
                  <span>Кіру</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Навигация */}
        <nav className="bg-slate-900/90 backdrop-blur text-slate-300 text-sm font-medium border-t border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 flex space-x-6 overflow-x-auto py-3 scrollbar-none">
            <a href="#" className="hover:text-[#00F5D4] whitespace-nowrap transition-colors">{t.main}</a>
            <a href="#" className="hover:text-[#00F5D4] whitespace-nowrap transition-colors">{t.news}</a>
            <a href="#" className="hover:text-[#00F5D4] whitespace-nowrap transition-colors">{t.life}</a>
            <a href="#" className="hover:text-[#00F5D4] whitespace-nowrap transition-colors">{t.sport}</a>
            <a href="#" className="hover:text-[#00F5D4] whitespace-nowrap transition-colors">{t.tech}</a>
            <a href="#" className="hover:text-[#00F5D4] whitespace-nowrap transition-colors">{t.incidents}</a>
          </div>
        </nav>
      </header>

      {/* ==================== СРОЧНАЯ НОВОСТЬ (BREAKING NEWS) ==================== */}
      <div className="bg-cyan-950/40 border-b border-cyan-500/20 py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center text-xs sm:text-sm">
          <span className="bg-[#00F5D4] text-slate-950 font-black px-2.5 py-0.5 rounded uppercase tracking-wider text-xs mr-3 flex-shrink-0 animate-pulse">
            🚨 ОПЕРАТИВНО
          </span>
          <div className="overflow-hidden w-full text-slate-300 font-medium cursor-pointer hover:text-[#00F5D4] transition-colors whitespace-nowrap">
            Парламент бекіткен жаңа заң жобасы күшіне енді • Экономикалық реформалар басталды • Ұлттық банк валюта бағамы бойынша мәлімдеме жасады
          </div>
        </div>
      </div>

      {/* ==================== ОСНОВНОЙ КОНТЕНТ ==================== */}
      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* Левый блок */}
        <section className="lg:col-span-2 space-y-8">
          <h2 className="text-xl font-bold border-b-2 border-[#00F5D4] pb-2 text-white flex items-center justify-between">
            {t.sectionTitle}
          </h2>

          {/* Главная новость */}
          <article className="bg-[#1C2541] rounded-2xl shadow-xl border border-slate-800 overflow-hidden group">
            <div className="h-80 bg-slate-800 relative overflow-hidden cursor-pointer">
              <img 
                src="https://via.placeholder.com/800x400" 
                alt="Новость" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" 
              />
              <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur text-[#00F5D4] text-xs font-bold px-3 py-1.5 rounded-lg border border-cyan-500/30">
                МАҢЫЗДЫ
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-4 text-xs text-slate-400 font-medium mb-2">
                <span>14:30, 19 Тамыз 2026</span>
                <span>•</span>
                <span>⏱ 3 мин оқу</span>
                <span>•</span>
                <span>👀 3.8k</span>
              </div>

              <h3 className="text-2xl font-bold text-white group-hover:text-[#00F5D4] transition-colors leading-tight cursor-pointer">
                Заголовок самой главной новости дня на первой полосе Aqparat
              </h3>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                Краткое описание сути произошедшего события. Вводный текст статьи для привлечения внимания читателя...
              </p>

              {/* Реакции */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400 mr-2">Реакциялар:</span>
                  <button onClick={() => addReaction('fire')} className="bg-slate-900/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/80 transition-colors">🔥 {reactions.fire}</button>
                  <button onClick={() => addReaction('like')} className="bg-slate-900/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/80 transition-colors">👍 {reactions.like}</button>
                  <button onClick={() => addReaction('wow')} className="bg-slate-900/80 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/80 transition-colors">😮 {reactions.wow}</button>
                </div>
                <button 
                  onClick={() => checkAuthAndAction(() => alert('Сохранено в закладки!'))} 
                  className="text-slate-400 hover:text-[#00F5D4] text-xs flex items-center space-x-1 transition-colors"
                >
                  <span>🔖 Сақтау</span>
                </button>
              </div>

              {/* Комментарии */}
              <div className="mt-8 pt-6 border-t border-slate-800 space-y-6">
                <h4 className="text-base font-bold text-white flex items-center justify-between">
                  <span>💬 Пікірлер (Комментарии)</span>
                  <span className="text-xs font-normal text-slate-400">{comments.length} пікір</span>
                </h4>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                  <textarea 
                    rows={2} 
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Ойыңызды бөлісіңіз (Напишите комментарий)..." 
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-[#00F5D4] resize-none placeholder-slate-500"
                  />
                  <div className="flex justify-end mt-2">
                    <button 
                      onClick={postComment} 
                      className="bg-[#00F5D4] text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-cyan-300 transition-colors"
                    >
                      Жіберу (Отправить)
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {comments.map((c) => (
                    <div key={c.id} className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/60 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-200">{c.author}</span>
                        <span className="text-slate-500 text-[10px]">{c.time}</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          {/* Лента новостей списком */}
          <div className="bg-[#1C2541] rounded-2xl shadow-xl border border-slate-800 p-6 space-y-5">
            {[
              { time: '15:12', title: 'Президент қол қойған жаңа жарлық цифрлық инфрақұрылымды дамытуға бағытталған', cat: 'Қазақстан', views: '1.2k' },
              { time: '14:45', title: 'Валюта бағамы: Ұлттық банктің соңғы мәліметтері', cat: 'Экономика', views: '940' },
              { time: '13:20', title: 'Апталық ауа райы: елордада күн жылынады деп күтілуде', cat: 'Қоғам', views: '2.1k' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start justify-between pb-4 border-b border-slate-800/80 last:border-none last:pb-0 cursor-pointer group">
                <div className="flex items-start space-x-4">
                  <span className="text-[#00F5D4] font-bold text-sm mt-0.5">{item.time}</span>
                  <div>
                    <h4 className="font-medium text-slate-200 group-hover:text-[#00F5D4] transition-colors">
                      {item.title}
                    </h4>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1.5">
                      <span>{item.cat}</span>
                      <span>•</span>
                      <span>👀 {item.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Правая колонка */}
        <aside className="space-y-6">
          <div className="bg-gradient-to-br from-cyan-950/60 to-[#1C2541] rounded-2xl p-6 border border-cyan-500/30 relative overflow-hidden">
            <span className="text-2xl">✈️</span>
            <h3 className="font-bold text-white text-lg mt-2">Жедел жаңалықтар Telegram-да</h3>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">Маңызды оқиғаларды өткізіп алмау үшін ресми арнамызға жазылыңыз.</p>
            <a href="#" className="mt-4 inline-block w-full text-center bg-[#00F5D4] text-slate-950 font-bold py-2.5 rounded-xl hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 text-sm">
              Жазылу ➔
            </a>
          </div>

          {/* Популярное */}
          <div className="bg-[#1C2541] rounded-2xl shadow-xl border border-slate-800 p-6">
            <h3 className="font-bold text-white border-b border-slate-800 pb-3 mb-4 flex items-center">
              <span className="mr-2 text-xl">🔥</span> Aqparat-та танымал
            </h3>
            <ol className="space-y-4 list-decimal list-inside text-sm font-medium text-slate-300">
              <li className="cursor-pointer hover:text-[#00F5D4] transition-colors leading-snug">Жаңа заң жобасы қызу талқыға түсті</li>
              <li className="cursor-pointer hover:text-[#00F5D4] transition-colors leading-snug">Қазақстан құрамасының матч нәтижелері</li>
              <li className="cursor-pointer hover:text-[#00F5D4] transition-colors leading-snug">Белгілі режиссермен сұхбат</li>
            </ol>
          </div>

          {/* Опрос */}
          <div className="bg-[#1C2541] rounded-2xl shadow-xl border border-slate-800 p-6">
            <h3 className="font-bold text-white border-b border-slate-800 pb-3 mb-4 flex items-center text-sm">
              <span className="mr-2 text-lg">📊</span> Күн сурағы
            </h3>
            {!hasVoted ? (
              <>
                <p className="text-slate-300 text-sm mb-4 font-medium">Сіз цифрлық теңге қолданысқа енгізілуін қолдайсыз ба?</p>
                <div className="space-y-2.5 text-xs">
                  <button onClick={() => checkAuthAndAction(() => setHasVoted(true))} className="w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#00F5D4] transition-colors text-slate-300">
                    Иә, бұл заманауи шешім
                  </button>
                  <button onClick={() => checkAuthAndAction(() => setHasVoted(true))} className="w-full text-left p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#00F5D4] transition-colors text-slate-300">
                    Жоқ, қолма-қол ақша сенімді
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Иә, бұл заманауи шешім</span>
                    <span className="text-[#00F5D4] font-bold">68%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#00F5D4] h-2 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Жоқ, қолма-қол ақша сенімді</span>
                    <span className="text-slate-400 font-bold">32%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div className="bg-slate-700 h-2 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center">Дауыс бергеніңізге рақмет!</p>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Подвал */}
      <footer className="bg-slate-950 text-slate-500 text-xs py-8 border-t border-slate-900">
  <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
    <div className="flex justify-center items-center">
      <a
        href="https://instagram.com/ваш_логин"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-slate-400 hover:text-pink-500 transition-colors"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
        <span>Instagram</span>
      </a>
    </div>

    <p>© 2026 сетевое издание <strong className="text-slate-300">Aqparat.com</strong>. Все права защищены.</p>
  </div>
</footer>
    </div>
  );
}