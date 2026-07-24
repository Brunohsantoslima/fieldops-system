import fastify from 'fastify';
import cors from '@fastify/cors';
import { errorHandler } from './error-handler.js';
import { webhooksRoutes } from './modules/webhooks/webhooks.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { workOrdersRoutes } from './modules/work-orders/work-orders.routes.js';
import { dashboardRoutes } from './modules/dashboard/routes.js';

// Importando o prisma direto aqui para a nossa rota rápida
import { prisma } from './lib/prisma.js'; 

export const app = fastify();

// 1. Plugins e Configurações
app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
});

app.setErrorHandler(errorHandler);

// 2. Health Check
app.get('/health', async (request, reply) => {
  return reply.status(200).send({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// =======================================================
// ROTA INJETADA DIRETAMENTE (Garante que não vai dar 404)
// =======================================================
app.get('/users', async (request, reply) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true }
  });
  return users;
});

// 3. Registro dos Módulos de Rotas
app.register(webhooksRoutes, { prefix: '/webhooks' });
app.register(authRoutes, { prefix: '/auth' });
app.register(workOrdersRoutes, { prefix: '/work-orders' });
app.register(dashboardRoutes, { prefix: '/dashboard' });