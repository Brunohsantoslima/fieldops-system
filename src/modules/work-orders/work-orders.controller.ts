import { FastifyReply, FastifyRequest } from 'fastify';
import { WorkOrdersService } from './work-orders.service.js';

const workOrdersService = new WorkOrdersService();

export class WorkOrdersController {
  async findAll(request: FastifyRequest, reply: FastifyReply) {
    // ⬇️ CORRIGIDO: Passando a query primeiro, e o user depois!
    const workOrders = await workOrdersService.findAll(request.query as any, request.user);
    return reply.send(workOrders);
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({ id: (request.params as any).id });
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    return reply.status(204).send();
  }
}