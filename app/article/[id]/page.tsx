'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getArticles } from '../../admin/actions';

interface Article {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  isImportant?: boolean | null;
  category?: string | null;
  createdAt?: string | Date | null;
  created_at?: string | Date | null;
}

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [rawArticle, setRawArticle] = useState<Article | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<'kk' | 'ru' | 'en'>('kk');

  useEffect(() => {
    async function fetchArticle() {
      try {
        const articles = await getArticles();
        const found = articles.find((a: any) => String(a.id) === String(resolvedParams.id));
        if (found) {
          setRawArticle(found as Article);
          setArticle(found as Article);
        }
      } catch (err) {
        console.error('Ошибка загрузки новости:', err);
      } finally {
        setLoading(false);
      }
    }
    
    if (resolvedParams.id) {
      fetchArticle();
    }
  }, [resolvedParams.id]);

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
    if (!rawArticle) return;

    setTranslating(true);
    try {
      const [translatedTitle, translatedDesc, translatedCategory] = await Promise.all([
        translateText(rawArticle.title, targetLang),
        translateText(rawArticle.description, targetLang),
        rawArticle.category ? translateText(rawArticle.category, targetLang) : Promise.resolve(rawArticle.category),
      ]);

      setArticle({
        ...rawArticle,
        title: translatedTitle,
        description: translatedDesc,
        category: translatedCategory,
      });
    } catch (e) {
      console.error('Ошибка перевода статьи:', e);
    } finally {
      setTranslating(false);
    }
  };

  const handleShare = async () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title || 'AQPARAT.COM',
          url: currentUrl,
        });
      } catch {
        // Cancel
      }
    } else {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center text-slate-400 text-xs">
        Жүктелуде...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="bg-slate-950 min-h-screen flex flex-col items-center justify-center text-slate-400 gap-4 text-xs">
        <span>Жаңалық табылмады</span>
        <button onClick={() => router.push('/')} className="bg-[#00F5D4] text-slate-950 font-bold px-4 py-2 rounded-xl">
          Басты бетке оралу
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 font-sans text-slate-200 min-h-screen flex flex-col text-sm">
      <header className="bg-[#0B132B] border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-xs text-slate-400 hover:text-[#00F5D4] flex items-center gap-1">
            ← Басты бетке
          </button>
          <div className="flex items-center gap-2 text-lg font-black text-white uppercase cursor-pointer" onClick={() => router.push('/')}>
            <img src="/logo.svg" alt="Logo" className="w-6 h-6 object-contain" />
            <span>AQPARAT<span className="text-[#00F5D4]">.COM</span></span>
          </div>

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
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">
              {article.category || 'Жаңалықтар'}
            </span>
            <span className="text-[#00F5D4] font-medium flex items-center gap-1">
              • 📅 {formatDate(article.createdAt || article.created_at) || 'Қазір'}
            </span>
            {translating && <span className="text-slate-500">• (Аударылуда...)</span>}
          </div>
          <button
            onClick={handleShare}
            className="bg-[#00F5D4] hover:bg-[#00f5d4]/80 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-colors"
          >
            🔗 {copied ? 'Сілтеме көшірілді!' : 'Бөлісу'}
          </button>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
          {article.title}
        </h1>

        {article.imageUrl && (
          <div className="h-72 md:h-96 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="bg-[#1C2541] rounded-2xl border border-slate-800 p-6">
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {article.description}
          </p>
        </div>
      </main>

      <footer className="bg-slate-950 text-slate-500 text-xs py-6 border-t border-slate-900 text-center">
        © 2026 Aqparat.com. Powered by Torivideft.
      </footer>
    </div>
  );
}