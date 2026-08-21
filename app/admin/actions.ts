// app/admin/actions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../db';
import { articles } from '../../db/schema';
import { eq } from 'drizzle-orm';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// 1. Авторизация
export async function loginAdmin(formData: FormData) {
  const password = formData.get('password') as string;

  if (password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('admin_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
      path: '/',
    });
    redirect('/admin');
  } else {
    return { error: 'Неверный пароль администратора!' };
  }
}

// 2. Выход
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/admin/login');
}

// 3. Создание новости (возвращает Promise<void>)
export async function createNewsAction(formData: FormData): Promise<void> {
  const title = formData.get('title') as string;
  const category = formData.get('category') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const content = formData.get('content') as string;
  const isBreaking = formData.get('isBreaking') === 'on';

  if (!title || !content) {
    return;
  }

  await db.insert(articles).values({
    title,
    category,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800',
    content,
    isBreaking,
  });

  redirect('/admin');
}

// 4. Удаление новости (возвращает Promise<void>)
export async function deleteNewsAction(id: string): Promise<void> {
  await db.delete(articles).where(eq(articles.id, id));
  redirect('/admin');
}