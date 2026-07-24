import { FastifyInstance } from 'fastify';

export async function dashboardRoutes(app: FastifyInstance) {
  console.log('🔥 [DEBUG] O MÓDULO DO DASHBOARD FOI CARREGADO!'); // <-- ADICIONE ESTA LINHA

  app.get('/stats', async (request, reply) => {
    return {
      activeOperations: 12,
      teamsInField: 5,
      pendingTasks: 8,
    };
  });
}