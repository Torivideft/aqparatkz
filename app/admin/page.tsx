// app/admin/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../db';
import { articles } from '../../db/schema';
import { desc } from 'drizzle-orm';
import { createNewsAction, deleteNewsAction, logoutAdmin } from './actions';

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (token !== 'authenticated') {
    redirect('/admin/login');
  }

  // Запрос в Vercel Postgres с помощью Drizzle ORM
  const allArticles = await db.select().from(articles).orderBy(desc(articles.createdAt));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Шапка */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider">
              AQPARAT<span className="text-[#00F5D4]">.ADMIN</span>
            </h1>
            <p className="text-xs text-slate-400">Стек: Next.js + Drizzle ORM + Vercel Postgres</p>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="/"
              target="_blank"
              className="text-xs text-slate-400 hover:text-[#00F5D4] transition-colors border border-slate-800 px-3 py-1.5 rounded-lg"
            >
              🌐 Перейти на сайт ↗
            </a>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                Выйти
              </button>
            </form>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Форма создания */}
          <div className="lg:col-span-1 bg-[#1C2541] p-6 rounded-2xl border border-slate-800 h-fit space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center">
              <span className="mr-2">✍️</span> Добавить новость
            </h2>

            <form action={createNewsAction} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Заголовок</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Заголовок новости..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00F5D4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Категория</label>
                  <select
                    name="category"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00F5D4]"
                  >
                    <option value="Қазақстан">Қазақстан</option>
                    <option value="Экономика">Экономика</option>
                    <option value="Спорт">Спорт</option>
                    <option value="Технологиялар">Технологиялар</option>
                    <option value="Оқиғалар">Оқиғалар</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Срочная новость?</label>
                  <label className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 cursor-pointer mt-0.5">
                    <input type="checkbox" name="isBreaking" className="accent-[#00F5D4]" />
                    <span className="text-slate-300">🚨 Бегущая строка</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">URL обложки</label>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00F5D4]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Текст новости</label>
                <textarea
                  name="content"
                  rows={5}
                  required
                  placeholder="Полный текст статьи..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-[#00F5D4] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#00F5D4] text-slate-950 font-bold py-2.5 rounded-xl hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 text-sm"
              >
                Опубликовать
              </button>
            </form>
          </div>

          {/* Список статей */}
          <div className="lg:col-span-2 bg-[#1C2541] p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center">
                <span className="mr-2">⚡</span> Drizzle Postgres ({allArticles.length})
              </h2>
            </div>

            <div className="space-y-3">
              {allArticles.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-[10px]">
                      <span className="bg-cyan-500/10 text-[#00F5D4] border border-cyan-500/20 px-2 py-0.5 rounded font-bold">
                        {item.category}
                      </span>
                      {item.isBreaking && (
                        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-bold">
                          🚨 СРОЧНО
                        </span>
                      )}
                      <span className="text-slate-500">• {new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>

                    <h3 className="font-bold text-slate-200 text-sm">{item.title}</h3>
                    <p className="text-slate-400 text-xs line-clamp-2">{item.content}</p>
                  </div>

                  <form action={deleteNewsAction.bind(null, item.id)}>
                    <button
                      type="submit"
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium flex-shrink-0"
                    >
                      Удалить
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}