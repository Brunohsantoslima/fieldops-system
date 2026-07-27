import fastify from 'fastify';
import cors from '@fastify/cors';
import { errorHandler } from './error-handler.js';
import { webhooksRoutes } from './modules/webhooks/webhooks.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { workOrdersRoutes } from './modules/work-orders/work-orders.routes.js';
import { dashboardRoutes } from './modules/dashboard/routes.js';

export const app = fastify();

// 1. Plugins e Configurações
app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
});

app.setErrorHandler(errorHandler);

// 2. Health Check (Corrigido para a especificação da prova!)
app.get('/health', async (request, reply) => {
  return reply.status(200).send({
    status: 'ok',
    apiRevision: '2026.2',
    service: 'fieldops-lite'
  });
});

// 3. Registro dos Módulos de Rotas
app.register(webhooksRoutes, { prefix: '/webhooks' });
app.register(authRoutes, { prefix: '/auth' });
app.register(workOrdersRoutes, { prefix: '/work-orders' });
app.register(dashboardRoutes, { prefix: '/dashboard' });