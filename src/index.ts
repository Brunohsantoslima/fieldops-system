import cors from '@fastify/cors';
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { workOrdersRoutes } from './modules/work-orders/work-orders.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { webhooksRoutes } from './modules/webhooks/webhooks.routes.js';
import { dashboardRoutes } from './modules/dashboard/routes.js';
import { errorHandler } from './error-handler.js';
import { prisma } from './lib/prisma.js'; // 👈 Import que estava faltando

const app = Fastify({ logger: true });

app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

app.setErrorHandler(errorHandler);

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error('❌ ERRO FATAL: A variável de ambiente JWT_SECRET não está definida.');
  process.exit(1);
}

app.register(fastifyJwt, {
  secret: jwtSecret,
});

app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ 
      error: 'FLX_UNAUTHORIZED', 
      message: 'Acesso negado. Token inválido ou não fornecido.' 
    });
  }
});

// 1️⃣ Rota de Usuários
app.get('/users', async (request, reply) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true }
    });
    return users;
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({ error: 'Erro ao buscar usuários' });
  }
});

// 2️⃣ Registro dos módulos do sistema
app.register(authRoutes);
app.register(workOrdersRoutes, { prefix: '/work-orders' });
app.register(webhooksRoutes, { prefix: '/webhooks' });
app.register(dashboardRoutes, { prefix: '/dashboard' });

const start = async () => {
  try {
    await app.listen({ port: 3333, host: '0.0.0.0' });
    console.log('🚀 Servidor executando em http://localhost:3333');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();