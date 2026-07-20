import { FastifyRequest, FastifyReply } from 'fastify';

// Atualizamos a tipagem para bater exatamente com o que o seu login está enviando!
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { 
      id: string;
      email: string;
      role: string;
    }; 
    user: { 
      id: string;
      email: string;
      role: string;
    }; 
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({ 
      error: 'Unauthorized', 
      message: 'Acesso negado. Token inválido ou não fornecido.' 
    });
  }
}