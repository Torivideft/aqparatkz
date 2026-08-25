'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { put } from '@vercel/blob';
import { db } from '@/db';
import { articles, users, commentsTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export interface NewsArticle {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  isImportant?: boolean | null;
  createdAt?: Date | string | null;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/admin/login');
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('admin_session')?.value;
  if (!userId) return null;

  try {
    const [user] = await db.select().from(users).where(eq(users.id, Number(userId))).limit(1);
    return user || null;
  } catch {
    return null;
  }
}

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('admin_session')?.value;
  if (!userId) return { success: false, error: 'Не авторизован' };

  const fullName = formData.get('fullName') as string;
  const avatarFile = formData.get('avatarFile') as File | null;
  let avatarUrl: string | undefined;

  if (avatarFile && avatarFile.size > 0) {
    try {
      const blob = await put(avatarFile.name, avatarFile, {
        access: 'public',
        addRandomSuffix: true,
      });
      avatarUrl = blob.url;
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
    }
  }

  try {
    const updateData: Record<string, any> = { fullName };
    if (avatarUrl) {
      updateData.avatarUrl = avatarUrl;
    }

    await db.update(users).set(updateData).where(eq(users.id, Number(userId)));
    return { success: true };
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    return { success: false, error: 'Не удалось обновить профиль' };
  }
}

export async function getArticlesPaginated(page: number = 1, pageSize: number = 6) {
  try {
    const offset = (page - 1) * pageSize;
    
    const articlesList = await db
      .select()
      .from(articles)
      .orderBy(desc(articles.createdAt))
      .limit(pageSize)
      .offset(offset);

    const allArticles = await db.select().from(articles);
    const totalCount = allArticles.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return {
      articles: articlesList,
      currentPage: page,
      totalPages,
    };
  } catch (error) {
    console.error('Ошибка пагинации новостей:', error);
    return {
      articles: [],
      currentPage: 1,
      totalPages: 1,
    };
  }
}

export async function getArticles() {
  try {
    return await db.select().from(articles).orderBy(desc(articles.createdAt));
  } catch (error) {
    console.error('Ошибка получения новостей из БД:', error);
    return [];
  }
}

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
        addRandomSuffix: true,
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
    createdAt: new Date(),
  });
}

export async function deleteArticle(id: number): Promise<void> {
  await db.delete(articles).where(eq(articles.id, id));
}

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

// Получить комментарии для конкретной статьи
export async function getCommentsByArticle(articleId: number) {
  try {
    const comments = await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.articleId, articleId))
      .orderBy(desc(commentsTable.createdAt));
    return comments;
  } catch (error) {
    console.error('Ошибка загрузки комментариев:', error);
    return [];
  }
}

// Добавить новый комментарий в БД
export async function addCommentAction(articleId: number, textContent: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'Необходимо авторизоваться' };
  }

  if (!textContent.trim()) {
    return { success: false, error: 'Комментарий не может быть пустым' };
  }

  try {
    const authorName = currentUser.fullName || currentUser.username;
    
    const [newComment] = await db
      .insert(commentsTable)
      .values({
        articleId,
        author: authorName,
        text: textContent.trim(),
      })
      .returning();

    return { success: true, comment: newComment };
  } catch (error) {
    console.error('Ошибка добавления комментария:', error);
    return { success: false, error: 'Ошибка сервера' };
  }
}

// Удалить комментарий (админ — любой, юзер — только свой)
export async function deleteComment(commentId: number) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'Не авторизован' };
  }

  const [comment] = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.id, commentId))
    .limit(1);

  if (!comment) {
    return { success: false, error: 'Комментарий не найден' };
  }

  const currentUserName = currentUser.fullName || currentUser.username;

  if (currentUser.role !== 'admin' && comment.author !== currentUserName) {
    return { success: false, error: 'Нет прав на удаление этого комментария' };
  }

  await db.delete(commentsTable).where(eq(commentsTable.id, commentId));

  return { success: true };
}