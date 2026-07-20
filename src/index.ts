import fastify from 'fastify';
import jwt from '@fastify/jwt';
import bcrypt from 'bcryptjs';

// Importações do Prisma 7 com o Native Adapter
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Importação do nosso middleware de segurança
import { authenticate } from './plugins/authenticate.js';

// ==========================================
// CONFIGURAÇÕES INICIAIS
// ==========================================
const app = fastify({ logger: true });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui'
});

// ==========================================
// ROTAS DA APLICAÇÃO
// ==========================================
// Rota de Health Check (Verifica se a API está online)
app.get('/', async (request, reply) => {
  return reply.send({
    api: 'FieldOps Backend v2.2',
    status: 'Online',
    environment: 'development'
  });
});
// 1. Rota Pública: Login
app.post('/auth/login', async (request, reply) => {
  const { email, password } = request.body as any;

  if (!email || !password) {
    return reply.status(400).send({ error: 'E-mail e senha são obrigatórios.' });
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return reply.status(401).send({ error: 'Credenciais inválidas.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return reply.status(401).send({ error: 'Credenciais inválidas.' });
  }

  const token = app.jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    {
      expiresIn: '1d'
    }
  );

  return reply.send({
    message: 'Autenticado com sucesso',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
});

// 2. Rota Protegida: Retorna os dados do usuário logado
app.get(
  '/auth/me',
  { onRequest: [authenticate] },
  async (request, reply) => {
    return reply.send({
      message: 'Acesso liberado! Você passou pelo segurança.',
      user: request.user
    });
  }
);

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const start = async () => {
  try {
    await app.listen({ port: 3333, host: '0.0.0.0' });
    console.log('🚀 Servidor FieldOps rodando em http://localhost:3333');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();