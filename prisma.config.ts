import { defineConfig } from '@prisma/config'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL, // 👈 Garanta que esta linha existe aqui
  },
  migrations: {
    seed: 'npx.cmd tsx ./prisma/seed.ts',
  },
})