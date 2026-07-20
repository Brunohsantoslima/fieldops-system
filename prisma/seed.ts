import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Configurando a conexão nativa via Pool para o Seed
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. Instanciando o Prisma com o adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 [FieldOps] Iniciando a semeadura do banco de dados...');

  // Criptografando a senha antes de salvar no banco!
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Usa upsert para criar se não existir, ou atualizar se já existir
  await prisma.user.upsert({
    where: { email: 'admin@fieldops.com' },
    update: {
      password: hashedPassword // Atualiza a senha para a versão criptografada
    },
    create: {
      email: 'admin@fieldops.com',
      name: 'Admin FieldOps',
      password: hashedPassword,
      role: 'admin'
    }
  });

  console.log('✅ [FieldOps] Banco de dados populado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Fechando o pool de conexão para o script não ficar travado
  });