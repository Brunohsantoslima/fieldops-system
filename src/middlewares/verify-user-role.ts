// src/middlewares/verify-user-role.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../errors/app-error.js';

type Role = 'admin' | 'supervisor' | 'technician';

export function verifyUserRole(rolesToAllow: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Pega o papel extraído pelo jwtVerify()
    const { role } = request.user as { role: Role };

    if (!rolesToAllow.includes(role)) {
      throw new AppError(
        'Acesso negado: você não tem permissão para realizar esta ação.', 
        403, 
        'FLX_FORBIDDEN'
      );
    }
  };
}