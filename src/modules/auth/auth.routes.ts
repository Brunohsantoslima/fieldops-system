import { FastifyInstance } from 'fastify';
import { authenticateService, registerService } from './auth.service.js';
import { loginSchema, LoginInput, registerSchema, RegisterInput } from './auth.schema.js';
export async function authRoutes(app: FastifyInstance) {
  // 1.5️⃣ Rota de Registro (Nova)
  app.post('/register', { schema: registerSchema }, async (request, reply) => {
    const body = request.body as RegisterInput;

    const user = await registerService(body);

    return reply.status(201).send({ user });
  });
  // 1️⃣ Rota de Login (Pública)
  app.post('/login', { schema: loginSchema }, async (request, reply) => {
    const body = request.body as LoginInput;

    const user = await authenticateService(body);

    const token = await reply.jwtSign(
      {
        sub: user.id,
        role: user.role,
        teamId: user.teamId,
      },
      {
        sign: {
          expiresIn: '7d',
        },
      }
    );

    return reply.status(200).send({
      token,
      user,
    });
  });

  // 2️⃣ Rota do Perfil (Protegida)
  app.get('/me', {
    onRequest: [async (request) => await request.jwtVerify()]
  }, async (request, reply) => {
    return reply.status(200).send({
      user: request.user,
    });
  });
}