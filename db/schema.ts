// db/schema.ts
import { pgTable, text, boolean, integer, timestamp, uuid } from 'drizzle-orm/pg-core';

// Таблица статей
export const articles = pgTable('articles', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  isBreaking: boolean('is_breaking').default(false).notNull(),
  views: integer('views').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Таблица комментариев
export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  author: text('author').notNull(),
  text: text('text').notNull(),
  articleId: uuid('article_id').references(() => articles.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Типы для TypeScript
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;