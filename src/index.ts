import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { workOrdersRoutes } from './modules/work-orders/work-orders.routes.js';

const app = Fastify({ logger: true });

// ⚡ Fail-Fast: Impede a aplicação de subir vulnerável sem JWT_SECRET
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error('❌ ERRO FATAL: A variável de ambiente JWT_SECRET não está definida.');
  process.exit(1);
}

// Registrar Plugin JWT
app.register(fastifyJwt, {
  secret: jwtSecret,
});

// Decorator global para autenticação (parâmetros tipados explicitamente)
app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ error: 'Não autorizado. Token ausente ou inválido.' });
  }
});

// Registrar rotas do módulo
app.register(workOrdersRoutes);

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