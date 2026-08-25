'use client';

import { useState } from 'react';
import { loginAdmin } from '@/app/admin/actions';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('login', login);
    formData.append('password', password);

    try {
      const res = await loginAdmin(formData);

      if (res.success) {
        window.location.href = '/admin';
      } else {
        setError(res.error || 'Неверный логин или пароль');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Ошибка при входе');
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 flex items-center justify-center p-4 font-sans text-sm">
      <div className="bg-[#1C2541] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl">
        
        <div className="text-center space-y-1">
          <div className="inline-block bg-[#00F5D4]/10 text-[#00F5D4] p-3 rounded-2xl mb-2">
            ⚙️
          </div>
          <h1 className="text-xl font-black text-white">Вход в админ-панель</h1>
          <p className="text-xs text-slate-400">Портал Aqparat Management</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">
              Логин
            </label>
            <input
              type="text"
              required
              placeholder="admin"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00F5D4] transition-colors text-xs"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">
              Пароль
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#00F5D4] transition-colors text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00F5D4] text-slate-950 font-bold py-2.5 rounded-xl text-xs hover:bg-[#00F5D4]/90 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Проверка...' : 'Войти в панель'}
          </button>
        </form>

        <div className="text-center pt-2">
          <a href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Вернуться на главную
          </a>
        </div>

      </div>
    </div>
  );
}