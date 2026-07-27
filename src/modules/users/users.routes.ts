import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { authenticate } from '../../plugins/authenticate.js';
export async function usersRoutes(app: FastifyInstance) {
  // 🔒 Exige token para todas as rotas deste módulo
  app.addHook('onRequest', authenticate);

  app.get('/', async (request, reply) => {
    const currentUser = request.user;
    
    // Regra de negócio: Admin vê todos. Supervisor e Técnico vêem apenas sua equipe.
    let where = {};
    if (currentUser.role.toLowerCase() !== 'admin') {
      where = { teamId: currentUser.teamId };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    return reply.send(users);
  });
}