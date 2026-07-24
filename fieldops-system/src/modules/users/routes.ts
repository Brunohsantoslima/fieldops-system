import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma.js';

export async function usersRoutes(fastify: FastifyInstance) {
  // Rastreador 1: Avisa no terminal que o arquivo foi lido pelo servidor
  console.log('🔥 [DEBUG] Módulo de usuários carregado com sucesso!');

  // Vamos definir a rota explicitamente como '/users' em vez de '/'
  fastify.get('/users', async (request, reply) => {
    // Rastreador 2: Avisa no terminal que o frontend conseguiu chamar a rota
    console.log('✅ [DEBUG] O frontend acessou a rota de usuários!');
    
    try {
      const users = await prisma.user.findMany({
        select: { 
          id: true, 
          name: true 
        }
      });
      return users;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar usuários' });
    }
  });
}