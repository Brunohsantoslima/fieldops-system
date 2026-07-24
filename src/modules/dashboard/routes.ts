import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma.js';

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    try {
      // 1. Operações ativas (em aberto ou em andamento)
      const activeOperations = await prisma.workOrder.count({
        where: {
          status: {
            in: ['open', 'in_progress'],
          },
        },
      });

      // 2. Tarefas pendentes (status open)
      const pendingTasks = await prisma.workOrder.count({
        where: {
          status: 'open',
        },
      });

      // 3. Equipes / Usuários cadastrados no sistema
      const teamsInField = await prisma.user.count();

      return {
        activeOperations,
        teamsInField,
        pendingTasks,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar métricas do dashboard' });
    }
  });
}