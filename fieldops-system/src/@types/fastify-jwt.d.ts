import '@fastify/jwt';
import { FastifyRequest, FastifyReply } from 'fastify';

export interface UserPayload {
  sub: string;
  role: string;
  teamId: string | null;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: UserPayload;
    user: UserPayload;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}