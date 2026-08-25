'use server';

import { cookies } from 'next/headers';
import { put } from '@vercel/blob';
import { db } from '@/db';
import { articles, users } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface NewsArticle {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  isImportant?: boolean | null;
}

// 1. Авторизация через базу данных Neon
export async function loginAdmin(formData: FormData) {
  const login = formData.get('login') as string;
  const password = formData.get('password') as string;

  if (!login || !password) {
    return { success: false, error: 'Заполните все поля!' };
  }

  try {
    const foundUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.username, login),
          eq(users.passwordHash, password)
        )
      )
      .limit(1);

    const user = foundUsers[0];

    if (user && user.role === 'admin') {
      const cookieStore = await cookies();
      cookieStore.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });
      return { success: true };
    }

    return { success: false, error: 'Неверный логин или пароль!' };
  } catch (error) {
    console.error('Ошибка при обращении к БД Neon:', error);
    return { success: false, error: 'Ошибка подключения к базе данных' };
  }
}

// 2. Выход из аккаунта
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

// 3. Получение списка статей
export async function getArticles() {
  try {
    return await db.select().from(articles).orderBy(desc(articles.id));
  } catch (error) {
    console.error('Ошибка получения новостей из БД:', error);
    return [];
  }
}

// 4. Создание новости с защитой от дублирования имен в Vercel Blob
export async function createArticle(formData: FormData): Promise<void> {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const isImportant = formData.get('isImportant') === 'true';
  const imageFile = formData.get('imageFile') as File | null;
  let imageUrl = formData.get('imageUrl') as string;

  if (!title || !description) return;

  if (imageFile && imageFile.size > 0) {
    try {
      const blob = await put(imageFile.name, imageFile, { 
        access: 'public',
        addRandomSuffix: true, // Устраняет ошибку дублирования файлов
      });
      imageUrl = blob.url;
    } catch (error) {
      console.error('Ошибка загрузки файла в Vercel Blob:', error);
    }
  }

  if (!imageUrl) {
    imageUrl = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800';
  }

  await db.insert(articles).values({
    title,
    description,
    imageUrl,
    isImportant,
  });
}

// 5. Удаление новости
export async function deleteArticle(id: number): Promise<void> {
  await db.delete(articles).where(eq(articles.id, id));
}

// 6. Обновление новости
export async function updateArticle(id: number, formData: FormData): Promise<void> {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const isImportant = formData.get('isImportant') === 'true';
  const imageFile = formData.get('imageFile') as File | null;
  let imageUrl = formData.get('imageUrl') as string;

  if (!title || !description) return;

  if (imageFile && imageFile.size > 0) {
    try {
      const blob = await put(imageFile.name, imageFile, {
        access: 'public',
        addRandomSuffix: true,
      });
      imageUrl = blob.url;
    } catch (error) {
      console.error('Ошибка загрузки файла в Vercel Blob:', error);
    }
  }

  const updateData: Record<string, any> = {
    title,
    description,
    isImportant,
  };

  if (imageUrl) {
    updateData.imageUrl = imageUrl;
  }

  await db
    .update(articles)
    .set(updateData)
    .where(eq(articles.id, id));
}