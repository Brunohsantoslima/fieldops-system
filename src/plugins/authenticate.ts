import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({
      error: 'FLX_UNAUTHORIZED',
      message: 'Acesso negado. Token inválido ou não fornecido.'
    });
  }
}