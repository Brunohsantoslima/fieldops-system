import { prisma } from '../../lib/prisma.js';
import { CreateWorkOrderDTO, UpdateWorkOrderDTO } from './dto/work-order.schema.js';
import { Priority, OrderStatus, Prisma } from '@prisma/client'; 
import { UserPayload } from '../../@types/fastify-jwt.js';
import { AppError } from '../../errors/app-error.js';
import { WebhooksService } from '../webhooks/webhooks.service.js'; // 👈 Importação adicionada

export interface FindWorkOrdersFilter {
  page?: number;
  perPage?: number;
  status?: OrderStatus;
  teamId?: string;
  priority?: Priority;
}

// 🚦 Máquina de Estados oficial da especificação
const VALID_TRANSITIONS: Record<string, string[]> = {
  open: ['in_progress'],
  in_progress: ['done', 'open'],
  done: [],
};

export class WorkOrdersService {
  
  // 👈 Instância do serviço de webhooks
  private webhooksService = new WebhooksService(); 
  
  // ---------------------------------------------------------
  // 1️⃣ CREATE (Garante Checklist Inicial e Version = 1)
  // ---------------------------------------------------------
  async create(data: CreateWorkOrderDTO, currentUser: UserPayload) {
    const targetTeamId = data.teamId || currentUser.teamId;

    if (!targetTeamId) {
      throw new AppError('O campo teamId é obrigatório para criar a Ordem de Serviço.', 400, 'FLX_VALIDATION_ERROR');
    }

    if (data.assigneeId) {
      const technician = await prisma.user.findUnique({ where: { id: data.assigneeId } });
      
      if (!technician || technician.role.toLowerCase() !== 'technician') {
        throw new AppError('O usuário atribuído deve ter o perfil de técnico.', 400, 'FLX_VALIDATION_ERROR');
      }

      if (technician.teamId !== targetTeamId) {
        throw new AppError('O técnico atribuído deve pertencer à mesma equipe da OS.', 400, 'FLX_VALIDATION_ERROR');
      }
    }

    const workOrder = await prisma.workOrder.create({
      data: {
        title: data.title,
        description: data.description,
        priority: (data.priority as Priority) || Priority.low,
        teamId: targetTeamId,
        assigneeId: data.assigneeId,
        status: OrderStatus.open,
        version: 1, // Concorrência otimista inicia em 1
        checklist: {
          create: [
            {
              label: 'Inspeção inicial do local',
              completed: false,
            },
          ],
        },
      },
      include: {
        checklist: true,
      },
    });

    return workOrder;
  }

  // ---------------------------------------------------------
  // 2️⃣ FIND BY ID (Com verificação de null para o TS)
  // ---------------------------------------------------------
  async findById(id: string, currentUser: UserPayload) {
    const where: Prisma.WorkOrderWhereInput = { id };
    const userRole = currentUser.role.toLowerCase();

    if (userRole === 'supervisor') {
      if (currentUser.teamId) where.teamId = currentUser.teamId;
    } else if (userRole === 'technician') {
      if (currentUser.teamId) where.teamId = currentUser.teamId;
      where.assigneeId = currentUser.sub;
    }

    const workOrder = await prisma.workOrder.findFirst({
      where,
      include: {
        checklist: true,
      },
    });

    return workOrder;
  }

  // ---------------------------------------------------------
  // 3️⃣ FIND ALL (Paginação oficial com perPage e meta.limit)
  // ---------------------------------------------------------
  async findAll(filters: FindWorkOrdersFilter = {}, currentUser: UserPayload) {
    const page = Math.max(1, Number(filters.page) || 1);
    const perPage = Math.min(100, Math.max(1, Number(filters.perPage) || 20));
    const skip = (page - 1) * perPage;

    const { status, teamId, priority } = filters;
    
    const where: Prisma.WorkOrderWhereInput = {
      ...(status && { status }),
      ...(priority && { priority }),
    };

    const userRole = currentUser.role.toLowerCase();

    if (userRole === 'admin') {
      if (teamId) where.teamId = teamId;
    } else if (userRole === 'supervisor') {
      if (currentUser.teamId) where.teamId = currentUser.teamId;
    } else if (userRole === 'technician') {
      if (currentUser.teamId) where.teamId = currentUser.teamId;
      where.assigneeId = currentUser.sub; 
    }

    const [total, data] = await Promise.all([
      prisma.workOrder.count({ where }),
      prisma.workOrder.findMany({
        where,
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        include: {
          checklist: true,
          assignee: {
            select: {
              id: true,
              name: true,
            }
          }
        },
      }),
    ]); 

    // A chave extra que estava aqui no meio foi removida!

    const totalPages = Math.ceil(total / perPage);

    return {
      data,
      meta: {
        page,
        limit: perPage,
        total,
        totalPages,
      },
    };
  }

  // ---------------------------------------------------------
  // 4️⃣ UPDATE (Tipagem ajustada para o DTO)
  // ---------------------------------------------------------
  async update(id: string, data: UpdateWorkOrderDTO & { version?: number }, currentUser: UserPayload) {
    const existing = await this.findById(id, currentUser);
    
    if (!existing) {
      throw new AppError('Ordem de serviço não encontrada ou acesso negado.', 404, 'FLX_NOT_FOUND');
    }

    const userRole = currentUser.role.toLowerCase();
    let statusChanged = false;

    if (data.status && data.status !== existing.status) {
      if (data.version !== undefined && data.version !== existing.version) {
        throw new AppError('O registro foi alterado por outro usuário. Recarregue os dados e tente novamente.', 409, 'FLX_CONCURRENT_UPDATE');
      }

      const allowedNextStatuses = VALID_TRANSITIONS[existing.status] || [];
      if (!allowedNextStatuses.includes(data.status)) {
        throw new AppError(`Transição de status inválida: de '${existing.status}' para '${data.status}'.`, 400, 'FLX_INVALID_STATUS_TRANSITION');
      }

      if (data.status === OrderStatus.in_progress) {
        const finalAssigneeId = data.assigneeId || existing.assigneeId;
        if (!finalAssigneeId) {
          throw new AppError('A OS precisa de um técnico atribuído para entrar em andamento.', 400, 'FLX_INVALID_STATUS_TRANSITION');
        }

        const assignee = await prisma.user.findUnique({ where: { id: finalAssigneeId } });
        if (!assignee || assignee.teamId !== existing.teamId) {
          throw new AppError('O técnico atribuído deve pertencer à mesma equipe da OS.', 400, 'FLX_INVALID_STATUS_TRANSITION');
        }
      }

      if (data.status === OrderStatus.done) {
        const resolutionNotes = data.resolutionNotes || existing.resolutionNotes;
        if (!resolutionNotes || resolutionNotes.trim().length < 10) {
          throw new AppError('A conclusão da OS exige notas de resolução com pelo menos 10 caracteres.', 400, 'FLX_INVALID_STATUS_TRANSITION');
        }

        if (existing.priority === Priority.high && userRole === 'technician') {
          throw new AppError('Apenas supervisores ou administradores podem concluir Ordens de Serviço de alta prioridade.', 403, 'FLX_FORBIDDEN');
        }
      }

      if (existing.status === OrderStatus.in_progress && data.status === OrderStatus.open) {
        const hasPendingChecklist = existing.checklist.some((item) => !item.completed);
        if (!hasPendingChecklist) {
          throw new AppError('Para reabrir a OS, pelo menos um item do checklist deve estar incompleto.', 400, 'FLX_INVALID_STATUS_TRANSITION');
        }
      }

      statusChanged = true;
    }

    if (data.assigneeId && data.assigneeId !== existing.assigneeId) {
      const technician = await prisma.user.findUnique({ where: { id: data.assigneeId } });
      if (!technician || technician.role.toLowerCase() !== 'technician') {
        throw new AppError('O novo usuário atribuído deve ser um técnico.', 400, 'FLX_VALIDATION_ERROR');
      }
      if (technician.teamId !== existing.teamId) {
        throw new AppError('O novo técnico deve pertencer à mesma equipe da OS.', 400, 'FLX_VALIDATION_ERROR');
      }
    }

    // 👇 Salvando a transação em uma variável `result`
    const result = await prisma.$transaction(async (tx) => {
      const updatedWorkOrder = await tx.workOrder.update({
        where: { id },
        data: {
          ...(data.status && { status: data.status as OrderStatus }),
          ...(data.resolutionNotes !== undefined && { resolutionNotes: data.resolutionNotes }),
          ...(data.assigneeId && { assigneeId: data.assigneeId }),
          version: { increment: 1 },
        },
        include: {
          checklist: true,
        },
      });

      if (statusChanged) {
        await tx.workOrderEvent.create({
          data: {
            workOrderId: updatedWorkOrder.id,
            actorId: currentUser.sub,
            fromStatus: existing.status,
            toStatus: updatedWorkOrder.status,
          },
        });
      }

      return updatedWorkOrder;
    });

    // 🚀 GATILHO DO WEBHOOK: Dispara apenas se o status tiver mudado
    if (statusChanged) {
      this.webhooksService.dispatchStatusChange(result, existing.status, result.status)
        .catch(error => console.error('Falha ao disparar webhook:', error));
    }

    // Retorna a OS atualizada
    return result; 
  }

  // ---------------------------------------------------------
  // 5️⃣ DELETE
  // ---------------------------------------------------------
  async delete(id: string, currentUser: UserPayload) {
    if (currentUser.role.toLowerCase() === 'technician') {
      throw new AppError('Técnicos não têm permissão para excluir Ordens de Serviço.', 403, 'FLX_FORBIDDEN');
    }

    const existing = await this.findById(id, currentUser);
    
    if (!existing) {
      throw new AppError('Ordem de serviço não encontrada ou acesso negado.', 404, 'FLX_NOT_FOUND');
    }

    await prisma.workOrder.delete({ where: { id } });
    return true;
  }
}
