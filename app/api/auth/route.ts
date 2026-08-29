import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('--- ПОЛУЧЕНЫ ДАННЫЕ ОТ ФОРМЫ ---', body);

    const { action, login, password, fullName } = body;

    if (!login || !password) {
      return NextResponse.json({ success: false, error: 'Заполните все поля!' }, { status: 400 });
    }

    const cookieStore = await cookies();

    if (action === 'register') {
      // 1. Проверяем, есть ли уже такой юзер
      const existing = await db.select().from(users).where(eq(users.username, login)).limit(1);
      
      if (existing.length > 0) {
        return NextResponse.json({ success: false, error: 'Такой логин уже занят!' }, { status: 400 });
      }

      // Хэшируем пароль при регистрации
      const hashedPassword = await bcrypt.hash(password, 10);

      // 2. Создаем нового пользователя
      console.log('Создаем пользователя в Neon DB...');
      const [newUser] = await db.insert(users).values({
        username: login,
        passwordHash: hashedPassword,
        fullName: fullName || login,
        role: 'user', // Обычный пользователь
      }).returning();

      console.log('Пользователь успешно создан:', newUser);

      // 3. Ставим куку с его ID
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
      // Ищем юзера ТОЛЬКО по логину
      const foundUsers = await db
        .select()
        .from(users)
        .where(eq(users.username, login))
        .limit(1);

      const user = foundUsers[0];

      if (!user) {
        return NextResponse.json({ success: false, error: 'Неверный логин или пароль!' }, { status: 400 });
      }

      // Проверяем пароль (поддерживаем как хэш через bcrypt, так и старый plain-текст на всякий случай)
      let isPasswordValid = false;
      if (user.passwordHash.startsWith('$2b$') || user.passwordHash.startsWith('$2a$')) {
        isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      } else {
        isPasswordValid = user.passwordHash === password;
      }

      if (!isPasswordValid) {
        return NextResponse.json({ success: false, error: 'Неверный логин или пароль!' }, { status: 400 });
      }

      cookieStore.set('admin_session', String(user.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      // Если это админ — пускаем в /admin, если обычный юзер — на главную /
      const redirectTo = user.role === 'admin' ? '/admin' : '/';

      return NextResponse.json({ success: true, redirectTo });
    }

    return NextResponse.json({ success: false, error: 'Неизвестное действие' }, { status: 400 });
  } catch (error: any) {
    console.error('ОШИБКА БАЗЫ ДАННЫХ:', error);
    return NextResponse.json({ success: false, error: error.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}