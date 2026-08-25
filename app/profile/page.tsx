'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, updateProfile, logoutAdmin } from '@/app/admin/actions';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/admin/login');
          return;
        }
        setUser(currentUser);
        setFullName(currentUser.fullName || '');
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const formData = new FormData();
    formData.append('fullName', fullName);
    if (avatarFile) {
      formData.append('avatarFile', avatarFile);
    }

    const res = await updateProfile(formData);
    if (res.success) {
      setMessage('Профиль успешно обновлен!');
      // Обновляем данные на клиенте
      const updated = await getCurrentUser();
      setUser(updated);
    } else {
      setMessage(res.error || 'Ошибка при сохранении');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Загрузка профиля...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 flex flex-col items-center">
      <div className="max-w-xl w-full bg-[#1C2541] border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6">
        
        {/* Шапка профиля */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            👤 Личный кабинет
          </h1>
          <button
            onClick={() => router.push('/')}
            className="text-xs bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg hover:text-[#00F5D4] transition-colors"
          >
            ← На главную
          </button>
        </div>

        {message && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 text-[#00F5D4] p-3 rounded-xl text-xs text-center">
            {message}
          </div>
        )}

        {/* Информация об аккаунте */}
        <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="w-16 h-16 rounded-full bg-slate-800 overflow-hidden border border-[#00F5D4]/40 shrink-0 flex items-center justify-center text-xl font-bold text-[#00F5D4]">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">{user.fullName || user.username}</h2>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                user.role === 'admin' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-cyan-500/20 text-[#00F5D4] border border-cyan-500/30'
              }`}>
                {user.role}
              </span>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                ● Онлайн
              </span>
            </div>
          </div>
        </div>

        {/* Детальная инфа (таблица характеристик) */}
        <div className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Логин (Username):</span>
            <span className="font-semibold text-white">@{user.username}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400">Роль в системе:</span>
            <span className="font-semibold text-white capitalize">{user.role}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-400">Дата создания аккаунта:</span>
            <span className="font-semibold text-white">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Не указана'}
            </span>
          </div>
        </div>

        {/* Форма редактирования профиля */}
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <h3 className="font-bold text-white text-xs border-b border-slate-800 pb-2">Редактировать профиль</h3>
          
          <div>
            <label className="block text-slate-400 text-xs mb-1">Имя / ФИО</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00F5D4]"
              placeholder="Ваше имя"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">Загрузить аватар</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#00F5D4] file:text-slate-950 hover:file:bg-[#00f5d4]/80"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#00F5D4] hover:bg-[#00f5d4]/80 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>

        {/* Кнопки управления */}
        <div className="flex gap-3 pt-2">
          {user.role === 'admin' && (
            <button
              onClick={() => router.push('/admin')}
              className="flex-1 bg-slate-900 border border-slate-700 hover:border-[#00F5D4] text-white font-semibold py-2 rounded-xl text-xs transition-all"
            >
              🛠 Админ-панель
            </button>
          )}
          <button
            onClick={async () => {
              await logoutAdmin();
              router.push('/admin/login');
            }}
            className="flex-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-semibold py-2 rounded-xl text-xs transition-all"
          >
            🚪 Выйти из аккаунта
          </button>
        </div>

      </div>
    </div>
  );
}