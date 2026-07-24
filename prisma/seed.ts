import * as bcrypt from 'bcrypt';

// ⚠️ AJUSTE ESTE CAMINHO: Aponte para o arquivo onde você exportou o prisma no seu backend
import { prisma } from '../src/lib/prisma.js';

async function main() {
  console.log('Iniciando seed seguro...');

  // A prova exige que a senha seja "password123"
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Admin
  await prisma.user.upsert({
    where: { email: 'admin@fieldops.eval' },
    update: {}, // Se já existir, não altera nada
    create: {
      name: 'Administrador',
      email: 'admin@fieldops.eval',
      password: passwordHash,
      role: 'admin',
    },
  });

  // 2. Supervisor (team-alpha)
  await prisma.user.upsert({
    where: { email: 'supervisor-a@fieldops.eval' },
    update: {},
    create: {
      name: 'Supervisor A',
      email: 'supervisor-a@fieldops.eval',
      password: passwordHash,
      role: 'supervisor',
      teamId: 'team-alpha',
    },
  });

  // 3. Técnico A (team-alpha)
  await prisma.user.upsert({
    where: { email: 'tech-a@fieldops.eval' },
    update: {},
    create: {
      name: 'Técnico A',
      email: 'tech-a@fieldops.eval',
      password: passwordHash,
      role: 'technician',
      teamId: 'team-alpha',
    },
  });

  // 4. Técnico B (team-beta)
  await prisma.user.upsert({
    where: { email: 'tech-b@fieldops.eval' },
    update: {},
    create: {
      name: 'Técnico B',
      email: 'tech-b@fieldops.eval',
      password: passwordHash,
      role: 'technician',
      teamId: 'team-beta',
    },
  });

  console.log('✅ Usuários oficiais da prova gerados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  // Exemplo de OS inicial com checklist
const workOrder = await prisma.workOrder.create({
  data: {
    title: 'Troca de compressor de refrigeração',
    description: 'Equipamento apresentando ruído excessivo e falha no resfriamento.',
    status: 'open',
    priority: 'high',
    teamId: 'team-alpha',
    version: 1,
    checklist: {
      create: [
        { label: 'Isolar a área de trabalho', completed: false },
        { label: 'Verificar pressão do gás', completed: false },
      ],
    },
  },
});