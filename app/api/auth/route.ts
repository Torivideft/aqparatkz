import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, login, password, fullName } = body;

    if (!login || !password) {
      return NextResponse.json({ success: false, error: 'Заполните все поля!' }, { status: 400 });
    }

    const cookieStore = await cookies();

    if (action === 'register') {
      const existing = await db.select().from(users).where(eq(users.username, login)).limit(1);
      if (existing.length > 0) {
        return NextResponse.json({ success: false, error: 'Такой логин уже занят!' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const [newUser] = await db.insert(users).values({
        username: login,
        passwordHash: hashedPassword,
        fullName: fullName || login,
        role: 'user',
      }).returning();

      cookieStore.set('admin_session', String(newUser.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      return NextResponse.json({ success: true, redirectTo: '/' });
    } 
    
    if (action === 'login') {
      // Ищем пользователя через Drizzle по точному совпадению имени
      const foundUsers = await db.select().from(users);
      const user = foundUsers.find((u) => u.username === login);

      if (!user) {
        return NextResponse.json({ success: false, error: 'Пользователь не найден!' }, { status: 400 });
      }

      // Проверяем пароль (поддерживаем и открытый текст из базы, и хэш)
      const isValid = user.passwordHash === password || await bcrypt.compare(password, user.passwordHash).catch(() => false);

      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Неверный пароль!' }, { status: 400 });
      }

      cookieStore.set('admin_session', String(user.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      const redirectTo = user.role === 'admin' ? '/admin' : '/';
      return NextResponse.json({ success: true, redirectTo });
    }

    return NextResponse.json({ success: false, error: 'Неизвестное действие' }, { status: 400 });
  } catch (error: any) {
    console.error('ОШИБКА АВТОРИЗАЦИИ:', error);
    return NextResponse.json({ success: false, error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}