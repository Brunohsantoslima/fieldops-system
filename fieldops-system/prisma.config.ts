import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  migrations: {
    seed: 'npx tsx prisma/seed.ts', // 👈 Nova configuração do seed aqui!
  },
  datasource: {
    url: process.env.DATABASE_URL as string,
  }
});