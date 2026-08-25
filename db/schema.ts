import { pgTable, serial, text, boolean, integer, varchar, timestamp } from 'drizzle-orm/pg-core';

export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url'),
  isImportant: boolean('is_important').default(false),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  author: text('author').notNull(),
  text: text('text').notNull(),
  articleId: integer('article_id').references(() => articles.id, { onDelete: 'cascade' }),
});

// Добавляем таблицу users в соответствие с базой Neon
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type User = typeof users.$inferSelect;