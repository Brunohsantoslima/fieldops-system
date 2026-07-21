import { FastifyInstance } from 'fastify';
import { authenticate } from '../../plugins/authenticate.js';
import { verifyUserRole } from '../../middlewares/verify-user-role.js';
import { WorkOrdersController } from './work-orders.controller.js';

export async function workOrdersRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate);

  const controller = new WorkOrdersController();

  app.get('/work-orders', controller.findAll);
  app.get('/work-orders/:id', controller.findById);

  app.delete(
    '/work-orders/:id',
    { onRequest: [verifyUserRole(['ADMIN'])] },
    controller.delete
  );
}