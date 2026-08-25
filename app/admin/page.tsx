'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  getArticles, 
  createArticle, 
  updateArticle, 
  deleteArticle, 
  logoutAdmin, 
  NewsArticle 
} from './actions';

export default function AdminPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [breakingNews, setBreakingNews] = useState('');

  // Состояние формы (Добавление / Редактирование)
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isImportant, setIsImportant] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    const data = await getArticles();
    setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadArticles();
    const savedBreaking = localStorage.getItem('aqparat_breaking');
    if (savedBreaking) setBreakingNews(savedBreaking);
  }, []);

  // Очистить форму и сбросить режим редактирования
  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setImageFile(null);
    setIsImportant(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Выбор новости для редактирования
  const handleEditClick = (item: NewsArticle) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setImageUrl(item.imageUrl || '');
    setImageFile(null);
    setIsImportant(!!item.isImportant);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Сохранение (Создание или Обновление)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('imageUrl', imageUrl);
    formData.append('isImportant', isImportant ? 'true' : 'false');

    // Передаем файл для Vercel Blob если он выбран
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    if (editingId) {
      await updateArticle(editingId, formData);
    } else {
      await createArticle(formData);
    }

    resetForm();
    setSubmitting(false);
    await loadArticles();
  };

  const handleDelete = async (id: number) => {
    if (editingId === id) resetForm();
    await deleteArticle(id);
    await loadArticles();
  };

  const handleSaveBreaking = () => {
    localStorage.setItem('aqparat_breaking', breakingNews);
    alert('Оперативная новость обновлена!');
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 p-6 font-sans text-sm">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Шапка */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-white">⚙️ Панель администратора Aqparat</h1>
          <div className="flex items-center space-x-3">
            <a href="/" className="bg-[#00F5D4] text-slate-950 px-3 py-1.5 rounded-xl font-bold text-xs hover:bg-cyan-300 transition-colors">
              ← На сайт
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-xl text-xs hover:bg-rose-500 hover:text-white transition-colors cursor-pointer font-medium"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* Срочная новость */}
        <section className="bg-[#1C2541] border border-slate-800 rounded-2xl p-5 space-y-3">
          <h2 className="text-base font-bold text-white">🚨 Оперативная новость (бегущая строка)</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={breakingNews}
              onChange={(e) => setBreakingNews(e.target.value)}
              placeholder="Текст оперативной новости..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00F5D4]"
            />
            <button
              onClick={handleSaveBreaking}
              className="bg-[#00F5D4] text-slate-950 font-bold px-4 py-2 rounded-xl hover:bg-cyan-300 transition-colors"
            >
              Сохранить
            </button>
          </div>
        </section>

        {/* Динамическая форма: Добавление / Редактирование */}
        <section className="bg-[#1C2541] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-white">
              {editingId ? '✏️ Редактировать новость' : '➕ Добавить новую новость'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-400 hover:text-white transition-colors underline"
              >
                Отменить редактирование
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Заголовок статьи"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00F5D4]"
            />
            <textarea
              required
              rows={3}
              placeholder="Краткое описание / текст"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00F5D4]"
            />

            {/* Выбор файла (Vercel Blob) */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 block font-medium">Загрузить картинку с устройства:</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#00F5D4] file:text-slate-950 hover:file:bg-cyan-300 transition-colors"
              />
            </div>

            {/* ИЛИ Прямая URL ссылка */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 block font-medium">Или укажите ссылку на картинку (URL):</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00F5D4]"
              />
            </div>
            
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isImportant}
                onChange={(e) => setIsImportant(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-[#00F5D4] focus:ring-0"
              />
              <span>Пометить как «МАҢЫЗДЫ»</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#00F5D4] text-slate-950 font-bold py-2.5 rounded-xl hover:bg-cyan-300 transition-colors disabled:opacity-50"
              >
                {submitting
                  ? 'Загрузка...'
                  : editingId
                  ? 'Сохранить изменения'
                  : 'Опубликовать новость'}
              </button>
            </div>
          </form>
        </section>

        {/* Список опубликованных новостей */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-white">📑 Список новостей ({news.length})</h2>
          
          {loading ? (
            <p className="text-slate-400">Загрузка из базы данных...</p>
          ) : (
            <div className="space-y-3">
              {news.map((item) => (
                <div
                  key={item.id}
                  className={`bg-[#1C2541] border p-4 rounded-xl flex items-center justify-between gap-4 transition-colors ${
                    editingId === item.id ? 'border-[#00F5D4]' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 max-w-xl">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                      />
                    )}
                    <div className="space-y-1">
                      {item.isImportant && (
                        <span className="bg-[#00F5D4]/20 text-[#00F5D4] text-[10px] font-bold px-2 py-0.5 rounded">
                          МАҢЫЗДЫ
                        </span>
                      )}
                      <h3 className="font-bold text-white truncate">{item.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs hover:bg-amber-500 hover:text-slate-950 transition-colors"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs hover:bg-rose-500 hover:text-white transition-colors"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}