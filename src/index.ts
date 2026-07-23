import cors from '@fastify/cors';
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { workOrdersRoutes } from './modules/work-orders/work-orders.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { webhooksRoutes } from './modules/webhooks/webhooks.routes.js'; // 👈 1. Import do Webhook
import { errorHandler } from './error-handler.js';

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

// 2️⃣ Registro dos módulos do sistema
app.register(authRoutes);
app.register(workOrdersRoutes);
app.register(webhooksRoutes, { prefix: '/webhooks' }); // 👈 2. Registro da rota de Webhooks

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