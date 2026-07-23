import fastify from 'fastify';
import cors from '@fastify/cors'; // <-- Nova importação do CORS
import { errorHandler } from './error-handler.js';
import { webhooksRoutes } from './modules/webhooks/webhooks.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { workOrdersRoutes } from './modules/work-orders/work-orders.routes.js';

export const app = fastify();

// 1. Configuração do CORS (deve vir antes das rotas)
app.register(cors, {
  origin: true, 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
});

app.setErrorHandler(errorHandler);

// 2. Rota de Health Check (Prioridade 6)
app.get('/health', async (request, reply) => {
  return reply.status(200).send({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Registros de Rotas
app.register(webhooksRoutes, { prefix: '/webhooks' });
app.register(authRoutes, { prefix: '/auth' });
app.register(workOrdersRoutes, { prefix: '/work-orders' });