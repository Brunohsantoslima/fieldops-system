import { FastifyInstance } from 'fastify';
import { authenticate } from '../../plugins/authenticate.js';
import { verifyUserRole } from '../../middlewares/verify-user-role.js';
import { WorkOrdersController } from './work-orders.controller.js';

export async function workOrdersRoutes(app: FastifyInstance) {
  // Hook global: todas as rotas deste arquivo exigem token JWT válido
  app.addHook('onRequest', authenticate);

  const controller = new WorkOrdersController();

  // 📝 Rotas de Escrita adicionadas
  app.post('/work-orders', controller.create);
  app.patch('/work-orders/:id', controller.update);

  // 📖 Rotas de Leitura
  app.get('/work-orders', controller.findAll);
  app.get('/work-orders/:id', controller.findById);

  // 🗑️ Rota de Deleção (Barreira 1: Middleware de Role | Barreira 2: Service RBAC)
  app.delete(
    '/work-orders/:id',
    { onRequest: [verifyUserRole(['ADMIN'])] },
    controller.delete
  );
}