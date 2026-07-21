import { FastifyReply, FastifyRequest } from 'fastify';

export function verifyUserRole(allowedRoles: Array<'ADMIN' | 'SUPERVISOR' | 'TECHNICIAN'>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { role } = request.user;

    if (!allowedRoles.includes(role as any)) {
      return reply.status(403).send({
        error: 'FLX_FORBIDDEN',
        message: 'Acesso negado. Você não possui permissão para executar esta ação.',
      });
    }
  };
}