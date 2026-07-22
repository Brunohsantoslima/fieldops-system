// src/middlewares/verify-user-role.ts
import { FastifyReply, FastifyRequest } from 'fastify';

type Role = 'admin' | 'supervisor' | 'technician';

export function verifyUserRole(rolesToAllow: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Pega o papel extraído pelo jwtVerify()
    const { role } = request.user as { role: Role };

    if (!rolesToAllow.includes(role)) {
      return reply.status(403).send({ 
        message: 'Acesso negado: você não tem permissão para realizar esta ação.' 
      });
    }
  };
}