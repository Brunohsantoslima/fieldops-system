import { prisma } from '../../lib/prisma.js';
import { CreateWorkOrderDTO, UpdateWorkOrderDTO } from './dto/work-order.schema.js';
import { Priority, OrderStatus } from '@prisma/client';
import { UserPayload } from '../../@types/fastify-jwt.js';

export interface FindWorkOrdersFilter {
  status?: OrderStatus;
  teamId?: string;
  priority?: Priority;
}

export class WorkOrdersService {
  async create(data: CreateWorkOrderDTO, currentUser: UserPayload) {
    const workOrder = await prisma.workOrder.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority as Priority,
        teamId: data.teamId,
        assigneeId: data.assigneeId,
        status: 'open',
      },
    });

    return workOrder;
  }

  async findById(id: string, currentUser: UserPayload) {
    return await prisma.workOrder.findUnique({
      where: { id },
    });
  }

  async findAll(filters: FindWorkOrdersFilter = {}, currentUser: UserPayload) {
    const { status, teamId, priority } = filters;

    // 👑 PASSO 1: ADMIN tem acesso total. Apenas aplicamos os filtros que ele enviar na URL.
    if (currentUser.role === 'ADMIN') {
      return await prisma.workOrder.findMany({
        where: {
          ...(status && { status }),
          ...(teamId && { teamId }),
          ...(priority && { priority }),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // 🛡️ PASSO 2 e 3: (Retorno temporário vazio para barrar quem não for ADMIN por enquanto)
    // As regras de SUPERVISOR e TECHNICIAN entrarão aqui.
    return [];
  }

  async update(id: string, data: UpdateWorkOrderDTO, currentUser: UserPayload) {
    const existing = await prisma.workOrder.findUnique({ where: { id } });
    if (!existing) return null;

    return await prisma.workOrder.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.resolutionNotes !== undefined && { resolutionNotes: data.resolutionNotes }),
        ...(data.assigneeId && { assigneeId: data.assigneeId }),
      },
    });
  }

  async delete(id: string, currentUser: UserPayload) {
    const existing = await prisma.workOrder.findUnique({ where: { id } });
    if (!existing) return null;

    await prisma.workOrder.delete({ where: { id } });
    return true;
  }
}