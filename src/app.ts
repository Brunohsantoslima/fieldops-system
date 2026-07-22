import fastify from 'fastify';
import { errorHandler } from './error-handler.js';
import { webhooksRoutes } from './modules/webhooks/webhooks.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { workOrdersRoutes } from './modules/work-orders/work-orders.routes.js';

export const app = fastify();

app.setErrorHandler(errorHandler);

// Registros de Rotas
app.register(webhooksRoutes, { prefix: '/webhooks' });
app.register(authRoutes, { prefix: '/auth' });
app.register(workOrdersRoutes, { prefix: '/work-orders' });