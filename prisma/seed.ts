import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';
import bcrypt from 'bcrypt';

// Cria a piscina de conexões com o driver 'pg' e o adaptador do Prisma
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Inicializa o Prisma Client passando o adapter obrigatório do Prisma 7
const prisma = new PrismaClient({ adapter });

async function main() {
  // ... mantenha aqui o seu código de inserção dos usuários
  // ... seu código de criação de usuários continua aqui embaixo
 
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    {
      email: 'tech-a@fieldops.eval',
      name: 'Técnico A',
      password: hashedPassword,
      role: 'technician' as const,
      teamId: 'team-alpha',
    },
    {
      email: 'tech-b@fieldops.eval',
      name: 'Técnico B',
      password: hashedPassword,
      role: 'technician' as const,
      teamId: 'team-beta',
    },
    {
      email: 'supervisor-a@fieldops.eval',
      name: 'Supervisor A',
      password: hashedPassword,
      role: 'supervisor' as const,
      teamId: 'team-alpha',
    },
    {
      email: 'admin@fieldops.eval',
      name: 'Administrador',
      password: hashedPassword,
      role: 'admin' as const,
      teamId: null, // Admin não tem equipe
    },
  ];

  console.log('🌱 Iniciando o seed...');

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log('✅ Seed concluído! Usuários criados com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });