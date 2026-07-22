import { FastifyReply, FastifyRequest } from 'fastify';
import { WorkOrdersService, FindWorkOrdersFilter } from './work-orders.service.js';
import {
  createWorkOrderSchema,
  updateWorkOrderSchema,
  workOrderIdParamSchema,
} from './dto/work-order.schema.js';
import { AppError } from '../../errors/app-error.js';

const workOrdersService = new WorkOrdersService();

export class WorkOrdersController {
  
  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createWorkOrderSchema.parse(request.body);
    const workOrder = await workOrdersService.create(data, request.user);
    return reply.status(201).send(workOrder);
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    const filters = request.query as FindWorkOrdersFilter;
    const workOrders = await workOrdersService.findAll(filters, request.user);
    return reply.send(workOrders);
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = workOrderIdParamSchema.parse(request.params);
    const workOrder = await workOrdersService.findById(id, request.user);

    // Agora usamos o AppError para manter a padronização do JSON de erro
    if (!workOrder) {
      throw new AppError('Ordem de Serviço não encontrada.', 404, 'FLX_NOT_FOUND');
    }

    return reply.send(workOrder);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = workOrderIdParamSchema.parse(request.params);
    const data = updateWorkOrderSchema.parse(request.body);

    // O Service já faz o bloqueio e lança erros. Só precisamos chamar e retornar!
    const updatedWorkOrder = await workOrdersService.update(id, data, request.user);
    return reply.send(updatedWorkOrder);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = workOrderIdParamSchema.parse(request.params);

    // O Service já faz o bloqueio de técnico e valida existência.
    await workOrdersService.delete(id, request.user);
    return reply.status(204).send();
  }
}