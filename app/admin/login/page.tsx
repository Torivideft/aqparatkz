'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const login = formData.get('login');
    const password = formData.get('password');
    const fullName = formData.get('fullName');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isRegistering ? 'register' : 'login',
          login,
          password,
          fullName,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        window.location.href = data.redirectTo || '/';
      } else {
        setError(data.error || 'Произошла ошибка');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Ошибка соединения с сервером');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white">
      <div className="bg-[#161b22] p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-800">
        <h1 className="text-2xl font-bold text-center mb-2">
          {isRegistering ? 'Регистрация аккаунта' : 'Вход в систему'}
        </h1>
        <p className="text-gray-400 text-center text-sm mb-6">Портал Aqparat Management</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ваше Имя / ФИО</label>
              <input
                name="fullName"
                type="text"
                required={isRegistering}
                disabled={isLoading}
                className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                placeholder="Иван Иванов"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Логин</label>
            <input
              name="login"
              type="text"
              required
              disabled={isLoading}
              className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
              placeholder="Введите логин"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Пароль</label>
            <input
              name="password"
              type="password"
              required
              disabled={isLoading}
              className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? 'Загрузка...' : (isRegistering ? 'Зарегистрироваться' : 'Войти')}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError('');
            }}
            className="text-cyan-400 hover:underline"
          >
            {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
          <Link href="/" className="text-gray-400 hover:text-white">
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}