// app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { loginAdmin } from '../actions';

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const res = await loginAdmin(formData);
    if (res?.error) {
      setError(res.error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#1C2541] border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            AQPARAT<span className="text-[#00F5D4]">.ADMIN</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Панель управления новостным порталом</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl mb-4 text-center font-medium">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Пароль администратора</label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00F5D4]"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Тестовый пароль: <code className="text-cyan-400">admin123</code>
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#00F5D4] text-slate-950 font-bold py-2.5 rounded-xl hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 text-sm mt-2"
          >
            Войти в систему
          </button>
        </form>
      </div>
    </div>
  );
}