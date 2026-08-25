import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL не указана в файле .env');
}

export const sql = neon(process.env.DATABASE_URL);